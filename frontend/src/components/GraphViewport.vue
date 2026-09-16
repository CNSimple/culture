<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import {
  drag,
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  select,
  zoom,
  zoomIdentity,
  type Simulation,
  type SimulationLinkDatum,
  type ZoomBehavior,
} from 'd3'
import { graphLinks, graphNodeById, graphNodes, relationsByNodeId } from '../data/graphData'
import type { GraphLink, GraphNode } from '../data/graphData'
import { nodeArtwork } from '../data/idiomArtwork'
import { useKnowledgeGraphStore } from '../stores/knowledgeGraph'

type SimulationLink = Omit<GraphLink, 'source' | 'target'> & SimulationLinkDatum<GraphNode> & {
  source: string | GraphNode
  target: string | GraphNode
}

const CENTER_ID = 'CY081'
const ASSET_BASE = import.meta.env.BASE_URL
const store = useKnowledgeGraphStore()
const viewportElement = ref<HTMLElement | null>(null)
const svgElement = ref<SVGSVGElement | null>(null)
const legendVisible = ref(false)
const fullscreen = ref(false)
const loadedCount = ref(0)
const visibleLoadedCount = ref(0)
const viewMode = ref<'local' | 'all' | 'idioms'>('local')
const expandedIds = new Set<string>()
const localRoots = new Set<string>([CENTER_ID])
let selectedLinkId: string | null = null
let simulation: Simulation<GraphNode, SimulationLink> | null = null
let zoomBehavior: ZoomBehavior<SVGSVGElement, unknown> | null = null
let activeNodes: GraphNode[] = []
let activeLinks: SimulationLink[] = []
const simulationNodeById = new Map<string, GraphNode>()

const isEmptyFilter = computed(() => visibleLoadedCount.value === 0)

function visualRadius(node: GraphNode) {
  if (viewMode.value === 'local') return node.kind === 'idiom' ? 44 : 35
  if (viewMode.value === 'idioms') return 15
  return node.kind === 'idiom' ? 12 : 9
}

function getSimulationNode(id: string) {
  let node = simulationNodeById.get(id)
  if (node) return node
  const source = graphNodeById.get(id)
  if (!source) return undefined
  node = { ...source, radius: visualRadius(source) }
  simulationNodeById.set(id, node)
  return node
}

function endpointNode(endpoint: string | number | GraphNode) {
  return typeof endpoint === 'object' ? endpoint : simulationNodeById.get(String(endpoint))
}

function curveGeometry(link: SimulationLink, index: number) {
  const source = endpointNode(link.source)
  const target = endpointNode(link.target)
  if (!source || !target || source.x == null || source.y == null || target.x == null || target.y == null) return null
  const dx = target.x - source.x
  const dy = target.y - source.y
  const length = Math.max(Math.hypot(dx, dy), 1)
  const bend = (index % 2 === 0 ? 1 : -1) * Math.min(34, length * 0.16)
  const cx = (source.x + target.x) / 2 - (dy / length) * bend
  const cy = (source.y + target.y) / 2 + (dx / length) * bend
  return {
    path: `M${source.x},${source.y} Q${cx},${cy} ${target.x},${target.y}`,
    labelX: source.x * 0.25 + cx * 0.5 + target.x * 0.25,
    labelY: source.y * 0.25 + cy * 0.5 + target.y * 0.25,
  }
}

function imageCrop(node: GraphNode) {
  const r = node.radius
  if (node.kind === 'idiom' || node.kind === 'person') {
    const tile = nodeArtwork(node.id, node.kind)
    if (tile) {
      const scale = (r * 2) / tile.tileHeight
      return {
        href: tile.path,
        x: -(tile.column * tile.tileWidth * scale + tile.tileWidth * scale / 2),
        y: -((tile.header + tile.row * tile.tileHeight) * scale + r),
        width: tile.width * scale,
        height: tile.height * scale,
      }
    }
    if (node.kind === 'idiom') {
      return { href: `${ASSET_BASE}assets/huangliang-dream.png`, x: -r, y: -r, width: r * 2, height: r * 2 }
    }
  }
  if (node.kind === 'event') return { href: `${ASSET_BASE}assets/handan-night.png`, x: -r, y: -r, width: r * 2, height: r * 2 }
  const quadrant = node.kind === 'person' ? 'top-left' : node.kind === 'source' ? 'bottom-left' : 'bottom-right'
  const right = quadrant.includes('right')
  const bottom = quadrant.includes('bottom')
  return {
    href: `${ASSET_BASE}assets/graph-portraits.png`,
    x: -r - (right ? r * 2 : 0),
    y: -r - (bottom ? r * 2 : 0),
    width: r * 4,
    height: r * 4,
  }
}

