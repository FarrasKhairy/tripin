import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseCsv, slugify } from './pipeline.mjs'
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..')
const output=path.join(root,'data','indonesia-destinations.json')
const source='https://raw.githubusercontent.com/audiala/open-data/main/data/audiala-places.csv'
const api='https://www.wikidata.org/w/api.php'
const cities=new Map([['badung','Bali'],['balikpapan','Kalimantan Timur'],['denpasar','Bali'],['jakarta','DKI Jakarta'],['medan','Sumatera Utara']])
const categoryMap={'amusement-park':['Family'],cathedral:['Culture','History'],church:['Culture','History'],garden:['Nature'],monastery:['Culture','History'],monument:['Culture','History'],mosque:['Culture','History'],museum:['Culture','History'],palace:['Culture','History'],park:['Nature'],statue:['Culture','History'],temple:['Culture','History'],waterfall:['Nature'],zoo:['Nature']}
const get=async url=>{const r=await fetch(url,{headers:{'User-Agent':'TripinDestinationData/1.0'}});if(!r.ok)throw new Error('Fetch failed: HTTP '+r.status);return r.text()}
const rows=parseCsv(await get(source)).filter(r=>r.country_iso2==='ID'&&r.wikidata_id)
if(!rows.length)throw new Error('No Indonesia rows in licensed source')
const ids=[...new Set(rows.map(r=>r.wikidata_id))]
const entities=new Map()
for(let i=0;i<ids.length;i+=50){const u=new URL(api);u.searchParams.set('action','wbgetentities');u.searchParams.set('ids',ids.slice(i,i+50).join('|'));u.searchParams.set('props','labels|claims');u.searchParams.set('languages','id|en');u.searchParams.set('format','json');const j=JSON.parse(await get(u));for(const [id,e] of Object.entries(j.entities||{}))entities.set(id,e);if(i+50<ids.length)await new Promise(r=>setTimeout(r,500))}
const destinations=rows.map(r=>{const e=entities.get(r.wikidata_id);const p=e?.claims?.P625?.[0]?.mainsnak?.datavalue?.value;const city=r.city_en?.trim()||null;const province=city?cities.get(city.toLowerCase())||null:null;const name=e?.labels?.id?.value||e?.labels?.en?.value||r.name_en?.trim()||'';const slug=slugify([name,city].filter(Boolean).join(' '))+'-'+r.wikidata_id.toLowerCase();const latitude=Number.isFinite(p?.latitude)?p.latitude:null;const longitude=Number.isFinite(p?.longitude)?p.longitude:null;return {name,slug,province,city,description:null,image_url:null,ticket_price:null,latitude,longitude,opening_hours:null,address:null,categories:categoryMap[r.category]||[],is_published:Boolean(province&&latitude!=null&&longitude!=null),source:'Wikidata CC0; candidate list from Audiala Places CC BY 4.0',source_url:'https://www.wikidata.org/wiki/'+r.wikidata_id,last_verified_at:new Date().toISOString().slice(0,10),data_quality:'Partial dataset; coordinates from Wikidata when present. Unknown price, image, hours, address, and rating left blank.'}}).filter(r=>r.name)
const visible=destinations.filter(r=>r.is_published)
const dataset={generated_at:new Date().toISOString(),coverage:'Partial Indonesia seed; not a complete national destination inventory.',candidate_source:'Audiala Places, Indonesia subset from 2026-09-28 release',candidate_source_url:source,candidate_source_license:'CC BY 4.0',required_attribution:'Data by Audiala - https://audiala.com',coordinate_source:'Wikidata structured data (CC0); unavailable coordinates remain null.',coordinate_source_url:'https://www.wikidata.org/wiki/Wikidata:Copyright',indonesia_candidates:destinations.length,publishable_candidates:visible.length,provinces:[...new Set(visible.map(r=>r.province))].sort(),cities:[...new Set(visible.map(r=>r.city))].sort(),limitations:'Source lists 120 Indonesia places across five cities and states it is not exhaustive. It has no Google Maps rating, ticket price, or licensed image data for Tripin; those fields remain null.',destinations}
await mkdir(path.dirname(output),{recursive:true})
await writeFile(output,JSON.stringify(dataset,null,2)+String.fromCharCode(10),'utf8')
console.log(JSON.stringify({output:path.relative(root,output),candidateRecords:destinations.length,publishableCandidates:visible.length,provinces:dataset.provinces,cities:dataset.cities,missingCoordinates:destinations.filter(r=>r.latitude==null||r.longitude==null).length,missingImages:destinations.length,missingPrices:destinations.filter(r=>r.ticket_price==null).length},null,2))
