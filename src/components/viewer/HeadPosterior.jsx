import { useState, useRef } from 'react'
import { allPoints } from '../../data/points'
import HeadBackSvg from '../../assets/diagrams/head_back.svg?react'

const RED   = '#FF0808'
const GREEN = '#34B904'
const PINK  = '#CB08A1'
const LIME  = '#B4CB08'

const POINT_JSON_ID = {
  // A zone yang — bilateral (A-yang=A1, A-yang_2=A8)
  'A-yang':          'YNSA-A1-yang',              'A-yang_3':         'YNSA-A1-yang',
  'A-yang_2':        'YNSA-A8-yang',              'A-yang_4':         'YNSA-A8-yang',
  // B zone yang — bilateral
  'B-yang':          'YNSA-B-yang',               'B-yang_2':         'YNSA-B-yang',
  // C zone yang — bilateral
  'C-yang':          'YNSA-C-yang',               'C-yang_2':         'YNSA-C-yang',
  // D zone yang — bilateral
  'D-yang':          'YNSA-D-yang',               'D-yang_2':         'YNSA-D-yang',
  'D5-yang':         'YNSA-D5-yang',              'D5-yang_2':        'YNSA-D5-yang',
  'D6-yang':         'YNSA-D6-yang',              'D6-yang_2':        'YNSA-D6-yang',
  // E zone yang — bilateral
  'E1-yang':         'YNSA-E-yang',               'E1-yang_2':        'YNSA-E-yang',
  'E12-yang':        'YNSA-E-yang',               'E12-yang_2':       'YNSA-E-yang',
  // F zone yang — bilateral
  'F':               'YNSA-F-yang',               'F_2':              'YNSA-F-yang',
  // G zone yang — bilateral
  'G1-yang':         'YNSA-G1-yang',              'G1-yang_2':        'YNSA-G1-yang',
  'G2-yang':         'YNSA-G2-yang',              'G2-yang_2':        'YNSA-G2-yang',
  'G3-yang':         'YNSA-G3-yang',              'G3-yang_2':        'YNSA-G3-yang',
  // H, I yang — bilateral
  'H-yang':          'YNSA-H',                    'H-yang_2':         'YNSA-H',
  'I-yang':          'YNSA-I',                    'I-yang_2':         'YNSA-I',
  // Sensory yang — bilateral
  'sensory-eye':     'YNSA-Eye',                  'sensory-eye_2':    'YNSA-Eye',
  'sensory-nose':    'YNSA-Nose',                 'sensory-nose_2':   'YNSA-Nose',
  'sensory-mouth':   'YNSA-Mouth',                'sensory-mouth_2':  'YNSA-Mouth',
  'sensory-ear':     'YNSA-Ear',                  'sensory-ear_2':    'YNSA-Ear',
  // Brain points yang — bilateral / midline
  'Cerebrum':        'YNSA-Brain-Cerebrum-yang',    'Cerebrum_2':    'YNSA-Brain-Cerebrum-yang',
  'Cerebellum':      'YNSA-Brain-Cerebellum-yang',  'Cerebellum_2':  'YNSA-Brain-Cerebellum-yang',
  'Basal-ganglia':   'YNSA-Brain-BasalGanglia-yang',
}