function activeNodeIds() {
  if (viewMode.value === 'all') return new Set(graphNodes.map((node) => node.id))
  if (viewMode.value === 'idioms') return new Set(graphNodes.filter((node) => node.kind === 'idiom').map((node) => node.id))
  const ids = new Set<string>(localRoots)
  const queue = [...localRoots]
  while (queue.length) {
    const id = queue.shift()!
    if (!expandedIds.has(id)) continue
    for (const link of relationsByNodeId.get(id) ?? []) {
      const neighborId = link.source === id ? link.target : link.source
      if (ids.has(neighborId)) continue
      ids.add(neighborId)
      queue.push(neighborId)
    }
  }
  return ids
}

function toggleNode(node: GraphNode) {
  selectedLinkId = null
  store.selectedEntityId = node.id
  localRoots.add(node.id)
  if (expandedIds.has(node.id)) {
    expandedIds.delete(node.id)
    const reachableIds = activeNodeIds()
    for (const expandedId of [...expandedIds]) {
      if (!reachableIds.has(expandedId)) expandedIds.delete(expandedId)
    }
  } else {
    expandedIds.add(node.id)
  }
  if (viewMode.value === 'local') renderSubgraph()
  else applyVisualState()
  store.focusEntity(node.id)
}

function nodeVisible(node: GraphNode) {
  const categoryVisible = store.visibleCategories.includes(node.kind)
  const eraVisible = store.selectedEras.length === 0 || node.eras.some((era) => store.selectedEras.includes(era))
  return categoryVisible && eraVisible
}

function linkVisible(link: SimulationLink) {
  const source = endpointNode(link.source)
  const target = endpointNode(link.target)
  return Boolean(source && target && nodeVisible(source) && nodeVisible(target))
}

function applyVisualState() {
  const svg = svgElement.value
  if (!svg) return
  const focusedId = store.focusTarget?.id ?? null
  const neighborIds = new Set<string>()
  if (focusedId) {
    for (const link of relationsByNodeId.get(focusedId) ?? []) {
      neighborIds.add(link.source === focusedId ? link.target : link.source)
    }
  }

  select(svg).selectAll<SVGGElement, GraphNode>('g.graph-entity')
    .style('display', (node) => nodeVisible(node) ? null : 'none')
    .attr('opacity', (node) => {
      if (!focusedId) return 1
      if (node.id === focusedId) return 1
      return neighborIds.has(node.id) ? 0.92 : 0.16
    })
    .classed('is-selected', (node) => node.id === focusedId)

  select(svg).selectAll<SVGGElement, SimulationLink>('g.graph-relation')
    .style('display', (link) => linkVisible(link) ? null : 'none')
    .classed('is-focused', (link) => {
      const source = endpointNode(link.source)
      const target = endpointNode(link.target)
      return source?.id === focusedId || target?.id === focusedId || link.id === selectedLinkId
    })
    .attr('opacity', (link) => {
      if (!focusedId && !selectedLinkId) return 0.48
      const source = endpointNode(link.source)
      const target = endpointNode(link.target)
      return source?.id === focusedId || target?.id === focusedId || link.id === selectedLinkId ? 1 : 0.08
    })
    .select<SVGTextElement>('text.relation-label')
    .style('display', (link) => {
      const source = endpointNode(link.source)
      const target = endpointNode(link.target)
      const visible = source?.id === focusedId || target?.id === focusedId || link.id === selectedLinkId
      return visible ? null : 'none'
    })
}

