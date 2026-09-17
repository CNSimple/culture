<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { mapAmbience, type MapId } from '../../data/mapAmbience'

const props = defineProps<{ mapId: MapId; regionFit?: boolean }>()
const canvas = ref<HTMLCanvasElement | null>(null)
let frame = 0
let lastPaint = 0
let resizeObserver: ResizeObserver | null = null
let dust: { x: number; y: number; phase: number; period: number; size: number; cyan: boolean }[] = []
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

function seeded(index: number, salt: number) {
  const value = Math.sin(index * 127.1 + salt * 311.7) * 43758.5453
  return value - Math.floor(value)
}

function resetDust() {
  const area = mapAmbience[props.mapId].dustArea
  dust = Array.from({ length: 28 }, (_, index) => ({
    x: area.x + seeded(index, 1) * area.width,
    y: area.y + seeded(index, 2) * area.height,
    phase: seeded(index, 3) * Math.PI * 2,
    period: 17 + seeded(index, 4) * 19,
    size: 0.7 + seeded(index, 5) * 0.8,
    cyan: index >= 20,
  }))
}

function cubic(a: number, b: number, c: number, d: number, t: number) {
  const u = 1 - t
  return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d
}

function drawDust(ctx: CanvasRenderingContext2D, time: number) {
  dust.forEach((particle) => {
    const phase = time * Math.PI * 2 / particle.period + particle.phase
    ctx.globalAlpha = 0.07 + (Math.sin(phase) + 1) * 0.035
    ctx.fillStyle = particle.cyan ? '#76aaa6' : '#c69f65'
    ctx.beginPath()
    ctx.arc(particle.x + Math.sin(phase) * 5, particle.y + Math.cos(phase * 0.7) * 6, particle.size, 0, Math.PI * 2)
    ctx.fill()
  })
  ctx.globalAlpha = 1
}

function drawWater(ctx: CanvasRenderingContext2D, time: number) {
  mapAmbience[props.mapId].water.forEach((zone, zoneIndex) => {
    ctx.save()
    ctx.beginPath()
    ctx.ellipse(zone.x, zone.y, zone.rx, zone.ry, 0, 0, Math.PI * 2)
    ctx.clip()
    ctx.strokeStyle = '#e6eddb'
    ctx.lineWidth = 1.1
    for (let index = 0; index < 9; index++) {
      const offset = index * 1.47 + zoneIndex * 2.1
      const x = zone.x + Math.sin(offset * 3.2 + time * 0.16) * zone.rx * 0.77
      const y = zone.y + Math.cos(offset * 1.9 + time * 0.12) * zone.ry * 0.72
      const length = 10 + seeded(index, zoneIndex + 7) * 18
      ctx.globalAlpha = 0.025 + (Math.sin(time * 0.65 + offset) + 1) * 0.017
      ctx.beginPath()
      ctx.moveTo(x - length / 2, y)
      ctx.lineTo(x + length / 2, y - 1)
      ctx.stroke()
    }
    ctx.restore()
  })
  ctx.globalAlpha = 1
}

function drawBirds(ctx: CanvasRenderingContext2D, time: number) {
  mapAmbience[props.mapId].birds.forEach((bird, index) => {
    const x = bird.x + Math.sin(time / 16 + index * 2) * 19
    const y = bird.y + Math.sin(time / 23 + index) * 3
    const wing = 2.7 + Math.sin(time * 0.55 + index * 1.4) * 0.6
    ctx.globalAlpha = 0.12
    ctx.strokeStyle = '#4c473f'
    ctx.lineWidth = 1.3
    ctx.beginPath()
    ctx.moveTo(x - 8, y - wing)
    ctx.quadraticCurveTo(x - 3, y - wing - 1, x, y)
    ctx.quadraticCurveTo(x + 3, y - wing - 1, x + 8, y - wing)
    ctx.stroke()
  })
  ctx.globalAlpha = 1
}

function drawBoat(ctx: CanvasRenderingContext2D, time: number) {
  const route = mapAmbience[props.mapId].boat
  if (!route) return
  const t = (time % route.seconds) / route.seconds
  const x = cubic(route.start.x, route.control1.x, route.control2.x, route.end.x, t)
  const y = cubic(route.start.y, route.control1.y, route.control2.y, route.end.y, t)
  const next = Math.min(t + 0.002, 1)
  const nextX = cubic(route.start.x, route.control1.x, route.control2.x, route.end.x, next)
  const nextY = cubic(route.start.y, route.control1.y, route.control2.y, route.end.y, next)
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(Math.atan2(nextY - y, nextX - x))
  ctx.globalAlpha = Math.sin(Math.PI * t) * 0.19
  ctx.fillStyle = '#453b33'
  ctx.beginPath()
  ctx.moveTo(-8, -2)
  ctx.lineTo(8, -2)
  ctx.lineTo(5, 3)
  ctx.lineTo(-5, 3)
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = '#ddd7ba'
  ctx.lineWidth = 0.8
  ctx.beginPath()
  ctx.moveTo(0, -2)
  ctx.lineTo(0, -6)
  ctx.stroke()
  ctx.restore()
}

