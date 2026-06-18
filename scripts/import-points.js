/**
 * Import YNSA point data from the Excel workbook into ynsa.json.
 *
 * Usage:  node scripts/import-points.js
 *
 * Each sheet must follow the two-column "Column | Notes" vertical format:
 *   Row 1  →  header  (Column | Notes)  — skipped
 *   Row 2+ →  field   | value
 *
 * Fields treated as arrays (split on newlines): indications, tags
 * All other fields are stored as trimmed strings.
 *
 * The script upserts by `id`: updates an existing entry or appends a new one.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import xlsx from 'xlsx'

const __dirname = dirname(fileURLToPath(import.meta.url))
const EXCEL_PATH = join(__dirname, '../../docs/YNSA points.xlsx')
const JSON_PATH  = join(__dirname, '../src/data/points/ynsa.json')

// indications: split by newline only (sentences may contain commas)
// tags: split by newline AND comma
const NEWLINE_ONLY_FIELDS = new Set(['indications'])
const NEWLINE_AND_COMMA_FIELDS = new Set(['tags'])

function parseSheet(ws) {
  const rows = xlsx.utils.sheet_to_json(ws, { header: 1, defval: '' })
  // rows[0] is the header row ["Column", "Notes"] — skip it
  const point = {}
  for (let i = 1; i < rows.length; i++) {
    const field = String(rows[i][0] ?? '').trim()
    const raw   = String(rows[i][1] ?? '').trim()
    if (!field || !raw) continue

    if (NEWLINE_ONLY_FIELDS.has(field)) {
      point[field] = raw.split('\n').map(s => s.trim()).filter(Boolean)
    } else if (NEWLINE_AND_COMMA_FIELDS.has(field)) {
      point[field] = raw
        .split('\n')
        .flatMap(line => line.split(','))
        .map(s => s.trim())
        .filter(Boolean)
    } else {
      point[field] = raw
    }
  }
  return point
}

// ── Load workbook ──────────────────────────────────────────────────────────────
if (!existsSync(EXCEL_PATH)) {
  console.error(`Excel file not found: ${EXCEL_PATH}`)
  process.exit(1)
}

const wb = xlsx.readFile(EXCEL_PATH)
const existing = JSON.parse(readFileSync(JSON_PATH, 'utf8'))

let added = 0, updated = 0

for (const sheetName of wb.SheetNames) {
  const ws = wb.Sheets[sheetName]
  const point = parseSheet(ws)

  if (!point.id) {
    console.log(`  skip "${sheetName}" — no id field`)
    continue
  }

  const idx = existing.points.findIndex(p => p.id === point.id)
  if (idx >= 0) {
    existing.points[idx] = point   // full replace — Excel is source of truth
    console.log(`  updated  ${point.id}`)
    updated++
  } else {
    existing.points.push(point)
    console.log(`  added    ${point.id}`)
    added++
  }
}

writeFileSync(JSON_PATH, JSON.stringify(existing, null, 2))
console.log(`\nDone — ${added} added, ${updated} updated.`)
