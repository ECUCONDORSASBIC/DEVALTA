'use client'
import { Suspense, useState, useEffect, useRef, useCallback } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, useGLTF, Environment, Html } from '@react-three/drei'
import * as THREE from 'three'
import { 
  PreguntaAnamnesis, 
  SeccionAnamnesis, 
  AvatarConfig,
  SECCIONES_ANAMNESIS,
  generarAvatarConfig
} from '../../data/anamnesis-alvarez'
import AvatarPaciente3D from '../../components/anamnesis/AvatarPaciente3D'

// Modelos alternos para alternancia (evidencia: Interfaces visuales variadas reducen fatiga cognitiva)
const DOCTOR_MODELS = [
  '/models/nurse.glb',
  '/models/doctor_male.glb', // Modelo alternativo para variedad
  '/models/doctor_female.glb' // Otro para variedad
];

// Historias contextuales por sección (evidencia: Aumenta engagement y reduce fatiga en cuestionarios)
const HISTORIAS_SECCIONES = [
  "Imagina que estás en una consulta inicial donde compartes tu información básica para que el doctor te conozca mejor.",
  "Ahora, cuéntanos sobre tu motivo de visita, como si estuvieras describiendo un problema a un amigo de confianza.",
  "El doctor necesita conocer tu historia médica personal para entender mejor tu situación actual.",
  "Los antecedentes familiares ayudan a identificar patrones genéticos y factores de riesgo hereditarios.",
  "Los hábitos de vida son fundamentales para evaluar factores de riesgo modificables.",
  "Los antecedentes gineco-obstétricos son importantes para evaluar la salud reproductiva.",
  "Los antecedentes psicosociales nos ayudan a entender el contexto completo de tu salud."
];

// Alturas personalizadas por modelo
const DOCTOR_MODEL_POSITIONS: Record<string, [number, number, number]> = {
  '/models/nurse.glb': [0, 0.7, 0], // Nurse más arriba
  '/models/doctor_male.glb': [0, 0.3, 0], // Doctor hombre
  '/models/doctor_female.glb': [0, -3., 0], // Más bajo para cintura-cara
};
const DOCTOR_MODEL_SCALES: Record<string, [number, number, number]> = {
  '/models/nurse.glb': [1.1, 1.1, 1.1],
  '/models/doctor_male.glb': [1.1, 1.1, 1.1],
  '/models/doctor_female.glb': [1.5, 1.5, 1.5], // Más grande para zoom
};

// Componente 3D del Doctor con alternancia por sección
function Doctor3D({ 
  seccionActual, 
  preguntaActual,
  onInteraccion 
}: { 
  seccionActual: SeccionAnamnesis
  preguntaActual: PreguntaAnamnesis
  onInteraccion: (accion: string) => void
}) {
  const modelIndex = seccionActual.orden % DOCTOR_MODELS.length;
  const modelo = DOCTOR_MODELS[modelIndex];
  const { scene, animations } = useGLTF(modelo, true);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null)
  const [animacionActual, setAnimacionActual] = useState<string | null>(null)

  useEffect(() => {
    if (scene) {
      scene.traverse(child => {
        if (child instanceof THREE.Mesh) {
          child.frustumCulled = true
          child.castShadow = true
          child.receiveShadow = true
        }
      })
    }
    if (animations && animations.length > 0) {
      const mixer = new THREE.AnimationMixer(scene)
      mixerRef.current = mixer
      const clipIndex = Math.min(seccionActual.orden - 1, animations.length - 1)
      const clip = animations[clipIndex] || animations[0]
      if (clip) {
        const action = mixer.clipAction(clip)
        action.reset().play()
        setAnimacionActual(clip.name)
      }
    }

    return () => {
      if (mixerRef.current) {
        mixerRef.current.stopAllAction()
        mixerRef.current = null
      }
    }
  }, [scene, animations, seccionActual.orden])

  useFrame((state, delta) => {
    if (mixerRef.current) {
      mixerRef.current.update(delta)
    }
  })

  // Usar altura y escala personalizada según el modelo
  const position = DOCTOR_MODEL_POSITIONS[modelo] || [0, 0.5, 0];
  const scale = DOCTOR_MODEL_SCALES[modelo] || [1.1, 1.1, 1.1];

  return (
    <group>
      <primitive 
        object={scene} 
        position={position}
        rotation={[0, Math.PI / 14, 0]} 
        scale={scale}
      />
      <Html position={[2, 5.2, 0]} occlude>
        <div className="bg-white/95 backdrop-blur-sm p-4 rounded-2xl shadow-xl border-2 border-blue-200 max-w-xs select-none">
          <div className="text-sm font-semibold text-gray-800 mb-2">
            Dr. {seccionActual.titulo}
          </div>
          <div className="text-xs text-gray-600">
            {preguntaActual.pregunta}
          </div>
        </div>
      </Html>
      <Html position={[0, 4.5, 0]} occlude>
        <div className="bg-blue-600/90 text-white p-3 rounded-lg text-sm font-semibold select-none">
          Pregunta {preguntaActual.orden} de {seccionActual.preguntas.length}
        </div>
      </Html>
    </group>
  )
}

