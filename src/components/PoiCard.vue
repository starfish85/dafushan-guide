<script setup>
import { computed } from 'vue'
import { TYPE_META } from '../data/pois'
import { formatDistance } from '../utils/geo'

const props = defineProps({
  poi: { type: Object, required: true },
  compact: { type: Boolean, default: false },
})
const emit = defineEmits(['go', 'detail'])

const meta = computed(() => TYPE_META[props.poi.type])
const distText = computed(() => {
  if (props.poi.distance == null) return '开启定位后显示距离'
  const walk = props.poi.walkMin ? ` · 约${props.poi.walkMin}分钟` : ''
  return `直线 ${formatDistance(props.poi.distance)}${walk}`
})
</script>

<template>
  <article class="card box">
    <button class="main" @click="emit('detail', poi)">
      <span class="type" :style="{ background: meta.color }">{{ meta.icon }}</span>
      <span class="text">
        <strong>{{ poi.name }}</strong>
        <em>{{ distText }}</em>
      </span>
    </button>
    <button class="go" @click="emit('go', poi)">去这里</button>
  </article>
</template>

<style scoped>
.box {
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.main {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  text-align: left;
}
.type {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 800;
  flex: none;
}
.text {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.text strong {
  font-size: var(--fs-md);
}
.text em {
  font-style: normal;
  color: var(--muted);
  font-size: var(--fs-xs);
  font-weight: 700;
}
.go {
  flex: none;
  min-height: 44px;
  padding: 0 16px;
  border-radius: 999px;
  background: var(--primary);
  color: #fff;
  font-weight: 800;
}
</style>
