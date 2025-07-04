'use client'
import { Suspense } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import the HospitalScene to avoid SSR issues
const HospitalScene = dynamic(() => import('@/components/scene/HospitalScene'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Cargando Anamnesis 3D</h2>
        <p className="text-gray-600">Preparando el entorno médico virtual...</p>
      </div>
    </div>
  )
})

export default function AnamnesisDemo() {
  return (
    <div className="w-full h-screen bg-gray-900 relative">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-white">
                🏥 AltaMédica - Anamnesis Interactiva 3D
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-white/80">
                Powered by Zustand + Three.js + Drei
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions overlay */}
      <div className="absolute bottom-4 left-4 right-4 z-20 max-w-md mx-auto">
        <div className="bg-black/60 backdrop-blur-sm rounded-lg p-4 text-white">
          <h3 className="font-semibold mb-2">🎮 Instrucciones:</h3>
          <ul className="text-sm space-y-1 text-white/90">
            <li>• Sigue los pasos del proceso de anamnesis</li>
            <li>• Utiliza el ratón para navegar en 3D</li>
            <li>• Haz clic en las partes del cuerpo para seleccionar síntomas</li>
            <li>• Completa todos los detalles en cada paso</li>
            <li>• Revisa y confirma al final</li>
          </ul>
        </div>
      </div>

      {/* Features sidebar */}
      <div className="absolute top-20 right-4 z-20 w-64">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-3">✨ Características:</h3>
          <ul className="text-sm space-y-2 text-gray-700">
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              Stepper interactivo con Zustand
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              5 pasos de anamnesis completa
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              Selección de síntomas con raycaster
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              3D widgets y controles deslizantes
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              Heatmap de dolor color-coded
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              Sincronización con PatientAvatar
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              Etiquetas inline con Drei Html
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              Autofill de datos vía API
            </li>
          </ul>
        </div>
      </div>

      {/* 3D Scene */}
      <Suspense fallback={
        <div className="flex items-center justify-center h-screen">
          <div className="text-center text-white">
            <div className="animate-pulse text-6xl mb-4">🏥</div>
            <h2 className="text-2xl font-bold mb-2">Cargando Anamnesis 3D</h2>
            <p className="text-white/80">Inicializando componentes médicos...</p>
          </div>
        </div>
      }>
        <HospitalScene />
      </Suspense>
    </div>
  )
}
