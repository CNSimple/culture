import { createRouter, createWebHistory } from 'vue-router'
import KnowledgeGraphPage from '../pages/KnowledgeGraphPage.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/knowledge-graph' },
    { path: '/knowledge-graph', name: 'knowledge-graph', component: KnowledgeGraphPage },
  ],
})

export default router
