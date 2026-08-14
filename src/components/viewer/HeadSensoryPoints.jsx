import { useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import HeadLateral from './HeadLateral'
import HeadFrontal from './HeadFrontal'
import HeadPosterior from './HeadPosterior'
import { allPoints } from '../../data/points'

// 2x2 grid, row-major: menu | Lateral / Frontal | Posterior. Same shape and
// tile order as HeadBasicPoints.
const TILE_IDS = ['menu', 'lateral', 'frontal', 'posterior']

// The six sensory points, in the same order as ViewerPage's
// SUBGROUP_POINT_IDS['ynsa-sensory']. Unlike Basic Points' zone letters
// (each covering many sub-points, e.g. A1..A8), each sensory point is
// already its own single JSON record — no zone-style grouping/lookup layer
// needed, the menu/search just select one of these ids directly.
const SENSORY_POINT_IDS = [
  'YNSA-Eye', 'YNSA-Nose', 'YNSA-Mouth', 'YNSA-Ear',
  'YNSA-Extra-Ear-Yin', 'YNSA-Extra-Ear-Yang',
]

// Trigger label is the point's short name (drop " Point" wherever it
// appears — trailing for most records, e.g. "Eye Point" -> "Eye", but
// mid-string for the Extra Ear pair, e.g. "Extra Ear Point Yin" -> "Extra
// Ear Yin") so it stays compact next to the Search trigger, matching Basic
// Point's single-letter trigger.
const shortLabel = name => name?.replace(/ Point\b/, '') ?? ''

// Scoped so it only affects transitions started while this screen is mounted.
const TRANSITION_STYLE = `
::view-transition-group(*) {
  animation-duration: 320ms;
  animation-timing-function: cubic-bezier(0.2, 0, 0, 1);
}

/* Dropdown: touch-swipe scrolling, no visible scrollbar. */
.sensory-dropdown-scroll {
  scrollbar-width: none;
  -ms-overflow-style: none;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-y;
  overscroll-behavior: contain;
}
.sensory-dropdown-scroll::-webkit-scrollbar {
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

// Same trigger+dropdown shape as Basic Points' BasicPointMenu, but listing
// the six sensory points by name instead of zone letters.
function SensoryPointMenu({ activePointId, menuOpen, onToggle, onSelect, onReset }) {
  const dropdownRef = useRef(null)
  const activePoint = activePointId ? allPoints.find(p => p.id === activePointId) : null

  // Same native (non-React) wheel-stop treatment as Basic Points' zone
  // dropdown — see that component for why a React onWheel prop isn't enough
  // to stop ZoomableView's own DOM-level wheel-to-zoom handler.
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
        <button type="button" onClick={onToggle} className={TRIGGER_CLASS(!!activePointId || menuOpen)}>
          {activePoint ? shortLabel(activePoint.name) : 'Sensory Point'}
          <span className="ml-1">{menuOpen ? '▲' : '▼'}</span>
        </button>
        {activePointId && (
          <button
            type="button"
            onClick={onReset}
            aria-label="Clear point filter"
            className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs leading-none font-bold shadow-sm transition-colors"
          >
            ×
          </button>
        )}
      </div>

      {menuOpen && (
        // left-0 right-0 against the shared row wrapper in renderTileContent
        // (itself absolute left-3 right-3 top-3) rather than w-full of this
        // trigger's own div — same no-spill guarantee as Basic Points' zone
        // dropdown, anchored one level up so the trigger can shrink to
        // content width and sit close to the Search trigger next to it.
        <div
          ref={dropdownRef}
          className="sensory-dropdown-scroll absolute top-full left-0 right-0 mt-1 py-1 rounded shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 max-h-40 overflow-y-auto z-20"
        >
          {SENSORY_POINT_IDS.map(id => {
            const point = allPoints.find(p => p.id === id)
            if (!point) return null
            return (
              <button key={id} type="button" onClick={() => onSelect(id)} className={DROPDOWN_ITEM_CLASS(activePointId === id)}>
                <span className="text-xs font-semibold">{point.name}</span>
                <span className="block text-[11px] font-normal leading-snug text-gray-500 dark:text-gray-400">
                  {point.shortDescription}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// Search by indication text (e.g. "tinnitus", "vertigo") instead of by point
// name — same trigger+dropdown shape as Basic Points' BasicPointSearch.
// Unlike Basic Points' zone search, results don't need deduping: each of the
// six sensory points is already its own distinct record (Extra Ear Yin/Yang
// share identical indications text but are genuinely two separate points,
// so both are legitimate separate results rather than duplicates).
function SensoryPointSearch({ open, query, onToggle, onQueryChange, onSelect }) {
  const containerRef = useRef(null)
  const listRef = useRef(null)
  const q = query.trim().toLowerCase()
  const matches = q
    ? SENSORY_POINT_IDS
        .map(id => allPoints.find(p => p.id === id))
        .filter(Boolean)
        .flatMap(point => {
          const indication = point.indications?.find(ind => ind.toLowerCase().includes(q))
          return indication ? [{ id: point.id, name: point.name, indication }] : []
        })
    : []

  // Same wheel-stop treatment as SensoryPointMenu above, attached to the
  // outer container (not just the results list) — see Basic Points'
  // BasicPointSearch for why a listener on the list alone leaves the input
  // box and empty-state text uncovered, making the scroll feel intermittent.
  useEffect(() => {
    const el = containerRef.current
    if (!open || !el) return
    function onWheel(e) {
      e.preventDefault()
      e.stopPropagation()
      if (listRef.current) listRef.current.scrollTop += e.deltaY
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [open])

  function handleKeyDown(e) {
    if (e.key === 'Enter' && matches.length > 0) onSelect(matches[0].id)
    else if (e.key === 'Escape') onToggle(false)
  }

  return (
    <div>
      <button type="button" onClick={() => onToggle()} className={TRIGGER_CLASS(open)}>
        Search
      </button>

      {open && (
        <div ref={containerRef} className="absolute top-full left-0 right-0 mt-1 rounded shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 z-20">
          <input
            type="text"
            autoFocus
            value={query}
            onChange={e => onQueryChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Indications…"
            className="w-full px-3 py-1.5 text-xs font-semibold bg-transparent text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none border-b border-gray-200 dark:border-gray-700"
          />
          {q && (
            matches.length > 0 ? (
              <div ref={listRef} className="sensory-dropdown-scroll py-1 max-h-40 overflow-y-auto">
                {matches.map(({ id, name, indication }) => (
                  <button key={id} type="button" onClick={() => onSelect(id)} className={DROPDOWN_ITEM_CLASS(false)}>
                    <span className="text-xs font-semibold">{name}</span>
                    <span className="block text-[11px] font-normal leading-snug text-gray-500 dark:text-gray-400">
                      {indication}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="px-3 py-1.5 text-xs text-gray-400 dark:text-gray-600">No indications found</p>
            )
          )}
        </div>
      )}
    </div>
  )
}

// highlightJsonId is shared across all three diagram tiles — selecting a
// point from the menu/search, or clicking any point on any tile, flashes
// the matching point (both bilateral dots, via each diagram's own
// POINT_JSON_ID map) across the other tiles too, same idea as Basic
// Points' activeZone.
function renderTileContent(id, { activePointId, onPointIdChange, onPointSelect, highlightJsonId, pointFilter, openPanel, onPanelToggle, searchQuery, onSearchQueryChange }) {
  switch (id) {
    case 'menu':
      return (
        <div className="relative w-full h-full">
          <div className="absolute left-3 right-3 top-3 flex items-baseline gap-4" onClick={e => e.stopPropagation()}>
            <SensoryPointMenu
              activePointId={activePointId}
              menuOpen={openPanel === 'menu'}
              onToggle={() => onPanelToggle('menu')}
              onSelect={pointId => {
                const nextId = activePointId === pointId ? null : pointId
                onPointIdChange(nextId)
                onPointSelect?.(nextId ? allPoints.find(p => p.id === nextId) ?? null : null)
              }}
              onReset={() => { onPointIdChange(null); onPointSelect?.(null) }}
            />
            <SensoryPointSearch
              open={openPanel === 'search'}
              query={searchQuery}
              onToggle={() => onPanelToggle('search')}
              onQueryChange={onSearchQueryChange}
              onSelect={pointId => {
                onPointIdChange(pointId)
                onPointSelect?.(allPoints.find(p => p.id === pointId) ?? null)
                onPanelToggle('search')
                onSearchQueryChange('')
              }}
            />
          </div>
        </div>
      )
    // Clicking a point directly on a diagram must also update activePointId
    // (not just call onPointSelect), or the Menu trigger label and the
    // cross-tile flash on the *other* two diagrams never learn about it —
    // unlike Basic Points, where a diagram click's onZoneChange(zoneOf(id))
    // does this for free, sensory points aren't zone-based (zoneOf() always
    // returns null for them) so that side channel doesn't apply here and
    // has to be done explicitly via onPointSelect instead.
    case 'lateral':
      return <HeadLateral onPointSelect={p => { onPointIdChange(p?.id ?? null); onPointSelect?.(p) }} highlightJsonId={highlightJsonId} pointFilter={pointFilter} activeSubgroup="ynsa-sensory" />
    case 'frontal':
      return <HeadFrontal onPointSelect={p => { onPointIdChange(p?.id ?? null); onPointSelect?.(p) }} highlightJsonId={highlightJsonId} pointFilter={pointFilter} activeSubgroup="ynsa-sensory" />
    case 'posterior':
      return <HeadPosterior onPointSelect={p => { onPointIdChange(p?.id ?? null); onPointSelect?.(p) }} highlightJsonId={highlightJsonId} pointFilter={pointFilter} activeSubgroup="ynsa-sensory" />
    default:
      return null
  }
}

export default function HeadSensoryPoints({ onPointSelect, highlightJsonId = null, pointFilter = null }) {
  const [expandedId,   setExpandedId]   = useState(null)
  const [activePointId, setActivePointId] = useState(null)
  const [openPanel,    setOpenPanel]    = useState(null) // null | 'menu' | 'search'
  const [searchQuery,  setSearchQuery]  = useState('')

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

  // A global search hit (from the sidebar SearchPanel) is already a raw
  // JSON id here — unlike Basic Points, there's no zoneOf() conversion step
  // needed since sensory points have no zone grouping. Local menu/search
  // selection takes priority, falling back to the external hit.
  const effectivePointId = activePointId ?? highlightJsonId

  const tileCtx = {
    activePointId: effectivePointId,
    onPointIdChange: setActivePointId,
    onPointSelect,
    highlightJsonId: effectivePointId,
    pointFilter,
    openPanel,
    onPanelToggle: panel => setOpenPanel(p => p === panel ? null : panel),
    searchQuery,
    onSearchQueryChange: setSearchQuery,
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
                viewTransitionName: isExpanded ? 'none' : `sensory-tile-${id}`,
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
              viewTransitionName: `sensory-tile-${expandedId}`,
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
