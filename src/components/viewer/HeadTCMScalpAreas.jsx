import { useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import ScalpAreasSvg from '../../assets/diagrams/tcm-scalp-areas.svg?react'
import ScalpMeridiansSvg from '../../assets/diagrams/tcm-scalp-meridians.svg?react'

// 2x2 grid, row-major: menu | areas diagram, then meridians diagram, then 1
// tile reserved for future content (photo reference, other angle, etc.) —
// same cell size as YNSA's Basic Points grid (menu + 3 diagrams), so the
// areas/meridians diagrams render as large as YNSA's tiles instead of being
// squeezed into a third of the height by unused placeholder rows.
const TILE_IDS = ['menu', 'areas', 'meridians', 'empty2']

// Flat list, no grouping (confirmed with user) — "Internal Organ Areas" is
// just another entry, not a header for the six area names after it. No
// tcm.json yet, so this menu is names-only: selecting an entry has no
// click-through detail/search until real data is authored (matches Basic/
// Sensory/Brain Points' menu shape, minus onPointSelect wiring).
const TCM_AREAS = [
  'Motor Area',
  'Sensory Area',
  'Chorea and Tremor Area',
  'Vascular Dilation and Constriction Area',
  'Vertigo and Hearing Area',
  'Speech I Area',
  'Speech II Area',
  'Speech III Area',
  'Praxis Area',
  'Vision Area',
  'Balance Area',
  'Foot Motor and Sensory Area',
  'Internal Organ Areas',
  'Head Area',
  'Stomach Area',
  'Thoracic Cavity Area',
  'Liver and Gallbladder Area',
  'Reproductive Area',
  'Large Intestine Area',
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
}`

// Tile 1 (menu) sits back on the theme-aware dark/translucent tile
// background (matches YNSA's tile 1/1), so its text switches with dark:
// again. Tile 2 (areas) keeps its own fixed white backing for the SVG.
const TRIGGER_CLASS = (active) => `text-xs font-semibold px-2 py-1 rounded bg-[#63ECE1] transition-colors ${
  active
    ? 'text-amber-500 dark:text-amber-400'
    : 'text-gray-600 dark:text-gray-300 hover:text-amber-500 dark:hover:text-amber-400'
}`

const DROPDOWN_ITEM_CLASS = (active) => `block w-full text-left px-3 py-1.5 text-xs font-semibold transition-colors ${
  active
    ? 'text-amber-500 dark:text-amber-400'
    : 'text-gray-600 dark:text-gray-300 hover:text-amber-500 dark:hover:text-amber-400'
}`

// App-level tile title, rendered above the diagram instead of baked into the
// SVG artwork — stays legible at any tile size and doesn't eat into the
// drawing's own canvas. Only tiles with a real diagram get one; 'menu' skips
// it since its own trigger already reads as a label. Lift TILE_TITLE_CLASS +
// this row layout into Basic/Sensory/Brain/Y-Points too if/when those get
// standardized on the same pattern.
const TILE_TITLES = {
  areas: 'Areas in Chinese Scalp Acupuncture',
  meridians: 'TCM Meridians on the Head',
}

const TILE_TITLE_CLASS = 'text-xs font-medium text-gray-500 text-center px-2 pt-2 pb-1 flex-shrink-0'

// Same trigger+dropdown shape as Basic/Sensory/Brain Points' menus, but a
// plain name list — no Search sibling yet since there's no indications data
// to search against.
function TCMAreaMenu({ activeArea, menuOpen, onToggle, onSelect, onReset, compact }) {
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

  return (
    <div onClick={e => e.stopPropagation()}>
      <div className="flex items-center gap-1.5">
        <button type="button" onClick={onToggle} className={TRIGGER_CLASS(!!activeArea || menuOpen)}>
          {activeArea ?? 'TCM Area'}
          <span className="ml-1">{menuOpen ? '▲' : '▼'}</span>
        </button>
        {activeArea && (
          <button
            type="button"
            onClick={onReset}
            aria-label="Clear area selection"
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
          {TCM_AREAS.map(area => (
            <button key={area} type="button" onClick={() => onSelect(area)} className={DROPDOWN_ITEM_CLASS(activeArea === area)}>
              {area}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function renderTileContent(id, { activeArea, onAreaChange, menuOpen, onMenuToggle }, expanded = false) {
  switch (id) {
    case 'menu':
      return (
        <div className="relative w-full h-full">
          <div className="absolute left-3 right-3 top-3" onClick={e => e.stopPropagation()}>
            <TCMAreaMenu
              activeArea={activeArea}
              menuOpen={menuOpen}
              compact={!expanded}
              onToggle={onMenuToggle}
              onSelect={area => onAreaChange(activeArea === area ? null : area)}
              onReset={() => onAreaChange(null)}
            />
          </div>
        </div>
      )
    case 'areas':
      return <ScalpAreasSvg style={{ width: '100%', height: '100%' }} />
    case 'meridians':
      return <ScalpMeridiansSvg style={{ width: '100%', height: '100%' }} />
    default:
      return null
  }
}

export default function HeadTCMScalpAreas() {
  const [expandedId, setExpandedId] = useState(null)
  const [activeArea, setActiveArea] = useState(null)
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

  const tileCtx = {
    activeArea,
    onAreaChange: setActiveArea,
    menuOpen,
    onMenuToggle: () => setMenuOpen(open => !open),
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
          gridTemplateRows: 'repeat(2, 1fr)',
          gap: '1rem',
          width: '100%',
          height: '100%',
        }}
      >
        {TILE_IDS.map(id => {
          const expandable = id === 'menu' || id === 'areas' || id === 'meridians'
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
                background: (id === 'areas' || id === 'meridians') ? '#ffffff' : expandable ? '#ffffff' : 'transparent',
                cursor: expandable ? 'pointer' : 'default',
                overflow: id === 'menu' ? 'visible' : 'hidden',
                transition: 'transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease',
              }}
              onMouseEnter={e => { if (expandable) { e.currentTarget.style.transform = 'scale(1.015)'; e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.5)' } }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.2)' }}
            >
              {!isExpanded && TILE_TITLES[id] && <div className={TILE_TITLE_CLASS}>{TILE_TITLES[id]}</div>}
              {!isExpanded && (
                <div style={{ flex: 1, minHeight: 0, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {content}
                </div>
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
              viewTransitionName: `tcm-tile-${expandedId}`,
              position: 'relative',
              width: '90%',
              height: '90%',
              background: (expandedId === 'areas' || expandedId === 'meridians') ? '#ffffff' : '#f1f5f9',
              borderRadius: 12,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
              justifyContent: TILE_TITLES[expandedId] ? 'flex-start' : 'center',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
              overflow: expandedId === 'menu' ? 'visible' : 'hidden',
            }}
          >
            {TILE_TITLES[expandedId] && <div className={TILE_TITLE_CLASS}>{TILE_TITLES[expandedId]}</div>}
            <div style={{ flex: 1, minHeight: 0, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {renderTileContent(expandedId, tileCtx, true)}
            </div>
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
