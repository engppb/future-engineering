import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { supportsWebGL } from './webglSupport'

const MOBILE_QUERY = '(max-width: 700px), (pointer: coarse)'
const STEEL = '#9cabb3'
const DARK_STEEL = '#34434c'
const BLUE = '#4d9fca'
const GOLD = '#d2a847'

function createSurfaceTexture(size, baseValue, variation, seed) {
  const data = new Uint8Array(size * size * 4)
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const index = (y * size + x) * 4
      const grain = Math.sin((x + seed) * 12.9898 + (y + seed) * 78.233) * 43758.5453
      const noise = (grain - Math.floor(grain) - 0.5) * variation
      const value = THREE.MathUtils.clamp(baseValue + noise, 0, 255)
      data[index] = value
      data[index + 1] = value
      data[index + 2] = value
      data[index + 3] = 255
    }
  }

  const texture = new THREE.DataTexture(
    data,
    size,
    size,
    THREE.RGBAFormat,
    THREE.UnsignedByteType,
  )
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(3, 3)
  texture.minFilter = THREE.LinearMipmapLinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.generateMipmaps = true
  texture.needsUpdate = true
  return texture
}

const METAL_ROUGHNESS_MAP = createSurfaceTexture(128, 218, 34, 3)
const METAL_DETAIL_MAP = createSurfaceTexture(128, 128, 38, 17)

function createGearShape(teeth, outerRadius, rootRadius, holeRadius) {
  const shape = new THREE.Shape()
  for (let tooth = 0; tooth < teeth; tooth += 1) {
    const baseAngle = (tooth / teeth) * Math.PI * 2
    ;[-0.5, -0.3, -0.22, 0.22, 0.3, 0.5].forEach((fraction, index) => {
      const radius = index === 2 || index === 3 ? outerRadius : rootRadius
      const angle = baseAngle + (fraction / teeth) * Math.PI * 2
      const x = Math.cos(angle) * radius
      const y = Math.sin(angle) * radius
      if (tooth === 0 && index === 0) shape.moveTo(x, y)
      else shape.lineTo(x, y)
    })
  }
  shape.closePath()
  const hole = new THREE.Path()
  hole.absarc(0, 0, holeRadius, 0, Math.PI * 2, true)
  shape.holes.push(hole)
  return shape
}

function Gear({ radius, teeth, position, speed, reducedMotion }) {
  const gearRef = useRef(null)
  const shape = useMemo(
    () => createGearShape(teeth, radius, radius * 0.8, radius * 0.2),
    [radius, teeth],
  )

  useFrame((_, delta) => {
    if (!reducedMotion && gearRef.current) {
      gearRef.current.rotation.z += speed * Math.min(delta, 0.05)
    }
  })

  return (
    <group ref={gearRef} position={position}>
      <mesh position={[0, 0, -0.08]} castShadow>
        <extrudeGeometry
          args={[
            shape,
            {
              depth: 0.16,
              bevelEnabled: true,
              bevelThickness: 0.025,
              bevelSize: 0.02,
              bevelSegments: 2,
              curveSegments: 4,
            },
          ]}
        />
        <meshStandardMaterial
          color={STEEL}
          metalness={0.78}
          roughness={0.27}
          roughnessMap={METAL_ROUGHNESS_MAP}
          bumpMap={METAL_DETAIL_MAP}
          bumpScale={0.008}
        />
      </mesh>
      <mesh position={[0, 0, 0.095]}>
        <torusGeometry args={[radius * 0.54, radius * 0.055, 10, 48]} />
        <meshStandardMaterial color="#c0cbd0" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0, 0.1]}>
        <cylinderGeometry args={[radius * 0.18, radius * 0.18, 0.2, 24]} />
        <meshStandardMaterial color={DARK_STEEL} metalness={0.86} roughness={0.23} />
      </mesh>
      {Array.from({ length: 6 }, (_, index) => {
        const angle = (index / 6) * Math.PI * 2
        return (
          <mesh
            key={index}
            position={[
              Math.cos(angle) * radius * 0.32,
              Math.sin(angle) * radius * 0.32,
              0.11,
            ]}
            rotation={[0, 0, angle]}
          >
            <boxGeometry args={[radius * 0.34, 0.035, 0.035]} />
            <meshStandardMaterial color="#596974" metalness={0.88} roughness={0.25} />
          </mesh>
        )
      })}
    </group>
  )
}

