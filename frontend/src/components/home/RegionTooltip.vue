<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import gsap from 'gsap'
import { mapRegionsById } from '../../data/mapRegions'
import type { RegionId } from '../../stores/mapStore'

const props = defineProps<{ regionId: RegionId | null; x: number; y: number }>()
const element = ref<HTMLElement | null>(null)
const region = computed(() => props.regionId ? mapRegionsById[props.regionId] : null)

watch(() => props.regionId, (id) => {
  if (!element.value) return
  gsap.to(element.value, {
    opacity: id ? 1 : 0, y: id ? 0 : 5,
    duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : id ? 0.42 : 0.35,
    ease: 'power2.out', overwrite: 'auto',
  })
}, { flush: 'post' })

onBeforeUnmount(() => { if (element.value) gsap.killTweensOf(element.value) })
</script>

<template>
  <div ref="element" class="region-tooltip" :style="{ left: `${x}px`, top: `${y}px` }" role="status" aria-live="polite">
    <div class="region-tooltip__eyebrow">文化区域</div>
    <strong>{{ region?.name }}</strong>
    <span class="region-tooltip__subtitle">{{ region?.subtitle }}</span>
    <div class="region-tooltip__divider"></div>
    <span class="region-tooltip__label">关联成语</span>
    <div class="region-tooltip__idioms">
      <em v-for="idiom in region?.relatedIdioms" :key="idiom">{{ idiom }}</em>
    </div>
    <span class="region-tooltip__action">探索区域 <b>→</b></span>
  </div>
</template>

<style scoped>
.region-tooltip{position:absolute;z-index:1;width:238px;padding:13px 15px 14px;border:1px solid rgba(216,181,106,.66);border-radius:4px;background:linear-gradient(145deg,rgba(8,26,28,.96),rgba(16,39,35,.93));color:#e7d7b2;box-shadow:0 14px 32px rgba(0,0,0,.52),inset 0 0 24px rgba(216,181,106,.035);backdrop-filter:blur(10px);opacity:0;pointer-events:none;will-change:transform,opacity}
.region-tooltip:before{content:'';position:absolute;inset:4px;border:1px solid rgba(216,181,106,.12);pointer-events:none}
.region-tooltip__eyebrow{color:rgba(216,181,106,.62);font-size:9px;letter-spacing:.28em}
.region-tooltip strong{display:block;margin-top:2px;color:#e7d7b2;font:700 20px KaiTi,STKaiti,serif;letter-spacing:.08em}
.region-tooltip__subtitle{display:block;margin-top:3px;color:rgba(231,215,178,.72);font-size:11px;line-height:1.5}
.region-tooltip__divider{height:1px;margin:9px 0 7px;background:linear-gradient(90deg,rgba(216,181,106,.5),transparent)}
.region-tooltip__label{display:block;color:rgba(231,215,178,.58);font-size:10px}
.region-tooltip__idioms{display:flex;gap:8px;margin-top:5px}
.region-tooltip__idioms em{color:#e7d7b2;font:normal 12px KaiTi,STKaiti,serif}
.region-tooltip__idioms em+em:before{content:'·';margin-right:8px;color:#d8b56a}
.region-tooltip__action{display:block;margin-top:10px;color:#d8b56a;font-size:11px;letter-spacing:.05em}
.region-tooltip__action b{display:inline-block;margin-left:4px;font-weight:400;transition:transform .35s ease}
</style>
