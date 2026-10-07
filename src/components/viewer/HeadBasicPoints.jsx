import { useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import HeadLateral from './HeadLateral'
import HeadFrontal from './HeadFrontal'
import HeadPosterior from './HeadPosterior'
import { allPoints } from '../../data/points'
import { CATEGORY_INTROS } from '../../data/categoryIntros'
import InlineSearch from '../ui/InlineSearch'
import HamburgerMenu from '../ui/HamburgerMenu'
import TileTitle from '../ui/TileTitle'
import { CASE_STUDIES_ITEM } from '../../data/navItems'
import { ZONES, ZONE_INFO, zoneOf } from '../../data/basicZones'

// 2x2 grid, row-major: menu (outline head + controls) | Lateral / Frontal | Posterior.
const TILE_IDS = ['menu', 'lateral', 'frontal', 'posterior']

// Every tile carries the same bottom title strip (TileTitle); the body
// above it centres the tile's diagram/menu content.
const TILE_TITLE = 'Basic Points'
const TILE_BODY_STYLE = { flex: 1, minHeight: 0, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }

// Scoped so it only affects transitions started while this screen is mounted.
const TRANSITION_STYLE = `
::view-transition-group(*) {
  animation-duration: 320ms;
  animation-timing-function: cubic-bezier(0.2, 0, 0, 1);
}

/* Zone dropdown: touch-swipe scrolling, no visible scrollbar. */
.zone-dropdown-scroll {
  scrollbar-width: none;
  -ms-overflow-style: none;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-y;
  overscroll-behavior: contain;
}
.zone-dropdown-scroll::-webkit-scrollbar {
  display: none;
}`

const TRIGGER_CLASS = (active) => `inline-flex items-center gap-1 w-28 text-xs font-semibold px-2 py-1 rounded bg-[#63ECE1] transition-colors ${
  active
    ? 'text-red-700'
    : 'text-black hover:text-red-700'
}`

const DROPDOWN_ITEM_CLASS = (active) => `block w-full text-left px-3 py-1.5 transition-colors ${
  active
    ? 'text-amber-500 dark:text-amber-400'
    : 'text-gray-600 dark:text-gray-300 hover:text-amber-500 dark:hover:text-amber-400'
}`

// Same trigger+dropdown shape as Y-Points' MeridianMenu, but listing the nine
// Basic Point zone letters (A–I) instead of meridian names.
function BasicPointMenu({ activeZone, menuOpen, onToggle, onSelect, onReset, compact }) {
  const dropdownRef = useRef(null)

  // Native (non-React) listener, registered directly on the dropdown node —
  // mirrors ZoomableView's own { passive: false } wheel listener. ZoomableView
  // attaches its zoom handler straight to a DOM node too, so it sees this wheel
  // event during the real DOM bubble phase *before* React's root-delegated
  // onWheel would ever fire; calling stopPropagation from a React handler is
  // too late to stop it. Stopping it here, at the real source, is what
  // actually prevents the whole diagram from zooming while the list scrolls.
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
    // No position/width classes here on purpose — the trigger sizes to its
    // own content so it sits tight against the Search trigger next to it
    // (same close grouping as Y-Points' Meridian/Search pair), and the
    // dropdown below anchors to the shared row wrapper instead (see its
    // left-0 right-0 comment) rather than stretching this div to the tile's
    // full width the way an earlier version did.
    <div onClick={e => e.stopPropagation()}>
      <div className="flex items-center gap-1.5">
        <button type="button" onClick={onToggle} className={TRIGGER_CLASS(!!activeZone || menuOpen)}>
          <span className="flex-1 min-w-0 truncate text-left">{activeZone ?? 'Basic Point'}</span>
          <span>{menuOpen ? '▲' : '▼'}</span>
        </button>
        {/* Fixed-size slot so the clear button appearing doesn't shift Search sideways. */}
        <span className="w-5 h-5 flex-shrink-0">
          {activeZone && (
            <button
              type="button"
              onClick={onReset}
              aria-label="Clear zone filter"
              className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs leading-none font-bold shadow-sm transition-colors"
            >
              ×
            </button>
          )}
        </span>
      </div>

      {menuOpen && (
        // left-0 right-0 (not w-full of this now-content-sized trigger div) —
        // this div lost its own `relative`, so its nearest positioned
        // ancestor is the shared row wrapper in renderTileContent (itself
        // `absolute left-3 right-3 top-3`), and the dropdown spans THAT
        // width instead. Same no-spill guarantee as before (dropdown can't
        // spill into the neighbouring grid tile), just anchored one level
        // higher up so the trigger itself can shrink to content width.
        <div
          ref={dropdownRef}
          className={`zone-dropdown-scroll absolute top-full left-0 right-0 mt-1 py-1 rounded shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-y-auto z-20 ${compact ? 'max-h-40' : 'max-h-96'}`}
        >
          {ZONES.map(z => (
            <button key={z} type="button" onClick={() => onSelect(z)} className={DROPDOWN_ITEM_CLASS(activeZone === z)}>
              <span className="text-xs font-semibold">{z}</span>
              <span className="block text-[11px] font-normal leading-snug text-gray-500 dark:text-gray-400">
                {ZONE_INFO[z]}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// Hamburger menu items. Basic Points / Search swap the control shown beside
// the hamburger; About opens the category intro in the InfoPanel.
const NAV_ITEMS = [
  { id: 'basic',  label: 'Basic Points' },
  { id: 'search', label: 'Search by indications' },
  { id: 'about',  label: 'About Basic Points' },
  CASE_STUDIES_ITEM,
]

// Search matches indication text (e.g. "vertigo", "whiplash"). Sub-points
// within a zone share identical indications text, so results are deduped to
// one entry per matching zone.
function searchZones(query) {
  const q = query.trim().toLowerCase()
  if (!q) return []
  return Object.values(
    allPoints
      .filter(p => zoneOf(p.id) && p.indications?.some(ind => ind.toLowerCase().includes(q)))
      .reduce((acc, p) => {
        const zone = zoneOf(p.id)
        if (!acc[zone]) acc[zone] = { key: zone, name: zone, hit: p.indications.find(ind => ind.toLowerCase().includes(q)) }
        return acc
      }, {})
  )
}

// activeZone/onZoneChange are shared across all three diagram tiles — selecting
// a zone from the menu, or clicking any point on any tile, flashes every point
// in that zone across the other tiles too (same idea as Y-Points' activeMeridian).
function renderTileContent(id, { activeZone, onZoneChange, onPointSelect, highlightJsonId, pointFilter, openPanel, onPanelToggle, onPanelOpen, onPanelClose, searchQuery, onSearchQueryChange, navMode, onNavSelect }, expanded = false) {
  switch (id) {
    case 'menu':
      return (
        <div className="relative w-full h-full">
          {/* Line-art lateral head behind the controls — same points/zone
              flash as the Lateral tile, just the basic-side-outline.svg art. */}
          <HeadLateral variant="outline" onPointSelect={onPointSelect} highlightJsonId={highlightJsonId} pointFilter={pointFilter} activeSubgroup="ynsa-basic" activeZone={activeZone} onZoneChange={onZoneChange} />
          <div className="absolute left-3 right-3 top-3 flex items-center gap-2" onClick={e => e.stopPropagation()}>
            <HamburgerMenu
              items={NAV_ITEMS}
              open={openPanel === 'nav'}
              activeId={navMode}
              onToggle={() => onPanelToggle('nav')}
              onSelect={onNavSelect}
            />
            {navMode === 'basic' && <BasicPointMenu
              activeZone={activeZone}
              menuOpen={openPanel === 'menu'}
              compact={!expanded}
              onToggle={() => onPanelToggle('menu')}
              onSelect={z => {
                // Picking a zone from the dropdown shows the exact same point
                // record — same name, badges, reaction area, location, full
                // description, indications — that clicking that zone's point
                // on the Lateral/Frontal/Posterior tile would show. All of a
                // zone's sub-points (A1..A8, D1..D6, etc.) share identical
                // descriptive text, so the first match is a faithful stand-in.
                const nextZone = activeZone === z ? null : z
                onPanelClose()
                onZoneChange(nextZone)
                onPointSelect?.(nextZone ? allPoints.find(p => zoneOf(p.id) === nextZone) ?? null : null)
              }}
              onReset={() => { onZoneChange(null); onPointSelect?.(null) }}
            />}
            {navMode === 'search' && <InlineSearch
              autoFocus={openPanel === 'search'}
              query={searchQuery}
              open={openPanel === 'search'}
              matches={searchZones(searchQuery)}
              placeholder="Search by indications"
              emptyText="No indications found"
              compact={!expanded}
              onOpen={() => onPanelOpen('search')}
              onQueryChange={onSearchQueryChange}
              onPick={z => {
                onPanelClose()
                onZoneChange(z)
                onPointSelect?.(allPoints.find(p => zoneOf(p.id) === z) ?? null)
              }}
              onClear={() => {
                onSearchQueryChange('')
                onPanelClose()
                onZoneChange(null)
                onPointSelect?.(null)
              }}
            />}
          </div>
        </div>
      )
    case 'lateral':
      return <HeadLateral onPointSelect={onPointSelect} highlightJsonId={highlightJsonId} pointFilter={pointFilter} activeSubgroup="ynsa-basic" activeZone={activeZone} onZoneChange={onZoneChange} />
    case 'frontal':
      return <HeadFrontal onPointSelect={onPointSelect} highlightJsonId={highlightJsonId} pointFilter={pointFilter} activeSubgroup="ynsa-basic" activeZone={activeZone} onZoneChange={onZoneChange} />
    case 'posterior':
      return <HeadPosterior onPointSelect={onPointSelect} highlightJsonId={highlightJsonId} pointFilter={pointFilter} activeSubgroup="ynsa-basic" activeZone={activeZone} onZoneChange={onZoneChange} />
    default:
      return null
  }
}

export default function HeadBasicPoints({ onPointSelect, highlightJsonId = null, pointFilter = null }) {
  const [expandedId,  setExpandedId]  = useState(null)
  const [activeZone,  setActiveZone]  = useState(null)
  const [openPanel,   setOpenPanel]   = useState(null) // null | 'nav' | 'menu' | 'search'
  const [searchQuery, setSearchQuery] = useState('')
  const [navMode,     setNavMode]     = useState(null) // null | 'basic' | 'search'

  // Hamburger picks: Basic Points / Search swap the control next to the
  // hamburger and open it straight away; About shows the intro in the InfoPanel.
  function selectNav(item) {
    if (item === 'basic') {
      setNavMode('basic')
      setOpenPanel('menu')
    } else if (item === 'search') {
      setNavMode('search')
      setOpenPanel('search')
    } else if (item === 'about') {
      setOpenPanel(null)
      setActiveZone(null)
      onPointSelect?.(CATEGORY_INTROS['ynsa-basic'])
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

  // A search hit flashes its zone across the grid too, same as a manual
  // dropdown/point selection — falls back only while no explicit zone is set.
  const searchZone = highlightJsonId ? zoneOf(highlightJsonId) : null
  const effectiveZone = activeZone ?? searchZone

  const tileCtx = {
    activeZone: effectiveZone,
    onZoneChange: setActiveZone,
    onPointSelect,
    highlightJsonId,
    pointFilter,
    openPanel,
    onPanelToggle: panel => setOpenPanel(p => p === panel ? null : panel),
    onPanelOpen: panel => setOpenPanel(panel),
    onPanelClose: () => setOpenPanel(null),
    searchQuery,
    onSearchQueryChange: setSearchQuery,
    navMode,
    onNavSelect: selectNav,
  }

  return (
    <div
      style={{ position: 'relative', width: '100%', height: '100%' }}
      onClick={() => openPanel && setOpenPanel(null)}
    >
      <style>{TRANSITION_STYLE}</style>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: '1fr 1fr',
          gap: '1rem',
          width: '100%',
          height: '100%',
        }}
      >
        {TILE_IDS.map(id => {
          const expandable = true
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
                viewTransitionName: isExpanded ? 'none' : `basic-tile-${id}`,
                visibility: isExpanded ? 'hidden' : 'visible',
                minHeight: 0,
                minWidth: 0,
                border: '1px solid rgba(148, 163, 184, 0.2)',
                borderRadius: 10,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
                background: '#ffffff',
                cursor: expandable ? 'pointer' : 'default',
                overflow: id === 'menu' ? 'visible' : 'hidden',
                transition: 'transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease',
              }}
              onMouseEnter={e => { if (expandable) { e.currentTarget.style.transform = 'scale(1.015)'; e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.5)' } }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.2)' }}
            >
              {!isExpanded && (
                <>
                  <div style={TILE_BODY_STYLE}>{content}</div>
                  <TileTitle className="rounded-b-[9px]">{TILE_TITLE}</TileTitle>
                </>
              )}
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
              viewTransitionName: `basic-tile-${expandedId}`,
              position: 'relative',
              width: '90%',
              height: '90%',
              background: '#ffffff',
              borderRadius: 12,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
              overflow: expandedId === 'menu' ? 'visible' : 'hidden',
            }}
          >
            <div style={TILE_BODY_STYLE}>{renderTileContent(expandedId, tileCtx, true)}</div>
            <TileTitle className="rounded-b-[11px]">{TILE_TITLE}</TileTitle>
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
