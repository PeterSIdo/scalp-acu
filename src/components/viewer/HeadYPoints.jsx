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

// One entry per SVG label element (id matches LABEL_TO_MERIDIAN keys above).
// Bounding boxes read directly from each label path's `d` attribute (viewBox 0 0 754 811).
// Re-extracted 2026-07-04 after user repositioned the labels and resized the canvas:
// short codes moved from the right edge to a vertical column on the left; full names
// moved from that left column into two horizontal rows near the bottom.
// x/y/w/h below already include padding (short codes: ±8/±6, full names: ±6/±3 —
// the two bottom rows sit only ~7.5 units apart so full-name padding must stay small).
const LABEL_HITAREAS = [
  // ── Short codes (left column) ──────────────────────────
  { id: 'HT', x:  34.4, y: 110.5, w:  41.9, h:  26.5 },
  { id: 'PE', x:  34.4, y: 156.5, w:  38.4, h:  26.5 },
  { id: 'LU', x:  34.4, y: 202.5, w:  39.2, h:  26.7 },
  { id: 'LV', x:  34.4, y: 248.5, w:  38.4, h:  26.5 },
  { id: 'ST', x:  33.9, y: 294.3, w:  40.5, h:  26.9 },
  { id: 'SI', x:  33.9, y: 340.3, w:  32.2, h:  26.9 },
  { id: 'GB', x:  34.1, y: 386.3, w:  42.3, h:  26.9 },
  { id: 'BL', x:  34.4, y: 432.5, w:  38.2, h:  26.5 },
  { id: 'SJ', x:  33.9, y: 478.3, w:  29.9, h:  26.9 },
  { id: 'KD', x:  34.4, y: 524.5, w:  41.6, h:  26.5 },
  { id: 'LI', x:  34.4, y: 570.5, w:  30.0, h:  26.5 },
  { id: 'SP/PANC', x: 33.9, y: 615.8, w: 103.0, h: 29.4 },
  // ── Full names (two rows near bottom) ──────────────────
  { id: 'Heart',           x:  35.9, y: 739.5, w:  61.7, h:  20.7 },
  { id: 'Pericardium',     x: 104.9, y: 739.4, w: 118.9, h:  20.8 },
  { id: 'Lung',            x: 235.9, y: 739.5, w:  54.8, h:  24.8 },
  { id: 'Liver',           x: 298.9, y: 739.4, w:  54.8, h:  20.8 },
  { id: 'Stomach',         x: 360.3, y: 739.2, w:  91.6, h:  20.9 },
  { id: 'Small intestine', x: 460.3, y: 739.2, w: 145.4, h:  20.9 },
  { id: 'Gallblader',      x: 617.3, y: 739.3, w: 104.4, h:  20.9 },
  { id: 'Bladder',         x:  35.9, y: 766.5, w:  81.6, h:  20.7 },
  { id: 'Tripple heater',  x: 121.1, y: 766.4, w: 139.7, h:  24.7 },
  { id: 'Kidney',          x: 268.9, y: 766.4, w:  73.5, h:  24.7 },
  { id: 'Large intestine', x: 347.9, y: 766.4, w: 147.6, h:  24.9 },
  { id: 'Spleen/Pancreas', x: 503.3, y: 765.8, w: 166.7, h:  25.3 },
]

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

