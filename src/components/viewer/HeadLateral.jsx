import { useState, useRef } from 'react'
import { allPoints } from '../../data/points'
import BasicSideSvg from '../../assets/diagrams/basic-side.svg?react'

const ORANGE = '#CB6608'
const RED    = '#FF0808'
const GREEN  = '#34B904'
const BLUE   = '#0845FF'

// Maps SVG point id → ynsa.json id
const POINT_JSON_ID = {
  // A zone — basic-side.svg bakes the JSON id directly into the yin ids
  'YNSA-A1-yin': 'YNSA-A1-yin', 'YNSA-A8-yin': 'YNSA-A8-yin',
  'A1-yang':     'YNSA-A1-yang', 'A8-yang':    'YNSA-A8-yang',
  // B zone
  'B-yin':    'YNSA-B-yin',    'B-yang':   'YNSA-B-yang',
  // C zone
  'C-yin':    'YNSA-C-yin',    'C-yang':   'YNSA-C-yang',
  // D zone — single point
  'D-yin':    'YNSA-D-yin',    'D-yang':   'YNSA-D-yang',
  // D zone — individual sub-point descriptions
  'D1-yin':   'YNSA-D1-yin',   'D1-yang':  'YNSA-D1-yang',
  'D2-yin':   'YNSA-D2-yin',   'D2-yang':  'YNSA-D2-yang',
  'D3-yin':   'YNSA-D3-yin',   'D3-yang':  'YNSA-D3-yang',
  'D4-yin':   'YNSA-D4-yin',   'D4-yang':  'YNSA-D4-yang',
  'D5-yin':   'YNSA-D5-yin',   'D5-yang':  'YNSA-D5-yang',
  'D6-yin':   'YNSA-D6-yin',   'D6-yang':  'YNSA-D6-yang',
  // E zone — E1 and E12 both show the parent E description
  'E1-yin':   'YNSA-E-yin',    'E12-yin':  'YNSA-E-yin',
  'E1-yang':  'YNSA-E-yang',   'E12-yang': 'YNSA-E-yang',
  // F zone
  'F-yang':   'YNSA-F-yang',
  // G zone — individual sub-point descriptions (G3-yang keeps its raw "_2" svg id)
  'G1-yin':   'YNSA-G1-yin',   'G1-yang':  'YNSA-G1-yang',
  'G2-yin':   'YNSA-G2-yin',   'G2-yang':  'YNSA-G2-yang',
  'G3-yin':   'YNSA-G3-yin',   'G3-yang_2':'YNSA-G3-yang',
  // H zone — no yin/yang split in JSON
  'H-yin':    'YNSA-H',        'H-yang':   'YNSA-H',
  // I zone — no yin/yang split in JSON
  'I-yin':    'YNSA-I',        'I-yang':   'YNSA-I',
  // Ear sensory point
  'ear-yin':        'YNSA-Ear',
  'ear-yang':       'YNSA-Ear',
  // Extra Ear sensory points
  'extra-ear-yin':  'YNSA-Extra-Ear-Yin',
  'extra-ear-yang': 'YNSA-Extra-Ear-Yang',
}

