<script setup lang="ts">
import { computed, ref } from 'vue'
import { graphNodeById, graphNodes, relationsByNodeId } from '../data/graphData'
import { useKnowledgeGraphStore, type DetailTab } from '../stores/knowledgeGraph'
import { openPlatformPage } from '../lib/platform'
import {
  artworkBackgroundPosition,
  IDIOM_ARTWORK_PATH,
} from '../data/idiomArtwork'

const FAVORITE_KEY = 'yanzhao-knowledge-graph-favorites'
const store = useKnowledgeGraphStore()

const tabs: { id: DetailTab; label: string }[] = [
  { id: 'relations', label: '关联信息' },
  { id: 'origin', label: '节点说明' },
  { id: 'ai', label: '数据概览' },
  { id: 'study', label: '研学拓展' },
]

const kindLabels = {
  idiom: '成语',
  person: '历史人物',
  site: '地点遗址',
  source: '典籍出处',
  event: '历史事件',
} as const

const selectedNode = computed(() => graphNodeById.get(store.selectedEntityId) ?? graphNodes[0])

const heroStyle = computed(() => {
  const artwork = selectedNode.value ? artworkBackgroundPosition(selectedNode.value.id) : null
  if (!artwork) return undefined
  return {
    '--idiom-art-image': `url(${IDIOM_ARTWORK_PATH})`,
    '--idiom-art-size': artwork.size,
    '--idiom-art-position': artwork.position,
  }
})

const relations = computed(() => {
  const node = selectedNode.value
  if (!node) return []
  return (relationsByNodeId.get(node.id) ?? []).map((link) => {
    const otherId = link.source === node.id ? link.target : link.source
    return {
      key: link.id,
      label: link.label,
      value: graphNodeById.get(otherId)?.label ?? otherId,
      nodeId: otherId,
      kind: graphNodeById.get(otherId)?.kind ?? 'event',
    }
  })
})

const miniNodePositions = [
  { x: 55, y: 29 },
  { x: 245, y: 29 },
  { x: 55, y: 105 },
  { x: 245, y: 105 },
]

const miniGraphRelations = computed(() => relations.value.slice(0, 4).map((relation, index) => ({
  ...relation,
  ...miniNodePositions[index],
})))

function shortLabel(label: string, maxLength = 8) {
  return label.length > maxLength ? `${label.slice(0, maxLength)}…` : label
}

function readFavorites(): string[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(FAVORITE_KEY) ?? '[]')
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : []
  } catch {
    return []
  }
}

const favorites = ref<string[]>(readFavorites())
const isFavorite = computed(() => Boolean(selectedNode.value && favorites.value.includes(selectedNode.value.id)))

function toggleFavorite() {
  const id = selectedNode.value?.id
  if (!id) return
  favorites.value = isFavorite.value
    ? favorites.value.filter((favoriteId) => favoriteId !== id)
    : [...favorites.value, id]
  localStorage.setItem(FAVORITE_KEY, JSON.stringify(favorites.value))
}

function locateNode(id: string) {
  store.selectedEntityId = id
  store.focusEntity(id)
}
</script>

