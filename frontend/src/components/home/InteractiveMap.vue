<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import gsap from 'gsap'
import mapAssets from '../../data/mapAssets.json'
import { MAP_VIEWBOX, regionMapsById } from '../../data/regionMaps'
import type { SiteHotspot } from '../../data/siteHotspots'
import { useMapStore, type RegionId } from '../../stores/mapStore'
import MapImage from './MapImage.vue'
import RegionHighlight from './RegionHighlight.vue'
import RegionHotspots from './RegionHotspots.vue'
import MapLabels from './MapLabels.vue'
import MapParticles from './MapParticles.vue'
import MapFog from './MapFog.vue'
import MapBreadcrumb from './MapBreadcrumb.vue'
import RegionTooltip from './RegionTooltip.vue'
import SiteHotspots from './SiteHotspots.vue'
import SiteTooltip from './SiteTooltip.vue'

const store = useMapStore()
const OVERVIEW_SCALE = 1
const camera = ref<HTMLElement | null>(null)
const fog = ref<HTMLElement | null>(null)
const breadcrumb = ref<HTMLElement | null>(null)
const tooltip = ref({ x: 0, y: 0 })
const siteTooltip = ref({ x: 0, y: 0 })
const hoveredSite = ref<SiteHotspot | null>(null)
const selectedSiteId = ref<string | null>(null)
const currentMap = computed(() => store.currentRegion
  ? { name: regionMapsById[store.currentRegion].name, src: regionMapsById[store.currentRegion].regionImage }
  : mapAssets.main)
const preloads = new Map<RegionId, Promise<void>>()
let transition: gsap.core.Timeline | null = null

function preloadRegion(id: RegionId) {
  const cached = preloads.get(id)
  if (cached) return cached
  const image = new Image()
  image.src = `${import.meta.env.BASE_URL}${regionMapsById[id].regionImage.replace(/^\//, '')}`
  const ready = image.decode().catch(() => undefined)
  preloads.set(id, ready)
  return ready
}
function publishAIContext() {
  if (window.parent === window) return
  const context = JSON.parse(JSON.stringify(store.aiContext))
  window.parent.postMessage({ type: 'yanzhao:map-context', context }, window.location.origin)
}

function receiveParentMessage(event: MessageEvent) {
  if (event.origin !== window.location.origin || event.data?.type !== 'yanzhao:request-map-context') return
  publishAIContext()
}

watch(() => store.aiContext, publishAIContext, { deep: true })
onMounted(() => {
  preloadRegion('daming')
  window.addEventListener('message', receiveParentMessage)
  publishAIContext()
})
onBeforeUnmount(() => {
  transition?.kill()
  window.removeEventListener('message', receiveParentMessage)
})

function hoverRegion(id: RegionId) {
  if (store.transitioning || store.currentLevel !== 1) return
  preloadRegion(id)
  const bounds = camera.value?.getBoundingClientRect()
  const region = regionMapsById[id]
  const width = bounds?.width ?? 600
  const height = bounds?.height ?? 540
  const ratio = Math.min(width / MAP_VIEWBOX.width, height / MAP_VIEWBOX.height)
  const x = (width - MAP_VIEWBOX.width * ratio) / 2 + region.tooltipPosition.x * ratio
  const y = (height - MAP_VIEWBOX.height * ratio) / 2 + region.tooltipPosition.y * ratio
  tooltip.value = {
    x: Math.max(12, Math.min(x + 16, width - 272)),
    y: Math.max(12, Math.min(y - 78, height - 178)),
  }
  store.hoveredRegion = id
}
function leaveRegion() { if (!store.transitioning) store.hoveredRegion = null }

function hoverSite(site: SiteHotspot) {
  if (store.transitioning || store.currentLevel !== 2) return
  const bounds = camera.value?.getBoundingClientRect()
  const width = bounds?.width ?? 600
  const height = bounds?.height ?? 540
  const ratio = Math.min(width / MAP_VIEWBOX.width, height / MAP_VIEWBOX.height)
  const x = (width - MAP_VIEWBOX.width * ratio) / 2 + site.x * ratio
  const y = (height - MAP_VIEWBOX.height * ratio) / 2 + site.y * ratio
  siteTooltip.value = {
    x: Math.max(14, Math.min(x + 15, width - 214)),
    y: Math.max(14, Math.min(y - 62, height - 112)),
  }
  hoveredSite.value = site
}

