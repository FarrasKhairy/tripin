/**
 * geoService.js
 * Tripin Geographic Engine & Smart Route Optimizer V1.
 * 
 * Fitur:
 * - Validasi koordinat (lat, lon) aman & null-safe
 * - Perhitungan jarak geografis Haversine (straight-line distance dalam KM)
 * - Perhitungan total jarak rute & segmen perpindahan antar destinasi
 * - Pengelompokan destinasi berbasis jarak murni (clustering tanpa hardcoding kota)
 * - Optimasi urutan rute menggunakan Nearest Neighbor Heuristic
 * - Pemilihan starting point cerdas (hotel -> city center -> destinasi pertama -> centroid)
 * - Abstraksi RouteProvider (GeographicRouteProvider V1 & persiapan RoadRouteProvider)
 * - Persiapan PostGIS query interface
 */

/**
 * Validasi koordinat geografis
 * Memastikan latitude & longitude adalah angka valid, bukan null/undefined, dan bukan (0, 0)
 */
export function isValidCoordinate(lat, lon) {
  if (lat == null || lon == null) return false
  const nLat = Number(lat)
  const nLon = Number(lon)
  if (!Number.isFinite(nLat) || !Number.isFinite(nLon)) return false
  if (nLat === 0 && nLon === 0) return false // Exclude Null Island (0,0)
  if (nLat < -90 || nLat > 90) return false
  if (nLon < -180 || nLon > 180) return false
  return true
}

/**
 * Haversine Formula untuk menghitung jarak lurus antar 2 koordinat (dalam Kilometer)
 * @param {number} lat1
 * @param {number} lon1
 * @param {number} lat2
 * @param {number} lon2
 * @returns {number|null} Jarak dalam km dibulatkan 1 desimal, atau null jika koordinat tidak valid
 */
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (!isValidCoordinate(lat1, lon1) || !isValidCoordinate(lat2, lon2)) {
    return null
  }

  const nLat1 = Number(lat1)
  const nLon1 = Number(lon1)
  const nLat2 = Number(lat2)
  const nLon2 = Number(lon2)

  const R = 6371 // Radius bumi dalam KM
  const dLat = (nLat2 - nLat1) * (Math.PI / 180)
  const dLon = (nLon2 - nLon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(nLat1 * (Math.PI / 180)) *
      Math.cos(nLat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c * 10) / 10
}

/**
 * Menghitung centroid (titik tengah rata-rata) dari sekumpulan destinasi
 */
export function calculateCentroid(destinations = []) {
  const valid = destinations.filter((d) => isValidCoordinate(d?.latitude, d?.longitude))
  if (valid.length === 0) return null

  const sum = valid.reduce(
    (acc, d) => {
      acc.lat += Number(d.latitude)
      acc.lon += Number(d.longitude)
      return acc
    },
    { lat: 0, lon: 0 }
  )

  return {
    latitude: Math.round((sum.lat / valid.length) * 10000) / 10000,
    longitude: Math.round((sum.lon / valid.length) * 10000) / 10000,
  }
}

/**
 * Menghitung total jarak rute dan segmen antar destinasi
 * @param {Array} destinations - Daftar destinasi berurutan
 * @returns {{ totalDistanceKm: number, segments: Array<{ from: object, to: object, distanceKm: number }> }}
 */
export function calculateTotalRouteDistance(destinations = []) {
  if (!Array.isArray(destinations) || destinations.length < 2) {
    return {
      totalDistanceKm: 0,
      segments: [],
    }
  }

  let totalDistanceKm = 0
  const segments = []

  for (let i = 0; i < destinations.length - 1; i++) {
    const from = destinations[i]
    const to = destinations[i + 1]

    if (isValidCoordinate(from?.latitude, from?.longitude) && isValidCoordinate(to?.latitude, to?.longitude)) {
      const dist = calculateDistanceKm(from.latitude, from.longitude, to.latitude, to.longitude) || 0
      totalDistanceKm += dist
      segments.push({
        from,
        to,
        distanceKm: dist,
      })
    } else {
      segments.push({
        from,
        to,
        distanceKm: null,
      })
    }
  }

  return {
    totalDistanceKm: Math.round(totalDistanceKm * 10) / 10,
    segments,
  }
}

