import { useState } from 'react'
import { allPoints } from '../../data/points'
import YNSAYSideSvg from '../../assets/diagrams/YNSA-Y-Side.svg?react'

const RED  = '#FF0808'
const BLUE = '#5392F6'

// Meridian menu items, in the order the rects are stacked in the SVG (top → bottom).
// rectId/textId are the SVG element ids (Figma layer names) for the colored box and its
// baked-in label glyph. `y` is the rect's own y attribute, used to compute the translateY
// delta that "parks" a selected item directly under the Meridian button when the menu closes.
const MENU_ITEMS = [
  { rectId: 'Heart',           textId: 'Heart_2',           code: 'HT',      y: 139.555 },
  { rectId: 'Pericardium',     textId: 'Pericardium_2',     code: 'PE',      y: 241.11 },
  { rectId: 'Lung',            textId: 'Lung_2',            code: 'LU',      y: 342.665 },
  { rectId: 'Liver',           textId: 'Liver_2',           code: 'LV',      y: 444.219 },
  { rectId: 'Stomach',         textId: 'Stomach_2',         code: 'ST',      y: 545.774 },
  { rectId: 'Small intestine', textId: 'Small intestine_2', code: 'SI',      y: 647.329 },
  { rectId: 'Gallblader',      textId: 'Gallblader_2',      code: 'GB',      y: 748.884 },
  { rectId: 'Bladder',         textId: 'Bladder_2',         code: 'BL',      y: 850.439 },
  { rectId: 'Tripple heater',  textId: 'Tripple heater_2',  code: 'SJ',      y: 951.994 },
  { rectId: 'Kidney',          textId: 'Kidney_2',          code: 'KI',      y: 1053.55 },
  { rectId: 'Large intestine', textId: 'Large intestine_2', code: 'LI',      y: 1155.1 },
  { rectId: 'Spleen pancreas', textId: 'Spleen/Pancreas',   code: 'SP-PANC', y: 1256.66 },
]
const SLOT1_Y = MENU_ITEMS[0].y

// Element id (rect or its label glyph) → meridian code, for click delegation.
const CODE_BY_ELEMENT_ID = {}
for (const { rectId, textId, code } of MENU_ITEMS) {
  CODE_BY_ELEMENT_ID[rectId] = code
  CODE_BY_ELEMENT_ID[textId] = code
}

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

