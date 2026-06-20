const Divider = () => <hr className="border-gray-200 dark:border-gray-700/60 my-4" />

export default function InfoPanel({ point, isSubscribed }) {
  if (!point) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6 text-center">
        <div className="text-4xl mb-4">☝️</div>
        <p className="text-lg text-black dark:text-gray-400">Click a point on the model to see its details</p>
        <p className="text-sm mt-2 text-gray-600 dark:text-gray-500">Gold points are available, grey points require a subscription</p>
      </div>
    )
  }

  return (
    <div className="p-6 overflow-y-auto h-full">
      <div className="flex items-start justify-between mb-1">
        <h2 className="text-xl font-bold text-black dark:text-white leading-tight">{point.name}</h2>
      </div>
      <div className="flex gap-2 mb-4">
        <span className="bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold px-2 py-0.5 rounded">
          {point.system}
        </span>
        <span className="bg-gray-100 dark:bg-gray-700 text-black dark:text-gray-300 text-xs font-semibold px-2 py-0.5 rounded capitalize">
          {point.zone}
        </span>
        {point.side && point.side !== 'midline' && (
          <span className="bg-gray-100 dark:bg-gray-700 text-black dark:text-gray-300 text-xs font-semibold px-2 py-0.5 rounded capitalize">
            {point.side}
          </span>
        )}
      </div>

      <p className="text-black dark:text-gray-300 mb-4">{point.shortDescription}</p>

      {point.reactionArea && (
        <>
          <Divider />
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Reaction Area</h3>
            <p className="text-black dark:text-gray-300 text-sm leading-relaxed">{point.reactionArea}</p>
          </div>
        </>
      )}

      {point.location && (
        <>
          <Divider />
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Location</h3>
            <p className="text-black dark:text-gray-300 text-sm leading-relaxed">{point.location}</p>
          </div>
        </>
      )}

      {point.longDescription && (
        <>
          <Divider />
          <p className="text-gray-700 dark:text-gray-400 text-sm leading-relaxed mb-4">{point.longDescription}</p>
        </>
      )}

      {point.indications?.length > 0 && (
        <>
          <Divider />
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Indications</h3>
            <div className="flex flex-wrap gap-1.5">
              {point.indications.map(ind => (
                <span key={ind} className="bg-gray-100 dark:bg-gray-800 text-black dark:text-gray-300 text-xs px-2 py-1 rounded">
                  {ind}
                </span>
              ))}
            </div>
          </div>
        </>
      )}

      {point.needlingDepth && (
        <>
          <Divider />
          <div>
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Needling Depth</h3>
            <p className="text-black dark:text-gray-300 text-sm">{point.needlingDepth}</p>
          </div>
        </>
      )}
    </div>
  )
}