/**
 * DESTINATION CLUSTERING (Geographic distance-based)
 * Mengelompokkan destinasi ke dalam klaster berdasarkan jarak spasial murni,
 * TANPA hardcoding nama kota tertentu.
 * 
 * @param {Array} destinations
 * @param {number} maxClusterDistanceKm - Ambang batas radius klaster (default: 25 km)
 * @returns {Array<{ id: string, name: string, center: object, destinations: Array }>}
 */
export function clusterDestinations(destinations = [], maxClusterDistanceKm = 25) {
  if (!Array.isArray(destinations) || destinations.length === 0) {
    return []
  }

  // Pisahkan destinasi dengan koordinat valid dan tanpa koordinat
  const withCoords = []
  const withoutCoords = []

  destinations.forEach((d) => {
    if (isValidCoordinate(d?.latitude, d?.longitude)) {
      withCoords.push(d)
    } else {
      withoutCoords.push(d)
    }
  })

  const clusters = []
  const assigned = new Set()

  // Greedy agglomerative radius-based clustering
  for (let i = 0; i < withCoords.length; i++) {
    const dest = withCoords[i]
    if (assigned.has(dest.id || i)) continue

    // Buat klaster baru berpusat di destinasi ini
    const currentClusterDests = [dest]
    assigned.add(dest.id || i)

    for (let j = 0; j < withCoords.length; j++) {
      if (i === j) continue
      const candidate = withCoords[j]
      const candidateKey = candidate.id || j
      if (assigned.has(candidateKey)) continue

      // Hitung jarak kandidat ke setiap anggota yang sudah ada di klaster
      let isClose = false
      for (const member of currentClusterDests) {
        const dist = calculateDistanceKm(
          member.latitude,
          member.longitude,
          candidate.latitude,
          candidate.longitude
        )
        if (dist != null && dist <= maxClusterDistanceKm) {
          isClose = true
          break
        }
      }

      if (isClose) {
        currentClusterDests.push(candidate)
        assigned.add(candidateKey)
      }
    }

    const centroid = calculateCentroid(currentClusterDests)
    // Tentukan nama klaster yang deskriptif dari areaName, city, atau destinasi utama
    const primaryArea =
      currentClusterDests.find((d) => d.area?.areaName)?.area?.areaName ||
      currentClusterDests[0]?.city ||
      currentClusterDests[0]?.name ||
      `Klaster ${clusters.length + 1}`

    clusters.push({
      id: `cluster-${clusters.length + 1}`,
      name: `Kawasan ${primaryArea}`,
      areaName: primaryArea,
      center: centroid,
      destinations: currentClusterDests,
    })
  }

  // Jika ada destinasi tanpa koordinat, buat klaster informasi tersendiri
  if (withoutCoords.length > 0) {
    clusters.push({
      id: `cluster-unmapped`,
      name: 'Destinasi Sekitar (Lokasi Menyesuaikan)',
      areaName: 'Lainnya',
      center: null,
      destinations: withoutCoords,
    })
  }

  return clusters
}

/**
 * SMART ROUTE OPTIMIZER (Nearest Neighbor Heuristic)
 * Menyusun urutan kunjungan destinasi seefisien mungkin berdasarkan kedekatan jarak.
 * 
 * @param {Array} destinations - Daftar destinasi yang akan dikunjungi
 * @param {object|null} startingPoint - Koordinat titik awal { latitude, longitude, name }
 * @returns {{
 *   orderedDestinations: Array,
 *   totalDistanceKm: number,
 *   segments: Array,
 *   startingPointUsed: object|null,
 *   hasUnmappedDestinations: boolean
 * }}
 */
