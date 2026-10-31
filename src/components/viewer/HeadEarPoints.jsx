import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import EarBasicSvg from '../../assets/diagrams/ear-basic.svg?react'
import EarMusculoskeletalSvg from '../../assets/diagrams/ear-musculoskeletal.svg?react'
import EarInternalOrgansSvg from '../../assets/diagrams/ear-internal-organs.svg?react'
import EarTcmSvg from '../../assets/diagrams/ear-tcm-2.svg?react'
import TileTitle from '../ui/TileTitle'
import CrossIcon from '../ui/CrossIcon'
import MenuSizer from '../ui/MenuSizer'
import { GLASS_TRIGGER, GLASS_DROPDOWN } from '../ui/menuStyles'
import { AURICULOTHERAPY_CATEGORIES, AURICULOTHERAPY_POINTS } from '../../data/earAuriculotherapy'

// 2x2 grid, row-major (same layout as Basic Points):
// Master | Musculoskeletal / Internal Organs | Neuroendocrine.
const TILE_IDS = ['master', 'musculoskeletal', 'internal', 'neuroendocrine']

const TILE_TITLES = {
  master: 'Chinese Auriculotherapy',
  musculoskeletal: 'Musculoskeletal Points',
  internal: 'Internal Organ Points',
  neuroendocrine: 'Neuroendocrine Points',
}

// Musculoskeletal points from ear-acupoints.txt, in its groups and order.
const MSK_GROUPS = [
  { label: 'Lower limb', points: ['Toes (C)', 'Toes (E)', 'Heel (C)', 'Heel (E)', 'Ankle (C)', 'Ankle (E)', 'Knee (C)', 'Knee (E)', 'Hip (C)', 'Hip (E)'] },
  { label: 'Upper limb', points: ['Fingers', 'Hand', 'Wrist', 'Elbow', 'Arm', 'Shoulder', 'Master Shoulder'] },
  { label: 'Spine and trunk', points: ['Cervical Spine', 'Cervical Spine Point', 'Thoracic Spine', 'Lumbar Spine', 'Sacral Spine', 'Lumbago', 'Neck', 'Chest', 'Abdomen'] },
  { label: 'Head and face', points: ['Occiput', 'Temples', 'Forehead', 'Face', 'Eye', 'Eye Disorder 1', 'Eye Disorder 2', 'Upper Jaw', 'Lower Jaw', 'TMJ', 'Dental Analgesia', 'Inner Ear (C)', 'Inner Ear (E)', 'Inner Nose (C)', 'External Ear (C)'] },
  { label: 'Other points on this chart', points: ['Muscle Relaxation'] },
]

// ear-musculoskeletal.svg element id -> point name. Most ids equal the
// point name; the rest are Figma renames/typos. The left leg figure is the
// European one (Toes (E), Heel (E), Hip (E)), so its "Knee (C)_2" is Knee (E).
// The two Inner Ear ids are swapped against the source chart: the boxed
// square under Inner Nose (C) is Inner Ear (E), the lobe dot is Inner Ear (C).
// "Fingers" is a group of five fingertip dots.
const MSK_RENAMES = {
  'Knee (C)_2': 'Knee (E)',
  'Inner Ear (C)': 'Inner Ear (E)',
  'Inner Ear': 'Inner Ear (C)',
  'External Ear': 'External Ear (C)',
  'Muscle Rekaxation': 'Muscle Relaxation',
}
const MSK_SVG_IDS = Object.fromEntries([
  'Toes (C)', 'Toes (E)', 'Heel (C)', 'Heel (E)', 'Ankle (C)', 'Ankle (E)', 'Knee (C)', 'Knee (C)_2', 'Hip (C)', 'Hip (E)',
  'Fingers', 'Hand', 'Wrist', 'Elbow', 'Arm', 'Shoulder', 'Master Shoulder',
  'Cervical Spine', 'Cervical Spine Point', 'Thoracic Spine', 'Lumbar Spine', 'Sacral Spine', 'Lumbago', 'Neck', 'Chest', 'Abdomen',
  'Occiput', 'Temples', 'Forehead', 'Face', 'Eye', 'Eye Disorder 1', 'Eye Disorder 2', 'Upper Jaw', 'Lower Jaw', 'TMJ',
  'Dental Analgesia', 'Inner Ear (C)', 'Inner Ear', 'Inner Nose (C)', 'External Ear', 'Muscle Rekaxation',
].map(id => [id, MSK_RENAMES[id] ?? id]))

