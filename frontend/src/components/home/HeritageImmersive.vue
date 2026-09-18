<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { heritageSites, type HeritageSite } from '../../data/heritageSites'
const props = defineProps<{ site: HeritageSite }>()
const emit = defineEmits<{ close: []; change: [site: HeritageSite] }>()
const expanded = ref<string | null>(null)
const direction = ref<'next'|'prev'>('next')
const index = computed(() => heritageSites.findIndex(item => item.id === props.site.id))
const cards = computed(() => [
  ['历史沿革', `${props.site.name}历经${props.site.era}的历史积淀，是观察当地社会与文化演变的重要窗口。`],
  ['地理位置', `位于${props.site.region}，与周边古城、山川及传统聚落共同构成文化景观。`],
  ['文化价值', `集中体现${props.site.theme}特色，兼具历史研究、公共教育与文化传承价值。`],
  ['相关成语', '可结合邯郸成语典故与地方人物故事，进一步理解遗迹背后的历史语境。'],
])
function move(step:number){ direction.value=step>0?'next':'prev'; const next=(index.value+step+heritageSites.length)%heritageSites.length; expanded.value=null; emit('change',heritageSites[next]) }
watch(() => props.site.id, () => { expanded.value=null })
</script>
<template>
  <section class="heritage" role="dialog" aria-modal="true" :aria-label="`${site.name}文化介绍`">
    <Transition :name="direction==='next'?'site-next':'site-prev'" mode="out-in">
      <div :key="site.id" class="heritage__page">
        <div class="heritage__visual">
          <img :src="site.image" :alt="`${site.name}实景照片`">
          <button class="heritage__back" @click="emit('close')">← 返回地图</button>
          <p class="heritage__vertical">{{ site.calligraphy }}</p>
        </div>
        <article class="heritage__panel">
          <button class="heritage__close" aria-label="关闭" @click="emit('close')">×</button>
          <span class="heritage__seal">邯</span><p class="heritage__eyebrow">燕赵遗韵 · 古迹实景</p>
          <h1>{{ site.name }}</h1>
          <div class="heritage__tags"><span>{{ site.region }}</span><span>{{ site.era }}</span><span>{{ site.theme }}</span></div>
          <p class="heritage__summary">{{ site.summary }}</p>
          <div class="heritage__cards"><button v-for="([title,detail],i) in cards" :key="title" :class="{open:expanded===title}" @click="expanded=expanded===title?null:title"><b>0{{ i+1 }}</b><strong>{{ title }}</strong><span>{{ expanded===title?detail:'点击展开' }}</span></button></div>
          <blockquote>{{ site.motto }}</blockquote>
        </article>
      </div>
    </Transition>
    <footer class="heritage__pager"><button @click="move(-1)">← 上一处</button><span>{{ index+1 }} / {{ heritageSites.length }}</span><button @click="move(1)">下一处 →</button></footer>
  </section>