// Coordinates from YNSA-Y-Side.svg (viewBox 0 0 754 811)
// Re-extracted 2026-07-04 after user resized the canvas and repositioned labels
// (point positions unchanged relative to the head silhouette, but the whole SVG
// shifted by a constant dx=-93.565, dy=+20 when the artboard was resized).
// Circle-element coords read directly; path-drawn circles use their bounding-box center.
const POINTS = [
  // ── Strong Y-Points ────────────────────────────────────
  { id: 'LU-yin',         cx: 340.216, cy: 229.216, color: RED  },
  { id: 'LU-yang',        cx: 462.216, cy: 252.216, color: RED  },
  { id: 'HT-yin',         cx: 390.216, cy: 240.216, color: RED  },
  { id: 'HT-yang',        cx: 415.216, cy: 244.216, color: RED  },
  { id: 'PE-yin',         cx: 364.216, cy: 234.216, color: RED  },
  { id: 'PE-yang',        cx: 439.216, cy: 249.216, color: RED  },
  { id: 'SI-yin',         cx: 339.216, cy: 259.216, color: RED  },
  { id: 'SI-yang',        cx: 461.216, cy: 277.216, color: RED  },
  { id: 'ST-yin',         cx: 365.216, cy: 258.216, color: RED  },
  { id: 'ST-yang',        cx: 438.216, cy: 272.216, color: RED  },
  { id: 'LV-yin',         cx: 389.216, cy: 262.216, color: RED  },
  { id: 'LV-yang',        cx: 415.216, cy: 267.216, color: RED  },
  { id: 'SP-PANC-yin',    cx: 362.5,   cy: 280.623, color: RED  },
  { id: 'SP-PANC-yang',   cx: 446.216, cy: 292.216, color: RED  },
  { id: 'GB-yin',         cx: 383.216, cy: 282.216, color: RED  },
  { id: 'GB-yang',        cx: 416.216, cy: 287.216, color: RED  },
  { id: 'SJ-yin',         cx: 336.216, cy: 296.216, color: RED  },
  { id: 'SJ-yang',        cx: 474.216, cy: 328.216, color: RED  },
  { id: 'KI-yin',         cx: 357.029, cy: 304.716, color: RED  },
  { id: 'KI-yang',        cx: 474.216, cy: 406.216, color: RED  },
  { id: 'LI-yin',         cx: 334.216, cy: 328.216, color: RED  },
  { id: 'LI-yang',        cx: 476.216, cy: 355.216, color: RED  },
  { id: 'BL-yin',         cx: 355.845, cy: 329.216, color: RED  },
  { id: 'BL-yang',        cx: 455.216, cy: 431.216, color: RED  },
  // ── Weak Y-Points ──────────────────────────────────────
  { id: 'LU-yin_2',         cx: 340.216, cy: 201.216, color: BLUE },
  { id: 'LU-yang_2',        cx: 459.216, cy: 225.216, color: BLUE },
  { id: 'HT-yin_2',         cx: 390.216, cy: 211.216, color: BLUE },
  { id: 'HT-yang_2',        cx: 413.216, cy: 217.216, color: BLUE },
  { id: 'PE-yin_2',         cx: 364.216, cy: 206.216, color: BLUE },
  { id: 'PE-yang_2',        cx: 436.216, cy: 219.216, color: BLUE },
  { id: 'SI-yin_2',         cx: 340.762, cy: 177,     color: BLUE },
  { id: 'SI-yang_2',        cx: 466.216, cy: 196.216, color: BLUE },
  { id: 'ST-yin_2',         cx: 364.216, cy: 183.216, color: BLUE },
  { id: 'ST-yang_2',        cx: 436.216, cy: 198.216, color: BLUE },
  { id: 'LV-yin_2',         cx: 388.216, cy: 189.216, color: BLUE },
  { id: 'LV-yang_2',        cx: 414.216, cy: 191.216, color: BLUE },
  { id: 'SP-PANC-yin_2',    cx: 361.216, cy: 160.216, color: BLUE },
  { id: 'SP-PANC-yang_2',   cx: 443.216, cy: 174.216, color: BLUE },
  { id: 'GB-yin_2',         cx: 384,     cy: 162.216, color: BLUE },
  { id: 'GB-yang_2',        cx: 414.216, cy: 169.216, color: BLUE },
  { id: 'SJ-yin_2',         cx: 337.216, cy: 143.216, color: BLUE },
  { id: 'SJ-yang_2',        cx: 468.216, cy: 164.216, color: BLUE },
  { id: 'KI-yin_2',         cx: 361,     cy: 134.145, color: BLUE },
  { id: 'KI-yang_2',        cx: 443.216, cy: 150.216, color: BLUE },
  { id: 'LI-yin_2',         cx: 330.216, cy: 106.216, color: BLUE },
  { id: 'LI-yang_2',        cx: 468.216, cy: 134.216, color: BLUE },
  { id: 'BL-yin_2',         cx: 359.5,   cy: 112.724, color: BLUE },
  { id: 'BL-yang_2',        cx: 443.216, cy: 129.216, color: BLUE },
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
        viewBox="0 0 754 811"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      >
        {/* Invisible hit rects that make each label easy to click */}
        {LABEL_HITAREAS.map(({ id, x, y, w, h }) => {
          const meridian = LABEL_TO_MERIDIAN[id]
          const isActive = activeMeridian === meridian
          return (
            <g
              key={id}
              onClick={() => handleMeridianSelect(meridian)}
              style={{ cursor: 'pointer', pointerEvents: 'auto' }}
            >
              <rect x={x} y={y} width={w} height={h} fill={isActive ? 'rgba(52,185,4,0.12)' : 'transparent'} rx={4} />
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
