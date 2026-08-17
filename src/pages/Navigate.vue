<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ParkMap from '../components/ParkMap.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import { getPoi } from '../data/pois'
import { buildRoute, nextInstruction } from '../data/paths'
import { app, userPoint } from '../stores/app'
import { externalMapUrl, formatDistance, haversine, isInsidePark, walkMinutes } from '../utils/geo'
import { speak, stopVoice } from '../utils/voice'
import { useGeolocation } from '../composables/useGeolocation'

const route = useRoute()
const router = useRouter()
const askExit = ref(false)
const lastSpoken = ref('')
const { restartWatch } = useGeolocation()
const here = computed(() => userPoint())
const dest = computed(() => getPoi(route.params.id))
const inPark = computed(() => isInsidePark(here.value))
const straight = computed(() =>
  here.value && dest.value ? haversine(here.value, dest.value) : null,
)
const plan = computed(() => {
  if (!here.value || !dest.value || !inPark.value) return null
  return buildRoute(here.value, dest.value.id)
})
const guide = computed(() => nextInstruction(here.value, plan.value?.points || []))

const remainText = computed(() => {
  if (!here.value) return '还没有您的位置'
  if (!inPark.value && straight.value != null) {
    return `直线${formatDistance(straight.value)}。您不在园内，园内步道导航不能当高德用`
  }
  if (!plan.value) return '正在规划'
  if (guide.value.arrived) return '已经到达'
  return `园内剩余约${formatDistance(guide.value.remain)}`
})
const etaText = computed(() => {
  if (!plan.value || guide.value.arrived) return ''
  return `预计再走约${walkMinutes(guide.value.remain)}分钟`
})
const cmdText = computed(() => {
  if (!here.value) return '请先开启定位'
  if (!inPark.value) return '您现在不在园内'
  if (guide.value.arrived) return '已经到达目的地'
  return guide.value.text
})

function openAmap() {
  if (!dest.value) return
  window.location.href = externalMapUrl(dest.value)
}

function maybeSpeak() {
  if (!inPark.value) return
  if (!app.voiceEnabled || !guide.value.text) return
  const key = guide.value.arrived ? 'arrived' : guide.value.text
  if (key === lastSpoken.value) return
  lastSpoken.value = key
  speak(guide.value.arrived ? `已经到达${dest.value?.name || '目的地'}` : guide.value.text)
}

let timer
onMounted(() => {
  maybeSpeak()
  timer = window.setInterval(maybeSpeak, 12000)
})
onBeforeUnmount(() => {
  window.clearInterval(timer)
  stopVoice()
})
watch(() => guide.value.text, maybeSpeak)

function leave() {
  stopVoice()
  router.replace({ name: 'home' })
}
</script>

<template>
  <main class="page nav-page">
    <header class="page-head">
      <button class="back" @click="askExit = true">‹ 退出导航</button>
      <h1>大夫山森林公园</h1>
      <span class="icon-btn" />
    </header>

    <div class="stage" :class="{ locked: askExit }">
      <ParkMap
        v-if="dest"
        :pois="[dest]"
        :user="here"
        :route="plan?.points || (here && dest ? [here, dest] : [])"
        :selected-id="dest.id"
      />
    </div>

    <section class="panel">
      <p class="to" v-if="dest">前往 {{ dest.name }}</p>
      <p class="cmd">{{ cmdText }}</p>
      <p class="sub">{{ remainText }}</p>
      <p v-if="etaText" class="sub">{{ etaText }}</p>
      <button v-if="!here" class="primary-btn extra" @click="restartWatch">开启真实定位</button>
      <button v-else-if="!inPark" class="primary-btn extra" @click="openAmap">用高德去这里</button>
      <p class="voice-state">语音导航{{ app.voiceEnabled ? '已开启' : '已关闭' }}</p>
      <button class="end" @click="askExit = true">结束导航</button>
    </section>

    <ConfirmDialog
      v-if="askExit"
      title="确定要退出导航吗"
      cancel-text="继续导航"
      ok-text="退出"
      @cancel="askExit = false"
      @ok="leave"
    />
  </main>
</template>

<style scoped>
.nav-page {
  display: flex;
  flex-direction: column;
  height: 100dvh;
  padding-bottom: var(--tab-h);
  background: var(--bg);
}
.back {
  min-height: var(--tap);
  padding: 0 8px;
  font-weight: 800;
  font-size: var(--fs-md);
  white-space: nowrap;
}
.stage {
  flex: 1;
  min-height: 220px;
  margin: 0 12px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: var(--shadow);
}
.stage.locked {
  pointer-events: none;
}
.panel {
  margin: 12px 12px 0;
  background: #fff;
  border-radius: 20px 20px 0 0;
  padding: 16px 16px 10px;
  text-align: center;
  box-shadow: var(--shadow);
}
.to {
  margin: 0 0 6px;
  color: var(--muted);
  font-size: var(--fs-xs);
  font-weight: 800;
}
.cmd {
  margin: 0 0 10px;
  font-size: var(--fs-xl);
  font-weight: 800;
  color: var(--primary);
}
.sub {
  margin: 0 0 6px;
  font-size: var(--fs-md);
  font-weight: 700;
}
.voice-state {
  margin: 16px 0;
  font-size: var(--fs-md);
  font-weight: 700;
}
.extra {
  margin: 12px auto 0;
  max-width: 280px;
}
.end {
  width: 100%;
  min-height: var(--tap-main);
  margin-top: 8px;
  border-radius: 999px;
  background: #e4f4e2;
  color: var(--primary);
  font-size: var(--fs-lg);
  font-weight: 800;
}
</style>
