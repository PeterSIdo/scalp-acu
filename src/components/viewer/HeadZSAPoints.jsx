import { useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import ZsaZonesBowedSvg from '../../assets/diagrams/ZSA-zones-2-bowed.svg?react'
import ZsaZonesTopSvg from '../../assets/diagrams/ZSA-zones-1-top.svg?react'
import ZsaBackZonesSvg from '../../assets/diagrams/ZSA-back-zones.svg?react'
import ZsaBackMeridiansSvg from '../../assets/diagrams/ZSA-back-meridians.svg?react'
import ZsaTopMeridiansSvg from '../../assets/diagrams/ZSA-top-meridians.svg?react'
import TileTitle from '../ui/TileTitle'
import CrossIcon from '../ui/CrossIcon'
import HamburgerMenu from '../ui/HamburgerMenu'
import InlineSearch from '../ui/InlineSearch'
import { CASE_STUDIES_ITEM } from '../../data/navItems'
import { CATEGORY_INTROS } from '../../data/categoryIntros'
import { ZSA_AREA_INFO } from '../../data/zsaAreaInfo'

// 2x3 grid, row-major (same layout as Basic Points, one extra row):
// Zones (bowed) | Zones (top) / Back Zones | Back Meridians / Top Meridians | (empty).
const TILE_IDS = ['zones-bowed', 'zones-top', 'back-zones', 'back-meridians', 'top-meridians']

const TILE_TITLES = {
  'zones-bowed': 'Zones 1',
  'zones-top': 'Zones 2',
  'back-zones': 'Zones 3',
  'back-meridians': 'Meridians Back',
  'top-meridians': 'Meridians Top',
}

const TILE_SVGS = {
  'zones-bowed': ZsaZonesBowedSvg,
  'zones-top': ZsaZonesTopSvg,
  'back-zones': ZsaBackZonesSvg,
  'back-meridians': ZsaBackMeridiansSvg,
  'top-meridians': ZsaTopMeridiansSvg,
}

// The Figma exports sit on 800x800 canvases with wide margins; crop each to its
// drawing's bounds (measured with getBBox, plus ~16px padding) so it fills the tile.
const TILE_VIEWBOXES = {
  'zones-bowed': '74 87 660 600',
  'zones-top': '52 83 647 542',
  'back-zones': '98 92 597 554',
  'back-meridians': '192 23 391 640',
  'top-meridians': '180 57 440 692',
}

const TRANSITION_STYLE = `
::view-transition-group(*) {
  animation-duration: 320ms;
  animation-timing-function: cubic-bezier(0.2, 0, 0, 1);
}
`

const FILL = { position: 'absolute', inset: 0, width: '100%', height: '100%' }

// Clickable area shapes per diagram: SVG element id → ZSA_AREA_INFO code.
// Only the coloured shapes in each file's areas group; the label/arrow paths
// (e.g. `Cervical_2`) are made click-through, so a click on a label lands on
// the area under it. Re-check the ids if a diagram is re-exported from Figma.
// The Auricle-Temporal area (AT) isn't drawn yet, so it's menu-only.
const TILE_AREAS = {
  'zones-bowed': {
    'head and face': 'HF',
    'upper limbs': 'UL',
    'lower limbs': 'LL',
    'hips': 'H',
    'shoulders': 'Sh',
    'upper abdomen': 'UA',
    'lower abdomen': 'LA',
    'frontal temporal': 'FT',
  },
  'zones-top': {
    'Head Face': 'HF',
    'Upper Jiao': 'UJ',
    'Middle Jiao': 'MJ',
    'Lower Jiao': 'LJ',
    'Cervical': 'C',
    'Vertex Perineum Foot': 'VPF',
    'Thoracic': 'T',
    'Lumbar': 'L',
    'Sacral': 'S',
  },
  'back-zones': {
    'Cervical': 'C',
    'Occipital': 'O',
    'Occipital Temporal Left': 'OT',
    'Occipital Temporal Right': 'OT',
    'Vertex Perineum Foot': 'VPF',
    'Thoracic': 'T',
    'Lumbar': 'L',
    'Sacral': 'S',
  },
}

const CLICK_THROUGH_GROUPS = ['labels', 'label', 'arrows', 'arrow']

const AREA_ITEMS = Object.entries(ZSA_AREA_INFO).map(([key, info]) => ({ key, label: info.name }))

// Search entries, one per area: its name plus the phrases of its Indications
// section, split the same way as the TCM grid's search so a hit shows just
// the phrase that matched.
const AREA_SEARCH = Object.entries(ZSA_AREA_INFO).map(([key, info]) => {
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

const NAV_ITEMS = [
  { id: 'areas', label: 'ZSA Areas' },
  { id: 'search', label: 'Search by areas, indications' },
  { id: 'about', label: "About Zhu's Scalp Acupuncture" },
  CASE_STUDIES_ITEM,
]

// Same trigger/dropdown classes as the TCM grid's menus.
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

// Area dropdown, same shape as TCMMenu in HeadTCMScalpAreas.jsx.
function AreaMenu({ activeKey, menuOpen, compact, onToggle, onSelect, onReset }) {
  const dropdownRef = useRef(null)
  const activeLabel = AREA_ITEMS.find(i => i.key === activeKey)?.label

  // Native wheel-stop so ZoomableView's own wheel handler doesn't see it.
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
          {activeLabel ?? 'ZSA Area'}
          <span className="ml-1">{menuOpen ? '▲' : '▼'}</span>
        </button>
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

      {menuOpen && (
        <div
          ref={dropdownRef}
          className={`scroll-touch absolute top-full left-0 right-0 mt-1 py-1 rounded shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-y-auto z-20 ${compact ? 'max-h-40' : 'max-h-96'}`}
        >
          {AREA_ITEMS.map(({ key, label }) => (
            <button key={key} type="button" onClick={() => onSelect(key)} className={DROPDOWN_ITEM_CLASS(activeKey === key)}>
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// A zones SVG whose area shapes are clickable. The Figma ids are on the
// rendered elements, so they're found and styled in place: the selected area
// gets an amber outline, the others fade back.
function ZonesDiagram({ id, activeArea, onSelect }) {
  const hostRef = useRef(null)
  const Diagram = TILE_SVGS[id]
  const areas = TILE_AREAS[id]

  useEffect(() => {
    const svg = hostRef.current?.querySelector('svg')
    if (!svg || !areas) return
    for (const g of CLICK_THROUGH_GROUPS) {
      const el = svg.querySelector(`[id="${g}"]`)
      if (el) el.style.pointerEvents = 'none'
    }
    for (const [elId, code] of Object.entries(areas)) {
      const el = svg.querySelector(`[id="${elId}"]`)
      if (!el) continue
      el.dataset.zsaCode = code
      el.style.cursor = 'pointer'
      el.style.transition = 'opacity 150ms ease'
      if (!activeArea) {
        el.style.opacity = ''
        el.style.stroke = ''
        el.style.strokeWidth = ''
      } else if (code === activeArea) {
        el.style.opacity = ''
        el.style.stroke = '#F59E0B'
        el.style.strokeWidth = '4'
      } else {
        el.style.opacity = '0.3'
        el.style.stroke = ''
        el.style.strokeWidth = ''
      }
    }
  }, [areas, activeArea])

  function handleClick(e) {
    const code = e.target.closest?.('[data-zsa-code]')?.dataset.zsaCode
    if (!code) return
    e.stopPropagation()
    onSelect(code)
  }

  return (
    <div ref={hostRef} onClick={handleClick} style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Diagram viewBox={TILE_VIEWBOXES[id]} style={FILL} />
    </div>
  )
}

function renderTileContent(id, { activeArea, onAreaSelect, onAreaPick, onAreaClear, openMenu, onMenuToggle, onMenuOpen, onMenuClose, onNavSelect, navMode, searchQuery, onSearchQueryChange }, expanded = false) {
  if (!TILE_SVGS[id]) return null
  // Tile 1/1 carries the menu row; it and every expanded card keep the other
  // grids' 40px top offset for it. The other grid tiles are short, so they
  // drop it and let the diagram use the full height.
  const hasMenu = id === 'zones-bowed'
  const top = expanded || hasMenu ? 40 : 4
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div style={{ position: 'absolute', top, left: 0, right: 0, bottom: expanded ? 0 : 4 }}>
        <ZonesDiagram id={id} activeArea={activeArea} onSelect={onAreaSelect} />
      </div>
      {hasMenu && (
        <div className="absolute left-0 right-0 top-0 px-3 pt-3 z-20 pointer-events-none">
          <div className="w-fit pointer-events-auto flex items-center gap-2" onClick={e => e.stopPropagation()}>
            <HamburgerMenu
              items={NAV_ITEMS}
              open={openMenu === 'nav'}
              activeId={navMode}
              dropdownClassName="left-3"
              onToggle={() => onMenuToggle('nav')}
              onSelect={onNavSelect}
            />
            {navMode === 'areas' && (
              <AreaMenu
                activeKey={activeArea}
                menuOpen={openMenu === 'areas'}
                compact={!expanded}
                onToggle={() => onMenuToggle('areas')}
                onSelect={onAreaSelect}
                onReset={onAreaClear}
              />
            )}
            {navMode === 'search' && (
              <InlineSearch
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
                onPick={code => { onMenuClose(); onAreaPick(code) }}
                onClear={() => { onSearchQueryChange(''); onMenuClose(); onAreaClear() }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function HeadZSAPoints({ onPointSelect }) {
  const [expandedId, setExpandedId] = useState(null)
  const [activeArea, setActiveArea] = useState(null)
  const [openMenu,   setOpenMenu]   = useState(null)
  const [navMode,    setNavMode]    = useState(null) // null | 'areas' | 'search'
  const [searchQuery, setSearchQuery] = useState('')

  function selectArea(code) {
    setActiveArea(code)
    onPointSelect?.(code ? ZSA_AREA_INFO[code] ?? null : null)
  }

  function selectNav(item) {
    if (item === 'areas' || item === 'search') {
      setNavMode(item)
      setOpenMenu(item)
    } else if (item === 'about') {
      setOpenMenu(null)
      setActiveArea(null)
      onPointSelect?.(CATEGORY_INTROS['zsa-zones'])
    }
  }

  const tileCtx = {
    activeArea,
    onAreaSelect: code => { setOpenMenu(null); selectArea(activeArea === code ? null : code) },
    onAreaPick: selectArea,
    onAreaClear: () => selectArea(null),
    openMenu,
    onMenuToggle: id => setOpenMenu(open => (open === id ? null : id)),
    onMenuOpen: id => setOpenMenu(id),
    onMenuClose: () => setOpenMenu(null),
    onNavSelect: selectNav,
    navMode,
    searchQuery,
    onSearchQueryChange: setSearchQuery,
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

  return (
    <div
      style={{ position: 'relative', width: '100%', height: '100%' }}
      onClick={() => openMenu && setOpenMenu(null)}
    >
      <style>{TRANSITION_STYLE}</style>

      {/* Same scrolling setup as the Y-Points grid: rows match the Basic Points
          2x2 tile size, so 3 rows need 150% + half a gap and the third scrolls
          into view. The expanded overlay below stays pinned over the visible area. */}
      <div style={{ position: 'absolute', inset: 0, overflowY: 'auto' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: 'repeat(3, 1fr)',
          gap: '1rem',
          width: '100%',
          height: 'calc(150% + 0.5rem)',
          alignContent: 'start',
        }}
      >
        {TILE_IDS.map(id => {
          const isExpanded = expandedId === id
          return (
            <div
              key={id}
              role="button"
              tabIndex={0}
              aria-label={`Expand ${id}`}
              onClick={() => toggle(id)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(id) } }}
              style={{
                viewTransitionName: isExpanded ? 'none' : `zsa-tile-${id}`,
                visibility: isExpanded ? 'hidden' : 'visible',
                minHeight: 0,
                minWidth: 0,
                border: '1px solid rgba(148, 163, 184, 0.2)',
                borderRadius: 10,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
                justifyContent: 'flex-start',
                background: '#ffffff',
                cursor: 'pointer',
                overflow: 'hidden',
                transition: 'transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.015)'; e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.5)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.2)' }}
            >
              {!isExpanded && (
                <div style={{ flex: 1, minHeight: 0, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {renderTileContent(id, tileCtx)}
                </div>
              )}
              {!isExpanded && <TileTitle>{TILE_TITLES[id]}</TileTitle>}
            </div>
          )
        })}
      </div>
      </div>

      {expandedId && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(99, 236, 225, 0.6)',
            zIndex: 20,
          }}
        >
          <div
            style={{
              viewTransitionName: `zsa-tile-${expandedId}`,
              position: 'relative',
              width: '100%',
              height: '100%',
              background: '#ffffff',
              borderRadius: 12,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
              justifyContent: 'flex-start',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
              overflow: 'hidden',
            }}
          >
            <div style={{ flex: 1, minHeight: 0, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {renderTileContent(expandedId, tileCtx, true)}
            </div>
            <TileTitle>{TILE_TITLES[expandedId]}</TileTitle>
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