function Bearing({ position, radius = 0.34, reducedMotion }) {
  const bearingRef = useRef(null)
  useFrame((state, delta) => {
    if (!reducedMotion && bearingRef.current) {
      bearingRef.current.rotation.y += delta * 0.12
      bearingRef.current.position.y =
        position[1] + Math.sin(state.clock.elapsedTime * 0.7 + position[0]) * 0.035
    }
  })

  return (
    <group ref={bearingRef} position={position}>
      <mesh>
        <torusGeometry args={[radius, 0.075, 16, 56]} />
        <meshStandardMaterial
          color={STEEL}
          metalness={0.92}
          roughness={0.2}
          roughnessMap={METAL_ROUGHNESS_MAP}
          bumpMap={METAL_DETAIL_MAP}
          bumpScale={0.006}
        />
      </mesh>
      <mesh position={[0, 0, 0.025]}>
        <torusGeometry args={[radius * 0.68, 0.034, 12, 48]} />
        <meshStandardMaterial color={BLUE} metalness={0.85} roughness={0.2} />
      </mesh>
      <mesh>
        <torusGeometry args={[radius * 0.42, 0.035, 12, 48]} />
        <meshStandardMaterial color="#c3cdd1" metalness={0.94} roughness={0.18} />
      </mesh>
      {Array.from({ length: 8 }, (_, index) => {
        const angle = (index / 8) * Math.PI * 2
        return (
          <mesh
            key={index}
            position={[
              Math.cos(angle) * radius * 0.54,
              Math.sin(angle) * radius * 0.54,
              0.035,
            ]}
          >
            <sphereGeometry args={[0.035, 10, 8]} />
            <meshStandardMaterial color="#d7dee1" metalness={0.94} roughness={0.16} />
          </mesh>
        )
      })}
    </group>
  )
}

function Shaft({ position, length = 2.4, radius = 0.08, reducedMotion }) {
  const shaftRef = useRef(null)
  useFrame((_, delta) => {
    if (!reducedMotion && shaftRef.current) {
      shaftRef.current.rotation.z += delta * 0.32
    }
  })
  return (
    <group ref={shaftRef} position={position}>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[radius, radius, length, 32]} />
        <meshStandardMaterial
          color="#aebbc1"
          metalness={0.92}
          roughness={0.2}
          roughnessMap={METAL_ROUGHNESS_MAP}
          bumpMap={METAL_DETAIL_MAP}
          bumpScale={0.006}
        />
      </mesh>
      {[-0.7, 0.7].map((x) => (
        <mesh key={x} position={[x, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[radius * 1.55, radius * 1.55, 0.09, 32]} />
          <meshStandardMaterial color={GOLD} metalness={0.78} roughness={0.28} />
        </mesh>
      ))}
    </group>
  )
}

function EngineeringAssembly({ reducedMotion }) {
  const assemblyRef = useRef(null)
  useFrame((state, delta) => {
    if (!reducedMotion && assemblyRef.current) {
      assemblyRef.current.rotation.y =
        Math.sin(state.clock.elapsedTime * 0.28) * 0.08
      assemblyRef.current.position.y =
        Math.sin(state.clock.elapsedTime * 0.48) * 0.035
      assemblyRef.current.rotation.x = THREE.MathUtils.damp(
        assemblyRef.current.rotation.x,
        0.08,
        2,
        Math.min(delta, 0.05),
      )
    }
  })
  return (
    <group ref={assemblyRef} rotation={[0.08, -0.12, -0.06]} scale={0.96}>
      <Gear
        teeth={18}
        radius={0.82}
        position={[-0.65, 0.2, 0]}
        speed={0.34}
        reducedMotion={reducedMotion}
      />
      <Gear
        teeth={12}
        radius={0.56}
        position={[0.72, -0.25, 0.05]}
        speed={-0.51}
        reducedMotion={reducedMotion}
      />
      <Bearing position={[-0.9, 0.82, 0.08]} radius={0.26} reducedMotion={reducedMotion} />
      <Shaft position={[0.1, -0.94, -0.12]} reducedMotion={reducedMotion} />
      <mesh position={[0.05, 0.94, -0.34]} rotation={[0, 0, -0.15]}>
        <boxGeometry args={[2.1, 0.08, 0.14]} />
        <meshStandardMaterial color={DARK_STEEL} metalness={0.78} roughness={0.3} />
      </mesh>
      <pointLight position={[-1.3, 1.2, 1]} color={BLUE} intensity={3} distance={4} />
    </group>
  )
}

