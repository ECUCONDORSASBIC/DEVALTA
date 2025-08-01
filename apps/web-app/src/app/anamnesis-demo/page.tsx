'use client'
import { Suspense, useState, useEffect, useCallback, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Environment, useGLTF, useAnimations } from '@react-three/drei'
import * as THREE from 'three'

// Componente optimizado para cargar el hospital-lod0.glb (sin cambios)
function HospitalLOD0() {
  const { scene } = useGLTF('/models/hospital-lod0.glb')
  
  useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if (child.isMesh) {
          child.frustumCulled = true
          
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(mat => {
                if (mat.map) {
                  mat.map.minFilter = THREE.LinearFilter
                  mat.map.magFilter = THREE.LinearFilter
                  mat.map.generateMipmaps = false
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
    }
  }, [scene])
  
  return <primitive object={scene} />
}

// Componente para el modelo 3D del paciente con animaciones y brillo mejorado
function Patient3D({ position }) {
  const { scene, animations } = useGLTF('/models/patient.glb')
  const ref = useRef()
  const safeAnimations = Array.isArray(animations) ? animations : []
  const { actions } = useAnimations(safeAnimations, ref)
  
  useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if (child.isMesh) {
          child.frustumCulled = true
          child.castShadow = false
          child.receiveShadow = false
          
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(mat => {
                if (mat.map) {
                  mat.map.minFilter = THREE.LinearFilter
                  mat.map.magFilter = THREE.LinearFilter
                  mat.map.generateMipmaps = false
                  mat.map.needsUpdate = true
                }
                // Aumentar brillo con emissive
                mat.emissive = new THREE.Color(0xffffff)
                mat.emissiveIntensity = 0.8
                mat.needsUpdate = true
              })
            } else {
              if (child.material.map) {
                child.material.map.minFilter = THREE.LinearFilter
                child.material.map.magFilter = THREE.LinearFilter
                child.material.map.generateMipmaps = false
                child.material.map.needsUpdate = true
              }
              // Aumentar brillo con emissive
              child.material.emissive = new THREE.Color(0xffffff)
              child.material.emissiveIntensity = 0.8
              child.material.needsUpdate = true
            }
          }
        }
      })
    }
  }, [scene])
  
  useEffect(() => {
    if (actions) {
      const keys = Object.keys(actions);
      console.log('Animation keys:', keys);
      keys.forEach(key => {
        if (key.trim() !== '') {
          const action = actions[key];
          console.log('Key:', key, 'Type of action:', typeof action, 'Type of play:', typeof action?.play);
        }
      });
      const actionNames = keys.filter(key => key.trim() !== '' && actions[key] && typeof actions[key].play === 'function');
      if (actionNames.length > 0) {
        try {
          actions[actionNames[0]].reset().fadeIn(0.5).play();
        } catch (e) {
          console.error('Error playing animation:', e);
        }
      } else {
        console.log('No valid animations found');
      }
    }
  }, [actions])
  
  return (
    <group ref={ref} position={position} rotation={[0, -0.139, 0]} scale={[0.4, 0.4, 0.4]}>
      <primitive object={scene} />
      {/* Luz adicional para brillo en el modelo */}
      <pointLight position={[0, 2, 0]} intensity={4} color="#ffffff" distance={5} />
    </group>
  )
}

// Componente de carga (sin cambios)
function LoadingScreen({ show }: { show: boolean }) {
  if (!show) return null
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-900 to-gray-900">
      <div className="text-center text-white">
        <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-blue-400 mx-auto mb-6"></div>
        <h2 className="text-2xl font-bold mb-2">Cargando Hospital 3D</h2>
        <p className="text-lg mb-2">Preparando modelo LOD0...</p>
        <p className="text-sm text-blue-200">Esto puede tomar unos segundos</p>
      </div>
    </div>
  )
}

