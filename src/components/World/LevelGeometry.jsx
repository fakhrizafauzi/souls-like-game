import { RigidBody } from '@react-three/rapier'
import { EnvLamp } from './EnvLamp'

function Block({ pos, size, color }) {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={pos} name="wall">
      <mesh receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} roughness={0.85} />
      </mesh>
    </RigidBody>
  )
}

function GateWall({ z, color }) {
  return (
    <group>
      <Block pos={[-45, 6, z]} size={[70, 12, 2]} color={color} />
      <Block pos={[ 45, 6, z]} size={[70, 12, 2]} color={color} />
      {/* Arch over the gate */}
      <Block pos={[0, 14, z]} size={[20, 4, 3]} color={color} />
      <Pillar pos={[-10, 6, z]} h={12} r={1.5} color={color} />
      <Pillar pos={[ 10, 6, z]} h={12} r={1.5} color={color} />
    </group>
  )
}

function Pillar({ pos, h = 10, r = 0.8, color = '#2a2535' }) {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={pos} name="wall">
      <mesh receiveShadow>
        <cylinderGeometry args={[r * 0.7, r, h, 8]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh position={[0, h / 2 + 0.3, 0]}>
        <boxGeometry args={[r * 2.2, 0.5, r * 2.2]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
    </RigidBody>
  )
}

function Building({ pos, size, color, roofColor = '#2a1a10' }) {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={pos} name="wall">
      <mesh castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      <mesh position={[0, size[1] / 2 + size[1] * 0.22, 0]} castShadow>
        <coneGeometry args={[size[0] * 0.7, size[1] * 0.45, 4]} />
        <meshStandardMaterial color={roofColor} roughness={0.95} />
      </mesh>
      {/* Door */}
      <mesh position={[0, -size[1]/2 + 1.5, size[2]/2 + 0.05]} castShadow>
        <boxGeometry args={[2, 3, 0.1]} />
        <meshStandardMaterial color="#1a1408" roughness={0.8} />
      </mesh>
    </RigidBody>
  )
}

function Gravestone({ pos }) {
  return (
    <group position={pos}>
      <mesh>
        <boxGeometry args={[0.5, 1.6, 0.2]} />
        <meshStandardMaterial color="#3a3545" roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.9, 0]}>
        <sphereGeometry args={[0.25, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#3a3545" roughness={0.95} />
      </mesh>
      {/* Little dirt mound */}
      <mesh position={[0, -0.7, 0.4]} rotation={[-Math.PI/2, 0, 0]}>
        <circleGeometry args={[0.8, 8]} />
        <meshStandardMaterial color="#111" roughness={1} />
      </mesh>
    </group>
  )
}

function DeadTree({ pos }) {
  return (
    <group position={pos}>
      <mesh position={[0, 3, 0]}>
        <cylinderGeometry args={[0.1, 0.6, 6, 5]} />
        <meshStandardMaterial color="#1a1c22" roughness={1} />
      </mesh>
      <mesh position={[0.8, 4.5, 0]} rotation={[0,0,-0.6]}>
        <cylinderGeometry args={[0.05, 0.2, 3, 4]} />
        <meshStandardMaterial color="#1a1c22" />
      </mesh>
      <mesh position={[-0.8, 3.5, 0]} rotation={[0,0,0.8]}>
        <cylinderGeometry args={[0.05, 0.2, 2.5, 4]} />
        <meshStandardMaterial color="#1a1c22" />
      </mesh>
    </group>
  )
}

function RuinColumn({ pos, broken = false }) {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={pos} name="wall">
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.8, 1.0, broken ? 3.5 : 8, 8]} />
        <meshStandardMaterial color="#252030" roughness={0.9} />
      </mesh>
      {!broken && (
        <mesh position={[0, 4.2, 0]} castShadow>
          <boxGeometry args={[2.2, 0.4, 2.2]} />
          <meshStandardMaterial color="#1d1825" />
        </mesh>
      )}
    </RigidBody>
  )
}

