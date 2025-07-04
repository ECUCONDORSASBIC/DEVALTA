'use client'
import { useState, useEffect } from 'react'
import { Html } from '@react-three/drei'
import { useAnamnesisStore, SymptomDetails } from '@/stores/anamnesisStore'
import { Vector3 } from 'three'

interface SymptomDetailsStepProps {
  position?: [number, number, number]
}

const PAIN_TYPES = [
  { value: 'sharp', label: 'Punzante', icon: '⚡' },
  { value: 'dull', label: 'Sordo', icon: '🔘' },
  { value: 'throbbing', label: 'Pulsátil', icon: '💓' },
  { value: 'burning', label: 'Ardor', icon: '🔥' },
  { value: 'tingling', label: 'Hormigueo', icon: '✨' },
  { value: 'other', label: 'Otro', icon: '❓' }
]

const DURATION_OPTIONS = [
  'Menos de 1 hora',
  '1-6 horas',
  '6-24 horas',
  '1-3 días',
  '3-7 días',
  '1-4 semanas',
  'Más de 1 mes',
  'Más de 6 meses'
]

const COMMON_TRIGGERS = [
  'Movimiento',
  'Ejercicio',
  'Estrés',
  'Frío',
  'Calor',
  'Comida',
  'Posición',
  'Tiempo',
  'Sueño'
]

const RELIEF_FACTORS = [
  'Descanso',
  'Medicación',
  'Calor',
  'Frío',
  'Masaje',
  'Ejercicio suave',
  'Cambio de posición',
  'Relajación'
]

const ASSOCIATED_SYMPTOMS = [
  'Náuseas',
  'Mareos',
  'Fiebre',
  'Fatiga',
  'Debilidad',
  'Entumecimiento',
  'Hinchazón',
  'Rigidez'
]

