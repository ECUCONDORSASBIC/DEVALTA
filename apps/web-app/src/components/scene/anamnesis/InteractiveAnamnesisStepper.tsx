'use client'
import { useEffect, useRef } from 'react'
import { Html } from '@react-three/drei'
import { useAnamnesisStore } from '@/stores/anamnesisStore'
import { ConsentStep } from './steps/ConsentStep'
import { PersonalDataStep } from './steps/PersonalDataStep'
import { SymptomLocationStep } from './steps/SymptomLocationStep'
import { SymptomDetailsStep } from './steps/SymptomDetailsStep'
import { ReviewStep } from './steps/ReviewStep'
import { Object3D } from 'three'
import { FadeInAnimation } from '../animations/SpringAnimationSystem'
import { useOptimizedSettings } from '@/utils/device-detection'

interface InteractiveAnamnesisStepperProps {
  patientAvatarRef?: React.RefObject<Object3D>
}

export function InteractiveAnamnesisStepper({ 
  patientAvatarRef 
}: InteractiveAnamnesisStepperProps) {
  const { 
    currentStep, 
    totalSteps, 
    steps, 
    uiState,
    errors,
    actions 
  } = useAnamnesisStore()
  
  const optimizedSettings = useOptimizedSettings()
  const currentStepData = steps[currentStep]

  // Handle errors
  useEffect(() => {
    if (errors.length > 0) {
      // Show errors for 5 seconds then clear
      const timer = setTimeout(() => {
        actions.clearErrors()
      }, 5000)
      
      return () => clearTimeout(timer)
    }
  }, [errors, actions])

  // Render current step with fade animations
  const renderCurrentStep = () => {
    const stepComponent = (() => {
      switch (currentStepData?.id) {
        case 'consent':
          return <ConsentStep position={[0, 3, 0]} />
        
        case 'personal-data':
          return <PersonalDataStep position={[0, 3, 0]} />
        
        case 'symptom-location':
          return (
            <SymptomLocationStep 
              position={[0, 3, 0]} 
              patientAvatarRef={patientAvatarRef}
            />
          )
        
        case 'symptom-details':
          return <SymptomDetailsStep position={[0, 3, 0]} />
        
        case 'review':
          return <ReviewStep position={[0, 3, 0]} />
        
        default:
          return null
      }
    })()

    if (!stepComponent) return null

    return (
      <FadeInAnimation 
        trigger={true} 
        duration={optimizedSettings.enableAnimations ? 600 : 100}
        delay={currentStep * 100} // Staggered animation
        from={{ opacity: 0, scale: 0.95 }}
        to={{ opacity: 1, scale: 1 }}
      >
        {stepComponent}
      </FadeInAnimation>
    )
  }

  return (
    <>
      {/* Progress indicator */}
      <Html
        position={[0, 4.5, 0]}
        distanceFactor={10}
        occlude={false}
        transform={false}
        sprite
        center
        className="anamnesis-progress"
      >
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 p-4 min-w-96">
          {/* Step indicator */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Anamnesis Digital
            </h3>
            <span className="text-sm text-gray-500">
              Paso {currentStep + 1} de {totalSteps}
            </span>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            />
          </div>
          
          {/* Steps list */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center ${
                  index < steps.length - 1 ? 'flex-1' : ''
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                    index < currentStep
                      ? 'bg-green-500 text-white'
                      : index === currentStep
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {index < currentStep ? '✓' : index + 1}
                </div>
                
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 transition-all ${
                      index < currentStep ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          
          {/* Current step info */}
          <div className="mt-4 text-center">
            <h4 className="text-sm font-medium text-gray-800">
              {currentStepData?.title}
            </h4>
            <p className="text-xs text-gray-600 mt-1">
              {currentStepData?.description}
            </p>
          </div>
        </div>
      </Html>

      {/* Error notifications */}
      {errors.length > 0 && (
        <Html
          position={[0, 5.5, 0]}
          distanceFactor={10}
          occlude={false}
          transform={false}
          sprite
          center
          className="error-notifications"
        >
          <div className="space-y-2">
            {errors.map((error, index) => (
              <div
                key={index}
                className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg animate-pulse"
              >
                <div className="flex items-center space-x-2">
                  <span>⚠️</span>
                  <span className="text-sm">{error}</span>
                </div>
              </div>
            ))}
          </div>
        </Html>
      )}

      {/* Current step component */}
      {renderCurrentStep()}

      {/* Inline labels toggle */}
      {uiState.showInlineLabels && (
        <Html
          position={[-3, 2, 0]}
          distanceFactor={10}
          occlude={false}
          transform={false}
          sprite
          center
        >
          <button
            onClick={() => actions.toggleInlineLabels()}
            className="bg-white/80 backdrop-blur-sm rounded-lg p-2 shadow-lg border border-gray-200 text-xs text-gray-600 hover:text-gray-800 transition-colors"
          >
            {uiState.showInlineLabels ? '🏷️ Ocultar etiquetas' : '🏷️ Mostrar etiquetas'}
          </button>
        </Html>
      )}

      {/* Reset button (for development/testing) */}
      <Html
        position={[3, 2, 0]}
        distanceFactor={10}
        occlude={false}
        transform={false}
        sprite
        center
      >
        <button
          onClick={() => actions.reset()}
          className="bg-red-500/80 backdrop-blur-sm rounded-lg p-2 shadow-lg border border-red-300 text-xs text-white hover:bg-red-600/80 transition-colors"
        >
          🔄 Reiniciar
        </button>
      </Html>
    </>
  )
}

// Zustand store provider wrapper
export function AnamnesisStepperProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
    </>
  )
}
