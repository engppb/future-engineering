import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { sceneMotion } from '../animations/sceneMotion'

const BASE_BLUE_LIGHT = new THREE.Color('#3186c9')
const ENVIRONMENT_BLUE_LIGHT = new THREE.Color('#53a4ca')
const MOBILE_QUERY = '(max-width: 700px), (pointer: coarse)'

function createGearShape(teeth, outerRadius, rootRadius, holeRadius) {
  const shape = new THREE.Shape()

  for (let tooth = 0; tooth < teeth; tooth += 1) {
    const baseAngle = (tooth / teeth) * Math.PI * 2
    const points = [
      [-0.5, rootRadius],
      [-0.31, rootRadius],
      [-0.23, outerRadius],
      [0.23, outerRadius],
      [0.31, rootRadius],
      [0.5, rootRadius],
    ]

    points.forEach(([fraction, radius], index) => {
      const angle = baseAngle + (fraction / teeth) * Math.PI * 2
      const x = Math.cos(angle) * radius
      const y = Math.sin(angle) * radius

      if (tooth === 0 && index === 0) shape.moveTo(x, y)
      else shape.lineTo(x, y)
    })
  }

  shape.closePath()

  const centerHole = new THREE.Path()
  centerHole.absarc(0, 0, holeRadius, 0, Math.PI * 2, true)
  shape.holes.push(centerHole)

  return shape
}

function Bearing({ radius, z }) {
  return (
    <group position={[0, 0, z]}>
      <mesh>
        <torusGeometry args={[radius, 0.045, 12, 48]} />
        <meshStandardMaterial
          color="#a6b0b6"
          metalness={0.92}
          roughness={0.24}
        />
      </mesh>
      <mesh position={[0, 0, 0.012]}>
        <torusGeometry args={[radius * 0.69, 0.018, 10, 40]} />
        <meshStandardMaterial
          color="#52616c"
          metalness={0.88}
          roughness={0.3}
        />
      </mesh>
    </group>
  )
}

function Gear({
  teeth,
  radius,
  rootRadius,
  holeRadius,
  position,
  speed,
  offset,
  reducedMotion,
}) {
  const groupRef = useRef(null)
  const gearShape = useMemo(
    () => createGearShape(teeth, radius, rootRadius, holeRadius),
    [teeth, radius, rootRadius, holeRadius],
  )
  const geometryOptions = useMemo(
    () => ({
      depth: 0.22,
      bevelEnabled: true,
      bevelThickness: 0.035,
      bevelSize: 0.025,
      bevelSegments: 2,
      curveSegments: 4,
    }),
    [],
  )

  useFrame((_, delta) => {
    if (groupRef.current && !reducedMotion) {
      groupRef.current.rotation.z += speed * Math.min(delta, 0.05)
    }
  })

  return (
    <group ref={groupRef} position={position} rotation={[0, 0, offset]}>
      <mesh position={[0, 0, -0.11]} castShadow receiveShadow>
        <extrudeGeometry args={[gearShape, geometryOptions]} />
        <meshPhysicalMaterial
          color="#aab5bb"
          metalness={0.72}
          roughness={0.26}
          clearcoat={0.25}
          clearcoatRoughness={0.24}
        />
      </mesh>

      <mesh position={[0, 0, 0.035]}>
        <torusGeometry args={[radius * 0.57, 0.035, 12, 64]} />
        <meshStandardMaterial
          color="#b4bec2"
          metalness={0.92}
          roughness={0.24}
        />
      </mesh>

      {Array.from({ length: 6 }, (_, index) => {
        const angle = (index / 6) * Math.PI * 2
        const spokeLength = radius * 0.36
        const spokeCenter = radius * 0.37

        return (
          <mesh
            key={index}
            position={[
              Math.cos(angle) * spokeCenter,
              Math.sin(angle) * spokeCenter,
              0.005,
            ]}
            rotation={[0, 0, angle]}
          >
            <boxGeometry args={[spokeLength, 0.045, 0.045]} />
            <meshStandardMaterial
              color="#65737d"
              metalness={0.9}
              roughness={0.27}
            />
          </mesh>
        )
      })}

      <Bearing radius={holeRadius * 1.28} z={0.16} />
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.19]}>
        <cylinderGeometry args={[holeRadius * 0.48, holeRadius * 0.48, 0.5, 32]} />
        <meshStandardMaterial
          color="#41505b"
          metalness={0.91}
          roughness={0.24}
        />
      </mesh>
      <mesh position={[0, 0, 0.45]}>
        <torusGeometry args={[holeRadius * 0.4, 0.018, 10, 32]} />
        <meshStandardMaterial
          color="#d1a947"
          metalness={0.78}
          roughness={0.3}
          emissive="#362a08"
        />
      </mesh>
    </group>
  )
}