// Coordinates from head_back.svg (viewBox 0 0 447 626)
const POINTS = [
  // ── A zone yang ──────────────────────────────────────────
  { id: 'A-yang',          cx: 254.436, cy: 174.45,  color: RED   },
  { id: 'A-yang_2',        cx: 254.436, cy: 156.45,  color: RED   },
  { id: 'A-yang_3',        cx: 220.436, cy: 173.45,  color: RED   },
  { id: 'A-yang_4',        cx: 220.436, cy: 156.45,  color: RED   },
  // ── B zone yang ──────────────────────────────────────────
  { id: 'B-yang',          cx: 193.436, cy: 169.45,  color: RED   },
  { id: 'B-yang_2',        cx: 275.436, cy: 169.45,  color: RED   },
  // ── C zone yang ──────────────────────────────────────────
  { id: 'C-yang',          cx: 339.436, cy: 192.45,  color: RED   },
  { id: 'C-yang_2',        cx: 129.436, cy: 192.45,  color: RED   },
  // ── D zone yang ──────────────────────────────────────────
  { id: 'D-yang',          cx: 387.436, cy: 270.45,  color: RED   },
  { id: 'D-yang_2',        cx:  71.436, cy: 274.45,  color: RED   },
  { id: 'D5-yang',         cx: 412.436, cy: 253.45,  color: RED   },
  { id: 'D5-yang_2',       cx:  33.436, cy: 255.45,  color: RED   },
  { id: 'D6-yang',         cx:  39.436, cy: 261.45,  color: RED   },
  { id: 'D6-yang_2',       cx: 407.436, cy: 261.45,  color: RED   },
  // ── E zone yang ──────────────────────────────────────────
  { id: 'E1-yang',         cx: 283.436, cy: 274.45,  color: RED   },
  { id: 'E12-yang',        cx: 254.436, cy: 284.45,  color: RED   },
  { id: 'E1-yang_2',       cx: 183.436, cy: 274.45,  color: RED   },
  { id: 'E12-yang_2',      cx: 212.436, cy: 284.45,  color: RED   },
  // ── F zone yang ──────────────────────────────────────────
  { id: 'F',               cx: 377.436, cy: 362.45,  color: RED   },
  { id: 'F_2',             cx:  79.436, cy: 362.45,  color: RED   },
  // ── G zone yang ──────────────────────────────────────────
  { id: 'G1-yang',         cx: 369.436, cy: 388.45,  color: RED   },
  { id: 'G2-yang',         cx: 363.436, cy: 398.45,  color: RED   },
  { id: 'G3-yang',         cx: 355.436, cy: 388.45,  color: RED   },
  { id: 'G1-yang_2',       cx:  79.436, cy: 380.45,  color: RED   },
  { id: 'G2-yang_2',       cx:  85.436, cy: 390.45,  color: RED   },
  { id: 'G3-yang_2',       cx:  93.436, cy: 380.45,  color: RED   },
  // ── H, I yang ────────────────────────────────────────────
  { id: 'H-yang',          cx: 188.436, cy: 156.45,  color: GREEN },
  { id: 'H-yang_2',        cx: 280.436, cy: 155.95,  color: GREEN },
  { id: 'I-yang',          cx: 343.436, cy: 178.45,  color: GREEN },
  { id: 'I-yang_2',        cx: 124.936, cy: 178.159, color: GREEN },
  // ── Sensory yang ─────────────────────────────────────────
  { id: 'sensory-eye',     cx: 253.436, cy: 189.45,  color: PINK  },
  { id: 'sensory-eye_2',   cx: 220.436, cy: 189.45,  color: PINK  },
  { id: 'sensory-nose',    cx: 253.436, cy: 203.45,  color: PINK  },
  { id: 'sensory-nose_2',  cx: 220.436, cy: 203.45,  color: PINK  },
  { id: 'sensory-mouth',   cx: 253.436, cy: 217.45,  color: PINK  },
  { id: 'sensory-mouth_2', cx: 220.436, cy: 217.45,  color: PINK  },
  { id: 'sensory-ear',     cx: 270.436, cy: 212.45,  color: PINK  },
  { id: 'sensory-ear_2',   cx: 203.436, cy: 212.45,  color: PINK  },
  // ── Brain points yang ────────────────────────────────────
  { id: 'Cerebrum',        cx: 220.436, cy: 137.45,  color: LIME  },
  { id: 'Cerebrum_2',      cx: 254.436, cy: 136.45,  color: LIME  },
  { id: 'Cerebellum',      cx: 220.436, cy: 127.45,  color: LIME  },
  { id: 'Cerebellum_2',    cx: 254.436, cy: 126.45,  color: LIME  },
  { id: 'Basal-ganglia',   cx: 238.436, cy: 132.95,  color: LIME, rx: 4, ry: 7.5 },
]

// head_back.svg: basic points are in "basic-yang-points"; sensory in Group 15/Group 16;
// brain points are ungrouped direct children — targeted individually by id.
const SVG_HIDE = {
  'ynsa-basic': [
    '[id="Group 15"]', '[id="Group 16"]',
    '#Basal-ganglia', '#Cerebrum', '#Cerebellum', '#Cerebrum_2', '#Cerebellum_2',
  ],
  'ynsa-sensory': [
    '[id="basic-yang-points"]',
    '#Basal-ganglia', '#Cerebrum', '#Cerebellum', '#Cerebrum_2', '#Cerebellum_2',
  ],
  'ynsa-brain': [
    '[id="basic-yang-points"]',
    '[id="Group 15"]', '[id="Group 16"]',
  ],
}

function buildHideStyle(activeSubgroup) {
  const selectors = SVG_HIDE[activeSubgroup]
  if (!selectors) return ''
  return selectors.map(s => `.svg-posterior ${s}`).join(',\n') + ' { display: none; }'
}

export default function HeadPosterior({ pickerMode = false, onPointSelect, highlightJsonId = null, pointFilter = null, activeSubgroup = null }) {
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

      <HeadBackSvg
        className="svg-posterior"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      />

      <svg
        ref={svgRef}
        viewBox="0 0 447 626"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', cursor: pickerMode ? 'crosshair' : 'default' }}
        onClick={handleSvgClick}
      >
        {visiblePoints.map(({ id, cx, cy, color, rx, ry }) => {
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
          const tx = pt.cx + 12 + w > 447 ? pt.cx - w - 8 : pt.cx + 12
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
    </div>
  )
}
