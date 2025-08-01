'use client'
import { AnamnesisStep } from '../types/anamnesisTypes'

interface AnamnesisSidebarProps {
  isOpen: boolean
  currentStep: number
  steps: AnamnesisStep[]
  onStepClick: (stepIndex: number) => void
  onToggle: () => void
  isMobile?: boolean
  isTablet?: boolean
}

export default function AnamnesisSidebar({
  isOpen,
  currentStep,
  steps,
  onStepClick,
  onToggle,
  isMobile = false,
  isTablet = false
}: AnamnesisSidebarProps) {
  
  return (
    <div className={`absolute left-0 top-0 h-full transition-all duration-300 ${
      isMobile 
        ? (isOpen ? 'w-full' : 'w-0') 
        : isTablet 
          ? (isOpen ? 'w-64' : 'w-16') 
          : (isOpen ? 'w-80' : 'w-20')
    } bg-gradient-to-b from-sky-600 to-cyan-700 shadow-xl pointer-events-auto`}>
      
      {/* Header del sidebar */}
      <div className={`p-4 border-b border-white/20 ${
        isMobile ? 'text-center' : ''
      }`}>
        {isOpen ? (
          <div className={`${isMobile ? 'flex flex-col items-center' : 'flex items-center justify-between'}`}>
            <div className={`${isMobile ? 'mb-4' : ''}`}>
              <h2 className={`font-bold text-white ${
                isMobile ? 'text-2xl' : isTablet ? 'text-xl' : 'text-2xl'
              }`}>
                🏥 Anamnesis
              </h2>
              <p className={`text-sky-100 ${
                isMobile ? 'text-base' : 'text-sm'
              }`}>
                Protocolo Álvarez
              </p>
            </div>
            
            {/* Botón de cerrar en móvil */}
            {isMobile && (
              <button
                onClick={onToggle}
                className="absolute top-4 right-4 text-white hover:text-sky-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            
            {/* Botón de toggle en desktop/tablet */}
            {!isMobile && (
              <button
                onClick={onToggle}
                className="text-white hover:text-sky-200 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={onToggle}
            className="w-full text-white hover:text-sky-200 transition-colors"
          >
            <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      {/* Lista de pasos */}
      {isOpen && (
        <div className={`flex-1 overflow-y-auto ${
          isMobile ? 'p-4' : isTablet ? 'p-3' : 'p-4'
        }`}>
          <div className={`space-y-2 ${
            isMobile ? 'space-y-3' : 'space-y-2'
          }`}>
            {steps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => onStepClick(index)}
                className={`w-full text-left transition-all duration-200 rounded-lg p-3 ${
                  index === currentStep
                    ? 'bg-white text-sky-700 shadow-lg'
                    : 'text-white hover:bg-white/10'
                } ${isMobile ? 'p-4' : isTablet ? 'p-3' : 'p-3'}`}
              >
                <div className={`flex items-center ${
                  isMobile ? 'flex-col text-center space-y-2' : 'space-x-3'
                }`}>
                  {/* Número del paso */}
                  <div className={`flex-shrink-0 ${
                    index === currentStep
                      ? 'bg-sky-600 text-white'
                      : 'bg-white/20 text-white'
                  } rounded-full ${
                    isMobile ? 'w-12 h-12' : isTablet ? 'w-8 h-8' : 'w-10 h-10'
                  } flex items-center justify-center font-bold ${
                    isMobile ? 'text-lg' : isTablet ? 'text-sm' : 'text-base'
                  }`}>
                    {index + 1}
                  </div>
                  
                  {/* Información del paso */}
                  <div className={`flex-1 ${
                    isMobile ? 'w-full' : ''
                  }`}>
                    <h3 className={`font-semibold ${
                      isMobile ? 'text-lg' : isTablet ? 'text-sm' : 'text-base'
                    }`}>
                      {step.title}
                    </h3>
                    <p className={`text-opacity-80 ${
                      index === currentStep ? 'text-sky-600' : 'text-sky-100'
                    } ${
                      isMobile ? 'text-sm mt-1' : isTablet ? 'text-xs' : 'text-sm'
                    }`}>
                      {step.description}
                    </p>
                  </div>
                  
                  {/* Indicador de completado */}
                  {index < currentStep && (
                    <div className={`flex-shrink-0 ${
                      isMobile ? 'mt-2' : ''
                    }`}>
                      <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Footer del sidebar */}
      {isOpen && (
        <div className={`p-4 border-t border-white/20 ${
          isMobile ? 'text-center' : ''
        }`}>
          <div className={`text-white ${
            isMobile ? 'space-y-2' : 'flex items-center justify-between'
          }`}>
            <div className={`${isMobile ? 'text-center' : ''}`}>
              <p className={`font-semibold ${
                isMobile ? 'text-lg' : 'text-sm'
              }`}>
                Progreso
              </p>
              <p className={`text-sky-100 ${
                isMobile ? 'text-base' : 'text-xs'
              }`}>
                {currentStep + 1} de {steps.length}
              </p>
            </div>
            
            {/* Barra de progreso */}
            <div className={`bg-white/20 rounded-full ${
              isMobile ? 'w-full h-3 mt-2' : 'w-20 h-2'
            }`}>
              <div 
                className="bg-white h-full rounded-full transition-all duration-500"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}