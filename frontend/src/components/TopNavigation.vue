<script setup lang="ts">
import { ref } from 'vue'
import { graphNodes } from '../data/graphData'
import { useKnowledgeGraphStore } from '../stores/knowledgeGraph'
import { platformUrl, openPlatformPage, type PlatformPage } from '../lib/platform'

const store = useKnowledgeGraphStore()
const query = ref('')

type NavItem = { label: string; page?: PlatformPage }

// 与 Flask 原型的顶栏栏目保持一致，当前页为知识图谱。
const links: NavItem[] = [
  { label: '首页', page: 'home' },
  { label: '成语研学', page: 'idioms' },
  { label: '知识图谱' },
  { label: 'AI问答', page: 'ask' },
  { label: '研学助手', page: 'study' },
  { label: '图片识别', page: 'recognize' },
]

/** 命中图谱实体就在本页聚焦，否则交给原型的成语研学页继续检索。 */
function submitSearch() {
  const text = query.value.trim()
  if (!text) return
  const match = graphNodes.find((node) => node.label.includes(text) || text.includes(node.label))
  if (match) {
    store.focusEntity(match.id)
    query.value = ''
    return
  }
  openPlatformPage('idioms')
}
</script>

<template>
  <header class="top-navigation" aria-label="主导航">
    <div class="top-navigation__brand">
      <a class="top-navigation__logo" :href="platformUrl('home')">燕赵遗韵</a>
      <span class="top-navigation__tagline">基于知识图谱的邯郸成语多模态研学平台</span>
    </div>
    <nav class="top-navigation__links" aria-label="网站栏目">
      <template v-for="link in links" :key="link.label">
        <RouterLink v-if="!link.page" to="/knowledge-graph" aria-current="page">{{ link.label }}</RouterLink>
        <a v-else class="top-navigation__link" :href="platformUrl(link.page)">{{ link.label }}</a>
      </template>
    </nav>
    <form class="top-navigation__search" role="search" @submit.prevent="submitSearch">
      <label class="sr-only" for="global-search">全站搜索</label>
      <input id="global-search" v-model="query" type="search" placeholder="搜索成语 / 人物 / 古迹 / 史料…" />
    </form>
    <div class="top-navigation__account" aria-label="账户入口">学生 · 小邯</div>
  </header>
</template>
