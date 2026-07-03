import { useState } from 'react'
import { allPoints } from '../../data/points'
import YNSAYSideSvg from '../../assets/diagrams/YNSA-Y-Side.svg?react'

const RED  = '#FF0808'
const BLUE = '#5392F6'

// SVG label id → meridian key (prefix used in point ids)
const LABEL_TO_MERIDIAN = {
  'Heart':           'HT',      'HT':      'HT',
  'Lung':            'LU',      'LU':      'LU',
  'Pericardium':     'PE',      'PE':      'PE',
  'Small intestine': 'SI',      'SI':      'SI',
  'Stomach':         'ST',      'ST':      'ST',
  'Liver':           'LV',      'LV':      'LV',
  'Tripple heater':  'SJ',      'SJ':      'SJ',
  'Spleen/Pancreas': 'SP-PANC', 'SP/PANC': 'SP-PANC',
  'Gallblader':      'GB',      'GB':      'GB',
  'Kidney':          'KI',      'KD':      'KI',
  'Large intestine': 'LI',      'LI':      'LI',
  'Bladder':         'BL',      'BL':      'BL',
}

// One entry per meridian row: y = bottom edge of the label text in SVG units
// (read from the short-code path M759 <y> starting coordinates, which are reliable)
// Left hit rect covers full-name labels (x 0–230); right covers short codes (x 740–846)
const LABEL_ROWS = [
  { meridian: 'HT',      y:  43 },
  { meridian: 'PE',      y:  89 },
  { meridian: 'LU',      y: 135 },
  { meridian: 'LV',      y: 181 },
  { meridian: 'ST',      y: 227 },
  { meridian: 'SI',      y: 273 },
  { meridian: 'GB',      y: 319 },
  { meridian: 'SP-PANC', y: 364 },
  { meridian: 'SJ',      y: 411 },
  { meridian: 'KI',      y: 457 },
  { meridian: 'LI',      y: 503 },
  { meridian: 'BL',      y: 549 },
]
// Hit rect geometry: text is ~15 SVG units tall, add ±10 padding
const HIT_PAD   = 10
const HIT_H     = 15 + HIT_PAD * 2   // 35
const LEFT_X    = 0
const LEFT_W    = 230   // covers all full-name labels
const RIGHT_X   = 740
const RIGHT_W   = 106   // to SVG right edge (846)

