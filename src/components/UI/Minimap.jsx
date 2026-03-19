import { useState, useEffect } from 'react'

export function Minimap() {
  const [pos, setPos] = useState({ x: 0, z: 0 })
  const [yaw, setYaw] = useState(0)

  // Update at an interval so we don't spam re-renders too heavily,
  // 30fps is fine for a minimap
  useEffect(() => {
    let raf
    let lastTime = 0
    const tick = (time) => {
      if (time - lastTime > 33) {
        if (window.__playerPosition) {
          setPos({ x: window.__playerPosition.x, z: window.__playerPosition.z })
        }
        if (window.__cameraYaw !== undefined) {
          setYaw(window.__cameraYaw)
        }
        lastTime = time
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  const zoom = 1.2
  const mapSize = 140

  // Points of interest (POIs) - using simple markers
  const pois = [
    { id: 'bonfire', x: 0, z: -8, color: '#ffaa00', label: 'B', size: 8 },
    { id: 'npc_town', x: -12, z: -28, color: '#88ccff', label: 'N', size: 6 },
    { id: 'npc_grave', x: 15, z: -160, color: '#88ccff', label: 'N', size: 6 },
    { id: 'npc_forest', x: -10, z: -320, color: '#88ccff', label: 'N', size: 6 },
    { id: 'npc_desert', x: 20, z: -500, color: '#88ccff', label: 'N', size: 6 },
    { id: 'npc_beach', x: -15, z: -710, color: '#88ccff', label: 'N', size: 6 },
    { id: 'npc_ice', x: 12, z: -850, color: '#88ccff', label: 'N', size: 6 },
    { id: 'npc_ruin', x: -10, z: -1010, color: '#88ccff', label: 'N', size: 6 },
    { id: 'boss_ruin', x: 0, z: -1130, color: '#ff2222', label: '✖', size: 10 },
    { id: 'boss_titan', x: 0, z: -1251, color: '#aa0000', label: '💀', size: 12 },
  ]

  // Translate a world position to minimap center-relative position
  const toMapPos = (worldX, worldZ) => {
    // Because the map centers on the player:
    const relX = (worldX - pos.x) * zoom
    const relZ = (worldZ - pos.z) * zoom
    return { left: mapSize / 2 + relX, top: mapSize / 2 + relZ }
  }

  return (
    <div style={{
      position: 'absolute', top: 20, right: 20, 
      width: mapSize, height: mapSize,
      background: 'rgba(10, 8, 15, 0.75)',
      border: '2px solid rgba(232,208,160,0.3)',
      borderRadius: '50%',
      overflow: 'hidden',
      pointerEvents: 'none',
      boxShadow: '0 4px 12px rgba(0,0,0,0.8), inset 0 0 20px rgba(0,0,0,0.9)',
      backdropFilter: 'blur(4px)',
    }}>
      {/* North indicator fixed at top */}
      <div style={{ position: 'absolute', top: 4, left: '50%', transform: 'translateX(-50%)', color: '#e8d0a0', fontSize: 10, fontFamily: 'Georgia, serif', zIndex: 10 }}>N</div>
      
      {/* Container that we can optionally rotate if we wanted to align it to camera.
          For now, keeping World North = Up is usually better for Souls-like, and player icon rotates. */}
      
      {/* POIs */}
      {pois.map(poi => {
        const { left, top } = toMapPos(poi.x, poi.z)
        // Only render if relatively close to map bounds
        if (left < -20 || left > mapSize + 20 || top < -20 || top > mapSize + 20) return null
        return (
          <div key={poi.id} style={{
            position: 'absolute', left, top,
            transform: 'translate(-50%, -50%)',
            background: poi.color,
            width: poi.size, height: poi.size,
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: poi.size - 2, fontWeight: 'bold',
            boxShadow: `0 0 6px ${poi.color}`
          }}>
            {poi.label && <span style={{ opacity: 0 }}>{poi.label}</span> /* Text can be added if we want */}
          </div>
        )
      })}

      {/* Player Dot */}
      <div style={{
        position: 'absolute', left: mapSize / 2, top: mapSize / 2,
        transform: `translate(-50%, -50%) rotate(${yaw}rad)`,
        width: 0, height: 0,
        borderLeft: '5px solid transparent',
        borderRight: '5px solid transparent',
        borderBottom: '10px solid #ffffff',
        filter: 'drop-shadow(0 0 4px #fff)',
        zIndex: 5
      }} />
    </div>
  )
}
