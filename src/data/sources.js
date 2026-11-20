// Reference books the app's text is based on, keyed by a short id. Data
// entries point here with `source: '<id>'`. The text itself is written in
// our own words, not quoted.
export const SOURCES = {
  'yamamoto-ynsa': {
    title: 'YNSA',
    author: 'Toshikatsu Yamamoto, M.D., Ph.D., Helene Yamamoto, S.R.N.',
  },
  'huang-auriculotherapy': {
    title: 'Auriculotherapy Diagnosis and Treatment',
    author: 'Dr Li-Chun Huang, MD, O.M.D.',
  },
  'chen-single-point': {
    title: '100 Diseases Treated by Single Point of Acupuncture and Moxibustion',
    author: 'Chen Decheng',
    publisher: 'Foreign Languages Press, Beijing',
    year: 2001,
    isbn: '7-119-02744-1',
  },
  // A clinic's own case report, not a book: shown as "Source: <title>".
  'lothian-massage-acupuncture': {
    title: 'Lothian Massage & Acupuncture',
    kind: 'clinic',
  },
  'zhu-color-atlas': {
    title: "Color Atlas of Zhu's Scalp Acupuncture",
    series: "Zhu's Scalp Acupuncture Clinical Series",
    edition: 'English Edition',
    author: 'Ming Qing Zhu, L.Ac.',
    translator: 'Moyee Siu',
    publisher: "Zhu's Neuro-Acupuncture Center, Inc.",
    place: 'San Jose, CA',
    year: 2007,
    isbn: '978-0-9747178-0-7',
    url: 'https://www.scalpacupuncture.org',
    notice: "Zhu's Scalp Acupuncture is a trademark of Zhu's Neuro-Acupuncture Center, Inc. This app is not affiliated with or endorsed by Zhu's Neuro-Acupuncture Center.",
  },
}
