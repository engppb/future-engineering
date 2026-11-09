import { lazy, Suspense, useEffect, useState } from 'react'
import StaticMechanicalScene from './StaticMechanicalScene'
import { supportsWebGL } from './webglSupport'

const MechanicalScene = lazy(() => import('./MechanicalScene'))

function prefersReducedMotion() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return true
  }

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export default function SceneExperience({ active = true }) {
  const [useFallback] = useState(() => !supportsWebGL())
  const [reducedMotion, setReducedMotion] = useState(prefersReducedMotion)

  useEffect(() => {
    const motionPreference = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    )
    const updateMotionPreference = () =>
      setReducedMotion(motionPreference.matches)

    motionPreference.addEventListener('change', updateMotionPreference)
    return () =>
      motionPreference.removeEventListener('change', updateMotionPreference)
  }, [])

  if (useFallback) return <StaticMechanicalScene />

  return (
    <Suspense fallback={<StaticMechanicalScene />}>
      <MechanicalScene active={active} reducedMotion={reducedMotion} />
    </Suspense>
  )
}
