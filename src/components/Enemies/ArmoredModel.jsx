// Model Armored Knight musuh - besar, berat, mirip player tapi lebih seram
export function ArmoredModel({ state }) {
  const isAttacking = state === 'ATTACK'
  const body  = '#222830'
  const metal = '#556070'
  const red   = isAttacking ? '#ff2200' : '#aa1100'

  return (
    <group>
      {/* Kaki */}
      {[-0.22, 0.22].map((x, i) => (
        <group key={i}>
          <mesh position={[x, 0.38, 0]} castShadow>
            <boxGeometry args={[0.26, 0.75, 0.28]} />
            <meshStandardMaterial color={body} metalness={0.8} roughness={0.25} />
          </mesh>
          <mesh position={[x, 0.07, 0.08]} castShadow>
            <boxGeometry args={[0.28, 0.1, 0.36]} />
            <meshStandardMaterial color={metal} metalness={0.9} />
          </mesh>
        </group>
      ))}

      {/* Torso lebar */}
      <mesh position={[0, 1.0, 0]} castShadow>
        <boxGeometry args={[0.82, 0.88, 0.46]} />
        <meshStandardMaterial color={body} metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Plat dada merah */}
      <mesh position={[0, 1.04, 0.24]} castShadow>
        <boxGeometry args={[0.64, 0.6, 0.1]} />
        <meshStandardMaterial color={red} emissive={red} emissiveIntensity={0.3} metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Bahu besar */}
      {[-0.52, 0.52].map((x, i) => (
        <mesh key={i} position={[x, 1.38, 0]} castShadow rotation={[0,0, x<0 ? 0.35 : -0.35]}>
          <boxGeometry args={[0.28, 0.28, 0.28]} />
          <meshStandardMaterial color={metal} metalness={0.9} roughness={0.15} />
        </mesh>
      ))}

      {/* Helm penuh */}
      <mesh position={[0, 1.65, 0]} castShadow>
        <boxGeometry args={[0.46, 0.5, 0.44]} />
        <meshStandardMaterial color={body} metalness={0.9} roughness={0.15} />
      </mesh>
      {/* Lubang mata merah */}
      {[-0.12, 0.12].map((x, i) => (
        <mesh key={i} position={[x, 1.67, 0.23]} castShadow>
          <boxGeometry args={[0.09, 0.06, 0.06]} />
          <meshStandardMaterial color={red} emissive={red} emissiveIntensity={isAttacking ? 4 : 1.5} />
        </mesh>
      ))}

      {/* Two-handed great sword */}
      <group position={[0.55, 1.1, 0.4]} rotation={[isAttacking ? -0.8 : 0.2, 0.3, 0]}>
        {/* Bilah besar */}
        <mesh castShadow>
          <boxGeometry args={[0.14, 2.0, 0.04]} />
          <meshStandardMaterial color={metal} metalness={0.95} roughness={0.05} />
        </mesh>
        {/* Crossguard besar */}
        <mesh position={[0, -1.05, 0]} castShadow>
          <boxGeometry args={[0.55, 0.1, 0.14]} />
          <meshStandardMaterial color={body} metalness={0.9} />
        </mesh>
        {/* Grip */}
        <mesh position={[-0.12, -1.3, 0]} castShadow>
          <boxGeometry args={[0.1, 0.42, 0.12]} />
          <meshStandardMaterial color="#221a10" roughness={0.9} />
        </mesh>
        <mesh position={[0.12, -1.3, 0]} castShadow>
          <boxGeometry args={[0.1, 0.42, 0.12]} />
          <meshStandardMaterial color="#221a10" roughness={0.9} />
        </mesh>
      </group>
    </group>
  )
}
