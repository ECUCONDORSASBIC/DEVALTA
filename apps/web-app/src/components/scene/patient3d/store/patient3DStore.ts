import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { AnamnesisStep, AnamnesisData, AnamnesisStore } from '../types/anamnesisTypes'

// Pasos de anamnesis basados en Semiología Médica de Álvarez
const ALVAREZ_ANAMNESIS_STEPS: AnamnesisStep[] = [
  {
    id: 'identificacion',
    title: 'Identificación del Paciente',
    description: 'Datos personales y demográficos del paciente',
    category: 'identificacion',
    isRequired: true,
    order: 1
  },
  {
    id: 'motivo_consulta',
    title: 'Motivo de Consulta',
    description: 'Razón principal por la que acude el paciente',
    category: 'motivo',
    isRequired: true,
    order: 2
  },
  {
    id: 'enfermedad_actual',
    title: 'Enfermedad Actual',
    description: 'Historia detallada del problema actual',
    category: 'enfermedad_actual',
    isRequired: true,
    order: 3
  },
  {
    id: 'antecedentes_patologicos',
    title: 'Antecedentes Patológicos',
    description: 'Historia médica previa del paciente',
    category: 'antecedentes',
    isRequired: true,
    order: 4
  },
  {
    id: 'revision_sistemas',
    title: 'Revisión por Sistemas',
    description: 'Exploración sistemática de todos los sistemas corporales',
    category: 'revision_sistemas',
    isRequired: true,
    order: 5
  },
  {
    id: 'habitos',
    title: 'Hábitos y Estilo de Vida',
    description: 'Hábitos tóxicos, ejercicio, alimentación y sueño',
    category: 'habitos',
    isRequired: true,
    order: 6
  },
  {
    id: 'antecedentes_familiares',
    title: 'Antecedentes Familiares',
    description: 'Historia médica familiar relevante',
    category: 'familiares',
    isRequired: true,
    order: 7
  },
  {
    id: 'antecedentes_sociales',
    title: 'Antecedentes Sociales',
    description: 'Contexto social, laboral y ambiental',
    category: 'sociales',
    isRequired: true,
    order: 8
  },
  {
    id: 'examen_fisico',
    title: 'Examen Físico',
    description: 'Exploración física completa',
    category: 'examen_fisico',
    isRequired: true,
    order: 9
  },
  {
    id: 'conclusiones',
    title: 'Conclusiones e Impresión Diagnóstica',
    description: 'Síntesis y plan terapéutico',
    category: 'conclusiones',
    isRequired: true,
    order: 10
  }
]

// Datos iniciales de anamnesis
const INITIAL_ANAMNESIS_DATA: Partial<AnamnesisData> = {
  identificacion: {
    nombre: '',
    apellidos: '',
    edad: 0,
    sexo: 'masculino',
    fechaNacimiento: '',
    documentoIdentidad: '',
    telefono: '',
    email: '',
    direccion: '',
    ocupacion: '',
    estadoCivil: '',
    nacionalidad: '',
    religion: ''
  },
  motivoConsulta: {
    motivoPrincipal: '',
    tiempoEvolucion: '',
    caracteristicas: {
      inicio: 'gradual',
      curso: 'continuo',
      intensidad: 5,
      localizacion: []
    },
    sintomasAsociados: [],
    factoresAgravantes: [],
    factoresMejorantes: []
  },
  enfermedadActual: {
    cronologia: '',
    sintomasPrincipales: [],
    tratamientosPrevios: [],
    estudiosRealizados: [],
    evolucion: ''
  },
  antecedentesPatologicos: {
    enfermedadesPrevias: [],
    cirugias: [],
    traumatismos: [],
    alergias: [],
    transfusiones: [],
    hospitalizaciones: []
  },
  revisionSistemas: {
    sistemaNervioso: { sintomasPositivos: [], sintomasNegativos: [], alteraciones: [], observaciones: '' },
    sistemaCardiovascular: { sintomasPositivos: [], sintomasNegativos: [], alteraciones: [], observaciones: '' },
    sistemaRespiratorio: { sintomasPositivos: [], sintomasNegativos: [], alteraciones: [], observaciones: '' },
    sistemaDigestivo: { sintomasPositivos: [], sintomasNegativos: [], alteraciones: [], observaciones: '' },
    sistemaGenitourinario: { sintomasPositivos: [], sintomasNegativos: [], alteraciones: [], observaciones: '' },
    sistemaEndocrino: { sintomasPositivos: [], sintomasNegativos: [], alteraciones: [], observaciones: '' },
    sistemaHematologico: { sintomasPositivos: [], sintomasNegativos: [], alteraciones: [], observaciones: '' },
    sistemaMusculoesqueletico: { sintomasPositivos: [], sintomasNegativos: [], alteraciones: [], observaciones: '' },
    sistemaInmunologico: { sintomasPositivos: [], sintomasNegativos: [], alteraciones: [], observaciones: '' },
    piel: { sintomasPositivos: [], sintomasNegativos: [], alteraciones: [], observaciones: '' }
  },
  habitos: {
    tabaco: { consume: false, cantidad: '', tiempo: '', intentosAbandono: 0 },
    alcohol: { consume: false, tipo: '', cantidad: '', frecuencia: '' },
    drogas: { consume: false, tipo: '', frecuencia: '', tiempo: '' },
    ejercicio: { realiza: false, tipo: '', frecuencia: '', duracion: '' },
    alimentacion: { tipo: '', restricciones: [], suplementos: [] },
    sueno: { horas: 8, calidad: 'buena', alteraciones: [] }
  },
  antecedentesFamiliares: {
    padre: { relacion: 'padre', edad: 0, estadoSalud: '', enfermedades: [] },
    madre: { relacion: 'madre', edad: 0, estadoSalud: '', enfermedades: [] },
    hermanos: [],
    hijos: [],
    otros: []
  },
  antecedentesSociales: {
    nivelEducativo: '',
    ocupacion: '',
    ingresos: '',
    vivienda: '',
    apoyoSocial: '',
    exposicionLaboral: [],
    exposicionAmbiental: [],
    viajes: [],
    estresores: []
  },
  examenFisico: {
    signosVitales: {
      temperatura: 37,
      presionArterial: '',
      frecuenciaCardiaca: 80,
      frecuenciaRespiratoria: 16,
      peso: 70,
      talla: 170,
      imc: 24.2,
      saturacionOxigeno: 98
    },
    aspectoGeneral: '',
    cabeza: { inspeccion: '', palpacion: '', ojos: '', oidos: '', nariz: '', boca: '', faringe: '' },
    cuello: { inspeccion: '', palpacion: '', movilidad: '', ganglios: '', tiroides: '', venas: '' },
    torax: { inspeccion: '', palpacion: '', percusion: '', auscultacion: '', corazon: '', pulmones: '' },
    abdomen: { inspeccion: '', palpacion: '', percusion: '', auscultacion: '', organomegalias: '', masas: '', dolor: '' },
    extremidades: { inspeccion: '', palpacion: '', movilidad: '', fuerza: '', reflejos: '', circulacion: '' },
    sistemaNervioso: { estadoMental: '', paresCraneales: '', motilidad: '', sensibilidad: '', reflejos: '', coordinacion: '', marcha: '' },
    piel: { color: '', textura: '', lesiones: [], edemas: [], cicatrices: [] }
  },
  conclusiones: '',
  impresionDiagnostica: [],
  planTerapeutico: []
}

