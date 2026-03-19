import { usePlayerStore, SKILLS } from '../../store/usePlayerStore'
import { useGameStore } from '../../store/useGameStore'
import { useLanguageStore } from '../../store/useLanguageStore'
import { useState } from 'react'

const SOUL_COLOR = '#e8d0a0'
const GOLD       = '#ffcc66'
const PANEL_BG   = 'linear-gradient(180deg, rgba(20,16,24,0.97) 0%, rgba(12,10,18,0.99) 100%)'
const BORDER     = '1px solid rgba(232,208,160,0.25)'
const DIVIDER    = '1px solid rgba(255,255,255,0.07)'

const UPGRADE_COST = 200

function UpgradeBtn({ label, sub, cost, souls, onClick }) {
  const canAfford = souls >= cost
  return (
    <button onClick={onClick} disabled={!canAfford} style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      width: '100%', padding: '12px 18px', marginBottom: 8,
      background: 'rgba(255,255,255,0.02)',
      border: `1px solid ${canAfford ? 'rgba(232,208,160,0.55)' : 'rgba(255,255,255,0.07)'}`,
      color: canAfford ? SOUL_COLOR : '#444', fontSize: 13,
      fontFamily: 'Georgia,serif', letterSpacing: '0.1em',
      cursor: canAfford ? 'pointer' : 'not-allowed', borderRadius: 4,
      transition: 'border-color 0.2s',
    }}>
      <div style={{ textAlign: 'left' }}>
        <div style={{ textTransform: 'uppercase', fontSize: 12 }}>{label}</div>
        {sub && <div style={{ color: '#555', fontSize: 10, marginTop: 2 }}>{sub}</div>}
      </div>
      <span style={{ color: GOLD, fontFamily: 'Georgia,serif', fontSize: 12 }}>
        💀 {cost}
      </span>
    </button>
  )
}

export function LevelUpMenu() {
  const { health, maxHealth, stamina, maxStamina, damage, mana, maxMana,
          estusFlasks, maxEstusFlasks, skillLevels,
          upgradeHP, upgradeStamina, upgradeDamage, upgradeMana,
          upgradeEstus, upgradeSkill } = usePlayerStore()
  const { souls, spendSouls, setResting } = useGameStore()
  const t = useLanguageStore(s => s.t)
  const [tab, setTab] = useState('stats')

  const estusCost = 500
  const buy = (cost, fn) => { if (spendSouls(cost)) fn() }

  const tabBtn = (id, label) => (
    <button onClick={() => setTab(id)} style={{
      flex: 1, padding: '10px 0',
      background: tab === id ? 'rgba(232,208,160,0.08)' : 'transparent',
      border: 'none', borderBottom: `2px solid ${tab === id ? SOUL_COLOR : 'transparent'}`,
      color: tab === id ? SOUL_COLOR : '#555',
      fontFamily: 'Georgia,serif', fontSize: 12, letterSpacing: '0.15em',
      cursor: 'pointer', textTransform: 'uppercase', transition: 'all 0.2s',
    }}>{label}</button>
  )

  const skillDescriptions = [
    t('soulSlash_desc'),
    t('flameBurst_desc'),
    t('voidStorm_desc'),
  ]

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 300,
      background: 'rgba(0,0,0,0.90)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      pointerEvents: 'auto', backdropFilter: 'blur(10px)',
    }}>
      <div style={{
        width: 500, background: PANEL_BG, border: BORDER, borderRadius: 8,
        padding: '36px 40px', boxShadow: '0 24px 60px rgba(0,0,0,0.95)',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 22 }}>
          <h2 style={{ margin: 0, color: SOUL_COLOR, fontSize: 22, fontFamily: 'Georgia,serif', letterSpacing: '0.25em' }}>
            {t('restAtBonfire')}
          </h2>
          <div style={{ color: '#444', fontSize: 11, letterSpacing: '0.15em', marginTop: 5 }}>ASHEN THRONE</div>
        </div>

        {/* Stats snapshot */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18, fontSize: 12, color: '#7a6858', borderBottom: DIVIDER, paddingBottom: 14 }}>
          <span>{t('hp')} <b style={{ color: '#ff7777' }}>{maxHealth}</b></span>
          <span>{t('sp')} <b style={{ color: '#55ee55' }}>{maxStamina}</b></span>
          <span>{t('mp')} <b style={{ color: '#88aaff' }}>{maxMana}</b></span>
          <span>ATK <b style={{ color: '#ffaa44' }}>{damage}</b></span>
          <span>🧪 <b style={{ color: SOUL_COLOR }}>{maxEstusFlasks}</b></span>
          <span style={{ color: GOLD }}>💀 {souls.toLocaleString()}</span>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: DIVIDER, marginBottom: 18 }}>
          {tabBtn('stats', t('stats'))}
          {tabBtn('skills', t('skills'))}
        </div>

        {tab === 'stats' && (
          <div>
            <UpgradeBtn label={t('upgradeVigor')}      cost={UPGRADE_COST} souls={souls} onClick={() => buy(UPGRADE_COST, upgradeHP)} />
            <UpgradeBtn label={t('upgradeEndurance')}  cost={UPGRADE_COST} souls={souls} onClick={() => buy(UPGRADE_COST, upgradeStamina)} />
            <UpgradeBtn label={t('upgradeStrength')}   cost={UPGRADE_COST} souls={souls} onClick={() => buy(UPGRADE_COST, upgradeDamage)} />
            <UpgradeBtn label={t('upgradeAttunement')} cost={UPGRADE_COST} souls={souls} onClick={() => buy(UPGRADE_COST, upgradeMana)} />
            <div style={{ borderTop: DIVIDER, paddingTop: 12, marginTop: 4 }}>
              <UpgradeBtn label={t('buyEstus')} sub={`${t('currentMax')}: ${maxEstusFlasks}`} cost={estusCost} souls={souls} onClick={() => buy(estusCost, upgradeEstus)} />
            </div>
          </div>
        )}

        {tab === 'skills' && (
          <div>
            {SKILLS.map((skill, i) => {
              const lv   = skillLevels[i]
              const cost = skill.upgradeCost * lv
              const dmgNext = Math.floor(skill.damage * (1 + lv * 0.4))
              const cdNext  = Math.max(1, skill.cooldown - lv * 2)
              return (
                <div key={skill.id} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <span style={{ fontSize: 22 }}>{skill.icon}</span>
                    <div>
                      <div style={{ color: skill.color, fontSize: 13, letterSpacing: '0.12em' }}>{skill.name}</div>
                      <div style={{ color: '#555', fontSize: 10 }}>{t('tier')} {lv} · {t('next')}: {dmgNext} DMG · {cdNext}s CD</div>
                    </div>
                  </div>
                  <UpgradeBtn
                    label={`${t('upgrade')} ${skill.name} (${t('tier')} ${lv} → ${lv + 1})`}
                    sub={t('skillUpgrade_sub')}
                    cost={cost} souls={souls}
                    onClick={() => { if (spendSouls(cost)) upgradeSkill(i) }}
                  />
                </div>
              )
            })}
          </div>
        )}

        <button onClick={() => setResting(false)} style={{
          marginTop: 24, width: '100%', padding: '12px',
          background: 'transparent', color: '#442222', border: 'none',
          cursor: 'pointer', fontFamily: 'Georgia,serif', fontSize: 11,
          letterSpacing: '0.2em', textTransform: 'uppercase',
        }}>
          {t('leaveBonfire')}
        </button>
      </div>
    </div>
  )
}