function Cactus({ pos }) {
  return (
    <group position={pos}>
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[0.5, 3, 0.5]}/>
        <meshStandardMaterial color="#3d6a37" roughness={0.9}/>
      </mesh>
      <mesh position={[0.4, 1.5, 0]}>
        <boxGeometry args={[0.8, 0.4, 0.4]}/>
        <meshStandardMaterial color="#3d6a37" roughness={0.9}/>
      </mesh>
      <mesh position={[0.7, 2.0, 0]}>
        <boxGeometry args={[0.4, 1.2, 0.4]}/>
        <meshStandardMaterial color="#3d6a37" roughness={0.9}/>
      </mesh>
    </group>
  )
}

function PalmTree({ pos }) {
  return (
    <group position={pos}>
      <mesh position={[0, 2.5, 0]} rotation={[0.1, 0, 0.1]}>
        <cylinderGeometry args={[0.3, 0.5, 5, 6]}/>
        <meshStandardMaterial color="#6b4c2a" roughness={0.9}/>
      </mesh>
      <group position={[0.3, 5, -0.3]}>
        <mesh rotation={[0.2, 0, 0]}>
          <coneGeometry args={[3.5, 1.5, 5]}/>
          <meshStandardMaterial color="#4a7c36" roughness={0.8}/>
        </mesh>
        <mesh rotation={[-0.2, 0, 0]} position={[0, -0.2, 0]}>
          <coneGeometry args={[3.5, 1.5, 5]}/>
          <meshStandardMaterial color="#3e6c2d" roughness={0.8}/>
        </mesh>
        {/* Coconuts */}
        <mesh position={[0.3, -0.5, 0]}><sphereGeometry args={[0.25]}/><meshStandardMaterial color="#4a3520"/></mesh>
        <mesh position={[-0.2, -0.6, 0.2]}><sphereGeometry args={[0.25]}/><meshStandardMaterial color="#4a3520"/></mesh>
      </group>
    </group>
  )
}

function SeaShell({ pos }) {
  return (
    <mesh position={pos} rotation={[Math.random(), Math.random(), Math.random()]} castShadow>
      <coneGeometry args={[0.15, 0.3, 5]} />
      <meshStandardMaterial color="#eeddcc" roughness={0.4} />
    </mesh>
  )
}

function IceCrystal({ pos, scale=1 }) {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={pos} name="wall">
      <mesh castShadow position={[0, 1.5 * scale, 0]}>
        <coneGeometry args={[1 * scale, 4 * scale, 5]}/>
        <meshStandardMaterial color="#aaddff" transparent opacity={0.85} roughness={0.1} envMapIntensity={2}/>
      </mesh>
      {/* Smaller side crystals */}
      <mesh castShadow position={[0.8*scale, 0.8*scale, 0]} rotation={[0,0,-0.5]}>
        <coneGeometry args={[0.5*scale, 2*scale, 4]}/>
        <meshStandardMaterial color="#aaddff" transparent opacity={0.8} roughness={0.1}/>
      </mesh>
      <pointLight color="#88ccff" distance={6 * scale} intensity={0.5 * scale} position={[0, 1*scale, 0]} />
    </RigidBody>
  )
}

function Crate({ pos }) {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={pos}>
      <mesh castShadow receiveShadow position={[0, 0.5, 0]} rotation={[0, Math.random(), 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#5a4228" roughness={0.9} />
      </mesh>
    </RigidBody>
  )
}

function GlowingMushroom({ pos }) {
  return (
    <group position={pos}>
      <mesh castShadow position={[0, 0.2, 0]}><cylinderGeometry args={[0.05, 0.1, 0.4]} /><meshStandardMaterial color="#ddd" /></mesh>
      <mesh castShadow position={[0, 0.4, 0]}><sphereGeometry args={[0.25, 8, 6, 0, Math.PI*2, 0, Math.PI/2]} /><meshStandardMaterial color="#44ffaa" emissive="#22aaff" emissiveIntensity={1.5} /></mesh>
      <pointLight color="#44ffaa" distance={3} intensity={0.5} position={[0,0.5,0]} />
    </group>
  )
}

// ===== TANAH TIAP REGION =====
function Ground({ pos, size, color }) {
  return (
    <mesh position={pos} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[size[0], size[1]]} />
      <meshStandardMaterial color={color} roughness={0.95} />
    </mesh>
  )
}