// Spine segments are stroked lines, not dots, so they're thickened rather than outlined.
const MSK_LINE_IDS = new Set(['Cervical Spine', 'Thoracic Spine', 'Lumbar Spine', 'Sacral Spine'])

// Internal organ points from ear-acupoints.txt, in its groups and order.
const ORG_GROUPS = [
  { label: 'Digestive', points: ['Mouth', 'Stomach', 'Small Intestine', 'Large Intestine', 'Liver', 'Pancreas', 'Spleen (C)', 'Spleen (E)'] },
  { label: 'Cardiorespiratory', points: ['Heart (C)', 'Heart (E)', 'Lung 1', 'Lung 2', 'Throat (C)', 'Throat (E)', 'Diaphragm (C)'] },
  { label: 'Urogenital', points: ['Kidney (C)', 'Kidney (E)', 'Bladder', 'Prostate (C)', 'Uterus (C)', 'Uterus (E)', 'External Genitals (C)', 'External Genitals (E)'] },
]

// ear-internal-organs.svg element id -> point name (the intestine ids are lower-case in Figma).
const ORG_RENAMES = {
  'Small intestine': 'Small Intestine',
  'Large intestine': 'Large Intestine',
}
const ORG_SVG_IDS = Object.fromEntries([
  'Mouth', 'Stomach', 'Small intestine', 'Large intestine', 'Liver', 'Pancreas', 'Spleen (C)', 'Spleen (E)',
  'Heart (C)', 'Heart (E)', 'Lung 1', 'Lung 2', 'Throat (C)', 'Throat (E)', 'Diaphragm (C)',
  'Kidney (C)', 'Kidney (E)', 'Bladder', 'Prostate (C)', 'Uterus (C)', 'Uterus (E)', 'External Genitals (C)', 'External Genitals (E)',
].map(id => [id, ORG_RENAMES[id] ?? id]))

// ear-tcm-2.svg element id -> Chinese Auriculotherapy point name, where they
// differ. Most ids equal the name.
const MASTER_RENAMES = {
  'Raise Blood Pressure': 'Raising Blood Pressure Point',
  'Vision 2': 'Vision II',
  'Groove of Coronary Heart Disease': 'Coronary Heart Disease Groove',
  'Groove of Missing Teeth': 'Missing Teeth Groove',
  'Cheek': 'Face & Cheek Area',
}
const MASTER_LINE_IDS = new Set(['Groove of Coronary Heart Disease', 'Groove of Hypertension', 'Groove of Missing Teeth', 'Groove of Tinnitus'])
const MASTER_SVG_IDS = Object.fromEntries([
  'Anxious Point', 'Brain Point', 'Brain Stem', 'Eye', 'Internal Ear', 'Lower Jaw', 'Lower Palate', 'Neurasthenia Point',
  'Raise Blood Pressure', 'Tongue', 'Tonsil', 'Tooth', 'Upper Jaw', 'Upper Palate', 'Vision 2', 'Wisdom Teeth',
  ...MASTER_LINE_IDS, 'Cheek',
].map(id => [id, MASTER_RENAMES[id] ?? id]))

