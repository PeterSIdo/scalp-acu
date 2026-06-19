import { useState, useRef } from 'react'
import { allPoints } from '../../data/points'
import headSideSvg from '../../assets/diagrams/head_side.svg'

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

// Exact coordinates from head_side.svg (viewBox 0 0 556 712)
// Path-circle centres extracted from their M cx cy command
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
  { id: 'I-yin',    cx: 272,   cy:  97.5,   color: GREEN  },
  { id: 'I-yang',   cx: 460,   cy: 232.5,   color: GREEN  },
  // ── A zone ───────────────────────────────────────────
  { id: 'A8-yin',   cx: 128,   cy: 115.5,   color: ORANGE },
  { id: 'A1-yin',   cx: 106,   cy: 139.5,   color: ORANGE },
  { id: 'A8-yang',  cx: 520,   cy: 203.5,   color: RED    },
  { id: 'A1-yang',  cx: 531,   cy: 228.5,   color: RED    },
  // ── B zone ───────────────────────────────────────────
  { id: 'B-yin',    cx: 154,   cy: 123.5,   color: ORANGE },
  { id: 'B-yang',   cx: 505,   cy: 228.5,   color: RED    },
  // ── C zone ───────────────────────────────────────────
  { id: 'C-yin',    cx: 215.5, cy: 127.5,   color: ORANGE },
  { id: 'C-yang',   cx: 471,   cy: 245.5,   color: RED    },
  // ── D zone — single point ────────────────────────────
  { id: 'D-yin',    cx: 227,   cy: 299.5,   color: ORANGE },
  { id: 'D-yang',   cx: 407,   cy: 306.5,   color: RED    },
  // ── D sub-points yin (D1=L1 … D6=Sacrum) ────────────
  { id: 'D1-yin',   cx: 272.5, cy: 280,     color: ORANGE },
  { id: 'D2-yin',   cx: 272.5, cy: 287.875, color: ORANGE },
  { id: 'D3-yin',   cx: 272.5, cy: 295.75,  color: ORANGE },
  { id: 'D4-yin',   cx: 272.5, cy: 303.625, color: ORANGE },
  { id: 'D5-yin',   cx: 272.5, cy: 311.5,   color: ORANGE },
  { id: 'D6-yin',   cx: 272.5, cy: 319.375, color: ORANGE },
  // ── D sub-points yang (D1=L1 … D6=Sacrum) ───────────
  { id: 'D1-yang',  cx: 327,   cy: 245.5,   color: RED    },
  { id: 'D2-yang',  cx: 336,   cy: 246.5,   color: RED    },
  { id: 'D3-yang',  cx: 345,   cy: 249.5,   color: RED    },
  { id: 'D4-yang',  cx: 353,   cy: 254.5,   color: RED    },
  { id: 'D5-yang',  cx: 360,   cy: 260.5,   color: RED    },
  { id: 'D6-yang',  cx: 365,   cy: 267.5,   color: RED    },
  // ── E zone ───────────────────────────────────────────
  { id: 'E12-yin',  cx:  74,   cy: 215.5,   color: ORANGE },
  { id: 'E1-yin',   cx: 107,   cy: 206.5,   color: ORANGE },
  { id: 'E1-yang',  cx: 512,   cy: 302.5,   color: RED    },
  { id: 'E12-yang', cx: 529,   cy: 310.5,   color: RED    },
  // ── F zone ───────────────────────────────────────────
  { id: 'F-yang',   cx: 361,   cy: 398.5,   color: RED    },
  // ── G zone (medial / frontal / lateral knee) ─────────
  { id: 'G1-yin',   cx: 216,   cy: 284.5,   color: ORANGE },
  { id: 'G2-yin',   cx: 226.5, cy: 284.5,   color: ORANGE },
  { id: 'G3-yin',   cx: 237,   cy: 284.5,   color: ORANGE },
  { id: 'G1-yang',  cx: 327,   cy: 431.5,   color: RED    },
  { id: 'G2-yang',  cx: 338,   cy: 437.5,   color: RED    },
  { id: 'G3-yang',  cx: 348,   cy: 431.5,   color: RED    },
]

export default function HeadLateral({ pickerMode = false, onPointSelect }) {
  const [pickerPos, setPickerPos]   = useState(null)
  const [selectedId, setSelectedId] = useState(null)
  const [hoveredId,  setHoveredId]  = useState(null)
  const svgRef = useRef(null)

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
    <svg
      ref={svgRef}
      viewBox="0 0 556 712"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: '100%', maxHeight: '100%', cursor: pickerMode ? 'crosshair' : 'default' }}
      onClick={handleSvgClick}
    >
      {/* SVG file is the single source of truth for all visuals */}
      <image href={headSideSvg} x="0" y="0" width="556" height="712" />

      {/* Transparent interactive overlay — one circle per point */}
      {POINTS.map(({ id, cx, cy, color }) => (
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

      {/* Hover tooltip */}
      {hoveredId && (() => {
        const pt     = POINTS.find(p => p.id === hoveredId)
        if (!pt) return null
        const jsonId = POINT_JSON_ID[hoveredId]
        const data   = allPoints.find(p => p.id === jsonId)
        const label  = data?.name ?? hoveredId
        const pad    = 6
        const fSize  = 11
        const w      = label.length * 6.2 + pad * 2
        const h      = fSize + pad * 2
        // offset tooltip above-right; flip left if near right edge
        const tx = pt.cx + 12 + w > 556 ? pt.cx - w - 8 : pt.cx + 12
        const ty = pt.cy - h - 4
        return (
          <g pointerEvents="none">
            <rect x={tx} y={ty} width={w} height={h} rx={4} fill="rgba(0,0,0,0.72)" />
            <text
              x={tx + pad}
              y={ty + fSize + pad * 0.6}
              fontSize={fSize}
              fill="white"
              fontFamily="system-ui, sans-serif"
            >
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
  )
}
