import { useRef, useState, useEffect } from 'react'
import { RigidBody, CuboidCollider }   from '@react-three/rapier'
import { Html } from '@react-three/drei'
import { useGameStore } from '../../store/useGameStore'
import { useLanguageStore } from '../../store/useLanguageStore'

// Model NPC - pedagang dengan jubah
function MerchantModel({ color = '#5a3a8a' }) {
  return (
    <group>
      <mesh position={[0, 0.7, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.45, 1.4, 8]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.6, 0]} castShadow>
        <sphereGeometry args={[0.26, 8, 8]} />
        <meshStandardMaterial color="#d2b48c" roughness={0.7} />
      </mesh>
      {/* Topi sandang */}
      <mesh position={[0, 1.85, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.35, 0.15, 8]} />
        <meshStandardMaterial color="#222" />
      </mesh>
    </group>
  )
}

export function NPC({ position, color, name, dialogs }) {
  const [canTalk, setCanTalk] = useState(false)
  const setActiveDialog = useGameStore(s => s.setActiveDialog)
  const activeDialog   = useGameStore(s => s.activeDialog)
  const t = useLanguageStore(s => s.t)

  useEffect(() => {
    const onKey = (e) => {
      if (canTalk && e.key.toLowerCase() === 'e') {
        setActiveDialog({ name, dialogs, color })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [canTalk, name, dialogs, color, setActiveDialog])

  return (
    <group position={position}>
      <RigidBody type="fixed" colliders={false} name="npc">
        <CuboidCollider args={[0.5, 1, 0.5]} position={[0, 1, 0]} />
      </RigidBody>

      <MerchantModel color={color} />

      <CuboidCollider
        args={[2.5, 2, 2.5]} position={[0, 1, 0]} sensor
        onIntersectionEnter={(e) => {
          if (e.other.rigidBodyObject?.name === 'player') setCanTalk(true)
        }}
        onIntersectionExit={(e) => {
          if (e.other.rigidBodyObject?.name === 'player') { 
            setCanTalk(false)
            if (activeDialog?.name === name) setActiveDialog(null)
          }
        }}
      />

      {canTalk && !activeDialog && (
        <Html center position={[0, 2.8, 0]}>
          <div style={{
            color: '#e8d0a0', background: 'rgba(0,0,0,0.7)',
            padding: '6px 14px', borderRadius: 4, fontFamily: 'Georgia, serif',
            border: '1px solid rgba(232,208,160,0.5)', whiteSpace: 'nowrap',
            pointerEvents: 'none', fontSize: 13,
          }}>
            [E] {t('talk')} {name}
          </div>
        </Html>
      )}
    </group>
  )
}
