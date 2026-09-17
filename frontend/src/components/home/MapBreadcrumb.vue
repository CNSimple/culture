<script setup lang="ts">
import { useMapStore } from '../../stores/mapStore'
const store = useMapStore()
const emit = defineEmits<{ home: [] }>()
</script>
<template>
  <nav class="map-breadcrumb" aria-label="地图层级">
    <template v-for="(item,index) in store.breadcrumb" :key="item.level">
      <span v-if="index" class="map-breadcrumb__separator">›</span>
      <button v-if="item.level === 1 && store.currentLevel === 2" type="button" @click="emit('home')">{{ item.label }}</button>
      <span v-else :aria-current="index === store.breadcrumb.length - 1 ? 'location' : undefined">{{ item.label }}</span>
    </template>
  </nav>
</template>
<style scoped>
.map-breadcrumb{display:flex;align-items:center;gap:7px;padding:8px 12px;border:1px solid #8b714e;border-radius:5px;background:#0b191bd9;color:#f0dfbd;font:15px KaiTi,serif;backdrop-filter:blur(8px)}
.map-breadcrumb button{padding:0;border:0;background:none;color:#d8b56a;font:inherit;cursor:pointer}
.map-breadcrumb button:hover,.map-breadcrumb button:focus-visible{color:#f2d797;text-shadow:0 0 8px rgba(216,181,106,.35);outline:none}
.map-breadcrumb__separator{color:#806b4b}
</style>
