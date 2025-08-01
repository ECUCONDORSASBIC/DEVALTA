'use client'
import { create } from 'zustand'
import { devtools, subscribeWithSelector } from 'zustand/middleware'
import { Vector3 } from 'three';
import {
  ClinicalContext,
  Question,
  DiagnosisSuggestion,
  getAgeRange
} from '../../lib/clinical-decision/types';
import { ClinicalDecisionEngine } from '../../lib/clinical-decision/clinical-decision-engine';

// Anamnesis step types
export interface AnamnesisStep {
  id: string
  name: string
  title: string
  description: string
  isCompleted: boolean
  isRequired: boolean
  data?: Record<string, any>
}

// Patient data interfaces
export interface PatientPersonalData {
  firstName: string
  lastName: string
  age: number
  gender: 'male' | 'female' | 'other'
  email: string
  phone: string
  emergencyContact: {
    name: string
    phone: string
    relationship: string
  }
  medicalHistory: string[]
  allergies: string[]
  currentMedications: string[]
}

export interface SymptomLocation {
  id: string
  bodyPart: string
  position: Vector3
  description: string
  selectedAt: Date
  severity: 1 | 2 | 3 | 4 | 5
}

export interface SymptomDetails {
  id: string
  locationId: string
  painLevel: number // 0-10
  painType: 'sharp' | 'dull' | 'throbbing' | 'burning' | 'tingling' | 'other'
  duration: string
  triggers: string[]
  reliefFactors: string[]
  associatedSymptoms: string[]
  heatmapData: Array<{
    position: Vector3
    intensity: number
    color: string
  }>
}

export interface ConsentData {
  hasConsented: boolean
  consentDate: Date
  consentType: 'full' | 'partial' | 'emergency'
  dataProcessingAgreement: boolean
  telemedicineAgreement: boolean
}

// Store state interface
interface AnamnesisStore {
  // Current state
  currentStep: number
  totalSteps: number
  isCompleted: boolean
  isLoading: boolean
  errors: string[]
  
  // Steps configuration
  steps: AnamnesisStep[]

  // Clinical Decision Support
  clinicalContext: ClinicalContext | null
  adaptiveQuestions: Question[]
  suggestedDx: DiagnosisSuggestion[]
  
  // Step 1: Intro & Consent
  consent: ConsentData | null
  
  // Step 2: Personal Data
  personalData: PatientPersonalData | null
  isLoadingPersonalData: boolean
  
  // Step 3: Symptom Location (raycaster interaction)
  symptomLocations: SymptomLocation[]
  selectedBodyParts: string[]
  highlightedBodyParts: string[]
  
  // Step 4: Symptom Details
  symptomDetails: SymptomDetails[]
  currentSymptomId: string | null
  
  // Step 5: Review & Confirmation
  reviewData: {
    patientSummary: PatientPersonalData | null
    symptomsSummary: Array<{
      location: SymptomLocation
      details: SymptomDetails
    }>
    isConfirmed: boolean
    doctorNotes: string
  }
  
  // 3D Scene synchronization
  patientAvatarAnimations: {
    currentAnimation: string
    highlightedBodyParts: string[]
    isHighlighting: boolean
  }
  
  // UI State
  uiState: {
    showInlineLabels: boolean
    activeOverlay: string | null
    modalOpen: string | null
  }
  
