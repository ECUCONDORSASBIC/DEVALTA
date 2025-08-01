'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RespuestaAnamnesis, PreguntaAnamnesis, LogroAnamnesis } from '@/types/anamnesis.types'

interface AnamnesisInteractivaAvanzadaProps {
  onComplete: (respuestas: Record<string, RespuestaAnamnesis>) => void
  onClose: () => void
  pacienteId: string
}

const preguntasAnamnesis: PreguntaAnamnesis[] = [
  {
    id: 'nombre',
    texto: '¿Cuál es tu nombre completo?',
    tipo: 'texto',
    puntosMaximos: 50,
    contexto: 'Información básica del paciente',
    historia: 'Todo gran héroe comienza con un nombre. ¡El tuyo será recordado en los anales médicos!',
    mascota: {
      emoji: '👋',
      mensaje: '¡Hola! Soy tu mascota médica. Vamos a conocernos mejor.'
    }
  },
  {
    id: 'edad',
    texto: '¿Cuál es tu edad?',
    tipo: 'numero',
    puntosMaximos: 30,
    contexto: 'Datos demográficos',
    historia: 'La edad es más que un número, es la historia de tu cuerpo contada en años.',
    mascota: {
      emoji: '🎂',
      mensaje: '¡Cada año es una nueva aventura!'
    }
  },
  {
    id: 'genero',
    texto: '¿Cuál es tu género?',
    tipo: 'opciones',
    opciones: ['Masculino', 'Femenino', 'No binario', 'Prefiero no decir'],
    puntosMaximos: 40,
    contexto: 'Información demográfica',
    historia: 'Cada persona es única, y tu identidad es parte importante de tu historia médica.',
    mascota: {
      emoji: '🌈',
      mensaje: '¡La diversidad hace el mundo más hermoso!'
    }
  },
  {
    id: 'sintomas_principales',
    texto: '¿Cuáles son tus síntomas principales?',
    tipo: 'texto',
    puntosMaximos: 100,
    contexto: 'Síntomas actuales',
    historia: 'Los síntomas son las pistas que nos ayudan a resolver el misterio de tu salud.',
    mascota: {
      emoji: '🔍',
      mensaje: '¡Vamos a ser detectives médicos juntos!'
    }
  },
  {
    id: 'alergias',
    texto: '¿Tienes alguna alergia conocida?',
    tipo: 'texto',
    puntosMaximos: 80,
    contexto: 'Historial de alergias',
    historia: 'Las alergias son como pequeños enemigos que necesitamos identificar para protegerte.',
    mascota: {
      emoji: '⚠️',
      mensaje: '¡Es importante saber esto para tu seguridad!'
    }
  },
  {
    id: 'medicamentos_actuales',
    texto: '¿Estás tomando algún medicamento actualmente?',
    tipo: 'texto',
    puntosMaximos: 90,
    contexto: 'Medicación actual',
    historia: 'Los medicamentos son como herramientas mágicas que necesitamos coordinar.',
    mascota: {
      emoji: '💊',
      mensaje: '¡Cada medicamento tiene su historia!'
    }
  }
]

const logrosDisponibles: LogroAnamnesis[] = [
  {
    id: 'explorador-inicial',
    nombre: 'Explorador Inicial',
    descripcion: 'Completaste tu primera pregunta de anamnesis',
    emoji: '🌟',
    puntosRequeridos: 50,
    desbloqueado: false
  },
  {
    id: 'comunicador-estelar',
    nombre: 'Comunicador Estelar',
    descripcion: 'Proporcionaste información detallada en tus respuestas',
    emoji: '💬',
    puntosRequeridos: 200,
    desbloqueado: false
  },
  {
    id: 'detective-medico',
    nombre: 'Detective Médico',
    descripcion: 'Identificaste síntomas importantes',
    emoji: '🔍',
    puntosRequeridos: 300,
    desbloqueado: false
  },
  {
    id: 'historiador-salud',
    nombre: 'Historiador de la Salud',
    descripcion: 'Completaste toda la anamnesis básica',
    emoji: '📚',
    puntosRequeridos: 400,
    desbloqueado: false
  }
]

