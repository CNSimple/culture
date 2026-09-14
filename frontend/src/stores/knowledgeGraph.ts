import { defineStore } from 'pinia'
import { ref } from 'vue'

export type EntityCategory = 'all' | 'idiom' | 'person' | 'site' | 'source' | 'event'
export type DetailTab = 'relations' | 'origin' | 'ai' | 'study'
export type HistoricalEra = 'spring-autumn' | 'warring-states' | 'qin-han' | 'wei-jin' | 'sui-tang' | 'song-yuan' | 'ming-qing'

/** A focus request carries a nonce so repeating the same entity still replays the animation. */
export type FocusTarget = { id: string; nonce: number }

export const useKnowledgeGraphStore = defineStore('knowledgeGraph', () => {
  const selectedEntityId = ref('huangliang')
  const activeCategory = ref<EntityCategory>('all')
  const activeTab = ref<DetailTab>('relations')
  const activeEra = ref<HistoricalEra>('warring-states')
  const focusTarget = ref<FocusTarget | null>(null)

  function focusEntity(id: string) {
    focusTarget.value = { id, nonce: (focusTarget.value?.nonce ?? 0) + 1 }
  }

  function clearFocus() {
    focusTarget.value = null
  }

  return {
    selectedEntityId,
    activeCategory,
    activeTab,
    activeEra,
    focusTarget,
    focusEntity,
    clearFocus,
  }
})
