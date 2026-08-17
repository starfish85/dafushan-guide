<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { audioUrl, bindPlayer, speak, stopVoice, unbindPlayer } from '../utils/voice'

const props = defineProps({
  clip: { type: String, required: true },
  text: { type: String, default: '' },
  label: { type: String, default: '播放语音讲解' },
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
    <button class="primary-btn talk" type="button" @click="tap">
      {{ playing ? '正在播放，点一下停止' : label }}
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
  </div>
</template>

<style scoped>
.vp {
  display: grid;
  gap: 10px;
}
.talk {
  width: 100%;
}
.bar {
  width: 100%;
  min-height: 44px;
}
</style>
