import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import NeckDiagSvg from '../../assets/diagrams/male-neck-diag.svg?react'
import NeckRealSvg from '../../assets/diagrams/male-neck-real.svg?react'

// 3x2 grid of neck references. Slots without an Svg yet render as "Coming soon"
// placeholders — drop in more diagrams here as they're authored.
const TILES = [
  { id: 'diag',  label: 'Diagnostic Map',    Svg: NeckDiagSvg },
  { id: 'real',  label: 'Reference Photo',   Svg: NeckRealSvg },
  { id: 'slot3', label: 'Coming soon',       Svg: null },
  { id: 'slot4', label: 'Coming soon',       Svg: null },
  { id: 'slot5', label: 'Coming soon',       Svg: null },
  { id: 'slot6', label: 'Coming soon',       Svg: null },
]

// Scoped so it only affects transitions started while this screen is mounted.
const TRANSITION_STYLE = `
::view-transition-group(*) {
  animation-duration: 320ms;
  animation-timing-function: cubic-bezier(0.2, 0, 0, 1);
}`

export default function NeckDiagnosis() {
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

  const expandedTile = TILES.find(t => t.id === expandedId) ?? null

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
        {TILES.map(({ id, label, Svg }) => {
          const isExpanded = expandedId === id
          return (
            <div
              key={id}
              role={Svg ? 'button' : undefined}
              tabIndex={Svg ? 0 : undefined}
              aria-label={Svg ? `Expand ${label}` : undefined}
              onClick={() => Svg && toggle(id)}
              onKeyDown={e => { if (Svg && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); toggle(id) } }}
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
                cursor: Svg ? 'pointer' : 'default',
                overflow: 'hidden',
                transition: 'transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease',
              }}
              onMouseEnter={e => { if (Svg) { e.currentTarget.style.transform = 'scale(1.015)'; e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.5)' } }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.2)' }}
            >
              {Svg && !isExpanded && (
                <Svg width="100%" height="100%" style={{ maxWidth: '100%', maxHeight: '100%' }} preserveAspectRatio="xMidYMid meet" />
              )}
              {!Svg && (
                <span style={{ color: '#6b7280', fontSize: 13, fontWeight: 600 }}>{label}</span>
              )}
            </div>
          )
        })}
      </div>

      {expandedTile && (
        <div
          onClick={() => toggle(expandedTile.id)}
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
              viewTransitionName: `neck-tile-${expandedTile.id}`,
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
            <expandedTile.Svg width="100%" height="100%" style={{ maxWidth: '100%', maxHeight: '100%' }} preserveAspectRatio="xMidYMid meet" />
            <button
              onClick={e => { e.stopPropagation(); toggle(expandedTile.id) }}
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
