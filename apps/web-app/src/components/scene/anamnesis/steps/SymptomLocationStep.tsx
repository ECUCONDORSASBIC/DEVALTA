'use client'
import { useState, useRef } from 'react'
import { Html } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useAnamnesisStore, SymptomLocation } from '@/stores/anamnesisStore'
import { Vector3, Raycaster, Object3D } from 'three'

interface SymptomLocationStepProps {
  position?: [number, number, number]
  patientAvatarRef?: React.RefObject<Object3D>
}

// Body part mappings for 3D model
const BODY_PARTS = {
  head: { name: 'Cabeza', color: '#ff6b6b' },
  neck: { name: 'Cuello', color: '#4ecdc4' },
  chest: { name: 'Pecho', color: '#45b7d1' },
  leftArm: { name: 'Brazo Izquierdo', color: '#96ceb4' },
  rightArm: { name: 'Brazo Derecho', color: '#96ceb4' },
  leftHand: { name: 'Mano Izquierda', color: '#feca57' },
  rightHand: { name: 'Mano Derecha', color: '#feca57' },
  abdomen: { name: 'Abdomen', color: '#ff9ff3' },
  back: { name: 'Espalda', color: '#54a0ff' },
  leftLeg: { name: 'Pierna Izquierda', color: '#5f27cd' },
  rightLeg: { name: 'Pierna Derecha', color: '#5f27cd' },
  leftFoot: { name: 'Pie Izquierdo', color: '#00d2d3' },
  rightFoot: { name: 'Pie Derecho', color: '#00d2d3' }
}

