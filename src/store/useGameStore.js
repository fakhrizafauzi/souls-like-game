import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

export const expForLevel = (level) => level * 100

export const useGameStore = create(subscribeWithSelector((set, get) => ({
  souls: 0,
  isResting: false,
  bossDefeated: false,
  menuOpen: false,
  isDead: false,
  isPaused: false,
  projectiles: [],
  lastBonfirePos: [0, 3, 28],
  activeDialog: null,

  // ─── SOULS (currency only) ───────────────────────────────────────────────
  addSouls:  (n)  => set(s => ({ souls: s.souls + n })),
  spendSouls: (n) => {
    let ok = false
    set(s => { if (s.souls >= n) { ok = true; return { souls: s.souls - n } } return s })
    return ok
  },

  spawnProjectile: (p) => set(s => ({ projectiles: [...s.projectiles, { id: Math.random(), ...p }] })),
  removeProjectile: (id) => set(s => ({ projectiles: s.projectiles.filter(p => p.id !== id) })),
  setResting:     (v) => set({ isResting: v, menuOpen: v }),
  setLastBonfire: (pos) => set({ lastBonfirePos: pos }),
  setBossDefeated:(v) => set({ bossDefeated: v }),
  toggleMenu:     ()  => set(s => ({ menuOpen: !s.menuOpen })),
  setDead:        (v) => set({ isDead: v }),
  setActiveDialog:(d) => {
    set({ activeDialog: d })
    window.__npcTalking = !!d
  },
  respawn:        ()  => set({ isDead: false, isResting: false }),
  setPaused:      (v) => {
    set({ isPaused: v })
    window.__gamePaused = v
  },
})))
