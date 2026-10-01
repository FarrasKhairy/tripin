/**
 * test_smart_route_optimizer.mjs
 * Comprehensive validation suite for Tripin Map View & Smart Route Optimizer V1.
 */

import {
  isValidCoordinate,
  calculateDistanceKm,
  calculateCentroid,
  calculateTotalRouteDistance,
  clusterDestinations,
  optimizeRoute,
  calculateLocationScore,
  GeographicRouteProvider,
  defaultRouteProvider,
} from './src/services/geoService.js'

import {
  RuleBasedRecommendationEngine,
  calculateTripDuration,
  tripRecommendationService,
} from './src/services/tripRecommendationService.js'

let totalTests = 0
let passedTests = 0
let failedTests = 0

function assert(condition, message) {
  totalTests++
  if (condition) {
    passedTests++
    console.log(`  ✓ PASS: ${message}`)
  } else {
    failedTests++
    console.error(`  ✗ FAIL: ${message}`)
  }
}

console.log('\n==================================================')
console.log('TEST SUITE 1: GEOGRAPHIC UTILITIES & DISTANCE CALCULATION')
console.log('==================================================')

// 1. Valid coordinates
assert(isValidCoordinate(-7.7956, 110.3695) === true, 'Yogyakarta coordinates are valid')
assert(isValidCoordinate(-8.6705, 115.2126) === true, 'Bali coordinates are valid')
assert(isValidCoordinate(null, 110.36) === false, 'null latitude is invalid')
assert(isValidCoordinate(-7.79, undefined) === false, 'undefined longitude is invalid')
assert(isValidCoordinate('abc', 110.36) === false, 'NaN coordinate is invalid')
assert(isValidCoordinate(0, 0) === false, '(0,0) Null Island is invalid')
assert(isValidCoordinate(-91, 100) === false, 'Latitude < -90 is invalid')
assert(isValidCoordinate(-7.79, 185) === false, 'Longitude > 180 is invalid')

// 2. Haversine Distance
const malioboroLat = -7.7928, malioboroLon = 110.3658
const kratonLat = -7.8053, kratonLon = 110.3642
const prambananLat = -7.7520, prambananLon = 110.4914
const kutaLat = -8.7185, kutaLon = 115.1686

const distMaliToKraton = calculateDistanceKm(malioboroLat, malioboroLon, kratonLat, kratonLon)
assert(distMaliToKraton != null && distMaliToKraton >= 1.3 && distMaliToKraton <= 1.5, `Malioboro to Kraton distance is ~1.4 km (actual: ${distMaliToKraton} km)`)

const distMaliToPrambanan = calculateDistanceKm(malioboroLat, malioboroLon, prambananLat, prambananLon)
assert(distMaliToPrambanan != null && distMaliToPrambanan >= 13.5 && distMaliToPrambanan <= 15.0, `Malioboro to Prambanan distance is ~14.3 km (actual: ${distMaliToPrambanan} km)`)

assert(calculateDistanceKm(null, 110, -7.8, 110) === null, 'calculateDistanceKm returns null for missing lat1')

// 3. Route Distance & Segments
const testPoints = [
  { id: '1', name: 'Malioboro', latitude: malioboroLat, longitude: malioboroLon },
  { id: '2', name: 'Kraton', latitude: kratonLat, longitude: kratonLon },
  { id: '3', name: 'Prambanan', latitude: prambananLat, longitude: prambananLon },
]
const totalRoute = calculateTotalRouteDistance(testPoints)
assert(totalRoute.segments.length === 2, 'Total segments is 2 for 3 points')
assert(totalRoute.totalDistanceKm > 15 && totalRoute.totalDistanceKm < 18, `Total route distance is calculated correctly (actual: ${totalRoute.totalDistanceKm} km)`)

// 4. Centroid calculation
const centroid = calculateCentroid(testPoints)
assert(centroid != null && centroid.latitude < -7.7 && centroid.longitude > 110.3, 'Centroid calculated correctly')

console.log('\n==================================================')
console.log('TEST SUITE 2: DISTANCE CLUSTERING (GENERIC, NO HARDCODE)')
console.log('==================================================')

const diverseDests = [
  // Cluster A (Kota Jogja): within 2 km
  { id: 'a1', name: 'Malioboro', latitude: -7.7928, longitude: 110.3658, city: 'Yogyakarta' },
  { id: 'a2', name: 'Kraton', latitude: -7.8053, longitude: 110.3642, city: 'Yogyakarta' },
  // Cluster B (Prambanan): ~14 km away from Kota
  { id: 'b1', name: 'Candi Prambanan', latitude: -7.7520, longitude: 110.4914, city: 'Sleman' },
  { id: 'b2', name: 'Ratu Boko', latitude: -7.7705, longitude: 110.4894, city: 'Sleman' },
  // Cluster C (Gunungkidul): ~45 km away
  { id: 'c1', name: 'Pantai Indrayanti', latitude: -8.1506, longitude: 110.6125, city: 'Gunungkidul' },
  // Unmapped destination without coordinates
  { id: 'u1', name: 'Tempat Misterius', latitude: null, longitude: null, city: 'Yogyakarta' },
]