function ProductionLoad({ variant }) {
  const bodyColors = ['#71858e', '#829199', '#637982']
  const accentColor = variant === 1 ? GOLD : BLUE

  return (
    <group>
      <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.46, 0.36, 0.42]} />
          <meshStandardMaterial
            color={bodyColors[variant]}
            metalness={0.56}
            roughness={0.34}
            roughnessMap={METAL_ROUGHNESS_MAP}
            bumpMap={METAL_DETAIL_MAP}
            bumpScale={0.004}
          />
      </mesh>
      <mesh position={[0, 0.075, 0]}>
          <boxGeometry args={[0.49, 0.045, 0.44]} />
          <meshStandardMaterial color="#283840" metalness={0.78} roughness={0.28} />
      </mesh>
      <mesh position={[0, 0.445, 0]}>
          <boxGeometry args={[0.48, 0.045, 0.44]} />
          <meshStandardMaterial color="#aab9bf" metalness={0.84} roughness={0.24} />
      </mesh>
      <mesh position={[0, 0.27, 0.215]}>
          <boxGeometry args={[0.28, 0.19, 0.012]} />
          <meshStandardMaterial
            color="#26363f"
            metalness={0.64}
            roughness={0.32}
            emissive={accentColor}
            emissiveIntensity={0.08}
          />
      </mesh>
      {[-0.17, 0.17].map((x) => (
          <mesh key={x} position={[x, 0.25, 0.222]}>
            <boxGeometry args={[0.025, 0.29, 0.018]} />
            <meshStandardMaterial color="#bdc8cc" metalness={0.82} roughness={0.26} />
          </mesh>
      ))}
      {[-0.17, 0.17].flatMap((x) =>
          [0.12, 0.4].map((y) => (
            <mesh key={`${x}-${y}`} position={[x, y, 0.232]}>
              <sphereGeometry args={[0.018, 12, 10]} />
              <meshStandardMaterial color={STEEL} metalness={0.86} roughness={0.24} />
            </mesh>
          )),
      )}
      <mesh position={[0, 0.27, 0.226]}>
          <boxGeometry args={[0.16, 0.018, 0.012]} />
          <meshStandardMaterial color={accentColor} metalness={0.44} roughness={0.32} />
      </mesh>
    </group>
  )
}

function DriveMotor() {
  return (
    <group position={[1.34, -0.57, -0.62]}>
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.18, 0.18, 0.42, 32]} />
          <meshStandardMaterial
            color="#42545d"
            metalness={0.72}
            roughness={0.3}
            roughnessMap={METAL_ROUGHNESS_MAP}
          />
      </mesh>
      {[-0.14, -0.08, -0.02, 0.04, 0.1].map((x) => (
          <mesh
            key={x}
            position={[x, 0, 0]}
            rotation={[0, Math.PI / 2, 0]}
          >
            <torusGeometry args={[0.177, 0.012, 8, 32]} />
            <meshStandardMaterial color="#9eacb2" metalness={0.86} roughness={0.24} />
          </mesh>
      ))}
      {[-0.23, 0.23].map((x) => (
          <mesh
            key={x}
            position={[x, 0, 0]}
            rotation={[0, 0, Math.PI / 2]}
          >
            <cylinderGeometry args={[0.15, 0.15, 0.045, 32]} />
            <meshStandardMaterial color="#28373f" metalness={0.74} roughness={0.3} />
          </mesh>
      ))}
      <mesh position={[0, 0.2, 0]}>
          <boxGeometry args={[0.17, 0.12, 0.16]} />
          <meshStandardMaterial color="#36464e" metalness={0.58} roughness={0.34} />
      </mesh>
      <mesh position={[0.34, -0.015, 0]}>
          <boxGeometry args={[0.3, 0.34, 0.32]} />
          <meshStandardMaterial color="#35474f" metalness={0.72} roughness={0.3} />
      </mesh>
      <mesh position={[0.51, -0.015, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.065, 0.065, 0.12, 24]} />
          <meshStandardMaterial color="#adb9be" metalness={0.9} roughness={0.22} />
      </mesh>
      {[-0.17, 0.17].map((x) => (
          <mesh key={x} position={[x, 0.2, 0]}>
            <boxGeometry args={[0.12, 0.08, 0.13]} />
            <meshStandardMaterial color="#9eacb2" metalness={0.8} roughness={0.28} />
          </mesh>
      ))}
      {[-0.16, 0.16].map((x) => (
          <mesh key={x} position={[x, 0.18, 0]}>
            <boxGeometry args={[0.075, 0.22, 0.08]} />
            <meshStandardMaterial color="#657780" metalness={0.78} roughness={0.3} />
          </mesh>
      ))}
      <mesh position={[0.02, -0.2, 0]}>
          <boxGeometry args={[0.53, 0.06, 0.4]} />
          <meshStandardMaterial color="#29383f" metalness={0.76} roughness={0.3} />
      </mesh>
    </group>
  )
}

