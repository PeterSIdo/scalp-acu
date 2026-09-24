import { useState, useRef } from 'react'
import { allPoints } from '../../data/points'
import { zoneOf } from '../../data/basicZones'
import BasicBackSvg from '../../assets/diagrams/basic-back.svg?react'

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

// Coordinates read from basic-back.svg (viewBox 0 0 500 737). Circles use cx/cy
// directly; matrix-transformed points (G-zone, Eye-yang group) and path-drawn
// points (H-yang_2, I-yang, I-yang_2, C-yang, C-yang_2, B-yang_2, A-yang_2) use
// their resolved/bounding-box center.
const POINTS = [
  // ── A zone yang ──────────────────────────────────────────
  { id: 'A-yang',          cx:   257, cy:   189,  color: RED   },
  { id: 'A-yang_2',        cx:   257, cy:   172,  color: RED   },
  { id: 'A-yang_3',        cx:   224, cy:   189,  color: RED   },
  { id: 'A-yang_4',        cx:   224, cy:   172,  color: RED   },
  // ── B zone yang ──────────────────────────────────────────
  { id: 'B-yang',          cx:   195, cy:   184,  color: RED   },
  { id: 'B-yang_2',        cx:   278, cy:   184,  color: RED   },
  // ── C zone yang ──────────────────────────────────────────
  { id: 'C-yang',          cx:   340, cy:   207,  color: RED   },
  { id: 'C-yang_2',        cx:   132, cy:   207,  color: RED   },
  // ── D zone yang ──────────────────────────────────────────
  { id: 'D-yang',          cx:   402, cy:   292,  color: RED   },
  { id: 'D-yang_2',        cx:    75, cy:   289,  color: RED   },
  { id: 'D5-yang',         cx:   428, cy:   275,  color: RED   },
  { id: 'D5-yang_2',       cx:    49, cy:   275,  color: RED   },
  { id: 'D6-yang',         cx:    55, cy:   281,  color: RED   },
  { id: 'D6-yang_2',       cx:   423, cy:   283,  color: RED   },
  // ── E zone yang ──────────────────────────────────────────
  { id: 'E1-yang',         cx:   283, cy:   289,  color: RED   },
  { id: 'E12-yang',        cx:   256, cy:   299,  color: RED   },
  { id: 'E1-yang_2',       cx:   197, cy:   289,  color: RED   },
  { id: 'E12-yang_2',      cx:   224, cy:   299,  color: RED   },
  // ── F zone yang ──────────────────────────────────────────
  { id: 'F',               cx: 394.5, cy:   387,  color: RED   },
  { id: 'F_2',              cx:    87, cy:   387,  color: RED   },
  // ── G zone yang ──────────────────────────────────────────
  { id: 'G1-yang',         cx:   397, cy:   405,  color: RED   },
  { id: 'G2-yang',         cx:   391, cy:   415,  color: RED   },
  { id: 'G3-yang',         cx:   383, cy:   405,  color: RED   },
  { id: 'G1-yang_2',       cx:    84, cy:   409,  color: RED   },
  { id: 'G2-yang_2',       cx:    90, cy:   419,  color: RED   },
  { id: 'G3-yang_2',       cx:    98, cy:   409,  color: RED   },
  // ── H, I yang ────────────────────────────────────────────
  { id: 'H-yang',          cx:   195, cy:   168,  color: GREEN },
  { id: 'H-yang_2',        cx:   278, cy:   168,  color: GREEN },
  { id: 'I-yang',          cx:   349, cy:   191,  color: GREEN },
  { id: 'I-yang_2',        cx:   123, cy:   191,  color: GREEN },
  // ── Sensory yang ─────────────────────────────────────────
  { id: 'sensory-eye',     cx:   223, cy:   207,  color: PINK  },
  { id: 'sensory-eye_2',   cx:   257, cy:   207,  color: PINK  },
  { id: 'sensory-nose',    cx:   223, cy:   223,  color: PINK  },
  { id: 'sensory-nose_2',  cx:   257, cy:   223,  color: PINK  },
  { id: 'sensory-mouth',   cx:   223, cy:   240,  color: PINK  },
  { id: 'sensory-mouth_2', cx:   257, cy:   240,  color: PINK  },
  { id: 'sensory-ear',     cx:   202, cy:   225,  color: PINK  },
  { id: 'sensory-ear_2',   cx:   280, cy:   225,  color: PINK  },
  // ── Brain points yang ────────────────────────────────────
  { id: 'Cerebrum',        cx:   223, cy:   155,  color: LIME  },
  { id: 'Cerebrum_2',      cx:   258, cy:   155,  color: LIME  },
  { id: 'Cerebellum',      cx:   223, cy:   140,  color: LIME  },
  { id: 'Cerebellum_2',    cx:   258, cy:   140,  color: LIME  },
  { id: 'Basal-ganglia',   cx: 241.5, cy: 147.5,  color: LIME, rx: 6.5, ry: 14.5 },
]

