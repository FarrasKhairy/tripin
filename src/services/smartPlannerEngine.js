import {
  calculateDistanceKm,
  calculateTotalRouteDistance,
  clusterDestinations as clusterByProximity,
  isValidCoordinate,
  optimizeRoute,
  RouteProvider,
  GeographicRouteProvider,
  defaultRouteProvider,
} from './geoService.js'
import { PREFERENCE_MAPPINGS, TRAVEL_STYLES } from './travelRecommendationConfig.js'

const CLUSTER_RADIUS_KM = 25
const CATEGORY_ALIASES = new Map([
  ['nature', 'nature'], ['alam', 'nature'],
  ['beach', 'beach'], ['pantai', 'beach'],
  ['mountain', 'mountain'], ['gunung', 'mountain'],
  ['waterfall', 'waterfall'], ['air terjun', 'waterfall'],
  ['culture', 'culture'], ['budaya', 'culture'],
  ['history', 'history'], ['sejarah', 'history'],
  ['heritage', 'heritage'], ['warisan', 'heritage'], ['cagar budaya', 'heritage'],
  ['religious', 'religious'], ['religi', 'religious'], ['keagamaan', 'religious'],
  ['family', 'family'], ['keluarga', 'family'],
  ['adventure', 'adventure'], ['petualangan', 'adventure'],
  ['food', 'food'], ['kuliner', 'food'], ['makanan', 'food'],
  ['shopping', 'shopping'], ['belanja', 'shopping'],
  ['urban', 'urban'], ['kota', 'urban'],
  ['wildlife', 'wildlife'], ['satwa', 'wildlife'],
  ['marine', 'marine'], ['bahari', 'marine'], ['laut', 'marine'],
  ['photography', 'photography'], ['fotografi', 'photography'],
  ['relaxation', 'relaxation'], ['relaksasi', 'relaxation'], ['santai', 'relaxation'],
])

const COST_BENCHMARKS = {
  [TRAVEL_STYLES.HEMAT]: { mainTransportPerTraveler: 250000, roomNight: 180000, foodPerTravelerDay: 75000, localVehicleDay: 80000, otherPerTravelerDay: 25000 },
  [TRAVEL_STYLES.BALANCED]: { mainTransportPerTraveler: 550000, roomNight: 400000, foodPerTravelerDay: 140000, localVehicleDay: 180000, otherPerTravelerDay: 50000 },
  [TRAVEL_STYLES.COMFORT]: { mainTransportPerTraveler: 1100000, roomNight: 950000, foodPerTravelerDay: 280000, localVehicleDay: 450000, otherPerTravelerDay: 100000 },
}

const roundKm = (value) => Math.round(value * 10) / 10
const roundRupiah = (value) => Math.max(0, Math.round(Number(value) || 0))

