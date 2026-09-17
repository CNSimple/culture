import { createRouter, createWebHistory } from 'vue-router'
import KnowledgeGraphPage from '../pages/KnowledgeGraphPage.vue'
import HomeMapPage from '../pages/HomeMapPage.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/knowledge-graph' },
    { path: '/knowledge-graph', name: 'knowledge-graph', component: KnowledgeGraphPage },
    { path: '/home-map', name: 'home-map', component: HomeMapPage },
  ],
})

export default router
