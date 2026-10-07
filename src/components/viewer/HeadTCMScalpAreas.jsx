import { useEffect, useId, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import ScalpAreasSvg from '../../assets/diagrams/tcm-scalp-areas.svg?react'
import ScalpMeridiansSvg from '../../assets/diagrams/tcm-scalp-meridians.svg?react'
import MotorAreaMeasurementSvg from '../../assets/diagrams/motor-area-measurement.svg?react'
import { CATEGORY_INTROS } from '../../data/categoryIntros'
import HamburgerMenu from '../ui/HamburgerMenu'
import TileTitle from '../ui/TileTitle'
import { CASE_STUDIES_ITEM } from '../../data/navItems'
import InlineSearch from '../ui/InlineSearch'
import { TCM_AREA_INFO } from '../../data/tcmAreaInfo'

// 2x2 grid, row-major: areas diagram (with the TCM Area menu) | motor area
// measurement diagram (static) / meridians diagram (with the
// Meridian menu) | 1 tile reserved for future content.
const TILE_IDS = ['areas', 'motor', 'meridians', 'empty2']

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
const MERIDIANS_VIEWBOX = '66.83 211 689 719'

// `color` = legend circle fill, `lineColor` = the meridian's line stroke on
// the head. They match except TB, whose line is drawn in blue-violet
// (confirmed with user).
const TCM_MERIDIANS = [
  { code: 'BL', name: 'Bladder',           color: '#6A0E55', lineColor: '#6A0E55' },
  { code: 'GB', name: 'Gallbladder',       color: '#BA750D', lineColor: '#BA750D' },
  { code: 'ST', name: 'Stomach',           color: '#0F7F3D', lineColor: '#0F7F3D' },
  { code: 'SI', name: 'Small Intestine',   color: '#CB4C4E', lineColor: '#CB4C4E' },
  { code: 'TB', name: 'Triple Burner',     color: '#F40A1A', lineColor: '#5D4EE3' },
  { code: 'LI', name: 'Large Intestine',   color: '#78C7DB', lineColor: '#78C7DB' },
  { code: 'CV', name: 'Conception Vessel', color: '#5CF76B', lineColor: '#5CF76B' },
  { code: 'GV', name: 'Governing Vessel',  color: '#F2E413', lineColor: '#F2E413' },
]

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
const TRIGGER_CLASS = (active) => `text-xs font-semibold px-2 py-1 rounded bg-[#63ECE1] transition-colors ${
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
        <button type="button" onClick={onToggle} className={TRIGGER_CLASS(!!activeKey || menuOpen)}>
          {activeLabel ?? placeholder}
          <span className="ml-1">{menuOpen ? '▲' : '▼'}</span>
        </button>
        {activeKey && (
          <button
            type="button"
            onClick={onReset}
            aria-label="Clear selection"
            className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs leading-none font-bold shadow-sm transition-colors"
          >
            ×
          </button>
        )}
      </div>

      {menuOpen && (
        <div
          ref={dropdownRef}
          className={`tcm-dropdown-scroll absolute top-full left-0 right-0 mt-1 py-1 rounded shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-y-auto z-20 ${compact ? 'max-h-40' : 'max-h-96'}`}
        >
          {items.map(({ key, label }) => (
            <button key={key} type="button" onClick={() => onSelect(key)} className={DROPDOWN_ITEM_CLASS(activeKey === key)}>
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// Drawn areas first, then areas that only have a TCM_AREA_INFO entry (not on
// the diagram yet) — those open their description but highlight nothing.
const AREA_ITEMS = [
  ...TCM_AREAS.map(a => a.name),
  ...Object.keys(TCM_AREA_INFO).filter(name => !TCM_AREAS.some(a => a.name === name)),
].map(name => ({ key: name, label: name }))
const MERIDIAN_ITEMS = TCM_MERIDIANS.map(m => ({ key: m.code, label: `${m.name} (${m.code})` }))

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
  const [vx, vy, vw, vh] = viewBox.split(' ').map(Number)
  const [hx, hy, hw, hh] = hole
  return (
    <g pointerEvents="none">
      <defs>
        <mask id={maskId}>
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
// Used by tile 1/1 (all drawn areas) and tile 1/2 (Motor + Sensory only);
// both share activeArea, so a selection in either shows in both.
function AreasDiagram({ activeArea, onSelect, Svg = ScalpAreasSvg, areas = TCM_AREAS }) {
  const active = areas.find(a => a.name === activeArea)

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Svg viewBox={AREAS_VIEWBOX} style={FILL} />
      <svg viewBox={AREAS_VIEWBOX} style={FILL}>
        {active && (
          <SelectionHighlight viewBox={AREAS_VIEWBOX} hole={padBox(active.label)} lines={active.lines} color={active.color} lineWidth={7.5} glowWidth={15} />
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

// The meridians SVG with the same kind of overlay. Line paths and legend
// circles are read from the rendered SVG by colour on mount (the file has no
// ids), so a Figma re-export keeps working as long as the colours stay. The
// legend label text sits directly above each circle.
function MeridiansDiagram({ activeMeridian, onSelect }) {
  const hostRef = useRef(null)
  const [shapes, setShapes] = useState({})

  useEffect(() => {
    const svg = hostRef.current?.querySelector('svg')
    if (!svg) return
    const next = {}
    for (const m of TCM_MERIDIANS) {
      const lines = [...svg.querySelectorAll(`path[stroke="${m.lineColor}" i]`)].map(p => p.getAttribute('d'))
      const c = svg.querySelector(`circle[fill="${m.color}" i]`)
      let legend = null
      if (c) {
        const cx = Number(c.getAttribute('cx'))
        const cy = Number(c.getAttribute('cy'))
        const r  = Number(c.getAttribute('r'))
        // Circle plus the label text above it (~30 units tall).
        legend = [cx - 32, cy - r - 30, 64, r * 2 + 34]
      }
      next[m.code] = { lines, legend }
    }
    setShapes(next)
  }, [])

  const active = TCM_MERIDIANS.find(m => m.code === activeMeridian)
  const activeShapes = active && shapes[active.code]

  return (
    <div ref={hostRef} style={{ position: 'relative', width: '100%', height: '100%' }}>
      <ScalpMeridiansSvg viewBox={MERIDIANS_VIEWBOX} style={FILL} />
      <svg viewBox={MERIDIANS_VIEWBOX} style={FILL}>
        {activeShapes && (
          <SelectionHighlight
            viewBox={MERIDIANS_VIEWBOX}
            hole={activeShapes.legend ?? [0, 0, 0, 0]}
            lines={activeShapes.lines}
            color={active.lineColor}
            lineWidth={3.5}
            glowWidth={9}
          />
        )}

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
      </svg>
    </div>
  )
}

// Hamburger menu items for the areas tile — same flow as the YNSA grids.
const NAV_ITEMS = [
  { id: 'areas',  label: 'TCM Areas' },
  { id: 'search', label: 'Search by areas, indications' },
  { id: 'about',  label: 'About TCM Scalp Acupuncture' },
  CASE_STUDIES_ITEM,
]

// Both diagram tiles use the same layout (menu row above the diagram, same
// viewBox size), so the heads render at the same size in 1/1 and 1/2.
function renderTileContent(id, { activeArea, onAreaChange, activeMeridian, onMeridianChange, openMenu, onMenuToggle, onMenuOpen, onMenuClose, onPointSelect, searchQuery, onSearchQueryChange, navMode, onNavSelect }, expanded = false) {
  let menu, diagram
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
          {navMode === 'search' && <InlineSearch
            autoFocus={openMenu === 'search'}
            query={searchQuery}
            open={openMenu === 'search'}
            matches={searchAreas(searchQuery)}
            placeholder="Search by areas, indications"
            emptyText="No areas or indications found"
            compact={!expanded}
            dropdownClassName="left-3 right-3"
            onOpen={() => onMenuOpen('search')}
            onQueryChange={onSearchQueryChange}
            onPick={area => { onMenuClose(); selectArea(area) }}
            onClear={() => { onSearchQueryChange(''); onMenuClose(); selectArea(null) }}
          />}
        </div>
      )
      diagram = <AreasDiagram activeArea={activeArea} onSelect={toggleArea} />
      break
    }
    case 'meridians': {
      const toggleMeridian = code => { onMenuClose(); onMeridianChange(activeMeridian === code ? null : code) }
      menu = (
        <TCMMenu
          items={MERIDIAN_ITEMS}
          placeholder="Meridian"
          activeKey={activeMeridian}
          menuOpen={openMenu === 'meridians'}
          compact={!expanded}
          onToggle={() => onMenuToggle('meridians')}
          onSelect={toggleMeridian}
          onReset={() => onMeridianChange(null)}
        />
      )
      diagram = <MeridiansDiagram activeMeridian={activeMeridian} onSelect={toggleMeridian} />
      break
    }
    // No menu of its own; its Motor and Sensory lines/labels select the same
    // shared activeArea as tile 1/1. Its head outline sits at the same
    // coordinates as tcm-scalp-areas.svg, so sharing AREAS_VIEWBOX renders
    // the head at the same size and position as tile 1/1.
    case 'motor':
      diagram = <AreasDiagram activeArea={activeArea} onSelect={toggleArea} Svg={MotorAreaMeasurementSvg} areas={MOTOR_DIAGRAM_AREAS} />
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
    </div>
  )
}

export default function HeadTCMScalpAreas({ onPointSelect }) {
  const [expandedId,     setExpandedId]     = useState(null)
  const [activeArea,     setActiveArea]     = useState(null)
  const [activeMeridian, setActiveMeridian] = useState(null)
  const [openMenu,       setOpenMenu]       = useState(null)
  const [searchQuery,    setSearchQuery]    = useState('')
  const [navMode,        setNavMode]        = useState(null) // null | 'areas' | 'search'

  // Hamburger picks: TCM Areas / Search swap the control beside the
  // hamburger and open straight away; About shows the intro in the InfoPanel.
  function selectNav(item) {
    if (item === 'areas' || item === 'search') {
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
    activeArea,
    onAreaChange: setActiveArea,
    activeMeridian,
    onMeridianChange: setActiveMeridian,
    openMenu,
    onMenuToggle: id => setOpenMenu(open => (open === id ? null : id)),
    onMenuOpen: id => setOpenMenu(id),
    onMenuClose: () => setOpenMenu(null),
    onPointSelect,
    searchQuery,
    onSearchQueryChange: setSearchQuery,
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
          const expandable = id === 'areas' || id === 'motor' || id === 'meridians'
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
        <div
          onClick={() => toggle(expandedId)}
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(99, 236, 225, 0.6)',
            cursor: 'zoom-out',
            zIndex: 20,
          }}
        >
          <div
            style={{
              viewTransitionName: `tcm-tile-${expandedId}`,
              position: 'relative',
              width: '90%',
              height: '90%',
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
              style={{
                position: 'absolute',
                top: 10,
                right: 10,
                width: 32,
                height: 32,
                borderRadius: '50%',
                border: '1px solid rgba(255,255,255,0.2)',
                background: 'rgba(0,0,0,0.5)',
                color: '#e5e7eb',
                fontSize: 18,
                lineHeight: 1,
                cursor: 'pointer',
              }}
            >×</button>
          </div>
        </div>
      )}
    </div>
  )
}
