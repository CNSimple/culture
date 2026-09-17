<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import gsap from 'gsap'
import type { SiteHotspot } from '../../data/siteHotspots'

const props = defineProps<{ site: SiteHotspot | null; x: number; y: number }>()
const element = ref<HTMLElement | null>(null)
const visible = computed(() => Boolean(props.site))
watch(visible, (show) => { if (element.value) gsap.to(element.value, { opacity: show ? 1 : 0, y: show ? 0 : 5, duration: show ? .3 : .24, ease: 'power2.out', overwrite: 'auto' }) })
</script>

<template>
  <div ref="element" class="site-tooltip" :style="{ left: `${x}px`, top: `${y}px` }" role="status" aria-live="polite">
    <span class="site-tooltip__eyebrow">可探索地点</span>
    <strong>{{ site?.name }}</strong>
    <span>{{ site?.subtitle }}</span>
    <em>查看地点知识 →</em>
  </div>
</template>

<style scoped>
.site-tooltip{position:absolute;width:190px;padding:10px 12px;border:1px solid rgba(216,181,106,.58);border-radius:4px;background:rgba(8,26,28,.94);box-shadow:0 12px 26px rgba(0,0,0,.48);color:#e7d7b2;opacity:0;pointer-events:none;will-change:transform,opacity}
.site-tooltip__eyebrow,.site-tooltip em{display:block;color:#d8b56a;font-size:10px;letter-spacing:.12em;font-style:normal}
.site-tooltip strong{display:block;margin-top:3px;font:700 17px KaiTi,STKaiti,serif}
.site-tooltip span:not(.site-tooltip__eyebrow){display:block;margin-top:3px;color:#c9bea7;font-size:11px}
.site-tooltip em{margin-top:8px;color:#d8b56a;letter-spacing:0}
</style>
