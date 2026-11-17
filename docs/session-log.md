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

---

## 2026-10-07 — YNSA category intros + Y point descriptions

### What shipped

- **Category intro texts.** New `src/data/categoryIntros.js` (keyed by
  subgroup id) holds the intro text for Basic, Sensory, Brain and Y Points.
  New `CategoryIntroLink.jsx` renders a plain underlined "About … Points"
  link at the bottom-left of each YNSA grid's tile 1/1 (Basic/Sensory/Brain
  menu tile, Y-Points "YNSA Y-Side" tile). Clicking it passes the intro to
  `onPointSelect` like any point, so it shows in the InfoPanel (desktop) /
  bottom sheet (mobile); `InfoPanel` renders `isCategory` records with
  their own layout (paragraphs + optional grouped tag list). A category
  with no entry shows no link.
- **Y point descriptions.** New `src/data/yPointInfo.js`, one entry per
  meridian (12; Governing Vessel has none), merged into all four Y point
  records per meridian in `data/points/index.js`. InfoPanel gained
  Meridian, Diagnostic Zone and Notes sections (render only when present).
  `[exact position]` placeholders were dropped and the diagnostic zone
  reads "Neck / abdominal zone", per the user.
- **Location follows the clicked side, not the meridian.** Every meridian
  has a Y point on both the Yin (in front of the ear) and Yang (behind)
  side of the diagram, so `location` and the yin/yang `side` badge are set
  per record from its polarity. The meridian line reads e.g. "Bladder (Yang
  meridian)" — TCM meridian nature, not point position. (First version put
  location on the meridian, so e.g. BL Yin showed a Yang location.)
- **Y-Points panel wiring.** `NeckDiagnosis` now takes `onPointSelect`.
  Head-diagram dots show the side-specific record; the Meridian menu and
  the neck/abdominal diagnostic maps (one dot per meridian) show a
  meridian-level record from `yPointForMeridian(code)` — same text minus
  side/location.
- **Search** now matches Y point indications; Y points are listed once per
  meridian (strong yin record only) instead of four duplicates.

### Open content questions (user to decide)

- Y Points intro says Yin points are in front of the ear and Yang points
  behind it, but the diagram has every meridian on both sides.
- Sensory intro says "four points", but the tab also shows Extra Ear
  Yin/Yang.

---

## 2026-10-07 — TCM Scalp Acupuncture intro

- Added a `tcm-scalp-areas` entry to `src/data/categoryIntros.js` (user-supplied
  text, 4 paragraphs, system badge "TCM").
- `HeadTCMScalpAreas` now takes `onPointSelect` (passed from `ViewerPage`) and
  shows an "About TCM Scalp Acupuncture" link at the bottom-left of the areas
  tile (1/1), in both the grid and the expanded view. Clicking it opens the
  intro in the InfoPanel / mobile bottom sheet, same as the YNSA intros.
- Moved Brain Zones under the TCM menu: it is now a second TCM tab
  ("Scalp Areas" | "Brain Zones"); the separate top-level "Brain Zones"
  system was removed from `SYSTEMS` in `ViewerPage.jsx`.
- Top menu order is now YNSA, TCM, Zhu's, Ear.

## 2026-10-07 — TCM grid: Motor Area Measurement diagram

- New `motor-area-measurement.svg` placed in TCM Scalp Areas tile 1/2 as a
  static diagram (no menu, no overlay), titled "Motor Area Measurement";
  tile is expandable like the others. Rendered with the areas SVG's viewBox
  (same head outline coordinates) and a menu-height spacer, so its head
  matches tile 1/1 in size and position.
- Meridians diagram moved from 1/2 to 2/1. Tile 2/2 is still empty.

## 2026-10-07 — TCM Motor Area description

- New `src/data/tcmAreaInfo.js` (keyed by TCM area name) with the user's
  Motor Area text: Location, Function, Divisions, Indications, Clinical notes.
- Selecting an area in the TCM areas tile (diagram or menu) now also sends
  its entry to the InfoPanel / bottom sheet; deselecting, or picking an
  area with no entry yet, clears the panel. The "About TCM Scalp
  Acupuncture" link clears the area selection.
- `InfoPanel` gained a `sections` layout: titled sections with paragraphs,
  a bulleted list (bold `label:` prefix) and an optional closing paragraph.
- Added user text for Sensory, Chorea and Tremor, Vascular Dilation and
  Constriction, Vertigo and Hearing, Speech I/II/III, Praxis, Vision and
  Balance Areas. All nine areas on the diagram now open a description.
  Vision and Balance are not drawn on `tcm-scalp-areas.svg`, so their
  entries aren't reachable yet.
- Added FMSA and the six Internal Organ Areas (Head, Stomach, Thoracic
  Cavity, Liver and Gallbladder, Reproductive, Large Intestine); each organ
  area ends with the shared "Internal Organ Areas" group note.
- The TCM Area menu now also lists areas that have text but aren't drawn on
  the diagram (Vision, Balance, FMSA, organ areas), after the drawn ones.
  Selecting one opens its text; nothing is highlighted.

## 2026-10-07 — TCM search

- Tile 1/1 menu row: always-visible search field (magnifier icon + input,
  no trigger button) beside the TCM Area menu, placeholder "Search by
  areas, indications". Matches area names and the phrases of each area's
  Indications section; results show the area plus the matching phrase.
  Clicking a result (or Enter for the first) selects the area like the
  menu does; the field then shows the selected result's full text (matched
  condition, or area name) and the results list closes.
  Escape clears the text; the × clears the text and the area selection
  (diagram highlight + panel). Focusing the field selects its text so
  typing starts a new search. Query state lives in HeadTCMScalpAreas so it
  carries over to the expanded tile.
- Search field is now an auto-growing textarea: it widens with its text
  (placeholder width minimum) up to the row's free space, then wraps onto
  more lines, so a picked condition is shown in full. Enter still picks the
  first result (no newline).
- TCM menu buttons (TCM Area, Meridian) now use Basic Points' trigger
  colours: black text idle, red (text-red-700) when selected/open or on hover.

## 2026-10-07 — TCM search flow applied to YNSA grids

- New shared `src/components/ui/InlineSearch.jsx` (extracted from the TCM
  search): magnifier + auto-growing field, results dropdown, full picked
  text kept in the field, select-on-focus, × clears text + selection.
- Used by TCM Scalp Areas and by Basic, Sensory, Brain and Y-Points; their
  old Search trigger buttons / dropdown-input components were removed.
- Matching per grid:
  - Basic: indications only, one result per zone ("Search by indications").
  - Sensory / Brain: point names + indications (new: name match).
  - Y-Points: meridian names + Y point indications (new: indications).
- Y-Points menu row now has right-3 so the search field can't grow past the
  tile edge.

## 2026-10-07 — TCM tile 1/2: Motor + Sensory wired

- `motor-area-measurement.svg` (user added the Sensory Area line + label)
  now has the same click/highlight overlay as tile 1/1, for Motor Area and
  Sensory Area (`MOTOR_DIAGRAM_AREAS`: line paths + label bboxes from the
  SVG). `AreasDiagram` takes `Svg`/`areas` props so both tiles share it.
