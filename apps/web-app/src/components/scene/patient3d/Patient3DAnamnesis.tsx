'use client'
import { Canvas } from '@react-three/fiber'
import { Environment, OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { useRef, useState, useEffect } from 'react'
import { Group } from 'three'
import { usePatient3DStore } from './store/patient3DStore'
import Patient3DAvatar from './Patient3DAvatar'
import AnamnesisInterface from './AnamnesisInterface'
import MedicalEnvironment from './MedicalEnvironment'
import { AnamnesisStep } from './types/anamnesisTypes'

export default function Patient3DAnamnesis() {
  const patientAvatarRef = useRef<Group>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { currentStep, totalSteps, actions } = usePatient3DStore()

  useEffect(() => {
    // Inicializar la anamnesis con los pasos de Álvarez
    actions.initializeAnamnesis()
    
    // Simular carga de assets 3D
    const timer = setTimeout(() => setIsLoading(false), 2000)
    return () => clearTimeout(timer)
  }, [actions])

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center text-white bg-gradient-to-br from-sky-400 via-blue-500 to-cyan-600">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="w-24 h-24 bg-white/20 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-3 text-white drop-shadow-lg">Preparando Anamnesis Médica</h2>
            <p className="text-lg opacity-90 text-sky-100 mb-4">Cargando modelo 3D y protocolos de Álvarez...</p>
            <div className="flex justify-center space-x-2">
              <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      {/* Canvas 3D */}
      <Canvas
        shadows
        camera={{ position: [0, 1.6, 3], fov: 50 }}
        className="w-full h-full"
      >
        {/* Controles de cámara */}
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={1}
          maxDistance={10}
          target={[0, 1, 0]}
        />
        
        {/* Cámara principal */}
        <PerspectiveCamera makeDefault position={[0, 1.6, 3]} />
        
        {/* Iluminación médica optimizada */}
        <ambientLight intensity={0.6} color="#87CEEB" />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1.2}
          color="#E0F6FF"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-10, 10, -10]} intensity={0.3} color="#B0E0E6" />
        <pointLight position={[0, 5, 0]} intensity={0.4} color="#ADD8E6" />
        
        {/* Modelo 3D del paciente */}
        <Patient3DAvatar ref={patientAvatarRef} />
        
      </Canvas>

      {/* Interfaz de anamnesis */}
      <AnamnesisInterface patientAvatarRef={patientAvatarRef} />
      
      {/* Indicador de progreso mejorado */}
      <div className="absolute top-20 left-4 bg-white rounded-xl p-4 text-sky-700 border border-blue-100 shadow-lg">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-3 h-3 bg-sky-400 rounded-full animate-pulse shadow-lg"></div>
          <span className="font-semibold">Progreso</span>
        </div>
        <div className="font-bold text-lg">{currentStep + 1} / {totalSteps}</div>
      </div>

      {/* Indicador de estado del sistema */}
      <div className="absolute top-20 right-4 bg-white rounded-xl p-3 text-sky-700 border border-blue-100 shadow-lg">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="font-medium">Sistema operativo</span>
        </div>
        <div className="text-xs text-blue-500 mt-1">Sincronizado</div>
      </div>
    </div>
  )
}