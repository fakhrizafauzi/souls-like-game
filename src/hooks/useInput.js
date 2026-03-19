import { useState, useEffect } from 'react'

export function useInput() {
  const [input, setInput] = useState({
    forward: false, backward: false, left: false, right: false,
    run: false, attackLight: false, attackHeavy: false,
    dodge: false, crouch: false, parry: false,
  })

  useEffect(() => {
    // Tombol yang diblok saat NPC dialog aktif
    const MOVEMENT_KEYS = new Set(['KeyW', 'KeyS', 'KeyA', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ShiftLeft', 'Space'])

    const keyMap = {
      KeyW: 'forward',  ArrowUp: 'forward',
      KeyS: 'backward', ArrowDown: 'backward',
      KeyA: 'left',     ArrowLeft: 'left',
      KeyD: 'right',    ArrowRight: 'right',
      ShiftLeft: 'run',
      Space: 'dodge',
      KeyC: 'crouch',
      KeyF: 'parry',
    }

    const onKeyDown = (e) => {
      // Jika sedang dialog NPC, blok SEMUA gerakan & serangan
      if (window.__npcTalking && MOVEMENT_KEYS.has(e.code)) {
        e.stopPropagation()
        return
      }
      if (keyMap[e.code]) {
        e.preventDefault()
        setInput(m => ({ ...m, [keyMap[e.code]]: true }))
      }
    }
    const onKeyUp = (e) => {
      if (window.__npcTalking && MOVEMENT_KEYS.has(e.code)) return
      if (keyMap[e.code]) setInput(m => ({ ...m, [keyMap[e.code]]: false }))
    }
    const onMouseDown = (e) => {
      if (window.__npcTalking) return
      if (e.button === 0) setInput(m => ({ ...m, attackLight: true }))
      if (e.button === 2) setInput(m => ({ ...m, attackHeavy: true }))
    }
    const onMouseUp = (e) => {
      if (e.button === 0) setInput(m => ({ ...m, attackLight: false }))
      if (e.button === 2) setInput(m => ({ ...m, attackHeavy: false }))
    }
    const noCtx = (e) => e.preventDefault()

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup',   onKeyUp)
    window.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mouseup',   onMouseUp)
    window.addEventListener('contextmenu', noCtx)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup',   onKeyUp)
      window.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mouseup',   onMouseUp)
      window.removeEventListener('contextmenu', noCtx)
    }
  }, [])

  return input
}
