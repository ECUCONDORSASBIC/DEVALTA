'use client'
import { useState } from 'react'
import { usePatient3DStore } from '../store/patient3DStore'

export default function MedicalTools() {
  const { uiState, actions } = usePatient3DStore()
  const [isOpen, setIsOpen] = useState(false)

  const tools = [
    {
      id: 'stethoscope',
      name: 'Estetoscopio',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      description: 'Auscultación cardíaca y pulmonar'
    },
    {
      id: 'thermometer',
      name: 'Termómetro',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      description: 'Medición de temperatura'
    },
    {
      id: 'blood_pressure',
      name: 'Tensiómetro',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      description: 'Medición de presión arterial'
    },
    {
      id: 'pulse_oximeter',
      name: 'Pulsioxímetro',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      description: 'Saturación de oxígeno'
    },
    {
      id: 'reflex_hammer',
      name: 'Martillo de Reflejos',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      ),
      description: 'Exploración neurológica'
    },
    {
      id: 'otoscope',
      name: 'Otoscopio',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
      description: 'Exploración de oídos'
    }
  ]

  const handleToolSelect = (toolId: string) => {
    actions.updateUIState({ currentTool: toolId })
    setIsOpen(false)
  }

  return (
    <div className="relative">
      {/* Botón principal */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
        <span>Herramientas</span>
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown de herramientas */}
      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          <div className="p-4">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Herramientas Médicas</h3>
            <div className="grid grid-cols-2 gap-3">
              {tools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => handleToolSelect(tool.id)}
                  className={`p-3 rounded-lg border transition-all duration-200 text-left ${
                    uiState.currentTool === tool.id
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`flex-shrink-0 ${
                      uiState.currentTool === tool.id ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      {tool.icon}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{tool.name}</p>
                      <p className="text-xs text-gray-500">{tool.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            
            {/* Herramienta actual seleccionada */}
            {uiState.currentTool && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-900">
                  Herramienta activa: {tools.find(t => t.id === uiState.currentTool)?.name}
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  {tools.find(t => t.id === uiState.currentTool)?.description}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}