function LineMonitor() {
  return (
    <group position={[1.55, 0.64, -0.61]}>
      <mesh position={[0, -0.49, 0]}>
          <boxGeometry args={[0.055, 0.62, 0.07]} />
          <meshStandardMaterial color="#657780" metalness={0.82} roughness={0.28} />
      </mesh>
      <mesh position={[0, -0.81, 0]}>
          <boxGeometry args={[0.18, 0.055, 0.2]} />
          <meshStandardMaterial color="#35464e" metalness={0.76} roughness={0.32} />
      </mesh>
      <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.58, 0.4, 0.09]} />
          <meshStandardMaterial color="#26363e" metalness={0.72} roughness={0.28} />
      </mesh>
      <mesh position={[0, 0, 0.052]}>
          <boxGeometry args={[0.5, 0.31, 0.015]} />
          <meshStandardMaterial
            color="#10232d"
            emissive="#15445d"
            emissiveIntensity={0.5}
            metalness={0.28}
            roughness={0.26}
          />
      </mesh>
      {[0.15, 0.22, 0.18, 0.27].map((height, index) => (
          <mesh
            key={index}
            position={[-0.14 + index * 0.085, -0.075 + height / 2, 0.064]}
          >
            <boxGeometry args={[0.045, height, 0.012]} />
            <meshStandardMaterial
              color={index === 3 ? GOLD : BLUE}
              emissive={index === 3 ? GOLD : BLUE}
              emissiveIntensity={0.28}
              metalness={0.32}
              roughness={0.3}
            />
          </mesh>
      ))}
      <mesh position={[0, 0.115, 0.064]}>
          <boxGeometry args={[0.32, 0.012, 0.012]} />
          <meshStandardMaterial color="#87b8cd" emissive={BLUE} emissiveIntensity={0.3} />
      </mesh>
    </group>
  )
}

function OperationsAssembly({ reducedMotion }) {
  const rollersRef = useRef([])
  const loadsRef = useRef([])
  const rollerCount = 10
  const loadTravel = 3.1

  useFrame((state, delta) => {
    if (reducedMotion) return
    const elapsed = state.clock.elapsedTime
    const frameDelta = Math.min(delta, 0.05)
    rollersRef.current.forEach((roller) => {
      if (roller) roller.rotation.z -= frameDelta * 2.8
    })
    loadsRef.current.forEach((load, index) => {
      if (load) {
          load.position.x =
            -loadTravel / 2 +
            ((elapsed * 0.28 + (index * loadTravel) / 3) % loadTravel)
      }
    })
  })

  return (
    <group rotation={[0.02, -0.06, 0]}>
      <mesh position={[0, -1.075, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[8, 5]} />
          <meshStandardMaterial color="#10181d" roughness={0.82} metalness={0.12} />
      </mesh>
      {[-0.64, 0.64].map((z) => (
          <group key={z}>
            <mesh position={[0, -0.21, z]} castShadow receiveShadow>
              <boxGeometry args={[3.92, 0.14, 0.14]} />
              <meshStandardMaterial
                color="#465b64"
                metalness={0.78}
                roughness={0.28}
                roughnessMap={METAL_ROUGHNESS_MAP}
              />
            </mesh>
            <mesh position={[0, -0.125, z]}>
              <boxGeometry args={[3.84, 0.025, 0.145]} />
              <meshStandardMaterial color="#91a2aa" metalness={0.88} roughness={0.22} />
            </mesh>
          </group>
      ))}
      <group>
          {[-1.72, 0, 1.72].map((x) => (
            <mesh key={x} position={[x, -0.32, 0]}>
              <boxGeometry args={[0.12, 0.12, 1.38]} />
              <meshStandardMaterial color="#465a63" metalness={0.76} roughness={0.3} />
            </mesh>
          ))}
      </group>
      <group>
          {[-1.28, 1.28].flatMap((x) =>
            [-0.55, 0.55].map((z) => (
              <group key={`${x}-${z}`}>
                <mesh position={[x, -0.645, z]} castShadow>
                  <boxGeometry args={[0.095, 0.73, 0.095]} />
                  <meshStandardMaterial color="#384a52" metalness={0.78} roughness={0.3} />
                </mesh>
                <mesh position={[x, -1.0375, z]}>
                  <boxGeometry args={[0.22, 0.055, 0.2]} />
                  <meshStandardMaterial color="#293940" metalness={0.72} roughness={0.32} />
                </mesh>
              </group>
            )),
          )}
          {[-0.55, 0.55].map((z) => (
            <mesh key={z} position={[0, -0.72, z]}>
              <boxGeometry args={[2.5, 0.065, 0.065]} />
              <meshStandardMaterial color="#465861" metalness={0.76} roughness={0.3} />
            </mesh>
          ))}
      </group>
      <group>
          {Array.from({ length: rollerCount }, (_, index) => {
            const x = -1.62 + index * 0.36
            return (
              <group
                key={index}
                ref={(roller) => {
                  rollersRef.current[index] = roller
                }}
                position={[x, -0.045, 0]}
              >
                <mesh rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
                  <cylinderGeometry args={[0.095, 0.095, 1.12, 28]} />
                  <meshStandardMaterial
                    color="#a8b5bb"
                    metalness={0.82}
                    roughness={0.25}
                    roughnessMap={METAL_ROUGHNESS_MAP}
                    bumpMap={METAL_DETAIL_MAP}
                    bumpScale={0.003}
                  />
                </mesh>
                <mesh position={[0, 0, 0.49]} rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.105, 0.105, 0.035, 24]} />
                  <meshStandardMaterial color="#40525b" metalness={0.76} roughness={0.28} />
                </mesh>
                <mesh position={[0, 0, -0.49]} rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.105, 0.105, 0.035, 24]} />
                  <meshStandardMaterial color="#40525b" metalness={0.76} roughness={0.28} />
                </mesh>
                {index % 2 === 0 && (
                  <mesh position={[0, 0.094, 0]} castShadow>
                    <boxGeometry args={[0.012, 0.008, 1.02]} />
                    <meshStandardMaterial color="#d1d9dc" metalness={0.76} roughness={0.24} />
                  </mesh>
                )}
              </group>
            )
          })}
      </group>
      {Array.from({ length: 3 }, (_, index) => (
          <group
            key={index}
            ref={(load) => {
              loadsRef.current[index] = load
            }}
            position={[-1.55 + (index * loadTravel) / 3, 0, 0]}
          >
            <ProductionLoad variant={index} />
          </group>
      ))}
      <DriveMotor />
      <LineMonitor />
      <directionalLight position={[-3, 3.5, 4]} color="#eaf4f8" intensity={2.1} />
      <directionalLight position={[2.5, 1.5, -2]} color="#4d9fca" intensity={1.35} />
      <pointLight position={[-2.2, 2.4, 3.2]} color="#d7e8ee" intensity={2.2} distance={7} />
      <pointLight position={[2.4, 1.4, 2.6]} color={BLUE} intensity={2.8} distance={6} />
      <pointLight position={[-1, 0.8, -2]} color="#527e96" intensity={2} distance={5} />
    </group>
  )
}

