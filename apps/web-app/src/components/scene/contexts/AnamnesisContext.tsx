'use client'
import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react'

// Types for anamnesis state
export interface AnamnesisStep {
  id: string
  name: string
  title: string
  description: string
  isCompleted: boolean
  isRequired: boolean
  data?: Record<string, any>
}

export interface PatientVitals {
  heartRate?: number
  bloodPressure?: {
    systolic: number
    diastolic: number
  }
  temperature?: number
  oxygenSaturation?: number
  respiratoryRate?: number
  weight?: number
  height?: number
}

export interface AnamnesisState {
  // Current session info
  sessionId: string
  patientId: string
  doctorId: string
  startedAt: Date
  
  // Progress tracking
  currentStep: number
  totalSteps: number
  steps: AnamnesisStep[]
  progress: number
  
  // Patient data
  patientVitals: PatientVitals
  symptoms: Array<{
    id: string
    name: string
    severity: 1 | 2 | 3 | 4 | 5
    duration: string
    description?: string
  }>
  
  // Medical history
  medicalHistory: Array<{
    id: string
    condition: string
    diagnosedAt: Date
    status: 'active' | 'resolved' | 'chronic'
  }>
  
  // Current examination
  currentExamination: {
    deviceInUse?: string
    findings: Record<string, any>
    notes: string[]
  }
  
  // State flags
  isInProgress: boolean
  isCompleted: boolean
  canProceed: boolean
  hasErrors: boolean
  errors: string[]
}

// Action types
type AnamnesisAction =
  | { type: 'START_ANAMNESIS'; payload: { patientId: string; doctorId: string } }
  | { type: 'SET_CURRENT_STEP'; payload: number }
  | { type: 'COMPLETE_STEP'; payload: { stepId: string; data?: Record<string, any> } }
  | { type: 'UPDATE_VITALS'; payload: Partial<PatientVitals> }
  | { type: 'ADD_SYMPTOM'; payload: AnamnesisState['symptoms'][0] }
  | { type: 'REMOVE_SYMPTOM'; payload: string }
  | { type: 'UPDATE_SYMPTOM'; payload: { id: string; updates: Partial<AnamnesisState['symptoms'][0]> } }
  | { type: 'SET_DEVICE_IN_USE'; payload: string | undefined }
  | { type: 'ADD_FINDING'; payload: { key: string; value: any } }
  | { type: 'ADD_NOTE'; payload: string }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'COMPLETE_ANAMNESIS' }
  | { type: 'RESET_ANAMNESIS' }

// Default steps for a standard anamnesis
const DEFAULT_STEPS: AnamnesisStep[] = [
  {
    id: 'patient-identification',
    name: 'identification',
    title: 'Identificación del Paciente',
    description: 'Verificar datos personales y antecedentes',
    isCompleted: false,
    isRequired: true
  },
  {
    id: 'chief-complaint',
    name: 'chief-complaint',
    title: 'Motivo de Consulta',
    description: 'Síntoma principal y duración',
    isCompleted: false,
    isRequired: true
  },
  {
    id: 'vital-signs',
    name: 'vital-signs',
    title: 'Signos Vitales',
    description: 'Medición de constantes vitales',
    isCompleted: false,
    isRequired: true
  },
  {
    id: 'physical-examination',
    name: 'physical-exam',
    title: 'Exploración Física',
    description: 'Examen físico por sistemas',
    isCompleted: false,
    isRequired: true
  },
  {
    id: 'diagnosis',
    name: 'diagnosis',
    title: 'Diagnóstico',
    description: 'Evaluación y diagnóstico preliminar',
    isCompleted: false,
    isRequired: true
  },
  {
    id: 'treatment-plan',
    name: 'treatment',
    title: 'Plan de Tratamiento',
    description: 'Prescripciones y recomendaciones',
    isCompleted: false,
    isRequired: true
  }
]

// Initial state
const initialState: AnamnesisState = {
  sessionId: '',
  patientId: '',
  doctorId: '',
  startedAt: new Date(),
  currentStep: 0,
  totalSteps: DEFAULT_STEPS.length,
  steps: DEFAULT_STEPS,
  progress: 0,
  patientVitals: {},
  symptoms: [],
  medicalHistory: [],
  currentExamination: {
    findings: {},
    notes: []
  },
  isInProgress: false,
  isCompleted: false,
  canProceed: false,
  hasErrors: false,
  errors: []
}

