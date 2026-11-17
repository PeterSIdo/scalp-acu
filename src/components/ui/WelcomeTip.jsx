import CrossIcon from './CrossIcon'

// One-time welcome for first-time visitors: what AcuMap is and what to do
// first. Open/dismiss state lives in useWelcomeTip.

// Floats at the bottom of the screen, above the diagrams.
export default function WelcomeTip({ onDismiss }) {
  return (
    <div className="fixed inset-x-0 bottom-4 z-40 flex justify-center px-4 pointer-events-none">
      <div
        role="status"
        className="pointer-events-auto relative w-full max-w-md rounded-xl bg-white dark:bg-gray-950 border border-amber-500/40 shadow-2xl px-5 py-4 pr-12"
      >
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Close"
          className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full bg-orange-500 hover:bg-orange-600 text-white shadow"
        ><CrossIcon size={12} strokeWidth={3.5} /></button>
        <p className="text-sm font-bold text-black dark:text-white mb-1">Welcome to AcuMap</p>
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          <span className="md:hidden">Tap</span><span className="hidden md:inline">Click</span> any point on a diagram
          to see its location and indications. <span className="md:hidden">Tap</span><span className="hidden md:inline">Click</span> a
          card to enlarge it, and use the tabs at the top to switch between YNSA, TCM, ZSA and ear acupuncture.
        </p>
        <button
          type="button"
          onClick={onDismiss}
          className="mt-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm px-4 py-1.5 transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
  )
}
