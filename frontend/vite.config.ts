import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ command }) => ({
  plugins: [vue()],
  // 构建产物由 Flask 原型的 /knowledge-graph 路由托管，资源从 static/graph-app 下取用；
  // 开发服务器仍从根路径提供页面。
  base: command === 'build' ? '/static/graph-app/' : '/',
  build: {
    outDir: '../static/graph-app',
    emptyOutDir: true,
  },
}))
