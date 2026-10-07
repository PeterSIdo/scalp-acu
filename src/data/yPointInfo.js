// Per-meridian Y point descriptions, keyed by MERIDIANS code. Merged into
// every Y point record (yin/yang, strong/soft) for that meridian in
// points/index.js. Location is not here — it depends on which side of the
// ear the clicked point is on (yin/yang), so index.js adds it per record.
// Governing Vessel has no entry yet.
export const Y_POINT_INFO = {
  LU: {
    name: 'Lung Y Point',
    meridian: 'Lung (Yin meridian)',
    diagnosticZone: 'Neck / abdominal zone',
    indications: ['Cough', 'Asthma', 'Bronchitis', 'Colds and sinus congestion', 'Shortness of breath', 'Allergies and hay fever', 'Skin conditions such as eczema', 'Low immunity', 'Grief and sadness'],
    notes: 'Often combined with the Large Intestine Y point (paired meridian) for respiratory and skin conditions.',
  },
  PE: {
    name: 'Pericardium Y Point',
    meridian: 'Pericardium (Yin meridian)',
    diagnosticZone: 'Neck / abdominal zone',
    indications: ['Palpitations', 'Chest tightness', 'Anxiety', 'Restlessness', 'Insomnia', 'Nausea', 'Emotional stress', 'Circulation problems'],
    notes: 'Useful alongside the Heart Y point for emotional and sleep-related complaints.',
  },
  HT: {
    name: 'Heart Y Point',
    meridian: 'Heart (Yin meridian)',
    diagnosticZone: 'Neck / abdominal zone',
    indications: ['Palpitations', 'Insomnia', 'Anxiety', 'Poor concentration and memory', 'Emotional instability', 'Nervousness', 'Speech-related issues'],
    notes: 'A key point for mental–emotional (Shen) disturbances. Combine with the Small Intestine Y point (paired meridian).',
  },
  'SP-PANC': {
    name: 'Spleen Y Point',
    meridian: 'Spleen (Yin meridian)',
    diagnosticZone: 'Neck / abdominal zone',
    indications: ['Poor digestion', 'Bloating', 'Loose stools', 'Fatigue', 'Heaviness', 'Poor appetite', 'Fluid retention', 'Easy bruising', 'Menstrual irregularities', 'Overthinking and worry'],
    notes: 'Often paired with the Stomach Y point for digestive complaints.',
  },
  LV: {
    name: 'Liver Y Point',
    meridian: 'Liver (Yin meridian)',
    diagnosticZone: 'Neck / abdominal zone',
    indications: ['Stress', 'Irritability', 'Headaches and migraine', 'Eye problems', 'Muscle tension and cramps', 'Menstrual problems and PMS', 'Digestive upset linked to stress', 'Dizziness'],
    notes: 'Frequently used in stress-related and gynaecological conditions. Combine with the Gallbladder Y point.',
  },
  KI: {
    name: 'Kidney Y Point',
    meridian: 'Kidney (Yin meridian)',
    diagnosticZone: 'Neck / abdominal zone',
    indications: ['Low back and knee pain', 'Fatigue and exhaustion', 'Urinary problems', 'Tinnitus and hearing issues', 'Hormonal and fertility issues', 'Menopausal symptoms', 'Fear and anxiety', 'Cold extremities'],
    notes: 'One of the most frequently used Y points. Commonly combined with the Bladder Y point and Basic points for back pain.',
  },
  LI: {
    name: 'Large Intestine Y Point',
    meridian: 'Large Intestine (Yang meridian)',
    diagnosticZone: 'Neck / abdominal zone',
    indications: ['Constipation', 'Diarrhoea', 'IBS', 'Abdominal pain', 'Sinus and nasal problems', 'Toothache', 'Skin conditions', 'Shoulder and arm pain along the meridian'],
    notes: 'Paired with the Lung Y point.',
  },
  SJ: {
    name: 'San Jiao (Triple Burner) Y Point',
    meridian: 'San Jiao (Yang meridian)',
    diagnosticZone: 'Neck / abdominal zone',
    indications: ['Fluid metabolism problems', 'Oedema', 'Temperature regulation issues', 'Tinnitus', 'Ear problems', 'Side-of-head headaches', 'Shoulder and neck tension', 'Hormonal balance'],
    notes: 'Paired with the Pericardium Y point. Useful for whole-body regulation.',
  },
  SI: {
    name: 'Small Intestine Y Point',
    meridian: 'Small Intestine (Yang meridian)',
    diagnosticZone: 'Neck / abdominal zone',
    indications: ['Abdominal pain', 'Digestive and absorption issues', 'Neck stiffness', 'Shoulder blade pain', 'Ear problems', 'Poor clarity of thought'],
    notes: 'Paired with the Heart Y point. Often helpful for neck and shoulder pain alongside the Basic points.',
  },
  ST: {
    name: 'Stomach Y Point',
    meridian: 'Stomach (Yang meridian)',
    diagnosticZone: 'Neck / abdominal zone',
    indications: ['Nausea', 'Acid reflux', 'Indigestion', 'Gastritis', 'Poor appetite', 'Abdominal bloating', 'Facial pain', 'Front-of-knee pain'],
    notes: 'Paired with the Spleen Y point.',
  },
  GB: {
    name: 'Gallbladder Y Point',
    meridian: 'Gallbladder (Yang meridian)',
    diagnosticZone: 'Neck / abdominal zone',
    indications: ['Side-of-head headaches and migraine', 'Hip and lateral leg pain', 'Sciatica (lateral)', 'Fatty food intolerance', 'Indecision', 'Eye problems', 'Dizziness'],
    notes: 'Paired with the Liver Y point. Commonly used for migraine and lateral leg pain.',
  },
  BL: {
    name: 'Bladder Y Point',
    meridian: 'Bladder (Yang meridian)',
    diagnosticZone: 'Neck / abdominal zone',
    indications: ['Urinary problems', 'Cystitis', 'Back pain along the spine', 'Sciatica (posterior)', 'Neck stiffness', 'Back-of-head headaches', 'Calf pain'],
    notes: 'Paired with the Kidney Y point. Widely used for back pain together with the Basic points.',
  },
}
