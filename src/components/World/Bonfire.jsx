import { useRef, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody, CuboidCollider } from '@react-three/rapier'
import { useGameStore } from '../../store/useGameStore'
import { usePlayerStore } from '../../store/usePlayerStore'
import { Html } from '@react-three/drei'

export function Bonfire({ position = [0, 0, 0] }) {
  const lightRef = useRef()
  const flameRef = useRef()
  const [canInteract, setCanInteract] = useState(false)
  
  const setResting = useGameStore(state => state.setResting)
  const setLastBonfire = useGameStore(state => state.setLastBonfire)
  const resetStats = usePlayerStore(state => state.resetStats)

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (lightRef.current) {
      lightRef.current.intensity = 2 + Math.sin(t * 5) * 0.5
    }
    if (flameRef.current) {
      flameRef.current.position.y = Math.sin(t * 2) * 0.1 + 0.8
      flameRef.current.rotation.y = t
    }
  })

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (canInteract && e.key.toLowerCase() === 'e') {
        setResting(true)
        setLastBonfire([position[0], position[1] + 3, position[2] + 4])
        resetStats()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [canInteract, setResting, resetStats])

  return (
    <group position={position}>
      {/* Base */}
      <RigidBody type="fixed" colliders="cuboid" name="bonfire">
        <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.8, 1, 0.4, 8]} />
          <meshStandardMaterial color="#444" roughness={1} />
        </mesh>
      </RigidBody>
      
      {/* Flame */}
      <mesh ref={flameRef} position={[0, 0.8, 0]} castShadow>
        <octahedronGeometry args={[0.4, 0]} />
        <meshStandardMaterial color="#ffaa00" emissive="#ffaa00" emissiveIntensity={2} />
      </mesh>

      <pointLight 
        ref={lightRef} 
        color="#ffaa00" 
        distance={20} 
        intensity={2} 
        decay={2} 
        position={[0, 1.5, 0]} 
        castShadow 
      />

      {/* Interaction Zone */}
      <CuboidCollider 
        args={[2, 2, 2]} 
        sensor 
        position={[0, 1, 0]}
        onIntersectionEnter={(payload) => {
          if (payload.other.rigidBodyObject?.name === 'player') {
            setCanInteract(true)
          }
        }}
        onIntersectionExit={(payload) => {
          if (payload.other.rigidBodyObject?.name === 'player') {
            setCanInteract(false)
          }
        }}
      />

      {canInteract && (
        <Html position={[0, 2.5, 0]} center>
          <div style={{
            color: 'white',
            background: 'rgba(0,0,0,0.7)',
            padding: '8px 16px',
            borderRadius: '4px',
            fontFamily: 'sans-serif',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            border: '1px solid #ffaa00'
          }}>
            Press [E] to Rest
          </div>
        </Html>
      )}
    </group>
  )
}
