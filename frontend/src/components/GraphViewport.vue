<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { select } from 'd3'
import gsap from 'gsap'
import { graphLinks, graphNodes } from '../data/graphData'
import type { GraphNode } from '../data/graphData'
import { startRelationParticles } from '../composables/useRelationParticles'
import { playGraphFocusAnimation } from '../composables/useGraphFocusAnimation'
import { useKnowledgeGraphStore, type EntityCategory } from '../stores/knowledgeGraph'

const IDIOM_ID = 'huangliang'

/** 左侧筛选的类别与实体类型的对应关系；历史事件当前没有对应实体。 */
const CATEGORY_KINDS: Record<EntityCategory, GraphNode['kind'][]> = {
  all: ['idiom', 'person', 'site', 'source'],
  idiom: ['idiom'],
  person: ['person'],
  site: ['site'],
  source: ['source'],
  event: [],
}

const kindById = new Map(graphNodes.map((node) => [node.id, node.kind]))

const store = useKnowledgeGraphStore()

const viewportElement = ref<HTMLElement | null>(null)
const canvasElement = ref<HTMLCanvasElement | null>(null)
const svgElement = ref<SVGSVGElement | null>(null)
const legendVisible = ref(false)
const fullscreen = ref(false)
let stopParticles: (() => void) | undefined
let focusTimeline: gsap.core.Timeline | null = null

const isEmptyFilter = computed(() => CATEGORY_KINDS[store.activeCategory].length === 0)

function visibleKinds() {
  return CATEGORY_KINDS[store.activeCategory]
}

/** 只有在全景模式下聚焦中心，才播放四条关系的完整序列；其余情况用聚光灯式明暗区分。 */
function spotlightId(): string | null {
  const id = store.focusTarget?.id
  if (!id) return null
  if (id === IDIOM_ID && store.activeCategory === 'all') return null
  return id
}

function applyVisualState(animate = true) {
  const svg = svgElement.value
  if (!svg) return
  const kinds = visibleKinds()
  const spotlight = spotlightId()
  const options = { duration: animate ? 0.35 : 0, ease: 'power2.out' as const, overwrite: 'auto' as const }

  graphNodes.forEach((node) => {
    const group = svg.querySelector<SVGGElement>(`[data-node-id="${node.id}"]`)
    if (!group) return
    let opacity: number
    if (!kinds.includes(node.kind)) opacity = 0.08
    else if (spotlight && node.id !== spotlight) opacity = 0.16
    else opacity = node.kind === 'idiom' ? 1 : 0.92
    gsap.to(group, { opacity, ...options })
  })

  graphLinks.forEach((link) => {
    const group = svg.querySelector<SVGGElement>(`[data-link-id="${link.id}"]`)
    if (!group) return
    const sourceKind = kindById.get(link.source)
    const targetKind = kindById.get(link.target)
    const inCategory = Boolean(sourceKind && targetKind && kinds.includes(sourceKind) && kinds.includes(targetKind))
    const touchesFocus = !spotlight || link.source === spotlight || link.target === spotlight
    gsap.to(group, { opacity: inCategory && touchesFocus ? 1 : 0, ...options })
  })
}

function playCoreFocus() {
  const svg = svgElement.value
  const panel = document.querySelector<HTMLElement>('.entity-detail')
  if (!svg || !panel) return
  focusTimeline?.kill()
  focusTimeline = playGraphFocusAnimation(svg, panel)
}

function handleFocusChange() {
  const id = store.focusTarget?.id
  if (!id) {
    focusTimeline?.kill()
    focusTimeline = null
    applyVisualState()
    return
  }
  if (id === IDIOM_ID && store.activeCategory === 'all') {
    playCoreFocus()
    return
  }
  applyVisualState()
}

/** 重置视角：清空筛选与聚焦，恢复中心节点与详情面板的初始状态。 */
function resetView() {
  focusTimeline?.kill()
  focusTimeline = null
  legendVisible.value = false
  store.clearFocus()
  store.activeCategory = 'all'
  const core = svgElement.value?.querySelector<SVGGElement>('.network-core')
  if (core) gsap.to(core, { scale: 1, duration: 0.3, ease: 'power2.out' })
  const panel = document.querySelector<HTMLElement>('.entity-detail')
  if (panel) gsap.to(panel, { x: 0, autoAlpha: 1, duration: 0.3, ease: 'power2.out' })
  applyVisualState()
}

function toggleFullscreen() {
  if (document.fullscreenElement) {
    document.exitFullscreen()
    return
  }
  viewportElement.value?.requestFullscreen?.()
}

function syncFullscreen() {
  fullscreen.value = Boolean(document.fullscreenElement)
}

function entityIdFromEvent(event: Event) {
  const group = (event.target as Element | null)?.closest<SVGGElement>('.graph-entity')
  return group?.dataset.nodeId ?? null
}

