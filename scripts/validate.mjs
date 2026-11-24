// Checks the data files for structure and internal consistency. No dependencies.
// Run: node scripts/validate.mjs
import { readFileSync, existsSync } from 'node:fs'

const errors = []
const fail = (msg) => errors.push(msg)
const load = (f) => JSON.parse(readFileSync(`data/${f}.json`, 'utf8'))
const isoDate = /^\d{4}-\d{2}-\d{2}$/
const bilingual = (v, where) => {
  if (!v || typeof v.de !== 'string' || typeof v.en !== 'string' || !v.de.trim() || !v.en.trim()) fail(`${where}: needs non-empty "de" and "en"`)
}
const checkMeta = (m, f) => {
  for (const k of ['title', 'version', 'as_of', 'sources', 'license', 'disclaimer']) if (!(k in m)) fail(`${f}: meta.${k} missing`)
  if (!isoDate.test(m.as_of)) fail(`${f}: meta.as_of is not YYYY-MM-DD`)
}

const files = ['obligations', 'deadlines', 'annex-iii', 'prohibited-practices', 'fines']
for (const f of files) {
  if (!existsSync(`data/${f}.json`)) fail(`data/${f}.json missing`)
  if (!existsSync(`data/${f}.yaml`)) fail(`data/${f}.yaml missing`)
}
if (errors.length) { console.error(errors.join('\n')); process.exit(1) }

const ROLES = new Set(['provider', 'deployer', 'all_operators', 'all_organisations', 'public_body', 'private_public_service_provider', 'distributor', 'importer', 'gpai_provider', 'gpai_provider_systemic_risk'])
const SCOPES = new Set(['general', 'annex_iii', 'annex_i', 'systems_placed_before_2026_08_02', 'legacy_gpai_models'])

const ob = load('obligations')
checkMeta(ob.meta, 'obligations')
const ids = new Set()
for (const o of ob.obligations) {
  if (ids.has(o.id)) fail(`obligations: duplicate id ${o.id}`)
  ids.add(o.id)
  if (!['obligation', 'recommendation'].includes(o.type)) fail(`obligations ${o.id}: unknown type`)
  for (const r of o.roles) if (!ROLES.has(r)) fail(`obligations ${o.id}: unknown role ${r}`)
  for (const a of o.applies_from) {
    if (!isoDate.test(a.date)) fail(`obligations ${o.id}: bad date ${a.date}`)
    if (!SCOPES.has(a.scope)) fail(`obligations ${o.id}: unknown scope ${a.scope}`)
  }
  if (o.type === 'obligation' && !o.applies_from.length) fail(`obligations ${o.id}: obligation without date`)
  bilingual(o.duty, `obligations ${o.id}.duty`)
  bilingual(o.who, `obligations ${o.id}.who`)
}

const dl = load('deadlines')
checkMeta(dl.meta, 'deadlines')
let prev = ''
for (const d of dl.deadlines) {
  if (!isoDate.test(d.date)) fail(`deadlines ${d.id}: bad date`)
  if (d.date < prev) fail(`deadlines ${d.id}: not sorted by date`)
  prev = d.date
  bilingual(d.title, `deadlines ${d.id}.title`)
  bilingual(d.description, `deadlines ${d.id}.description`)
}
// every obligation date must be a known application date
const known = new Set(dl.deadlines.map((d) => d.date))
for (const o of ob.obligations) for (const a of o.applies_from) if (!known.has(a.date)) fail(`obligations ${o.id}: date ${a.date} is not in deadlines.json`)

const an = load('annex-iii')
checkMeta(an.meta, 'annex-iii')
if (an.areas.length !== 8) fail(`annex-iii: expected 8 areas, found ${an.areas.length}`)
const cases = an.areas.reduce((n, a) => n + a.use_cases.length, 0)
if (cases !== 25) fail(`annex-iii: expected 25 use cases, found ${cases}`)
for (const a of an.areas) {
  bilingual(a.area, `annex-iii point ${a.point}.area`)
  for (const c of a.use_cases) for (const k of ['description', 'example', 'not_covered_if']) bilingual(c[k], `annex-iii ${c.point}.${k}`)
}

const pp = load('prohibited-practices')
checkMeta(pp.meta, 'prohibited-practices')
for (const p of pp.practices) {
  if (!isoDate.test(p.applies_from)) fail(`prohibited-practices ${p.reference}: bad date`)
  bilingual(p.title, `prohibited-practices ${p.reference}.title`)
  bilingual(p.description, `prohibited-practices ${p.reference}.description`)
}

const fi = load('fines')
checkMeta(fi.meta, 'fines')
for (const t of fi.tiers) {
  if (!(t.max_amount_eur > 0) || !(t.max_percent_worldwide_turnover > 0)) fail(`fines tier ${t.tier}: amounts missing`)
  bilingual(t.infringement, `fines tier ${t.tier}.infringement`)
}

for (const f of ['deadlines.ics', 'deadlines.de.ics']) {
  if (!existsSync(`data/${f}`)) { fail(`data/${f} missing, run node scripts/build-ics.mjs`); continue }
  const ics = readFileSync(`data/${f}`, 'utf8')
  const n = (ics.match(/BEGIN:VEVENT/g) || []).length
  if (n !== dl.deadlines.length) fail(`data/${f}: ${n} events, expected ${dl.deadlines.length}`)
}

if (errors.length) {
  console.error(`${errors.length} problem(s):\n` + errors.join('\n'))
  process.exit(1)
}
console.log(`ok: ${ob.obligations.length} obligations, ${dl.deadlines.length} dates, ${an.areas.length} Annex III areas with ${cases} use cases, ${pp.practices.length} prohibited practices, ${fi.tiers.length} fine tiers`)