function MechanicalAssembly({
  blueLightRef,
  warmLightRef,
  interactionRef,
  reducedMotion,
}) {
  const assemblyRef = useRef(null)
  const { size } = useThree()

  useFrame(({ pointer, camera }, delta) => {
    const frameDelta = Math.min(delta, 0.05)
    const interaction = interactionRef.current
    const scrollProgress = sceneMotion.scrollProgress
    const environmentProgress = sceneMotion.environmentProgress
    const targetX = pointer.x * 0.16 + scrollProgress * 0.12
    const targetY = pointer.y * 0.1 + scrollProgress * 0.12
    const aspect = Math.max(size.width / Math.max(size.height, 1), 0.7)
    const cameraDistance = Math.max(
      6.25,
      4.5 /
        (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * aspect),
    )

    camera.position.x = THREE.MathUtils.damp(
      camera.position.x,
      targetX,
      3,
      frameDelta,
    )
    camera.position.y = THREE.MathUtils.damp(
      camera.position.y,
      targetY,
      3,
      frameDelta,
    )
    camera.position.z = THREE.MathUtils.damp(
      camera.position.z,
      cameraDistance - scrollProgress * 0.32,
      3,
      frameDelta,
    )
    camera.lookAt(targetX * 0.18, targetY * 0.16, 0)

    if (assemblyRef.current) {
      assemblyRef.current.rotation.x = THREE.MathUtils.damp(
        assemblyRef.current.rotation.x,
        0.08 +
          pointer.y * 0.035 +
          scrollProgress * 0.04 +
          interaction.rotationX +
          interaction.orientationX,
        3,
        frameDelta,
      )
      assemblyRef.current.rotation.y = THREE.MathUtils.damp(
        assemblyRef.current.rotation.y,
        -0.12 +
          pointer.x * 0.07 +
          scrollProgress * 0.14 +
          interaction.rotationY +
          interaction.orientationY,
        3,
        frameDelta,
      )
    }

    if (blueLightRef.current) {
      blueLightRef.current.color.lerpColors(
        BASE_BLUE_LIGHT,
        ENVIRONMENT_BLUE_LIGHT,
        environmentProgress,
      )
      blueLightRef.current.intensity = 30 - environmentProgress * 9
    }

    if (warmLightRef.current) {
      warmLightRef.current.intensity = 8 + environmentProgress * 6
    }
  })

  return (
    <group
      ref={assemblyRef}
      rotation={[0.08, -0.12, -0.08]}
      position={[0, -0.02, 0]}
      scale={1.14}
    >
      <Gear
        teeth={18}
        radius={1.04}
        rootRadius={0.84}
        holeRadius={0.22}
        position={[-0.76, 0.3, 0]}
        speed={0.32}
        offset={0}
        reducedMotion={reducedMotion}
      />
      <Gear
        teeth={12}
        radius={0.72}
        rootRadius={0.57}
        holeRadius={0.16}
        position={[0.91, -0.36, 0.025]}
        speed={-0.48}
        offset={Math.PI / 12}
        reducedMotion={reducedMotion}
      />
      <mesh position={[0.08, 0.94, -0.3]} rotation={[0, 0, -0.2]}>
        <boxGeometry args={[1.46, 0.055, 0.08]} />
        <meshStandardMaterial
          color="#35434c"
          metalness={0.75}
          roughness={0.35}
        />
      </mesh>
      <mesh position={[-0.14, -1.02, -0.3]} rotation={[0, 0, -0.2]}>
        <boxGeometry args={[1.28, 0.055, 0.08]} />
        <meshStandardMaterial
          color="#35434c"
          metalness={0.75}
          roughness={0.35}
        />
      </mesh>
    </group>
  )
}

function MobileFrameScheduler({ enabled }) {
  const { gl, invalidate } = useThree()

  useEffect(() => {
    if (!enabled) return undefined

    let isVisible = true
    const observer =
      typeof IntersectionObserver === 'undefined'
        ? null
        : new IntersectionObserver(([entry]) => {
            isVisible = entry.isIntersecting
          })

    observer?.observe(gl.domElement)

    const timer = window.setInterval(() => {
      if (isVisible && document.visibilityState === 'visible') invalidate()
    }, 1000 / 30)

    return () => {
      window.clearInterval(timer)
      observer?.disconnect()
    }
  }, [enabled, gl, invalidate])

  return null
}

