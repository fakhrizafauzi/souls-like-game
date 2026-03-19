import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/rapier'
import { useRef, useState, useEffect } from 'react'

import { CameraController }    from './components/Camera/CameraController'
import { DayNightCycle }       from './components/World/DayNightCycle'
import { LevelGeometry }       from './components/World/LevelGeometry'
import { Bonfire }             from './components/World/Bonfire'
import { NPC }                 from './components/World/NPC'
import { TrainingDummy }       from './components/World/TrainingDummy'
import { WanderingVillager }   from './components/World/WanderingVillager'
import { PlayerController }    from './components/Player/PlayerController'
import { EnemyAI }             from './components/Enemies/EnemyAI'
import { BossAI }              from './components/Enemies/BossAI'
import { EpicBossAI }          from './components/Enemies/EpicBossAI'
import { ArcherEnemy }         from './components/Enemies/ArcherEnemy'
import { BerserkerEnemy }      from './components/Enemies/BerserkerEnemy'
import { ShadowKnightEnemy }   from './components/Enemies/ShadowKnightEnemy'
import { ProjectilesRenderer } from './components/Enemies/ProjectilesRenderer'
import { SkillEffectsRenderer } from './components/Enemies/SkillEffectsRenderer'

import { HUD }         from './components/UI/HUD'
import { SkillBar }    from './components/UI/SkillBar'
import { LevelUpMenu } from './components/UI/LevelUpMenu'
import { MainMenu }    from './components/UI/MainMenu'
import { DeathScreen } from './components/UI/DeathScreen'
import { PauseMenu }   from './components/UI/PauseMenu'
import { Bvh, Preload } from '@react-three/drei'

import { useGameStore }   from './store/useGameStore'
import { usePlayerStore } from './store/usePlayerStore'
import { useLanguageStore } from './store/useLanguageStore'

const ENEMIES = [
  // Region 1: Town (SAFE ZONE) -> No enemies!

  // Region 2: Graveyard (Z: -102 to -250)
  { id:'g1', pos:[  25,3, -120], type:'wraith',   C: EnemyAI },
  { id:'g2', pos:[ -15,3, -145], type:'shadow',   C: ShadowKnightEnemy },
  { id:'g3', pos:[ -35,3, -170], type:'skeleton', C: EnemyAI },
  { id:'g4', pos:[  40,3, -200], type:'archer',   C: ArcherEnemy },
  { id:'g5', pos:[  10,3, -230], type:'skeleton', C: EnemyAI },

  // Region 3: Forest (Z: -252 to -450)
  { id:'f1', pos:[ -40,3, -280], type:'berserker',C: BerserkerEnemy },
  { id:'f2', pos:[  20,3, -310], type:'zombie',   C: EnemyAI },
  { id:'f3', pos:[   0,3, -350], type:'archer',   C: ArcherEnemy },
  { id:'f4', pos:[  35,3, -380], type:'shadow',   C: ShadowKnightEnemy },
  { id:'f5', pos:[ -25,3, -410], type:'armored',  C: EnemyAI },
  { id:'f6', pos:[  10,3, -440], type:'berserker',C: BerserkerEnemy },

  // Region 4: Desert (Z: -452 to -650)
  { id:'d1', pos:[  45,3, -480], type:'skeleton',C: EnemyAI },
  { id:'d2', pos:[ -25,3, -520], type:'archer',  C: ArcherEnemy },
  { id:'d3', pos:[  28,3, -560], type:'shadow',  C: ShadowKnightEnemy },
  { id:'d4', pos:[ -40,3, -600], type:'berserker',C: BerserkerEnemy },
  { id:'d5', pos:[  15,3, -630], type:'armored', C: EnemyAI },

  // Region 5: Beach (Z: -652 to -800)
  { id:'b1', pos:[ -20,3, -680], type:'zombie',  C: EnemyAI },
  { id:'b2', pos:[  35,3, -720], type:'archer',  C: ArcherEnemy },
  { id:'b3', pos:[ -40,3, -750], type:'wraith',  C: EnemyAI },
  { id:'b4', pos:[  12,3, -780], type:'shadow',  C: ShadowKnightEnemy },

  // Region 6: Ice (Z: -802 to -950)
  { id:'i1', pos:[  40,3, -830], type:'armored', C: EnemyAI },
  { id:'i2', pos:[ -35,3, -870], type:'berserker',C: BerserkerEnemy },
  { id:'i3', pos:[  28,3, -910], type:'archer',  C: ArcherEnemy },
  { id:'i4', pos:[  -5,3, -940], type:'shadow',  C: ShadowKnightEnemy },

  // Region 7: Ruins (Z: -952 to -1150)
  { id:'r1', pos:[  26,3,-1000], type:'shadow',  C: ShadowKnightEnemy },
  { id:'r2', pos:[ -35,3,-1040], type:'archer',  C: ArcherEnemy },
  { id:'r3', pos:[  40,3,-1080], type:'berserker',C: BerserkerEnemy },
  { id:'r4', pos:[ -25,3,-1110], type:'armored', C: EnemyAI },
  { id:'r5', pos:[   5,3,-1140], type:'shadow',  C: ShadowKnightEnemy },

  // Arena Guards (Before Boss)
  { id:'ba1',pos:[-38,3,-1165], type:'berserker',C: BerserkerEnemy },
  { id:'ba2',pos:[ 38,3,-1165], type:'shadow',   C: ShadowKnightEnemy },
  { id:'ba3',pos:[-45,3,-1200], type:'archer',   C: ArcherEnemy },
  { id:'ba4',pos:[ 45,3,-1200], type:'archer',   C: ArcherEnemy },
]

