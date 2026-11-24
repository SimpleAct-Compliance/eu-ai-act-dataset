// Writes data/deadlines.ics (English) and data/deadlines.de.ics (German) from data/deadlines.json.
// No dependencies. Run: node scripts/build-ics.mjs
import { readFileSync, writeFileSync } from 'node:fs'

const { meta, deadlines } = JSON.parse(readFileSync('data/deadlines.json', 'utf8'))

const esc = (s) => s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n')
// RFC 5545: lines longer than 75 octets are folded with CRLF + space
function fold(line) {
  const bytes = Buffer.from(line, 'utf8')
  if (bytes.length <= 75) return line
  const out = []
  let start = 0
  while (start < bytes.length) {
    let end = Math.min(start + (out.length ? 74 : 75), bytes.length)
    while (end < bytes.length && (bytes[end] & 0xc0) === 0x80) end-- // do not split UTF-8 sequences
    out.push(bytes.subarray(start, end).toString('utf8'))
    start = end
  }
  return out.join('\r\n ')
}
const nextDay = (iso) => {
  const d = new Date(`${iso}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + 1)
  return d.toISOString().slice(0, 10).replace(/-/g, '')
}

function calendar(lang) {
  const name = lang === 'de' ? 'EU AI Act: Fristen' : 'EU AI Act: application dates'
  const stamp = `${meta.as_of.replace(/-/g, '')}T000000Z`
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SimpleAct//eu-ai-act-dataset//EN',
    'CALSCALE:GREGORIAN',
    `X-WR-CALNAME:${esc(name)}`,
  ]
  for (const d of deadlines) {
    const basis = lang === 'de' ? `Rechtsgrundlage: ${d.legal_basis.de}` : `Legal basis: ${d.legal_basis.en}`
    lines.push(
      'BEGIN:VEVENT',
      `UID:eu-ai-act-${d.id}-${d.date}@simpleact.de`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${d.date.replace(/-/g, '')}`,
      `DTEND;VALUE=DATE:${nextDay(d.date)}`,
      `SUMMARY:${esc(`EU AI Act: ${d.title[lang]}`)}`,
      `DESCRIPTION:${esc(`${d.description[lang]}\n\n${basis}`)}`,
      'TRANSP:TRANSPARENT',
      'END:VEVENT',
    )
  }
  lines.push('END:VCALENDAR')
  return lines.map(fold).join('\r\n') + '\r\n'
}

writeFileSync('data/deadlines.ics', calendar('en'))
writeFileSync('data/deadlines.de.ics', calendar('de'))
console.log(`wrote ${deadlines.length} events to data/deadlines.ics and data/deadlines.de.ics`)
