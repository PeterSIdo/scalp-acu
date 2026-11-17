import { useEffect, useId, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import ScalpAreasSvg from '../../assets/diagrams/tcm-scalp-areas.svg?react'
import ScalpMeridiansSvg from '../../assets/diagrams/tcm-scalp-meridians.svg?react'
import MotorAreaMeasurementSvg from '../../assets/diagrams/motor-area-measurement.svg?react'
import FrontAnthonySvg from '../../assets/diagrams/front-anthony-shaded.svg?react'
import { CATEGORY_INTROS } from '../../data/categoryIntros'
import HamburgerMenu from '../ui/HamburgerMenu'
import TileTitle from '../ui/TileTitle'
import { CASE_STUDIES_ITEM } from '../../data/navItems'
import { TCM_AREA_INFO } from '../../data/tcmAreaInfo'
import { TCM_MERIDIAN_POINT_INFO, TCM_MERIDIAN_POINT_NAMES } from '../../data/tcmMeridianPointInfo'
import CrossIcon from '../ui/CrossIcon'
import MenuSizer from '../ui/MenuSizer'
import { MagnifiedDiagram, ZoomSlider, defaultView } from './Magnifier'
import { GLASS_TRIGGER, GLASS_DROPDOWN } from '../ui/menuStyles'

// 2x2 grid, row-major: areas diagram (with the TCM Area menu) | motor area
// measurement diagram (static) / meridians diagram (with the
// Meridian menu) | front stimulation areas diagram (static, no links yet).
const TILE_IDS = ['areas', 'motor', 'meridians', 'front']

// Must match tcm-scalp-areas.svg's own viewBox so the overlay lines up.
const AREAS_VIEWBOX = '54 217 689 719'

// Only the areas actually drawn on tcm-scalp-areas.svg. The SVG has no ids,
// so each entry carries the `d` of its coloured line(s) and the bbox of its
// label text [x, y, w, h], copied from the SVG — re-extract both if the
// diagram is re-exported. Selecting an area also shows its TCM_AREA_INFO
// entry in the InfoPanel (cleared for areas without one); the category
// intro opens via the link in the areas tile.
const TCM_AREAS = [
  { name: 'Motor Area',                              color: '#A81F88', lines: ['M451 321.5L314 577.5'],  label: [456, 237, 55, 15] },
  { name: 'Sensory Area',                            color: '#FB5762', lines: ['M483 329.5L347 582.5'],  label: [575, 242, 77, 19] },
  { name: 'Chorea and Tremor Area',                  color: '#9F9405', lines: ['M414 319L359 421.5'],    label: [309, 237, 108, 39] },
  { name: 'Vascular Dilation and Constriction Area', color: '#BA750D', lines: ['M377 322.5L324 421.5'],  label: [74, 237, 157, 39] },
  { name: 'Vertigo and Hearing Area',                color: '#78C7DB', lines: ['M394.5 541H481'],        label: [635, 460, 73, 67] },
  { name: 'Speech I Area',                           color: '#5CF76B', lines: ['M365.5 471L312 571.5'],  label: [75, 325, 83, 19] },
  { name: 'Speech II Area',                          color: '#5CF76B', lines: ['M549 420L578 477.5'],    label: [636, 387, 87, 19] },
  { name: 'Speech III Area',                         color: '#5CF76B', lines: ['M438 547H524.5'],        label: [636, 577, 88, 19] },
  { name: 'Praxis Area',                             color: '#CB4C4E', lines: ['M513 394L484 451.5', 'M513 394L542 451.5', 'M513 394V457'], label: [642, 318, 56, 15] },
]

const LABEL_PAD = 6

// The areas drawn on motor-area-measurement.svg (tile 1/2), same shape as
// TCM_AREAS. That SVG shares tcm-scalp-areas.svg's coordinates, so it's
// rendered with AREAS_VIEWBOX too. Labels are outlined text paths — bboxes
// copied from the SVG; re-extract if the diagram is re-exported.
const MOTOR_DIAGRAM_AREAS = [
  { name: 'Motor Area',   color: '#A81F88', lines: ['M451 321L321 566'],     label: [481.6, 239.5, 103.8, 14.8] },
  { name: 'Sensory Area', color: '#FB5762', lines: ['M475 324.5L345.5 573'], label: [547, 287.3, 126, 18.8] },
]

// tcm-scalp-meridians.svg draws the same head at the same scale as the
// areas SVG, just shifted (head outline at x+12.83, y-4). Using a same-size
// viewBox at that offset makes both heads render identically in their tiles
// (y nudged 2 up so the legend text at y≈212 isn't clipped).
const MERIDIANS_BOX = { x: 66.83, y: 211, w: 689, h: 719 }

// Same-size viewBox for front-anthony-shaded.svg (tile 2/2), see 'front' tile.
const FRONT_VIEWBOX = '46 162 689 719'

// The organ areas drawn on front-anthony-shaded.svg (tile 2/2), same shape
// as TCM_AREAS (`name` is the TCM_AREA_INFO key) plus `menuLabel` = the
// diagram's own label text. `lines` run down the centre of each 5-unit-wide
// coloured strip; bilateral areas have a strip on each side, only one of
// them labelled. Copied from the SVG — re-extract if it's re-exported.
const FRONT_AREAS = [
  { name: 'Head Area',                  menuLabel: 'Head',                   color: '#1E39EE', lines: ['M392.5 366V416'],                   label: [369.6, 212.5, 47.3, 14.8] },
  { name: 'Thoracic Cavity Area',       menuLabel: 'Thoracic',               color: '#EE0307', lines: ['M349.5 366V416', 'M433.5 366V416'], label: [171.9, 211.9, 141.1, 19.2] },
  { name: 'Stomach Area',               menuLabel: 'Stomach',                color: '#E29134', lines: ['M317.5 359V384', 'M468.5 359V384'], label: [559, 212.3, 82.3, 15] },
  { name: 'Liver and Gallbladder Area', menuLabel: 'Liver and gall bladder', color: '#0AC000', lines: ['M317.5 384V409', 'M468.5 384V409'], label: [107.1, 249.9, 114, 39.4] },
  { name: 'Reproductive Area',          menuLabel: 'Reproductive',           color: '#000000', lines: ['M272.5 358V383', 'M509.5 358V383'], label: [591.6, 315.9, 124.5, 19.2] },
  { name: 'Large Intestine Area',       menuLabel: 'Intestines',             color: '#EE1E7B', lines: ['M272.5 383V408', 'M509.5 383V408'], label: [84.6, 320.9, 91.5, 15.3] },
]

// `color` = legend circle fill (also used for the points). The meridian's
// line is the path whose id is `svgLine` or its code (its stroke colour is
// read from it); its points are the elements named "<svgPrefix or code> <n>"
// (e.g. "BL 1", "DU 20" for GV, "TB 17" for SJ), listed in `points`. Re-check both lists if the
// diagram is re-exported with points added or removed.
const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i)
const TCM_MERIDIANS = [
  { code: 'BL', name: 'Bladder',           color: '#6A0E55', points: range(1, 10) },
  { code: 'GB', name: 'Gallbladder',       color: '#BA750D', points: range(1, 21) },
  { code: 'ST', name: 'Stomach',           color: '#0F7F3D', points: range(1, 8) },
  { code: 'SI', name: 'Small Intestine',   color: '#5D4EE3', points: range(16, 19) },
  { code: 'SJ', name: 'Triple Heater',     color: '#F40A1A', points: range(16, 23), svgLine: 'TB', svgPrefix: 'TB' },
  { code: 'LI', name: 'Large Intestine',   color: '#78C7DB', points: range(18, 20) },
  { code: 'CV', name: 'Conception Vessel', color: '#5CF76B', points: range(23, 24) },
  { code: 'GV', name: 'Governing Vessel',  color: '#F2E413', points: range(15, 27), svgPrefix: 'DU' },
]

