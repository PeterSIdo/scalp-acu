import { useState, useRef } from 'react'
import ynsaData from '../../data/points/ynsa.json'

// SVG-space positions for YNSA basic points on the lateral view.
// Points follow the hairline (dashed) path of head_lateral.svg.
// ldx/ldy = label offset from dot centre; anchor = SVG text-anchor value.
const YNSA_LATERAL = [
  { id: 'YNSA-A-LEFT', label: 'A', cx: 90,  cy: 76,  ldx:  0,  ldy: -16, anchor: 'middle' },
  { id: 'YNSA-B-LEFT', label: 'B', cx: 118, cy: 69,  ldx:  0,  ldy: -16, anchor: 'middle' },
  { id: 'YNSA-C-LEFT', label: 'C', cx: 144, cy: 67,  ldx:  0,  ldy: -16, anchor: 'middle' },
  { id: 'YNSA-D-LEFT', label: 'D', cx: 153, cy: 97,  ldx:  14, ldy:   4, anchor: 'start'  },
  { id: 'YNSA-E-LEFT', label: 'E', cx: 157, cy: 128, ldx:  14, ldy:   4, anchor: 'start'  },
  { id: 'YNSA-F-LEFT', label: 'F', cx: 160, cy: 159, ldx:  14, ldy:   4, anchor: 'start'  },
  { id: 'YNSA-G-LEFT', label: 'G', cx: 167, cy: 192, ldx:  14, ldy:   4, anchor: 'start'  },
  { id: 'YNSA-H-LEFT', label: 'H', cx: 188, cy: 238, ldx:  14, ldy:   4, anchor: 'start'  },
]

function zoneStyle(id, selected, hovered) {
  if (id === selected) return { fill: 'rgba(59,130,246,0.55)', stroke: '#1d4ed8' }
  if (id === hovered)  return { fill: 'rgba(59,130,246,0.30)', stroke: '#2563eb' }
  return                      { fill: 'rgba(59,130,246,0.12)', stroke: '#3b82f6' }
}

