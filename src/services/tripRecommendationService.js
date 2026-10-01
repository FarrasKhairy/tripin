/**
 * tripRecommendationService.js
 * Smart Trip Recommendation & Budget Engine for Tripin.
 *
 * V1: Location-Aware & Rule-Based Recommendation Engine:
 * - Menggunakan context destinasi (nama, kota, provinsi, koordinat)
 * - Haversine distance calculation (jarak geografis real time)
 * - Destination sub-region mapping & area clustering
 * - Configurable scoring weights (cityMatch, regionMatch, distance, preference, budget)
 * - Itinerary optimization: satu hari satu area/klaster (tidak berpindah-pindah jauh)
 * - Map-ready architecture: menyimpan latitude, longitude, area, dan distance
 * - Future-ready interface untuk integrasi AI engine di masa depan.
 */

import destinationService from './destinationService.js'
import tripService from './tripService.js'
import tripDestinationService from './tripDestinationService.js'
import budgetService from './budgetService.js'
import { TRAVEL_STYLES } from './travelRecommendationConfig.js'
import { isSupabaseConfigured } from '../lib/supabase.js'
import {
  calculateDistanceKm,
  optimizeRoute,
  isValidCoordinate,
} from './geoService.js'
import {
  buildDestinationContext as createDestinationContext,
  scoreDestination as scorePlannerDestination,
  scoreGeographicRelevance,
  findNearbyDestinations,
  clusterDestinations as clusterPlannerDestinations,
  generateItinerary,
  calculateTripBudget,
  maximumRadiusForDuration,
} from './smartPlannerEngine.js'

/**
 * Helper menghitung durasi hari dan malam
 */
export function calculateTripDuration(startDateStr, endDateStr) {
  if (!startDateStr || !endDateStr) {
    return { days: 1, nights: 0 }
  }
  const start = new Date(startDateStr)
  const end = new Date(endDateStr)
  const diffTime = Math.max(0, end.getTime() - start.getTime())
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))
  const days = Math.max(1, diffDays + 1)
  const nights = Math.max(0, days - 1)
  return { days, nights }
}

/**
 * Class RuleBasedRecommendationEngine
 */
export class RuleBasedRecommendationEngine {
  buildDestinationContext(destinationInput) {
    return createDestinationContext(destinationInput)
  }

  locationScore(destination, context) {
    const result = scoreGeographicRelevance(destination, context.destinationContext || context, context.radiusKm || 90)
    return {
      score: result.score,
      reasons: result.reason ? [result.reason] : [],
      distanceKm: result.distanceKm,
      area: { region: destination.city || destination.province || 'Nearby', areaName: destination.city || destination.province || 'Nearby' },
      eligible: result.eligible,
    }
  }

  scoreDestination(destination, context = {}) {
    const result = scorePlannerDestination(destination, context.destinationContext || {}, context)
    return {
      score: result.totalScore,
      reason: result.reason,
      reasons: result.reasons,
      ticketPrice: result.ticketPrice,
      distanceKm: result.distanceKm,
      area: { region: destination.city || destination.province || 'Nearby', areaName: destination.city || destination.province || 'Nearby' },
      eligible: result.eligible,
      scoreComponents: {
        locationScore: result.locationScore,
        preferenceScore: result.preferenceScore,
        budgetScore: result.budgetScore,
        itineraryFitScore: result.itineraryFitScore,
      },
      matchedPreferences: result.matchedPreferences,
    }
  }

  clusterDestinations(destinations = []) {
    return clusterPlannerDestinations(destinations)
  }

  generateOptimizedItinerary(options = {}) {
    return generateItinerary(options)
  }

  calculateBudgetBreakdown(options = {}) {
    return calculateTripBudget(options)
  }