</template>
<style scoped>
.heritage{position:fixed;inset:0;z-index:30;overflow:hidden;color:#eadcc0;background:#071315}.heritage__page{height:100%;display:grid;grid-template-columns:minmax(0,7fr) minmax(360px,3fr)}.heritage__visual{position:relative;overflow:hidden;animation:visual-in .95s cubic-bezier(.22,.61,.36,1)}.heritage__visual:after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent 55%,#0a1718 100%),linear-gradient(0deg,#06111399,transparent 38%);pointer-events:none}.heritage__visual img{width:100%;height:100%;object-fit:cover}.heritage__back{position:absolute;z-index:2;top:28px;left:30px;padding:11px 18px;border:1px solid #d4af79;border-radius:24px;color:#f2d79d;background:#081719cc;backdrop-filter:blur(8px)}.heritage__vertical{position:absolute;z-index:2;left:35px;top:110px;margin:0;writing-mode:vertical-rl;color:#f1d59c;font:700 28px/1.5 HeritageKai,KaiTi,serif;letter-spacing:6px;text-shadow:0 2px 8px #000}.heritage__panel{position:relative;padding:6vh 3vw 82px;background:linear-gradient(135deg,#182624f5,#0b1717f8);border-left:1px solid #806b4d;box-shadow:-20px 0 45px #0008;animation:panel-in .95s cubic-bezier(.22,.61,.36,1)}.heritage__panel:before{content:'';position:absolute;inset:0;opacity:.07;background:repeating-radial-gradient(circle at 100% 0,#d4af79 0 1px,transparent 2px 17px);pointer-events:none}.heritage__seal{float:right;display:grid;place-items:center;width:34px;height:34px;background:#9c3e31;color:#f4ddb3;font:20px KaiTi}.heritage__eyebrow{color:#bca47a;letter-spacing:3px;font-size:12px}.heritage h1{margin:14px 0;color:#f5dda8;font:700 clamp(42px,4vw,72px)/1 HeritageKai,KaiTi,serif;letter-spacing:5px}.heritage__tags{display:flex;gap:8px;flex-wrap:wrap}.heritage__tags span{padding:5px 10px;border:1px solid #8f754c;border-radius:14px;color:#d8c296;font-size:12px}.heritage__summary{margin:25px 0;line-height:1.9;color:#ded4c0;font-family:SimSun,serif}.heritage__cards{display:grid;grid-template-columns:1fr 1fr;gap:10px}.heritage__cards button{min-height:94px;padding:13px;text-align:left;border:1px solid #796546;background:#122221;color:#dfd2b8;transition:.3s}.heritage__cards button:hover,.heritage__cards button.open{border-color:#d4af79;background:#1b302d}.heritage__cards b,.heritage__cards strong,.heritage__cards span{display:block}.heritage__cards b{color:#9e845b;font:11px Georgia}.heritage__cards strong{margin:4px 0;color:#f0d8a7;font:18px KaiTi}.heritage__cards span{font-size:11px;line-height:1.55;color:#b9ad99}.heritage blockquote{margin:24px 0 0;padding:14px 0;border-top:1px solid #5f513d;color:#d8c296;font:17px/1.7 KaiTi,serif}.heritage__pager{position:absolute;z-index:3;right:3vw;bottom:24px;display:flex;align-items:center;gap:20px}.heritage__pager button{padding:8px 15px;border:1px solid #9a7b4d;background:#10201f;color:#e8ce99}.heritage__pager span{color:#c9b184;font-family:Georgia}.site-next-enter-active,.site-next-leave-active,.site-prev-enter-active,.site-prev-leave-active{transition:transform .55s ease,opacity .55s ease}.site-next-enter-from,.site-prev-leave-to{transform:translateX(8%);opacity:0}.site-next-leave-to,.site-prev-enter-from{transform:translateX(-8%);opacity:0}@keyframes visual-in{from{transform:translateX(-18%);opacity:0}to{transform:none;opacity:1}}@keyframes panel-in{from{transform:translateX(28%);opacity:0}to{transform:none;opacity:1}}@media(max-width:800px){.heritage__page{grid-template-columns:1fr}.heritage__visual{height:42vh}.heritage__panel{overflow:auto;padding:24px 20px 100px}.heritage h1{font-size:42px}.heritage__vertical{display:none}}
.heritage__page{position:relative!important;display:block!important;height:100%!important;overflow:hidden}
.heritage__visual{position:absolute!important;inset:0!important;width:100%!important;height:100%!important}
.heritage__visual:after{background:linear-gradient(90deg,transparent 28%,#07151644 52%,#071516df 100%),linear-gradient(0deg,#06111399,transparent 38%)!important}
.heritage__panel{position:absolute!important;z-index:2;top:0;right:0;width:min(43vw,680px)!important;height:100%!important;overflow:auto;padding:9vh 3vw 100px!important;background:linear-gradient(135deg,#182624d9,#0b1717e8)!important;backdrop-filter:blur(9px);animation:panel-in .95s cubic-bezier(.22,.61,.36,1)!important}
.heritage__panel{width:min(34vw,520px)!important;padding:9vh 2.8vw 100px!important;color:#3d3024;background:linear-gradient(135deg,#f8f0ddf5,#eee0c4f2)!important;border-left:1px solid #c9a66d;box-shadow:-18px 0 42px #3c281d55}.heritage__panel:before{opacity:.12;background:repeating-radial-gradient(circle at 100% 0,#9b7541 0 1px,transparent 2px 17px)}.heritage__close{position:absolute;right:24px;top:22px;border:0;background:transparent;color:#30271f;font:48px/1 Georgia;cursor:pointer}.heritage__eyebrow{color:#86663d}.heritage h1{color:#1e1812;text-shadow:0 1px #fff}.heritage__tags span{border-color:#b7935c;color:#6d5130}.heritage__summary{color:#544438}.heritage__cards button{border-color:#d8bf93;background:#fffaf0;color:#51412f;box-shadow:0 3px 8px #83643b1c}.heritage__cards button:hover,.heritage__cards button.open{border-color:#b2854b;background:#f6ead0}.heritage__cards strong{color:#4b3826}.heritage__cards span{color:#76624b}.heritage blockquote{border-color:#c6a875;color:#745432}
@media(max-width:800px){.heritage__panel{top:auto!important;bottom:0;width:100%!important;height:64%!important;padding:24px 20px 100px!important}}
</style>
