import { useState, useCallback, useEffect } from 'react'
import { 
  PreguntaAnamnesis, 
  SeccionAnamnesis, 
  ProgresoAnamnesis, 
  RespuestaAnamnesis,
  Logro,
  EscenaAnamnesis
} from '../types/anamnesis.types'

interface UseAnamnesisProps {
  secciones: SeccionAnamnesis[]
  escenas: Record<string, EscenaAnamnesis>
  onCompletado?: (progreso: ProgresoAnamnesis) => void
}

export function useAnamnesis({ secciones, escenas, onCompletado }: UseAnamnesisProps) {
  const [progreso, setProgreso] = useState<ProgresoAnamnesis>({
    seccionActual: 0,
    preguntaActual: 0,
    respuestas: {},
    puntosAcumulados: 0,
    logrosObtenidos: [],
    tiempoTotal: 0,
    nivelCompletitud: 0
  })

  const [seccionActual, setSeccionActual] = useState<SeccionAnamnesis>(secciones[0])
  const [escenaActual, setEscenaActual] = useState<EscenaAnamnesis>(escenas[secciones[0].id])
  const [logrosNuevos, setLogrosNuevos] = useState<Logro[]>([])
  const [tiempoInicio] = useState(Date.now())

  // Calcular progreso
  const calcularProgreso = useCallback((respuestas: Record<string, RespuestaAnamnesis>) => {
    const totalPreguntas = secciones.reduce((total, seccion) => total + seccion.preguntas.length, 0)
    const preguntasRespondidas = Object.keys(respuestas).length
    return Math.round((preguntasRespondidas / totalPreguntas) * 100)
  }, [secciones])

  // Verificar logros
  const verificarLogros = useCallback((seccion: SeccionAnamnesis, respuestas: Record<string, RespuestaAnamnesis>) => {
    const preguntasSeccion = seccion.preguntas
    const respuestasSeccion = preguntasSeccion.filter(pregunta => 
      respuestas[pregunta.id]
    )

    return seccion.logrosDesbloqueables.filter(logro => {
      // Verificar si el logro ya fue obtenido
      if (progreso.logrosObtenidos.includes(logro.id)) {
        return false
      }

      // Verificar condiciones del logro (ejemplo: completar toda la sección)
      if (respuestasSeccion.length === preguntasSeccion.length) {
        return true
      }

      return false
    })
  }, [progreso.logrosObtenidos])

  // Manejar respuesta
  const responderPregunta = useCallback((preguntaId: string, valor: any, tiempoRespuesta: number) => {
    const nuevaRespuesta: RespuestaAnamnesis = {
      preguntaId,
      valor,
      timestamp: new Date(),
      tiempoRespuesta
    }

    const nuevasRespuestas = { ...progreso.respuestas, [preguntaId]: nuevaRespuesta }
    const pregunta = seccionActual.preguntas.find(p => p.id === preguntaId)
    const nuevosPuntos = progreso.puntosAcumulados + (pregunta?.puntosGamificacion || 0)

    // Verificar logros nuevos
    const logrosNuevos = verificarLogros(seccionActual, nuevasRespuestas)

    const nuevoProgreso: ProgresoAnamnesis = {
      ...progreso,
      respuestas: nuevasRespuestas,
      puntosAcumulados: nuevosPuntos,
      logrosObtenidos: [...progreso.logrosObtenidos, ...logrosNuevos.map(l => l.id)],
      nivelCompletitud: calcularProgreso(nuevasRespuestas),
      tiempoTotal: (Date.now() - tiempoInicio) / 1000
    }

    setProgreso(nuevoProgreso)
    setLogrosNuevos(logrosNuevos)

    // Verificar si se completó toda la anamnesis
    if (nuevoProgreso.nivelCompletitud === 100) {
      onCompletado?.(nuevoProgreso)
    }

    return nuevoProgreso
  }, [progreso, seccionActual, verificarLogros, calcularProgreso, tiempoInicio, onCompletado])

  // Avanzar a la siguiente pregunta
  const siguientePregunta = useCallback(() => {
    if (progreso.preguntaActual < seccionActual.preguntas.length - 1) {
      setProgreso(prev => ({ ...prev, preguntaActual: prev.preguntaActual + 1 }))
    } else if (progreso.seccionActual < secciones.length - 1) {
      const siguienteSeccion = secciones[progreso.seccionActual + 1]
      setSeccionActual(siguienteSeccion)
      setEscenaActual(escenas[siguienteSeccion.id])
      setProgreso(prev => ({ 
        ...prev, 
        seccionActual: prev.seccionActual + 1, 
        preguntaActual: 0 
      }))
    }
  }, [progreso, seccionActual, secciones, escenas])

  // Retroceder a la pregunta anterior
  const preguntaAnterior = useCallback(() => {
    if (progreso.preguntaActual > 0) {
      setProgreso(prev => ({ ...prev, preguntaActual: prev.preguntaActual - 1 }))
    } else if (progreso.seccionActual > 0) {
      const seccionAnterior = secciones[progreso.seccionActual - 1]
      setSeccionActual(seccionAnterior)
      setEscenaActual(escenas[seccionAnterior.id])
      setProgreso(prev => ({ 
        ...prev, 
        seccionActual: prev.seccionActual - 1, 
        preguntaActual: seccionAnterior.preguntas.length - 1 
      }))
    }
  }, [progreso, secciones, escenas])

  // Ir a una sección específica
  const irASeccion = useCallback((indiceSeccion: number) => {
    if (indiceSeccion >= 0 && indiceSeccion < secciones.length) {
      const seccion = secciones[indiceSeccion]
      setSeccionActual(seccion)
      setEscenaActual(escenas[seccion.id])
      setProgreso(prev => ({ 
        ...prev, 
        seccionActual: indiceSeccion, 
        preguntaActual: 0 
      }))
    }
  }, [secciones, escenas])

  // Obtener pregunta actual
  const preguntaActual = seccionActual.preguntas[progreso.preguntaActual]

  // Obtener estadísticas
  const estadisticas = {
    totalPreguntas: secciones.reduce((total, seccion) => total + seccion.preguntas.length, 0),
    preguntasRespondidas: Object.keys(progreso.respuestas).length,
    seccionesCompletadas: progreso.seccionActual,
    tiempoPromedioRespuesta: Object.values(progreso.respuestas).reduce((total, resp) => 
      total + resp.tiempoRespuesta, 0
    ) / Math.max(Object.keys(progreso.respuestas).length, 1),
    logrosObtenidos: progreso.logrosObtenidos.length
  }

  // Limpiar logros nuevos después de un tiempo
  useEffect(() => {
    if (logrosNuevos.length > 0) {
      const timer = setTimeout(() => {
        setLogrosNuevos([])
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [logrosNuevos])

  return {
    // Estado
    progreso,
    seccionActual,
    escenaActual,
    preguntaActual,
    logrosNuevos,
    
    // Acciones
    responderPregunta,
    siguientePregunta,
    preguntaAnterior,
    irASeccion,
    
    // Estadísticas
    estadisticas,
    
    // Utilidades
    calcularProgreso,
    verificarLogros
  }
} 