- Both tiles share `activeArea`: picking Motor/Sensory in either tile, the
  TCM Area menu or search highlights it in both and opens its text. Other
  areas highlight only in 1/1.
- Tile 1/2's spacer now matches 1/1's menu row height incl. the search
  field box, keeping the heads the same size.

- Brain Zones grid is now 2x2 like TCM Scalp Areas (row 2 empty), so its
  two tiles are the same size as the Scalp Areas tiles.

## 2026-10-07 — Brain Zones menus match Scalp Areas

- Brain Zones tile 1/1 now uses Scalp Areas' layout: menu row above the
  diagram (was floating over it), menu dropdowns span the row, trigger
  text black/red.
- Added the shared InlineSearch ("Search by zones, functions"): matches zone
  names, functions phrases and TCM uses, plus body-part names. Picking a
  zone selects it (panel opens); picking a body part selects it on the
  motor strip. × clears text, zone and body part.

## 2026-10-07 — Y-Points Diagnostic Flow

- New `ynsa-neck-flow` category entry (user's 7-step Diagnostic flow) shown
  via a "Diagnostic Flow" link right of "About Y Points" in the Y-Points
  tile 1/1; same link style and InfoPanel category layout. InfoPanel
  category layout gained an optional numbered `steps` list (bold label +
  text); `CategoryIntroLink` takes an optional `className` to sit in a row.

## 2026-10-14 — TCM front diagram detail, full-size cards, orange close buttons

### TCM tile 2/2: Front Stimulation Areas
- New static tile `front` ("Front Stimulation Areas") in `HeadTCMScalpAreas.jsx`
  rendering `front-anthony-shaded.svg` (no clickable areas yet). A second
  shading variant (`front-anthony-shaded 1.svg`) was tried and rejected —
  kept the original shading; that file is not committed.
- Added detail on top of the existing shading in `front-anthony-shaded.svg`,
  each in its own group so it can be tuned or removed separately:
  - `nose-detail`: bridge side walls, nasion dip, ridge highlight, rounded
    tip, alar grooves/wings, cheek contact shadow, columella, philtrum.
  - `eye-detail`: sclera with upper-lid shadow, iris tone + limbal ring +
    radial fibres, tear duct, lash line, lower-lid rim, lid crease, inner
    corner hollow, tear trough. Drawn once for the left eye and mirrored with
    `<use transform="matrix(-1 0 0 1 505.4 -0.38)">`.
  - `mouth-detail` (end of file, over the lips): vermilion border, parting
    line, mouth corners, lower-lip highlight + shadow beneath, side hollows.
  - Lip/chin outline blur reduced (filters 10–12, 15: stdDeviation → 0.6;
    13–14: → 1) — they read as too blurred.
- Note: svgr runs with `svgo: false`, so `<use href>` and the ids survive.

### Expanded cards
- All grid views (Basic, TCM, Brain Zones, Brain Points, Sensory, Neck/Y)
  now open a card at 100% of the grid area instead of 90%; the top menu bars
  are outside the overlay and untouched.
- Backdrop click-to-close and the `zoom-out` cursor removed: with the card
  filling the area, every tap on the white diagram closed it. Cards now close
  only with the close button (or Esc, kept on purpose).

### Close / clear buttons
- Card close button: orange (`#f97316`) 44px circle, white border + shadow,
  hover grows/brightens, press shrinks.
- All `×` text glyphs replaced by a new `ui/CrossIcon.jsx` SVG cross — the
  glyph sat off-centre in the round buttons depending on the font.
- Menu-row "clear selection" buttons (were emerald) and the InlineSearch
  clear button are orange with the same hover/press effect; the side-panel
  and mobile search clear buttons and the mobile sheet close button in
  `ViewerPage.jsx` are orange too (no hover effect there yet).

### Incident
- `HeadTCMScalpAreas.jsx` was briefly mojibaked (`×` → `Ã—`) by a PowerShell
  `Get-Content`/`Set-Content` round-trip (read as ANSI, written UTF-8+BOM).
  It was restored to clean UTF-8; edit source files with encoding-safe tools.

## 2026-10-20 — ZSA areas wired up, source credit

### Text (paraphrased from Zhu's Color Atlas)
- `src/data/sources.js` (new): `SOURCES` reference list. `zhu-color-atlas`
  has the full citation from the book's copyright page (2007, ISBN
  978-0-9747178-0-7, Zhu's Neuro-Acupuncture Center, Inc.) plus a
  trademark / non-affiliation `notice`.
- `src/data/zsaAreaInfo.js` (new): `ZSA_AREA_INFO`, all 18 treatment areas
  keyed by Zhu's code, same `sections` shape as `TCM_AREA_INFO`, with the
  book's `plates` per area. Written in our own words, not quoted.
- `categoryIntros.js`: new `zsa-zones` intro ("About Zhu's Scalp Acupuncture").

### ZSA grid (`HeadZSAPoints.jsx`)
- Takes `onPointSelect` (passed from ViewerPage) like the TCM grid.
- Tile 1/1 has a menu row: hamburger (ZSA Areas / About / Case Studies)
  and a ZSA Area dropdown (all 18 areas, same look as the TCM menus).
- Area shapes on Zones 1/2/3 are clickable via `TILE_AREAS` (SVG id → area
  code); both Occipital Temporal shapes map to OT. Label/arrow groups are
  click-through. The selected area gets an amber outline and the others
  fade; the selection is shared across tiles and the expanded card.
- Auricle-Temporal (AT) isn't drawn on any diagram yet, so it's menu-only.

### InfoPanel source credit
- Entries with a `source` (category intros and sectioned entries) end with
  a "Source" block: book, edition, author, publisher, year, plates and the
  source's notice.

### Copyright note
- The book's copyright page forbids reproducing it without permission, and
  "Zhu's Scalp Acupuncture" is a trademark. Text is paraphrased and the
  diagrams are our own drawings. Before launch, consider asking
  info@scalpacupuncture.org for permission and getting IP advice.

### ZSA search (same day)
- Hamburger gained "Search by areas, indications": the shared InlineSearch,
  matching area names and Indications phrases (same splitting as the TCM
  search). Picking a result selects that area; × clears text and selection.

### About AcuMap (same day)
- `src/data/aboutApp.js` (new): `ABOUT_APP` text (pocket reference, focus on
  scalp/ear, gratitude, work in progress, disclaimer), `sections` shape.
- Viewer header: "About" link before Account opens it in the InfoPanel /
  mobile sheet. Landing page: "About AcuMap" section above Pricing, from
  the same data.
- Landing page hero/features/pricing still describe the old 3D YNSA-only
  app; not changed yet.
- Landing page rewritten for the current app: hero "Scalp and Ear
  Acupuncture in Your Pocket", four feature cards (four systems, interactive
  diagrams, search by indication, made for the clinic), pricing list updated.
  Price, trial length and "no credit card" line unchanged.

## 2026-10-22 — Ear points rewired, glass menus

### Ear: Musculoskeletal (`HeadEarPoints.jsx`)
- Rewired to the new `ear-musculoskeletal.svg`. Ankle (E) and Fingers (a
  group of five fingertip dots) now have their own ids.