// Tiles whose diagram has clickable points, with their dropdown groups.
// lineWidth/lineStroke style a selected line; hitWidth widens lines too thin to
// click. `searchable` tiles use SearchablePointMenu instead of groups.
const POINT_TILES = {
  master: { Svg: EarTcmSvg, searchable: true, svgIds: MASTER_SVG_IDS, lineIds: MASTER_LINE_IDS, lineWidth: '5', lineStroke: '#000000', hitWidth: 20 },
  musculoskeletal: { Svg: EarMusculoskeletalSvg, groups: MSK_GROUPS, svgIds: MSK_SVG_IDS, lineIds: MSK_LINE_IDS, lineWidth: '16' },
  internal: { Svg: EarInternalOrgansSvg, groups: ORG_GROUPS, svgIds: ORG_SVG_IDS, lineIds: new Set() },
}
for (const tile of Object.values(POINT_TILES)) tile.drawn = new Set(Object.values(tile.svgIds))

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

const FILL = { position: 'absolute', inset: 0, width: '100%', height: '100%' }

// Point dropdown, same shape as AreaMenu in HeadZSAPoints.jsx, with the
// txt file's groups as headings. Points not drawn yet are listed but greyed.
function PointMenu({ tile, title, activePoint, menuOpen, compact, onToggle, onSelect, onReset }) {
  const dropdownRef = useRef(null)

  // Native wheel-stop so the page doesn't scroll under the dropdown.
  useEffect(() => {
    const el = dropdownRef.current
    if (!menuOpen || !el) return
    function onWheel(e) {
      e.preventDefault()
      e.stopPropagation()
      el.scrollTop += e.deltaY
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [menuOpen])

  return (
    <div onClick={e => e.stopPropagation()}>
      <div className="flex items-center gap-1.5">
        {/* Button and dropdown share one grid column, sized by MenuSizer,
            so both are as wide as the longest point name. */}
        <div className="relative grid">
          <button type="button" onClick={onToggle} className={`${TRIGGER_CLASS(!!activePoint || menuOpen)} flex justify-between text-left`}>
            {activePoint ?? title}
            <span className="ml-1">{menuOpen ? '▲' : '▼'}</span>
          </button>
          <MenuSizer labels={[
            title,
            ...tile.groups.flatMap(group => [
              <span className="text-[10px] font-bold uppercase tracking-wide">{group.label}</span>,
              ...group.points.map(name => tile.drawn.has(name) ? name : `${name} (not on diagram)`),
            ]),
          ]} />

          {menuOpen && (
            <div
              ref={dropdownRef}
              className={`scroll-touch absolute top-full left-0 right-0 mt-1 py-1 ${GLASS_DROPDOWN} overflow-y-auto z-20 ${compact ? 'max-h-40' : 'max-h-96'}`}
            >
              {tile.groups.map(group => (
                <div key={group.label}>
                  <div className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wide text-gray-400">{group.label}</div>
                  {group.points.map(name => (
                    tile.drawn.has(name) ? (
                      <button key={name} type="button" onClick={() => onSelect(name)} className={DROPDOWN_ITEM_CLASS(activePoint === name)}>
                        {name}
                      </button>
                    ) : (
                      <div key={name} className="px-3 py-1.5 text-xs font-semibold text-gray-300 dark:text-gray-600 cursor-default">
                        {name} <span className="font-normal italic">(not on diagram)</span>
                      </div>
                    )
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
        {activePoint && (
          <button
            type="button"
            onClick={onReset}
            aria-label="Clear selection"
            className="flex items-center justify-center w-5 h-5 rounded-full bg-orange-500 hover:bg-orange-600 text-white shadow-sm transition duration-150 ease-out hover:scale-110 active:scale-90"
          >
            <CrossIcon size={10} strokeWidth={4} />
          </button>
        )}
      </div>
    </div>
  )
}

const CATEGORY_BUTTONS = [{ label: 'All', short: 'All' }, ...AURICULOTHERAPY_CATEGORIES]

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
    ? AURICULOTHERAPY_POINTS.filter(point => point.name.toLowerCase().includes(search))
    : AURICULOTHERAPY_POINTS.filter(point => category === 'All' || point.categories.includes(category))

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
    if (first) onSelect(first.name)
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
        {CATEGORY_BUTTONS.map(({ label, short }) => (
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
            <button key={name} type="button" onClick={() => onSelect(name)} className={DROPDOWN_ITEM_CLASS(activePoint === name)}>
              <MatchedName name={name} query={search} />
              {tag}
            </button>
          ) : (
            <div key={name} className="px-3 py-1.5 text-xs font-semibold text-gray-300 dark:text-gray-600 cursor-default">
              <MatchedName name={name} query={search} /> <span className="font-normal italic">(not on diagram)</span>
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
// it adds search and category buttons. The column can shrink below its
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
          <MenuSizer labels={[title, ...AURICULOTHERAPY_POINTS.map(({ name }) => tile.drawn.has(name) ? name : `${name} (not on diagram)`)]} />
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

// Cropped from the 794x1123 A4 page to the ear itself (same page for every ear diagram).
const MSK_VIEWBOX = { x: 70, y: 50, w: 660, h: 1030 }

// Pulsing ring + name label sizes, in ear diagram units. Their dots
// are r=15 (vs r~7 on the Basic Points heads), so HeadLateral's ring/label
// numbers are scaled up 2x to look the same on screen.
const MARK = { ring: 22, pulse: 44, stroke: 3, gap: 32, pad: 12, font: 22, charW: 12.4 }

// Centre of a point element in the SVG's own (viewBox) units. Spine segments
// are curves, so their midpoint along the path is used rather than the bbox
// centre, which can fall off the line.
function pointCentre(svg, el, lineIds) {
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
function PointDiagram({ tile, activePoint, onSelect, rect, zoom }) {
  const hostRef = useRef(null)
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
    setMarker(selectedEl ? pointCentre(svg, selectedEl, tile.lineIds) : null)
  }, [tile, activePoint])

  function handleClick(e) {
    // Lines and areas can overlap dots, so a dot under the cursor wins.
    const hits = document.elementsFromPoint(e.clientX, e.clientY)
      .map(el => el.closest('[data-ear-point]'))
      .filter(Boolean)
    const name = (hits.find(el => el.tagName === 'circle') ?? hits[0])?.dataset.earPoint
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
    <div ref={hostRef} onClick={handleClick} style={{ position: 'relative', width: '100%', height: '100%' }}>
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

// ear-tcm-2.svg is a 1207x1249 page, cropped to the ear.
const TCM_VIEWBOX = { x: 285, y: 30, w: 737, h: 1160 }
// ear-basic.svg (Inkscape, mm units) is shown whole.
const BASIC_VIEWBOX = { x: 0, y: 0, w: 170.46902, h: 283.32684 }

// Unmagnified crop of each tile's diagram.
const TILE_BOXES = {
  master: TCM_VIEWBOX,
  musculoskeletal: MSK_VIEWBOX,
  internal: MSK_VIEWBOX,
  neuroendocrine: BASIC_VIEWBOX,
}

const MAX_ZOOM = 2

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
    drag.current = { x: e.clientX, y: e.clientY }
    dragged.current = false
  }

  function onPointerMove(e) {
    if (!drag.current) return
    const dx = e.clientX - drag.current.x
    const dy = e.clientY - drag.current.y
    // Capture only once it's really a drag: capturing on pointer-down would
    // retarget the click to this wrapper, so points couldn't be selected.
    if (!dragged.current) {
      if (Math.abs(dx) <= 3 && Math.abs(dy) <= 3) return
      dragged.current = true
      e.currentTarget.setPointerCapture(e.pointerId)
    }
    const rect = hostRef.current.getBoundingClientRect()
    // Pixels per SVG unit under preserveAspectRatio="xMidYMid meet".
    const scale = Math.min(rect.width / w, rect.height / h)
    drag.current = { x: e.clientX, y: e.clientY }
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

function renderTileContent(id, { activePoints, onPointSelect, onPointClear, menuOpenId, onMenuToggle, views, onViewChange, category, onCategoryChange }, expanded = false) {
  if (!TILE_IDS.includes(id)) return null
  const tile = POINT_TILES[id]
  const activePoint = activePoints[id] ?? null
  const box = TILE_BOXES[id]
  const view = views[id] ?? defaultView(box)
  const setView = update => onViewChange(id, update)
  let renderDiagram
  if (tile) {
    renderDiagram = rect => <PointDiagram tile={tile} activePoint={activePoint} onSelect={name => onPointSelect(id, name)} rect={rect} zoom={view.zoom} />
  } else {
    // The neuroendocrine tile reuses the base ear until its own diagram exists.
    renderDiagram = rect => <EarBasicSvg viewBox={`${rect.x} ${rect.y} ${rect.w} ${rect.h}`} style={FILL} />
  }
  const diagram = <MagnifiedDiagram box={box} view={view} onViewChange={setView}>{renderDiagram}</MagnifiedDiagram>
  // Same 40px top offset as the other grids, leaving room for a menu row later.
  return (
    <div data-tile-body style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div style={{ position: 'absolute', top: 40, left: 0, right: 0, bottom: 0 }}>
        {diagram}
      </div>
      {tile && (
        <div className="absolute left-0 right-0 top-0 px-3 pt-3 z-20 pointer-events-none">
          <div className="w-fit max-w-full pointer-events-auto" onClick={e => e.stopPropagation()}>
            {tile.searchable ? (
              <SearchablePointMenu
                tile={tile}
                title={TILE_TITLES[id]}
                activePoint={activePoint}
                menuOpen={menuOpenId === id}
                category={category}
                onCategoryChange={onCategoryChange}
                onToggle={() => onMenuToggle(id)}
                onSelect={name => onPointSelect(id, name)}
                onReset={() => onPointClear(id)}
              />
            ) : (
              <PointMenu
                tile={tile}
                title={TILE_TITLES[id]}
                activePoint={activePoint}
                menuOpen={menuOpenId === id}
                compact={!expanded}
                onToggle={() => onMenuToggle(id)}
                onSelect={name => onPointSelect(id, name)}
                onReset={() => onPointClear(id)}
              />
            )}
          </div>
        </div>
      )}
      {/* Bottom left, lined up with the menu above it; below the menu's
          z-20 so an open dropdown covers it. */}
      <div className="absolute left-0 bottom-0 px-3 pb-3 z-10">
        <ZoomSlider box={box} view={view} compact={!expanded} onViewChange={setView} />
      </div>
    </div>
  )
}

export default function HeadEarPoints() {
  const [expandedId, setExpandedId] = useState(null)
  // Selected point and open dropdown are kept per tile.
  const [activePoints, setActivePoints] = useState({})
  const [menuOpenId, setMenuOpenId] = useState(null)
  // Magnification per tile, shared by the tile and its expanded view.
  const [views, setViews] = useState({})
  // Kept here so the category survives closing the dropdown and expanding the tile.
  const [category, setCategory] = useState('All')

  const tileCtx = {
    activePoints,
    category,
    onCategoryChange: setCategory,
    // Picking the selected point again clears it, same as the ZSA areas.
    onPointSelect: (id, name) => { setMenuOpenId(null); setActivePoints(p => ({ ...p, [id]: p[id] === name ? null : name })) },
    onPointClear: id => setActivePoints(p => ({ ...p, [id]: null })),
    menuOpenId,
    onMenuToggle: id => setMenuOpenId(o => (o === id ? null : id)),
    views,
    onViewChange: (id, update) => setViews(vs => {
      const current = vs[id] ?? defaultView(TILE_BOXES[id])
      return { ...vs, [id]: typeof update === 'function' ? update(current) : update }
    }),
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
          gridTemplateRows: '1fr 1fr',
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
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.015)'; e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.5)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.2)' }}
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
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(99, 236, 225, 0.6)',
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
