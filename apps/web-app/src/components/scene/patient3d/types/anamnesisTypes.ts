// Tipos para Anamnesis Inmersiva basada en Semiología Médica de Álvarez

export interface AnamnesisStep {
  id: string
  title: string
  description: string
  category: 'identificacion' | 'motivo' | 'enfermedad_actual' | 'antecedentes' | 'revision_sistemas' | 'habitos' | 'familiares' | 'sociales' | 'examen_fisico' | 'conclusiones'
  isRequired: boolean
  order: number
}

export interface PatientIdentification {
  nombre: string
  apellidos: string
  edad: number
  sexo: 'masculino' | 'femenino' | 'otro'
  fechaNacimiento: string
  documentoIdentidad: string
  telefono: string
  email: string
  direccion: string
  ocupacion: string
  estadoCivil: string
  nacionalidad: string
  religion: string
}

export interface MotivoConsulta {
  motivoPrincipal: string
  tiempoEvolucion: string
  caracteristicas: {
    inicio: 'brusco' | 'gradual' | 'insidioso'
    curso: 'continuo' | 'intermitente' | 'recurrente'
    intensidad: number // 1-10
    localizacion: string[]
  }
  sintomasAsociados: string[]
  factoresAgravantes: string[]
  factoresMejorantes: string[]
}

export interface EnfermedadActual {
  cronologia: string
  sintomasPrincipales: SymptomDetail[]
  tratamientosPrevios: Treatment[]
  estudiosRealizados: MedicalStudy[]
  evolucion: string
}

export interface SymptomDetail {
  id: string
  nombre: string
  localizacion: string[]
  intensidad: number // 1-10
  caracteristicas: {
    tipo: 'dolor' | 'malestar' | 'debilidad' | 'alteracion_sensorial' | 'otro'
    calidad: string
    irradiacion: string[]
    factoresAgravantes: string[]
    factoresMejorantes: string[]
    horario: string
  }
  tiempoEvolucion: string
  sintomasAsociados: string[]
}

export interface Treatment {
  medicamento: string
  dosis: string
  frecuencia: string
  duracion: string
  efectividad: 'excelente' | 'buena' | 'regular' | 'mala' | 'ninguna'
  efectosSecundarios: string[]
}

export interface MedicalStudy {
  tipo: 'laboratorio' | 'imagen' | 'procedimiento' | 'consulta_especialista'
  nombre: string
  fecha: string
  resultado: string
  interpretacion: string
}

export interface AntecedentesPatologicos {
  enfermedadesPrevias: Disease[]
  cirugias: Surgery[]
  traumatismos: Trauma[]
  alergias: Allergy[]
  transfusiones: Transfusion[]
  hospitalizaciones: Hospitalization[]
}

export interface Disease {
  nombre: string
  fechaDiagnostico: string
  tratamiento: string
  evolucion: 'curado' | 'controlado' | 'activo' | 'secuelas'
  complicaciones: string[]
}

export interface Surgery {
  procedimiento: string
  fecha: string
  hospital: string
  cirujano: string
  complicaciones: string[]
  evolucion: string
}

export interface Trauma {
  tipo: string
  fecha: string
  localizacion: string
  tratamiento: string
  secuelas: string[]
}

export interface Allergy {
  sustancia: string
  tipo: 'medicamento' | 'alimento' | 'ambiente' | 'otro'
  reaccion: string
  severidad: 'leve' | 'moderada' | 'severa'
}

export interface Transfusion {
  tipo: string
  fecha: string
  cantidad: string
  reaccion: string
}

export interface Hospitalization {
  motivo: string
  fecha: string
  duracion: string
  hospital: string
  diagnostico: string
  tratamiento: string
}

export interface RevisionSistemas {
  sistemaNervioso: SystemReview
  sistemaCardiovascular: SystemReview
  sistemaRespiratorio: SystemReview
  sistemaDigestivo: SystemReview
  sistemaGenitourinario: SystemReview
  sistemaEndocrino: SystemReview
  sistemaHematologico: SystemReview
  sistemaMusculoesqueletico: SystemReview
  sistemaInmunologico: SystemReview
  piel: SystemReview
}

export interface SystemReview {
  sintomasPositivos: string[]
  sintomasNegativos: string[]
  alteraciones: string[]
  observaciones: string
}

