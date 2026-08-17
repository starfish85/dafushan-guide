<script setup>
const VARIANTS = ['drift', 'sweep', 'blow-r', 'blow-l', 'tumble', 'flutter']
const COLORS = ['#1a6b34', '#2f7a3d', '#3d8b4a', '#6aa56a', '#4a8f52']

function rand(min, max) {
  return min + Math.random() * (max - min)
}

const leaves = Array.from({ length: 11 }, (_, i) => {
  const kind = VARIANTS[i % VARIANTS.length]
  return {
    kind,
    x: `${rand(4, 90).toFixed(1)}%`,
    y: `${rand(-14, -5).toFixed(1)}%`,
    s: rand(13, 23),
    delay: `${(-rand(0, 18)).toFixed(1)}s`,
    duration: `${rand(15, 23).toFixed(1)}s`,
    opacity: rand(0.26, 0.44),
    color: COLORS[i % COLORS.length],
  }
})
</script>

<template>
  <div class="forest" aria-hidden="true">
    <div class="meadow" />
    <i class="patch a" />
    <i class="patch b" />
    <i class="patch c" />
    <i class="patch d" />
    <i class="patch e" />

    <div class="canopy">
      <div class="track far">
        <svg class="wave" viewBox="0 0 2400 320" preserveAspectRatio="none">
          <path
            fill="#245a32"
            d="M0 188 C180 108 300 268 480 178 C660 92 780 262 960 172 C1080 130 1160 200 1200 188 C1380 108 1500 268 1680 178 C1860 92 1980 262 2160 172 C2280 130 2360 200 2400 188 L2400 320 L0 320 Z"
          />
        </svg>
      </div>
      <div class="track mid">
        <svg class="wave" viewBox="0 0 2400 320" preserveAspectRatio="none">
          <path
            fill="#3d7a45"
            d="M0 170 C140 78 280 250 420 148 C560 62 720 246 880 156 C1040 70 1140 210 1200 170 C1340 78 1480 250 1620 148 C1760 62 1920 246 2080 156 C2240 70 2340 210 2400 170 L2400 320 L0 320 Z"
          />
        </svg>
      </div>
      <div class="track near">
        <svg class="wave" viewBox="0 0 2400 280" preserveAspectRatio="none">
          <path
            fill="#6aa35c"
            d="M0 150 C100 70 200 220 320 132 C440 52 540 214 680 140 C800 64 920 228 1060 128 C1140 90 1180 170 1200 150 C1300 70 1400 220 1520 132 C1640 52 1740 214 1880 140 C2000 64 2120 228 2260 128 C2340 90 2380 170 2400 150 L2400 280 L0 280 Z"
          />
        </svg>
      </div>
      <div class="track mist">
        <svg class="wave" viewBox="0 0 2400 240" preserveAspectRatio="none">
          <path
            fill="#cfe8b8"
            d="M0 128 C160 48 280 196 460 118 C640 46 780 190 960 122 C1080 70 1160 160 1200 128 C1360 48 1480 196 1660 118 C1840 46 1980 190 2160 122 C2280 70 2360 160 2400 128 L2400 240 L0 240 Z"
          />
        </svg>
      </div>
    </div>

    <div class="glint" />

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
.meadow {
  position: absolute;
  inset: -8%;
  background:
    radial-gradient(36% 30% at 8% 6%, #b7d6a0 0%, transparent 72%),
    radial-gradient(32% 28% at 92% 2%, #7eaf68 0%, transparent 70%),
    radial-gradient(48% 38% at 52% 14%, #d8edc6 0%, transparent 74%),
    radial-gradient(28% 24% at 78% 28%, #4f8a48 0%, transparent 68%),
    radial-gradient(40% 34% at 18% 48%, #c4e0b0 0%, transparent 72%),
    radial-gradient(34% 30% at 86% 62%, #8fbf76 0%, transparent 70%),
    radial-gradient(46% 36% at 42% 78%, #dcecc8 0%, transparent 76%),
    radial-gradient(30% 26% at 10% 88%, #a8c992 0%, transparent 68%),
    linear-gradient(162deg, #c5e0b4 0%, #e3f2d6 34%, #b7d4a4 58%, #d7ebc8 78%, #e8f4de 100%);
  animation: meadow-sway 18s ease-in-out infinite;
}
.patch {
  position: absolute;
  display: block;
  border-radius: 50%;
}
.patch.a {
  width: 58vw;
  height: 42vw;
  left: -12%;
  top: -8%;
  background: radial-gradient(circle, rgba(46, 102, 52, 0.28) 0%, transparent 70%);
  animation: patch-a 16s ease-in-out infinite;
}
.patch.b {
  width: 50vw;
  height: 38vw;
  right: -14%;
  top: 4%;
  background: radial-gradient(circle, rgba(122, 168, 86, 0.34) 0%, transparent 72%);
  animation: patch-b 20s ease-in-out infinite;
}
.patch.c {
  width: 64vw;
  height: 46vw;
  left: 28%;
  top: 18%;
  background: radial-gradient(circle, rgba(196, 224, 160, 0.4) 0%, transparent 70%);
  animation: patch-c 22s ease-in-out infinite;
}
.patch.d {
  width: 48vw;
  height: 36vw;
  left: -8%;
  bottom: 12%;
  background: radial-gradient(circle, rgba(90, 148, 78, 0.22) 0%, transparent 72%);
  animation: patch-d 19s ease-in-out infinite;
}
.patch.e {
  width: 56vw;
  height: 40vw;
  right: -10%;
  bottom: 4%;
  background: radial-gradient(circle, rgba(210, 230, 176, 0.36) 0%, transparent 70%);
  animation: patch-e 17s ease-in-out infinite;
}
.canopy {
  position: absolute;
  left: -5%;
  width: 110%;
  top: -6%;
  height: 52%;
}
.track {
  position: absolute;
  left: 0;
  width: 100%;
  overflow: visible;
}
.track.far {
  top: 0;
  height: 86%;
  opacity: 0.34;
  animation: swell-far 9s ease-in-out infinite;
}
.track.mid {
  top: 10%;
  height: 88%;
  opacity: 0.3;
  animation: swell-mid 7.5s ease-in-out infinite;
}
.track.near {
  top: 20%;
  height: 86%;
  opacity: 0.26;
  animation: swell-near 6.2s ease-in-out infinite;
}
.track.mist {
  top: 28%;
  height: 78%;
  opacity: 0.38;
  animation: swell-mist 8.4s ease-in-out infinite;
}
.wave {
  display: block;
  width: 200%;
  height: 100%;
}
.track.far .wave {
  animation: roll 24s linear infinite;
}
.track.mid .wave {
  animation: roll 17s linear infinite reverse;
}
.track.near .wave {
  animation: roll 12s linear infinite;
}
.track.mist .wave {
  animation: roll 15s linear infinite reverse;
}
.glint {
  position: absolute;
  inset: -20% -30%;
  background: linear-gradient(
    118deg,
    transparent 32%,
    rgba(255, 255, 230, 0.16) 46%,
    transparent 58%
  );
  animation: glint 14s ease-in-out infinite;
}
.leaf {
  position: absolute;
  border-radius: 2px 70% 2px 70%;
  transform-origin: 60% 40%;
}

@keyframes meadow-sway {
  0%,
  100% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  50% {
    transform: translate3d(-2.4%, 1.2%, 0) scale(1.05);
  }
}
@keyframes patch-a {
  0%,
  100% {
    transform: translate3d(0, 0, 0);
  }
  50% {
    transform: translate3d(8%, 5%, 0);
  }
}
@keyframes patch-b {
  0%,
  100% {
    transform: translate3d(0, 0, 0);
  }
  50% {
    transform: translate3d(-7%, 4%, 0);
  }
}
@keyframes patch-c {
  0%,
  100% {
    transform: translate3d(0, 0, 0);
  }
  50% {
    transform: translate3d(5%, -6%, 0);
  }
}
@keyframes patch-d {
  0%,
  100% {
    transform: translate3d(0, 0, 0);
  }
  50% {
    transform: translate3d(6%, -4%, 0);
  }
}
@keyframes patch-e {
  0%,
  100% {
    transform: translate3d(0, 0, 0);
  }
  50% {
    transform: translate3d(-5%, -3%, 0);
  }
}
@keyframes swell-far {
  0%,
  100% {
    transform: translate3d(0, 0, 0) scaleY(1);
  }
  50% {
    transform: translate3d(0, 3%, 0) scaleY(1.08);
  }
}
@keyframes swell-mid {
  0%,
  100% {
    transform: translate3d(0, 0, 0) scaleY(1);
  }
  50% {
    transform: translate3d(0, -2.5%, 0) scaleY(1.1);
  }
}
@keyframes swell-near {
  0%,
  100% {
    transform: translate3d(0, 0, 0) scaleY(1);
  }
  50% {
    transform: translate3d(0, 3.5%, 0) scaleY(1.12);
  }
}
@keyframes swell-mist {
  0%,
  100% {
    transform: translate3d(0, 0, 0) scaleY(1);
  }
  50% {
    transform: translate3d(0, -3%, 0) scaleY(1.07);
  }
}
@keyframes roll {
  0% {
    transform: translate3d(0, 0, 0);
  }
  100% {
    transform: translate3d(-50%, 0, 0);
  }
}
@keyframes glint {
  0%,
  100% {
    transform: translate3d(-8%, 0, 0);
    opacity: 0.35;
  }
  50% {
    transform: translate3d(10%, 2%, 0);
    opacity: 0.7;
  }
}
</style>

<style>
/* 左右飘、翻转，但高度一直往下，中间不停。 */
@keyframes daofu-drift {
  0% {
    transform: translate3d(0, 0, 0) rotate(0deg);
  }
  18% {
    transform: translate3d(72px, 16vh, 0) rotate(55deg);
  }
  36% {
    transform: translate3d(-46px, 36vh, 0) rotate(118deg);
  }
  55% {
    transform: translate3d(84px, 58vh, 0) rotate(188deg);
  }
  76% {
    transform: translate3d(-34px, 86vh, 0) rotate(258deg);
  }
  100% {
    transform: translate3d(38px, 122vh, 0) rotate(340deg);
  }
}

@keyframes daofu-sweep {
  0% {
    transform: translate3d(0, 0, 0) rotate(-16deg);
  }
  20% {
    transform: translate3d(-68px, 22vh, 0) rotate(42deg);
  }
  40% {
    transform: translate3d(36px, 46vh, 0) rotate(18deg);
  }
  62% {
    transform: translate3d(92px, 74vh, 0) rotate(-28deg);
  }
  82% {
    transform: translate3d(-28px, 98vh, 0) rotate(96deg);
  }
  100% {
    transform: translate3d(46px, 124vh, 0) rotate(210deg);
  }
}

@keyframes daofu-blow-r {
  0% {
    transform: translate3d(0, 0, 0) rotate(-20deg);
  }
  24% {
    transform: translate3d(20vw, 20vh, 0) rotate(38deg);
  }
  48% {
    transform: translate3d(8vw, 48vh, 0) rotate(86deg);
  }
  72% {
    transform: translate3d(30vw, 78vh, 0) rotate(148deg);
  }
  100% {
    transform: translate3d(16vw, 124vh, 0) rotate(220deg);
  }
}

@keyframes daofu-blow-l {
  0% {
    transform: translate3d(0, 0, 0) rotate(18deg);
  }
  24% {
    transform: translate3d(-18vw, 22vh, 0) rotate(-44deg);
  }
  48% {
    transform: translate3d(-6vw, 50vh, 0) rotate(16deg);
  }
  72% {
    transform: translate3d(-26vw, 80vh, 0) rotate(-96deg);
  }
  100% {
    transform: translate3d(-12vw, 124vh, 0) rotate(-168deg);
  }
}

@keyframes daofu-tumble {
  0% {
    transform: translate3d(0, 0, 0) rotate(0deg);
  }
  16% {
    transform: translate3d(42px, 14vh, 0) rotate(90deg);
  }
  32% {
    transform: translate3d(-74px, 32vh, 0) rotate(180deg);
  }
  48% {
    transform: translate3d(58px, 50vh, 0) rotate(270deg);
  }
  66% {
    transform: translate3d(-48px, 74vh, 0) rotate(360deg);
  }
  84% {
    transform: translate3d(62px, 98vh, 0) rotate(450deg);
  }
  100% {
    transform: translate3d(-22px, 126vh, 0) rotate(540deg);
  }
}

@keyframes daofu-flutter {
  0% {
    transform: translate3d(0, 0, 0) rotate(8deg);
  }
  16% {
    transform: translate3d(48px, 18vh, 0) rotate(-22deg);
  }
  32% {
    transform: translate3d(-36px, 38vh, 0) rotate(28deg);
  }
  50% {
    transform: translate3d(78px, 60vh, 0) rotate(108deg);
  }
  68% {
    transform: translate3d(-52px, 82vh, 0) rotate(172deg);
  }
  86% {
    transform: translate3d(28px, 104vh, 0) rotate(236deg);
  }
  100% {
    transform: translate3d(-16px, 124vh, 0) rotate(290deg);
  }
}
</style>