function SafetyHelmet({ position, reducedMotion }) {
  const ref = useRef(null)
  useFrame((state) => {
    if (!reducedMotion && ref.current) {
      ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.45) * 0.18
    }
  })
  return (
    <group ref={ref} position={position}>
      <mesh position={[0, 0.1, 0]}>
        <sphereGeometry args={[0.42, 32, 20, 0, Math.PI * 2, 0, Math.PI * 0.57]} />
        <meshPhysicalMaterial color="#d8ae36" metalness={0.34} roughness={0.3} clearcoat={0.6} />
      </mesh>
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.44, 0.44, 0.07, 40]} />
        <meshPhysicalMaterial color={GOLD} metalness={0.3} roughness={0.3} clearcoat={0.45} />
      </mesh>
      <mesh position={[0, 0.32, 0.02]}>
        <boxGeometry args={[0.09, 0.38, 0.08]} />
        <meshStandardMaterial color="#f0cf69" metalness={0.26} roughness={0.3} />
      </mesh>
      <mesh position={[0, -0.15, 0]}>
        <torusGeometry args={[0.34, 0.025, 8, 36]} />
        <meshStandardMaterial color="#26343c" metalness={0.52} roughness={0.32} />
      </mesh>
    </group>
  )
}

function SafetyGlasses() {
  const ref = useRef(null)
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y =
        0.18 + Math.sin(state.clock.elapsedTime * 0.56 + 0.8) * 0.035
      ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.34) * 0.12
    }
  })
  return (
    <group
      ref={ref}
      position={[-0.98, 0.18, 0.42]}
      rotation={[0.08, 0.15, -0.08]}
    >
      {[-0.21, 0.21].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh>
            <torusGeometry args={[0.17, 0.035, 12, 32]} />
            <meshStandardMaterial color="#34444e" metalness={0.86} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0, -0.025]}>
            <circleGeometry args={[0.15, 32]} />
            <meshPhysicalMaterial
              color="#438caf"
              transparent
              opacity={0.62}
              metalness={0.28}
              roughness={0.12}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      ))}
      <mesh>
        <boxGeometry args={[0.16, 0.045, 0.06]} />
        <meshStandardMaterial color={STEEL} metalness={0.78} roughness={0.22} />
      </mesh>
    </group>
  )
}

function SafetyVest() {
  const ref = useRef(null)
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = -0.1 + Math.sin(state.clock.elapsedTime * 0.32 + 1.5) * 0.1
      ref.current.position.y =
        0.02 + Math.sin(state.clock.elapsedTime * 0.48 + 1.5) * 0.04
    }
  })
  return (
    <group
      ref={ref}
      position={[0.76, 0.02, -0.16]}
      rotation={[0.04, -0.1, -0.06]}
    >
      <mesh>
        <boxGeometry args={[0.62, 0.88, 0.17]} />
        <meshPhysicalMaterial color="#cda52e" metalness={0.18} roughness={0.48} clearcoat={0.24} />
      </mesh>
      <mesh position={[-0.16, 0, 0.095]}>
        <boxGeometry args={[0.1, 0.82, 0.025]} />
        <meshStandardMaterial color="#dce6e8" metalness={0.5} roughness={0.25} />
      </mesh>
      <mesh position={[0.16, 0, 0.095]}>
        <boxGeometry args={[0.1, 0.82, 0.025]} />
        <meshStandardMaterial color="#dce6e8" metalness={0.5} roughness={0.25} />
      </mesh>
      <mesh position={[0, -0.14, 0.098]}>
        <boxGeometry args={[0.6, 0.07, 0.026]} />
        <meshStandardMaterial color="#dce6e8" metalness={0.5} roughness={0.25} />
      </mesh>
      <mesh position={[0, 0.49, 0]}>
        <boxGeometry args={[0.18, 0.17, 0.16]} />
        <meshPhysicalMaterial color="#cda52e" metalness={0.18} roughness={0.48} />
      </mesh>
    </group>
  )
}

