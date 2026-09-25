import { useEffect, useId, useRef, useState } from 'react'
import { allPoints } from '../../data/points'
import { MERIDIANS } from '../../data/meridians'
import YNSAYSideSvg from '../../assets/diagrams/YNSA-Y-Side.svg?react'

const RED  = '#FF0808'
const BLUE = '#5392F6'

// SVG point id → ynsa.json id (filled as JSON data is authored)
const POINT_JSON_ID = {
  // ── Strong Y-Points (red) ─────────────────────────────
  'LU-yin':         'YNSA-Y-LU-yin',
  'LU-yang':        'YNSA-Y-LU-yang',
  'HT-yin':         'YNSA-Y-HT-yin',
  'HT-yang':        'YNSA-Y-HT-yang',
  'PE-yin':         'YNSA-Y-PE-yin',
  'PE-yang':        'YNSA-Y-PE-yang',
  'SI-yin':         'YNSA-Y-SI-yin',
  'SI-yang':        'YNSA-Y-SI-yang',
  'ST-yin':         'YNSA-Y-ST-yin',
  'ST-yang':        'YNSA-Y-ST-yang',
  'LV-yin':         'YNSA-Y-LV-yin',
  'LV-yang':        'YNSA-Y-LV-yang',
  'SP-PANC-yin':    'YNSA-Y-SP-PANC-yin',
  'SP-PANC-yang':   'YNSA-Y-SP-PANC-yang',
  'GB-yin':         'YNSA-Y-GB-yin',
  'GB-yang':        'YNSA-Y-GB-yang',
  'SJ-yin':         'YNSA-Y-SJ-yin',
  'SJ-yang':        'YNSA-Y-SJ-yang',
  'KI-yin':         'YNSA-Y-KI-yin',
  'KI-yang':        'YNSA-Y-KI-yang',
  'LI-yin':         'YNSA-Y-LI-yin',
  'LI-yang':        'YNSA-Y-LI-yang',
  'BL-yin':         'YNSA-Y-BL-yin',
  'BL-yang':        'YNSA-Y-BL-yang',
  // ── Soft Y-Points (blue) ──────────────────────────────
  'LU-yin_2':         'YNSA-Y-LU-yin-2',
  'LU-yang_2':        'YNSA-Y-LU-yang-2',
  'HT-yin_2':         'YNSA-Y-HT-yin-2',
  'HT-yang_2':        'YNSA-Y-HT-yang-2',
  'PE-yin_2':         'YNSA-Y-PE-yin-2',
  'PE-yang_2':        'YNSA-Y-PE-yang-2',
  'SI-yin_2':         'YNSA-Y-SI-yin-2',
  'SI-yang_2':        'YNSA-Y-SI-yang-2',
  'ST-yin_2':         'YNSA-Y-ST-yin-2',
  'ST-yang_2':        'YNSA-Y-ST-yang-2',
  'LV-yin_2':         'YNSA-Y-LV-yin-2',
  'LV-yang_2':        'YNSA-Y-LV-yang-2',
  'SP-PANC-yin_2':    'YNSA-Y-SP-PANC-yin-2',
  'SP-PANC-yang_2':   'YNSA-Y-SP-PANC-yang-2',
  'GB-yin_2':         'YNSA-Y-GB-yin-2',
  'GB-yang_2':        'YNSA-Y-GB-yang-2',
  'SJ-yin_2':         'YNSA-Y-SJ-yin-2',
  'SJ-yang_2':        'YNSA-Y-SJ-yang-2',
  'KI-yin_2':         'YNSA-Y-KI-yin-2',
  'KI-yang_2':        'YNSA-Y-KI-yang-2',
  'LI-yin_2':         'YNSA-Y-LI-yin-2',
  'LI-yang_2':        'YNSA-Y-LI-yang-2',
  'BL-yin_2':         'YNSA-Y-BL-yin-2',
  'BL-yang_2':        'YNSA-Y-BL-yang-2',
}

// Coordinates re-extracted 2026-09-25 from the current YNSA-Y-Side.svg (viewBox 0 0 558 706)
// via headless getBBox center × getCTM per point id. Earlier tables (0 0 760 949 on 2026-07-28,
// 27 23 947 1331 on 2026-07-05) were for older rebuilds — each re-export silently desyncs every
// overlay position (clicks, hover, meridian flash), so re-extract whenever the SVG changes and
// keep SIDE_VIEWBOX in sync with the file's viewBox.
const SIDE_VIEWBOX = '0 0 558 706'
export const Y_REAL_VIEWBOX = '0 0 553 713'

