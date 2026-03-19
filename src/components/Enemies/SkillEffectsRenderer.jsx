import { useRef, useEffect, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { usePlayerStore, SKILLS } from '../../store/usePlayerStore'
import { useGameStore } from '../../store/useGameStore'

// ---------- individual effect handlers ----------

function SoulSlashEffect({ pos, onDone }) {
  const ref = useRef()
  const t = useRef(0)
  useFrame((_, delta) => {
    t.current += delta
    if (ref.current) {
      ref.current.scale.setScalar(1 + t.current * 8)
      ref.current.material.opacity = Math.max(0, 1 - t.current * 2.5)
    }
    if (t.current > 0.5) onDone()
  })
  return (
    <mesh ref={ref} position={pos} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.5, 1.2, 32]} />
      <meshBasicMaterial color="#4488ff" transparent opacity={1} side={THREE.DoubleSide} />
    </mesh>
  )
}

function FlameBurstEffect({ pos, onDone }) {
  const ref = useRef()
  const t = useRef(0)
  useFrame((_, delta) => {
    t.current += delta
    if (ref.current) {
      ref.current.scale.setScalar(1 + t.current * 12)
      ref.current.material.opacity = Math.max(0, 1 - t.current * 1.8)
    }
    if (t.current > 0.7) onDone()
  })
  return (
    <group position={pos}>
      <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 1.0, 32]} />
        <meshBasicMaterial color="#ff6622" transparent opacity={1} side={THREE.DoubleSide} />
      </mesh>
      <pointLight color="#ff4400" intensity={8} distance={15} decay={2} />
    </group>
  )
}

function VoidStormEffect({ pos, onDone }) {
  const ref = useRef()
  const pillarsRef = useRef([])
  const t = useRef(0)
  useFrame((_, delta) => {
    t.current += delta
    if (ref.current) {
      ref.current.rotation.y += delta * 5
      ref.current.scale.setScalar(Math.min(1 + t.current * 3, 6))
      ref.current.material.opacity = t.current < 1.5 ? 0.8 : Math.max(0, (0.8 - (t.current - 1.5) * 1.2))
    }
    if (t.current > 2.5) onDone()
  })
  return (
    <group position={pos}>
      <mesh ref={ref}>
        <torusGeometry args={[1, 0.3, 12, 32]} />
        <meshBasicMaterial color="#aa44ff" transparent opacity={0.8} />
      </mesh>
      <pointLight color="#8800cc" intensity={12} distance={25} decay={2} />
      <pointLight color="#cc00ff" intensity={5} distance={40} decay={2} position={[0, 5, 0]} />
    </group>
  )
}

// ---------- main component ----------

export function SkillEffectsRenderer() {
  const { scene } = useThree()
  const [effects, setEffects] = useState([])
  const useSkill = usePlayerStore(s => s.useSkill)
  const tickCooldowns = usePlayerStore(s => s.tickCooldowns)
  const takeDamagePlayer = usePlayerStore(s => s.takeDamage)
  const isDead = useGameStore(s => s.isDead)
  const isResting = useGameStore(s => s.isResting)

  useFrame((_, delta) => {
    tickCooldowns(delta)
  })

  useEffect(() => {
    const onKey = (e) => {
      if (window.__gamePaused || isDead || isResting || window.__npcTalking) return
      let skillIdx = -1
      if (e.code === 'Digit1') skillIdx = 0
      if (e.code === 'Digit2') skillIdx = 1
      if (e.code === 'Digit3') skillIdx = 2
      if (skillIdx < 0) return

      const ok = useSkill(skillIdx)
      if (!ok) return

      const playerPos = window.__playerPosition
      if (!playerPos) return
      const pos = new THREE.Vector3(playerPos.x, 0.1, playerPos.z)

      // AOE damage to nearby enemies
      const skill = SKILLS[skillIdx]
      const radius = skillIdx === 2 ? 20 : skillIdx === 1 ? 8 : 5
      const playerDmg = usePlayerStore.getState().damage

      // Find all enemy rigid bodies via scene objects
      scene.traverse((obj) => {
        if (obj.name && obj.name.startsWith('enemy_')) {
          const ePos = new THREE.Vector3()
          obj.getWorldPosition(ePos)
          const d = ePos.distanceTo(pos)
          if (d < radius) {
            // Do raw damage by broadcasting to window
            window.__skillHit = { name: obj.name, damage: skill.damage + playerDmg }
          }
        }
      })

      const id = Math.random()
      setEffects(prev => [...prev, { id, skillIdx, pos }])
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isDead, isResting, useSkill, scene])

  const removeEffect = (id) => setEffects(prev => prev.filter(e => e.id !== id))

  return (
    <>
      {effects.map(({ id, skillIdx, pos }) => {
        const p = [pos.x, pos.y, pos.z]
        if (skillIdx === 0) return <SoulSlashEffect key={id} pos={p} onDone={() => removeEffect(id)} />
        if (skillIdx === 1) return <FlameBurstEffect key={id} pos={p} onDone={() => removeEffect(id)} />
        if (skillIdx === 2) return <VoidStormEffect key={id} pos={p} onDone={() => removeEffect(id)} />
        return null
      })}
    </>
  )
}