- Checked against the source chart (`musculoskeletal organs.jpg`): the two
  Inner Ear ids are swapped in Figma, so the code maps the boxed square
  `Inner Ear (C)` to Inner Ear (E) and the lobe dot `Inner Ear` to
  Inner Ear (C).
- Skin Disorder (C)/(E) moved to Other Ear Points in `ear-acupoints.txt`
  and dropped from the dropdown.
- Cervical Spine (the spine segment) and Cervical Spine Point (the dot) are
  now separate entries. 42 points, all drawn.

### Ear: Internal Organs
- Tile 2/1 shows `ear-internal-organs.svg` (new) with clickable points and
  a grouped dropdown (Digestive, Cardiorespiratory, Urogenital).
- List fixes in `ear-acupoints.txt`: count was 30, really 24; "Internal
  Genitals (C)" is External Genitals (C) (helix rim). San Jiao moved to
  Other Ear Points. Small/Large Intestine are singular. 23 points, all drawn.
- The Musculoskeletal menu/diagram became `PointMenu`/`PointDiagram`, driven
  by `POINT_TILES`. Selection and open dropdown are kept per tile.

### Glass menus (all grids)
- `src/components/ui/menuStyles.js` (new): `GLASS_TRIGGER` (frosted acrylic
  teal button), `GLASS_STRIP` (same finish for tile titles), `GLASS_DROPDOWN`
  (60% see-through, blurred panel).
- Used by the menu buttons and dropdowns in the YNSA, TCM, ZSA and Ear grids,
  the hamburger button and its dropdown, the search results dropdown and
  `TileTitle`.
- `src/components/ui/MenuSizer.jsx` (new): invisible copy of a menu's labels
  that makes the button (and dropdown) as wide as the longest label. Name-only
  menus share one width for button and dropdown; Basic/Sensory/Brain Points
  keep a row-wide dropdown for their descriptions. YNSA buttons lost their
  fixed `w-28`, so long names are no longer cut off.

## 2026-11-02 — Ear: Chinese Auriculotherapy on ear-chin-3.svg

### Ear tile 1/1 (`HeadEarPoints.jsx`)
- The Chinese Auriculotherapy tile now uses `ear-chin-3.svg` (new) instead of
  `ear-tcm-2.svg` (left in the repo, unused). Same 1207x1249 page, same crop.
- `MASTER_SVG_IDS` rewritten for the new drawing: 102 ids, 94 of the 152
  points are now on the diagram. Figma typos are mapped in `MASTER_RENAMES`
  (Symphatic, Siatic, Duodendum, Diaphram, Bilary Duct, Large Auricular Nerv,
  Appex of the Tragus, ...). Rheumatic Line joins the grooves as a line point.
  "...Area" ids are groups (shaded zones) and select as one.
- Choices to confirm later:
  - the cavum concha dot `Heart Point` maps to Heart Point (Special), so
    Heart (Zang Fu) is not on the diagram;
  - `Tripple Heater Point` and `San Jiao` are different dots: San Jiao maps
    to Sanjiao, Triple Heater Point was added to
    `AURICULOTHERAPY_UNCATEGORISED`;
  - Abdominal Distention Area maps to Abdominal Area;
  - Helix 4/5/6 all select "Helix 1-6";
  - `Hip_2` and `External Knee_2` may be Figma duplicates;
  - `Line 16` (grey dashed, antihelix) is treated as decoration.
- Groove of Hypertension vs Hypotension is still open.

### Ear dropdowns
- Removed the "(not on diagram)" suffix from all ear menus. It made the
  MenuSizer-sized button so wide that on phones it covered the tile's (X)
  close button. Undrawn points are still listed, greyed and unclickable.

---

## 2026-11-03 — Ear Description & Formulas, phone fixes, installable app, feedback form

**Status: committed and pushed** (`b03aa6f` … `15f77e4` on master).

### Auriculotherapy: Description and Formulas tabs
- New subgroups `ear-description` and `ear-formulas` (views `EarDescription`,
  `EarFormulas`), rendered outside `ZoomableView` as scrolling pages
  (`src/components/viewer/EarGuide.jsx`).
- Text condensed from Li-Chun Huang's *Auriculotherapy Diagnosis and
  Treatment*, Sections V and VI (`src/data/earGuide.js`). Source docx:
  `OneDrive/Documents/Auriculotherapy/Li-Chun Book/Section V VI.docx`.
  - Description: intro, "reading the ear", the six point groups with key
    points, safety note.
  - Formulas: 46 formulas in 7 families (Strengthening + Invigorating merged,
    Fever under Resisting), core points, short add-ons, key terms.
- Formulas page: searchable dropdown, then details (numbered points, add-ons)
  and the Chinese Auriculotherapy ear (`ear-chin-3.svg`). The formula's points
  stay bright with numbered amber badges and every one gets a name label
  (fine black frame, see-through white). Labels avoid badges, dots and each
  other, with a leader line if moved. Tapping a point pulses it and turns its
  label red.
- `DIAGRAM_NAMES` in EarGuide.jsx maps formula names to diagram names
  (Sympathetic → "Sympathetic (sympathy)", Subcortex variants → Subcortex…).
  `pointCentre` and `TCM_VIEWBOX` are now exported from HeadEarPoints.jsx.
- **Not drawn on the ear yet** (shown as "not on diagram"): Heart, Occiput,
  Ear Apex, Subcortex, Mouth, Forehead, Allergy Area, Pancreas, Pancreas
  Point, Lower BP Point, Ascites Point, Constipation Point, Cymba Concha
  Centre, Urethra, Rectum, Throat, Internal Nose, Ovary, Internal Genitals,
  Brain, Cardia, Neurasthenia Area, Lesser Occipital Nerve. They get numbers
  and labels automatically once drawn in the SVG with matching ids.
- Phone bug fixed: in the stacked layout the diagram had only a min-height,
  so its `h-full` child collapsed to 0. It now has a fixed `h-[75vh]` below `md`.

### References and side panel
- `SOURCES['huang-auriculotherapy']`: "Dr Li-Chun Huang, MD, O.M.D.".
- Credits now read "Reference: <title> by <author>" (EarGuide) and
  "REFERENCE / <title> (edition) by author, publisher, year." (InfoPanel).
  "See plates C4" removed. Plate codes are still stored in zsaAreaInfo.js.
- InfoPanel `emptyHint` prop: the "Click a point…" placeholder shows in YNSA
  only. The "Gold points… subscription" line is removed everywhere.

### Top bar (phones)
- `shortLabel: 'Auriculo'` on the ear system. The top bar uses it, the tabs keep
  "Auriculotherapy".
- Below `md`, About / Feedback / Account / Sign out sit in a `HamburgerMenu`
  at the right of the top bar. Desktop keeps the text links (plus Feedback).
  This removed the sideways page scroll on phones.

### Installable app (PWA)
- `index.html`: title "AcuMap", `theme-color #63ECE1`, manifest and
  apple-touch-icon links.
