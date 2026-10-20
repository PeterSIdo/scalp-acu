import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import EarBasicSvg from '../../assets/diagrams/ear-basic.svg?react'
import TileTitle from '../ui/TileTitle'
import CrossIcon from '../ui/CrossIcon'

// 2x2 grid, row-major (same layout as Basic Points):
// Master | Musculoskeletal / Internal Organs | Neuroendocrine.
const TILE_IDS = ['master', 'musculoskeletal', 'internal', 'neuroendocrine']

const TILE_TITLES = {
  master: 'Master Points',
  musculoskeletal: 'Musculoskeletal Points',
  internal: 'Internal Organ Points',
  neuroendocrine: 'Neuroendocrine Points',
}

const TRANSITION_STYLE = `
::view-transition-group(*) {
  animation-duration: 320ms;
  animation-timing-function: cubic-bezier(0.2, 0, 0, 1);
}
`

const FILL = { position: 'absolute', inset: 0, width: '100%', height: '100%' }

function renderTileContent(id) {
  let diagram
  switch (id) {
    // Internal organ / neuroendocrine / musculoskeletal tiles reuse the base ear until their own diagrams exist.
    case 'master':
    case 'internal':
    case 'neuroendocrine':
    case 'musculoskeletal':
      diagram = <EarBasicSvg style={FILL} />
      break
    default:
      return null
  }
  // Same 40px top offset as the other grids, leaving room for a menu row later.
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div style={{ position: 'absolute', top: 40, left: 0, right: 0, bottom: 0 }}>
        {diagram}
      </div>
    </div>
  )
}

export default function HeadEarPoints() {
  const [expandedId, setExpandedId] = useState(null)

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
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
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
                viewTransitionName: isExpanded ? 'none' : `ear-tile-${id}`,
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
                  {renderTileContent(id)}
                </div>
              )}
              {!isExpanded && <TileTitle>{TILE_TITLES[id]}</TileTitle>}
            </div>
          )
        })}
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
              viewTransitionName: `ear-tile-${expandedId}`,
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
              {renderTileContent(expandedId)}
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
