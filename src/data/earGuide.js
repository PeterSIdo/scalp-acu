// Short reference text for the Auriculotherapy "Description" and "Formulas"
// tabs, condensed in our own words from Sections V and VI of the source book
// (SOURCES['huang-auriculotherapy']).

export const EAR_DESCRIPTION = {
  title: 'How Ear Points Work',
  source: 'huang-auriculotherapy',
  intro: [
    'Ear points are used both to treat and to assess. A problem in the body tends to show at the matching ear point, so the same point that treats a condition also helps spot it and tell similar conditions apart.',
    'The most commonly used points fall into six groups, by what kind of point they are and how they are used.',
  ],
  reading: {
    title: 'Reading the ear',
    items: [
      { label: 'Positive reaction', text: 'Lower skin resistance at a point, picked up by an electrical point detector (it beeps or lights up). Shenmen\'s reading is often taken as the baseline to compare against.' },
      { label: 'Visible signs', text: 'Raised areas, dips, redness, congested capillaries, flaking or a cord you can feel.' },
      { label: 'Tenderness', text: 'Graded on pressing from I (mild) to III (strong).' },
    ],
  },
  groups: [
    {
      title: 'Nervous system points',
      summary: 'Calm or stimulate the brain, relieve pain and balance the autonomic nervous system.',
      points: [
        { name: 'Shenmen', text: 'The main pain-relief and calming point; also anti-inflammatory.' },
        { name: 'Occiput', text: 'The main point for dizziness and vertigo; calming.' },
        { name: 'Subcortex', text: 'Balances brain excitation and inhibition; digestion and circulation.' },
        { name: 'Sympathetic', text: 'Internal organ pain and spasm; widens vessels; reduces secretions and stomach acid.' },
        { name: 'Forehead / Temple / Vertex', text: 'Headache at the front, sides and top of the head.' },
        { name: 'Neurasthenia Area & Point', text: 'The two main sleep points.' },
      ],
    },
    {
      title: 'Endocrine points',
      summary: 'Regulate hormones, inflammation, allergy and fluid balance.',
      points: [
        { name: 'Endocrine', text: 'Hormone balance; anti-inflammatory and anti-allergy; fluid retention.' },
        { name: 'Adrenal Gland', text: 'Stress, allergy, inflammation; raises low blood pressure; stops bleeding; opens the airways.' },
        { name: 'Brain Point (Pituitary)', text: 'Hormonal and gynaecological problems; bleeding.' },
        { name: 'Ovary / Testicle / Prostate', text: 'Reproductive and urinary-genital problems.' },
      ],
    },
    {
      title: 'Specific points',
      summary: 'Points with one targeted job, often used for both assessment and treatment. Several are signs to look for (grooves, colour changes) rather than treatment points.',
      points: [
        { name: 'Raise / Lower Blood Pressure Point', text: 'Low and high blood pressure.' },
        { name: 'Allergy Area (Wind Stream)', text: 'Allergies, hives, hay fever, itching.' },
        { name: 'Stop Asthma', text: 'The main point for asthma and cough.' },
        { name: 'Hunger / Thirst Point', text: 'Appetite control and thirst.' },
        { name: 'Tinnitus Groove', text: 'A sign of tinnitus; deeper and longer means more long-standing.' },
      ],
    },
    {
      title: 'Zang-Fu organ points',
      summary: 'Understood through TCM organ theory, so each has broad uses: the organ, its sense organ, its tissue and its paired organ.',
      points: [
        { name: 'Heart', text: 'Circulation, mind and sleep, sweating, tongue and throat.' },
        { name: 'Liver', text: 'Smooth flow of qi, tendons, dizziness and spasm, eyes.' },
        { name: 'Spleen', text: 'Digestion, damp and swelling, holds blood, muscles.' },
        { name: 'Lung', text: 'Breathing and cough, skin, nose, fluid balance.' },
        { name: 'Kidney', text: 'The main strengthening point: bones, brain, ears, hair, lower back.' },
      ],
    },
    {
      title: 'Body part points',
      summary: 'Each matches a part of the body (head, trunk, spine, limbs) and is used mainly for problems in that part. This is the "Corresponding Point" used in most formulas.',
      points: [],
    },
    {
      title: 'Back-of-ear and other points',
      summary: 'Points on the back of the ear and the ear rim, often paired with the matching front points for a stronger effect.',
      points: [
        { name: 'Ear Apex / Tragus Apex', text: 'Fever, inflammation, high blood pressure; usually bled.' },
        { name: 'Helix 1–6', text: 'Inflammation and fever; usually bled.' },
        { name: 'Back-of-ear organ points', text: 'Heart, Liver, Spleen, Lung and Kidney on the back surface.' },
      ],
    },
  ],
  safety: 'These indications come from traditional practice. Ear signs are clues to look into, not a diagnosis. Serious, sudden or worsening conditions need a doctor.',
}