export function normalizeLocationName(value = '') {
  let normalized = String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('id-ID')
    .replace(/\b(kabupaten|kab\.?|kota administrasi|kota)\b/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')

  if (normalized === 'jogja' || normalized === 'di yogyakarta' || normalized === 'daerah istimewa yogyakarta') {
    normalized = 'yogyakarta'
  }
  return normalized
}

export function buildDestinationContext(destinationInput) {
  const input = typeof destinationInput === 'string'
    ? { name: destinationInput, city: destinationInput }
    : (destinationInput || {})
  const latitude = isValidCoordinate(input.latitude, input.longitude) ? Number(input.latitude) : null
  const longitude = isValidCoordinate(input.latitude, input.longitude) ? Number(input.longitude) : null
  const city = String(input.city || '').trim()
  const province = String(input.province || '').trim()
  return {
    id: input.id || null,
    name: String(input.name || city || province || '').trim(),
    city,
    province,
    latitude,
    longitude,
    normalizedCity: normalizeLocationName(city),
    normalizedProvince: normalizeLocationName(province),
  }
}

function destinationCategories(destination) {
  const values = [
    ...(Array.isArray(destination?._ui?.category_names) ? destination._ui.category_names : []),
    ...(Array.isArray(destination?.categories) ? destination.categories : []),
    destination?.category,
    destination?.destination_type,
  ]
  return [...new Set(values.filter(Boolean).map((value) => {
    const name = typeof value === 'object' ? (value.name || value.slug || '') : value
    const normalized = normalizeLocationName(name)
    return CATEGORY_ALIASES.get(normalized) || normalized
  }))]
}

function textMatchesPreference(destination, mapping) {
  const content = [destination.name, destination.description, destination.address]
    .filter(Boolean).join(' ').toLocaleLowerCase('id-ID')
  return mapping.keywords.some((keyword) => content.includes(String(keyword).toLocaleLowerCase('id-ID')))
}

export function scoreGeographicRelevance(destination, context, radiusKm = 90) {
  const destinationCity = normalizeLocationName(destination?.city)
  const targetCity = context?.normalizedCity || normalizeLocationName(context?.city)
  const hasDestinationCoords = isValidCoordinate(destination?.latitude, destination?.longitude)
  const hasContextCoords = isValidCoordinate(context?.latitude, context?.longitude)

  if (hasDestinationCoords && hasContextCoords) {
    const distanceKm = calculateDistanceKm(
      context.latitude,
      context.longitude,
      destination.latitude,
      destination.longitude,
    )
    if (distanceKm == null || distanceKm > radiusKm) {
      return { eligible: false, score: 0, distanceKm, reason: null }
    }
    const score = Math.max(0, 40 * (1 - distanceKm / radiusKm))
    return {
      eligible: true,
      score,
      distanceKm: roundKm(distanceKm),
      reason: `berjarak sekitar ${roundKm(distanceKm)} km secara geografis dari area pilihan`,
    }
  }

  if (targetCity && destinationCity === targetCity) {
    return { eligible: true, score: 28, distanceKm: null, reason: 'berada di kota/kabupaten pilihan; koordinat destinasi belum tersedia' }
  }
  return { eligible: false, score: 0, distanceKm: null, reason: null }
}

export function findNearbyDestinations(destinations = [], context, radiusKm = 90) {
  return (destinations || []).map((destination) => {
    const location = scoreGeographicRelevance(destination, context, radiusKm)
    return { ...destination, distanceKm: location.distanceKm, geographicRelevance: location }
  }).filter((destination) => destination.geographicRelevance.eligible)
}

export function scoreDestination(destination, context, {
  preferences = [],
  travelers = 1,
  budget = 0,
  durationDays = 1,
  radiusKm = 90,
} = {}) {
  const location = scoreGeographicRelevance(destination, context, radiusKm)
  const categories = destinationCategories(destination)
  const matchedPreferences = preferences.filter((preference) => {
    const mapping = PREFERENCE_MAPPINGS[preference]
    if (!mapping) return false
    const mappedCategories = mapping.categories.map((category) => {
      const normalized = normalizeLocationName(category)
      return CATEGORY_ALIASES.get(normalized) || normalized
    })
    return categories.some((category) => mappedCategories.includes(category)) || textMatchesPreference(destination, mapping)
  })

  const preferenceScore = preferences.length
    ? Math.min(30, matchedPreferences.length * 15)
    : 15
  const ticketPrice = destination.ticket_price == null || destination.ticket_price === ''
    ? null
    : Number(destination.ticket_price)
  const ticketTotal = ticketPrice == null || !Number.isFinite(ticketPrice)
    ? null
    : ticketPrice * Math.max(1, Number(travelers) || 1)
  const attractionBudget = Math.max(1, Number(budget) || 0) * 0.25
  const budgetScore = ticketTotal == null
    ? 0
    : ticketTotal <= attractionBudget
      ? 20
      : ticketTotal <= attractionBudget * 1.5
        ? 10
        : 0
  const itineraryFitScore = durationDays > 0 ? 10 : 0

  const reasons = []
  if (location.reason) reasons.push(location.reason)
  if (matchedPreferences.length) {
    reasons.push(`sesuai preferensi ${matchedPreferences.map((preference) => PREFERENCE_MAPPINGS[preference].label).join(', ')}`)
  }
  if (ticketPrice == null) reasons.push('harga tiket belum tersedia')
  else if (budgetScore > 0) reasons.push('harga tiket sesuai estimasi anggaran atraksi')
  else reasons.push('harga tiket mengambil porsi besar dari estimasi anggaran atraksi')
  reasons.push('sesuai dengan durasi perjalanan')

  return {
    eligible: location.eligible,
    totalScore: Math.round(location.score + preferenceScore + budgetScore + itineraryFitScore),
    locationScore: Math.round(location.score),
    preferenceScore,
    budgetScore,
    itineraryFitScore,
    distanceKm: location.distanceKm,
    ticketPrice,
    matchedPreferences,
    reasons,
    reason: `Dipilih karena ${reasons.slice(0, 3).join('; ')}.`,
  }
}

export function clusterDestinations(destinations = [], maxDistanceKm = CLUSTER_RADIUS_KM) {
  return clusterByProximity(destinations, maxDistanceKm).map((cluster) => {
    const route = optimizeRoute(cluster.destinations)
    return {
      ...cluster,
      center: cluster.center,
      destinations: cluster.destinations,
      estimatedInternalDistanceKm: roundKm(route.totalDistanceKm || 0),
      distanceType: 'geographic straight-line estimate',
    }
  })
}

function estimateVisitMinutes(destination) {
  const metadata = Number(destination.estimated_visit_duration_minutes)
  if (Number.isFinite(metadata) && metadata > 0) return { minutes: metadata, isEstimate: false }
  const categories = destinationCategories(destination)
  if (categories.some((category) => ['nature', 'mountain', 'waterfall', 'adventure', 'marine'].includes(category))) {
    return { minutes: 150, isEstimate: true }
  }
  if (categories.includes('food')) return { minutes: 75, isEstimate: true }
  return { minutes: 105, isEstimate: true }
}

function parseTime(value) {
  const match = String(value || '').match(/(\d{1,2})[:.](\d{2})/)
  if (!match) return null
  const hour = Number(match[1])
  const minute = Number(match[2])
  if (hour > 23 || minute > 59) return null
  return hour * 60 + minute
}

function openingWindow(destination) {
  const raw = String(destination.opening_hours || '')
  const match = raw.match(/(\d{1,2}[:.][0-5]\d)\s*(?:-|–|sampai|to)\s*(\d{1,2}[:.][0-5]\d)/i)
  if (!match) return null
  const start = parseTime(match[1])
  const end = parseTime(match[2])
  return start != null && end != null ? { start, end } : null
}

function timeLabel(minutes) {
  const clamped = Math.max(0, Math.min(23 * 60 + 59, Math.round(minutes)))
  return `${String(Math.floor(clamped / 60)).padStart(2, '0')}:${String(clamped % 60).padStart(2, '0')}`
}

function dateLabel(startDate, dayOffset) {
  const date = startDate ? new Date(`${startDate}T12:00:00`) : new Date()
  date.setDate(date.getDate() + dayOffset)
  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function createDestinationItem(destination, time, nextDistanceKm) {
  const duration = estimateVisitMinutes(destination)
  const durationText = duration.isEstimate
    ? `Estimasi waktu kunjungan sekitar ${Math.round(duration.minutes / 30) * 30} menit.`
    : `Data destinasi memperkirakan waktu kunjungan sekitar ${duration.minutes} menit.`
  return {
    time: timeLabel(time),
    title: destination.name,
    category: destinationCategories(destination)[0] || 'Destinasi',
    destinationId: destination.id,
    image: destination.image_url || null,
    ticketPrice: destination.ticket_price == null ? null : Number(destination.ticket_price),
    openingHours: destination.opening_hours || null,
    estimatedDurationMinutes: duration.minutes,
    durationIsEstimate: duration.isEstimate,
    areaName: destination.area?.areaName || destination.city || destination.province || 'Area sekitar',
    latitude: destination.latitude,
    longitude: destination.longitude,
    distanceKm: destination.distanceKm,
    distanceToNextKm: nextDistanceKm,
    notes: [destination.recommendationReason, durationText].filter(Boolean).join(' '),
    isDestination: true,
  }
}

function makeDaySchedule(destinations) {
  if (!destinations.length) return []
  const route = optimizeRoute(destinations)
  const ordered = route.orderedDestinations
  const segmentDistances = route.segments.map((segment) => segment.distanceKm)
  const items = []
  let cursor = 9 * 60
  let lunchAdded = false

  ordered.forEach((destination, index) => {
    const duration = estimateVisitMinutes(destination)
    const window = openingWindow(destination)
    if (window) cursor = Math.max(cursor, window.start)

    if (index > 0 && !lunchAdded) {
      const lunchTime = Math.max(12 * 60 + 15, cursor)
      items.push({
        time: timeLabel(lunchTime),
        title: `Istirahat makan siang dekat ${destination.city || 'rute perjalanan'}`,
        category: 'Istirahat makan',
        notes: 'Waktu makan fleksibel; biaya restoran tidak termasuk data harga tiket destinasi.',
        isDestination: false,
      })
      cursor = lunchTime + 60
      lunchAdded = true
      if (window) cursor = Math.max(cursor, window.start)
    }

    if (window && cursor + duration.minutes > window.end) {
      cursor = Math.max(window.start, Math.min(window.end - duration.minutes, 9 * 60))
    }

    const distance = segmentDistances[index] == null ? null : roundKm(segmentDistances[index])
    items.push(createDestinationItem(destination, cursor, index < ordered.length - 1 ? distance : null))
    cursor += duration.minutes + (index < ordered.length - 1 ? 45 : 0)
  })

  const latestDestinationEnd = cursor
  if (!lunchAdded && latestDestinationEnd < 13 * 60) {
    items.push({
      time: '12:30',
      title: 'Istirahat makan siang',
      category: 'Istirahat makan',
      notes: 'Waktu makan fleksibel.',
      isDestination: false,
    })
  }
  if (latestDestinationEnd < 17 * 60) {
    items.push({
      time: timeLabel(Math.max(15 * 60, latestDestinationEnd + 30)),
      title: 'Waktu fleksibel / istirahat',
      category: 'Waktu fleksibel',
      notes: 'Waktu luang untuk beristirahat, perubahan cuaca, atau rencana pribadi.',
      isDestination: false,
    })
  }
  return items.sort((a, b) => a.time.localeCompare(b.time))
}

export function generateItinerary({
  durationDays = 1,
  startDate,
  recommendedDestinations = [],
  destinationContext,
  startingPoint = null,
  dayAssignments = {},
}) {
  const days = Math.max(1, Math.floor(Number(durationDays) || 1))
  const clusters = clusterDestinations(recommendedDestinations)
  const used = new Set()
  const assignedByDay = Array.from({ length: days }, () => [])
  const destinationById = new Map(recommendedDestinations.map((destination) => [String(destination.id), destination]))

  for (const [destinationId, assignedDay] of Object.entries(dayAssignments || {})) {
    const dayIndex = Number(assignedDay) - 1
    const destination = destinationById.get(String(destinationId))
    if (!destination || !Number.isInteger(dayIndex) || dayIndex < 0 || dayIndex >= days) continue
    if (assignedByDay[dayIndex].length < 2) {
      assignedByDay[dayIndex].push(destination)
      used.add(destination.id)
    }
  }

  const itinerary = []
  for (let dayNumber = 1; dayNumber <= days; dayNumber += 1) {
    const remaining = recommendedDestinations.filter((destination) => !used.has(destination.id))
    const active = clusters
      .filter((cluster) => cluster.destinations.some((destination) => !used.has(destination.id)))
      .sort((a, b) => {
        const aCount = a.destinations.filter((destination) => !used.has(destination.id)).length
        const bCount = b.destinations.filter((destination) => !used.has(destination.id)).length
        return bCount - aCount
      })[0]
    const batch = [...assignedByDay[dayNumber - 1]]
    if (batch.length < 2) {
      const defaults = active
        ? active.destinations.filter((destination) => !used.has(destination.id))
        : remaining
      const additions = defaults.slice(0, 2 - batch.length)
      additions.forEach((destination) => used.add(destination.id))
      batch.push(...additions)
    }
    const activeCluster = clusters.find((cluster) => batch.some((destination) => cluster.destinations.some((item) => item.id === destination.id)))
    const route = optimizeRoute(batch, startingPoint)
    const ordered = route.orderedDestinations
    const areaName = activeCluster?.areaName || ordered[0]?.city || destinationContext?.city || 'Area pilihan'
    itinerary.push({
      dayNumber,
      dateFormatted: dateLabel(startDate, dayNumber - 1),
      theme: ordered.length ? `Jelajahi ${areaName}` : 'Flexible day',
      areaCluster: areaName,
      totalDistanceKm: roundKm(route.totalDistanceKm || 0),
      segments: route.segments || [],
      destinations: ordered,
      items: makeDaySchedule(ordered),
      distanceType: 'geographic straight-line estimate, not road distance',
      hasUnmappedDestinations: route.hasUnmappedDestinations || false,
    })
  }
  return itinerary
}

export function calculateTripBudget({
  budget = 0,
  travelStyle = TRAVEL_STYLES.BALANCED,
  durationDays = 1,
  durationNights = 0,
  travelers = 1,
  selectedDestinations = [],
  candidateDestinations = [],
}) {
  const style = COST_BENCHMARKS[travelStyle] ? travelStyle : TRAVEL_STYLES.BALANCED
  const rates = COST_BENCHMARKS[style]
  const dayCount = Math.max(1, Number(durationDays) || 1)
  const nightCount = Math.max(0, Number(durationNights) || 0)
  const travelerCount = Math.max(1, Number(travelers) || 1)
  const roomCount = Math.ceil(travelerCount / 2)
  const vehicleCount = Math.ceil(travelerCount / 4)
  const prices = selectedDestinations.map((destination) => destination.ticket_price)
  const unknownTicketCount = prices.filter((price) => price == null || price === '' || !Number.isFinite(Number(price))).length
  const attractionTickets = roundRupiah(selectedDestinations.reduce((total, destination) => {
    const price = Number(destination.ticket_price)
    return total + (destination.ticket_price == null || !Number.isFinite(price) ? 0 : price * travelerCount)
  }, 0))

  const costs = {
    transport: roundRupiah(rates.mainTransportPerTraveler * travelerCount),
    accommodation: roundRupiah(rates.roomNight * roomCount * nightCount),
    food: roundRupiah(rates.foodPerTravelerDay * travelerCount * dayCount),
    attractions: attractionTickets,
    localTransport: roundRupiah(rates.localVehicleDay * vehicleCount * dayCount),
    other: roundRupiah(rates.otherPerTravelerDay * travelerCount * dayCount),
  }
  const totalEstimatedCost = Object.values(costs).reduce((sum, amount) => sum + amount, 0)
  const remainingBudget = Number(budget || 0) - totalEstimatedCost
  const categories = [
    { id: 'transport', category: 'Transportasi', name: 'Transportasi utama (estimasi umum)', amount: costs.transport, notes: 'Patokan estimasi domestik umum per orang; titik asal dan tarif langsung belum dimasukkan.' },
    { id: 'accommodation', category: 'Penginapan', name: 'Estimasi penginapan', amount: costs.accommodation, notes: `${nightCount} malam × ${roomCount} kamar; tarif kamar mengikuti gaya perjalanan.` },
    { id: 'food', category: 'Makan', name: 'Estimasi makan dan minum', amount: costs.food, notes: `${travelerCount} orang × ${dayCount} hari; estimasi per orang per hari.` },
    { id: 'attractions', category: 'Tiket Wisata', name: 'Tiket destinasi dengan harga tersedia', amount: costs.attractions, notes: unknownTicketCount ? `${unknownTicketCount} destinasi belum memiliki harga tiket; biayanya tidak dihitung dan tidak dianggap gratis.` : 'Jumlah harga tiket yang tersedia × jumlah orang.' },
    { id: 'local_transport', category: 'Transport Lokal', name: 'Estimasi transportasi lokal', amount: costs.localTransport, notes: `${dayCount} hari × ${vehicleCount} kendaraan; estimasi mengikuti gaya perjalanan, bukan perutean jalan.` },
    { id: 'other', category: 'Lain-lain', name: 'Estimasi biaya lain dan cadangan', amount: costs.other, notes: 'Alokasi harian per orang untuk kebutuhan tak terduga.' },
  ].map((item) => ({
    ...item,
    percentage: totalEstimatedCost ? Math.round((item.amount / totalEstimatedCost) * 100) : 0,
    icon: item.id === 'transport' ? 'Plane' : item.id === 'accommodation' ? 'Hotel' : item.id === 'food' ? 'Utensils' : item.id === 'attractions' ? 'Ticket' : item.id === 'local_transport' ? 'Car' : 'ShieldCheck',
  }))

  const selectedIds = new Set(selectedDestinations.map((destination) => destination.id))
  const removeOptions = selectedDestinations
    .filter((destination) => Number(destination.ticket_price) > 0)
    .map((destination) => ({
      destinationId: destination.id,
      name: destination.name,
      savings: roundRupiah(Number(destination.ticket_price) * travelerCount),
    }))
    .sort((a, b) => b.savings - a.savings)
    .slice(0, 3)
  const freeOptions = selectedDestinations.length < dayCount * 2 ? candidateDestinations
    .filter((destination) => !selectedIds.has(destination.id) && destination.ticket_price != null && destination.ticket_price !== '' && Number(destination.ticket_price) === 0)
    .slice(0, 3)
    .map((destination) => ({ destinationId: destination.id, name: destination.name })) : []

  const overBudget = remainingBudget < 0
  const deficit = Math.abs(remainingBudget)
  const insight = overBudget
    ? {
        type: 'tight',
        title: 'Estimasi biaya melebihi anggaran',
        message: `Estimasi saat ini melebihi anggaran sebesar Rp ${deficit.toLocaleString('id-ID')}. Harga tiket yang belum tersedia tidak dihitung.`,
        adjustmentTip: 'Hapus atraksi berbayar, pilih destinasi gratis, atau turunkan gaya estimasi penginapan/transportasi.',
        alternatives: { removeOptions, freeOptions },
      }
    : {
        type: remainingBudget >= Number(budget || 0) * 0.2 ? 'surplus' : 'optimal',
        title: remainingBudget >= Number(budget || 0) * 0.2 ? 'Anggaran masih memiliki cadangan' : 'Estimasi rencana sesuai anggaran',
        message: `Sisa sekitar Rp ${remainingBudget.toLocaleString('id-ID')} berdasarkan estimasi yang ditampilkan.`,
        adjustmentTip: 'Biaya adalah estimasi; periksa tarif penyedia sebelum memesan.',
        alternatives: { removeOptions, freeOptions },
      }

  return {
    breakdownItems: categories,
    totalEstimatedCost,
    remainingBudget,
    overBudget,
    unknownTicketCount,
    insight,
    budgetAssumptions: {
      travelStyle: style,
      travelers: travelerCount,
      durationDays: dayCount,
      durationNights: nightCount,
      transportOriginProvided: false,
      costRates: rates,
    },
  }
}

export function calculateTotalDistance(destinations = []) {
  return calculateTotalRouteDistance(destinations)
}

export function distanceBetween(latitude1, longitude1, latitude2, longitude2) {
  const distance = calculateDistanceKm(latitude1, longitude1, latitude2, longitude2)
  return distance == null ? null : roundKm(distance)
}

export function maximumRadiusForDuration(durationDays = 1) {
  return Math.min(150, 30 + Math.max(1, Number(durationDays) || 1) * 15)
}

export { RouteProvider, GeographicRouteProvider, defaultRouteProvider }

export const calculateEarthSurfaceDistance = (lat1, lon1, lat2, lon2) => calculateDistanceKm(lat1, lon1, lat2, lon2)
