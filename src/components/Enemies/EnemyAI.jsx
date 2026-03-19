import { useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { RigidBody, CapsuleCollider, CuboidCollider } from '@react-three/rapier'
import * as THREE from 'three'
import { Html } from '@react-three/drei'
import { usePlayerStore } from '../../store/usePlayerStore'
import { useGameStore }   from '../../store/useGameStore'
import { SkeletonModel }  from './SkeletonModel'
import { ZombieModel }    from './ZombieModel'
import { WraithModel }    from './WraithModel'
import { ArmoredModel }   from './ArmoredModel'

function EnemyBody({ type, state }) {
  if (type === 'zombie')  return <ZombieModel  state={state} />
  if (type === 'wraith')  return <WraithModel  state={state} />
  if (type === 'armored') return <ArmoredModel state={state} />
  return <SkeletonModel state={state} />
}

const ENEMY_STATS = {
  skeleton: { hp: 80,  atk: 10, speed: 3.0, atkRange: 2.1, atkCd: 1.0, souls: 50,  exp: 40  },
  zombie:   { hp: 140, atk: 14, speed: 1.8, atkRange: 2.2, atkCd: 1.4, souls: 60,  exp: 60  },
  wraith:   { hp: 50,  atk: 18, speed: 4.2, atkRange: 2.0, atkCd: 0.7, souls: 70,  exp: 70  },
  armored:  { hp: 200, atk: 20, speed: 2.0, atkRange: 2.3, atkCd: 1.2, souls: 120, exp: 120 },
}

export function EnemyAI({ id, position = [10, 3, 10], type = 'skeleton' }) {
  const rbRef    = useRef()
  const groupRef = useRef()
  const { scene } = useThree()

  const stats = ENEMY_STATS[type] || ENEMY_STATS.skeleton

  const [hp,      setHp]      = useState(stats.hp)
  const [aiState, setAiState] = useState('IDLE')
  const [dead,    setDead]    = useState(false)  // ← state tetap di atas

  const takeDamage = usePlayerStore(s => s.takeDamage)
  const addSouls   = useGameStore(s => s.addSouls)
  const playerHP   = usePlayerStore(s => s.health)

  const atkTimer    = useRef(0)
  const hitCooldown = useRef(0)

  // useFrame HARUS dipanggil SEBELUM return apapun
  useFrame((_, delta) => {
    // Setelah mati, skip semua logic
    if (dead || !rbRef.current || window.__gamePaused) return
    hitCooldown.current = Math.max(0, hitCooldown.current - delta)

    // Check AOE skill hits from player
    if (window.__skillHit) {
      const hit = window.__skillHit
      window.__skillHit = null
      if (hit.name === `enemy_${id}`) {
        setHp(h => {
          const nh = h - hit.damage
          if (nh <= 0) { addSouls(stats.souls); setDead(true) }
          return Math.max(0, nh)
        })
        setAiState('HIT')
        atkTimer.current = 0
      }
    }

    const ep   = rbRef.current.translation()
    const eVec = new THREE.Vector3(ep.x, ep.y, ep.z)

    const playerObj = scene.getObjectByName('player')
    if (!playerObj || playerHP <= 0) return
    const pPos = new THREE.Vector3()
    playerObj.getWorldPosition(pPos)
    const dist = eVec.distanceTo(pPos)

    const rbv = rbRef.current.linvel()
    const tv  = new THREE.Vector3(0, rbv.y, 0)

    if (aiState === 'IDLE' && dist < 18) setAiState('CHASE')

    if (aiState === 'CHASE') {
      if (dist > 28)           { setAiState('IDLE');   return }
      if (dist < stats.atkRange) { setAiState('ATTACK'); atkTimer.current = 0; return }
      const dir = new THREE.Vector3().subVectors(pPos, eVec).setY(0).normalize()
      tv.x = dir.x * stats.speed
      tv.z = dir.z * stats.speed
      if (groupRef.current) {
        const angle = Math.atan2(dir.x, dir.z)
        groupRef.current.quaternion.slerp(
          new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0), angle), delta * 7)
      }
    }

    if (aiState === 'ATTACK') {
      if (dist > stats.atkRange + 1) { setAiState('CHASE'); return }
      atkTimer.current += delta
      const dir = new THREE.Vector3().subVectors(pPos, eVec).setY(0).normalize()
      if (groupRef.current) {
        const angle = Math.atan2(dir.x, dir.z)
        groupRef.current.quaternion.slerp(
          new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0), angle), delta * 8)
      }
      if (atkTimer.current >= stats.atkCd) {
        if (dist < stats.atkRange + 0.5) takeDamage(stats.atk)
        atkTimer.current = 0
      }
    }

    if (aiState === 'HIT') {
      atkTimer.current += delta
      if (atkTimer.current > 0.4) { setAiState('CHASE'); atkTimer.current = 0 }
    }

    rbRef.current.setLinvel(new THREE.Vector3(
      THREE.MathUtils.lerp(rbv.x, tv.x, delta * 9),
      rbv.y,
      THREE.MathUtils.lerp(rbv.z, tv.z, delta * 9)
    ), true)
  })

  // Deteksi hit dari player
  const handleHit = (e) => {
    if (dead) return
    if (e.other.rigidBodyObject?.name !== 'player') return
    if (hitCooldown.current > 0) return
    if (usePlayerStore.getState().currentAttack === null) return

    hitCooldown.current = 0.55
    const dmg = usePlayerStore.getState().damage
    setHp(h => {
      const nh = h - dmg
      if (nh <= 0) {
        addSouls(stats.souls)
        setDead(true)
      }
      return Math.max(0, nh)
    })
    setAiState('HIT')
    atkTimer.current = 0
  }

  // EARLY RETURN di JSX level — semua hooks sudah dipanggil di atas
  if (dead) return null

  return (
    <RigidBody ref={rbRef} position={position} colliders={false} enabledRotations={[false,false,false]} name={`enemy_${id}`}>
      <CapsuleCollider args={[0.5, 0.38]} position={[0, 0.9, 0]} />

      <CuboidCollider
        args={[0.58, 1.05, 0.58]} position={[0, 0.9, 0]} sensor
        onIntersectionEnter={handleHit}
        onIntersectionStay={handleHit}
      />

      {/* HP Bar */}
      {aiState !== 'IDLE' && (
        <Html center position={[0, 2.5, 0]} distanceFactor={12}>
          <div style={{ pointerEvents: 'none', width: 60 }}>
            <div style={{ width: '100%', height: 5, background: '#222', border: '1px solid #000', borderRadius: 2 }}>
              <div style={{
                width: `${(hp / stats.hp) * 100}%`, height: '100%', borderRadius: 2,
                background: hp / stats.hp > 0.5 ? '#e04040' : '#ff8800',
                transition: 'width 0.15s',
              }} />
            </div>
          </div>
        </Html>
      )}

      <group ref={groupRef}>
        <EnemyBody type={type} state={aiState} />
      </group>
    </RigidBody>
  )
}