- `public/manifest.webmanifest`: standalone, start `/viewer`, 192/512 icons
  (512 also maskable).
- New icon: dark-teal "A" with a red acupoint dot on teal (`icon.svg`).
  `favicon.svg` (was the default Vite logo) is now the same design with
  rounded corners. The PNGs were rendered with headless Edge, because no image
  libraries are installed.
- Android: ⋮ → Install app gives a full-screen app. Remove old shortcuts first.

### Feedback form
- Menu item "Feedback" opens `src/components/ui/FeedbackForm.jsx`, which is
  full screen on phones and a card on desktop. Questions are in
  `src/data/feedbackForm.js` (12 questions, only the overall stars are
  required). Answers are saved by question id, so keep ids stable.
- `POST /api/feedback` (`server/routes/feedback.js`) works without an account.
  The viewer is public, and the first version, which required a session,
  failed with "Not authenticated". A signed-in user's email is attached.
  Otherwise an optional email is asked for when contact = Yes. Spam guard:
  5 per IP per hour (in memory) plus a hidden `website` honeypot field.
- New Prisma model `Feedback` (rating, answers Json, context Json, email,
  userId). Read it in Railway → Postgres → Data → Feedback.

### Deploy / environment notes
- Schema changes reach the database through `railway.toml`
  `preDeployCommand = "npx prisma db push"`. A duplicate db push briefly
  added to `npm start` was removed (`d2a5784`).
- From this PC, `npm run db:push` (P1001) and `railway link` ("invalid peer
  certificate: UnknownIssuer") both fail. This is most likely Norton HTTPS
  scanning intercepting TLS. TCP to the DB proxy is reachable. Use the
  Railway dashboard instead, or add a Norton exception for railway.com /
  rlwy.net.

### Open items
- Draw the missing formula points on `ear-chin-3.svg`.
- Optional: show ZSA plate codes again as "Book plates: …".

---

## 2026-11-10 — ear-chin-3.svg re-export rewired, Drunk Point added

**Status: not yet committed** (changed: `src/assets/diagrams/ear-chin-3.svg`
(re-exported from Figma), `src/data/earPoints.js`,
`src/data/earAuriculotherapy.js`).

### What changed
- The user drew about 40 more points in Figma and re-exported
  `ear-chin-3.svg`. `MASTER_SVG_IDS` in `earPoints.js` now maps all of them.
  The click, highlight, search and formula-number code all read from this
  one map, so no component changes were needed.
- **New IDs that match the point name exactly:** Occiput, Forehead, Parotid
  Gland, Neurasthenia Area, External Sympathetic, Rectum, Anus, Urethra, Ovary,
  Ear Apex, Hepatitis Point, Groin, Adnexa, Internal Genitals, Mouth,
  Esophagus, Liver Yang, Ascites Point, Throat, Allergic Area.
- **New renames in `MASTER_RENAMES` (Figma ID → point name):**
  Nevous Subcortex → Subcortex · Nephritid Point → Nephritis Point ·
  Lesser Optical Nerve → Lesser Occipital Nerve Point · Decrease BP Point →
  Decrease Blood Pressure Point · Pelvis → Pelvic Cavity · Cervix → Cervix
  Uteri · Constipation → Constipation Point · External Genital → External
  Genitals · Sympathetic → Sympathetic (sympathy) · Thoracic/Lumbar/Sacral
  Spine → Thoracic/Lumbar/Sacral Vertebrae · Cervicall Spine → Cervix
  Vertebrae · `Helix  1`–`Helix  3` (the IDs have a double space) → Helix 1-6
  · Stomach_2 → Stomach.
- **Removed:** `Symphatic` (renamed to Sympathetic in Figma) and `Hip_2` (no
  longer in the export). Buttocks (Hip) now has only one dot.
- **Drunk Point** was drawn but wasn't in the point list. It is now in
  Special Points in `earAuriculotherapy.js` and mapped in `earPoints.js`.
  Huang's book has no entry for it, so it shows no info card (the same as
  Anxious Point and Triple Heater Point).
- `Spine` and `Nervous system` are wrapper groups in Figma, not points, so
  they are left unmapped.
- A script checked that every mapped ID exists in the SVG and every name is
  in the point list. `vite build` passes.

### Notes / open items
- Cervix Vertebrae is now drawn twice: the new `Cervicall Spine` segment and
  the old `Cervical Vertebrae Area` zone. The segment comes first in the map,
  so it carries the marker. Delete the old zone in Figma if it is left over.
- Still not drawn (19): Auricular Temporal Nerve, Brain, Cardiac, Cymba Concha
  Centre, Epilepsy Point, Groove on Back of the Auricle (probably posterior),
  Heart, Hepatomegaly Area, Internal Nose, Larynx and Tooth, Pancreas,
  Pancreas Point, Rib Rim, Sacroiliac Articulation, Specific Area I/II of
  Tumour, Splenomegaly Area, Tubercular Point, Vertex.
- Drunk Point needs description text if a card is wanted.
- Not yet clicked through in the browser.

---

## 2026-11-11 — Ear menu clean-up: Helix split, undrawn points removed, re-export wired

**Status: not yet committed** (changed files: `src/data/earAuriculotherapy.js`,
`src/data/earAuriculotherapyInfo.js`, `src/data/earPoints.js`,
`src/data/earGuide.js`, `src/components/viewer/EarGuide.jsx`,
`src/assets/diagrams/ear-chin-3.svg`).

### What shipped

- **Helix 1-6 split into Helix 1 … Helix 6.** Each helix dot now selects its
  own menu entry (Back of the Auricle). `earAuriculotherapyInfo.js` has six
  entries (`EAR-CN-helix-1` … `-6`) with the same text as the old combined
  entry. In the Formulas guide, "Helix 1–6" stays one point: `EarGuide.jsx`
  has a `GROUPS` map that groups the six dots, so one number covers all six.
- **Removed from the menu** (not on the diagram): Auricular Temporal Nerve,
  Brain, Cymba Concha Centre, Groove on Back of the Auricle, Hepatomegaly Area,
  Larynx and Tooth, Pancreas Point, Rib Rim, Sacroiliac Articulation, Specific
  Area I and II of Tumour, Splenomegaly Area, Tubercular Point, Vertex, and
  Heart Point (its dot was renamed to Heart in Figma). Their info text is still
  in `earAuriculotherapyInfo.js` but nothing shows it.
- **External Sympathetic** is now only in Nervous System (removed from Body
  Parts).
- **ear-chin-3.svg re-exported** with five new dots: Cardiac, Heart, Internal
  Nose, Epilepsy Point and Pancreas. These are now in `MASTER_SVG_IDS`. Layers
  renamed in Figma, with the map updated to match: Heart Point → Heart,
  Cervicall Spine → Cervical Spine, External Genital → External Genitals,
  Decrease BP Point → Decrease Blood Pressure Point, Nephritid Point →
  Nephritis Point, Lesser Optical Nerve → Lesser Occipital Nerve Point. The
  renames that were no longer needed are gone from `MASTER_RENAMES`.
- **Formulas (`earGuide.js`):** Heart Point removed from "Slowing the heart
  rate" and "Improving circulation". Brain removed from "Memory & focus", which
  already had Brain Point.
