import { readFile } from 'node:fs/promises'
import path from 'node:path'

export async function loadLocalEnvironment(directory = process.cwd()) {
  for (const filename of ['.env.local', '.env']) {
    let contents
    try { contents = await readFile(path.join(directory, filename), 'utf8') } catch { continue }
    for (const line of contents.split(/\r?\n/)) {
      const match = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/)
      if (!match || process.env[match[1]] !== undefined) continue
      let value = match[2].trim()
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1)
      else value = value.replace(/\s+#.*$/, '')
      process.env[match[1]] = value
    }
  }
}

export const DESTINATION_CATEGORIES = [
  'Nature', 'Beach', 'Mountain', 'Waterfall', 'Culture', 'History', 'Heritage',
  'Religious', 'Family', 'Adventure', 'Food', 'Shopping', 'Urban', 'Wildlife',
  'Marine', 'Photography', 'Relaxation',
]

const provinceAliases = new Map([
  ['diy', 'DI Yogyakarta'], ['daerah istimewa yogyakarta', 'DI Yogyakarta'], ['jogjakarta', 'DI Yogyakarta'], ['yogyakarta', 'DI Yogyakarta'],
  ['dki', 'DKI Jakarta'], ['jakarta', 'DKI Jakarta'], ['daerah khusus jakarta', 'DKI Jakarta'],
  ['ntb', 'Nusa Tenggara Barat'], ['nusa tenggara barat', 'Nusa Tenggara Barat'],
  ['ntt', 'Nusa Tenggara Timur'], ['nusa tenggara timur', 'Nusa Tenggara Timur'],
  ['babel', 'Kepulauan Bangka Belitung'], ['bangka belitung', 'Kepulauan Bangka Belitung'], ['kepulauan bangka belitung', 'Kepulauan Bangka Belitung'],
  ['kepri', 'Kepulauan Riau'], ['kepulauan riau', 'Kepulauan Riau'],
  ['aceh', 'Aceh'], ['nanggroe aceh darussalam', 'Aceh'],
  ['papua barat daya', 'Papua Barat Daya'], ['papua pegunungan', 'Papua Pegunungan'], ['papua selatan', 'Papua Selatan'], ['papua tengah', 'Papua Tengah'],
])

const categoryAliases = new Map([
  ['alam', 'Nature'], ['nature', 'Nature'], ['pantai', 'Beach'], ['beach', 'Beach'],
  ['gunung', 'Mountain'], ['mountain', 'Mountain'], ['air terjun', 'Waterfall'], ['waterfall', 'Waterfall'],
  ['budaya', 'Culture'], ['culture', 'Culture'], ['sejarah', 'History'], ['history', 'History'],
  ['cagar budaya', 'Heritage'], ['heritage', 'Heritage'], ['warisan', 'Heritage'],
  ['religi', 'Religious'], ['keagamaan', 'Religious'], ['religious', 'Religious'],
  ['keluarga', 'Family'], ['family', 'Family'], ['petualangan', 'Adventure'], ['adventure', 'Adventure'],
  ['kuliner', 'Food'], ['makanan', 'Food'], ['food', 'Food'], ['belanja', 'Shopping'], ['shopping', 'Shopping'],
  ['kota', 'Urban'], ['urban', 'Urban'], ['satwa', 'Wildlife'], ['wildlife', 'Wildlife'],
  ['bahari', 'Marine'], ['marine', 'Marine'], ['fotografi', 'Photography'], ['photography', 'Photography'],
  ['relaksasi', 'Relaxation'], ['relaxation', 'Relaxation'],
])