  // Actions
  actions: {
    // Navigation
    nextStep: () => void
    previousStep: () => void
    goToStep: (step: number) => void
    
    // Step 1: Consent
    setConsent: (consent: ConsentData) => void
    
    // Step 2: Personal Data
    loadPersonalDataFromAPI: (patientId: string) => Promise<void>
    updatePersonalData: (data: Partial<PatientPersonalData>) => void
    
    // Step 3: Symptom Location
    addSymptomLocation: (location: SymptomLocation) => void
    removeSymptomLocation: (locationId: string) => void
    highlightBodyPart: (bodyPart: string) => void
    clearHighlights: () => void
    
    // Step 4: Symptom Details
    setCurrentSymptom: (symptomId: string) => void
    updateSymptomDetails: (details: Partial<SymptomDetails>) => void
    addHeatmapPoint: (position: Vector3, intensity: number) => void
    
    // Step 5: Review
    confirmReview: () => void
    updateDoctorNotes: (notes: string) => void
    
    // 3D Avatar synchronization
    updateAvatarAnimation: (animation: string) => void
    highlightAvatarBodyPart: (bodyPart: string) => void
    
    // UI
    setActiveOverlay: (overlay: string | null) => void
    setModalOpen: (modal: string | null) => void
    toggleInlineLabels: () => void
    
    // Error handling
    addError: (error: string) => void
    clearErrors: () => void
    
    // Reset
    reset: () => void

    // Clinical Decision Support
    setClinicalContext: (context: Partial<ClinicalContext>) => void
    runDecisionEngine: () => void
    updateAdaptiveAnswer: (questionId: string, answer: any) => void
  }
}

// Default steps
const DEFAULT_STEPS: AnamnesisStep[] = [
  {
    id: 'consent',
    name: 'Consentimiento',
    title: 'Introducción y Consentimiento',
    description: 'Bienvenida al proceso de anamnesis y obtención de consentimientos',
    isCompleted: false,
    isRequired: true
  },
  {
    id: 'personal-data',
    name: 'Datos Personales',
    title: 'Información Personal',
    description: 'Verificación y completado de datos personales del paciente',
    isCompleted: false,
    isRequired: true
  },
  {
    id: 'symptom-location',
    name: 'Localización de Síntomas',
    title: 'Ubicación de Síntomas',
    description: 'Selecciona las áreas del cuerpo donde sientes molestias',
    isCompleted: false,
    isRequired: true
  },
  {
    id: 'symptom-details',
    name: 'Detalles de Síntomas',
    title: 'Descripción Detallada',
    description: 'Proporciona detalles específicos sobre tus síntomas',
    isCompleted: false,
    isRequired: true
  },
  {
    id: 'review',
    name: 'Revisión',
    title: 'Revisión y Confirmación',
    description: 'Revisa toda la información antes de finalizar',
    isCompleted: false,
    isRequired: true
  }
]

// Mock API function for personal data
const mockLoadPersonalData = async (patientId: string): Promise<PatientPersonalData> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  return {
    firstName: 'Juan',
    lastName: 'Pérez García',
    age: 35,
    gender: 'male',
    email: 'juan.perez@email.com',
    phone: '+34 666 123 456',
    emergencyContact: {
      name: 'María Pérez',
      phone: '+34 666 654 321',
      relationship: 'Esposa'
    },
    medicalHistory: [
      'Hipertensión arterial (2019)',
      'Diabetes tipo 2 (2021)'
    ],
    allergies: [
      'Penicilina',
      'Frutos secos'
    ],
    currentMedications: [
      'Metformina 850mg (2x día)',
      'Enalapril 10mg (1x día)'
    ]
  }
}

const decisionEngine = new ClinicalDecisionEngine();

