import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sky, Stars } from '@react-three/drei'
import * as THREE from 'three'

const CYCLE = 120

export function DayNightCycle() {
  const sunRef    = useRef()
  const moonRef   = useRef()
  const ambRef    = useRef()
  const moonAmbRef= useRef()
  const timeRef   = useRef(30)
  const skyRef    = useRef()
  const starsRef  = useRef()
  const cloudsRef = useRef([])
  const sunPos    = useRef(new THREE.Vector3(100, 80, -50))
  const moonPos   = useRef(new THREE.Vector3(-100, 80, 50))

  useFrame((state, delta) => {
    timeRef.current = (timeRef.current + delta) % CYCLE
    const t = timeRef.current / CYCLE
    window.__gameTime = t

    const angle = t * Math.PI * 2 - Math.PI / 2
    const sy = Math.sin(angle)   // −1 malam, +1 siang
    const sx = Math.cos(angle)

    // Posisi matahari
    sunPos.current.set(sx * 200, sy * 200, -80 + (window.__playerPosition?.z || 0))
    // Bulan selalu berlawanan
    moonPos.current.set(-sx * 200, -sy * 200, 80 + (window.__playerPosition?.z || 0))

    // ——— SKY SHADER ———
    if (skyRef.current?.material?.uniforms) {
      const u = skyRef.current.material.uniforms
      u.sunPosition.value.copy(sunPos.current)

      // Twilight: ketika sy sangat kecil → turbidity tinggi & rayleigh besar
      const isTwilight = Math.abs(sy) < 0.18
      u.turbidity.value    = sy > 0
        ? (isTwilight ? 18 : 8 + (1 - sy) * 6)
        : 0.1
      u.rayleigh.value     = sy > 0
        ? (isTwilight ? 4.5 : 1.0 + (1 - sy) * 1.5)
        : 0.02
      u.mieCoefficient.value = isTwilight ? 0.012 : 0.004
      u.mieDirectionalG.value = 0.82
    }

    // ——— MATAHARI ———
    if (sunRef.current) {
      sunRef.current.position.copy(sunPos.current)
      const isTwilight = Math.abs(sy) < 0.22
      if (sy > 0) {
        // Siang: putih; Twilight: oranye-merah
        sunRef.current.color.setRGB(
          isTwilight ? 1.0 : Math.min(1, 0.7 + sy * 0.5),
          isTwilight ? 0.45 + sy * 0.4 : Math.min(1, 0.65 + sy * 0.35),
          isTwilight ? 0.15 : Math.min(1, 0.55 + sy * 0.35)
        )
        sunRef.current.intensity = isTwilight ? 0.8 : Math.max(0.1, sy * 2.0)
      } else {
        sunRef.current.intensity = 0.0
      }
    }

    // ——— BULAN ———
    if (moonRef.current) {
      moonRef.current.position.copy(moonPos.current)
      const moonVisible = sy < 0
      moonRef.current.intensity = moonVisible ? Math.max(0, -sy * 0.9) : 0 // INCREASED MOONLIGHT
    }

    // ——— AMBIENT ———
    if (ambRef.current) {
      const a = Math.max(0, sy)
      const isTwilight = Math.abs(sy) < 0.2
      ambRef.current.intensity = isTwilight ? 0.5 : a > 0 ? 0.25 + a * 0.9 : 0.22
      ambRef.current.color.setRGB(
        isTwilight ? 0.9 : a > 0 ? 0.65 + a * 0.3 : 0.35,
        isTwilight ? 0.5 : a > 0 ? 0.7 + a * 0.2  : 0.32,
        isTwilight ? 0.35: a > 0 ? 0.9 + a * 0.1  : 0.5
      )
    }

    // ——— AMBIENT MALAM ———
    if (moonAmbRef.current) {
      moonAmbRef.current.intensity = sy < 0 ? Math.max(0.25, -sy * 0.8) : 0
    }

    // ——— FOG ———
    if (state.scene.fog) {
      const isTwilight = Math.abs(sy) < 0.2
      const isDay = sy > 0.2
      const isNight = sy < -0.2
      state.scene.fog.color.setRGB(
        isTwilight ? 0.55 : isDay ? 0.35 * sy + 0.05 : 0.15, // LIGHTER FOG AT NIGHT
        isTwilight ? 0.3  : isDay ? 0.4  * sy + 0.04 : 0.15,
        isTwilight ? 0.18 : isDay ? 0.55 * sy + 0.08 : 0.25
      )
    }

    // ——— BINTANG (opacity malam) ———
    if (starsRef.current?.material) {
      const targetOp = Math.max(0, Math.min(1, -sy * 3.0 + 0.2)) // BRIGHTER STARS
      starsRef.current.material.opacity = THREE.MathUtils.lerp(
        starsRef.current.material.opacity || 0, targetOp, 0.05
      )
    }

    // ——— AWAN bergerak ———
    cloudsRef.current.forEach((c, i) => {
      if (c) c.position.x += delta * (0.8 + i * 0.3) * (sy > 0 ? 1 : 0.2)
      if (c && c.position.x > 200) c.position.x = -200
    })
  })

  return (
    <>
      {/* ——— SKY SHADER ——— */}
      <Sky
        ref={skyRef}
        distance={450000}
        sunPosition={sunPos.current}
        turbidity={10} rayleigh={1}
        mieCoefficient={0.005} mieDirectionalG={0.82}
      />

      {/* ——— BINTANG ——— */}
      <Stars
        ref={starsRef}
        radius={300} depth={60} count={5000}
        factor={3.5} saturation={0} fade speed={0.3}
      />

      {/* ——— AWAN VOLUMETRIK SEDERHANA ——— */}
      {[
        [[-80, 62, -120], [80, 18]],
        [[ 40, 72, -200], [100, 22]],
        [[-140, 58, -80],  [90, 16]],
        [[ 90, 68, -300], [70, 20]],
        [[-60, 75, -400], [110, 24]],
        [[ 20, 65, -500], [85, 18]],
      ].map(([[x, y, z], [w, h]], i) => (
        <mesh
          key={i}
          ref={el => { cloudsRef.current[i] = el }}
          position={[x, y, z]}
          rotation={[-Math.PI / 2, 0, i * 0.3]}
        >
          <planeGeometry args={[w, h]} />
          <meshStandardMaterial
            color="#e8e8f0"
            transparent opacity={0.12}
            depthWrite={false}
          />
        </mesh>
      ))}

      {/* ——— SINAR MATAHARI ——— */}
      <directionalLight
        ref={sunRef}
        castShadow
        position={sunPos.current.toArray()}
        intensity={1.8}
        shadow-camera-near={0.5}
        shadow-camera-far={600}
        shadow-camera-left={-80}
        shadow-camera-right={80}
        shadow-camera-top={80}
        shadow-camera-bottom={-80}
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0005}
      />

      {/* ——— CAHAYA BULAN ——— */}
      <directionalLight
        ref={moonRef}
        position={moonPos.current.toArray()}
        intensity={0}
        color="#8899cc"
        castShadow={false}
      />

      {/* ——— AMBIENT SIANG ——— */}
      <ambientLight ref={ambRef} intensity={0.5} />
      {/* ——— AMBIENT MALAM (biru) ——— */}
      <ambientLight ref={moonAmbRef} color="#223366" intensity={0} />
    </>
  )
}
