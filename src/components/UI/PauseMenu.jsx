import { useState } from 'react'
import { useGameStore } from '../../store/useGameStore'
import { useLanguageStore } from '../../store/useLanguageStore'
import { ControlsModal } from './ControlsModal'

export function PauseMenu() {
  const isPaused = useGameStore(s => s.isPaused)
  const setPaused= useGameStore(s => s.setPaused)
  const t         = useLanguageStore(s => s.t)
  const [showControls, setShowControls] = useState(false)

  if (!isPaused) return null

  const resume = () => {
    setPaused(false)
    setTimeout(() => {
      const canvas = document.querySelector('canvas')
      if (canvas) canvas.requestPointerLock()
    }, 50)
  }

  const quit = () => { window.location.reload() }

  const btnStyle = (hov) => ({
    display: 'block', width: '100%', padding: '13px 0', marginBottom: 10,
    background: 'transparent',
    border: `1px solid ${hov ? 'rgba(232,208,160,0.7)' : 'rgba(255,255,255,0.12)'}`,
    color: hov ? '#ffdd88' : '#aaa8c0',
    fontSize: 14, fontFamily: 'Georgia, serif',
    letterSpacing: '0.2em', cursor: 'pointer',
    transition: 'all 0.18s', textTransform: 'uppercase', borderRadius: 3,
  })

  return (
    <>
      <div style={{
        position: 'absolute', inset: 0, zIndex: 300,
        background: 'rgba(0,0,0,0.75)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        pointerEvents: 'auto',
        backdropFilter: 'blur(6px)',
        animation: 'pauseFadeIn 0.2s ease',
      }}>
        <div style={{
          width: 320,
          background: 'linear-gradient(160deg, #12101e 0%, #1c1828 100%)',
          border: '1px solid rgba(232,208,160,0.25)',
          borderRadius: 10,
          padding: '40px 36px',
          boxShadow: '0 24px 60px rgba(0,0,0,0.9)',
          animation: 'pauseSlideUp 0.25s ease',
        }}>
          {/* Title */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ color: '#e8d0a0', fontSize: 22, fontFamily: 'Georgia, serif', letterSpacing: '0.25em', marginBottom: 6 }}>
              — {t('paused')} —
            </div>
            <div style={{ color: '#4a4060', fontSize: 11, letterSpacing: '0.15em' }}>ASHEN THRONE</div>
          </div>

          {/* Buttons */}
          <button
            style={btnStyle(false)} onClick={resume}
            onMouseEnter={e => Object.assign(e.currentTarget.style, btnStyle(true))}
            onMouseLeave={e => Object.assign(e.currentTarget.style, btnStyle(false))}
          >
            ▶ {t('resume')}
          </button>

          <button
            style={btnStyle(false)}
            onClick={() => setShowControls(true)}
            onMouseEnter={e => Object.assign(e.currentTarget.style, btnStyle(true))}
            onMouseLeave={e => Object.assign(e.currentTarget.style, btnStyle(false))}
          >
            ⌨ {t('controls')}
          </button>

          <button
            style={{ ...btnStyle(false), color: '#aa4444', borderColor: 'rgba(180,60,60,0.3)', marginTop: 10 }}
            onClick={quit}
            onMouseEnter={e => Object.assign(e.currentTarget.style, { ...btnStyle(true), color: '#ff6666', borderColor: '#aa4444' })}
            onMouseLeave={e => Object.assign(e.currentTarget.style, { ...btnStyle(false), color: '#aa4444', borderColor: 'rgba(180,60,60,0.3)' })}
          >
            ✕ {t('quit')}
          </button>

          <div style={{ marginTop: 22, textAlign: 'center', color: '#3a3555', fontSize: 11, letterSpacing: '0.1em' }}>
            {t('resume')} / ESC
          </div>
        </div>

        <style>{`
          @keyframes pauseFadeIn  { from{opacity:0}               to{opacity:1} }
          @keyframes pauseSlideUp { from{transform:translateY(16px);opacity:0} to{transform:translateY(0);opacity:1} }
        `}</style>
      </div>
      {showControls && <ControlsModal onClose={() => setShowControls(false)} />}
    </>
  )
}