function leaveSite() { if (!store.transitioning) hoveredSite.value = null }

function selectSite(site: SiteHotspot) {
  if (store.transitioning || store.currentLevel !== 2) return
  selectedSiteId.value = site.id
  store.currentSite = site.name
  hoverSite(site)
}

async function enterRegion(id: RegionId) {
  if (store.transitioning || store.currentLevel !== 1) return
  store.transitioning = true
  store.hoveredRegion = id
  store.currentSite = null
  selectedSiteId.value = null
  hoveredSite.value = null
  await preloadRegion(id)
  await nextTick()
  const stage = camera.value
  const fogLayer = fog.value
  const crumbs = breadcrumb.value
  const image = stage?.querySelector<HTMLElement>('.map-image')
  const lift = stage?.querySelector<SVGGElement>(`[data-region-id="${id}"]`)
  const liftedImage = lift?.querySelector<SVGImageElement>('image')
  const left = fogLayer?.querySelector<HTMLElement>('.map-fog__left')
  const right = fogLayer?.querySelector<HTMLElement>('.map-fog__right')
  const veil = fogLayer?.querySelector<HTMLElement>('.map-fog__veil')
  if (!stage || !fogLayer || !crumbs || !image || !lift || !liftedImage || !left || !right || !veil) {
    store.transitioning = false
    return
  }

  const region = regionMapsById[id]
  const bounds = stage.getBoundingClientRect()
  const ratio = Math.min(bounds.width / MAP_VIEWBOX.width, bounds.height / MAP_VIEWBOX.height)
  const baseOriginX = (bounds.width - MAP_VIEWBOX.width * ratio) / 2 + region.cameraOrigin.x * ratio
  const baseOriginY = (bounds.height - MAP_VIEWBOX.height * ratio) / 2 + region.cameraOrigin.y * ratio
  const originX = bounds.width / 2 + (baseOriginX - bounds.width / 2) * OVERVIEW_SCALE
  const originY = bounds.height / 2 + (baseOriginY - bounds.height / 2) * OVERVIEW_SCALE
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduced) {
    store.currentRegion = id
    store.currentLevel = 2
    store.hoveredRegion = null
    store.transitioning = false
    return
  }

  gsap.set([left, right], { opacity: 0 })
  gsap.set(left, { xPercent: -105 })
  gsap.set(right, { xPercent: 105 })
  gsap.set(veil, { opacity: 0 })
  gsap.killTweensOf([lift, liftedImage])

  transition = gsap.timeline({ onComplete: () => { store.transitioning = false; transition = null } })
  transition.to(lift, { scale: 1.04, duration: 0.2, ease: 'power2.out' }, 0)
    .to(liftedImage, { filter: 'brightness(1.35) saturate(1.08)', duration: 0.2, ease: 'power2.out' }, 0)
    .to(image, { opacity: 0.55, filter: 'brightness(.6) blur(4px)', duration: 0.3, ease: 'power2.out' }, 0.2)
    .to(lift, { y: -22, filter: 'drop-shadow(0 25px 27px rgba(0,0,0,.65))', duration: 0.45, ease: 'power2.out' }, 0.4)
    .to(stage, { scale: 1.6, transformOrigin: `${originX}px ${originY}px`, duration: 0.5, ease: 'power2.inOut' }, 0.6)
    .to(crumbs, { opacity: 0, duration: 0.2, ease: 'power2.out' }, 0.85)
    .to(left, { xPercent: 0, opacity: 1, duration: 0.4, ease: 'power2.out' }, 0.9)
    .to(right, { xPercent: 0, opacity: 1, duration: 0.4, ease: 'power2.out' }, 0.9)
    .to(veil, { opacity: 1, duration: 0.32, ease: 'power2.out' }, 0.95)
    .add(() => {
      store.currentRegion = id
      store.currentLevel = 2
      store.hoveredRegion = null
      gsap.set(stage, { scale: 1.08, opacity: 0, transformOrigin: '50% 50%' })
      gsap.set(image, { clearProps: 'filter,opacity' })
    }, 1.2)
    .to(stage, { scale: 1, opacity: 1, duration: 0.43, ease: 'power2.out' }, 1.25)
    .to(left, { xPercent: -105, opacity: 0, duration: 0.4, ease: 'power2.out' }, 1.3)
    .to(right, { xPercent: 105, opacity: 0, duration: 0.4, ease: 'power2.out' }, 1.3)
    .to(veil, { opacity: 0, duration: 0.38, ease: 'power2.out' }, 1.3)
    .to(crumbs, { opacity: 1, duration: 0.25, ease: 'power2.out' }, 1.45)
}