function updateForces() {
  if (!simulation) return
  visibleLoadedCount.value = activeNodes.filter(nodeVisible).length
  const linkForce = simulation.force('link') as ReturnType<typeof forceLink<GraphNode, SimulationLink>>
  linkForce
    .links(activeLinks.filter(linkVisible))
    .distance(viewMode.value === 'local' ? 150 : 42)
    .strength(viewMode.value === 'local' ? 0.38 : 0.24)
  const chargeForce = simulation.force('charge') as ReturnType<typeof forceManyBody<GraphNode>>
  chargeForce
    .strength((node) => nodeVisible(node) ? (viewMode.value === 'local' ? -560 : -30) : 0)
    .distanceMax(viewMode.value === 'local' ? 390 : 145)
  const collisionForce = simulation.force('collision') as ReturnType<typeof forceCollide<GraphNode>>
  collisionForce.radius((node) => nodeVisible(node) ? node.radius + (viewMode.value === 'local' ? 18 : 4) : 0)
  simulation.alpha(0.75).restart()
  applyVisualState()
}

function renderSubgraph() {
  const svg = svgElement.value
  if (!svg) return
  const ids = activeNodeIds()
  activeNodes = [...ids]
    .map(getSimulationNode)
    .filter((node): node is GraphNode => Boolean(node))
    .filter(nodeVisible)
  for (const node of activeNodes) node.radius = visualRadius(node)
  const renderedIds = new Set(activeNodes.map((node) => node.id))
  activeLinks = graphLinks
    .filter((link) => renderedIds.has(link.source) && renderedIds.has(link.target))
    .map((link) => ({ ...link }))
  loadedCount.value = activeNodes.length

  const root = select(svg)
  const panLayer = root.select<SVGGElement>('.graph-pan-layer')
  const defs = root.select('defs')
  defs.selectAll<SVGClipPathElement, GraphNode>('clipPath.graph-node-clip')
    .data(activeNodes, (node) => node.id)
    .join(
      (enter) => {
        const clip = enter.append('clipPath').attr('class', 'graph-node-clip').attr('id', (node) => `clip-${node.id}`)
        clip.append('circle')
        return clip
      },
      (update) => update,
      (exit) => exit.remove(),
    )
    .select('circle')
    .attr('r', (node) => node.radius)

  const edgeGroups = panLayer.select<SVGGElement>('.graph-viewport__edges')
    .selectAll<SVGGElement, SimulationLink>('g.graph-relation')
    .data(activeLinks, (link) => link.id)
    .join((enter) => {
      const group = enter.append('g').attr('class', 'graph-relation')
      group.append('path').attr('class', 'relation-line')
      group.append('path').attr('class', 'relation-hit')
      group.append('text').attr('class', 'relation-label')
      return group
    })
    .attr('data-link-id', (link) => link.id)
    .on('click', (event, link) => {
      event.stopPropagation()
      selectedLinkId = link.id
      store.clearFocus()
      applyVisualState()
    })

  edgeGroups.select('text.relation-label').text((link) => link.label)

  const nodeGroups = panLayer.select<SVGGElement>('.graph-viewport__nodes')
    .selectAll<SVGGElement, GraphNode>('g.graph-entity')
    .data(activeNodes, (node) => node.id)
    .join((enter) => {
      const group = enter.append('g')
      group.append('circle').attr('class', 'node-glow')
      group.append('circle').attr('class', 'node-back')
      group.append('image').attr('class', 'node-image')
      group.append('circle').attr('class', 'node-image-ring')
      group.append('text').attr('class', 'node-label')
      return group
    })
    .attr('class', (node) => `graph-entity graph-entity--${node.kind}`)
    .attr('data-node-id', (node) => node.id)
    .attr('role', 'button')
    .attr('tabindex', 0)
    .attr('aria-label', (node) => `查看${node.label}的关系`)
    .on('click', (event, node) => {
      event.stopPropagation()
      toggleNode(node)
    })
    .on('keydown', (event: KeyboardEvent, node) => {
      if (event.key !== 'Enter' && event.key !== ' ') return
      event.preventDefault()
      store.selectedEntityId = node.id
      store.focusEntity(node.id)
    })

  nodeGroups.select('circle.node-glow').attr('r', (node) => node.radius + 11)
  nodeGroups.select('circle.node-back').attr('r', (node) => node.radius + 3)
  nodeGroups.select('image.node-image')
    .attr('href', (node) => imageCrop(node).href)
    .attr('x', (node) => imageCrop(node).x)
    .attr('y', (node) => imageCrop(node).y)
    .attr('width', (node) => imageCrop(node).width ?? node.radius * 2)
    .attr('height', (node) => imageCrop(node).height ?? node.radius * 2)
    .attr('preserveAspectRatio', 'xMidYMid slice')
    .attr('clip-path', (node) => `url(#clip-${node.id})`)
  nodeGroups.select('circle.node-image-ring').attr('r', (node) => node.radius)
  nodeGroups.select('text.node-label').attr('y', (node) => node.radius + 22).text((node) => node.label)

  let lastX = 0
  let lastY = 0
  nodeGroups.call(
    drag<SVGGElement, GraphNode>()
      .on('start', (event, node) => {
        if (!event.active) simulation?.alphaTarget(0.24).restart()
        node.fx = node.x
        node.fy = node.y
        lastX = event.x
        lastY = event.y
      })
      .on('drag', (event, node) => {
        const dx = event.x - lastX
        const dy = event.y - lastY
        lastX = event.x
        lastY = event.y
        node.fx = event.x
        node.fy = event.y
        for (const link of activeLinks) {
          const source = endpointNode(link.source)
          const target = endpointNode(link.target)
          const neighbor = source?.id === node.id ? target : target?.id === node.id ? source : null
          if (!neighbor || neighbor.fx != null) continue
          neighbor.x = (neighbor.x ?? 0) + dx * 0.34
          neighbor.y = (neighbor.y ?? 0) + dy * 0.34
          neighbor.vx = (neighbor.vx ?? 0) + dx * 0.08
          neighbor.vy = (neighbor.vy ?? 0) + dy * 0.08
        }
      })
      .on('end', (event, node) => {
        if (!event.active) simulation?.alphaTarget(0)
        node.fx = event.x
        node.fy = event.y
      }),
  )

  if (!simulation) {
    simulation = forceSimulation<GraphNode, SimulationLink>()
      .force('link', forceLink<GraphNode, SimulationLink>().id((node) => node.id).distance(150).strength(0.38))
      .force('charge', forceManyBody<GraphNode>().strength(-560).distanceMax(390))
      .force('center', forceCenter(493, 350).strength(0.72))
      .force('collision', forceCollide<GraphNode>().radius((node) => node.radius + 18).iterations(2))
      .alphaDecay(0.028)
      .velocityDecay(0.3)
  }

  simulation.nodes(activeNodes).on('tick', () => {
    nodeGroups.attr('transform', (node) => `translate(${node.x ?? 0} ${node.y ?? 0})`)
    edgeGroups.each(function (link, index) {
      const geometry = curveGeometry(link, index)
      const group = select(this)
      group.selectAll<SVGPathElement, SimulationLink>('path').attr('d', geometry?.path ?? '')
      group.select<SVGTextElement>('text.relation-label')
        .attr('x', geometry?.labelX ?? 0)
        .attr('y', geometry?.labelY ?? 0)
    })
  })
  updateForces()
}