// Coordinates read from basic-side.svg (viewBox 0 0 552 707). Circle points use
// cx/cy directly; path-drawn points use their bounding-box center.
const POINTS = [
  // ── Ear points ───────────────────────────────────────
  { id: 'ear-yin',        cx: 169, cy: 164, color: BLUE   },
  { id: 'extra-ear-yin',  cx: 282, cy: 116, color: BLUE   },
  { id: 'extra-ear-yang', cx: 370, cy: 137, color: BLUE   },
  { id: 'ear-yang',       cx: 444, cy: 236, color: BLUE   },
  // ── H (extra lumbar) ─────────────────────────────────
  { id: 'H-yin',    cx: 164, cy: 100, color: GREEN  },
  { id: 'H-yang',   cx: 493, cy: 210, color: GREEN  },
  // ── I (extra lumbar) ─────────────────────────────────
  { id: 'I-yin',    cx: 234, cy: 106, color: GREEN  },
  { id: 'I-yang',   cx: 461, cy: 221, color: GREEN  },
  // ── A zone ───────────────────────────────────────────
  { id: 'YNSA-A1-yin', cx: 110, cy: 134, color: ORANGE },
  { id: 'YNSA-A8-yin', cx: 128, cy: 112, color: ORANGE },
  { id: 'A1-yang',     cx: 526, cy: 225, color: RED    },
  { id: 'A8-yang',     cx: 512, cy: 205, color: RED    },
  // ── B zone ───────────────────────────────────────────
  { id: 'B-yin',    cx: 157, cy: 122, color: ORANGE },
  { id: 'B-yang',   cx: 508, cy: 232, color: RED    },
  // ── C zone ───────────────────────────────────────────
  { id: 'C-yin',    cx: 217, cy: 122, color: ORANGE },
  { id: 'C-yang',   cx: 474, cy: 236, color: RED    },
  // ── D zone (single parent point) ─────────────────────
  { id: 'D-yin',    cx: 227, cy: 298, color: ORANGE },
  { id: 'D-yang',   cx: 413, cy: 302, color: RED    },
  // ── D zone (individual vertebrae) ────────────────────
  { id: 'D1-yin',   cx: 272.5, cy: 275.5,   color: ORANGE },
  { id: 'D2-yin',   cx: 272.5, cy: 283.375, color: ORANGE },
  { id: 'D3-yin',   cx: 272.5, cy: 291.25,  color: ORANGE },
  { id: 'D4-yin',   cx: 272.5, cy: 299.125, color: ORANGE },
  { id: 'D5-yin',   cx: 272.5, cy: 307,     color: ORANGE },
  { id: 'D6-yin',   cx: 272.5, cy: 314.875, color: ORANGE },
  { id: 'D1-yang',  cx: 330, cy: 236, color: RED },
  { id: 'D2-yang',  cx: 339, cy: 237, color: RED },
  { id: 'D3-yang',  cx: 348, cy: 240, color: RED },
  { id: 'D4-yang',  cx: 356, cy: 245, color: RED },
  { id: 'D5-yang',  cx: 363, cy: 251, color: RED },
  { id: 'D6-yang',  cx: 368, cy: 258, color: RED },
  // ── E zone ───────────────────────────────────────────
  { id: 'E1-yin',   cx: 110, cy: 186, color: ORANGE },
  { id: 'E12-yin',  cx: 77,  cy: 196, color: ORANGE },
  { id: 'E1-yang',  cx: 501, cy: 289, color: RED    },
  { id: 'E12-yang', cx: 519, cy: 299, color: RED    },
  // ── F zone ───────────────────────────────────────────
  { id: 'F-yang',   cx: 366, cy: 385, color: RED    },
  // ── G zone ───────────────────────────────────────────
  { id: 'G1-yin',   cx: 212, cy: 281, color: ORANGE },
  { id: 'G2-yin',   cx: 227, cy: 281, color: ORANGE },
  { id: 'G3-yin',   cx: 242, cy: 281, color: ORANGE },
  { id: 'G1-yang',  cx: 328, cy: 415, color: RED    },
  { id: 'G2-yang',  cx: 342, cy: 422, color: RED    },
  { id: 'G3-yang_2',cx: 355, cy: 413, color: RED    },
]

// basic-side.svg groups:
//   basic-yin / basic-yang (and their sub-groups) → ABCDEFGHI yin/yang
//   extra-lumbar-point → H, I
//   ear-points → ear sensory (blue)
// No brain points exist in the lateral view.
const SVG_HIDE = {
  'ynsa-basic':   ['[id="ear-points"]'],
  'ynsa-sensory': ['[id="basic-yin"]', '[id="basic-yang"]', '[id="extra-lumbar-point"]'],
}

function buildHideStyle(activeSubgroup) {
  const selectors = SVG_HIDE[activeSubgroup]
  if (!selectors) return ''
  return selectors.map(s => `.svg-lateral ${s}`).join(',\n') + ' { display: none; }'
}

