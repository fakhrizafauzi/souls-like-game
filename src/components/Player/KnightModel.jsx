import * as THREE from 'three'

export function KnightModel({ isDodging, isCrouching, isParrying, attackAnim, weaponGroupRef, swordRef }) {
  const armour = isDodging ? '#3a4255' : '#5a6472'
  const metal  = '#8c9198'
  const glow   = attackAnim === 'heavy' ? '#ff6622' : '#88ccff'
  const emissiveI = attackAnim ? 1.8 : 0

  return (
    <group>
      {/* === KAKI === */}
      <mesh position={[0.18, 0.35, 0]} castShadow>
        <boxGeometry args={[0.22, 0.7, 0.22]} />
        <meshStandardMaterial color={armour} metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[-0.18, 0.35, 0]} castShadow>
        <boxGeometry args={[0.22, 0.7, 0.22]} />
        <meshStandardMaterial color={armour} metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Pelindung lutut */}
      <mesh position={[0.18, 0.36, 0.13]} castShadow>
        <boxGeometry args={[0.2, 0.18, 0.08]} />
        <meshStandardMaterial color={metal} metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[-0.18, 0.36, 0.13]} castShadow>
        <boxGeometry args={[0.2, 0.18, 0.08]} />
        <meshStandardMaterial color={metal} metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Sepatu */}
      <mesh position={[0.18, 0.04, 0.06]} castShadow>
        <boxGeometry args={[0.24, 0.08, 0.32]} />
        <meshStandardMaterial color="#333" metalness={0.7} />
      </mesh>
      <mesh position={[-0.18, 0.04, 0.06]} castShadow>
        <boxGeometry args={[0.24, 0.08, 0.32]} />
        <meshStandardMaterial color="#333" metalness={0.7} />
      </mesh>

      {/* === TORSO === */}
      <mesh position={[0, 0.95, 0]} castShadow>
        <boxGeometry args={[0.72, 0.8, 0.4]} />
        <meshStandardMaterial color={armour} metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Breast plate */}
      <mesh position={[0, 1.0, 0.21]} castShadow>
        <boxGeometry args={[0.56, 0.56, 0.08]} />
        <meshStandardMaterial color={metal} metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Sabuk */}
      <mesh position={[0, 0.64, 0]} castShadow>
        <boxGeometry args={[0.74, 0.09, 0.42]} />
        <meshStandardMaterial color="#3a2a1a" roughness={0.9} />
      </mesh>

      {/* === KEPALA / HELM === */}
      <mesh position={[0, 1.61, 0]} castShadow>
        <boxGeometry args={[0.42, 0.44, 0.4]} />
        <meshStandardMaterial color={metal} metalness={0.85} roughness={0.25} />
      </mesh>
      {/* Visor bercahaya */}
      <mesh position={[0, 1.60, 0.21]} castShadow>
        <boxGeometry args={[0.28, 0.07, 0.04]} />
        <meshStandardMaterial
          color={isParrying ? '#00ffff' : '#ff4400'}
          emissive={isParrying ? '#00ffff' : '#ff2200'}
          emissiveIntensity={isParrying ? 3 : 1.5}
        />
      </mesh>
      {/* Crest helm */}
      <mesh position={[0, 1.88, 0]} castShadow>
        <boxGeometry args={[0.08, 0.13, 0.36]} />
        <meshStandardMaterial color="#cc1111" roughness={0.8} />
      </mesh>
      {/* Gorget */}
      <mesh position={[0, 1.32, 0]} castShadow>
        <boxGeometry args={[0.38, 0.12, 0.36]} />
        <meshStandardMaterial color={metal} metalness={0.8} roughness={0.3} />
      </mesh>

      {/* === PAULDRON === */}
      <mesh position={[0.44, 1.38, 0]} castShadow rotation={[0, 0, -0.3]}>
        <sphereGeometry args={[0.22, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={metal} metalness={0.85} roughness={0.2} />
      </mesh>
      <mesh position={[-0.44, 1.38, 0]} castShadow rotation={[0, 0, 0.3]}>
        <sphereGeometry args={[0.22, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={metal} metalness={0.85} roughness={0.2} />
      </mesh>

      {/* === LENGAN KIRI + TAMENG === */}
      <mesh position={[-0.5, 1.0, 0]} castShadow>
        <boxGeometry args={[0.14, 0.42, 0.18]} />
        <meshStandardMaterial color={armour} metalness={0.6} />
      </mesh>
      <mesh position={[-0.62, 1.0, 0.24]} rotation={[0, 0.3, 0]} castShadow>
        <boxGeometry args={[0.08, 0.68, 0.48]} />
        <meshStandardMaterial
          color={isParrying ? '#003366' : '#4a3a2a'}
          emissive={isParrying ? '#0055aa' : '#000'}
          emissiveIntensity={isParrying ? 1 : 0}
          roughness={0.6}
        />
      </mesh>
      <mesh position={[-0.62, 1.0, 0.24]} rotation={[0, 0.3, 0]} castShadow>
        <torusGeometry args={[0.22, 0.04, 8, 12]} />
        <meshStandardMaterial color={metal} metalness={0.8} />
      </mesh>

      {/* === LENGAN KANAN + PEDANG === */}
      <mesh position={[0.5, 1.0, 0]} castShadow>
        <boxGeometry args={[0.14, 0.42, 0.18]} />
        <meshStandardMaterial color={armour} metalness={0.6} />
      </mesh>
      <group position={[0.45, 1.1, 0]} ref={weaponGroupRef}>
        {/* Upper arm */}
        <mesh position={[0.1, 0, 0]} castShadow>
          <boxGeometry args={[0.13, 0.38, 0.16]} />
          <meshStandardMaterial color={armour} metalness={0.6} />
        </mesh>
        {/* Grip */}
        <group position={[0.1, 0.55, 0.35]}>
          {/* Bilah */}
          <mesh ref={swordRef} castShadow>
            <boxGeometry args={[0.07, 1.5, 0.02]} />
            <meshStandardMaterial color="#ddeeff" metalness={1} roughness={0.05} />
          </mesh>
          {/* Glow saat serangan */}
          {attackAnim && (
            <mesh>
              <boxGeometry args={[0.14, 1.52, 0.1]} />
              <meshStandardMaterial
                color={glow} emissive={glow} emissiveIntensity={emissiveI}
                transparent opacity={0.35}
              />
            </mesh>
          )}
          {/* Crossguard */}
          <mesh position={[0, -0.77, 0]} castShadow>
            <boxGeometry args={[0.42, 0.08, 0.1]} />
            <meshStandardMaterial color="#b8860b" metalness={0.9} roughness={0.1} />
          </mesh>
          {/* Grip handle */}
          <mesh position={[0, -0.97, 0]} castShadow>
            <boxGeometry args={[0.07, 0.3, 0.09]} />
            <meshStandardMaterial color="#3a2a1a" roughness={0.9} />
          </mesh>
        </group>
      </group>
    </group>
  )
}