const clusters = clusterDestinations(diverseDests, 15) // radius 15 km
assert(clusters.length >= 3, `Formed at least 3 clusters for geographically distinct areas (actual: ${clusters.length})`)

const unmappedCluster = clusters.find(c => c.id === 'cluster-unmapped')
assert(unmappedCluster != null && unmappedCluster.destinations.length === 1, 'Unmapped destinations safely grouped into fallback cluster')

console.log('\n==================================================')
console.log('TEST SUITE 3: SMART ROUTE OPTIMIZER (NEAREST NEIGHBOR)')
console.log('==================================================')

// Unsorted points: Malioboro (center) -> Prambanan (east, 14km) -> Kraton (center, 1.4km from Malioboro)
const unsortedPoints = [
  { id: '1', name: 'Malioboro', latitude: malioboroLat, longitude: malioboroLon },
  { id: '2', name: 'Prambanan', latitude: prambananLat, longitude: prambananLon },
  { id: '3', name: 'Kraton', latitude: kratonLat, longitude: kratonLon },
]

const optimized = optimizeRoute(unsortedPoints)
assert(optimized.orderedDestinations.length === 3, 'All 3 destinations preserved')
assert(optimized.orderedDestinations[0].name === 'Malioboro', 'First destination is Malioboro')
assert(optimized.orderedDestinations[1].name === 'Kraton', 'Second destination is nearest neighbor Kraton (not far Prambanan)')
assert(optimized.orderedDestinations[2].name === 'Prambanan', 'Third destination is Prambanan')
assert(optimized.totalDistanceKm < 18, `Optimized route distance is ~16.6 km (actual: ${optimized.totalDistanceKm} km)`)

// Edge cases for optimizeRoute
assert(optimizeRoute([]).orderedDestinations.length === 0, 'Empty array returns empty ordered destinations')
assert(optimizeRoute([testPoints[0]]).orderedDestinations.length === 1, 'Single destination returns correctly without error')

// Mixed with missing coordinates
const mixedPoints = [
  { id: '1', name: 'A', latitude: -7.79, longitude: 110.36 },
  { id: '2', name: 'NoCoord', latitude: null, longitude: null },
  { id: '3', name: 'B', latitude: -7.80, longitude: 110.37 },
]
const optMixed = optimizeRoute(mixedPoints)
assert(optMixed.orderedDestinations.length === 3, 'Preserves unmapped destinations')
assert(optMixed.hasUnmappedDestinations === true, 'Flags hasUnmappedDestinations accurately')

console.log('\n==================================================')
console.log('TEST SUITE 4: ROUTE PROVIDER ABSTRACTION')
console.log('==================================================')

const provider = new GeographicRouteProvider()
const res = await provider.calculateRoute(testPoints)
assert(res.orderedDestinations.length === 3, 'GeographicRouteProvider implements calculateRoute')
assert(res.totalDistanceKm > 0, 'GeographicRouteProvider returns valid total distance')

console.log('\n==================================================')
console.log('TEST SUITE 5: ITINERARY GENERATION & DAILY ROUTE OPTIMIZATION')
console.log('==================================================')

const engine = new RuleBasedRecommendationEngine()