const normalizeText = (value) => String(value ?? '').normalize('NFKC').trim().replace(/\s+/g, ' ')
const foldText = (value) => normalizeText(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('id-ID')

export function normalizeProvince(value) {
  const text = normalizeText(value)
  const alias = provinceAliases.get(foldText(text))
  if (alias) return alias
  return text.split(' ').map((part) => {
    if (/^(dki|di|ntb|ntt)$/i.test(part)) return part.toLocaleUpperCase('id-ID')
    return part.charAt(0).toLocaleUpperCase('id-ID') + part.slice(1).toLocaleLowerCase('id-ID')
  }).join(' ')
}

export function normalizeCity(value) {
  let text = normalizeText(value)
  if (!text) return null
  let prefix = ''
  const prefixMatch = text.match(/^(kabupaten|kab\.?|kota administrasi|kota)\s+(.+)$/i)
  if (prefixMatch) {
    prefix = /^kab/i.test(prefixMatch[1]) ? 'Kabupaten' : /^kota administrasi/i.test(prefixMatch[1]) ? 'Kota Administrasi' : 'Kota'
    text = prefixMatch[2]
  }
  const name = text.split(' ').map((part) => part.charAt(0).toLocaleUpperCase('id-ID') + part.slice(1).toLocaleLowerCase('id-ID')).join(' ')
  return [prefix, name].filter(Boolean).join(' ')
}

export function slugify(value) {
  return foldText(value).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

function toNumberOrNull(value) {
  if (value == null || normalizeText(value) === '') return null
  const normalized = typeof value === 'number' ? value : Number(String(value).trim())
  return Number.isFinite(normalized) ? normalized : null
}

export function parseTicketPrice(value) {
  if (value == null || normalizeText(value) === '') return null
  if (typeof value === 'number') return Number.isFinite(value) && value >= 0 ? Math.round(value) : null
  const digits = String(value).replace(/[^0-9-]/g, '')
  if (!digits || digits === '-') return null
  const amount = Number(digits)
  return Number.isSafeInteger(amount) && amount >= 0 ? amount : null
}

function parsePublished(value) {
  if (typeof value === 'boolean') return value
  const normalized = foldText(value)
  return ['true', '1', 'yes', 'ya', 'published', 'terbit'].includes(normalized)
}

export function normalizeCategory(value) {
  const label = typeof value === 'object' ? value.name ?? value.slug ?? '' : value
  const normalized = normalizeText(label)
  return categoryAliases.get(foldText(normalized)) || normalized
}

function categoryValues(record) {
  let values = record.categories ?? record.category ?? []
  if (typeof values === 'string') values = values.split(/[|;]/)
  if (!Array.isArray(values)) values = [values]
  return [...new Set(values.map(normalizeCategory).filter(Boolean))]
}

export function normalizeDestination(record = {}) {
  const name = normalizeText(record.name)
  const city = normalizeCity(record.city ?? record.city_regency ?? record.regency)
  const province = normalizeProvince(record.province)
  const explicitSlug = normalizeText(record.slug)
  const slug = slugify(explicitSlug || [name, city].filter(Boolean).join(' ')) || null
  const latitude = toNumberOrNull(record.latitude)
  const longitude = toNumberOrNull(record.longitude)
  const rawPrice = record.ticket_price
  const ticket_price = parseTicketPrice(rawPrice)
  const categories = categoryValues(record)
  const pipelineErrors = []

  if (normalizeText(record.latitude) && latitude == null) pipelineErrors.push('invalid latitude value')
  if (normalizeText(record.longitude) && longitude == null) pipelineErrors.push('invalid longitude value')
  if (normalizeText(rawPrice) && ticket_price == null) pipelineErrors.push('invalid ticket price')
  for (const category of categories) {
    if (!DESTINATION_CATEGORIES.includes(category)) pipelineErrors.push(`invalid category: ${category}`)
  }

  return {
    name,
    slug,
    province: province || null,
    city,
    description: normalizeText(record.description) || null,
    image_url: normalizeText(record.image_url) || null,
    ticket_price,
    latitude,
    longitude,
    opening_hours: normalizeText(record.opening_hours) || null,
    address: normalizeText(record.address) || null,
    is_published: parsePublished(record.is_published),
    categories,
    source: normalizeText(record.source) || null,
    source_url: normalizeText(record.source_url) || null,
    last_verified_at: normalizeText(record.last_verified_at) || null,
    data_quality: normalizeText(record.data_quality) || null,
    _pipelineErrors: pipelineErrors,
  }
}

export function normalizeDestinations(records = []) {
  return records.map(normalizeDestination)
}

export function parseCsv(text) {
  const rows = []
  let row = []
  let cell = ''
  let quoted = false
  const input = String(text).replace(/^\uFEFF/, '')
  for (let index = 0; index < input.length; index += 1) {
    const char = input[index]
    if (quoted) {
      if (char === '"' && input[index + 1] === '"') { cell += '"'; index += 1 }
      else if (char === '"') quoted = false
      else cell += char
    } else if (char === '"') quoted = true
    else if (char === ',') { row.push(cell); cell = '' }
    else if (char === '\n') {
      row.push(cell.replace(/\r$/, ''))
      if (row.some((value) => value.trim() !== '')) rows.push(row)
      row = []; cell = ''
    } else cell += char
  }
  row.push(cell.replace(/\r$/, ''))
  if (row.some((value) => value.trim() !== '')) rows.push(row)
  if (!rows.length) return []
  const headers = rows.shift().map((header) => foldText(header).replace(/[\s-]+/g, '_'))
  return rows.map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ''])))
}

export async function readDestinationFile(filePath) {
  const text = await readFile(filePath, 'utf8')
  const extension = path.extname(filePath).toLocaleLowerCase()
  if (extension === '.json') {
    const parsed = JSON.parse(text)
    const records = Array.isArray(parsed) ? parsed : parsed.destinations
    if (!Array.isArray(records)) throw new Error('JSON input must contain an array or a destinations array.')
    return records
  }
  if (extension === '.csv') return parseCsv(text)
  throw new Error('Input must be a .csv or .json file.')
}

function duplicateGroups(records, keyFn) {
  const groups = new Map()
  records.forEach((record, index) => {
    const key = keyFn(record)
    if (!key) return
    const indexes = groups.get(key) || []
    indexes.push(index + 1)
    groups.set(key, indexes)
  })
  return [...groups.entries()].filter(([, indexes]) => indexes.length > 1)
    .map(([key, recordNumbers]) => ({ key, recordNumbers }))
}

