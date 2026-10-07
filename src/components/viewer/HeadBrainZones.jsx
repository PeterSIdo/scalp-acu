import { useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import BrainZonesSvg from '../../assets/diagrams/brain-zones.svg?react'
import BrainZones2Svg from '../../assets/diagrams/brain-zones2.svg?react'
import InlineSearch from '../ui/InlineSearch'
import HamburgerMenu from '../ui/HamburgerMenu'
import TileTitle from '../ui/TileTitle'

// 2x2 grid like TCM Scalp Areas, so tiles are the same size there and here.
// Row 1: brain-zones diagram with clickable zones + motor-strip body parts
// (Brain Zone and Body Part menus in its top-left corner) | brain-zones2
// photo for reference. Row 2 is left empty until more content arrives —
// add ids to TILE_IDS to fill it.
const TILE_IDS = ['zones', 'zones2']

// `num` is the conventional zone number (not shown in the menu). Zones 6–8
// are deep-layer zones and are intentionally left off the menu for now.
// `fill` identifies the zone's <path> in brain-zones.svg — the Figma export
// carries no ids or labels, so each zone is matched by its unique fill colour
// (assigned by anatomical position). Re-check these if the SVG is re-exported.
// `region` (lobe / structure) is optional and shows as the panel's grey badge.
const BRAIN_ZONES = [
  { num: 1,  name: 'Visual Area',                    fill: '#9CDCEE', region: 'Occipital lobe',  functions: 'Sight, Image recognition, Image perception' },
  { num: 2,  name: 'Association Area',               fill: '#6ECC9D', region: 'Temporal lobe',   functions: 'Short-term memory, Equilibrium, Emotion' },
  { num: 3,  name: 'Motor Function Area',            fill: '#FB5762',                            functions: 'Initiation of voluntary muscles' },
  { num: 4,  name: "Broca's Area",                   fill: '#E499D3',                            functions: 'Muscles of speech' },
  { num: 5,  name: 'Auditory Area',                  fill: '#FFC76C',                            functions: 'Hearing' },
  { num: 9,  name: 'Sensory Area',                   fill: '#74A0FF', region: 'Parietal lobe',   functions: 'Sensation from muscles and skin' },
  { num: 10, name: 'Somatosensory Association Area', fill: '#B895F5',                            functions: 'Evaluation of weight, texture, temperature, object recognition' },
  { num: 11, name: "Wernicke's Area",                fill: '#EAA2A3',                            functions: 'Written and spoken language comprehension' },
  { num: 12, name: 'Motor Function Area',            fill: '#EFF0D0', region: 'Cerebral Cortex', functions: 'Eye movement and orientation' },
  { num: 13, name: 'Higher Mental Functions',        fill: '#FFD7D7', region: 'Frontal lobe',    functions: 'Concentration, Planning, Judgement, Emotional Expression, Creativity, Inhibition' },
  { num: 14, name: 'Motor Functions',                fill: 'url(#paint0_linear_7_117)', region: 'Cerebellum', functions: 'Coordination of movement, Balance and Equilibrium, Posture' },
  { num: 15, name: 'Brain Stem',                     fill: '#9F9405' },
]

// TCM scalp-acupuncture correspondence per zone number, shown as the
// InfoPanel's "TCM Scalp Acupuncture" section. `area` = Jiao Shunfa area
// and/or WHO standard line (MS1–MS14); `note` flags weaker correspondences.
// Drafted by Claude from general knowledge — pending user verification.
const BRAIN_ZONE_TCM = {
  1:  { area: 'Vision Area; MS13 (Upper-Lateral Line of Occiput)', points: 'DU17 Naohu, BL9 Yuzhen, GB20 Fengchi', uses: ['Cortical visual loss', 'Visual disturbance'] },
  2:  { area: 'MS10 / MS11 (Anterior / Posterior Temporal Lines); Jin\'s Temporal Three Needles', points: 'GB8 Shuaigu, GB4–GB6', uses: ['Memory', 'Dizziness', 'Emotional problems'], note: 'Correspondence varies between sources.' },
  3:  { area: 'Motor Area; MS6 (Anterior Oblique Line of Vertex-Temporal)', points: 'EX-HN1 Qianshencong → GB6 Xuanli', uses: ['Contralateral paralysis: upper 1/5 leg, middle 2/5 arm, lower 2/5 face'] },
  4:  { area: 'Speech I Area (lower 2/5 of Motor Area)', uses: ['Motor (expressive) aphasia', 'Dysarthria', 'Facial paralysis'] },
  5:  { area: 'Vertigo and Hearing Area', points: 'GB8 Shuaigu; locally TB21, SI19', uses: ['Tinnitus', 'Hearing loss', 'Vertigo'] },
  9:  { area: 'Sensory Area; MS7 (Posterior Oblique Line of Vertex-Temporal)', points: 'DU20 Baihui → GB7 Qubin', uses: ['Contralateral numbness', 'Pain', 'Paraesthesia'] },
  10: { area: 'Praxis Area', uses: ['Apraxia'] },
  11: { area: 'Speech III Area (Speech II for naming difficulty)', uses: ['Sensory (receptive) aphasia'] },
  12: { area: 'No dedicated area; MS3 (Lateral Line 2 of Forehead) is used', points: 'GB15 Toulinqi, GB20 Fengchi', uses: ['Eye-movement disorders'], note: 'Loose clinical link, not a standard area.' },
  13: { area: 'MS1 (Middle Line of Forehead)', points: 'DU24 Shenting, Yintang', uses: ['Calming the Shen', 'Anxiety', 'Insomnia', 'Poor concentration'] },
  14: { area: 'Balance Area; MS14 (Lower-Lateral Line of Occiput)', points: 'BL9 Yuzhen → BL10 Tianzhu', uses: ['Ataxia', 'Balance and posture problems'] },
  15: { area: 'No scalp area; "Sea of Marrow" points', points: 'DU16 Fengfu, DU15 Yamen, GB20 Fengchi, DU20 Baihui', uses: ['Dizziness', 'Swallowing and speech problems'], note: 'Loose clinical link, not a standard area.' },
}

// Shapes a zone like a point entry so InfoPanel can show it: title = name,
// badge = region, description = functions, plus the TCM section.
const zoneToPanelItem = zone => ({
  id: `BrainZone-${zone.num}`,
  name: zone.name,
  system: 'Brain Zones',
  zone: zone.region,
  shortDescription: zone.functions,
  tcm: BRAIN_ZONE_TCM[zone.num],
})

// Motor-strip body parts, top to bottom along the red strip. Centers/radii
// are the grey <ellipse> markers baked into brain-zones.svg (viewBox
// 0 0 900 700) — the ellipses carry no ids, so they're matched by order.
const BODY_PARTS = [
  { name: 'Hip',      cx: 488,   cy: 73.5,  rx: 14,   ry: 3.5 },
  { name: 'Trunk',    cx: 477,   cy: 88,    rx: 14,   ry: 3   },
  { name: 'Shoulder', cx: 465,   cy: 102.5, rx: 18,   ry: 3.5 },
  { name: 'Arm',      cx: 447,   cy: 124.5, rx: 20,   ry: 4.5 },
  { name: 'Wrist',    cx: 435.5, cy: 150,   rx: 20.5, ry: 6   },
  { name: 'Hand',     cx: 420,   cy: 175.5, rx: 21,   ry: 6.5 },
  { name: 'Fingers',  cx: 410.5, cy: 194.5, rx: 17.5, ry: 6.5 },
  { name: 'Thumb',    cx: 400.5, cy: 211.5, rx: 17.5, ry: 6.5 },
  { name: 'Face',     cx: 392.5, cy: 229.5, rx: 18.5, ry: 6.5 },
  { name: 'Lips',     cx: 388.5, cy: 249.5, rx: 18.5, ry: 6.5 },
  { name: 'Jaw',      cx: 382.5, cy: 270.5, rx: 16.5, ry: 6.5 },
  { name: 'Tongue',   cx: 381.5, cy: 296.5, rx: 16.5, ry: 6.5 },
]

// Scoped so it only affects transitions started while this screen is mounted.
const TRANSITION_STYLE = `
::view-transition-group(*) {
  animation-duration: 320ms;
  animation-timing-function: cubic-bezier(0.2, 0, 0, 1);
}

/* Dropdown: touch-swipe scrolling, no visible scrollbar. */
.brain-dropdown-scroll {
  scrollbar-width: none;
  -ms-overflow-style: none;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-y;
  overscroll-behavior: contain;
}
.brain-dropdown-scroll::-webkit-scrollbar {
  display: none;
}`

// Same trigger colours as TCM Scalp Areas / Basic Points: black when idle,
// red when a selection is active or the menu is open.
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
// drawing's own canvas. Only tiles with a real diagram get one.
const TILE_TITLES = {
  zones: 'Brain Zones and Functions',
  zones2: 'Brain Zones',
}


// Same pulsing highlight + name label as the Abdominal Diagnostic Map
// (NeckMeridianMap), but traced around each ellipse instead of a circle.
// Clicking an ellipse (or the selected one again to clear it) shares state
// with the Body Part dropdown.
//
// Zones work the same way against the Brain Zone dropdown: clicks are
// hit-tested against the SVG's own zone paths (isPointInFill, topmost first),
// the selected zone gets a pulsing outline traced from its path data and the
// other zones are dimmed. Clicks outside any zone bubble up to the tile.
function BrainZonesMap({ activeZone, onZoneChange, activePart, onPartChange }) {
  const [hovered, setHovered] = useState(null)
  const [zoneCursor, setZoneCursor] = useState(false)
  const svgWrapRef = useRef(null)
  const zoneOutlineRef = useRef(null)
  const part = BODY_PARTS.find(p => p.name === activePart)

  // Zone paths in topmost-first (reverse document) order, so overlapping
  // edges resolve to the zone that's actually drawn on top.
  function zonePaths() {
    const root = svgWrapRef.current
    if (!root) return []
    return BRAIN_ZONES
      .map(zone => ({ zone, el: root.querySelector(`path[fill="${zone.fill}"]`) }))
      .filter(z => z.el)
      .sort((a, b) => (a.el.compareDocumentPosition(b.el) & Node.DOCUMENT_POSITION_FOLLOWING ? 1 : -1))
  }

  function zoneAt(e) {
    for (const { zone, el } of zonePaths()) {
      const ctm = el.getScreenCTM()
      if (!ctm) continue
      const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse())
      if (el.isPointInFill(pt)) return zone
    }
    return null
  }

  // Dimming and the outline's path data both live in the SVG DOM (the zone
  // paths have no React handle), so they're written directly here.
  useEffect(() => {
    let d = null
    for (const { zone, el } of zonePaths()) {
      el.style.transition = 'opacity 200ms ease'
      el.style.opacity = activeZone != null && zone.num !== activeZone ? '0.35' : ''
      if (zone.num === activeZone) d = el.getAttribute('d')
    }
    const outline = zoneOutlineRef.current
    if (!outline) return
    outline.style.display = d ? '' : 'none'
    outline.querySelectorAll('path').forEach(p => (d ? p.setAttribute('d', d) : p.removeAttribute('d')))
  }, [activeZone])

  function handleClick(e) {
    const zone = zoneAt(e)
    if (!zone) return
    e.stopPropagation()
    onZoneChange(activeZone === zone.num ? null : zone.num)
  }

  const pad   = 8
  const fSize = 16
  const w     = part ? part.name.length * 9 + pad * 2 : 0
  const h     = fSize + pad * 2

  return (
    <div
      ref={svgWrapRef}
      onClick={handleClick}
      onMouseMove={e => setZoneCursor(!!zoneAt(e))}
      onMouseLeave={() => setZoneCursor(false)}
      style={{ position: 'relative', width: '100%', height: '100%', cursor: zoneCursor ? 'pointer' : undefined }}
    >
      <BrainZonesSvg
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        preserveAspectRatio="xMidYMid meet"
      />

      <svg
        viewBox="0 0 900 700"
        preserveAspectRatio="xMidYMid meet"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      >
        <g ref={zoneOutlineRef} pointerEvents="none" style={{ display: 'none' }}>
          <path fill="none" stroke="#ffffff" strokeWidth="4" strokeLinejoin="round" />
          <path fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinejoin="round">
            <animate attributeName="stroke-width" values="2.5;7;2.5" dur="1.6s" repeatCount="indefinite" />
            <animate attributeName="opacity"      values="1;0.3;1"   dur="1.6s" repeatCount="indefinite" />
          </path>
        </g>

        {/* Hit targets — padded past the thin ellipses, but not so far that
            neighbours (as little as ~15 units apart) overlap much. */}
        {BODY_PARTS.map(p => (
          <g
            key={p.name}
            onClick={e => { e.stopPropagation(); onPartChange(activePart === p.name ? null : p.name) }}
            onMouseEnter={() => setHovered(p.name)}
            onMouseLeave={() => setHovered(null)}
            style={{ cursor: 'pointer', pointerEvents: 'auto' }}
          >
            {hovered === p.name && activePart !== p.name && (
              <ellipse cx={p.cx} cy={p.cy} rx={p.rx + 2} ry={p.ry + 2} fill="#ffffff" opacity="0.6" />
            )}
            <ellipse cx={p.cx} cy={p.cy} rx={p.rx + 4} ry={Math.max(p.ry + 3, 7)} fill="transparent" />
          </g>
        ))}

        {part && (
          <g pointerEvents="none">
            <ellipse cx={part.cx} cy={part.cy} rx={part.rx + 1} ry={part.ry + 1} fill="#fbbf24" stroke="#ffffff" strokeWidth="1.5" />
            <ellipse cx={part.cx} cy={part.cy} rx={part.rx + 3} ry={part.ry + 3} fill="none" stroke="#ffffff" strokeWidth="2.5">
              <animate attributeName="rx"      values={`${part.rx + 3};${part.rx + 14};${part.rx + 3}`} dur="1.6s" repeatCount="indefinite" />
              <animate attributeName="ry"      values={`${part.ry + 3};${part.ry + 14};${part.ry + 3}`} dur="1.6s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.9;0;0.9" dur="1.6s" repeatCount="indefinite" />
            </ellipse>
            {/* Label sits right of the strip, over the blue sensory zone. */}
            <rect x={part.cx + part.rx + 16} y={part.cy - h / 2} width={w} height={h} rx={5} fill="rgba(0,0,0,0.72)" />
            <text x={part.cx + part.rx + 16 + pad} y={part.cy - h / 2 + fSize + pad * 0.6} fontSize={fSize} fill="white" fontFamily="system-ui, sans-serif">
              {part.name}
            </text>
          </g>
        )}
      </svg>
    </div>
  )
}

