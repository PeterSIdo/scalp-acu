const Divider = () => <hr className="border-gray-700/60 my-4" />

export default function InfoPanel({ point, isSubscribed }) {
  if (!point) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 px-6 text-center">
        <div className="text-4xl mb-4">☝️</div>
        <p className="text-lg">Click a point on the model to see its details</p>
        <p className="text-sm mt-2">Gold points are available, grey points require a subscription</p>
      </div>
    )
  }

  return (
    <div className="p-6 overflow-y-auto h-full">
      <div className="flex items-start justify-between mb-1">
        <h2 className="text-xl font-bold text-white leading-tight">{point.name}</h2>
      </div>
      <div className="flex gap-2 mb-4">
        <span className="bg-amber-500/20 text-amber-400 text-xs font-semibold px-2 py-0.5 rounded">
          {point.system}
        </span>
        <span className="bg-gray-700 text-gray-300 text-xs font-semibold px-2 py-0.5 rounded capitalize">
          {point.zone}
        </span>
        {point.side && point.side !== 'midline' && (
          <span className="bg-gray-700 text-gray-300 text-xs font-semibold px-2 py-0.5 rounded capitalize">
            {point.side}
          </span>
        )}
      </div>

      <p className="text-gray-300 mb-4">{point.shortDescription}</p>

      {point.reactionArea && (
        <>
          <Divider />
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Reaction Area</h3>
            <p className="text-gray-300 text-sm leading-relaxed">{point.reactionArea}</p>
          </div>
        </>
      )}

      {point.location && (
        <>
          <Divider />
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Location</h3>
            <p className="text-gray-300 text-sm leading-relaxed">{point.location}</p>
          </div>
        </>
      )}

      {point.longDescription && (
        <>
          <Divider />
          <p className="text-gray-400 text-sm leading-relaxed mb-4">{point.longDescription}</p>
        </>
      )}

      {point.indications?.length > 0 && (
        <>
          <Divider />
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Indications</h3>
            <div className="flex flex-wrap gap-1.5">
              {point.indications.map(ind => (
                <span key={ind} className="bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded">
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
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Needling Depth</h3>
            <p className="text-gray-300 text-sm">{point.needlingDepth}</p>
          </div>
        </>
      )}
    </div>
  )
}
