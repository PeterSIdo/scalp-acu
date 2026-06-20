import { useState, useRef } from 'react'
import { allPoints } from '../../data/points'
import headFrontSvg from '../../assets/diagrams/head_front.svg'

const ORANGE = '#CB6608'
const GREEN  = '#34B904'
const PINK   = '#CB08A1'
const LIME   = '#B4CB08'

const POINT_JSON_ID = {
  // A zone yin — bilateral
  'A8-yin':          'YNSA-A8-yin',              'A8-yin_2':         'YNSA-A8-yin',
  'A1-yin':          'YNSA-A1-yin',              'A1-yin_2':         'YNSA-A1-yin',
  // B zone yin — bilateral
  'B-yin':           'YNSA-B-yin',               'B-yin_2':          'YNSA-B-yin',
  // C zone yin — bilateral
  'C-yin':           'YNSA-C-yin',               'C-yin_2':          'YNSA-C-yin',
  // D zone yin — bilateral
  'D-yin':           'YNSA-D-yin',               'D-yin_2':          'YNSA-D-yin',
  // E zone yin — bilateral
  'E1-yin':          'YNSA-E-yin',               'E1-yin_2':         'YNSA-E-yin',
  'E12-yin':         'YNSA-E-yin',               'E12-yin_2':        'YNSA-E-yin',
  // H, I yin — bilateral (H-yim is a typo in the SVG for H-yin)
  'H-yin':           'YNSA-H',                   'H-yim':            'YNSA-H',
  'I-yin':           'YNSA-I',                   'I-yin_2':          'YNSA-I',
  // Sensory yin — bilateral
  'Sensory-eye':     'YNSA-Eye',                 'Sensory-eye_2':    'YNSA-Eye',
  'Sensory-nose':    'YNSA-Nose',                'Sensory-nose_2':   'YNSA-Nose',
  'Sensory-mouth':   'YNSA-Mouth',               'Sensory-mouth_2':  'YNSA-Mouth',
  'Sensory-ear':     'YNSA-Ear',                 'Sensory-ear_2':    'YNSA-Ear',
  // Brain points yin — bilateral / midline
  'Cerebrum':        'YNSA-Brain-Cerebrum-yin',    'Cerebrum_2':    'YNSA-Brain-Cerebrum-yin',
  'Cerebellum':      'YNSA-Brain-Cerebellum-yin',  'Cerebellum_2':  'YNSA-Brain-Cerebellum-yin',
  'Basal-ganglia':   'YNSA-Brain-BasalGanglia-yin',
}

