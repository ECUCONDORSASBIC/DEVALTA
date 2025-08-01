'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  RespuestaAnamnesis, 
  PreguntaAnamnesis, 
  LogroAnamnesis,
  CategoriaAnamnesis,
  UrgencyLevel,
  MedicalAlert,
  ValidationResult,
  DrugInteractionResult
} from '@/types/anamnesis.types'

interface AnamnesisProfesionalProps {
  onComplete: (respuestas: Record<string, RespuestaAnamnesis>, analysis: ClinicalAnalysis) => void
  onClose: () => void
  pacienteId: string
  previousData?: any
}

interface ClinicalAnalysis {
  urgency: UrgencyLevel
  alerts: MedicalAlert[]
  differentialDiagnosis: string[]
  recommendations: string[]
  riskFactors: string[]
  followUpNeeded: boolean
  confidence: number
}

interface VitalSigns {
  systolic: number
  diastolic: number
  heartRate: number
  temperature: number
  spO2: number
  respiratoryRate: number
  painLevel: number
}

// Preguntas médicas profesionales con validación clínica
const preguntasProfesionales: PreguntaAnamnesis[] = [
  {
    id: 'datos_personales',
    texto: 'Datos Personales',
    tipo: 'seccion',
    categoria: 'DATOS_PERSONALES',
    puntosGamificacion: 50,
    explicacionMedica: 'Información básica para identificación y contexto clínico',
    historiaPreliminar: {
      id: 'datos_personales',
      titulo: 'Tu Historia Comienza',
      contenido: 'Cada paciente es único. Tus datos personales nos ayudan a personalizar tu atención médica.'
    }
  },
  {
    id: 'nombre_completo',
    texto: 'Nombre completo',
    tipo: 'text',
    categoria: 'DATOS_PERSONALES',
    puntosGamificacion: 30,
    requerida: true,
    validacion: (valor: string) => {
      if (!valor || valor.length < 2) return 'El nombre debe tener al menos 2 caracteres'
      if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(valor)) return 'El nombre solo debe contener letras'
      return true
    }
  },
  {
    id: 'fecha_nacimiento',
    texto: 'Fecha de nacimiento',
    tipo: 'date',
    categoria: 'DATOS_PERSONALES',
    puntosGamificacion: 30,
    requerida: true,
    validacion: (valor: string) => {
      const birthDate = new Date(valor)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()
      if (age < 0 || age > 120) return 'Fecha de nacimiento inválida'
      return true
    }
  },
  {
    id: 'genero',
    texto: 'Género',
    tipo: 'select',
    opciones: ['Masculino', 'Femenino', 'No binario', 'Prefiero no decir'],
    categoria: 'DATOS_PERSONALES',
    puntosGamificacion: 20,
    requerida: true
  },
  {
    id: 'motivo_consulta',
    texto: '¿Cuál es el motivo principal de consulta?',
    tipo: 'textarea',
    categoria: 'MOTIVO_CONSULTA',
    puntosGamificacion: 100,
    requerida: true,
    explicacionMedica: 'El motivo de consulta es la base para orientar la evaluación clínica',
    validacion: (valor: string) => {
      if (!valor || valor.length < 10) return 'Por favor, describe tu motivo de consulta con más detalle'
      return true
    }
  },
  {
    id: 'sintomas_principales',
    texto: 'Describe tus síntomas principales',
    tipo: 'textarea',
    categoria: 'ENFERMEDAD_ACTUAL',
    puntosGamificacion: 150,
    requerida: true,
    explicacionMedica: 'Los síntomas nos ayudan a identificar posibles diagnósticos',
    validacion: (valor: string) => {
      if (!valor || valor.length < 15) return 'Por favor, describe tus síntomas con más detalle'
      return true
    }
  },
  {
    id: 'duracion_sintomas',
    texto: '¿Cuánto tiempo llevas con estos síntomas?',
    tipo: 'select',
    opciones: [
      'Menos de 24 horas',
      '1-3 días',
      '4-7 días', 
      '1-2 semanas',
      '2-4 semanas',
      '1-3 meses',
      'Más de 3 meses'
    ],
    categoria: 'ENFERMEDAD_ACTUAL',
    puntosGamificacion: 80,
    requerida: true
  },
  {
    id: 'intensidad_dolor',
    texto: 'En una escala del 1 al 10, ¿qué tan intenso es el dolor?',
    tipo: 'number',
    categoria: 'ENFERMEDAD_ACTUAL',
    puntosGamificacion: 60,
    validacion: (valor: number) => {
      if (valor < 0 || valor > 10) return 'La intensidad debe estar entre 0 y 10'
      return true
    }
  },
  {
    id: 'signos_vitales',
    texto: 'Signos Vitales',
    tipo: 'seccion',
    categoria: 'ENFERMEDAD_ACTUAL',
    puntosGamificacion: 100,
    explicacionMedica: 'Los signos vitales son indicadores importantes de tu estado de salud'
  },
  {
    id: 'presion_arterial',
    texto: 'Presión arterial (sistólica/diastólica)',
    tipo: 'text',
    categoria: 'ENFERMEDAD_ACTUAL',
    puntosGamificacion: 70,
    validacion: (valor: string) => {
      const pattern = /^(\d{2,3})\/(\d{2,3})$/
      if (!pattern.test(valor)) return 'Formato: 120/80'
      const [, systolic, diastolic] = valor.match(pattern) || []
      if (parseInt(systolic) < 70 || parseInt(systolic) > 200) return 'Presión sistólica fuera de rango'
      if (parseInt(diastolic) < 40 || parseInt(diastolic) > 130) return 'Presión diastólica fuera de rango'
      return true
    }
  },
  {
    id: 'frecuencia_cardiaca',
    texto: 'Frecuencia cardíaca (latidos por minuto)',
    tipo: 'number',
    categoria: 'ENFERMEDAD_ACTUAL',
    puntosGamificacion: 60,
    validacion: (valor: number) => {
      if (valor < 40 || valor > 200) return 'Frecuencia cardíaca fuera de rango normal'
      return true
    }
  },
  {
    id: 'temperatura',
    texto: 'Temperatura corporal (°C)',
    tipo: 'number',
    categoria: 'ENFERMEDAD_ACTUAL',
    puntosGamificacion: 50,
    validacion: (valor: number) => {
      if (valor < 35 || valor > 42) return 'Temperatura fuera de rango normal'
      return true
    }
  },
  {
    id: 'antecedentes_personales',
    texto: 'Antecedentes Personales',
    tipo: 'seccion',
    categoria: 'ANTECEDENTES_PERSONALES',
    puntosGamificacion: 120,
    explicacionMedica: 'Tu historial médico personal es crucial para un diagnóstico preciso'
  },
  {
    id: 'enfermedades_previas',
    texto: '¿Tienes alguna enfermedad previa o condición crónica?',
    tipo: 'textarea',
    categoria: 'ANTECEDENTES_PERSONALES',
    puntosGamificacion: 100
  },
  {
    id: 'cirugias_previas',
    texto: '¿Has tenido alguna cirugía previa?',
    tipo: 'textarea',
    categoria: 'ANTECEDENTES_PERSONALES',
    puntosGamificacion: 80
  },
  {
    id: 'alergias',
    texto: '¿Tienes alguna alergia conocida? (medicamentos, alimentos, etc.)',
    tipo: 'textarea',
    categoria: 'ALERGIA_MEDICAMENTOS',
    puntosGamificacion: 150,
    explicacionMedica: 'Las alergias son críticas para evitar reacciones adversas',
    validacion: (valor: string) => {
      if (valor && valor.toLowerCase().includes('ninguna')) return true
      if (valor && valor.length < 5) return 'Por favor, especifica las alergias o escribe "Ninguna"'
      return true
    }
  },
  {
    id: 'medicamentos_actuales',
    texto: '¿Estás tomando algún medicamento actualmente?',
    tipo: 'textarea',
    categoria: 'ALERGIA_MEDICAMENTOS',
    puntosGamificacion: 120,
    explicacionMedica: 'Es importante conocer todos los medicamentos para evitar interacciones',
    validacion: (valor: string) => {
      if (valor && valor.toLowerCase().includes('ninguno')) return true
      if (valor && valor.length < 5) return 'Por favor, especifica los medicamentos o escribe "Ninguno"'
      return true
    }
  },
  {
    id: 'habitos',
    texto: 'Hábitos y Estilo de Vida',
    tipo: 'seccion',
    categoria: 'HABITOS',
    puntosGamificacion: 100,
    explicacionMedica: 'Los hábitos de vida influyen significativamente en tu salud'
  },
  {
    id: 'tabaco',
    texto: '¿Fumas tabaco?',
    tipo: 'select',
    opciones: ['Nunca', 'Ocasionalmente', 'Regularmente', 'Ex fumador'],
    categoria: 'HABITOS',
    puntosGamificacion: 60
  },
  {
    id: 'alcohol',
    texto: '¿Consumes alcohol?',
    tipo: 'select',
    opciones: ['Nunca', 'Ocasionalmente', 'Regularmente', 'Ex consumidor'],
    categoria: 'HABITOS',
    puntosGamificacion: 60
  },
  {
    id: 'actividad_fisica',
    texto: '¿Realizas actividad física regular?',
    tipo: 'select',
    opciones: ['No', 'Ocasionalmente', 'Regularmente', 'Intensamente'],
    categoria: 'HABITOS',
    puntosGamificacion: 60
  },
  {
    id: 'revision_sistemas',
    texto: 'Revisión por Sistemas',
    tipo: 'seccion',
    categoria: 'REVISION_SISTEMAS',
    puntosGamificacion: 150,
    explicacionMedica: 'Revisión sistemática de todos los aparatos y sistemas del cuerpo'
  },
  {
    id: 'sistema_respiratorio',
    texto: '¿Tienes síntomas respiratorios? (tos, dificultad para respirar, etc.)',
    tipo: 'textarea',
    categoria: 'REVISION_SISTEMAS',
    puntosGamificacion: 80
  },
  {
    id: 'sistema_cardiovascular',
    texto: '¿Tienes síntomas cardiovasculares? (dolor en el pecho, palpitaciones, etc.)',
    tipo: 'textarea',
    categoria: 'REVISION_SISTEMAS',
    puntosGamificacion: 80
  },
  {
    id: 'sistema_digestivo',
    texto: '¿Tienes síntomas digestivos? (náuseas, vómitos, dolor abdominal, etc.)',
    tipo: 'textarea',
    categoria: 'REVISION_SISTEMAS',
    puntosGamificacion: 80
  }
]