- A script checked that every mapped ID exists in the SVG and every menu point
  has a dot. Every menu point now has a dot.
- Menu count: 143 different points. Nervous System 16, Endocrine 8, Special
  Points 19, Zang Fu 11, Body Parts 67, Back of the Auricle 19, plus 2 with no
  category (Anxious Point, Triple Heater Point).

### Notes / open items
- The six Helix info cards have the same text. Give them their own text if the
  source has it.
- Remove the unused info entries for the removed points if they won't come
  back.
- `vite build` passed after the re-export wiring. The later menu and formula
  edits were not rebuilt.
- Not yet clicked through in the browser.

---

## 2026-11-13 — Chinese Auriculotherapy: clickable points on the Turned view

**Status: not yet committed** (changed files: `src/assets/diagrams/ear-11.svg`,
`src/data/earPoints.js`, `src/components/viewer/HeadEarPoints.jsx`).

### What shipped

- **ear-11.svg re-exported** with point layers. The first export had only the
  drawing (generic `Vector N` shapes), so nothing could be wired. The diagram
  shows a selection of the tile's points, not all of them.
- **`TURNED_SVG_IDS` in `earPoints.js`:** the 21 point layers in ear-11.svg.
  Their Figma ids are the same as in ear-chin-3.svg, so they map through
  `MASTER_SVG_IDS` and get the same menu names and info cards ("Nevous
  Subcortex" → Subcortex, "Tripple Heater Point" → Triple Heater Point, as on
  the main view). A grep check confirmed every id is in the master list.
  - "points hiiden" group (blue, hidden behind the turned concha): Throat,
    Brainstem, Brain Point, Thalamus, Epilepsy Point, Subcortex, Internal Nose.
  - Inferior concha: Heart, Triple Heater Point, Spleen, Lung (2 dots), San
    Jiao, Bronchus (2 dots), Trachea, Endocrine.
  - Superior concha: Stomach, Cardiac, Esophagus, Mouth.
- **`HeadEarPoints.jsx`:** new `TURNED_POINTS` (same shape as
  `POSTERIOR_POINTS`); the "Turned view" entry in `EXTRA_VIEWS.master` now has
  `points: TURNED_POINTS`, so its dots are clickable with the pulsing ring and
  label.
- **View switching (existing `pointView` logic):** picking a menu point while on
  the Turned view stays there if the view draws it, otherwise jumps to the main
  diagram. On the main diagram it stays put, since all 21 points are drawn there
  too.

### Notes / open items
- `vite build` passed. ESLint's two `react-refresh/only-export-components`
  errors in `HeadEarPoints.jsx` (`pointCentre`, `TCM_VIEWBOX` exports) were
  already there before this change.
- Not yet clicked through in the browser. Check the blue points especially.

---

## 2026-11-14 — Western Auriculotherapy card + diagram filtering

**Status: committed** (changed files: `src/assets/diagrams/western-ear-complet.svg`
(new), `src/data/earPoints.js`, `src/data/earAuriculotherapy.js`,
`src/components/viewer/HeadEarPoints.jsx`).

### What shipped

- **New card "Western Auriculotherapy"** replaces the bottom-right
  placeholder (tile id `neuroendocrine` → `western`; `ear-basic.svg` no longer
  used). Diagram: `western-ear-complet.svg` (1200x1200 page, cropped with
  `WESTERN_VIEWBOX` {260, 60, 720, 1090}); already has a white backing rect.
- **Points (`earPoints.js`):** `WESTERN_SVG_IDS` = `MSK_SVG_IDS` + `ORG_SVG_IDS`
  (same Figma ids/typos) + neuroendocrine ids. New `ENDOCRINE_POINTS`,
  `NERVOUS_POINTS`, `WESTERN_CATEGORIES` (Musculoskeletal, Internal Organs,
  Endocrine, Nervous System), `WESTERN_POINTS` (A-Z with categories); added to
  `EAR_SEARCH_INDEX`. Figma typo renames: `Brain Stem (C)`, `Hippocamus (Memory`,
  `Amygdala (Agressiveness)`, `Sciatic Nerv`, `Lesser Occipital Nerve`
  (→ "... - Wind Stream (C)").
  - **Uterus (C) is not in the SVG** → greyed out in the menu.
- **Menu:** same searchable menu as the Chinese card. `SearchablePanel` /
  `SearchablePointMenu` now read `tile.points` / `tile.categories` instead of
  the hard-coded Chinese lists; the selected category is kept per tile.
- **Diagram filtering (both Chinese and Western cards, `filterDiagram: true`):**
  - Category filter hides the other categories' points; All shows everything.
    Applies to the Chinese card's Turned/Posterior views too; the wide click
    copies of thin lines are hidden with their line.
  - A point picked from the menu (list, search, Enter) or from the viewer's
    search panel is shown **alone**. Clicking a point on the ear keeps the
    old fade. Picking a category, clearing, or re-picking the point resets it.
  - Category point Sets are built once (`tile.categoryPoints`) — a new Set per
    render would loop PointDiagram's effect via `setMarker`.
- **Homunculus on the Western card:** off by default; turns on automatically
  while the Musculoskeletal filter or a musculoskeletal point is selected
  (`layerAuto`). The manual toggle overrides until the automatic state next
  changes. Musculoskeletal card unchanged (homunculus on).
