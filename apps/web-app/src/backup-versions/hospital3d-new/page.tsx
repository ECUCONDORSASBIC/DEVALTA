'use client'
import { Suspense, useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, useGLTF } from '@react-three/drei'

// Componente simple para cargar el hospital
function Hospital() {
  const { scene } = useGLTF('/models/hospital.glb')
  return <primitive object={scene} />
}

// Componente de carga simple fuera del Canvas
function LoadingScreen({ show }: { show: boolean }) {
  if (!show) return null
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900">
      <div className="text-center text-white">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-lg mb-2">Cargando Hospital 3D...</p>
        <p className="text-sm text-gray-400">Preparando modelo 3D...</p>
      </div>
    </div>
  )
}

export default function Hospital3DNewPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  
  useEffect(() => {
    // Suprimir warnings de passive listeners solo en desarrollo
    if (process.env.NODE_ENV === 'development') {
      const originalWarn = console.warn
      console.warn = (...args) => {
        const message = args.join(' ')
        if (message.includes('passive event listener') || message.includes('scroll-blocking')) {
          return // Suprimir estos warnings
        }
        originalWarn(...args)
      }
    }
    
    // Simular carga inicial
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)
    
    return () => clearTimeout(timer)
  }, [])
  
  return (
    <div className="w-full h-screen bg-gray-900">
      <LoadingScreen show={isLoading} />
      
      {!isLoading && (
        <Canvas
          camera={{ position: [0, 5, 10], fov: 60 }}
          gl={{ 
            preserveDrawingBuffer: true,
            powerPreference: 'high-performance',
            antialias: true,
            alpha: false,
            depth: true,
            stencil: false
          }}
          shadows
          onCreated={({ gl }) => {
            // Configurar el renderer para mejor estabilidad
            gl.setPixelRatio(Math.min(window.devicePixelRatio, 2))
            gl.shadowMap.enabled = true
            gl.shadowMap.type = 2 // PCFSoftShadowMap
            
            // Manejo de contexto perdido
            gl.domElement.addEventListener('webglcontextlost', (event) => {
              event.preventDefault()
              console.warn('WebGL context lost, attempting recovery...')
              setError('Context lost, reloading...')
              setTimeout(() => {
                window.location.reload()
              }, 1000)
            })
          }}
        >
          {/* Iluminación básica */}
          <ambientLight intensity={0.4} />
          <directionalLight 
            position={[10, 10, 5]} 
            intensity={1}
            castShadow
          />
          
          {/* Entorno */}
          <Environment preset="city" />
          
          {/* Controles de cámara */}
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={2}
            maxDistance={50}
            zoomSpeed={0.5}
            panSpeed={0.8}
            rotateSpeed={0.8}
          />
          
          {/* Hospital 3D */}
          <Suspense fallback={null}>
            <Hospital />
          </Suspense>
        </Canvas>
      )}
      
      {/* Error message */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-900/80 text-white">
          <div className="text-center">
            <p className="text-xl mb-4">⚠️ {error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
            >
              Recargar
            </button>
          </div>
        </div>
      )}
      
      {/* Información básica */}
      {!isLoading && !error && (
        <div className="absolute top-4 left-4 bg-black/50 text-white p-4 rounded-lg">
          <h1 className="text-xl font-bold mb-2">Hospital 3D - Vista Simple</h1>
          <p className="text-sm">
            • Arrastra para rotar<br/>
            • Rueda para zoom<br/>
            • Clic derecho para mover
          </p>
        </div>
      )}
    </div>
  )
}

// Precargar el modelo
useGLTF.preload('/models/hospital.glb')
