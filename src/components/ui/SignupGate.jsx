import { Link } from 'react-router-dom'
import CrossIcon from './CrossIcon'
import { GUEST_POINT_LIMIT, GUEST_WARN_AT } from '../../hooks/useGuestAllowance'

// Popup shown when a visitor has used their free descriptions. The diagrams
// stay usable behind it; closing it just keeps exploring.
export function SignupGate({ onClose }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="signup-gate-title"
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-sm rounded-xl bg-white dark:bg-gray-950 shadow-2xl p-6 text-center"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-orange-500 hover:bg-orange-600 text-white shadow"
        ><CrossIcon size={14} strokeWidth={3.5} /></button>
        <h2 id="signup-gate-title" className="text-lg font-bold text-black dark:text-white mb-2">Enjoying AcuMap?</h2>
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-5">
          You've opened {GUEST_POINT_LIMIT} point descriptions. Create a free account to keep reading them —
          no card needed. The diagrams stay open to explore.
        </p>
        <Link
          to="/register"
          className="block w-full rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm py-2.5 transition-colors"
        >
          Create a free account
        </Link>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
          Already have one? <Link to="/login" className="font-semibold text-amber-600 dark:text-amber-400 hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  )
}

// Small reminder above a description once few free ones are left.
export function GuestNotice({ remaining }) {
  if (remaining > GUEST_WARN_AT) return null
  return (
    <div className="mx-4 mt-3 rounded-lg bg-amber-500/10 border border-amber-500/30 px-3 py-2 text-xs text-gray-700 dark:text-gray-300">
      {remaining > 0
        ? <>{remaining} free {remaining === 1 ? 'description' : 'descriptions'} left. </>
        : <>That was your last free description. </>}
      <Link to="/register" className="font-semibold text-amber-600 dark:text-amber-400 hover:underline">Create a free account</Link>
      {' '}to keep going — no card needed.
    </div>
  )
}