- **Chinese categories:** Tragic Apex, Vision I, Vision II moved from Back of
  the Auricle to Body Parts (they're on the front of the ear).

### Notes / open items
- `vite build` passed. The two existing ESLint `react-refresh` errors remain.
- Checked in the browser: crop, Endocrine filter (Western and Chinese),
  homunculus auto-on with Musculoskeletal. Not clicked through: solo point on
  menu pick, Back of Ear / Body Parts after the category move.

---

## 2026-11-15 — Western point texts, Ear Seeds tab, two-card ear grid, Cases

**Status: committed.**

### Western Auriculotherapy point texts
- New `src/data/earWesternInfo.js` (84 points: musculoskeletal, internal organ,
  endocrine, nervous system), **generated** by
  `scripts/build_ear_western_info.py`. Edit the table there and re-run
  `python scripts/build_ear_western_info.py`; don't hand-edit the .js.
- Original wording (copyright-free), from commonly taught Nogier / Chinese-map
  facts — not quoted from a book, so no `source` / Reference line.
- Sections: Location, Functions & Uses ("Common uses"), Note on (C)/(E) pairs.
  **28 points have no Location** (most (E) points, Master Shoulder, Lumbago, TMJ,
  Muscle Relaxation, pituitary hormones, Pineal, brain points) — to fill from
  the Oleson chart. Uses need a clinical read-through.
- The 14 "Other Ear Points" in ear-acupoints.txt have no texts yet.
- New `src/data/earPointInfo.js`: `earPointInfo(tile, name)` returns Huang's
  card for the Chinese tile, the Western card otherwise. Used by
  `HeadEarPoints.jsx` and the viewer search (`ViewerPage.jsx`). Kept out of the
  component file so ESLint's react-refresh rule stays happy.

### Chinese Auriculotherapy renames (follow the re-exported ear-chin-3.svg)
- **Pancreas → Pancreas / Gallbladder** (Figma id `Pancreas / Gallbladder`):
  point list, `MASTER_SVG_IDS`, info card key/name, formula name map in
  `EarGuide.jsx` (`'Pancreas'` → it), `build_ear_info.py` alias (book heading
  "Pancreas"). The separate Gall Bladder point (id `Gallbladder`) is unchanged.
- **Sympathetic (sympathy) → Sympathetic Nerve** (Figma id `Sympathetic Nerve`):
  point list, info card, formula map (`'Sympathetic'` → it), build-script alias.
  The id now equals the name, so its `MASTER_RENAMES` entry was removed.

### Ear Seeds tab (Auriculotherapy → Ear Seeds)
- Beginner / home self-treatment version of the formulas, from
  `docs/Ear Seeds.docx` (text shortened and rephrased). Data in
  `src/data/earSeeds.js`: `EAR_SEEDS_GUIDE` (intro, benefits, supplies, how to
  apply, daily care, precautions), `EAR_SEEDS_SAFETY`, `EAR_SEED_FORMULAS`.
- Dropped the docx's absolute claims ("No side effects", "Safe"); Diabetes
  formula has a "support only, don't change medication" note.
- **23 formulas** in 5 families: Well-being, Head & senses, Digestion &
  metabolism, Women's health, Pain. Edits from the docx list:
  Anterior Ear Lobe → Neurasthenia Point; Headache / Migraine + Shenmen,
  Temple, Forehead, Occiput; Menstrual Cramps and Menopause merged;
  Lumbosacral Vertebrae split into Lumbar + Sacral Vertebrae; "Internal
  Genital" typo fixed; added Back Pain, Sore Throat, Cold / Flu, Allergies,
  Toothache.
- Point names map to diagram names in `EarGuide.jsx` `DIAGRAM_NAMES`
  (new: Eye Disorder 1/2 → Vision I/II, Cervical Vertebrae → Cervix Vertebrae).
  Checked: every Ear Seeds point is on the Chinese diagram.
- `EarGuide.jsx`: the Formulas page became a shared `FormulaPage({ formulas,
  intro, footer })`; `EarFormulas` and the new `EarSeeds` both use it. Ear
  Seeds shows the guide until a formula is picked, then a care reminder.
- `ViewerPage.jsx`: new subgroup `ear-seeds` / view `EarSeeds`.

### Formula diagrams show only the formula's points
- Formulas and Ear Seeds: once a formula is picked, the other points are hidden
  (`display: none`) instead of faded to 20%. Before a pick, all points show.

### Ear Points grid: two cards
- Removed the Musculoskeletal and Internal Organ cards. Grid is one row:
  Chinese Auriculotherapy | Western Auriculotherapy (`TILE_IDS`,
  `gridTemplateRows: '1fr'`). Their entries are gone from `TILE_TITLES`,
  `DRAWN` and `EAR_SEARCH_INDEX`.
- `MSK_GROUPS` / `ORG_GROUPS` / `*_SVG_IDS` stay — the Western card uses them.
- Removed dead code: the group-based `PointMenu`, `MSK_VIEWBOX`, the
  `searchable` flag (every tile is searchable now).
- Deleted `src/assets/diagrams/ear-musculoskeletal.svg` and
  `ear-internal-organs.svg` (unreferenced; still in git history if ever needed).

### Notes / open items
- `vite build` passes. ESLint: the two old `react-refresh` errors in
  `HeadEarPoints.jsx` (`pointCentre`, `TCM_VIEWBOX`) and four
  `react-hooks/static-components` errors in `ViewerPage.jsx` remain (pre-existing).
### Cases: 12 more articles from Chen Decheng's single-point book
- New source `chen-single-point` in `sources.js`: *100 Diseases Treated by
  Single Point of Acupuncture and Moxibustion*, Chen Decheng, Foreign Languages
  Press, Beijing, 2001. Set on **all 15 articles** (Headache, Stiff Neck and
  Cervical Spondylosis are its sections 1.1, 1.6, 1.7).
- Stiff Neck (GB 39 / SI 3) and Cervical Spondylosis (Chengshanxia) added from
  `docs/Cases.docx`; then sections 1.10–1.21 from the PDF: Tennis Elbow,
  Sprain of Wrist and Ankle, Shoulder and Back Pain, Intercostal Neuralgia,
  Lumbar Transverse Process Syndrome, Acute Lumbar Muscle Sprain, Chronic
  Lumbar Muscle Strain, Sciatica, Pain in Lower Back and Leg, Heel Pain, Knee
  Pain, General Pain. Condensed in our own words, same shape as Headache.
- Editorial choices: patient names dropped; musk removed from the Tennis Elbow
  moxibustion; General Pain's "four times more potent than any analgesic"
  claim dropped; Xiyan named "Xiyan – Eyes of the Knee"; Stiff Neck GB 39
  total corrected 74 → 47 (sum of its breakdown).
- Results whose breakdown doesn't match the stated total are kept as printed
  and marked "(figures as published)": Tennis Elbow moxa (100 vs 105),
  Shoulder and Back Pain (246 vs 264), Sciatica (44 vs 40), Knee Pain
  (146 vs 153), General Pain (87 vs 107). To check against the print book.
- `CasesPage.jsx`: point `code` is optional (Ashi / relative points); the
  Reference line adds publisher and year.
- **Point safety warnings:** `POINT_WARNINGS` in `cases.js` — `danger`
  ("Dangerous point - requires extra caution") and `shallow` ("Deep needling
  contraindicated - shallow insertion only"); a point lists them in
  `warnings`. Shown under the point name with a yellow "!" triangle
  (`WarningIcon`); the case list shows a small triangle on articles that have
  one. Marked: Fengchi GB 20 (danger), Shangshandian (danger + shallow),
  Pigen EX-B 4 (danger), Xiyan EX-LE 5 (danger).

### Notes / open items (continued)
- Not checked in the browser: Western info cards, Ear Seeds tab, two-card grid,
  hidden points on formula diagrams (check that the ear outline still shows),
  new Cases articles and warning icons.

---

## 2026-11-16 — Phone fixes, TCM meridian points, per-tab search, ear Indications

**Status: committed and pushed** (`6994491`, `0bf919d`, `4af0cff`, `ce3de17`,
`e6d6534`, `a44de67`, `f963f5a`).

### Ear formulas and Chinese ear on phones
- `EarGuide.jsx` `FormulaPage`: on phones (< 768px, stacked layout) picking a
  formula glides the page to the diagram at the bottom (~1.2 s ease-in-out,
  rAF). A touch or wheel cancels it, so the page stays scrollable.
- `FormulaDiagram` sits in a frame with the crop's exact aspect ratio
  (container-query units) and `overflow: hidden`. Before, a phone-shaped card
  showed parts of the full 1207×1249 page beyond the crop.
- `TCM_VIEWBOX` (`HeadEarPoints.jsx`) widened to `255 50 740 1162`: the ear
  drawing spans x≈271–977, and the old crop (x from 285) cut its left edge.
  Shared by the Chinese ear in the main viewer and the formula diagrams.
- `pointCentre` no longer uses `getScreenCTM`. It walks the element's own
  `transform`s up to the root `<svg>`. On a phone the Thoracic Vertebrae
  marker sat off the diagram, though it looked right in desktop Chrome; the
  user confirmed the fix on the phone.

### TCM Meridians on the Head: points
- `tcm-scalp-meridians.svg` re-exported with ids: lines `BL`, `GB`, `ST`,
  `SI`, `TB`, `LI`, `CV`, `GV`; point layers `"BL 1"`…, Governing Vessel as
  `"DU n"`. Some point groups hold stacked duplicate circles at one spot,
  which is harmless.
- `HeadTCMScalpAreas.jsx`: `TCM_MERIDIANS` lists each meridian's point
  numbers; `svgPrefix` / `svgLine` map the SVG's `DU` / `TB` names, and either
  name is accepted. Lines are now found by id, not stroke colour. In the new
  export SI's line is blue-violet `#5D4EE3` and TB/SJ's is red `#CB4C4E`
  (dots `#F40A1A`); worth a check.
- Meridian menu: each meridian followed by its points, indented, e.g.
  `GB 20 Fengchi`. A point selects its meridian too. The diagram veils the
  rest, redraws that meridian's points on top, and pulses the point with a
  short label. Dots are tappable (r=10 hit circles).
- 69 points: BL 1–10, GB 1–21, ST 1–8, SI 16–19, SJ 16–23, LI 18–20,
  CV 23–24, GV 15–27. The point lists are typed into `TCM_MERIDIANS`; update
  them if points are added in Figma (GB 21 was added this way).
- **Convention:** app text uses **GV / CV** and **SJ "Triple Heater"** (not
  DU / REN / TB), matching the YNSA meridian list. The SVG legend label "TB"
  should be changed to SJ in Figma; layer names can stay.

### Meridian point descriptions
- New `src/data/tcmMeridianPointInfo.js`: all 69 points as InfoPanel
  `sections` entries. Name `"GB 20 Fengchi"`, `subtitle` with the English
  name, badge with the meridian, then Location (WHO standard positions),
  Actions, Indications, and Caution for needling-risk points (BL 1, ST 1,
  BL 10, GB 20, GV 15, GV 16, LI 18, SI 17, GV 22, GB 21, …).
- Written by Claude from standard TCM references, in our own words, with **no
  book source**, at the user's choice. **Needs a clinical read-through**,
  especially Locations and Cautions.
- `InfoPanel.jsx`: sectioned entries show an optional italic `subtitle`
  under the title.

### Search per tab
- The side-panel / mobile search now searches the active tab
  (`SEARCH_BY_SYSTEM` in `ViewerPage.jsx` sets placeholder and hint per tab):
  - **TCM:** scalp areas, meridian points (code, `GB20`, pinyin, English,
    meridian, actions, indications) and brain zones.
  - **ZSA:** areas by name, code, functions and indications.
  - **Auriculotherapy:** as before, plus indications (see below).
  - **YNSA:** unchanged. **Cases:** keeps its own list search.
- New `src/data/systemSearch.js`: `TCM_SEARCH`, `ZSA_SEARCH`,
  `searchEntries` (name / alias matches first, then the matching phrase) and
  `phrases()`. `HeadBrainZones.jsx` now exports `BRAIN_ZONES`,
  `BRAIN_ZONE_TCM` and `zoneToPanelItem` for it.
- Picking a TCM / ZSA result sets `gridPick` (`{ subgroup, kind, key, n }`),
  switches sub-tab if needed, and the grid selects it through its new `pick`
  prop (`HeadTCMScalpAreas`, `HeadBrainZones`, `HeadZSAPoints`).

### Ear points: Indications instead of Functions & Uses
- `earAuriculotherapyInfo.js` (155) and `earWesternInfo.js` (84): the
  "Functions & Uses" section is now **Indications**. Wording is kept and the
  redundant "Common uses" label dropped. For the 13 Chinese points with
  "Actions" items, those move to their own **Actions** section above. Other
  topic labels ("Sleep:", "Airways:", …) stay.
- Both generators updated. `build_ear_western_info.py` re-run (reproduces
  its file exactly).
- **Do not re-run `build_ear_info.py`**: it has drifted from
  `earAuriculotherapyInfo.js` (134 entries generated vs 155 in the file), so
  that file was changed directly.
- Ear search indexes each point's Indications phrases. A result shows just
  the matching phrase, e.g. "Hip Joint — sciatica".
- An automatic split into short YNSA-style items was tried and dropped: it
  garbled indications. A hand rewrite in batches is still possible.

### Notes / open items
- Brain Zones TCM text (`BRAIN_ZONE_TCM`) still says `DU20`, `DU17`, `TB21`…;
  to switch to GV / SJ if wanted.
- Checked in desktop Chrome: meridian menu, dots, info panel, all four tab
  searches and result picks. On phones only the marker fix was confirmed
  (by the user).
- `vite build` passes. A dev-only fast-refresh warning is expected from
  `HeadBrainZones.jsx` now exporting non-components.

---

## 2026-11-17 — TCM Meridians tile: magnifier

**Status: not yet committed** (files: `src/components/viewer/Magnifier.jsx`
(new), `src/components/viewer/HeadEarPoints.jsx`,
`src/components/viewer/HeadTCMScalpAreas.jsx`).

### Magnifier on "TCM Meridians on the Head" (TCM card 2/1)
- Same magnifier as the Auriculotherapy cards: −/+ slider (1×–2×) at the
  bottom left, orange × to reset, drag to pan while zoomed. A drag doesn't
  expand the tile or select a point.
- The zoom is shared by the tile and its expanded view
  (`meridianView` state in `HeadTCMScalpAreas`). It resets with the viewer's
  reset (remount).
- The selected point's pulsing ring and name label are divided by the zoom,
  so they stay the same size on screen. The label is kept inside the visible
  window. Lines and dots scale with the diagram.
- Unlike the ear cards, no strip is reserved under the diagram for the
  slider. It floats over the bottom-left corner so the head stays the same
  size as in the other three TCM tiles.

### Shared `Magnifier.jsx`
- `MagnifiedDiagram`, `ZoomSlider`, `defaultView`, `clampView` (plus
  `DRAG_SLOP`, `MAX_ZOOM`) moved out of `HeadEarPoints.jsx` unchanged. Both
  grids import them; the ear cards behave as before.
- `MERIDIANS_VIEWBOX` string replaced by `MERIDIANS_BOX`
  `{ x: 66.83, y: 211, w: 689, h: 719 }`.

### Fix: selection veil didn't cover the whole card when zoomed
- Symptom: with a meridian point selected and the diagram magnified, the
  white veil covered only part of the card. Panning showed bright,
  unveiled areas.
- Cause: the tile's aspect differs from the diagram's, so the SVG also draws
  outside its viewBox (letterbox bands). The veil and its mask were sized to
  the viewBox only.
- Fix: `SelectionHighlight` now extends the veil and mask (`maskUnits=
  "userSpaceOnUse"`) by 2× the viewBox's larger side on every side. It is
  shared by all four TCM tiles, so any unveiled edges there are covered too.
- Confirmed working by the user.

### Notes
- `vite build` passes. ESLint shows the usual fast-refresh warning for
  `Magnifier.jsx` exporting helper functions, the same kind
  `HeadEarPoints.jsx` already had.

---

## 2026-11-17 (cont.) — Brain Zones fixes, guest limit for the beta

**Status: committed** (files: `src/components/viewer/HeadBrainZones.jsx`,
`src/hooks/useGuestAllowance.js` (new), `src/components/ui/SignupGate.jsx`
(new), `src/pages/ViewerPage.jsx`, `src/components/viewer/CasesPage.jsx`).

### Brain Zones (TCM)
- **Close (X) on card 1/1 didn't work.** The zones tile's menu row spans the
  full width at `z-20` and covered the button (`zIndex: 1`), swallowing its
  clicks. The button is now `zIndex: 30`.
- **Card 1/2 ("Brain Zones", `brain-zones2.svg`) removed.** `TILE_IDS` is
  just `['zones']`; the grid stays 2x2 so card 1/1 keeps its size. The SVG
  file is still in `src/assets/diagrams/` but no longer used.

### Guest limit (early-tester beta)
Plan: share app.acumap.net on Facebook; visitors use the viewer straight
away and are asked to create a free account (no card) after a while.
Testers are counted from the users table. No paid subscription is
mentioned anywhere in the app for now.
- **20 free point descriptions** for visitors without an account
  (`GUEST_POINT_LIMIT` in `useGuestAllowance.js`). Counted per different
  point (`system|id or name`), from diagrams and search alike; re-opening a
  seen point is free. About and the category intros don't count.
- Stored in `localStorage` (`acumap.guestPoints`), so clearing browser data
  resets it — a nudge, not a lock. `isGuest` is `user === null`, so nobody
  is stopped while the login check is still loading.
- From 5 left (`GUEST_WARN_AT`), a note above the description: "N free
  descriptions left. Create a free account to keep going — no card needed."
- Past the limit, picking a new point opens the `SignupGate` popup
  ("Enjoying AcuMap?", Create a free account / Log in). The point still
  highlights on the diagram; the description stays empty. Diagrams remain
  fully usable.
- All description openings go through `showPoint()` in `ViewerPage`
  (`handlePointSelect` and the three search paths).
- **Cases:** visitors see the first 3 cases (`FREE_CASES` in
  `CasesPage.jsx`) plus "N more cases are available with a free account".
  Anyone logged in sees all 15.
- Checked in desktop Chrome as a visitor (counter pre-filled to 18):
  reminder note, popup on the 21st point, 3-case list. Not yet checked on a
  phone.

### Next steps (discussed)
- First-visit welcome line ("Tap any point…").
- `?ref=` source tracking on sign-up.
- Contact item in the menu once the 123-reg mailbox is active.
- Privacy note and medical disclaimer; phone check before posting.
- No password reset exists yet — handle by hand during the beta.

---

## 2026-11-17 (cont.) — First-visit welcome tip

**Status: committed** (files: `src/components/ui/WelcomeTip.jsx`
(new), `src/hooks/useWelcomeTip.js` (new), `src/pages/ViewerPage.jsx`).

- One-time card at the bottom of the screen for visitors without an
  account: "Welcome to AcuMap — Click (Tap on phones) any point on a diagram
  to see its location and indications. Click a card to enlarge it, and use
  the tabs at the top to switch between YNSA, TCM, ZSA and ear acupuncture."
  with a "Got it" button and an ×.
- Closes for good on "Got it", on ×, or when the first point description
  opens (`welcome.dismiss()` in `showPoint`). Remembered in `localStorage`
  (`acumap.welcomeSeen`); clearing browser data shows it again.
- Hidden for logged-in users, on Cases and the ear text pages, and while a
  description, the phone search overlay or the sign-up popup is open.
- On desktop it sits bottom-centre of the window, partly over the lower
  diagram cards — fine for a one-time message; could be centred over the
  diagram area instead.
- Checked in desktop Chrome: shows on first visit, "Got it" closes it, stays
  closed after reload. Not yet checked at phone width.

### Beta plan status
1. Guest limit — done (d3565a9).
2. Welcome tip — done (this entry).
3. `?ref=` source tracking on sign-up — next.
4. Contact item in the menu — waits on the 123-reg mailbox (user handles it).
5. Privacy note and medical disclaimer — before posting.
6. Full visitor flow check at phone width.

### End of session notes (2026-11-17)
- Committed at close: welcome tip (`WelcomeTip.jsx`, `useWelcomeTip.js`,
  `ViewerPage.jsx`) and the session-log entries since d3565a9.
- Discussed: the user may set up their own Facebook group for testers.
  Advice given: keep posting in existing groups to bring people in (with
  `?ref=` links once step 3 is done), create a private "AcuMap Beta
  Testers" group alongside, link it from the post and from the app (after
  sign-up or next to Contact), seed it with a welcome post and weekly
  updates, use membership questions. Group rather than Page for now.
  Offered to draft the group description and welcome post.
- Next session: step 3 (`?ref=` source tracking), then step 5 (privacy note
  and medical disclaimer), then step 6 (phone check). Step 4 (Contact)
  when the user has the 123-reg mailbox address.

## 2026-11-17 — Contact (beta plan step 4)
- Mailbox info@acumap.net is live (123-reg). Single source:
  `src/data/contact.js` (`CONTACT_EMAIL`, `CONTACT_MAILTO` with subject "AcuMap").
- Viewer: "Contact" link in the desktop top bar (after Feedback) and a
  "Contact" item in both phone menus (account + guest); opens the mail app.
- About AcuMap: new "Contact" section before the Disclaimer.
- App landing page footer: address added as a mailto link.
- acumap-site/index.html: address in the footer and in step 3 of
  "Help shape AcuMap". Not pushed yet (separate repo).
- `vite build` passes. Not yet checked in the browser.
- Committed and pushed: 19e544f (scalp-app), b7933ca (acumap-site).

## 2026-11-17 — Sign-up source tracking (beta plan step 3)
- Links carry `?ref=<tag>` (letters, digits, `-`, `_`, max 40; lowercased),
  e.g. `https://app.acumap.net/?ref=fb-ynsa-uk`.
- `src/lib/signupRef.js`: `captureSignupRef()` runs once in `main.jsx`; first
  tag wins, stored in localStorage `acumap.ref`, then removed from the address
  bar. `getSignupRef()` is sent with register (`useAuth.js`).
- Server `routes/auth.js` re-checks the tag and stores it in new nullable
  `User.signupRef` (prisma/schema.prisma; added on deploy by `prisma db push`).
- acumap-site: small script copies `?ref=` onto every app.acumap.net link.
- Checked headless on `vite preview`: tag saved and lowercased, second tag
  ignored, URL cleaned, invalid tag dropped. Server side not run locally (DB
  blocked by Norton); check after deploy with a test sign-up.
- Reading results: Railway → Postgres → Data → User table, `signupRef` column.
