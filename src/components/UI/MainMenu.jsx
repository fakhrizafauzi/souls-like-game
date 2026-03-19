import { useState, useEffect } from 'react'
import { ControlsModal } from './ControlsModal'
import { useLanguageStore } from '../../store/useLanguageStore'

function AshParticles() {
  const [particles, setParticles] = useState([])
  useEffect(() => {
    const arr = Array.from({ length: 40 }).map(() => ({
      size: Math.random() * 3 + 1,
      left: Math.random() * 100,
      duration: Math.random() * 14 + 8,
      delay: Math.random() * -15,
      drift: Math.random() * 60 - 30
    }))
    setParticles(arr)
  }, [])

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', mixBlendMode: 'screen' }}>
      {particles.map((p, i) => (
        <div key={i} style={{
          position: 'absolute', width: p.size, height: p.size,
          background: '#ffaa44', borderRadius: '50%',
          left: `${p.left}%`, bottom: -10,
          animation: `ashFloat ${p.duration}s linear ${p.delay}s infinite`,
          boxShadow: '0 0 10px 2px rgba(255,100,20,0.8)'
        }} />
      ))}
      <style>{`
        @keyframes ashFloat {
          0%   { transform: translateY(0)      scale(1);   opacity: 0; }
          10%  { opacity: 0.7; }
          80%  { opacity: 0.3; }
          100% { transform: translateY(-110vh) scale(0);   opacity: 0; }
        }
      `}</style>
    </div>
  )
}

function LorePanel({ onComplete }) {
  const t = useLanguageStore(s => s.t)
  const [slide, setSlide] = useState(0)
  const [visible, setVisible] = useState(false)

  const slides = [
    { title: t('lore1_title'), text: t('lore1_text') },
    { title: t('lore2_title'), text: t('lore2_text') },
    { title: t('lore3_title'), text: t('lore3_text') },
  ]

  useEffect(() => { setTimeout(() => setVisible(true), 80) }, [])

  const next = () => {
    if (slide + 1 >= slides.length) {
      onComplete()
    } else {
      setSlide(s => s + 1)
    }
  }

  const s = slides[slide]

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.96)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      opacity: visible ? 1 : 0, transition: 'opacity 0.8s',
      padding: '60px 20px',
    }}>
      <div style={{ width: 200, height: 1, background: 'linear-gradient(90deg,transparent,#b8860b,transparent)', marginBottom: 28 }} />
      <h2 style={{
        fontFamily: 'Georgia, serif', color: '#e8d0a0',
        fontSize: 22, letterSpacing: '0.3em', textTransform: 'uppercase',
        marginBottom: 28, textAlign: 'center',
        textShadow: '0 0 30px rgba(200,140,20,0.4)',
      }}>{s.title}</h2>
      <p style={{
        color: '#9a8878', fontSize: 17, lineHeight: 1.9,
        textAlign: 'center', maxWidth: 560, fontFamily: 'Georgia, serif',
        fontStyle: 'italic', marginBottom: 48,
      }}>"{s.text}"</p>
      <div style={{ display: 'flex', gap: 8, marginBottom: 40 }}>
        {slides.map((_, i) => (
          <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: i === slide ? '#b8860b' : '#333', transition: 'background 0.3s' }} />
        ))}
      </div>
      <button onClick={next} style={{
        padding: '12px 48px', background: 'transparent',
        border: '1px solid rgba(232,208,160,0.4)', color: '#e8d0a0',
        fontFamily: 'Georgia, serif', fontSize: 13, letterSpacing: '0.2em',
        cursor: 'pointer', textTransform: 'uppercase', transition: 'all 0.3s',
      }}
        onMouseEnter={e => { e.target.style.borderColor = '#e8d0a0'; e.target.style.color = '#fff' }}
        onMouseLeave={e => { e.target.style.borderColor = 'rgba(232,208,160,0.4)'; e.target.style.color = '#e8d0a0' }}
      >
        {slide + 1 < slides.length ? t('lore_continue') : t('back')}
      </button>
      <div style={{ width: 200, height: 1, background: 'linear-gradient(90deg,transparent,#b8860b,transparent)', marginTop: 28 }} />
    </div>
  )
}

