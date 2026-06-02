import { useState, useRef } from 'react'
import { allPoints } from '../../data/points'

const BLUE = '#3b82f6'
const RED  = '#ef4444'

const C1  = { cx: 194, cy: 88 }
const C2  = { cx: 151, cy: 116 }
const CY1 = { cx: 466, cy: 191 }
const CY2 = { cx: 495, cy: 220 }

// Maps SVG point id → ynsa.json id
const POINT_JSON_ID = {
  'C-yin':   'YNSA-C-LEFT',
  'C-yang':  'YNSA-C-RIGHT',
  'G1-yin':  'YNSA-G-LEFT',
  'G2-yin':  'YNSA-G-LEFT',
  'G3-yin':  'YNSA-G-LEFT',
  'G1-yang': 'YNSA-G-RIGHT',
  'G2-yang': 'YNSA-G-RIGHT',
  'G3-yang': 'YNSA-G-RIGHT',
  'D-yin':   'YNSA-D-LEFT',
  'D-yang':  'YNSA-D-RIGHT',
  'F-yang':  'YNSA-F-RIGHT',
  'd1-yin':  'YNSA-A-LEFT',
  'd2-yin':  'YNSA-A-LEFT',
  'd3-yin':  'YNSA-A-LEFT',
  'd4-yin':  'YNSA-A-LEFT',
  'd5-yin':  'YNSA-A-LEFT',
  'd1-yang': 'YNSA-A-RIGHT',
  'd2-yang': 'YNSA-A-RIGHT',
  'd3-yang': 'YNSA-A-RIGHT',
  'd4-yang': 'YNSA-A-RIGHT',
  'd5-yang': 'YNSA-A-RIGHT',
  'I-yin':   'YNSA-I-YIN',
  'I-yang':  'YNSA-I-YANG',
}

const POINTS = [
  { id: 'G1-yin',  cx: 182, cy: 243, label: '1',  ldx:  -9, ldy:   4, anchor: 'end'    },
  { id: 'G2-yin',  cx: 193, cy: 238, label: 'G',  ldx:   0, ldy: -10, anchor: 'middle' },
  { id: 'G3-yin',  cx: 206, cy: 245, label: '3',  ldx:   9, ldy:   4, anchor: 'start'  },

  { id: 'D-yin',   cx: 198, cy: 264, label: 'D',  ldx:   0, ldy:  19, anchor: 'middle' },
  { id: 'D-yang',  cx: 428, cy: 286, label: 'D',  ldx:   0, ldy:  19, anchor: 'middle', color: RED },
  { id: 'F-yang',  cx: 322, cy: 363, label: 'F',  ldx:  10, ldy:  -4, anchor: 'start',  color: RED },

  { id: 'G1-yang', cx: 308, cy: 384, label: '1',  ldx:  -8, ldy:   4, anchor: 'end',    color: RED },
  { id: 'G2-yang', cx: 316, cy: 394, label: '2',  ldx:   0, ldy:  16, anchor: 'middle', color: RED },
  { id: 'G3-yang', cx: 329, cy: 389, label: '3',  ldx:   7, ldy:   4, anchor: 'start',  color: RED },

  { id: 'd1-yin',  cx: 270, cy: 248, label: 'd1', ldx: -17, ldy:  -5, anchor: 'start'  },
  { id: 'd2-yin',  cx: 265, cy: 256, label: '',    ldx:  10, ldy:   4, anchor: 'start'  },
  { id: 'd3-yin',  cx: 260, cy: 265, label: '',    ldx: -10, ldy:   4, anchor: 'end'    },
  { id: 'd4-yin',  cx: 256, cy: 273, label: '',    ldx:  10, ldy:   4, anchor: 'start'  },
  { id: 'd5-yin',  cx: 253, cy: 280, label: 'd5', ldx: -10, ldy:   4, anchor: 'end'    },

  { id: 'd1-yang', cx: 346, cy: 245, label: 'd1', ldx:  10, ldy:  -2, anchor: 'start', color: RED },
  { id: 'd2-yang', cx: 352, cy: 251, label: '',    ldx:  10, ldy:   4, anchor: 'start', color: RED },
  { id: 'd3-yang', cx: 357, cy: 258, label: '',    ldx:  10, ldy:   4, anchor: 'start', color: RED },
  { id: 'd4-yang', cx: 361, cy: 266, label: '',    ldx:  10, ldy:   4, anchor: 'start', color: RED },
  { id: 'd5-yang', cx: 364, cy: 274, label: 'd5', ldx:  10, ldy:   4, anchor: 'start', color: RED },

  { id: 'I-yin',   cx: 287, cy:  69, label: 'I',  ldx:  10, ldy:  -4, anchor: 'start'  },
  { id: 'I-yang',  cx: 429, cy: 138, label: 'I',  ldx:  10, ldy:  -4, anchor: 'start', color: RED },
]