// Coordinates re-extracted 2026-07-05 from the rebuilt YNSA-Y-Side.svg (viewBox 27 23 947 1331,
// after the user shifted the whole menu column further left and added the Refresh button).
// Yin points are <ellipse> elements (cx/cy read directly); yang points are stroke-only
// <path> outlines (center computed from the path's bounding box).
const POINTS = [
  // ── Strong Y-Points ────────────────────────────────────
  { id: 'LU-yin',         cx: 447.074, cy: 490.828,  color: RED },
  { id: 'LU-yang',        cx: 647.902, cy: 528.725,  color: RED },
  { id: 'HT-yin',         cx: 529.381, cy: 508.952,  color: RED },
  { id: 'HT-yang',        cx: 570.534, cy: 515.543,  color: RED },
  { id: 'PE-yin',         cx: 486.581, cy: 499.066,  color: RED },
  { id: 'PE-yang',        cx: 610.042, cy: 523.782,  color: RED },
  { id: 'SI-yin',         cx: 445.428, cy: 540.258,  color: RED },
  { id: 'SI-yang',        cx: 646.256, cy: 569.915,  color: RED },
  { id: 'ST-yin',         cx: 488.228, cy: 538.61,   color: RED },
  { id: 'ST-yang',        cx: 608.396, cy: 561.678,  color: RED },
  { id: 'LV-yin',         cx: 527.735, cy: 545.201,  color: RED },
  { id: 'LV-yang',        cx: 570.534, cy: 553.439,  color: RED },
  { id: 'SP-PANC-yin',    cx: 483.756, cy: 575.529,  color: RED },
  { id: 'SP-PANC-yang',   cx: 621.564, cy: 594.63,   color: RED },
  { id: 'GB-yin',         cx: 517.858, cy: 578.153,  color: RED },
  { id: 'GB-yang',        cx: 572.18,  cy: 586.391,  color: RED },
  { id: 'SJ-yin',         cx: 440.49,  cy: 601.22,   color: RED },
  { id: 'SJ-yang',        cx: 667.657, cy: 653.946,  color: RED },
  { id: 'KI-yin',         cx: 474.75,  cy: 615.226,  color: RED },
  { id: 'KI-yang',        cx: 667.657, cy: 782.462,  color: RED },
  { id: 'LI-yin',         cx: 437.197, cy: 653.946,  color: RED },
  { id: 'LI-yang',        cx: 670.948, cy: 698.432,  color: RED },
  { id: 'BL-yin',         cx: 472.803, cy: 655.592,  color: RED },
  { id: 'BL-yang',        cx: 636.38,  cy: 823.653,  color: RED },
  // ── Weak Y-Points ──────────────────────────────────────
  { id: 'LU-yin_2',         cx: 447.074, cy: 444.694,  color: BLUE },
  { id: 'LU-yang_2',        cx: 642.965, cy: 484.238,  color: BLUE },
  { id: 'HT-yin_2',         cx: 529.381, cy: 461.171,  color: BLUE },
  { id: 'HT-yang_2',        cx: 567.242, cy: 471.057,  color: BLUE },
  { id: 'PE-yin_2',         cx: 486.581, cy: 452.932,  color: BLUE },
  { id: 'PE-yang_2',        cx: 605.103, cy: 474.352,  color: BLUE },
  { id: 'SI-yin_2',         cx: 447.972, cy: 404.794,  color: BLUE },
  { id: 'SI-yang_2',        cx: 654.487, cy: 436.456,  color: BLUE },
  { id: 'ST-yin_2',         cx: 486.581, cy: 415.036,  color: BLUE },
  { id: 'ST-yang_2',        cx: 605.103, cy: 439.752,  color: BLUE },
  { id: 'LV-yin_2',         cx: 526.089, cy: 424.922,  color: BLUE },
  { id: 'LV-yang_2',        cx: 568.888, cy: 428.217,  color: BLUE },
  { id: 'SP-PANC-yin_2',    cx: 481.644, cy: 377.14,   color: BLUE },
  { id: 'SP-PANC-yang_2',   cx: 616.626, cy: 400.208,  color: BLUE },
  { id: 'GB-yin_2',         cx: 519.149, cy: 380.435,  color: BLUE },
  { id: 'GB-yang_2',        cx: 568.888, cy: 391.969,  color: BLUE },
  { id: 'SJ-yin_2',         cx: 442.136, cy: 349.13,   color: BLUE },
  { id: 'SJ-yang_2',        cx: 657.779, cy: 383.731,  color: BLUE },
  { id: 'KI-yin_2',         cx: 481.288, cy: 334.185,  color: BLUE },
  { id: 'KI-yang_2',        cx: 616.626, cy: 360.664,  color: BLUE },
  { id: 'LI-yin_2',         cx: 430.613, cy: 288.168,  color: BLUE },
  { id: 'LI-yang_2',        cx: 657.779, cy: 334.301,  color: BLUE },
  { id: 'BL-yin_2',         cx: 478.818, cy: 298.89,   color: BLUE },
  { id: 'BL-yang_2',        cx: 616.626, cy: 326.063,  color: BLUE },
]

// The four corner labels (Weak Yin / Weak Yang / Strong Yin / Strong Yang) are informational,
// not clickable — just scaled up 30% in place. `transform-box: fill-box` + `transform-origin:
// center` scales each glyph path around its own bounding-box center instead of the SVG origin.
const STRONG_WEAK_LABEL_STYLE = `
.svg-y-points [id="Weak Yin"],
.svg-y-points [id="WeakYang"],
.svg-y-points [id="Strong Yin"],
.svg-y-points [id="Strong Yang"] {
  transform: scale(1.3);
  transform-box: fill-box;
  transform-origin: center;
}`

// Build scoped CSS:
//   cursor:pointer on all clickable points
//   when activeMeridian is set: dim non-active points
function buildPointStyle(activeMeridian) {
  if (!activeMeridian) return ''

  const prefix = activeMeridian + '-'

  // Dim all points (ellipse or path-drawn) in both groups regardless of id suffix.
  const dimPoints = `
.svg-y-points [id="y-points-strong"] ellipse,
.svg-y-points [id="y-points-strong"] path,
.svg-y-points [id="y-points-weak"] ellipse,
.svg-y-points [id="y-points-weak"] path { opacity: 0.15; }`

  // Restore active meridian points (same specificity, later in string → wins)
  const restorePoints = `
.svg-y-points ellipse[id^="${prefix}"],
.svg-y-points path[id^="${prefix}"] { opacity: 1; }`

  return `${dimPoints}\n${restorePoints}`
}

