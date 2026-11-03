import { useEffect, useMemo, useRef, useState } from 'react'
import EarTcmSvg from '../../assets/diagrams/ear-chin-3.svg?react'
import { EAR_DESCRIPTION, EAR_FORMULAS, EAR_FORMULA_KEY_TERMS, EAR_FORMULA_SAFETY } from '../../data/earGuide'
import { MASTER_SVG_IDS, MASTER_LINE_IDS } from '../../data/earPoints'
import { SOURCES } from '../../data/sources'
import { GLASS_TRIGGER, GLASS_DROPDOWN } from '../ui/menuStyles'
import { pointCentre, TCM_VIEWBOX } from './HeadEarPoints'

const FILL = { position: 'absolute', inset: 0, width: '100%', height: '100%' }

// Text pages for the Auriculotherapy "Description" and "Formulas" tabs. They
// scroll on their own, outside ZoomableView.

const H2 = 'text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2'
const BODY = 'text-black dark:text-gray-300 text-sm leading-relaxed'

function Page({ children }) {
  return (
    <div className="h-full overflow-y-auto scroll-touch">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-950 rounded-lg shadow p-5 md:p-6">{children}</div>
    </div>
  )
}

function Source({ id }) {
  const src = SOURCES[id]
  if (!src) return null
  return (
    <p className="text-gray-500 dark:text-gray-500 text-xs leading-relaxed mt-6">
      Reference: <span className="italic">{src.title}</span> by {src.author}
    </p>
  )
}

function Safety({ text }) {
  return (
    <p className="bg-amber-500/10 border border-amber-500/30 text-black dark:text-gray-300 text-xs leading-relaxed rounded px-3 py-2 my-4">
      ⚠️ {text}
    </p>
  )
}

