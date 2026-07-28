import ynsaData from './ynsa.json'
import { MERIDIANS } from '../meridians'

// YNSA Y-Points have no point-indication relations in the method itself, so
// unlike ynsa.json's authored entries these are derived straight from
// MERIDIANS rather than hand-written — id scheme (yin/yang, strong "" vs
// soft "-2") mirrors POINT_JSON_ID in HeadYPoints.jsx, and the name is just
// the plain meridian name (no indications/tags/descriptions to author).
const yPoints = MERIDIANS.flatMap(({ code, name }) =>
  ['yin', 'yang'].flatMap(polarity =>
    ['', '-2'].map(variant => ({
      id: `YNSA-Y-${code}-${polarity}${variant}`,
      name,
      system: 'YNSA',
    }))
  )
)

export const allPoints = [...ynsaData.points, ...yPoints]

export const pointsBySystem = {
  YNSA: allPoints,
}

export const zones = [...new Set(allPoints.map(p => p.zone))]
