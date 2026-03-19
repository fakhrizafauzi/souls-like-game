import { create } from 'zustand'

export const SKILLS = [
  {
    id: 0, key: '1', name: 'SOUL SLASH',
    icon: '⚔️', color: '#4488ff', glowColor: '#2266dd',
    manaCost: 20, cooldown: 6, damage: 60,
    description: 'Wide arcanic slash — heavy damage in front.',
    upgradeCost: 200,
  },
  {
    id: 1, key: '2', name: 'FLAME BURST',
    icon: '🔥', color: '#ff6622', glowColor: '#cc3300',
    manaCost: 35, cooldown: 10, damage: 90,
    description: 'Explodes a ring of fire around you.',
    upgradeCost: 350,
  },
  {
    id: 2, key: '3', name: 'VOID STORM',
    icon: '💀', color: '#aa44ff', glowColor: '#8800cc',
    manaCost: 80, cooldown: 30, damage: 200,
    description: '(ULTIMATE) Void vortex obliterates nearby enemies.',
    upgradeCost: 800,
  },
]

export const usePlayerStore = create((set, get) => ({
  health: 100, maxHealth: 100,
  stamina: 100, maxStamina: 100,
  mana: 100, maxMana: 100,
  estusFlasks: 3, maxEstusFlasks: 3,
  damage: 25,
  skillLevels: [1, 1, 1],
  currentAttack: null,
  comboCount: 0,
  lastAttackTime: 0,
  skillCooldowns: [0, 0, 0],

  setCurrentAttack: (type) => {
    const now = performance.now()
    const last = get().lastAttackTime
    const newCombo = type && (now - last < 2500) ? get().comboCount + 1 : type ? 1 : get().comboCount
    set({ currentAttack: type, lastAttackTime: type ? now : last, comboCount: type ? newCombo : get().comboCount })
    if (type) {
      clearTimeout(get()._comboTimeout)
      const id = setTimeout(() => set({ comboCount: 0 }), 2500)
      set({ _comboTimeout: id })
    }
  },

  takeDamage: (amount) => {
    if (window.__playerDodging || window.__playerParrying) return
    window.__damageFlashTime = performance.now()
    set(s => ({ health: Math.max(0, s.health - amount) }))
  },
  heal: (n) => set(s => ({ health: Math.min(s.maxHealth, s.health + n) })),
  useEstus: () => set(s => {
    if (s.estusFlasks > 0 && s.health < s.maxHealth) {
      window.__healFlashTime = performance.now()
      return { estusFlasks: s.estusFlasks - 1, health: Math.min(s.maxHealth, s.health + 40) }
    }
    return s
  }),

  consumeStamina: (amount) => {
    let ok = false
    set(s => { if (s.stamina >= amount) { ok = true; return { stamina: s.stamina - amount } } return s })
    return ok
  },
  recoverStamina: (n) => set(s => ({ stamina: Math.min(s.maxStamina, s.stamina + n) })),

  tickCooldowns: (delta) => set(s => ({
    skillCooldowns: s.skillCooldowns.map(cd => Math.max(0, cd - delta)),
    mana: Math.min(s.maxMana, s.mana + delta * 3),
  })),

  useSkill: (skillIndex) => {
    const s = get()
    const skill = SKILLS[skillIndex]
    if (!skill) return false
    if (s.skillCooldowns[skillIndex] > 0) return false
    if (s.mana < skill.manaCost) return false
    const newCDs = [...s.skillCooldowns]
    newCDs[skillIndex] = Math.max(1, skill.cooldown - (s.skillLevels[skillIndex] - 1) * 2)
    set({ mana: s.mana - Math.max(10, skill.manaCost - (s.skillLevels[skillIndex] - 1) * 5), skillCooldowns: newCDs })
    return true
  },

  // Returns the effective damage for skill i including upgrades
  getSkillDamage: (skillIndex) => {
    const s = get()
    const skill = SKILLS[skillIndex]
    return Math.floor(skill.damage * (1 + (s.skillLevels[skillIndex] - 1) * 0.4))
  },

  upgradeSkill: (skillIndex) => set(s => {
    const newLevels = [...s.skillLevels]
    newLevels[skillIndex] = s.skillLevels[skillIndex] + 1
    return { skillLevels: newLevels }
  }),

  resetStats: () => set(s => ({
    health: s.maxHealth, stamina: s.maxStamina,
    mana: s.maxMana, estusFlasks: s.maxEstusFlasks, comboCount: 0,
  })),

  // Flat stat upgrades — no level concept
  upgradeHP:      () => set(s => ({ maxHealth:  s.maxHealth  + 15, health:  s.maxHealth  + 15 })),
  upgradeStamina: () => set(s => ({ maxStamina: s.maxStamina + 15, stamina: s.maxStamina + 15 })),
  upgradeDamage:  () => set(s => ({ damage: s.damage + 8 })),
  upgradeMana:    () => set(s => ({ maxMana: s.maxMana + 20, mana: s.maxMana + 20 })),
  upgradeEstus: () => set(s => ({ maxEstusFlasks: s.maxEstusFlasks + 1, estusFlasks: s.maxEstusFlasks + 1 })),
}))