function SafetyGlove() {
  const ref = useRef(null)
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.z = 0.2 + Math.sin(state.clock.elapsedTime * 0.42 + 2.4) * 0.1
      ref.current.position.y =
        -0.72 + Math.sin(state.clock.elapsedTime * 0.58 + 2.4) * 0.045
    }
  })
  return (
    <group
      ref={ref}
      position={[-0.82, -0.72, 0.32]}
      rotation={[0.1, 0.18, 0.2]}
    >
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[0.36, 0.42, 0.16]} />
        <meshStandardMaterial color="#37505c" metalness={0.32} roughness={0.52} />
      </mesh>
      {[-0.14, -0.045, 0.05, 0.145].map((x, index) => (
        <mesh key={x} position={[x, 0.23 + (index === 1 || index === 2 ? 0.05 : 0), 0]}>
          <capsuleGeometry args={[0.046, 0.21, 4, 8]} />
          <meshStandardMaterial color="#8398a1" metalness={0.38} roughness={0.44} />
        </mesh>
      ))}
      <mesh position={[0.23, -0.08, 0]} rotation={[0, 0, -0.7]}>
        <capsuleGeometry args={[0.05, 0.19, 4, 8]} />
        <meshStandardMaterial color="#8398a1" metalness={0.38} roughness={0.44} />
      </mesh>
    </group>
  )
}

function SafetyBoot({ position, reducedMotion }) {
  const ref = useRef(null)
  const soleMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#28363e', metalness: 0.28, roughness: 0.55 }),
    [],
  )
  const bootMaterial = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: '#394951', metalness: 0.36, roughness: 0.36, clearcoat: 0.28 }),
    [],
  )
  useFrame((state) => {
    if (!reducedMotion && ref.current) {
      ref.current.rotation.y =
        -0.14 + Math.sin(state.clock.elapsedTime * 0.34 + 3.2) * 0.08
      ref.current.position.y =
        position[1] + Math.sin(state.clock.elapsedTime * 0.48 + 3.2) * 0.035
    }
  })
  return (
    <group ref={ref} position={position} rotation={[0.02, -0.14, 0]}>
      <mesh position={[0, -0.22, 0]}>
        <boxGeometry args={[0.7, 0.14, 0.34]} />
        <primitive object={soleMaterial} attach="material" />
      </mesh>
      <mesh position={[-0.07, 0.04, -0.02]}>
        <boxGeometry args={[0.42, 0.46, 0.29]} />
        <primitive object={bootMaterial} attach="material" />
      </mesh>
      <mesh position={[0.14, -0.14, 0.12]}>
        <boxGeometry args={[0.38, 0.17, 0.19]} />
        <primitive object={bootMaterial} attach="material" />
      </mesh>
      <mesh position={[0.16, -0.04, 0.225]}>
        <boxGeometry args={[0.24, 0.11, 0.025]} />
        <meshStandardMaterial color={STEEL} metalness={0.8} roughness={0.22} />
      </mesh>
    </group>
  )
}

function SafetyAssembly({ reducedMotion }) {
  const assemblyRef = useRef(null)
  useFrame((state) => {
    if (!reducedMotion && assemblyRef.current) {
      assemblyRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.42) * 0.035
    }
  })
  return (
    <group ref={assemblyRef} rotation={[0.04, -0.12, 0]} scale={0.95}>
      <SafetyHelmet position={[-0.28, 0.68, 0]} reducedMotion={reducedMotion} />
      <SafetyGlasses />
      <SafetyVest />
      <SafetyGlove />
      <SafetyBoot
        position={[0.65, -0.7, 0.34]}
        reducedMotion={reducedMotion}
      />
      <pointLight position={[-0.3, 1.1, 1.1]} color="#e2bb53" intensity={2.2} distance={3.8} />
      <pointLight position={[1.2, 0.25, 0.5]} color={BLUE} intensity={2.2} distance={4} />
    </group>
  )
}