// basic-back.svg has no separate sensory/brain groups — both sets sit together
// in an unnamed "Group 15" — so those are hidden by element id instead.
const SENSORY_SEL = ['[id^="sensory-"]']
const BRAIN_SEL   = ['[id="Basal-ganglia"]', '[id^="Cerebrum"]', '[id^="Cerebellum"]']
const SVG_HIDE = {
  'ynsa-basic':   [...SENSORY_SEL, ...BRAIN_SEL],
  'ynsa-sensory': ['[id="basic-yang-points"]', ...BRAIN_SEL],
  'ynsa-brain':   ['[id="basic-yang-points"]', ...SENSORY_SEL],
}

function buildHideStyle(activeSubgroup) {
  const selectors = SVG_HIDE[activeSubgroup]
  if (!selectors) return ''
  return selectors.map(s => `.svg-posterior ${s}`).join(',\n') + ' { display: none; }'
}

export default function HeadPosterior({ pickerMode = false, onPointSelect, highlightJsonId = null, pointFilter = null, activeSubgroup = null, activeZone = null, onZoneChange }) {
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

  // Same-zone points get a bare pulsing ring — see HeadLateral for the full
  // rationale (shared Basic Point zone flash across the grid's three tiles).
  const zoneFlashIds = activeZone
    ? visiblePoints.filter(p => !activeIds.has(p.id) && zoneOf(POINT_JSON_ID[p.id]) === activeZone).map(p => p.id)
    : []

  function selectPoint(id, e) {
    e?.stopPropagation()
    const jsonId = POINT_JSON_ID[id]
    if (!jsonId) return
    const data = allPoints.find(p => p.id === jsonId)
    if (!data) return
    setSelectedId(id)
    onPointSelect?.(data)
    onZoneChange?.(zoneOf(jsonId))
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

      <BasicBackSvg
        className="svg-posterior"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      />

      <svg
        ref={svgRef}
        viewBox="0 0 500 737"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', cursor: pickerMode ? 'crosshair' : 'default' }}
        onClick={handleSvgClick}
      >
        {visiblePoints.map(({ id, cx, cy, color, rx, ry }) => {
          const isEllipse = rx !== undefined
          const isActive   = activeIds.has(id)
          const isHovered  = hoveredId === id
          return (
            <g
              key={id}
              onClick={(e) => selectPoint(id, e)}
              onMouseEnter={() => setHoveredId(id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{ cursor: 'pointer' }}
            >
              {isHovered && !isActive && (
                isEllipse
                  ? <ellipse cx={cx} cy={cy} rx={rx + 4} ry={ry + 4} fill={color} opacity="0.25" />
                  : <circle  cx={cx} cy={cy} r={11}       fill={color} opacity="0.25" />
              )}
              {isEllipse
                ? <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="transparent" />
                : <circle  cx={cx} cy={cy} r={7}            fill="transparent" />
              }
            </g>
          )
        })}

        {/* Active point — pulsing ring + name label, activated by click (or an
            external search hit via highlightJsonId) */}
        {[...activeIds].map(id => {
          const pt = visiblePoints.find(p => p.id === id)
          if (!pt) return null
          const isEllipse = pt.rx !== undefined
          const ringRx = isEllipse ? pt.rx + 4 : 11
          const ringRy = isEllipse ? pt.ry + 4 : 11
          const jsonId = POINT_JSON_ID[id]
          const data   = allPoints.find(p => p.id === jsonId)
          const label  = data?.name ?? id
          const pad    = 6
          const fSize  = 11
          const w      = label.length * 6.2 + pad * 2
          const h      = fSize + pad * 2
          const tx = pt.cx + ringRx + 5 + w > 500 ? pt.cx - ringRx - 5 - w : pt.cx + ringRx + 5
          const ty = pt.cy - h / 2
          return (
            <g key={`active-${id}`} pointerEvents="none">
              <ellipse cx={pt.cx} cy={pt.cy} rx={ringRx} ry={ringRy} fill="none" stroke="#000000" strokeWidth="1.5" opacity="0.9" />
              <ellipse cx={pt.cx} cy={pt.cy} rx={ringRx} ry={ringRy} fill="none" stroke="#000000" strokeWidth="2">
                <animate attributeName="rx"      values={`${ringRx};${ringRx * 2};${ringRx}`} dur="1.6s" repeatCount="indefinite" />
                <animate attributeName="ry"      values={`${ringRy};${ringRy * 2};${ringRy}`} dur="1.6s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.75;0;0.75" dur="1.6s" repeatCount="indefinite" />
              </ellipse>
              <rect x={tx} y={ty} width={w} height={h} rx={4} fill="rgba(0,0,0,0.72)" />
              <text x={tx + pad} y={ty + fSize + pad * 0.6} fontSize={fSize} fill="white" fontFamily="system-ui, sans-serif">
                {label}
              </text>
            </g>
          )
        })}

        {/* Zone flash — pulsing ring + zone-letter label on every other point
            sharing the active zone, mirroring Y-Points' meridian flash. */}
        {zoneFlashIds.map(id => {
          const pt = visiblePoints.find(p => p.id === id)
          if (!pt) return null
          const isEllipse = pt.rx !== undefined
          const ringRx = isEllipse ? pt.rx + 4 : 11
          const ringRy = isEllipse ? pt.ry + 4 : 11
          const zone  = zoneOf(POINT_JSON_ID[id])
          const pad   = 4
          const fSize = 10
          const w     = zone ? zone.length * 6.2 + pad * 2 : 0
          const h     = fSize + pad * 2
          const tx = pt.cx + ringRx + 3 + w > 500 ? pt.cx - ringRx - 3 - w : pt.cx + ringRx + 3
          const ty = pt.cy - h / 2
          return (
            <g key={`zone-${id}`} pointerEvents="none">
              <ellipse cx={pt.cx} cy={pt.cy} rx={ringRx} ry={ringRy} fill="none" stroke="#000000" strokeWidth="2" opacity="0.85">
                <animate attributeName="rx"      values={`${ringRx};${ringRx * 1.8};${ringRx}`} dur="1.6s" repeatCount="indefinite" />
                <animate attributeName="ry"      values={`${ringRy};${ringRy * 1.8};${ringRy}`} dur="1.6s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.85;0;0.85" dur="1.6s" repeatCount="indefinite" />
              </ellipse>
              {zone && (
                <>
                  <rect x={tx} y={ty} width={w} height={h} rx={3} fill="rgba(0,0,0,0.72)" />
                  <text x={tx + pad} y={ty + fSize + pad * 0.6} fontSize={fSize} fontWeight="600" fill="white" fontFamily="system-ui, sans-serif">
                    {zone}
                  </text>
                </>
              )}
            </g>
          )
        })}

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