export const usePatient3DStore = create<AnamnesisStore>()(
  devtools(
    (set, get) => ({
      // Estado inicial
      currentStep: 0,
      totalSteps: ALVAREZ_ANAMNESIS_STEPS.length,
      steps: ALVAREZ_ANAMNESIS_STEPS,
      anamnesisData: INITIAL_ANAMNESIS_DATA,
      
      // Estado 3D del paciente
      patientAvatarState: {
        currentAnimation: 'idle',
        highlightedBodyParts: [],
        isHighlighting: false,
        selectedRegion: null
      },
      
      // Estado de la interfaz
      uiState: {
        isSidebarOpen: true,
        currentTool: null,
        zoomLevel: 1,
        cameraPosition: [0, 1.6, 3]
      },
      
      // Acciones
      actions: {
        nextStep: () => {
          const { currentStep, totalSteps } = get()
          if (currentStep < totalSteps - 1) {
            set({ currentStep: currentStep + 1 })
          }
        },
        
        previousStep: () => {
          const { currentStep } = get()
          if (currentStep > 0) {
            set({ currentStep: currentStep - 1 })
          }
        },
        
        goToStep: (step: number) => {
          const { totalSteps } = get()
          if (step >= 0 && step < totalSteps) {
            set({ currentStep: step })
          }
        },
        
        updateAnamnesisData: (data: Partial<AnamnesisData>) => {
          set((state) => ({
            anamnesisData: { ...state.anamnesisData, ...data }
          }))
        },
        
        updatePatientAvatar: (state: Partial<AnamnesisStore['patientAvatarState']>) => {
          set((currentState) => ({
            patientAvatarState: { ...currentState.patientAvatarState, ...state }
          }))
        },
        
        updateUIState: (state: Partial<AnamnesisStore['uiState']>) => {
          set((currentState) => ({
            uiState: { ...currentState.uiState, ...state }
          }))
        },
        
        initializeAnamnesis: () => {
          set({
            currentStep: 0,
            anamnesisData: INITIAL_ANAMNESIS_DATA,
            patientAvatarState: {
              currentAnimation: 'idle',
              highlightedBodyParts: [],
              isHighlighting: false,
              selectedRegion: null
            },
            uiState: {
              isSidebarOpen: true,
              currentTool: null,
              zoomLevel: 1,
              cameraPosition: [0, 1.6, 3]
            }
          })
        },
        
        saveAnamnesis: async () => {
          const { anamnesisData } = get()
          try {
            // Aquí se implementaría la lógica para guardar en la base de datos
            console.log('Guardando anamnesis:', anamnesisData)
            
            // Simulación de guardado
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            return Promise.resolve()
          } catch (error) {
            console.error('Error al guardar anamnesis:', error)
            return Promise.reject(error)
          }
        },
        
        loadAnamnesis: async (patientId: string) => {
          try {
            // Aquí se implementaría la lógica para cargar desde la base de datos
            console.log('Cargando anamnesis para paciente:', patientId)
            
            // Simulación de carga
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            // Por ahora, solo reinicializamos
            get().actions.initializeAnamnesis()
            
            return Promise.resolve()
          } catch (error) {
            console.error('Error al cargar anamnesis:', error)
            return Promise.reject(error)
          }
        }
      }
    }),
    {
      name: 'patient3d-anamnesis-store',
      enabled: process.env.NODE_ENV === 'development'
    }
  )
)