// Create the store
export const useAnamnesisStore = create<AnamnesisStore>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // Initial state
      currentStep: 0,
      totalSteps: DEFAULT_STEPS.length,
      isCompleted: false,
      isLoading: false,
      errors: [],
      
      steps: DEFAULT_STEPS,
      
      consent: null,
      personalData: null,
      isLoadingPersonalData: false,
      symptomLocations: [],
      selectedBodyParts: [],
      highlightedBodyParts: [],
      symptomDetails: [],
      currentSymptomId: null,

      clinicalContext: null,
      adaptiveQuestions: [],
      suggestedDx: [],
      
      reviewData: {
        patientSummary: null,
        symptomsSummary: [],
        isConfirmed: false,
        doctorNotes: ''
      },
      
      patientAvatarAnimations: {
        currentAnimation: 'idle',
        highlightedBodyParts: [],
        isHighlighting: false
      },
      
      uiState: {
        showInlineLabels: true,
        activeOverlay: null,
        modalOpen: null
      },
      
      // Actions
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
        
        setConsent: (consent: ConsentData) => {
          set((state) => ({
            consent,
            steps: state.steps.map(step =>
              step.id === 'consent' ? { ...step, isCompleted: true } : step
            )
          }))
        },
        
        loadPersonalDataFromAPI: async (patientId: string) => {
          set({ isLoadingPersonalData: true })
          try {
            const data = await mockLoadPersonalData(patientId)
            set((state) => ({
              personalData: data,
              isLoadingPersonalData: false,
              steps: state.steps.map(step =>
                step.id === 'personal-data' ? { ...step, isCompleted: true } : step
              )
            }))
          } catch (error) {
            set({
              isLoadingPersonalData: false,
              errors: [...get().errors, 'Error loading personal data']
            })
          }
        },
        
        updatePersonalData: (data: Partial<PatientPersonalData>) => {
          set((state) => ({
            personalData: state.personalData ? { ...state.personalData, ...data } : null
          }))
        },
        
        addSymptomLocation: (location: SymptomLocation) => {
          set((state) => ({
            symptomLocations: [...state.symptomLocations, location],
            selectedBodyParts: [...state.selectedBodyParts, location.bodyPart],
            steps: state.steps.map(step =>
              step.id === 'symptom-location' ? { ...step, isCompleted: true } : step
            )
          }))
          // Trigger avatar animation
          get().actions.highlightAvatarBodyPart(location.bodyPart)
        },
        
        removeSymptomLocation: (locationId: string) => {
          set((state) => {
            const location = state.symptomLocations.find(loc => loc.id === locationId)
            return {
              symptomLocations: state.symptomLocations.filter(loc => loc.id !== locationId),
              selectedBodyParts: state.selectedBodyParts.filter(part => 
                location ? part !== location.bodyPart : true
              ),
              symptomDetails: state.symptomDetails.filter(detail => detail.locationId !== locationId)
            }
          })
        },
        
        highlightBodyPart: (bodyPart: string) => {
          set((state) => ({
            highlightedBodyParts: [...state.highlightedBodyParts, bodyPart]
          }))
        },
        
        clearHighlights: () => {
          set({ highlightedBodyParts: [] })
        },
        
        setCurrentSymptom: (symptomId: string) => {
          set({ currentSymptomId: symptomId })
        },
        
        updateSymptomDetails: (details: Partial<SymptomDetails>) => {
          const { currentSymptomId } = get()
          if (!currentSymptomId) return
          
          set((state) => ({
            symptomDetails: state.symptomDetails.some(detail => detail.id === currentSymptomId)
              ? state.symptomDetails.map(detail =>
                  detail.id === currentSymptomId ? { ...detail, ...details } : detail
                )
              : [...state.symptomDetails, { id: currentSymptomId, ...details } as SymptomDetails],
            steps: state.steps.map(step =>
              step.id === 'symptom-details' ? { ...step, isCompleted: true } : step
            )
          }))
        },
        
        addHeatmapPoint: (position: Vector3, intensity: number) => {
          const { currentSymptomId } = get()
          if (!currentSymptomId) return
          
          const color = intensity > 0.7 ? '#ff0000' : intensity > 0.4 ? '#ff8800' : '#ffff00'
          
          set((state) => {
            const existingDetail = state.symptomDetails.find(detail => detail.id === currentSymptomId)
            if (existingDetail) {
              return {
                symptomDetails: state.symptomDetails.map(detail =>
                  detail.id === currentSymptomId
                    ? {
                        ...detail,
                        heatmapData: [...(detail.heatmapData || []), { position, intensity, color }]
                      }
                    : detail
                )
              }
            }
            return state
          })
        },
        
        confirmReview: () => {
          const { personalData, symptomLocations, symptomDetails } = get()
          set((state) => ({
            reviewData: {
              ...state.reviewData,
              patientSummary: personalData,
              symptomsSummary: symptomLocations.map(location => ({
                location,
                details: symptomDetails.find(detail => detail.locationId === location.id) || {} as SymptomDetails
              })),
              isConfirmed: true
            },
            isCompleted: true,
            steps: state.steps.map(step =>
              step.id === 'review' ? { ...step, isCompleted: true } : step
            )
          }))
        },
        
        updateDoctorNotes: (notes: string) => {
          set((state) => ({
            reviewData: { ...state.reviewData, doctorNotes: notes }
          }))
        },
        
        updateAvatarAnimation: (animation: string) => {
          set((state) => ({
            patientAvatarAnimations: { ...state.patientAvatarAnimations, currentAnimation: animation }
          }))
        },
        
        highlightAvatarBodyPart: (bodyPart: string) => {
          set((state) => ({
            patientAvatarAnimations: {
              ...state.patientAvatarAnimations,
              highlightedBodyParts: [...state.patientAvatarAnimations.highlightedBodyParts, bodyPart],
              isHighlighting: true,
              currentAnimation: 'highlight_' + bodyPart
            }
          }))
          
          // Clear highlight after 2 seconds
          setTimeout(() => {
            set((state) => ({
              patientAvatarAnimations: {
                ...state.patientAvatarAnimations,
                isHighlighting: false,
                currentAnimation: 'idle'
              }
            }))
          }, 2000)
        },
        
        setActiveOverlay: (overlay: string | null) => {
          set((state) => ({
            uiState: { ...state.uiState, activeOverlay: overlay }
          }))
        },
        
        setModalOpen: (modal: string | null) => {
          set((state) => ({
            uiState: { ...state.uiState, modalOpen: modal }
          }))
        },
        
        toggleInlineLabels: () => {
          set((state) => ({
            uiState: { ...state.uiState, showInlineLabels: !state.uiState.showInlineLabels }
          }))
        },
        
        addError: (error: string) => {
          set((state) => ({
            errors: [...state.errors, error]
          }))
        },
        
        clearErrors: () => {
          set({ errors: [] })
        },
        
        reset: () => {
          set({
            currentStep: 0,
            isCompleted: false,
            isLoading: false,
            errors: [],
            consent: null,
            personalData: null,
            isLoadingPersonalData: false,
            symptomLocations: [],
            selectedBodyParts: [],
            highlightedBodyParts: [],
            symptomDetails: [],
            currentSymptomId: null,
            clinicalContext: null,
            adaptiveQuestions: [],
            suggestedDx: [],
            reviewData: {
              patientSummary: null,
              symptomsSummary: [],
              isConfirmed: false,
              doctorNotes: ''
            },
            patientAvatarAnimations: {
              currentAnimation: 'idle',
              highlightedBodyParts: [],
              isHighlighting: false
            },
            uiState: {
              showInlineLabels: true,
              activeOverlay: null,
              modalOpen: null
            },
            steps: DEFAULT_STEPS
          })
        },

        setClinicalContext: (context: Partial<ClinicalContext>) => {
            const currentState = get();
            const currentContext = currentState.clinicalContext || {
                age: currentState.personalData?.age || 0,
                gender: currentState.personalData?.gender || 'other',
                riskFactors: [],
                medicalHistory: currentState.personalData?.medicalHistory || [],
                ageRange: getAgeRange(currentState.personalData?.age || 0)
            };

            set({
                clinicalContext: {
                    ...currentContext,
                    ...context,
                }
            });
        },

        runDecisionEngine: () => {
            const { clinicalContext } = get();
            if (!clinicalContext) return;

            const questions = decisionEngine.getAdaptiveQuestions(clinicalContext);
            const diagnoses = decisionEngine.getSuggestedDx(clinicalContext);

            set({
                adaptiveQuestions: questions,
                suggestedDx: diagnoses
            });
        },

        updateAdaptiveAnswer: (questionId: string, answer: any) => {
            // This is a placeholder for more complex logic
            // For now, we can just log it or update a simple map of answers
            console.log(`Answer for ${questionId}:`, answer);
        }
      }
    })),
    {
      name: 'anamnesis-store'
    }
  )
)