export default function HeadLateral({ pickerMode = false, onPointSelect }) {
  const [pickerPos, setPickerPos]   = useState(null)
  const [selectedId, setSelectedId] = useState(null)
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
    const pos = { x: Math.round(x), y: Math.round(y) }
    setPickerPos(pos)
    console.log(`cx: ${pos.x}, cy: ${pos.y}`)
  }

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 515 634"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: '100%', maxHeight: '100%', cursor: pickerMode ? 'crosshair' : 'default' }}
      onClick={handleSvgClick}
    >
      <defs>
        <marker id="arrow-blue" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L0,7 L7,3.5 z" fill={BLUE} />
        </marker>
        <marker id="arrow-red" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L0,7 L7,3.5 z" fill={RED} />
        </marker>
      </defs>

      {/* ── Head outline ── */}
      <g id="head_side">
        <path id="silouette" d="M42.8384 403.937C36.8781 397.934 38.0343 387.928 38.0343 387.928C43.814 381.592 45.5476 365.033 42.8384 354.528C40.1292 344.023 -1.98611 359.042 2.89047 330.528C4.24258 322.622 23.6954 284.877 48.6201 262.365C71.5511 241.655 64.8905 227.069 64.8905 212.528C64.8905 193.528 68.3905 172.528 75.3905 150.028C106.89 29.5279 243.684 15.241 292.449 17.2421C341.215 19.2431 388.564 30.4589 424.659 53.2601C476.134 85.7765 495.849 136.071 507.019 177.323C521.649 231.35 497.484 288.291 482.89 326.528C464.519 374.664 439.39 393.528 424.659 424.947C414.465 446.688 404.847 512.014 411.89 539.028C417.5 560.539 420.685 574.191 424.659 580.528M42.8384 403.937C37.4199 413.942 44.2854 421.946 44.2854 421.946C54.0385 428.449 49.3723 453.828 48.6201 472.471C47.831 492.028 64.8905 515.528 114.725 505.488C138.95 500.607 190.239 484.014 207.39 472.471C241.89 449.253 260.139 418.444 263.39 403.937M42.8384 403.937C61.0825 410.94 97.386 403.937 97.386 403.937M47.831 424.947C72.7558 424.947 76.796 414.942 97.386 403.937C78.4215 399.935 63.6795 394.932 39.8384 385.427" stroke="#434040" strokeWidth="5"/>
        <path d="M160.39 503.528C165.92 525.361 151.89 566.528 188.89 630.528" stroke="#434040" strokeWidth="5" strokeLinecap="round"/>
        <path d="M129.402 256.944C111.259 253.444 96.226 245.444 86.8954 239.944L90.524 233.944C99.8546 239.944 124.322 255.344 135.104 256.944C120.071 261.944 100.891 262.944 91.5607 266.444C82.2301 269.944 86.5028 266.579 83.2668 266.444C64.6635 265.667 112.814 256.944 129.402 256.944Z" stroke="#434040" strokeWidth="3"/>
        <path d="M96.2227 245.444C91.5574 251.444 91.039 255.944 93.6309 261.944" stroke="#434040" strokeWidth="7"/>
        <path d="M120.589 211.444C107.112 205.944 77.0465 207.944 72.3812 211.444C67.7159 214.944 75.4913 222.944 75.4913 222.944C84.8219 222.277 91.2351 216.827 110.222 219.444C124.736 221.444 137.695 228.777 142.879 234.444C142.879 222.944 134.067 216.944 120.589 211.444Z" stroke="#434040" strokeWidth="3"/>
        <path id="ear" d="M259.89 281.046C268.89 251.047 289.656 239.028 310.39 239.528C331.125 240.028 356.89 252.437 356.89 281.046C356.89 305.546 349.703 318.546 340.89 332.046C326.187 354.571 304.037 352.047 299.89 367.046C296.818 378.158 289.39 385.646 277.39 382.046C269.882 379.794 264.037 370.046 259.89 359.046" stroke="#434040" strokeWidth="4"/>
        <path id="hair_line1" d="M111.89 97.5279C136.89 83.5279 169.413 83.5279 182.89 106.528C187.452 114.312 188.795 130.089 182.89 141.528C176.82 153.289 158.411 156.191 156.89 162.528C153.89 175.028 163.642 186.736 168.199 193.028C187.39 219.528 206.89 264.028 202.39 310.528C217.39 321.528 248.89 319.528 252.39 302.528" stroke="#434040" strokeWidth="2" strokeLinecap="round" strokeDasharray="10 10"/>
        <path id="hair_line2" d="M339.89 344.528C339.89 369.528 347.254 383.022 359.39 402.028C371.527 421.034 388.39 431.028 416.39 437.528" stroke="#434040" strokeWidth="2" strokeDasharray="10 10"/>
        <path id="coronal_line" d="M324.723 0.0278931L291.548 593.528" stroke="#434040" strokeDasharray="10 10"/>
        <g id="sutures_side" stroke="#6b7280" strokeDasharray="2 2">
          <path d="M286.89 21.5279C269.89 30.5279 256.89 41.0279 251.39 52.5279C245.89 64.0279 240.39 81.5279 237.39 86.5279C234.39 91.5279 231.39 97.5279 227.89 102.528C225.09 106.528 219.724 118.861 217.39 124.528L211.89 139.528V160.028L206.39 169.528"/>
          <path d="M423.39 286.028C410.89 289.028 406.39 276.028 398.89 274.028C392.89 272.428 388.057 264.695 383.39 261.028C377.724 251.195 366.19 230.428 365.39 226.028C364.39 220.528 351.39 208.028 349.39 201.528C347.39 195.028 343.89 179.028 335.89 174.528C331.977 172.327 321.625 168.879 315.89 164.028C305.055 154.86 286.39 149.028 262.39 156.528C224.101 168.493 223.39 179.028 205.89 171.528C205.89 171.528 199.89 170.528 193.39 170.528C186.89 170.528 179.39 179.028 179.39 179.028C166.89 190.028 164.59 203.828 161.39 209.028C160.724 209.028 152.39 215.528 147.89 209.028"/>
          <path d="M315.39 393.528C315.39 402.528 331.39 405.028 344.39 380.528C352.912 364.469 360.89 362.528 369.39 358.028C377.89 353.528 376.89 350.528 385.39 345.528C393.89 340.528 405.89 329.528 408.39 324.028C410.89 318.528 414.39 312.528 416.89 307.028C418.89 302.628 421.724 291.861 422.89 287.028"/>
          <path d="M508.39 191.028L502.89 206.528L490.39 230.028C490.39 230.028 479.89 250.028 475.89 254.528C471.89 259.028 458.89 274.028 458.89 274.028C452.224 276.861 429.276 284.615 423.39 286.028"/>
        </g>
      </g>

      {/* ── C-yang: dot + arrow ── */}
      <g onClick={(e) => selectPoint('C-yang', e)} style={{ cursor: 'pointer' }}>
        {selectedId === 'C-yang' && <circle cx={CY1.cx} cy={CY1.cy} r={9} fill="none" stroke={RED} strokeWidth="1.5" opacity="0.5" />}
        <line x1={CY1.cx} y1={CY1.cy} x2={CY2.cx} y2={CY2.cy} stroke={RED} strokeWidth="1.5" markerEnd="url(#arrow-red)" />
        <circle cx={CY1.cx} cy={CY1.cy} r={4} fill={RED} />
        <text x={CY1.cx - 10} y={CY1.cy - 4} fontSize="16" fontFamily="sans-serif" fontWeight="600" fill={RED} textAnchor="end">C</text>
      </g>

      {/* ── C-yin: dot + arrow ── */}
      <g onClick={(e) => selectPoint('C-yin', e)} style={{ cursor: 'pointer' }}>
        {selectedId === 'C-yin' && <circle cx={C1.cx} cy={C1.cy} r={9} fill="none" stroke={BLUE} strokeWidth="1.5" opacity="0.5" />}
        <line x1={C1.cx} y1={C1.cy} x2={C2.cx} y2={C2.cy} stroke={BLUE} strokeWidth="1.5" markerEnd="url(#arrow-blue)" />
        <circle cx={C1.cx} cy={C1.cy} r={4} fill={BLUE} />
        <text x={C1.cx + 10} y={C1.cy - 4} fontSize="16" fontFamily="sans-serif" fontWeight="600" fill={BLUE} textAnchor="start">C</text>
      </g>

      {/* ── Side labels ── */}
      <text x={133} y={22} fontSize="16" fontFamily="sans-serif" fontWeight="600" fill={BLUE} textAnchor="middle">Yin</text>
      <text x={438} y={22} fontSize="16" fontFamily="sans-serif" fontWeight="600" fill={RED}  textAnchor="middle">Yang</text>

      {/* ── G group standalone labels ── */}
      <text x={193} y={258} fontSize="16" fontFamily="sans-serif" fontWeight="600" fill={BLUE} textAnchor="middle">2</text>
      <text x={335} y={415} fontSize="16" fontFamily="sans-serif" fontWeight="600" fill={RED}  textAnchor="middle">G</text>

      {/* ── Simple dot points ── */}
      {POINTS.map(({ id, cx, cy, label, ldx, ldy, anchor, color = BLUE }) => (
        <g key={id} onClick={(e) => selectPoint(id, e)} style={{ cursor: 'pointer' }}>
          {selectedId === id && (
            <circle cx={cx} cy={cy} r={9} fill="none" stroke={color} strokeWidth="1.5" opacity="0.5" />
          )}
          <circle cx={cx} cy={cy} r={4} fill={color} />
          {label && (
            <text
              x={cx + ldx} y={cy + ldy}
              fontSize="16" fontFamily="sans-serif" fontWeight="600"
              fill={color} textAnchor={anchor}
            >{label}</text>
          )}
        </g>
      ))}

      {/* ── Coordinate picker crosshair (dev only) ── */}
      {pickerMode && pickerPos && (
        <g>
          <line x1={pickerPos.x - 10} y1={pickerPos.y} x2={pickerPos.x + 10} y2={pickerPos.y} stroke="#f59e0b" strokeWidth="1.5"/>
          <line x1={pickerPos.x} y1={pickerPos.y - 10} x2={pickerPos.x} y2={pickerPos.y + 10} stroke="#f59e0b" strokeWidth="1.5"/>
          <text x={pickerPos.x + 12} y={pickerPos.y - 6} fontSize="10" fill="#f59e0b" fontFamily="monospace">
            {pickerPos.x},{pickerPos.y}
          </text>
        </g>
      )}
    </svg>
  )
}
