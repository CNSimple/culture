<script setup lang="ts">
import { useKnowledgeGraphStore, type EntityCategory } from '../stores/knowledgeGraph'

const store = useKnowledgeGraphStore()

const categories: { id: EntityCategory; label: string; icon: string }[] = [
  { id: 'all', label: '全部', icon: '◉' },
  { id: 'idiom', label: '成语', icon: '◈' },
  { id: 'person', label: '历史人物', icon: '♟' },
  { id: 'site', label: '古迹遗址', icon: '⌂' },
  { id: 'source', label: '史料文献', icon: '▤' },
  { id: 'event', label: '历史事件', icon: '◷' },
]
</script>

<template>
  <aside class="entity-filters" aria-labelledby="entity-filter-title">
    <h2 id="entity-filter-title">实体类型</h2>
    <div class="entity-filters__list" role="group" aria-label="筛选实体类型">
      <button
        v-for="category in categories"
        :key="category.id"
        type="button"
        :class="{ 'is-active': category.id === store.activeCategory }"
        :aria-pressed="category.id === store.activeCategory"
        @click="store.activeCategory = category.id"
      >
        <span aria-hidden="true">{{ category.icon }}</span>
        <span>{{ category.label }}</span>
      </button>
    </div>
    <div class="entity-filters__decoration" aria-hidden="true"></div>
  </aside>
</template>
