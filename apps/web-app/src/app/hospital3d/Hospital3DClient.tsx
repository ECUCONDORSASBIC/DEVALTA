'use client'
import dynamic from 'next/dynamic'
import { SceneControlsProvider } from '@/components/scene/contexts/SceneControlsContext'

const OptimizedHospitalScene = dynamic(() => import('@/components/scene/OptimizedHospitalScene'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen bg-gradient-to-b from-blue-900 to-gray-900 text-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mb-4 mx-auto" />
        <p className="text-lg">Cargando Hospital Optimizado...</p>
        <p className="text-sm opacity-75">Reducción del 88.4% en tamaño</p>
      </div>
    </div>
  )
})

export default function Hospital3DClient() {
  return (
    <SceneControlsProvider>
      <OptimizedHospitalScene />
    </SceneControlsProvider>
  )
}
