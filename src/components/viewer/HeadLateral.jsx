import { useState, useRef } from 'react'
import { allPoints } from '../../data/points'
import HeadSideSvg from '../../assets/diagrams/head_side.svg?react'

const ORANGE = '#CB6608'
const RED    = '#FF0808'
const GREEN  = '#34B904'
const BLUE   = '#0845FF'

// Maps SVG point id → ynsa.json id
const POINT_JSON_ID = {
  // A zone
  'A1-yin':   'YNSA-A1-yin',   'A8-yin':   'YNSA-A8-yin',
  'A1-yang':  'YNSA-A1-yang',  'A8-yang':  'YNSA-A8-yang',
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
  // G zone — individual sub-point descriptions
  'G1-yin':   'YNSA-G1-yin',   'G1-yang':  'YNSA-G1-yang',
  'G2-yin':   'YNSA-G2-yin',   'G2-yang':  'YNSA-G2-yang',
  'G3-yin':   'YNSA-G3-yin',   'G3-yang':  'YNSA-G3-yang',
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

// Exact coordinates read from head_side.svg (viewBox 0 0 556 712)
const POINTS = [
  // ── Ear points ───────────────────────────────────────
  { id: 'ear-yin',        cx: 166,   cy: 165.5,   color: BLUE   },
  { id: 'extra-ear-yin',  cx: 279,   cy: 117.5,   color: BLUE   },
  { id: 'extra-ear-yang', cx: 367,   cy: 138.5,   color: BLUE   },
  { id: 'ear-yang',       cx: 441,   cy: 237.5,   color: BLUE   },
  // ── H (extra lumbar) ─────────────────────────────────
  { id: 'H-yin',    cx: 161,   cy: 105.5,   color: GREEN  },
  { id: 'H-yang',   cx: 495,   cy: 213.5,   color: GREEN  },
  // ── I (extra lumbar) ─────────────────────────────────
  { id: 'I-yin',    cx: 227,   cy: 115.5,   color: GREEN  },
  { id: 'I-yang',   cx: 460,   cy: 232.5,   color: GREEN  },
  // ── A zone ───────────────────────────────────────────
  { id: 'A1-yin',   cx: 106,   cy: 139.5,   color: ORANGE },
  { id: 'A8-yin',   cx: 128,   cy: 115.5,   color: ORANGE },
  { id: 'A1-yang',  cx: 534,   cy: 223.5,   color: RED    },
  { id: 'A8-yang',  cx: 524,   cy: 206.5,   color: RED    },
  // ── B zone ───────────────────────────────────────────
  { id: 'B-yin',    cx: 154,   cy: 123.5,   color: ORANGE },
  { id: 'B-yang',   cx: 511,   cy: 227.5,   color: RED    },
  // ── C zone ───────────────────────────────────────────
  { id: 'C-yin',    cx: 215.5, cy: 127.5,   color: ORANGE },
  { id: 'C-yang',   cx: 474,   cy: 240.5,   color: RED    },
  // ── D zone (single parent point) ─────────────────────
  { id: 'D-yin',    cx: 227,   cy: 299.5,   color: ORANGE },
  { id: 'D-yang',   cx: 409,   cy: 305.5,   color: RED    },
  // ── D zone (individual vertebrae) ────────────────────
  { id: 'D1-yin',   cx: 272.5, cy: 280,     color: ORANGE },
  { id: 'D2-yin',   cx: 272.5, cy: 287.875, color: ORANGE },
  { id: 'D3-yin',   cx: 272.5, cy: 295.75,  color: ORANGE },
  { id: 'D4-yin',   cx: 272.5, cy: 303.625, color: ORANGE },
  { id: 'D5-yin',   cx: 272.5, cy: 311.5,   color: ORANGE },
  { id: 'D6-yin',   cx: 272.5, cy: 319.375, color: ORANGE },
  { id: 'D1-yang',  cx: 330,   cy: 240.5,   color: RED    },
  { id: 'D2-yang',  cx: 339,   cy: 241.5,   color: RED    },
  { id: 'D3-yang',  cx: 348,   cy: 244.5,   color: RED    },
  { id: 'D4-yang',  cx: 356,   cy: 249.5,   color: RED    },
  { id: 'D5-yang',  cx: 363,   cy: 255.5,   color: RED    },
  { id: 'D6-yang',  cx: 368,   cy: 262.5,   color: RED    },
  // ── E zone ───────────────────────────────────────────
  { id: 'E1-yin',   cx: 107,   cy: 206.5,   color: ORANGE },
  { id: 'E12-yin',  cx: 74,    cy: 215.5,   color: ORANGE },
  { id: 'E1-yang',  cx: 515,   cy: 297.5,   color: RED    },
  { id: 'E12-yang', cx: 532,   cy: 305.5,   color: RED    },
  // ── F zone ───────────────────────────────────────────
  { id: 'F-yang',   cx: 364,   cy: 393.5,   color: RED    },
  // ── G zone ───────────────────────────────────────────
  { id: 'G1-yin',   cx: 216,   cy: 284.5,   color: ORANGE },
  { id: 'G2-yin',   cx: 226.5, cy: 284.5,   color: ORANGE },
  { id: 'G3-yin',   cx: 237,   cy: 284.5,   color: ORANGE },
  { id: 'G1-yang',  cx: 330,   cy: 426.5,   color: RED    },
  { id: 'G2-yang',  cx: 341,   cy: 432.5,   color: RED    },
  { id: 'G3-yang',  cx: 351,   cy: 426.5,   color: RED    },
]

// head_side.svg groups:
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

      <HeadSideSvg
        className="svg-lateral"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      />

      <svg
        ref={svgRef}
        viewBox="0 0 556 712"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', cursor: pickerMode ? 'crosshair' : 'default' }}
        onClick={handleSvgClick}
      >
        {visiblePoints.map(({ id, cx, cy, color }) => (
          <g
            key={id}
            onClick={(e) => selectPoint(id, e)}
            onMouseEnter={() => setHoveredId(id)}
            onMouseLeave={() => setHoveredId(null)}
            style={{ cursor: 'pointer' }}
          >
            {selectedId === id && (
              <circle cx={cx} cy={cy} r={9} fill="none" stroke={color} strokeWidth="2" opacity="0.85" />
            )}
            <circle cx={cx} cy={cy} r={7} fill="transparent" />
          </g>
        ))}

        {/* Search highlight — pulsing ring */}
        {highlightJsonId && visiblePoints
          .filter(p => POINT_JSON_ID[p.id] === highlightJsonId)
          .map(({ cx, cy }) => (
            <g key={`hl-${cx}-${cy}`} pointerEvents="none">
              <circle cx={cx} cy={cy} r={11} fill="none" stroke="#ffffff" strokeWidth="1.5" opacity="0.9" />
              <circle cx={cx} cy={cy} r={11} fill="none" stroke="#ffffff" strokeWidth="2">
                <animate attributeName="r"       values="11;22;11" dur="1.6s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.75;0;0.75" dur="1.6s" repeatCount="indefinite" />
              </circle>
            </g>
          ))
        }

        {/* Hover tooltip */}
        {hoveredId && (() => {
          const pt     = visiblePoints.find(p => p.id === hoveredId)
          if (!pt) return null
          const jsonId = POINT_JSON_ID[hoveredId]
          const data   = allPoints.find(p => p.id === jsonId)
          const label  = data?.name ?? hoveredId
          const pad    = 6
          const fSize  = 11
          const w      = label.length * 6.2 + pad * 2
          const h      = fSize + pad * 2
          const tx = pt.cx + 12 + w > 556 ? pt.cx - w - 8 : pt.cx + 12
          const ty = pt.cy - h - 4
          return (
            <g pointerEvents="none">
              <rect x={tx} y={ty} width={w} height={h} rx={4} fill="rgba(0,0,0,0.72)" />
              <text x={tx + pad} y={ty + fSize + pad * 0.6} fontSize={fSize} fill="white" fontFamily="system-ui, sans-serif">
                {label}
              </text>
            </g>
          )
        })()}

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
