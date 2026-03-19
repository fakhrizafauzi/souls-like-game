import { useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { RigidBody, CapsuleCollider, CuboidCollider } from '@react-three/rapier'
import * as THREE from 'three'
import { Html } from '@react-three/drei'
import { usePlayerStore } from '../../store/usePlayerStore'
import { useGameStore }   from '../../store/useGameStore'

// ——— Model Shadow Knight: semi-transparan, mix antara knight dan wraith ———
function ShadowKnightModel({ isTeleporting, mode }) {
  const groupRef = useRef()
  const auraRef  = useRef()

  useFrame((s) => {
    const t = s.clock.getElapsedTime()
    if (groupRef.current) {
      groupRef.current.material && (groupRef.current.material.opacity = isTeleporting ? Math.max(0, 0.6 - (t % 0.4) * 2) : 0.85)
    }
    if (auraRef.current) auraRef.current.rotation.y = t * 1.5
  })

  const c = '#1a0830'
  const a = mode === 'ranged' ? '#8800ff' : '#0044ff'

  return (
    <group>
      {/* Jubah gelap semi-transparan */}
      <mesh position={[0, 0.8, 0]} castShadow>
        <coneGeometry args={[0.44, 1.6, 7]} />
        <meshStandardMaterial color={c} transparent opacity={0.88} roughness={0.85} />
      </mesh>
      {/* Torso */}
      <mesh position={[0, 1.12, 0]} castShadow>
        <boxGeometry args={[0.58, 0.6, 0.4]} />
        <meshStandardMaterial color="#221040" transparent opacity={0.9} metalness={0.5} roughness={0.5} />
      </mesh>
      {/* Plat dada rune */}
      <mesh position={[0, 1.14, 0.21]} castShadow>
        <boxGeometry args={[0.42, 0.4, 0.08]} />
        <meshStandardMaterial color={a} emissive={a} emissiveIntensity={1.2} transparent opacity={0.9} />
      </mesh>
      {/* Helm */}
      <mesh position={[0, 1.7, 0]} castShadow>
        <boxGeometry args={[0.42, 0.44, 0.4]} />
        <meshStandardMaterial color="#1a0830" transparent opacity={0.9} metalness={0.7} roughness={0.25} />
      </mesh>
      {/* Mata ungu */}
      {[-0.1, 0.1].map((x, i) => (
        <mesh key={i} position={[x, 1.74, 0.21]} castShadow>
          <boxGeometry args={[0.08, 0.05, 0.05]} />
          <meshStandardMaterial color={a} emissive={a} emissiveIntensity={mode === 'ranged' ? 4 : 2} />
        </mesh>
      ))}
      {/* Pedang gaib */}
      <group position={[0.44, 1.15, 0.25]} rotation={[0.2, 0.3, -0.4]}>
        <mesh castShadow>
          <boxGeometry args={[0.07, 1.3, 0.04]} />
          <meshStandardMaterial color="#aaccff" metalness={0.9} roughness={0.05} transparent opacity={0.85} />
        </mesh>
        <mesh castShadow>
          <boxGeometry args={[0.14, 1.32, 0.1]} />
          <meshStandardMaterial color={a} emissive={a} emissiveIntensity={1.5} transparent opacity={0.3} />
        </mesh>
        <mesh position={[0, -0.7, 0]} castShadow>
          <boxGeometry args={[0.38, 0.07, 0.1]} />
          <meshStandardMaterial color="#4433aa" metalness={0.9} />
        </mesh>
      </group>
      {/* Orb ranged attack */}
      {mode === 'ranged' && (
        <mesh position={[-0.4, 1.3, 0.35]} castShadow>
          <sphereGeometry args={[0.18, 8, 6]} />
          <meshStandardMaterial color="#8800ff" emissive="#6600ff" emissiveIntensity={4} transparent opacity={0.8} />
        </mesh>
      )}
      {/* Aura cincin */}
      <mesh ref={auraRef} position={[0, 0.15, 0]} rotation={[Math.PI/2, 0, 0]}>
        <torusGeometry args={[0.5, 0.06, 6, 18]} />
        <meshStandardMaterial color={a} emissive={a} emissiveIntensity={1.5} transparent opacity={0.5} />
      </mesh>
      <pointLight color={a} intensity={0.8} distance={5} position={[0, 1.2, 0]} />
    </group>
  )
}

const MAX_HP = 130
export function ShadowKnightEnemy({ id, position = [10, 3, 10] }) {
  const rbRef    = useRef()
  const groupRef = useRef()
  const { scene } = useThree()

  const [hp,      setHp]      = useState(MAX_HP)
  const [aiState, setAiState] = useState('IDLE')
  const [mode,    setMode]    = useState('melee')  // 'melee' | 'ranged'
  const [dead,    setDead]    = useState(false)

  const takeDamage = usePlayerStore(s => s.takeDamage)
  const addSouls   = useGameStore(s => s.addSouls)
  const playerHP   = usePlayerStore(s => s.health)
  const spawnProjectile = useGameStore(s => s.spawnProjectile)

  const atkTimer    = useRef(0)
  const hitCooldown = useRef(0)
  const modeTimer   = useRef(0)
  const teleportCD  = useRef(0)

  useFrame((_, delta) => {
    if (dead || !rbRef.current || window.__gamePaused) return
    hitCooldown.current = Math.max(0, hitCooldown.current - delta)
    teleportCD.current  = Math.max(0, teleportCD.current - delta)
    modeTimer.current  += delta

    const ep   = rbRef.current.translation()
    const eVec = new THREE.Vector3(ep.x, ep.y, ep.z)
    const playerObj = scene.getObjectByName('player')
    if (!playerObj || playerHP <= 0) return

    const pPos = new THREE.Vector3()
    playerObj.getWorldPosition(pPos)
    const dist = eVec.distanceTo(pPos)

    const rbv = rbRef.current.linvel()
    const tv  = new THREE.Vector3(0, rbv.y, 0)
    const dir = new THREE.Vector3().subVectors(pPos, eVec).setY(0).normalize()

    // Switch mode every 6s
    if (modeTimer.current > 6) {
      setMode(m => m === 'melee' ? 'ranged' : 'melee')
      modeTimer.current = 0
    }

    if (aiState === 'IDLE' && dist < 22) setAiState('ACTIVE')

    if (aiState === 'ACTIVE') {
      if (groupRef.current) groupRef.current.quaternion.slerp(
        new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0), Math.atan2(dir.x, dir.z)), delta * 6)

      if (mode === 'melee') {
        // Teleport to near player every 5s
        if (teleportCD.current <= 0 && dist > 4) {
          teleportCD.current = 5
          const offset = new THREE.Vector3(dir.x * -2.5, 0, dir.z * -2.5)
          rbRef.current.setTranslation({ x: pPos.x + offset.x, y: ep.y, z: pPos.z + offset.z }, true)
        }
        // Melee attack
        if (dist < 2.5) {
          atkTimer.current += delta
          if (atkTimer.current > 0.9) { takeDamage(18); atkTimer.current = 0 }
        } else {
          tv.x = dir.x * 4; tv.z = dir.z * 4
        }
      } else {
        // Ranged: stay mid-distance, throw orb
        const targetDist = 10
        if (dist < targetDist - 2) { tv.x = -dir.x * 3; tv.z = -dir.z * 3 }
        else if (dist > targetDist + 3) { tv.x = dir.x * 3; tv.z = dir.z * 3 }
        atkTimer.current += delta
        if (atkTimer.current > 2.2) {
          if (dist < 25) {
            spawnProjectile({
              pos: [eVec.x, eVec.y + 1.4, eVec.z],
              dir: [dir.x, 0, dir.z],
              speed: 12,
              dmg: 20,
              type: 'orb'
            })
          }
          atkTimer.current = 0
        }
      }
    }

    if (aiState === 'HIT') {
      atkTimer.current += delta
      if (atkTimer.current > 0.25) { setAiState('ACTIVE'); atkTimer.current = 0 }
    }

    rbRef.current.setLinvel(new THREE.Vector3(
      THREE.MathUtils.lerp(rbv.x, tv.x, delta * 8),
      rbv.y,
      THREE.MathUtils.lerp(rbv.z, tv.z, delta * 8)
    ), true)
  })

  const handleHit = (e) => {
    if (dead || hitCooldown.current > 0) return
    if (e.other.rigidBodyObject?.name !== 'player') return
    if (usePlayerStore.getState().currentAttack === null) return
    hitCooldown.current = 0.5
    const dmg = usePlayerStore.getState().damage
    setHp(h => { const nh = h - dmg; if (nh <= 0) { addSouls(100); setDead(true) }; return Math.max(0, nh) })
    setAiState('HIT'); atkTimer.current = 0
  }

  if (dead) return null

  return (
    <RigidBody ref={rbRef} position={position} colliders={false} enabledRotations={[false,false,false]} name={`enemy_${id}`}>
      <CapsuleCollider args={[0.5, 0.36]} position={[0, 0.86, 0]} />
      <CuboidCollider args={[0.55, 0.95, 0.55]} position={[0, 0.86, 0]} sensor onIntersectionEnter={handleHit} onIntersectionStay={handleHit} />

      {aiState !== 'IDLE' && (
        <Html center position={[0, 2.7, 0]} distanceFactor={12}>
          <div style={{ pointerEvents:'none', width:58 }}>
            <div style={{ width:'100%', height:5, background:'#222', border:'1px solid #000', borderRadius:2 }}>
              <div style={{ width:`${(hp/MAX_HP)*100}%`, height:'100%', borderRadius:2, background: mode==='ranged' ? '#8800ff' : '#4466ff', transition:'width 0.15s' }} />
            </div>
          </div>
        </Html>
      )}
      <group ref={groupRef}><ShadowKnightModel isTeleporting={false} mode={mode} /></group>
    </RigidBody>
  )
}
