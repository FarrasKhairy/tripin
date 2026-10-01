# Destination data workflow

## Current production source

The application reads published destinations and category relations from the existing Supabase `destinations`, `destination_categories`, and `destination_category_relations` tables. The browser does not use fixture destinations as a fallback. An empty response stays empty; connection/query failures are shown as errors. The database remains the production source of truth.

The repository currently has no checked-in destination import dataset. Files under legacy mock/fallback paths are not import sources and must not be treated as production coverage. No Indonesia-wide coverage claim can be made until the connected database report is run.

## Input and normalization

The local pipeline accepts CSV or JSON. CSV category values can contain `|` or `;` separated labels; JSON accepts `category` or a `categories` array. Empty optional values become `null`. It normalizes common province aliases, city casing, slugs, coordinate numbers, Rupiah ticket prices, and category aliases. It never fills missing coordinates, prices, hours, descriptions, or images with invented values.

Supported categories include Nature, Beach, Mountain, Waterfall, Culture, History, Heritage, Religious, Family, Adventure, Food, Shopping, Urban, Wildlife, Marine, Photography, and Relaxation. Category links are resolved against the existing Supabase category table; the importer does not silently create new categories.

The existing destinations schema has no confirmed provenance columns. `source`, `source_url`, `last_verified_at`, and `data_quality` are retained in normalized files for review but are not sent to the database. No migration was created. If persistent provenance becomes necessary, agree on the minimal schema extension before adding a migration.

## Commands

```powershell
npm run data:normalize -- --input .\data\destinations.csv --output .\data\destinations.normalized.json
npm run data:validate -- --input .\data\destinations.normalized.json
npm run data:report -- --input .\data\destinations.normalized.json
npm run data:import -- --input .\data\destinations.normalized.json
npm run data:import -- --input .\data\destinations.normalized.json --allow-duplicate-candidates --apply
npm run data:report -- --database
```

The importer is a dry run unless `--apply` is supplied. The scripts read existing shell values first and then `.env.local`/`.env` without printing them. Before database import, set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` locally if not already present. A database report can use the project anon key for published-only coverage; unpublished counts require the service role key. Never put a service role key in frontend code, Vite variables, or a checked-in file. Keep RLS as configured; the local import tool uses a server-side key only for this explicit administrative operation.

`--allow-duplicate-candidates` is a review acknowledgement; it does not delete records. Exact duplicate slugs and invalid rows stop the import. Candidate duplicates use normalized name + city + province; same rounded coordinates are separately reported as suspicious. The importer uses batches of 100, retries transient failures, checks existing category links before insertion, and prints partial batch status. Supabase REST writes are not a multi-table transaction: if a later batch fails, prior upserts remain committed and can be safely retried when `slug` has a unique constraint. The importer does not delete or roll back pre-existing destination rows.

## Validation and coverage reports

The validation report includes required name/province checks, coordinate ranges, invalid prices/categories, repeated slug groups, normalized name-city-province candidates, and suspicious identical coordinate pairs. Duplicate findings require human review; the pipeline never deletes duplicates.

The data-quality report shows counts by province and city, coordinate and category coverage by province, missing coordinates/prices/images/categories, duplicate candidates, invalid coordinates, and unpublished destinations. `--database` reports the actual connected table using the local anon key for published rows or the service role key for all rows. File reports describe only the provided file. Neither report implies all Indonesian provinces are covered.

## Adding and updating records

Use a source you are permitted to use. Prefer concise factual descriptions written for Tripin, and retain source/provenance details alongside the import file. Leave unknown data blank. Review validation output and duplicate candidates, then run a dry import. Apply only after review. Existing records update by slug through Supabase upsert; this depends on a unique constraint on `destinations.slug`. If the database does not have that constraint, the importer reports the database error and no schema is changed automatically.

## Current connected database snapshot

Snapshot from `npm run data:report -- --database` on 2026-09-30:

| Province | Published destinations | Coordinates | Categories |
| --- | ---: | ---: | ---: |
| Bali | 2 | 2 | 2 |
| DI Yogyakarta | 1 | 1 | 1 |
| Jawa Barat | 2 | 2 | 2 |
| Jawa Tengah | 1 | 1 | 1 |
| Jawa Timur | 1 | 1 | 1 |
| Papua Barat Daya | 1 | 1 | 1 |
| **Total** | **8** | **8** | **8** |

All 8 published rows currently have coordinates, ticket prices, and category relations. All 8 lack images. No duplicate candidates or invalid coordinates were found. Unpublished-row count is unavailable to the anon-key report. The destination fields queried by the app do not include a rating or review-count field, so the UI must display ratings as unavailable until a trustworthy rating source and schema are agreed.

## National source review

The [data.go.id Sisparnas attraction dataset](https://data.go.id/dataset/dataset/dtw) describes registered tourist-attraction points and marks the resource as open, while also warning that it is still in the process of meeting Satu Data Indonesia principles. Its visible metadata does not state a specific reuse license. Do not bulk-import it until its redistribution terms are confirmed. Its listing does not provide ratings or licensed image metadata.

The [Sisparnas homepage](https://sisparnas.kemenpar.go.id/) shows aggregate 2024 administrative counts for nature, artificial, and cultural attractions; these totals are not a reviewed row-level import file and do not establish Tripin's coverage.

For future images, verify each Wikimedia Commons file's individual license and attribution requirements before adding it; the [Commons reuse guidance](https://commons.wikimedia.org/wiki/Commons:Reusing_content_outside_Wikimedia) states that requirements vary by file. Ratings also need a separately licensed source or Tripin's own review system. Do not copy ratings or images from Google Maps.

## Initial Indonesia seed file

The project now includes data/indonesia-destinations.json and a reproducible fetch command. Run npm run data:fetch-indonesia to refresh it, then npm run data:validate -- --input .\data\indonesia-destinations.json and npm run data:report -- --input .\data\indonesia-destinations.json before any import.

The source currently contributes 120 Indonesia candidates across Badung, Balikpapan, Denpasar, Jakarta, and Medan. This is only a starter subset and is not an Indonesia-wide inventory. The current generated file has 118 rows with coordinates and province data; 2 rows lack coordinates and remain unpublished. The 120 rows have no images or ticket prices, and the source does not provide Google Maps ratings. Those values remain null. Fifty-three rows currently lack a mapped category.

Candidate names and selection are from Audiala Places, licensed CC BY 4.0, with the required credit “Data by Audiala — https://audiala.com”. Coordinates are refreshed from Wikidata structured data, which is CC0. The dataset file contains this provenance and limitations in its metadata. Unknown fields are not filled with estimates. The public catalog has not been updated from this file; the file must be reviewed and imported through the server-side pipeline. The current destination database schema does not persist row-level provenance, so application-level attribution and provenance storage must be resolved before publishing this source in the public catalog.
