import { useGameStore } from '../../store/useGameStore'
import { usePlayerStore } from '../../store/usePlayerStore'
import { useLanguageStore } from '../../store/useLanguageStore'

export function DeathScreen() {
  const isDead     = useGameStore(s => s.isDead)
  const respawn    = useGameStore(s => s.respawn)
  const resetStats = usePlayerStore(s => s.resetStats)
  const t          = useLanguageStore(s => s.t)

  if (!isDead) return null

  const handleRespawn = () => {
    resetStats()
    respawn()
  }

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'rgba(0,0,0,0.88)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      zIndex: 200, fontFamily: 'Georgia, serif',
      pointerEvents: 'auto',
      animation: 'fadeInDeath 1.2s ease',
    }}>
      <div style={{
        color: '#cc2222', fontSize: 72, fontWeight: 'bold',
        letterSpacing: '0.15em',
        textShadow: '0 0 40px #aa0000, 0 2px 4px #000',
        marginBottom: 10,
        animation: 'deathPulse 2s ease-in-out infinite',
      }}>
        {t('youDied')}
      </div>

      <div style={{ color: '#666', fontSize: 14, letterSpacing: '0.3em', marginBottom: 52 }}>
        {t('darknessClaims')}
      </div>

      <button
        onClick={handleRespawn}
        style={{
          padding: '14px 52px',
          background: 'transparent',
          color: '#e8d0a0',
          border: '1px solid rgba(232,208,160,0.4)',
          fontSize: 15,
          letterSpacing: '0.2em',
          cursor: 'pointer',
          fontFamily: 'Georgia, serif',
          textTransform: 'uppercase',
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(232,208,160,0.12)'
          e.currentTarget.style.borderColor = '#e8d0a0'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.borderColor = 'rgba(232,208,160,0.4)'
        }}
      >
        {t('tryAgain')}
      </button>

      <style>{`
        @keyframes fadeInDeath { from { opacity:0 } to { opacity:1 } }
        @keyframes deathPulse  {
          0%,100% { text-shadow:0 0 40px #aa0000, 0 2px 4px #000 }
          50%     { text-shadow:0 0 80px #ff0000, 0 0 120px #880000, 0 2px 4px #000 }
        }
      `}</style>
    </div>
  )
}