function returnToOverview() {
  if (store.transitioning || store.currentLevel !== 2) return
  const stage = camera.value
  const fogLayer = fog.value
  const left = fogLayer?.querySelector<HTMLElement>('.map-fog__left')
  const right = fogLayer?.querySelector<HTMLElement>('.map-fog__right')
  const veil = fogLayer?.querySelector<HTMLElement>('.map-fog__veil')
  if (!stage || !left || !right || !veil) return

  store.transitioning = true
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduced) {
    store.currentSite = null
    selectedSiteId.value = null
    hoveredSite.value = null
    store.currentRegion = null
    store.currentLevel = 1
    store.transitioning = false
    return
  }

  gsap.set(left, { xPercent: -105, opacity: 0 })
  gsap.set(right, { xPercent: 105, opacity: 0 })
  gsap.set(veil, { opacity: 0 })
  transition = gsap.timeline({ onComplete: () => { store.transitioning = false; transition = null } })
    .to(stage, { scale: 0.94, opacity: 0.58, duration: 0.42, ease: 'power2.inOut' }, 0)
    .to(left, { xPercent: 0, opacity: 1, duration: 0.42, ease: 'power2.out' }, 0.18)
    .to(right, { xPercent: 0, opacity: 1, duration: 0.42, ease: 'power2.out' }, 0.18)
    .to(veil, { opacity: 1, duration: 0.34, ease: 'power2.out' }, 0.26)
    .add(() => {
      store.currentSite = null
      selectedSiteId.value = null
      hoveredSite.value = null
      store.currentRegion = null
      store.currentLevel = 1
      store.hoveredRegion = null
      gsap.set(stage, { scale: 1.1, opacity: 0, transformOrigin: '50% 50%' })
    }, 0.68)
    .to(stage, { scale: 1, opacity: 1, duration: 0.48, ease: 'power2.out' }, 0.76)
    .to(left, { xPercent: -105, opacity: 0, duration: 0.46, ease: 'power2.out' }, 0.78)
    .to(right, { xPercent: 105, opacity: 0, duration: 0.46, ease: 'power2.out' }, 0.78)
    .to(veil, { opacity: 0, duration: 0.4, ease: 'power2.out' }, 0.82)
}
</script>