// Point formulas by function. `bleed` lists core points that are pricked.
export const EAR_FORMULA_KEY_TERMS = [
  { label: 'Corresponding Point', text: 'The ear point for the part of the body with the problem (for shoulder pain, Shoulder). Use the most reactive spot.' },
  { label: 'Bleed', text: 'Prick the point and let a few drops out (mainly Ear Apex, Helix 1–6, Tragus Apex). Use a sterile lancet and check bleeding risk first.' },
  { label: 'Subcortex', text: 'Choose the Nervous, Cardiovascular or Digestive variant to match the problem.' },
]

export const EAR_FORMULAS = [
  {
    family: 'Relieving',
    formulas: [
      { name: 'Pain', points: ['Corresponding Point', 'Shenmen'], addOns: ['Organ pain: Sympathetic', 'Soft tissue: Liver, Spleen', 'Bone or tooth: Kidney'] },
      { name: 'Dizziness & vertigo', points: ['Occiput', 'Dizziness Area', 'Liver', 'Ear Apex (Bleed)', 'External Ear'], addOns: ['Hardened arteries in the brain: Cardiovascular Subcortex, Heart', 'Autonomic imbalance: Sympathetic, Nervous Subcortex', 'Ménière\'s: Internal Ear, Spleen', 'Travel sickness: Cardia, Internal Ear', 'Anaemia: Diaphragm, Spleen'] },
      { name: 'Spasms & seizures', points: ['Brain Stem', 'Occiput', 'Shenmen', 'Liver', 'Nervous Subcortex', 'Lesser Occipital Nerve', 'Ear Apex (Bleed)'] },
      { name: 'Cough', points: ['Corresponding Point', 'Stop Asthma', 'Mouth', 'Brain Stem', 'Shenmen', 'Occiput', 'Spleen'], addOns: ['Corresponding: Throat, Trachea, Bronchus, Lung'] },
      { name: 'Asthma', points: ['Bronchus', 'Lung', 'Stop Asthma', 'Sympathetic', 'Adrenal Gland', 'Shenmen', 'Occiput'], addOns: ['Allergic: Allergy Area, Endocrine', 'Asthmatic bronchitis: Ear Apex (Bleed), Endocrine', 'Weak type: Kidney', 'Heart-lung disease (cor pulmonale): Heart, Kidney, Cardiovascular Subcortex'] },
      { name: 'Itching', points: ['Corresponding Point (Bleed)', 'Ear Apex (Bleed)', 'Lung (Bleed)', 'Spleen', 'Heart', 'Shenmen', 'Occiput', 'Allergy Area', 'Diaphragm'] },
      { name: 'Tinnitus', points: ['Internal Ear', 'External Ear', 'Tinnitus Groove', 'Sanjiao', 'Gallbladder', 'Kidney', 'Temple'] },
      { name: 'Nausea & vomiting', points: ['Cardia', 'Stomach', 'Occiput', 'Digestive Subcortex', 'Shenmen'] },
      { name: 'Excess stomach acid', points: ['Sympathetic', 'Stomach', 'Liver'] },
      { name: 'Vaginal discharge', points: ['Corresponding Point', 'Kidney', 'Spleen', 'Sanjiao', 'Liver', 'Endocrine'] },
    ],
  },
  {
    family: 'Opposite pairs',
    formulas: [
      { name: 'Calming the mind', points: ['Ear Apex (Bleed)', 'Shenmen', 'Occiput', 'Nervous Subcortex', 'Brain Stem', 'Heart'] },
      { name: 'Stimulating the mind', points: ['Forehead', 'Endocrine', 'Exciting Point', 'Thalamus', 'Brain Point', 'Adrenal Gland'] },
      { name: 'Lowering blood pressure', points: ['Lower BP Point', 'Shenmen', 'Liver', 'Kidney', 'Heart', 'Ear Apex (Bleed)', 'Forehead', 'Occiput', 'Cardiovascular Subcortex'] },
      { name: 'Raising blood pressure', points: ['Raise BP Point', 'Adrenal Gland', 'Brain Point', 'Heart', 'Liver', 'Kidney', 'Cardiovascular Subcortex'] },
      { name: 'Slowing the heart rate', points: ['Heart Point', 'Cardiovascular Subcortex', 'Heart', 'Shenmen', 'Occiput'] },
      { name: 'Strengthening the heart', points: ['Sympathetic', 'Adrenal Gland', 'Brain Point', 'Cardiovascular Subcortex', 'Heart'] },
      { name: 'Stopping bleeding', points: ['Adrenal Gland', 'Brain Point', 'Diaphragm', 'Spleen', 'Corresponding Point'] },
      { name: 'Improving circulation', points: ['Sympathetic', 'Heart', 'Liver', 'Lung', 'Heart Point', 'Cardiovascular Subcortex', 'Corresponding Point'] },
      { name: 'Clearing fluid retention', points: ['Kidney', 'Spleen', 'Lung', 'Sanjiao', 'Endocrine', 'Ascites Point', 'Corresponding Point'] },
      { name: 'Bedwetting & incontinence', points: ['Bladder', 'Ear Centre', 'Brain Point', 'Urethra'], addOns: ['Night-time urination: Forehead, Exciting Point', 'Incontinence after spinal cord injury: Lumbar Spine, Sacral Spine (as Corresponding Points)', 'Nervous bladder: Occiput, Nervous Subcortex'] },
      { name: 'Constipation', points: ['Large Intestine', 'Spleen', 'Sanjiao', 'Abdomen', 'Lung', 'Digestive Subcortex', 'Constipation Point', 'Cymba Concha Centre'] },
      { name: 'Diarrhoea', points: ['Rectum', 'Large Intestine', 'Spleen', 'Ear Apex (Bleed)', 'Shenmen', 'Occiput', 'Endocrine'], addOns: ['Allergic colitis: Allergy Area, Digestive Subcortex', 'Long-term dysentery: Adrenal Gland, Ear Apex (Bleed)'] },
    ],
  },
  {
    family: 'Sense organs',
    formulas: [
      { name: 'Sore throat', points: ['Throat', 'Mouth', 'Trachea', 'Lung', 'Endocrine'], addOns: ['Acute laryngitis or pharyngitis: Shenmen, Ear Apex (Bleed)', 'Tonsillitis: Shenmen, Tonsil, Ear Apex (Bleed)', 'Hoarseness: Vocal Cord Point (just above the ear canal opening), Spleen or Shenmen', 'Globus: Liver, Nervous Subcortex, Oesophagus'] },
      { name: 'Vision', points: ['Ear Apex (Bleed)', 'Kidney', 'Liver', 'Eye', 'Vision 2'], addOns: ['Short-sightedness: Spleen, Sympathetic','Conjunctivitis: Lung', 'Blepharitis (inflamed eyelid margins): Heart, Spleen', 'Styes or chalazion: Spleen'] },
      { name: 'Hearing', points: ['Internal Ear', 'External Ear', 'Kidney', 'Sanjiao', 'Gallbladder', 'Temple'] },
      { name: 'Blocked nose', points: ['Internal Nose', 'Lung', 'External Ear'], addOns: ['Cold (blocked, runny nose): Adrenal Gland, Allergy Area, Ear Apex (Bleed)', 'Hay fever: Allergy Area, Endocrine, Adrenal Gland, Ear Apex (Bleed)', 'Long-term thickened rhinitis: Adrenal Gland, Diaphragm', 'Dry, atrophic rhinitis: Endocrine, Spleen'] },
      { name: 'Skin & complexion', points: ['Face and Cheek', 'Corresponding Point', 'Lung', 'Spleen', 'Liver', 'Endocrine'], addOns: ['Acne, rosacea: Adrenal Gland, Large Intestine, Ear Apex (Bleed)', 'Pigmentation: Brain Point, Adrenal Gland', 'Neurodermatitis: Nervous Subcortex, Occiput, Shenmen', 'Oily skin, seborrhoeic dermatitis: Pancreas, Kidney, Small Intestine', 'Allergic skin, hives: Allergy Area, Adrenal Gland, Ear Apex (Bleed)'] },
    ],
  },
  {
    family: 'Resisting',
    formulas: [
      { name: 'Allergy', points: ['Ear Apex (Bleed)', 'Allergy Area', 'Endocrine', 'Adrenal Gland', 'Liver', 'Corresponding Point'] },
      { name: 'Inflammation', points: ['Ear Apex (Bleed)', 'Helix 1–6 (Bleed)', 'Adrenal Gland', 'Endocrine', 'Shenmen', 'Corresponding Point'] },
      { name: 'Rheumatism', points: ['Ear Apex (Bleed)', 'Adrenal Gland', 'Endocrine', 'Kidney', 'Liver', 'Spleen', 'Sanjiao', 'Allergy Area', 'Corresponding Point'] },
      { name: 'Fever', points: ['Ear Apex (Bleed)', 'Tragus Apex (Bleed)', 'Adrenal Gland', 'Sympathetic', 'Thalamus', 'Lung', 'Occiput', 'Endocrine', 'Corresponding Point'] },
    ],
  },
  {
    family: 'Regulating',
    formulas: [
      { name: 'Autonomic nervous system', points: ['Sympathetic', 'Thalamus', 'Subcortex', 'Heart', 'Kidney', 'Shenmen', 'Occiput'] },
      { name: 'Hormones', points: ['Endocrine', 'Brain Point', 'Thalamus', 'Kidney', 'Liver', 'Corresponding Point'] },
      { name: 'Periods', points: ['Endocrine', 'Brain Point', 'Thalamus', 'Ovary', 'Kidney', 'Liver', 'Internal Genitals'], addOns: ['Light or missed periods: Exciting Point, Cardiovascular Subcortex, Sympathetic', 'Heavy periods: Diaphragm, Adrenal Gland, Spleen', 'Period pain: Abdomen, Cymba Concha Centre, Shenmen'] },
    ],
  },
  {
    family: 'Strengthening & invigorating',
    formulas: [
      { name: 'Strengthening the Kidney', points: ['Kidney', 'Liver', 'Heart', 'Endocrine', 'Brain Point', 'Thalamus', 'Adrenal Gland'] },
      { name: 'Building blood', points: ['Spleen', 'Stomach', 'Kidney', 'Sanjiao', 'Heart', 'Liver', 'Adrenal Gland'] },
      { name: 'Memory & focus', points: ['Heart', 'Kidney', 'Brain', 'Thalamus', 'Brain Point', 'Nervous Subcortex', 'Forehead'] },
      { name: 'Liver blood', points: ['Liver', 'Kidney', 'Sanjiao', 'Spleen', 'Endocrine', 'Digestive Subcortex', 'Corresponding Point'] },
      { name: 'Spleen & digestion', points: ['Spleen', 'Stomach', 'Small Intestine', 'Pancreas', 'Endocrine', 'Digestive Subcortex', 'Mouth'] },
    ],
  },
  {
    family: 'Other',
    formulas: [
      { name: 'Milk supply', points: ['Breast', 'Brain Point', 'Endocrine', 'Thalamus', 'Liver', 'Stomach'] },
      { name: 'Bloating', points: ['Abdominal Distension Area', 'Abdomen', 'Spleen', 'Stomach', 'Liver', 'Sanjiao', 'Lung', 'Digestive Subcortex', 'Large Intestine'] },
      { name: 'Blood sugar', points: ['Pancreas Point', 'Pancreas', 'Endocrine', 'Brain Point', 'Thalamus', 'Subcortex', 'Mouth', 'Thirst Point', 'Sanjiao', 'Ear Centre'], note: 'Support only; never suggest changing diabetes medication.' },
      { name: 'Spasm & cramping pain', points: ['Corresponding Point', 'Sympathetic', 'Subcortex', 'Shenmen'] },
      { name: 'Gallbladder', points: ['Gallbladder', 'Bile Duct', 'Shoulder and Upper Back', 'Liver', 'Sanjiao', 'Duodenum', 'Digestive Subcortex', 'Endocrine'] },
      { name: 'Sleep', points: ['Shenmen', 'Kidney', 'Heart', 'Nervous Subcortex', 'Occiput', 'Neurasthenia Area', 'Neurasthenia Point', 'Ear Apex (Bleed)'], addOns: ['Stuck Liver qi: Liver', 'Timid, easily startled: Gallbladder, Liver', 'Weak Heart and Spleen: Spleen', 'Disturbed Stomach qi: Stomach, Spleen'] },
      { name: 'Excess sweating', points: ['Heart', 'Sympathetic', 'Nervous Subcortex', 'Thalamus', 'Adrenal Gland', 'Corresponding Point'] },
    ],
  },
]

export const EAR_FORMULA_SAFETY = 'Traditional point combinations used in complementary practice. They support medical care and do not replace it.'