// Mock destinations pool covering multiple cities
const mockDestinations = [
  { id: 'yk1', name: 'Malioboro', city: 'Yogyakarta', latitude: -7.7928, longitude: 110.3658, ticket_price: 0, categories: ['Budaya', 'Belanja'], area: { region: 'CITY', areaName: 'Kota Jogja' } },
  { id: 'yk2', name: 'Keraton Ngayogyakarta', city: 'Yogyakarta', latitude: -7.8053, longitude: 110.3642, ticket_price: 15000, categories: ['Budaya', 'Sejarah'], area: { region: 'CITY', areaName: 'Kota Jogja' } },
  { id: 'yk3', name: 'Candi Prambanan', city: 'Sleman', latitude: -7.7520, longitude: 110.4914, ticket_price: 50000, categories: ['Budaya', 'Sejarah'], area: { region: 'PRAMBANAN', areaName: 'Prambanan' } },
  { id: 'yk4', name: 'Tebing Breksi', city: 'Sleman', latitude: -7.7818, longitude: 110.5046, ticket_price: 10000, categories: ['Alam'], area: { region: 'PRAMBANAN', areaName: 'Prambanan' } },
  { id: 'yk5', name: 'Pantai Parangtritis', city: 'Bantul', latitude: -8.0255, longitude: 110.3340, ticket_price: 10000, categories: ['Pantai', 'Alam'], area: { region: 'BANTUL', areaName: 'Bantul' } },
  { id: 'yk6', name: 'Hutan Pinus Mangunan', city: 'Bantul', latitude: -7.9298, longitude: 110.4312, ticket_price: 8000, categories: ['Alam'], area: { region: 'BANTUL', areaName: 'Bantul' } },
  
  // Bali destinations
  { id: 'bl1', name: 'Pantai Kuta', city: 'Badung', latitude: -8.7185, longitude: 115.1686, ticket_price: 0, categories: ['Pantai'], area: { region: 'BADUNG_SOUTH', areaName: 'Kuta' } },
  { id: 'bl2', name: 'Pantai Seminyak', city: 'Badung', latitude: -8.6913, longitude: 115.1584, ticket_price: 0, categories: ['Pantai'], area: { region: 'BADUNG_SOUTH', areaName: 'Kuta' } },
  { id: 'bl3', name: 'Ubud Monkey Forest', city: 'Gianyar', latitude: -8.5188, longitude: 115.2588, ticket_price: 80000, categories: ['Alam', 'Budaya'], area: { region: 'GIANYAR_UBUD', areaName: 'Ubud' } },
]

// Test Case A: Yogyakarta 4D3N
const ykContext = engine.buildDestinationContext('Yogyakarta')
const ykItinerary = engine.generateOptimizedItinerary({
  durationDays: 4,
  startDate: '2026-10-01',
  recommendedDestinations: mockDestinations.filter(d => d.id.startsWith('yk')),
  destinationContext: ykContext,
})

assert(ykItinerary.length === 4, 'Yogyakarta itinerary has 4 days')
assert(ykItinerary[0].items.length > 0, 'Day 1 has agenda items')
assert(ykItinerary[0].destinations.length > 0, 'Day 1 has ordered destinations')
assert(typeof ykItinerary[0].totalDistanceKm === 'number', 'Day 1 has calculated totalDistanceKm')

// Verify distance connecting destinations in timeline
const day1DestItems = ykItinerary[0].items.filter(i => i.isDestination)
if (day1DestItems.length >= 2) {
  assert(day1DestItems[0].distanceToNextKm != null, `Day 1 Item 0 has distanceToNextKm: ${day1DestItems[0].distanceToNextKm} km`)
}

// Test Case B: Bali 3D2N
const baliContext = engine.buildDestinationContext('Bali')
const baliItinerary = engine.generateOptimizedItinerary({
  durationDays: 3,
  startDate: '2026-10-10',
  recommendedDestinations: mockDestinations.filter(d => d.id.startsWith('bl')),
  destinationContext: baliContext,
})
assert(baliItinerary.length === 3, 'Bali itinerary has 3 days')
assert(baliItinerary[0].areaCluster != null, 'Bali itinerary has cluster name')

// Test Case C: Bandung 2D1N
const bdoContext = engine.buildDestinationContext('Bandung')
assert(bdoContext.normalized === 'bandung', 'Bandung context normalized correctly')

// Test Case D: Malang 5D4N
const malangContext = engine.buildDestinationContext('Malang')
assert(malangContext.normalized === 'malang', 'Malang context normalized correctly')

console.log('\n==================================================')
console.log('TEST SUITE 6: REOPTIMIZE ROUTE WITHOUT FULL REGENERATE')
console.log('==================================================')

const initialPlan = {
  summary: {
    destinationName: 'Yogyakarta',
    durationDays: 2,
    startDate: '2026-10-01',
  },
  recommendations: mockDestinations.slice(0, 4),
  itinerary: ykItinerary.slice(0, 2),
  routeSummary: { totalDistanceKm: 25 },
}

const reoptimizedPlan = tripRecommendationService.reoptimizeRoute(initialPlan)
assert(reoptimizedPlan != null, 'reoptimizeRoute returns plan')
assert(reoptimizedPlan.itinerary.length === 2, 'Itinerary days preserved')
assert(typeof reoptimizedPlan.routeSummary.totalDistanceKm === 'number', 'Recalculates routeSummary.totalDistanceKm')

console.log('\n==================================================')
console.log(`TEST SUMMARY: ${passedTests}/${totalTests} PASSED (${failedTests} FAILED)`)
console.log('==================================================\n')

if (failedTests > 0) {
  process.exit(1)
} else {
  process.exit(0)
}
