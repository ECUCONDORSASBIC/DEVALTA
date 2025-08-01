'use client'
import { Suspense, useState, useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, Environment, Html } from '@react-three/drei'
import { HospitalClinicas } from '@/components/HospitalClinicas'
import * as THREE from 'three'

// Componente para el fondo del hospital
function HospitalBackground() {
  const { scene } = useThree()
  
  useEffect(() => {
    // Fondo que simule el entorno del Hospital de Clínicas
    const skyColor = new THREE.Color('#87CEEB')
    scene.background = skyColor
  }, [scene])

  return null
}

function LoadingScreen({ show }: { show: boolean }) {
  if (!show) return null
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-900 to-green-900">
      <div className="text-center text-white">
        <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-blue-400 mx-auto mb-6"></div>
        <h2 className="text-2xl font-bold mb-2">Cargando Hospital de Clínicas</h2>
        <p className="text-lg mb-2">Preparando modelo 3D del Hospital José de San Martín...</p>
        <p className="text-sm text-blue-200">Incluyendo ventanas características</p>
      </div>
    </div>
  )
}

export default function Hospital3DPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)
    
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="w-full h-screen bg-gradient-to-b from-blue-100 to-green-100 relative overflow-hidden">
      <LoadingScreen show={isLoading} />
      
      {!isLoading && !error && (
        <Canvas
          camera={{ 
            position: [0, 10, 20], 
            fov: 45,
            near: 0.1,
            far: 1000
          }}
          gl={{ 
            preserveDrawingBuffer: false,
            powerPreference: 'high-performance',
            antialias: true,
            alpha: false,
            depth: true,
            stencil: false,
            failIfMajorPerformanceCaveat: false
          }}
          shadows
          style={{ background: 'linear-gradient(to bottom, #87CEEB, #90EE90)' }}
          onCreated={({ gl }) => {
            // Configuración optimizada del renderer
            gl.setPixelRatio(Math.min(window.devicePixelRatio, 2))
            gl.shadowMap.enabled = true
            gl.shadowMap.type = THREE.PCFSoftShadowMap
            gl.toneMapping = THREE.NoToneMapping
            gl.outputColorSpace = THREE.SRGBColorSpace
            gl.setClearColor('#87CEEB')
          }}
        >
          <ambientLight intensity={0.6} color="#ffffff" />
          <directionalLight 
            position={[10, 10, 10]} 
            intensity={1.2}
            color="#ffffff"
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <pointLight position={[-10, 10, 10]} intensity={0.8} color="#88ccff" />
          <pointLight position={[10, 10, -10]} intensity={0.6} color="#ffcc88" />
          
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={5}
            maxDistance={50}
            minPolarAngle={0}
            maxPolarAngle={Math.PI / 2}
            target={[0, 5, 0]}
            autoRotate={true}
            autoRotateSpeed={0.5}
          />
          
          <HospitalBackground />
          
          {/* Suelo para sombras */}
          <mesh receiveShadow position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[100, 100]} />
            <shadowMaterial opacity={0.3} />
          </mesh>
          
          <Suspense fallback={null}>
            <HospitalClinicas />
          </Suspense>
        </Canvas>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-900/90 text-white z-50">
          <div className="text-center max-w-md p-8">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold mb-4">Error de Carga</h2>
            <p className="text-lg mb-6">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              🔄 Recargar Página
            </button>
          </div>
        </div>
      )}
      
      {!isLoading && !error && (
        <div className="absolute top-6 left-6 bg-white/95 backdrop-blur-sm text-gray-800 p-5 rounded-xl shadow-lg border border-gray-200 max-w-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            <h1 className="text-xl font-bold">Hospital de Clínicas 3D</h1>
          </div>
          
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">🏥</span>
              <span className="font-semibold text-blue-800">José de San Martín</span>
            </div>
            <p className="text-xs text-blue-600">Modelo 3D con ventanas características</p>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span>🖱️</span>
              <span>Arrastra para rotar</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🔍</span>
              <span>Rueda para zoom</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🪟</span>
              <span>Ventanas con efectos de luz</span>
            </div>
            <div className="flex items-center gap-2">
              <span>⚡</span>
              <span>Rotación automática activa</span>
            </div>
          </div>
          
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-600">
              📍 Ubicación: Avenida Córdoba, Buenos Aires
            </p>
            <p className="text-xs text-gray-600">
              🏗️ Arquitectura: Estilo clásico hospitalario
            </p>
            <p className="text-xs text-gray-600">
              🪟 Ventanas: Características del edificio real
            </p>
          </div>
        </div>
      )}
      
      {!isLoading && !error && (
        <div className="absolute bottom-6 right-6 bg-black/70 text-white p-3 rounded-lg text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span>Hospital renderizado con ventanas</span>
          </div>
        </div>
      )}
    </div>
  )
} 