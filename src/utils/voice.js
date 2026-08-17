import { app } from '../stores/app'

let unlocked = false
let speakingText = ''
let currentAudio = null
let resumeTimer = 0
let pendingTimer = 0
let fallbackTimer = 0

const SILENT_WAV =
  'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA'

function synth() {
  return window.speechSynthesis || null
}

function pickVoice(lang) {
  const voices = synth()?.getVoices?.() || []
  if (!voices.length) return null
  if (lang === 'yue') {
    return (
      voices.find((v) => /zh-HK|yue|cantonese/i.test(`${v.lang} ${v.name}`)) ||
      voices.find((v) => /zh/i.test(v.lang))
    )
  }
  return (
    voices.find((v) => /zh-CN|cmn-Hans|Chinese\s*\(China\)| Ting|Xiaoxiao|Yaoyao/i.test(`${v.lang} ${v.name}`)) ||
    voices.find((v) => /zh-CN|zh_CN/i.test(v.lang)) ||
    voices.find((v) => /zh/i.test(v.lang))
  )
}

function volume() {
  return Math.min(1, Math.max(0.2, Number(app.volume) || 0.9))
}

function clearTimers() {
  window.clearTimeout(pendingTimer)
  window.clearTimeout(fallbackTimer)
  window.clearInterval(resumeTimer)
  pendingTimer = 0
  fallbackTimer = 0
  resumeTimer = 0
}

function stopAudio() {
  if (!currentAudio) return
  currentAudio.onended = null
  currentAudio.onerror = null
  currentAudio.pause()
  currentAudio.removeAttribute('src')
  currentAudio.load()
  currentAudio = null
}

export function unlockVoice() {
  if (unlocked) return
  try {
    const s = synth()
    if (s) {
      const warm = new SpeechSynthesisUtterance('。')
      warm.volume = 0.01
      warm.rate = 2
      warm.lang = 'zh-CN'
      s.speak(warm)
    }
    const a = new Audio(SILENT_WAV)
    a.volume = 0.01
    a.play().catch(() => {})
    unlocked = true
  } catch {
    unlocked = true
  }
}

export function stopVoice() {
  speakingText = ''
  clearTimers()
  stopAudio()
  const s = synth()
  if (s) {
    try {
      s.cancel()
      s.resume()
    } catch {
      /* ignore */
    }
  }
}

export function isSpeaking(text) {
  const s = synth()
  const audioOn = !!(currentAudio && !currentAudio.paused)
  const synthOn = !!(s && (s.speaking || s.pending))
  const waiting = !!pendingTimer
  const active = audioOn || synthOn || waiting
  if (text) return speakingText === text && active
  return active
}

function finishIfCurrent(text, onEnd) {
  if (speakingText === text) speakingText = ''
  clearTimers()
  onEnd?.()
}

function playAudioTts(text, onEnd) {
  stopAudio()
  const clip = text.slice(0, 180)
  const sources = [
    `https://dict.youdao.com/dictvoice?le=zh&audio=${encodeURIComponent(clip)}`,
    `https://fanyi.baidu.com/gettts?lan=zh&text=${encodeURIComponent(clip)}&spd=5&source=web`,
  ]
  let index = 0

  const tryNext = () => {
    if (speakingText !== text) return
    if (index >= sources.length) {
      finishIfCurrent(text, onEnd)
      return
    }
    const audio = new Audio(sources[index])
    index += 1
    audio.volume = volume()
    currentAudio = audio
    audio.onended = () => {
      if (currentAudio === audio) currentAudio = null
      finishIfCurrent(text, onEnd)
    }
    audio.onerror = () => {
      if (currentAudio === audio) currentAudio = null
      tryNext()
    }
    audio.play().catch(tryNext)
  }

  tryNext()
}

function startResumeWatch(s) {
  window.clearInterval(resumeTimer)
  resumeTimer = window.setInterval(() => {
    if (!s.speaking) {
      window.clearInterval(resumeTimer)
      resumeTimer = 0
      return
    }
    if (s.paused) s.resume()
  }, 220)
}

export function speak(text, { force = false, onEnd } = {}) {
  if (!text) return false
  if (!force && !app.voiceEnabled) return false

  unlockVoice()
  stopVoice()
  speakingText = text

  const s = synth()
  if (!s) {
    playAudioTts(text, onEnd)
    return true
  }

  pendingTimer = window.setTimeout(() => {
    pendingTimer = 0
    if (speakingText !== text) return

    const u = new SpeechSynthesisUtterance(text)
    u.lang = app.language === 'yue' ? 'zh-HK' : 'zh-CN'
    u.volume = volume()
    u.rate = app.fontSize === 'xlarge' ? 0.85 : 0.92
    const voice = pickVoice(app.language)
    if (voice) u.voice = voice

    u.onend = () => finishIfCurrent(text, onEnd)
    u.onerror = () => {
      if (speakingText !== text) return
      playAudioTts(text, onEnd)
    }

    try {
      s.resume()
      s.speak(u)
      startResumeWatch(s)
      fallbackTimer = window.setTimeout(() => {
        fallbackTimer = 0
        if (speakingText === text && !s.speaking && !currentAudio) {
          playAudioTts(text, onEnd)
        }
      }, 600)
    } catch {
      playAudioTts(text, onEnd)
    }
  }, 80)

  return true
}

if (typeof window !== 'undefined' && window.speechSynthesis) {
  window.speechSynthesis.addEventListener?.('voiceschanged', () => {
    synth()?.getVoices?.()
  })
}
