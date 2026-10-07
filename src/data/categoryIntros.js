// Introductory text for each point category (YNSA, TCM), keyed by subgroup id.
// Shown in the InfoPanel (desktop) / bottom sheet (mobile) via the
// "About … Points" link in each grid's top-left tile — same place a
// selected point's description appears. isCategory tells InfoPanel to
// render this layout instead of the point layout.
// Categories with no entry here simply don't show the link.
export const CATEGORY_INTROS = {
  'ynsa-basic': {
    isCategory: true,
    linkLabel: 'About Basic Points',
    name: 'Basic Points',
    system: 'YNSA',
    paragraphs: [
      'The Basic points were the first group Dr Toshikatsu Yamamoto discovered and remain the foundation of YNSA. They form a somatotopic map of the body, meaning each point corresponds to a specific body region, such as the head, cervical spine, shoulders, arms, thoracic spine or lower back and legs.',
      'The Yin Basic points sit along the frontal hairline, and a mirror set of Yang Basic points lies at the back of the head. Like all YNSA points, they appear on both sides of the head. Treatment is usually given on the same side as the complaint, though both sides can be used.',
      'The Basic points are mainly used for pain and musculoskeletal conditions, including headaches, neck and back pain, shoulder problems, joint pain and sciatica. They are also widely used in neurological rehabilitation, such as after a stroke, and for movement and sensory disturbances.',
      'Points are selected according to the area affected and confirmed by palpation, since the correct point is usually tender or slightly indurated. Results are often felt quickly, and range of movement or pain level can be rechecked straight after needling. The Basic points are frequently combined with the Y points when a condition has both a structural and an internal component.',
    ],
  },
  'ynsa-sensory': {
    isCategory: true,
    linkLabel: 'About Sensory Points',
    name: 'Sensory Points',
    system: 'YNSA',
    paragraphs: [
      'The Sensory points are a group of four points relating to the sense organs: the Eye, Nose, Mouth and Ear points. They lie on the forehead close to the Basic A point at the frontal hairline (Yin), with a mirror set at the back of the head (Yang). Like all YNSA points, they appear on both sides of the head.',
      'Each Sensory point influences its corresponding organ and the surrounding area. They are used for conditions such as eye strain and visual disturbances, sinusitis, rhinitis and hay fever, toothache, mouth and jaw problems, tinnitus, hearing difficulties and dizziness. They can also help with facial pain and with headaches linked to these areas.',
      'Points are selected according to the complaint and confirmed by palpation, since the correct point is usually tender. The Sensory points are often combined with the Basic A point for head and facial complaints, and with the relevant Y points when an internal pattern is involved, for example the Liver Y point for eye problems or the Kidney Y point for tinnitus.',
    ],
  },
  'ynsa-brain': {
    isCategory: true,
    linkLabel: 'About Brain Points',
    name: 'Brain Points',
    system: 'YNSA',
    paragraphs: [
      'The Brain points are a group of three points, usually named the Cerebrum, Cerebellum and Basal Ganglia points. They sit near the midline of the forehead close to the frontal hairline (Yin), with a mirror set at the back of the head (Yang). Like all YNSA points, they appear on both sides of the head.',
      "They influence the central nervous system and are mainly used for neurological conditions and functions controlled by the brain. Typical uses include rehabilitation after stroke, Parkinson's disease and tremor, multiple sclerosis, balance and coordination problems, dizziness and vertigo, and cognitive and concentration difficulties. They are also used for sleep problems, depression, anxiety and emotional imbalance.",
      'Points are selected according to the condition and confirmed by palpation. In practice, the Brain points are rarely used alone. They are usually combined with the Basic points, which address the affected body region, and with the Y points, which address any underlying internal pattern. In stroke rehabilitation, for example, the Cerebrum point is commonly combined with the Basic points for the affected limbs.',
    ],
  },
  'ynsa-neck': {
    isCategory: true,
    linkLabel: 'About Y Points',
    name: 'Y Points (Ypsilon Points)',
    system: 'YNSA',
    paragraphs: [
      'The Y points are a group of 12 points in Yamamoto New Scalp Acupuncture (YNSA), each linked to one of the 12 main meridians and their associated organ systems in Traditional Chinese Medicine. They are located in the temporal region of the scalp, with the Yin points in front of the ear and the Yang points behind it. Like all YNSA points, they are mirrored on both sides of the head.',
      'Each Y point influences the function of its corresponding meridian and organ. They are mainly used for internal and functional conditions such as digestive problems, respiratory complaints, sleep disturbance, stress, emotional imbalance and hormonal issues, and to support general wellbeing. This makes them a complement to the Basic points, which work mostly on pain and the locomotor system.',
      'The right Y point is usually chosen through YNSA diagnosis, most often neck (cervical) diagnosis or abdominal diagnosis, in which tender or tense zones show which meridian needs treating. The matching Y point is then needled, and the diagnostic zone is rechecked. A softer, less tender zone confirms that the right point was chosen.',
    ],
    listTitle: 'The 12 Y points',
    groups: [
      { label: 'Yin',  items: ['Lung', 'Pericardium', 'Heart', 'Spleen', 'Liver', 'Kidney'] },
      { label: 'Yang', items: ['Large Intestine', 'San Jiao (Triple Burner)', 'Small Intestine', 'Stomach', 'Gallbladder', 'Bladder'] },
    ],
  },
  // Second link on the Y-Points tile, right of "About Y Points". `steps`
  // render as a numbered list: bold label, then text.
  'ynsa-neck-flow': {
    isCategory: true,
    linkLabel: 'Diagnostic Flow',
    name: 'Diagnostic Flow',
    system: 'YNSA',
    steps: [
      { label: 'Take the history.', text: 'Note the main complaint, the affected area and any internal or emotional symptoms.' },
      { label: 'Palpate the diagnostic zones.', text: 'Use gentle, even pressure on both sides of the neck or abdomen, comparing left with right.' },
      { label: 'Identify positive zones.', text: 'Look for tenderness, tension or hardness, and note which side and which zone it is in.' },
      { label: 'Select the Y point.', text: 'Match each positive zone to its Y point on the same side, choosing Yin or Yang according to the zone.' },
      { label: 'Needle and recheck.', text: 'Insert the needle, then palpate the zone again. Reduced tenderness confirms the correct point. If there is no change, adjust the needle position slightly and recheck.' },
      { label: 'Add other points as needed.', text: 'Use the Basic, Sensory or Brain points for the specific complaint, for example the Basic points for pain in a body region.' },
      { label: 'Reassess the complaint.', text: 'Check pain, range of movement or symptoms before ending the session.' },
    ],
  },
  'tcm-scalp-areas': {
    isCategory: true,
    linkLabel: 'About TCM Scalp Acupuncture',
    name: 'TCM Scalp Acupuncture',
    system: 'TCM',
    paragraphs: [
      'Scalp acupuncture is a modern development within Chinese medicine. Rather than following the traditional meridian channels, it is based on a map of the scalp that mirrors the functional areas of the brain beneath it, such as the regions governing movement, sensation, vision, speech, hearing and balance.',
      'Instead of treating single points, the practitioner needles whole zones. Fine needles are inserted at a shallow angle just under the skin, running along each zone, and are then stimulated with specific manipulation techniques. The aim is to influence brain activity and, through it, to restore and strengthen the functions of the body.',
      'Scalp acupuncture also differs from traditional acupuncture in its approach to treatment. Traditional practice is highly individual, and two practitioners may choose quite different points for the same complaint. Scalp acupuncture is more standardised: patients with the same diagnosis usually receive the same or very similar treatment, much as in Western medicine.',
      'By bringing together classical Chinese needling with Western understanding of the nervous system, scalp acupuncture is used particularly for conditions affecting the brain and nervous system, including paralysis and speech difficulties after stroke.',
    ],
  },
}
