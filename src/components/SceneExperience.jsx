import { lazy, Suspense, useEffect, useState } from 'react'
import StaticMechanicalScene from './StaticMechanicalScene'

const MechanicalScene = lazy(() => import('./MechanicalScene'))

function supportsWebGL() {
  const canvas = document.createElement('canvas')
  return Boolean(
    canvas.getContext('webgl2', { powerPreference: 'low-power' }) ||
      canvas.getContext('webgl', { powerPreference: 'low-power' }),
  )
}

function shouldUseFallback() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return true
  }

  const reducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches
  const limitedMemory =
    typeof navigator.deviceMemory === 'number' && navigator.deviceMemory <= 4
  const limitedCores =
    typeof navigator.hardwareConcurrency === 'number' &&
    navigator.hardwareConcurrency <= 4

  return !supportsWebGL() || reducedMotion || limitedMemory || limitedCores
}

export default function SceneExperience() {
  const [useFallback, setUseFallback] = useState(shouldUseFallback)

  useEffect(() => {
    const motionPreference = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    )
    const updateRenderingMode = () => setUseFallback(shouldUseFallback())

    motionPreference.addEventListener('change', updateRenderingMode)
    return () => motionPreference.removeEventListener('change', updateRenderingMode)
  }, [])

  if (useFallback) return <StaticMechanicalScene />

  return (
    <Suspense fallback={<StaticMechanicalScene />}>
      <MechanicalScene />
    </Suspense>
  )
}
