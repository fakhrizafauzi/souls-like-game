import React from 'react'
import { useLanguageStore } from '../../store/useLanguageStore'

export function KeyBadge({ k }) {
  const t = useLanguageStore(s => s.t)
  // Translate mouse keys if they are strings
  const localizedKey = k === 'Move Mouse' ? t('ctrl_mouse') : k === 'Scroll Wheel' ? t('ctrl_scroll') : k
  return (
    <span style={{
      display: 'inline-block',
      padding: '3px 9px',
      background: 'rgba(255,255,255,0.08)',
      border: '1px solid rgba(255,255,255,0.2)',
      borderRadius: 4,
      fontSize: 12,
      fontFamily: 'monospace',
      color: '#e8d8b0',
      marginRight: 5,
      marginBottom: 3,
      letterSpacing: '0.05em',
    }}>
      {localizedKey}
    </span>
  )
}

export function ControlsModal({ onClose }) {
  const t = useLanguageStore(s => s.t)

  const CONTROLS = [
    { icon: '🖱️', keys: ['Move Mouse'],   action: t('ctrl_camera') },
    { icon: '🖱️', keys: ['Scroll Wheel'], action: t('ctrl_zoom') },
    { icon: '⌨️', keys: ['W', 'A', 'S', 'D'], action: t('ctrl_move') },
    { icon: '⌨️', keys: ['Shift'],         action: t('ctrl_sprint') },
    { icon: '⌨️', keys: ['Space'],         action: t('ctrl_dodge') },
    { icon: '🖱️', keys: ['Left Click'],    action: t('ctrl_light') },
    { icon: '🖱️', keys: ['Right Click'],   action: t('ctrl_heavy') },
    { icon: '⌨️', keys: ['F'],             action: t('ctrl_parry') },
    { icon: '⌨️', keys: ['C'],             action: t('ctrl_crouch') },
    { icon: '⌨️', keys: ['Q'],             action: t('ctrl_estus') },
    { icon: '⌨️', keys: ['E'],             action: t('ctrl_interact') },
    { icon: '⌨️', keys: ['ESC'],           action: t('ctrl_pause') },
  ]

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 999,
        background: 'rgba(0,0,0,0.82)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'fadeInModal 0.2s ease',
        pointerEvents: 'auto',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: 'linear-gradient(160deg, #12101c 0%, #1a1428 100%)',
        border: '1px solid rgba(232,208,160,0.35)',
        borderRadius: 10,
        padding: '32px 40px',
        maxWidth: 540, width: '90vw',
        maxHeight: '85vh',
        overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 40px rgba(180,100,20,0.1)',
        animation: 'slideUp 0.25s ease',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ margin: 0, color: '#e8d0a0', fontSize: 18, letterSpacing: '0.2em', fontWeight: 'normal', fontFamily: 'Georgia, serif' }}>
            {t('controls')}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent', border: '1px solid #444',
              color: '#777', width: 28, height: 28, borderRadius: 4,
              cursor: 'pointer', fontSize: 16, lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        {/* Controls grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {CONTROLS.map((c, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 12px',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: 5,
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2, flex: 1 }}>
                <span style={{ marginRight: 10, fontSize: 15 }}>{c.icon}</span>
                {c.keys.map((k, j) => <KeyBadge key={j} k={k} />)}
              </div>
              <div style={{ color: '#9090a8', fontSize: 12, textAlign: 'right', minWidth: 150, fontFamily: 'Georgia, serif' }}>
                {c.action}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ marginTop: 28, textAlign: 'center' }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 48px', background: 'transparent',
              border: '1px solid rgba(232,208,160,0.4)',
              color: '#e8d0a0', fontSize: 13,
              cursor: 'pointer', borderRadius: 4, letterSpacing: '0.15em',
              fontFamily: 'Georgia, serif', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(232,208,160,0.1)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
          >
            {t('close')}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeInModal { from{opacity:0} to{opacity:1} }
        @keyframes slideUp    { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }
      `}</style>
    </div>
  )
}
