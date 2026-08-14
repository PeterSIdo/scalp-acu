import { useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import HeadFrontal from './HeadFrontal'
import HeadPosterior from './HeadPosterior'
import { allPoints } from '../../data/points'

// 2x2 grid, row-major: menu | empty / Frontal | Posterior. Brain Points has
// no Lateral view (brain points aren't drawn on that diagram), so tile 1/2
// is intentionally left blank rather than reusing Basic/Sensory Points'
// menu|Lateral/Frontal/Posterior shape.
const TILE_IDS = ['menu', 'empty', 'frontal', 'posterior']

// The six brain points, in the same order as ViewerPage's
// SUBGROUP_POINT_IDS['ynsa-brain']. Already yin/yang-split (unlike most
// Sensory Points), so each id is its own distinct JSON record — no
// zone-style grouping/lookup layer needed, same as HeadSensoryPoints.
const BRAIN_POINT_IDS = [
  'YNSA-Brain-Cerebrum-yin',     'YNSA-Brain-Cerebrum-yang',
  'YNSA-Brain-Cerebellum-yin',   'YNSA-Brain-Cerebellum-yang',
  'YNSA-Brain-BasalGanglia-yin', 'YNSA-Brain-BasalGanglia-yang',
]

// Trigger label is the point's short name (drop " Point" wherever it
// appears — e.g. "Cerebrum Point Yin" -> "Cerebrum Yin") so it stays
// compact next to the Search trigger, matching Basic/Sensory Point's
// short triggers.
const shortLabel = name => name?.replace(/ Point\b/, '') ?? ''

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

// Same trigger+dropdown shape as Sensory Points' SensoryPointMenu, but
// listing the six brain points by name instead.
function BrainPointMenu({ activePointId, menuOpen, onToggle, onSelect, onReset }) {
  const dropdownRef = useRef(null)
  const activePoint = activePointId ? allPoints.find(p => p.id === activePointId) : null

  // Same native (non-React) wheel-stop treatment as Basic/Sensory Points'
  // dropdowns — see those components for why a React onWheel prop isn't
  // enough to stop ZoomableView's own DOM-level wheel-to-zoom handler.
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
          {activePoint ? shortLabel(activePoint.name) : 'Brain Point'}
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
        // — same no-spill guarantee as Basic/Sensory Points' dropdowns,
        // anchored one level up so the trigger can shrink to content width.
        <div
          ref={dropdownRef}
          className="brain-dropdown-scroll absolute top-full left-0 right-0 mt-1 py-1 rounded shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 max-h-40 overflow-y-auto z-20"
        >
          {BRAIN_POINT_IDS.map(id => {
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

// Search by indication text (e.g. "vertigo", "dementia") instead of by point
// name — same trigger+dropdown shape as Sensory Points' SensoryPointSearch.
// No dedup needed: each of the six brain points is already its own distinct
// yin/yang record.
function BrainPointSearch({ open, query, onToggle, onQueryChange, onSelect }) {
  const containerRef = useRef(null)
  const listRef = useRef(null)
  const q = query.trim().toLowerCase()
  const matches = q
    ? BRAIN_POINT_IDS
        .map(id => allPoints.find(p => p.id === id))
        .filter(Boolean)
        .flatMap(point => {
          const indication = point.indications?.find(ind => ind.toLowerCase().includes(q))
          return indication ? [{ id: point.id, name: point.name, indication }] : []
        })
    : []

  // Same wheel-stop treatment as BrainPointMenu above, attached to the
  // outer container (not just the results list) — see Basic/Sensory Points'
  // search dropdowns for why a listener on the list alone leaves the input
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
              <div ref={listRef} className="brain-dropdown-scroll py-1 max-h-40 overflow-y-auto">
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

// highlightJsonId is shared across both diagram tiles — selecting a point
// from the menu/search, or clicking any point on either tile, flashes the
// matching point on the other tile too (when it has a matching coordinate —
// yin/yang are separate records, so a given point usually only lights up
// on one of Frontal/Posterior, not both).
function renderTileContent(id, { activePointId, onPointIdChange, onPointSelect, highlightJsonId, pointFilter, openPanel, onPanelToggle, searchQuery, onSearchQueryChange }) {
  switch (id) {
    case 'menu':
      return (
        <div className="relative w-full h-full">
          <div className="absolute left-3 right-3 top-3 flex items-baseline gap-4" onClick={e => e.stopPropagation()}>
            <BrainPointMenu
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
            <BrainPointSearch
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
    // cross-tile flash on the other diagram never learn about it — see
    // HeadSensoryPoints for why brain/sensory points need this wired
    // explicitly instead of getting it for free via onZoneChange the way
    // Basic Points' zone-lettered points do.
    case 'frontal':
      return <HeadFrontal onPointSelect={p => { onPointIdChange(p?.id ?? null); onPointSelect?.(p) }} highlightJsonId={highlightJsonId} pointFilter={pointFilter} activeSubgroup="ynsa-brain" />
    case 'posterior':
      return <HeadPosterior onPointSelect={p => { onPointIdChange(p?.id ?? null); onPointSelect?.(p) }} highlightJsonId={highlightJsonId} pointFilter={pointFilter} activeSubgroup="ynsa-brain" />
    default:
      return null
  }
}

export default function HeadBrainPoints({ onPointSelect, highlightJsonId = null, pointFilter = null }) {
  const [expandedId,    setExpandedId]    = useState(null)
  const [activePointId, setActivePointId] = useState(null)
  const [openPanel,     setOpenPanel]     = useState(null) // null | 'menu' | 'search'
  const [searchQuery,   setSearchQuery]   = useState('')

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
  // JSON id here — no zoneOf() conversion needed since brain points have no
  // zone grouping. Local menu/search selection takes priority, falling back
  // to the external hit.
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
          const expandable = id !== 'empty'
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
                viewTransitionName: isExpanded ? 'none' : `brain-tile-${id}`,
                visibility: isExpanded ? 'hidden' : 'visible',
                minHeight: 0,
                minWidth: 0,
                border: expandable ? '1px solid rgba(148, 163, 184, 0.2)' : 'none',
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: expandable ? 'rgba(148, 163, 184, 0.06)' : 'transparent',
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
              viewTransitionName: `brain-tile-${expandedId}`,
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
