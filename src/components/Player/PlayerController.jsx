import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody, CapsuleCollider, CuboidCollider } from '@react-three/rapier'
import * as THREE from 'three'
import { useInput } from '../../hooks/useInput'
import { usePlayerStore } from '../../store/usePlayerStore'
import { useGameStore } from '../../store/useGameStore'
import { KnightModel } from './KnightModel'

const WALK_SPEED = 4.5
const RUN_SPEED  = 8
const CROUCH_SPEED = 2
const LERP = 11

export function PlayerController({ position = [0, 5, 0], rbRef: externalRef }) {
  const internalRef = useRef()
  const rbRef = externalRef || internalRef

  const modelRef     = useRef()
  const weaponGroupRef = useRef()
  const swordRef     = useRef()
  // Ref grup seluruh karakter, agar hitbox ikut rotasi
  const charGroupRef = useRef()
  const torchLightRef= useRef()

  const input = useInput()

  const consumeStamina  = usePlayerStore(s => s.consumeStamina)
  const recoverStamina  = usePlayerStore(s => s.recoverStamina)
  const setCurrentAttack= usePlayerStore(s => s.setCurrentAttack)
  const health          = usePlayerStore(s => s.health)
  const takeDamage      = usePlayerStore(s => s.takeDamage)
  const isResting       = useGameStore(s => s.isResting)
  const isDead          = useGameStore(s => s.isDead)
  const setDead         = useGameStore(s => s.setDead)

  const [isDodging,  setIsDodging]  = useState(false)
  const [isCrouching,setIsCrouching]= useState(false)
  const [isParrying, setIsParrying] = useState(false)
  const [attackAnim, setAttackAnim] = useState(null)   // 'light' | 'heavy' | null
  const [isHit,      setIsHit]      = useState(false)

  const vel       = useRef(new THREE.Vector3())
  const targetVel = useRef(new THREE.Vector3())
  const dodgeDir  = useRef(new THREE.Vector3())
  const atkTimer  = useRef(0)

  const atkLock   = useRef(false)
  const dodgeLock = useRef(false)
  const parryLock = useRef(false)

  // ===== DETEKSI INPUT (sekali per press) =====
  useEffect(() => {
    if (isResting || health <= 0) return

    // --- Light Attack ---
    if (input.attackLight && !atkLock.current && !dodgeLock.current && !isParrying) {
      if (consumeStamina(15)) {
        atkLock.current = true
        setAttackAnim('light')
        setCurrentAttack('light')
        atkTimer.current = 0
        setTimeout(() => { atkLock.current = false; setAttackAnim(null); setCurrentAttack(null) }, 480)
      }
    }

    // --- Heavy Attack ---
    if (input.attackHeavy && !atkLock.current && !dodgeLock.current && !isParrying) {
      if (consumeStamina(30)) {
        atkLock.current = true
        setAttackAnim('heavy')
        setCurrentAttack('heavy')
        atkTimer.current = 0
        setTimeout(() => { atkLock.current = false; setAttackAnim(null); setCurrentAttack(null) }, 860)
      }
    }

    // --- Dodge ---
    if (input.dodge && !dodgeLock.current && !atkLock.current) {
      if (consumeStamina(25)) {
        dodgeLock.current = true
        setIsDodging(true)
        window.__playerDodging = true
        const yaw = window.__cameraYaw || Math.PI
        const raw = new THREE.Vector3(
          (input.right ? 1 : 0) - (input.left ? 1 : 0),
          0,
          (input.backward ? 1 : 0) - (input.forward ? 1 : 0)
        )
        if (raw.lengthSq() === 0) raw.set(0, 0, 1)
        raw.normalize().applyAxisAngle(new THREE.Vector3(0,1,0), yaw)
        dodgeDir.current.copy(raw)
        setTimeout(() => { setIsDodging(false); dodgeLock.current = false; window.__playerDodging = false; }, 480)
      }
    }

    // --- Parry ---
    if (input.parry && !parryLock.current && !atkLock.current) {
      if (consumeStamina(20)) {
        parryLock.current = true
        setIsParrying(true)
        window.__playerParrying = true
        setTimeout(() => { setIsParrying(false); parryLock.current = false; window.__playerParrying = false; }, 600)
      }
    }
  }, [input.attackLight, input.attackHeavy, input.dodge, input.parry, health, isResting])

  // Toggle crouch
  useEffect(() => {
    setIsCrouching(input.crouch)
  }, [input.crouch])

  // Deteksi kematian
  useEffect(() => {
    if (health <= 0 && !isDead) setDead(true)
  }, [health, isDead])

  // ===== FRAME LOOP =====
  useFrame((_, delta) => {
    if (window.__gamePaused) return
    if (!rbRef.current || !charGroupRef.current) return
    if (isDead || health <= 0) {
      rbRef.current.setLinvel({ x:0, y: rbRef.current.linvel().y, z:0 }, true)
      return
    }

    // --- Out of Bounds Safety Check ---
    const pos = rbRef.current.translation()
    // Teleport to nearest bonfire if falling through world or way out of side bounds
    if (pos.y < -10 || Math.abs(pos.x) > 90 || pos.z > 60) {
      const respawnPos = useGameStore.getState().lastBonfirePos
      rbRef.current.setTranslation({ x: respawnPos[0], y: respawnPos[1] + 2, z: respawnPos[2] }, true)
      rbRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true)
      return
    }

    const rbv = rbRef.current.linvel()
    targetVel.current.set(0, rbv.y, 0)

    // Animasi serangan
    if (attackAnim && weaponGroupRef.current) {
      atkTimer.current += delta
      const dur = attackAnim === 'light' ? 0.48 : 0.86
      const t = Math.min(1, atkTimer.current / dur)
      if (attackAnim === 'light') {
        weaponGroupRef.current.rotation.z = Math.sin(t * Math.PI) * -1.8
        weaponGroupRef.current.rotation.y = Math.sin(t * Math.PI) *  0.8
        weaponGroupRef.current.rotation.x = Math.sin(t * Math.PI) *  0.4
      } else {
        if (t < 0.42) {
          weaponGroupRef.current.rotation.x = THREE.MathUtils.lerp(0, -1.1, t / 0.42)
        } else {
          weaponGroupRef.current.rotation.x = THREE.MathUtils.lerp(-1.1, 0.8, (t - 0.42) / 0.58)
          weaponGroupRef.current.rotation.z = THREE.MathUtils.lerp(0, -1.0, (t - 0.42) / 0.58)
        }
      }
    } else if (weaponGroupRef.current) {
      weaponGroupRef.current.rotation.x = THREE.MathUtils.lerp(weaponGroupRef.current.rotation.x, 0, delta * 10)
      weaponGroupRef.current.rotation.y = THREE.MathUtils.lerp(weaponGroupRef.current.rotation.y, 0, delta * 10)
      weaponGroupRef.current.rotation.z = THREE.MathUtils.lerp(weaponGroupRef.current.rotation.z, 0, delta * 10)
    }

    const ep = rbRef.current.translation()
    window.__playerPosition = { x: ep.x, z: ep.z }

    if (!isResting) {
      if (isDodging) {
        targetVel.current.x = dodgeDir.current.x * 13
        targetVel.current.z = dodgeDir.current.z * 13
      } else if (!attackAnim || attackAnim === 'light') {
        const yaw = window.__cameraYaw || Math.PI
        const moveRaw = new THREE.Vector3(
          (input.right ? 1 : 0) - (input.left ? 1 : 0),
          0,
          (input.backward ? 1 : 0) - (input.forward ? 1 : 0)
        )
        if (moveRaw.lengthSq() > 0) {
          moveRaw.normalize().applyAxisAngle(new THREE.Vector3(0,1,0), yaw)

          let isRunning = false
          if (!isCrouching && input.run) {
            isRunning = consumeStamina(delta * 14)
          }

          const speed = isCrouching ? CROUCH_SPEED : (isRunning ? RUN_SPEED : WALK_SPEED)

          if (!isRunning) {
            recoverStamina(delta * 14) // Recover stamina while walking/crouching
          }

          targetVel.current.x = moveRaw.x * speed
          targetVel.current.z = moveRaw.z * speed

          // Rotasi charGroup menghadap arah gerak — hitbox ikut berputar
          const targetAngle = Math.atan2(moveRaw.x, moveRaw.z)
          const tq = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0), targetAngle)
          charGroupRef.current.quaternion.slerp(tq, delta * 14)
        } else {
          recoverStamina(delta * 22) // Faster stamina recovery when standing still
        }
      } else {
        // Heavy attack: tidak bisa gerak
        targetVel.current.x = 0
        targetVel.current.z = 0
      }
    }

    vel.current.x = THREE.MathUtils.lerp(rbv.x, targetVel.current.x, delta * LERP)
    vel.current.z = THREE.MathUtils.lerp(rbv.z, targetVel.current.z, delta * LERP)
    vel.current.y = rbv.y
    rbRef.current.setLinvel(vel.current, true)

    // Scale crouch
    if (charGroupRef.current) {
      const targetScaleY = isCrouching ? 0.65 : 1
      charGroupRef.current.scale.y = THREE.MathUtils.lerp(charGroupRef.current.scale.y || 1, targetScaleY, delta * 10)
    }

    // Auto-Torch at Dusk/Night
    if (torchLightRef.current) {
      const time = window.__gameTime || 0.5
      const angle = time * Math.PI * 2 - Math.PI / 2
      const sy = Math.sin(angle)
      // Turn on fully when sy < 0.1 (dusk to night)
      const targetIntensity = sy < 0.1 ? 1.5 : (sy > 0.2 ? 0 : 1.5 * (0.2 - sy) / 0.1)
      torchLightRef.current.intensity = THREE.MathUtils.lerp(torchLightRef.current.intensity || 0, targetIntensity, delta * 5)
    }
  })

  if (isDead) return null

  return (
    <RigidBody ref={rbRef} position={position} colliders={false} enabledRotations={[false,false,false]} name="player">
      <CapsuleCollider args={[0.5, 0.4]} position={[0, 0.9, 0]} />

      {/* charGroupRef berputar bersama model — hitbox pedang IKUT ROTASI */}
      <group ref={charGroupRef}>
        {/* Hitbox Pedang: di depan player (Z positif = depan model) */}
        {attackAnim && (
          <CuboidCollider
            args={[0.45, 0.7, 0.45]}
            position={[0.3, 1.2, 0.85]}
            sensor
            name="player_weapon"
          />
        )}

        {/* Hitbox Parry: di depan sedikit lebih lebar */}
        {isParrying && (
          <CuboidCollider
            args={[0.5, 0.8, 0.3]}
            position={[0, 1.2, 0.65]}
            sensor
            name="player_parry"
          />
        )}

        <group ref={modelRef}>
          <KnightModel
            isDodging={isDodging}
            isCrouching={isCrouching}
            isParrying={isParrying}
            attackAnim={attackAnim}
            weaponGroupRef={weaponGroupRef}
            swordRef={swordRef}
          />
        </group>

        {/* Dynamic Auto-Torch */}
        <pointLight
          ref={torchLightRef}
          position={[0.5, 1.8, 0.5]}
          color="#ffaa33"
          distance={20}
          decay={2}
          intensity={0}
        />
      </group>
    </RigidBody>
  )
}
