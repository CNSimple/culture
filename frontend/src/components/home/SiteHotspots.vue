<script setup lang="ts">
import { siteHotspots } from '../../data/siteHotspots'
import type { RegionId } from '../../stores/mapStore'
import type { SiteHotspot } from '../../data/siteHotspots'

const props = defineProps<{ regionId: RegionId; activeSite: string | null; filter: string }>()
const emit = defineEmits<{ enter: [site: SiteHotspot]; leave: []; select: [site: SiteHotspot] }>()
const sites = () => siteHotspots[props.regionId] || []
</script>

<template>
  <svg class="site-hotspots" viewBox="0 0 2560 1440" preserveAspectRatio="xMidYMid meet" aria-label="区域游览地点">
    <g
      v-for="site in sites()"
      :key="site.id"
      v-show="props.filter === '全部' || props.filter === '古迹' || props.filter === '史料'"
      class="site-hotspot"
      :class="{ 'is-active': activeSite === site.id }"
      :transform="`translate(${site.x} ${site.y})`"
      role="button"
      tabindex="0"
      :aria-label="`探索${site.name}`"
      @pointerenter="emit('enter', site)"
      @pointerleave="emit('leave')"
      @click="emit('select', site)"
      @keydown.enter.prevent="emit('select', site)"
      @keydown.space.prevent="emit('select', site)"
    >
      <circle class="site-hotspot__halo" r="34" />
      <circle class="site-hotspot__ring" r="14" />
      <circle class="site-hotspot__dot" r="5" />
      <path class="site-hotspot__tick" d="M0 22 L0 42" />
      <text class="site-hotspot__label" x="18" y="5">{{ site.name }}</text>
    </g>
  </svg>
</template>

<style scoped>
.site-hotspots{display:block;width:100%;height:100%;overflow:visible;pointer-events:none}
.site-hotspot{pointer-events:all;cursor:pointer;outline:none}
.site-hotspot__halo{fill:#d8b56a;opacity:.04;transform:scale(.55);transform-origin:center;transition:opacity .35s ease,transform .45s ease}
.site-hotspot__ring{fill:#0a1c1dcc;stroke:#b7904f;stroke-width:2;opacity:.74;transition:all .35s ease}
.site-hotspot__dot{fill:#d0a55c;filter:drop-shadow(0 0 5px rgba(216,181,106,.55));transition:all .35s ease}
.site-hotspot__tick{fill:none;stroke:#d8b56a;stroke-width:2;opacity:.45;transition:opacity .35s ease}
.site-hotspot__label{fill:#f5dfb0;font:700 56px KaiTi,serif;paint-order:stroke;stroke:#081719;stroke-width:13px;stroke-linejoin:round;pointer-events:none;white-space:nowrap}
.site-hotspot:hover .site-hotspot__halo,.site-hotspot:focus-visible .site-hotspot__halo,.site-hotspot.is-active .site-hotspot__halo{opacity:.2;transform:scale(1)}
.site-hotspot:hover .site-hotspot__ring,.site-hotspot:focus-visible .site-hotspot__ring,.site-hotspot.is-active .site-hotspot__ring{stroke:#efd291;stroke-width:3;opacity:1}
.site-hotspot:hover .site-hotspot__dot,.site-hotspot:focus-visible .site-hotspot__dot,.site-hotspot.is-active .site-hotspot__dot{fill:#f3d28d;filter:drop-shadow(0 0 10px rgba(216,181,106,.85))}
.site-hotspot.is-active .site-hotspot__halo{animation:site-breathe 1.8s ease-in-out infinite}
@keyframes site-breathe{0%,100%{transform:scale(.75);opacity:.12}50%{transform:scale(1.15);opacity:.25}}
@media(prefers-reduced-motion:reduce){.site-hotspot.is-active .site-hotspot__halo{animation:none}}
</style>
