// Search indexes for the side panel's search box on the TCM and ZSA tabs
// (YNSA and Auriculotherapy have their own in SearchPanel). Each entry:
//   key     unique id
//   name    shown as the result title
//   label   shown under a name match (what kind of thing it is)
//   aliases extra names that also count as a name match (pinyin, English, code)
//   phrases indication / function phrases; the one that matched is shown
//   item    the InfoPanel entry to open
//   pick    where it lives: { subgroup, kind, key } — ViewerPage switches to
//           that subgroup and hands `pick` to its grid to select it there.

import { TCM_AREA_INFO } from './tcmAreaInfo'
import { TCM_MERIDIAN_POINT_INFO } from './tcmMeridianPointInfo'
import { ZSA_AREA_INFO } from './zsaAreaInfo'
import { BRAIN_ZONES, BRAIN_ZONE_TCM, zoneToPanelItem } from '../components/viewer/HeadBrainZones'

// Phrases from an entry's sections with these titles: list items as-is
// ("Skin: psoriasis, …"), paragraphs split at sentence ends and commas so a
// hit shows just the phrase that matched.
export function phrases(info, titles) {
  return info.sections
    .filter(s => titles.includes(s.title))
    .flatMap(s => [
      ...(s.paragraphs ?? []).flatMap(t => t.split(/(?<=[.:])\s+|,\s+(?:and\s+|or\s+)?|\s+and\s+(?=[^,]*\.$)/)),
      ...(s.items ?? []).map(it => (it.label ? `${it.label}: ${it.text}` : it.text)),
    ])
    .map(t => t.replace(/[.:]$/, '').trim())
    .filter(Boolean)
}

export const TCM_SEARCH = [
  ...Object.entries(TCM_AREA_INFO).map(([key, info]) => ({
    key: `area:${key}`,
    name: info.name,
    label: 'Scalp Areas',
    aliases: [],
    phrases: phrases(info, ['Indications']),
    item: info,
    pick: { subgroup: 'tcm-scalp-areas', kind: 'area', key },
  })),
  ...Object.entries(TCM_MERIDIAN_POINT_INFO).map(([key, info]) => ({
    key: `point:${key}`,
    name: info.name,
    label: `${info.subtitle} · ${info.system}`,
    aliases: [info.subtitle, info.system, key.replace(' ', '')],
    phrases: phrases(info, ['Indications', 'Actions']),
    item: info,
    pick: { subgroup: 'tcm-scalp-areas', kind: 'meridianPoint', key },
  })),
  ...BRAIN_ZONES.map(zone => ({
    key: `zone:${zone.num}`,
    name: zone.name,
    label: ['Brain Zones', zone.region].filter(Boolean).join(' · '),
    aliases: [],
    phrases: [...(zone.functions?.split(/,\s*/) ?? []), ...(BRAIN_ZONE_TCM[zone.num]?.uses ?? [])],
    item: zoneToPanelItem(zone),
    pick: { subgroup: 'brain-zones', kind: 'zone', key: zone.num },
  })),
]

export const ZSA_SEARCH = Object.entries(ZSA_AREA_INFO).map(([code, info]) => ({
  key: `zsa:${code}`,
  name: info.name,
  label: `ZSA · ${code}`,
  aliases: [code],
  phrases: phrases(info, ['Indications', 'Functions']),
  item: info,
  pick: { subgroup: 'zsa-zones', kind: 'area', key: code },
}))

// Name (or alias) matches first, those starting with the query ahead of the
// rest, then entries whose phrases match.
export function searchEntries(entries, q) {
  const rank = e => {
    const names = [e.name, ...e.aliases].map(n => n.toLowerCase())
    if (names.some(n => n.startsWith(q))) return 0
    if (names.some(n => n.includes(q))) return 1
    return 2
  }
  return entries
    .map(e => {
      const r = rank(e)
      const hit = r < 2 ? null : e.phrases.find(t => t.toLowerCase().includes(q))
      return r < 2 || hit ? { e, r, detail: hit ?? e.label } : null
    })
    .filter(Boolean)
    .sort((a, b) => a.r - b.r)
    .map(({ e, detail }) => ({ key: e.key, name: e.name, detail, item: e, enabled: true }))
}
