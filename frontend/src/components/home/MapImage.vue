<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps<{ src: string; alt: string; region?: boolean }>()
const resolvedSrc = computed(() => `${import.meta.env.BASE_URL}${props.src.replace(/^\//, '')}`)
</script>
<template>
  <div v-if="region" class="region-map-stage">
    <div class="region-map-background" aria-hidden="true"><img :src="resolvedSrc" alt="" draggable="false" /></div>
    <div class="region-map-atmosphere" aria-hidden="true"></div>
    <div class="region-map-shadow" aria-hidden="true"></div>
    <div class="region-map-main"><img class="map-image" :src="resolvedSrc" :alt="alt" draggable="false" /></div>
  </div>
  <div v-else class="overview-map-stage">
    <div class="overview-map-background" aria-hidden="true"><img :src="resolvedSrc" alt="" draggable="false" /></div>
    <div class="overview-map-atmosphere" aria-hidden="true"></div>
    <div class="overview-map-main"><img class="map-image map-image--overview" :src="resolvedSrc" :alt="alt" draggable="false" /></div>
  </div>
</template>

<style scoped>
.map-image{display:block;user-select:none}
.overview-map-stage{position:absolute;inset:0;overflow:visible;background:#091d1c;isolation:isolate}
.overview-map-background{position:absolute;inset:0;overflow:hidden}
.overview-map-background img{display:block;width:100%;height:100%;object-fit:cover;transform:scale(1.12);filter:blur(22px) brightness(.42) saturate(.8);opacity:.72}
.overview-map-background:after{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at center,rgba(5,18,18,.08) 0%,rgba(5,18,18,.28) 46%,rgba(5,18,18,.84) 100%),linear-gradient(90deg,#071719aa,transparent 27%,transparent 73%,#091d1caa)}
.overview-map-atmosphere{position:absolute;inset:0;pointer-events:none;opacity:.14;background:radial-gradient(ellipse at 11% 48%,#b9c4b272,transparent 34%),radial-gradient(ellipse at 87% 45%,#a0b7ab75,transparent 35%),repeating-linear-gradient(164deg,transparent 0 29px,#c0a77b16 30px 31px,transparent 32px 58px)}
.overview-map-main{position:absolute;inset:0;overflow:hidden}
.map-image--overview{width:100%;height:100%;object-fit:contain}
.region-map-stage{position:absolute;inset:0;overflow:hidden;background:radial-gradient(ellipse at center,#24302d 0%,#091d1c 75%,#071719 100%);isolation:isolate}
.region-map-background{position:absolute;inset:0;overflow:hidden;opacity:0;animation:region-background-enter .3s ease-out forwards}
.region-map-background img{display:block;width:100%;height:100%;object-fit:cover;transform:scale(1.12);filter:blur(22px) brightness(.38) saturate(.75);opacity:.7}
.region-map-background:after{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at center,rgba(5,18,18,.05) 0%,rgba(5,18,18,.25) 45%,rgba(5,18,18,.88) 100%),linear-gradient(90deg,rgba(5,18,18,.85),transparent 28%,transparent 72%,rgba(5,18,18,.85))}
.region-map-atmosphere{position:absolute;inset:0;opacity:.16;pointer-events:none;background:radial-gradient(ellipse at 8% 45%,#b2bbb277,transparent 38%),radial-gradient(ellipse at 91% 39%,#9fac9d77,transparent 37%),repeating-linear-gradient(164deg,transparent 0 24px,#d1b99518 25px 26px,transparent 27px 51px)}
.region-map-atmosphere:before,.region-map-atmosphere:after{content:'';position:absolute;bottom:11%;width:37%;height:38%;background:linear-gradient(180deg,#85958a66,#233a3677);filter:blur(12px);clip-path:polygon(0 100%,9% 61%,23% 77%,39% 29%,56% 68%,72% 42%,100% 100%)}
.region-map-atmosphere:before{left:-7%}.region-map-atmosphere:after{right:-7%;transform:scaleX(-1)}
.region-map-shadow{position:absolute;left:50%;bottom:3%;width:65%;height:12%;transform:translateX(-50%);background:radial-gradient(ellipse,rgba(0,0,0,.55),transparent 70%);filter:blur(15px);pointer-events:none}
.region-map-main{position:absolute;z-index:1;inset:0;overflow:hidden;opacity:0;animation:region-main-enter .8s cubic-bezier(.22,.61,.36,1) forwards}
.region-map-main .map-image{width:100%;height:100%;object-fit:contain;object-position:center center}
@keyframes region-background-enter{to{opacity:1}}
@keyframes region-main-enter{to{opacity:1}}
@media(prefers-reduced-motion:reduce){.region-map-background,.region-map-main{animation:none;opacity:1}}
</style>
