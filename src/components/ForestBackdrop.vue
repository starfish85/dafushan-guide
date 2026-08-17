<script setup>
const VARIANTS = ['swirl', 'gust', 'cross', 'loft', 'swoop', 'weave']
const COLORS = ['#1a6b34', '#2f7a3d', '#3d8b4a', '#6aa56a', '#4a8f52']

function rand(min, max) {
  return min + Math.random() * (max - min)
}

function pickStart(kind) {
  if (kind === 'gust') return { x: rand(-8, 12), y: rand(12, 58) }
  if (kind === 'cross') return { x: rand(72, 96), y: rand(14, 60) }
  if (kind === 'loft') return { x: rand(12, 78), y: rand(48, 78) }
  if (kind === 'swoop') return { x: rand(8, 84), y: rand(0, 18) }
  if (kind === 'weave') return { x: rand(18, 74), y: rand(10, 42) }
  return { x: rand(14, 80), y: rand(8, 46) }
}

function pickDuration(kind) {
  if (kind === 'swirl' || kind === 'weave') return rand(9, 14)
  if (kind === 'gust' || kind === 'cross') return rand(11, 17)
  return rand(10, 16)
}

const leaves = Array.from({ length: 12 }, (_, i) => {
  const kind = VARIANTS[i % VARIANTS.length]
  const { x, y } = pickStart(kind)
  return {
    kind,
    x: `${x.toFixed(1)}%`,
    y: `${y.toFixed(1)}%`,
    s: rand(13, 24),
    delay: `${(-rand(0, 12)).toFixed(1)}s`,
    duration: `${pickDuration(kind).toFixed(1)}s`,
    opacity: rand(0.28, 0.48),
    color: COLORS[i % COLORS.length],
  }
})
</script>

<template>
  <div class="forest" aria-hidden="true">
    <div class="haze" />
    <span
      v-for="(leaf, i) in leaves"
      :key="i"
      class="leaf"
      :style="{
        left: leaf.x,
        top: leaf.y,
        width: leaf.s + 'px',
        height: leaf.s * 1.35 + 'px',
        opacity: leaf.opacity,
        background: leaf.color,
        animation: `daofu-${leaf.kind} ${leaf.duration} linear ${leaf.delay} infinite`,
      }"
    />
  </div>
</template>

<style scoped>
.forest {
  position: fixed;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 0;
}
.haze {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(90% 50% at 50% -8%, rgba(207, 232, 200, 0.85) 0%, transparent 58%),
    linear-gradient(180deg, rgba(214, 232, 208, 0.35), transparent 40%);
}
.leaf {
  position: absolute;
  border-radius: 2px 70% 2px 70%;
  transform-origin: 60% 40%;
}
</style>

<!-- 关键帧不进 scoped，避免变量/哈希导致动画失效 -->
<style>
@keyframes daofu-swirl {
  0% {
    transform: translate3d(0, 0, 0) rotate(0deg);
  }
  25% {
    transform: translate3d(92px, 56px, 0) rotate(85deg);
  }
  50% {
    transform: translate3d(-48px, 18px, 0) rotate(175deg);
  }
  75% {
    transform: translate3d(76px, -46px, 0) rotate(260deg);
  }
  100% {
    transform: translate3d(0, 0, 0) rotate(360deg);
  }
}

@keyframes daofu-gust {
  0% {
    transform: translate3d(0, 0, 0) rotate(-18deg);
  }
  28% {
    transform: translate3d(28vw, -9vh, 0) rotate(42deg);
  }
  58% {
    transform: translate3d(58vw, 11vh, 0) rotate(-28deg);
  }
  100% {
    transform: translate3d(108vw, -5vh, 0) rotate(14deg);
  }
}

@keyframes daofu-cross {
  0% {
    transform: translate3d(0, 0, 0) rotate(16deg);
  }
  32% {
    transform: translate3d(-30vw, 9vh, 0) rotate(-48deg);
  }
  66% {
    transform: translate3d(-62vw, -11vh, 0) rotate(32deg);
  }
  100% {
    transform: translate3d(-108vw, 5vh, 0) rotate(-12deg);
  }
}

@keyframes daofu-loft {
  0% {
    transform: translate3d(0, 0, 0) rotate(10deg);
  }
  28% {
    transform: translate3d(54px, -20vh, 0) rotate(-38deg);
  }
  54% {
    transform: translate3d(-36px, -34vh, 0) rotate(58deg);
  }
  78% {
    transform: translate3d(86px, -18vh, 0) rotate(-16deg);
  }
  100% {
    transform: translate3d(18px, -6vh, 0) rotate(12deg);
  }
}

@keyframes daofu-swoop {
  0% {
    transform: translate3d(0, 0, 0) rotate(0deg);
  }
  18% {
    transform: translate3d(72px, 16vh, 0) rotate(62deg);
  }
  38% {
    transform: translate3d(-56px, 8vh, 0) rotate(18deg);
  }
  58% {
    transform: translate3d(64px, 36vh, 0) rotate(138deg);
  }
  78% {
    transform: translate3d(-40px, 22vh, 0) rotate(88deg);
  }
  100% {
    transform: translate3d(48px, 58vh, 0) rotate(210deg);
  }
}

@keyframes daofu-weave {
  0% {
    transform: translate3d(0, 0, 0) rotate(-10deg);
  }
  20% {
    transform: translate3d(110px, 8vh, 0) rotate(36deg);
  }
  40% {
    transform: translate3d(-88px, -8vh, 0) rotate(-42deg);
  }
  60% {
    transform: translate3d(96px, 12vh, 0) rotate(52deg);
  }
  80% {
    transform: translate3d(-64px, -5vh, 0) rotate(-22deg);
  }
  100% {
    transform: translate3d(0, 3vh, 0) rotate(8deg);
  }
}
</style>
