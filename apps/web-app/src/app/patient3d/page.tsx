'use client'
import { Suspense, useState, useEffect, useRef, useCallback } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, useGLTF, Environment, Html } from '@react-three/drei'
import * as THREE from 'three'
import SafeEnvironment from '@/components/ui/SafeEnvironment'

// Componente optimizado para evitar errores de Three.js
function OptimizedPatient3D() {
  const { scene, animations } = useGLTF('/models/patient.glb')
  const mixerRef = useRef<THREE.AnimationMixer | null>(null)
  const [currentAnimation, setCurrentAnimation] = useState<string>('')
  const [animationList, setAnimationList] = useState<string[]>([])

  // Optimización de materiales con manejo de errores
  const optimizeMaterials = useCallback((scene: THREE.Group) => {
    try {
      scene.traverse((child) => {
        if (child.isMesh) {
          child.frustumCulled = true
          child.castShadow = false // Deshabilitado para evitar problemas
          child.receiveShadow = false

          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(mat => {
                if (mat.map) {
                  mat.map.minFilter = THREE.LinearFilter
                  mat.map.magFilter = THREE.LinearFilter
                  mat.map.generateMipmaps = false // Deshabilitado para evitar warnings
                  mat.map.needsUpdate = true
                }
                mat.needsUpdate = true
              })
            } else {
              if (child.material.map) {
                child.material.map.minFilter = THREE.LinearFilter
                child.material.map.magFilter = THREE.LinearFilter
                child.material.map.generateMipmaps = false
                child.material.map.needsUpdate = true
              }
              child.material.needsUpdate = true
            }
          }
        }
      })
    } catch (error) {
      console.warn('Error optimizando materiales:', error)
    }
  }, [])

  useEffect(() => {
    if (scene) {
      optimizeMaterials(scene)
    }

    if (animations && animations.length > 0 && scene) {
      try {
        const mixer = new THREE.AnimationMixer(scene)
        mixerRef.current = mixer
        
        const animNames = animations.map(clip => clip.name)
        setAnimationList(animNames)
        
        if (animations[0]) {
          const action = mixer.clipAction(animations[0])
          action.setLoop(THREE.LoopRepeat, Infinity)
          action.play()
          setCurrentAnimation(animations[0].name)
        }

        return () => {
          if (mixerRef.current) {
            mixerRef.current.stopAllAction()
            mixerRef.current = null
          }
        }
      } catch (error) {
        console.warn('Error configurando animaciones:', error)
      }
    }
  }, [scene, animations, optimizeMaterials])

  useFrame((state, delta) => {
    if (mixerRef.current) {
      try {
        mixerRef.current.update(delta)
      } catch (error) {
        console.warn('Error actualizando animación:', error)
      }
    }
  })

  const playAnimation = useCallback((animationName: string) => {
    if (mixerRef.current && animations) {
      try {
        mixerRef.current.stopAllAction()
        
        const clip = animations.find(anim => anim.name === animationName)
        if (clip) {
          const action = mixerRef.current.clipAction(clip)
          action.reset()
          action.setLoop(THREE.LoopRepeat, Infinity)
          action.fadeIn(0.5)
          action.play()
          setCurrentAnimation(animationName)
        }
      } catch (error) {
        console.warn('Error reproduciendo animación:', error)
      }
    }
  }, [animations])

  return (
    <group>
      <primitive 
        object={scene} 
        position={[0, -1, 0]}
        rotation={[0, 0, 0]} 
        scale={[1, 1, 1]} 
      />
      <Html position={[2, 2, 0]}>
        <div className="bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg border max-w-xs">
          <h3 className="font-bold text-sm mb-2">Animaciones</h3>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {animationList.map((animName, index) => (
              <button
                key={index}
                onClick={() => playAnimation(animName)}
                className={`w-full text-left px-2 py-1 text-xs rounded transition-colors ${
                  currentAnimation === animName 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {animName}
              </button>
            ))}
          </div>
        </div>
      </Html>
    </group>
  )
}

function LoadingScreen({ show }: { show: boolean }) {
  if (!show) return null
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-green-900 to-blue-900">
      <div className="text-center text-white">
        <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-green-400 mx-auto mb-6"></div>
        <h2 className="text-2xl font-bold mb-2">Cargando Paciente 3D</h2>
        <p className="text-lg mb-2">Versión optimizada para mejor rendimiento</p>
        <p className="text-sm text-green-200">Errores corregidos y estabilidad mejorada</p>
      </div>
    </div>
  )
}

export default function Patient3DFixedPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [contextLost, setContextLost] = useState(false)
  const [performanceInfo, setPerformanceInfo] = useState({
    fps: 0,
    memoryUsage: 0
  })
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)
    
    return () => clearTimeout(timer)
  }, [])

  // Monitoreo de rendimiento optimizado
  useEffect(() => {
    let frameCount = 0
    let lastTime = performance.now()
    let animationId: number

    const measurePerformance = () => {
      frameCount++
      const currentTime = performance.now()
      
      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime))
        
        // Obtener información de memoria si está disponible
        let memoryUsage = 0
        if ('memory' in performance) {
          const memory = (performance as any).memory
          memoryUsage = Math.round(memory.usedJSHeapSize / 1024 / 1024) // MB
        }
        
        setPerformanceInfo({ fps, memoryUsage })
        
        frameCount = 0
        lastTime = currentTime
      }
      
      animationId = requestAnimationFrame(measurePerformance)
    }
    
    animationId = requestAnimationFrame(measurePerformance)
    
    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [])
  
  return (
    <div className="w-full h-screen bg-gradient-to-b from-green-100 to-blue-100 relative overflow-hidden">
      <LoadingScreen show={isLoading} />
      
      {/* Información de rendimiento */}
      {!isLoading && !error && (
        <div className="absolute top-4 right-4 bg-black/50 text-white p-3 rounded-lg text-sm z-10">
          <div>FPS: {performanceInfo.fps}</div>
          <div>Memoria: {performanceInfo.memoryUsage} MB</div>
          <div className="text-xs text-green-300">✅ Optimizado</div>
        </div>
      )}
      
      {!isLoading && !error && (
        <Canvas
          camera={{ 
            position: [0, 1, 4], 
            fov: 50,
            near: 0.1,
            far: 1000
          }}
          gl={{ 
            preserveDrawingBuffer: false,
            powerPreference: 'high-performance',
            antialias: false, // Deshabilitado para mejor rendimiento
            alpha: false,
            depth: true,
            stencil: false,
            failIfMajorPerformanceCaveat: false
          }}
          shadows={false} // Deshabilitado para evitar problemas
          style={{ background: 'linear-gradient(to bottom, #E6F3FF, #F0FFF0)' }}
          onCreated={({ gl }) => {
            // Configuración optimizada del renderer
            gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)) // Reducido para mejor rendimiento
            gl.shadowMap.enabled = false
            gl.toneMapping = THREE.NoToneMapping
            gl.outputColorSpace = THREE.SRGBColorSpace
            gl.setClearColor('#E6F3FF')
            
            // Manejo robusto de contexto perdido
            const handleContextLost = (event: Event) => {
              event.preventDefault()
              console.warn('WebGL context lost - attempting recovery...')
              setContextLost(true)
              setError('Contexto WebGL perdido. Recargando automáticamente...')
              
              // Limpiar recursos
              gl.dispose()
              
              // Recargar después de un breve delay
              setTimeout(() => {
                window.location.reload()
              }, 2000)
            }
            
            const handleContextRestored = () => {
              console.log('WebGL context restored successfully')
              setContextLost(false)
              setError(null)
            }
            
            // Agregar event listeners con passive: false para poder usar preventDefault
            gl.domElement.addEventListener('webglcontextlost', handleContextLost, { passive: false })
            gl.domElement.addEventListener('webglcontextrestored', handleContextRestored, { passive: false })
            
            // Cleanup function
            return () => {
              gl.domElement.removeEventListener('webglcontextlost', handleContextLost)
              gl.domElement.removeEventListener('webglcontextrestored', handleContextRestored)
            }
          }}
        >
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={2}
            maxDistance={10}
            minPolarAngle={0}
            maxPolarAngle={Math.PI}
            target={[0, 0, 0]}
            autoRotate={false}
            autoRotateSpeed={1}
          />
          
          {/* Iluminación manual optimizada - sin dependencias externas */}
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
          
          <Suspense fallback={null}>
            <OptimizedPatient3D />
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
    </div>
  )
}

// Precargar modelo
useGLTF.preload('/models/patient.glb') 