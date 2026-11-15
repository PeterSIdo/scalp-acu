import { AURICULOTHERAPY_INFO } from './earAuriculotherapyInfo'
import { WESTERN_INFO } from './earWesternInfo'

// Description card for a point on an ear tile, or null. The Chinese
// Auriculotherapy tile uses Huang's texts; the Western tile its own.
export function earPointInfo(tileId, name) {
  if (!name) return null
  return (tileId === 'master' ? AURICULOTHERAPY_INFO[name] : WESTERN_INFO[name]) ?? null
}
