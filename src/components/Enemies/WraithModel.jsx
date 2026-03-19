import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

// Model Wraith - melayang, semi-transparan, ghostly
export function WraithModel({ state }) {
  const groupRef = useRef()
  const isAttacking = state === 'ATTACK'

  useFrame((s) => {
    const t = s.clock.getElapsedTime()
    if (groupRef.current) {
      // Melayang naik turun
      groupRef.current.position.y = Math.sin(t * 2.2) * 0.18 + 0.4
      // Rotasi perlahan seperti hantu
      groupRef.current.rotation.y = t * 0.5
    }
  })

  return (
    <group ref={groupRef}>
      {/* Jubah mengembang */}
      <mesh castShadow>
        <coneGeometry args={[0.55, 1.4, 8]} />
        <meshStandardMaterial
          color="#6633aa"
          emissive="#4411aa"
          emissiveIntensity={0.6}
          transparent
          opacity={0.75}
          roughness={0.3}
        />
      </mesh>

      {/* Kepala hantu */}
      <mesh position={[0, 0.9, 0]} castShadow>
        <sphereGeometry args={[0.3, 10, 8]} />
        <meshStandardMaterial
          color="#aa88dd"
          emissive="#8844cc"
          emissiveIntensity={0.7}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Mata kosong */}
      {[-0.1, 0.1].map((x, i) => (
        <mesh key={i} position={[x, 0.95, 0.26]} castShadow>
          <sphereGeometry args={[0.07, 6, 6]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={isAttacking ? 5 : 2}
            transparent opacity={0.9}
          />
        </mesh>
      ))}

      {/* Tangan hantu */}
      {[-0.5, 0.5].map((x, i) => (
        <mesh key={i} position={[x, 0.4, 0.2]} rotation={[-0.5, 0, x < 0 ? 0.3 : -0.3]} castShadow>
          <capsuleGeometry args={[0.06, 0.5, 6, 6]} />
          <meshStandardMaterial
            color="#aa88dd" emissive="#6633aa" emissiveIntensity={0.5}
            transparent opacity={0.7}
          />
        </mesh>
      ))}

      {/* Aura cincin */}
      <mesh position={[0, -0.55, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.5, 0.06, 8, 20]} />
        <meshStandardMaterial
          color="#aa44ff" emissive="#8800ff"
          emissiveIntensity={isAttacking ? 3 : 1}
          transparent opacity={0.6}
        />
      </mesh>
    </group>
  )
}
