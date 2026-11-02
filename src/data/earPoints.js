// Ear point lists and their Figma element ids, shared by the Ear grid
// (HeadEarPoints) and the viewer search panel.
import { AURICULOTHERAPY_POINTS } from './earAuriculotherapy'

export const TILE_TITLES = {
  master: 'Chinese Auriculotherapy',
  musculoskeletal: 'Musculoskeletal Points',
  internal: 'Internal Organ Points',
  neuroendocrine: 'Neuroendocrine Points',
}

// Musculoskeletal points from ear-acupoints.txt, in its groups and order.
export const MSK_GROUPS = [
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
export const MSK_SVG_IDS = Object.fromEntries([
  'Toes (C)', 'Toes (E)', 'Heel (C)', 'Heel (E)', 'Ankle (C)', 'Ankle (E)', 'Knee (C)', 'Knee (C)_2', 'Hip (C)', 'Hip (E)',
  'Fingers', 'Hand', 'Wrist', 'Elbow', 'Arm', 'Shoulder', 'Master Shoulder',
  'Cervical Spine', 'Cervical Spine Point', 'Thoracic Spine', 'Lumbar Spine', 'Sacral Spine', 'Lumbago', 'Neck', 'Chest', 'Abdomen',
  'Occiput', 'Temples', 'Forehead', 'Face', 'Eye', 'Eye Disorder 1', 'Eye Disorder 2', 'Upper Jaw', 'Lower Jaw', 'TMJ',
  'Dental Analgesia', 'Inner Ear (C)', 'Inner Ear', 'Inner Nose (C)', 'External Ear', 'Muscle Rekaxation',
].map(id => [id, MSK_RENAMES[id] ?? id]))

// Spine segments are stroked lines, not dots, so they're thickened rather than outlined.
export const MSK_LINE_IDS = new Set(['Cervical Spine', 'Thoracic Spine', 'Lumbar Spine', 'Sacral Spine'])

// Internal organ points from ear-acupoints.txt, in its groups and order.
export const ORG_GROUPS = [
  { label: 'Digestive', points: ['Mouth', 'Stomach', 'Small Intestine', 'Large Intestine', 'Liver', 'Pancreas', 'Spleen (C)', 'Spleen (E)'] },
  { label: 'Cardiorespiratory', points: ['Heart (C)', 'Heart (E)', 'Lung 1', 'Lung 2', 'Throat (C)', 'Throat (E)', 'Diaphragm (C)'] },
  { label: 'Urogenital', points: ['Kidney (C)', 'Kidney (E)', 'Bladder', 'Prostate (C)', 'Uterus (C)', 'Uterus (E)', 'External Genitals (C)', 'External Genitals (E)'] },
]

// ear-internal-organs.svg element id -> point name (the intestine ids are lower-case in Figma).
const ORG_RENAMES = {
  'Small intestine': 'Small Intestine',
  'Large intestine': 'Large Intestine',
}
export const ORG_SVG_IDS = Object.fromEntries([
  'Mouth', 'Stomach', 'Small intestine', 'Large intestine', 'Liver', 'Pancreas', 'Spleen (C)', 'Spleen (E)',
  'Heart (C)', 'Heart (E)', 'Lung 1', 'Lung 2', 'Throat (C)', 'Throat (E)', 'Diaphragm (C)',
  'Kidney (C)', 'Kidney (E)', 'Bladder', 'Prostate (C)', 'Uterus (C)', 'Uterus (E)', 'External Genitals (C)', 'External Genitals (E)',
].map(id => [id, ORG_RENAMES[id] ?? id]))

// ear-chin-3.svg element id -> Chinese Auriculotherapy point name, where they
// differ (Figma renames and typos). Most ids equal the name. Some points are
// drawn twice (Thalamus, Lung, Bronchus, External Knee, Buttocks (Hip),
// Inter Costal); the first element found carries the marker. The three
// helix dots (Helix 4-6) all select the single "Helix 1-6" entry. The
// "...Area" ids are groups (a shaded zone), which select as one.
const MASTER_RENAMES = {
  'Appex of the Tragus': 'Tragic Apex',
  'Vision 1': 'Vision I',
  'Vision 2': 'Vision II',
  'Groove of Coronary Heart Disease': 'Coronary Heart Disease Groove',
  'Groove of Missing Teeth': 'Missing Teeth Groove',
  'Thalamus_2': 'Thalamus',
  'Testis': 'Testicle',
  'Exciting': 'Exciting Point',
  'Helix 4': 'Helix 1-6',
  'Helix 5': 'Helix 1-6',
  'Helix 6': 'Helix 1-6',
  'Raise Blood Pressure': 'Raising Blood Pressure Point',
  'Cheek': 'Face & Cheek Area',
  'Brainstem': 'Brain Stem',
  'Tripple Heater Point': 'Triple Heater Point',
  'San Jiao': 'Sanjiao',
  'Lung_2': 'Lung',
  'Bronchus_2': 'Bronchus',
  'Endocrine Area': 'Endocrine',
  'Symphatic': 'Sympathetic (sympathy)',
  'Siatic': 'Sciatic Nerve',
  'Hip': 'Buttocks (Hip)',
  'Hip_2': 'Buttocks (Hip)',
  'Sole': 'Sole of Foot',
  'Calf': 'Calf Point',
  'External Knee_2': 'External Knee',
  'Thigh Muscles Area': 'Thigh Muscles',
  'Lumbar Muscles Area': 'Lumbar Muscle',
  'Intercostals Area': 'Inter Costal',
  'Intercostals': 'Inter Costal',
  'Diziness Area': 'Dizziness Point',
  'Cervical Vertebrae Area': 'Cervix Vertebrae',
  'Thyroid': 'Thyroid Gland',
  'Mamma': 'Mammary Gland',
  'Coccyx': 'Coccyx Vertebrae',
  'Upper Back': 'Shoulder and Upper Back',
  'Gallbladder': 'Gall Bladder',
  'Bilary Duct': 'Biliary Duct',
  'Duodendum': 'Duodenum',
  'Diaphram': 'Diaphragm',
  'Ear Center': 'Ear Centre',
  'Abdominal Distention Area': 'Abdominal Area',
  'Arm Pit': 'Armpit',
  'Large Auricular Nerv': 'Great Auricular Nerve',
  'Rheumatism Line': 'Rheumatic Line',
}
export const MASTER_LINE_IDS = new Set(['Groove of Coronary Heart Disease', 'Groove of Hypertension', 'Groove of Missing Teeth', 'Groove of Tinnitus', 'Rheumatism Line'])
export const MASTER_SVG_IDS = Object.fromEntries([
  // Tragus and intertragic notch
  'External Ear', 'Thirst Point', 'Adrenal Gland', 'Appex of the Tragus', 'Vision 1', 'External Nose', 'Hunger Point',
  // Lobe
  'Eye', 'Upper Jaw', 'Lower Jaw', 'Thalamus', 'Thalamus_2', 'Brain Point', 'Testis', 'Exciting', 'Wisdom Teeth',
  'Internal Ear', 'Helix 4', 'Helix 5', 'Helix 6', 'Vision 2', 'Lower Palate', 'Tongue', 'Upper Palate', 'Tonsil',
  'Anxious Point', 'Raise Blood Pressure', 'Tooth', 'Neurasthenia Point', 'Cheek', 'Brainstem', 'Stop Asthma', 'Temple',
  // Inferior concha
  'Heart Point', 'Tripple Heater Point', 'Spleen', 'Lung', 'Lung_2', 'San Jiao', 'Bronchus', 'Bronchus_2', 'Trachea', 'Endocrine Area',
  // Upper crus of helix / triangular fossa
  'Symphatic', 'Siatic', 'Hip', 'Shenmen', 'Popliteal Fossa', 'Heel', 'Sole', 'Toe', 'Calf', 'External Knee', 'Hip Joint',
  'Ankle', 'Instep', 'Knee Joint', 'Thigh Muscles Area',
  // Antihelix
  'Lumbar Muscles Area', 'Intercostals Area', 'Diziness Area', 'Cervical Vertebrae Area', 'Thyroid', 'Neck', 'Chest', 'Mamma',
  'External Abdomen', 'External Knee_2', 'Hip_2', 'Coccyx', 'Hot Point', 'Abdomen', 'Upper Back', 'Intercostals',
  // Superior concha
  'Prostate', 'Bladder', 'Ureter', 'Kidney', 'Gallbladder', 'Liver', 'Bilary Duct', 'Duodendum', 'Stomach', 'Diaphram',
  'Ear Center', 'Small Intestine', 'Appendix', 'Large Intestine', 'Abdominal Distention Area',
  // Scaphoid fossa
  'Finger', 'Wrist', 'Elbow', 'Shoulder', 'Shoulder Joint', 'Arm Pit', 'Clavicle', 'Large Auricular Nerv',
  // Grooves and lines
  ...MASTER_LINE_IDS,
].map(id => [id, MASTER_RENAMES[id] ?? id]))

// Every ear point, one entry per tile it is listed on, for the viewer search
// panel: `groups` are its categories (Chinese Auriculotherapy) or dropdown
// group; `drawn` is false for points listed but not on the diagram yet.
const DRAWN = {
  master: new Set(Object.values(MASTER_SVG_IDS)),
  musculoskeletal: new Set(Object.values(MSK_SVG_IDS)),
  internal: new Set(Object.values(ORG_SVG_IDS)),
}
export const EAR_SEARCH_INDEX = [
  ...AURICULOTHERAPY_POINTS.map(({ name, categories }) => ({ tile: 'master', name, groups: categories })),
  ...MSK_GROUPS.flatMap(g => g.points.map(name => ({ tile: 'musculoskeletal', name, groups: [g.label] }))),
  ...ORG_GROUPS.flatMap(g => g.points.map(name => ({ tile: 'internal', name, groups: [g.label] }))),
].map(entry => ({
  ...entry,
  key: `${entry.tile}:${entry.name}`,
  tileTitle: TILE_TITLES[entry.tile],
  drawn: DRAWN[entry.tile].has(entry.name),
}))