// SVG point id → ynsa.json id (filled as JSON data is authored)
const POINT_JSON_ID = {
  // ── Strong Y-Points (red) ─────────────────────────────
  'LU-yin':         'YNSA-Y-LU-yin',
  'LU-yang':        'YNSA-Y-LU-yang',
  'HT-yin':         'YNSA-Y-HT-yin',
  'HT-yang':        'YNSA-Y-HT-yang',
  'PE-yin':         'YNSA-Y-PE-yin',
  'PE-yang':        'YNSA-Y-PE-yang',
  'SI-yin':         'YNSA-Y-SI-yin',
  'SI-yang':        'YNSA-Y-SI-yang',
  'ST-yin':         'YNSA-Y-ST-yin',
  'ST-yang':        'YNSA-Y-ST-yang',
  'LV-yin':         'YNSA-Y-LV-yin',
  'LV-yang':        'YNSA-Y-LV-yang',
  'SP-PANC-yin':    'YNSA-Y-SP-PANC-yin',
  'SP-PANC-yang':   'YNSA-Y-SP-PANC-yang',
  'GB-yin':         'YNSA-Y-GB-yin',
  'GB-yang':        'YNSA-Y-GB-yang',
  'SJ-yin':         'YNSA-Y-SJ-yin',
  'SJ-yang':        'YNSA-Y-SJ-yang',
  'KI-yin':         'YNSA-Y-KI-yin',
  'KI-yang':        'YNSA-Y-KI-yang',
  'LI-yin':         'YNSA-Y-LI-yin',
  'LI-yang':        'YNSA-Y-LI-yang',
  'BL-yin':         'YNSA-Y-BL-yin',
  'BL-yang':        'YNSA-Y-BL-yang',
  // ── Soft Y-Points (blue) ──────────────────────────────
  'LU-yin_2':         'YNSA-Y-LU-yin-2',
  'LU-yang_2':        'YNSA-Y-LU-yang-2',
  'HT-yin_2':         'YNSA-Y-HT-yin-2',
  'HT-yang_2':        'YNSA-Y-HT-yang-2',
  'PE-yin_2':         'YNSA-Y-PE-yin-2',
  'PE-yang_2':        'YNSA-Y-PE-yang-2',
  'SI-yin_2':         'YNSA-Y-SI-yin-2',
  'SI-yang_2':        'YNSA-Y-SI-yang-2',
  'ST-yin_2':         'YNSA-Y-ST-yin-2',
  'ST-yang_2':        'YNSA-Y-ST-yang-2',
  'LV-yin_2':         'YNSA-Y-LV-yin-2',
  'LV-yang_2':        'YNSA-Y-LV-yang-2',
  'SP-PANC-yin_2':    'YNSA-Y-SP-PANC-yin-2',
  'SP-PANC-yang_2':   'YNSA-Y-SP-PANC-yang-2',
  'GB-yin_2':         'YNSA-Y-GB-yin-2',
  'GB-yang_2':        'YNSA-Y-GB-yang-2',
  'SJ-yin_2':         'YNSA-Y-SJ-yin-2',
  'SJ-yang_2':        'YNSA-Y-SJ-yang-2',
  'KI-yin_2':         'YNSA-Y-KI-yin-2',
  'KI-yang_2':        'YNSA-Y-KI-yang-2',
  'LI-yin_2':         'YNSA-Y-LI-yin-2',
  'LI-yang_2':        'YNSA-Y-LI-yang-2',
  'BL-yin_2':         'YNSA-Y-BL-yin-2',
  'BL-yang_2':        'YNSA-Y-BL-yang-2',
}

