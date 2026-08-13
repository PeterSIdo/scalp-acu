import { useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import HeadLateral from './HeadLateral'
import HeadFrontal from './HeadFrontal'
import HeadPosterior from './HeadPosterior'
import { allPoints } from '../../data/points'
import { ZONES, ZONE_INFO, zoneOf } from '../../data/basicZones'

// 2x2 grid, row-major: menu | Lateral / Frontal | Posterior.
const TILE_IDS = ['menu', 'lateral', 'frontal', 'posterior']

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

const TRIGGER_CLASS = (active) => `text-xs font-semibold transition-colors ${
  active
    ? 'text-amber-500 dark:text-amber-400'
    : 'text-gray-600 dark:text-gray-300 hover:text-amber-500 dark:hover:text-amber-400'
}`

const DROPDOWN_ITEM_CLASS = (active) => `block w-full text-left px-3 py-1.5 transition-colors ${
  active
    ? 'text-amber-500 dark:text-amber-400'
    : 'text-gray-600 dark:text-gray-300 hover:text-amber-500 dark:hover:text-amber-400'
}`

// Same trigger+dropdown shape as Y-Points' MeridianMenu, but listing the nine
// Basic Point zone letters (A–I) instead of meridian names.
function BasicPointMenu({ activeZone, menuOpen, onToggle, onSelect, onReset }) {
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
    <div className="relative w-full" onClick={e => e.stopPropagation()}>
      <div className="flex items-center gap-1.5">
        <button type="button" onClick={onToggle} className={TRIGGER_CLASS(!!activeZone || menuOpen)}>
          {activeZone ?? 'Basic Point'}
          <span className="ml-1">{menuOpen ? '▲' : '▼'}</span>
        </button>
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
      </div>

      {menuOpen && (
        // Width tracks the tile itself (via the w-full chain up to the tile's
        // own left-3/right-3 wrapper) instead of a fixed px value, so on a
        // narrow mobile tile the dropdown can't spill into the neighbouring
        // grid pane the way a fixed w-64 did.
        <div
          ref={dropdownRef}
          className="zone-dropdown-scroll absolute top-full left-0 mt-1 py-1 rounded shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 w-full max-h-40 overflow-y-auto z-20"
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

// activeZone/onZoneChange are shared across all three diagram tiles — selecting
// a zone from the menu, or clicking any point on any tile, flashes every point
// in that zone across the other tiles too (same idea as Y-Points' activeMeridian).
function renderTileContent(id, { activeZone, onZoneChange, onPointSelect, highlightJsonId, pointFilter, menuOpen, onMenuToggle }) {
  switch (id) {
    case 'menu':
      return (
        <div className="relative w-full h-full">
          <div className="absolute left-3 right-3 top-3">
            <BasicPointMenu
              activeZone={activeZone}
              menuOpen={menuOpen}
              onToggle={onMenuToggle}
              onSelect={z => {
                // Picking a zone from the dropdown shows the exact same point
                // record — same name, badges, reaction area, location, full
                // description, indications — that clicking that zone's point
                // on the Lateral/Frontal/Posterior tile would show. All of a
                // zone's sub-points (A1..A8, D1..D6, etc.) share identical
                // descriptive text, so the first match is a faithful stand-in.
                const nextZone = activeZone === z ? null : z
                onZoneChange(nextZone)
                onPointSelect?.(nextZone ? allPoints.find(p => zoneOf(p.id) === nextZone) ?? null : null)
              }}
              onReset={() => { onZoneChange(null); onPointSelect?.(null) }}
            />
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
  const [expandedId, setExpandedId] = useState(null)
  const [activeZone, setActiveZone] = useState(null)
  const [menuOpen,   setMenuOpen]   = useState(false)

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
    menuOpen,
    onMenuToggle: () => setMenuOpen(o => !o),
  }

  return (
    <div
      style={{ position: 'relative', width: '100%', height: '100%' }}
      onClick={() => menuOpen && setMenuOpen(false)}
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
          const content = renderTileContent(id, tileCtx)
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
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(148, 163, 184, 0.06)',
                cursor: expandable ? 'pointer' : 'default',
                overflow: id === 'menu' ? 'visible' : 'hidden',
                transition: 'transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease',
              }}
              onMouseEnter={e => { if (expandable) { e.currentTarget.style.transform = 'scale(1.015)'; e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.5)' } }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.2)' }}
            >
              {!isExpanded && content}
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
            background: 'rgba(0, 0, 0, 0.6)',
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
              background: '#111827',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
              overflow: expandedId === 'menu' ? 'visible' : 'hidden',
            }}
          >
            {renderTileContent(expandedId, tileCtx)}
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
