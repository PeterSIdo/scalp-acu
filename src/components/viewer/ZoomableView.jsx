import { useReducer, useRef, useEffect, forwardRef, useImperativeHandle } from 'react'
import ResetIcon from '../ui/ResetIcon'

const MIN_SCALE = 1
const MAX_SCALE = 6

function reducer(state, action) {
  switch (action.type) {
    case 'WHEEL': {
      const factor = action.delta < 0 ? 1.12 : 0.88
      const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, state.scale * factor))
      const ratio = newScale / state.scale
      return {
        scale: newScale,
        tx: action.cx - ratio * (action.cx - state.tx),
        ty: action.cy - ratio * (action.cy - state.ty),
      }
    }
    case 'PAN':
      return { ...state, tx: state.tx + action.dx, ty: state.ty + action.dy }
    case 'ZOOM_IN': {
      const newScale = Math.min(MAX_SCALE, state.scale * 1.25)
      return { ...state, scale: newScale }
    }
    case 'ZOOM_OUT': {
      const newScale = Math.max(MIN_SCALE, state.scale / 1.25)
      return newScale <= 1 ? { scale: 1, tx: 0, ty: 0 } : { ...state, scale: newScale }
    }
    case 'RESET':
      return { scale: 1, tx: 0, ty: 0 }
    default:
      return state
  }
}

const ZoomableView = forwardRef(function ZoomableView({ children, wheelZoom = true, onReset }, ref) {
  const [{ scale, tx, ty }, dispatch] = useReducer(reducer, { scale: 1, tx: 0, ty: 0 })
  const containerRef = useRef(null)
  const isDragging = useRef(false)
  const hasDragged = useRef(false)
  const lastPos = useRef({ x: 0, y: 0 })
  const isZoomed = scale > 1

  useImperativeHandle(ref, () => ({
    zoomIn:  () => dispatch({ type: 'ZOOM_IN' }),
    zoomOut: () => dispatch({ type: 'ZOOM_OUT' }),
    reset:   () => dispatch({ type: 'RESET' }),
  }))

  // Non-passive wheel listener so we can call preventDefault. Disabled via
  // wheelZoom={false} for content that scrolls itself (the Y-Points grid).
  useEffect(() => {
    const el = containerRef.current
    if (!el || !wheelZoom) return
    const onWheel = (e) => {
      e.preventDefault()
      const rect = el.getBoundingClientRect()
      dispatch({
        type: 'WHEEL',
        delta: e.deltaY,
        cx: e.clientX - rect.left - rect.width / 2,
        cy: e.clientY - rect.top - rect.height / 2,
      })
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [wheelZoom])

  function onMouseDown(e) {
    if (e.button !== 0) return
    isDragging.current = true
    hasDragged.current = false
    lastPos.current = { x: e.clientX, y: e.clientY }
  }

  function onMouseMove(e) {
    if (!isDragging.current) return
    const dx = e.clientX - lastPos.current.x
    const dy = e.clientY - lastPos.current.y
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) hasDragged.current = true
    lastPos.current = { x: e.clientX, y: e.clientY }
    dispatch({ type: 'PAN', dx, dy })
  }

  function onMouseUp() {
    isDragging.current = false
  }

  // Suppress click-on-point after a drag
  function onClickCapture(e) {
    if (hasDragged.current) {
      e.stopPropagation()
      hasDragged.current = false
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden"
      style={{ cursor: isZoomed ? 'grab' : 'default' }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onClickCapture={onClickCapture}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
          transformOrigin: 'center center',
          willChange: 'transform',
        }}
      >
        {children}
      </div>

      {/* Reset the whole screen */}
      <button
        type="button"
        onMouseDown={e => e.stopPropagation()}
        onClick={onReset}
        aria-label="Reset screen"
        title="Reset screen"
        className="absolute bottom-3 right-3 transition duration-150 ease-out hover:scale-110 active:scale-90 hover:brightness-110"
        style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          border: '2px solid #ffffff',
          background: '#f97316',
          color: '#ffffff',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.35)',
          cursor: 'pointer',
        }}
      ><ResetIcon size={22} strokeWidth={3} /></button>
    </div>
  )
})

export default ZoomableView
