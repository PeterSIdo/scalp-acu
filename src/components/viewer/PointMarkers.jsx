import PointMarker from './PointMarker'

const DEMO_POINT_IDS = ['YNSA-A-LEFT', 'YNSA-A-RIGHT', 'YNSA-B-LEFT']

export default function PointMarkers({ points, isSubscribed, activeZone, onSelect }) {
  return points
    .filter(p => activeZone === 'all' || p.zone === activeZone)
    .map(point => {
      const isLocked = !isSubscribed && !DEMO_POINT_IDS.includes(point.id)
      return (
        <PointMarker
          key={point.id}
          point={point}
          isLocked={isLocked}
          onSelect={onSelect}
        />
      )
    })
}