// Sistema de validación clínica
class ClinicalValidator {
  static validateVitalSigns(vitals: Partial<VitalSigns>): ValidationResult {
    const alerts: string[] = []
    
    if (vitals.systolic && vitals.diastolic) {
      if (vitals.systolic > 180 || vitals.diastolic > 110) {
        alerts.push('Hipertensión severa detectada')
      } else if (vitals.systolic < 90 || vitals.diastolic < 60) {
        alerts.push('Hipotensión detectada')
      }
    }
    
    if (vitals.heartRate) {
      if (vitals.heartRate > 100) {
        alerts.push('Taquicardia detectada')
      } else if (vitals.heartRate < 60) {
        alerts.push('Bradicardia detectada')
      }
    }
    
    if (vitals.temperature) {
      if (vitals.temperature > 38) {
        alerts.push('Fiebre detectada')
      } else if (vitals.temperature < 35) {
        alerts.push('Hipotermia detectada')
      }
    }
    
    if (vitals.spO2 && vitals.spO2 < 95) {
      alerts.push('Saturación de oxígeno baja')
    }
    
    return {
      isValid: alerts.length === 0,
      alerts,
      severity: alerts.length > 0 ? 'warning' : 'normal'
    }
  }
  
  static validateMedications(medications: string): DrugInteractionResult {
    // Simulación de validación de medicamentos
    const commonInteractions = [
      { drug1: 'warfarin', drug2: 'aspirin', severity: 'high' },
      { drug1: 'simvastatin', drug2: 'amiodarone', severity: 'moderate' }
    ]
    
    const detectedInteractions = commonInteractions.filter(interaction => 
      medications.toLowerCase().includes(interaction.drug1) && 
      medications.toLowerCase().includes(interaction.drug2)
    )
    
    return {
      hasInteractions: detectedInteractions.length > 0,
      interactions: detectedInteractions,
      recommendations: detectedInteractions.map(i => 
        `Evitar combinación de ${i.drug1} con ${i.drug2}`
      )
    }
  }
}

