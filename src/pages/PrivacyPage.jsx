import { Link } from 'react-router-dom'
import { PRIVACY_SECTIONS, PRIVACY_UPDATED } from '../data/privacy'

// Public page (no login): privacy note + medical disclaimer.
export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <nav className="flex items-center justify-between px-4 sm:px-8 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <Link to="/viewer" className="text-xl font-bold text-amber-500 dark:text-amber-400">AcuMap</Link>
        <Link to="/viewer" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Open the app</Link>
      </nav>
      <main className="max-w-2xl mx-auto px-4 sm:px-8 py-10 sm:py-14">
        <h1 className="text-3xl font-bold mb-2">Privacy &amp; disclaimer</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-10">Last updated {PRIVACY_UPDATED}</p>
        {PRIVACY_SECTIONS.map(section => (
          <section key={section.title} className="mb-8">
            <h2 className="text-lg font-bold mb-2 text-amber-600 dark:text-amber-400">{section.title}</h2>
            {section.paragraphs?.map((p, i) => (
              <p key={i} className="text-gray-700 dark:text-gray-300 leading-relaxed mb-2">{p}</p>
            ))}
            {section.items && (
              <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300 leading-relaxed">
                {section.items.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            )}
          </section>
        ))}
      </main>
    </div>
  )
}
