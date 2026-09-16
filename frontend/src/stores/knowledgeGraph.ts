import { defineStore } from 'pinia'
import { ref } from 'vue'

export type EntityCategory = 'idiom' | 'person' | 'site' | 'source' | 'event'
export type DetailTab = 'relations' | 'origin' | 'ai' | 'study'
export type HistoricalEra = 'spring-autumn' | 'warring-states' | 'qin-han' | 'wei-jin' | 'sui-tang' | 'song-yuan' | 'ming-qing'

/** A focus request carries a nonce so repeating the same entity still replays the animation. */
export type FocusTarget = { id: string; nonce: number }

export const useKnowledgeGraphStore = defineStore('knowledgeGraph', () => {
  const selectedEntityId = ref('CY081')
  const visibleCategories = ref<EntityCategory[]>(['idiom', 'person', 'site', 'source', 'event'])
  const activeTab = ref<DetailTab>('relations')
  const selectedEras = ref<HistoricalEra[]>([])
  const focusTarget = ref<FocusTarget | null>(null)

  function focusEntity(id: string) {
    focusTarget.value = { id, nonce: (focusTarget.value?.nonce ?? 0) + 1 }
  }

  function clearFocus() {
    focusTarget.value = null
  }

  function toggleCategory(category: EntityCategory) {
    visibleCategories.value = visibleCategories.value.includes(category)
      ? visibleCategories.value.filter((item) => item !== category)
      : [...visibleCategories.value, category]
  }

  function showAllCategories() {
    visibleCategories.value = ['idiom', 'person', 'site', 'source', 'event']
  }

  function toggleEra(era: HistoricalEra) {
    selectedEras.value = selectedEras.value.includes(era)
      ? selectedEras.value.filter((item) => item !== era)
      : [...selectedEras.value, era]
  }

  function clearEraFilter() {
    selectedEras.value = []
  }

  return {
    selectedEntityId,
    visibleCategories,
    activeTab,
    selectedEras,
    focusTarget,
    focusEntity,
    clearFocus,
    toggleCategory,
    showAllCategories,
    toggleEra,
    clearEraFilter,
  }
})
