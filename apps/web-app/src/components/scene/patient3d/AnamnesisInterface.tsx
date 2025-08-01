'use client'
import { usePatient3DStore } from './store/patient3DStore'
import AnamnesisSidebar from './ui/AnamnesisSidebar'
import { Group } from 'three'
import { useState, useEffect } from 'react'

interface AnamnesisInterfaceProps {
  patientAvatarRef: React.RefObject<Group> | null
}

export default function AnamnesisInterface({ patientAvatarRef }: AnamnesisInterfaceProps) {
  const { currentStep, steps, uiState, actions } = usePatient3DStore()
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)

  // Detectar tamaño de pantalla
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth
      setIsMobile(width < 768)
      setIsTablet(width >= 768 && width < 1024)
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  const toggleSidebar = () => {
    actions.updateUIState({ isSidebarOpen: !uiState.isSidebarOpen })
  }

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Sidebar responsive */}
      <div className={`absolute top-0 left-0 h-full z-20 transition-all duration-300 ${
        isMobile 
          ? (uiState.isSidebarOpen ? 'w-full' : 'w-0') 
          : isTablet 
            ? (uiState.isSidebarOpen ? 'w-64' : 'w-16') 
            : (uiState.isSidebarOpen ? 'w-80' : 'w-20')
      } bg-gradient-to-b from-sky-600 to-cyan-700 shadow-xl pointer-events-auto`}>
        <AnamnesisSidebar 
          isOpen={uiState.isSidebarOpen}
          currentStep={currentStep}
          steps={steps}
          onStepClick={(stepIndex) => actions.goToStep(stepIndex)}
          onToggle={toggleSidebar}
          isMobile={isMobile}
          isTablet={isTablet}
        />
      </div>
      
      {/* Panel central responsive */}
      <div className={`absolute top-0 right-0 h-full transition-all duration-300 ${
        isMobile 
          ? 'left-0' 
          : isTablet 
            ? (uiState.isSidebarOpen ? 'left-64' : 'left-16') 
            : (uiState.isSidebarOpen ? 'left-80' : 'left-20')
      } pointer-events-auto flex items-center justify-center p-4`}> 
        <div className={`bg-white rounded-2xl shadow-2xl border border-blue-100 text-sky-800 ${
          isMobile 
            ? 'w-full h-full rounded-none p-4' 
            : isTablet 
              ? 'w-full max-w-4xl p-6' 
              : 'max-w-2xl w-full p-10'
        }`}>
          {/* Header del paso */}
          <div className={`mb-6 flex items-center justify-between ${
            isMobile ? 'flex-col space-y-3' : 'flex-row'
          }`}>
            <div className={`${isMobile ? 'text-center w-full' : ''}`}>
              <h2 className={`font-bold text-sky-800 ${
                isMobile ? 'text-xl' : isTablet ? 'text-2xl' : 'text-3xl'
              }`}>
                {steps[currentStep]?.title}
              </h2>
              <p className={`text-sky-600 mt-1 ${
                isMobile ? 'text-sm' : 'text-base'
              }`}>
                {steps[currentStep]?.description}
              </p>
            </div>
            
            {/* Botón de toggle sidebar en móvil */}
            {isMobile && (
              <button
                onClick={toggleSidebar}
                className="fixed top-4 left-4 z-30 bg-sky-600 text-white p-2 rounded-lg shadow-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}
          </div>

          {/* Contenido del formulario */}
          <div className={`space-y-6 ${
            isMobile ? 'space-y-4' : 'space-y-6'
          }`}>
            {/* Aquí irían los componentes específicos de cada paso */}
            <div className="bg-sky-50 rounded-xl p-4 border border-sky-200">
              <h3 className={`font-semibold text-sky-800 mb-3 ${
                isMobile ? 'text-lg' : 'text-xl'
              }`}>
                Formulario de {steps[currentStep]?.title}
              </h3>
              <p className="text-sky-600">
                Contenido específico del paso {currentStep + 1} de {steps.length}
              </p>
            </div>

            {/* Navegación responsive */}
            <div className={`flex ${
              isMobile ? 'flex-col space-y-3' : 'flex-row justify-between'
            }`}>
              <button
                onClick={() => actions.previousStep()}
                disabled={currentStep === 0}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  currentStep === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-sky-600 text-white hover:bg-sky-700 shadow-lg hover:shadow-xl'
                } ${isMobile ? 'w-full' : ''}`}
              >
                ← Anterior
              </button>
              
              <button
                onClick={() => actions.nextStep()}
                disabled={currentStep === steps.length - 1}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  currentStep === steps.length - 1
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-cyan-600 text-white hover:bg-cyan-700 shadow-lg hover:shadow-xl'
                } ${isMobile ? 'w-full' : ''}`}
              >
                Siguiente →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay para móvil cuando sidebar está abierto */}
      {isMobile && uiState.isSidebarOpen && (
        <div 
          className="absolute inset-0 bg-black bg-opacity-50 z-10 pointer-events-auto"
          onClick={toggleSidebar}
        />
      )}
    </div>
  )
}