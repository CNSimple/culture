<script setup lang="ts">
import { computed } from 'vue'
import { graphNodes } from '../data/graphData'
import { useKnowledgeGraphStore, type EntityCategory } from '../stores/knowledgeGraph'

const store = useKnowledgeGraphStore()
const categoryMeta: { id: EntityCategory; label: string; icon: string }[] = [
  { id: 'idiom', label: '成语', icon: '●' },
  { id: 'person', label: '历史人物', icon: '■' },
  { id: 'site', label: '地点遗址', icon: '▲' },
  { id: 'source', label: '典籍出处', icon: '◆' },
  { id: 'event', label: '历史事件', icon: '✦' },
]
const categories = computed(() => categoryMeta.filter((category) => graphNodes.some((node) => node.kind === category.id)))
const allVisible = computed(() => store.visibleCategories.length === categories.value.length)
</script>

<template>
  <aside class="entity-filters" aria-labelledby="entity-filter-title">
    <h2 id="entity-filter-title">实体类型</h2>
    <div class="entity-filters__list" role="group" aria-label="筛选实体类型">
      <button
        type="button"
        :class="{ 'is-active': allVisible }"
        :aria-pressed="allVisible"
        @click="store.showAllCategories()"
      >
        <span aria-hidden="true">◎</span>
        <span>全部</span>
      </button>
      <label v-for="category in categories" :key="category.id" class="entity-filter-check">
        <input
          type="checkbox"
          :checked="store.visibleCategories.includes(category.id)"
          @change="store.toggleCategory(category.id)"
        >
        <span class="entity-filter-check__mark" :class="`entity-filter-check__mark--${category.id}`" aria-hidden="true">{{ category.icon }}</span>
        <span>{{ category.label }}</span>
      </label>
    </div>
    <div class="entity-filters__decoration" aria-hidden="true"></div>
  </aside>
</template>
