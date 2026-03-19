import { useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { RigidBody, CapsuleCollider, CuboidCollider } from '@react-three/rapier'
import * as THREE from 'three'
import { Html } from '@react-three/drei'
import { usePlayerStore } from '../../store/usePlayerStore'
import { useGameStore } from '../../store/useGameStore'

const BOSS_MAX_HP = 1500

// Model Guardian Boss yang besar dan mengancam
function GuardianModel({ phase, aiState }) {
  const enraged = phase === 2
  const body  = enraged ? '#2a0000' : '#1a1a2e'
  const accent= enraged ? '#ff3300' : '#3366ff'
  const isAtk = aiState === 'ATTACK'

  return (
    <group scale={[1.7, 1.7, 1.7]}>
      {/* Kaki */}
      {[-0.28, 0.28].map((x, i) => (
        <group key={i}>
          <mesh position={[x, 0.5, 0]} castShadow>
            <boxGeometry args={[0.3, 1.0, 0.35]} />
            <meshStandardMaterial color={body} metalness={0.7} roughness={0.3} />
          </mesh>
          {/* Saboton */}
          <mesh position={[x, 0.07, 0.1]} castShadow>
            <boxGeometry args={[0.32, 0.1, 0.4]} />
            <meshStandardMaterial color={accent} metalness={0.9} roughness={0.1} />
          </mesh>
        </group>
      ))}

      {/* Torso besar */}
      <mesh position={[0, 1.22, 0]} castShadow>
        <boxGeometry args={[1.0, 0.95, 0.65]} />
        <meshStandardMaterial color={body} metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Plat dada bercahaya */}
      <mesh position={[0, 1.26, 0.34]} castShadow>
        <boxGeometry args={[0.75, 0.62, 0.1]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={enraged ? 0.8 : 0.3} metalness={0.95} roughness={0.05} />
      </mesh>

      {/* Kepala */}
      <mesh position={[0, 1.9, 0]} castShadow>
        <boxGeometry args={[0.6, 0.56, 0.55]} />
        <meshStandardMaterial color={body} metalness={0.9} roughness={0.15} />
      </mesh>
      {/* Mata merah */}
      {[-0.14, 0.14].map((x, i) => (
        <mesh key={i} position={[x, 1.96, 0.29]} castShadow>
          <boxGeometry args={[0.11, 0.08, 0.06]} />
          <meshStandardMaterial
            color="#ff0000" emissive="#ff0000"
            emissiveIntensity={isAtk ? 4 : 1.4}
          />
        </mesh>
      ))}
      {/* Tanduk */}
      {[-0.2, 0.2].map((x, i) => (
        <mesh key={i} position={[x, 2.24, 0]} rotation={[0, 0, x < 0 ? 0.35 : -0.35]} castShadow>
          <coneGeometry args={[0.08, 0.48, 6]} />
          <meshStandardMaterial color={accent} metalness={0.95} />
        </mesh>
      ))}

      {/* Lengan kiri - Great Hammer */}
      <group position={[0.78, 1.2, 0]} rotation={[0, 0, -0.45]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.09, 0.09, 0.8, 8]} />
          <meshStandardMaterial color={body} metalness={0.7} />
        </mesh>
        <mesh position={[0, 0.56, 0]} castShadow>
          <boxGeometry args={[0.32, 0.48, 0.32]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.4} metalness={0.9} />
        </mesh>
      </group>

      {/* Lengan kanan - Great Shield */}
      <group position={[-0.78, 1.2, 0]} rotation={[0, 0, 0.35]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.09, 0.09, 0.7, 8]} />
          <meshStandardMaterial color={body} metalness={0.7} />
        </mesh>
        <mesh position={[-0.12, 0.32, 0.18]} castShadow>
          <boxGeometry args={[0.12, 0.8, 0.6]} />
          <meshStandardMaterial color={enraged ? '#550000' : '#223355'} metalness={0.85} roughness={0.15} />
        </mesh>
      </group>

      {/* Phase 2: aura api tambahan */}
      {enraged && (
        <>
          <mesh position={[0, 1.2, 0]} castShadow>
            <torusGeometry args={[0.8, 0.12, 8, 24]} />
            <meshStandardMaterial color="#ff4400" emissive="#ff2200" emissiveIntensity={2} transparent opacity={0.7} />
          </mesh>
          <mesh position={[0, 1.9, 0]} castShadow>
            <octahedronGeometry args={[0.3, 0]} />
            <meshStandardMaterial color="#ff6600" emissive="#ff4400" emissiveIntensity={3} transparent opacity={0.5} />
          </mesh>
        </>
      )}
    </group>
  )
}