function drawWaterfalls(ctx: CanvasRenderingContext2D, time: number) {
  mapAmbience[props.mapId].waterfalls?.forEach((fall) => {
    ctx.save()
    ctx.clip(new Path2D(fall.path))
    ctx.strokeStyle = '#f2f5eb'
    ctx.lineWidth = 1.5
    for (let index = 0; index < 6; index++) {
      const x = fall.x + (index + 0.5) * fall.width / 6
      const y = fall.y + ((time * 11 + index * 41) % fall.height)
      ctx.globalAlpha = 0.035 + index * 0.004
      ctx.beginPath()
      ctx.moveTo(x, y - 34)
      ctx.lineTo(x + 2, y + 9)
      ctx.stroke()
    }
    ctx.restore()
  })
  ctx.globalAlpha = 1
}

function paint(time: number) {
  const element = canvas.value
  const ctx = element?.getContext('2d')
  if (!element || !ctx) return
  const cssWidth = element.clientWidth
  const cssHeight = element.clientHeight
  if (!cssWidth || !cssHeight) return
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const pixelWidth = Math.round(cssWidth * dpr)
  const pixelHeight = Math.round(cssHeight * dpr)
  if (element.width !== pixelWidth || element.height !== pixelHeight) {
    element.width = pixelWidth
    element.height = pixelHeight
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.clearRect(0, 0, element.width, element.height)
  const ambience = mapAmbience[props.mapId]
  let ratio = Math.min(cssWidth / ambience.width, cssHeight / ambience.height)
  let x = (cssWidth - ambience.width * ratio) / 2
  let y = (cssHeight - ambience.height * ratio) / 2
  if (props.regionFit) {
    const mainImage = element.closest('.interactive-map__camera')?.querySelector<HTMLElement>('.region-map-main .map-image')
    if (mainImage) {
      const canvasRect = element.getBoundingClientRect()
      const imageRect = mainImage.getBoundingClientRect()
      const cameraScale = canvasRect.width / cssWidth || 1
      const imageWidth = imageRect.width / cameraScale
      const imageHeight = imageRect.height / cameraScale
      ratio = Math.max(imageWidth / ambience.width, imageHeight / ambience.height)
      x = (imageRect.left - canvasRect.left) / cameraScale + (imageWidth - ambience.width * ratio) / 2
      y = (imageRect.top - canvasRect.top) / cameraScale + (imageHeight - ambience.height * ratio) / 2
    }
  }
  ctx.setTransform(dpr * ratio, 0, 0, dpr * ratio, dpr * x, dpr * y)
  drawWater(ctx, time)
  drawDust(ctx, time)
  drawBirds(ctx, time)
  drawBoat(ctx, time)
  drawWaterfalls(ctx, time)
}

function tick(now: number) {
  if (document.hidden || reducedMotion()) return
  frame = requestAnimationFrame(tick)
  if (now - lastPaint < 33) return // about 30 FPS
  lastPaint = now
  paint(now / 1000)
}

function visibilityChanged() {
  cancelAnimationFrame(frame)
  if (document.hidden || reducedMotion()) return
  lastPaint = 0
  frame = requestAnimationFrame(tick)
}

onMounted(() => {
  resetDust()
  paint(0)
  resizeObserver = new ResizeObserver(() => paint(performance.now() / 1000))
  if (canvas.value) resizeObserver.observe(canvas.value)
  document.addEventListener('visibilitychange', visibilityChanged)
  if (!reducedMotion()) frame = requestAnimationFrame(tick)
})
watch(() => props.mapId, () => { resetDust(); paint(performance.now() / 1000) })
watch(() => props.regionFit, () => paint(performance.now() / 1000))
onBeforeUnmount(() => {
  cancelAnimationFrame(frame)
  resizeObserver?.disconnect()
  document.removeEventListener('visibilitychange', visibilityChanged)
})
</script>

<template><canvas ref="canvas" class="map-particles" aria-hidden="true"></canvas></template>
<style scoped>.map-particles{display:block;width:100%;height:100%;pointer-events:none}</style>