function resetLayout() {
  for (const node of activeNodes) {
    node.fx = null
    node.fy = null
  }
  simulation?.alpha(1).restart()
  if (svgElement.value && zoomBehavior) {
    select(svgElement.value).transition().duration(350).call(zoomBehavior.transform, zoomIdentity)
  }
}

function changeZoom(factor: number) {
  const svg = svgElement.value
  if (!svg || !zoomBehavior) return
  select(svg).transition().duration(180).call(zoomBehavior.scaleBy, factor)
}

function setViewMode(mode: 'local' | 'all' | 'idioms') {
  viewMode.value = mode
  selectedLinkId = null
  store.clearFocus()
  renderSubgraph()
  if (svgElement.value && zoomBehavior) {
    select(svgElement.value).transition().duration(350).call(zoomBehavior.transform, zoomIdentity)
  }
}

function toggleFullscreen() {
  if (document.fullscreenElement) document.exitFullscreen()
  else viewportElement.value?.requestFullscreen?.()
}

function syncFullscreen() {
  fullscreen.value = Boolean(document.fullscreenElement)
}

watch(() => store.focusTarget, (target) => {
  applyVisualState()
}, { deep: true })
watch(() => store.visibleCategories, renderSubgraph, { deep: true })
watch(() => store.selectedEras, renderSubgraph, { deep: true })

