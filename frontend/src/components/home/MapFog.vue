<template>
  <div class="map-fog" aria-hidden="true">
    <div class="map-fog__wisps"></div>
    <div class="map-fog__veil"></div>
    <div class="map-fog__left"></div>
    <div class="map-fog__right"></div>
  </div>
</template>

<style scoped>
.map-fog{position:absolute;inset:0;overflow:hidden;pointer-events:none;isolation:isolate}
.map-fog__wisps{position:absolute;inset:-18%;opacity:.14;background:radial-gradient(ellipse at 12% 42%,rgba(190,202,190,.34),transparent 26%),radial-gradient(ellipse at 86% 62%,rgba(185,197,188,.3),transparent 28%),radial-gradient(ellipse at 52% 5%,rgba(209,210,193,.16),transparent 24%);filter:blur(28px);mix-blend-mode:screen;animation:fog-breathe 64s ease-in-out infinite alternate;will-change:transform,opacity}
.map-fog__veil{position:absolute;inset:-8%;opacity:0;background:radial-gradient(ellipse at 50% 50%,#e7dfc9f2 0%,#c8c1b8e8 42%,#253336d9 100%);filter:blur(18px)}
.map-fog__left,.map-fog__right{position:absolute;top:-16%;width:78%;height:132%;opacity:0;filter:blur(22px);will-change:transform,opacity}
.map-fog__left{left:-10%;background:radial-gradient(ellipse at 68% 27%,#f0e9d8 0 25%,transparent 66%),radial-gradient(ellipse at 55% 72%,#d8d3c5 0 30%,transparent 73%),linear-gradient(90deg,#566568e8,#dfd9c9e8 70%,transparent)}
.map-fog__right{right:-10%;background:radial-gradient(ellipse at 36% 72%,#eee7d6 0 26%,transparent 68%),radial-gradient(ellipse at 47% 32%,#d8d4c8 0 32%,transparent 75%),linear-gradient(270deg,#566568e8,#dfd9c9e8 70%,transparent)}
@keyframes fog-breathe{from{transform:translate3d(-1.2%,.4%,0) scale(1);opacity:.1}to{transform:translate3d(1.4%,-.6%,0) scale(1.025);opacity:.17}}
@media(prefers-reduced-motion:reduce){.map-fog__wisps{animation:none}}
</style>
