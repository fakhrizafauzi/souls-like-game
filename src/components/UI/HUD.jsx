import { Minimap } from './Minimap'
import { useState, useEffect } from 'react'
import { usePlayerStore } from '../../store/usePlayerStore'
import { useGameStore } from '../../store/useGameStore'
import { useLanguageStore } from '../../store/useLanguageStore'

function Bar({ value, max, color, width = 240, height = 10 }) {
  return (
    <div style={{ width, height, background: 'rgba(0,0,0,0.5)', borderRadius: 2, border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
      <div style={{
        height: '100%', width: `${Math.max(0, (value / max) * 100)}%`,
        background: color, transition: 'width 0.15s', borderRadius: 2,
      }} />
    </div>
  )
}

function ComboDisplay({ count }) {
  if (count < 2) return null
  const colors = ['#88ccff', '#ffcc44', '#ff8822', '#ff2244']
  const c = colors[Math.min(count - 2, colors.length - 1)]
  return (
    <div style={{
      position: 'absolute', right: 22, top: '40%',
      textAlign: 'right', pointerEvents: 'none', animation: 'comboPop 0.15s ease',
    }}>
      <div style={{ color: c, fontSize: 46, fontFamily: 'Georgia,serif', fontWeight: 'bold', textShadow: `0 0 20px ${c}`, lineHeight: 1 }}>{count}</div>
      <div style={{ color: c, fontSize: 12, letterSpacing: '0.25em', opacity: 0.8 }}>COMBO</div>
    </div>
  )
}

export function HUD() {
  const { health, maxHealth, stamina, maxStamina, estusFlasks, comboCount } = usePlayerStore()
  const { souls } = useGameStore()
  const t = useLanguageStore(s => s.t)
  const [timeLabel, setTimeLabel] = useState('')
  const [damageAlpha, setDamageAlpha] = useState(0)
  const [healAlpha, setHealAlpha] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      const gTime = window.__gameTime || 0
      if      (gTime > 0.28 && gTime < 0.72) setTimeLabel(t('day'))
      else if (gTime < 0.24 || gTime > 0.76) setTimeLabel(t('night'))
      else                                   setTimeLabel(t('duskDawn'))
    }, 800)
    return () => clearInterval(id)
  }, [t])

  useEffect(() => {
    let raf
    const tick = () => {
      const now = performance.now()
      setDamageAlpha(Math.max(0, 1 - (now - (window.__damageFlashTime || 0)) / 900))
      setHealAlpha  (Math.max(0, 1 - (now - (window.__healFlashTime   || 0)) / 700))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  const isResting = useGameStore(s => s.isResting)
  if (isResting) return null

  return (
    <>
      <Minimap />

      {damageAlpha > 0.01 && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 50,
          background: `radial-gradient(ellipse at center, transparent 40%, rgba(180,0,0,${damageAlpha * 0.75}) 100%)` }} />
      )}
      {healAlpha > 0.01 && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 50,
          background: `radial-gradient(ellipse at center, rgba(0,200,80,${healAlpha * 0.18}) 20%, transparent 70%)` }} />
      )}

      <div style={{ position: 'absolute', top: 20, left: 20, pointerEvents: 'none' }}>
        <div style={{ color: '#c8b898', fontSize: 12, letterSpacing: '0.14em', marginBottom: 6 }}>
          {timeLabel}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
          <span style={{ color: '#ff6666', fontSize: 10, width: 20, fontWeight: 'bold' }}>{t('hp')}</span>
          <Bar value={health} max={maxHealth} color="linear-gradient(90deg,#8a1010,#e04040)" />
          <span style={{ color: '#ff6666', fontSize: 10 }}>{health}/{maxHealth}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <span style={{ color: '#55dd55', fontSize: 10, width: 20, fontWeight: 'bold' }}>{t('sp')}</span>
          <Bar value={stamina} max={maxStamina} color="linear-gradient(90deg,#186018,#40c840)" width={170} />
        </div>

        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <div style={{ color: '#ffbb44', fontSize: 15 }}>🧪 {estusFlasks}</div>
          <div style={{ color: '#e8e0d0', fontSize: 15, fontFamily: 'Georgia,serif' }}>💀 {souls.toLocaleString()}</div>
        </div>
      </div>

      <ComboDisplay count={comboCount} />
      <style>{`@keyframes comboPop { from{transform:scale(1.5);opacity:0} to{transform:scale(1);opacity:1} }`}</style>
    </>
  )
}
