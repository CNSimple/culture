<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import gsap from 'gsap'
import { useKnowledgeGraphStore, type HistoricalEra } from '../stores/knowledgeGraph'

const store = useKnowledgeGraphStore()

const eras: { id: HistoricalEra; name: string; years: string }[] = [
  { id: 'spring-autumn', name: '春秋', years: '前770—前476' },
  { id: 'warring-states', name: '战国', years: '前475—前221' },
  { id: 'qin-han', name: '秦汉', years: '前221—220' },
  { id: 'wei-jin', name: '魏晋', years: '220—589' },
  { id: 'sui-tang', name: '隋唐', years: '581—907' },
  { id: 'song-yuan', name: '宋元', years: '960—1368' },
  { id: 'ming-qing', name: '明清', years: '1368—1912' },
]

const erasElement = ref<HTMLElement | null>(null)
const isPlaying = ref(false)
let eraTransition: gsap.core.Timeline | null = null
let playTween: gsap.core.Tween | null = null

// The gold ring is a pseudo-element, so GSAP drives it through these custom properties.
type EraNodeState = { opacity: number; scale: number; blur: number }

function paintEraNode(element: HTMLElement, state: EraNodeState) {
  element.style.setProperty('--era-node-opacity', state.opacity.toFixed(3))
  element.style.setProperty('--era-node-scale', state.scale.toFixed(4))
  element.style.setProperty('--era-node-blur', `${state.blur.toFixed(2)}px`)
}

function selectEra(next: HistoricalEra) {
  if (next === store.activeEra) return

  const buttons = erasElement.value?.querySelectorAll<HTMLButtonElement>('button')
  const page = document.querySelector<HTMLElement>('.graph-page')
  const previous = buttons?.[eras.findIndex((era) => era.id === store.activeEra)]
  const upcoming = buttons?.[eras.findIndex((era) => era.id === next)]

  if (!previous || !upcoming || !page || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    store.activeEra = next
    return
  }

  eraTransition?.kill()

  // Old node leaves, new node arrives; the timeline lasts 800ms in total.
  const outgoing: EraNodeState = { opacity: 1, scale: 1, blur: 0 }
  const incoming: EraNodeState = { opacity: 0, scale: 0.75, blur: 5 }
  const paintOutgoing = () => paintEraNode(previous, outgoing)
  const paintIncoming = () => paintEraNode(upcoming, incoming)

  gsap.set(page, { filter: 'brightness(1)' })
  paintOutgoing()

  eraTransition = gsap.timeline({ defaults: { ease: 'power2.out' } })
  eraTransition.to(outgoing, {
    opacity: 0, scale: 0.85, blur: 5, duration: 0.3, ease: 'power2.in', onUpdate: paintOutgoing,
  }, 0)
  // Hand the gold ring over only after the outgoing node has fully dimmed.
  eraTransition.add(() => { store.activeEra = next }, 0.3)
  eraTransition.fromTo(incoming, { ...incoming }, {
    opacity: 1, scale: 1, blur: 0, duration: 0.5, immediateRender: false, onUpdate: paintIncoming,
  }, 0.3)
  // The outgoing era stays on the axis, so it returns as an ordinary node.
  eraTransition.to(outgoing, { opacity: 1, scale: 1, blur: 0, duration: 0.5, onUpdate: paintOutgoing }, 0.3)
  // A barely perceptible brightness breath across the page background.
  eraTransition.to(page, { filter: 'brightness(0.94)', duration: 0.4 }, 0)
  eraTransition.to(page, { filter: 'brightness(1)', duration: 0.4 }, 0.4)
  eraTransition.set(page, { clearProps: 'filter' }, 0.8)
}

function stopPlay() {
  isPlaying.value = false
  playTween?.kill()
  playTween = null
}

/** 播放按钮从当前时代出发，沿时间轴依次推进一整轮后自动停止。 */
function playEras() {
  if (isPlaying.value) {
    stopPlay()
    return
  }
  isPlaying.value = true
  const startIndex = eras.findIndex((era) => era.id === store.activeEra)
  let step = 0
  const advance = () => {
    step += 1
    if (step > eras.length - 1) {
      stopPlay()
      return
    }
    selectEra(eras[(startIndex + step) % eras.length].id)
    playTween = gsap.delayedCall(1.05, advance)
  }
  playTween = gsap.delayedCall(0.4, advance)
}

onBeforeUnmount(() => {
  eraTransition?.kill()
  playTween?.kill()
})
</script>

<template>
  <footer class="historical-timeline" aria-label="历史时间轴">
    <div class="historical-timeline__mode">时空模式</div>
    <button type="button" :aria-label="isPlaying ? '暂停时间轴' : '播放时间轴'" @click="playEras">{{ isPlaying ? '❚❚' : '▶' }}</button>
    <div ref="erasElement" class="historical-timeline__eras" role="group" aria-label="选择历史时期">
      <button
        v-for="era in eras"
        :key="era.id"
        type="button"
        :class="{ 'is-active': era.id === store.activeEra }"
        :aria-pressed="era.id === store.activeEra"
        @click="selectEra(era.id)"
      >
        <span>{{ era.name }}</span>
        <small>{{ era.years }}</small>
      </button>
    </div>
    <div class="historical-timeline__mode">时间轴模式</div>
  </footer>
</template>
