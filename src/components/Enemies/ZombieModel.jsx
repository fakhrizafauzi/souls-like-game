// Model Zombie - gempal, bungkuk, lebih lambat
export function ZombieModel({ state }) {
  const isAttacking = state === 'ATTACK'
  return (
    <group>
      {/* Kaki pendek gempal */}
      {[-0.2, 0.2].map((x, i) => (
        <mesh key={i} position={[x, 0.3, 0]} castShadow>
          <boxGeometry args={[0.28, 0.6, 0.3]} />
          <meshStandardMaterial color="#4a5c3a" roughness={0.9} />
        </mesh>
      ))}

      {/* Torso bungkuk besar */}
      <mesh position={[0, 0.95, 0]} rotation={[0.3, 0, 0]} castShadow>
        <boxGeometry args={[0.7, 0.85, 0.5]} />
        <meshStandardMaterial color="#4a5c3a" roughness={1} />
      </mesh>
      {/* Perut buncit */}
      <mesh position={[0, 0.82, 0.18]} castShadow>
        <sphereGeometry args={[0.32, 8, 6]} />
        <meshStandardMaterial color="#3a4c2a" roughness={1} />
      </mesh>

      {/* Kepala besar */}
      <mesh position={[0, 1.55, 0.1]} castShadow>
        <boxGeometry args={[0.52, 0.5, 0.46]} />
        <meshStandardMaterial color="#4a5c3a" roughness={0.9} />
      </mesh>
      {/* Mata kuning */}
      {[-0.12, 0.12].map((x, i) => (
        <mesh key={i} position={[x, 1.6, 0.24]} castShadow>
          <sphereGeometry args={[0.07, 6, 6]} />
          <meshStandardMaterial color="#cccc00" emissive="#aaaa00" emissiveIntensity={isAttacking ? 2 : 0.5} />
        </mesh>
      ))}
      {/* Mulut menganga */}
      <mesh position={[0, 1.46, 0.24]} castShadow>
        <boxGeometry args={[0.22, 0.07, 0.08]} />
        <meshStandardMaterial color="#111" />
      </mesh>

      {/* Lengan panjang menjuntai */}
      <mesh position={[0.5, 0.95, 0.15]} rotation={[isAttacking ? -0.9 : 0.5, 0, -0.4]} castShadow>
        <boxGeometry args={[0.18, 0.7, 0.18]} />
        <meshStandardMaterial color="#4a5c3a" roughness={0.9} />
      </mesh>
      <mesh position={[-0.5, 0.95, 0.15]} rotation={[isAttacking ? -0.9 : 0.5, 0, 0.4]} castShadow>
        <boxGeometry args={[0.18, 0.7, 0.18]} />
        <meshStandardMaterial color="#4a5c3a" roughness={0.9} />
      </mesh>

      {/* Cakar */}
      {[0.5, -0.5].map((x, i) => (
        <group key={i} position={[x, 0.7, 0.45]}>
          {[-0.06, 0, 0.06].map((cx, j) => (
            <mesh key={j} position={[cx, 0, 0]} rotation={[-0.4, 0, 0]} castShadow>
              <coneGeometry args={[0.03, 0.18, 4]} />
              <meshStandardMaterial color="#2a3a1a" roughness={0.8} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}