export default function HeadLateral({ pickerMode = false, onPointSelect, highlightJsonId = null, pointFilter = null, activeSubgroup = null }) {
  const [pickerPos, setPickerPos]   = useState(null)
  const [selectedId, setSelectedId] = useState(null)
  const [hoveredId,  setHoveredId]  = useState(null)
  const svgRef = useRef(null)
  const visiblePoints = pointFilter ? POINTS.filter(p => pointFilter.has(POINT_JSON_ID[p.id])) : POINTS
  const hideStyle = buildHideStyle(activeSubgroup)

  // Points to flash — clicking a point activates its own pulsing ring + label
  // (same mechanism as the Y-Points/meridian selection), and an externally
  // driven search hit (highlightJsonId) activates the same treatment.
  const activeIds = new Set(visiblePoints
    .filter(p => p.id === selectedId || (highlightJsonId && POINT_JSON_ID[p.id] === highlightJsonId))
    .map(p => p.id))

  function selectPoint(id, e) {
    e?.stopPropagation()
    const jsonId = POINT_JSON_ID[id]
    if (!jsonId) return
    const data = allPoints.find(p => p.id === jsonId)
    if (!data) return
    setSelectedId(id)
    onPointSelect?.(data)
  }

  function handleSvgClick(e) {
    if (!pickerMode) return
    const svg = svgRef.current
    const pt  = svg.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    const { x, y } = pt.matrixTransform(svg.getScreenCTM().inverse())
    const pos = { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 }
    setPickerPos(pos)
    console.log(`cx: ${pos.x}, cy: ${pos.y}`)
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {hideStyle && <style>{hideStyle}</style>}

      <BasicSideSvg
        className="svg-lateral"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      />

      <svg
        ref={svgRef}
        viewBox="0 0 552 707"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', cursor: pickerMode ? 'crosshair' : 'default' }}
        onClick={handleSvgClick}
      >
        {visiblePoints.map(({ id, cx, cy, color }) => {
          const isActive  = activeIds.has(id)
          const isHovered = hoveredId === id
          return (
            <g
              key={id}
              onClick={(e) => selectPoint(id, e)}
              onMouseEnter={() => setHoveredId(id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{ cursor: 'pointer' }}
            >
              {isHovered && !isActive && (
                <circle cx={cx} cy={cy} r={11} fill={color} opacity="0.25" />
              )}
              <circle cx={cx} cy={cy} r={7} fill="transparent" />
            </g>
          )
        })}

        {/* Active point — pulsing ring + name label, activated by click (or an
            external search hit via highlightJsonId) */}
        {[...activeIds].map(id => {
          const pt = visiblePoints.find(p => p.id === id)
          if (!pt) return null
          const jsonId = POINT_JSON_ID[id]
          const data   = allPoints.find(p => p.id === jsonId)
          const label  = data?.name ?? id
          const pad    = 6
          const fSize  = 11
          const w      = label.length * 6.2 + pad * 2
          const h      = fSize + pad * 2
          const tx = pt.cx + 16 + w > 552 ? pt.cx - w - 16 : pt.cx + 16
          const ty = pt.cy - h / 2
          return (
            <g key={`active-${id}`} pointerEvents="none">
              <circle cx={pt.cx} cy={pt.cy} r={11} fill="none" stroke="#ffffff" strokeWidth="1.5" opacity="0.9" />
              <circle cx={pt.cx} cy={pt.cy} r={11} fill="none" stroke="#ffffff" strokeWidth="2">
                <animate attributeName="r"       values="11;22;11" dur="1.6s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.75;0;0.75" dur="1.6s" repeatCount="indefinite" />
              </circle>
              <rect x={tx} y={ty} width={w} height={h} rx={4} fill="rgba(0,0,0,0.72)" />
              <text x={tx + pad} y={ty + fSize + pad * 0.6} fontSize={fSize} fill="white" fontFamily="system-ui, sans-serif">
                {label}
              </text>
            </g>
          )
        })}

        {/* Coordinate picker crosshair (dev only) */}
        {pickerMode && pickerPos && (
          <g>
            <line x1={pickerPos.x - 10} y1={pickerPos.y} x2={pickerPos.x + 10} y2={pickerPos.y} stroke="#f59e0b" strokeWidth="1.5" />
            <line x1={pickerPos.x} y1={pickerPos.y - 10} x2={pickerPos.x} y2={pickerPos.y + 10} stroke="#f59e0b" strokeWidth="1.5" />
            <text x={pickerPos.x + 12} y={pickerPos.y - 6} fontSize="10" fill="#f59e0b" fontFamily="monospace">
              {pickerPos.x},{pickerPos.y}
            </text>
          </g>
        )}
      </svg>
    </div>
  )
}
