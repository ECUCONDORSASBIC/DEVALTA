// types/anamnesis.types.ts

export type TipoPregunta = 'text' | 'number' | 'textarea' | 'select' | 'date' | 'boolean' | 'seccion'

export type RarezaLogro = 'comun' | 'raro' | 'epico' | 'legendario'

export type UrgencyLevel = 'ROUTINE' | 'URGENT' | 'EMERGENCY'

export type AlertType = 'info' | 'warning' | 'danger' | 'success'

export type AlertPriority = 'low' | 'medium' | 'high' | 'critical'

export type ValidationSeverity = 'normal' | 'warning' | 'critical'

export type CategoriaAnamnesis = 
  | 'DATOS_PERSONALES'
  | 'MOTIVO_CONSULTA'
  | 'ENFERMEDAD_ACTUAL'
  | 'ANTECEDENTES_PERSONALES'
  | 'ANTECEDENTES_FAMILIARES'
  | 'REVISION_SISTEMAS'
  | 'HABITOS'
  | 'ALERGIA_MEDICAMENTOS'

export interface HistoriaMedica {
  id: string
  titulo: string
  contenido: string
  imagenUrl?: string
  datosCuriosos?: string[]
}

export interface LogroAnamnesis {
  id: string
  nombre: string
  descripcion: string
  emoji: string
  puntosRequeridos: number
  desbloqueado: boolean
}

export interface Logro {
  id: string
  nombre: string
  descripcion: string
  icono: string
  puntos: number
  rareza: RarezaLogro
  condicionDesbloqueo?: string
}

export interface PreguntaAnamnesis {
  id: string
  texto: string
  tipo: TipoPregunta
  opciones?: string[]
  historiaPreliminar?: HistoriaMedica
  explicacionMedica?: string
  puntosGamificacion: number
  categoria: CategoriaAnamnesis
  validacion?: (valor: any) => boolean | string
  requerida?: boolean
  orden?: number
}

export interface RespuestaAnamnesis {
  preguntaId: string
  respuesta: any
  puntos: number
  tiempoRespuesta: number
  logros: string[]
  contexto: CategoriaAnamnesis
  timestamp?: Date
}

export interface ValidationResult {
  isValid: boolean
  alerts: string[]
  severity: ValidationSeverity
}

export interface DrugInteractionResult {
  hasInteractions: boolean
  interactions: Array<{
    drug1: string
    drug2: string
    severity: 'low' | 'moderate' | 'high' | 'critical'
  }>
  recommendations: string[]
}

export interface MedicalAlert {
  id: string
  type: AlertType
  title: string
  message: string
  priority: AlertPriority
  timestamp?: Date
  dismissed?: boolean
}

export interface VitalSigns {
  systolic: number
  diastolic: number
  heartRate: number
  temperature: number
  spO2: number
  respiratoryRate: number
  painLevel: number
}

export interface ClinicalAnalysis {
  urgency: UrgencyLevel
  alerts: MedicalAlert[]
  differentialDiagnosis: string[]
  recommendations: string[]
  riskFactors: string[]
  followUpNeeded: boolean
  confidence: number
  vitalSigns?: VitalSigns
  estimatedWaitTime?: number // minutos
}

export interface SeccionAnamnesis {
  id: string
  titulo: string
  descripcion: string
  preguntas: PreguntaAnamnesis[]
  historia: HistoriaMedica
  logrosDesbloqueables: Logro[]
  orden: number
  puntosSeccion: number
}

export interface ProgresoAnamnesis {
  seccionActual: number
  preguntaActual: number
  respuestas: Record<string, RespuestaAnamnesis>
  puntosAcumulados: number
  logrosObtenidos: string[]
  tiempoTotal: number
  nivelCompletitud: number
  completada?: boolean
  fechaCompletado?: Date
}

export interface EscenaAnamnesis {
  id: string
  titulo: string
  descripcion: string
  imagenUrl: string
  secciones: string[]
  orden: number
  puntosEscena: number
}

// Tipos para el sistema de gamificación
export interface NivelGamificacion {
  nivel: number
  puntosRequeridos: number
  titulo: string
  descripcion: string
  icono: string
  recompensas: string[]
}

export interface EstadisticasAnamnesis {
  totalPreguntas: number
  preguntasRespondidas: number
  porcentajeCompletitud: number
  tiempoPromedioPorPregunta: number
  puntosPorCategoria: Record<CategoriaAnamnesis, number>
  logrosDesbloqueados: number
  nivelActual: number
  proximoNivel: number
}

// Tipos para el resumen médico
export interface ResumenMedico {
  datosPaciente: {
    nombre: string
    edad: number
    sexo: string
    ocupacion?: string
  }
  motivoConsulta: string
  enfermedadActual: string[]
  antecedentesPersonales: string[]
  antecedentesFamiliares: string[]
  revisionSistemas: Record<string, string>
  impresionDiagnostica: string[]
  recomendaciones: string[]
  fechaGeneracion: Date
}

// Tipos para la integración con agentes MCP
export interface AnalisisAgenteMCP {
  agenteId: string
  tipoAnalisis: 'riesgo' | 'diagnostico' | 'recomendacion' | 'seguimiento'
  resultado: string
  confianza: number
  timestamp: Date
  datosUtilizados: string[]
}

export interface RecomendacionClinica {
  id: string
  tipo: 'urgente' | 'importante' | 'sugerencia'
  titulo: string
  descripcion: string
  justificacion: string
  accionesRecomendadas: string[]
  seguimientoRequerido: boolean
  plazoSeguimiento?: number // días
  generadaPor: 'sistema' | 'agente_mcp'
  agenteId?: string
}

// Tipos para integración FHIR
export interface FHIRPatient {
  resourceType: 'Patient'
  id: string
  identifier: Array<{
    system: string
    value: string
  }>
  active: boolean
  name: Array<{
    use: 'usual' | 'official' | 'temp' | 'nickname'
    family: string
    given: string[]
  }>
  telecom?: Array<{
    system: 'phone' | 'fax' | 'email' | 'pager' | 'url'
    value: string
    use?: 'home' | 'work' | 'temp' | 'old' | 'mobile'
  }>
  gender: 'male' | 'female' | 'other' | 'unknown'
  birthDate: string // YYYY-MM-DD
  address?: Array<{
    use?: 'home' | 'work' | 'temp' | 'old' | 'billing'
    line: string[]
    city: string
    state: string
    postalCode: string
    country: string
  }>
}

export interface FHIRQuestionnaireResponse {
  resourceType: 'QuestionnaireResponse'
  questionnaire: string // Reference to Questionnaire
  subject: string // Reference to Patient
  authored: string // ISO 8601
  item: Array<{
    linkId: string
    text: string
    answer: Array<{
      valueString?: string
      valueInteger?: number
      valueDate?: string
      valueBoolean?: boolean
    }>
    item?: Array<any> // Nested items
  }>
  status: 'in-progress' | 'completed' | 'amended'
}

// Tipos para análisis de síntomas
export interface SymptomAnalysis {
  symptoms: string[]
  duration: string
  intensity: number
  frequency: string
  triggers: string[]
  alleviatingFactors: string[]
  associatedSymptoms: string[]
}

export interface DiagnosisResult {
  diagnosis: string
  probability: number
  confidence: number
  evidence: string[]
  differentialDiagnosis: string[]
}

export interface TreatmentRecommendation {
  type: 'medication' | 'procedure' | 'lifestyle' | 'referral'
  title: string
  description: string
  urgency: UrgencyLevel
  evidence: string[]
  contraindications: string[]
} 