  async generate(input = {}) {
    const {
      destination,
      startDate,
      endDate,
      travelers = 1,
      budget = 0,
      travelStyle = TRAVEL_STYLES.BALANCED,
      preferences = [],
    } = input
    const numTravelers = Math.max(1, Number(travelers) || 1)
    const totalBudget = Math.max(0, Number(budget) || 0)
    const { days: durationDays, nights: durationNights } = calculateTripDuration(startDate, endDate)
    const destinationContext = this.buildDestinationContext(destination)
    if (!destinationContext.city && !isValidCoordinate(destinationContext.latitude, destinationContext.longitude)) {
      throw new Error('Choose a city or a destination with coordinates before generating a plan.')
    }

    const radiusKm = Number(input.maximumRadiusKm) || maximumRadiusForDuration(durationDays)
    const candidates = await destinationService.getPlannerCandidates(destinationContext, radiusKm)
    const uniqueCandidates = []
    const seenIds = new Set()
    for (const candidate of candidates) {
      if (candidate.id && seenIds.has(candidate.id)) continue
      if (candidate.id) seenIds.add(candidate.id)
      uniqueCandidates.push(candidate)
    }

    const scoringContext = {
      destinationContext,
      preferences,
      travelStyle,
      budget: totalBudget,
      travelers: numTravelers,
      durationDays,
      radiusKm,
    }
    const nearbyCandidates = findNearbyDestinations(uniqueCandidates, destinationContext, radiusKm)
    const scoredDestinations = nearbyCandidates
      .map((candidate) => {
        const result = this.scoreDestination(candidate, scoringContext)
        return {
          ...candidate,
          recommendationScore: result.score,
          eligible: result.eligible,
          recommendationReason: result.reason,
          recommendationReasons: result.reasons,
          scoreComponents: result.scoreComponents,
          matchedPreferences: result.matchedPreferences,
          effectiveTicketPrice: result.ticketPrice,
          distanceKm: result.distanceKm,
          area: result.area,
        }
      })
      .filter((candidate) => candidate.eligible)
      .sort((a, b) => b.recommendationScore - a.recommendationScore)

    const idealDestinationCount = Math.min(12, Math.max(1, Math.ceil(durationDays * 1.5)))
    const remaining = [...scoredDestinations]
    const selected = []
    const coveredPreferences = new Set()
    while (remaining.length && selected.length < idealDestinationCount) {
      remaining.sort((a, b) => {
        const aNew = a.matchedPreferences.filter((preference) => !coveredPreferences.has(preference)).length
        const bNew = b.matchedPreferences.filter((preference) => !coveredPreferences.has(preference)).length
        return (b.recommendationScore + bNew * 8) - (a.recommendationScore + aNew * 8)
      })
      const [next] = remaining.splice(0, 1)
      selected.push(next)
      next.matchedPreferences.forEach((preference) => coveredPreferences.add(preference))
    }

    const budgetDetails = this.calculateBudgetBreakdown({
      budget: totalBudget,
      travelStyle,
      durationDays,
      durationNights,
      travelers: numTravelers,
      selectedDestinations: selected,
      candidateDestinations: scoredDestinations,
    })
    const itinerary = this.generateOptimizedItinerary({
      durationDays,
      startDate,
      recommendedDestinations: selected,
      destinationContext,
      startingPoint: input.startingPoint || null,
    })
    const totalDistanceKm = itinerary.reduce((sum, day) => sum + (day.totalDistanceKm || 0), 0)
    const areas = new Set(itinerary.filter((day) => day.destinations.length).map((day) => day.areaCluster))
    const hasUnmappedCoordinates = selected.some((item) => !isValidCoordinate(item.latitude, item.longitude))
    const noPreferenceMatch = preferences.length > 0 && !scoredDestinations.some((item) => item.matchedPreferences.length)

    return {
      summary: {
        destinationName: destinationContext.name || destinationContext.city,
        city: destinationContext.city,
        province: destinationContext.province,
        durationDays,
        durationNights,
        durationLabel: `${durationDays} Hari ${durationNights} Malam`,
        startDate,
        endDate,
        travelers: numTravelers,
        travelStyle,
        preferences,
      },
      destinationContext,
      routeSummary: {
        totalDistanceKm: Math.round(totalDistanceKm * 10) / 10,
        totalDestinationsCount: selected.length,
        totalAreasCount: areas.size,
        optimizationNotice: 'Destinasi terbit dikelompokkan berdasarkan kedekatan geografis.',
        startingPointNotice: input.startingPoint?.name
          ? `Titik awal: ${input.startingPoint.name}`
          : 'Urutan rute dioptimalkan di antara destinasi pilihan.',
        isStraightLine: true,
        straightLineDisclaimer: 'Jarak adalah estimasi geografis Haversine, bukan jarak jalan atau waktu tempuh.',
        hasUnmappedDestinations: hasUnmappedCoordinates,
      },
      budgetBreakdown: budgetDetails.breakdownItems,
      totalEstimatedCost: budgetDetails.totalEstimatedCost,
      userBudget: totalBudget,
      remainingBudget: budgetDetails.remainingBudget,
      overBudget: budgetDetails.overBudget,
      budgetAssumptions: budgetDetails.budgetAssumptions,
      insight: budgetDetails.insight,
      recommendations: selected,
      candidateDestinations: scoredDestinations,
      itinerary,
      plannerNotices: [
        ...(selected.length ? [] : ['Tidak ada destinasi terbit yang ditemukan di area ini.']),
        ...(hasUnmappedCoordinates ? ['Sebagian destinasi belum memiliki koordinat; optimasi rute menjadi terbatas.'] : []),
        ...(budgetDetails.unknownTicketCount ? ['Harga tiket sebagian destinasi belum tersedia dan tidak dimasukkan sebagai biaya gratis.'] : []),
        ...(noPreferenceMatch ? ['Belum ada destinasi lokal yang cocok dengan kategori pilihan; rekomendasi mengikuti kedekatan lokasi dan kecocokan biaya.'] : []),
      ],
      estimatedCostNotice: 'Transportasi, penginapan, makan, transportasi lokal, dan biaya lain adalah estimasi; periksa harga penyedia sebelum memesan.',
    }
  }
}
const ruleBasedEngine = new RuleBasedRecommendationEngine()

