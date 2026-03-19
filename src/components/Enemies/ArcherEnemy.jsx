import { useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { RigidBody, CapsuleCollider, CuboidCollider } from '@react-three/rapier'
import * as THREE from 'three'
import { Html } from '@react-three/drei'
import { usePlayerStore } from '../../store/usePlayerStore'
import { useGameStore }   from '../../store/useGameStore'

// ——— Model Archer: jubah gelap, busur ———
function ArcherModel({ aiming }) {
  const bowRef = useRef()
  useFrame((s) => {
    if (bowRef.current) {
      bowRef.current.rotation.z = aiming
        ? THREE.MathUtils.lerp(bowRef.current.rotation.z, -0.7, 0.12)
        : THREE.MathUtils.lerp(bowRef.current.rotation.z,  0,   0.08)
    }
  })
  return (
    <group>
      {/* Jubah */}
      <mesh position={[0, 0.75, 0]} castShadow>
        <coneGeometry args={[0.38, 1.5, 7]} />
        <meshStandardMaterial color="#1a1028" roughness={0.9} />
      </mesh>
      {/* Torso */}
      <mesh position={[0, 1.05, 0]} castShadow>
        <boxGeometry args={[0.48, 0.55, 0.35]} />
        <meshStandardMaterial color="#221830" roughness={0.85} />
      </mesh>
      {/* Kepala bertudung */}
      <mesh position={[0, 1.58, 0]} castShadow>
        <sphereGeometry args={[0.22, 8, 7]} />
        <meshStandardMaterial color="#c8a070" roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.78, 0]} castShadow>
        <coneGeometry args={[0.26, 0.42, 7]} />
        <meshStandardMaterial color="#1a1028" roughness={0.9} />
      </mesh>
      {/* Mata bercahaya */}
      {[-0.08, 0.08].map((x, i) => (
        <mesh key={i} position={[x, 1.6, 0.2]} castShadow>
          <sphereGeometry args={[0.04, 5, 5]} />
          <meshStandardMaterial color="#88aaff" emissive="#4466ff" emissiveIntensity={aiming ? 3 : 1} />
        </mesh>
      ))}
      {/* Busur */}
      <group position={[-0.38, 1.1, 0.18]} ref={bowRef}>
        <mesh castShadow rotation={[0.2, 0, 0.1]}>
          <torusGeometry args={[0.28, 0.03, 6, 16, Math.PI * 1.2]} />
          <meshStandardMaterial color="#5a3a10" roughness={0.7} />
        </mesh>
        {/* Tali busur */}
        <mesh position={[0.12, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.008, 0.008, 0.58, 4]} />
          <meshStandardMaterial color="#d4c090" />
        </mesh>
        {/* Anak panah saat aiming */}
        {aiming && (
          <mesh position={[0.08, 0, 0.05]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.015, 0.015, 0.45, 4]} />
            <meshStandardMaterial color="#8a6030" emissive="#4422ff" emissiveIntensity={1.5} />
          </mesh>
        )}
      </group>
      {/* Lengan kanan */}
      <mesh position={[0.38, 1.1, 0.1]} rotation={[-0.3, 0, 0.3]} castShadow>
        <capsuleGeometry args={[0.07, 0.35, 4, 6]} />
        <meshStandardMaterial color="#221830" roughness={0.85} />
      </mesh>
    </group>
  )
}

const MAX_HP = 55
export function ArcherEnemy({ id, position = [10, 3, 10] }) {
  const rbRef    = useRef()
  const groupRef = useRef()
  const { scene } = useThree()

  const [hp,      setHp]      = useState(MAX_HP)
  const [aiState, setAiState] = useState('IDLE')
  const [dead,    setDead]    = useState(false)
  const [aiming,  setAiming]  = useState(false)

  const takeDamage = usePlayerStore(s => s.takeDamage)
  const addSouls   = useGameStore(s => s.addSouls)
  const playerHP   = usePlayerStore(s => s.health)
  const spawnProjectile = useGameStore(s => s.spawnProjectile)

  const atkTimer    = useRef(0)
  const hitCooldown = useRef(0)
  const fleeTimer   = useRef(0)

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
    const dir = new THREE.Vector3().subVectors(pPos, eVec).setY(0).normalize()

    if (aiState === 'IDLE' && dist < 20) setAiState('RANGE')

    if (aiState === 'RANGE') {
      // Always face player
      if (groupRef.current) {
        groupRef.current.quaternion.slerp(
          new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0), Math.atan2(dir.x, dir.z)), delta * 5)
      }

      // Too close → flee backward
      if (dist < 6) {
        tv.x = -dir.x * 4.5
        tv.z = -dir.z * 4.5
        setAiming(false)
        atkTimer.current = 0
      } else if (dist > 18) {
        setAiState('IDLE')
      } else {
        // Aim & shoot cycle
        atkTimer.current += delta
        if (!aiming && atkTimer.current > 1.5) setAiming(true)
        if (aiming && atkTimer.current > 2.8) {
          if (dist < 20) {
            spawnProjectile({
              pos: [eVec.x, eVec.y + 1.2, eVec.z],
              dir: [dir.x, 0, dir.z],
              speed: 18,
              dmg: 14,
              type: 'arrow'
            })
          }
          setAiming(false)
          atkTimer.current = 0
        }
        // Slow strafe to avoid being hit
        fleeTimer.current += delta
        const strafe = Math.sin(fleeTimer.current * 0.8)
        const perpDir = new THREE.Vector3(-dir.z, 0, dir.x)
        tv.x = perpDir.x * strafe * 2.5
        tv.z = perpDir.z * strafe * 2.5
      }
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
    hitCooldown.current = 0.55
    const dmg = usePlayerStore.getState().damage
    setHp(h => { const nh = h - dmg; if (nh <= 0) { addSouls(70); setDead(true) }; return Math.max(0, nh) })
    setAiState('RANGE'); atkTimer.current = 0; setAiming(false)
  }

  if (dead) return null

  return (
    <RigidBody ref={rbRef} position={position} colliders={false} enabledRotations={[false,false,false]} name={`enemy_${id}`}>
      <CapsuleCollider args={[0.45, 0.32]} position={[0, 0.77, 0]} />
      <CuboidCollider args={[0.5, 0.9, 0.5]} position={[0, 0.77, 0]} sensor onIntersectionEnter={handleHit} onIntersectionStay={handleHit} />

      {aiState !== 'IDLE' && (
        <Html center position={[0, 2.4, 0]} distanceFactor={12}>
          <div style={{ pointerEvents:'none', width:55 }}>
            <div style={{ width:'100%', height:4, background:'#222', border:'1px solid #000', borderRadius:2 }}>
              <div style={{ width:`${(hp/MAX_HP)*100}%`, height:'100%', borderRadius:2, background: aiming ? '#4466ff' : '#e04040', transition:'width 0.15s' }} />
            </div>
          </div>
        </Html>
      )}
      <group ref={groupRef}><ArcherModel aiming={aiming} /></group>
    </RigidBody>
  )
}
