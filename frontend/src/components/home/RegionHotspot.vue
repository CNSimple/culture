<script setup lang="ts">
import type { MapRegion } from '../../data/mapRegions'

defineProps<{
  region: MapRegion
  boundary: string
  hovered: boolean
  selected: boolean
}>()

const emit = defineEmits<{
  enter: []
  leave: []
  select: []
}>()

function keydown(event: KeyboardEvent) {
  if (event.key !== 'Enter' && event.key !== ' ') return
  event.preventDefault()
  emit('select')
}
</script>

<template>
  <g
    class="region-hotspot"
    :class="{ 'is-hovered': hovered, 'is-selected': selected }"
    role="button"
    tabindex="0"
    :aria-label="`探索${region.name}`"
    @pointerenter="emit('enter')"
    @pointerleave="emit('leave')"
    @click="emit('select')"
    @keydown="keydown"
  >
    <path class="region-hotspot__area" :d="boundary" />
    <g class="region-hotspot__marker" :transform="`translate(${region.position.x} ${region.position.y})`" aria-hidden="true">
      <circle class="region-hotspot__halo" r="27" />
      <circle class="region-hotspot__ring" r="13" />
      <circle class="region-hotspot__dot" r="5" />
      <text class="region-hotspot__label" x="18" y="5">{{ region.name }}</text>
    </g>
  </g>
</template>

<style scoped>
.region-hotspot{cursor:pointer;outline:none}
.region-hotspot__area{fill:transparent;pointer-events:all}
.region-hotspot__marker{pointer-events:none;transform-box:fill-box;transform-origin:center}
.region-hotspot__halo{fill:#d8b56a;opacity:.06;transform:scale(.62);transform-origin:center;transition:opacity .45s ease,transform .55s cubic-bezier(.22,.61,.36,1)}
.region-hotspot__ring{fill:#081a1ccc;stroke:#d8b56a;stroke-width:2;opacity:.52;transition:opacity .4s ease,stroke-width .4s ease}
.region-hotspot__dot{fill:#b68d45;filter:drop-shadow(0 0 5px rgba(216,181,106,.32));transition:fill .4s ease,filter .4s ease}
.region-hotspot__label{fill:#f5dfb0;font:700 30px KaiTi,serif;paint-order:stroke;stroke:#081719;stroke-width:8px;stroke-linejoin:round;pointer-events:none;white-space:nowrap}
.region-hotspot.is-hovered .region-hotspot__halo,.region-hotspot:focus-visible .region-hotspot__halo{opacity:.2;transform:scale(1)}
.region-hotspot.is-hovered .region-hotspot__ring,.region-hotspot:focus-visible .region-hotspot__ring{opacity:.95;stroke-width:3}
.region-hotspot.is-hovered .region-hotspot__dot,.region-hotspot:focus-visible .region-hotspot__dot{fill:#f0cf88;filter:drop-shadow(0 0 9px rgba(216,181,106,.7))}
.region-hotspot.is-selected .region-hotspot__halo{opacity:.22;animation:hotspot-breathe 1.8s ease-in-out infinite}
.region-hotspot.is-selected .region-hotspot__ring{opacity:1;stroke-width:3}
.region-hotspot.is-selected .region-hotspot__dot{fill:#f3d28d;filter:drop-shadow(0 0 10px rgba(216,181,106,.78))}
@keyframes hotspot-breathe{0%,100%{transform:scale(.78);opacity:.12}50%{transform:scale(1.15);opacity:.25}}
@media(prefers-reduced-motion:reduce){.region-hotspot__halo,.region-hotspot__ring,.region-hotspot__dot{transition:none}}
</style>