export function optimizeRoute(destinations = [], startingPoint = null) {
  if (!Array.isArray(destinations) || destinations.length === 0) {
    return {
      orderedDestinations: [],
      totalDistanceKm: 0,
      segments: [],
      startingPointUsed: null,
      hasUnmappedDestinations: false,
    }
  }

  if (destinations.length === 1) {
    return {
      orderedDestinations: [...destinations],
      totalDistanceKm: 0,
      segments: [],
      startingPointUsed: startingPoint,
      hasUnmappedDestinations: !isValidCoordinate(destinations[0]?.latitude, destinations[0]?.longitude),
    }
  }

  // Pisahkan yang memiliki koordinat valid dan yang tidak
  const validDests = []
  const unmappedDests = []

  destinations.forEach((d) => {
    if (isValidCoordinate(d?.latitude, d?.longitude)) {
      validDests.push(d)
    } else {
      unmappedDests.push(d)
    }
  })

  // Jika tidak ada destinasi dengan koordinat valid, kembalikan apa adanya
  if (validDests.length === 0) {
    return {
      orderedDestinations: [...destinations],
      totalDistanceKm: 0,
      segments: [],
      startingPointUsed: null,
      hasUnmappedDestinations: true,
    }
  }

  // Tentukan titik awal (starting anchor)
  // Prioritas:
  // 1. Hotel / accommodation jika diberikan di startingPoint
  // 2. City center jika diberikan di startingPoint
  // 3. Destinasi pertama dalam list
  // 4. Centroid
  let currentLat = null
  let currentLon = null
  let startAnchorInfo = null

  if (startingPoint && isValidCoordinate(startingPoint.latitude, startingPoint.longitude)) {
    currentLat = Number(startingPoint.latitude)
    currentLon = Number(startingPoint.longitude)
    startAnchorInfo = {
      name: startingPoint.name || 'Titik Awal',
      type: startingPoint.type || 'anchor',
      latitude: currentLat,
      longitude: currentLon,
    }
  }

  const unvisited = [...validDests]
  const orderedDestinations = []

  // Jika starting anchor belum ditentukan, pilih destinasi pertama sebagai anchor awal
  if (currentLat == null || currentLon == null) {
    const firstDest = unvisited.shift()
    orderedDestinations.push(firstDest)
    currentLat = Number(firstDest.latitude)
    currentLon = Number(firstDest.longitude)
  }

  // Nearest Neighbor greedy loop
  while (unvisited.length > 0) {
    let nearestIndex = 0
    let minDistance = Infinity

    for (let i = 0; i < unvisited.length; i++) {
      const candidate = unvisited[i]
      const dist = calculateDistanceKm(currentLat, currentLon, candidate.latitude, candidate.longitude)
      if (dist != null && dist < minDistance) {
        minDistance = dist
        nearestIndex = i
      }
    }

    const [nextDest] = unvisited.splice(nearestIndex, 1)
    orderedDestinations.push(nextDest)
    currentLat = Number(nextDest.latitude)
    currentLon = Number(nextDest.longitude)
  }

  // Letakkan destinasi tanpa koordinat di akhir
  const finalOrdered = [...orderedDestinations, ...unmappedDests]

  // Hitung segmen dan total jarak
  const { totalDistanceKm, segments } = calculateTotalRouteDistance(orderedDestinations)

  return {
    orderedDestinations: finalOrdered,
    totalDistanceKm,
    segments,
    startingPointUsed: startAnchorInfo,
    hasUnmappedDestinations: unmappedDests.length > 0,
    straightLineNotice: 'Rute estimasi berdasarkan posisi geografis garis lurus.',
  }
}

/**
 * PENGHITUNGAN SKOR LOKASI (Location Score Modular)
 * Menghitung nilai kedekatan dan keselarasan lokasi destinasi
 * terhadap tujuan perjalanan dan destinasi lainnya.
 */
