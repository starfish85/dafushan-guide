import { app } from '../stores/app'

const base = import.meta.env.BASE_URL || './'

let player = null
let unlocked = false
let speakingText = ''

function srcOf(clip) {
  return `${base}audio/${clip}.m4a`
}

function getPlayer() {
  if (player) return player
  player = new Audio()
  player.preload = 'auto'
  player.setAttribute('playsinline', 'true')
  player.setAttribute('webkit-playsinline', 'true')
  player.setAttribute('x5-playsinline', 'true')
  player.controls = false
  return player
}

export function clipForPoi(id) {
  return id ? `poi/${id}` : ''
}

export function clipForGuide(guide) {
  if (!guide) return 'nav-plan'
  if (guide.arrived) return 'nav-arrived'
  if (guide.text === '正在规划路线') return 'nav-plan'
  if (guide.text === '即将到达目的地') return 'nav-soon'
  if (guide.nextTurn === '左转') return 'nav-left'
  if (guide.nextTurn === '右转') return 'nav-right'
  if (guide.nextTurn === '掉头') return 'nav-uturn'
  return 'nav-forward'
}

export function unlockVoice() {
  const a = getPlayer()
  if (unlocked && a.src) return
  try {
    a.muted = true
    a.src = srcOf('silent')
    const play = a.play()
    if (play && play.then) {
      play
        .then(() => {
          a.pause()
          a.muted = false
          unlocked = true
        })
        .catch(() => {
          a.muted = false
        })
    } else {
      a.muted = false
      unlocked = true
    }
  } catch {
    a.muted = false
  }
}

export function stopVoice() {
  speakingText = ''
  const a = getPlayer()
  a.onended = null
  a.onerror = null
  try {
    a.pause()
    a.currentTime = 0
  } catch {
    /* ignore */
  }
}

export function isSpeaking(text) {
  const a = getPlayer()
  const on = !a.paused && !a.ended && a.currentTime > 0
  if (text) return speakingText === text && on
  return on
}

export function speak(text, { force = false, onEnd, clip } = {}) {
  if (!force && !app.voiceEnabled) return false
  const file = clip || 'test'
  const a = getPlayer()

  speakingText = text || file
  a.onended = null
  a.onerror = null
  try {
    a.pause()
  } catch {
    /* ignore */
  }

  a.muted = false
  a.volume = Math.min(1, Math.max(0.2, Number(app.volume) || 0.9))
  a.src = srcOf(file)

  const done = () => {
    if (speakingText === (text || file)) speakingText = ''
    onEnd?.()
  }
  a.onended = done
  a.onerror = done

  const play = a.play()
  if (play && play.catch) {
    play.catch(() => {
      unlockVoice()
      a.muted = false
      a.play().catch(done)
    })
  }
  unlocked = true
  return true
}

if (typeof document !== 'undefined') {
  const boot = () => unlockVoice()
  document.addEventListener('WeixinJSBridgeReady', boot, false)
  document.addEventListener('DOMContentLoaded', () => {
    if (window.WeixinJSBridge) boot()
  })
}
