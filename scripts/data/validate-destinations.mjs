import { buildDataQualityReport, normalizeDestinations, readDestinationFile } from './pipeline.mjs'

const args = process.argv.slice(2)
const inputIndex = args.indexOf('--input')
const input = inputIndex >= 0 ? args[inputIndex + 1] : null
if (!input) throw new Error('Usage: node scripts/data/validate-destinations.mjs --input FILE.csv|FILE.json')
const normalized = normalizeDestinations(await readDestinationFile(input))
const report = buildDataQualityReport(normalized)
console.log(JSON.stringify(report, null, 2))
if (report.validationErrors.length) process.exitCode = 1
