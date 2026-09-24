import { useState, useRef } from 'react'
import { allPoints } from '../../data/points'
import { zoneOf } from '../../data/basicZones'
import BasicSideSvg from '../../assets/diagrams/basic-side.svg?react'
import BasicSideOutlineSvg from '../../assets/diagrams/basic-side-outline.svg?react'

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
  'C-yin_2':    'YNSA-C-yin',    'C-yang_2':   'YNSA-C-yang',
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

// Coordinates read from basic-side.svg (viewBox 0 0 597 700). Circle points use
// cx/cy directly; path-drawn points use their bounding-box center.
const POINTS = [
  // ── Ear points ───────────────────────────────────────
  { id: 'ear-yin',        cx:   182, cy:   181, color: BLUE   },
  { id: 'extra-ear-yin',  cx:   283, cy:   139, color: BLUE   },
  { id: 'extra-ear-yang', cx:   393, cy:   160, color: BLUE   },
  { id: 'ear-yang',       cx:   451, cy:   229, color: BLUE   },
  // ── H (extra lumbar) ─────────────────────────────────
  { id: 'H-yin',    cx:   166, cy:   126, color: GREEN  },
  { id: 'H-yang',   cx:   488, cy:   226, color: GREEN  },
  // ── I (extra lumbar) ─────────────────────────────────
  { id: 'I-yin',    cx:   239, cy:   127, color: GREEN  },
  { id: 'I-yang',   cx:   455, cy:   259, color: GREEN  },
  // ── A zone ───────────────────────────────────────────
  { id: 'YNSA-A1-yin', cx:   122, cy:   155, color: ORANGE },
  { id: 'YNSA-A8-yin', cx:   140, cy:   133, color: ORANGE },
  { id: 'A1-yang',     cx:   530, cy:   239, color: RED    },
  { id: 'A8-yang',     cx:   516, cy:   219, color: RED    },
  // ── B zone ───────────────────────────────────────────
  { id: 'B-yin',    cx:   152, cy:   145, color: ORANGE },
  { id: 'B-yang',   cx:   502, cy:   245, color: RED    },
  // ── C zone ───────────────────────────────────────────
  { id: 'C-yin_2',  cx:   223, cy:   144, color: ORANGE },
  { id: 'C-yang_2',  cx:   468, cy:   271, color: RED    },
  // ── D zone (single parent point) ─────────────────────
  { id: 'D-yin',    cx:   259, cy:   348, color: ORANGE },
  { id: 'D-yang',   cx:   422, cy:   330, color: RED    },
  // ── D zone (individual vertebrae) ────────────────────
  { id: 'D1-yin',   cx: 300.5, cy: 311.5, color: ORANGE },
  { id: 'D2-yin',   cx: 300.5, cy: 319.4, color: ORANGE },
  { id: 'D3-yin',   cx: 300.5, cy: 327.3, color: ORANGE },
  { id: 'D4-yin',   cx: 300.5, cy: 335.1, color: ORANGE },
  { id: 'D5-yin',   cx: 300.5, cy:   343,   color: ORANGE },
  { id: 'D6-yin',   cx: 300.5, cy: 350.9, color: ORANGE },
  { id: 'D1-yang',  cx: 352.4, cy: 293.2, color: RED },
  { id: 'D2-yang',  cx: 360.3, cy: 297.5, color: RED },
  { id: 'D3-yang',  cx: 367.6, cy: 303.6, color: RED },
  { id: 'D4-yang',  cx: 373.2, cy: 311.2, color: RED },
  { id: 'D5-yang',  cx: 377.4, cy: 319.4, color: RED },
  { id: 'D6-yang',  cx: 379.5, cy: 327.7, color: RED },
  // ── E zone ───────────────────────────────────────────
  { id: 'E1-yin',   cx:   131, cy:   215, color: ORANGE },
  { id: 'E12-yin',  cx:    98, cy:   225, color: ORANGE },
  { id: 'E1-yang',  cx:   502, cy:   307, color: RED    },
  { id: 'E12-yang', cx:   520, cy:   317, color: RED    },
  // ── F zone ───────────────────────────────────────────
  { id: 'F-yang',   cx:   355, cy:   423, color: RED    },
  // ── G zone ───────────────────────────────────────────
  { id: 'G1-yin',   cx:   244, cy:   331, color: ORANGE },
  { id: 'G2-yin',   cx:   259, cy:   327, color: ORANGE },
  { id: 'G3-yin',   cx:   274, cy:   331, color: ORANGE },
  { id: 'G1-yang',  cx: 337.4, cy: 439.7, color: RED    },
  { id: 'G2-yang',  cx: 350.6, cy: 448.1, color: RED    },
  { id: 'G3-yang',  cx: 364.5, cy: 440.5, color: RED    },
]

