<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { audioUrl, bindPlayer, speak, stopVoice, unbindPlayer } from '../utils/voice'

const props = defineProps({
  clip: { type: String, required: true },
  text: { type: String, default: '' },
})

const el = ref(null)
const playing = ref(false)

onMounted(() => bindPlayer(el.value))
onBeforeUnmount(() => {
  stopVoice()
  unbindPlayer(el.value)
})

function tap() {
  if (playing.value) {
    stopVoice()
    playing.value = false
    return
  }
  const ok = speak(props.text, {
    force: true,
    clip: props.clip,
    onEnd: () => {
      playing.value = false
    },
  })
  playing.value = ok
}
</script>

<template>
  <div class="vp">
    <button class="play" type="button" @click="tap">
      <span class="orb">{{ playing ? '■' : '▶' }}</span>
      <span class="play-text">{{ playing ? '正在讲解，点一下停止' : '点这里听讲解' }}</span>
    </button>
    <audio
      ref="el"
      class="bar"
      :src="audioUrl(clip)"
      controls
      preload="auto"
      playsinline
      webkit-playsinline
    />
    <p class="hint">如果上面没声，请再点这一条上的三角形</p>
  </div>
</template>

<style scoped>
.vp {
  display: grid;
  gap: 10px;
}
.play {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: var(--tap);
  width: 100%;
}
.orb {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e4f4e2;
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex: none;
}
.play-text {
  font-weight: 800;
  color: var(--primary);
}
.bar {
  width: 100%;
  height: 40px;
}
.hint {
  margin: 0;
  font-size: var(--fs-xs);
  font-weight: 700;
  color: var(--muted);
}
</style>