function BiomeNotifier() {
  const [biome, setBiome] = useState("Ashfall Town")
  const [alpha, setAlpha] = useState(1)

  useEffect(() => {
    let hideTimeout
    const checkZ = () => {
      if (window.__playerPosition) {
        const z = window.__playerPosition.z
        let newBiome = "Ashfall Town"
        if (z < -1152) newBiome = "Titan's Arena"
        else if (z < -952) newBiome = "Ancient Ruins"
        else if (z < -802) newBiome = "Frost Fields"
        else if (z < -652) newBiome = "Palm Coast"
        else if (z < -452) newBiome = "Dry Desert"
        else if (z < -252) newBiome = "Cursed Forest"
        else if (z < -102) newBiome = "Haunted Graveyard"

        setBiome(prev => {
          if (prev !== newBiome) {
            setAlpha(1)
            clearTimeout(hideTimeout)
            hideTimeout = setTimeout(() => setAlpha(0), 4000)
            return newBiome
          }
          return prev
        })
      }
      requestAnimationFrame(checkZ)
    }
    const rf = requestAnimationFrame(checkZ)
    hideTimeout = setTimeout(() => setAlpha(0), 4000)
    return () => { cancelAnimationFrame(rf); clearTimeout(hideTimeout) }
  }, [])

  return (
    <div style={{
      position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)',
      textAlign: 'center', pointerEvents: 'none', transition: 'opacity 1s', opacity: alpha,
      fontFamily: 'Georgia, serif'
    }}>
      <div style={{ color: '#eee', fontSize: 32, letterSpacing: '0.15em', textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
        {biome.toUpperCase()}
      </div>
      <div style={{ width: '100%', height: 1, background: 'linear-gradient(90deg, transparent, #aaa, transparent)', marginTop: 8 }} />
    </div>
  )
}

function VisualNovelDialog() {
  const activeDialog = useGameStore(s => s.activeDialog)
  const setActiveDialog = useGameStore(s => s.setActiveDialog)
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (activeDialog) {
      setIndex(0)
      document.exitPointerLock()
    }
  }, [activeDialog])

  const closeDialog = () => {
    setActiveDialog(null)
    setTimeout(() => {
      const canvas = document.querySelector('canvas')
      if (canvas) canvas.requestPointerLock()
    }, 50)
  }

  const nextDialog = () => {
    setIndex(i => {
      if (i + 1 >= activeDialog.dialogs.length) {
        closeDialog()
        return i
      }
      return i + 1
    })
  }

  useEffect(() => {
    if (!activeDialog) return
    const onKey = (e) => {
      if (e.key.toLowerCase() === 'e') {
        closeDialog()
      }
      if (e.code === 'ArrowRight' || e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault()
        nextDialog()
      }
      if (e.code === 'ArrowLeft') {
        e.preventDefault()
        setIndex(i => Math.max(0, i - 1))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activeDialog, setActiveDialog])

  const t = useLanguageStore(s => s.t)

  if (!activeDialog) return null

  return (
    <div 
      onClick={nextDialog}
      style={{
        position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)',
        width: '80vw', maxWidth: '900px', pointerEvents: 'auto',
        background: 'linear-gradient(180deg, rgba(12,10,20,0.95) 0%, rgba(8,6,12,0.98) 100%)',
        border: `2px solid rgba(255,255,255,0.1)`,
        borderTop: `4px solid ${activeDialog.color}`,
        borderRadius: 6, padding: '30px 40px',
        fontFamily: 'Georgia, serif', cursor: 'pointer',
        boxShadow: '0 20px 50px rgba(0,0,0,0.8), inset 0 0 30px rgba(0,0,0,0.5)',
        display: 'flex', flexDirection: 'column',
        zIndex: 100
      }}
    >
      <div style={{ color: activeDialog.color, fontSize: 24, letterSpacing: '0.15em', marginBottom: 16, textTransform: 'uppercase', textShadow: '0 2px 4px rgba(0,0,0,0.9)' }}>
        {activeDialog.name}
      </div>
      <div style={{ color: '#e8e0d0', fontSize: 22, lineHeight: 1.6, marginBottom: 24, minHeight: '70px', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
        "{activeDialog.dialogs[index]}"
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 16 }}>
        <span style={{ color: '#777', fontSize: 13, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{t('nextDialog')}</span>
        <div style={{ display: 'flex', gap: 8 }}>
          {activeDialog.dialogs.map((_, i) => (
            <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: i === index ? activeDialog.color : 'rgba(255,255,255,0.2)', transition: 'background 0.3s' }} />
          ))}
        </div>
        <span style={{ color: '#888', fontSize: 13, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{t('closeDialog')}</span>
      </div>
    </div>
  )
}

function Scene({ playerRef, respawnKey }) {
  const isResting    = useGameStore(s => s.isResting)
  const bossDefeated = useGameStore(s => s.bossDefeated)
  const isDead       = useGameStore(s => s.isDead)
  const lastBonfirePos = useGameStore(s => s.lastBonfirePos)
  const useEstus     = usePlayerStore(s => s.useEstus)

  useEffect(() => {
    const onKey = (e) => {
      if (e.code === 'KeyQ' && !isResting && !isDead && !window.__npcTalking && !window.__gamePaused) {
        e.preventDefault(); useEstus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [useEstus, isResting, isDead])

  const t = useLanguageStore(s => s.t)

  const playerZ = window.__playerPosition ? window.__playerPosition.z : 0
  const isFar = (z) => Math.abs(z - playerZ) > 180

  return (
    <>
      <CameraController targetRef={playerRef} />
      <DayNightCycle />
      <fog attach="fog" args={['#1a1825', 60, 600]} />

        <Physics gravity={[0, -20, 0]}>
          <LevelGeometry />
          
          <Bonfire position={[0, 0, -8]} /> // Town
          <TrainingDummy position={[8, 0, -2]} />
          
          {!isFar(-112) && <Bonfire position={[8, 0, -112]} />}
          {!isFar(-260) && <Bonfire position={[-15, 0, -260]} />}
          {!isFar(-460) && <Bonfire position={[18, 0, -460]} />}
          {!isFar(-660) && <Bonfire position={[-8, 0, -660]} />}
          {!isFar(-810) && <Bonfire position={[20, 0, -810]} />}
          {!isFar(-960) && <Bonfire position={[0, 0, -960]} />}

          {/* Render NPCs only if close */}
          {!isFar(-28) && <NPC position={[-12, 0, -28]} color="#5a3a8a" name={t('npc_raffus_name')} dialogs={[t('npc_raffus_1'), t('npc_raffus_2'), t('npc_raffus_3'), t('npc_raffus_4'), t('npc_raffus_5')]} />}
          {!isFar(-160) && <NPC position={[ 15, 0,-160]} color="#2a2a2a" name={t('npc_yorn_name')} dialogs={[t('npc_yorn_1'), t('npc_yorn_2'), t('npc_yorn_3'), t('npc_yorn_4')]} />}
          {!isFar(-320) && <NPC position={[-10, 0,-320]} color="#2d5a27" name={t('npc_hunter_name')} dialogs={[t('npc_hunter_1'), t('npc_hunter_2'), t('npc_hunter_3'), t('npc_hunter_4')]} />}
          {!isFar(-500) && <NPC position={[ 20, 0,-500]} color="#b8860b" name={t('npc_nomad_name')} dialogs={[t('npc_nomad_1'), t('npc_nomad_2'), t('npc_nomad_3'), t('npc_nomad_4')]} />}
          {!isFar(-710) && <NPC position={[-15, 0,-710]} color="#1a4d5c" name={t('npc_sailor_name')} dialogs={[t('npc_sailor_1'), t('npc_sailor_2'), t('npc_sailor_3'), t('npc_sailor_4')]} />}
          {!isFar(-850) && <NPC position={[ 12, 0,-850]} color="#8ca0ba" name={t('npc_wizard_name')} dialogs={[t('npc_wizard_1'), t('npc_wizard_2'), t('npc_wizard_3'), t('npc_wizard_4')]} />}
          {!isFar(-1010) &&<NPC position={[-10, 0,-1010]} color="#685c4a" name={t('npc_scholar_name')} dialogs={[t('npc_scholar_1'), t('npc_scholar_2'), t('npc_scholar_3'), t('npc_scholar_4'), t('npc_scholar_5')]} />}

          {!isFar(-12) && <NPC position={[12, 0, -12]} color="#8a3a3a" name={t('npc_aldric_name')} dialogs={[t('npc_aldric_1'), t('npc_aldric_2'), t('npc_aldric_3'), t('npc_aldric_4')]} />}
          {!isFar(-40) && <NPC position={[-6, 0, -40]} color="#4a6a8a" name={t('npc_seryn_name')} dialogs={[t('npc_seryn_1'), t('npc_seryn_2'), t('npc_seryn_3'), t('npc_seryn_4'), t('npc_seryn_5')]} />}
          {!isFar(-1160) && <NPC position={[-22, 0,-1160]} color="#aa2222" name={t('npc_sentinel_name')} dialogs={[t('npc_sentinel_1'), t('npc_sentinel_2'), t('npc_sentinel_3'), t('npc_sentinel_4'), t('npc_sentinel_5')]} />}

          {/* 5 WANDERING VILLAGERS in Town (only render if town is close) */}
          {!isFar(-30) && (
            <>
              <WanderingVillager home={[ 4, 0, -10]} color="#8a6a4a" seed={0} />
              <WanderingVillager home={[-6, 0, -20]} color="#5a4a3a" seed={1} />
              <WanderingVillager home={[ 8, 0, -38]} color="#7a5a3a" seed={2} />
              <WanderingVillager home={[-3, 0, -50]} color="#6a5a4a" seed={3} />
              <WanderingVillager home={[ 6, 0, -60]} color="#9a7a5a" seed={4} />
            </>
          )}

        {!isDead && <PlayerController position={lastBonfirePos} rbRef={playerRef} />}

        {!isResting && !isDead && (
          <group key={`spawn_${respawnKey}`}>
            {ENEMIES.map(({ id, pos, type, C: Comp }) => {
            if (isFar(pos[2])) return null
            return Comp === EnemyAI
              ? <EnemyAI key={id} id={id} position={pos} type={type} />
              : <Comp key={id} id={id} position={pos} />
          })}
          </group>
        )}

        {!isResting && !isDead && !bossDefeated && <BossAI position={[0, 3, -1130]} />}
        {!isResting && !isDead && <EpicBossAI position={[0, 3, -1251]} />}
        
        <ProjectilesRenderer />
        <SkillEffectsRenderer />
      </Physics>
    </>
  )
}

export default function App() {
  const [gameStarted, setGameStarted] = useState(false)
  const [respawnKey,  setRespawnKey]  = useState(0)
  const isResting    = useGameStore(s => s.isResting)
  const bossDefeated = useGameStore(s => s.bossDefeated)
  const isDead       = useGameStore(s => s.isDead)
  const isPaused     = useGameStore(s => s.isPaused)
  const playerRef    = useRef()

  useEffect(() => { if (!isResting) setRespawnKey(k => k + 1) }, [isResting])

  if (!gameStarted) return <MainMenu onPlay={() => setGameStarted(true)} />

  return (
    <>
      <Canvas shadows camera={{ position:[0,6,16], fov:65 }} style={{ position:'absolute', inset:0 }}>
        <Scene playerRef={playerRef} respawnKey={respawnKey} />
      </Canvas>

      <div className="ui-layer">
        <div style={{ pointerEvents:'none' }}>
          <HUD />
        </div>
        <BiomeNotifier />
        <VisualNovelDialog />
        <SkillBar />
        {isResting && <div style={{ pointerEvents:'auto' }}><LevelUpMenu /></div>}
        <DeathScreen />
        <PauseMenu />

        {bossDefeated && (
          <div style={{ position:'absolute', top:'28%', left:'50%', transform:'translate(-50%,-50%)', textAlign:'center', pointerEvents:'none' }}>
            <div style={{ color:'#ffcc44', fontSize:52, fontFamily:'Georgia,serif', letterSpacing:'0.12em', textShadow:'0 0 30px #ffaa00' }}>
              HEIR OF FIRE
            </div>
            <div style={{ color:'#cc8822', fontSize:24, fontFamily:'Georgia,serif', letterSpacing:'0.3em', marginTop:8 }}>
              DESTROYED
            </div>
          </div>
        )}

        <div style={{ position:'absolute', bottom:18, right:18, pointerEvents:'none', color:'#5a5570', fontSize:11, textAlign:'right', lineHeight:1.9, background:'rgba(0,0,0,0.4)', padding:'8px 14px', borderRadius:5, letterSpacing:'0.04em' }}>
          Click to lock mouse · ESC Pause<br/>
          WASD Move · Shift Sprint · Space Dodge<br/>
          LMB Light · RMB Heavy · F Parry · C Crouch<br/>
          Q Estus · E Interact
        </div>
      </div>
    </>
  )
}