// Same points on basic-side-outline.svg (viewBox 0 0 558 706) — the line-art
// head used in the Basic Points grid tile 1/1. Its C-yin circle is id'd plain
// "C-yin" there, but it is keyed here by the full diagram's "C-yin_2" so both
// variants share POINTS/POINT_JSON_ID.
const OUTLINE_XY = {
  'H-yang':          [486, 253],
  'H-yin':           [191, 124],
  'I-yang':          [449, 273],
  'I-yin':           [246, 137],
  'extra-ear-yang':  [387, 174],
  'extra-ear-yin':   [277, 153],
  'ear-yin':         [176, 195],
  'ear-yang':        [445, 243],
  'G1-yang':         [352, 473],
  'G2-yang':         [366, 480],
  'G3-yang':         [379, 471],
  'F-yang':          [367, 452],
  'D6-yang':         [393.3, 345.7],
  'D5-yang':         [390.7, 337.5],
  'D4-yang':         [385.9, 329.7],
  'D3-yang':         [379.8, 322.5],
  'D2-yang':         [372.2, 316.8],
  'D1-yang':         [363.9, 313.1],
  'D-yang':          [426, 348],
  'E12-yang':        [514, 331],
  'E1-yang':         [496, 321],
  'A8-yang':         [507, 244],
  'A1-yang':         [521, 264],
  'B-yang':          [498, 267],
  'C-yang_2':        [462, 285],
  'G3-yin':          [268, 345],
  'G2-yin':          [253, 341],
  'G1-yin':          [238, 345],
  'E1-yin':          [134, 214],
  'E12-yin':         [101, 224],
  'D-yin':           [253, 362],
  'C-yin_2':         [222, 150],
  'B-yin':           [174, 162],
  'YNSA-A1-yin':     [134, 162],
  'YNSA-A8-yin':     [152, 140],
  'D6-yin':          [311.5, 384.9],
  'D5-yin':          [311.5, 377],
  'D4-yin':          [311.5, 369.1],
  'D3-yin':          [311.5, 361.3],
  'D2-yin':          [311.5, 353.4],
  'D1-yin':          [311.5, 345.5],
}
const OUTLINE_POINTS = POINTS.map(p => ({ ...p, cx: OUTLINE_XY[p.id][0], cy: OUTLINE_XY[p.id][1] }))

const VARIANTS = {
  full:    { Svg: BasicSideSvg,        width: 597, height: 700, points: POINTS },
  outline: { Svg: BasicSideOutlineSvg, width: 558, height: 706, points: OUTLINE_POINTS },
}

// basic-side.svg / basic-side-outline.svg groups (same ids in both):
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

export default function HeadLateral({ pickerMode = false, onPointSelect, highlightJsonId = null, pointFilter = null, activeSubgroup = null, activeZone = null, onZoneChange, variant = 'full' }) {
  const { Svg, width, height, points } = VARIANTS[variant]
  const [pickerPos, setPickerPos]   = useState(null)
  const [selectedId, setSelectedId] = useState(null)
  const [hoveredId,  setHoveredId]  = useState(null)
  const svgRef = useRef(null)
  const visiblePoints = pointFilter ? points.filter(p => pointFilter.has(POINT_JSON_ID[p.id])) : points
  const hideStyle = buildHideStyle(activeSubgroup)

  // Points to flash — clicking a point activates its own pulsing ring + label
  // (same mechanism as the Y-Points/meridian selection), and an externally
  // driven search hit (highlightJsonId) activates the same treatment.
  const activeIds = new Set(visiblePoints
    .filter(p => p.id === selectedId || (highlightJsonId && POINT_JSON_ID[p.id] === highlightJsonId))
    .map(p => p.id))

  // Same-zone points (e.g. all "A" points) get a bare pulsing ring, same idea
  // as the Y-Points meridian flash — lets a Basic Point selected on one grid
  // tile (or via the zone dropdown) flash its counterparts on the other two
  // Basic Points tiles. Excludes anything already covered by activeIds above
  // so a point never gets two overlapping rings.
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

      <Svg
        className="svg-lateral"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      />

      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
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
          const tx = pt.cx + 16 + w > width ? pt.cx - w - 16 : pt.cx + 16
          const ty = pt.cy - h / 2
          return (
            <g key={`active-${id}`} pointerEvents="none">
              <circle cx={pt.cx} cy={pt.cy} r={11} fill="none" stroke="#000000" strokeWidth="1.5" opacity="0.9" />
              <circle cx={pt.cx} cy={pt.cy} r={11} fill="none" stroke="#000000" strokeWidth="2">
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

        {/* Zone flash — pulsing ring + zone-letter label on every other point
            sharing the active zone, mirroring Y-Points' meridian flash. */}
        {zoneFlashIds.map(id => {
          const pt = visiblePoints.find(p => p.id === id)
          if (!pt) return null
          const zone  = zoneOf(POINT_JSON_ID[id])
          const pad   = 4
          const fSize = 10
          const w     = zone ? zone.length * 6.2 + pad * 2 : 0
          const h     = fSize + pad * 2
          const tx = pt.cx + 14 + w > width ? pt.cx - w - 14 : pt.cx + 14
          const ty = pt.cy - h / 2
          return (
            <g key={`zone-${id}`} pointerEvents="none">
              <circle cx={pt.cx} cy={pt.cy} r={11} fill="none" stroke="#000000" strokeWidth="2" opacity="0.85">
                <animate attributeName="r"       values="11;20;11"    dur="1.6s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.85;0;0.85" dur="1.6s" repeatCount="indefinite" />
              </circle>
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
