// Ear Seeds tab: a simplified, needle-free version of the ear formulas for
// beginners and self-treatment at home. Text condensed from docs/Ear Seeds.docx.
// Point names are Chinese Auriculotherapy points (EarGuide maps the ones
// whose diagram name differs).

export const EAR_SEEDS_GUIDE = {
  intro: [
    'Ear seeds are tiny seeds (traditionally vaccaria, Wang Bu Liu Xing) or small metal beads held on an ear point with a little sticker. They press the point gently all day, with no needles, so you can use them at home or between acupuncture sessions.',
    'The ear is mapped like an upside-down baby in the womb: each area matches a part of the body. Pressing a point sends signals through the nerves of the ear to the brain, which can ease pain and help the matching organ or area.',
  ],
  benefits: [
    'No needles: good for beginners and people who dislike needles',
    'Easy to put on at home',
    'Small and hardly noticeable',
    'Keeps working between acupuncture sessions',
    'Drug-free support for general well-being',
  ],
  supplies: 'Ear seeds, tweezers, alcohol swabs, an ear probe (or a blunt tip) and a hair clip.',
  apply: [
    'Clip your hair back and take out earrings.',
    'Find the points on the chart, then press around each one with the probe. Choose the most tender spot and press it once to leave a small mark.',
    'Clean the ear with an alcohol swab (75%) and let it dry.',
    'Pick up a seed sticker with tweezers, touching the adhesive as little as possible, and press it onto the mark.',
  ],
  care: [
    'Massage each seed 3–5 times a day for 30–60 seconds, for example after meals and before sleep. Press until you feel mild tenderness, not pain.',
    'Remove the seeds after 2–4 days (sooner in hot weather), before the sticker loosens. Tilt your head to that side so the seed falls away from the ear canal.',
    'Switch ears each time so each ear gets a rest. Never reuse seeds.',
  ],
  precautions: [
    'Pregnant? Ask your doctor before using ear seeds.',
    'Do not use on an infected, cut or inflamed ear.',
    'Do not use when very weak, hungry, drunk or very agitated.',
    'If the skin gets itchy, red or swollen, remove the seeds. See a doctor if it continues.',
    'The tape may contain latex. If you are allergic, test one sticker first.',
    'Keep seeds in their packet, away from sunlight, so the adhesive stays good.',
  ],
}

export const EAR_SEEDS_SAFETY =
  'Ear seeds support, but do not replace, medical care. See a doctor for new, severe or lasting symptoms, and never change prescribed medication on your own.'

export const EAR_SEED_FORMULAS = [
  {
    family: 'Well-being',
    formulas: [
      { name: 'Weight Loss', points: ['Mouth', 'Endocrine', 'Stomach', 'Spleen', 'Subcortex'] },
      { name: 'Quit Smoking', points: ['Shenmen', 'Heart', 'Endocrine', 'Stomach', 'Lung', 'Subcortex'] },
      { name: 'Fatigue', points: ['Heart', 'Adrenal Gland', 'Spleen'] },
      { name: 'Stress / Anxiety', points: ['Shenmen', 'Heart', 'Subcortex', 'Neurasthenia Point'] },
      { name: 'Insomnia', points: ['Kidney', 'Stomach', 'Heart', 'Shenmen', 'Liver', 'Spleen', 'Subcortex'] },
    ],
  },
  {
    family: 'Head & senses',
    formulas: [
      { name: 'Myopia', points: ['Eye Disorder 1', 'Eye Disorder 2', 'Liver', 'Eye'] },
      { name: 'Dizziness', points: ['Liver', 'Shenmen', 'Kidney', 'Temple', 'Internal Ear'] },
      { name: 'Sore Throat', points: ['Throat', 'Lung', 'Shenmen'] },
      { name: 'Cold / Flu', points: ['Lung', 'Internal Nose', 'Shenmen'] },
      { name: 'Allergies', points: ['Allergic Area', 'Adrenal Gland', 'Shenmen'] },
      { name: 'Headache / Migraine', points: ['Sympathetic Nerve', 'Shenmen', 'Temple', 'Forehead', 'Occiput'] },
    ],
  },
  {
    family: 'Digestion & metabolism',
    formulas: [
      { name: 'Diabetes', points: ['Kidney', 'Endocrine', 'Shenmen', 'Pancreas / Gallbladder', 'Stomach', 'Lung'], note: 'Support only, alongside your diabetes care. Never change diabetes medication on your own.' },
      { name: 'Constipation', points: ['Rectum', 'Abdomen', 'Large Intestine', 'Lung', 'Subcortex'] },
      { name: 'Gastritis', points: ['Stomach', 'Shenmen', 'Spleen', 'Subcortex'] },
    ],
  },
  {
    family: "Women's health",
    formulas: [
      { name: 'PMS (Premenstrual Syndrome)', points: ['Internal Genitals', 'Endocrine', 'Kidney', 'Liver', 'Subcortex'] },
      { name: 'Fertility', points: ['Internal Genitals', 'Kidney', 'Endocrine', 'Shenmen', 'Liver', 'Spleen'] },
      { name: 'Menstrual Cramps / Menopause', points: ['Internal Genitals', 'Sympathetic Nerve', 'Shenmen', 'Kidney', 'Subcortex', 'Endocrine'] },
    ],
  },
  {
    family: 'Pain',
    formulas: [
      { name: 'Neck Pain (Cervical Spondylosis, Osteoarthritis)', points: ['Liver', 'Neck', 'Cervical Vertebrae', 'Kidney', 'Shenmen'] },
      { name: 'Shoulder Pain / Frozen Shoulder', points: ['Liver', 'Adrenal Gland', 'Shenmen', 'Kidney', 'Shoulder', 'Occiput'] },
      { name: 'Back Pain', points: ['Kidney', 'Lumbar Vertebrae', 'Shenmen'] },
      { name: 'Lower Back Pain / Sciatica', points: ['Kidney', 'Shenmen', 'Sciatic Nerve', 'Lumbar Vertebrae', 'Sacral Vertebrae'] },
      { name: 'Knee Pain / Arthritis', points: ['Kidney', 'Adrenal Gland', 'Knee Joint', 'External Knee'] },
      { name: 'Toothache', points: ['Tooth', 'Shenmen', 'Upper Jaw', 'Lower Jaw'] },
    ],
  },
]