const POINTS = [
  // ── Strong Y-Points ────────────────────────────────────
  { id: 'LU-yin',         cx: 239.432, cy: 241.432, color: RED },
  { id: 'LU-yang',        cx: 403.216, cy: 268.216, color: RED },
  { id: 'HT-yin',         cx: 315.216, cy: 250.216, color: RED },
  { id: 'HT-yang',        cx: 349.216, cy: 255.216, color: RED },
  { id: 'PE-yin',         cx: 281.216, cy: 246.216, color: RED },
  { id: 'PE-yang',        cx: 374.216, cy: 260.216, color: RED },
  { id: 'SI-yin',         cx: 241.216, cy: 269.216, color: RED },
  { id: 'SI-yang',        cx: 401.216, cy: 298.216, color: RED },
  { id: 'ST-yin',         cx: 279.216, cy: 277.216, color: RED },
  { id: 'ST-yang',        cx: 373.216, cy: 290.432, color: RED },
  { id: 'LV-yin',         cx: 313,     cy: 278,     color: RED },
  { id: 'LV-yang',        cx: 350.216, cy: 278.216, color: RED },
  { id: 'SP-PANC-yin',    cx: 281.216, cy: 303.216, color: RED },
  { id: 'SP-PANC-yang',   cx: 374.216, cy: 317.216, color: RED },
  { id: 'GB-yin',         cx: 314.216, cy: 305.216, color: RED },
  { id: 'GB-yang',        cx: 348.216, cy: 307.216, color: RED },
  { id: 'SJ-yin',         cx: 255.216, cy: 316.216, color: RED },
  { id: 'SJ-yang',        cx: 407.216, cy: 330.216, color: RED },
  { id: 'KI-yin',         cx: 286.216, cy: 332.216, color: RED },
  { id: 'KI-yang',        cx: 394.216, cy: 432.216, color: RED },
  { id: 'LI-yin',         cx: 258.216, cy: 353.216, color: RED },
  { id: 'LI-yang',        cx: 406.216, cy: 365.216, color: RED },
  { id: 'BL-yin',         cx: 286.216, cy: 358.216, color: RED },
  { id: 'BL-yang',        cx: 382.216, cy: 451.216, color: RED },
  // ── Weak Y-Points ──────────────────────────────────────
  { id: 'LU-yin_2',         cx: 240.216, cy: 207.216, color: BLUE },
  { id: 'LU-yang_2',        cx: 405.216, cy: 243.359, color: BLUE },
  { id: 'HT-yin_2',         cx: 318,     cy: 224.216, color: BLUE },
  { id: 'HT-yang_2',        cx: 348.216, cy: 231.216, color: BLUE },
  { id: 'PE-yin_2',         cx: 280.216, cy: 219.216, color: BLUE },
  { id: 'PE-yang_2',        cx: 375.634, cy: 236.058, color: BLUE },
  { id: 'SI-yin_2',         cx: 244.216, cy: 176.216, color: BLUE },
  { id: 'SI-yang_2',        cx: 409.432, cy: 214.359, color: BLUE },
  { id: 'ST-yin_2',         cx: 282.216, cy: 195.216, color: BLUE },
  { id: 'ST-yang_2',        cx: 376.216, cy: 208.216, color: BLUE },
  { id: 'LV-yin_2',         cx: 317.216, cy: 198.216, color: BLUE },
  { id: 'LV-yang_2',        cx: 349.216, cy: 202.216, color: BLUE },
  { id: 'SP-PANC-yin_2',    cx: 284.216, cy: 168.216, color: BLUE },
  { id: 'SP-PANC-yang_2',   cx: 378.216, cy: 180.216, color: BLUE },
  { id: 'GB-yin_2',         cx: 319,     cy: 168,     color: BLUE },
  { id: 'GB-yang_2',        cx: 351.216, cy: 174.216, color: BLUE },
  { id: 'SJ-yin_2',         cx: 247.216, cy: 148.216, color: BLUE },
  { id: 'SJ-yang_2',        cx: 411.216, cy: 183.359, color: BLUE },
  { id: 'KI-yin_2',         cx: 285.216, cy: 144.216, color: BLUE },
  { id: 'KI-yang_2',        cx: 378.216, cy: 151.216, color: BLUE },
  { id: 'LI-yin_2',         cx: 251.216, cy: 124.216, color: BLUE },
  { id: 'LI-yang_2',        cx: 411.216, cy: 154.216, color: BLUE },
  { id: 'BL-yin_2',         cx: 287.216, cy: 117.216, color: BLUE },
  { id: 'BL-yang_2',        cx: 378.216, cy: 124.216, color: BLUE },
]