export function SymptomLocationStep({ 
  position = [0, 3, 0],
  patientAvatarRef 
}: SymptomLocationStepProps) {
  const { symptomLocations, selectedBodyParts, actions } = useAnamnesisStore()
  const { camera, raycaster, pointer, scene } = useThree()
  const [isSelecting, setIsSelecting] = useState(false)
  const [hoveredBodyPart, setHoveredBodyPart] = useState<string | null>(null)
  
  // Handle mouse/touch interactions for body part selection
  const handleBodyPartClick = (bodyPart: string, worldPosition: Vector3) => {
    const existingLocation = symptomLocations.find(loc => loc.bodyPart === bodyPart)
    
    if (existingLocation) {
      // Remove if already selected
      actions.removeSymptomLocation(existingLocation.id)
    } else {
      // Add new symptom location
      const newLocation: SymptomLocation = {
        id: `symptom_${Date.now()}_${bodyPart}`,
        bodyPart,
        position: worldPosition,
        description: `Molestia en ${BODY_PARTS[bodyPart as keyof typeof BODY_PARTS]?.name || bodyPart}`,
        selectedAt: new Date(),
        severity: 3 // Default severity
      }
      actions.addSymptomLocation(newLocation)
    }
  }

  // Simulate raycasting for body part detection
  const handleClick = (event: any) => {
    if (!patientAvatarRef?.current) return
    
    // Simple body part detection based on click position
    // In a real implementation, this would use raycasting against the 3D model
    const rect = event.target.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1
    
    // Rough body part detection based on click coordinates
    let bodyPart = 'chest' // default
    if (y > 0.5) bodyPart = 'head'
    else if (y > 0.2) bodyPart = x < -0.3 ? 'leftArm' : x > 0.3 ? 'rightArm' : 'chest'
    else if (y > -0.2) bodyPart = 'abdomen'
    else if (y > -0.6) bodyPart = x < -0.2 ? 'leftLeg' : x > 0.2 ? 'rightLeg' : 'abdomen'
    else bodyPart = x < -0.2 ? 'leftFoot' : x > 0.2 ? 'rightFoot' : 'rightLeg'
    
    const worldPosition = new Vector3(x, y, 0)
    handleBodyPartClick(bodyPart, worldPosition)
  }

  const handleContinue = () => {
    if (symptomLocations.length > 0) {
      actions.nextStep()
    }
  }

  const getSeverityColor = (severity: number) => {
    switch (severity) {
      case 1: return '#22c55e' // green
      case 2: return '#84cc16' // lime
      case 3: return '#eab308' // yellow
      case 4: return '#f97316' // orange
      case 5: return '#ef4444' // red
      default: return '#6b7280' // gray
    }
  }

  return (
    <>
      <Html
        position={position}
        distanceFactor={8}
        occlude={false}
        transform={false}
        sprite
        center
        className="symptom-location-step"
      >
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-gray-200 p-6 max-w-md">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              🫵 Ubicación de Síntomas
            </h2>
            <p className="text-gray-600 text-sm">
              Haga clic en las partes del cuerpo donde siente molestias. Puede seleccionar múltiples áreas.
            </p>
          </div>

          {/* Instructions */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">Instrucciones:</h3>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Haga clic en el avatar 3D para seleccionar áreas</li>
              <li>• Las áreas seleccionadas se resaltarán en color</li>
              <li>• Haga clic nuevamente para deseleccionar</li>
              <li>• Puede seleccionar múltiples áreas del cuerpo</li>
            </ul>
          </div>

          {/* Quick body part selector as fallback */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Selección rápida:</h3>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(BODY_PARTS).map(([key, part]) => {
                const isSelected = selectedBodyParts.includes(key)
                return (
                  <button
                    key={key}
                    onClick={() => handleBodyPartClick(key, new Vector3(0, 0, 0))}
                    className={`p-2 text-xs rounded-md border transition-all ${
                      isSelected
                        ? 'bg-blue-100 border-blue-500 text-blue-800'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {part.name}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Selected symptoms list */}
          {symptomLocations.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Síntomas seleccionados ({symptomLocations.length}):
              </h3>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {symptomLocations.map((location) => (
                  <div
                    key={location.id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                  >
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ 
                          backgroundColor: BODY_PARTS[location.bodyPart as keyof typeof BODY_PARTS]?.color || '#6b7280' 
                        }}
                      />
                      <span className="text-xs font-medium text-gray-700">
                        {BODY_PARTS[location.bodyPart as keyof typeof BODY_PARTS]?.name || location.bodyPart}
                      </span>
                    </div>
                    <button
                      onClick={() => actions.removeSymptomLocation(location.id)}
                      className="text-red-500 hover:text-red-700 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex space-x-3">
            <button
              onClick={() => actions.previousStep()}
              className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-200 transition-colors"
            >
              Anterior
            </button>
            <button
              onClick={handleContinue}
              disabled={symptomLocations.length === 0}
              className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all ${
                symptomLocations.length > 0
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Continuar
            </button>
          </div>

          {symptomLocations.length === 0 && (
            <p className="text-amber-600 text-xs mt-2 text-center">
              Seleccione al menos una área del cuerpo para continuar
            </p>
          )}
        </div>
      </Html>

      {/* 3D interactive overlay for body part selection */}
      {isSelecting && (
        <Html
          position={[0, 0, 0]}
          fullscreen
          className="symptom-selector-overlay"
        >
          <div 
            className="fixed inset-0 bg-black/20 cursor-crosshair z-10"
            onClick={handleClick}
            onMouseMove={(e) => {
              // Update hover state based on mouse position
              const rect = e.currentTarget.getBoundingClientRect()
              const x = ((e.clientX - rect.left) / rect.width) * 2 - 1
              const y = -((e.clientY - rect.top) / rect.height) * 2 + 1
              
              // Simple hover detection
              let bodyPart = 'chest'
              if (y > 0.5) bodyPart = 'head'
              else if (y > 0.2) bodyPart = x < -0.3 ? 'leftArm' : x > 0.3 ? 'rightArm' : 'chest'
              
              setHoveredBodyPart(bodyPart)
            }}
          >
            {hoveredBodyPart && (
              <div 
                className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg"
              >
                <p className="text-sm font-medium text-gray-800">
                  {BODY_PARTS[hoveredBodyPart as keyof typeof BODY_PARTS]?.name || hoveredBodyPart}
                </p>
                <p className="text-xs text-gray-600">
                  Haga clic para seleccionar
                </p>
              </div>
            )}
          </div>
        </Html>
      )}

      {/* Enable/disable selection mode button */}
      <Html
        position={[position[0], position[1] - 1.5, position[2]]}
        distanceFactor={8}
        occlude={false}
        center
      >
        <button
          onClick={() => setIsSelecting(!isSelecting)}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
            isSelecting
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-green-500 text-white hover:bg-green-600'
          } shadow-md hover:shadow-lg`}
        >
          {isSelecting ? '✕ Cancelar selección' : '🎯 Activar selección 3D'}
        </button>
      </Html>
    </>
  )
}