function SceneLighting({ shadows }) {
  return (
    <>
      <ambientLight intensity={0.55} />
      <hemisphereLight args={['#9bc7df', '#182128', 1.05]} />
      <directionalLight
        position={[-3.5, 4.5, 5]}
        intensity={3.2}
        color="#eaf4f8"
        castShadow={shadows}
        shadow-mapSize-width={512}
        shadow-mapSize-height={512}
        shadow-camera-left={-3}
        shadow-camera-right={3}
        shadow-camera-top={3}
        shadow-camera-bottom={-3}
        shadow-normalBias={0.035}
      />
      <directionalLight position={[3.5, -1.5, -3]} intensity={1.4} color="#3f79a0" />
      <pointLight position={[0, 2.8, 2]} intensity={1.6} color="#75b9df" distance={7} />
    </>
  )
}

function SceneContent({ index, reducedMotion, shadows, interactionRef }) {
  const sceneRef = useRef(null)
  const { camera, size } = useThree()

  useEffect(() => {
    const framing = [
      { width: 3.35, height: 2.45 },
      { width: 4.65, height: 2.75 },
      { width: 3.25, height: 3.3 },
    ][index]
    const halfFov = THREE.MathUtils.degToRad(camera.fov) / 2
    const distanceForHeight = framing.height / (2 * Math.tan(halfFov))
    const distanceForWidth =
      framing.width / (2 * Math.tan(halfFov) * (size.width / size.height))
    const framingMargin = index === 1 ? 1.05 : 1.08
    const distance = Math.max(5.8, distanceForHeight, distanceForWidth) * framingMargin
    const cameraAngle = index === 1 ? 0.22 : 0
    camera.position.set(
      distance * (index === 1 ? 0.45 : cameraAngle),
      index === 1 ? distance * 0.28 : 0,
      distance,
    )
    camera.lookAt(0, 0, 0)
    camera.updateProjectionMatrix()
  }, [camera, index, size.height, size.width])

  useFrame((state, delta) => {
    if (reducedMotion || !sceneRef.current) return
    const sway = Math.sin(state.clock.elapsedTime * 0.24) * 0.045
    const pointer = interactionRef.current
    const pointerX = pointer.active ? pointer.x : 0
    const pointerY = pointer.active ? pointer.y : 0
    const frameDelta = Math.min(delta, 0.05)

    sceneRef.current.position.x = THREE.MathUtils.damp(
      sceneRef.current.position.x,
      sway + pointerX * 0.055,
      1.8,
      frameDelta,
    )
    sceneRef.current.position.y = THREE.MathUtils.damp(
      sceneRef.current.position.y,
      pointerY * 0.035,
      1.8,
      frameDelta,
    )
    sceneRef.current.rotation.x = THREE.MathUtils.damp(
      sceneRef.current.rotation.x,
      pointerY * 0.035,
      1.6,
      frameDelta,
    )
    sceneRef.current.rotation.y = THREE.MathUtils.damp(
      sceneRef.current.rotation.y,
      pointerX * 0.055,
      1.6,
      frameDelta,
    )
  })

  return (
    <group ref={sceneRef}>
      <mesh position={[0, 0, -1.35]} receiveShadow>
        <planeGeometry args={[10, 8]} />
        <meshStandardMaterial
          color="#121b21"
          transparent
          opacity={0.54}
          roughness={0.78}
          metalness={0.18}
          roughnessMap={METAL_ROUGHNESS_MAP}
        />
      </mesh>
      <SceneLighting shadows={shadows} />
      {index === 0 && <EngineeringAssembly reducedMotion={reducedMotion} />}
      {index === 1 && <OperationsAssembly reducedMotion={reducedMotion} />}
      {index === 2 && <SafetyAssembly reducedMotion={reducedMotion} />}
    </group>
  )
}

function MobileFrameScheduler({ enabled }) {
  const { gl, invalidate } = useThree()

  useEffect(() => {
    if (!enabled) return undefined

    let visible = true
    const observer =
      typeof IntersectionObserver === 'undefined'
        ? null
        : new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting
          })
    observer?.observe(gl.domElement)

    const timer = window.setInterval(() => {
      if (visible && document.visibilityState === 'visible') invalidate()
    }, 1000 / 30)

    return () => {
      window.clearInterval(timer)
      observer?.disconnect()
    }
  }, [enabled, gl, invalidate])

  return null
}

