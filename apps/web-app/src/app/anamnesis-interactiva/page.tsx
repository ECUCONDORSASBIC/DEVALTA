'use client'
import { Suspense, useState, useEffect, useRef, useCallback } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, useGLTF, Environment, Html, Text } from '@react-three/drei'
import * as THREE from 'three'
import { 
  PreguntaAnamnesis, 
  SeccionAnamnesis, 
  ProgresoAnamnesis, 
  CategoriaAnamnesis,
  EscenaAnamnesis,
  Logro
} from '../../types/anamnesis.types'
import { SECCIONES_ANAMNESIS, ESCENAS_ANAMNESIS } from '../../data/anamnesis-data'
import { useAnamnesis } from '../../hooks/useAnamnesis'
import LogrosComponent from '../../components/anamnesis/LogrosComponent'
import HistoriaMedicaComponent from '../../components/anamnesis/HistoriaMedicaComponent'

// Componente 3D para la escena de anamnesis
function EscenaAnamnesis3D({ 
  escena, 
  onInteraccion, 
  progreso 
}: { 
  escena: EscenaAnamnesis
  onInteraccion: (elementoId: string) => void
  progreso: ProgresoAnamnesis
}) {
  const { scene, animations } = useGLTF(escena.modelo3D)
  const mixerRef = useRef<THREE.AnimationMixer | null>(null)
  const [animacionActual, setAnimacionActual] = useState<string | null>(null)

  useEffect(() => {
    if (scene) {
      scene.traverse(child => {
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

    // Reproducir animación automática
    if (animations && animations.length > 0) {
      const animacionAutomatica = escena.animaciones.find(a => a.trigger === 'automatica')
      if (animacionAutomatica) {
        const mixer = new THREE.AnimationMixer(scene)
        mixerRef.current = mixer
        
        const clip = animations.find(anim => anim.name === animacionAutomatica.nombre)
        if (clip) {
          const action = mixer.clipAction(clip)
          action.play()
          setAnimacionActual(animacionAutomatica.nombre)
        }
      }
    }
  }, [scene, animations, escena])

  useFrame((state, delta) => {
    if (mixerRef.current) {
      mixerRef.current.update(delta)
    }
  })

  return (
    <group>
      <primitive 
        object={scene} 
        position={[0, -1, 0]}
        rotation={[0, 0, 0]} 
        scale={[1, 1, 1]} 
      />
      
      {/* Elementos interactivos */}
      {escena.elementosInteractivos.map((elemento) => (
        <Html key={elemento.id} position={elemento.posicion}>
          <div 
            className="bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg border cursor-pointer hover:bg-blue-50 transition-colors"
            onClick={() => onInteraccion(elemento.id)}
          >
            <div className="text-sm font-semibold">{elemento.datos.titulo}</div>
            <div className="text-xs text-gray-600">{elemento.datos.descripcion}</div>
          </div>
        </Html>
      ))}
      
      {/* Indicador de progreso */}
      <Html position={[0, 3, 0]}>
        <div className="bg-black/50 text-white p-2 rounded-lg text-sm">
          Progreso: {progreso.nivelCompletitud}%
        </div>
      </Html>
    </group>
  )
}

// Componente de pregunta
function PreguntaComponent({ 
  pregunta, 
  onRespuesta, 
  progreso 
}: { 
  pregunta: PreguntaAnamnesis
  onRespuesta: (preguntaId: string, valor: any) => void
  progreso: ProgresoAnamnesis
}) {
  const [valor, setValor] = useState<any>('')
  const [tiempoInicio] = useState(Date.now())

  const handleSubmit = () => {
    const tiempoRespuesta = (Date.now() - tiempoInicio) / 1000
    onRespuesta(pregunta.id, { valor, tiempoRespuesta })
  }

  const renderInput = () => {
    switch (pregunta.tipo) {
      case 'text':
        return (
          <input
            type="text"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Escribe tu respuesta..."
          />
        )
      case 'number':
        return (
          <input
            type="number"
            value={valor}
            onChange={(e) => setValor(Number(e.target.value))}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Ingresa un número..."
          />
        )
      case 'textarea':
        return (
          <textarea
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 h-32"
            placeholder="Describe detalladamente..."
          />
        )
      case 'select':
        return (
          <select
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecciona una opción...</option>
            {pregunta.opciones?.map((opcion) => (
              <option key={opcion} value={opcion}>{opcion}</option>
            ))}
          </select>
        )
      case 'boolean':
        return (
          <div className="flex gap-4">
            <button
              onClick={() => setValor(true)}
              className={`px-6 py-3 rounded-lg border transition-colors ${
                valor === true ? 'bg-green-500 text-white' : 'bg-white hover:bg-green-50'
              }`}
            >
              Sí
            </button>
            <button
              onClick={() => setValor(false)}
              className={`px-6 py-3 rounded-lg border transition-colors ${
                valor === false ? 'bg-red-500 text-white' : 'bg-white hover:bg-red-50'
              }`}
            >
              No
            </button>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      {/* Historia preliminar */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-bold text-blue-800 mb-2">{pregunta.historiaPreliminar.titulo}</h3>
        <p className="text-blue-700 text-sm">{pregunta.historiaPreliminar.contenido}</p>
      </div>

      {/* Pregunta */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">{pregunta.texto}</h2>
        <div className="mb-4">
          {renderInput()}
        </div>
        <button
          onClick={handleSubmit}
          disabled={!valor}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Responder (+{pregunta.puntosGamificacion} puntos)
        </button>
      </div>

      {/* Explicación médica */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-2">💡 Explicación Médica</h4>
        <p className="text-gray-700 text-sm">{pregunta.explicacionMedica}</p>
      </div>
    </div>
  )
}

// Componente principal de anamnesis interactiva
export default function AnamnesisInteractivaPage() {
  const [mostrarPregunta, setMostrarPregunta] = useState(false)
  const [mostrarHistoria, setMostrarHistoria] = useState(false)
  const [historiaActual, setHistoriaActual] = useState<any>(null)

  const {
    progreso,
    seccionActual,
    escenaActual,
    preguntaActual,
    logrosNuevos,
    responderPregunta,
    siguientePregunta,
    estadisticas
  } = useAnamnesis({
    secciones: SECCIONES_ANAMNESIS,
    escenas: ESCENAS_ANAMNESIS,
    onCompletado: (progresoFinal) => {
      console.log('¡Anamnesis completada!', progresoFinal)
      // Aquí podrías enviar los resultados a un backend o mostrar un resumen
    }
  })

  const handleRespuesta = useCallback((preguntaId: string, respuesta: any) => {
    responderPregunta(preguntaId, respuesta.valor, respuesta.tiempoRespuesta)
    setMostrarPregunta(false)
    
    // Avanzar automáticamente después de un delay
    setTimeout(() => {
      if (progreso.preguntaActual < seccionActual.preguntas.length - 1) {
        siguientePregunta()
        setMostrarPregunta(true)
      }
    }, 2000)
  }, [responderPregunta, progreso.preguntaActual, seccionActual.preguntas.length, siguientePregunta])

  const handleInteraccion = useCallback((elementoId: string) => {
    console.log('Interacción con elemento:', elementoId)
    
    // Mostrar historia de la sección actual
    setHistoriaActual(seccionActual.historia)
    setMostrarHistoria(true)
  }, [seccionActual.historia])

  const handleContinuarHistoria = useCallback(() => {
    setMostrarHistoria(false)
    setMostrarPregunta(true)
  }, [])

  useEffect(() => {
    // Mostrar historia al inicio de cada sección
    if (progreso.preguntaActual === 0) {
      setHistoriaActual(seccionActual.historia)
      setMostrarHistoria(true)
    }
  }, [seccionActual.historia, progreso.preguntaActual])

  return (
    <div className="w-full h-screen bg-gradient-to-b from-blue-100 to-purple-100 relative overflow-hidden">
      {/* Header con progreso */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{seccionActual.titulo}</h1>
              <p className="text-gray-600">{seccionActual.descripcion}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{progreso.puntosAcumulados}</div>
              <div className="text-sm text-gray-500">Puntos</div>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progreso</span>
              <span>{progreso.nivelCompletitud}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progreso.nivelCompletitud}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Panel de logros */}
      <div className="absolute top-4 right-4 z-10">
        <LogrosComponent
          logros={seccionActual.logrosDesbloqueables.filter(logro => 
            progreso.logrosObtenidos.includes(logro.id)
          )}
          puntosAcumulados={progreso.puntosAcumulados}
          nivelCompletitud={progreso.nivelCompletitud}
        />
      </div>

      {/* Canvas 3D */}
      <Canvas
        camera={{ 
          position: escenaActual.posicionCamara, 
          fov: 50,
          near: 0.1,
          far: 1000
        }}
        gl={{ 
          preserveDrawingBuffer: false,
          powerPreference: 'high-performance',
          antialias: false,
          alpha: false,
          depth: true,
          stencil: false,
          failIfMajorPerformanceCaveat: false
        }}
        shadows={false}
        style={{ background: 'linear-gradient(to bottom, #E6F3FF, #F0F8FF)' }}
        onCreated={({ gl }) => {
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
          gl.shadowMap.enabled = false
          gl.toneMapping = THREE.NoToneMapping
          gl.outputColorSpace = THREE.SRGBColorSpace
          gl.setClearColor('#E6F3FF')
        }}
      >
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={2}
          maxDistance={10}
          target={[0, 0, 0]}
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
          <EscenaAnamnesis3D 
            escena={escenaActual}
            onInteraccion={handleInteraccion}
            progreso={progreso}
          />
        </Suspense>
      </Canvas>

      {/* Pregunta flotante */}
      {mostrarPregunta && preguntaActual && (
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <PreguntaComponent
            pregunta={preguntaActual}
            onRespuesta={handleRespuesta}
            progreso={progreso}
          />
        </div>
      )}

      {/* Historia médica */}
      {mostrarHistoria && historiaActual && (
        <HistoriaMedicaComponent
          historia={historiaActual}
          onClose={() => setMostrarHistoria(false)}
          onContinue={handleContinuarHistoria}
        />
      )}

      {/* Logros nuevos */}
      {logrosNuevos.length > 0 && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
          <div className="bg-yellow-400 text-black p-6 rounded-lg shadow-lg text-center">
            <div className="text-4xl mb-2">🎉</div>
            <h3 className="text-xl font-bold mb-2">¡Logro Desbloqueado!</h3>
            {logrosNuevos.map(logro => (
              <div key={logro.id} className="mb-2">
                <div className="text-2xl">{logro.icono}</div>
                <div className="font-semibold">{logro.nombre}</div>
                <div className="text-sm">{logro.descripcion}</div>
                <div className="text-sm">+{logro.puntos} puntos</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Estadísticas flotantes */}
      <div className="absolute bottom-4 right-4 z-10">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg text-sm">
          <div className="text-center">
            <div className="font-bold text-gray-800">📊 Estadísticas</div>
            <div className="text-gray-600">Preguntas: {estadisticas.preguntasRespondidas}/{estadisticas.totalPreguntas}</div>
            <div className="text-gray-600">Tiempo: {Math.round(estadisticas.tiempoPromedioRespuesta)}s</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Precargar modelos
useGLTF.preload('/models/patient.glb') 