export function SymptomDetailsStep({ position = [0, 3, 0] }: SymptomDetailsStepProps) {
  const { 
    symptomLocations, 
    symptomDetails, 
    currentSymptomId, 
    actions 
  } = useAnamnesisStore()

  const [selectedLocationIndex, setSelectedLocationIndex] = useState(0)
  const [formData, setFormData] = useState<Partial<SymptomDetails>>({
    painLevel: 5,
    painType: 'dull',
    duration: '',
    triggers: [],
    reliefFactors: [],
    associatedSymptoms: [],
    heatmapData: []
  })

  const currentLocation = symptomLocations[selectedLocationIndex]
  const currentDetails = symptomDetails.find(d => d.locationId === currentLocation?.id)

  // Initialize form data when location changes
  useEffect(() => {
    if (currentLocation) {
      actions.setCurrentSymptom(currentLocation.id)
      
      if (currentDetails) {
        setFormData(currentDetails)
      } else {
        setFormData({
          id: currentLocation.id,
          locationId: currentLocation.id,
          painLevel: 5,
          painType: 'dull',
          duration: '',
          triggers: [],
          reliefFactors: [],
          associatedSymptoms: [],
          heatmapData: []
        })
      }
    }
  }, [currentLocation, currentDetails, actions])

  const handleSaveDetails = () => {
    if (currentLocation && formData) {
      actions.updateSymptomDetails({
        ...formData,
        id: currentLocation.id,
        locationId: currentLocation.id
      })
    }
  }

  const handleNext = () => {
    handleSaveDetails()
    
    if (selectedLocationIndex < symptomLocations.length - 1) {
      setSelectedLocationIndex(selectedLocationIndex + 1)
    } else {
      actions.nextStep()
    }
  }

  const handlePrevious = () => {
    if (selectedLocationIndex > 0) {
      setSelectedLocationIndex(selectedLocationIndex - 1)
    } else {
      actions.previousStep()
    }
  }

  const toggleArrayItem = (array: string[], item: string, setter: (newArray: string[]) => void) => {
    if (array.includes(item)) {
      setter(array.filter(i => i !== item))
    } else {
      setter([...array, item])
    }
  }

  const addHeatmapPoint = (intensity: number) => {
    const position = new Vector3(
      Math.random() * 2 - 1,
      Math.random() * 2 - 1,
      0
    )
    actions.addHeatmapPoint(position, intensity)
  }

  const getPainLevelColor = (level: number) => {
    if (level <= 2) return '#22c55e' // green
    if (level <= 4) return '#eab308' // yellow
    if (level <= 6) return '#f97316' // orange
    if (level <= 8) return '#ef4444' // red
    return '#dc2626' // dark red
  }

  if (symptomLocations.length === 0) {
    return (
      <Html
        position={position}
        distanceFactor={8}
        occlude={false}
        transform={false}
        sprite
        center
      >
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-gray-200 p-6 max-w-md text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            No hay síntomas seleccionados
          </h2>
          <p className="text-gray-600 text-sm mb-4">
            Regrese al paso anterior para seleccionar las áreas donde siente molestias.
          </p>
          <button
            onClick={() => actions.previousStep()}
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors"
          >
            Volver a selección de síntomas
          </button>
        </div>
      </Html>
    )
  }

  return (
    <Html
      position={position}
      distanceFactor={8}
      occlude={false}
      transform={false}
      sprite
      center
      className="symptom-details-step"
    >
      <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-gray-200 p-6 max-w-lg">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            🎛️ Detalles del Síntoma
          </h2>
          <p className="text-gray-600 text-sm">
            Proporcione detalles específicos sobre cada síntoma seleccionado.
          </p>
          
          {/* Progress indicator */}
          <div className="mt-4 flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              Síntoma {selectedLocationIndex + 1} de {symptomLocations.length}:
            </span>
            <span className="font-medium text-blue-600">
              {currentLocation?.description}
            </span>
          </div>
        </div>

        <div className="space-y-6">
          {/* Pain Level Slider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Nivel de dolor (0 = Sin dolor, 10 = Dolor extremo)
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="10"
                value={formData.painLevel || 5}
                onChange={(e) => setFormData({ ...formData, painLevel: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #22c55e 0%, #eab308 40%, #f97316 60%, #ef4444 80%, #dc2626 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>0</span>
                <span>2</span>
                <span>4</span>
                <span>6</span>
                <span>8</span>
                <span>10</span>
              </div>
              <div className="text-center">
                <span 
                  className="inline-block px-3 py-1 rounded-full text-white font-medium text-sm"
                  style={{ backgroundColor: getPainLevelColor(formData.painLevel || 5) }}
                >
                  {formData.painLevel || 5}/10
                </span>
              </div>
            </div>
          </div>

          {/* Pain Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tipo de dolor
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PAIN_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setFormData({ ...formData, painType: type.value as any })}
                  className={`p-3 text-sm rounded-lg border transition-all ${
                    formData.painType === type.value
                      ? 'bg-blue-100 border-blue-500 text-blue-800'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="text-lg mb-1">{type.icon}</div>
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duración del síntoma
            </label>
            <select
              value={formData.duration || ''}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Seleccione duración...</option>
              {DURATION_OPTIONS.map((duration) => (
                <option key={duration} value={duration}>
                  {duration}
                </option>
              ))}
            </select>
          </div>

          {/* Triggers */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Factores que empeoran el síntoma
            </label>
            <div className="grid grid-cols-3 gap-2">
              {COMMON_TRIGGERS.map((trigger) => (
                <button
                  key={trigger}
                  onClick={() => toggleArrayItem(
                    formData.triggers || [], 
                    trigger, 
                    (newTriggers) => setFormData({ ...formData, triggers: newTriggers })
                  )}
                  className={`p-2 text-xs rounded-md border transition-all ${
                    formData.triggers?.includes(trigger)
                      ? 'bg-red-100 border-red-500 text-red-800'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {trigger}
                </button>
              ))}
            </div>
          </div>

          {/* Relief Factors */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Factores que alivian el síntoma
            </label>
            <div className="grid grid-cols-3 gap-2">
              {RELIEF_FACTORS.map((relief) => (
                <button
                  key={relief}
                  onClick={() => toggleArrayItem(
                    formData.reliefFactors || [], 
                    relief, 
                    (newReliefs) => setFormData({ ...formData, reliefFactors: newReliefs })
                  )}
                  className={`p-2 text-xs rounded-md border transition-all ${
                    formData.reliefFactors?.includes(relief)
                      ? 'bg-green-100 border-green-500 text-green-800'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {relief}
                </button>
              ))}
            </div>
          </div>

          {/* Associated Symptoms */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Síntomas asociados
            </label>
            <div className="grid grid-cols-3 gap-2">
              {ASSOCIATED_SYMPTOMS.map((symptom) => (
                <button
                  key={symptom}
                  onClick={() => toggleArrayItem(
                    formData.associatedSymptoms || [], 
                    symptom, 
                    (newSymptoms) => setFormData({ ...formData, associatedSymptoms: newSymptoms })
                  )}
                  className={`p-2 text-xs rounded-md border transition-all ${
                    formData.associatedSymptoms?.includes(symptom)
                      ? 'bg-yellow-100 border-yellow-500 text-yellow-800'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {symptom}
                </button>
              ))}
            </div>
          </div>

          {/* Heatmap Generator */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Mapa de intensidad (experimental)
            </label>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-600 mb-3">
                Genere puntos de intensidad para visualizar el dolor:
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={() => addHeatmapPoint(0.3)}
                  className="px-3 py-2 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                >
                  Bajo
                </button>
                <button
                  onClick={() => addHeatmapPoint(0.6)}
                  className="px-3 py-2 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600"
                >
                  Medio
                </button>
                <button
                  onClick={() => addHeatmapPoint(0.9)}
                  className="px-3 py-2 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                >
                  Alto
                </button>
              </div>
              {formData.heatmapData && formData.heatmapData.length > 0 && (
                <div className="mt-2">
                  <span className="text-xs text-gray-500">
                    {formData.heatmapData.length} puntos de intensidad registrados
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex space-x-3 mt-6">
          <button
            onClick={handlePrevious}
            className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-200 transition-colors"
          >
            {selectedLocationIndex === 0 ? 'Anterior' : 'Síntoma anterior'}
          </button>
          <button
            onClick={handleNext}
            className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
          >
            {selectedLocationIndex === symptomLocations.length - 1 ? 'Continuar' : 'Siguiente síntoma'}
          </button>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center space-x-2 mt-4">
          {symptomLocations.map((_, index) => (
            <button
              key={index}
              onClick={() => setSelectedLocationIndex(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === selectedLocationIndex
                  ? 'bg-blue-600'
                  : index < selectedLocationIndex
                    ? 'bg-green-500'
                    : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </Html>
  )
}
