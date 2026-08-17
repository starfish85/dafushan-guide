<script setup>
const KINDS = ['eddy', 'hover', 'cross-r', 'cross-l', 'fall-lift', 'lift']
const COLORS = ['#1a6b34', '#2f7a3d', '#3d8b4a', '#6aa56a', '#4a8f52']

function rand(min, max) {
  return min + Math.random() * (max - min)
}

function pickStart(kind) {
  if (kind === 'cross-r') return { x: rand(-10, -3), y: rand(8, 72) }
  if (kind === 'cross-l') return { x: rand(102, 110), y: rand(8, 72) }
  if (kind === 'fall-lift') return { x: rand(4, 92), y: rand(-16, -6) }
  if (kind === 'lift') return { x: rand(6, 82), y: rand(62, 92) }
  if (kind === 'hover') return { x: rand(12, 84), y: rand(4, 32) }
  return { x: rand(10, 86), y: rand(10, 52) }
}

function pickTiming(kind) {
  if (kind === 'eddy') return rand(16, 28)
  if (kind === 'hover') return rand(14, 24)
  if (kind === 'cross-r' || kind === 'cross-l') return rand(22, 38)
  if (kind === 'lift') return rand(18, 30)
  return rand(24, 40)
}

const leaves = Array.from({ length: 14 }, (_, i) => {
  const kind = KINDS[i % KINDS.length]
  const { x, y } = pickStart(kind)
  return {
    kind,
    x: `${x.toFixed(1)}%`,
    y: `${y.toFixed(1)}%`,
    s: rand(11, 22),
    d: `${(-rand(0, 22)).toFixed(1)}s`,
    t: pickTiming(kind),
    o: rand(0.2, 0.38),
    c: COLORS[i % COLORS.length],
    dx: `${rand(36, 110).toFixed(0)}px`,
    dy: `${rand(18, 56).toFixed(0)}px`,
    spin: `${rand(160, 420).toFixed(0)}deg`,
    flip: Math.random() > 0.5 ? -1 : 1,
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
      :class="leaf.kind"
      :style="{
        left: leaf.x,
        top: leaf.y,
        width: leaf.s + 'px',
        height: leaf.s * 1.35 + 'px',
        opacity: leaf.o,
        background: leaf.c,
        animationDuration: leaf.t + 's',
        animationDelay: leaf.d,
        '--dx': leaf.dx,
        '--dy': leaf.dy,
        '--spin': leaf.spin,
        '--flip': leaf.flip,
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
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
  will-change: transform;
}
.leaf.eddy {
  animation-name: eddy;
}
.leaf.hover {
  animation-name: hover;
}
.leaf.cross-r {
  animation-name: cross-r;
}
.leaf.cross-l {
  animation-name: cross-l;
}
.leaf.fall-lift {
  animation-name: fall-lift;
}
.leaf.lift {
  animation-name: lift;
}

/* 原地回旋，有升有降，不往下冲 */
@keyframes eddy {
  0%,
  100% {
    transform: translate3d(0, 0, 0) rotate(0deg);
  }
  18% {
    transform: translate3d(var(--dx), calc(var(--dy) * -0.4)) rotate(calc(var(--spin) * 0.22));
  }
  38% {
    transform: translate3d(calc(var(--dx) * -0.55), var(--dy)) rotate(calc(var(--spin) * 0.48));
  }
  58% {
    transform: translate3d(calc(var(--dx) * 0.35), calc(var(--dy) * -0.7)) rotate(calc(var(--spin) * 0.7));
  }
  78% {
    transform: translate3d(calc(var(--dx) * -0.75), calc(var(--dy) * 0.25)) rotate(calc(var(--spin) * 0.88));
  }
}

/* 顶部附近被风托住，左右飘 */
@keyframes hover {
  0%,
  100% {
    transform: translate3d(0, 0, 0) rotate(-12deg);
  }
  20% {
    transform: translate3d(calc(var(--dx) * 0.7), calc(var(--dy) * -0.35)) rotate(28deg);
  }
  45% {
    transform: translate3d(calc(var(--dx) * -0.4), calc(var(--dy) * 0.45)) rotate(-36deg);
  }
  70% {
    transform: translate3d(calc(var(--dx) * 0.55), calc(var(--dy) * -0.15)) rotate(18deg);
  }
}

/* 从左被风吹到右边，轨迹上下起伏 */
@keyframes cross-r {
  0% {
    transform: translate3d(0, 0, 0) rotate(-18deg);
  }
  22% {
    transform: translate3d(26vw, calc(var(--dy) * -0.8)) rotate(48deg);
  }
  48% {
    transform: translate3d(54vw, calc(var(--dy) * 0.7)) rotate(-22deg);
  }
  74% {
    transform: translate3d(82vw, calc(var(--dy) * -0.45)) rotate(62deg);
  }
  100% {
    transform: translate3d(118vw, calc(var(--dy) * 0.2)) rotate(8deg);
  }
}

@keyframes cross-l {
  0% {
    transform: translate3d(0, 0, 0) rotate(16deg);
  }
  22% {
    transform: translate3d(-26vw, calc(var(--dy) * 0.6)) rotate(-42deg);
  }
  48% {
    transform: translate3d(-54vw, calc(var(--dy) * -0.75)) rotate(30deg);
  }
  74% {
    transform: translate3d(-82vw, calc(var(--dy) * 0.35)) rotate(-55deg);
  }
  100% {
    transform: translate3d(-118vw, calc(var(--dy) * -0.15)) rotate(-8deg);
  }
}

/* 下落途中会被风托起再改方向 */
@keyframes fall-lift {
  0% {
    transform: translate3d(0, 0, 0) rotate(0deg);
  }
  16% {
    transform: translate3d(calc(var(--dx) * 0.7 * var(--flip)), 18vh) rotate(calc(var(--spin) * 0.18));
  }
  32% {
    transform: translate3d(calc(var(--dx) * -0.45 * var(--flip)), 36vh) rotate(calc(var(--spin) * 0.36));
  }
  46% {
    transform: translate3d(calc(var(--dx) * 0.55 * var(--flip)), 24vh) rotate(calc(var(--spin) * 0.5));
  }
  64% {
    transform: translate3d(calc(var(--dx) * -0.7 * var(--flip)), 52vh) rotate(calc(var(--spin) * 0.68));
  }
  82% {
    transform: translate3d(calc(var(--dx) * 0.35 * var(--flip)), 86vh) rotate(calc(var(--spin) * 0.86));
  }
  100% {
    transform: translate3d(calc(var(--dx) * -0.2 * var(--flip)), 118vh) rotate(var(--spin));
  }
}

/* 从下方被风卷上去，再斜着飘走 */
@keyframes lift {
  0% {
    transform: translate3d(0, 0, 0) rotate(8deg);
  }
  28% {
    transform: translate3d(calc(var(--dx) * 0.45 * var(--flip)), calc(var(--dy) * -1.4)) rotate(-40deg);
  }
  52% {
    transform: translate3d(calc(var(--dx) * -0.25 * var(--flip)), calc(var(--dy) * -2.4)) rotate(55deg);
  }
  76% {
    transform: translate3d(calc(var(--dx) * 1.1 * var(--flip)), calc(var(--dy) * -1.1)) rotate(-18deg);
  }
  100% {
    transform: translate3d(calc(var(--dx) * 0.2 * var(--flip)), calc(var(--dy) * -0.2)) rotate(12deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .leaf {
    animation: none;
    display: none;
  }
}
</style>
