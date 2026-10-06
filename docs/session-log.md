# Session Log

Running record of development sessions, kept alongside (not instead of) git commit
history. Each entry documents what changed and why for work that hasn't been
committed yet, or where the reasoning behind a change is worth more than a commit
message can hold.

---

## 2026-09-11 — TCM Scalp Points: Scalp Areas grid

**Status: not yet committed** (uncommitted files: `src/pages/ViewerPage.jsx`,
`src/components/viewer/HeadTCMScalpAreas.jsx`,
`src/assets/diagrams/tcm-scalp-areas.svg`).

### What shipped

- **TCM system enabled.** `ViewerPage.jsx`'s `SYSTEMS` array: TCM flipped from
  `subgroups: null, available: false` to a real subgroup, `tcm-scalp-areas`
  (label "Scalp Areas", view `TCMGrid`).
- **New `HeadTCMScalpAreas.jsx`** — a 2-column × 3-row grid (`TILE_IDS =
  ['menu', 'areas', 'empty1', 'empty2', 'empty3', 'empty4']`), modeled on the
  existing `HeadBrainPoints.jsx` pattern (expand-to-modal, view transitions).
  Rows 2–3 are deliberately blank/reserved tiles for future diagrams.
- **Menu (tile 1/1):** flat, ungrouped list of the 19 TCM scalp area names
  (Motor Area, Sensory Area, Chorea and Tremor Area, ... Large Intestine
  Area — "Internal Organ Areas" sits in the list as a plain entry, not a
  header). No `tcm.json` yet, so selecting an entry only updates the trigger
  label — no InfoPanel wiring, no search, by design (data not authored yet).
- **Diagram (tile 1/2):** renders `tcm-scalp-areas.svg`.
- **App-level tile titles introduced.** Previously the diagram's title
  ("Areas in Chinese Scalp Acupuncture") was baked into the SVG artwork,
  which shrank to illegibility at small tile sizes and ate into the
  drawing's own canvas space. Added a `TILE_TITLES` map + `TILE_TITLE_CLASS`
  style constant in `HeadTCMScalpAreas.jsx`, rendered as a title row above
  the diagram (both in the grid tile and the expanded/modal view). Named and
  structured generically on purpose — the user wants this pattern lifted
  into the YNSA grid components (Basic/Sensory/Brain/Y-Points) later so
  tile titles are consistent app-wide, not just a TCM-local fix.

### Bug fixed

- `tcm-scalp-areas.svg` had a bare, unreferenced Figma artboard frame —
  `<rect x="0.5" y="0.5" width="799" height="999" stroke="#CE3F3F"/>` as the
  very first element — rendering as a visible thin red box around the whole
  diagram. Removed; nothing else referenced it.

### Known gaps / deliberately deferred

- **Duplicate title, left as-is.** With the app-level title bar added, the
  SVG's own baked-in title text now shows twice (clean header above, faint
  original still in the artwork). The user will strip it in Figma on the
  next re-export rather than have it auto-stripped here — the title isn't a
  `<text>` element (Figma flattens text to outlined paths on export), so
  removing it programmatically would mean guessing which path group is the
  title vs. the diagram by bounding box alone. Don't attempt that without
  being asked.
- **Diagram only covers 9 of the 19 listed areas.** `tcm-scalp-areas.svg`
  depicts the lateral motor/sensory/speech-line zones (Motor, Sensory,
  Chorea and Tremor, Vascular Dilation and Constriction, Vertigo and
  Hearing, Speech I/II/III, Praxis). Vision, Balance, Foot Motor and
  Sensory, and all 6 Internal Organ Areas sub-zones aren't drawn anywhere
  on this file — a second diagram will be needed for those (matches how
  real Chinese scalp acupuncture references usually split these across
  more than one view).
- **`tcm-scalp-meridians.svg`** (307KB) already sits in
  `src/assets/diagrams/` but isn't wired into anything yet — presumably for
  a future TCM tile; worth asking the user about next session.
