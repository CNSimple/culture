<script setup lang="ts">
import TopNavigation from '../components/TopNavigation.vue'
import EntityFilterSidebar from '../components/EntityFilterSidebar.vue'
import GraphViewport from '../components/GraphViewport.vue'
import EntityDetailPanel from '../components/EntityDetailPanel.vue'
import HistoricalTimeline from '../components/HistoricalTimeline.vue'
import { graphMetrics } from '../data/graphData'

const metrics = [
  { value: String(graphMetrics.entities), label: '文化实体' },
  { value: String(graphMetrics.relations), label: '实体关系' },
  { value: String(graphMetrics.categories), label: '节点类型' },
  { value: String(graphMetrics.idioms), label: '经典成语' },
]
</script>

<template>
  <div class="graph-page">
    <TopNavigation />
    <main class="graph-main">
      <EntityFilterSidebar />
      <section class="graph-content" aria-labelledby="graph-heading">
        <header class="graph-content__heading">
          <h1 id="graph-heading">知识图谱</h1>
          <p>以图谱之力　穿越千年　连接燕赵文化</p>
          <dl class="graph-content__stats">
            <div v-for="metric in metrics" :key="metric.label">
              <dt>{{ metric.value }}</dt>
              <dd>{{ metric.label }}</dd>
            </div>
          </dl>
        </header>
        <GraphViewport />
      </section>
      <EntityDetailPanel />
    </main>
    <HistoricalTimeline />
  </div>
</template>
