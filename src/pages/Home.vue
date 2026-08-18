<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { PARK_INFO, POIS, TYPE_META, withDistance } from '../data/pois'
import { ROUTES } from '../data/routes'
import { app, userPoint } from '../stores/app'
import { formatDistance, isInsidePark } from '../utils/geo'
import { useGeolocation } from '../composables/useGeolocation'

const router = useRouter()
const base = import.meta.env.BASE_URL
const { restartWatch } = useGeolocation()
const keyword = ref('')
const here = computed(() => userPoint())
const locationTitle = computed(() => {
  if (app.gpsStatus === 'locating' && !here.value) return '正在定位…'
  if (!here.value) return '还没有您的位置'
  if (here.value.source === 'mock') return `演示中：${app.mockPoiId === 'visitor-center' ? '游客中心' : '自选点'}`
  const list = withDistance(POIS, here.value)
  const nearest = list[0]
  if (!nearest) return '已定位'
  if (!isInsidePark(here.value)) return '已定位，您不在园内'
  if (nearest.distance <= 80) return `${nearest.name}附近`
  return `园内，距${nearest.name}约${formatDistance(nearest.distance)}`
})
const locationHint = computed(() => {
  if (!here.value) return '点右侧按钮开启定位后，再显示距离'
  if (here.value.source === 'mock') return '室内演示，不是手机真实定位'
  if (here.value.accuracy) return `真实定位，精度约${Math.round(here.value.accuracy)}米`
  return '真实定位。距离为直线，会比高德开车短'
})
const nearby = computed(() => withDistance(POIS, here.value).slice(0, 3))

function search() {
  router.push({ name: 'nearby', query: { q: keyword.value } })
}

function goPoi(poi) {
  if (poi.type === 'attraction') router.push({ name: 'detail', params: { id: poi.id } })
  else router.push({ name: 'navigate', params: { id: poi.id } })
}

function typeMeta(poi) {
  return TYPE_META[poi.type]
}
</script>

<template>
  <main class="page home">
    <header class="hero">
      <p class="eyebrow">广州 · 番禺</p>
      <h1>{{ PARK_INFO.name }}</h1>
    </header>

    <section class="pad">
      <article class="card loc">
        <span class="badge">位</span>
        <div class="loc-text">
          <p class="kicker">您当前位于</p>
          <strong>{{ locationTitle }}</strong>
          <small>{{ locationHint }}</small>
        </div>
        <button
          v-if="!here || here.source !== 'gps'"
          class="loc-btn"
          @click="restartWatch"
        >
          {{ app.gpsStatus === 'locating' ? '定位中' : '开启定位' }}
        </button>
      </article>

      <button class="card help-entry" @click="router.push({ name: 'help' })">
        <span class="help-mark">!</span>
        <span>
          <strong>求助</strong>
          <em>打电话给景区或报警急救</em>
        </span>
      </button>

      <form class="search-box" @submit.prevent="search">
        <span class="search-ico" aria-hidden="true">⌕</span>
        <input v-model="keyword" type="search" placeholder="想去哪里？" enterkeyhint="search" />
      </form>

      <button class="card map-entry" @click="router.push({ name: 'map' })">
        <img :src="`${base}maps/park-thumb.jpg?v=3`" alt="景区地图" />
        <span class="map-cta">查看完整地图</span>
      </button>

      <div class="near-head">
        <h2 class="section-title">推荐路线</h2>
      </div>
      <div class="routes">
        <button
          v-for="item in ROUTES"
          :key="item.id"
          class="card route"
          @click="router.push({ name: 'route', params: { id: item.id } })"
        >
          <strong>{{ item.name }}</strong>
          <em>{{ item.audience }} · 约{{ item.minutes }}分钟</em>
        </button>
      </div>

      <div class="near-head">
        <h2 class="section-title">附近</h2>
        <button class="more" @click="router.push({ name: 'nearby' })">查看更多</button>
      </div>

      <div class="near-list">
        <button v-for="poi in nearby" :key="poi.id" class="card near" @click="goPoi(poi)">
          <span
            class="type"
            :style="{ background: typeMeta(poi).color, color: typeMeta(poi).ink }"
          >
            {{ typeMeta(poi).icon }}
          </span>
          <span class="near-main">
            <strong>{{ poi.name }}</strong>
            <em v-if="poi.distance != null">直线 {{ formatDistance(poi.distance) }}</em>
            <em v-else>定位后显示距离</em>
            <small v-if="poi.intro" class="intro">{{ poi.intro }}</small>
          </span>
          <span class="go">去</span>
        </button>
      </div>
    </section>
  </main>
