/**
 * Tipos Compartidos para Anamnesis - Altamedica
 * Reutilizables entre aplicaciones de doctores y pacientes
 */

// Tipos básicos de anamnesis
export interface PreguntaAnamnesis {
  id: string
  pregunta: string
  tipo: 'text' | 'number' | 'select' | 'boolean' | 'textarea'
  categoria: string
  opciones?: string[]
  requerida: boolean
  orden: number
  explicacionMedica?: string
  puntosGamificacion?: number
}

export interface SeccionAnamnesis {
  id: string
  titulo: string
  descripcion: string
  orden: number
  preguntas: PreguntaAnamnesis[]
}

export interface RespuestaAnamnesis {
  preguntaId: string
  respuesta: any
  timestamp: Date
  puntos?: number
  tiempoRespuesta?: number
  contexto?: string
}

// Datos completos de anamnesis
export interface AnamnesisCompleta {
  id: string
  pacienteId: string
  doctorId?: string
  fechaCreacion: Date
  fechaActualizacion: Date
  estado: 'en_progreso' | 'completada' | 'revisada' | 'archivada'
  
  // Datos de identificación
  datosPersonales: {
    nombre: string
    edad: number
    genero: string
    estadoCivil?: string
    ocupacion?: string
    telefono?: string
    email?: string
    direccion?: string
  }
  
  // Antecedentes familiares
  antecedentesFamiliares: {
    diabetes?: boolean
    hipertension?: boolean
    cancer?: boolean
    enfermedadesCardiovasculares?: boolean
    otrasEnfermedades?: string
  }
  
  // Antecedentes personales
  antecedentesPersonales: {
    alergias?: boolean
    alergiasDescripcion?: string
    cirugiasPrevias?: boolean
    cirugiasDescripcion?: string
    medicamentosActuales?: boolean
    medicamentosLista?: string
    enfermedadesCronicas?: string[]
  }
  
  // Hábitos
  habitos: {
    fuma?: boolean
    alcohol?: boolean
    ejercicio?: boolean
    dieta?: string
    sueno?: number // horas por día
  }
  
  // Motivo de consulta
  motivoConsulta: {
    sintomaPrincipal: string
    duracion: string
    intensidad?: number // 1-10
    factoresAgravantes?: string
    factoresMejorantes?: string
    sintomasAsociados?: string[]
  }
  
  // Enfermedad actual
  enfermedadActual: {
    inicio: string
    evolucion: string
    tratamientosPrevios?: string
    respuestaTratamientos?: string
  }
  
  // Revisión por sistemas
  revisionSistemas: {
    cardiovascular?: string
    respiratorio?: string
    digestivo?: string
    genitourinario?: string
    neurologico?: string
    musculoesqueletico?: string
    endocrino?: string
    psiquiatrico?: string
  }
  
  // Examen físico
  examenFisico?: {
    presionArterial?: string
    frecuenciaCardiaca?: number
    temperatura?: number
    peso?: number
    altura?: number
    imc?: number
    observacionesGenerales?: string
  }
  
  // Impresión diagnóstica
  impresionDiagnostica?: {
    diagnosticos: string[]
    diagnosticosDiferenciales?: string[]
    nivelUrgencia: 'baja' | 'media' | 'alta' | 'emergencia'
    confianza: number // 0-100
  }
  
  // Plan terapéutico
  planTerapeutico?: {
    medicamentos?: string[]
    estudios?: string[]
    recomendaciones?: string[]
    seguimiento?: string
    derivacion?: string
  }
  
  // Metadatos
  metadata: {
    version: string
    fuente: 'anamnesis_juego' | 'doctor_app' | 'patient_app'
    tiempoCompletado?: number // minutos
    puntosTotales?: number
    logrosObtenidos?: string[]
    calidadDatos: number // 0-100
  }
}

// Formato de exportación para interoperabilidad
export interface AnamnesisExport {
  version: string
  timestamp: Date
  anamnesis: AnamnesisCompleta
  formato: 'json' | 'fhir' | 'hl7' | 'pdf'
  metadata: {
    exportadoPor: string
    aplicacionOrigen: string
    aplicacionDestino?: string
    encriptado: boolean
    hashIntegridad?: string
  }
}

// Tipos para integración con FHIR
export interface FHIRQuestionnaireResponse {
  resourceType: 'QuestionnaireResponse'
  id: string
  questionnaire: string
  subject: {
    reference: string // Patient reference
  }
  authored: string // ISO 8601
  status: 'in-progress' | 'completed' | 'amended'
  item: Array<{
    linkId: string
    text: string
    answer: Array<{
      valueString?: string
      valueInteger?: number
      valueDate?: string
      valueBoolean?: boolean
      valueCoding?: {
        system: string
        code: string
        display: string
      }
    }>
  }>
}

// Tipos para análisis clínico
export interface AnalisisClinico {
  urgencia: 'baja' | 'media' | 'alta' | 'emergencia'
  alertas: string[]
  diagnosticosDiferenciales: string[]
  recomendaciones: string[]
  factoresRiesgo: string[]
  necesitaSeguimiento: boolean
  confianza: number
  tiempoEstimadoEspera?: number // minutos
}

// Tipos para validación
export interface ValidacionAnamnesis {
  esValida: boolean
  errores: string[]
  advertencias: string[]
  completitud: number // 0-100
  calidad: number // 0-100
  recomendaciones: string[]
}

// Tipos para búsqueda y filtrado
export interface FiltrosAnamnesis {
  pacienteId?: string
  doctorId?: string
  fechaDesde?: Date
  fechaHasta?: Date
  estado?: string[]
  nivelUrgencia?: string[]
  diagnosticos?: string[]
  completitud?: {
    min: number
    max: number
  }
}

// Tipos para estadísticas
export interface EstadisticasAnamnesis {
  totalAnamnesis: number
  completadas: number
  enProgreso: number
  promedioTiempoCompletado: number
  diagnosticosMasComunes: Array<{
    diagnostico: string
    frecuencia: number
  }>
  nivelUrgenciaDistribucion: Record<string, number>
  calidadPromedio: number
}

// Tipos para auditoría
export interface AuditoriaAnamnesis {
  accion: 'crear' | 'actualizar' | 'completar' | 'revisar' | 'exportar' | 'eliminar'
  usuarioId: string
  timestamp: Date
  detalles: Record<string, any>
  ip?: string
  userAgent?: string
}

// Tipos para notificaciones
export interface NotificacionAnamnesis {
  tipo: 'completada' | 'revisada' | 'urgente' | 'recordatorio'
  anamnesisId: string
  pacienteId: string
  doctorId?: string
  mensaje: string
  prioridad: 'baja' | 'media' | 'alta'
  timestamp: Date
  leida: boolean
} 