onMounted(() => {
  const svg = svgElement.value
  if (!svg) return
  zoomBehavior = zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.45, 4])
    .filter((event) => event.type === 'wheel' || !(event.target as Element).closest('.graph-entity'))
    .on('zoom', (event) => select(svg).select('.graph-pan-layer').attr('transform', event.transform.toString()))
  select(svg)
    .call(zoomBehavior)
    .on('click.clear-focus', (event) => {
      if (event.target !== svg) return
      selectedLinkId = null
      store.clearFocus()
      applyVisualState()
    })
  renderSubgraph()
  store.selectedEntityId = CENTER_ID
  store.focusEntity(CENTER_ID)
  document.addEventListener('fullscreenchange', syncFullscreen)
})

onUnmounted(() => {
  simulation?.stop()
  document.removeEventListener('fullscreenchange', syncFullscreen)
})
</script>

<template>
  <div ref="viewportElement" class="graph-viewport" aria-label="交互式知识图谱画布">
    <div class="graph-viewport__landscape" aria-hidden="true"></div>
    <svg
      ref="svgElement"
      class="graph-viewport__network"
      viewBox="0 0 986 700"
      preserveAspectRatio="xMidYMid meet"
      role="group"
      aria-label="由力导向算法自动布局的邯郸成语局部知识图谱"
    >
      <defs></defs>
      <g class="graph-pan-layer">
        <g class="graph-viewport__edges"></g>
        <g class="graph-viewport__nodes"></g>
      </g>
    </svg>
    <p v-if="isEmptyFilter" class="graph-viewport__empty" role="status">当前展开范围内没有符合分类与朝代条件的节点。</p>
    <div class="graph-viewport__load-state">当前加载 {{ loadedCount }} / 408 个节点</div>
    <div class="graph-viewport__legend" :hidden="!legendVisible" aria-label="图例说明">
      <h3>图例说明</h3>
      <ul>
        <li><i class="legend-mark legend-mark--idiom"></i>成语</li>
        <li><i class="legend-mark legend-mark--person"></i>历史人物</li>
        <li><i class="legend-mark legend-mark--site"></i>古迹遗址</li>
        <li><i class="legend-mark legend-mark--source"></i>史料文献</li>
        <li><i class="legend-mark legend-mark--event"></i>历史事件</li>
        <li><i class="legend-mark legend-mark--relation"></i>关联关系</li>
      </ul>
    </div>
    <div class="graph-viewport__tools" aria-label="图谱工具">
      <button type="button" :aria-pressed="fullscreen" @click="toggleFullscreen">{{ fullscreen ? '退出全屏' : '全屏' }}</button>
      <button type="button" @click="resetLayout">重新布局</button>
      <button type="button" :aria-pressed="viewMode === 'local'" @click="setViewMode('local')">局部展开</button>
      <button type="button" :aria-pressed="viewMode === 'all'" @click="setViewMode('all')">展示全部节点</button>
      <button type="button" :aria-pressed="viewMode === 'idioms'" @click="setViewMode('idioms')">只展示所有成语</button>
      <button type="button" :aria-pressed="legendVisible" @click="legendVisible = !legendVisible">图例说明</button>
    </div>
    <div class="graph-viewport__zoom-controls" aria-label="图谱缩放">
      <button type="button" aria-label="放大知识图谱" title="放大" @click="changeZoom(1.25)">＋</button>
      <button type="button" aria-label="缩小知识图谱" title="缩小" @click="changeZoom(0.8)">−</button>
    </div>
  </div>
</template>
