import { Environment } from '@react-three/drei'
import { useState, useEffect, Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

interface SafeEnvironmentProps {
  preset?: string
  background?: boolean
  resolution?: number
  fallbackPreset?: string
}

// Componente de iluminación manual como fallback
function ManualLighting() {
  return (
    <>
      <ambientLight intensity={0.6} color="#ffffff" />
      <directionalLight 
        position={[5, 5, 5]} 
        intensity={1}
        color="#ffffff"
      />
      <pointLight position={[-5, 5, 5]} intensity={0.5} color="#88ccff" />
      <hemisphereLight 
        intensity={0.3} 
        groundColor="#404040" 
        color="#ffffff" 
      />
    </>
  )
}

// Componente Environment con manejo de errores
function EnvironmentWithErrorHandling({ 
  preset = "sunset", 
  background = false, 
  resolution = 256 
}: SafeEnvironmentProps) {
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    // Resetear estado cuando cambia el preset
    setHasError(false)
  }, [preset])

  if (hasError) {
    console.warn(`Error loading Environment preset: ${preset}, using manual lighting`)
    return <ManualLighting />
  }

  return (
    <ErrorBoundary
      fallback={<ManualLighting />}
      onError={(error) => {
        console.warn(`Environment error: ${error.message}`)
        setHasError(true)
      }}
    >
      <Suspense fallback={<ManualLighting />}>
        <Environment 
          preset={preset}
          background={background}
          resolution={resolution}
        />
      </Suspense>
    </ErrorBoundary>
  )
}

export default function SafeEnvironment(props: SafeEnvironmentProps) {
  return <EnvironmentWithErrorHandling {...props} />
}

// Exportar también la iluminación manual para uso directo
export { ManualLighting } 