- **No `tcm.json`.** When TCM point data is authored, the menu will need
  the same dual-ref wheel-stop dropdown + indication-search pattern the
  YNSA grids already use.

### Verified

In-browser (Chrome automation): TCM tab → Scalp Areas loads; menu opens,
scrolls without zooming the diagram, lists all 19 names in order; selecting
an area highlights it and shows the reset control; reset clears correctly;
title bar renders identically in the grid tile and the expanded modal;
YNSA Basic Points confirmed unaffected (no regression).

---

## 2026-09-12 — TCM grid: white backing, enlarged Areas diagram, Meridians tile, GV meridian

**Status: not yet committed** (uncommitted files: `src/components/viewer/HeadTCMScalpAreas.jsx`,
`src/assets/diagrams/tcm-scalp-areas.svg`, `src/assets/diagrams/tcm-scalp-meridians.svg`,
`src/data/meridians.js`).

### What shipped

- **White backing for diagram tiles.** `tcm-scalp-areas.svg` (like most
  pattern/line-art exports) assumes a white page underneath — on the app's
  theme-dependent translucent tile background it read as dark/murky. Tile 2
  (`areas`) now sits on a fixed `#ffffff` background (grid cell and expanded
  modal both), independent of app theme. Tile 1 (`menu`) was tried on the
  same white backing first, then explicitly reverted back to the original
  theme-aware dark/translucent background (`rgba(148, 163, 184, 0.06)`
  collapsed / `#111827` expanded) — matching YNSA's tile 1/1 — since it's a
  control tile, not a diagram, and the white backing was a misstep for it.
  `TRIGGER_CLASS`/`DROPDOWN_ITEM_CLASS` (menu's dropdown text) went back to
  `dark:` variants to stay legible on that theme-aware background.
- **Areas diagram enlarged.** `tcm-scalp-areas.svg`'s `viewBox` was `0 0 800
  1000`, but the actual artwork (computed from all 45 path bounding boxes,
  including stroke width and drop-shadow filter extents) only spans roughly
  x:[71,728], y:[233,926] — about 24% of the canvas height was pure empty
  margin above the drawing. Cropped to `viewBox="50 210 700 740"` (small
  safety margin kept) so the diagram fills its tile/modal much larger with
  no clipping. No JSX changes needed — the SVG is already rendered at
  `width/height: 100%`.
- **New Meridians tile at grid row 2 / column 1** (`HeadTCMScalpAreas.jsx`):
  renamed the reserved `empty1` slot to `meridians` (same grid position),
  wired up `tcm-scalp-meridians.svg`, titled "TCM Meridians on the Head" via
  `TILE_TITLES`, made it expandable with the same fixed white backing/title
  treatment as `areas`.
- **Meridians diagram cropped the same way.** `tcm-scalp-meridians.svg`'s
  `viewBox` was also `0 0 800 1000` with the actual content (33 paths + 9
  circles) spanning only x:[123,694], y:[211,920]. Cropped to
  `viewBox="100 190 620 750"`.
- **Added GV (Governing Vessel) to `src/data/meridians.js`.** The app's
  meridian list only covered the 12 primary meridians (BL, GB, HT, KI, LI,
  LV, LU, PE, SI, SP-PANC, ST, SJ) — no extraordinary vessels. A head/scalp
  meridian diagram almost always includes the Governing Vessel (runs along
  the midline over the vertex), so it needed a code with no existing match.
  Inserted alphabetically (`{ code: 'GV', name: 'Governing Vessel' }`,
  between Gallbladder and Heart) in the shared `MERIDIANS` array used by
  `HeadYPoints.jsx`'s Meridian dropdown and `NeckMeridianMap.jsx`'s point
  label.

### Naming-consistency check (meridians)

`tcm-scalp-meridians.svg` has no embedded text or ids for meridian names —
pure line/circle geometry, nothing to cross-check directly against. Checked
the app's canonical codes instead:

- Only GV was missing (now added, see above); CV (Conception Vessel) is
  still not present — add it the same way if/when a diagram needs it.
- App consistently uses **SJ** (San Jiao), not TH/TE/TB (Triple
  Heater/Energizer/Burner) — keep that convention for any future legend on
  this diagram.
- App uses the combined code **SP-PANC**, not a bare **SP** — same note.

### Known gaps / deliberately deferred

- **GV has no points wired up.** It now appears in the Meridian dropdown
  (`HeadYPoints.jsx`) but selecting it just dims every point, since no point
  ids start with `GV-` yet. Needs real Governing Vessel point data before
  it's functionally complete.
- **Meridians tile has no interactive points/legend yet** — same
  "diagram-only, no data layer" state the Areas tile started in.
- Grid row 3 (`empty3`, `empty4`) still fully reserved/blank.

## 2026-10-06 — Brain Zones: swap tiles, wire Brain Zone menu to diagram

- **Tiles swapped** (`HeadBrainZones.jsx`, `TILE_IDS = ['zones', 'zones2']`):
  `brain-zones.svg` (interactive diagram) is now grid 1/1, the
  `brain-zones2.svg` photo is 1/2 (reference only, no menu).
- **Both menus on tile 1/1**: Brain Zone and Body Part dropdowns sit side
  by side in its top-left corner. Dropdown lists are now content-width
  (`min-w-full w-max`) instead of fixed `w-60`/`w-40` wrappers.
- **Brain Zone ↔ diagram wiring** (`BrainZonesMap`, formerly
  `BrainBodyPartsMap`): `brain-zones.svg` has no ids/labels, so each
  `BRAIN_ZONES` entry got a `fill` key matching its zone path's unique fill
  colour. The colours were assigned by anatomical position, so they are
  inferred and should be checked:
  1 Visual `#9CDCEE` (occipital), 2 Association `#6ECC9D` (temporal),
  3 Motor `#FB5762` (red strip), 4 Broca `#E499D3`, 5 Auditory `#FFC76C`,
  9 Sensory `#74A0FF`, 10 Somatosensory Assoc. `#B895F5`, 11 Wernicke
  `#EAA2A3`, 12 Motor/eye `#EFF0D0`, 13 Higher Mental `#FFD7D7`,
  14 Motor/cerebellum `url(#paint0_linear_7_117)`. Brainstem (`#9F9405`)
  is not interactive.
  - Menu → diagram: the selected zone gets a pulsing amber/white outline
    traced from its path `d`, and the other zones dim to 35% opacity.
  - Diagram → menu: clicks are hit-tested with `isPointInFill`, topmost
    path first. Clicking the selected zone again clears it. Clicks outside
    any zone still expand the tile. The cursor is a pointer only over zones.
  - Body Part ellipse hit targets still take priority over the motor-strip
    zone click.
- Verified headlessly (Playwright): menu→highlight, diagram click→menu
  label, Body Part still independent, no page errors.

## 2026-10-06 (cont.) — Brain Zone info panel

- Selecting a zone (from the menu or by clicking the diagram) now opens the
  same InfoPanel the YNSA points use: the right side panel on desktop and the
  bottom sheet on mobile. The title is the zone name and the description is
  its functions. `HeadBrainZones` takes `onPointSelect` (wired from
  ViewerPage's `handlePointSelect`). `zoneToPanelItem` shapes a zone into
  `{ id, name, system: 'Brain Zones', shortDescription }`. Clearing the
  zone clears the panel.
- Function texts updated to the user's capitalization
  (e.g. "Sight, Image recognition, Image perception"). Fixed typos in the
  supplied list: "Broca's Aera" → "Broca's Area", "objsect" → "object".
  Deep layers 6–8 are still omitted.
- InfoPanel: the zone badge renders only when `point.zone` is set. Brain
  zones have none, so this avoids showing an empty pill.
