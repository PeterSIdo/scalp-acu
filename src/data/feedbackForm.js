// Questions for the in-app feedback form. Edit wording or options here; the
// answers are saved by `id`, so keep an id unchanged once feedback exists.
//
// type: 'stars' (1-5), 'choice' (one), 'multi' (several), 'text' (free text).
// Only `required` questions must be answered; everything else can be skipped.
export const FEEDBACK_QUESTIONS = [
  {
    id: 'overall',
    type: 'stars',
    label: 'Overall, how useful is AcuMap for you?',
    required: true,
  },
  {
    id: 'role',
    type: 'choice',
    label: 'What best describes you?',
    options: ['Student', 'Practitioner', 'Teacher', 'Other'],
  },
  {
    id: 'systems',
    type: 'multi',
    label: 'Which parts did you use?',
    options: ['YNSA', 'TCM Scalp', 'ZSA', 'Auriculotherapy'],
  },
  {
    id: 'device',
    type: 'multi',
    label: 'Which devices did you use it on?',
    options: ['Phone', 'Tablet', 'Computer'],
  },
  {
    id: 'ease',
    type: 'stars',
    label: 'How easy was it to find the point or area you were looking for?',
  },
  {
    id: 'diagrams',
    type: 'stars',
    label: 'How clear are the diagrams?',
  },
  {
    id: 'useful',
    type: 'text',
    label: 'What did you find most useful?',
    placeholder: 'e.g. the ear formulas, the YNSA neck diagnosis…',
  },
  {
    id: 'improve',
    type: 'text',
    label: 'What should we improve or add?',
    placeholder: 'Missing points or systems, confusing screens, features you would like…',
  },
  {
    id: 'errors',
    type: 'text',
    label: 'Did you notice any mistakes in point locations or descriptions?',
    placeholder: 'Please name the point and what looks wrong',
  },
  {
    id: 'recommend',
    type: 'choice',
    label: 'Would you recommend AcuMap to a colleague or fellow student?',
    options: ['Yes', 'Maybe', 'No'],
  },
  {
    id: 'subscribe',
    type: 'choice',
    label: 'Would you pay a small subscription for the full app?',
    options: ['Yes', 'Maybe', 'No'],
  },
  {
    id: 'contact',
    type: 'choice',
    label: 'May we email you about your feedback?',
    options: ['Yes', 'No'],
  },
]