export default function ServiceScene3D({
  index,
  active = true,
  interactionRef,
  onReady,
}) {
  const [isMobile, setIsMobile] = useState(() =>
    window.matchMedia(MOBILE_QUERY).matches,
  )
  const [reducedMotion, setReducedMotion] = useState(() =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    const mobileQuery = window.matchMedia(MOBILE_QUERY)
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updateMobile = () => setIsMobile(mobileQuery.matches)
    const updateMotion = () => setReducedMotion(motionQuery.matches)
    mobileQuery.addEventListener('change', updateMobile)
    motionQuery.addEventListener('change', updateMotion)
    return () => {
      mobileQuery.removeEventListener('change', updateMobile)
      motionQuery.removeEventListener('change', updateMotion)
    }
  }, [])

  return (
    <Canvas
      className="service-scene-canvas"
      camera={{ position: [0, 0, 5.8], fov: index === 1 ? 34 : 36 }}
      resize={{ offsetSize: true }}
      dpr={isMobile ? 1 : [1, 1.35]}
      frameloop={!active || isMobile || reducedMotion ? 'demand' : 'always'}
      gl={{
        alpha: true,
        antialias: !isMobile,
        powerPreference: 'low-power',
      }}
      shadows={isMobile ? false : 'percentage'}
      onCreated={({ invalidate }) => {
        onReady()
        if (reducedMotion || !active) invalidate()
      }}
      aria-hidden="true"
    >
      <MobileFrameScheduler enabled={active && isMobile && !reducedMotion} />
      <SceneContent
        index={index}
        reducedMotion={reducedMotion || !active}
        shadows={!isMobile}
        interactionRef={interactionRef}
      />
    </Canvas>
  )
}

function ContactAssembly({ reducedMotion }) {
  const gearRef = useRef(null)
  const ringRef = useRef(null)
  const gearShape = useMemo(() => createGearShape(24, 0.9, 0.72, 0.22), [])

  useFrame((state, delta) => {
    if (reducedMotion) return
    const frameDelta = Math.min(delta, 0.05)
    if (gearRef.current) gearRef.current.rotation.z += frameDelta * 0.18
    if (ringRef.current) ringRef.current.rotation.z -= frameDelta * 0.08
  })

  return (
    <group rotation={[0.04, -0.18, 0]} position={[0, 0, 0]}>
      <mesh position={[0, 0, -0.18]}>
        <cylinderGeometry args={[0.19, 0.19, 1.8, 32]} />
        <meshStandardMaterial color="#71838d" metalness={0.9} roughness={0.24} />
      </mesh>
      <group ref={gearRef} position={[-0.2, 0, 0]}>
        <mesh>
          <extrudeGeometry
            args={[
              gearShape,
              {
                depth: 0.15,
                bevelEnabled: true,
                bevelThickness: 0.025,
                bevelSize: 0.018,
                bevelSegments: 2,
              },
            ]}
          />
          <meshPhysicalMaterial
            color="#aebbc1"
            metalness={0.9}
            roughness={0.24}
            clearcoat={0.35}
          />
        </mesh>
        <mesh position={[0, 0, 0.095]}>
          <torusGeometry args={[0.43, 0.045, 12, 48]} />
          <meshStandardMaterial color="#4d9fca" metalness={0.86} roughness={0.2} />
        </mesh>
      </group>
      <mesh ref={ringRef} position={[0.68, 0.55, -0.02]}>
        <torusGeometry args={[0.36, 0.065, 16, 56]} />
        <meshStandardMaterial
          color="#d2a847"
          metalness={0.78}
          roughness={0.27}
          emissive="#6e521b"
          emissiveIntensity={0.16}
        />
      </mesh>
      <mesh position={[0.68, 0.55, 0.05]}>
        <torusGeometry args={[0.2, 0.025, 12, 40]} />
        <meshStandardMaterial color="#bbc7cc" metalness={0.94} roughness={0.19} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 1.2, -0.7, -0.1]}>
          <sphereGeometry args={[0.08, 16, 12]} />
          <meshStandardMaterial color="#69afd1" metalness={0.78} roughness={0.24} />
        </mesh>
      ))}
    </group>
  )
}

export function ContactScene3D({ reducedMotion = false }) {
  const [isMobile, setIsMobile] = useState(() =>
    window.matchMedia(MOBILE_QUERY).matches,
  )

  useEffect(() => {
    const mobileQuery = window.matchMedia(MOBILE_QUERY)
    const updateMobile = () => setIsMobile(mobileQuery.matches)
    mobileQuery.addEventListener('change', updateMobile)
    return () => mobileQuery.removeEventListener('change', updateMobile)
  }, [])

  if (!supportsWebGL()) return null

  return (
    <Canvas
      className="contact-scene-canvas"
      camera={{ position: [0, 0, 5.3], fov: 36 }}
      dpr={[1, 1.25]}
      frameloop={isMobile || reducedMotion ? 'demand' : 'always'}
      gl={{ alpha: true, antialias: false, powerPreference: 'low-power' }}
      aria-hidden="true"
    >
      <MobileFrameScheduler enabled={isMobile && !reducedMotion} />
      <ambientLight intensity={0.8} />
      <directionalLight position={[3, 4, 5]} intensity={2.2} color="#d6e5ec" />
      <pointLight position={[-2, 1.4, 2]} intensity={1.4} color="#4d9fca" />
      <ContactAssembly reducedMotion={reducedMotion} />
    </Canvas>
  )
}