// Meridian menu/search items — only meridians that have Y-Points. The shared
// MERIDIANS list also carries Governing Vessel for the neck/abdomen maps,
// which has no Y-Point and so doesn't belong in this menu.
const Y_MERIDIANS = MERIDIANS.filter(m => POINTS.some(p => p.id.startsWith(`${m.code}-`)))

// Coordinates read directly from YNSA-Y-real.svg's own <circle>/<path> id="..."
// elements (viewBox Y_REAL_VIEWBOX, same 48 point ids as YNSA-Y-Side.svg) —
// the photo-reference companion diagram. Circle points use cx/cy directly;
// path-drawn points use their bounding-box center, same approach as POINTS
// above. Point placement differs from POINTS since it's a different
// anatomical model, so these are wired up separately rather than reused.
export const Y_REAL_POINTS = [
  // ── Strong Y-Points ────────────────────────────────────
  { id: 'LU-yin',         cx: 231.216, cy: 221.432, color: RED },
  { id: 'LU-yang',        cx: 395,     cy: 248.216, color: RED },
  { id: 'HT-yin',         cx: 307,     cy: 230.216, color: RED },
  { id: 'HT-yang',        cx: 341,     cy: 235.216, color: RED },
  { id: 'PE-yin',         cx: 273,     cy: 226.216, color: RED },
  { id: 'PE-yang',        cx: 366,     cy: 240.216, color: RED },
  { id: 'SI-yin',         cx: 233,     cy: 249.216, color: RED },
  { id: 'SI-yang',        cx: 393,     cy: 278.216, color: RED },
  { id: 'ST-yin',         cx: 271,     cy: 257.216, color: RED },
  { id: 'ST-yang',        cx: 365,     cy: 270.432, color: RED },
  { id: 'LV-yin',         cx: 304.784, cy: 258,     color: RED },
  { id: 'LV-yang',        cx: 342,     cy: 258.216, color: RED },
  { id: 'SP-PANC-yin',    cx: 273,     cy: 283.216, color: RED },
  { id: 'SP-PANC-yang',   cx: 366,     cy: 297.216, color: RED },
  { id: 'GB-yin',         cx: 306,     cy: 285.216, color: RED },
  { id: 'GB-yang',        cx: 340,     cy: 287.216, color: RED },
  { id: 'SJ-yin',         cx: 247,     cy: 296.216, color: RED },
  { id: 'SJ-yang',        cx: 399,     cy: 310.216, color: RED },
  { id: 'KI-yin',         cx: 278,     cy: 312.216, color: RED },
  { id: 'KI-yang',        cx: 371,     cy: 412.216, color: RED },
  { id: 'LI-yin',         cx: 250,     cy: 333.216, color: RED },
  { id: 'LI-yang',        cx: 398,     cy: 345.216, color: RED },
  { id: 'BL-yin',         cx: 278,     cy: 338.216, color: RED },
  { id: 'BL-yang',        cx: 359,     cy: 431.216, color: RED },
  // ── Weak Y-Points ──────────────────────────────────────
  { id: 'LU-yin_2',         cx: 232,     cy: 187.216, color: BLUE },
  { id: 'LU-yang_2',        cx: 397,     cy: 223.359, color: BLUE },
  { id: 'HT-yin_2',         cx: 309.784, cy: 204.216, color: BLUE },
  { id: 'HT-yang_2',        cx: 340,     cy: 211.216, color: BLUE },
  { id: 'PE-yin_2',         cx: 272,     cy: 199.216, color: BLUE },
  { id: 'PE-yang_2',        cx: 367.418, cy: 216.058, color: BLUE },
  { id: 'SI-yin_2',         cx: 236,     cy: 156.216, color: BLUE },
  { id: 'SI-yang_2',        cx: 401.216, cy: 194.359, color: BLUE },
  { id: 'ST-yin_2',         cx: 274,     cy: 175.216, color: BLUE },
  { id: 'ST-yang_2',        cx: 368,     cy: 188.216, color: BLUE },
  { id: 'LV-yin_2',         cx: 309,     cy: 178.216, color: BLUE },
  { id: 'LV-yang_2',        cx: 341,     cy: 182.216, color: BLUE },
  { id: 'SP-PANC-yin_2',    cx: 276,     cy: 148.216, color: BLUE },
  { id: 'SP-PANC-yang_2',   cx: 370,     cy: 160.216, color: BLUE },
  { id: 'GB-yin_2',         cx: 310.784, cy: 148,     color: BLUE },
  { id: 'GB-yang_2',        cx: 343,     cy: 154.216, color: BLUE },
  { id: 'SJ-yin_2',         cx: 239,     cy: 128.216, color: BLUE },
  { id: 'SJ-yang_2',        cx: 403,     cy: 163.359, color: BLUE },
  { id: 'KI-yin_2',         cx: 277,     cy: 124.216, color: BLUE },
  { id: 'KI-yang_2',        cx: 370,     cy: 131.216, color: BLUE },
  { id: 'LI-yin_2',         cx: 243,     cy: 104.216, color: BLUE },
  { id: 'LI-yang_2',        cx: 402.999, cy: 134.216, color: BLUE },
  { id: 'BL-yin_2',         cx: 279,     cy: 97.216,  color: BLUE },
  { id: 'BL-yang_2',        cx: 370,     cy: 104.216, color: BLUE },
]