</template>

<style scoped>
.home {
  background: transparent;
}
.hero {
  padding: calc(18px + var(--safe-top)) 20px 8px;
  text-align: left;
}
.eyebrow {
  margin: 0 0 4px;
  color: var(--primary);
  font-size: var(--fs-xs);
  font-weight: 800;
  letter-spacing: 0.08em;
}
.hero h1 {
  margin: 0;
  color: var(--primary);
  font-size: var(--fs-xl);
  font-weight: 800;
  letter-spacing: 0.02em;
}
.pad {
  padding: 12px 16px 8px;
  display: grid;
  gap: 14px;
}
.loc {
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 12px;
  padding: 14px 14px 14px 12px;
}
.badge {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: #e4f4e2;
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  flex: none;
}
.loc-text {
  flex: 1;
  min-width: 0;
}
.kicker {
  margin: 0 0 2px;
  font-size: var(--fs-xs);
  color: var(--muted);
  font-weight: 700;
}
.loc strong {
  display: block;
  font-size: var(--fs-md);
  line-height: 1.3;
}
.loc small {
  display: block;
  margin-top: 4px;
  font-size: 13px;
  font-weight: 600;
  color: var(--muted);
}
.loc-btn {
  flex: none;
  min-height: 44px;
  padding: 0 12px;
  border-radius: 999px;
  background: var(--primary);
  color: #fff;
  font-size: var(--fs-xs);
  font-weight: 800;
  white-space: nowrap;
}
.help-entry {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  text-align: left;
  width: 100%;
}
.help-mark {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: #b42318;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: 800;
  flex: none;
}
.help-entry strong {
  display: block;
  font-size: var(--fs-md);
  color: #b42318;
}
.help-entry em {
  display: block;
  margin-top: 2px;
  font-style: normal;
  color: var(--muted);
  font-size: var(--fs-xs);
  font-weight: 700;
}
.search-ico {
  color: var(--primary);
  font-size: 22px;
  font-weight: 700;
}
.map-entry {
  overflow: hidden;
  padding: 0;
  text-align: left;
}
.map-entry img {
  width: 100%;
  height: 168px;
  object-fit: cover;
}
.map-cta {
  display: block;
  padding: 12px 16px 14px;
  font-size: var(--fs-md);
  font-weight: 800;
  color: var(--primary);
}
.routes {
  display: grid;
  gap: 8px;
}
.route {
  padding: 14px 16px;
  text-align: left;
  width: 100%;
}
.route strong {
  display: block;
  font-size: var(--fs-md);
  color: var(--primary);
}
.route em {
  display: block;
  margin-top: 4px;
  font-style: normal;
  color: var(--muted);
  font-size: var(--fs-xs);
  font-weight: 700;
}
.near-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 4px;
}
.section-title {
  margin: 0;
}
.more {
  min-height: 40px;
  color: var(--primary);
  font-weight: 800;
}
.near-list {
  display: grid;
  gap: 10px;
}
.near {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  text-align: left;
}
.type {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 800;
  flex: none;
}
.near-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.near-main strong {
  font-size: var(--fs-md);
}
.near-main em {
  font-style: normal;
  color: var(--muted);
  font-size: var(--fs-xs);
  font-weight: 700;
}
.intro {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  color: #3d4a3c;
  font-size: var(--fs-xs);
  font-weight: 600;
  line-height: 1.4;
}
.go {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e4f4e2;
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  flex: none;
}
</style>
