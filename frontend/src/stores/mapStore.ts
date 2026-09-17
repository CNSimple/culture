import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { regionMapsById } from '../data/regionMaps'
import { mapRegionsById } from '../data/mapRegions'

export type MapLevel = 1 | 2
export type RegionId = 'daming' | 'cixian-linzhang' | 'shexian' | 'wuan' | 'fengfeng' | 'yongnian' | 'handan-urban'
export type AIContext = {
  location: string
  source: 'map'
  selectedEntity: string | null
  type?: 'city' | 'region' | 'site'
  entities?: string[]
  stats?: { idioms: number; people: number; sites: number }
  questions?: string[]
}

export const useMapStore = defineStore('map', () => {
  const currentLevel = ref<MapLevel>(1)
  const currentRegion = ref<RegionId | null>(null)
  const currentSite = ref<string | null>(null)
  const hoveredRegion = ref<RegionId | null>(null)
  const transitioning = ref(false)
  const breadcrumb = computed(() => [
    { label: '邯郸', level: 1 as const },
    ...(currentRegion.value ? [{ label: regionMapsById[currentRegion.value].name, level: 2 as const }] : []),
    ...(currentSite.value ? [{ label: currentSite.value, level: 3 as const }] : []),
  ])
  const aiContext = computed<AIContext>(() => {
    if (!currentRegion.value) return {
      location: '邯郸', source: 'map', selectedEntity: currentSite.value, type: 'city',
      entities: ['赵王城', '丛台', '邯郸成语典故'],
      stats: { idioms: 1584, people: 42, sites: 31 },
      questions: ['邯郸为什么被称为成语之都？', '推荐邯郸研学路线', '介绍赵文化'],
    }
    const region = mapRegionsById[currentRegion.value]
    return {
      ...regionMapsById[currentRegion.value].aiContext,
      selectedEntity: currentSite.value,
      type: currentSite.value ? 'site' : 'region',
      entities: currentSite.value ? [currentSite.value, ...region.knowledge.entities] : region.knowledge.entities,
      stats: { idioms: region.knowledge.idiomCount, people: region.knowledge.personCount, sites: region.knowledge.siteCount },
      questions: currentSite.value ? [`介绍${currentSite.value}`, ...region.knowledge.questions] : region.knowledge.questions,
    }
  })
  return { currentLevel, currentRegion, currentSite, hoveredRegion, transitioning, breadcrumb, aiContext }
})
