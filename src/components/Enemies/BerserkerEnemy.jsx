import { useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { RigidBody, CapsuleCollider, CuboidCollider } from '@react-three/rapier'
import * as THREE from 'three'
import { Html } from '@react-three/drei'
import { usePlayerStore } from '../../store/usePlayerStore'
import { useGameStore }   from '../../store/useGameStore'

// ——— Model Berserker: besar, dua kapak ———
function BerserkerModel({ comboPhase, isRaging }) {
  const rage = isRaging
  const body  = rage ? '#3a0808' : '#2a1810'
  const metal = rage ? '#cc2200' : '#6a5a40'

  return (
    <group>
      {/* Kaki pendek gempal */}
      {[-0.25, 0.25].map((x, i) => (
        <mesh key={i} position={[x, 0.38, 0]} castShadow>
          <boxGeometry args={[0.35, 0.75, 0.38]} />
          <meshStandardMaterial color={body} roughness={0.8} />
        </mesh>
      ))}
      {/* Torso besar */}
      <mesh position={[0, 1.05, 0]} castShadow>
        <boxGeometry args={[0.95, 0.95, 0.6]} />
        <meshStandardMaterial color={body} roughness={0.8} />
      </mesh>
      {/* Plat bahu */}
      {[-0.62, 0.62].map((x, i) => (
        <mesh key={i} position={[x, 1.42, 0]} castShadow rotation={[0,0, x<0?0.4:-0.4]}>
          <boxGeometry args={[0.32, 0.28, 0.32]} />
          <meshStandardMaterial color={metal} roughness={0.3} metalness={0.8} />
        </mesh>
      ))}
      {/* Kepala kecil */}
      <mesh position={[0, 1.72, 0]} castShadow>
        <boxGeometry args={[0.46, 0.44, 0.42]} />
        <meshStandardMaterial color={body} roughness={0.8} />
      </mesh>
      {/* Mata merah */}
      {[-0.12, 0.12].map((x, i) => (
        <mesh key={i} position={[x, 1.76, 0.22]} castShadow>
          <sphereGeometry args={[0.075, 6, 6]} />
          <meshStandardMaterial color="#ff2200" emissive="#ff0000" emissiveIntensity={rage ? 5 : 2} />
        </mesh>
      ))}
      {/* Kapak kanan */}
      <group position={[0.6, 1.0, 0.3]} rotation={[comboPhase === 1 ? -1.2 : comboPhase === 2 ? 0.6 : 0, 0.3, -0.5]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.05, 0.06, 0.9, 6]} />
          <meshStandardMaterial color="#4a3010" roughness={0.9} />
        </mesh>
        <mesh position={[0.18, 0.5, 0]} castShadow>
          <boxGeometry args={[0.44, 0.48, 0.08]} />
          <meshStandardMaterial color={metal} metalness={0.9} roughness={0.1}
            emissive={rage ? '#440000' : '#000'} emissiveIntensity={rage ? 0.5 : 0} />
        </mesh>
      </group>
      {/* Kapak kiri */}
      <group position={[-0.6, 1.0, 0.3]} rotation={[comboPhase === 3 ? -1.0 : 0.3, -0.3, 0.5]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.05, 0.06, 0.85, 6]} />
          <meshStandardMaterial color="#4a3010" roughness={0.9} />
        </mesh>
        <mesh position={[-0.18, 0.46, 0]} castShadow>
          <boxGeometry args={[0.42, 0.44, 0.08]} />
          <meshStandardMaterial color={metal} metalness={0.9} roughness={0.1}
            emissive={rage ? '#440000' : '#000'} emissiveIntensity={rage ? 0.5 : 0} />
        </mesh>
      </group>
      {/* Rage aura */}
      {rage && (
        <mesh position={[0, 1.0, 0]}>
          <sphereGeometry args={[0.9, 8, 6]} />
          <meshStandardMaterial color="#ff2200" emissive="#ff1100" emissiveIntensity={1.5} transparent opacity={0.12} />
        </mesh>
      )}
    </group>
  )
}

