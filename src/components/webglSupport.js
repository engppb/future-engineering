export function supportsWebGL() {
  if (typeof document === 'undefined') return false

  const canvas = document.createElement('canvas')
  return Boolean(
    canvas.getContext('webgl2', { powerPreference: 'low-power' }) ||
      canvas.getContext('webgl', { powerPreference: 'low-power' }),
  )
}