// The four corner labels (Weak Yin / Weak Yang / Strong Yin / Strong Yang) are informational,
// not clickable — just scaled up 30% in place. `transform-box: fill-box` + `transform-origin:
// center` scales each glyph path around its own bounding-box center instead of the SVG origin.
const STRONG_WEAK_LABEL_STYLE = `
.svg-y-points [id="Weak Yin"],
.svg-y-points [id="WeakYang"],
.svg-y-points [id="Strong Yin"],
.svg-y-points [id="Strong Yang"] {
  transform: scale(1.3);
  transform-box: fill-box;
  transform-origin: center;
}`

// Corner labels sit near the very top/bottom edges of the viewBox, so once the
// diagram is scaled up to fill a short tile (see diagramScale) they're the
// first thing to get clipped. Hiding them is presentation-only — the labels
// stay intact in the source SVG and still show on the full-size Y-Points tab.
const HIDE_CORNER_LABELS_STYLE = `
.svg-y-points [id="Weak Yin"],
.svg-y-points [id="WeakYang"],
.svg-y-points [id="Strong Yin"],
.svg-y-points [id="Strong Yang"] {
  display: none;
}`

// Build scoped CSS:
//   cursor:pointer on all clickable points
//   when activeMeridian is set: dim non-active points
function buildPointStyle(activeMeridian) {
  if (!activeMeridian) return ''

  const prefix = activeMeridian + '-'

  // Dim all points (circle, ellipse, or path-drawn) in both groups regardless of id suffix.
  const dimPoints = `
.svg-y-points [id="y-points-strong"] circle,
.svg-y-points [id="y-points-strong"] ellipse,
.svg-y-points [id="y-points-strong"] path,
.svg-y-points [id="y-points-weak"] circle,
.svg-y-points [id="y-points-weak"] ellipse,
.svg-y-points [id="y-points-weak"] path { opacity: 0.15; }`

  // Restore active meridian points (same specificity, later in string → wins)
  const restorePoints = `
.svg-y-points circle[id^="${prefix}"],
.svg-y-points ellipse[id^="${prefix}"],
.svg-y-points path[id^="${prefix}"] { opacity: 1; }`

  return `${dimPoints}\n${restorePoints}`
}

// Shared text style for both the Meridian and Search triggers — plain text, no button
// chrome, matching the SubgroupTabs font/weight elsewhere in the viewer.
const TRIGGER_CLASS = (active) => `text-xs font-semibold px-2 py-1 rounded bg-[#63ECE1] transition-colors ${
  active
    ? 'text-amber-500 dark:text-amber-400'
    : 'text-gray-600 dark:text-gray-300 hover:text-amber-500 dark:hover:text-amber-400'
}`

const DROPDOWN_ITEM_CLASS = (active) => `block w-full text-left px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
  active
    ? 'text-amber-500 dark:text-amber-400'
    : 'text-gray-600 dark:text-gray-300 hover:text-amber-500 dark:hover:text-amber-400'
}`

