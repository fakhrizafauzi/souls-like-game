import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const WANDER_RADIUS = 10  // how far from home they roam

/**
 * WanderingTownNPC - A simple villager that walks back and forth around their home position.
 */
export function WanderingVillager({ home = [0, 0, 0], color = '#8a6a4a', seed = 0 }) {
  const groupRef = useRef()
  const targetRef = useRef(new THREE.Vector3(...home))
  const timeRef = useRef(seed * 10)

  useEffect(() => {
    // Pick first waypoint
    const angle = Math.random() * Math.PI * 2
    targetRef.current.set(home[0] + Math.cos(angle) * WANDER_RADIUS, home[1], home[2] + Math.sin(angle) * WANDER_RADIUS)
  }, [])

  useFrame((_, delta) => {
    if (window.__gamePaused) return
    const g = groupRef.current
    if (!g) return

    timeRef.current += delta
    const pos = g.position
    const tgt = targetRef.current
    const dist = pos.distanceTo(tgt)

    if (dist < 0.6) {
      // Pick new random target around home
      const angle = Math.random() * Math.PI * 2
      const r = Math.random() * WANDER_RADIUS + 2
      tgt.set(home[0] + Math.cos(angle) * r, home[1], home[2] + Math.sin(angle) * r)
    }

    // Move towards target
    const dir = new THREE.Vector3().subVectors(tgt, pos).setY(0).normalize()
    const speed = 1.2
    pos.addScaledVector(dir, speed * delta)

    // Face direction
    const angle = Math.atan2(dir.x, dir.z)
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, angle, delta * 5)

    // Idle bob animation
    g.position.y = Math.sin(timeRef.current * 3.5) * 0.05
  })

  return (
    <group ref={groupRef} position={home}>
      {/* Body */}
      <mesh position={[0, 0.75, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.28, 1.1, 7]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.45, 0]} castShadow>
        <sphereGeometry args={[0.24, 8, 7]} />
        <meshStandardMaterial color="#c8a880" roughness={0.8} />
      </mesh>
      {/* Arms (static, adds width) */}
      <mesh position={[0.32, 0.9, 0]} castShadow rotation={[0, 0, 0.6]}>
        <boxGeometry args={[0.1, 0.5, 0.1]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      <mesh position={[-0.32, 0.9, 0]} castShadow rotation={[0, 0, -0.6]}>
        <boxGeometry args={[0.1, 0.5, 0.1]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      {/* Hat accent */}
      <mesh position={[0, 1.72, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.24, 0.18, 8]} />
        <meshStandardMaterial color="#3a2a1a" roughness={0.95} />
      </mesh>
    </group>
  )
}
