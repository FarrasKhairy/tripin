import test from 'node:test'
import assert from 'node:assert/strict'
import {
  buildDataQualityReport,
  normalizeDestination,
  normalizeDestinations,
  parseCsv,
  validateDestinations,
} from './pipeline.mjs'
import {
  buildDestinationContext,
  calculateTripBudget,
  generateItinerary,
  scoreDestination,
} from '../../src/services/smartPlannerEngine.js'
import { TRAVEL_STYLES } from '../../src/services/travelRecommendationConfig.js'

const localRecords = [
  { id: 'example-nature', name: 'Example Nature Park', slug: 'example-nature-park', city: 'Yogyakarta', province: 'DI Yogyakarta', categories: ['Nature'], ticket_price: 10000, latitude: null, longitude: null },
  { id: 'example-culture', name: 'Example Cultural Hall', slug: 'example-cultural-hall', city: 'Yogyakarta', province: 'DI Yogyakarta', categories: ['Culture'], ticket_price: 0, latitude: null, longitude: null },
  { id: 'example-food-market', name: 'Example Food Market', slug: 'example-food-market', city: 'Yogyakarta', province: 'DI Yogyakarta', categories: ['Food'], ticket_price: null, latitude: null, longitude: null },
]

const areaCases = [
  { city: 'Yogyakarta', province: 'DI Yogyakarta', days: 4, nights: 3 },
  { city: 'Denpasar', province: 'Bali', days: 3, nights: 2 },
  { city: 'Bandung', province: 'Jawa Barat', days: 2, nights: 1 },
  { city: 'Malang', province: 'Jawa Timur', days: 5, nights: 4 },
]

function destination(name, city, province, categories = [], ticket_price = 0) {
  return { id: `${city}-${name}`, name, city, province, categories, ticket_price, latitude: null, longitude: null }
}

test('planner cases stay inside the selected city for four Indonesia trip contexts and varied budgets/preferences', () => {
  const budgets = [2000000, 5000000, 10000000]
  const preferenceSets = [['Nature'], ['Culture'], ['Food'], ['Nature', 'Culture', 'Food']]
  for (const area of areaCases) {
    const context = buildDestinationContext({ name: area.city, ...area })
    const local = [
      destination('Example nature place', area.city, area.province, ['Nature'], 10000),
      destination('Example culture place', area.city, area.province, ['Culture'], 0),
    ]
    const remote = destination('Remote test place', area.city === 'Denpasar' ? 'Yogyakarta' : 'Denpasar', area.city === 'Denpasar' ? 'DI Yogyakarta' : 'Bali', ['Nature'], 0)
    assert.equal(scoreDestination(remote, context).eligible, false)
    for (const budget of budgets) {
      for (const preferences of preferenceSets) {
        const scores = local.map((item) => scoreDestination(item, context, { preferences, budget, travelers: 4, durationDays: area.days }))
        assert.ok(scores.every((score) => score.eligible))
        const itinerary = generateItinerary({ durationDays: area.days, recommendedDestinations: local, destinationContext: context })
        assert.equal(itinerary.length, area.days)
        assert.ok(itinerary.every((day) => day.destinations.length <= 2))
        const estimate = calculateTripBudget({ budget, durationDays: area.days, durationNights: area.nights, travelers: 4, travelStyle: TRAVEL_STYLES.BALANCED, selectedDestinations: local })
        assert.ok(estimate.totalEstimatedCost >= 0)
        assert.equal(estimate.overBudget, estimate.remainingBudget < 0)
      }
    }
  }
})

