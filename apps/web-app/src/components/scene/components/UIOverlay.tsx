'use client'
import { Html } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useRef, useState, useEffect } from 'react'
import { Vector3, Group } from 'three'

interface UIOverlayProps {
  position?: [number, number, number]
  children?: React.ReactNode
  distanceFactor?: number
  occlude?: boolean
  transform?: boolean
  sprite?: boolean
  center?: boolean
  scaleFactor?: number
  className?: string
}

export function UIOverlay({
  position = [0, 2, 0],
  children,
  distanceFactor = 10,
  occlude = true,
  transform = false,
  sprite = true,
  center = true,
  scaleFactor = 1,
  className = ""
}: UIOverlayProps) {
  const group = useRef<Group>(null)
  const { camera } = useThree()
  const [isVisible, setIsVisible] = useState(true)
  
  // Calculate distance-based scaling
  useFrame(() => {
    if (group.current) {
      const distance = camera.position.distanceTo(group.current.position)
      const scale = Math.max(0.5, Math.min(2, scaleFactor * (10 / distance)))
      group.current.scale.setScalar(scale)
      
      // Hide if too far away
      setIsVisible(distance < 20)
    }
  })

  if (!isVisible) return null

  return (
    <group ref={group} position={position}>
      <Html
        distanceFactor={distanceFactor}
        occlude={occlude}
        transform={transform}
        sprite={sprite}
        center={center}
        className={`ui-overlay ${className}`}
      >
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 border border-gray-200 max-w-sm">
          {children}
        </div>
      </Html>
    </group>
  )
}

// Patient Info Overlay
interface PatientInfoOverlayProps {
  position?: [number, number, number]
  patientName?: string
  vitals?: {
    heartRate?: number
    bloodPressure?: string
    temperature?: number
    oxygenSaturation?: number
  }
  onClose?: () => void
}

export function PatientInfoOverlay({
  position = [1, 3, -1],
  patientName = "Juan Pérez",
  vitals = {
    heartRate: 72,
    bloodPressure: "120/80",
    temperature: 36.5,
    oxygenSaturation: 98
  },
  onClose
}: PatientInfoOverlayProps) {
  return (
    <UIOverlay position={position} className="patient-info">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg text-gray-800">{patientName}</h3>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              ✕
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="space-y-1">
            <div className="text-gray-600">Ritmo Cardíaco</div>
            <div className="font-medium text-red-600">{vitals.heartRate} bpm</div>
          </div>
          
          <div className="space-y-1">
            <div className="text-gray-600">Presión Arterial</div>
            <div className="font-medium text-blue-600">{vitals.bloodPressure} mmHg</div>
          </div>
          
          <div className="space-y-1">
            <div className="text-gray-600">Temperatura</div>
            <div className="font-medium text-orange-600">{vitals.temperature}°C</div>
          </div>
          
          <div className="space-y-1">
            <div className="text-gray-600">Saturación O₂</div>
            <div className="font-medium text-green-600">{vitals.oxygenSaturation}%</div>
          </div>
        </div>
      </div>
    </UIOverlay>
  )
}

// Medical Device Info Overlay
interface DeviceInfoOverlayProps {
  position?: [number, number, number]
  deviceName: string
  status: 'active' | 'inactive' | 'in_use'
  readings?: Array<{ label: string; value: string; unit?: string }>
  onAction?: () => void
  actionLabel?: string
}

export function DeviceInfoOverlay({
  position = [0, 2, 0],
  deviceName,
  status,
  readings = [],
  onAction,
  actionLabel = "Usar Dispositivo"
}: DeviceInfoOverlayProps) {
  const statusColors = {
    active: 'text-green-600 bg-green-100',
    inactive: 'text-gray-600 bg-gray-100',
    in_use: 'text-blue-600 bg-blue-100'
  }

  const statusLabels = {
    active: 'Disponible',
    inactive: 'Inactivo',
    in_use: 'En Uso'
  }

  return (
    <UIOverlay position={position} className="device-info">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">{deviceName}</h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
            {statusLabels[status]}
          </span>
        </div>
        
        {readings.length > 0 && (
          <div className="space-y-2">
            {readings.map((reading, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <span className="text-gray-600">{reading.label}</span>
                <span className="font-medium">
                  {reading.value} {reading.unit && <span className="text-gray-500">{reading.unit}</span>}
                </span>
              </div>
            ))}
          </div>
        )}
        
        {onAction && status === 'active' && (
          <button
            onClick={onAction}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </UIOverlay>
  )
}

// Anamnesis Progress Overlay
interface AnamnesisProgressOverlayProps {
  position?: [number, number, number]
  currentStep: number
  totalSteps: number
  stepName: string
  progress: number
  onNext?: () => void
  onPrevious?: () => void
}

export function AnamnesisProgressOverlay({
  position = [0, 4, 0],
  currentStep,
  totalSteps,
  stepName,
  progress,
  onNext,
  onPrevious
}: AnamnesisProgressOverlayProps) {
  return (
    <UIOverlay position={position} className="anamnesis-progress">
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="font-semibold text-gray-800">Anamnesis Paso {currentStep} de {totalSteps}</h3>
          <p className="text-sm text-gray-600 mt-1">{stepName}</p>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-600">
            <span>Progreso</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        
        <div className="flex space-x-2">
          {onPrevious && currentStep > 1 && (
            <button
              onClick={onPrevious}
              className="flex-1 bg-gray-200 text-gray-700 py-2 px-3 rounded-md hover:bg-gray-300 transition-colors text-sm"
            >
              Anterior
            </button>
          )}
          
          {onNext && currentStep < totalSteps && (
            <button
              onClick={onNext}
              className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-md hover:bg-blue-700 transition-colors text-sm"
            >
              Siguiente
            </button>
          )}
        </div>
      </div>
    </UIOverlay>
  )
}
