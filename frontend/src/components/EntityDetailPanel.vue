<script setup lang="ts">
import { computed, ref } from 'vue'
import { graphLinks, graphNodes } from '../data/graphData'
import { useKnowledgeGraphStore, type DetailTab } from '../stores/knowledgeGraph'
import { openPlatformPage } from '../lib/platform'

const IDIOM_ID = 'huangliang'
const FAVORITE_KEY = 'yanzhao-knowledge-graph-favorites'

const store = useKnowledgeGraphStore()

const tabs: { id: DetailTab; label: string }[] = [
  { id: 'relations', label: '关联信息' },
  { id: 'origin', label: '典故来源' },
  { id: 'ai', label: 'AI解读' },
  { id: 'study', label: '研学拓展' },
]

// 关联条目直接取自图谱的四条关系，保证每一行都能定位到画布上的实体。
const relationOrder = ['related-lu', 'related-lv', 'related-temple', 'related-book']
const relations = relationOrder
  .map((id) => graphLinks.find((link) => link.id === id))
  .filter((link): link is (typeof graphLinks)[number] => Boolean(link))
  .map((link) => {
    const nodeId = link.source === IDIOM_ID ? link.target : link.source
    return {
      key: link.id,
      label: link.label,
      value: graphNodes.find((node) => node.id === nodeId)?.label ?? '',
      nodeId,
    }
  })

function readFavorites(): string[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(FAVORITE_KEY) ?? '[]')
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : []
  } catch {
    return []
  }
}

const favorites = ref<string[]>(readFavorites())
const isFavorite = computed(() => favorites.value.includes(IDIOM_ID))

function toggleFavorite() {
  favorites.value = isFavorite.value
    ? favorites.value.filter((id) => id !== IDIOM_ID)
    : [...favorites.value, IDIOM_ID]
  localStorage.setItem(FAVORITE_KEY, JSON.stringify(favorites.value))
}
</script>

<template>
  <aside class="entity-detail" aria-labelledby="detail-name">
    <div class="entity-detail__hero" role="img" aria-label="黄粱一梦典故场景"></div>
    <div class="entity-detail__body">
      <header class="entity-detail__heading">
        <div>
          <h2 id="detail-name">黄粱一梦</h2>
          <p lang="zh-Latn-pinyin">huáng liáng yī mèng</p>
        </div>
        <span>成语</span>
      </header>
      <p class="entity-detail__meaning">比喻虚幻的梦想，或比喻空想不能实现。</p>
      <blockquote>“一枕黄粱，梦觉来，万事皆空。”<cite>——《枕中记》</cite></blockquote>
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
        <dl>
          <div v-for="relation in relations" :key="relation.key">
            <dt>{{ relation.label }}</dt>
            <dd>{{ relation.value }}</dd>
            <button type="button" :aria-label="`在图谱中定位${relation.value}`" @click="store.focusEntity(relation.nodeId)">查看</button>
          </div>
        </dl>
      </section>

      <section v-else-if="store.activeTab === 'origin'" class="entity-detail__panel" aria-label="典故来源">
        <h3>典故出处</h3>
        <p>出自唐代沈既济的传奇小说《枕中记》。卢生在邯郸道上的客舍向道士吕翁感叹处境困顿，吕翁取出一只青瓷枕让他安睡。</p>
        <p>梦中卢生历尽荣华、儿孙满堂，醒来时主人的黄粱饭还没有煮熟。后世便以“黄粱一梦”比喻虚幻的梦想或空欢喜一场。</p>
      </section>

      <section v-else-if="store.activeTab === 'ai'" class="entity-detail__panel" aria-label="AI解读">
        <h3>叙事结构</h3>
        <p>“枕”是梦与醒的分界：故事把一生的荣华压缩进一顿饭的时间，用强烈的时间落差制造出醒悟的瞬间。</p>
        <h3>可以追问的角度</h3>
        <p>故事提醒的并不是否定追求，而是让人分辨愿望与真实；同一题材在后世戏曲、绘画中不断被重写。</p>
        <p class="demo-note">本栏目为原型阶段的解读示例，正式版将接入知识库检索与模型生成。</p>
      </section>

      <section v-else class="entity-detail__panel" aria-label="研学拓展">
        <h3>研学任务</h3>
        <ol>
          <li>前往黄粱梦吕仙祠，观察现存建筑与碑刻，记录与故事对应的空间线索。</li>
          <li>对比《枕中记》原文与后世黄粱梦题材的戏曲、绘画，整理题材的演变。</li>
          <li>以“一枕黄粱”为题，写一段发生在今天的寓言。</li>
        </ol>
      </section>

      <section class="entity-detail__mini-graph" aria-label="知识关系图谱局部">
        <h3>知识关系图谱（局部）</h3>
        <div class="entity-detail__mini-graph-content"></div>
      </section>
    </div>
  </aside>
</template>
