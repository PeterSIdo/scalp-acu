// Basic Points zone letters (A–I), derived from the YNSA JSON id scheme:
// YNSA-<Zone><subpoint?>-<yin|yang>?  e.g. "YNSA-A1-yin", "YNSA-D3-yang", "YNSA-H"
export const ZONES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I']

export const ZONE_INFO = {
  A: 'Head, cervical spine and shoulder',
  B: 'Cervical spine, shoulder, shoulder joint and scapular region',
  C: 'Scapular region, shoulder joint and upper extremity',
  D: 'Lumbar spine and lower extremity',
  E: 'Thoracic spine, ribs, lungs and heart',
  F: 'Sciatic nerve',
  G: 'Knee',
  H: 'Lumbar supplementary (extra) point',
  I: 'Lumbar supplementary (extra) point',
}

export function zoneOf(jsonId) {
  const m = jsonId?.match(/^YNSA-([A-Z])\d*(?:-(?:yin|yang))?$/)
  return m ? m[1] : null
}