// Sistema de alertas médicas
class MedicalAlertSystem {
  static checkUrgency(symptoms: string, vitalSigns: Partial<VitalSigns>): UrgencyLevel {
    const redFlags = [
      'dolor en el pecho',
      'dificultad para respirar',
      'pérdida de consciencia',
      'convulsiones',
      'hemorragia severa',
      'trauma severo'
    ]
    
    const hasRedFlags = redFlags.some(flag => 
      symptoms.toLowerCase().includes(flag)
    )
    
    if (hasRedFlags) return 'EMERGENCY'
    
    const vitalAlerts = ClinicalValidator.validateVitalSigns(vitalSigns)
    if (vitalAlerts.severity === 'critical') return 'URGENT'
    
    return 'ROUTINE'
  }
  
  static generateAlerts(respuestas: Record<string, RespuestaAnamnesis>): MedicalAlert[] {
    const alerts: MedicalAlert[] = []
    
    // Verificar alergias
    const alergias = respuestas.alergias?.respuesta
    if (alergias && !alergias.toLowerCase().includes('ninguna')) {
      alerts.push({
        id: 'alergias',
        type: 'warning',
        title: 'Alergias Identificadas',
        message: `Paciente reporta alergias: ${alergias}`,
        priority: 'high'
      })
    }
    
    // Verificar medicamentos
    const medicamentos = respuestas.medicamentos_actuales?.respuesta
    if (medicamentos && !medicamentos.toLowerCase().includes('ninguno')) {
      const interactionResult = ClinicalValidator.validateMedications(medicamentos)
      if (interactionResult.hasInteractions) {
        alerts.push({
          id: 'interacciones',
          type: 'danger',
          title: 'Interacciones Medicamentosas Detectadas',
          message: interactionResult.recommendations.join(', '),
          priority: 'critical'
        })
      }
    }
    
    // Verificar síntomas de urgencia
    const sintomas = respuestas.sintomas_principales?.respuesta
    if (sintomas) {
      const urgency = this.checkUrgency(sintomas, {})
      if (urgency === 'EMERGENCY') {
        alerts.push({
          id: 'urgencia',
          type: 'danger',
          title: 'SÍNTOMAS DE URGENCIA',
          message: 'Se requieren atención médica inmediata',
          priority: 'critical'
        })
      }
    }
    
    return alerts
  }
}

