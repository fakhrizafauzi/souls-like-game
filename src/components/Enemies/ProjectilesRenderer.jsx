import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../../store/useGameStore'
import { usePlayerStore } from '../../store/usePlayerStore'

function SingleProjectile({ id, pos, dir, speed, dmg, type }) {
  const ref = useRef()
  const takeDamage = usePlayerStore(s => s.takeDamage)
  const removeProjectile = useGameStore(s => s.removeProjectile)
  const age = useRef(0)
  const isDead = useRef(false)
  
  const { scene } = useThree()
  const vPos = useRef(new THREE.Vector3(...pos))
  const vDir = useRef(new THREE.Vector3(...dir).normalize())
  
  useFrame((_, delta) => {
    if (window.__gamePaused || isDead.current) return
    age.current += delta
    if (age.current > 6) { isDead.current = true; removeProjectile(id); return }
    
    // Bergerak
    vPos.current.addScaledVector(vDir.current, speed * delta)
    if (ref.current) ref.current.position.copy(vPos.current)
    
    // Deteksi tabrakan dengan Player
    const playerObj = scene.getObjectByName('player')
    if (playerObj) {
      const pPos = new THREE.Vector3()
      playerObj.getWorldPosition(pPos)
      pPos.y += 0.9 // tengah badan player
      if (vPos.current.distanceTo(pPos) < 1.0) {
        takeDamage(dmg)
        isDead.current = true
        removeProjectile(id)
      }
    }
  })

  // Rotasi untuk panah (sekali saat mount)
  const rotY = Math.atan2(vDir.current.x, vDir.current.z)

  if (type === 'arrow') {
    return (
      <group ref={ref} position={vPos.current}>
        <mesh rotation={[0, rotY, 0]}>
          <group rotation={[Math.PI/2, 0, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.9, 4]} />
            <meshStandardMaterial color="#8a6030" emissive="#4422ff" emissiveIntensity={1.5} />
          </group>
        </mesh>
      </group>
    )
  }
  
  if (type === 'orb') {
    return (
      <group ref={ref} position={vPos.current}>
        <mesh>
          <sphereGeometry args={[0.25, 8, 6]} />
          <meshStandardMaterial color="#8800ff" emissive="#6600ff" emissiveIntensity={4} transparent opacity={0.8} />
        </mesh>
        <pointLight color="#8800ff" distance={4} intensity={2} />
      </group>
    )
  }

  return null
}

export function ProjectilesRenderer() {
  const projectiles = useGameStore(s => s.projectiles)
  return (
    <>
      {projectiles.map(p => <SingleProjectile key={p.id} {...p} />)}
    </>
  )
}
