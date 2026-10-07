import ynsaData from './ynsa.json'
import { MERIDIANS } from '../meridians'
import { Y_POINT_INFO } from '../yPointInfo'

// YNSA Y-Points have no point-indication relations in the method itself, so
// unlike ynsa.json's authored entries these are derived straight from
// MERIDIANS rather than hand-written — id scheme (yin/yang, strong "" vs
// soft "-2") mirrors POINT_JSON_ID in HeadYPoints.jsx, and the name is just
// the plain meridian name (no indications/tags/descriptions to author).
// Every meridian has a Y point on both sides of the ear, so location
// follows the point's own polarity, not the meridian's yin/yang nature.
const Y_LOCATION = {
  yin:  'Anterior temporal region, Yin group (in front of the ear).',
  yang: 'Posterior temporal region, Yang group (behind the ear).',
}

const yPoints = MERIDIANS.flatMap(({ code, name }) =>
  ['yin', 'yang'].flatMap(polarity =>
    ['', '-2'].map(variant => ({
      id: `YNSA-Y-${code}-${polarity}${variant}`,
      name,
      system: 'YNSA',
      ...Y_POINT_INFO[code],
      ...(Y_POINT_INFO[code] && { side: polarity, location: Y_LOCATION[polarity] }),
    }))
  )
)

export const allPoints = [...ynsaData.points, ...yPoints]

// Meridian-level Y point description, for selections that don't pick a side
// of the ear — the Meridian menu and the neck/abdominal diagnostic maps.
// Same text as the per-point records minus side and location. null when the
// meridian has no Y point text (e.g. Governing Vessel).
export function yPointForMeridian(code) {
  const info = Y_POINT_INFO[code]
  return info ? { id: `YNSA-Y-${code}`, system: 'YNSA', ...info } : null
}

export const pointsBySystem = {
  YNSA: allPoints,
}

export const zones = [...new Set(allPoints.map(p => p.zone))]
