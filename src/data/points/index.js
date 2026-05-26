import ynsaData from './ynsa.json'

export const allPoints = [...ynsaData.points]

export const pointsBySystem = {
  YNSA: ynsaData.points,
}

export const zones = [...new Set(allPoints.map(p => p.zone))]