// Every meridian point as { key: 'BL 1', code: 'BL', svgId: 'BL 1' }. The key
// (also the label) uses the app's code; svgId the diagram's own layer name
// ('GV 20' is 'DU 20' in the SVG, 'SJ 17' is 'TB 17').
const MERIDIAN_POINTS = TCM_MERIDIANS.flatMap(m => m.points.map(n => ({
  key: `${m.code} ${n}`,
  code: m.code,
  svgId: `${m.svgPrefix ?? m.code} ${n}`,
})))
const MERIDIAN_OF_POINT = Object.fromEntries(MERIDIAN_POINTS.map(p => [p.key, p.code]))

// Scoped so it only affects transitions started while this screen is mounted.
const TRANSITION_STYLE = `
::view-transition-group(*) {
  animation-duration: 320ms;
  animation-timing-function: cubic-bezier(0.2, 0, 0, 1);
}

/* Dropdown: touch-swipe scrolling, no visible scrollbar. */
.tcm-dropdown-scroll {
  scrollbar-width: none;
  -ms-overflow-style: none;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-y;
  overscroll-behavior: contain;
}
.tcm-dropdown-scroll::-webkit-scrollbar {
  display: none;
}

@keyframes tcm-area-pulse {
  0%, 100% { stroke-opacity: 0.35; }
  50%      { stroke-opacity: 0.7; }
}
.tcm-area-glow {
  animation: tcm-area-pulse 1.4s ease-in-out infinite;
}`