export const tripRecommendationService = {
  /**
   * Pintu utama untuk menghasilkan rekomendasi perjalanan
   */
  async generateTripRecommendation(input) {
    return ruleBasedEngine.generate(input)
  },

  /**
   * Mengoptimalkan ulang urutan rute perjalanan tanpa membuat ulang seluruh rekomendasi
   */
  reoptimizeRoute(currentPlan, options = {}) {
    const updatedItinerary = currentPlan.itinerary.map((day) => {
      const destItems = day.items.filter((item) => item.isDestination)
      const dayDests = destItems.map((item) => {
        return (
          currentPlan.recommendations.find((d) => d.id === item.destinationId) || {
            id: item.destinationId,
            name: item.title,
            latitude: item.latitude,
            longitude: item.longitude,
            ticket_price: item.ticketPrice,
            image_url: item.image,
            area: { areaName: item.areaName },
          }
        )
      })

      const opt = optimizeRoute(dayDests, options.startingPoint || null)
      const ordered = opt.orderedDestinations

      let destIdx = 0
      let segmentDist = null
      if (ordered.length >= 2) {
        segmentDist = calculateDistanceKm(
          ordered[0].latitude,
          ordered[0].longitude,
          ordered[1].latitude,
          ordered[1].longitude
        )
      }

      const newItems = day.items.map((item) => {
        if (!item.isDestination) return item
        const dest = ordered[destIdx]
        const currentIdx = destIdx
        destIdx++
        if (!dest) return item

        return {
          ...item,
          destinationId: dest.id,
          title: dest.name,
          image: dest.image_url || item.image,
          ticketPrice: dest.ticket_price,
          areaName: dest.area?.areaName || dest.city || item.areaName,
          latitude: dest.latitude,
          longitude: dest.longitude,
          distanceToNextKm: currentIdx === 0 && ordered.length >= 2 ? segmentDist : null,
          distanceFromPrevKm: currentIdx === 1 ? segmentDist : null,
        }
      })

      return {
        ...day,
        totalDistanceKm: opt.totalDistanceKm,
        segments: opt.segments,
        destinations: ordered,
        items: newItems,
      }
    })

    const newTotalDistance = updatedItinerary.reduce((acc, d) => acc + (d.totalDistanceKm || 0), 0)

    return {
      ...currentPlan,
      itinerary: updatedItinerary,
      routeSummary: {
        ...currentPlan.routeSummary,
        totalDistanceKm: Math.round(newTotalDistance * 10) / 10,
      },
    }
  },

  /**
   * Menghitung ulang budget jika user mengubah budget atau travel style
   */
  recalculateBudget(currentPlan, newOptions = {}) {
    const updatedBudget = newOptions.budget !== undefined ? Number(newOptions.budget) : currentPlan.userBudget
    const updatedStyle = newOptions.travelStyle || currentPlan.summary.travelStyle
    const updatedDestinations = newOptions.destinations || currentPlan.recommendations
    const dayAssignments = newOptions.dayAssignments || Object.fromEntries(
      (currentPlan.itinerary || []).flatMap((day) => (day.destinations || []).map((destination) => [destination.id, day.dayNumber])),
    )
    const budgetDetails = ruleBasedEngine.calculateBudgetBreakdown({
      budget: updatedBudget,
      travelStyle: updatedStyle,
      durationDays: currentPlan.summary.durationDays,
      durationNights: currentPlan.summary.durationNights,
      travelers: currentPlan.summary.travelers,
      selectedDestinations: updatedDestinations,
      candidateDestinations: currentPlan.candidateDestinations || [],
    })
    const updatedItinerary = ruleBasedEngine.generateOptimizedItinerary({
      durationDays: currentPlan.summary.durationDays,
      startDate: currentPlan.summary.startDate,
      recommendedDestinations: updatedDestinations,
      destinationContext: currentPlan.destinationContext,
      dayAssignments,
    })
    const totalKm = updatedItinerary.reduce((sum, day) => sum + (day.totalDistanceKm || 0), 0)
    const areaSet = new Set(updatedItinerary.filter((day) => day.destinations.length).map((day) => day.areaCluster))
    const updatedRouteSummary = {
      ...currentPlan.routeSummary,
      totalDistanceKm: Math.round(totalKm * 10) / 10,
      totalDestinationsCount: updatedDestinations.length,
      totalAreasCount: areaSet.size,
      hasUnmappedDestinations: updatedDestinations.some((destination) => !isValidCoordinate(destination.latitude, destination.longitude)),
    }
    return {
      ...currentPlan,
      userBudget: updatedBudget,
      summary: { ...currentPlan.summary, travelStyle: updatedStyle },
      recommendations: updatedDestinations,
      itinerary: updatedItinerary,
      routeSummary: updatedRouteSummary,
      budgetBreakdown: budgetDetails.breakdownItems,
      totalEstimatedCost: budgetDetails.totalEstimatedCost,
      remainingBudget: budgetDetails.remainingBudget,
      overBudget: budgetDetails.overBudget,
      budgetAssumptions: budgetDetails.budgetAssumptions,
      insight: budgetDetails.insight,
    }
  },

  /**
   * Menyimpan rencana perjalanan ke database Supabase
   */
  async saveSmartTrip(userId, plan) {
    if (!userId) throw new Error('User harus login untuk menyimpan rencana perjalanan.')
    if (!plan || !plan.summary) throw new Error('Data rencana perjalanan tidak valid.')
    if (!isSupabaseConfigured) throw new Error('Supabase tidak tersedia; rencana belum disimpan.')

    const { summary, budgetBreakdown = [], recommendations = [], itinerary = [] } = plan
    if (!recommendations.length) throw new Error('Tambahkan setidaknya satu destinasi sebelum menyimpan rencana.')
    const tripPayload = {
      title: `Trip ${summary.destinationName}`,
      startDate: summary.startDate,
      endDate: summary.endDate,
      personCount: summary.travelers,
      transportation: summary.travelStyle === 'hemat' ? 'Kereta / Bus' : summary.travelStyle === 'comfort' ? 'Pesawat' : 'Mobil',
      initialBudget: plan.userBudget,
      notes: `Direncanakan oleh Tripin Smart Planner. Kawasan: ${summary.city || summary.destinationName} (${summary.durationLabel})`,
    }

    const createdTrip = await tripService.createTrip(userId, tripPayload)
    const tripId = createdTrip.id
    const dayOffsetDate = (dayNumber) => {
      if (!summary.startDate) return null
      const [year, month, day] = summary.startDate.split('-').map(Number)
      return new Date(Date.UTC(year, month - 1, day + Math.max(0, Number(dayNumber) - 1))).toISOString().slice(0, 10)
    }
    const destinationEntries = []
    const seen = new Set()
    let visitOrder = 1
    for (const day of itinerary) {
      for (const destination of day.destinations || []) {
        if (!destination.id || seen.has(destination.id)) continue
        seen.add(destination.id)
        destinationEntries.push({
          destination_id: destination.id,
          visit_date: dayOffsetDate(day.dayNumber),
          visit_order: visitOrder++,
          notes: destination.recommendationReason || null,
        })
      }
    }

    try {
      await tripDestinationService.addDestinations(tripId, destinationEntries)
      await budgetService.addBudgetItems(tripId, budgetBreakdown.map((item) => ({
        category: item.category,
        name: item.name,
        estimated_amount: item.amount,
        quantity: 1,
        notes: item.notes || null,
      })))
      return createdTrip
    } catch (insertError) {
      console.error('[saveSmartTrip] Gagal menyimpan relasi, melakukan rollback:', insertError)
      const childCleanup = await Promise.allSettled([
        tripDestinationService.removeTripDestinations(tripId),
        budgetService.deleteBudgetItemsForTrip(tripId),
      ])
      const tripCleanup = await Promise.allSettled([tripService.deleteTrip(tripId)])
      childCleanup.concat(tripCleanup).filter((result) => result.status === 'rejected').forEach((result) => {
        console.warn('[saveSmartTrip] Pembersihan data parsial gagal:', result.reason)
      })
      throw new Error(`Gagal menyimpan detail rencana perjalanan: ${insertError.message || 'Terjadi kesalahan'}`)
    }
  },
}

export default tripRecommendationService
