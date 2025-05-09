"use client"

import { useRef, useState, useEffect, Suspense, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Environment, Html, Center, PerspectiveCamera } from "@react-three/drei"
import { type Mesh, type Group, Vector3, CatmullRomCurve3 } from "three"
import { Button } from "@/components/ui/button"

export default function EnergyTile() {
  const [exploded, setExploded] = useState(true)
  const [showLabels, setShowLabels] = useState(true)

  return (
    <>
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        <Button variant="outline" onClick={() => setExploded(!exploded)} className="bg-white/80 backdrop-blur-sm">
          {exploded ? "Assembled View" : "Exploded View"}
        </Button>
        <Button variant="outline" onClick={() => setShowLabels(!showLabels)} className="bg-white/80 backdrop-blur-sm">
          {showLabels ? "Hide Labels" : "Show Labels"}
        </Button>
      </div>
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[1, 1.5, 2]} fov={50} />
        <color attach="background" args={["#f5f5f5"]} />
        <ambientLight intensity={0.5} />
        <spotLight position={[5, 10, 7.5]} angle={0.15} penumbra={1} intensity={1} castShadow />
        <directionalLight position={[-5, 5, -5]} intensity={0.5} castShadow />

        <Suspense fallback={null}>
          <Center>
            <TileSystem exploded={exploded} showLabels={showLabels} />
          </Center>
          <Environment preset="city" />
        </Suspense>

        <OrbitControls minPolarAngle={0} maxPolarAngle={Math.PI / 2} minDistance={1} maxDistance={5} />

        <gridHelper args={[10, 10, "#888888", "#e0e0e0"]} position={[0, -0.01, 0]} />
      </Canvas>
    </>
  )
}

