// Privacy note + medical disclaimer, shown on /privacy. Keep it in step with
// what the app really stores: User (name, email, password hash, signupRef),
// Feedback (answers, rating, context, optional email), the `token` login
// cookie and the acumap.* / theme_v2 localStorage keys.
import { CONTACT_EMAIL } from './contact'
import { ABOUT_APP } from './aboutApp'

const DISCLAIMER = ABOUT_APP.sections.find(s => s.title === 'Disclaimer').paragraphs

export const PRIVACY_UPDATED = '17 November 2026'

export const PRIVACY_SECTIONS = [
  {
    title: 'In short',
    paragraphs: [
      'We collect only what is needed to run your account and improve AcuMap. We do not sell your data, show adverts or use tracking or analytics tools.',
    ],
  },
  {
    title: 'What we store',
    items: [
      'Your account: full name, email address and password. The password is stored only in scrambled (hashed) form, so nobody can read it.',
      'Where you came from: if you joined through a link with a “ref” tag (for example from a Facebook post), we keep that tag with your account so we know which posts reach people.',
      'Feedback you send: your answers and rating, which part of the app you were using, and your email if you are signed in or chose to give it.',
    ],
  },
  {
    title: 'Cookies and browser storage',
    paragraphs: [
      'We use one cookie, which keeps you logged in for up to 7 days. Your browser also keeps a few small settings on your own device: light or dark theme, whether you have seen the welcome tip, how many free point descriptions you have opened as a visitor, and the “ref” tag above. None of these are used for advertising or tracking.',
    ],
  },
  {
    title: 'Why we use it',
    paragraphs: [
      'To give you access to your account, to reply to you if you ask us to, and to decide what to improve or add next. We may email you about your account or important changes to AcuMap; we will not send marketing without asking.',
    ],
  },
  {
    title: 'Who else handles it',
    paragraphs: [
      'The app and its database are hosted by Railway, and this information is stored on their servers. Our landing page acumap.net is hosted by GitHub Pages and loads its font from Google Fonts. Email to us is handled by 123-reg. We do not share your data with anyone else.',
    ],
  },
  {
    title: 'Your choices',
    paragraphs: [
      `You can ask us at any time what we hold about you, to correct it, or to delete your account and everything linked to it. Just email ${CONTACT_EMAIL} from the address you signed up with. We keep your account until you ask us to delete it.`,
    ],
  },
  {
    title: 'Medical disclaimer',
    paragraphs: DISCLAIMER,
  },
  {
    title: 'Contact',
    paragraphs: [`Questions about this note or your data: ${CONTACT_EMAIL}.`],
  },
]
