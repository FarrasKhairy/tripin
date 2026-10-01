import { writeFile } from 'node:fs/promises'
import { normalizeDestinations, readDestinationFile } from './pipeline.mjs'

const args = process.argv.slice(2)
const value = (flag) => args[args.indexOf(flag) + 1]
const input = value('--input')
const output = value('--output')
if (!input || !output) throw new Error('Usage: node scripts/data/normalize-destinations.mjs --input FILE.csv|FILE.json --output NORMALIZED.json')
const records = normalizeDestinations(await readDestinationFile(input))
await writeFile(output, `${JSON.stringify(records, null, 2)}\n`, 'utf8')
console.log(`Normalized ${records.length} destination records to ${output}`)