export function AnamnesisProfesional({ 
  onComplete, 
  onClose, 
  pacienteId, 
  previousData 
}: AnamnesisProfesionalProps) {
  const [preguntaActual, setPreguntaActual] = useState(0)
  const [respuestas, setRespuestas] = useState<Record<string, RespuestaAnamnesis>>(previousData || {})
  const [puntosTotal, setPuntosTotal] = useState(0)
  const [logrosObtenidos, setLogrosObtenidos] = useState<string[]>([])
  const [tiempoInicio, setTiempoInicio] = useState<number>(Date.now())
  const [mostrarLogro, setMostrarLogro] = useState<string | null>(null)
  const [respuestaActual, setRespuestaActual] = useState('')
  const [mostrarMascota, setMostrarMascota] = useState(true)
  const [alerts, setAlerts] = useState<MedicalAlert[]>([])
  const [validacionError, setValidacionError] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  
  const pregunta = preguntasProfesionales[preguntaActual]
  const progreso = ((preguntaActual + 1) / preguntasProfesionales.length) * 100

  useEffect(() => {
    setTiempoInicio(Date.now())
    // Cargar respuesta previa si existe
    if (respuestas[pregunta.id]) {
      setRespuestaActual(respuestas[pregunta.id].respuesta?.toString() || '')
    } else {
      setRespuestaActual('')
    }
  }, [preguntaActual, pregunta.id, respuestas])

  const verificarLogros = (nuevosPuntos: number) => {
    const logrosDisponibles = [
      { id: 'explorador-inicial', puntosRequeridos: 100 },
      { id: 'comunicador-estelar', puntosRequeridos: 300 },
      { id: 'detective-medico', puntosRequeridos: 500 },
      { id: 'historiador-salud', puntosRequeridos: 800 }
    ]
    
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
    let puntos = pregunta.puntosGamificacion || 50
    
    // Bonus por respuesta detallada
    if (respuesta.length > 20) {
      puntos += Math.min(50, Math.floor(respuesta.length / 10))
    }
    
    // Bonus por tiempo rápido (menos de 30 segundos)
    const tiempoRespuesta = (Date.now() - tiempoInicio) / 1000
    if (tiempoRespuesta < 30) {
      puntos += 20
    }
    
    return Math.min(puntos, (pregunta.puntosGamificacion || 50) + 70)
  }

  const validarRespuesta = (respuesta: string): boolean | string => {
    if (pregunta.requerida && !respuesta.trim()) {
      return 'Esta pregunta es obligatoria'
    }
    
    if (pregunta.validacion) {
      return pregunta.validacion(respuesta)
    }
    
    return true
  }

  const handleSiguiente = async () => {
    const validacion = validarRespuesta(respuestaActual)
    if (typeof validacion === 'string') {
      setValidacionError(validacion)
      return
    }
    
    setValidacionError(null)
    
    const tiempoRespuesta = (Date.now() - tiempoInicio) / 1000
    const puntos = calcularPuntos(respuestaActual)
    
    const nuevaRespuesta: RespuestaAnamnesis = {
      preguntaId: pregunta.id,
      respuesta: pregunta.tipo === 'number' ? parseInt(respuestaActual) : respuestaActual,
      puntos,
      tiempoRespuesta,
      logros: [],
      contexto: pregunta.categoria
    }

    const nuevasRespuestas = { ...respuestas, [pregunta.id]: nuevaRespuesta }
    setRespuestas(nuevasRespuestas)
    
    const nuevosPuntos = puntosTotal + puntos
    setPuntosTotal(nuevosPuntos)
    verificarLogros(nuevosPuntos)

    // Generar alertas en tiempo real
    const nuevasAlertas = MedicalAlertSystem.generateAlerts(nuevasRespuestas)
    setAlerts(nuevasAlertas)

    if (preguntaActual < preguntasProfesionales.length - 1) {
      setPreguntaActual(prev => prev + 1)
      setRespuestaActual('')
      setTiempoInicio(Date.now())
    } else {
      // Completar anamnesis con análisis clínico
      setIsAnalyzing(true)
      
      try {
        const analysis = await generateClinicalAnalysis(nuevasRespuestas)
        onComplete(nuevasRespuestas, analysis)
      } catch (error) {
        console.error('Error en análisis clínico:', error)
        onComplete(nuevasRespuestas, {
          urgency: 'ROUTINE',
          alerts: nuevasAlertas,
          differentialDiagnosis: [],
          recommendations: [],
          riskFactors: [],
          followUpNeeded: false,
          confidence: 0.5
        })
      } finally {
        setIsAnalyzing(false)
      }
    }
  }

  const handleAnterior = () => {
    if (preguntaActual > 0) {
      setPreguntaActual(prev => prev - 1)
      const preguntaAnterior = preguntasProfesionales[preguntaActual - 1]
      setRespuestaActual(respuestas[preguntaAnterior.id]?.respuesta?.toString() || '')
      setTiempoInicio(Date.now())
    }
  }

  const renderInput = () => {
    switch (pregunta.tipo) {
      case 'text':
        return (
          <input
            type="text"
            value={respuestaActual}
            onChange={(e) => {
              setRespuestaActual(e.target.value)
              setValidacionError(null)
            }}
            onKeyPress={(e) => e.key === 'Enter' && handleSiguiente()}
            className={`w-full px-4 py-3 border-2 rounded-lg transition-all ${
              validacionError ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'
            } focus:outline-none focus:ring-2 focus:ring-blue-200`}
            placeholder="Escribe tu respuesta aquí..."
          />
        )

      case 'number':
        return (
          <input
            type="number"
            value={respuestaActual}
            onChange={(e) => {
              setRespuestaActual(e.target.value)
              setValidacionError(null)
            }}
            onKeyPress={(e) => e.key === 'Enter' && handleSiguiente()}
            className={`w-full px-4 py-3 border-2 rounded-lg transition-all ${
              validacionError ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'
            } focus:outline-none focus:ring-2 focus:ring-blue-200`}
            placeholder="Ingresa un número..."
          />
        )

      case 'textarea':
        return (
          <textarea
            value={respuestaActual}
            onChange={(e) => {
              setRespuestaActual(e.target.value)
              setValidacionError(null)
            }}
            rows={4}
            className={`w-full px-4 py-3 border-2 rounded-lg transition-all resize-none ${
              validacionError ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'
            } focus:outline-none focus:ring-2 focus:ring-blue-200`}
            placeholder="Cuéntanos con detalle..."
          />
        )

      case 'select':
        return (
          <div className="space-y-2">
            {pregunta.opciones?.map((opcion, index) => (
              <button
                key={opcion}
                onClick={() => {
                  setRespuestaActual(opcion)
                  setValidacionError(null)
                  setTimeout(() => handleSiguiente(), 100)
                }}
                className={`w-full px-4 py-3 text-left rounded-lg transition-all ${
                  respuestaActual === opcion
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <span className="flex items-center gap-3">
                  <span className={`text-2xl ${respuestaActual === opcion ? 'animate-bounce' : ''}`}>
                    {index === 0 ? '🔵' : index === 1 ? '🟢' : index === 2 ? '🟡' : '🟠'}
                  </span>
                  {opcion}
                </span>
              </button>
            ))}
          </div>
        )

      case 'date':
        return (
          <input
            type="date"
            value={respuestaActual}
            onChange={(e) => {
              setRespuestaActual(e.target.value)
              setValidacionError(null)
            }}
            className={`w-full px-4 py-3 border-2 rounded-lg transition-all ${
              validacionError ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'
            } focus:outline-none focus:ring-2 focus:ring-blue-200`}
          />
        )

      case 'seccion':
        return (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border-l-4 border-blue-500 text-center">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {pregunta.texto}
            </h3>
            {pregunta.explicacionMedica && (
              <p className="text-gray-600 mb-4">{pregunta.explicacionMedica}</p>
            )}
            <p className="text-blue-700 font-semibold animate-pulse mt-2">
              Presiona <span className="bg-blue-100 px-2 py-1 rounded">Siguiente →</span> para comenzar a llenar la anamnesis
            </p>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <motion.div
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">🏥 Anamnesis Profesional</h2>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors text-2xl"
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
            <span>Pregunta {preguntaActual + 1} de {preguntasProfesionales.length}</span>
            <span>Puntos: {puntosTotal} 🎯</span>
          </div>
        </div>

        {/* Alertas médicas */}
        {alerts.length > 0 && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-red-400 text-2xl">⚠️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Alertas Médicas
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  {alerts.map((alert, index) => (
                    <div key={index} className="mb-1">
                      <strong>{alert.title}:</strong> {alert.message}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

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
              {mostrarMascota && pregunta.historiaPreliminar && (
                <motion.div
                  className="bg-gradient-to-r from-blue-100 to-purple-100 p-4 rounded-lg mb-6 border-l-4 border-blue-500"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🩺</span>
                    <div>
                      <p className="font-semibold text-gray-800">{pregunta.historiaPreliminar.titulo}</p>
                      <p className="text-sm text-gray-600 mt-1">{pregunta.historiaPreliminar.contenido}</p>
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
                <div className="mb-4">
                  {renderInput()}
                </div>

                {/* Mensaje de error */}
                {validacionError && (
                  <motion.p
                    className="text-red-500 text-sm mb-2"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    ⚠️ {validacionError}
                  </motion.p>
                )}

                {/* Explicación médica */}
                {pregunta.explicacionMedica && pregunta.tipo !== 'seccion' && (
                  <div className="mt-4 bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                    <p className="text-sm font-semibold text-blue-800 mb-1">
                      💡 Información Médica
                    </p>
                    <p className="text-sm text-blue-700">
                      {pregunta.explicacionMedica}
                    </p>
                  </div>
                )}
              </div>

              {/* Logros obtenidos */}
              {logrosObtenidos.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-700 mb-3">🏆 Logros Desbloqueados:</h4>
                  <div className="flex flex-wrap gap-2">
                    {logrosObtenidos.map(logroId => (
                      <span
                        key={logroId}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm"
                      >
                        🌟 {logroId.replace('-', ' ').toUpperCase()}
                      </span>
                    ))}
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
                Pregunta {preguntaActual + 1} de {preguntasProfesionales.length}
              </p>
              <p className="text-lg font-bold text-blue-600">
                {puntosTotal} puntos acumulados
              </p>
            </div>

            <button
              onClick={handleSiguiente}
              disabled={!respuestaActual.trim() || isAnalyzing}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                !respuestaActual.trim() || isAnalyzing
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
              }`}
            >
              {isAnalyzing ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Analizando...
                </span>
              ) : preguntaActual === preguntasProfesionales.length - 1 ? (
                'Finalizar Análisis'
              ) : (
                'Siguiente →'
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Notificación de logro */}
      <AnimatePresence>
        {mostrarLogro && (
          <motion.div
            className="fixed top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-4 rounded-lg shadow-lg z-50"
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🏆</span>
              <div>
                <h4 className="font-bold">¡Logro Desbloqueado!</h4>
                <p className="text-sm">{mostrarLogro.replace('-', ' ').toUpperCase()}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Función para generar análisis clínico
async function generateClinicalAnalysis(respuestas: Record<string, RespuestaAnamnesis>): Promise<ClinicalAnalysis> {
  // Simulación de análisis clínico con IA
  const sintomas = respuestas.sintomas_principales?.respuesta || ''
  const alergias = respuestas.alergias?.respuesta || ''
  const medicamentos = respuestas.medicamentos_actuales?.respuesta || ''
  
  // Análisis básico de urgencia
  const urgency = MedicalAlertSystem.checkUrgency(sintomas, {})
  
  // Generar alertas
  const alerts = MedicalAlertSystem.generateAlerts(respuestas)
  
  // Simulación de diagnóstico diferencial basado en síntomas
  const differentialDiagnosis = generateDifferentialDiagnosis(sintomas)
  
  // Recomendaciones basadas en respuestas
  const recommendations = generateRecommendations(respuestas)
  
  // Factores de riesgo identificados
  const riskFactors = identifyRiskFactors(respuestas)
  
  return {
    urgency,
    alerts,
    differentialDiagnosis,
    recommendations,
    riskFactors,
    followUpNeeded: urgency !== 'ROUTINE' || alerts.length > 0,
    confidence: 0.75
  }
}

function generateDifferentialDiagnosis(sintomas: string): string[] {
  const sintomasLower = sintomas.toLowerCase()
  const diagnoses: string[] = []
  
  if (sintomasLower.includes('dolor de cabeza')) {
    diagnoses.push('Cefalea tensional', 'Migraña', 'Sinusitis')
  }
  if (sintomasLower.includes('fiebre')) {
    diagnoses.push('Infección viral', 'Infección bacteriana', 'COVID-19')
  }
  if (sintomasLower.includes('dolor abdominal')) {
    diagnoses.push('Gastritis', 'Apendicitis', 'Cólico biliar')
  }
  
  return diagnoses.length > 0 ? diagnoses : ['Evaluación clínica requerida']
}

function generateRecommendations(respuestas: Record<string, RespuestaAnamnesis>): string[] {
  const recommendations: string[] = []
  
  // Recomendaciones basadas en síntomas
  const sintomas = respuestas.sintomas_principales?.respuesta || ''
  if (sintomas.toLowerCase().includes('dolor en el pecho')) {
    recommendations.push('Evaluación cardiológica urgente')
  }
  
  // Recomendaciones basadas en medicamentos
  const medicamentos = respuestas.medicamentos_actuales?.respuesta || ''
  if (medicamentos && !medicamentos.toLowerCase().includes('ninguno')) {
    recommendations.push('Revisión de medicamentos por farmacéutico')
  }
  
  // Recomendaciones preventivas
  recommendations.push('Mantener seguimiento médico regular')
  
  return recommendations
}

function identifyRiskFactors(respuestas: Record<string, RespuestaAnamnesis>): string[] {
  const riskFactors: string[] = []
  
  // Factores de riesgo basados en hábitos
  const tabaco = respuestas.tabaco?.respuesta
  if (tabaco && tabaco !== 'Nunca') {
    riskFactors.push('Tabaquismo')
  }
  
  const alcohol = respuestas.alcohol?.respuesta
  if (alcohol && alcohol !== 'Nunca') {
    riskFactors.push('Consumo de alcohol')
  }
  
  // Factores de riesgo basados en antecedentes
  const enfermedades = respuestas.enfermedades_previas?.respuesta
  if (enfermedades && enfermedades.length > 0) {
    riskFactors.push('Enfermedades crónicas previas')
  }
  
  return riskFactors
} 