<script setup lang="ts">
import { regionMaps, MAP_VIEWBOX } from '../../data/regionMaps'
import { mapRegionsById } from '../../data/mapRegions'
import type { RegionId } from '../../stores/mapStore'
import RegionHotspot from './RegionHotspot.vue'

const props = defineProps<{ filter: string; hoveredRegion: RegionId | null; transitioning: boolean }>()
function visible(region: (typeof mapRegionsById)[RegionId]) { return props.filter === '全部' || props.filter === '史料' || (props.filter === '成语' && region.knowledge.idiomCount > 0) || (props.filter === '人物' && region.knowledge.personCount > 0) || (props.filter === '古迹' && region.knowledge.siteCount > 0) }

const emit = defineEmits<{
  enter: [id: RegionId]
  leave: []
  select: [id: RegionId]
}>()

</script>

<template>
  <svg class="region-hotspots" :viewBox="`0 0 ${MAP_VIEWBOX.width} ${MAP_VIEWBOX.height}`" preserveAspectRatio="xMidYMid meet" aria-label="地图区域热点" role="group">
    <RegionHotspot
      v-for="region in regionMaps.filter((item) => visible(mapRegionsById[item.id]))"
      :key="region.id"
      :region="mapRegionsById[region.id]"
      :boundary="region.mainHotspot"
      :hovered="hoveredRegion === region.id"
      :selected="transitioning && hoveredRegion === region.id"
      @enter="emit('enter', region.id)"
      @leave="emit('leave')"
      @select="emit('select', region.id)"
    />
  </svg>
</template>

<style scoped>
.region-hotspots{display:block;width:100%;height:100%;pointer-events:none}
</style>
