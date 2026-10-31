// Chinese Auriculotherapy points, in their categories. `short` is the label on
// the dropdown's category buttons. A point listed in two categories shows
// under both, and once in the A-Z list.
export const AURICULOTHERAPY_CATEGORIES = [
  {
    label: 'Nervous System',
    short: 'Nervous',
    points: [
      'Shenmen', 'Occiput', 'Forehead', 'Temple', 'Subcortex', 'Sympathetic (sympathy)', 'Brain Stem',
      'Lesser Occipital Nerve Point', 'Sciatic Nerve', 'Thalamus', 'Exciting Point', 'Neurasthenia Area',
      'Neurasthenia Point', 'Auricular Temporal Nerve', 'Brain', 'Vertex', 'Great Auricular Nerve',
      'Ear Centre', 'External Sympathetic',
    ],
  },
  {
    label: 'Endocrine System',
    short: 'Endocrine',
    points: ['Brain Point', 'Endocrine', 'Adrenal Gland', 'Pancreas', 'Thyroid Gland', 'Ovary', 'Testicle', 'Prostate'],
  },
  {
    label: 'Special Points',
    short: 'Special',
    points: [
      'Raising Blood Pressure Point', 'Decrease Blood Pressure Point', 'Pancreas Point', 'Hepatitis Point',
      'Ascites Point', 'Abdominal Area', 'Allergic Area', 'Dizziness Point', 'Hunger Point', 'Thirst Point',
      'Hot Point', 'Rheumatic Line', 'Constipation Point', 'Heart Point', 'Stop Asthma', 'Nephritis Point',
      'Tubercular Point', 'Specific Area I of Tumour', 'Specific Area II of Tumour',
      'Coronary Heart Disease Groove', 'Groove of Tinnitus', 'Missing Teeth Groove', 'Epilepsy Point',
      'Hepatomegaly Area', 'Splenomegaly Area', 'Groove of Hypertension',
    ],
  },
  {
    label: 'Zang Fu Organs',
    short: 'Zang Fu',
    points: [
      'Heart', 'Liver', 'Spleen', 'Lung', 'Kidney', 'Bladder', 'Gall Bladder', 'Stomach',
      'Large Intestine', 'Small Intestine', 'Sanjiao',
    ],
  },
  {
    label: 'Body Parts',
    short: 'Body Parts',
    points: [
      'Mouth', 'Esophagus', 'Cardiac', 'Duodenum', 'Appendix', 'Trachea', 'Bronchus', 'Throat',
      'External Nose', 'Internal Nose', 'Eye', 'Internal Ear', 'Tonsil', 'Upper Jaw', 'Lower Jaw',
      'Upper Palate', 'Lower Palate', 'Tongue', 'Tooth', 'Face & Cheek Area', 'Parotid Gland',
      'External Ear', 'Diaphragm', 'Pelvic Cavity', 'Adnexa', 'Cervix Uteri', 'Internal Genitals',
      'Groin', 'Ureter', 'Urethra', 'External Genitals', 'Rectum', 'Anus', 'Cervix Vertebrae',
      'Thoracic Vertebrae', 'Lumbar Vertebrae', 'Sacral Vertebrae', 'Coccyx Vertebrae', 'Neck', 'Chest',
      'Abdomen', 'Mammary Gland', 'Lumbar Muscle', 'Inter Costal', 'Shoulder and Upper Back', 'Hip Joint',
      'Knee Joint', 'External Knee', 'Ankle', 'Heel', 'Toe', 'Buttocks (Hip)', 'Popliteal Fossa',
      'Calf Point', 'Clavicle', 'Shoulder Joint', 'Shoulder', 'Elbow', 'Wrist', 'Finger', 'Armpit',
      'Sacroiliac Articulation', 'Biliary Duct', 'Rib Rim', 'Larynx and Tooth', 'External Abdomen',
      'Sole of Foot', 'Thigh Muscles', 'Instep', 'Wisdom Teeth', 'External Sympathetic',
    ],
  },
  {
    label: 'Back of the Auricle',
    short: 'Back of Ear',
    points: [
      'Tragic Apex', 'Ear Apex', 'Vision I', 'Vision II', 'Liver Yang', 'Helix 1-6', 'Cymba Concha Centre',
      'Heart on Back of the Auricle', 'Liver in posterior Auricle', 'Spleen on Back of The Auricle',
      'Lung on back of the Auricle', 'Kidney In Back of Auricle', 'Upper Ear Root', 'Middle Ear Root',
      'Lower Ear Root', 'Groove on Back of the Auricle',
    ],
  },
]

// Drawn on the diagram but not in any category above.
export const AURICULOTHERAPY_UNCATEGORISED = ['Anxious Point']

// Every point A-Z, with the categories it belongs to.
export const AURICULOTHERAPY_POINTS = [...new Set([
  ...AURICULOTHERAPY_CATEGORIES.flatMap(category => category.points),
  ...AURICULOTHERAPY_UNCATEGORISED,
])]
  .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }))
  .map(name => ({
    name,
    categories: AURICULOTHERAPY_CATEGORIES.filter(category => category.points.includes(name)).map(category => category.label),
  }))