const MAX_HP = 220
export function BerserkerEnemy({ id, position = [10, 3, 10] }) {
  const rbRef    = useRef()
  const groupRef = useRef()
  const { scene } = useThree()

  const [hp,         setHp]         = useState(MAX_HP)
  const [aiState,    setAiState]    = useState('IDLE')
  const [dead,       setDead]       = useState(false)
  const [comboPhase, setComboPhase] = useState(0)
  const [isRaging,   setIsRaging]   = useState(false)

  const takeDamage = usePlayerStore(s => s.takeDamage)
  const addSouls   = useGameStore(s => s.addSouls)
  const playerHP   = usePlayerStore(s => s.health)

  const atkTimer    = useRef(0)
  const comboTimer  = useRef(0)
  const hitCooldown = useRef(0)
  const comboRef    = useRef(0)

  useFrame((_, delta) => {
    if (dead || !rbRef.current || window.__gamePaused) return
    hitCooldown.current = Math.max(0, hitCooldown.current - delta)

    const ep   = rbRef.current.translation()
    const eVec = new THREE.Vector3(ep.x, ep.y, ep.z)
    const playerObj = scene.getObjectByName('player')
    if (!playerObj || playerHP <= 0) return

    const pPos = new THREE.Vector3()
    playerObj.getWorldPosition(pPos)
    const dist = eVec.distanceTo(pPos)

    const rbv = rbRef.current.linvel()
    const tv  = new THREE.Vector3(0, rbv.y, 0)

    // Rage mode bawah 40% HP
    const rage = hp < MAX_HP * 0.4
    if (rage && !isRaging) setIsRaging(true)
    const spd      = rage ? 7.5 : 5.5
    const atkRange = 2.4
    const dmg      = rage ? 22 : 16

    if (aiState === 'IDLE' && dist < 20) setAiState('CHARGE')

    if (aiState === 'CHARGE') {
      if (dist > 30) { setAiState('IDLE'); return }
      const dir = new THREE.Vector3().subVectors(pPos, eVec).setY(0).normalize()
      if (dist < atkRange) { setAiState('COMBO'); comboTimer.current = 0; comboRef.current = 0 }
      else {
        tv.x = dir.x * spd
        tv.z = dir.z * spd
      }
      if (groupRef.current) groupRef.current.quaternion.slerp(
        new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0), Math.atan2(dir.x, dir.z)), delta * 9)
    }

    if (aiState === 'COMBO') {
      comboTimer.current += delta
      if (dist > atkRange + 1.2) { setAiState('CHARGE'); setComboPhase(0); return }
      // 3-hit combo: hit every 0.35s
      if (comboTimer.current > 0.35) {
        comboRef.current++
        setComboPhase(comboRef.current % 3 + 1)
        if (dist < atkRange + 0.5) takeDamage(dmg)
        comboTimer.current = 0
        if (comboRef.current >= (rage ? 5 : 3)) {
          // Pause after combo
          setAiState('COOLDOWN')
          atkTimer.current = 0
          setComboPhase(0)
          comboRef.current = 0
        }
      }
    }

    if (aiState === 'COOLDOWN') {
      atkTimer.current += delta
      if (atkTimer.current > (rage ? 0.4 : 0.9)) setAiState('CHARGE')
    }

    if (aiState === 'HIT') {
      atkTimer.current += delta
      if (atkTimer.current > 0.3) { setAiState('CHARGE'); atkTimer.current = 0 }
    }

    rbRef.current.setLinvel(new THREE.Vector3(
      THREE.MathUtils.lerp(rbv.x, tv.x, delta * 10),
      rbv.y,
      THREE.MathUtils.lerp(rbv.z, tv.z, delta * 10)
    ), true)
  })

  const handleHit = (e) => {
    if (dead || hitCooldown.current > 0) return
    if (e.other.rigidBodyObject?.name !== 'player') return
    if (usePlayerStore.getState().currentAttack === null) return
    hitCooldown.current = 0.5
    const dmg = usePlayerStore.getState().damage
    setHp(h => { const nh = h - dmg; if (nh <= 0) { addSouls(120); setDead(true) }; return Math.max(0, nh) })
    setAiState('HIT'); atkTimer.current = 0
  }

  if (dead) return null

  return (
    <RigidBody ref={rbRef} position={position} colliders={false} enabledRotations={[false,false,false]} name={`enemy_${id}`}>
      <CapsuleCollider args={[0.55, 0.45]} position={[0, 1.0, 0]} />
      <CuboidCollider args={[0.65, 1.1, 0.65]} position={[0, 1.0, 0]} sensor onIntersectionEnter={handleHit} onIntersectionStay={handleHit} />

      {aiState !== 'IDLE' && (
        <Html center position={[0, 2.8, 0]} distanceFactor={12}>
          <div style={{ pointerEvents:'none', width:65 }}>
            <div style={{ width:'100%', height:5, background:'#222', border:'1px solid #000', borderRadius:2 }}>
              <div style={{ width:`${(hp/MAX_HP)*100}%`, height:'100%', borderRadius:2, background: isRaging ? '#ff2200' : '#e04040', transition:'width 0.15s' }} />
            </div>
          </div>
        </Html>
      )}
      <group ref={groupRef}><BerserkerModel comboPhase={comboPhase} isRaging={isRaging} /></group>
    </RigidBody>
  )
}