export function validateDestinations(records = []) {
  const normalized = records.map((record) => record._pipelineErrors ? record : normalizeDestination(record))
  const errors = []
  normalized.forEach((record, index) => {
    const recordNumber = index + 1
    if (!record.name) errors.push({ recordNumber, field: 'name', message: 'name is required' })
    if (!record.province) errors.push({ recordNumber, field: 'province', message: 'province is required' })
    if (!record.slug) errors.push({ recordNumber, field: 'slug', message: 'slug could not be generated' })
    for (const message of record._pipelineErrors || []) errors.push({ recordNumber, field: 'record', message })
    if (record.latitude != null && (record.latitude < -90 || record.latitude > 90)) errors.push({ recordNumber, field: 'latitude', message: 'latitude must be between -90 and 90' })
    if (record.longitude != null && (record.longitude < -180 || record.longitude > 180)) errors.push({ recordNumber, field: 'longitude', message: 'longitude must be between -180 and 180' })
    if (record.latitude === 0 && record.longitude === 0) errors.push({ recordNumber, field: 'coordinates', message: 'latitude and longitude cannot both be zero' })
  })

  const duplicateSlugs = duplicateGroups(normalized, (record) => record.slug)
  for (const duplicate of duplicateSlugs) {
    for (const recordNumber of duplicate.recordNumbers) errors.push({ recordNumber, field: 'slug', message: `duplicate slug ${duplicate.key}` })
  }
  const duplicateNames = duplicateGroups(normalized, (record) => record.name && record.province ? [foldText(record.name), foldText(record.city), foldText(record.province)].join('|') : '')
  const coordinateBuckets = duplicateGroups(normalized, (record) => record.latitude == null || record.longitude == null ? '' : `${record.latitude.toFixed(4)},${record.longitude.toFixed(4)}`)
  return {
    totalRecords: normalized.length,
    validRecords: normalized.length - new Set(errors.map((entry) => entry.recordNumber)).size,
    errors,
    duplicateSlugs,
    duplicateCandidates: duplicateNames,
    suspiciousDuplicateCoordinates: coordinateBuckets,
    normalizedRecords: normalized,
  }
}

export function buildDataQualityReport(records = []) {
  const validation = validateDestinations(records)
  const rows = validation.normalizedRecords
  const byProvince = new Map()
  const byCity = new Map()
  const hasValidCoordinates = (row) => row.latitude != null && row.longitude != null && row.latitude >= -90 && row.latitude <= 90 && row.longitude >= -180 && row.longitude <= 180 && !(row.latitude === 0 && row.longitude === 0)
  for (const row of rows) {
    const province = row.province || '(missing)'
    const cityKey = `${province} / ${row.city || '(missing)'}`
    const provinceStats = byProvince.get(province) || { province, destinations: 0, coordinates: 0, categories: 0 }
    provinceStats.destinations += 1
    provinceStats.coordinates += Number(hasValidCoordinates(row))
    provinceStats.categories += Number(row.categories?.length > 0)
    byProvince.set(province, provinceStats)
    byCity.set(cityKey, (byCity.get(cityKey) || 0) + 1)
  }
  const coordinateInvalidRows = new Set(validation.errors.filter((error) => ['latitude', 'longitude', 'coordinates'].includes(error.field) || error.message.includes('latitude') || error.message.includes('longitude')).map((error) => error.recordNumber))
  return {
    totalDestinations: rows.length,
    destinationsByProvince: [...byProvince.values()].sort((a, b) => a.province.localeCompare(b.province, 'id')),
    destinationsByCity: [...byCity.entries()].map(([city, count]) => ({ city, count })).sort((a, b) => a.city.localeCompare(b.city, 'id')),
    withoutCoordinates: rows.filter((row) => !hasValidCoordinates(row)).length,
    withoutTicketPrice: rows.filter((row) => row.ticket_price == null).length,
    withoutImage: rows.filter((row) => !row.image_url).length,
    duplicateCandidates: validation.duplicateCandidates.length,
    duplicateSlugGroups: validation.duplicateSlugs.length,
    invalidCoordinates: coordinateInvalidRows.size,
    missingCategory: rows.filter((row) => !row.categories?.length).length,
    unpublishedDestinations: rows.filter((row) => !row.is_published).length,
    provinceCoverage: [...byProvince.values()].map((row) => ({
      province: row.province,
      destinationCount: row.destinations,
      coordinateCoverage: row.destinations ? Math.round((row.coordinates / row.destinations) * 100) : 0,
      categoryCoverage: row.destinations ? Math.round((row.categories / row.destinations) * 100) : 0,
    })).sort((a, b) => a.province.localeCompare(b.province, 'id')),
    validationErrors: validation.errors,
    suspiciousDuplicateCoordinates: validation.suspiciousDuplicateCoordinates,
  }
}

export function destinationDatabasePayload(record) {
  return {
    name: record.name,
    slug: record.slug,
    province: record.province,
    city: record.city,
    description: record.description,
    image_url: record.image_url,
    ticket_price: record.ticket_price,
    latitude: record.latitude,
    longitude: record.longitude,
    opening_hours: record.opening_hours,
    address: record.address,
    is_published: record.is_published,
  }
}
