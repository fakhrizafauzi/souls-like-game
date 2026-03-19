import { useState, useEffect } from 'react'
import { usePlayerStore, SKILLS } from '../../store/usePlayerStore'
import { useLanguageStore } from '../../store/useLanguageStore'

function SkillIcon({ skill, index, cooldown, mana }) {
  const [hovered, setHovered] = useState(false)
  const t = useLanguageStore(s => s.t)
  const ready = cooldown <= 0 && mana >= skill.manaCost
  const progress = cooldown / skill.cooldown // 0=ready, 1=just used

  const descriptions = [
    t('soulSlash_desc'),
    t('flameBurst_desc'),
    t('voidStorm_desc'),
  ]

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ position: 'relative', userSelect: 'none' }}
    >
      {/* Tooltip */}
      {hovered && (
        <div style={{
          position: 'absolute', bottom: '110%', left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(10,8,20,0.97)',
          border: `1px solid ${skill.color}`,
          padding: '10px 14px', borderRadius: 6,
          whiteSpace: 'nowrap', zIndex: 200,
          fontFamily: 'Georgia, serif',
          boxShadow: `0 4px 20px rgba(0,0,0,0.7), 0 0 12px ${skill.color}44`,
        }}>
          <div style={{ color: skill.color, fontSize: 14, letterSpacing: '0.15em', marginBottom: 4 }}>{skill.name}</div>
          <div style={{ color: '#aaa', fontSize: 11, marginBottom: 6, maxWidth: 180, lineHeight: 1.4 }}>{descriptions[index]}</div>
          <div style={{ display: 'flex', gap: 12, fontSize: 11 }}>
            <span style={{ color: '#4488ff' }}>💧 {skill.manaCost} MP</span>
            <span style={{ color: '#aaa' }}>⏱ {skill.cooldown}s CD</span>
            <span style={{ color: '#ff6644' }}>💥 {skill.damage} DMG</span>
          </div>
        </div>
      )}

      {/* Icon Box */}
      <div style={{
        width: 64, height: 64, position: 'relative',
        border: `2px solid ${ready ? skill.color : 'rgba(255,255,255,0.15)'}`,
        borderRadius: 8, overflow: 'hidden',
        background: `radial-gradient(ellipse at 50% 80%, ${skill.color}22 0%, rgba(10,8,18,0.9) 70%)`,
        boxShadow: ready ? `0 0 16px ${skill.glowColor}88, inset 0 0 10px ${skill.color}22` : 'none',
        transition: 'box-shadow 0.3s, border-color 0.3s',
        cursor: ready ? 'pointer' : 'default',
      }}>
        {cooldown > 0 && (
          <div style={{
            position: 'absolute', inset: 0,
            background: `rgba(0,0,0,0.70)`,
            clipPath: `inset(0 0 ${(1 - progress) * 100}% 0)`,
            zIndex: 2, transition: 'clip-path 0.1s',
          }} />
        )}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28, zIndex: 1,
          opacity: ready ? 1 : 0.45,
          transition: 'opacity 0.3s',
          filter: ready ? `drop-shadow(0 0 6px ${skill.color})` : 'none',
        }}>
          {skill.icon}
        </div>
        {cooldown > 0 && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 3,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 15, fontWeight: 'bold', fontFamily: 'monospace',
            textShadow: '0 1px 4px #000',
          }}>
            {Math.ceil(cooldown)}
          </div>
        )}
      </div>

      {/* Key label */}
      <div style={{
        textAlign: 'center', color: '#777', fontSize: 11,
        letterSpacing: '0.1em', marginTop: 4,
        fontFamily: 'Georgia, serif',
      }}>
        [{skill.key}]
      </div>
    </div>
  )
}

export function SkillBar() {
  const mana = usePlayerStore(s => s.mana)
  const maxMana = usePlayerStore(s => s.maxMana)
  const skillCooldowns = usePlayerStore(s => s.skillCooldowns)

  return (
    <div style={{
      position: 'absolute', bottom: 24, left: 24,
      display: 'flex', flexDirection: 'column', gap: 10,
      pointerEvents: 'auto', zIndex: 50,
    }}>
      {/* Mana Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ color: '#4488ff', fontSize: 10, letterSpacing: '0.1em', fontFamily: 'Georgia, serif', width: 20 }}>MP</span>
        <div style={{ width: 200, height: 6, background: 'rgba(0,0,0,0.6)', borderRadius: 4, border: '1px solid rgba(68,136,255,0.3)', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${(mana / maxMana) * 100}%`,
            background: 'linear-gradient(90deg, #1122aa, #4488ff)',
            boxShadow: '0 0 6px #4488ff88',
            transition: 'width 0.2s',
            borderRadius: 4,
          }} />
        </div>
        <span style={{ color: '#4488ff', fontSize: 10, fontFamily: 'monospace' }}>{Math.floor(mana)}</span>
      </div>

      {/* Skills */}
      <div style={{ display: 'flex', gap: 12 }}>
        {SKILLS.map((skill, i) => (
          <SkillIcon
            key={skill.id}
            skill={skill}
            index={i}
            cooldown={skillCooldowns[i]}
            mana={mana}
          />
        ))}
      </div>
    </div>
  )
}
