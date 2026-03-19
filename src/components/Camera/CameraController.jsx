import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../../store/useGameStore'

export function CameraController({ targetRef }) {
  const state = useRef({ yaw: Math.PI, pitch: 0.35, dist: 7 })

  useEffect(() => {
    const canvas = document.querySelector('canvas')
    if (!canvas) return

    const lockMouse = () => {
      const { isResting, isPaused } = useGameStore.getState()
      if (!isResting && !isPaused && !window.__npcTalking) canvas.requestPointerLock()
    }
    canvas.addEventListener('click', lockMouse)

    const onMove = (e) => {
      if (document.pointerLockElement !== canvas) return
      state.current.yaw   -= e.movementX * 0.003
      state.current.pitch  = Math.max(0.08, Math.min(1.1, state.current.pitch + e.movementY * 0.003))
    }
    const onWheel = (e) => {
      state.current.dist = Math.max(3, Math.min(18, state.current.dist + e.deltaY * 0.012))
    }

    // Pointer lock released → show pause menu (unless intentional release)
    const onLockChange = () => {
      const { isResting, isDead, isPaused } = useGameStore.getState()
      if (!document.pointerLockElement && !isResting && !isDead && !window.__npcTalking && !window.__intentionalUnlock) {
        useGameStore.getState().setPaused(true)
      }
      window.__intentionalUnlock = false
    }

    document.addEventListener('mousemove', onMove)
    canvas.addEventListener('wheel', onWheel)
    document.addEventListener('pointerlockchange', onLockChange)

    // Release pointer lock when isResting
    const unsub = useGameStore.subscribe(
      s => s.isResting,
      (resting) => { if (resting) { window.__intentionalUnlock = true; document.exitPointerLock() } }
    )
    // Release on pause
    const unsubP = useGameStore.subscribe(
      s => s.isPaused,
      (paused) => { if (paused) { window.__intentionalUnlock = true; document.exitPointerLock() } }
    )

    // Release on death
    const unsubD = useGameStore.subscribe(
      s => s.isDead,
      (dead) => { if (dead) { window.__intentionalUnlock = true; document.exitPointerLock() } }
    )

    return () => {
      canvas.removeEventListener('click', lockMouse)
      document.removeEventListener('mousemove', onMove)
      canvas.removeEventListener('wheel', onWheel)
      document.removeEventListener('pointerlockchange', onLockChange)
      unsub(); unsubP(); unsubD()
    }
  }, [])

  useFrame((s3f) => {
    if (!targetRef?.current) return
    const pos = targetRef.current.translation?.()
    if (!pos) return
    const { yaw, pitch, dist } = state.current
    const tx = pos.x + dist * Math.sin(yaw) * Math.cos(pitch)
    const ty = pos.y + dist * Math.sin(pitch)
    const tz = pos.z + dist * Math.cos(yaw) * Math.cos(pitch)
    s3f.camera.position.lerp(new THREE.Vector3(tx, ty, tz), 0.14)
    s3f.camera.lookAt(pos.x, pos.y + 1, pos.z)
    window.__cameraYaw = yaw
  })

  return null
}