// Coordinates from head_front.svg (viewBox 0 0 485 640)
// Matrix-transform circles: center = (tx − 4, ty + 4)
const POINTS = [
  // ── A zone yin ───────────────────────────────────────────
  { id: 'A8-yin',          cx: 225.749, cy: 108,    color: ORANGE },
  { id: 'A1-yin',          cx: 225.749, cy: 131,    color: ORANGE },
  { id: 'A8-yin_2',        cx: 273.749, cy: 108,    color: ORANGE },
  { id: 'A1-yin_2',        cx: 273.749, cy: 131,    color: ORANGE },
  // ── B zone yin ───────────────────────────────────────────
  { id: 'B-yin',           cx: 187.749, cy: 119,    color: ORANGE },
  { id: 'B-yin_2',         cx: 314.749, cy: 119,    color: ORANGE },
  // ── C zone yin ───────────────────────────────────────────
  { id: 'C-yin',           cx:  95.749, cy: 123,    color: ORANGE },
  { id: 'C-yin_2',         cx: 396.749, cy: 123,    color: ORANGE },
  // ── D zone yin ───────────────────────────────────────────
  { id: 'D-yin',           cx:  72.749, cy: 260,    color: ORANGE },
  { id: 'D-yin_2',         cx: 415.749, cy: 256,    color: ORANGE },
  // ── E zone yin ───────────────────────────────────────────
  { id: 'E1-yin',          cx: 154.749, cy: 212,    color: ORANGE },
  { id: 'E12-yin',         cx: 204.749, cy: 228,    color: ORANGE },
  { id: 'E12-yin_2',       cx: 285.749, cy: 228,    color: ORANGE },
  { id: 'E1-yin_2',        cx: 335.749, cy: 213,    color: ORANGE },
  // ── H, I yin ─────────────────────────────────────────────
  { id: 'H-yim',           cx: 186.749, cy:  98,    color: GREEN  },
  { id: 'H-yin',           cx: 313.749, cy:  97,    color: GREEN  },
  { id: 'I-yin',           cx:  86.749, cy: 108,    color: GREEN  },
  { id: 'I-yin_2',         cx: 405.749, cy: 108,    color: GREEN  },
  // ── Sensory yin ──────────────────────────────────────────
  { id: 'Sensory-eye',     cx: 270.749, cy: 163,    color: PINK   },
  { id: 'Sensory-eye_2',   cx: 225.749, cy: 163,    color: PINK   },
  { id: 'Sensory-nose',    cx: 270.749, cy: 182,    color: PINK   },
  { id: 'Sensory-nose_2',  cx: 225.749, cy: 182,    color: PINK   },
  { id: 'Sensory-mouth',   cx: 270.749, cy: 201,    color: PINK   },
  { id: 'Sensory-mouth_2', cx: 225.749, cy: 201,    color: PINK   },
  { id: 'Sensory-ear',     cx: 370.749, cy: 178,    color: PINK   },
  { id: 'Sensory-ear_2',   cx: 125.749, cy: 178,    color: PINK   },
  // ── Brain points yin ─────────────────────────────────────
  { id: 'Cerebrum',        cx: 224.749, cy:  95,    color: LIME   },
  { id: 'Cerebrum_2',      cx: 272.749, cy:  96,    color: LIME   },
  { id: 'Cerebellum',      cx: 224.749, cy:  85,    color: LIME   },
  { id: 'Cerebellum_2',    cx: 272.749, cy:  86,    color: LIME   },
  { id: 'Basal-ganglia',   cx: 248.749, cy:  88,    color: LIME,  rx: 4, ry: 13 },
]

export default function HeadFrontal({ pickerMode = false, onPointSelect, highlightJsonId = null }) {
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
      viewBox="0 0 485 640"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: '100%', maxHeight: '100%', cursor: pickerMode ? 'crosshair' : 'default' }}
      onClick={handleSvgClick}
    >
      <image href={headFrontSvg} x="0" y="0" width="485" height="640" />

      {POINTS.map(({ id, cx, cy, color, rx, ry }) => {
        const isEllipse = rx !== undefined
        return (
          <g
            key={id}
            onClick={(e) => selectPoint(id, e)}
            onMouseEnter={() => setHoveredId(id)}
            onMouseLeave={() => setHoveredId(null)}
            style={{ cursor: 'pointer' }}
          >
            {selectedId === id && (
              isEllipse
                ? <ellipse cx={cx} cy={cy} rx={rx + 5} ry={ry + 5} fill="none" stroke={color} strokeWidth="2" opacity="0.85" />
                : <circle  cx={cx} cy={cy} r={9}        fill="none" stroke={color} strokeWidth="2" opacity="0.85" />
            )}
            {isEllipse
              ? <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="transparent" />
              : <circle  cx={cx} cy={cy} r={7}            fill="transparent" />
            }
          </g>
        )
      })}

      {/* Search highlight — pulsing ring */}
      {highlightJsonId && POINTS
        .filter(p => POINT_JSON_ID[p.id] === highlightJsonId)
        .map(({ cx, cy, rx, ry }) => (
          <g key={`hl-${cx}-${cy}`} pointerEvents="none">
            <circle cx={cx} cy={cy} r={11} fill="none" stroke="#ffffff" strokeWidth="1.5" opacity="0.9" />
            <circle cx={cx} cy={cy} r={11} fill="none" stroke="#ffffff" strokeWidth="2">
              <animate attributeName="r"       values="11;22;11" dur="1.6s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.75;0;0.75" dur="1.6s" repeatCount="indefinite" />
            </circle>
          </g>
        ))
      }

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
        const tx = pt.cx + 12 + w > 485 ? pt.cx - w - 8 : pt.cx + 12
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