// Definición de escenas de anamnesis obstétrica (basado en protocolos médicos, con target agregado)
const ANAMNESIS_SCENES = [
  {
    id: 0,
    title: 'Historia Obstétrica',
    question: '¿Número de embarazos previos (gestaciones)? Incluya fechas, resultados y complicaciones.',
    cameraPosition: [0, 8, 25], // Vista inicial entrada
    patientPosition: [-2.5, 2.3827, 2.8], // Posición base
    target: [-2.5, 2.3827, 2.8],
    description: 'Evaluación inicial de embarazos previos.'
  },
  {
    id: 1,
    title: 'Historia Ginecológica',
    question: '¿Antecedentes ginecológicos: ciclos menstruales, infecciones, cirugías?',
    cameraPosition: [5, 10, 20], // Vista lateral
    patientPosition: [0, 2.3827, 2.8], // Mover paciente ligeramente
    target: [0, 2.3827, 2.8],
    description: 'Revisión de salud reproductiva.'
  },
  {
    id: 2,
    title: 'Historia Médica',
    question: '¿Enfermedades crónicas, medicamentos, alergias?',
    cameraPosition: [-5, 12, 15], // Vista desde otro ángulo
    patientPosition: [-5, 2.3827, 3.0], // Ajuste posición
    target: [-5, 2.3827, 3.0],
    description: 'Condiciones generales de salud.'
  },
  {
    id: 3,
    title: 'Historia Social',
    question: '¿Hábitos (tabaco, alcohol), soporte familiar, factores de riesgo social?',
    cameraPosition: [0, 15, 10], // Vista superior cercana
    patientPosition: [-2.5, 2.3827, 2.8], // Regreso a base
    target: [-2.5, 2.3827, 2.8],
    description: 'Contexto social y ambiental.'
  }
]

// Configuración base de escena
const BASE_SCENE = {
  name: 'Entrada Principal',
  description: 'Vista frontal de la entrada del hospital',
  lighting: { ambient: 0.8, directional: 1.0 },
  icon: '🚪'
}

// Componente para transiciones suaves de cámara y target
function TransitionManager({ currentScene, controlsRef }) {
  const { camera } = useThree()
  const posRef = useRef(new THREE.Vector3(...ANAMNESIS_SCENES[0].cameraPosition))
  const targetRef = useRef(new THREE.Vector3(...ANAMNESIS_SCENES[0].target))

  useEffect(() => {
    posRef.current.set(...ANAMNESIS_SCENES[currentScene].cameraPosition)
    targetRef.current.set(...ANAMNESIS_SCENES[currentScene].target)
  }, [currentScene])

  useFrame(() => {
    camera.position.lerp(posRef.current, 0.05)
    if (controlsRef.current) {
      controlsRef.current.target.lerp(targetRef.current, 0.05)
      controlsRef.current.update()
    }
  })

  return null
}