function handleSvgClick(event: MouseEvent) {
  const id = entityIdFromEvent(event)
  if (id) store.focusEntity(id)
}

function handleSvgKeydown(event: KeyboardEvent) {
  if (event.key !== 'Enter' && event.key !== ' ') return
  const id = entityIdFromEvent(event)
  if (!id) return
  event.preventDefault()
  store.focusEntity(id)
}

function imagePosition(node: GraphNode) {
  const radius = node.radius
  const right = node.spriteQuadrant === 'top-right' || node.spriteQuadrant === 'bottom-right'
  const bottom = node.spriteQuadrant === 'bottom-left' || node.spriteQuadrant === 'bottom-right'
  return {
    x: -radius - (right ? radius * 2 : 0),
    y: -radius - (bottom ? radius * 2 : 0),
    size: radius * 4,
  }
}

function drawGraph(svg: SVGSVGElement): SVGPathElement[] {
  const root = select(svg)
  const defs = root.select('defs')

  defs.selectAll<SVGClipPathElement, GraphNode>('clipPath.graph-node-clip')
    .data(graphNodes, (node) => node.id)
    .join('clipPath')
    .attr('class', 'graph-node-clip')
    .attr('id', (node) => `clip-${node.id}`)
    .each(function (node) {
      select(this).selectAll('circle').data([node]).join('circle').attr('r', node.radius)
    })

  const edgeGroups = root.select<SVGGElement>('.graph-viewport__edges')
    .selectAll<SVGGElement, (typeof graphLinks)[number]>('g.graph-relation')
    .data(graphLinks, (link) => link.id)
    .join('g')
    .attr('class', 'graph-relation')
    .attr('data-link-id', (link) => link.id)

  edgeGroups.each(function (link) {
    const group = select(this)
    group.selectAll('path.relation-line--glow').data([link]).join('path')
      .attr('class', 'relation-line relation-line--glow').attr('d', link.d)
    group.selectAll('path.relation-line--base').data([link]).join('path')
      .attr('class', 'relation-line relation-line--base').attr('d', link.d)
    group.selectAll('path.relation-flow').data([link]).join('path')
      .attr('class', 'relation-flow').attr('d', link.d)

    const tag = group.selectAll('g.relation-tag').data([link]).join('g')
      .attr('class', 'relation-tag').attr('transform', `translate(${link.tagX} ${link.tagY})`)
    tag.selectAll('rect').data([link]).join('rect').attr('width', 75).attr('height', 25).attr('rx', 13)
    tag.selectAll('text').data([link]).join('text').attr('x', 37).attr('y', 17).text(link.label)
  })

  const nodeGroups = root.select<SVGGElement>('.graph-viewport__nodes')
    .selectAll<SVGGElement, GraphNode>('g.graph-entity')
    .data(graphNodes, (node) => node.id)
    .join('g')
    .attr('class', (node) => `graph-entity ${node.kind === 'idiom' ? 'network-core' : `network-${node.kind}`}`)
    .attr('data-node-id', (node) => node.id)
    .attr('transform', (node) => `translate(${node.x} ${node.y})`)
    .attr('aria-label', (node) => node.label)

  nodeGroups.each(function (node) {
    const group = select(this)
    const core = node.kind === 'idiom'
    const radius = node.radius

    group.selectAll('circle.node-halo--wide').data([node]).join('circle')
      .attr('class', core ? 'core-aura node-halo--wide' : 'node-outer-glow node-halo--wide')
      .attr('r', core ? radius + 58 : radius + 19)
    if (core) group.selectAll('circle.focus-ripple').data([node]).join('circle')
      .attr('class', 'focus-ripple').attr('r', radius + 2)
    group.selectAll('circle.node-halo--soft').data([node]).join('circle')
      .attr('class', core ? 'core-glow node-halo--soft' : 'node-outer-glow node-halo--soft')
      .attr('r', core ? radius + 21 : radius + 12)
    group.selectAll('circle.node-halo--near').data([node]).join('circle')
      .attr('class', core ? 'core-ring core-ring--outer node-halo--near' : 'node-ring node-halo--near')
      .attr('r', core ? radius + 11 : radius + 3)
    group.selectAll('circle.node-image-back').data([node]).join('circle')
      .attr('class', core ? 'core-ring node-image-back' : 'node-ring node-image-back')
      .attr('r', radius + (core ? 3 : 1))

    const crop = imagePosition(node)
    group.selectAll('image.node-image').data([node]).join('image')
      .attr('class', 'node-image')
      .attr('href', node.image)
      .attr('x', core ? -radius : crop.x)
      .attr('y', core ? -radius : crop.y)
      .attr('width', core ? radius * 2 : crop.size)
      .attr('height', core ? radius * 2 : crop.size)
      .attr('preserveAspectRatio', core ? 'xMinYMid slice' : 'xMidYMid meet')
      .attr('clip-path', `url(#clip-${node.id})`)

    group.selectAll('circle.node-image-ring').data([node]).join('circle')
      .attr('class', core ? 'core-ring core-ring--inner node-image-ring' : 'node-inner-ring node-image-ring')
      .attr('r', radius)

    if (core) {
      group.selectAll('rect.core-title-bg').data([node]).join('rect')
        .attr('class', 'core-title-bg').attr('x', -56).attr('y', 41)
        .attr('width', 112).attr('height', 33).attr('rx', 15)
      group.selectAll('text.core-title').data([node]).join('text')
        .attr('class', 'core-title').attr('y', 64).text(node.label)
    } else {
      group.selectAll('text.node-label').data([node]).join('text')
        .attr('class', 'node-label').attr('y', radius + 29).text(node.label)
    }
  })

  return root.selectAll<SVGPathElement, unknown>('path.relation-line--base').nodes()
}