function TileSystem({ exploded, showLabels }: { exploded: boolean; showLabels: boolean }) {
  const groupRef = useRef<Group>(null)
  const tileRef = useRef<Mesh>(null)
  const sensorsRef = useRef<Group>(null)
  const protectiveCasingRef = useRef<Mesh>(null)
  const wiringRef = useRef<Group>(null)
  const batteryRef = useRef<Mesh>(null)
  const lightBulbRef = useRef<Mesh>(null)
  const wallRef = useRef<Mesh>(null)
  const usbPortRef = useRef<Mesh>(null)
  const connectionPointsRef = useRef<Group>(null)

  // Animation for pressing the tile
  const [pressed, setPressed] = useState(false)
  const [lightActive, setLightActive] = useState(false)

  useEffect(() => {
    if (pressed) {
      const timer = setTimeout(() => {
        setLightActive(true)
        setTimeout(() => {
          setLightActive(false)
          setPressed(false)
        }, 1500)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [pressed])

  useFrame((state) => {
    if (groupRef.current) {
      // Gentle floating animation
      groupRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.1) * 0.05
    }

    if (tileRef.current && pressed) {
      // Animate tile press
      tileRef.current.position.y = -0.01 - Math.sin(state.clock.getElapsedTime() * 10) * 0.005
    } else if (tileRef.current) {
      tileRef.current.position.y = -0.01
    }
  })

  // Calculate positions based on exploded view state
  const tilePosition = new Vector3(0, exploded ? 0 : -0.01, 0)
  const protectiveCasingPosition = new Vector3(0, exploded ? -0.08 : -0.04, 0)
  const sensorsPosition = new Vector3(0, exploded ? -0.06 : -0.03, 0)
  const wiringPosition = new Vector3(0, exploded ? -0.2 : -0.05, 0)
  const batteryPosition = new Vector3(0.2, exploded ? -0.3 : -0.07, 0)
  const wallPosition = new Vector3(0.5, exploded ? 0.1 : 0.15, 0)
  const lightBulbPosition = new Vector3(0.5, exploded ? 0.3 : 0.35, 0)
  const usbPortPosition = new Vector3(0.5, exploded ? 0.15 : 0.2, 0)

  // Connection points for wiring - all from underneath the tile
  const tileConnectionPoint = new Vector3(0.1, -0.04, 0) // Moved to side and underneath
  const batteryConnectionPoint = new Vector3(batteryPosition.x - 0.05, batteryPosition.y, batteryPosition.z)
  const lightConnectionPoint = new Vector3(lightBulbPosition.x, lightBulbPosition.y - 0.05, lightBulbPosition.z)
  const usbConnectionPoint = new Vector3(usbPortPosition.x - 0.025, usbPortPosition.y, usbPortPosition.z)

  // Generate piezoelectric sensor positions - 9 sensors in a strategic pattern
  const sensorPositions = useMemo(() => {
    return [
      // Center sensor
      [0, 0, 0],
      // Corner sensors
      [-0.08, 0, -0.08],
      [0.08, 0, -0.08],
      [-0.08, 0, 0.08],
      [0.08, 0, 0.08],
      // Mid-edge sensors
      [0, 0, -0.08],
      [0, 0, 0.08],
      [-0.08, 0, 0],
      [0.08, 0, 0],
    ]
  }, [])

  return (
    <group ref={groupRef}>
      {/* Tile Surface */}
      <mesh
        ref={tileRef}
        position={[tilePosition.x, tilePosition.y, tilePosition.z]}
        receiveShadow
        castShadow
        onClick={() => setPressed(true)}
      >
        <boxGeometry args={[0.3, 0.02, 0.3]} />
        <meshStandardMaterial color="#333333" roughness={0.8} metalness={0.2} />
        {showLabels && (
          <Html position={[0, 0.05, 0]} center>
            <div className="bg-black/70 text-white px-2 py-1 rounded text-xs whitespace-nowrap">Tile Surface</div>
          </Html>
        )}
      </mesh>

      {/* Protective Casing */}
      <group position={[protectiveCasingPosition.x, protectiveCasingPosition.y, protectiveCasingPosition.z]}>
        {/* Main Casing Body */}
        <mesh ref={protectiveCasingRef} castShadow receiveShadow>
          <boxGeometry args={[0.28, 0.03, 0.28]} />
          <meshStandardMaterial color="#555555" roughness={0.7} metalness={0.3} />
        </mesh>

        {/* Waterproof Gasket/Seal - only visible in exploded view, positioned between components */}
        {exploded ? (
          <mesh position={[0, exploded ? 0.015 : 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.135, 0.005, 16, 48]} />
            <meshStandardMaterial color="#444444" roughness={1} />
          </mesh>
        ) : (
          // In assembled view, use a very thin, barely visible gasket at the junction
          <mesh position={[0, 0.01, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.135, 0.001, 8, 48]} />
            <meshStandardMaterial color="#555555" roughness={1} transparent={true} opacity={0.5} />
          </mesh>
        )}

        {/* Shock Absorption Pads (4 corners) */}
        {[
          [-0.12, -0.01, -0.12],
          [0.12, -0.01, -0.12],
          [-0.12, -0.01, 0.12],
          [0.12, -0.01, 0.12],
        ].map((pos, i) => (
          <mesh key={`pad-${i}`} position={pos}>
            <cylinderGeometry args={[0.02, 0.02, 0.01, 16]} />
            <meshStandardMaterial color="#444444" roughness={0.9} />
          </mesh>
        ))}

        {/* Wire Channel/Port - moved to the side */}
        <mesh position={[0.14, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.01, 0.01, 0.03, 16]} />
          <meshStandardMaterial color="#222222" roughness={0.5} />
        </mesh>

        {/* Mounting Brackets */}
        {[
          [-0.13, 0, 0],
          [0.13, 0, 0],
          [0, 0, -0.13],
          [0, 0, 0.13],
        ].map((pos, i) => (
          <mesh key={`bracket-${i}`} position={pos}>
            <boxGeometry args={[0.02, 0.01, 0.02]} />
            <meshStandardMaterial color="#777777" metalness={0.5} roughness={0.5} />
          </mesh>
        ))}

        {/* Access Panel/Cover */}
        <mesh position={[0, 0.015, 0]}>
          <boxGeometry args={[0.15, 0.005, 0.15]} />
          <meshStandardMaterial color="#666666" roughness={0.5} metalness={0.5} />
        </mesh>

        {showLabels && (
          <Html position={[0, 0.05, 0]} center>
            <div className="bg-black/70 text-white px-2 py-1 rounded text-xs whitespace-nowrap">Protective Casing</div>
          </Html>
        )}

        {/* Feature Labels (only in exploded view) */}
        {exploded && showLabels && (
          <>
            <Html position={[0, 0.07, 0]} center>
              <div className="bg-black/70 text-white px-2 py-1 rounded text-xs whitespace-nowrap">Waterproof Seal</div>
            </Html>
            <Html position={[0.12, -0.02, 0.12]} center>
              <div className="bg-black/70 text-white px-2 py-1 rounded text-xs whitespace-nowrap">Shock Absorber</div>
            </Html>
            <Html position={[0.14, 0.03, 0]} center>
              <div className="bg-black/70 text-white px-2 py-1 rounded text-xs whitespace-nowrap">Wire Channel</div>
            </Html>
            <Html position={[0, 0.03, 0.13]} center>
              <div className="bg-black/70 text-white px-2 py-1 rounded text-xs whitespace-nowrap">Mounting Bracket</div>
            </Html>
          </>
        )}
      </group>

      {/* Piezoelectric Sensors - 9 sensors in strategic positions */}
      <group ref={sensorsRef} position={[sensorsPosition.x, sensorsPosition.y, sensorsPosition.z]}>
        {sensorPositions.map((pos, i) => (
          <mesh key={i} position={pos} castShadow receiveShadow>
            <cylinderGeometry args={[0.015, 0.015, 0.005, 16]} />
            <meshStandardMaterial color="#a0a0a0" metalness={0.8} roughness={0.2} />
          </mesh>
        ))}
        {showLabels && (
          <Html position={[0, 0.05, 0]} center>
            <div className="bg-black/70 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
              Piezoelectric Sensors (9 units)
            </div>
          </Html>
        )}
      </group>

      {/* Wall Structure */}
      <mesh ref={wallRef} position={[wallPosition.x, wallPosition.y, wallPosition.z]} castShadow receiveShadow>
        <boxGeometry args={[0.05, 0.4, 0.3]} />
        <meshStandardMaterial color="#d0d0d0" roughness={0.9} metalness={0.1} />
        {showLabels && (
          <Html position={[0, 0.25, 0]} center>
            <div className="bg-black/70 text-white px-2 py-1 rounded text-xs whitespace-nowrap">Wall</div>
          </Html>
        )}
      </mesh>

      {/* Light Bulb on Wall */}
      <group position={[lightBulbPosition.x, lightBulbPosition.y, lightBulbPosition.z]}>
        {/* Bulb Base */}
        <mesh castShadow receiveShadow position={[-0.025, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.03, 16]} />
          <meshStandardMaterial color="#555555" roughness={0.3} metalness={0.7} />
        </mesh>

        {/* Bulb - now with orange color when active */}
        <mesh ref={lightBulbRef} castShadow receiveShadow position={[-0.025, 0.03, 0]}>
          <sphereGeometry args={[0.03, 16, 16]} />
          <meshStandardMaterial
            color={lightActive ? "#ff8c00" : "#dddddd"} // Changed to orange
            emissive={lightActive ? "#ff6600" : "#000000"} // Changed to orange emissive
            emissiveIntensity={lightActive ? 2 : 0}
            transparent={true}
            opacity={0.9}
          />
        </mesh>

        {showLabels && (
          <Html position={[0, 0.08, 0]} center>
            <div className="bg-black/70 text-white px-2 py-1 rounded text-xs whitespace-nowrap">Light Bulb</div>
          </Html>
        )}
      </group>

      {/* USB Port on Wall */}
      <group position={[usbPortPosition.x, usbPortPosition.y, usbPortPosition.z]}>
        {/* USB Port Housing */}
        <mesh castShadow receiveShadow position={[-0.025, 0, 0]}>
          <boxGeometry args={[0.05, 0.04, 0.06]} />
          <meshStandardMaterial color="#444444" roughness={0.5} metalness={0.5} />
        </mesh>

        {/* USB Port */}
        <mesh ref={usbPortRef} castShadow receiveShadow position={[-0.05, 0, 0]}>
          <boxGeometry args={[0.01, 0.02, 0.03]} />
          <meshStandardMaterial color="#222222" roughness={0.3} metalness={0.7} />
        </mesh>

        {showLabels && (
          <Html position={[0, 0.05, 0]} center>
            <div className="bg-black/70 text-white px-2 py-1 rounded text-xs whitespace-nowrap">USB Port</div>
          </Html>
        )}
      </group>

      {/* Connection Points (visible in exploded view) */}
      {exploded && (
        <group ref={connectionPointsRef}>
          {/* Tile Connection Point - moved to side and underneath */}
          <mesh position={[tileConnectionPoint.x, tileConnectionPoint.y, tileConnectionPoint.z]}>
            <sphereGeometry args={[0.01, 8, 8]} />
            <meshStandardMaterial color="#444444" />
          </mesh>

          {/* Battery Connection Points */}
          <mesh position={[batteryConnectionPoint.x, batteryConnectionPoint.y, batteryConnectionPoint.z]}>
            <sphereGeometry args={[0.01, 8, 8]} />
            <meshStandardMaterial color="#444444" />
          </mesh>

          <mesh position={[batteryPosition.x + 0.05, batteryPosition.y + 0.02, batteryPosition.z]}>
            <sphereGeometry args={[0.01, 8, 8]} />
            <meshStandardMaterial color="#444444" />
          </mesh>

          <mesh position={[batteryPosition.x + 0.05, batteryPosition.y - 0.02, batteryPosition.z]}>
            <sphereGeometry args={[0.01, 8, 8]} />
            <meshStandardMaterial color="#444444" />
          </mesh>

          {/* Light Connection Point */}
          <mesh position={[lightConnectionPoint.x, lightConnectionPoint.y, lightConnectionPoint.z]}>
            <sphereGeometry args={[0.01, 8, 8]} />
            <meshStandardMaterial color="#444444" />
          </mesh>

          {/* USB Connection Point */}
          <mesh position={[usbConnectionPoint.x, usbConnectionPoint.y, usbConnectionPoint.z]}>
            <sphereGeometry args={[0.01, 8, 8]} />
            <meshStandardMaterial color="#444444" />
          </mesh>
        </group>
      )}

      {/* Wiring with smooth tubes - all coming from underneath the tile */}
      <group ref={wiringRef} position={[wiringPosition.x, wiringPosition.y, wiringPosition.z]}>
        {/* Live Wire (Red) - Tile to Battery - now from underneath */}
        <SmoothWire
          points={[
            new Vector3(tileConnectionPoint.x, tileConnectionPoint.y, tileConnectionPoint.z),
            new Vector3(tileConnectionPoint.x + 0.05, tileConnectionPoint.y - 0.05, tileConnectionPoint.z),
            new Vector3(batteryConnectionPoint.x - 0.05, batteryConnectionPoint.y - 0.03, batteryConnectionPoint.z),
            new Vector3(batteryConnectionPoint.x, batteryConnectionPoint.y, batteryConnectionPoint.z),
          ]}
          color="red"
          radius={0.005}
          label="Live Wire"
          showLabel={showLabels}
          labelPosition={new Vector3(0.05, -0.05, 0.05)}
        />

        {/* Neutral Wire (Blue) - Battery to Light */}
        <SmoothWire
          points={[
            new Vector3(batteryPosition.x + 0.05, batteryPosition.y + 0.02, batteryPosition.z),
            new Vector3(batteryPosition.x + 0.15, batteryPosition.y + 0.05, batteryPosition.z),
            new Vector3(lightConnectionPoint.x - 0.1, lightConnectionPoint.y, lightConnectionPoint.z),
            new Vector3(lightConnectionPoint.x, lightConnectionPoint.y, lightConnectionPoint.z),
          ]}
          color="blue"
          radius={0.005}
          label="Neutral Wire"
          showLabel={showLabels}
          labelPosition={new Vector3(0.25, 0, 0.05)}
        />

        {/* Ground Wire (Black) - Battery to USB */}
        <SmoothWire
          points={[
            new Vector3(batteryPosition.x + 0.05, batteryPosition.y - 0.02, batteryPosition.z),
            new Vector3(batteryPosition.x + 0.15, batteryPosition.y - 0.05, batteryPosition.z),
            new Vector3(usbConnectionPoint.x - 0.1, usbConnectionPoint.y, usbConnectionPoint.z),
            new Vector3(usbConnectionPoint.x, usbConnectionPoint.y, usbConnectionPoint.z),
          ]}
          color="black"
          radius={0.005}
          label="Ground Wire"
          showLabel={showLabels}
          labelPosition={new Vector3(0.25, -0.1, 0.05)}
        />

        {showLabels && (
          <Html position={[0.1, 0.05, 0]} center>
            <div className="bg-black/70 text-white px-2 py-1 rounded text-xs whitespace-nowrap">Wiring</div>
          </Html>
        )}
      </group>

      {/* Battery / Energy Storage */}
      <mesh
        ref={batteryRef}
        position={[batteryPosition.x, batteryPosition.y, batteryPosition.z]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[0.1, 0.05, 0.08]} />
        <meshStandardMaterial color="#555555" roughness={0.5} metalness={0.5} />
        {showLabels && (
          <Html position={[0, 0.05, 0]} center>
            <div className="bg-black/70 text-white px-2 py-1 rounded text-xs whitespace-nowrap">Energy Storage</div>
          </Html>
        )}
      </mesh>

      {/* Instructions */}
      <Html position={[-0.6, 0.2, 0]} center>
        <div className="bg-white/80 backdrop-blur-sm p-2 rounded shadow-md text-sm max-w-[150px] text-center">
          <p className="font-bold mb-1">Kinetic Energy-Harvesting Floor Tile</p>
          <p className="text-xs">Click on the tile to simulate a footstep and see the energy flow to the light bulb</p>
        </div>
      </Html>
    </group>
  )
}

// Smooth wire implementation using Tube geometry
function SmoothWire({
  points,
  color,
  radius = 0.005,
  tubularSegments = 64,
  radialSegments = 8,
  label,
  showLabel = true,
  labelPosition,
}: {
  points: Vector3[]
  color: string
  radius?: number
  tubularSegments?: number
  radialSegments?: number
  label?: string
  showLabel?: boolean
  labelPosition?: Vector3
}) {
  const curve = useMemo(() => new CatmullRomCurve3(points, false, "catmullrom", 0.5), [points])

  return (
    <>
      <mesh>
        <tubeGeometry args={[curve, tubularSegments, radius, radialSegments, false]} />
        <meshStandardMaterial color={color} roughness={0.3} />
      </mesh>

      {showLabel && label && labelPosition && (
        <Html position={[labelPosition.x, labelPosition.y, labelPosition.z]} center>
          <div className="bg-black/70 text-white px-2 py-1 rounded text-xs whitespace-nowrap">{label}</div>
        </Html>
      )}
    </>
  )
}
