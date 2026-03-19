import { useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { RigidBody, CapsuleCollider, CuboidCollider } from '@react-three/rapier'
import * as THREE from 'three'
import { Html } from '@react-three/drei'
import { usePlayerStore } from '../../store/usePlayerStore'
import { useGameStore }   from '../../store/useGameStore'

const TITAN_MAX_HP = 4500

// ——— MODEL: Ashen Titan ———
function TitanModel({ phase, aiState }) {
  const bodyRef = useRef()
  const isAtk = aiState === 'ATTACK' || aiState === 'SLAM' || aiState === 'SWEEP'
  const sc = 1 + phase * 0.15                     // lebih besar tiap fase
  const body   = ['#1a0820', '#260a10', '#3a1008'][phase - 1] || '#1a0820'
  const accent = ['#4400aa', '#cc2200', '#ff6600'][phase - 1] || '#4400aa'
  const eI     = [0.4, 1.2, 2.5][phase - 1] || 0.4

  useFrame((s) => {
    const t = s.clock.getElapsedTime()
    if (bodyRef.current && phase >= 3) {
      bodyRef.current.rotation.y = t * 0.5
    }
  })

  return (
    <group scale={[sc, sc, sc]} ref={bodyRef}>
      {/* KAKI BESAR */}
      {[-0.5, 0.5].map((x, i) => (
        <group key={i}>
          <mesh position={[x, 0.8, 0]} castShadow>
            <boxGeometry args={[0.55, 1.6, 0.6]} />
            <meshStandardMaterial color={body} metalness={0.8} roughness={0.25} />
          </mesh>
          <mesh position={[x, 0.08, 0.2]} castShadow>
            <boxGeometry args={[0.65, 0.15, 0.72]} />
            <meshStandardMaterial color={accent} metalness={0.9} roughness={0.1} />
          </mesh>
        </group>
      ))}

      {/* TORSO MASIF */}
      <mesh position={[0, 2.1, 0]} castShadow>
        <boxGeometry args={[1.7, 1.6, 1.0]} />
        <meshStandardMaterial color={body} metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Plat inti */}
      <mesh position={[0, 2.2, 0.52]} castShadow>
        <boxGeometry args={[1.2, 1.0, 0.16]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={eI} metalness={0.95} roughness={0.05} />
      </mesh>
      {/* Bahu */}
      {[-0.95, 0.95].map((x, i) => (
        <mesh key={i} position={[x, 2.72, 0]} castShadow>
          <boxGeometry args={[0.44, 0.44, 0.48]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={eI * 0.5} metalness={0.9} />
        </mesh>
      ))}

      {/* KEPALA BESAR */}
      <mesh position={[0, 3.4, 0]} castShadow>
        <boxGeometry args={[1.0, 0.9, 0.85]} />
        <meshStandardMaterial color={body} metalness={0.9} roughness={0.15} />
      </mesh>
      {/* Mahkota tanduk */}
      {[-0.38, -0.15, 0.15, 0.38].map((x, i) => (
        <mesh key={i} pos={[x, 4.1, 0]} position={[x, 4.1, 0]} castShadow rotation={[0, 0, x * -0.8]}>
          <coneGeometry args={[0.1, 0.65, 5]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={eI} />
        </mesh>
      ))}
      {/* Mata */}
      {[-0.22, 0.22].map((x, i) => (
        <mesh key={i} position={[x, 3.5, 0.44]} castShadow>
          <sphereGeometry args={[0.12, 8, 6]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={isAtk ? 6 : eI + 1} />
        </mesh>
      ))}

      {/* LENGAN KANAN: Great Maul */}
      <group position={[1.1, 2.0, 0]} rotation={[0, 0, -0.6]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.18, 0.18, 1.4, 8]} />
          <meshStandardMaterial color={body} metalness={0.7} />
        </mesh>
        <mesh position={[0, 1.0, 0]} castShadow>
          <boxGeometry args={[0.7, 1.0, 0.7]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={eI * 0.6} metalness={0.9} />
        </mesh>
        {/* Spike maul */}
        {[[-0.3,0.3,0.3],[0.3,0.3,0],[0,0.3,-0.3]].map(([sx,sy,sz],j) => (
          <mesh key={j} position={[sx, 1.5+sy, sz]} castShadow>
            <coneGeometry args={[0.12, 0.5, 5]} />
            <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={eI} />
          </mesh>
        ))}
      </group>

      {/* LENGAN KIRI: Great Shield Bash */}
      <group position={[-1.1, 2.0, 0]} rotation={[0, 0, 0.5]}>
        <mesh castShadow>
          <boxGeometry args={[0.3, 1.3, 0.35]} />
          <meshStandardMaterial color={body} metalness={0.7} />
        </mesh>
        <mesh position={[-0.22, 0.55, 0.35]} rotation={[0, 0.2, 0]} castShadow>
          <boxGeometry args={[0.2, 1.5, 1.0]} />
          <meshStandardMaterial color={phase >= 2 ? '#440000' : '#112244'} metalness={0.9} roughness={0.1} />
        </mesh>
      </group>

      {/* Phase 2+: aura api */}
      {phase >= 2 && (
        <>
          <mesh position={[0, 2.0, 0]}>
            <torusGeometry args={[1.2, 0.18, 8, 28]} />
            <meshStandardMaterial color="#ff3300" emissive="#ff1100" emissiveIntensity={2.5} transparent opacity={0.6} />
          </mesh>
          <pointLight color="#ff4400" intensity={3} distance={18} position={[0, 2.5, 0]} />
        </>
      )}
      {/* Phase 3: energi kristal */}
      {phase >= 3 && (
        <>
          {[0,1,2,3,4].map(i => {
            const a = (i / 5) * Math.PI * 2
            return (
              <mesh key={i} position={[Math.cos(a)*1.6, 2.2 + Math.sin(a*2)*0.3, Math.sin(a)*1.6]}>
                <octahedronGeometry args={[0.25, 0]} />
                <meshStandardMaterial color="#ff8800" emissive="#ff4400" emissiveIntensity={4} transparent opacity={0.8} />
              </mesh>
            )
          })}
          <pointLight color="#ff8800" intensity={5} distance={30} position={[0, 3, 0]} />
        </>
      )}
    </group>
  )
}

export function EpicBossAI({ position = [0, 3, -531] }) {
  const rbRef    = useRef()
  const groupRef = useRef()
  const { scene } = useThree()

  const [phase,   setPhase]        = useState(1)
  const [hp,      setHp]           = useState(TITAN_MAX_HP)
  const [aiState, setAiState]      = useState('IDLE')
  const [bossActive, setBossActive]= useState(false)
  const [dead,    setDead]         = useState(false)

  const takeDamage     = usePlayerStore(s => s.takeDamage)
  const addSouls       = useGameStore(s => s.addSouls)
  const setBossDefeated= useGameStore(s => s.setBossDefeated)
  const playerHP       = usePlayerStore(s => s.health)

  const atkTimer    = useRef(0)
  const hitCooldown = useRef(0)
  const patternRef  = useRef('SLAM')  // SLAM | SWEEP | CHARGE | BARRAGE

  useFrame((_, delta) => {
    if (dead || !rbRef.current || window.__gamePaused) return
    hitCooldown.current = Math.max(0, hitCooldown.current - delta)

    const bp   = rbRef.current.translation()
    const bVec = new THREE.Vector3(bp.x, bp.y, bp.z)

    const playerObj = scene.getObjectByName('player')
    if (!playerObj || playerHP <= 0) { rbRef.current.setLinvel({x:0,y:rbRef.current.linvel().y,z:0},true); return }
    const pPos = new THREE.Vector3()
    playerObj.getWorldPosition(pPos)
    const dist = bVec.distanceTo(pPos)

    const rbv = rbRef.current.linvel()
    const tv  = new THREE.Vector3(0, rbv.y, 0)

    // Phase transitions
    const hpPct = hp / TITAN_MAX_HP
    if (hpPct < 0.66 && phase === 1) setPhase(2)
    if (hpPct < 0.33 && phase === 2) setPhase(3)

    // Stats per phase
    const spd      = [2.5, 3.8, 5.2][phase - 1]
    const atkRange = [9,   11,   13 ][phase - 1]
    const atkRate  = [1.4, 0.9, 0.55][phase - 1]
    const dmg      = [28,  42,   65 ][phase - 1]

    if (aiState === 'IDLE' && dist < 80) { setAiState('CHASE'); setBossActive(true) }

    if (aiState === 'CHASE') {
      const dir = new THREE.Vector3().subVectors(pPos, bVec).setY(0).normalize()
      if (dist < atkRange) { setAiState('ATTACK'); atkTimer.current = 0 }
      else { tv.x = dir.x * spd; tv.z = dir.z * spd }
      if (groupRef.current) {
        const angle = Math.atan2(dir.x, dir.z)
        groupRef.current.quaternion.slerp(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0), angle), delta * 4)
      }
    }

    if (aiState === 'ATTACK') {
      atkTimer.current += delta
      const dir = new THREE.Vector3().subVectors(pPos, bVec).setY(0).normalize()
      if (groupRef.current) {
        groupRef.current.quaternion.slerp(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0), Math.atan2(dir.x, dir.z)), delta * 5)
      }

      // Rotasi pattern attack tiap serangan
      if (atkTimer.current >= atkRate) {
        if (dist < atkRange + 2) {
          // Pola berbeda tiap serangan
          const patterns = ['SLAM', 'SWEEP', phase >= 2 ? 'CHARGE' : 'SLAM', phase >= 3 ? 'BARRAGE' : 'SWEEP']
          const pat = patterns[Math.floor(Math.random() * patterns.length)]
          patternRef.current = pat

          if (pat === 'SLAM')    takeDamage(dmg)
          if (pat === 'SWEEP')   takeDamage(dmg * 0.7)  // lower, hits wide
          if (pat === 'CHARGE')  { takeDamage(dmg * 1.3); if (dist < atkRange * 1.5) takeDamage(dmg * 0.5) }
          if (pat === 'BARRAGE') { for(let i=0;i<3;i++) setTimeout(()=>takeDamage(dmg * 0.4), i*200) }
        }
        atkTimer.current = 0
        if (dist > atkRange + 2) setAiState('CHASE')
      }
    }

    rbRef.current.setLinvel(new THREE.Vector3(
      THREE.MathUtils.lerp(rbv.x, tv.x, delta * 4),
      rbv.y,
      THREE.MathUtils.lerp(rbv.z, tv.z, delta * 4)
    ), true)
  })

  const handleHit = (e) => {
    if (dead) return
    if (e.other.rigidBodyObject?.name !== 'player') return
    if (hitCooldown.current > 0) return
    if (usePlayerStore.getState().currentAttack === null) return
    hitCooldown.current = 0.4
    const dmg = usePlayerStore.getState().damage
    setHp(h => {
      const nh = h - dmg
      if (nh <= 0) { addSouls(5000); setBossDefeated(true); setDead(true) }
      return Math.max(0, nh)
    })
  }

  const hpPct    = hp / TITAN_MAX_HP
  const phaseColors = ['#4400aa', '#cc2200', '#ff6600']

  return (
    <RigidBody ref={rbRef} position={position} colliders={false} enabledRotations={[false,false,false]} name="boss">
      <CapsuleCollider args={[2.2, 1.8]} position={[0, 4.5, 0]} />

      <CuboidCollider
        args={[5.5, 6.5, 5.5]} position={[0, 4.5, 0]} sensor
        onIntersectionEnter={handleHit}
        onIntersectionStay={handleHit}
      />

      {dead && null}

      <group ref={groupRef}>
        {!dead && <TitanModel phase={phase} aiState={aiState} />}
      </group>

      {/* Boss HP Bar di bawah layar */}
      {bossActive && hp > 0 && !dead && (
        <Html center position={[0, 16, 0]}>
          <div style={{
            position: 'fixed', bottom: '-40vh', left: '50%', transform: 'translateX(-50%)',
            width: '60vw', pointerEvents: 'none', fontFamily: 'Georgia, serif',
          }}>
            <div style={{ textAlign:'center', marginBottom: 6, color: '#e8d0a0', fontSize: 13, letterSpacing:'0.25em', textShadow:'0 0 12px #ff8800' }}>
              {['', '⚡ ASHEN TITAN ⚡', '🔥 ASHEN TITAN — INFERNO 🔥', '💀 ASHEN TITAN — BERSERK 💀'][phase]}
            </div>
            <div style={{ position:'relative', width:'100%', height:14, background:'rgba(0,0,0,0.75)', border:`2px solid ${phaseColors[phase-1]}55`, borderRadius:2 }}>
              <div style={{
                width:`${hpPct * 100}%`, height:'100%',
                background:`linear-gradient(90deg, ${phaseColors[phase-1]}88, ${phaseColors[phase-1]})`,
                transition:'width 0.2s', borderRadius:1
              }} />
              {/* Phase dividers */}
              {[0.33, 0.66].map((p, i) => (
                <div key={i} style={{ position:'absolute', left:`${p*100}%`, top:0, width:2, height:'100%', background:'rgba(255,255,200,0.4)' }} />
              ))}
            </div>
            <div style={{ display:'flex', justifyContent:'space-evenly', marginTop:4, color:'#6a6080', fontSize:10, letterSpacing:'0.1em' }}>
              <span>Phase I</span><span>Phase II</span><span>Phase III</span>
            </div>
          </div>
        </Html>
      )}
    </RigidBody>
  )
}