// Coordinates from YNSA-Y-Side.svg (viewBox 0 0 846 708)
// Re-extracted 2026-07-03 after user repositioned/renamed points in the SVG.
// Circle-element coords read directly; path-drawn circles use their bounding-box center.
const POINTS = [
  // ── Strong Y-Points ────────────────────────────────────
  { id: 'LU-yin',         cx: 433.781, cy: 209.216, color: RED  },
  { id: 'LU-yang',        cx: 555.781, cy: 232.216, color: RED  },
  { id: 'HT-yin',         cx: 483.781, cy: 220.216, color: RED  },
  { id: 'HT-yang',        cx: 508.781, cy: 224.216, color: RED  },
  { id: 'PE-yin',         cx: 457.781, cy: 214.216, color: RED  },
  { id: 'PE-yang',        cx: 532.781, cy: 229.216, color: RED  },
  { id: 'SI-yin',         cx: 432.781, cy: 239.216, color: RED  },
  { id: 'SI-yang',        cx: 554.781, cy: 257.216, color: RED  },
  { id: 'ST-yin',         cx: 458.781, cy: 238.216, color: RED  },
  { id: 'ST-yang',        cx: 531.781, cy: 252.216, color: RED  },
  { id: 'LV-yin',         cx: 482.781, cy: 242.216, color: RED  },
  { id: 'LV-yang',        cx: 508.781, cy: 247.216, color: RED  },
  { id: 'SP-PANC-yin',    cx: 456.065, cy: 260.623, color: RED  },
  { id: 'SP-PANC-yang',   cx: 539.781, cy: 272.216, color: RED  },
  { id: 'GB-yin',         cx: 476.781, cy: 262.216, color: RED  },
  { id: 'GB-yang',        cx: 509.781, cy: 267.216, color: RED  },
  { id: 'SJ-yin',         cx: 429.781, cy: 276.216, color: RED  },
  { id: 'SJ-yang',        cx: 567.782, cy: 308.216, color: RED  },
  { id: 'KI-yin',         cx: 450.595, cy: 284.716, color: RED  },
  { id: 'KI-yang',        cx: 567.781, cy: 386.216, color: RED  },
  { id: 'LI-yin',         cx: 427.782, cy: 308.216, color: RED  },
  { id: 'LI-yang',        cx: 569.781, cy: 335.216, color: RED  },
  { id: 'BL-yin',         cx: 449.411, cy: 309.216, color: RED  },
  { id: 'BL-yang',        cx: 548.781, cy: 411.216, color: RED  },
  // ── Weak Y-Points ──────────────────────────────────────
  { id: 'LU-yin_2',         cx: 433.781, cy: 181.216, color: BLUE },
  { id: 'LU-yang_2',        cx: 552.781, cy: 205.216, color: BLUE },
  { id: 'HT-yin_2',         cx: 483.781, cy: 191.216, color: BLUE },
  { id: 'HT-yang_2',        cx: 506.781, cy: 197.216, color: BLUE },
  { id: 'PE-yin_2',         cx: 457.781, cy: 186.216, color: BLUE },
  { id: 'PE-yang_2',        cx: 529.781, cy: 199.216, color: BLUE },
  { id: 'SI-yin_2',         cx: 434.327, cy: 157,     color: BLUE },
  { id: 'SI-yang_2',        cx: 559.781, cy: 176.216, color: BLUE },
  { id: 'ST-yin_2',         cx: 457.781, cy: 163.216, color: BLUE },
  { id: 'ST-yang_2',        cx: 529.781, cy: 178.216, color: BLUE },
  { id: 'LV-yin_2',         cx: 481.781, cy: 169.216, color: BLUE },
  { id: 'LV-yang_2',        cx: 507.781, cy: 171.216, color: BLUE },
  { id: 'SP-PANC-yin_2',    cx: 454.782, cy: 140.216, color: BLUE },
  { id: 'SP-PANC-yang_2',   cx: 536.781, cy: 154.216, color: BLUE },
  { id: 'GB-yin_2',         cx: 477.565, cy: 142.216, color: BLUE },
  { id: 'GB-yang_2',        cx: 507.781, cy: 149.216, color: BLUE },
  { id: 'SJ-yin_2',         cx: 430.781, cy: 123.216, color: BLUE },
  { id: 'SJ-yang_2',        cx: 561.781, cy: 144.216, color: BLUE },
  { id: 'KI-yin_2',         cx: 454.565, cy: 114.146, color: BLUE },
  { id: 'KI-yang_2',        cx: 536.781, cy: 130.216, color: BLUE },
  { id: 'LI-yin_2',         cx: 423.781, cy:  86.216, color: BLUE },
  { id: 'LI-yang_2',        cx: 561.781, cy: 114.216, color: BLUE },
  { id: 'BL-yin_2',         cx: 453.065, cy:  92.724, color: BLUE },
  { id: 'BL-yang_2',        cx: 536.781, cy: 109.216, color: BLUE },
]

// Build scoped CSS:
//   cursor:pointer on all clickable labels
//   when activeMeridian is set: dim non-active points + non-active labels
function buildStyle(activeMeridian) {
  const allLabelIds = Object.keys(LABEL_TO_MERIDIAN)
  const cursorRules = allLabelIds.map(id => `.svg-y-points [id="${id}"]`).join(',\n')

  const base = `${cursorRules} { cursor: pointer; }`
  if (!activeMeridian) return base

  const prefix = activeMeridian + '-'

  // Dim all points (circle or path-drawn) in both groups regardless of id suffix.
  // Uses [id="..."] (attribute selector) rather than #id so specificity matches
  // restorePoints below — cascade order (this rule first, restore second) decides.
  const dimPoints = `
.svg-y-points [id="y-points-strong"] circle,
.svg-y-points [id="y-points-strong"] path,
.svg-y-points [id="y-points-weak"] circle,
.svg-y-points [id="y-points-weak"] path { opacity: 0.15; }`

  // Restore active meridian points (same specificity, later in string → wins)
  const restorePoints = `
.svg-y-points circle[id^="${prefix}"],
.svg-y-points path[id^="${prefix}"] { opacity: 1; }`

  // Dim inactive labels
  const inactiveSelectors = allLabelIds
    .filter(id => LABEL_TO_MERIDIAN[id] !== activeMeridian)
    .map(id => `.svg-y-points [id="${id}"]`)
    .join(',\n')
  const dimLabels = inactiveSelectors
    ? `${inactiveSelectors} { opacity: 0.3; }`
    : ''

  return `${base}\n${dimPoints}\n${restorePoints}\n${dimLabels}`
}

