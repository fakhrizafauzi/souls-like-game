import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * EnvLamp - A standing stone torch/lamp post.
 * Automatically illuminates at dusk and night via window.__gameTime.
 * @param {Array}  pos      - [x, y, z] world position
 * @param {string} variant  - 'post' | 'wall' | 'small'
 * @param {string} color    - light color hex (default orange-amber)
 */
export function EnvLamp({ pos = [0, 0, 0], variant = 'post', color = '#ffaa44' }) {
  const lightRef  = useRef()
  const flameRef  = useRef()
  const glowRef   = useRef()

  useFrame((_, delta) => {
    const t    = window.__gameTime ?? 0.5
    const angle = t * Math.PI * 2 - Math.PI / 2
    const sy    = Math.sin(angle)

    // Light on at dusk/night, off at day
    const targetIntensity = sy < -0.05
      ? 22
      : sy < 0.15
        ? 22 * (0.15 - sy) / 0.2
        : 0

    if (lightRef.current) {
      lightRef.current.intensity = THREE.MathUtils.lerp(
        lightRef.current.intensity ?? 0, targetIntensity, delta * 3
      )
      // Flicker the flame
      const flicker = 1 + Math.sin(Date.now() * 0.01) * 0.08 + Math.sin(Date.now() * 0.017) * 0.06
      lightRef.current.intensity *= flicker
    }

    if (flameRef.current) {
      const on = targetIntensity > 0.1
      flameRef.current.material.emissiveIntensity = THREE.MathUtils.lerp(
        flameRef.current.material.emissiveIntensity ?? 0, on ? 2.5 + Math.sin(Date.now() * 0.012) * 0.5 : 0, delta * 4
      )
    }
  })

  if (variant === 'small') {
    // Compact ground torch (for narrow spots)
    return (
      <group position={pos}>
        {/* Stick */}
        <mesh position={[0, 0.5, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.07, 1, 6]} />
          <meshStandardMaterial color="#4a3020" roughness={0.9} />
        </mesh>
        {/* Bowl */}
        <mesh position={[0, 1.1, 0]} castShadow>
          <cylinderGeometry args={[0.18, 0.12, 0.22, 8]} />
          <meshStandardMaterial color="#332010" roughness={0.8} metalness={0.3} />
        </mesh>
        {/* Flame */}
        <mesh ref={flameRef} position={[0, 1.3, 0]}>
          <sphereGeometry args={[0.12, 6, 6]} />
          <meshStandardMaterial color="#ffaa22" emissive="#ff8800" emissiveIntensity={0} transparent opacity={0.9} />
        </mesh>
        <pointLight ref={lightRef} color={color} intensity={0} distance={55} decay={1.2} position={[0, 1.3, 0]} />
      </group>
    )
  }

  if (variant === 'wall') {
    // Bracket-style wall torch
    return (
      <group position={pos}>
        {/* Arm bracket */}
        <mesh position={[0, 0, 0.3]} castShadow rotation={[Math.PI/2, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.65, 5]} />
          <meshStandardMaterial color="#2a1a0a" roughness={0.9} />
        </mesh>
        {/* Cup */}
        <mesh position={[0, 0, 0.65]} castShadow>
          <cylinderGeometry args={[0.16, 0.1, 0.22, 8]} />
          <meshStandardMaterial color="#3a2010" roughness={0.7} metalness={0.4} />
        </mesh>
        {/* Flame */}
        <mesh ref={flameRef} position={[0, 0.18, 0.65]}>
          <sphereGeometry args={[0.1, 6, 6]} />
          <meshStandardMaterial color="#ffaa22" emissive="#ff8800" emissiveIntensity={0} transparent opacity={0.9} />
        </mesh>
        <pointLight ref={lightRef} color={color} intensity={0} distance={55} decay={1.2} position={[0, 0.15, 0.65]} />
      </group>
    )
  }

  // Default: standing post lamp
  return (
    <group position={pos}>
      {/* Base */}
      <mesh position={[0, 0.15, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.28, 0.3, 8]} />
        <meshStandardMaterial color="#252025" roughness={0.9} />
      </mesh>
      {/* Post */}
      <mesh position={[0, 1.4, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.08, 2.5, 7]} />
        <meshStandardMaterial color="#1e1820" roughness={0.85} />
      </mesh>
      {/* Lantern housing */}
      <mesh position={[0, 2.75, 0]} castShadow>
        <boxGeometry args={[0.35, 0.45, 0.35]} />
        <meshStandardMaterial color="#181420" roughness={0.7} metalness={0.5} />
      </mesh>
      {/* Glass panel (emissive when on) */}
      <mesh ref={flameRef} position={[0, 2.75, 0]}>
        <boxGeometry args={[0.28, 0.36, 0.28]} />
        <meshStandardMaterial color="#ffcc77" emissive="#ff9900" emissiveIntensity={0} transparent opacity={0.7} />
      </mesh>
      {/* Cap */}
      <mesh position={[0, 3.02, 0]} castShadow>
        <coneGeometry args={[0.24, 0.28, 6]} />
        <meshStandardMaterial color="#181420" roughness={0.8} />
      </mesh>
      <pointLight ref={lightRef} color={color} intensity={0} distance={70} decay={1.2} position={[0, 2.75, 0]} />
    </group>
  )
}