watch(() => store.focusTarget, handleFocusChange)

watch(() => store.activeCategory, () => {
  if (store.focusTarget?.id === IDIOM_ID && store.activeCategory === 'all') {
    playCoreFocus()
    return
  }
  focusTimeline?.kill()
  focusTimeline = null
  applyVisualState()
})

onMounted(() => {
  if (!svgElement.value || !canvasElement.value) return
  const paths = drawGraph(svgElement.value)
  stopParticles = startRelationParticles(canvasElement.value, paths)

  svgElement.value.querySelectorAll<SVGGElement>('.graph-entity').forEach((group) => {
    group.setAttribute('role', 'button')
    group.setAttribute('tabindex', '0')
    group.setAttribute('aria-label', `查看${group.getAttribute('aria-label')}的关系`)
  })
  svgElement.value.addEventListener('click', handleSvgClick)
  svgElement.value.addEventListener('keydown', handleSvgKeydown)
  document.addEventListener('fullscreenchange', syncFullscreen)
  applyVisualState(false)
})

onUnmounted(() => {
  stopParticles?.()
  focusTimeline?.kill()
  svgElement.value?.removeEventListener('click', handleSvgClick)
  svgElement.value?.removeEventListener('keydown', handleSvgKeydown)
  document.removeEventListener('fullscreenchange', syncFullscreen)
})
</script>

<template>
  <div ref="viewportElement" class="graph-viewport" aria-label="知识图谱画布">
    <div class="graph-viewport__landscape" aria-hidden="true"></div>
    <canvas ref="canvasElement" class="graph-viewport__particles" aria-hidden="true"></canvas>
    <svg ref="svgElement" class="graph-viewport__network" viewBox="0 0 986 700" preserveAspectRatio="xMidYMid meet" role="group" aria-label="黄粱一梦与卢生、吕翁、黄粱梦吕仙祠和《枕中记》的关系网络">
      <defs>
        <filter id="node-halo" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="8" /></filter>
        <filter id="line-glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3" /></filter>
        <radialGradient id="core-aura"><stop offset="0" stop-color="#f7d486" stop-opacity=".58" /><stop offset=".55" stop-color="#d3a156" stop-opacity=".18" /><stop offset="1" stop-color="#d3a156" stop-opacity="0" /></radialGradient>
      </defs>
      <g class="graph-viewport__edges" aria-hidden="true"></g>
      <g class="graph-viewport__nodes"></g>
    </svg>
    <p v-if="isEmptyFilter" class="graph-viewport__empty" role="status">当前筛选类型下暂无实体，请选择其他类型。</p>
    <div class="graph-viewport__legend" :hidden="!legendVisible" aria-label="图例说明">
      <h3>图例说明</h3>
      <ul>
        <li><i class="legend-mark legend-mark--idiom"></i>成语</li>
        <li><i class="legend-mark legend-mark--person"></i>历史人物</li>
        <li><i class="legend-mark legend-mark--site"></i>古迹遗址</li>
        <li><i class="legend-mark legend-mark--source"></i>史料文献</li>
        <li><i class="legend-mark legend-mark--relation"></i>相关关系</li>
        <li><i class="legend-mark legend-mark--flow"></i>关系流光</li>
      </ul>
    </div>
    <div class="graph-viewport__tools" aria-label="图谱工具">
      <button type="button" :aria-pressed="fullscreen" @click="toggleFullscreen">{{ fullscreen ? '退出全屏' : '全屏' }}</button>
      <button type="button" @click="resetView">重置视角</button>
      <button type="button" :aria-pressed="legendVisible" @click="legendVisible = !legendVisible">图例说明</button>
    </div>
  </div>
</template>
