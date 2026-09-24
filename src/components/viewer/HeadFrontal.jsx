import { useState, useRef } from 'react'
import { allPoints } from '../../data/points'
import { zoneOf } from '../../data/basicZones'
import BasicFrontSvg from '../../assets/diagrams/basic-front.svg?react'

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
  'C-yin_2':           'YNSA-C-yin',               'C-yin_4':          'YNSA-C-yin',
  // D zone yin — bilateral
  'D-yin':           'YNSA-D-yin',               'D-yin_2':          'YNSA-D-yin',
  // E zone yin — bilateral
  'E1-yin':          'YNSA-E-yin',               'E1-yin_2':         'YNSA-E-yin',
  'E12-yin':         'YNSA-E-yin',               'E12-yin_2':        'YNSA-E-yin',
  // H, I yin — bilateral (basic-front.svg fixed the old "H-yim" typo to "H-yin_2")
  'H-yin':           'YNSA-H',                   'H-yin_2':          'YNSA-H',
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

// Coordinates read from basic-front.svg (viewBox 0 0 500 737). Circle points use
// cx/cy directly; matrix-transformed points (Sensory-*) and path-drawn points
// (I-yin) use their resolved/bounding-box center.
const POINTS = [
  // ── A zone yin ───────────────────────────────────────────
  { id: 'A8-yin',          cx:   229, cy:   136,    color: ORANGE },
  { id: 'A1-yin',          cx:   229, cy:   163,    color: ORANGE },
  { id: 'A8-yin_2',        cx:   277, cy:   136,    color: ORANGE },
  { id: 'A1-yin_2',        cx:   277, cy:   163,    color: ORANGE },
  // ── B zone yin ───────────────────────────────────────────
  { id: 'B-yin',           cx:   319, cy:   148,    color: ORANGE },
  { id: 'B-yin_2',         cx:   190, cy:   148,    color: ORANGE },
  // ── C zone yin ───────────────────────────────────────────
  { id: 'C-yin_2',         cx:   119, cy:   137,    color: ORANGE },
  { id: 'C-yin_4',         cx:   383, cy:   137,    color: ORANGE },
  // ── D zone yin ───────────────────────────────────────────
  { id: 'D-yin',           cx:   433, cy:   288,    color: ORANGE },
  { id: 'D-yin_2',         cx:    73, cy:   293,    color: ORANGE },
  // ── E zone yin ───────────────────────────────────────────
  { id: 'E1-yin',          cx:   328, cy:   236,    color: ORANGE },
  { id: 'E12-yin',         cx:   277, cy:   251,    color: ORANGE },
  { id: 'E12-yin_2',       cx:   229, cy:   252,    color: ORANGE },
  { id: 'E1-yin_2',        cx:   180, cy:   236,    color: ORANGE },
  // ── H, I yin ─────────────────────────────────────────────
  { id: 'H-yin',           cx:   190, cy:   130,    color: GREEN  },
  { id: 'H-yin_2',         cx:   318, cy:   130,    color: GREEN  },
  { id: 'I-yin',           cx:   398, cy:   119,    color: GREEN  },
  { id: 'I-yin_2',         cx:   111, cy:   116,    color: GREEN  },
  // ── Sensory yin ──────────────────────────────────────────
  { id: 'Sensory-eye',     cx:   277, cy:   185,    color: PINK   },
  { id: 'Sensory-eye_2',   cx:   230, cy:   185,    color: PINK   },
  { id: 'Sensory-nose',    cx:   277, cy:   205,    color: PINK   },
  { id: 'Sensory-nose_2',  cx:   230, cy:   205,    color: PINK   },
  { id: 'Sensory-mouth',   cx:   277, cy:   225,    color: PINK   },
  { id: 'Sensory-mouth_2', cx:   230, cy:   225,    color: PINK   },
  { id: 'Sensory-ear',     cx:   352, cy:   199,    color: PINK   },
  { id: 'Sensory-ear_2',   cx:   150, cy:   199,    color: PINK   },
  // ── Brain points yin ─────────────────────────────────────
  { id: 'Cerebrum',        cx:   228, cy:   121,    color: LIME   },
  { id: 'Cerebrum_2',      cx:   277, cy:   121,    color: LIME   },
  { id: 'Cerebellum',      cx:   228, cy:   105,    color: LIME   },
  { id: 'Cerebellum_2',    cx:   277, cy:   105,    color: LIME   },
  { id: 'Basal-ganglia',   cx: 252.5, cy:   114,    color: LIME,  rx: 6.5, ry: 13 },
]

// basic-front.svg group IDs to hide per subgroup
const SVG_HIDE = {
  'ynsa-basic':   ['[id="sensory points"]', '[id="brain-points"]'],
  'ynsa-sensory': ['[id="basic-yin-points"]', '[id="extra-lumbar-points"]', '[id="brain-points"]'],
  'ynsa-brain':   ['[id="basic-yin-points"]', '[id="extra-lumbar-points"]', '[id="sensory points"]'],
}

function buildHideStyle(activeSubgroup) {
  const selectors = SVG_HIDE[activeSubgroup]
  if (!selectors) return ''
  return selectors.map(s => `.svg-frontal ${s}`).join(',\n') + ' { display: none; }'
}

export default function HeadFrontal({ pickerMode = false, onPointSelect, highlightJsonId = null, pointFilter = null, activeSubgroup = null, activeZone = null, onZoneChange }) {
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

      {/* Inline SVG — groups are CSS-targetable by the style above */}
      <BasicFrontSvg
        className="svg-frontal"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      />

      {/* Interactive overlay — same viewBox as the base SVG */}
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