export default function MechanicalScene({ reducedMotion = false }) {
  const blueLightRef = useRef(null)
  const warmLightRef = useRef(null)
  const invalidateRef = useRef(() => {})
  const interactionRef = useRef({
    rotationX: 0,
    rotationY: 0,
    orientationX: 0,
    orientationY: 0,
  })
  const dragRef = useRef(null)
  const [isMobile, setIsMobile] = useState(() =>
    window.matchMedia(MOBILE_QUERY).matches,
  )

  useEffect(() => {
    const mobilePreference = window.matchMedia(MOBILE_QUERY)
    const updateDeviceClass = () => setIsMobile(mobilePreference.matches)

    mobilePreference.addEventListener('change', updateDeviceClass)
    return () =>
      mobilePreference.removeEventListener('change', updateDeviceClass)
  }, [])

  useEffect(() => {
    const orientationApi = window.DeviceOrientationEvent
    if (
      reducedMotion ||
      typeof orientationApi === 'undefined' ||
      typeof orientationApi.requestPermission === 'function'
    ) {
      return undefined
    }

    let baselineBeta
    let baselineGamma
    const handleOrientation = (event) => {
      if (event.beta === null || event.gamma === null) return

      baselineBeta ??= event.beta
      baselineGamma ??= event.gamma
      interactionRef.current.orientationX = THREE.MathUtils.clamp(
        ((event.beta - baselineBeta) / 45) * 0.18,
        -0.18,
        0.18,
      )
      interactionRef.current.orientationY = THREE.MathUtils.clamp(
        ((event.gamma - baselineGamma) / 45) * 0.24,
        -0.24,
        0.24,
      )
      invalidateRef.current()
    }

    window.addEventListener('deviceorientation', handleOrientation)
    return () =>
      window.removeEventListener('deviceorientation', handleOrientation)
  }, [reducedMotion])

  const handlePointerDown = (event) => {
    if (event.pointerType !== 'touch') return

    dragRef.current = { x: event.clientX, y: event.clientY }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event) => {
    invalidateRef.current()
    if (event.pointerType !== 'touch' || !dragRef.current) return

    const deltaX = event.clientX - dragRef.current.x
    const deltaY = event.clientY - dragRef.current.y
    dragRef.current = { x: event.clientX, y: event.clientY }
    interactionRef.current.rotationY = THREE.MathUtils.clamp(
      interactionRef.current.rotationY - deltaX * 0.006,
      -0.5,
      0.5,
    )
    interactionRef.current.rotationX = THREE.MathUtils.clamp(
      interactionRef.current.rotationX + deltaY * 0.004,
      -0.35,
      0.35,
    )
  }

  const handlePointerEnd = (event) => {
    dragRef.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  return (
    <div
      className="scene-canvas-container"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
    >
      <Canvas
        className="scene-canvas"
        camera={{ position: [0, 0, 6.25], fov: 36 }}
        dpr={isMobile ? 1 : [1, 1.5]}
        frameloop={isMobile || reducedMotion ? 'demand' : 'always'}
        gl={{
          alpha: true,
          antialias: !isMobile,
          powerPreference: 'low-power',
        }}
        onCreated={({ invalidate }) => {
          invalidateRef.current = invalidate
        }}
        aria-label="Visualização 3D de engrenagens metálicas interligadas"
      >
        <MobileFrameScheduler enabled={isMobile && !reducedMotion} />
        <ambientLight intensity={1.15} />
        <directionalLight
          position={[-3.5, 4.5, 5]}
          intensity={4}
          color="#eef5f8"
        />
        <pointLight
          ref={blueLightRef}
          position={[3.5, 1.2, 3]}
          intensity={30}
          color="#3186c9"
        />
        <pointLight position={[-3, -2.2, 1.5]} intensity={14} color="#234e78" />
        <pointLight
          ref={warmLightRef}
          position={[0, 3.2, -1]}
          intensity={8}
          color="#d3a13e"
        />
        <MechanicalAssembly
          blueLightRef={blueLightRef}
          warmLightRef={warmLightRef}
          interactionRef={interactionRef}
          reducedMotion={reducedMotion}
        />
      </Canvas>
    </div>
  )
}
