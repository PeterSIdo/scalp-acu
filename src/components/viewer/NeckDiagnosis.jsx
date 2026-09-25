import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import NeckRealSvg from '../../assets/diagrams/male-neck-real.svg?react'
import AbdominalDiagSvg from '../../assets/diagrams/adbominal-diag-1.svg?react'
import AbdominalRealSvg from '../../assets/diagrams/abdomial-real.svg?react'
import YNSAYRealSvg from '../../assets/diagrams/YNSA-Y-real.svg?react'
import HeadYPoints, { Y_REAL_POINTS, Y_REAL_VIEWBOX } from './HeadYPoints'
import NeckMeridianMap, { REAL_POINTS, ABDOMEN_POINTS, ABDOMEN_REAL_POINTS } from './NeckMeridianMap'

// 3x2 grid of neck references, in row-major order. Ids with no case in
// renderTileContent below render as "Coming soon" placeholders — drop in
// more diagrams there as they're authored.
const TILE_IDS = ['ynsa-y-side', 'ynsa-y-real', 'diag', 'real', 'abdomen', 'abdomen-real']
const TILE_LABELS = {
  'ynsa-y-side': 'YNSA Y-Side',
  'ynsa-y-real': 'YNSA Y-Side Reference Photo',
  diag: 'Diagnostic Map',
  real: 'Reference Photo',
  abdomen: 'Abdominal Diagnostic Map',
  'abdomen-real': 'Abdominal Reference Photo',
}

// ynsa-y-side reuses the full HeadYPoints view (Meridian dropdown + search +
// points) rather than the bare diagram, so that menu is available from this
// tile too. Both it and diag share the same activeMeridian state, so tapping
// a point on either tile — the menu or the neck diagram — flashes/labels the
// matching point on diag and updates the Meridian menu, the same way Basic
// Points flashes a search hit.
function renderTileContent(id, { activeMeridian, onMeridianChange, isExpanded }) {
  switch (id) {
    // YNSA-Y-Side.svg (2026-09-25 re-export) places its own Weak/Strong
    // Yin/Yang labels just above and below the head, so the diagram is shown
    // unscaled (fit by height) in both compact and expanded states — any
    // diagramScale > 1 clips the top "Weak" labels against the tile edge.
    // The SVG labels replace the old plain-HTML corner labels here.
    case 'ynsa-y-side':
      return (
        <HeadYPoints
          activeMeridian={activeMeridian}
          onMeridianChange={onMeridianChange}
        />
      )
    // Photo-reference companion to 'ynsa-y-side', same relationship as
    // diag/real below — its own SVG shares the ids of
    // YNSA-Y-Side.svg but not its viewBox or point placement (see Y_REAL_POINTS), so it
    // reuses HeadYPoints with Background/points swapped and the Meridian
    // menu hidden (shares activeMeridian with the primary tile instead).
    // showMeridianLabel replaces the hidden menu's "which meridian is
    // active" cue with a floating name label instead, same dark-box style
    // as NeckMeridianMap's per-point label below.
    // Since the 2026-09-25 export, YNSA-Y-real.svg shares basic-side.svg's
    // photo and 553x713 frame, so it's shown unscaled and centered to sit
    // exactly where the Basic Points lateral tile shows the same head.
    case 'ynsa-y-real':
      return (
        <HeadYPoints
          activeMeridian={activeMeridian}
          onMeridianChange={onMeridianChange}
          Background={YNSAYRealSvg}
          points={Y_REAL_POINTS}
          viewBox={Y_REAL_VIEWBOX}
          showMenu={false}
          showMeridianLabel
        />
      )
    case 'diag':         return <NeckMeridianMap activeMeridian={activeMeridian} onMeridianChange={onMeridianChange} />
    case 'real':         return <NeckMeridianMap activeMeridian={activeMeridian} onMeridianChange={onMeridianChange} Background={NeckRealSvg} points={REAL_POINTS} />
    // Abdominal diagnosis map — its own SVG already has point ids baked in
    // using the same meridian abbreviations as male-neck-diag.svg, so it
    // reuses NeckMeridianMap with a taller viewBox (410x539) rather than a
    // bespoke component. Shares activeMeridian with the other tiles.
    case 'abdomen':       return <NeckMeridianMap activeMeridian={activeMeridian} onMeridianChange={onMeridianChange} Background={AbdominalDiagSvg} points={ABDOMEN_POINTS} viewBox="0 0 410 539" />
    // Photo-reference companion to 'abdomen', same relationship as diag/real
    // above — its own SVG already has point ids baked in with matching
    // coordinates (see ABDOMEN_REAL_POINTS), just a taller viewBox (410x540).
    case 'abdomen-real':  return <NeckMeridianMap activeMeridian={activeMeridian} onMeridianChange={onMeridianChange} Background={AbdominalRealSvg} points={ABDOMEN_REAL_POINTS} viewBox="0 0 410 540" />
    default:             return null
  }
}

// Scoped so it only affects transitions started while this screen is mounted.
const TRANSITION_STYLE = `
::view-transition-group(*) {
  animation-duration: 320ms;
  animation-timing-function: cubic-bezier(0.2, 0, 0, 1);
}`

export default function NeckDiagnosis() {
  const [expandedId, setExpandedId] = useState(null)
  const [activeMeridian, setActiveMeridian] = useState(null)

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

  const tileContentCtx = { activeMeridian, onMeridianChange: setActiveMeridian }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <style>{TRANSITION_STYLE}</style>

      {/* Tiles match the Basic Points 2x2 grid's size: rows are (100% - gap) / 2,
          so 3 rows need 150% + half a gap of height and the third row scrolls
          into view. The scroll wrapper sits inside the relative root so the
          expanded-tile overlay below stays pinned over the visible area. */}
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
          const label = TILE_LABELS[id]
          const isExpanded = expandedId === id
          const content = renderTileContent(id, { ...tileContentCtx, isExpanded: false })
          return (
            <div
              key={id}
              role={content ? 'button' : undefined}
              tabIndex={content ? 0 : undefined}
              aria-label={content ? `Expand ${label}` : undefined}
              onClick={() => content && toggle(id)}
              onKeyDown={e => { if (content && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); toggle(id) } }}
              style={{
                viewTransitionName: isExpanded ? 'none' : `neck-tile-${id}`,
                visibility: isExpanded ? 'hidden' : 'visible',
                minHeight: 0,
                minWidth: 0,
                border: '1px solid rgba(148, 163, 184, 0.2)',
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#ffffff',
                cursor: content ? 'pointer' : 'default',
                overflow: 'hidden',
                transition: 'transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease',
              }}
              onMouseEnter={e => { if (content) { e.currentTarget.style.transform = 'scale(1.015)'; e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.5)' } }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.2)' }}
            >
              {content && !isExpanded && content}
              {!content && (
                <span style={{ color: '#6b7280', fontSize: 13, fontWeight: 600 }}>{label}</span>
              )}
            </div>
          )
        })}
      </div>
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
              viewTransitionName: `neck-tile-${expandedId}`,
              position: 'relative',
              width: '90%',
              height: '90%',
              background: '#ffffff',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
              overflow: 'hidden',
            }}
          >
            {renderTileContent(expandedId, { ...tileContentCtx, isExpanded: true })}
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
