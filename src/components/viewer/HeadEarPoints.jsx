import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import EarTcmSvg from '../../assets/diagrams/ear-chin-3.svg?react'
import EarTurnedSvg from '../../assets/diagrams/ear-11.svg?react'
import EarPosteriorSvg from '../../assets/diagrams/posterior-ear.svg?react'
import EarWesternSvg from '../../assets/diagrams/western-ear-complet.svg?react'
import TileTitle from '../ui/TileTitle'
import CrossIcon from '../ui/CrossIcon'
import MenuSizer from '../ui/MenuSizer'
import { GLASS_TRIGGER, GLASS_DROPDOWN } from '../ui/menuStyles'
import { AURICULOTHERAPY_CATEGORIES, AURICULOTHERAPY_POINTS } from '../../data/earAuriculotherapy'
import { earPointInfo } from '../../data/earPointInfo'
import { TILE_TITLES, MSK_GROUPS, MSK_LINE_IDS, MASTER_LINE_IDS, MASTER_SVG_IDS, POSTERIOR_SVG_IDS, TURNED_SVG_IDS, WESTERN_CATEGORIES, WESTERN_POINTS, WESTERN_SVG_IDS } from '../../data/earPoints'
import { TOUCH_REACH, targetAt } from './touchHit'

// One row of two tiles: Chinese Auriculotherapy | Western Auriculotherapy.
const TILE_IDS = ['master', 'western']

// An optional drawing a tile can switch on and off: every group whose id
// starts with `prefix`, except groups holding clickable points (the
// homunculus-spine group draws the four spine points, which stay visible).
const HOMUNCULUS_LAYER = { prefix: 'homunculus-', label: 'Homunculus' }

// Tiles whose diagram has clickable points.
// lineWidth/lineStroke style a selected line; hitWidth widens lines too thin to
// click. Tiles use SearchablePointMenu, listing `points` (A-Z, with their
// categories) and filtering by `categories`.
const POINT_TILES = {
  master: { Svg: EarTcmSvg, filterDiagram: true, points: AURICULOTHERAPY_POINTS, categories: AURICULOTHERAPY_CATEGORIES, svgIds: MASTER_SVG_IDS, lineIds: MASTER_LINE_IDS, lineWidth: '5', lineStroke: '#000000', hitWidth: 20 },
  // filterDiagram: picking a category also hides the other categories' points on the diagram.
  // layerAuto: the homunculus starts off and comes on by itself while the
  // Musculoskeletal filter or one of its points is selected.
  western: { Svg: EarWesternSvg, filterDiagram: true, layerAuto: { category: 'Musculoskeletal', points: new Set(MSK_GROUPS.flatMap(g => g.points)) }, points: WESTERN_POINTS, categories: WESTERN_CATEGORIES, svgIds: WESTERN_SVG_IDS, lineIds: MSK_LINE_IDS, lineWidth: '16', layer: HOMUNCULUS_LAYER },
}
for (const tile of Object.values(POINT_TILES)) {
  tile.drawn = new Set(Object.values(tile.svgIds))
  // Built once, so PointDiagram's effect doesn't rerun on every render.
  if (tile.filterDiagram) tile.categoryPoints = Object.fromEntries(tile.categories.map(c => [c.label, new Set(c.points)]))
}

// Clickable points on an extra point of view (see EXTRA_VIEWS), in the same
// shape as a POINT_TILES entry so PointDiagram can draw them.
const POSTERIOR_POINTS = { Svg: EarPosteriorSvg, svgIds: POSTERIOR_SVG_IDS, lineIds: new Set() }
POSTERIOR_POINTS.drawn = new Set(Object.values(POSTERIOR_SVG_IDS))
// The Turned view (ear-11.svg) draws a selection of the master points.
const TURNED_POINTS = { Svg: EarTurnedSvg, svgIds: TURNED_SVG_IDS, lineIds: new Set() }
TURNED_POINTS.drawn = new Set(Object.values(TURNED_SVG_IDS))
// The menu lists every point of the tile, so the posterior ones count as drawn.
for (const name of POSTERIOR_POINTS.drawn) POINT_TILES.master.drawn.add(name)

// Same trigger/dropdown classes as the ZSA and TCM grids' menus.
const TRIGGER_CLASS = (active) => `text-xs font-semibold px-2 py-1 ${GLASS_TRIGGER} transition-colors ${
  active
    ? 'text-red-700'
    : 'text-black hover:text-red-700'
}`

