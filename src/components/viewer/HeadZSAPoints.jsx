import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import ZsaZonesBowedSvg from '../../assets/diagrams/ZSA-zones-2-bowed.svg?react'
import ZsaZonesTopSvg from '../../assets/diagrams/ZSA-zones-1-top.svg?react'
import ZsaBackZonesSvg from '../../assets/diagrams/ZSA-back-zones.svg?react'
import ZsaBackMeridiansSvg from '../../assets/diagrams/ZSA-back-meridians.svg?react'
import ZsaTopMeridiansSvg from '../../assets/diagrams/ZSA-top-meridians.svg?react'
import TileTitle from '../ui/TileTitle'
import CrossIcon from '../ui/CrossIcon'

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

function renderTileContent(id, expanded = false) {
  const Diagram = TILE_SVGS[id]
  if (!Diagram) return null
  // Expanded keeps the other grids' 40px top offset (room for a menu row later);
  // grid tiles are short, so they drop it and let the diagram use the full height.
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div style={{ position: 'absolute', top: expanded ? 40 : 4, left: 0, right: 0, bottom: expanded ? 0 : 4 }}>
        <Diagram viewBox={TILE_VIEWBOXES[id]} style={FILL} />
      </div>
    </div>
  )
}

export default function HeadZSAPoints() {
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
                  {renderTileContent(id)}
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
              {renderTileContent(expandedId, true)}
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