<template>
  <aside v-if="selectedNode" class="entity-detail" aria-labelledby="detail-name">
    <div class="entity-detail__hero" :style="heroStyle" role="img" :aria-label="`${selectedNode.label}相关文化场景`"></div>
    <div class="entity-detail__body">
      <header class="entity-detail__heading">
        <div>
          <h2 id="detail-name">{{ selectedNode.label }}</h2>
          <p>{{ selectedNode.id }}</p>
        </div>
        <span>{{ kindLabels[selectedNode.kind] }}</span>
      </header>
      <p class="entity-detail__meaning">
        {{ selectedNode.description || `“${selectedNode.label}”是知识图谱中的${kindLabels[selectedNode.kind]}节点。` }}
      </p>
      <blockquote>
        已连接 {{ relations.length }} 个相关节点
        <cite>——《邯郸成语典故》数据集</cite>
      </blockquote>
      <div class="entity-detail__actions">
        <button type="button" @click="openPlatformPage('story')">进入3D典故体验</button>
        <button type="button" :aria-pressed="isFavorite" @click="toggleFavorite">
          {{ isFavorite ? '已收藏' : '收藏' }}
        </button>
      </div>
      <div class="entity-detail__tabs" role="tablist" aria-label="实体详情栏目">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          role="tab"
          :class="{ 'is-active': tab.id === store.activeTab }"
          :aria-selected="tab.id === store.activeTab"
          @click="store.activeTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>

      <section v-if="store.activeTab === 'relations'" class="entity-detail__relations" aria-label="关联信息">
        <dl v-if="relations.length">
          <div v-for="relation in relations" :key="relation.key">
            <dt>{{ relation.label }}</dt>
            <dd>{{ relation.value }}</dd>
            <button type="button" :aria-label="`在图谱中定位${relation.value}`" @click="locateNode(relation.nodeId)">查看</button>
          </div>
        </dl>
        <p v-else>该节点暂未提取到关联关系。</p>
      </section>

      <section v-else-if="store.activeTab === 'origin'" class="entity-detail__panel" aria-label="节点说明">
        <h3>节点说明</h3>
        <p>{{ selectedNode.description || '原始数据未提供独立说明，可通过“关联信息”查看与该节点相连的成语、人物、地点或出处。' }}</p>
      </section>

      <section v-else-if="store.activeTab === 'ai'" class="entity-detail__panel" aria-label="数据概览">
        <h3>关系概览</h3>
        <p>节点类型：{{ kindLabels[selectedNode.kind] }}；当前收录 {{ relations.length }} 条直接关系。</p>
        <p class="demo-note">数据来自《邯郸成语典故》Excel 数据集的结构化提取结果。</p>
      </section>

      <section v-else class="entity-detail__panel" aria-label="研学拓展">
        <h3>研学任务</h3>
        <ol>
          <li>沿关系线查看与该节点相连的成语、人物、地点和典籍。</li>
          <li>返回原始数据核对典故梗概与出处。</li>
          <li>选择相邻节点，比较不同典故之间的共同人物或文献来源。</li>
        </ol>
      </section>

      <section class="entity-detail__mini-graph" aria-label="知识关系图谱局部">
        <h3>知识关系图谱（局部）</h3>
        <div class="entity-detail__mini-graph-content">
          <svg
            v-if="miniGraphRelations.length"
            viewBox="0 0 300 134"
            role="img"
            :aria-label="`${selectedNode.label}及其直接关联节点`"
          >
            <g v-for="relation in miniGraphRelations" :key="relation.key" class="mini-relation">
              <line x1="150" y1="67" :x2="relation.x" :y2="relation.y" />
              <text :x="(150 + relation.x) / 2" :y="(67 + relation.y) / 2 - 3">
                {{ relation.label }}
              </text>
            </g>

            <g
              v-for="relation in miniGraphRelations"
              :key="`node-${relation.key}`"
              class="mini-node"
              :class="`mini-node--${relation.kind}`"
              :transform="`translate(${relation.x} ${relation.y})`"
              role="button"
              tabindex="0"
              :aria-label="`查看${relation.value}`"
              @click="locateNode(relation.nodeId)"
              @keydown.enter.prevent="locateNode(relation.nodeId)"
              @keydown.space.prevent="locateNode(relation.nodeId)"
            >
              <circle r="7" />
              <text :y="relation.y < 67 ? -13 : 20">{{ shortLabel(relation.value) }}</text>
            </g>

            <g class="mini-node mini-node--center" transform="translate(150 67)">
              <circle r="25" />
              <text y="1">{{ shortLabel(selectedNode.label, 6) }}</text>
            </g>
          </svg>
          <p v-else>该节点暂无可展示的关联节点</p>
        </div>
      </section>
    </div>
  </aside>
</template>