export interface Habitos {
  tabaco: {
    consume: boolean
    cantidad: string
    tiempo: string
    intentosAbandono: number
  }
  alcohol: {
    consume: boolean
    tipo: string
    cantidad: string
    frecuencia: string
  }
  drogas: {
    consume: boolean
    tipo: string
    frecuencia: string
    tiempo: string
  }
  ejercicio: {
    realiza: boolean
    tipo: string
    frecuencia: string
    duracion: string
  }
  alimentacion: {
    tipo: string
    restricciones: string[]
    suplementos: string[]
  }
  sueno: {
    horas: number
    calidad: 'excelente' | 'buena' | 'regular' | 'mala'
    alteraciones: string[]
  }
}

export interface AntecedentesFamiliares {
  padre: FamilyMember
  madre: FamilyMember
  hermanos: FamilyMember[]
  hijos: FamilyMember[]
  otros: FamilyMember[]
}

export interface FamilyMember {
  relacion: string
  edad: number
  estadoSalud: string
  enfermedades: string[]
  causaMuerte?: string
}

export interface AntecedentesSociales {
  nivelEducativo: string
  ocupacion: string
  ingresos: string
  vivienda: string
  apoyoSocial: string
  exposicionLaboral: string[]
  exposicionAmbiental: string[]
  viajes: Travel[]
  estresores: string[]
}

export interface Travel {
  destino: string
  fecha: string
  duracion: string
  proposito: string
  problemas: string[]
}

export interface ExamenFisico {
  signosVitales: VitalSigns
  aspectoGeneral: string
  cabeza: HeadExam
  cuello: NeckExam
  torax: ChestExam
  abdomen: AbdomenExam
  extremidades: ExtremitiesExam
  sistemaNervioso: NeurologicalExam
  piel: SkinExam
}

export interface VitalSigns {
  temperatura: number
  presionArterial: string
  frecuenciaCardiaca: number
  frecuenciaRespiratoria: number
  peso: number
  talla: number
  imc: number
  saturacionOxigeno: number
}

export interface HeadExam {
  inspeccion: string
  palpacion: string
  ojos: string
  oidos: string
  nariz: string
  boca: string
  faringe: string
}

export interface NeckExam {
  inspeccion: string
  palpacion: string
  movilidad: string
  ganglios: string
  tiroides: string
  venas: string
}

export interface ChestExam {
  inspeccion: string
  palpacion: string
  percusion: string
  auscultacion: string
  corazon: string
  pulmones: string
}

export interface AbdomenExam {
  inspeccion: string
  palpacion: string
  percusion: string
  auscultacion: string
  organomegalias: string
  masas: string
  dolor: string
}

export interface ExtremitiesExam {
  inspeccion: string
  palpacion: string
  movilidad: string
  fuerza: string
  reflejos: string
  circulacion: string
}

export interface NeurologicalExam {
  estadoMental: string
  paresCraneales: string
  motilidad: string
  sensibilidad: string
  reflejos: string
  coordinacion: string
  marcha: string
}

export interface SkinExam {
  color: string
  textura: string
  lesiones: string[]
  edemas: string[]
  cicatrices: string[]
}

export interface AnamnesisData {
  identificacion: PatientIdentification
  motivoConsulta: MotivoConsulta
  enfermedadActual: EnfermedadActual
  antecedentesPatologicos: AntecedentesPatologicos
  revisionSistemas: RevisionSistemas
  habitos: Habitos
  antecedentesFamiliares: AntecedentesFamiliares
  antecedentesSociales: AntecedentesSociales
  examenFisico: ExamenFisico
  conclusiones: string
  impresionDiagnostica: string[]
  planTerapeutico: string[]
}

export interface AnamnesisStore {
  // Estado de navegación
  currentStep: number
  totalSteps: number
  steps: AnamnesisStep[]
  
  // Datos de anamnesis
  anamnesisData: Partial<AnamnesisData>
  
  // Estado 3D
  patientAvatarState: {
    currentAnimation: string
    highlightedBodyParts: string[]
    isHighlighting: boolean
    selectedRegion: string | null
  }
  
  // Estado de la interfaz
  uiState: {
    isSidebarOpen: boolean
    currentTool: string | null
    zoomLevel: number
    cameraPosition: [number, number, number]
  }
  
  // Acciones
  actions: {
    nextStep: () => void
    previousStep: () => void
    goToStep: (step: number) => void
    updateAnamnesisData: (data: Partial<AnamnesisData>) => void
    updatePatientAvatar: (state: Partial<AnamnesisStore['patientAvatarState']>) => void
    updateUIState: (state: Partial<AnamnesisStore['uiState']>) => void
    initializeAnamnesis: () => void
    saveAnamnesis: () => Promise<void>
    loadAnamnesis: (patientId: string) => Promise<void>
  }
}