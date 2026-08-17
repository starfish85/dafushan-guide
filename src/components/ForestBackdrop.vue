<script setup>
const leaves = [
  { l: '8%', d: '0s', s: 18, t: 22, o: 0.38 },
  { l: '22%', d: '4s', s: 14, t: 28, o: 0.28 },
  { l: '36%', d: '9s', s: 22, t: 24, o: 0.34 },
  { l: '48%', d: '2s', s: 12, t: 32, o: 0.24 },
  { l: '61%', d: '7s', s: 20, t: 26, o: 0.32 },
  { l: '74%', d: '12s', s: 16, t: 30, o: 0.26 },
  { l: '88%', d: '5s', s: 19, t: 25, o: 0.3 },
  { l: '14%', d: '15s', s: 13, t: 34, o: 0.22 },
  { l: '55%', d: '18s', s: 17, t: 27, o: 0.28 },
  { l: '80%', d: '11s', s: 15, t: 29, o: 0.25 },
]
</script>

<template>
  <div class="forest" aria-hidden="true">
    <div class="haze" />
    <svg class="canopy left" viewBox="0 0 80 80">
      <path
        d="M40 8 C22 18 10 36 14 54 C20 48 28 44 40 52 C52 44 60 48 66 54 C70 36 58 18 40 8 Z"
        fill="#1a6b34"
      />
    </svg>
    <svg class="canopy right" viewBox="0 0 80 80">
      <path
        d="M40 8 C22 18 10 36 14 54 C20 48 28 44 40 52 C52 44 60 48 66 54 C70 36 58 18 40 8 Z"
        fill="#2f7a3d"
      />
    </svg>
    <span
      v-for="(leaf, i) in leaves"
      :key="i"
      class="leaf"
      :style="{
        left: leaf.l,
        animationDelay: leaf.d,
        animationDuration: leaf.t + 's',
        width: leaf.s + 'px',
        height: leaf.s * 1.35 + 'px',
        opacity: leaf.o,
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
.canopy {
  position: absolute;
  width: 88px;
  opacity: 0.12;
  animation: sway 7s ease-in-out infinite;
}
.canopy.left {
  top: -8px;
  left: -6px;
}
.canopy.right {
  top: 10px;
  right: -10px;
  animation-delay: -2.4s;
  animation-direction: reverse;
}
.leaf {
  position: absolute;
  top: -40px;
  background: #1a6b34;
  border-radius: 2px 70% 2px 70%;
  transform-origin: center;
  animation-name: drift;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}
.leaf:nth-child(3n) {
  background: #3d8b4a;
}
.leaf:nth-child(4n) {
  background: #6aa56a;
}

@keyframes sway {
  0%,
  100% {
    transform: rotate(-8deg);
  }
  50% {
    transform: rotate(10deg);
  }
}

@keyframes drift {
  0% {
    transform: translate3d(0, -8vh, 0) rotate(0deg);
  }
  25% {
    transform: translate3d(18px, 25vh, 0) rotate(55deg);
  }
  50% {
    transform: translate3d(-12px, 55vh, 0) rotate(120deg);
  }
  75% {
    transform: translate3d(22px, 80vh, 0) rotate(200deg);
  }
  100% {
    transform: translate3d(-8px, 110vh, 0) rotate(280deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .leaf,
  .canopy {
    animation: none;
  }
  .leaf {
    display: none;
  }
}
</style>