export default function HeadYPoints({ onPointSelect, highlightJsonId = null }) {
  const [selectedId,     setSelectedId]     = useState(null)
  const [hoveredId,      setHoveredId]      = useState(null)
  const [activeMeridian, setActiveMeridian] = useState(null)

  const style = buildStyle(activeMeridian)

  function selectPoint(id, e) {
    e?.stopPropagation()
    const jsonId = POINT_JSON_ID[id]
    if (!jsonId) return
    const data = allPoints.find(p => p.id === jsonId)
    if (!data) return
    setSelectedId(id)
    onPointSelect?.(data)
  }

  function handleMeridianSelect(meridian) {
    setActiveMeridian(prev => prev === meridian ? null : meridian)
    setSelectedId(null)
    onPointSelect?.(null)
  }

  function handleReset() {
    setActiveMeridian(null)
    setSelectedId(null)
    setHoveredId(null)
    onPointSelect?.(null)
  }

  // Fallback: catches exact-pixel clicks on the SVG path glyphs themselves
  function handleLabelClick(e) {
    let el = e.target
    while (el && el !== e.currentTarget) {
      const meridian = LABEL_TO_MERIDIAN[el.id]
      if (meridian) {
        handleMeridianSelect(meridian)
        return
      }
      el = el.parentElement
    }
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <style>{style}</style>

      <button
        onMouseDown={e => e.stopPropagation()}
        onClick={handleReset}
        title="Reset meridian selection"
        className="absolute top-3 right-3 z-10 w-8 h-8 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded flex items-center justify-center text-sm border border-gray-600"
      >↺</button>

      {/* Background SVG — handles label clicks via event delegation */}
      <YNSAYSideSvg
        className="svg-y-points"
        onClick={handleLabelClick}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      />

      {/* Overlay SVG — pointer-events:none at root so label clicks in the background SVG
          pass through. Individual <g> elements re-enable pointer-events for points. */}
      <svg
        viewBox="0 0 846 708"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      >
        {/* Invisible hit rects that make label rows easy to click */}
        {LABEL_ROWS.map(({ meridian, y }) => {
          const ry = y - 15 - HIT_PAD  // top of hit rect
          const isActive = activeMeridian === meridian
          return (
            <g
              key={meridian}
              onClick={() => handleMeridianSelect(meridian)}
              style={{ cursor: 'pointer', pointerEvents: 'auto' }}
            >
              <rect x={LEFT_X}  y={ry} width={LEFT_W}  height={HIT_H} fill={isActive ? 'rgba(52,185,4,0.12)' : 'transparent'} rx={4} />
              <rect x={RIGHT_X} y={ry} width={RIGHT_W} height={HIT_H} fill={isActive ? 'rgba(52,185,4,0.12)' : 'transparent'} rx={4} />
            </g>
          )
        })}

        {POINTS.map(({ id, cx, cy, color }) => {
          const jsonId    = POINT_JSON_ID[id]
          const isSelected = selectedId === id || (highlightJsonId && jsonId === highlightJsonId)
          const isHovered  = hoveredId === id
          return (
            <g
              key={id}
              onClick={(e) => selectPoint(id, e)}
              onMouseEnter={() => setHoveredId(id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{ cursor: 'pointer', pointerEvents: 'auto' }}
            >
              {isSelected && (
                <circle cx={cx} cy={cy} r={11} fill="none" stroke={color} strokeWidth="2" opacity="0.9" />
              )}
              {isHovered && !isSelected && (
                <circle cx={cx} cy={cy} r={11} fill={color} opacity="0.25" />
              )}
              <circle cx={cx} cy={cy} r={9} fill="transparent" />
            </g>
          )
        })}
      </svg>
    </div>
  )
}
