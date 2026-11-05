// Articles for the "Cases" tab: case studies, methods and treatment reports.
// Each article is one entry; every section except title is optional, so
// method-only or case-only articles fit the same shape.
//
// {
//   id, title, condition?, tags?: [string],
//   points?: [{ name, code, location }],
//   methods?: [{ name, indication?, text }],
//   results?: [{ label, text }],
//   cases?: [string],
//   discussion?: [string],
//   source?: '<SOURCES id>',
// }

export const CASES = [
  {
    id: 'headache-gb20',
    title: 'Headache',
    condition: 'Headache',
    tags: ['Acupressure', 'Electroacupuncture'],
    points: [
      {
        name: 'Fengchi',
        code: 'GB 20',
        location: 'On the nape, below the occipital bone, level with Fengfu (DU 16), in the hollow between the upper ends of the sternocleidomastoid and trapezius muscles.',
      },
    ],
    methods: [
      {
        name: 'Acupressure',
        indication: 'Mild headache',
        text: 'Patient seated. Press or roll both GB 20 points with thumb and middle finger, starting gently and gradually increasing pressure. 10–15 min daily for 7 days.',
      },
      {
        name: 'Electroacupuncture',
        indication: 'Moderate to severe headache',
        text: 'Patient seated. Insert a 1.5 cun needle at each GB 20, directed towards the opposite ear, 1.2–1.3 cun deep. Obtain qi sensation, then apply continuous-wave stimulation for 20–30 min. 1 course = 10 treatments.',
      },
    ],
    results: [
      {
        label: 'Acupressure',
        text: '56 cases (functional, hypertensive and menstrual headache, 1 to 5+ years). 36 cured, 19 improved, 1 no effect. Max 2 courses.',
      },
      {
        label: 'Electroacupuncture',
        text: '260 cases (sinusitis or drug-related headache). 258 cured, 2 no improvement after 1 course.',
      },
    ],
    cases: [
      'Boy, 9, with severe headache for 6 months. Exam and CT normal. Improved after session 1 and resolved after session 5.',
      'Woman, 56, with temporal headache for 10 years, worse with cold and overwork. Relieved after 3 sessions.',
    ],
    discussion: [
      'Choose the method by severity: acupressure for mild headache, electroacupuncture for stronger headache.',
      'GB 20 lies close to major neck muscles, nerves and vessels supplying the head. Stimulating it improves qi and blood flow locally, which relieves headache.',
    ],
  },
]

// Flat text of an article, for the list search.
export function caseText(c) {
  return [
    c.title, c.condition, ...(c.tags ?? []),
    ...(c.points ?? []).flatMap(p => [p.name, p.code]),
    ...(c.methods ?? []).map(m => m.name),
  ].filter(Boolean).join(' ').toLowerCase()
}
