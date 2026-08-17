import { app } from '../stores/app'

let unlocked = false
let speakingText = ''

function pickVoice(lang) {
  const voices = window.speechSynthesis?.getVoices?.() || []
  if (lang === 'yue') {
    return (
      voices.find((v) => /zh-HK|yue|cantonese/i.test(`${v.lang} ${v.name}`)) ||
      voices.find((v) => /zh/i.test(v.lang))
    )
  }
  return (
    voices.find((v) => /zh-CN|zh_CN/i.test(v.lang)) ||
    voices.find((v) => /zh/i.test(v.lang))
  )
}

export function unlockVoice() {
  if (unlocked || !window.speechSynthesis) return
  try {
    const u = new SpeechSynthesisUtterance(' ')
    u.volume = 0
    window.speechSynthesis.speak(u)
    window.speechSynthesis.cancel()
    unlocked = true
  } catch {
    /* ignore */
  }
}

export function stopVoice() {
  speakingText = ''
  window.speechSynthesis?.cancel()
}

export function isSpeaking(text) {
  if (!window.speechSynthesis) return false
  if (text) return speakingText === text && window.speechSynthesis.speaking
  return window.speechSynthesis.speaking
}

export function speak(text, { force = false } = {}) {
  if (!text) return false
  if (!force && !app.voiceEnabled) return false
  if (!window.speechSynthesis) return false
  unlockVoice()
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = app.language === 'yue' ? 'zh-HK' : 'zh-CN'
  u.volume = Math.min(1, Math.max(0.2, Number(app.volume) || 0.9))
  u.rate = app.fontSize === 'xlarge' ? 0.88 : 0.95
  const voice = pickVoice(app.language)
  if (voice) u.voice = voice
  speakingText = text
  u.onend = () => {
    if (speakingText === text) speakingText = ''
  }
  window.speechSynthesis.speak(u)
  return true
}

if (typeof window !== 'undefined' && window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => {}
}
