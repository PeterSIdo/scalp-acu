import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import NeckRealSvg from '../../assets/diagrams/male-neck-real.svg?react'
import AbdominalDiagSvg from '../../assets/diagrams/adbominal-diag-1.svg?react'
import AbdominalRealSvg from '../../assets/diagrams/abdomial-real.svg?react'
import YNSAYRealSvg from '../../assets/diagrams/YNSA-Y-real.svg?react'
import HeadYPoints, { Y_REAL_POINTS } from './HeadYPoints'
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
    // YNSA-Y-Side.svg is much taller than wide, so fitting it into this wide,
    // short tile by height (the default "meet" behavior) leaves big empty
    // gutters left/right. diagramScale enlarges just the diagram — the
    // Meridian menu stays put — and overflow:hidden (the grid tile, or the
    // modal) clips the excess top/bottom. Kept enlarged in both compact and
    // expanded states; only the corner labels toggle, since the compact
    // tile is what clips them off-screen — expanded has enough room for the
    // plain-HTML corner labels (pinned to the tile's real corners) instead.
    case 'ynsa-y-side':
      return (
        <HeadYPoints
          activeMeridian={activeMeridian}
          onMeridianChange={onMeridianChange}
          diagramScale={1.6}
          hideCornerLabels
          showCornerLabels={isExpanded}
        />
      )
    // Photo-reference companion to 'ynsa-y-side', same relationship as
    // diag/real below — its own SVG shares the ids and viewBox of
    // YNSA-Y-Side.svg but not point placement (see Y_REAL_POINTS), so it
    // reuses HeadYPoints with Background/points swapped and the Meridian
    // menu hidden (shares activeMeridian with the primary tile instead).
    case 'ynsa-y-real':
      return (
        <HeadYPoints
          activeMeridian={activeMeridian}
          onMeridianChange={onMeridianChange}
          Background={YNSAYRealSvg}
          points={Y_REAL_POINTS}
          diagramScale={1.6}
          showMenu={false}
          hideCornerLabels
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

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: 'repeat(3, 1fr)',
          gap: '1rem',
          width: '100%',
          height: '100%',
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
                background: 'rgba(148, 163, 184, 0.06)',
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
              viewTransitionName: `neck-tile-${expandedId}`,
              position: 'relative',
              width: '90%',
              height: '90%',
              background: '#111827',
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
