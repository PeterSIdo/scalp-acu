import { useRef } from 'react'
import CrossIcon from '../ui/CrossIcon'
import { GLASS_TRIGGER } from '../ui/menuStyles'

// Per-diagram magnifier shared by the Ear grid and the TCM Meridians tile.
// A `box` is the diagram's unmagnified crop { x, y, w, h } in viewBox units;
// a `view` is { zoom, cx, cy }, the zoom and the visible window's centre.

// Movement (screen px) before a press on a magnified diagram counts as a pan;
// a finger wobbles more than a mouse, so a tap isn't mistaken for a drag.
const DRAG_SLOP = { mouse: 3, touch: 10, pen: 6 }

const MAX_ZOOM = 2

export function defaultView(box) {
  return { zoom: 1, cx: box.x + box.w / 2, cy: box.y + box.h / 2 }
}

// Clamp the view centre so the zoomed window stays inside the crop.
export function clampView(box, { zoom, cx, cy }) {
  const w = box.w / zoom
  const h = box.h / zoom
  return {
    zoom,
    cx: Math.min(Math.max(cx, box.x + w / 2), box.x + box.w - w / 2),
    cy: Math.min(Math.max(cy, box.y + h / 2), box.y + box.h - h / 2),
  }
}

// A diagram with its own magnification: the slider shrinks the viewBox
// around the view centre, and dragging pans it while zoomed in. Mouse-downs
// are stopped while zoomed so ZoomableView doesn't pan the whole grid too,
// and a click after a drag is swallowed so it doesn't toggle the tile or
// select a point. `children` renders the diagram for the visible window.
export function MagnifiedDiagram({ box, view, onViewChange, children }) {
  const hostRef = useRef(null)
  const drag = useRef(null)
  const dragged = useRef(false)
  const w = box.w / view.zoom
  const h = box.h / view.zoom
  const zoomed = view.zoom > 1

  function onPointerDown(e) {
    if (!zoomed || e.button !== 0) return
    drag.current = { x: e.clientX, y: e.clientY, slop: DRAG_SLOP[e.pointerType] ?? 3 }
    dragged.current = false
  }

  function onPointerMove(e) {
    if (!drag.current) return
    const dx = e.clientX - drag.current.x
    const dy = e.clientY - drag.current.y
    // Capture only once it's really a drag: capturing on pointer-down would
    // retarget the click to this wrapper, so points couldn't be selected.
    if (!dragged.current) {
      if (Math.abs(dx) <= drag.current.slop && Math.abs(dy) <= drag.current.slop) return
      dragged.current = true
      e.currentTarget.setPointerCapture(e.pointerId)
    }
    const rect = hostRef.current.getBoundingClientRect()
    // Pixels per SVG unit under preserveAspectRatio="xMidYMid meet".
    const scale = Math.min(rect.width / w, rect.height / h)
    drag.current = { ...drag.current, x: e.clientX, y: e.clientY }
    onViewChange(v => clampView(box, { ...v, cx: v.cx - dx / scale, cy: v.cy - dy / scale }))
  }

  function onPointerUp() {
    drag.current = null
  }

  return (
    <div
      ref={hostRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onMouseDown={e => { if (zoomed) e.stopPropagation() }}
      onClickCapture={e => { if (dragged.current) { e.stopPropagation(); dragged.current = false } }}
      style={{ position: 'relative', width: '100%', height: '100%', cursor: zoomed ? 'grab' : undefined, touchAction: zoomed ? 'none' : undefined }}
    >
      {children({ x: view.cx - w / 2, y: view.cy - h / 2, w, h })}
    </div>
  )
}

// Magnification slider, styled like the point menus' trigger.
export function ZoomSlider({ box, view, compact, onViewChange }) {
  return (
    <div
      className={`flex items-center gap-2 text-xs font-semibold px-2 py-1 ${GLASS_TRIGGER} text-black`}
      onClick={e => e.stopPropagation()}
      onMouseDown={e => e.stopPropagation()}
      onPointerDown={e => e.stopPropagation()}
    >
      <span aria-hidden="true">−</span>
      <input
        type="range"
        min={1}
        max={MAX_ZOOM}
        step={0.1}
        value={view.zoom}
        onChange={e => { const zoom = Number(e.target.value); onViewChange(v => clampView(box, { ...v, zoom })) }}
        aria-label="Magnification"
        className={`${compact ? 'w-16' : 'w-28'} accent-amber-500 cursor-pointer`}
      />
      <span aria-hidden="true">+</span>
      {view.zoom > 1 && (
        <button
          type="button"
          onClick={() => onViewChange(defaultView(box))}
          aria-label="Reset magnification"
          className="flex items-center justify-center w-5 h-5 rounded-full bg-orange-500 hover:bg-orange-600 text-white shadow-sm transition duration-150 ease-out hover:scale-110 active:scale-90"
        >
          <CrossIcon size={10} strokeWidth={4} />
        </button>
      )}
    </div>
  )
}