export function MainMenu({ onPlay }) {
  const { language, setLanguage, t } = useLanguageStore()
  const [hovered, setHovered] = useState(null)
  const [showControls, setShowControls] = useState(false)
  const [showLore, setShowLore] = useState(false)
  const [bgLoaded, setBgLoaded] = useState(false)

  useEffect(() => { setBgLoaded(true) }, [])

  const menuBtn = (label, onClick, key) => (
    <button
      key={key}
      onClick={onClick}
      onMouseEnter={() => setHovered(key)}
      onMouseLeave={() => setHovered(null)}
      style={{
        display: 'block', width: '100%',
        padding: '16px 0', marginBottom: 6,
        background: 'transparent', border: 'none',
        borderBottom: hovered === key ? '1px solid #ffcc66' : '1px solid transparent',
        color: hovered === key ? '#ffcc66' : '#888',
        fontSize: 16, fontFamily: 'Georgia, serif',
        letterSpacing: '0.24em', cursor: 'pointer',
        transition: 'all 0.4s ease-out', textTransform: 'uppercase',
        opacity: bgLoaded ? 1 : 0,
        transform: bgLoaded ? 'translateY(0)' : 'translateY(20px)',
        transitionDelay: `${({ play: 1.0, lore: 1.1, controls: 1.2 }[key])}s`
      }}
    >
      <span style={{
        display: 'inline-block',
        transform: hovered === key ? 'translateX(10px)' : 'translateX(0)',
        transition: 'transform 0.4s ease-out'
      }}>
        {label}
      </span>
    </button>
  )

  return (
    <div style={{
      position: 'absolute', inset: 0,
      backgroundColor: '#050505',
      background: 'radial-gradient(ellipse at 50% 50%, #1a151b 0%, #000000 70%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Georgia, serif', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', boxShadow: 'inset 0 0 150px rgba(0,0,0,1)' }} />
      <AshParticles />

      <div style={{
        zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center',
        opacity: bgLoaded ? 1 : 0, transition: 'opacity 3s cubic-bezier(0.2, 0.8, 0.2, 1)'
      }}>
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{
            margin: '0', fontSize: '5rem', fontWeight: 'normal', lineHeight: 1.1,
            background: 'linear-gradient(180deg, #ffeedd 0%, #d4a840 45%, #5a3010 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            letterSpacing: '0.12em',
            filter: 'drop-shadow(0 4px 24px rgba(255, 100, 20, 0.2))',
            transform: bgLoaded ? 'translateY(0)' : 'translateY(-20px)',
            transition: 'transform 3s cubic-bezier(0.2, 0.8, 0.2, 1)',
            padding: '20px 0'
          }}>
            ASHEN<br/>THRONE
          </h1>
          <div style={{
            color: '#555', fontSize: 12, letterSpacing: '0.6em', marginTop: 10,
            textTransform: 'uppercase', opacity: bgLoaded ? 1 : 0,
            transition: 'opacity 2s ease-in 1s'
          }}>
            {t('prepareToDie')}
          </div>
        </div>

        {/* Menu Buttons */}
        <div style={{ width: 260, textAlign: 'center' }}>
          {menuBtn(t('newGame'), onPlay, 'play')}
          {menuBtn(t('theLore'), () => setShowLore(true), 'lore')}
          {menuBtn(t('controls'), () => setShowControls(true), 'controls')}
        </div>

        {/* Language Selection */}
        <div style={{ 
          marginTop: 40, display: 'flex', gap: 20, alignItems: 'center',
          opacity: bgLoaded ? 1 : 0, transition: 'opacity 2s ease-in 1.5s' 
        }}>
          <span style={{ color: '#444', fontSize: 10, letterSpacing: '0.2em' }}>{t('language')}</span>
          <div style={{ display: 'flex', gap: 12 }}>
            {['en', 'id'].map(l => (
              <button 
                key={l}
                onClick={() => setLanguage(l)}
                style={{
                  background: 'transparent', border: 'none',
                  color: language === l ? '#ffcc66' : '#444',
                  fontSize: 12, fontFamily: 'Georgia, serif',
                  letterSpacing: '0.1em', cursor: 'pointer',
                  textTransform: 'uppercase', fontWeight: language === l ? 'bold' : 'normal',
                  transition: 'color 0.3s'
                }}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <div style={{
          position: 'absolute', bottom: 30,
          color: '#333', fontSize: 10, letterSpacing: '0.3em',
          opacity: bgLoaded ? 1 : 0, transition: 'opacity 3s ease-in 1.5s'
        }}>
          v1.0 Ashen Throne by Ryza and Antigravity
        </div>
      </div>

      {showLore && <LorePanel onComplete={() => setShowLore(false)} />}
      {showControls && <ControlsModal onClose={() => setShowControls(false)} />}
    </div>
  )
}
