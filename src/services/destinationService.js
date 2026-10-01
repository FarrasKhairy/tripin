import { supabase, isSupabaseConfigured } from '../lib/supabase.js'
import { calculateDistanceKm, isValidCoordinate } from './geoService.js'

const LEGACY_DESTINATION_FIELDS = 'id, name, slug, province, city, description, image_url, ticket_price, latitude, longitude, opening_hours, address, is_published'
const DESTINATION_FIELDS = LEGACY_DESTINATION_FIELDS + ', image_credit, image_source_url, image_license, image_license_url'
let imageAttributionColumnsAvailable = null

function isMissingImageAttributionColumns(error) {
  return /image_credit|image_source_url|image_license|image_license_url/i.test(error?.message || '')
}
const DEFAULT_PAGE_SIZE = 50
const PLANNER_PAGE_SIZE = 200
const PLANNER_MAX_CANDIDATES = 1000

function requireSupabase() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Destination data is unavailable because Supabase is not configured.')
  }
  return supabase
}

function safeSearch(value) {
  return String(value || '').trim().replace(/[(),.*%_\\'\"]+/g, ' ').replace(/\s+/g, ' ')
}

function searchTerms(value) {
  const term = safeSearch(value)
  if (!term) return []
  const normalized = term.toLocaleLowerCase('id-ID')
  if (normalized === 'jogja' || normalized === 'di yogyakarta') return [term, 'Yogyakarta']
  return [term]
}

async function attachCategories(rows) {
  if (!rows.length) return rows
  const client = requireSupabase()
  const ids = rows.map((destination) => destination.id).filter(Boolean)
  const { data, error } = await client
    .from('destination_category_relations')
    .select('destination_id, category:destination_categories(id, name, slug)')
    .in('destination_id', ids)

  if (error) throw new Error(`Unable to load destination categories: ${error.message}`)

  const categoriesByDestination = new Map()
  for (const relation of data || []) {
    if (!relation.category) continue
    const categories = categoriesByDestination.get(relation.destination_id) || []
    categories.push(relation.category)
    categoriesByDestination.set(relation.destination_id, categories)
  }

  return rows.map((destination) => {
    const categories = categoriesByDestination.get(destination.id) || []
    return {
      ...destination,
      categories,
      _ui: { ...(destination._ui || {}), category_names: categories.map((category) => category.name) },
    }
  })
}

async function readPublishedPage(filters = {}, { offset = 0, limit = DEFAULT_PAGE_SIZE } = {}) {
  const client = requireSupabase()
  const makeQuery = (fields) => {
    let query = client.from('destinations').select(fields).eq('is_published', true)
    const terms = searchTerms(filters.search)

    if (terms.length) {
      const clauses = terms.flatMap((term) =>
        ['name', 'province', 'city', 'address'].map((field) => field + '.ilike.%' + term + '%'),
      )
      query = query.or(clauses.join(','))
    }
    if (filters.province) query = query.ilike('province', filters.province)
    if (filters.city) query = query.ilike('city', filters.city)
    if (filters.bounds) {
      const { minLatitude, maxLatitude, minLongitude, maxLongitude } = filters.bounds
      query = query.gte('latitude', minLatitude).lte('latitude', maxLatitude)
        .gte('longitude', minLongitude).lte('longitude', maxLongitude)
    }
    if (filters.withoutCoordinatesForCity) {
      query = query.ilike('city', filters.withoutCoordinatesForCity).or('latitude.is.null,longitude.is.null')
    }

    if (filters.sortBy === 'Harga terendah') query = query.order('ticket_price', { ascending: true, nullsFirst: false })
    else if (filters.sortBy === 'Harga tertinggi') query = query.order('ticket_price', { ascending: false, nullsFirst: false })
    else query = query.order('name', { ascending: true })

    return query
  }

  const fields = imageAttributionColumnsAvailable === false ? LEGACY_DESTINATION_FIELDS : DESTINATION_FIELDS
  let result = await makeQuery(fields).range(offset, offset + limit - 1)
  if (result.error && fields === DESTINATION_FIELDS && isMissingImageAttributionColumns(result.error)) {
    imageAttributionColumnsAvailable = false
    result = await makeQuery(LEGACY_DESTINATION_FIELDS).range(offset, offset + limit - 1)
  } else if (!result.error) {
    imageAttributionColumnsAvailable = fields === DESTINATION_FIELDS
  }
  if (result.error) throw result.error
  return result.data || []
}

async function readPlannerPages(filters) {
  const rows = []
  for (let offset = 0; offset < PLANNER_MAX_CANDIDATES; offset += PLANNER_PAGE_SIZE) {
    const page = await readPublishedPage(filters, { offset, limit: PLANNER_PAGE_SIZE })
    rows.push(...page)
    if (page.length < PLANNER_PAGE_SIZE) break
  }
  return rows
}

function normalizeRadius(radiusKm) {
  return Math.min(250, Math.max(1, Number(radiusKm) || 90))
}

function makeBounds(latitude, longitude, radiusKm) {
  const lat = Number(latitude)
  const lon = Number(longitude)
  const latDelta = radiusKm / 110.574
  const lonDelta = Math.min(180, radiusKm / Math.max(1, 111.32 * Math.cos((lat * Math.PI) / 180)))
  return {
    minLatitude: Math.max(-90, lat - latDelta),
    maxLatitude: Math.min(90, lat + latDelta),
    minLongitude: Math.max(-180, lon - lonDelta),
    maxLongitude: Math.min(180, lon + lonDelta),
  }
}

const destinationService = {
  async getCategories() {
    const client = requireSupabase()
    const { data, error } = await client
      .from('destination_categories')
      .select('id, name, slug, description')
      .order('name', { ascending: true })
    if (error) throw error
    return data || []
  },

  async getDestinations(filters = {}) {
    const pageSize = 200
    const requestedLimit = Number(filters.limit) > 0 ? Math.min(1000, Number(filters.limit)) : Infinity
    let offset = Math.max(0, Number(filters.offset) || 0)
    const results = []

    while (results.length < requestedLimit && offset < 10000) {
      const page = await readPublishedPage(filters, { offset, limit: pageSize })
      const withCategories = await attachCategories(page)
      let matching = withCategories

      if (filters.category && filters.category !== 'Semua') {
        const category = String(filters.category).toLocaleLowerCase('id-ID')
        matching = matching.filter((destination) => destination.categories.some((item) =>
          item.name.toLocaleLowerCase('id-ID') === category || item.slug?.toLocaleLowerCase('id-ID') === category,
        ))
      }

      if (filters.budget) {
        const priceFilters = {
          '< Rp100.000': (price) => price != null && price < 100000,
          'Rp100.000 - Rp500.000': (price) => price != null && price >= 100000 && price <= 500000,
          'Rp500.000 - Rp1.000.000': (price) => price != null && price > 500000 && price <= 1000000,
          '> Rp1.000.000': (price) => price != null && price > 1000000,
        }
        if (priceFilters[filters.budget]) matching = matching.filter((destination) => priceFilters[filters.budget](destination.ticket_price))
      }

      results.push(...matching)
      offset += page.length
      if (page.length < pageSize) break
    }
    return Number.isFinite(requestedLimit) ? results.slice(0, requestedLimit) : results
  },

  async getProvinces() {
    const client = requireSupabase()
    const values = new Set()
    const pageSize = 1000
    for (let offset = 0; offset < 10000; offset += pageSize) {
      const { data, error } = await client
        .from('destinations')
        .select('province')
        .eq('is_published', true)
        .order('province', { ascending: true })
        .range(offset, offset + pageSize - 1)
      if (error) throw error
      for (const row of data || []) {
        if (row.province) values.add(row.province)
      }
      if (!data || data.length < pageSize) break
    }
    return [...values].sort((a, b) => a.localeCompare(b, 'id'))
  },
  async searchPlannerDestinations(search = '', limit = 40) {
    const boundedLimit = Math.min(100, Math.max(1, Number(limit) || 40))
    const rows = await readPublishedPage({ search }, { limit: boundedLimit, offset: 0 })
    return attachCategories(rows)
  },

  async getPlannerCandidates(context, radiusKm = 90) {
    const city = String(context?.city || '').trim()
    if (!isValidCoordinate(context?.latitude, context?.longitude) && !city) {
      throw new Error('Choose a city or an area with coordinates to plan a local trip.')
    }

    const radius = normalizeRadius(radiusKm)
    let rows
    if (isValidCoordinate(context.latitude, context.longitude)) {
      rows = await readPlannerPages({
        bounds: makeBounds(context.latitude, context.longitude, radius),
      })

      if (city) {
        const unmapped = await readPublishedPage(
          { withoutCoordinatesForCity: city },
          { limit: 50, offset: 0 },
        )
        const seen = new Set(rows.map((destination) => destination.id))
        rows.push(...unmapped.filter((destination) => !seen.has(destination.id)))
      }

      const normalizedCity = city.toLocaleLowerCase('id-ID')
      rows = rows.filter((destination) => {
        if (!isValidCoordinate(destination.latitude, destination.longitude)) {
          return destination.city?.toLocaleLowerCase('id-ID') === normalizedCity
        }
        return calculateDistanceKm(
          context.latitude,
          context.longitude,
          destination.latitude,
          destination.longitude,
        ) <= radius
      })
    } else {
      // With no destination coordinates, stay within the exact city/regency rather than guessing a province-wide center.
      rows = await readPlannerPages({ city })
    }

    return attachCategories(rows)
  },

  async getDestinationByIdOrSlug(idOrSlug) {
    const client = requireSupabase()
    const looksLikeUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(idOrSlug))
    const fields = looksLikeUuid ? ['id', 'slug'] : ['slug', 'id']
    for (const field of fields) {
      const fields = imageAttributionColumnsAvailable === false ? LEGACY_DESTINATION_FIELDS : DESTINATION_FIELDS
      let result = await client
        .from('destinations')
        .select(fields)
        .eq(field, idOrSlug)
        .eq('is_published', true)
        .maybeSingle()
      if (result.error && fields === DESTINATION_FIELDS && isMissingImageAttributionColumns(result.error)) {
        imageAttributionColumnsAvailable = false
        result = await client
          .from('destinations')
          .select(LEGACY_DESTINATION_FIELDS)
          .eq(field, idOrSlug)
          .eq('is_published', true)
          .maybeSingle()
      } else if (!result.error) {
        imageAttributionColumnsAvailable = fields === DESTINATION_FIELDS
      }
      if (result.error) throw result.error
      if (result.data) return (await attachCategories([result.data]))[0]
    }
    return null
  },
}

export default destinationService