<template>
  <section class="interactive-map" aria-label="邯郸文化交互地图">
    <div class="interactive-map__background" aria-hidden="true"></div>
    <div ref="camera" class="interactive-map__camera">
      <div class="map-content-layer" :class="store.currentLevel === 2 ? 'is-region' : 'is-overview'" :style="{ '--overview-scale': OVERVIEW_SCALE }">
        <div class="interactive-map__image"><MapImage :src="currentMap.src" :alt="`${currentMap.name}文化地图`" :region="store.currentLevel === 2" /></div>
        <div class="interactive-map__ambient-fog" aria-hidden="true"></div>
        <div v-if="store.currentLevel === 1" class="interactive-map__highlight"><RegionHighlight :hovered-region="store.hoveredRegion" /></div>
        <div class="interactive-map__particles"><MapParticles :map-id="store.currentRegion ?? 'handan'" :region-fit="store.currentLevel === 2" /></div>
        <div v-if="store.currentLevel === 1" class="interactive-map__hotspots"><RegionHotspots :hovered-region="store.hoveredRegion" :transitioning="store.transitioning" @enter="hoverRegion" @leave="leaveRegion" @select="enterRegion" /></div>
        <div v-if="store.currentLevel === 2 && store.currentRegion" class="interactive-map__sites"><SiteHotspots :region-id="store.currentRegion" :active-site="selectedSiteId" @enter="hoverSite" @leave="leaveSite" @select="selectSite" /></div>
        <div class="interactive-map__labels"><MapLabels /></div>
        <div v-if="store.currentLevel === 1" class="interactive-map__tooltip"><RegionTooltip :region-id="store.hoveredRegion" :x="tooltip.x" :y="tooltip.y" /></div>
        <div v-if="store.currentLevel === 2" class="interactive-map__site-tooltip"><SiteTooltip :site="hoveredSite" :x="siteTooltip.x" :y="siteTooltip.y" /></div>
      </div>
    </div>
    <div ref="fog" class="interactive-map__fog"><MapFog /></div>
    <div ref="breadcrumb" class="interactive-map__breadcrumb"><MapBreadcrumb @home="returnToOverview" /></div>
  </section>
</template>

<style scoped>
.interactive-map{position:relative;width:100%;height:100%;min-height:540px;overflow:hidden;perspective:1200px;background:#0b1618}
.interactive-map__background,.interactive-map__camera,.interactive-map__fog{position:absolute;inset:0}
.map-content-layer{position:absolute;inset:0;transform-origin:center;will-change:transform}
.map-content-layer.is-overview{transform:scale(var(--overview-scale))}
.map-content-layer.is-region{animation:region-content-enter .8s cubic-bezier(.22,.61,.36,1) forwards}
@keyframes region-content-enter{from{transform:scale(1.12)}to{transform:scale(1.08)}}
.map-content-layer>div{position:absolute;inset:0}
.interactive-map__image{z-index:1}.interactive-map__ambient-fog{z-index:1;pointer-events:none;overflow:hidden}
.interactive-map__ambient-fog:before,.interactive-map__ambient-fog:after{content:'';position:absolute;inset:-8%;opacity:.11;filter:blur(18px);mix-blend-mode:screen;pointer-events:none}
.interactive-map__ambient-fog:before{background:radial-gradient(ellipse at 14% 47%,#b9c0b585 0,transparent 34%),radial-gradient(ellipse at 84% 70%,#d2d2c481 0,transparent 30%);animation:ambient-ink-left 58s ease-in-out infinite alternate}
.interactive-map__ambient-fog:after{background:radial-gradient(ellipse at 76% 25%,#b8c2bd78 0,transparent 31%),radial-gradient(ellipse at 22% 82%,#d0d4c682 0,transparent 32%);animation:ambient-ink-right 72s ease-in-out infinite alternate}
@keyframes ambient-ink-left{from{transform:translate3d(-12px,4px,0);opacity:.07}to{transform:translate3d(16px,-8px,0);opacity:.13}}
@keyframes ambient-ink-right{from{transform:translate3d(13px,-6px,0);opacity:.11}to{transform:translate3d(-14px,9px,0);opacity:.06}}
.interactive-map__highlight{z-index:2;pointer-events:none}
.interactive-map__particles{z-index:3;pointer-events:none}.interactive-map__hotspots,.interactive-map__sites{z-index:4;pointer-events:none}
.interactive-map__labels{z-index:5;pointer-events:none}.interactive-map__tooltip,.interactive-map__site-tooltip{z-index:6;pointer-events:none}
.interactive-map__fog{z-index:7;pointer-events:none}
.interactive-map__breadcrumb{position:absolute;z-index:8;top:16px;left:16px}
@media(prefers-reduced-motion:reduce){.interactive-map__ambient-fog:before,.interactive-map__ambient-fog:after,.map-content-layer.is-region{animation:none}.map-content-layer.is-region{transform:scale(1.08)}}
</style>