const DROPDOWN_ITEM_CLASS = (active) => `block w-full text-left px-3 py-1.5 text-xs font-semibold transition-colors ${
  active
    ? 'text-amber-500 dark:text-amber-400'
    : 'text-gray-600 dark:text-gray-300 hover:text-amber-500 dark:hover:text-amber-400'
}`

const TRANSITION_STYLE = `
::view-transition-group(*) {
  animation-duration: 320ms;
  animation-timing-function: cubic-bezier(0.2, 0, 0, 1);
}
`

const NO_POINTS = new Set()

const FILL = { position: 'absolute', inset: 0, width: '100%', height: '100%' }

// A point name with the searched letters highlighted.
function MatchedName({ name, query }) {
  const start = query ? name.toLowerCase().indexOf(query) : -1
  if (start < 0) return name
  const end = start + query.length
  return <>{name.slice(0, start)}<span className="text-red-700 dark:text-amber-300">{name.slice(start, end)}</span>{name.slice(end)}</>
}

// The open dropdown of SearchablePointMenu: search field and category buttons
// stay fixed and only the list scrolls. Search always covers every point, so a
// point is never missed because of the selected category; results show their
// category instead. The list's height is measured so the panel stays inside
// the tile, whose overflow would clip it.
function SearchablePanel({ tile, activePoint, category, onCategoryChange, onSelect, onClose }) {
  const panelRef = useRef(null)
  const fieldRef = useRef(null)
  const listRef = useRef(null)
  const [query, setQuery] = useState('')
  const [listHeight, setListHeight] = useState(160)
  const search = query.trim().toLowerCase()
  const points = search
    ? tile.points.filter(point => point.name.toLowerCase().includes(search))
    : tile.points.filter(point => category === 'All' || point.categories.includes(category))

  useLayoutEffect(() => {
    const body = panelRef.current.closest('[data-tile-body]')
    const bodyRect = body.getBoundingClientRect()
    // Rects include ZoomableView's scale; max-height doesn't.
    const zoom = bodyRect.height / body.offsetHeight
    const free = (bodyRect.bottom - listRef.current.getBoundingClientRect().top) / zoom - 16
    setListHeight(Math.min(384, Math.max(96, free)))
  }, [])

  // On phones focusing would raise the keyboard over the list.
  useEffect(() => {
    if (window.matchMedia('(pointer: fine)').matches) fieldRef.current.focus({ preventScroll: true })
  }, [])

  // Native wheel-stop so ZoomableView doesn't zoom under the dropdown.
  useEffect(() => {
    const el = panelRef.current
    function onWheel(e) {
      e.preventDefault()
      e.stopPropagation()
      listRef.current.scrollTop += e.deltaY
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  // Kept from the tile, which treats Enter/Space as "expand", and from the
  // page's Escape, which would close the expanded card.
  function handleKeyDown(e) {
    e.stopPropagation()
    if (e.key !== 'Escape') return
    if (query) setQuery('')
    else onClose()
  }

  function handleFieldKeyDown(e) {
    if (e.key !== 'Enter') return
    e.preventDefault()
    const first = points.find(point => tile.drawn.has(point.name))
    if (first) onSelect(first.name, true)
  }

  return (
    <div
      ref={panelRef}
      onKeyDown={handleKeyDown}
      onMouseDown={e => e.stopPropagation()}
      className={`absolute top-full left-0 right-0 mt-1 ${GLASS_DROPDOWN} z-20`}
    >
      <div className="p-2 pb-1">
        <input
          ref={fieldRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleFieldKeyDown}
          placeholder="Search all points"
          aria-label="Search all points"
          className="w-full px-2 py-1 rounded bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 focus:border-amber-500 focus:outline-none text-base md:text-xs font-semibold text-gray-900 dark:text-gray-100 placeholder:font-normal placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
      </div>
      <div className="flex flex-wrap gap-1 px-2 pb-2">
        {[{ label: 'All', short: 'All' }, ...tile.categories].map(({ label, short }) => (
          <button
            key={label}
            type="button"
            title={label}
            aria-pressed={!search && category === label}
            onClick={() => { setQuery(''); onCategoryChange(label) }}
            className={`px-1.5 py-0.5 rounded-full text-[11px] font-semibold transition-colors ${
              !search && category === label
                ? 'bg-orange-500 text-white'
                : 'bg-gray-200/70 dark:bg-gray-700/70 text-gray-700 dark:text-gray-200 hover:text-amber-600 dark:hover:text-amber-400'
            }`}
          >
            {short}
          </button>
        ))}
      </div>
      <div
        ref={listRef}
        style={{ maxHeight: listHeight }}
        className="scroll-touch overflow-y-auto py-1 border-t border-gray-300/60 dark:border-gray-700/60"
      >
        {points.map(({ name, categories }) => {
          const tag = search && categories.length > 0 && (
            <span className="block text-[11px] font-normal leading-snug text-gray-500 dark:text-gray-400">{categories.join(' · ')}</span>
          )
          return tile.drawn.has(name) ? (
            <button key={name} type="button" onClick={() => onSelect(name, true)} className={DROPDOWN_ITEM_CLASS(activePoint === name)}>
              <MatchedName name={name} query={search} />
              {tag}
            </button>
          ) : (
            <div key={name} className="px-3 py-1.5 text-xs font-semibold text-gray-300 dark:text-gray-600 cursor-default">
              <MatchedName name={name} query={search} />
              {tag}
            </div>
          )
        })}
        {points.length === 0 && <p className="px-3 py-1.5 text-xs text-gray-400 dark:text-gray-500">No points found</p>}
      </div>
    </div>
  )
}

// Point dropdown for long lists: closed, it's one line like PointMenu; open,
// it adds search and category buttons. onSelect(name, fromMenu) tells
// whether the point was picked from the menu (list or search) rather than the diagram. The column can shrink below its
// longest label, so on phones the panel stays inside the tile.
function SearchablePointMenu({ tile, title, activePoint, menuOpen, category, onCategoryChange, onToggle, onSelect, onReset }) {
  return (
    <div onClick={e => e.stopPropagation()}>
      <div className="flex items-center gap-1.5">
        <div className="relative grid min-w-0" style={{ gridTemplateColumns: 'minmax(0, max-content)' }}>
          <button type="button" onClick={onToggle} className={`${TRIGGER_CLASS(!!activePoint || menuOpen)} flex justify-between text-left`}>
            {activePoint ?? title}
            <span className="ml-1">{menuOpen ? '▲' : '▼'}</span>
          </button>
          <MenuSizer labels={[title, ...tile.points.map(({ name }) => name)]} />
          {menuOpen && (
            <SearchablePanel
              tile={tile}
              activePoint={activePoint}
              category={category}
              onCategoryChange={onCategoryChange}
              onSelect={onSelect}
              onClose={onToggle}
            />
          )}
        </div>
        {activePoint && (
          <button
            type="button"
            onClick={onReset}
            aria-label="Clear selection"
            className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-orange-500 hover:bg-orange-600 text-white shadow-sm transition duration-150 ease-out hover:scale-110 active:scale-90"
          >
            <CrossIcon size={10} strokeWidth={4} />
          </button>
        )}
      </div>
    </div>
  )
}

// Pulsing ring + name label sizes, in ear diagram units. Their dots
// are r=15 (vs r~7 on the Basic Points heads), so HeadLateral's ring/label
// numbers are scaled up 2x to look the same on screen.
const MARK = { ring: 22, pulse: 44, stroke: 3, gap: 32, pad: 12, font: 22, charW: 12.4 }

// Movement (screen px) before a press on a magnified diagram counts as a pan;
// a finger wobbles more than a mouse, so a tap isn't mistaken for a drag.
const DRAG_SLOP = { mouse: 3, touch: 10, pen: 6 }

// Centre of a point element in the SVG's own (viewBox) units. Spine segments
// are curves, so their midpoint along the path is used rather than the bbox
// centre, which can fall off the line.
export function pointCentre(svg, el, lineIds) {
  const m = svg.getScreenCTM().inverse().multiply(el.getScreenCTM())
  let p
  if (lineIds.has(el.id) && el.getTotalLength) {
    p = el.getPointAtLength(el.getTotalLength() / 2)
  } else {
    const b = el.getBBox()
    p = { x: b.x + b.width / 2, y: b.y + b.height / 2 }
  }
  return new DOMPoint(p.x, p.y).matrixTransform(m)
}

// An ear diagram with its points clickable. The Figma ids are on
// the rendered elements, so they're found and styled in place: the others
// fade back, and the selected point gets the same pulsing ring + name label
// as the Basic Points heads (HeadLateral), drawn on an overlay SVG with the
// same viewBox. `rect` is the visible (possibly magnified) window; the ring
// and label are divided by `zoom` so they stay the same size on screen.
// `visible` (a Set of point names, or null for all) hides the other points.
function PointDiagram({ tile, activePoint, onSelect, rect, zoom, showLayer = true, visible = null }) {
  const hostRef = useRef(null)
  const pointerType = useRef('mouse')
  const [marker, setMarker] = useState(null)

  // Invisible wide copies of thin lines, so they're easy to click.
  useEffect(() => {
    const svg = hostRef.current?.querySelector('svg')
    if (!svg || !tile.hitWidth) return
    const hits = [...tile.lineIds].flatMap(id => {
      const el = svg.querySelector(`[id="${id}"]`)
      if (!el) return []
      const hit = el.cloneNode()
      hit.removeAttribute('id')
      hit.dataset.earPoint = tile.svgIds[id]
      hit.style.cssText = `stroke: transparent; stroke-width: ${tile.hitWidth}; stroke-linecap: round; cursor: pointer`
      el.after(hit)
      return [hit]
    })
    return () => hits.forEach(hit => hit.remove())
  }, [tile])

  useEffect(() => {
    const svg = hostRef.current?.querySelector('svg')
    if (!svg) return
    let selectedEl = null
    for (const [elId, name] of Object.entries(tile.svgIds)) {
      const el = svg.querySelector(`[id="${elId}"]`)
      if (!el) continue
      const isLine = tile.lineIds.has(elId)
      el.dataset.earPoint = name
      el.style.display = !visible || visible.has(name) || name === activePoint ? '' : 'none'
      el.style.cursor = 'pointer'
      el.style.transition = 'opacity 150ms ease'
      if (!activePoint) {
        el.style.opacity = ''
        el.style.strokeWidth = ''
        el.style.stroke = ''
      } else if (name === activePoint) {
        el.style.opacity = ''
        el.style.strokeWidth = isLine ? tile.lineWidth : ''
        el.style.stroke = (isLine && tile.lineStroke) || ''
        // If a point has several elements, the first one found carries the marker.
        selectedEl ??= el
      } else {
        el.style.opacity = '0.3'
        el.style.strokeWidth = ''
        el.style.stroke = ''
      }
    }
    // The wide click copies of thin lines (no id) follow their line.
    for (const hit of svg.querySelectorAll('[data-ear-point]:not([id])')) {
      const name = hit.dataset.earPoint
      hit.style.display = !visible || visible.has(name) || name === activePoint ? '' : 'none'
    }
    setMarker(selectedEl ? pointCentre(svg, selectedEl, tile.lineIds) : null)
  }, [tile, activePoint, visible])

  // Show or hide the tile's optional drawing. Runs after the effect above,
  // which tags the point elements this skips.
  useEffect(() => {
    const svg = hostRef.current?.querySelector('svg')
    if (!svg || !tile.layer) return
    for (const el of svg.querySelectorAll(`[id^="${tile.layer.prefix}"]`)) {
      if (el.querySelector('[data-ear-point]')) continue
      el.style.display = showLayer ? '' : 'none'
    }
  }, [tile, showLayer])

  // A finger tap that misses a dot looks around it; the mouse stays exact.
  function handleClick(e) {
    const reach = pointerType.current === 'mouse' ? 0 : TOUCH_REACH
    const name = targetAt(hostRef.current, e.clientX, e.clientY, 'data-ear-point', reach)?.dataset.earPoint
    if (!name) return
    e.stopPropagation()
    onSelect(name)
  }

  const mark = Object.fromEntries(Object.entries(MARK).map(([k, v]) => [k, v / zoom]))
  let label = null
  if (marker && activePoint) {
    const { gap, pad, font, charW } = mark
    const w = activePoint.length * charW + pad * 2
    const h = font + pad * 2
    // Label to the right of the point, flipped left if it would leave the window.
    const tx = marker.x + gap + w > rect.x + rect.w ? marker.x - w - gap : marker.x + gap
    const ty = Math.min(Math.max(marker.y - h / 2, rect.y), rect.y + rect.h - h)
    label = { tx, ty, w, h }
  }
  const viewBox = `${rect.x} ${rect.y} ${rect.w} ${rect.h}`

  return (
    <div ref={hostRef} onPointerDown={e => { pointerType.current = e.pointerType }} onClick={handleClick} style={{ position: 'relative', width: '100%', height: '100%' }}>
      <tile.Svg viewBox={viewBox} style={FILL} />
      {label && (
        <svg
          viewBox={viewBox}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ ...FILL, pointerEvents: 'none' }}
        >
          <circle cx={marker.x} cy={marker.y} r={mark.ring} fill="none" stroke="#000000" strokeWidth={mark.stroke * 0.75} opacity="0.9" />
          <circle cx={marker.x} cy={marker.y} r={mark.ring} fill="none" stroke="#000000" strokeWidth={mark.stroke}>
            <animate attributeName="r"       values={`${mark.ring};${mark.pulse};${mark.ring}`} dur="1.6s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.75;0;0.75" dur="1.6s" repeatCount="indefinite" />
          </circle>
          <rect x={label.tx} y={label.ty} width={label.w} height={label.h} rx={8 / zoom} fill="rgba(0,0,0,0.72)" />
          <text x={label.tx + mark.pad} y={label.ty + mark.font + mark.pad * 0.6} fontSize={mark.font} fill="white" fontFamily="system-ui, sans-serif">
            {activePoint}
          </text>
        </svg>
      )}
    </div>
  )
}

// ear-chin-3.svg is a 1207x1249 page, cropped to the ear.
export const TCM_VIEWBOX = { x: 255, y: 50, w: 740, h: 1162 }
// western-ear-complet.svg is a 1200x1200 page, cropped to the ear.
const WESTERN_VIEWBOX = { x: 260, y: 60, w: 720, h: 1090 }
// posterior-ear.svg is a 1200x1200 page, cropped to the ear.
const POSTERIOR_VIEWBOX = { x: 300, y: 15, w: 600, h: 1170 }

// Extra points of view per tile, after the tile's own diagram (view 0). The
// card's up/down arrows step through them. A view with `points` has its own
// clickable points; others are drawn plain. Picking a point switches to the
// view that draws it (see pointView).
const EXTRA_VIEWS = {
  master: [
    { Svg: EarTurnedSvg, box: { x: 250, y: 20, w: 670, h: 1170 }, label: 'Turned view', points: TURNED_POINTS },
    { Svg: EarPosteriorSvg, box: POSTERIOR_VIEWBOX, label: 'Posterior view', points: POSTERIOR_POINTS },
  ],
}

// Point names drawn on a tile's point of view (0 = the tile's own diagram).
function viewPoints(id, angle) {
  if (angle > 0) return EXTRA_VIEWS[id][angle - 1].points?.drawn ?? new Set()
  return new Set(Object.values(POINT_TILES[id]?.svgIds ?? {}))
}

// The point of view to show `name` on: the current one if it draws it,
// otherwise the first that does (the tile's own diagram if none).
function pointView(id, name, current) {
  if (!name || viewPoints(id, current).has(name)) return current
  const total = (EXTRA_VIEWS[id]?.length ?? 0) + 1
  for (let angle = 0; angle < total; angle++) {
    if (viewPoints(id, angle).has(name)) return angle
  }
  return 0
}

// Unmagnified crop of each tile's diagram.
const TILE_BOXES = {
  master: TCM_VIEWBOX,
  western: WESTERN_VIEWBOX,
}

// Space (px) kept free under every diagram so its bottom isn't hidden behind
// the magnifier row; the diagram shrinks into the rest and moves up.
const BOTTOM_GAP = 30

const MAX_ZOOM = 2

// Crop of a tile's diagram at a point of view (0 = the tile's own diagram).
function tileBox(id, angle = 0) {
  return angle > 0 ? EXTRA_VIEWS[id][angle - 1].box : TILE_BOXES[id]
}

function defaultView(box) {
  return { zoom: 1, cx: box.x + box.w / 2, cy: box.y + box.h / 2 }
}

// Clamp the view centre so the zoomed window stays inside the crop.
function clampView(box, { zoom, cx, cy }) {
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
function MagnifiedDiagram({ box, view, onViewChange, children }) {
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
function ZoomSlider({ box, view, compact, onViewChange }) {
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

// Up/down arrows that step through a tile's points of view, with "n/total".
function ViewStepper({ index, total, label, compact, onStep }) {
  const stop = e => e.stopPropagation()
  const arrow = (dir, disabled, path, name) => (
    <button
      type="button"
      disabled={disabled}
      aria-label={name}
      title={name}
      onClick={e => { stop(e); onStep(dir) }}
      className={`flex items-center justify-center w-5 h-5 rounded-full transition duration-150 ease-out ${
        disabled ? 'text-gray-300 cursor-default' : 'text-black hover:text-red-700 hover:scale-110 active:scale-90'
      }`}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={path} />
      </svg>
    </button>
  )
  return (
    <div
      className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 ${GLASS_TRIGGER} text-black`}
      onClick={stop}
      onMouseDown={stop}
      onPointerDown={stop}
    >
      {arrow(-1, index === 0, 'M5 15l7-7 7 7', 'Previous view')}
      <span className="tabular-nums">{index + 1}/{total}</span>
      {arrow(1, index === total - 1, 'M5 9l7 7 7-7', 'Next view')}
      {!compact && <span className="ml-1 font-normal">{label}</span>}
    </div>
  )
}

// A figure icon; struck through when the drawing is off.
function FigureIcon({ off }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="5" r="2.5" />
      <path d="M12 9v6M7 11h10M12 15l-3.5 6M12 15l3.5 6" />
      {off && <path d="M4 3l16 18" />}
    </svg>
  )
}

// On/off switch for a tile's optional drawing, styled like the slider beside
// it. Compact (grid tile) shows the icon only; the expanded card adds the name.
function LayerToggle({ label, on, compact, onToggle }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={`${label} ${on ? 'on' : 'off'}`}
      title={`${label}: ${on ? 'on' : 'off'}`}
      onClick={e => { e.stopPropagation(); onToggle() }}
      onMouseDown={e => e.stopPropagation()}
      onPointerDown={e => e.stopPropagation()}
      className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 ${GLASS_TRIGGER} transition-colors ${
        on ? 'text-red-700' : 'text-gray-400 hover:text-red-700'
      }`}
    >
      <FigureIcon off={!on} />
      {!compact && <span>{label}</span>}
    </button>
  )
}

function renderTileContent(id, { soloPoints, activePoints, onPointSelect, onPointClear, menuOpenId, onMenuToggle, views, onViewChange, categories, onCategoryChange, layersOn, onLayerToggle, angles, onAngleStep }, expanded = false) {
  if (!TILE_IDS.includes(id)) return null
  const tile = POINT_TILES[id]
  const activePoint = activePoints[id] ?? null
  const extraViews = EXTRA_VIEWS[id] ?? []
  const angle = angles[id] ?? 0
  const extra = angle > 0 ? extraViews[angle - 1] : null
  const box = tileBox(id, angle)
  const view = views[id] ?? defaultView(box)
  const setView = update => onViewChange(id, update)
  // Points of the selected category, for tiles that filter their diagram (null = all).
  // A point picked from the menu or a search is shown alone (PointDiagram always keeps the
  // active point, so an empty set leaves just that one).
  const category = categories[id] ?? 'All'
  // Optional drawings (the homunculus) are on, or follow layerAuto. A manual
  // switch holds until the automatic state next changes.
  const auto = tile?.layerAuto
    ? category === tile.layerAuto.category || tile.layerAuto.points.has(activePoint)
    : true
  const manual = layersOn[id]
  const layerOn = manual && manual.auto === auto ? manual.on : auto
  const visible = tile?.filterDiagram && soloPoints[id] && soloPoints[id] === activePoint
    ? NO_POINTS
    : tile?.categoryPoints?.[category] ?? null
  let renderDiagram
  if (extra?.points) {
    renderDiagram = rect => <PointDiagram tile={extra.points} activePoint={activePoint} onSelect={name => onPointSelect(id, name)} rect={rect} zoom={view.zoom} visible={visible} />
  } else if (extra) {
    const { Svg } = extra
    renderDiagram = rect => <Svg viewBox={`${rect.x} ${rect.y} ${rect.w} ${rect.h}`} style={FILL} />
  } else {
    renderDiagram = rect => <PointDiagram tile={tile} activePoint={activePoint} onSelect={name => onPointSelect(id, name)} rect={rect} zoom={view.zoom} showLayer={layerOn} visible={visible} />
  }
  const diagram = <MagnifiedDiagram box={box} view={view} onViewChange={setView}>{renderDiagram}</MagnifiedDiagram>
  // Same 40px top offset as the other grids, leaving room for a menu row later.
  return (
    <div data-tile-body style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div style={{ position: 'absolute', top: 40, left: 0, right: 0, bottom: BOTTOM_GAP }}>
        {diagram}
      </div>
      {tile && (
        <div className="absolute left-0 right-0 top-0 px-3 pt-3 z-20 pointer-events-none">
          <div className="w-fit max-w-full pointer-events-auto" onClick={e => e.stopPropagation()}>
            <SearchablePointMenu
              tile={tile}
              title={TILE_TITLES[id]}
              activePoint={activePoint}
              menuOpen={menuOpenId === id}
              category={category}
              onCategoryChange={label => onCategoryChange(id, label)}
              onToggle={() => onMenuToggle(id)}
              onSelect={(name, fromMenu) => onPointSelect(id, name, fromMenu)}
              onReset={() => onPointClear(id)}
            />
          </div>
        </div>
      )}
      {/* Bottom left, lined up with the menu above it; below the menu's
          z-20 so an open dropdown covers it. */}
      <div className="absolute left-0 bottom-0 px-3 pb-1 z-10 flex items-stretch gap-1.5">
        <ZoomSlider box={box} view={view} compact={!expanded} onViewChange={setView} />
        {tile?.layer && !extra && (
          <LayerToggle label={tile.layer.label} on={layerOn} compact={!expanded} onToggle={() => onLayerToggle(id, { on: !layerOn, auto })} />
        )}
        {extraViews.length > 0 && (
          <ViewStepper
            index={angle}
            total={extraViews.length + 1}
            label={extra ? extra.label : 'Side view'}
            compact={!expanded}
            onStep={dir => onAngleStep(id, dir)}
          />
        )}
      </div>
    </div>
  )
}

// `pick` ({ tile, name, n }) comes from the viewer's search panel: that point
// is selected and its tile opened. `n` changes on every pick, so picking the
// same point twice still applies.
// `onPointSelect` gets the selected point's description card (Chinese
// Auriculotherapy tile only; null for the other tiles or when cleared), shown
// in the side panel / mobile sheet like the YNSA points.
export default function HeadEarPoints({ pick = null, onPointSelect = null }) {
  const [expandedId, setExpandedId] = useState(null)
  // Selected point and open dropdown are kept per tile.
  const [activePoints, setActivePoints] = useState({})
  const [menuOpenId, setMenuOpenId] = useState(null)
  // Magnification per tile, shared by the tile and its expanded view.
  const [views, setViews] = useState({})
  // Kept here (per tile) so the category survives closing the dropdown and expanding the tile.
  const [categories, setCategories] = useState({})
  // Manual on/off of the optional drawing per tile ({ on, auto }: the switch and
  // the automatic state it overrode), shared by the tile and its expanded view.
  const [layersOn, setLayersOn] = useState({})
  // Point of view per tile (0 = the tile's own diagram, see EXTRA_VIEWS).
  const [angles, setAngles] = useState({})
  // Point per tile picked from the menu or a search, shown alone on the diagram (filterDiagram tiles).
  const [soloPoints, setSoloPoints] = useState({})

  // Switching view resets the magnification, as each view has its own crop.
  function setAngle(id, angle) {
    if ((angles[id] ?? 0) === angle) return
    setAngles(a => ({ ...a, [id]: angle }))
    setViews(vs => ({ ...vs, [id]: defaultView(tileBox(id, angle)) }))
  }

  const tileCtx = {
    angles,
    onAngleStep: (id, dir) => {
      const total = (EXTRA_VIEWS[id]?.length ?? 0) + 1
      setAngle(id, Math.min(Math.max((angles[id] ?? 0) + dir, 0), total - 1))
    },
    activePoints,
    categories,
    // Picking a category shows its points again, even after a search pick.
    onCategoryChange: (id, label) => {
      setCategories(c => ({ ...c, [id]: label }))
      setSoloPoints(sp => ({ ...sp, [id]: null }))
    },
    soloPoints,
    layersOn,
    onLayerToggle: (id, state) => setLayersOn(l => ({ ...l, [id]: state })),
    // Picking the selected point again clears it, same as the ZSA areas.
    onPointSelect: (id, name, fromMenu = false) => {
      const next = activePoints[id] === name ? null : name
      setSoloPoints(sp => ({ ...sp, [id]: fromMenu ? next : null }))
      setMenuOpenId(null)
      setAngle(id, pointView(id, next, angles[id] ?? 0))
      setActivePoints(p => ({ ...p, [id]: next }))
      onPointSelect?.(earPointInfo(id, next))
    },
    onPointClear: id => { setActivePoints(p => ({ ...p, [id]: null })); setSoloPoints(sp => ({ ...sp, [id]: null })); onPointSelect?.(null) },
    menuOpenId,
    onMenuToggle: id => setMenuOpenId(o => (o === id ? null : id)),
    views,
    onViewChange: (id, update) => setViews(vs => {
      const current = vs[id] ?? defaultView(tileBox(id, angles[id] ?? 0))
      return { ...vs, [id]: typeof update === 'function' ? update(current) : update }
    }),
  }

  // A new search pick is applied while rendering (React's "adjust state when
  // a prop changes" pattern), so it shows without an extra effect pass.
  const [appliedPick, setAppliedPick] = useState(null)
  if (pick !== appliedPick) {
    setAppliedPick(pick)
    if (pick) {
      setMenuOpenId(null)
      setActivePoints(p => ({ ...p, [pick.tile]: pick.name }))
      setSoloPoints(sp => ({ ...sp, [pick.tile]: pick.name }))
      setAngle(pick.tile, pointView(pick.tile, pick.name, angles[pick.tile] ?? 0))
      setExpandedId(pick.tile)
    }
  }

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') setExpandedId(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  function toggle(id) {
    const next = expandedId === id ? null : id
    if (document.startViewTransition) {
      document.startViewTransition(() => flushSync(() => setExpandedId(next)))
    } else {
      setExpandedId(next)
    }
  }

  return (
    <div
      style={{ position: 'relative', width: '100%', height: '100%' }}
      onClick={() => menuOpenId && setMenuOpenId(null)}
    >
      <style>{TRANSITION_STYLE}</style>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: '1fr',
          gap: '1rem',
          width: '100%',
          height: '100%',
        }}
      >
        {TILE_IDS.map(id => {
          const isExpanded = expandedId === id
          return (
            <div
              key={id}
              role="button"
              tabIndex={0}
              aria-label={`Expand ${id}`}
              onClick={() => toggle(id)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(id) } }}
              style={{
                viewTransitionName: isExpanded ? 'none' : `ear-tile-${id}`,
                visibility: isExpanded ? 'hidden' : 'visible',
                minHeight: 0,
                minWidth: 0,
                border: '1px solid rgba(148, 163, 184, 0.2)',
                borderRadius: 10,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
                justifyContent: 'flex-start',
                background: '#ffffff',
                cursor: 'pointer',
                overflow: 'hidden',
                transition: 'transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease',
              }}
              // Mouse only: on touch the hover lift would stick after a tap.
              onPointerEnter={e => { if (e.pointerType !== 'mouse') return; e.currentTarget.style.transform = 'scale(1.015)'; e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.5)' }}
              onPointerLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.2)' }}
            >
              {!isExpanded && (
                <div style={{ flex: 1, minHeight: 0, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {renderTileContent(id, tileCtx)}
                </div>
              )}
              {!isExpanded && <TileTitle>{TILE_TITLES[id]}</TileTitle>}
            </div>
          )
        })}
      </div>

      {expandedId && (
        <div className="bg-gray-300 dark:bg-gray-900"
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 20,
          }}
        >
          <div
            style={{
              viewTransitionName: `ear-tile-${expandedId}`,
              position: 'relative',
              width: '100%',
              height: '100%',
              background: '#ffffff',
              borderRadius: 12,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
              justifyContent: 'flex-start',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
              overflow: 'hidden',
            }}
          >
            <div style={{ flex: 1, minHeight: 0, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {renderTileContent(expandedId, tileCtx, true)}
            </div>
            <TileTitle>{TILE_TITLES[expandedId]}</TileTitle>
            <button
              onClick={e => { e.stopPropagation(); toggle(expandedId) }}
              aria-label="Close"
              className="transition duration-150 ease-out hover:scale-110 active:scale-90 hover:brightness-110"
              style={{
                position: 'absolute',
                top: 10,
                right: 10,
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
                zIndex: 1,
              }}
            ><CrossIcon size={22} strokeWidth={3.5} /></button>
          </div>
        </div>
      )}
    </div>
  )
}
