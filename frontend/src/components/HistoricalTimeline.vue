<script setup lang="ts">
import { computed } from 'vue'
import { useKnowledgeGraphStore, type HistoricalEra } from '../stores/knowledgeGraph'

const store = useKnowledgeGraphStore()
const eras: { id: HistoricalEra; name: string; years: string }[] = [
  { id: 'spring-autumn', name: '春秋', years: '前770—前476' },
  { id: 'warring-states', name: '战国', years: '前475—前221' },
  { id: 'qin-han', name: '秦汉', years: '前221—220' },
  { id: 'wei-jin', name: '魏晋', years: '220—589' },
  { id: 'sui-tang', name: '隋唐', years: '581—907' },
  { id: 'song-yuan', name: '宋元', years: '960—1368' },
  { id: 'ming-qing', name: '明清', years: '1368—1912' },
]
const allEras = computed(() => store.selectedEras.length === 0)
</script>

<template>
  <footer class="historical-timeline" aria-label="历史时间轴">
    <div class="historical-timeline__mode">朝代筛选</div>
    <div class="historical-timeline__eras" role="group" aria-label="多选历史时期">
      <button
        type="button"
        class="is-all"
        :class="{ 'is-active': allEras }"
        :aria-pressed="allEras"
        @click="store.clearEraFilter()"
      >
        <span>全部</span>
        <small>所有朝代</small>
      </button>
      <button
        v-for="era in eras"
        :key="era.id"
        type="button"
        :class="{ 'is-active': store.selectedEras.includes(era.id) }"
        :aria-pressed="store.selectedEras.includes(era.id)"
        @click="store.toggleEra(era.id)"
      >
        <span>{{ era.name }}</span>
        <small>{{ era.years }}</small>
      </button>
    </div>
    <div class="historical-timeline__mode">支持多选</div>
  </footer>
</template>