// Trigger text matches Basic Points' menu button: black when idle, red when
// a selection is active or the menu is open. No dark: variants — the cyan
// button background doesn't change with the theme.
const TRIGGER_CLASS = (active) => `text-xs font-semibold px-2 py-1 ${GLASS_TRIGGER} transition-colors ${
  active
    ? 'text-red-700'
    : 'text-black hover:text-red-700'
}`

const DROPDOWN_ITEM_CLASS = (active) => `block w-full text-left px-3 py-1.5 text-xs font-semibold transition-colors ${
  active
    ? 'text-amber-500 dark:text-amber-400'
    : 'text-gray-600 dark:text-gray-300 hover:text-amber-500 dark:hover:text-amber-400'
}`

// App-level tile title, rendered below the diagram instead of baked into the
// SVG artwork — stays legible at any tile size and doesn't eat into the
// drawing's own canvas. Shown as a TileTitle strip, as on the YNSA grids.
const TILE_TITLES = {
  areas: 'Areas in Chinese Scalp Acupuncture',
  motor: 'Motor Area Measurement',
  meridians: 'TCM Meridians on the Head',
  front: 'Front Stimulation Areas',
}


// Same trigger+dropdown shape as Basic/Sensory/Brain Points' menus, but a
// plain name list. Shared by the areas and meridians tiles.
function TCMMenu({ items, placeholder, activeKey, menuOpen, onToggle, onSelect, onReset, compact }) {
  const dropdownRef = useRef(null)
  const activeLabel = items.find(i => i.key === activeKey)?.label

  // Same native (non-React) wheel-stop treatment as the other grids' menus —
  // ZoomableView attaches its own wheel-to-zoom handler directly to a DOM
  // node and sees the real bubble-phase event before a React onWheel would.
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
    <div onClick={e => e.stopPropagation()}>
      <div className="flex items-center gap-1.5">
        {/* Button and dropdown share one grid column, sized by MenuSizer,
            so both are as wide as the longest label. */}
        <div className="relative grid">
          <button type="button" onClick={onToggle} className={`${TRIGGER_CLASS(!!activeKey || menuOpen)} flex justify-between text-left`}>
            {activeLabel ?? placeholder}
            <span className="ml-1">{menuOpen ? '▲' : '▼'}</span>
          </button>
          <MenuSizer labels={[placeholder, ...items.map(i => i.label)]} />

          {menuOpen && (
            <div
              ref={dropdownRef}
              className={`tcm-dropdown-scroll absolute top-full left-0 right-0 mt-1 py-1 ${GLASS_DROPDOWN} overflow-y-auto z-20 ${compact ? 'max-h-40' : 'max-h-96'}`}
            >
              {items.map(({ key, label, indent }) => (
                <button key={key} type="button" onClick={() => onSelect(key)} className={DROPDOWN_ITEM_CLASS(activeKey === key)} style={indent ? { paddingLeft: 28 } : undefined}>
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
        {activeKey && (
          <button
            type="button"
            onClick={onReset}
            aria-label="Clear selection"
            className="flex items-center justify-center w-5 h-5 rounded-full bg-orange-500 hover:bg-orange-600 text-white shadow-sm transition duration-150 ease-out hover:scale-110 active:scale-90"
          >
            <CrossIcon size={10} strokeWidth={4} />
          </button>
        )}
      </div>
    </div>
  )
}

// Drawn areas first, then areas that only have a TCM_AREA_INFO entry (not on
// the diagram yet) — those open their description but highlight nothing.
const AREA_ITEMS = [
  ...TCM_AREAS.map(a => a.name),
  ...Object.keys(TCM_AREA_INFO).filter(name => !TCM_AREAS.some(a => a.name === name)),
].map(name => ({ key: name, label: name }))
// Each meridian followed by its points, indented.
const MERIDIAN_ITEMS = TCM_MERIDIANS.flatMap(m => [
  { key: m.code, label: `${m.name} (${m.code})` },
  ...MERIDIAN_POINTS.filter(p => p.code === m.code).map(p => ({ key: p.key, label: `${p.key} ${TCM_MERIDIAN_POINT_NAMES[p.key] ?? ''}`.trim(), indent: true })),
])
const FRONT_ITEMS = FRONT_AREAS.map(a => ({ key: a.name, label: a.menuLabel }))

// Search entries, one per TCM_AREA_INFO area: its name plus the phrases of
// its Indications section — list items ("Skin: psoriasis, …") as-is, and
// paragraphs split at commas/sentence ends so a hit shows just the phrase
// that matched instead of the whole paragraph.
const AREA_SEARCH = Object.entries(TCM_AREA_INFO).map(([key, info]) => {
  const ind = info.sections.find(sec => sec.title === 'Indications')
  const phrases = [
    ...(ind?.paragraphs ?? []).flatMap(t => t.split(/(?<=[.:])\s+|,\s+(?:and\s+|or\s+)?|\s+and\s+(?=[^,]*\.$)/)),
    ...(ind?.items ?? []).map(it => (it.label ? `${it.label}: ${it.text}` : it.text)),
  ].map(t => t.replace(/[.:]$/, '').trim()).filter(Boolean)
  return { key, name: info.name, phrases }
})

function searchAreas(query) {
  const q = query.trim().toLowerCase()
  if (!q) return []
  return AREA_SEARCH.flatMap(({ key, name, phrases }) => {
    if (name.toLowerCase().includes(q)) return [{ key, name, hit: null }]
    const hit = phrases.find(t => t.toLowerCase().includes(q))
    return hit ? [{ key, name, hit }] : []
  })
}

// Highlight layer shared by both diagrams: veils everything except `hole`
// (the selected label, cut out via mask), outlines the hole, and redraws the
// selected line(s) above the veil with a pulsing glow.
function SelectionHighlight({ viewBox, hole, lines, color, lineWidth, glowWidth }) {
  const maskId = `tcm-mask-${useId().replace(/:/g, '')}`
  // The veil reaches well past the viewBox: when the tile's aspect differs
  // from the diagram's, the SVG also draws outside the viewBox (letterbox
  // bands), which a magnified, panned view brings into sight.
  const [bx, by, bw, bh] = viewBox.split(' ').map(Number)
  const m = Math.max(bw, bh) * 2
  const [vx, vy, vw, vh] = [bx - m, by - m, bw + m * 2, bh + m * 2]
  const [hx, hy, hw, hh] = hole
  return (
    <g pointerEvents="none">
      <defs>
        <mask id={maskId} maskUnits="userSpaceOnUse" x={vx} y={vy} width={vw} height={vh}>
          <rect x={vx} y={vy} width={vw} height={vh} fill="white" />
          <rect x={hx} y={hy} width={hw} height={hh} rx="6" fill="black" />
        </mask>
      </defs>
      <rect x={vx} y={vy} width={vw} height={vh} fill="white" opacity="0.65" mask={`url(#${maskId})`} />
      <rect x={hx} y={hy} width={hw} height={hh} rx="6" fill="none" stroke="#F59E0B" strokeWidth="3" />
      {lines.map(d => (
        <g key={d}>
          <path d={d} fill="none" className="tcm-area-glow" stroke={color} strokeWidth={glowWidth} strokeLinecap="round" strokeLinejoin="round" />
          <path d={d} fill="none" stroke={color} strokeWidth={lineWidth} strokeLinecap="round" strokeLinejoin="round" />
        </g>
      ))}
    </g>
  )
}

const padBox = ([x, y, w, h]) => [x - LABEL_PAD, y - LABEL_PAD, w + LABEL_PAD * 2, h + LABEL_PAD * 2]
const FILL = { position: 'absolute', inset: 0, width: '100%', height: '100%' }

// An areas SVG with a click/highlight overlay on top, sharing its viewBox.
// Used by tile 1/1 (all drawn areas), tile 1/2 (Motor + Sensory only) and
// tile 2/2 (front organ areas); all share activeArea, so a selection in one
// shows in the others.
function AreasDiagram({ activeArea, onSelect, Svg = ScalpAreasSvg, areas = TCM_AREAS, viewBox = AREAS_VIEWBOX, lineWidth = 7.5 }) {
  const active = areas.find(a => a.name === activeArea)

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Svg viewBox={viewBox} style={FILL} />
      <svg viewBox={viewBox} style={FILL}>
        {active && (
          <SelectionHighlight viewBox={viewBox} hole={padBox(active.label)} lines={active.lines} color={active.color} lineWidth={lineWidth} glowWidth={lineWidth * 2} />
        )}

        {areas.map(area => {
          const select = e => { e.stopPropagation(); onSelect(area.name) }
          const [x, y, w, h] = padBox(area.label)
          return (
            <g key={area.name} onClick={select} style={{ cursor: 'pointer' }}>
              <title>{area.name}</title>
              {area.lines.map(d => (
                <path key={d} d={d} fill="none" stroke="transparent" strokeWidth="12" strokeLinecap="round" pointerEvents="stroke" />
              ))}
              <rect x={x} y={y} width={w} height={h} fill="transparent" pointerEvents="all" />
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// Point marker sizes, in diagram units at 1x. The ring and label are divided
// by the magnification so they stay the same size on screen.
const POINT_MARK = { dot: 4.5, hit: 10, ring: 9, pulse: 18, font: 15, pad: 6, charW: 8.6, gap: 14 }

// The meridians SVG with the same kind of overlay. Each meridian's line is
// the path with its code as id, and its points are found by name (see
// TCM_MERIDIANS); the legend circle is found by colour, with its label text
// directly above it. Selecting a meridian veils the rest and glows its line
// and points; selecting a point also pulses it and shows its name.
// `rect` is the visible (possibly magnified) window, see Magnifier.
function MeridiansDiagram({ activeMeridian, activePoint, onSelect, rect, zoom }) {
  const hostRef = useRef(null)
  const [shapes, setShapes] = useState({})
  const [points, setPoints] = useState({})

  useEffect(() => {
    const svg = hostRef.current?.querySelector('svg')
    if (!svg) return
    const next = {}
    for (const m of TCM_MERIDIANS) {
      // Either name works, so renaming the layers in Figma later is safe.
      const line = svg.querySelector(`path[id="${m.svgLine ?? m.code}"]`) ?? svg.querySelector(`path[id="${m.code}"]`)
      const c = [...svg.querySelectorAll(`circle[fill="${m.color}" i]`)].find(el => Number(el.getAttribute('r')) > 10)
      let legend = null
      if (c) {
        const cx = Number(c.getAttribute('cx'))
        const cy = Number(c.getAttribute('cy'))
        const r  = Number(c.getAttribute('r'))
        // Circle plus the label text above it (~30 units tall).
        legend = [cx - 32, cy - r - 30, 64, r * 2 + 34]
      }
      next[m.code] = {
        lines: line ? [line.getAttribute('d')] : [],
        lineColor: line?.getAttribute('stroke') ?? m.color,
        legend,
      }
    }
    setShapes(next)
    // The diagram has no transforms, so a bbox is already in viewBox units.
    const found = {}
    for (const p of MERIDIAN_POINTS) {
      const el = svg.querySelector(`[id="${p.svgId}"]`) ?? svg.querySelector(`[id="${p.key}"]`)
      if (!el) continue
      const b = el.getBBox()
      found[p.key] = { x: b.x + b.width / 2, y: b.y + b.height / 2 }
    }
    setPoints(found)
  }, [])

  const active = TCM_MERIDIANS.find(m => m.code === activeMeridian)
  const activeShapes = active && shapes[active.code]
  const activePos = activePoint && points[activePoint]

  const viewBox = `${rect.x} ${rect.y} ${rect.w} ${rect.h}`
  const mark = Object.fromEntries(Object.entries(POINT_MARK).map(([k, v]) => [k, v / zoom]))
  let label = null
  if (activePos) {
    const { font, pad, charW, gap } = mark
    const w = activePoint.length * charW + pad * 2
    const h = font + pad * 2
    // To the right of the point, flipped left if it would leave the window.
    const x = activePos.x + gap + w > rect.x + rect.w ? activePos.x - gap - w : activePos.x + gap
    const y = Math.min(Math.max(activePos.y - h / 2, rect.y), rect.y + rect.h - h)
    label = { x, y, w, h }
  }

  return (
    <div ref={hostRef} style={{ position: 'relative', width: '100%', height: '100%' }}>
      <ScalpMeridiansSvg viewBox={viewBox} style={FILL} />
      <svg viewBox={viewBox} style={FILL}>
        {activeShapes && (
          <SelectionHighlight
            viewBox={viewBox}
            hole={activeShapes.legend ?? [0, 0, 0, 0]}
            lines={activeShapes.lines}
            color={activeShapes.lineColor}
            lineWidth={3.5}
            glowWidth={9}
          />
        )}

        {/* The selected meridian's points, above the veil. */}
        {active && MERIDIAN_POINTS.filter(p => p.code === active.code && points[p.key]).map(p => (
          <circle key={p.key} cx={points[p.key].x} cy={points[p.key].y} r={POINT_MARK.dot} fill={active.color} stroke="white" strokeWidth="1.2" pointerEvents="none" />
        ))}

        {/* Line and legend click targets: select the meridian. */}
        {TCM_MERIDIANS.map(m => {
          const s = shapes[m.code]
          if (!s) return null
          const select = e => { e.stopPropagation(); onSelect(m.code) }
          return (
            <g key={m.code} onClick={select} style={{ cursor: 'pointer' }}>
              <title>{m.name}</title>
              {s.lines.map(d => (
                <path key={d} d={d} fill="none" stroke="transparent" strokeWidth="10" strokeLinecap="round" pointerEvents="stroke" />
              ))}
              {s.legend && (
                <rect x={s.legend[0]} y={s.legend[1]} width={s.legend[2]} height={s.legend[3]} fill="transparent" pointerEvents="all" />
              )}
            </g>
          )
        })}

        {/* Point click targets, above the lines so a dot wins. */}
        {MERIDIAN_POINTS.filter(p => points[p.key]).map(p => (
          <circle
            key={p.key}
            cx={points[p.key].x}
            cy={points[p.key].y}
            r={POINT_MARK.hit}
            fill="transparent"
            pointerEvents="all"
            style={{ cursor: 'pointer' }}
            onClick={e => { e.stopPropagation(); onSelect(p.key) }}
          >
            <title>{p.key}</title>
          </circle>
        ))}

        {activePos && label && (
          <g pointerEvents="none">
            <circle cx={activePos.x} cy={activePos.y} r={mark.ring} fill="none" stroke="#000" strokeWidth={2 / zoom}>
              <animate attributeName="r" values={`${mark.ring};${mark.pulse};${mark.ring}`} dur="1.6s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.75;0;0.75" dur="1.6s" repeatCount="indefinite" />
            </circle>
            <rect x={label.x} y={label.y} width={label.w} height={label.h} rx={5 / zoom} fill="rgba(0,0,0,0.72)" />
            <text x={label.x + mark.pad} y={label.y + mark.pad + mark.font * 0.8} fontSize={mark.font} fill="white" fontFamily="system-ui, sans-serif">
              {activePoint}
            </text>
          </g>
        )}
      </svg>
    </div>
  )
}

// Hamburger menu items for the areas tile — same flow as the YNSA grids.
const NAV_ITEMS = [
  { id: 'areas',  label: 'TCM Areas' },
  { id: 'about',  label: 'About TCM Scalp Acupuncture' },
  CASE_STUDIES_ITEM,
]

// Both diagram tiles use the same layout (menu row above the diagram, same
// viewBox size), so the heads render at the same size in 1/1 and 1/2.
function renderTileContent(id, { meridianView, onMeridianViewChange, activeArea, onAreaChange, activeMeridian, onMeridianChange, activeMeridianPoint, onMeridianPointChange, openMenu, onMenuToggle, onMenuClose, onPointSelect, navMode, onNavSelect, onNavModeChange }, expanded = false) {
  let menu, diagram, magnifier
  const selectArea = area => { onAreaChange(area); onPointSelect?.(area ? TCM_AREA_INFO[area] ?? null : null) }
  const toggleArea = area => { onMenuClose(); selectArea(activeArea === area ? null : area) }
  switch (id) {
    case 'areas': {
      menu = (
        <div className="flex items-center gap-2">
          <HamburgerMenu
            items={NAV_ITEMS}
            open={openMenu === 'nav'}
            activeId={navMode}
            dropdownClassName="left-3"
            onToggle={() => onMenuToggle('nav')}
            onSelect={onNavSelect}
            search={{
              placeholder: 'Search by areas, indications',
              emptyText: 'No areas or indications found',
              compact: !expanded,
              matches: searchAreas,
              // Shows the pick in the TCM Area menu beside the hamburger, whose × clears it.
              onPick: area => { onMenuClose(); onNavModeChange('areas'); selectArea(area) },
            }}
          />
          {navMode === 'areas' && <TCMMenu
            items={AREA_ITEMS}
            placeholder="TCM Area"
            activeKey={activeArea}
            menuOpen={openMenu === 'areas'}
            compact={!expanded}
            onToggle={() => onMenuToggle('areas')}
            onSelect={toggleArea}
            onReset={() => selectArea(null)}
          />}
        </div>
      )
      diagram = <AreasDiagram activeArea={activeArea} onSelect={toggleArea} />
      break
    }
    case 'meridians': {
      // A meridian key ('BL') toggles the meridian; a point key ('BL 1')
      // toggles the point and selects its meridian with it.
      // A picked point also shows its description in the InfoPanel.
      const toggleMeridian = key => {
        onMenuClose()
        const code = MERIDIAN_OF_POINT[key]
        if (code) {
          const point = activeMeridianPoint === key ? null : key
          onMeridianPointChange(point)
          onMeridianChange(code)
          onPointSelect?.(point ? TCM_MERIDIAN_POINT_INFO[point] ?? null : null)
        } else {
          if (activeMeridianPoint) onPointSelect?.(null)
          onMeridianPointChange(null)
          onMeridianChange(activeMeridian === key && !activeMeridianPoint ? null : key)
        }
      }
      menu = (
        <TCMMenu
          items={MERIDIAN_ITEMS}
          placeholder="Meridian"
          activeKey={activeMeridianPoint ?? activeMeridian}
          menuOpen={openMenu === 'meridians'}
          compact={!expanded}
          onToggle={() => onMenuToggle('meridians')}
          onSelect={toggleMeridian}
          onReset={() => { if (activeMeridianPoint) onPointSelect?.(null); onMeridianPointChange(null); onMeridianChange(null) }}
        />
      )
      // Magnifiable like the Ear diagrams; the zoom is shared by the tile and
      // its expanded view.
      diagram = (
        <MagnifiedDiagram box={MERIDIANS_BOX} view={meridianView} onViewChange={onMeridianViewChange}>
          {rect => <MeridiansDiagram activeMeridian={activeMeridian} activePoint={activeMeridianPoint} onSelect={toggleMeridian} rect={rect} zoom={meridianView.zoom} />}
        </MagnifiedDiagram>
      )
      magnifier = <ZoomSlider box={MERIDIANS_BOX} view={meridianView} compact={!expanded} onViewChange={onMeridianViewChange} />
      break
    }
    // No menu of its own; its Motor and Sensory lines/labels select the same
    // shared activeArea as tile 1/1. Its head outline sits at the same
    // coordinates as tcm-scalp-areas.svg, so sharing AREAS_VIEWBOX renders
    // the head at the same size and position as tile 1/1.
    case 'motor':
      diagram = <AreasDiagram activeArea={activeArea} onSelect={toggleArea} Svg={MotorAreaMeasurementSvg} areas={MOTOR_DIAGRAM_AREAS} />
      break
    // Organ-area menu, like the meridians tile, but selecting the shared
    // activeArea (so the InfoPanel and tile 1/1's TCM Areas menu follow).
    // front-anthony-shaded.svg draws the head at the same scale as
    // tcm-scalp-areas.svg (crown→chin ≈ 530 units in both), so a same-size
    // viewBox renders the head at tile 1/1's size; the offset puts the
    // crown/chin at the same height and centres it.
    case 'front':
      menu = (
        <TCMMenu
          items={FRONT_ITEMS}
          placeholder="Organ Area"
          activeKey={FRONT_AREAS.some(a => a.name === activeArea) ? activeArea : null}
          menuOpen={openMenu === 'front'}
          compact={!expanded}
          onToggle={() => onMenuToggle('front')}
          onSelect={toggleArea}
          onReset={() => selectArea(null)}
        />
      )
      diagram = <AreasDiagram activeArea={activeArea} onSelect={toggleArea} Svg={FrontAnthonySvg} areas={FRONT_AREAS} viewBox={FRONT_VIEWBOX} lineWidth={6} />
      break
    default:
      return null
  }
  // The menu row floats over the tile; the diagram starts just below it
  // (top: 40px clears the 26px controls + 12px padding) so the text above
  // the head is never covered. Every tile uses the same offset, so the heads
  // stay the same size. The row itself lets clicks through to the diagram;
  // only the controls catch them.
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div style={{ position: 'absolute', top: 40, left: 0, right: 0, bottom: 0 }}>
        {diagram}
      </div>
      {menu && (
        <div className="absolute left-0 right-0 top-0 px-3 pt-3 z-20 pointer-events-none">
          <div className="w-fit pointer-events-auto" onClick={e => e.stopPropagation()}>
            {menu}
          </div>
        </div>
      )}
      {/* Bottom left, below the menu's z-20 so an open dropdown covers it.
          It floats over the diagram (no reserved gap) so the head stays the
          same size as in the other tiles. */}
      {magnifier && (
        <div className="absolute left-0 bottom-0 px-3 pb-1 z-10 flex items-stretch">
          {magnifier}
        </div>
      )}
    </div>
  )
}

// `pick` ({ kind: 'area' | 'meridianPoint', key, n }) is a search-panel pick
// to select here; ViewerPage already shows its InfoPanel entry.
export default function HeadTCMScalpAreas({ onPointSelect, pick }) {
  const [expandedId,     setExpandedId]     = useState(null)
  const [activeArea,     setActiveArea]     = useState(null)
  const [activeMeridian, setActiveMeridian] = useState(null)
  const [activeMeridianPoint, setActiveMeridianPoint] = useState(null)
  const [openMenu,      setOpenMenu]       = useState(null)
  const [navMode,        setNavMode]        = useState(null) // null | 'areas'
  const [meridianView,   setMeridianView]   = useState(() => defaultView(MERIDIANS_BOX))

  useEffect(() => {
    if (pick?.subgroup !== 'tcm-scalp-areas') return
    setOpenMenu(null)
    if (pick.kind === 'area') {
      setNavMode('areas')
      setActiveArea(pick.key)
    } else if (pick.kind === 'meridianPoint') {
      setActiveMeridian(MERIDIAN_OF_POINT[pick.key] ?? null)
      setActiveMeridianPoint(pick.key)
    }
  }, [pick])

  // Hamburger picks: TCM Areas shows its menu beside the
  // hamburger, opened straight away; About shows the intro in the InfoPanel.
  function selectNav(item) {
    if (item === 'areas') {
      setNavMode(item)
      setOpenMenu(item)
    } else if (item === 'about') {
      setOpenMenu(null)
      setActiveArea(null)
      onPointSelect?.(CATEGORY_INTROS['tcm-scalp-areas'])
    }
  }

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') setExpandedId(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  function toggle(id) {
    const next = expandedId === id ? null : id
    if (document.startViewTransition) {
      document.startViewTransition(() => flushSync(() => setExpandedId(next)))
    } else {
      setExpandedId(next)
    }
  }

  const tileCtx = {
    meridianView,
    onMeridianViewChange: setMeridianView,
    activeArea,
    onAreaChange: setActiveArea,
    activeMeridian,
    onMeridianChange: setActiveMeridian,
    activeMeridianPoint,
    onMeridianPointChange: setActiveMeridianPoint,
    openMenu,
    onMenuToggle: id => setOpenMenu(open => (open === id ? null : id)),
    onMenuClose: () => setOpenMenu(null),
    onPointSelect,
    onNavModeChange: setNavMode,
    navMode,
    onNavSelect: selectNav,
  }

  return (
    <div
      style={{ position: 'relative', width: '100%', height: '100%' }}
      onClick={() => openMenu && setOpenMenu(null)}
    >
      <style>{TRANSITION_STYLE}</style>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: 'repeat(2, 1fr)',
          gap: '1rem',
          width: '100%',
          height: '100%',
        }}
      >
        {TILE_IDS.map(id => {
          const expandable = id === 'areas' || id === 'motor' || id === 'meridians' || id === 'front'
          const isExpanded = expandedId === id
          const content = renderTileContent(id, tileCtx, false)
          return (
            <div
              key={id}
              role={expandable ? 'button' : undefined}
              tabIndex={expandable ? 0 : undefined}
              aria-label={expandable ? `Expand ${id}` : undefined}
              onClick={() => expandable && toggle(id)}
              onKeyDown={e => { if (expandable && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); toggle(id) } }}
              style={{
                viewTransitionName: isExpanded ? 'none' : `tcm-tile-${id}`,
                visibility: isExpanded ? 'hidden' : 'visible',
                minHeight: 0,
                minWidth: 0,
                border: expandable ? '1px solid rgba(148, 163, 184, 0.2)' : 'none',
                borderRadius: 10,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
                justifyContent: TILE_TITLES[id] ? 'flex-start' : 'center',
                background: expandable ? '#ffffff' : 'transparent',
                cursor: expandable ? 'pointer' : 'default',
                overflow: 'hidden',
                transition: 'transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease',
              }}
              onMouseEnter={e => { if (expandable) { e.currentTarget.style.transform = 'scale(1.015)'; e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.5)' } }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.2)' }}
            >
              {!isExpanded && (
                <div style={{ flex: 1, minHeight: 0, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {content}
                </div>
              )}
              {!isExpanded && TILE_TITLES[id] && <TileTitle>{TILE_TITLES[id]}</TileTitle>}
            </div>
          )
        })}
      </div>

      {expandedId && (
        <div className="bg-gray-300 dark:bg-gray-900"
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 20,
          }}
        >
          <div
            style={{
              viewTransitionName: `tcm-tile-${expandedId}`,
              position: 'relative',
              width: '100%',
              height: '100%',
              background: '#ffffff',
              borderRadius: 12,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
              justifyContent: TILE_TITLES[expandedId] ? 'flex-start' : 'center',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
              overflow: 'hidden',
            }}
          >
            <div style={{ flex: 1, minHeight: 0, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {renderTileContent(expandedId, tileCtx, true)}
            </div>
            {TILE_TITLES[expandedId] && <TileTitle>{TILE_TITLES[expandedId]}</TileTitle>}
            <button
              onClick={e => { e.stopPropagation(); toggle(expandedId) }}
              aria-label="Close"
              className="transition duration-150 ease-out hover:scale-110 active:scale-90 hover:brightness-110"
              style={{
                position: 'absolute',
                top: 10,
                right: 10,
                width: 44,
                height: 44,
                borderRadius: '50%',
                border: '2px solid #ffffff',
                background: '#f97316',
                color: '#ffffff',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.35)',
                cursor: 'pointer',
                zIndex: 1,
              }}
            ><CrossIcon size={22} strokeWidth={3.5} /></button>
          </div>
        </div>
      )}
    </div>
  )
}