export function AnamnesisInteractivaAvanzada({ onComplete, onClose, pacienteId }: AnamnesisInteractivaAvanzadaProps) {
  const [preguntaActual, setPreguntaActual] = useState(0)
  const [respuestas, setRespuestas] = useState<Record<string, RespuestaAnamnesis>>({})
  const [puntosTotal, setPuntosTotal] = useState(0)
  const [logrosObtenidos, setLogrosObtenidos] = useState<string[]>([])
  const [tiempoInicio, setTiempoInicio] = useState<number>(Date.now())
  const [mostrarLogro, setMostrarLogro] = useState<string | null>(null)
  const [respuestaActual, setRespuestaActual] = useState('')
  const [mostrarMascota, setMostrarMascota] = useState(true)

  const pregunta = preguntasAnamnesis[preguntaActual]
  const progreso = ((preguntaActual + 1) / preguntasAnamnesis.length) * 100

  useEffect(() => {
    setTiempoInicio(Date.now())
  }, [])

  const verificarLogros = (nuevosPuntos: number) => {
    const nuevosLogros = logrosDisponibles
      .filter(logro => !logrosObtenidos.includes(logro.id) && nuevosPuntos >= logro.puntosRequeridos)
      .map(logro => logro.id)

    if (nuevosLogros.length > 0) {
      setLogrosObtenidos(prev => [...prev, ...nuevosLogros])
      setMostrarLogro(nuevosLogros[0])
      setTimeout(() => setMostrarLogro(null), 3000)
    }
  }

  const calcularPuntos = (respuesta: string): number => {
    let puntos = pregunta.puntosMaximos
    
    // Bonus por respuesta detallada
    if (respuesta.length > 20) {
      puntos += Math.min(50, Math.floor(respuesta.length / 10))
    }
    
    // Bonus por tiempo rápido (menos de 30 segundos)
    const tiempoRespuesta = (Date.now() - tiempoInicio) / 1000
    if (tiempoRespuesta < 30) {
      puntos += 20
    }
    
    return Math.min(puntos, pregunta.puntosMaximos + 70)
  }

  const handleSiguiente = () => {
    if (!respuestaActual.trim()) return

    const tiempoRespuesta = (Date.now() - tiempoInicio) / 1000
    const puntos = calcularPuntos(respuestaActual)
    
    const nuevaRespuesta: RespuestaAnamnesis = {
      preguntaId: pregunta.id,
      respuesta: pregunta.tipo === 'numero' ? parseInt(respuestaActual) : respuestaActual,
      puntos,
      tiempoRespuesta,
      logros: [],
      contexto: pregunta.contexto
    }

    const nuevasRespuestas = { ...respuestas, [pregunta.id]: nuevaRespuesta }
    setRespuestas(nuevasRespuestas)
    
    const nuevosPuntos = puntosTotal + puntos
    setPuntosTotal(nuevosPuntos)
    verificarLogros(nuevosPuntos)

    if (preguntaActual < preguntasAnamnesis.length - 1) {
      setPreguntaActual(prev => prev + 1)
      setRespuestaActual('')
      setTiempoInicio(Date.now())
    } else {
      // Completar anamnesis
      const tiempoTotal = (Date.now() - tiempoInicio) / 1000
      onComplete({
        ...nuevasRespuestas,
        tiempoTotal
      })
    }
  }

  const handleAnterior = () => {
    if (preguntaActual > 0) {
      setPreguntaActual(prev => prev - 1)
      const preguntaAnterior = preguntasAnamnesis[preguntaActual - 1]
      setRespuestaActual(respuestas[preguntaAnterior.id]?.respuesta?.toString() || '')
      setTiempoInicio(Date.now())
    }
  }

  const logroActual = mostrarLogro ? logrosDisponibles.find(l => l.id === mostrarLogro) : null

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60">
      <motion.div
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">🏥 Anamnesis Interactiva</h2>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
          
          {/* Barra de progreso */}
          <div className="w-full bg-white/20 rounded-full h-3 mb-2">
            <motion.div
              className="bg-white h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progreso}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          
          <div className="flex justify-between text-sm">
            <span>Pregunta {preguntaActual + 1} de {preguntasAnamnesis.length}</span>
            <span>Puntos: {puntosTotal} 🎯</span>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <AnimatePresence mode="wait">
            <motion.div
              key={preguntaActual}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Mascota médica */}
              {mostrarMascota && pregunta.mascota && (
                <motion.div
                  className="bg-gradient-to-r from-blue-100 to-purple-100 p-4 rounded-lg mb-6 border-l-4 border-blue-500"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{pregunta.mascota.emoji}</span>
                    <div>
                      <p className="font-semibold text-gray-800">{pregunta.mascota.mensaje}</p>
                      {pregunta.historia && (
                        <p className="text-sm text-gray-600 mt-1">{pregunta.historia}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Pregunta */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  {pregunta.texto}
                </h3>
                
                {/* Campo de respuesta */}
                {pregunta.tipo === 'opciones' ? (
                  <div className="space-y-3">
                    {pregunta.opciones?.map((opcion, index) => (
                      <button
                        key={index}
                        onClick={() => setRespuestaActual(opcion)}
                        className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                          respuestaActual === opcion
                            ? 'border-purple-500 bg-purple-50 text-purple-700'
                            : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                        }`}
                      >
                        {opcion}
                      </button>
                    ))}
                  </div>
                ) : pregunta.tipo === 'numero' ? (
                  <input
                    type="number"
                    value={respuestaActual}
                    onChange={(e) => setRespuestaActual(e.target.value)}
                    className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                    placeholder="Ingresa tu respuesta..."
                  />
                ) : (
                  <textarea
                    value={respuestaActual}
                    onChange={(e) => setRespuestaActual(e.target.value)}
                    className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none resize-none"
                    rows={4}
                    placeholder="Escribe tu respuesta aquí..."
                  />
                )}
              </div>

              {/* Logros obtenidos */}
              {logrosObtenidos.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-700 mb-3">🏆 Logros Desbloqueados:</h4>
                  <div className="flex flex-wrap gap-2">
                    {logrosObtenidos.map(logroId => {
                      const logro = logrosDisponibles.find(l => l.id === logroId)
                      return logro ? (
                        <span
                          key={logroId}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm"
                        >
                          {logro.emoji} {logro.nombre}
                        </span>
                      ) : null
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer con botones */}
        <div className="bg-gray-50 p-6 border-t">
          <div className="flex justify-between items-center">
            <button
              onClick={handleAnterior}
              disabled={preguntaActual === 0}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                preguntaActual === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}
            >
              ← Anterior
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Pregunta {preguntaActual + 1} de {preguntasAnamnesis.length}
              </p>
              <p className="text-lg font-bold text-purple-600">
                {puntosTotal} puntos acumulados
              </p>
            </div>

            <button
              onClick={handleSiguiente}
              disabled={!respuestaActual.trim()}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                !respuestaActual.trim()
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700'
              }`}
            >
              {preguntaActual === preguntasAnamnesis.length - 1 ? 'Finalizar' : 'Siguiente →'}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Notificación de logro */}
      <AnimatePresence>
        {logroActual && (
          <motion.div
            className="fixed top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-4 rounded-lg shadow-lg z-50"
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{logroActual.emoji}</span>
              <div>
                <h4 className="font-bold">{logroActual.nombre}</h4>
                <p className="text-sm">{logroActual.descripcion}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 