// Reducer function
function anamnesisReducer(state: AnamnesisState, action: AnamnesisAction): AnamnesisState {
  switch (action.type) {
    case 'START_ANAMNESIS':
      return {
        ...state,
        sessionId: `session_${Date.now()}`,
        patientId: action.payload.patientId,
        doctorId: action.payload.doctorId,
        startedAt: new Date(),
        isInProgress: true,
        currentStep: 0,
        progress: 0
      }

    case 'SET_CURRENT_STEP':
      const newStep = Math.max(0, Math.min(action.payload, state.totalSteps - 1))
      return {
        ...state,
        currentStep: newStep,
        progress: ((newStep + 1) / state.totalSteps) * 100
      }

    case 'COMPLETE_STEP':
      const updatedSteps = state.steps.map(step =>
        step.id === action.payload.stepId
          ? { ...step, isCompleted: true, data: action.payload.data }
          : step
      )
      const completedSteps = updatedSteps.filter(step => step.isCompleted).length
      const canProceed = state.currentStep < state.totalSteps - 1
      
      return {
        ...state,
        steps: updatedSteps,
        progress: (completedSteps / state.totalSteps) * 100,
        canProceed
      }

    case 'UPDATE_VITALS':
      return {
        ...state,
        patientVitals: { ...state.patientVitals, ...action.payload }
      }

    case 'ADD_SYMPTOM':
      return {
        ...state,
        symptoms: [...state.symptoms, action.payload]
      }

    case 'REMOVE_SYMPTOM':
      return {
        ...state,
        symptoms: state.symptoms.filter(symptom => symptom.id !== action.payload)
      }

    case 'UPDATE_SYMPTOM':
      return {
        ...state,
        symptoms: state.symptoms.map(symptom =>
          symptom.id === action.payload.id
            ? { ...symptom, ...action.payload.updates }
            : symptom
        )
      }

    case 'SET_DEVICE_IN_USE':
      return {
        ...state,
        currentExamination: {
          ...state.currentExamination,
          deviceInUse: action.payload
        }
      }

    case 'ADD_FINDING':
      return {
        ...state,
        currentExamination: {
          ...state.currentExamination,
          findings: {
            ...state.currentExamination.findings,
            [action.payload.key]: action.payload.value
          }
        }
      }

    case 'ADD_NOTE':
      return {
        ...state,
        currentExamination: {
          ...state.currentExamination,
          notes: [...state.currentExamination.notes, action.payload]
        }
      }

    case 'SET_ERROR':
      return {
        ...state,
        hasErrors: true,
        errors: [...state.errors, action.payload]
      }

    case 'CLEAR_ERRORS':
      return {
        ...state,
        hasErrors: false,
        errors: []
      }

    case 'COMPLETE_ANAMNESIS':
      return {
        ...state,
        isInProgress: false,
        isCompleted: true,
        progress: 100
      }

    case 'RESET_ANAMNESIS':
      return initialState

    default:
      return state
  }
}

// Context
interface AnamnesisContextType {
  state: AnamnesisState
  actions: {
    startAnamnesis: (patientId: string, doctorId: string) => void
    setCurrentStep: (step: number) => void
    completeStep: (stepId: string, data?: Record<string, any>) => void
    nextStep: () => void
    previousStep: () => void
    updateVitals: (vitals: Partial<PatientVitals>) => void
    addSymptom: (symptom: AnamnesisState['symptoms'][0]) => void
    removeSymptom: (symptomId: string) => void
    updateSymptom: (id: string, updates: Partial<AnamnesisState['symptoms'][0]>) => void
    setDeviceInUse: (device?: string) => void
    addFinding: (key: string, value: any) => void
    addNote: (note: string) => void
    setError: (error: string) => void
    clearErrors: () => void
    completeAnamnesis: () => void
    resetAnamnesis: () => void
  }
}

const AnamnesisContext = createContext<AnamnesisContextType | undefined>(undefined)

// Provider component
interface AnamnesisProviderProps {
  children: ReactNode
}

export function AnamnesisProvider({ children }: AnamnesisProviderProps) {
  const [state, dispatch] = useReducer(anamnesisReducer, initialState)

  const actions = {
    startAnamnesis: useCallback((patientId: string, doctorId: string) => {
      dispatch({ type: 'START_ANAMNESIS', payload: { patientId, doctorId } })
    }, []),

    setCurrentStep: useCallback((step: number) => {
      dispatch({ type: 'SET_CURRENT_STEP', payload: step })
    }, []),

    completeStep: useCallback((stepId: string, data?: Record<string, any>) => {
      dispatch({ type: 'COMPLETE_STEP', payload: { stepId, data } })
    }, []),

    nextStep: useCallback(() => {
      if (state.currentStep < state.totalSteps - 1) {
        dispatch({ type: 'SET_CURRENT_STEP', payload: state.currentStep + 1 })
      }
    }, [state.currentStep, state.totalSteps]),

    previousStep: useCallback(() => {
      if (state.currentStep > 0) {
        dispatch({ type: 'SET_CURRENT_STEP', payload: state.currentStep - 1 })
      }
    }, [state.currentStep]),

    updateVitals: useCallback((vitals: Partial<PatientVitals>) => {
      dispatch({ type: 'UPDATE_VITALS', payload: vitals })
    }, []),

    addSymptom: useCallback((symptom: AnamnesisState['symptoms'][0]) => {
      dispatch({ type: 'ADD_SYMPTOM', payload: symptom })
    }, []),

    removeSymptom: useCallback((symptomId: string) => {
      dispatch({ type: 'REMOVE_SYMPTOM', payload: symptomId })
    }, []),

    updateSymptom: useCallback((id: string, updates: Partial<AnamnesisState['symptoms'][0]>) => {
      dispatch({ type: 'UPDATE_SYMPTOM', payload: { id, updates } })
    }, []),

    setDeviceInUse: useCallback((device?: string) => {
      dispatch({ type: 'SET_DEVICE_IN_USE', payload: device })
    }, []),

    addFinding: useCallback((key: string, value: any) => {
      dispatch({ type: 'ADD_FINDING', payload: { key, value } })
    }, []),

    addNote: useCallback((note: string) => {
      dispatch({ type: 'ADD_NOTE', payload: note })
    }, []),

    setError: useCallback((error: string) => {
      dispatch({ type: 'SET_ERROR', payload: error })
    }, []),

    clearErrors: useCallback(() => {
      dispatch({ type: 'CLEAR_ERRORS' })
    }, []),

    completeAnamnesis: useCallback(() => {
      dispatch({ type: 'COMPLETE_ANAMNESIS' })
    }, []),

    resetAnamnesis: useCallback(() => {
      dispatch({ type: 'RESET_ANAMNESIS' })
    }, [])
  }

  return (
    <AnamnesisContext.Provider value={{ state, actions }}>
      {children}
    </AnamnesisContext.Provider>
  )
}

// Hook to use the context
export function useAnamnesis() {
  const context = useContext(AnamnesisContext)
  if (context === undefined) {
    throw new Error('useAnamnesis must be used within an AnamnesisProvider')
  }
  return context
}