export function BossAI({ position = [0, 3, -163] }) {
  const rbRef    = useRef()
  const groupRef = useRef()
  const { scene }= useThree()

  const [phase,   setPhase]   = useState(1)
  const [hp,      setHp]      = useState(BOSS_MAX_HP)
  const [aiState, setAiState] = useState('IDLE')
  const [dead,    setDead]    = useState(false)

  const takeDamage    = usePlayerStore(s => s.takeDamage)
  const addSouls      = useGameStore(s => s.addSouls)
  const setBossDefeated= useGameStore(s => s.setBossDefeated)
  const playerDmg     = usePlayerStore(s => s.damage)
  const playerHP      = usePlayerStore(s => s.health)

  const atkTimer    = useRef(0)
  const hitCooldown = useRef(0)

  // JANGAN taruh return sebelum useFrame — pelanggaran Rules of Hooks!
  useFrame((_, delta) => {
    if (dead || !rbRef.current || window.__gamePaused) return
    hitCooldown.current = Math.max(0, hitCooldown.current - delta)

    const bp  = rbRef.current.translation()
    const bVec= new THREE.Vector3(bp.x, bp.y, bp.z)

    const playerObj = scene.getObjectByName('player')
    if (!playerObj || playerHP <= 0) {
      rbRef.current.setLinvel({ x:0, y: rbRef.current.linvel().y, z:0 }, true)
      return
    }
    const pPos = new THREE.Vector3()
    playerObj.getWorldPosition(pPos)
    const dist = bVec.distanceTo(pPos)

    const rbv = rbRef.current.linvel()
    const tv  = new THREE.Vector3(0, rbv.y, 0)

    // Phase 2 trigger
    if (hp < BOSS_MAX_HP * 0.5 && phase === 1) {
      setPhase(2)
    }

    const spd      = phase === 2 ? 5.0 : 3.2
    const atkRange = phase === 2 ? 6.5 : 5.0
    const atkSpd   = phase === 2 ? 0.65 : 1.0

    if (aiState === 'IDLE' && dist < 55) setAiState('CHASE')

    if (aiState === 'CHASE') {
      const dir = new THREE.Vector3().subVectors(pPos, bVec).setY(0).normalize()
      if (dist < atkRange) {
        setAiState('ATTACK'); atkTimer.current = 0
      } else {
        tv.x = dir.x * spd
        tv.z = dir.z * spd
      }
      if (groupRef.current) {
        const angle = Math.atan2(dir.x, dir.z)
        groupRef.current.quaternion.slerp(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0), angle), delta * 5)
      }
    }

    if (aiState === 'ATTACK') {
      atkTimer.current += delta
      const dir = new THREE.Vector3().subVectors(pPos, bVec).setY(0).normalize()
      if (groupRef.current) {
        const angle = Math.atan2(dir.x, dir.z)
        groupRef.current.quaternion.slerp(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0), angle), delta * 6)
      }
      if (atkTimer.current >= atkSpd) {
        if (dist < atkRange + 1) {
          const dmg = phase === 2 ? 30 : 20
          takeDamage(dmg)
        }
        atkTimer.current = 0
        if (dist > atkRange + 1.5) setAiState('CHASE')
      }
    }

    rbRef.current.setLinvel(new THREE.Vector3(
      THREE.MathUtils.lerp(rbv.x, tv.x, delta * 5),
      rbv.y,
      THREE.MathUtils.lerp(rbv.z, tv.z, delta * 5)
    ), true)
  })

  const hpPct = hp / BOSS_MAX_HP

  return (
    <RigidBody ref={rbRef} position={position} colliders={false} enabledRotations={[false,false,false]} name="boss">
      <CapsuleCollider args={[1.1, 0.95]} position={[0, 2.5, 0]} />

      {/* Sensor damage dari player — cek currentAttack di store */}
      <CuboidCollider
        args={[2.8, 3.2, 2.8]} position={[0, 2.2, 0]} sensor
        onIntersectionEnter={(e) => {
          if (dead) return
          if (e.other.rigidBodyObject?.name !== 'player') return
          if (hitCooldown.current > 0) return
          const attacking = usePlayerStore.getState().currentAttack !== null
          if (attacking) {
            hitCooldown.current = 0.45
            const dmg = usePlayerStore.getState().damage
            setHp(h => {
              const nh = h - dmg
              if (nh <= 0) { addSouls(1500); setBossDefeated(true); setDead(true) }
              return Math.max(0, nh)
            })
          }
        }}
        onIntersectionStay={(e) => {
          if (dead) return
          if (e.other.rigidBodyObject?.name !== 'player') return
          if (hitCooldown.current > 0) return
          const attacking = usePlayerStore.getState().currentAttack !== null
          if (attacking) {
            hitCooldown.current = 0.45
            const dmg = usePlayerStore.getState().damage
            setHp(h => {
              const nh = h - dmg
              if (nh <= 0) { addSouls(1500); setBossDefeated(true); setDead(true) }
              return Math.max(0, nh)
            })
          }
        }}
      />

      {/* JSX null SETELAH semua hooks dipanggil */}
      {dead && null}

      <group ref={groupRef}>
        <GuardianModel phase={phase} aiState={aiState} />
      </group>

      {/* Boss HP Bar di HTML */}
      {aiState !== 'IDLE' && hp > 0 && (
        <Html center position={[0, 9, 0]}>
          <div style={{
            position:'fixed', bottom:'-38vh', left:'50%', transform:'translateX(-50%)',
            width:'55vw', pointerEvents:'none', fontFamily:'Georgia, serif'
          }}>
            <div style={{ color:'#e8d0a0', textAlign:'center', fontSize:14, letterSpacing:'0.2em', marginBottom:5, textShadow:'1px 1px 3px #000' }}>
              {phase === 2 ? '⚡ INFERNO GUARDIAN ⚡' : '☠ Stone Guardian'}
            </div>
            <div style={{ position:'relative', width:'100%', height:12, background:'rgba(0,0,0,0.7)', border:'2px solid rgba(255,200,100,0.5)', borderRadius:2 }}>
              <div style={{
                width:`${hpPct * 100}%`, height:'100%',
                background: phase === 2
                  ? 'linear-gradient(90deg,#aa1100,#ff4400)'
                  : 'linear-gradient(90deg,#6600aa,#4488ff)',
                transition:'width 0.2s', borderRadius:1
              }} />
              {/* Phase marker */}
              <div style={{ position:'absolute', left:'50%', top:0, width:2, height:'100%', background:'rgba(255,255,200,0.5)' }} />
            </div>
          </div>
        </Html>
      )}
    </RigidBody>
  )
}
