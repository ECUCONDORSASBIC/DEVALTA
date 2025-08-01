'use client'

import ResponsiveLayout from './ResponsiveLayout'
import HospitalScene from '../scene/HospitalScene'

export default function LayoutExample() {
  return (
    <ResponsiveLayout>
      {/* Área principal 3D con z-index apropiado */}
      <div className="w-full h-full min-h-[600px] relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg shadow-inner">
          {/* Canvas 3D con z-index bajo */}
          <div className="w-full h-full z-10 relative">
            <HospitalScene />
          </div>
          
          {/* Overlay con controles que flotan sobre el canvas */}
          <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">Controles 3D</h3>
            <div className="space-y-2">
              <button className="w-full text-left px-3 py-2 text-sm bg-blue-50 hover:bg-blue-100 rounded-md transition-colors duration-200">
                Resetear cámara
              </button>
              <button className="w-full text-left px-3 py-2 text-sm bg-blue-50 hover:bg-blue-100 rounded-md transition-colors duration-200">
                Pantalla completa
              </button>
              <button className="w-full text-left px-3 py-2 text-sm bg-blue-50 hover:bg-blue-100 rounded-md transition-colors duration-200">
                Capturar imagen
              </button>
            </div>
          </div>

          {/* Indicador de carga/estado */}
          <div className="absolute bottom-4 left-4 z-20 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-800">Renderizando</span>
            </div>
          </div>
        </div>
      </div>
    </ResponsiveLayout>
  )
}