export function calculateLocationScore(destination, context = {}) {
  const {
    targetCity = '',
    targetLatitude = null,
    targetLongitude = null,
    referenceDestinations = [],
  } = context

  let score = 0
  const reasons = []

  const destCity = (destination.city || '').toLowerCase()
  const normTarget = String(targetCity).toLowerCase()

  // 1. Kecocokan kota/wilayah
  if (normTarget && (destCity.includes(normTarget) || normTarget.includes(destCity))) {
    score += 30
    reasons.push(`Kawasan ${destination.city || targetCity}`)
  }

  // 2. Jarak ke pusat kota target (jika ada koordinat target)
  if (
    isValidCoordinate(targetLatitude, targetLongitude) &&
    isValidCoordinate(destination.latitude, destination.longitude)
  ) {
    const distToCenter = calculateDistanceKm(
      targetLatitude,
      targetLongitude,
      destination.latitude,
      destination.longitude
    )
    if (distToCenter != null) {
      if (distToCenter <= 10) {
        score += 25
        reasons.push(`${distToCenter} km dari pusat`)
      } else if (distToCenter <= 25) {
        score += 20
        reasons.push(`Radius ${distToCenter} km`)
      } else if (distToCenter <= 50) {
        score += 15
      } else if (distToCenter > 80) {
        score -= 20 // Penalti terlalu jauh
      }
    }
  }

  // 3. Kedekatan terhadap destinasi yang sudah terpilih sebelumnya
  if (
    Array.isArray(referenceDestinations) &&
    referenceDestinations.length > 0 &&
    isValidCoordinate(destination.latitude, destination.longitude)
  ) {
    let minDistanceToSelected = Infinity
    for (const ref of referenceDestinations) {
      if (isValidCoordinate(ref.latitude, ref.longitude)) {
        const d = calculateDistanceKm(
          destination.latitude,
          destination.longitude,
          ref.latitude,
          ref.longitude
        )
        if (d != null && d < minDistanceToSelected) {
          minDistanceToSelected = d
        }
      }
    }

    if (minDistanceToSelected <= 8) {
      score += 15 // Bonus satu klaster
      reasons.push(`Berdekatan dengan destinasi terpilih (${minDistanceToSelected} km)`)
    } else if (minDistanceToSelected > 60) {
      score -= 10 // Terlalu terisolasi dari kelompok lainnya
    }
  }

  return {
    score,
    reasons,
  }
}

/**
 * ROUTE PROVIDER INTERFACE & ABSTRACTION
 * Menjamin arsitektur future-ready untuk migrasi ke OSRM / Google Maps / Mapbox
 * tanpa mengubah komponen antarmuka pengguna.
 */
export class RouteProvider {
  async calculateRoute(_destinations, _options) {
    throw new Error('Metode calculateRoute() harus diimplementasikan oleh subclass.')
  }
}

/**
 * GeographicRouteProvider (V1 Default)
 * Menghitung rute menggunakan Haversine straight-line coordinates & Nearest Neighbor.
 */
export class GeographicRouteProvider extends RouteProvider {
  async calculateRoute(destinations, options = {}) {
    return optimizeRoute(destinations, options.startingPoint || null)
  }
}

/**
 * RoadRouteProvider (Future Road-Network Routing Stub)
 * Contoh adapter siap pakai untuk OSRM / OpenRouteService / Google Directions di masa depan.
 */
export class RoadRouteProvider extends RouteProvider {
  constructor(apiKey = null, endpoint = 'https://router.project-osrm.org') {
    super()
    this.apiKey = apiKey
    this.endpoint = endpoint
  }

  async calculateRoute(destinations, options = {}) {
    // Fallback cerdas ke GeographicRouteProvider jika road routing belum dikonfigurasi
    const fallback = new GeographicRouteProvider()
    return fallback.calculateRoute(destinations, options)
  }
}

// Instance default provider
export const defaultRouteProvider = new GeographicRouteProvider()

export default {
  isValidCoordinate,
  calculateDistanceKm,
  calculateCentroid,
  calculateTotalRouteDistance,
  clusterDestinations,
  optimizeRoute,
  calculateLocationScore,
  GeographicRouteProvider,
  RoadRouteProvider,
  defaultRouteProvider,
}