// Build scoped CSS for the Meridian button + dropdown menu.
// Closed + nothing selected: only the button shows.
// Closed + a meridian selected: that item's rect/label animate up to sit under the button
//   (translateY delta relative to slot 1, the position of the first item), everything else hidden.
// Open: every item sits at its native stacked position, fully visible.
function buildMenuStyle(activeMeridian, menuOpen) {
  const buttonCursor = `.svg-y-points [id="Meridian"], .svg-y-points [id="Meridian_2"] { cursor: pointer; }`
  // The SVG's own baked-in Refresh rect is unused — Refresh is a plain HTML button instead.
  const hideRefreshRect = `.svg-y-points [id="Refresh"] { opacity: 0; pointer-events: none; }`

  const itemRules = MENU_ITEMS.map(({ rectId, textId, code, y }) => {
    const sel = `.svg-y-points [id="${rectId}"], .svg-y-points [id="${textId}"]`
    const transition = 'transition: transform 280ms ease, opacity 200ms ease;'
    if (menuOpen) {
      return `${sel} { cursor: pointer; transform: translateY(0px); opacity: 1; pointer-events: auto; ${transition} }`
    }
    if (activeMeridian === code) {
      const dy = SLOT1_Y - y
      return `${sel} { cursor: pointer; transform: translateY(${dy}px); opacity: 1; pointer-events: auto; ${transition} }`
    }
    return `${sel} { opacity: 0; pointer-events: none; ${transition} }`
  }).join('\n')

  return `${buttonCursor}\n${hideRefreshRect}\n${itemRules}`
}

export default function HeadYPoints({ onPointSelect, highlightJsonId = null }) {
  const [selectedId,     setSelectedId]     = useState(null)
  const [hoveredId,      setHoveredId]      = useState(null)
  const [activeMeridian, setActiveMeridian] = useState(null)
  const [menuOpen,       setMenuOpen]       = useState(false)

  const style = `${STRONG_WEAK_LABEL_STYLE}\n${buildPointStyle(activeMeridian)}\n${buildMenuStyle(activeMeridian, menuOpen)}`

  function selectPoint(id, e) {
    e?.stopPropagation()
    const jsonId = POINT_JSON_ID[id]
    if (!jsonId) return
    const data = allPoints.find(p => p.id === jsonId)
    if (!data) return
    setSelectedId(id)
    onPointSelect?.(data)
  }

  function handleMeridianSelect(code) {
    setActiveMeridian(code)
    setMenuOpen(false)
    setSelectedId(null)
    onPointSelect?.(null)
  }

  function handleReset() {
    setActiveMeridian(null)
    setMenuOpen(false)
    setSelectedId(null)
    setHoveredId(null)
    onPointSelect?.(null)
  }

  // Handles clicks on the Meridian button and the 12 dropdown items
  // (event delegation, since these live in the imported background SVG).
  function handleLabelClick(e) {
    let el = e.target
    while (el && el !== e.currentTarget) {
      if (el.id === 'Meridian' || el.id === 'Meridian_2') {
        setMenuOpen(open => !open)
        return
      }
      const code = CODE_BY_ELEMENT_ID[el.id]
      if (code) {
        if (menuOpen) handleMeridianSelect(code)
        else setMenuOpen(true)
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
        className="absolute top-3 right-3 z-10 px-3 h-8 bg-transparent hover:bg-white/10 text-gray-300 rounded flex items-center justify-center text-sm border border-gray-400"
      >Refresh</button>

      {/* Background SVG — handles Meridian menu + label clicks via event delegation */}
      <YNSAYSideSvg
        className="svg-y-points"
        onClick={handleLabelClick}
        preserveAspectRatio="xMidYMin meet"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      />

      {/* Overlay SVG — pointer-events:none at root so menu/label clicks in the background SVG
          pass through. Individual <g> elements re-enable pointer-events for points. */}
      <svg
        viewBox="27 23 947 1331"
        preserveAspectRatio="xMidYMin meet"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      >
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
                <circle cx={cx} cy={cy} r={14} fill="none" stroke={color} strokeWidth="3" opacity="0.9" />
              )}
              {isHovered && !isSelected && (
                <circle cx={cx} cy={cy} r={14} fill={color} opacity="0.25" />
              )}
              <circle cx={cx} cy={cy} r={12} fill="transparent" />
            </g>
          )
        })}
      </svg>
    </div>
  )
}
