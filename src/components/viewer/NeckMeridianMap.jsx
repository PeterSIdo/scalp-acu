import { useState } from 'react'
import NeckDiagSvg from '../../assets/diagrams/male-neck-diag.svg?react'
import { MERIDIANS } from '../../data/meridians'

// male-neck-diag.svg group ids use different abbreviations than the Meridian
// menu codes for three meridians — map menu code → svg id where they diverge.
const MERIDIAN_TO_SVG_ID = {
  PE: 'PC',
  KI: 'KD',
  BL: 'UB',
  'SP-PANC': 'SP/PANC',
}
const SVG_ID_TO_MERIDIAN = Object.fromEntries(
  Object.entries(MERIDIAN_TO_SVG_ID).map(([code, svgId]) => [svgId, code])
)
function svgIdToMeridian(svgId) {
  return SVG_ID_TO_MERIDIAN[svgId] ?? svgId
}

// Point centers read directly from male-neck-diag.svg (viewBox 0 0 410 292) —
// circle cx/cy where the point is a <circle>, bounding-box center for KD
// (a stroke-only path outline). Keyed by svg id (see MERIDIAN_TO_SVG_ID above).
export const DIAG_POINTS = {
  SI:        { cx: 290.103,  cy: 37.1025 },
  ST:        { cx: 281.851,  cy: 100.635 },
  'SP/PANC': { cx: 258.701,  cy: 108.738 },
  HT:        { cx: 199.669,  cy: 100.635 },
  LV:        { cx: 207.771,  cy: 136.518 },
  PC:        { cx: 184.621,  cy: 130.73 },
  LU:        { cx: 152.211,  cy: 144.62 },
  GB:        { cx: 171.889,  cy: 163.14 },
  KD:        { cx: 240.1815, cy: 224.4875 },
  UB:        { cx: 240.76,   cy: 243.008 },
  LI:        { cx: 298.056,  cy: 164.298 },
  SJ:        { cx: 286.481,  cy: 193.235 },
}

// Point centers read directly from the baked-in <circle id="..."> elements
// in male-neck-real.svg (also viewBox 0 0 410 292) — a different anatomical
// model than male-neck-diag.svg, so these are wired up separately rather
// than reusing DIAG_POINTS.
export const REAL_POINTS = {
  SI:        { cx: 240, cy: 52 },
  ST:        { cx: 250, cy: 127 },
  'SP/PANC': { cx: 233, cy: 149 },
  HT:        { cx: 191, cy: 153 },
  LV:        { cx: 198, cy: 178 },
  PC:        { cx: 174, cy: 178 },
  LU:        { cx: 147, cy: 178 },
  GB:        { cx: 162, cy: 203 },
  KD:        { cx: 229, cy: 223 },
  UB:        { cx: 229, cy: 240 },
  LI:        { cx: 294, cy: 171 },
  SJ:        { cx: 277, cy: 189 },
}

// Tapping/clicking a point selects its meridian (shared with the Meridian
// menu in the YNSA Y-Side tile), which flashes the same pulsing-ring
// highlight as the Basic Points search hit and shows its name label.
// Background/points default to the diagrammatic map; the "real"
// reference-photo tile passes NeckRealSvg + REAL_POINTS instead — the two
// backgrounds share a viewBox but not point placement, since they're
// different anatomical models.
export default function NeckMeridianMap({ activeMeridian, onMeridianChange, Background = NeckDiagSvg, points = DIAG_POINTS }) {
  const [hoveredSvgId, setHoveredSvgId] = useState(null)

  const svgId = activeMeridian ? (MERIDIAN_TO_SVG_ID[activeMeridian] ?? activeMeridian) : null
  const point = svgId ? points[svgId] : null
  const label = activeMeridian ? MERIDIANS.find(m => m.code === activeMeridian)?.name : null

  // Label box — flip to the point's left when it would otherwise overflow
  // the 410-wide viewBox, same approach as the Basic Points hover tooltip.
  const pad   = 6
  const fSize = 11
  const w     = label ? label.length * 6.2 + pad * 2 : 0
  const h     = fSize + pad * 2
  const tx    = point && point.cx + 20 + w > 410 ? point.cx - w - 20 : point?.cx + 20
  const ty    = point ? point.cy - h / 2 : 0

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Background
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        preserveAspectRatio="xMidYMid meet"
      />

      <svg
        viewBox="0 0 410 292"
        preserveAspectRatio="xMidYMid meet"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      >
        {/* Touch/click targets — generously sized (r=14) over each dot baked
            into the underlying diagram, since those dots have no hit area of
            their own. */}
        {Object.entries(points).map(([id, p]) => {
          const code       = svgIdToMeridian(id)
          const isHovered  = hoveredSvgId === id
          const isSelected = svgId === id
          return (
            <g
              key={id}
              onClick={e => { e.stopPropagation(); onMeridianChange?.(code) }}
              onMouseEnter={() => setHoveredSvgId(id)}
              onMouseLeave={() => setHoveredSvgId(null)}
              style={{ cursor: 'pointer', pointerEvents: 'auto' }}
            >
              {isHovered && !isSelected && (
                <circle cx={p.cx} cy={p.cy} r={12} fill="#ffffff" opacity="0.25" />
              )}
              <circle cx={p.cx} cy={p.cy} r={14} fill="transparent" />
            </g>
          )
        })}

        {point && (
          <g pointerEvents="none">
            <circle cx={point.cx} cy={point.cy} r={11} fill="none" stroke="#ffffff" strokeWidth="1.5" opacity="0.9" />
            <circle cx={point.cx} cy={point.cy} r={11} fill="none" stroke="#ffffff" strokeWidth="2">
              <animate attributeName="r"       values="11;22;11" dur="1.6s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.75;0;0.75" dur="1.6s" repeatCount="indefinite" />
            </circle>

            {label && (
              <g>
                <rect x={tx} y={ty} width={w} height={h} rx={4} fill="rgba(0,0,0,0.72)" />
                <text x={tx + pad} y={ty + fSize + pad * 0.6} fontSize={fSize} fill="white" fontFamily="system-ui, sans-serif">
                  {label}
                </text>
              </g>
            )}
          </g>
        )}
      </svg>
    </div>
  )
}
