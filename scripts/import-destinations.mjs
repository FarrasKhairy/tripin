import { createClient } from '@supabase/supabase-js'
import { destinationDatabasePayload, loadLocalEnvironment, normalizeCategory, normalizeDestinations, readDestinationFile, validateDestinations } from './data/pipeline.mjs'

await loadLocalEnvironment()

const args = process.argv.slice(2)
const flagValue = (flag) => { const index = args.indexOf(flag); return index >= 0 ? args[index + 1] : null }
const input = flagValue('--input')
if (!input) throw new Error('Usage: npm run data:import -- --input FILE.csv|FILE.json [--apply] [--allow-duplicate-candidates]')

const normalized = normalizeDestinations(await readDestinationFile(input))
const validation = validateDestinations(normalized)
const report = { totalRecords: validation.totalRecords, validRecords: validation.validRecords, errors: validation.errors, duplicateCandidates: validation.duplicateCandidates, suspiciousDuplicateCoordinates: validation.suspiciousDuplicateCoordinates }
console.log(JSON.stringify(report, null, 2))
if (validation.errors.length) throw new Error('Import stopped: fix validation errors before importing.')
if (validation.duplicateCandidates.length && !args.includes('--allow-duplicate-candidates')) {
  throw new Error('Import stopped: review duplicate candidates, then rerun with --allow-duplicate-candidates if both records should remain.')
}
if (!args.includes('--apply')) {
  console.log('Dry run only. Review duplicate candidates and source data; pass --apply to write to Supabase.')
  process.exit(0)
}

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) throw new Error('Import requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the local environment. Do not place service credentials in frontend variables or source files.')
const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
const retry = async (label, operation, attempts = 3) => {
  let lastError
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try { return await operation() }
    catch (error) {
      lastError = error
      if (attempt < attempts) await new Promise((resolve) => setTimeout(resolve, 300 * (2 ** (attempt - 1))))
    }
  }
  throw new Error(`${label} failed after ${attempts} attempts: ${lastError?.message || lastError}`)
}
const chunks = (items, size) => Array.from({ length: Math.ceil(items.length / size) }, (_, index) => items.slice(index * size, (index + 1) * size))
const categoryResult = await retry('Load destination categories', () => client.from('destination_categories').select('id,name,slug'))
if (categoryResult.error) throw new Error(`Cannot load destination categories: ${categoryResult.error.message}`)
const categoryByName = new Map()
for (const category of categoryResult.data || []) {
  categoryByName.set(normalizeCategory(category.name).toLocaleLowerCase('id-ID'), category.id)
  if (category.slug) categoryByName.set(normalizeCategory(category.slug).toLocaleLowerCase('id-ID'), category.id)
}
const categoryMisses = [...new Set(normalized.flatMap((row) => row.categories).filter((name) => !categoryByName.has(name.toLocaleLowerCase('id-ID'))))]
if (categoryMisses.length) throw new Error(`These categories are not present in destination_categories: ${categoryMisses.join(', ')}. Add them through the existing category admin process before import.`)

let imported = 0
let categoryLinks = 0
for (const [batchIndex, batch] of chunks(normalized, 100).entries()) {
  const result = await retry(`Destination batch ${batchIndex + 1}`, () => client.from('destinations')
    .upsert(batch.map(destinationDatabasePayload), { onConflict: 'slug' })
    .select('id,slug'))
  if (result.error) throw new Error(`Destination batch ${batchIndex + 1} failed. Earlier batches remain committed and can be retried safely if slug has a unique constraint: ${result.error.message}`)
  const rows = result.data || []
  imported += rows.length
  const idsBySlug = new Map(rows.map((row) => [row.slug, row.id]))
  const linkCandidates = batch.flatMap((record) => (record.categories || []).map((category) => ({ destination_id: idsBySlug.get(record.slug), category_id: categoryByName.get(category.toLocaleLowerCase('id-ID')) }))).filter((relation) => relation.destination_id && relation.category_id)
  for (const relationBatch of chunks(linkCandidates, 100)) {
    if (!relationBatch.length) continue
    const ids = [...new Set(relationBatch.map((relation) => relation.destination_id))]
    const existing = await retry('Read existing category relations', () => client.from('destination_category_relations').select('destination_id,category_id').in('destination_id', ids))
    if (existing.error) throw new Error(`Category relation lookup failed after destination upsert: ${existing.error.message}`)
    const existingKeys = new Set((existing.data || []).map((relation) => `${relation.destination_id}:${relation.category_id}`))
    const missing = relationBatch.filter((relation) => !existingKeys.has(`${relation.destination_id}:${relation.category_id}`))
    for (const writeBatch of chunks(missing, 100)) {
      if (!writeBatch.length) continue
      const inserted = await retry('Insert destination category relations', () => client.from('destination_category_relations').insert(writeBatch))
      if (inserted.error) throw new Error(`Category relation insert failed after destination upsert. Re-run after fixing the relation schema/policy: ${inserted.error.message}`)
      categoryLinks += writeBatch.length
    }
  }
  console.log(`Batch ${batchIndex + 1}/${chunks(normalized, 100).length}: upserted ${rows.length} destinations`)
}
console.log(JSON.stringify({ imported, categoryLinks, note: 'Input provenance metadata is retained in the source file; current destinations schema has no confirmed provenance columns.' }, null, 2))