// Same trigger+dropdown shape as TCM Scalp Areas' TCMMenu: the dropdown
// spans the whole menu row above the diagram. Used by the Brain Zone and
// Body Part menus; `items` are { key, label }.
function DropdownMenu({ items, placeholder, activeKey, menuOpen, onToggle, onSelect, onReset, compact }) {
  const dropdownRef = useRef(null)

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

  const active = items.find(i => i.key === activeKey)

  return (
    <div onClick={e => e.stopPropagation()}>
      <div className="flex items-center gap-1.5">
        <button type="button" onClick={onToggle} className={TRIGGER_CLASS(!!active || menuOpen)}>
          {active ? active.label : placeholder}
          <span className="ml-1">{menuOpen ? '▲' : '▼'}</span>
        </button>
        {active && (
          <button
            type="button"
            onClick={onReset}
            aria-label={`Clear ${placeholder.toLowerCase()} selection`}
            className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs leading-none font-bold shadow-sm transition-colors"
          >
            ×
          </button>
        )}
      </div>

      {menuOpen && (
        <div
          ref={dropdownRef}
          className={`brain-dropdown-scroll absolute top-full left-0 right-0 mt-1 py-1 rounded shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-y-auto z-20 ${compact ? 'max-h-40' : 'max-h-96'}`}
        >
          {items.map(item => (
            <button key={item.key} type="button" onClick={() => onSelect(item.key)} className={DROPDOWN_ITEM_CLASS(activeKey === item.key)}>
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const ZONE_ITEMS = BRAIN_ZONES.map(z => ({ key: z.num, label: z.name }))
const PART_ITEMS = BODY_PARTS.map(p => ({ key: p.name, label: p.name }))

// Search entries: each zone's name + phrases from its functions and TCM uses,
// then the motor-strip body parts by name. Keys are prefixed so a pick knows
// which selection to set.
const ZONE_SEARCH = BRAIN_ZONES.map(z => ({
  key: `zone:${z.num}`,
  name: z.name,
  phrases: [
    ...(z.functions ?? '').split(/,\s*/),
    ...(BRAIN_ZONE_TCM[z.num]?.uses ?? []),
  ].map(t => t.trim()).filter(Boolean),
}))

function searchBrainZones(query) {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const zones = ZONE_SEARCH.flatMap(({ key, name, phrases }) => {
    if (name.toLowerCase().includes(q)) return [{ key, name, hit: null }]
    const hit = phrases.find(t => t.toLowerCase().includes(q))
    return hit ? [{ key, name, hit }] : []
  })
  const parts = BODY_PARTS
    .filter(p => p.name.toLowerCase().includes(q))
    .map(p => ({ key: `part:${p.name}`, name: p.name, hit: 'Body part (motor strip)' }))
  return [...zones, ...parts]
}

// Hamburger menu items — same flow as the other grids. No About entry yet
// (there is no Brain Zones category intro to show) and no Case Studies.
const NAV_ITEMS = [
  { id: 'zones',  label: 'Brain Zones' },
  { id: 'parts',  label: 'Body Parts' },
  { id: 'search', label: 'Search by zones, functions' },
]

// Same layout as TCM Scalp Areas' tile 1/1: menu row (menus + search) above
// the diagram rather than floating over it.
function renderTileContent(id, { activeZone, onZoneChange, activePart, onPartChange, openMenu, onMenuToggle, onMenuOpen, onMenuClose, searchQuery, onSearchQueryChange, navMode, onNavSelect }, expanded = false) {
  switch (id) {
    case 'zones': {
      const pick = key => {
        onMenuClose()
        const [kind, value] = key.split(/:(.*)/)
        if (kind === 'zone') onZoneChange(Number(value))
        else onPartChange(value)
      }
      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div className="relative px-3 pt-3 pb-1 flex-shrink-0 z-20" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2">
              <HamburgerMenu
                items={NAV_ITEMS}
                open={openMenu === 'nav'}
                activeId={navMode}
                dropdownClassName="left-3"
                onToggle={() => onMenuToggle('nav')}
                onSelect={onNavSelect}
              />
              {navMode === 'zones' && <DropdownMenu
                items={ZONE_ITEMS}
                placeholder="Brain Zone"
                activeKey={activeZone}
                menuOpen={openMenu === 'zones'}
                compact={!expanded}
                onToggle={() => onMenuToggle('zones')}
                onSelect={num => { onMenuClose(); onZoneChange(activeZone === num ? null : num) }}
                onReset={() => onZoneChange(null)}
              />}
              {navMode === 'parts' && <DropdownMenu
                items={PART_ITEMS}
                placeholder="Body Part"
                activeKey={activePart}
                menuOpen={openMenu === 'parts'}
                compact={!expanded}
                onToggle={() => onMenuToggle('parts')}
                onSelect={name => { onMenuClose(); onPartChange(activePart === name ? null : name) }}
                onReset={() => onPartChange(null)}
              />}
              {navMode === 'search' && <InlineSearch
                autoFocus={openMenu === 'search'}
                query={searchQuery}
                open={openMenu === 'search'}
                matches={searchBrainZones(searchQuery)}
                placeholder="Search by zones, functions"
                emptyText="No zones or functions found"
                compact={!expanded}
                dropdownClassName="left-3 right-3"
                onOpen={() => onMenuOpen('search')}
                onQueryChange={onSearchQueryChange}
                onPick={pick}
                onClear={() => { onSearchQueryChange(''); onMenuClose(); onZoneChange(null); onPartChange(null) }}
              />}
            </div>
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <BrainZonesMap activeZone={activeZone} onZoneChange={onZoneChange} activePart={activePart} onPartChange={onPartChange} />
          </div>
        </div>
      )
    }
    case 'zones2':
      return <BrainZones2Svg style={{ width: '100%', height: '100%' }} />
    default:
      return null
  }
}

export default function HeadBrainZones({ onPointSelect }) {
  const [expandedId, setExpandedId] = useState(null)
  const [activeZone, setActiveZone] = useState(null)
  const [activePart, setActivePart] = useState(null)
  const [openMenu,   setOpenMenu]   = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [navMode,    setNavMode]    = useState(null) // null | 'zones' | 'parts' | 'search'

  // Hamburger picks swap the control beside the hamburger and open it.
  function selectNav(item) {
    setNavMode(item)
    setOpenMenu(item)
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

  // Menu and diagram clicks both land here, so the side panel / mobile sheet
  // (same InfoPanel the YNSA points use) always follows the selected zone.
  function handleZoneChange(num) {
    setActiveZone(num)
    const zone = BRAIN_ZONES.find(z => z.num === num)
    onPointSelect?.(zone ? zoneToPanelItem(zone) : null)
  }

  const tileCtx = {
    activeZone,
    onZoneChange: handleZoneChange,
    activePart,
    onPartChange: setActivePart,
    openMenu,
    onMenuToggle: menu => setOpenMenu(open => (open === menu ? null : menu)),
    onMenuOpen: menu => setOpenMenu(menu),
    onMenuClose: () => setOpenMenu(null),
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
          const expandable = id === 'zones' || id === 'zones2'
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
                viewTransitionName: isExpanded ? 'none' : `brain-tile-${id}`,
                visibility: isExpanded ? 'hidden' : 'visible',
                minHeight: 0,
                minWidth: 0,
                border: expandable ? '1px solid rgba(148, 163, 184, 0.2)' : 'none',
                borderRadius: 10,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
                justifyContent: TILE_TITLES[id] ? 'flex-start' : 'center',
                background: (id === 'zones' || id === 'zones2') ? '#ffffff' : expandable ? '#ffffff' : 'transparent',
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
              viewTransitionName: `brain-tile-${expandedId}`,
              position: 'relative',
              width: '90%',
              height: '90%',
              background: (expandedId === 'zones' || expandedId === 'zones2') ? '#ffffff' : '#f1f5f9',
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
