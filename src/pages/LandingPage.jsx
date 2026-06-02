import { Link } from 'react-router-dom'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-gray-800">
        <span className="text-xl font-bold text-amber-400">ScalpAcu</span>
        <div className="flex gap-4">
          <Link to="/login" className="text-gray-400 hover:text-white transition-colors">Log in</Link>
          <Link to="/register" className="bg-amber-500 hover:bg-amber-400 text-black font-semibold px-4 py-2 rounded-lg transition-colors">
            Start Free Trial
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-8 py-24 text-center">
        <h1 className="text-5xl font-bold mb-6 leading-tight">
          Learn Scalp Acupuncture<br />
          <span className="text-amber-400">Interactively in 3D</span>
        </h1>
        <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
          An educational tool for acupuncture therapists. Explore YNSA points on a
          3D rotatable head model. Click any point to see its name, clinical description,
          and indications.
        </p>
        <Link
          to="/register"
          className="inline-block bg-amber-500 hover:bg-amber-400 text-black font-bold px-8 py-4 rounded-xl text-lg transition-colors"
        >
          Start 14-Day Free Trial
        </Link>
        <p className="text-gray-500 mt-4 text-sm">No credit card required to start</p>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: '3D Interactive Model', desc: 'Rotate and zoom a realistic head bust. Explore points from any angle.' },
            { title: 'YNSA System', desc: 'Full Yamamoto New Scalp Acupuncture point set with clinical descriptions.' },
            { title: 'Built for Therapists', desc: 'Concise indications, needling depth, and zone information for every point.' },
          ].map(f => (
            <div key={f.title} className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-amber-400 mb-2">{f.title}</h3>
              <p className="text-gray-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-sm mx-auto px-8 py-16 text-center">
        <h2 className="text-3xl font-bold mb-8">Simple Pricing</h2>
        <div className="bg-gray-900 border border-amber-500/30 rounded-2xl p-8">
          <div className="text-4xl font-bold text-amber-400 mb-1">£14.99<span className="text-xl font-normal text-gray-400">/mo</span></div>
          <p className="text-gray-400 mb-6">14-day free trial included</p>
          <ul className="text-left space-y-3 mb-8 text-gray-300">
            {['All YNSA scalp points', 'Full clinical descriptions', '3D interactive viewer', 'New content as it is added'].map(item => (
              <li key={item} className="flex gap-2">
                <span className="text-amber-400">✓</span> {item}
              </li>
            ))}
          </ul>
          <Link
            to="/register"
            className="block w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-3 rounded-lg transition-colors"
          >
            Start Free Trial
          </Link>
        </div>
      </section>

      <footer className="border-t border-gray-800 px-8 py-6 text-center text-gray-600 text-sm space-y-1">
        <p>© CareTrace 2026 · For educational use only</p>
      </footer>
    </div>
  )
}
