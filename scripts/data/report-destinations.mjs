import { createClient } from '@supabase/supabase-js'
import { buildDataQualityReport, loadLocalEnvironment, normalizeDestinations, readDestinationFile } from './pipeline.mjs'

await loadLocalEnvironment()

const args = process.argv.slice(2)
const flagValue = (flag) => { const index = args.indexOf(flag); return index >= 0 ? args[index + 1] : null }
const input = flagValue('--input')
const databaseMode = args.includes('--database')
let records
let canSeeUnpublished = false
if (databaseMode) {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
  const key = serviceKey || anonKey
  canSeeUnpublished = Boolean(serviceKey)
  if (!url || !key) throw new Error('Database report requires a Supabase URL and either a local anon key or service role key.')
  const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
  records = []
  for (let offset = 0; offset < 100000; offset += 1000) {
    let query = client.from('destinations')
      .select('name, slug, province, city, description, image_url, ticket_price, latitude, longitude, opening_hours, address, is_published, destination_category_relations(category:destination_categories(id,name,slug))')
    if (!canSeeUnpublished) query = query.eq('is_published', true)
    const { data, error } = await query.range(offset, offset + 999)
    if (error) throw new Error(`Database report failed at row ${offset}: ${error.message}`)
    records.push(...(data || []).map((row) => ({ ...row, categories: (row.destination_category_relations || []).map((relation) => relation.category?.name).filter(Boolean) })))
    if (!data || data.length < 1000) break
  }
} else {
  if (!input) throw new Error('Usage: npm run data:report -- --input FILE.csv|FILE.json, or --database with local Supabase environment values')
  records = normalizeDestinations(await readDestinationFile(input))
}
const report = buildDataQualityReport(records)
if (databaseMode && !canSeeUnpublished) {
  report.unpublishedDestinations = null
  report.publicationScope = 'Only published destinations visible to the local anon key; unpublished count is unavailable without SUPABASE_SERVICE_ROLE_KEY.'
} else if (databaseMode) {
  report.publicationScope = 'All destination rows visible with the local service role key.'
}
console.log(JSON.stringify(report, null, 2))