export function EarDescription() {
  const d = EAR_DESCRIPTION
  return (
    <Page>
      <h1 className="text-xl font-bold text-black dark:text-white mb-3">{d.title}</h1>
      {d.intro.map((t, i) => <p key={i} className={`${BODY} mb-3`}>{t}</p>)}

      <h2 className={`${H2} mt-5`}>{d.reading.title}</h2>
      <ul className="list-disc pl-5 space-y-1.5 mb-2">
        {d.reading.items.map(item => (
          <li key={item.label} className={BODY}><span className="font-semibold">{item.label}: </span>{item.text}</li>
        ))}
      </ul>

      <h2 className={`${H2} mt-5`}>The six groups of points</h2>
      <div className="grid gap-3 md:grid-cols-2">
        {d.groups.map((g, i) => (
          <section key={g.title} className="rounded border border-gray-200 dark:border-gray-800 p-3">
            <h3 className="text-sm font-bold text-black dark:text-gray-100 mb-1">
              <span className="text-amber-600 dark:text-amber-400 mr-1">{i + 1}.</span>{g.title}
            </h3>
            <p className="text-gray-700 dark:text-gray-400 text-xs leading-relaxed mb-2">{g.summary}</p>
            {g.points.length > 0 && (
              <ul className="space-y-1">
                {g.points.map(p => (
                  <li key={p.name} className="text-xs leading-relaxed text-black dark:text-gray-300">
                    <span className="font-semibold">{p.name}</span> — {p.text}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      <Safety text={d.safety} />
      <Source id={d.source} />
    </Page>
  )
}

// Formula point name -> its name on the Chinese Auriculotherapy diagram
// (MASTER_SVG_IDS values), where they differ.
const DIAGRAM_NAMES = {
  'Sympathetic': 'Sympathetic (sympathy)',
  'Dizziness Area': 'Dizziness Point',
  'Lesser Occipital Nerve': 'Lesser Occipital Nerve Point',
  'Allergy Area': 'Allergic Area',
  'Gallbladder': 'Gall Bladder',
  'Face and Cheek': 'Face & Cheek Area',
  'Lower BP Point': 'Decrease Blood Pressure Point',
  'Raise BP Point': 'Raising Blood Pressure Point',
  'Tinnitus Groove': 'Groove of Tinnitus',
  'Vision 2': 'Vision II',
  'Tragus Apex': 'Tragic Apex',
  'Helix 1–6': 'Helix 1-6',
  'Breast': 'Mammary Gland',
  'Bile Duct': 'Biliary Duct',
  'Abdominal Distension Area': 'Abdominal Area',
  'Cardia': 'Cardiac',
  'Oesophagus': 'Esophagus',
  'Nervous Subcortex': 'Subcortex',
  'Cardiovascular Subcortex': 'Subcortex',
  'Digestive Subcortex': 'Subcortex',
}
const DRAWN = new Set(Object.values(MASTER_SVG_IDS))

// A formula's points with their diagram names and numbers. "Corresponding
// Point" isn't a fixed point, so it gets no number.
function formulaPoints(formula) {
  let n = 0
  return formula.points.map(raw => {
    const bleed = raw.endsWith('(Bleed)')
    const label = raw.replace(' (Bleed)', '')
    const corresponding = label === 'Corresponding Point'
    const diagram = DIAGRAM_NAMES[label] ?? label
    const drawn = !corresponding && DRAWN.has(diagram)
    return { label, bleed, corresponding, diagram, drawn, n: drawn ? ++n : null }
  })
}

const matches = (f, q) =>
  f.name.toLowerCase().includes(q) ||
  f.points.some(p => p.toLowerCase().includes(q)) ||
  f.addOns?.some(a => a.toLowerCase().includes(q))

// Formula dropdown: a search field over the formulas, grouped by family.
function FormulaMenu({ selected, onSelect }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const rootRef = useRef(null)
  const q = query.trim().toLowerCase()
  const families = EAR_FORMULAS
    .map(fam => ({ ...fam, formulas: q ? fam.formulas.filter(f => matches(f, q)) : fam.formulas }))
    .filter(fam => fam.formulas.length > 0)

  useEffect(() => {
    if (!open) return
    function onDown(e) { if (!rootRef.current.contains(e.target)) setOpen(false) }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [open])

  return (
    <div ref={rootRef} className="relative w-full max-w-sm">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`w-full flex justify-between items-center text-sm font-semibold px-3 py-2 ${GLASS_TRIGGER} ${selected || open ? 'text-red-700' : 'text-black hover:text-red-700'}`}
      >
        <span>{selected?.name ?? 'Choose a formula'}</span>
        <span className="ml-2">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className={`absolute top-full left-0 right-0 mt-1 z-30 flex flex-col ${GLASS_DROPDOWN} bg-white/95 dark:bg-gray-900/95`}>
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search condition or point…"
              className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200 text-sm px-2 py-1.5 rounded border border-gray-300 dark:border-gray-700 focus:border-amber-500 focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-600"
            />
          </div>
          <div className="overflow-y-auto scroll-touch max-h-[60vh] py-1">
            {families.map(fam => (
              <div key={fam.family}>
                <div className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wide text-gray-400">{fam.family}</div>
                {fam.formulas.map(f => (
                  <button
                    key={f.name}
                    type="button"
                    onClick={() => { onSelect(f); setOpen(false); setQuery('') }}
                    className={`block w-full text-left px-3 py-2 text-sm font-semibold transition-colors ${
                      selected === f ? 'text-amber-500 dark:text-amber-400' : 'text-gray-700 dark:text-gray-300 hover:text-amber-500 dark:hover:text-amber-400'
                    }`}
                  >
                    {f.name}
                  </button>
                ))}
              </div>
            ))}
            {families.length === 0 && <p className="px-3 py-2 text-xs text-gray-400">No formulas match</p>}
          </div>
        </div>
      )}
    </div>
  )
}

// The Chinese Auriculotherapy ear with a formula's points kept bright and
// numbered; every other point fades back. `focus` (a diagram name) pulses.
function FormulaDiagram({ points, focus, onFocus }) {
  const hostRef = useRef(null)
  const [marks, setMarks] = useState([])
  const box = TCM_VIEWBOX
  const viewBox = `${box.x} ${box.y} ${box.w} ${box.h}`

  useEffect(() => {
    const svg = hostRef.current?.querySelector('svg')
    if (!svg) return
    const numbers = new Map(points.filter(p => p.drawn).map(p => [p.diagram, p.n]))
    const found = []
    const seen = new Set()
    for (const [elId, name] of Object.entries(MASTER_SVG_IDS)) {
      const el = svg.querySelector(`[id="${elId}"]`)
      if (!el) continue
      el.style.transition = 'opacity 150ms ease'
      el.style.cursor = numbers.has(name) ? 'pointer' : ''
      el.dataset.formulaPoint = numbers.has(name) ? name : ''
      el.style.opacity = numbers.size && !numbers.has(name) ? '0.2' : ''
      // One number per point, on the first element found.
      if (numbers.has(name) && !seen.has(name)) {
        seen.add(name)
        const c = pointCentre(svg, el, MASTER_LINE_IDS)
        found.push({ name, n: numbers.get(name), x: c.x, y: c.y })
      }
    }
    setMarks(found)
  }, [points])

  function handleClick(e) {
    const name = e.target.closest('[data-formula-point]')?.dataset.formulaPoint
    if (name) onFocus(name)
  }

  return (
    <div ref={hostRef} onClick={handleClick} className="relative w-full h-full bg-white rounded-lg shadow">
      <EarTcmSvg viewBox={viewBox} style={FILL} />
      <svg viewBox={viewBox} style={{ ...FILL, pointerEvents: 'none' }} xmlns="http://www.w3.org/2000/svg">
        {marks.map(m => {
          const on = focus === m.name
          return (
            <g key={m.name}>
              {on && (
                <circle cx={m.x} cy={m.y} r="26" fill="none" stroke="#000" strokeWidth="3">
                  <animate attributeName="r" values="26;48;26" dur="1.6s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.75;0;0.75" dur="1.6s" repeatCount="indefinite" />
                </circle>
              )}
              <circle cx={m.x + 22} cy={m.y - 22} r="15" fill={on ? '#b91c1c' : '#f59e0b'} stroke="white" strokeWidth="3" />
              <text x={m.x + 22} y={m.y - 22} dy="0.35em" textAnchor="middle" fontSize="17" fontWeight="700" fill="white" fontFamily="system-ui, sans-serif">{m.n}</text>
            </g>
          )
        })}
        <PointLabels marks={marks} points={points} focus={focus} box={box} />
      </svg>
    </div>
  )
}

// Label sizes, in ear diagram units (the crop is ~737 wide).
const LABEL = { font: 20, padX: 8, padY: 5, charW: 11, gap: 4 }

// Name labels for every numbered point: a fine black frame on a see-through
// white box, to the right of the number badge (left if it would leave the
// crop). Labels are placed top to bottom; one that would overlap a label
// already placed tries the other side, then steps down until it's clear.
function placeLabels(marks, names, box) {
  const { font, padX, padY, charW, gap } = LABEL
  const h = font + padY * 2
  // Every number badge and point dot is an obstacle, so labels don't hide them.
  const obstacles = marks.flatMap(m => [
    { x: m.x + 22 - 16, y: m.y - 22 - 16, w: 32, h: 32 },
    { x: m.x - 10, y: m.y - 10, w: 20, h: 20 },
  ])
  const placed = []
  const hits = (r, p) => r.x < p.x + p.w + gap && p.x < r.x + r.w + gap && r.y < p.y + p.h + gap && p.y < r.y + r.h + gap
  const overlaps = r => placed.some(p => hits(r, p)) || obstacles.some(o => hits(r, o))
  const clampY = y => Math.min(Math.max(y, box.y), box.y + box.h - h)
  for (const m of [...marks].sort((a, b) => a.y - b.y)) {
    const text = names.get(m.name)
    if (!text) continue
    const w = text.length * charW + padX * 2
    const rightX = m.x + 42
    const leftX = m.x - w - 14
    const sides = rightX + w > box.x + box.w ? [leftX, rightX] : [rightX, leftX]
    // Try beside the badge first, then alternately below and above it.
    let rect = null
    for (let step = 0; !rect && step <= 12; step++) {
      const dy = (step % 2 ? 1 : -1) * Math.ceil(step / 2) * (h / 2 + gap)
      for (const x of sides) {
        const r = { x, y: clampY(m.y - 22 - h / 2 + dy), w, h }
        if (r.x >= box.x && r.x + w <= box.x + box.w && !overlaps(r)) { rect = r; break }
      }
    }
    rect ??= { x: sides[0], y: clampY(m.y - 22 - h / 2), w, h }
    // Leader line from the badge when the label had to move off its row.
    const badge = { x: m.x + 22, y: m.y - 22 }
    const near = { x: Math.min(Math.max(badge.x, rect.x), rect.x + w), y: Math.min(Math.max(badge.y, rect.y), rect.y + h) }
    const leader = Math.abs(rect.y + h / 2 - badge.y) > h * 0.75 ? { x1: badge.x, y1: badge.y, x2: near.x, y2: near.y } : null
    placed.push({ ...rect, name: m.name, text, leader })
  }
  return placed
}

function PointLabels({ marks, points, focus, box }) {
  const names = new Map(points.filter(p => p.drawn).map(p => [p.diagram, p.label]))
  const labels = placeLabels(marks, names, box)
  const { font, padX, padY } = LABEL
  return labels.map(l => {
    const on = l.name === focus
    return (
      <g key={l.name}>
        {l.leader && <line {...l.leader} stroke={on ? '#b91c1c' : '#000'} strokeWidth="1.2" />}
        <rect x={l.x} y={l.y} width={l.w} height={l.h} rx="5" fill="rgba(255,255,255,0.8)" stroke={on ? '#b91c1c' : '#000'} strokeWidth={on ? 2.5 : 1.2} />
        <text x={l.x + padX} y={l.y + padY + font * 0.8} fontSize={font} fontWeight={on ? 700 : 500} fill={on ? '#b91c1c' : '#000'} fontFamily="system-ui, sans-serif">{l.text}</text>
      </g>
    )
  })
}

function FormulaDetails({ formula, points, focus, onFocus }) {
  return (
    <div>
      <h2 className="text-lg font-bold text-black dark:text-white mb-2">{formula.name}</h2>
      <h3 className={H2}>Points</h3>
      <ol className="space-y-1 mb-3">
        {points.map(p => (
          <li key={p.label}>
            <button
              type="button"
              disabled={!p.drawn}
              onClick={() => onFocus(focus === p.diagram ? null : p.diagram)}
              className={`w-full flex items-center gap-2 text-left text-sm rounded px-1.5 py-1 ${
                p.drawn ? 'hover:bg-amber-500/10' : 'cursor-default'
              } ${focus === p.diagram && p.drawn ? 'bg-amber-500/15' : ''}`}
            >
              <span className={`flex-shrink-0 w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center ${
                p.drawn ? (focus === p.diagram ? 'bg-red-700 text-white' : 'bg-amber-500 text-white') : 'bg-gray-200 dark:bg-gray-800 text-gray-400'
              }`}>{p.n ?? '–'}</span>
              <span className="text-black dark:text-gray-200">{p.label}</span>
              {p.bleed && <span className="text-red-600 dark:text-red-400 text-xs font-semibold">● bleed</span>}
              {p.corresponding && <span className="text-gray-500 text-xs">(the affected body part)</span>}
              {!p.drawn && !p.corresponding && <span className="text-gray-400 text-xs">not on diagram</span>}
            </button>
          </li>
        ))}
      </ol>
      {formula.addOns?.length > 0 && (
        <>
          <h3 className={H2}>Add</h3>
          <ul className="list-disc pl-5 space-y-1 mb-3">
            {formula.addOns.map(a => <li key={a} className="text-sm text-black dark:text-gray-300">{a}</li>)}
          </ul>
        </>
      )}
      {formula.note && <p className="text-xs text-amber-700 dark:text-amber-400 mb-3">{formula.note}</p>}
    </div>
  )
}

export function EarFormulas() {
  const [formula, setFormula] = useState(null)
  const [focus, setFocus] = useState(null)
  const points = useMemo(() => (formula ? formulaPoints(formula) : []), [formula])

  return (
    <div className="h-full overflow-y-auto scroll-touch">
      <div className="flex flex-col md:flex-row gap-4 md:h-full">
        {/* Menu + details */}
        <div className="md:w-80 lg:w-96 flex-shrink-0 bg-white dark:bg-gray-950 rounded-lg shadow p-4 md:overflow-y-auto scroll-touch">
          <FormulaMenu selected={formula} onSelect={f => { setFormula(f); setFocus(null) }} />
          <div className="mt-4">
            {formula ? (
              <FormulaDetails formula={formula} points={points} focus={focus} onFocus={setFocus} />
            ) : (
              <>
                <p className={`${BODY} mb-3`}>Pick a formula to see its points and add-ons, and where they are on the ear.</p>
                <ul className="space-y-1.5 mb-3">
                  {EAR_FORMULA_KEY_TERMS.map(t => (
                    <li key={t.label} className="text-xs leading-relaxed text-black dark:text-gray-300">
                      <span className="font-semibold">{t.label}{t.label === 'Bleed' && <span className="ml-1 text-red-600 dark:text-red-400">●</span>}:</span> {t.text}
                    </li>
                  ))}
                </ul>
              </>
            )}
            <Safety text={EAR_FORMULA_SAFETY} />
            <Source id="huang-auriculotherapy" />
          </div>
        </div>

        {/* Ear diagram */}
        {/* Fixed height when stacked (phones): an h-full child can't resolve
            against a min-height alone. Side by side, the row stretches it. */}
        <div className="h-[75vh] flex-shrink-0 md:h-auto md:flex-1 md:flex-shrink md:min-h-0">
          <FormulaDiagram points={points} focus={focus} onFocus={name => setFocus(f => (f === name ? null : name))} />
        </div>
      </div>
    </div>
  )
}
