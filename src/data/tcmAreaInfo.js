// Descriptions for TCM scalp areas, keyed by area name (matches TCM_AREAS in
// HeadTCMScalpAreas.jsx). Selecting an area with an entry here shows it in
// the InfoPanel (desktop) / bottom sheet (mobile); areas without one only
// highlight on the diagram. InfoPanel renders `sections` in order: each has
// a title, optional paragraphs, and an optional list of items, where an
// item's `label` is shown bold before its text.

const INTERNAL_ORGAN_NOTE =
  'These zones are on the front of the head. Their placement comes from clinical experience rather than Western anatomy. They are used less often, since body acupuncture usually works well for these conditions.'

export const TCM_AREA_INFO = {
  'Motor Area': {
    id: 'TCM-motor-area',
    name: 'Motor Area',
    system: 'TCM',
    sections: [
      {
        title: 'Location',
        paragraphs: [
          'The Motor Area sits over the precentral gyrus of the frontal lobe. It starts on the midline, 0.5 cm behind the midpoint of the head, and runs diagonally down to where the eyebrow–occipital line crosses the front hairline. It is a reference line for finding nearby zones, including the Sensory Area and the Chorea and Tremor Area.',
        ],
      },
      {
        title: 'Function',
        paragraphs: [
          'The motor cortex governs voluntary movement. Each side mainly controls the body below the neck on the opposite side, while most head and face muscles are controlled from both sides. Body parts needing fine control take up more cortex. The body is mapped upside down: legs at the top, arms in the middle, head and face at the bottom.',
        ],
      },
      {
        title: 'Divisions',
        paragraphs: ['Divide the line into five equal parts:'],
        items: [
          { label: 'Upper 1/5', text: 'opposite-side leg, trunk, spine and neck' },
          { label: 'Middle 2/5', text: 'opposite-side arm' },
          { label: 'Lower 2/5', text: 'face and head on both sides; also speech difficulty after stroke or brain injury' },
        ],
        after: 'Needle downward from the top end, through the full length of the zone being treated.',
      },
      {
        title: 'Indications',
        paragraphs: [
          "Paralysis or weakness of the face, trunk or limbs from stroke, MS, spinal cord injury, traumatic brain injury, paraplegia, acute myelitis, progressive muscle wasting, neuritis, polio and post-polio syndrome, periodic paralysis, functional (hysterical) paralysis, Bell's palsy, Charcot-Marie-Tooth disease, or brain damage after surgery. Stroke, MS and trauma are the most common.",
        ],
      },
      {
        title: 'Clinical notes',
        items: [
          { label: 'Clot-related stroke', text: 'start as soon as possible.' },
          { label: 'Bleed-related stroke', text: 'wait until the patient is stable, usually at least a month.' },
          { text: 'Results are best in the first year. Older impairments respond more slowly, and recovery is unlikely once muscle wasting and stiff joints have set in.' },
          { label: "MS and Parkinson's", text: 'relief is often temporary, lasting hours to months, so ongoing treatment is needed. Gains after stroke or injury usually last.' },
          { label: 'Side', text: 'treat the side of the scalp opposite the affected limb. For example, a right leg is treated through the left Motor Area. If surgery or injury has removed part of the brain or scalp, needle the same side instead.' },
          { label: 'Why it may work', text: 'damaged areas can partly recover, and stimulation may help other areas take over their function.' },
        ],
      },
    ],
  },
  'Sensory Area': {
    id: 'TCM-sensory-area',
    name: 'Sensory Area',
    system: 'TCM',
    sections: [
      {
        title: 'Location',
        paragraphs: [
          'The Sensory Area sits over the postcentral gyrus of the parietal lobe. It runs parallel to the Motor Area, 1.5 cm behind it, and is one of the most frequently used zones.',
        ],
      },
      {
        title: 'Function',
        paragraphs: [
          'The sensory cortex handles feeling on the opposite side of the body below the neck, while head and face sensation is mostly processed on both sides. The map is upside down, as in the Motor Area: legs at the top, arms in the middle, head and face at the bottom.',
        ],
      },
      {
        title: 'Divisions',
        paragraphs: ['Divide the line as for the Motor Area:'],
        items: [
          { label: 'Upper 1/5', text: 'opposite-side leg, trunk, back, chest and neck' },
          { label: 'Middle 2/5', text: 'opposite-side arm' },
          { label: 'Lower 2/5', text: 'head and face, including migraine, headache, trigeminal neuralgia, toothache and TMJ pain' },
        ],
        after: 'Needle downward from the top end, through the full length of the zone being treated.',
      },
      {
        title: 'Indications',
        paragraphs: [
          'Reduced or heightened sensation, pain, tingling or numbness in the face, trunk or limbs. Reported uses include:',
        ],
        items: [
          { text: 'Sensory loss or pain after stroke or injury' },
          { text: 'MS numbness and tingling' },
          { text: 'Phantom limb, stump and complex regional pain' },
          { text: 'Trigeminal neuralgia and TMJ pain' },
          { text: 'Migraine and cluster headache' },
          { text: 'Shingles' },
          { text: 'Neck, shoulder, back and low-back pain, and sciatica' },
          { text: 'Gout, plantar fasciitis and fibromyalgia' },
          { text: 'Neuropathy and paraesthesia' },
        ],
      },
      {
        title: 'Clinical notes',
        items: [
          { label: 'Side', text: 'treat limb symptoms on the opposite side. For example, right leg pain is treated through the left Sensory Area. If surgery or injury has removed part of the brain or scalp, use the same side instead.' },
          { text: 'Relief from pain, numbness and tingling can be fast, sometimes within seconds or minutes of insertion.' },
        ],
      },
    ],
  },
  'Chorea and Tremor Area': {
    id: 'TCM-chorea-tremor-area',
    name: 'Chorea and Tremor Area',
    system: 'TCM',
    sections: [
      { title: 'Location', paragraphs: ["A 4 cm line parallel to the Motor Area and 1.5 cm in front of it. It starts 1 cm in front of the head's midpoint."] },
      { title: 'Function', paragraphs: ['It lies over the premotor cortex, which steadies voluntary movement and regulates muscle tone.'] },
      { title: 'Needling', paragraphs: ['Both sides, downward from the top through the full length.'] },
      {
        title: 'Indications',
        items: [
          { text: "Parkinson's disease" },
          { text: 'Tremor or shaking of the head, body or limbs' },
          { text: 'Chorea and tics' },
          { text: 'Restless legs' },
          { text: 'Dystonia' },
          { text: 'Muscle tension or tightness anywhere in the body' },
        ],
      },
    ],
  },
  'Vascular Dilation and Constriction Area': {
    id: 'TCM-vascular-area',
    name: 'Vascular Dilation and Constriction Area',
    system: 'TCM',
    sections: [
      { title: 'Location', paragraphs: ['Parallel to the Chorea and Tremor Area, 1.5 cm in front of it (3 cm in front of the Motor Area).'] },
      { title: 'Needling', paragraphs: ['Both sides, downward from the top through the full length.'] },
      { title: 'Indications', paragraphs: ['Essential hypertension, cortical oedema and other autonomic blood vessel disorders.'] },
    ],
  },
  'Vertigo and Hearing Area': {
    id: 'TCM-vertigo-hearing-area',
    name: 'Vertigo and Hearing Area',
    system: 'TCM',
    sections: [
      { title: 'Location', paragraphs: ['A 4 cm horizontal line over the temporal lobe, centred 1.5 cm above the top of the ear. It extends 2 cm forward and 2 cm back.'] },
      { title: 'Needling', paragraphs: ['Both sides, in either direction.'] },
      { title: 'Indications', paragraphs: ["Vertigo, dizziness, Ménière's disease, tinnitus, hearing loss and auditory hallucinations."] },
    ],
  },
  'Speech I Area': {
    id: 'TCM-speech-1-area',
    name: 'Speech I Area',
    system: 'TCM',
    sections: [
      { title: 'Location', paragraphs: ["The same as the lower two-fifths of the Motor Area. It lies over Broca's area, which controls the muscles of speech and voice."] },
      { title: 'Needling', paragraphs: ['Both sides, downward from the top through the full length.'] },
      { title: 'Indications', paragraphs: ['Slurred speech, voice loss or motor aphasia after stroke or brain injury, where the speech muscles are paralysed.'] },
    ],
  },
  'Speech II Area': {
    id: 'TCM-speech-2-area',
    name: 'Speech II Area',
    system: 'TCM',
    sections: [
      { title: 'Location', paragraphs: ['Find the parietal tubercle. Start 2 cm behind it, then run a 3 cm line parallel to the front–back midline.'] },
      { title: 'Function', paragraphs: ['It lies over the parietal region involved in reading and understanding.'] },
      { title: 'Needling', paragraphs: ['Both sides, from the upper end through the full length.'] },
      { title: 'Indications', paragraphs: ['Nominal aphasia, where the patient can describe an object but cannot name it.'] },
    ],
  },
  'Speech III Area': {
    id: 'TCM-speech-3-area',
    name: 'Speech III Area',
    system: 'TCM',
    sections: [
      { title: 'Location', paragraphs: ["A 4 cm line running backward from the point 1.5 cm directly above the ear. It covers the back half of the Vertigo and Hearing Area and lies over Wernicke's area."] },
      { title: 'Needling', paragraphs: ['Both sides, forward or backward through the full length.'] },
      { title: 'Indications', paragraphs: ['Receptive aphasia, where speech is clear but lacks meaning.'] },
    ],
  },
  'Praxis Area': {
    id: 'TCM-praxis-area',
    name: 'Praxis Area',
    system: 'TCM',
    sections: [
      { title: 'Location', paragraphs: ['Three lines starting at the parietal tubercle: one straight down, and one angled 40° forward and one 40° back. This zone is rarely used.'] },
      { title: 'Indications', paragraphs: ['Apraxia, which is difficulty with skilled tasks such as buttoning a shirt.'] },
    ],
  },
  // From here on, areas not drawn on tcm-scalp-areas.svg: reachable from
  // the TCM Area menu only, with no diagram highlight.
  'Vision Area': {
    id: 'TCM-vision-area',
    name: 'Vision Area',
    system: 'TCM',
    sections: [
      { title: 'Location', paragraphs: ['Start 1 cm to the side of the occipital protuberance, level with it. Run a 4 cm line upward, parallel to the midline.'] },
      { title: 'Function', paragraphs: ['It lies over the occipital lobe.'] },
      { title: 'Needling', paragraphs: ['Usually both sides. Always needle from top to bottom. Needling upward from below risks injuring the medulla if the angle or depth is wrong.'] },
      { title: 'Indications', paragraphs: ['Vision loss or visual field loss after stroke or brain injury, double vision, visual hallucinations and nystagmus.'] },
    ],
  },
  'Balance Area': {
    id: 'TCM-balance-area',
    name: 'Balance Area',
    system: 'TCM',
    sections: [
      { title: 'Location', paragraphs: ['Start 3.5 cm to the side of the occipital protuberance, level with it. Run a 4 cm line downward.'] },
      { title: 'Function', paragraphs: ['It lies over the cerebellum.'] },
      { title: 'Needling', paragraphs: ['Both sides. Always needle from top to bottom, because of the risk to the medulla.'] },
      { title: 'Indications', paragraphs: ["Unsteadiness, cerebellar atrophy, cerebellar stroke, MS, Parkinson's, ataxia and poor balance after brain injury."] },
    ],
  },
  'Foot Motor and Sensory Area': {
    id: 'TCM-fmsa',
    name: 'Foot Motor and Sensory Area (FMSA)',
    system: 'TCM',
    sections: [
      { title: 'Location', paragraphs: ["A 4 cm line parallel to the front–back midline and 1 cm to the side of it. It starts level with the head's midpoint and runs backward. It is named for the foot zones of the Motor and Sensory Areas, which it contains."] },
      { title: 'Function', paragraphs: ['This is the most widely used zone, with broad motor and sensory effects. It lies over endocrine structures, including the pituitary and adrenal glands, so it is described as acting on both the nervous and endocrine systems.'] },
      { title: 'Needling', paragraphs: ['Both sides, in either direction. Front to back is usually easier.'] },
      {
        title: 'Indications',
        items: [
          { label: 'Legs and feet', text: 'paralysis, restless legs, numbness and tingling' },
          { label: 'Leg or foot pain', text: 'gout, neuropathy, plantar fasciitis, complex regional pain (RSD), fibromyalgia, phantom limb and stump pain' },
          { label: 'Other pain', text: 'neck and shoulder' },
          { label: 'Bladder and bowel', text: 'urinary or faecal incontinence, bedwetting, IBS' },
          { label: 'Sexual and reproductive', text: 'impotence, premature ejaculation, low libido, infertility, uterine or bladder prolapse, absent or painful periods, abnormal uterine bleeding' },
          { label: 'Skin', text: 'psoriasis, neurodermatitis, shingles' },
          { label: 'Mind and brain', text: 'ADHD, PTSD, post-concussion syndrome, poor memory or concentration, emotional disturbance, intellectual disability' },
        ],
      },
      { title: 'Caution', paragraphs: ['Avoid during pregnancy, because of a theoretical risk of triggering uterine contractions.'] },
    ],
  },
  // Internal Organ Areas: each ends with the shared group note below.
  'Head Area': organArea('TCM-head-area', 'Head Area',
    'A line on the forehead midline, from 2 cm above to 2 cm below the hairline.',
    'Insomnia, poor memory or concentration, anxiety and depression.'),
  'Stomach Area': organArea('TCM-stomach-area', 'Stomach Area',
    'A 2 cm line running up from the hairline along the mid-pupillary line.',
    'Stomach pain and upper abdominal discomfort.'),
  'Thoracic Cavity Area': organArea('TCM-thoracic-cavity-area', 'Thoracic Cavity Area',
    'Halfway between the Stomach Area and the midline, from 2 cm above to 2 cm below the hairline.',
    'Asthma and rapid heartbeat.'),
  'Liver and Gallbladder Area': organArea('TCM-liver-gallbladder-area', 'Liver and Gallbladder Area',
    'A 2 cm line running down from the hairline along the mid-pupillary line.',
    'Rib-side pain from hepatitis, gallstones or shingles.'),
  'Reproductive Area': organArea('TCM-reproductive-area', 'Reproductive Area',
    'A 2 cm line running up from the frontal corner of the hairline.',
    'Period pain, abnormal bleeding and urinary tract infection.'),
  'Large Intestine Area': organArea('TCM-large-intestine-area', 'Large Intestine Area',
    'A 2 cm line running down from the frontal corner of the hairline, continuing the Reproductive Area.',
    'Diarrhoea and constipation.'),
}

function organArea(id, name, location, indications) {
  return {
    id,
    name,
    system: 'TCM',
    sections: [
      { title: 'Location', paragraphs: [location] },
      { title: 'Indications', paragraphs: [indications] },
      { title: 'Internal Organ Areas', paragraphs: [INTERNAL_ORGAN_NOTE] },
    ],
  }
}
