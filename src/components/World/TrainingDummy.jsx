import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody, CuboidCollider, CylinderCollider } from '@react-three/rapier'
import * as THREE from 'three'
import { Html } from '@react-three/drei'
import { usePlayerStore } from '../../store/usePlayerStore'
import { useGameStore } from '../../store/useGameStore'
import { useLanguageStore } from '../../store/useLanguageStore'

export function TrainingDummy({ position = [0, 0, 0] }) {
  const [hp, setHp] = useState(100)
  const [hitAnim, setHitAnim] = useState(0)
  const [lastDmg, setLastDmg] = useState(null)
  const addSouls = useGameStore(s => s.addSouls)
  const t = useLanguageStore(s => s.t)

  const hitCooldown = useRef(0)
  const groupRef = useRef()

  const rewardMsg = t('dummyReward')

  useFrame((_, delta) => {
    hitCooldown.current = Math.max(0, hitCooldown.current - delta)
    if (hitAnim > 0) {
      setHitAnim(Math.max(0, hitAnim - delta * 4))
    }
    
    if (groupRef.current) {
      groupRef.current.rotation.z = Math.sin(hitAnim * Math.PI * 4) * 0.2 * hitAnim
      groupRef.current.rotation.x = Math.sin(hitAnim * Math.PI * 3) * 0.1 * hitAnim
    }
  })

  const handleHit = (e) => {
    if (e.other.rigidBodyObject?.name !== 'player') return
    if (hitCooldown.current > 0) return
    if (usePlayerStore.getState().currentAttack === null) return

    hitCooldown.current = 0.55
    const dmg = usePlayerStore.getState().damage
    
    setHitAnim(1.0)
    setLastDmg(dmg)
    setHp(prev => {
      const next = prev - dmg
      if (next <= 0) {
        addSouls(5)
        setTimeout(() => setLastDmg(rewardMsg), 100)
        return 100
      }
      return next
    })
  }

  return (
    <group position={position}>
      <RigidBody type="fixed" colliders={false} name="dummy">
        <CylinderCollider args={[1.2, 0.4]} position={[0, 1.2, 0]} />
        <CuboidCollider 
          args={[0.6, 1.2, 0.6]} 
          position={[0, 1.2, 0]} 
          sensor
          onIntersectionEnter={handleHit}
          onIntersectionStay={handleHit}
        />

        {hitAnim > 0 && (
          <Html center position={[0, 3.2, 0]}>
            <div style={{
              color: lastDmg === rewardMsg ? '#ffcc00' : '#ff4444',
              fontSize: lastDmg === rewardMsg ? 18 : 24,
              fontWeight: 'bold',
              fontFamily: 'serif',
              textShadow: '0 2px 4px #000',
              pointerEvents: 'none',
              animation: 'floatUpDmg 0.5s ease-out forwards'
            }}>
              {lastDmg}
            </div>
          </Html>
        )}

        <group ref={groupRef}>
          <mesh position={[0, 0.5, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.1, 1, 8]} />
            <meshStandardMaterial color="#3a2a1a" roughness={0.9} />
          </mesh>
          <mesh position={[0, 1.3, 0]} castShadow>
            <cylinderGeometry args={[0.3, 0.35, 1.2, 8]} />
            <meshStandardMaterial color="#c8a878" roughness={1} />
          </mesh>
          <mesh position={[0, 2.1, 0]} castShadow>
            <sphereGeometry args={[0.25, 8, 8]} />
            <meshStandardMaterial color="#c8a878" roughness={1} />
          </mesh>
          <mesh position={[0.4, 1.5, 0]} rotation={[0, 0, 0.4]} castShadow>
            <cylinderGeometry args={[0.05, 0.05, 0.8, 6]} />
            <meshStandardMaterial color="#3a2a1a" roughness={0.9} />
          </mesh>
          <mesh position={[-0.4, 1.5, 0]} rotation={[0, 0, -0.4]} castShadow>
            <cylinderGeometry args={[0.05, 0.05, 0.8, 6]} />
            <meshStandardMaterial color="#3a2a1a" roughness={0.9} />
          </mesh>
        </group>
      </RigidBody>
    </group>
  )
}