export default function Hospital3DNuevoPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentScene, setCurrentScene] = useState(0) // Etapa actual de anamnesis
  const [responses, setResponses] = useState({}) // Almacenar respuestas del usuario
  const controlsRef = useRef()
  
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const originalWarn = console.warn
      console.warn = (...args) => {
        const message = args.join(' ')
        if (message.includes('passive event listener') || 
            message.includes('scroll-blocking') ||
            message.includes('defaultProps')) {
          return
        }
        originalWarn(...args)
      }
    }
    
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2500)
    
    return () => clearTimeout(timer)
  }, [])
  
  useEffect(() => {
    useGLTF.preload('/models/hospital-lod0.glb')
    useGLTF.preload('/models/patient.glb')
  }, [])
  
  const handleModelError = (err: any) => {
    console.error('Error loading 3D model:', err)
    setError('Error al cargar el modelo 3D. Verifica que el archivo hospital-lod0.glb esté disponible.')
    setIsLoading(false)
  }
  
  const handleResponse = (id, value) => {
    setResponses(prev => ({ ...prev, [id]: value }))
    if (currentScene < ANAMNESIS_SCENES.length - 1) {
      setCurrentScene(currentScene + 1)
    } else {
      console.log('Anamnesis completa:', responses)
      // Aquí podrías enviar datos a un backend o procesar
    }
  }

  return (
    <div className="w-full h-screen bg-gradient-to-b from-sky-100 to-blue-200 relative overflow-hidden">
      <LoadingScreen show={isLoading} />
      
      {!isLoading && !error && (
        <Canvas
          camera={{ 
            position: ANAMNESIS_SCENES[0].cameraPosition, 
            fov: 50,
            near: 0.1,
            far: 1000
          }}
          gl={{ 
            preserveDrawingBuffer: false,
            powerPreference: 'default',
            antialias: false,
            alpha: false,
            depth: true,
            stencil: false,
            failIfMajorPerformanceCaveat: false
          }}
          shadows={false}
          style={{ background: 'linear-gradient(to bottom, #87CEEB, #B0E0E6)' }}
          onCreated={({ gl, camera, scene }) => {
            gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
            gl.shadowMap.enabled = false
            gl.toneMapping = THREE.NoToneMapping
            gl.outputColorSpace = THREE.SRGBColorSpace
            gl.setClearColor('#87CEEB')
            
            gl.capabilities.maxTextures = Math.min(gl.capabilities.maxTextures, 8)
            
            gl.domElement.addEventListener('webglcontextlost', (event) => {
              event.preventDefault()
              console.warn('WebGL context lost - attempting recovery')
              setError('Contexto WebGL perdido. Recargando automáticamente...')
              gl.dispose()
              setTimeout(() => window.location.reload(), 2000)
            })
            
            gl.domElement.addEventListener('webglcontextrestored', () => {
              console.log('WebGL context restored')
              setError(null)
            })
            
            setTimeout(() => {
              if (window.gc) {
                window.gc()
              }
            }, 3000)
          }}
        >
          <ambientLight intensity={BASE_SCENE.lighting.ambient} color="#ffffff" />
          <directionalLight 
            position={[10, 10, 5]} 
            intensity={BASE_SCENE.lighting.directional}
            color="#ffffff"
          />
          
          <OrbitControls
            ref={controlsRef}
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={10}
            maxDistance={50}
            minPolarAngle={0.1}
            maxPolarAngle={Math.PI / 2}
            minAzimuthAngle={-Infinity}
            maxAzimuthAngle={Infinity}
            target={ANAMNESIS_SCENES[0].target}
            zoomSpeed={0.6}
            panSpeed={0.8}
            rotateSpeed={0.5}
            dampingFactor={0.1}
            enableDamping={true}
            maxTarget={[Infinity, 10, Infinity]}
            minTarget={[-Infinity, 0.5, -Infinity]}
          />
          
          <Suspense fallback={null}>
            <HospitalLOD0 />
          </Suspense>
          
          <Suspense fallback={null}>
            <Patient3D position={ANAMNESIS_SCENES[currentScene].patientPosition} />
          </Suspense>
          
          <TransitionManager currentScene={currentScene} controlsRef={controlsRef} />
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
            <p className="text-sm text-gray-300">
              Verifica que el archivo hospital-lod0.glb esté en /public/models/
            </p>
          </div>
        </div>
      )}
      
      {!isLoading && !error && (
        <div className="absolute top-6 left-6 bg-white/95 backdrop-blur-sm text-gray-800 p-5 rounded-xl shadow-lg border border-gray-200 max-w-xs">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <h1 className="text-xl font-bold">Anamnesis Obstétrica 3D</h1>
          </div>
          
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">📋</span>
              <span className="font-semibold text-blue-800">{ANAMNESIS_SCENES[currentScene].title}</span>
            </div>
            <p className="text-xs text-blue-600">{ANAMNESIS_SCENES[currentScene].description}</p>
          </div>
          
          <div className="space-y-2 text-sm">
            <p>{ANAMNESIS_SCENES[currentScene].question}</p>
            <input 
              type="text" 
              placeholder="Respuesta..."
              className="w-full p-2 border rounded"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleResponse(ANAMNESIS_SCENES[currentScene].id, e.target.value)
                  e.target.value = ''
                }
              }}
            />
          </div>
          
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-600 mb-1">
              🏥 Hospital: hospital-lod0.glb
            </p>
            <p className="text-xs text-gray-600">
              🧑‍⚕️ Paciente: patient.glb
            </p>
          </div>
        </div>
      )}
      
      {!isLoading && !error && (
        <div className="absolute bottom-6 right-6 bg-black/70 text-white p-3 rounded-lg text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>Renderizado activo - Etapa {currentScene + 1}/{ANAMNESIS_SCENES.length}</span>
          </div>
        </div>
      )}
    </div>
  )
}