// The Meridian control is a plain HTML dropdown (matches the SubgroupTabs font/weight),
// styled as text rather than a filled button, since the SVG no longer bakes in a menu.
function MeridianMenu({ activeMeridian, menuOpen, onToggle, onSelect, onReset }) {
  const activeName = MERIDIANS.find(m => m.code === activeMeridian)?.name
  const dropdownRef = useRef(null)

  // Native (non-React) listener, registered directly on the dropdown node —
  // ZoomableView attaches its own wheel-to-zoom handler straight to a DOM
  // node too, so it sees wheel events during the real DOM bubble phase
  // *before* React's root-delegated onWheel would ever fire; stopping it
  // from a React handler is too late. Stopping it here, at the real
  // source, is what actually prevents the diagram from zooming while the
  // list scrolls (same pattern as HeadBasicPoints' zone dropdown).
  useEffect(() => {
    const el = dropdownRef.current
    if (!menuOpen || !el) return
    function onWheel(e) {
      e.preventDefault()
      e.stopPropagation()
      el.scrollTop += e.deltaY
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [menuOpen])

  return (
    <div className="relative">
      <div className="flex items-center gap-1.5">
        <button type="button" onClick={onToggle} className={TRIGGER_CLASS(!!activeMeridian || menuOpen)}>
          {activeName ?? 'Meridian'}
          <span className="ml-1">{menuOpen ? '▲' : '▼'}</span>
        </button>
        {activeMeridian && (
          <button
            type="button"
            onClick={onReset}
            aria-label="Clear meridian filter"
            className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs leading-none font-bold shadow-sm transition-colors"
          >
            ×
          </button>
        )}
      </div>

      {menuOpen && (
        <div
          ref={dropdownRef}
          className="scroll-touch absolute top-full left-0 mt-1 py-1 rounded shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 min-w-[9.5rem] max-h-96 overflow-y-auto z-20"
        >
          {Y_MERIDIANS.map(({ code, name }) => (
            <button key={code} type="button" onClick={() => onSelect(code)} className={DROPDOWN_ITEM_CLASS(activeMeridian === code)}>
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// Quick meridian-name search, next to the Meridian dropdown. Matches meridian names only
// for now — Y-Points has no authored JSON/indications yet to search against (see
// project memory); once that content exists, extend the `matches` filter below to also
// pull in points whose indications/tags match `query`, mapped back to their meridian.
function MeridianSearch({ open, query, onToggle, onQueryChange, onSelect }) {
  const q = query.trim().toLowerCase()
  const matches = q ? Y_MERIDIANS.filter(m => m.name.toLowerCase().includes(q)) : []

  function handleKeyDown(e) {
    if (e.key === 'Enter' && matches.length > 0) onSelect(matches[0].code)
    else if (e.key === 'Escape') onToggle(false)
  }

  return (
    <div className="relative">
      <button type="button" onClick={() => onToggle()} className={TRIGGER_CLASS(open)}>
        Search
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 rounded shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 min-w-[10rem] z-20">
          <input
            type="text"
            autoFocus
            value={query}
            onChange={e => onQueryChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Meridian…"
            className="w-full px-3 py-1.5 text-xs font-semibold bg-transparent text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none border-b border-gray-200 dark:border-gray-700"
          />
          {q && (
            matches.length > 0 ? (
              <div className="py-1">
                {matches.map(({ code, name }) => (
                  <button key={code} type="button" onClick={() => onSelect(code)} className={DROPDOWN_ITEM_CLASS(false)}>
                    {name}
                  </button>
                ))}
              </div>
            ) : (
              <p className="px-3 py-1.5 text-xs text-gray-400 dark:text-gray-600">No meridian found</p>
            )
          )}
        </div>
      )}
    </div>
  )
}

// activeMeridian/onMeridianChange are optional — pass both to make the Meridian
// selection controlled from a parent (e.g. so a tap on another tile's diagram
// can select a meridian here too); omit both for standalone/uncontrolled use.
// diagramScale enlarges the diagram (background + point overlay) only —
// the Meridian menu stays at its natural position/size regardless.
// hideCornerLabels drops the Weak/Strong Yin/Yang corner labels, which get
// clipped once diagramScale pushes them past a short tile's edges.
// showCornerLabels renders those same four labels back in as a plain HTML
// overlay, pinned to the tile's actual corners rather than the (possibly
// scaled/clipped) SVG's own coordinate system — meant to pair with
// hideCornerLabels once there's room again (e.g. the tile is expanded).
// Background/points default to the line-art diagram; the "real" reference-
// photo tile passes YNSAYRealSvg + Y_REAL_POINTS instead — the two
// backgrounds share point ids but not viewBox or point placement, since they're
// different anatomical models (same pattern as NeckMeridianMap's diag/real
// split). showMenu hides the Meridian/Search dropdown chrome for that
// second tile — it shares activeMeridian with the primary tile instead of
// duplicating the controls.
export default function HeadYPoints({ onPointSelect, highlightJsonId = null, activeMeridian: controlledMeridian, onMeridianChange, diagramScale = 1, hideCornerLabels = false, showCornerLabels = false, Background = YNSAYSideSvg, points = POINTS, viewBox = SIDE_VIEWBOX, showMenu = true, showMeridianLabel = false }) {
  const [selectedId,       setSelectedId]       = useState(null)
  const [hoveredId,        setHoveredId]        = useState(null)
  const [internalMeridian, setInternalMeridian] = useState(null)
  const [openPanel,        setOpenPanel]        = useState(null) // null | 'meridian' | 'search'
  const [searchQuery,      setSearchQuery]      = useState('')

  const activeMeridian = controlledMeridian !== undefined ? controlledMeridian : internalMeridian

  // <style> is document-global, so scope every rule to this instance's wrapper —
  // otherwise one tile's hideCornerLabels (the Y-real tile) hides the labels on
  // every other HeadYPoints on screen too.
  const scopeId = useId()
  const scope = `[data-y-points="${scopeId}"] .svg-y-points`
  const style = `${hideCornerLabels ? HIDE_CORNER_LABELS_STYLE : STRONG_WEAK_LABEL_STYLE}\n${buildPointStyle(activeMeridian)}`
    .replaceAll('.svg-y-points', scope)

  // Meridian name label — same floating dark-box/white-text style as
  // NeckMeridianMap's per-point label, used here for tiles that hide the
  // Meridian dropdown (showMenu=false) and would otherwise have no visible
  // indication of which meridian is active. Anchored to the clicked point
  // when there is one (selectedId), or the first point belonging to the
  // active meridian otherwise — covers selection made via the dropdown/
  // search on a *different* HeadYPoints instance sharing this activeMeridian
  // prop, where this instance's own selectedId is never set.
  const meridianLabelName = activeMeridian ? MERIDIANS.find(m => m.code === activeMeridian)?.name : null
  const meridianLabelAnchor = meridianLabelName
    ? points.find(p => p.id === selectedId) ?? points.find(p => p.id.startsWith(`${activeMeridian}-`))
    : null

  // Tapping a point selects its meridian too — same pulsing-ring flash and
  // activated Meridian menu as picking it from the dropdown, or tapping the
  // matching point on the "diag" (NeckMeridianMap) tile.
  function selectPoint(id) {
    setSelectedId(id)
    const jsonId = POINT_JSON_ID[id]
    const data = jsonId ? allPoints.find(p => p.id === jsonId) : null
    onPointSelect?.(data ?? null)

    const code = id.replace(/-(yin|yang)(_2)?$/, '')
    setInternalMeridian(code)
    onMeridianChange?.(code)
  }

  function handleMeridianSelect(code) {
    setInternalMeridian(code)
    setOpenPanel(null)
    setSearchQuery('')
    setSelectedId(null)
    onPointSelect?.(null)
    onMeridianChange?.(code)
  }

  function handleReset() {
    setInternalMeridian(null)
    setOpenPanel(null)
    setSearchQuery('')
    setSelectedId(null)
    setHoveredId(null)
    onPointSelect?.(null)
    onMeridianChange?.(null)
  }

  return (
    <div
      data-y-points={scopeId}
      style={{ position: 'relative', width: '100%', height: '100%' }}
      onClick={() => openPanel && setOpenPanel(null)}
    >
      <style>{style}</style>

      {/* Corner labels rank above the menu when both are shown — they sit in the
          actual top corners, and the menu drops below them (see top-9 below).
          "Weak Yang" is pulled in from the very edge so it doesn't sit under
          the modal's close button (top-right, outside this component). */}
      {showCornerLabels && (
        <div className="absolute inset-0 z-10 pointer-events-none" aria-hidden="true">
          <span className="absolute top-2 left-2 text-xs font-semibold text-amber-500 dark:text-amber-400">Weak Yin</span>
          <span className="absolute top-2 right-12 text-xs font-semibold text-amber-500 dark:text-amber-400">Weak Yang</span>
          <span className="absolute bottom-2 left-2 text-xs font-semibold text-amber-500 dark:text-amber-400">Strong Yin</span>
          <span className="absolute bottom-2 right-2 text-xs font-semibold text-amber-500 dark:text-amber-400">Strong Yang</span>
        </div>
      )}

      {showMenu && (
        <div
          className={`absolute left-3 z-10 flex items-baseline gap-4 ${showCornerLabels ? 'top-9' : 'top-3'}`}
          onClick={e => e.stopPropagation()}
        >
          <MeridianMenu
            activeMeridian={activeMeridian}
            menuOpen={openPanel === 'meridian'}
            onToggle={() => setOpenPanel(p => p === 'meridian' ? null : 'meridian')}
            onSelect={handleMeridianSelect}
            onReset={handleReset}
          />
          <MeridianSearch
            open={openPanel === 'search'}
            query={searchQuery}
            onToggle={() => setOpenPanel(p => p === 'search' ? null : 'search')}
            onQueryChange={setSearchQuery}
            onSelect={handleMeridianSelect}
          />
        </div>
      )}

      {/* Diagram layer — scaled independently of the Meridian menu above. */}
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${diagramScale})`, transformOrigin: 'center' }}>
        {/* Background SVG — the head diagram and point artwork */}
        <Background
          className="svg-y-points"
          preserveAspectRatio="xMidYMid meet"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        />

        {/* Overlay SVG — pointer-events:none at root so clicks pass through to the wrapper
            (closing the menu); individual <g> elements re-enable pointer-events for points. */}
        <svg
          viewBox={viewBox}
          preserveAspectRatio="xMidYMid meet"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        >
          {points.map(({ id, cx, cy, color }) => {
            const jsonId     = POINT_JSON_ID[id]
            const isSelected = selectedId === id || (highlightJsonId && jsonId === highlightJsonId)
            const isHovered  = hoveredId === id
            const isActiveMeridian = !!activeMeridian && id.startsWith(`${activeMeridian}-`)
            return (
              <g
                key={id}
                onClick={e => { e.stopPropagation(); selectPoint(id) }}
                onMouseEnter={() => setHoveredId(id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{ cursor: 'pointer', pointerEvents: 'auto' }}
              >
                {/* Meridian highlight — pulsing ring on every point belonging to the
                    active meridian, same flash as the Basic Points / Neck Diagnosis
                    search-style highlight. */}
                {isActiveMeridian && (
                  <circle cx={cx} cy={cy} r={14} fill="none" stroke={color} strokeWidth="2" opacity="0.85">
                    <animate attributeName="r"       values="14;26;14"    dur="1.6s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.85;0;0.85" dur="1.6s" repeatCount="indefinite" />
                  </circle>
                )}
                {isSelected && (
                  <circle cx={cx} cy={cy} r={14} fill="none" stroke={color} strokeWidth="3" opacity="0.9" />
                )}
                {isHovered && !isSelected && (
                  <circle cx={cx} cy={cy} r={14} fill={color} opacity="0.25" />
                )}
                <circle cx={cx} cy={cy} r={12} fill="transparent" />
              </g>
            )
          })}

          {/* Meridian name label — see meridianLabelAnchor comment above. */}
          {showMeridianLabel && meridianLabelAnchor && meridianLabelName && (() => {
            const pad = 6
            const fSize = 11
            const w = meridianLabelName.length * 6.2 + pad * 2
            const h = fSize + pad * 2
            const vbWidth = Number(viewBox.split(/\s+/)[2])
            const tx = meridianLabelAnchor.cx + 20 + w > vbWidth ? meridianLabelAnchor.cx - w - 20 : meridianLabelAnchor.cx + 20
            const ty = meridianLabelAnchor.cy - h / 2
            return (
              <g pointerEvents="none">
                <rect x={tx} y={ty} width={w} height={h} rx={4} fill="rgba(0,0,0,0.72)" />
                <text x={tx + pad} y={ty + fSize + pad * 0.6} fontSize={fSize} fill="white" fontFamily="system-ui, sans-serif">
                  {meridianLabelName}
                </text>
              </g>
            )
          })()}
        </svg>
      </div>
    </div>
  )
}
