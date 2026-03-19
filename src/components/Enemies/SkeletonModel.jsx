// Model musuh skeleton yang lebih detail
export function SkeletonModel({ state }) {
  const isAttacking = state === 'ATTACK'
  const isChasing = state === 'CHASE'
  return (
    <group>
      {/* Legs */}
      <mesh position={[0.12, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.6, 6]} />
        <meshStandardMaterial color="#ddd8c4" roughness={0.8} />
      </mesh>
      <mesh position={[-0.12, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.6, 6]} />
        <meshStandardMaterial color="#ddd8c4" roughness={0.8} />
      </mesh>
      {/* Pelvis */}
      <mesh position={[0, 0.62, 0]} castShadow>
        <boxGeometry args={[0.42, 0.14, 0.28]} />
        <meshStandardMaterial color="#ccc8b0" roughness={0.9} />
      </mesh>

      {/* Ribcage / Spine */}
      <mesh position={[0, 0.96, 0]} castShadow>
        <boxGeometry args={[0.5, 0.52, 0.32]} />
        <meshStandardMaterial color="#ddd8c4" roughness={0.7} wireframe={false} />
      </mesh>
      {[0.25, 0.1, -0.05, -0.2].map((y, i) => (
        <mesh key={i} position={[0, 0.96 + y, 0.15]} rotation={[0.1 * i, 0, 0]} castShadow>
          <boxGeometry args={[0.45, 0.04, 0.04]} />
          <meshStandardMaterial color="#e0dcc8" roughness={0.9} />
        </mesh>
      ))}

      {/* Skull */}
      <mesh position={[0, 1.6, 0]} castShadow>
        <sphereGeometry args={[0.22, 8, 6]} />
        <meshStandardMaterial color="#eae6d5" roughness={0.8} />
      </mesh>
      {/* Eye sockets */}
      <mesh position={[0.08, 1.62, 0.18]} castShadow>
        <sphereGeometry args={[0.06, 6, 6]} />
        <meshStandardMaterial color={isAttacking ? '#ff2200' : '#111'} emissive={isAttacking ? '#ff0000' : '#000'} emissiveIntensity={1} />
      </mesh>
      <mesh position={[-0.08, 1.62, 0.18]} castShadow>
        <sphereGeometry args={[0.06, 6, 6]} />
        <meshStandardMaterial color={isAttacking ? '#ff2200' : '#111'} emissive={isAttacking ? '#ff0000' : '#000'} emissiveIntensity={1} />
      </mesh>
      {/* Jaw */}
      <mesh position={[0, 1.42, 0.14]} castShadow>
        <boxGeometry args={[0.24, 0.08, 0.22]} />
        <meshStandardMaterial color="#ddd8c4" roughness={0.8} />
      </mesh>

      {/* Arms */}
      <mesh position={[0.38, 1.0, 0]} castShadow rotation={[0, 0, isAttacking ? -0.8 : 0.2]}>
        <cylinderGeometry args={[0.05, 0.05, 0.6, 6]} />
        <meshStandardMaterial color="#ddd8c4" roughness={0.8} />
      </mesh>
      <mesh position={[-0.38, 1.0, 0]} castShadow rotation={[0, 0, isAttacking ? 0.8 : -0.2]}>
        <cylinderGeometry args={[0.05, 0.05, 0.6, 6]} />
        <meshStandardMaterial color="#ddd8c4" roughness={0.8} />
      </mesh>

      {/* Rusty Sword */}
      <group position={[0.62, 0.9, 0.3]} rotation={[isAttacking ? -Math.PI / 3 : 0, 0, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.07, 1.1, 0.03]} />
          <meshStandardMaterial color="#7a6a5a" metalness={0.5} roughness={0.7} />
        </mesh>
        {/* Blood stain */}
        <mesh position={[0, 0.3, 0]} castShadow>
          <boxGeometry args={[0.09, 0.4, 0.04]} />
          <meshStandardMaterial color="#5a1111" roughness={0.8} transparent opacity={0.6} />
        </mesh>
      </group>
    </group>
  )
}
