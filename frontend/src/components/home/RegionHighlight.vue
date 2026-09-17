<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import gsap from 'gsap'
import { MAP_VIEWBOX, regionMaps } from '../../data/regionMaps'
import type { RegionId } from '../../stores/mapStore'

const props = defineProps<{ hoveredRegion: RegionId | null }>()
const svg = ref<SVGSVGElement | null>(null)
const imageSrc = (src: string) => `${import.meta.env.BASE_URL}${src.replace(/^\//, '')}`
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
let edgeFlow: gsap.core.Tween | null = null

function updateHighlight(id: RegionId | null) {
  const root = svg.value
  if (!root) return
  const duration = reducedMotion() ? 0 : id ? 0.56 : 0.52
  const dim = root.querySelector('.region-highlight__dim')
  if (dim) gsap.to(dim, { opacity: id ? 0.3 : 0, duration, ease: 'power2.out', overwrite: 'auto' })
  edgeFlow?.kill()
  edgeFlow = null

  regionMaps.forEach((region) => {
    const group = root.querySelector<SVGGElement>(`[data-region-id="${region.id}"]`)
    if (!group) return
    const active = region.id === id
    const image = group.querySelector<SVGImageElement>('image')
    const glow = group.querySelector<SVGPathElement>('.region-highlight__glow')
    const border = group.querySelector<SVGPathElement>('.region-highlight__border')
    const flow = group.querySelector<SVGPathElement>('.region-highlight__flow')
    gsap.to(group, {
      opacity: active ? 1 : 0, y: active ? -6 : 0, scale: active ? 1.015 : 1,
      svgOrigin: `${region.cameraOrigin.x} ${region.cameraOrigin.y}`,
      filter: active ? 'drop-shadow(0 18px 22px rgba(0,0,0,.55))' : 'drop-shadow(0 0 0 rgba(0,0,0,0))',
      duration, ease: 'power2.out', overwrite: 'auto',
    })
    if (image) gsap.to(image, { filter: active ? 'brightness(1.15) saturate(1.08)' : 'brightness(1) saturate(1)', duration, ease: 'power2.out', overwrite: 'auto' })
    if (glow) gsap.to(glow, { opacity: active ? 0.2 : 0, duration, ease: 'power2.out', overwrite: 'auto' })
    if (border) gsap.to(border, { opacity: active ? 0.88 : 0, duration: active ? 0.65 : duration, ease: 'power2.out', overwrite: 'auto' })
    if (flow) {
      gsap.to(flow, { opacity: active ? 0.58 : 0, duration, ease: 'power2.out', overwrite: 'auto' })
      if (active && !reducedMotion()) edgeFlow = gsap.to(flow, { strokeDashoffset: -48, duration: 5.2, repeat: -1, ease: 'none' })
    }
  })
}

watch(() => props.hoveredRegion, updateHighlight, { flush: 'post' })
onBeforeUnmount(() => { edgeFlow?.kill(); if (svg.value) gsap.killTweensOf(svg.value.querySelectorAll('*')) })
</script>

<template>
  <svg ref="svg" class="region-highlight" :viewBox="`0 0 ${MAP_VIEWBOX.width} ${MAP_VIEWBOX.height}`" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
    <defs>
      <clipPath v-for="region in regionMaps" :id="`map-clip-${region.id}`" :key="region.id"><path :d="region.mainHotspot" /></clipPath>
    </defs>
    <rect class="region-highlight__dim" :width="MAP_VIEWBOX.width" :height="MAP_VIEWBOX.height" fill="#071011" opacity="0" />
    <g v-for="region in regionMaps" :key="region.id" :data-region-id="region.id" class="region-highlight__lift" opacity="0">
      <image :href="imageSrc(region.highlightImage)" x="0" y="0" :width="MAP_VIEWBOX.width" :height="MAP_VIEWBOX.height" :clip-path="`url(#map-clip-${region.id})`" />
      <path class="region-highlight__glow" :d="region.mainHotspot" opacity="0" />
      <path class="region-highlight__border" :d="region.mainHotspot" opacity="0" />
      <path class="region-highlight__flow" :d="region.mainHotspot" opacity="0" />
    </g>
  </svg>
</template>

<style scoped>
.region-highlight{display:block;width:100%;height:100%;overflow:visible;pointer-events:none}
.region-highlight__lift{will-change:transform,opacity,filter}
.region-highlight__glow{fill:#d8b56a;mix-blend-mode:soft-light}
.region-highlight__border{fill:none;stroke:#d8b56a;stroke-width:3;stroke-linejoin:round;stroke-linecap:round}
.region-highlight__flow{fill:none;stroke:#efd291;stroke-width:2;stroke-linejoin:round;stroke-dasharray:25 23;stroke-dashoffset:0;filter:drop-shadow(0 0 4px rgba(216,181,106,.48))}
</style>
