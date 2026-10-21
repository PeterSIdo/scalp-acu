import { useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import EarBasicSvg from '../../assets/diagrams/ear-basic.svg?react'
import EarMusculoskeletalSvg from '../../assets/diagrams/ear-musculoskeletal.svg?react'
import TileTitle from '../ui/TileTitle'
import CrossIcon from '../ui/CrossIcon'

// 2x2 grid, row-major (same layout as Basic Points):
// Master | Musculoskeletal / Internal Organs | Neuroendocrine.
const TILE_IDS = ['master', 'musculoskeletal', 'internal', 'neuroendocrine']

const TILE_TITLES = {
  master: 'Master Points',
  musculoskeletal: 'Musculoskeletal Points',
  internal: 'Internal Organ Points',
  neuroendocrine: 'Neuroendocrine Points',
}

// Musculoskeletal points from ear-acupoints.txt, in its groups and order.
const MSK_GROUPS = [
  { label: 'Lower limb', points: ['Toes (C)', 'Toes (E)', 'Heel (C)', 'Heel (E)', 'Ankle (C)', 'Ankle (E)', 'Knee (C)', 'Knee (E)', 'Hip (C)', 'Hip (E)'] },
  { label: 'Upper limb', points: ['Fingers', 'Hand', 'Wrist', 'Elbow', 'Arm', 'Shoulder', 'Master Shoulder'] },
  { label: 'Spine and trunk', points: ['Cervical Spine', 'Thoracic Spine', 'Lumbar Spine', 'Sacral Spine', 'Lumbago', 'Neck', 'Chest', 'Abdomen'] },
  { label: 'Head and face', points: ['Occiput', 'Temples', 'Forehead', 'Face', 'Eye', 'Eye Disorder 1', 'Eye Disorder 2', 'Upper Jaw', 'Lower Jaw', 'TMJ', 'Dental Analgesia', 'Inner Ear (C)', 'Inner Ear (E)', 'Inner Nose (C)', 'External Ear (C)'] },
  { label: 'Other points on this chart', points: ['Muscle Relaxation', 'Skin Disorder (C)', 'Skin Disorder (E)'] },
]

// ear-musculoskeletal.svg element id -> point name. Most ids equal the
// point name; the rest are Figma renames/typos. The left leg figure is the
// European one (Toes (E), Heel (E), Hip (E)), so its "Ankle (C)" and
// "Knee (C)_2" are read as Ankle (E) and Knee (E).
const MSK_RENAMES = {
  'Ankle (C)': 'Ankle (E)',
  'Knee (C)_2': 'Knee (E)',
  'Cervical Spine_2': 'Cervical Spine',
  'Inner Ear': 'Inner Ear (E)',
  'External Ear': 'External Ear (C)',
  'Muscle Rekaxation': 'Muscle Relaxation',
}
const MSK_SVG_IDS = Object.fromEntries([
  'Toes (C)', 'Toes (E)', 'Heel (C)', 'Heel (E)', 'Ankle (C)', 'Knee (C)', 'Knee (C)_2', 'Hip (C)', 'Hip (E)',
  'Fingers', 'Hand', 'Wrist', 'Elbow', 'Arm', 'Shoulder', 'Master Shoulder',
  'Cervical Spine', 'Cervical Spine_2', 'Thoracic Spine', 'Lumbar Spine', 'Sacral Spine', 'Lumbago', 'Neck', 'Chest', 'Abdomen',
  'Occiput', 'Temples', 'Forehead', 'Face', 'Eye', 'Eye Disorder 1', 'Eye Disorder 2', 'Upper Jaw', 'Lower Jaw', 'TMJ',
  'Dental Analgesia', 'Inner Ear (C)', 'Inner Ear', 'Inner Nose (C)', 'External Ear', 'Muscle Rekaxation',
].map(id => [id, MSK_RENAMES[id] ?? id]))

const MSK_DRAWN = new Set(Object.values(MSK_SVG_IDS))

// Spine segments are stroked lines, not dots, so they're thickened rather than outlined.
const MSK_LINE_IDS = new Set(['Cervical Spine', 'Thoracic Spine', 'Lumbar Spine', 'Sacral Spine'])

// Same trigger/dropdown classes as the ZSA and TCM grids' menus.
const TRIGGER_CLASS = (active) => `text-xs font-semibold px-2 py-1 rounded bg-[#63ECE1] transition-colors ${
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
function MusculoskeletalMenu({ activePoint, menuOpen, compact, onToggle, onSelect, onReset }) {
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
        <button type="button" onClick={onToggle} className={TRIGGER_CLASS(!!activePoint || menuOpen)}>
          {activePoint ?? 'Musculoskeletal Points'}
          <span className="ml-1">{menuOpen ? '▲' : '▼'}</span>
        </button>
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

      {menuOpen && (
        <div
          ref={dropdownRef}
          className={`scroll-touch absolute top-full left-3 right-3 mt-1 py-1 rounded shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-y-auto z-20 ${compact ? 'max-h-40' : 'max-h-96'}`}
        >
          {MSK_GROUPS.map(group => (
            <div key={group.label}>
              <div className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wide text-gray-400">{group.label}</div>
              {group.points.map(name => (
                MSK_DRAWN.has(name) ? (
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
  )
}

// ear-musculoskeletal.svg with its points clickable. The Figma ids are on
// the rendered elements, so they're found and styled in place: the selected
// point gets an amber outline, the others fade back.
function MusculoskeletalDiagram({ activePoint, onSelect }) {
  const hostRef = useRef(null)

  useEffect(() => {
    const svg = hostRef.current?.querySelector('svg')
    if (!svg) return
    for (const [elId, name] of Object.entries(MSK_SVG_IDS)) {
      const el = svg.querySelector(`[id="${elId}"]`)
      if (!el) continue
      const isLine = MSK_LINE_IDS.has(elId)
      el.dataset.mskPoint = name
      el.style.cursor = 'pointer'
      el.style.transition = 'opacity 150ms ease'
      if (!activePoint) {
        el.style.opacity = ''
        el.style.stroke = ''
        el.style.strokeWidth = ''
      } else if (name === activePoint) {
        el.style.opacity = ''
        el.style.stroke = isLine ? '' : '#F59E0B'
        el.style.strokeWidth = isLine ? '16' : '8'
      } else {
        el.style.opacity = '0.3'
        el.style.stroke = ''
        el.style.strokeWidth = ''
      }
    }
  }, [activePoint])

  function handleClick(e) {
    const name = e.target.closest?.('[data-msk-point]')?.dataset.mskPoint
    if (!name) return
    e.stopPropagation()
    onSelect(name)
  }

  return (
    <div ref={hostRef} onClick={handleClick} style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Cropped from the 794x1123 A4 page to the ear itself. */}
      <EarMusculoskeletalSvg viewBox="70 50 660 1030" style={FILL} />
    </div>
  )
}

function renderTileContent(id, { activePoint, onPointSelect, onPointClear, menuOpen, onMenuToggle }, expanded = false) {
  let diagram
  switch (id) {
    case 'musculoskeletal':
      diagram = <MusculoskeletalDiagram activePoint={activePoint} onSelect={onPointSelect} />
      break
    // Internal organ / neuroendocrine tiles reuse the base ear until their own diagrams exist.
    case 'master':
    case 'internal':
    case 'neuroendocrine':
      diagram = <EarBasicSvg style={FILL} />
      break
    default:
      return null
  }
  // Same 40px top offset as the other grids, leaving room for a menu row later.
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div style={{ position: 'absolute', top: 40, left: 0, right: 0, bottom: 0 }}>
        {diagram}
      </div>
      {id === 'musculoskeletal' && (
        <div className="absolute left-0 right-0 top-0 px-3 pt-3 z-20 pointer-events-none">
          <div className="w-fit pointer-events-auto" onClick={e => e.stopPropagation()}>
            <MusculoskeletalMenu
              activePoint={activePoint}
              menuOpen={menuOpen}
              compact={!expanded}
              onToggle={onMenuToggle}
              onSelect={onPointSelect}
              onReset={onPointClear}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default function HeadEarPoints() {
  const [expandedId, setExpandedId] = useState(null)
  const [activePoint, setActivePoint] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)

  const tileCtx = {
    activePoint,
    // Picking the selected point again clears it, same as the ZSA areas.
    onPointSelect: name => { setMenuOpen(false); setActivePoint(p => (p === name ? null : name)) },
    onPointClear: () => setActivePoint(null),
    menuOpen,
    onMenuToggle: () => setMenuOpen(o => !o),
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
      onClick={() => menuOpen && setMenuOpen(false)}
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