test('zero, one, multiple, missing-coordinate, and day-move itinerary cases are deterministic', () => {
  const context = buildDestinationContext('Yogyakarta')
  assert.deepEqual(generateItinerary({ durationDays: 2, recommendedDestinations: [], destinationContext: context }).map((day) => day.destinations), [[], []])
  const one = localRecords[0]
  const onePlan = generateItinerary({ durationDays: 2, recommendedDestinations: [one], destinationContext: context })
  assert.equal(onePlan.flatMap((day) => day.destinations).length, 1)
  assert.equal(onePlan[0].hasUnmappedDestinations, true)
  const multiple = generateItinerary({ durationDays: 2, recommendedDestinations: localRecords, destinationContext: context, dayAssignments: { 'example-food-market': 2 } })
  assert.equal(multiple[1].destinations.some((item) => item.id === 'example-food-market'), true)
  assert.equal(multiple.flatMap((day) => day.destinations).length, 3)
})

test('unknown prices remain unknown, free alternatives exclude missing-price records, and over-budget advice is actionable', () => {
  const paid = destination('Paid test venue', 'Yogyakarta', 'DI Yogyakarta', ['Culture'], 500000)
  const free = destination('Free test venue', 'Yogyakarta', 'DI Yogyakarta', ['Nature'], 0)
  const unknown = destination('Unknown test venue', 'Yogyakarta', 'DI Yogyakarta', ['Food'], null)
  const result = calculateTripBudget({ budget: 1, durationDays: 2, durationNights: 0, travelers: 4, travelStyle: TRAVEL_STYLES.COMFORT, selectedDestinations: [paid, unknown], candidateDestinations: [free, unknown] })
  assert.equal(result.overBudget, true)
  assert.equal(result.unknownTicketCount, 1)
  assert.equal(result.breakdownItems.find((item) => item.id === 'attractions').amount, 2000000)
  assert.deepEqual(result.insight.alternatives.freeOptions.map((item) => item.destinationId), [free.id])
  assert.ok(result.insight.alternatives.removeOptions.some((item) => item.destinationId === paid.id))
})

test('preference mismatch does not change geographic eligibility or invent a category match', () => {
  const context = buildDestinationContext('Bandung')
  const candidate = destination('Unclassified test record', 'Bandung', 'Jawa Barat', [], 0)
  const result = scoreDestination(candidate, context, { preferences: ['Culture'], budget: 1000000 })
  assert.equal(result.eligible, true)
  assert.deepEqual(result.matchedPreferences, [])
  assert.equal(result.preferenceScore, 0)
})

test('CSV parsing, normalization, validation, duplicate review, and data quality coverage are reported', () => {
  const csv = 'name,slug,province,city,latitude,longitude,ticket_price,category\n"Example, quoted",quoted-example,DIY,Yogyakarta,,,,Culture\n'
  const parsed = parseCsv(csv)
  assert.equal(parsed[0].name, 'Example, quoted')
  const normalized = normalizeDestinations(parsed)
  assert.equal(normalized[0].province, 'DI Yogyakarta')
  assert.equal(normalized[0].ticket_price, null)

  const valid = normalizeDestination({ name: 'Same Venue', city: 'Yogyakarta', province: 'DIY', category: 'Culture' })
  const duplicate = normalizeDestination({ name: ' same venue ', city: 'Yogyakarta', province: 'DI Yogyakarta', category: 'Budaya' })
  const invalid = normalizeDestination({ name: '', province: '', latitude: 95, longitude: 200, ticket_price: 'unknown', category: 'made-up' })
  const validation = validateDestinations([valid, duplicate, invalid])
  assert.equal(validation.duplicateCandidates.length, 1)
  assert.equal(validation.duplicateSlugs.length, 1)
  assert.ok(validation.errors.some((error) => error.field === 'latitude'))
  assert.ok(validation.errors.some((error) => error.message.includes('invalid ticket price')))
  assert.ok(validation.errors.some((error) => error.message.includes('invalid category')))

  const report = buildDataQualityReport([valid, duplicate, invalid])
  assert.equal(report.totalDestinations, 3)
  assert.equal(report.withoutCoordinates, 3)
  assert.equal(report.withoutTicketPrice, 3)
  assert.equal(report.provinceCoverage.find((item) => item.province === 'DI Yogyakarta').destinationCount, 2)
  assert.equal(report.unpublishedDestinations, 3)
})