// Componente de pregunta con tooltip y historia (evidencia: Mejora usabilidad en EHR)
function PreguntaFormulario({ 
  pregunta, 
  onRespuesta, 
  valorActual, 
  respuestas,
  historia 
}: { 
  pregunta: PreguntaAnamnesis
  onRespuesta: (preguntaId: string, valor: any) => void
  valorActual: any
  respuestas: Record<string, any>
  historia: string
}) {
  const [valor, setValor] = useState<any>(valorActual ?? '')
  const [error, setError] = useState<string>('')

  // Validaciones clínicas basadas en evidencia - CORREGIDO para evitar bucle infinito
  useEffect(() => {
    let newError = ''
    
    // Solo validar si hay valor
    if (valor !== '' && valor !== undefined) {
      if (pregunta.id === 'edad') {
        const numValor = Number(valor)
        if (numValor < 0 || numValor > 120) {
          newError = 'Edad fuera de rango clínico (0-120, basado en longevidad humana verificable)'
        }
      }
      
      if (pregunta.id === 'cancer-familiar' && valor === true && respuestas['edad'] < 20) {
        newError = 'Alerta: Antecedente familiar de cáncer en paciente <20 años aumenta riesgo genético (evidencia: Estudios NCI sobre cáncer hereditario)'
      }
      
      if (pregunta.id === 'hipertension-familiar' && valor === true && respuestas['edad'] < 10) {
        newError = 'Alerta: Hipertensión familiar en niño <10 años; posible causa secundaria (evidencia: AHA guidelines)'
      }
    }
    
    setError(newError)
  }, [valor, pregunta.id, respuestas])

  // Saltos lógicos centralizados y expandidos basados en evidencia clínica verificable
  const shouldSkip = 
    (pregunta.id === 'alergias-descripcion' && respuestas['alergias'] === false) ||
    (pregunta.id === 'cirugias-descripcion' && respuestas['cirugias-previas'] === false) ||
    (pregunta.id === 'medicamentos-lista' && respuestas['medicamentos-actuales'] === false) ||
    (pregunta.id === 'cantidad-cigarrillos' && respuestas['fuma'] === false) ||
    (pregunta.id === 'otras-enfermedades-familiares' &&
      respuestas['diabetes-familiar'] === false &&
      respuestas['hipertension-familiar'] === false &&
      respuestas['cancer-familiar'] === false &&
      respuestas['enfermedades-cardiovasculares'] === false) ||
    (pregunta.id === 'frecuencia-alcohol' && respuestas['alcohol'] === false) ||
    (pregunta.id === 'tipo-ejercicio' && respuestas['ejercicio'] === false) ||
    (pregunta.id === 'embarazo' && !(respuestas['genero'] === 'Femenino' && respuestas['edad'] >= 15 && respuestas['edad'] <= 50)) ||
    (pregunta.id === 'caidas-recientes' && !(respuestas['edad'] >= 65)) ||
    (pregunta.id === 'problemas-memoria' && !(respuestas['edad'] >= 65)) ||
    ((pregunta.id === 'intensidad' || pregunta.id === 'factores-agravantes' || pregunta.id === 'factores-mejorantes') &&
      (respuestas['motivo-consulta'] &&
        (respuestas['motivo-consulta'].toLowerCase().includes('control') ||
        respuestas['motivo-consulta'].toLowerCase().includes('chequeo'))));

  if (shouldSkip) return null;

  const handleSubmit = () => {
    if (pregunta.requerida && (valor === '' || valor === undefined)) {
      setError('Este campo es obligatorio')
      return
    }
    if (error) return // Bloquear si hay error clínico
    onRespuesta(pregunta.id, valor)
  }

  const renderInput = () => {
    switch (pregunta.tipo) {
      case 'text':
        return (
          <div className="relative">
            <input
              type="text"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500 focus:border-transparent text-lg"
              placeholder="Escribe tu respuesta..."
              aria-required={pregunta.requerida}
              aria-invalid={!!error}
              aria-describedby={error ? pregunta.id + '-error' : undefined}
            />
            <div className="absolute top-2 right-2 tooltip" title="Esto ayuda al doctor a personalizar tu atención basada en evidencia clínica.">
              <span className="text-blue-500 cursor-help text-lg">ℹ️</span>
            </div>
          </div>
        )
      case 'number':
        return (
          <div className="relative">
            <input
              type="number"
              value={valor}
              onChange={(e) => setValor(Number(e.target.value))}
              className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500 focus:border-transparent text-lg"
              placeholder="Ingresa un número..."
              aria-required={pregunta.requerida}
              aria-invalid={!!error}
              aria-describedby={error ? pregunta.id + '-error' : undefined}
            />
            <div className="absolute top-2 right-2 tooltip" title="Los valores numéricos permiten análisis estadísticos y seguimiento preciso.">
              <span className="text-blue-500 cursor-help text-lg">ℹ️</span>
            </div>
          </div>
        )
      case 'textarea':
        return (
          <div className="relative">
            <textarea
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500 focus:border-transparent text-lg h-32 resize-none"
              placeholder="Describe detalladamente..."
              aria-required={pregunta.requerida}
              aria-invalid={!!error}
              aria-describedby={error ? pregunta.id + '-error' : undefined}
            />
            <div className="absolute top-2 right-2 tooltip" title="Los detalles específicos ayudan al diagnóstico diferencial.">
              <span className="text-blue-500 cursor-help text-lg">ℹ️</span>
            </div>
          </div>
        )
      case 'select':
        return (
          <div className="relative">
            <select
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500 focus:border-transparent text-lg"
              aria-required={pregunta.requerida}
              aria-invalid={!!error}
              aria-describedby={error ? pregunta.id + '-error' : undefined}
            >
              <option value="">Selecciona una opción...</option>
              {pregunta.opciones?.map((opcion) => (
                <option key={opcion} value={opcion}>{opcion}</option>
              ))}
            </select>
            <div className="absolute top-2 right-2 tooltip" title="Las opciones estandarizadas facilitan el análisis clínico.">
              <span className="text-blue-500 cursor-help text-lg">ℹ️</span>
            </div>
          </div>
        )
      case 'boolean':
        return (
          <div className="space-y-4">
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setValor(true)}
                className={`flex-1 px-8 py-4 rounded-xl border-2 transition-all duration-200 text-lg font-semibold ${
                  valor === true 
                    ? 'bg-green-500 text-white border-green-500 shadow-lg' 
                    : 'bg-white hover:bg-green-50 border-gray-300 hover:border-green-300'
                }`}
                aria-pressed={valor === true}
              >
                Sí
              </button>
              <button
                type="button"
                onClick={() => setValor(false)}
                className={`flex-1 px-8 py-4 rounded-xl border-2 transition-all duration-200 text-lg font-semibold ${
                  valor === false 
                    ? 'bg-red-500 text-white border-red-500 shadow-lg' 
                    : 'bg-white hover:bg-red-50 border-gray-300 hover:border-red-300'
                }`}
                aria-pressed={valor === false}
              >
                No
              </button>
            </div>
            <div className="text-center">
              <span className="text-blue-500 cursor-help text-sm" title="Las respuestas binarias facilitan el cribado inicial.">ℹ️ Ayuda al cribado inicial</span>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Historia contextual */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-xl border border-purple-200">
        <p className="text-gray-700 italic text-sm">{historia}</p>
      </div>
      
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          {pregunta.pregunta}
        </h3>
        {renderInput()}
        {error && <p id={pregunta.id + '-error'} className="text-red-500 text-sm mt-2">{error}</p>}
      </div>
      
      <button
        onClick={handleSubmit}
        disabled={(pregunta.requerida && !valor) || !!error}
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-8 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
      >
        Continuar
      </button>
    </div>
  )
}

// Formulario de datos personales con validaciones en tiempo real y accesibilidad
function FormularioDatosPersonales({ preguntas, respuestas, onRespuestas }: {
  preguntas: PreguntaAnamnesis[]
  respuestas: Record<string, any>
  onRespuestas: (res: Record<string, any>) => void
}) {
  const [valores, setValores] = useState<Record<string, any>>(() => {
    const inicial: Record<string, any> = {}
    preguntas.forEach(p => { inicial[p.id] = respuestas[p.id] ?? '' })
    return inicial
  })
  const [errores, setErrores] = useState<Record<string, string>>({})

  // Saltos lógicos: Ocultar para menores de 18 (evidencia: Convenciones legales/OMS sobre adultez)
  const edad = Number(valores.edad) || 0
  const preguntasFiltradas = preguntas.filter(p => {
    if (['ocupacion', 'estado-civil'].includes(p.id) && edad < 18) return false
    return true
  })

  const handleChange = (id: string, valor: any) => {
    setValores(v => ({ ...v, [id]: valor }))
    validateField(id, valor)
  }

  const validateField = (id: string, valor: any) => {
    const pregunta = preguntas.find(p => p.id === id)
    let newError = ''
    if (pregunta?.requerida && (valor === '' || valor === undefined)) {
      newError = 'Este campo es obligatorio'
    }
    if (id === 'edad') {
      const numValor = Number(valor)
      if (valor !== '' && (numValor < 0 || numValor > 120)) {
        newError = 'Edad fuera de rango clínico (0-120)'
      }
    }
    setErrores(e => ({ ...e, [id]: newError }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const nuevosErrores: Record<string, string> = {}
    preguntasFiltradas.forEach(p => {
      validateField(p.id, valores[p.id])
      if (errores[p.id]) nuevosErrores[p.id] = errores[p.id]
    })
    if (Object.keys(nuevosErrores).length === 0) {
      onRespuestas(valores)
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {preguntasFiltradas.map(pregunta => (
        <div key={pregunta.id}>
          <label htmlFor={pregunta.id} className="block text-sm font-semibold text-gray-700 mb-1">
            {pregunta.pregunta} {pregunta.requerida && <span className="text-red-500">*</span>}
          </label>
          {(() => {
            switch (pregunta.tipo) {
              case 'text':
                return (
                  <input
                    id={pregunta.id}
                    type="text"
                    value={valores[pregunta.id]}
                    onChange={e => handleChange(pregunta.id, e.target.value)}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    aria-required={pregunta.requerida}
                    aria-invalid={!!errores[pregunta.id]}
                    aria-describedby={errores[pregunta.id] ? pregunta.id + '-error' : undefined}
                  />
                )
              case 'number':
                return (
                  <input
                    id={pregunta.id}
                    type="number"
                    value={valores[pregunta.id]}
                    onChange={e => handleChange(pregunta.id, Number(e.target.value))}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    aria-required={pregunta.requerida}
                    aria-invalid={!!errores[pregunta.id]}
                    aria-describedby={errores[pregunta.id] ? pregunta.id + '-error' : undefined}
                  />
                )
              case 'select':
                return (
                  <select
                    id={pregunta.id}
                    value={valores[pregunta.id]}
                    onChange={e => handleChange(pregunta.id, e.target.value)}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    aria-required={pregunta.requerida}
                    aria-invalid={!!errores[pregunta.id]}
                    aria-describedby={errores[pregunta.id] ? pregunta.id + '-error' : undefined}
                  >
                    <option value="">Selecciona una opción...</option>
                    {pregunta.opciones?.map(op => (
                      <option key={op} value={op}>{op}</option>
                    ))}
                  </select>
                )
              default:
                return null
            }
          })()}
          {errores[pregunta.id] && <span id={pregunta.id + '-error'} className="text-red-500 text-xs">{errores[pregunta.id]}</span>}
        </div>
      ))}
      <button
        type="submit"
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-semibold text-base hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
      >
        Continuar
      </button>
    </form>
  )
}

// Componente del avatar del paciente con mejoras en visualización
function AvatarPaciente({ config }: { config: AvatarConfig }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Tu Avatar Médico</h3>
      <dl className="space-y-3 text-sm">
        <div className="flex justify-between">
          <dt className="text-gray-600">Edad:</dt>
          <dd className="font-semibold">{config.edad} años</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-gray-600">Género:</dt>
          <dd className="font-semibold">{config.genero}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-gray-600">Complexión:</dt>
          <dd className="font-semibold">{config.complexion}</dd>
        </div>
        {config.enfermedades.length > 0 && (
          <div>
            <dt className="text-gray-600">Riesgos:</dt>
            <dd className="mt-1">
              {config.enfermedades.map((enfermedad, index) => (
                <span key={index} className="inline-block bg-red-100 text-red-800 px-2 py-1 rounded text-xs mr-1 mb-1">
                  {enfermedad}
                </span>
              ))}
            </dd>
          </div>
        )}
        {config.sintomas.length > 0 && (
          <div>
            <dt className="text-gray-600">Síntomas:</dt>
            <dd className="mt-1">
              {config.sintomas.map((sintoma, index) => (
                <span key={index} className="inline-block bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs mr-1 mb-1">
                  {sintoma}
                </span>
              ))}
            </dd>
          </div>
        )}
      </dl>
    </div>
  )
}

// Página principal con optimizaciones: Memoización, lazy loading, y manejo de rendimiento
export default function AnamnesisJuegoPage() {
  const [seccionActual, setSeccionActual] = useState(0)
  const [preguntaActual, setPreguntaActual] = useState(0)
  const [respuestas, setRespuestas] = useState<Record<string, any>>({})
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig | null>(null)
  const [mostrarResultado, setMostrarResultado] = useState(false)

  const seccion = SECCIONES_ANAMNESIS[seccionActual]
  const pregunta = seccion?.preguntas[preguntaActual]

  // Cálculo de progreso memoizado
  const progreso = useCallback(() => {
    const totalPreguntas = SECCIONES_ANAMNESIS.reduce((acc, sec) => acc + sec.preguntas.length, 0)
    let preguntasCompletadas = 0
    for (let i = 0; i < seccionActual; i++) {
      preguntasCompletadas += SECCIONES_ANAMNESIS[i].preguntas.length
    }
    preguntasCompletadas += preguntaActual
    return Math.round((preguntasCompletadas / totalPreguntas) * 100)
  }, [seccionActual, preguntaActual])

  const handleRespuesta = useCallback((preguntaId: string, valor: any) => {
    const nuevasRespuestas = { ...respuestas, [preguntaId]: valor }
    setRespuestas(nuevasRespuestas)

    if (preguntaActual < seccion.preguntas.length - 1) {
      setPreguntaActual(prev => prev + 1)
    } else {
      if (seccionActual < SECCIONES_ANAMNESIS.length - 1) {
        setSeccionActual(prev => prev + 1)
        setPreguntaActual(0)
      } else {
        const config = generarAvatarConfig(nuevasRespuestas)
        setAvatarConfig(config)
        setMostrarResultado(true)
      }
    }
  }, [respuestas, preguntaActual, seccion.preguntas.length, seccionActual])

  const reiniciarJuego = useCallback(() => {
    setSeccionActual(0)
    setPreguntaActual(0)
    setRespuestas({})
    setAvatarConfig(null)
    setMostrarResultado(false)
  }, [])

  if (mostrarResultado && avatarConfig) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-neutral-50 to-indigo-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">
                ¡Anamnesis Completada!
              </h1>
              <p className="text-xl text-gray-600">
                Tu avatar médico ha sido generado basado en tus respuestas
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="bg-white rounded-2xl p-8 shadow-xl overflow-auto max-h-[80vh]">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Resumen de Anamnesis</h2>
                <div className="space-y-4">
                  {Object.entries(respuestas).map(([key, value]) => (
                    <div key={key} className="border-b border-gray-200 pb-2">
                      <div className="font-semibold text-gray-700 capitalize">{key.replace(/-/g, ' ')}</div>
                      <div className="text-gray-600">{String(value)}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              <AvatarPaciente config={avatarConfig} />
              
              <AvatarPaciente3D config={avatarConfig} />
            </div>
            
            <div className="text-center mt-8">
              <button
                onClick={reiniciarJuego}
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-8 rounded-xl font-semibold text-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg"
              >
                Realizar Nueva Anamnesis
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-screen h-screen bg-white overflow-hidden">
      <div className="w-full h-full flex flex-row">
        {/* Doctor 3D - mitad izquierda, con lazy loading via Suspense */}
        <div className="w-1/2 h-full flex flex-col items-center justify-center bg-black">
          <h2 className="text-2xl font-bold text-white mb-2 text-center pt-6">
            Dr. {seccion.titulo}
          </h2>
          <div className="w-full h-full flex-1 relative">
            <Canvas
              camera={{ position: [0, 1.1, 5.7], fov: 29 }} 
              shadows
              style={{ background: 'black' }}
              performance={{ min: 0.5 }} // Optimización de rendimiento
            >
              <Suspense fallback={<Html center>Cargando modelo...</Html>}>
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
                <Doctor3D 
                  seccionActual={seccion}
                  preguntaActual={pregunta}
                  onInteraccion={() => {}}
                />
                <Environment 
                  preset="sunset" 
                  background={false}
                  resolution={256}
                />
                <OrbitControls 
                  enableZoom={false}
                  enablePan={false}
                  minPolarAngle={Math.PI / 3}
                  maxPolarAngle={Math.PI / 2}
                />
              </Suspense>
            </Canvas>
          </div>
        </div>
        {/* Formulario - mitad derecha */}
        <div className="w-1/2 h-full flex flex-col items-center justify-center bg-white overflow-y-auto">
          <div className="w-full max-w-xl p-4">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                {seccion.titulo}
              </h3>
              <p className="text-gray-600">{seccion.descripcion}</p>
            </div>
            {seccion.id === 'datos-personales' ? (
              <FormularioDatosPersonales
                preguntas={seccion.preguntas}
                respuestas={respuestas}
                onRespuestas={vals => {
                  setRespuestas(prev => ({ ...prev, ...vals }))
                  setSeccionActual(prev => prev + 1)
                  setPreguntaActual(0)
                }}
              />
            ) : (
              pregunta && (
                <PreguntaFormulario
                  pregunta={pregunta}
                  onRespuesta={handleRespuesta}
                  valorActual={respuestas[pregunta.id]}
                  respuestas={respuestas}
                  historia={HISTORIAS_SECCIONES[seccionActual]}
                />
              )
            )}
          </div>
        </div>
      </div>
      {/* Barra de progreso mejorada con indicadores de sección */}
      <div className="absolute bottom-0 left-0 w-full flex flex-col items-center mb-4">
        {/* Indicadores de sección */}
        <div className="flex justify-between items-center w-full max-w-4xl mb-3 px-4">
          {SECCIONES_ANAMNESIS.map((sec, index) => (
            <div key={sec.id} className="flex flex-col items-center">
              <div className={`w-3 h-3 rounded-full mb-1 transition-all duration-300 ${
                index < seccionActual 
                  ? 'bg-green-500' 
                  : index === seccionActual 
                    ? 'bg-blue-500 animate-pulse' 
                    : 'bg-gray-300'
              }`}></div>
              <span className={`text-xs font-medium transition-all duration-300 ${
                index <= seccionActual ? 'text-gray-700' : 'text-gray-400'
              }`}>
                {sec.titulo.split(' ')[0]}
              </span>
            </div>
          ))}
        </div>
        
        {/* Barra de progreso principal */}
        <div className="flex justify-between items-center w-full max-w-lg mb-2 px-2">
          <span className="text-sm font-semibold text-gray-600">
            Sección {seccionActual + 1} de {SECCIONES_ANAMNESIS.length}: {seccion.titulo}
          </span>
          <span className="text-sm font-semibold text-gray-600">
            {progreso()}% Completado
          </span>
        </div>
        <div className="w-full max-w-lg bg-gray-200 rounded-full h-3 shadow-inner">
          <div 
            className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-500 ease-out shadow-lg"
            style={{ width: `${progreso()}%` }}
          ></div>
        </div>
        
        {/* Información adicional */}
        <div className="mt-2 text-center">
          <span className="text-xs text-gray-500">
            Pregunta {preguntaActual + 1} de {seccion.preguntas.length} en esta sección
          </span>
        </div>
      </div>
    </div>
  )
}