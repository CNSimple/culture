<script setup lang="ts">
import { useMapStore } from '../../stores/mapStore'
const store = useMapStore()
</script>
<template><aside class="ai-assistant" aria-label="AI研学助手"><h2>✧ AI 研学助手</h2><p>你好！我是小邯。今天想探索哪段邯郸故事？</p><small>地图位置：{{ store.aiContext.location }}</small></aside></template>