export function LevelGeometry() {
  return (
    <group>
      {/* ===== BASE GROUND BOUNDARY ===== */}
      <RigidBody type="fixed" colliders="cuboid" name="ground">
        <mesh position={[0, -0.5, 0]} receiveShadow>
          <boxGeometry args={[800, 1, 1600]} />
          <meshStandardMaterial color="#1e1c28" roughness={1} />
        </mesh>
      </RigidBody>

      {/* ============================
          REGION 1: ASHFALL TOWN (SAFE ZONE)
          Z: +50 to -100 (150 length)
         ============================ */}
      <Ground pos={[0, 0.01, -25]} size={[160, 150]} color="#2a2835" />
      
      <mesh position={[0, 0.02, -25]} receiveShadow rotation={[-Math.PI/2, 0, 0]}>
        <planeGeometry args={[16, 140]} />
        <meshStandardMaterial color="#222030" roughness={0.95} />
      </mesh>

      {/* Gedung kota */}
      <Building pos={[-22, 4,  20]} size={[10, 8,  12]} color="#3e3848" />
      <Building pos={[-20, 3,  0]}  size={[8, 6,  9]}  color="#33303e" />
      <Building pos={[-24, 6, -25]} size={[14,12,  10]} color="#3a3545" />
      <Building pos={[-22, 5, -50]} size={[12,10, 12]} color="#332e42" />
      <Building pos={[-18, 3, -75]} size={[8, 6,  8]}  color="#2a2535" />

      <Building pos={[22, 5,  15]} size={[10, 10,  12]} color="#3a3548" />
      <Building pos={[20, 4, -10]} size={[8,  8,  9]}  color="#38354a" />
      <Building pos={[24, 6, -35]} size={[14, 12,  10]} color="#302c3c" />
      <Building pos={[22, 4, -60]} size={[11, 8,  12]} color="#3a3548" />
      <Building pos={[18, 3, -85]} size={[7,  6,  8]}  color="#2a2535" />

      {/* Detail Kota: Crates */}
      <Crate pos={[-12, 0, 18]} />
      <Crate pos={[-11, 0, 18.5]} />
      <Crate pos={[-11.5, 1, 18.2]} />
      <Crate pos={[14, 0, -8]} />
      <Crate pos={[15, 0, -30]} />
      <Crate pos={[14.5, 0, -31]} />

      {/* Air Mancur di tengah kota */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, 0, -40]} name="wall">
        <mesh position={[0, 0.5, 0]} receiveShadow castShadow><cylinderGeometry args={[4, 4, 1, 16]}/><meshStandardMaterial color="#222030"/></mesh>
        <mesh position={[0, 2, 0]} receiveShadow castShadow><cylinderGeometry args={[1.5, 2, 2, 16]}/><meshStandardMaterial color="#1a1825"/></mesh>
        <mesh position={[0, 3.5, 0]} receiveShadow castShadow><cylinderGeometry args={[0.5, 0.5, 1, 16]}/><meshStandardMaterial color="#222030"/></mesh>
        {/* Air biru */}
        <mesh position={[0, 0.9, 0]} rotation={[-Math.PI/2, 0, 0]}><planeGeometry args={[7.5, 7.5]}/><meshStandardMaterial color="#1a4d8c" transparent opacity={0.8}/></mesh>
      </RigidBody>

      {/* Tembok belakang */}
      <Block pos={[  0, 6,  50]} size={[160,12, 2]} color="#1e1c28" />

      {/* Town: 5 lamps */}
      {[[-10,-14],[10,-30],[-10,-50],[10,-68],[-10,-90]].map(([x,z],i) => <EnvLamp key={'tl'+i} pos={[x,0,z]} />)}

      <GateWall z={-102} color="#1e1c28" />
      
      <Block pos={[ 80, 6, -25]} size={[  2,12,150]} color="#1e1c28" />
      <Block pos={[-80, 6, -25]} size={[  2,12,150]} color="#1e1c28" />


      {/* ============================
          REGION 2: HAUNTED GRAVEYARD
          Z: -102 to -250 (148 length)
         ============================ */}
      <Ground pos={[0, 0.01, -176]} size={[160, 148]} color="#1e1a22" />

      <mesh position={[0, 0.02, -176]} receiveShadow rotation={[-Math.PI/2, 0, 0]}>
        <planeGeometry args={[12, 148]} />
        <meshStandardMaterial color="#1a1820" roughness={0.98} />
      </mesh>

      {[
        [-20,-120],[-35,-128],[-14,-135],[-28,-145],[-22,-160],[-38,-172],[-25,-185],[-32,-198],[-18,-210],[-28,-225],[-35,-235],
        [ 20,-120],[ 35,-128],[ 14,-135],[ 28,-145],[ 22,-160],[ 38,-172],[ 25,-185],[ 32,-198],[ 18,-210],[ 28,-225],[ 35,-235],
        [-45,-130],[ 45,-130],[-50,-155],[ 50,-155],[-42,-180],[ 42,-180],[-48,-205],[ 48,-205],[-40,-230],[ 40,-230],
      ].map(([x,z], i) => <Gravestone key={'g'+i} pos={[x, 0, z]} />)}

      {/* Dead Trees */}
      <DeadTree pos={[-25, 0, -110]} />
      <DeadTree pos={[30, 0, -150]} />
      <DeadTree pos={[-35, 0, -190]} />
      <DeadTree pos={[20, 0, -220]} />

      {/* Graveyard: 5 lamps — eerie green */}
      {[[-8,-118],[8,-145],[-8,-170],[8,-200],[-8,-230]].map(([x,z],i) => <EnvLamp key={'gl'+i} pos={[x,0,z]} color="#88dd88" />)}

      <GateWall z={-252} color="#181520" />
      <Block pos={[ 80, 6,-176]} size={[  2,12,148]} color="#181520" />
      <Block pos={[-80, 6,-176]} size={[  2,12,148]} color="#181520" />


      {/* ============================
          REGION 3: CURSED FOREST
          Z: -252 to -450 (198 length)
         ============================ */}
      <Ground pos={[0, 0.01, -351]} size={[160, 198]} color="#181e14" />

      {[
        [-30,-270],[-55,-285],[-20,-300],[-50,-315],[-28,-330],[-60,-345],[-38,-360],[-18,-380],[-45,-400],[-65,-420],[-30,-435],
        [ 30,-270],[ 55,-285],[ 20,-300],[ 50,-315],[ 28,-330],[ 60,-345],[ 38,-360],[ 18,-380],[ 45,-400],[ 65,-420],[ 30,-435],
      ].map(([x,z], i) => (
        <group key={'f'+i} position={[x, 0, z]}>
          <RigidBody type="fixed" colliders="cuboid" name="wall">
            <mesh castShadow position={[0, 5, 0]}>
              <cylinderGeometry args={[0.8, 1.4, 10, 6]} />
              <meshStandardMaterial color="#1f1810" roughness={0.95} />
            </mesh>
            <mesh position={[0, 11, 0]} castShadow>
              <sphereGeometry args={[4.5, 6, 5]} />
              <meshStandardMaterial color="#0d1a08" roughness={1} />
            </mesh>
          </RigidBody>
        </group>
      ))}

      {/* Glowing Mushrooms near trees */}
      <GlowingMushroom pos={[-30, 0, -268]} />
      <GlowingMushroom pos={[22, 0, -302]} />
      <GlowingMushroom pos={[-45, 0, -402]} />

      <mesh position={[0, 0.02, -351]} receiveShadow rotation={[-Math.PI/2, 0, 0]}>
        <planeGeometry args={[14, 198]} />
        <meshStandardMaterial color="#141810" roughness={0.98} />
      </mesh>

      {/* Forest: 5 lamps — teal */}
      {[[-8,-270],[8,-310],[-8,-350],[8,-390],[-8,-430]].map(([x,z],i) => <EnvLamp key={'fl'+i} pos={[x,0,z]} color="#44cc88" />)}

      <GateWall z={-452} color="#141810" />
      <Block pos={[ 80, 6,-351]} size={[  2,12,198]} color="#141810" />
      <Block pos={[-80, 6,-351]} size={[  2,12,198]} color="#141810" />


      {/* ============================
          REGION 4: DRY DESERT
          Z: -452 to -650 (198 length)
         ============================ */}
      <Ground pos={[0, 0.01, -551]} size={[160, 198]} color="#3a2e18" />

      <mesh position={[0, 0.02, -551]} receiveShadow rotation={[-Math.PI/2, 0, 0]}>
        <planeGeometry args={[16, 198]} />
        <meshStandardMaterial color="#40321a" roughness={0.9} />
      </mesh>

      {/* Sand dunes */}
      {[[-40,-480],[45,-510],[-55,-540],[40,-580],[-45,-620]].map(([x,z], i) => (
        <mesh key={'sd'+i} position={[x, -2, z]} castShadow receiveShadow>
          <sphereGeometry args={[12, 16, 12, 0, Math.PI*2, 0, Math.PI/2]} />
          <meshStandardMaterial color="#352a15" roughness={0.95} />
        </mesh>
      ))}

      {[[-25,-470],[30,-490],[-20,-520],[25,-550],[-30,-570],[35,-590],[-25,-610],[20,-630]].map(([x,z], i) => (
        <Cactus key={'c'+i} pos={[x, 0, z]} />
      ))}

      {/* Desert: 5 lamps — golden */}
      {[[-10,-478],[10,-515],[-10,-555],[10,-590],[-10,-630]].map(([x,z],i) => <EnvLamp key={'dl'+i} pos={[x,0,z]} color="#ffcc44" />)}

      <GateWall z={-652} color="#302512" />
      <Block pos={[ 80, 6,-551]} size={[  2,12,198]} color="#302512" />
      <Block pos={[-80, 6,-551]} size={[  2,12,198]} color="#302512" />


      {/* ============================
          REGION 5: PALM COAST (BEACH)
          Z: -652 to -800 (148 length)
         ============================ */}
      <Ground pos={[0, 0.01, -726]} size={[160, 148]} color="#4a4025" />
      
      <mesh position={[-60, 0.1, -726]} receiveShadow rotation={[-Math.PI/2, 0, 0]}>
        <planeGeometry args={[40, 148]} />
        <meshStandardMaterial color="#1a4d5c" roughness={0.2} metalness={0.8} />
      </mesh>
      <mesh position={[60, 0.1, -726]} receiveShadow rotation={[-Math.PI/2, 0, 0]}>
        <planeGeometry args={[40, 148]} />
        <meshStandardMaterial color="#1a4d5c" roughness={0.2} metalness={0.8} />
      </mesh>

      {[[-18,-670],[24,-685],[-28,-700],[18,-715],[-24,-730],[28,-745],[-18,-760],[24,-780]].map(([x,z], i) => (
        <PalmTree key={'pt'+i} pos={[x, 0, z]} />
      ))}

      {/* Seashells scattered slightly in the middle */}
      <SeaShell pos={[-5, 0.1, -680]} />
      <SeaShell pos={[6, 0.1, -720]} />
      <SeaShell pos={[-4, 0.1, -750]} />
      <SeaShell pos={[8, 0.1, -770]} />

      {/* Beach: 5 lamps — warm white */}
      {[[-10,-668],[10,-695],[-10,-720],[10,-748],[-10,-778]].map(([x,z],i) => <EnvLamp key={'bl'+i} pos={[x,0,z]} color="#ffffaa" />)}

      <GateWall z={-802} color="#3a301a" />
      <Block pos={[ 80, 6,-726]} size={[  2,12,148]} color="#3a301a" />
      <Block pos={[-80, 6,-726]} size={[  2,12,148]} color="#3a301a" />


      {/* ============================
          REGION 6: FROST FIELDS (ICE)
          Z: -802 to -950 (148 length)
         ============================ */}
      <Ground pos={[0, 0.01, -876]} size={[160, 148]} color="#b0c4de" />
      
      <mesh position={[0, 0.02, -876]} receiveShadow rotation={[-Math.PI/2, 0, 0]}>
        <planeGeometry args={[18, 148]} />
        <meshStandardMaterial color="#8ca0ba" roughness={0.3} metalness={0.5} />
      </mesh>

      {[
        [-25,-820, 1.2],[30,-835, 1.5],[-35,-850, 2.5],[15,-865, 1],[-28,-880, 1.8],[25,-895, 1.4],[-20,-910, 1.1],[35,-930, 2.2]
      ].map(([x,z,s], i) => (
        <IceCrystal key={'ic'+i} pos={[x, 0, z]} scale={s} />
      ))}

      {/* Ice: 5 lamps — cold blue */}
      {[[-10,-818],[10,-850],[-10,-880],[10,-912],[-10,-942]].map(([x,z],i) => <EnvLamp key={'il'+i} pos={[x,0,z]} color="#88ccff" />)}

      <GateWall z={-952} color="#8ca0ba" />
      <Block pos={[ 80, 6,-876]} size={[  2,12,148]} color="#8ca0ba" />
      <Block pos={[-80, 6,-876]} size={[  2,12,148]} color="#8ca0ba" />


      {/* ============================
          REGION 7: ANCIENT RUINS
          Z: -952 to -1150 (198 length)
         ============================ */}
      <Ground pos={[0, 0.01, -1051]} size={[160, 198]} color="#16141e" />

      {/* Kolom reruntuhan */}
      {[
        [-25,-980],[ 25,-980],[-25,-1010],[ 25,-1010],
        [-40,-1040],[ 40,-1040],[-40,-1070],[ 40,-1070],
        [-25,-1100],[ 25,-1100],[-25,-1130],[ 25,-1130]
      ].map(([x,z], i) => (
        <RuinColumn key={'rc'+i} pos={[x, 4, z]} broken={i % 3 === 0} />
      ))}
      <Block pos={[-25, 0.5, -995]} size={[2, 1, 15]} color="#1e1c30" />
      <Block pos={[ 28, 1.5, -1055]} size={[15, 2, 2]} color="#1e1c30" />

      <mesh position={[0, 0.02, -1051]} receiveShadow rotation={[-Math.PI/2, 0, 0]}>
        <planeGeometry args={[14, 198]} />
        <meshStandardMaterial color="#18162a" roughness={0.9} />
      </mesh>

      {/* Ruins: 5 lamps — purple */}
      {[[-10,-970],[10,-1008],[-10,-1048],[10,-1090],[-10,-1130]].map(([x,z],i) => <EnvLamp key={'rl'+i} pos={[x,0,z]} color="#cc88ff" />)}

      <GateWall z={-1152} color="#12101c" />
      <Block pos={[ 80, 6,-1051]} size={[  2,12,198]} color="#12101c" />
      <Block pos={[-80, 6,-1051]} size={[  2,12,198]} color="#12101c" />


      {/* ============================
          REGION 8: TITAN'S ARENA (BOSS)
          Z: -1152 to -1350
         ============================ */}
      <Ground pos={[0, 0.01, -1251]} size={[180, 200]} color="#100e18" />

      {/* Boss Arena: 4 corner lamps — blood red */}
      {[[-28,0,-1221],[28,0,-1221],[-28,0,-1281],[28,0,-1281]].map(([x,y,z],i) => <EnvLamp key={'bal'+i} pos={[x,y,z]} color="#ff4422" />)}

      {/* Pilar melingkar */}
      {Array.from({ length: 14 }).map((_, i) => {
        const angle = (i / 14) * Math.PI * 2
        const r = 55
        return (
          <Pillar
            key={'bp'+i}
            pos={[Math.sin(angle) * r, 10, -1251 + Math.cos(angle) * r]}
            h={20} r={2.0} color="#0a0812"
          />
        )
      })}

      {/* Lantai arena */}
      {[-3,-2,-1,0,1,2,3].map((x, i) => (
        <mesh key={'bf'+i} position={[x * 16, 0.05, -1251]} receiveShadow rotation={[-Math.PI/2, 0, 0]}>
          <planeGeometry args={[12, 160]} />
          <meshStandardMaterial color={i % 2 === 0 ? '#12101c' : '#0e0c18'} roughness={0.9} />
        </mesh>
      ))}

      {/* Tembok bundar */}
      {Array.from({ length: 24 }).map((_, i) => {
        const angle = (i / 24) * Math.PI * 2
        const r = 85
        return (
          <Block
            key={'bw'+i}
            pos={[Math.sin(angle) * r, 10, -1251 + Math.cos(angle) * r]}
            size={[12, 20, 12]}
            color="#0a0812"
          />
        )
      })}
    </group>
  )
}