export default function HeadLateral({ onPointSelect, pickerMode = false }) {
  const [selected, setSelected] = useState(null)
  const [hovered,  setHovered]  = useState(null)
  const [pickerPos, setPickerPos] = useState(null)
  const svgRef = useRef(null)

  function handleClick(id) {
    setSelected(id)
    const data = ynsaData.points.find(p => p.id === id)
    if (onPointSelect && data) onPointSelect(data)
  }

  function handleSvgClick(e) {
    if (!pickerMode) return
    const svg = svgRef.current
    const pt = svg.createSVGPoint()
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
      viewBox="0 0 463 576"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: '100%', maxHeight: '100%', cursor: pickerMode ? 'crosshair' : 'default' }}
      onClick={handleSvgClick}
    >
      {/* ── Head outline ── */}
      <path
        d="M37.5144 389.214C32.0144 383.214 35.8497 373.214 35.8497 373.214C41.183 366.881 43.3497 349.714 40.8497 339.214C38.3497 328.714 -1.65031 349.214 2.84969 320.714C4.09739 312.812 12.8497 270.214 35.8497 247.714C57.0099 227.014 46.8497 215.714 40.8497 202.714C34.8497 189.714 40.8497 191.714 40.8497 162.714C54.8497 9.714 222.85 0.713991 267.85 2.71399C312.85 4.71399 356.542 15.9243 389.85 38.714C437.35 71.214 459.85 129.214 459.85 171.714C459.85 220.222 450.85 272.714 429.85 306.714C408.85 340.714 389.85 380.714 389.85 404.714C389.85 428.714 392.85 508.214 399.35 535.214C404.526 556.714 416.683 564.881 420.35 571.214M37.5144 389.214C32.5144 399.214 38.8497 407.214 38.8497 407.214C47.8497 413.714 52.3497 429.714 47.8497 447.714C44.0534 462.899 64.8497 480.714 108.85 480.714C131.653 480.714 176.211 464.116 194.35 457.714C219.85 448.714 237.85 425.214 240.85 410.714M37.5144 389.214C54.3497 396.214 87.8497 389.214 87.8497 389.214M42.1215 410.214C65.1215 410.214 68.8497 400.214 87.8497 389.214C70.3497 385.214 59.5144 380.214 37.5144 370.714"
        stroke="#434040" strokeWidth="5"
      />
      {/* Eye */}
      <path
        d="M95.3497 185.714C82.3497 180.214 53.3497 182.214 48.8497 185.714C44.3497 189.214 51.8497 197.214 51.8497 197.214C60.8497 196.547 67.0356 191.098 85.3497 193.714C99.3497 195.714 111.85 203.047 116.85 208.714C116.85 197.214 108.35 191.214 95.3497 185.714Z"
        stroke="#434040" strokeWidth="3"
      />
      {/* Ear */}
      <path
        d="M103.85 231.214C86.3497 227.714 71.8497 219.714 62.8497 214.214L66.3497 208.214C75.3497 214.214 98.9497 229.614 109.35 231.214C94.8497 236.214 76.3497 237.214 67.3497 240.714C58.3497 244.214 62.471 240.849 59.3497 240.714C41.4056 239.937 87.8497 231.214 103.85 231.214Z"
        stroke="#434040" strokeWidth="3"
      />
      {/* Neck line */}
      <path
        d="M141.85 476.214C147.183 498.047 159.05 552.314 159.85 572.714"
        stroke="#434040" strokeWidth="5" strokeLinecap="round"
      />
      {/* Ear detail */}
      <path
        d="M71.8465 219.714C67.3465 225.714 66.8465 230.214 69.3465 236.214"
        stroke="#434040" strokeWidth="7"
      />
      {/* Hairline (dashed) */}
      <path
        d="M85.3497 69.214C104.35 69.214 133.85 64.714 146.85 87.714C159.85 110.714 149.85 143.714 159.85 166.214C173.627 197.214 213.35 226.714 203.85 274.214C204.85 279.881 215.85 281.014 219.85 274.214"
        stroke="#434040" strokeWidth="3" strokeLinecap="round" strokeDasharray="10 10"
      />
      {/* Eye socket / orbital detail */}
      <path
        d="M230.35 279.714C230.35 250.714 249.35 235.214 269.35 235.714C289.35 236.214 310.35 251.104 310.35 279.714C310.35 301.714 302.35 320.214 293.85 333.714C279.667 356.239 273.35 352.214 269.35 367.214C266.387 378.326 262.35 385.714 254.85 386.714C247.35 387.714 243.85 378.214 239.85 367.214"
        stroke="#434040" strokeWidth="4"
      />
      {/* Posterior dashed reference */}
      <path
        d="M304.35 326.214C304.35 351.214 308.962 373.167 327.35 385.214C341.85 394.714 353.35 400.714 384.85 400.714"
        stroke="#434040" strokeWidth="3" strokeDasharray="10 10"
      />

      {/* ── YNSA basic zone markers ── */}
      {YNSA_LATERAL.map(({ id, label, cx, cy, ldx, ldy, anchor }) => {
        const { fill, stroke } = zoneStyle(id, selected, hovered)
        return (
          <g
            key={id}
            onClick={e => { e.stopPropagation(); handleClick(id) }}
            onMouseEnter={() => setHovered(id)}
            onMouseLeave={() => setHovered(null)}
            style={{ cursor: 'pointer' }}
          >
            <ellipse cx={cx} cy={cy} rx={9} ry={7} fill={fill} stroke={stroke} strokeWidth="1.5" />
            <circle  cx={cx} cy={cy} r={3}  fill={stroke} />
            <text
              x={cx + ldx} y={cy + ldy}
              fontSize="11" fontFamily="sans-serif" fontWeight="600"
              fill={stroke} textAnchor={anchor}
            >
              {label}
            </text>
          </g>
        )
      })}

      {/* ── Coordinate picker crosshair (pickerMode only) ── */}
      {pickerMode && pickerPos && (
        <g>
          <line x1={pickerPos.x - 8} y1={pickerPos.y} x2={pickerPos.x + 8} y2={pickerPos.y} stroke="#f59e0b" strokeWidth="1.5"/>
          <line x1={pickerPos.x} y1={pickerPos.y - 8} x2={pickerPos.x} y2={pickerPos.y + 8} stroke="#f59e0b" strokeWidth="1.5"/>
          <text x={pickerPos.x + 10} y={pickerPos.y - 6} fontSize="9" fill="#f59e0b" fontFamily="monospace">
            {pickerPos.x},{pickerPos.y}
          </text>
        </g>
      )}
    </svg>
  )
}
