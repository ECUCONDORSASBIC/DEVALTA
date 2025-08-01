'use client'
import { useState, useEffect } from 'react'
import { Group } from 'three'
import { usePatient3DStore } from '../store/patient3DStore'
import { MotivoConsulta } from '../types/anamnesisTypes'

interface MotivoConsultaStepProps {
  patientAvatarRef: React.RefObject<Group>
}

export default function MotivoConsultaStep({ patientAvatarRef }: MotivoConsultaStepProps) {
  const { anamnesisData, actions } = usePatient3DStore()
  const [formData, setFormData] = useState<MotivoConsulta>(
    anamnesisData.motivoConsulta || {
      motivoPrincipal: '',
      tiempoEvolucion: '',
      caracteristicas: {
        inicio: 'gradual',
        curso: 'continuo',
        intensidad: 5,
        localizacion: []
      },
      sintomasAsociados: [],
      factoresAgravantes: [],
      factoresMejorantes: []
    }
  )

  const [newSymptom, setNewSymptom] = useState('')
  const [newFactor, setNewFactor] = useState('')

  useEffect(() => {
    actions.updateAnamnesisData({ motivoConsulta: formData })
  }, [formData, actions])

  const handleInputChange = (field: keyof MotivoConsulta, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleCaracteristicaChange = (field: keyof MotivoConsulta['caracteristicas'], value: any) => {
    setFormData(prev => ({
      ...prev,
      caracteristicas: {
        ...prev.caracteristicas,
        [field]: value
      }
    }))
  }

  const addSymptom = () => {
    if (newSymptom.trim()) {
      setFormData(prev => ({
        ...prev,
        sintomasAsociados: [...prev.sintomasAsociados, newSymptom.trim()]
      }))
      setNewSymptom('')
    }
  }

  const removeSymptom = (index: number) => {
    setFormData(prev => ({
      ...prev,
      sintomasAsociados: prev.sintomasAsociados.filter((_, i) => i !== index)
    }))
  }

  const addFactor = (type: 'agravantes' | 'mejorantes') => {
    if (newFactor.trim()) {
      setFormData(prev => ({
        ...prev,
        [type === 'agravantes' ? 'factoresAgravantes' : 'factoresMejorantes']: [
          ...prev[type === 'agravantes' ? 'factoresAgravantes' : 'factoresMejorantes'],
          newFactor.trim()
        ]
      }))
      setNewFactor('')
    }
  }

  const removeFactor = (type: 'agravantes' | 'mejorantes', index: number) => {
    setFormData(prev => ({
      ...prev,
      [type === 'agravantes' ? 'factoresAgravantes' : 'factoresMejorantes']: 
        prev[type === 'agravantes' ? 'factoresAgravantes' : 'factoresMejorantes'].filter((_, i) => i !== index)
    }))
  }

  const handleBodyPartClick = (bodyPart: string) => {
    const currentLocation = formData.caracteristicas.localizacion
    const isSelected = currentLocation.includes(bodyPart)
    
    if (isSelected) {
      handleCaracteristicaChange('localizacion', currentLocation.filter(part => part !== bodyPart))
    } else {
      handleCaracteristicaChange('localizacion', [...currentLocation, bodyPart])
    }
  }

  return (
    <div className="p-6 text-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-4">Motivo de Consulta</h2>
          <p className="text-blue-200 text-lg">
            Registre la razón principal por la que el paciente acude a consulta según el protocolo de Álvarez
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulario principal */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-blue-300 border-b border-blue-600 pb-2">
              Información Principal
            </h3>

            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">
                Motivo Principal de Consulta *
              </label>
              <textarea
                value={formData.motivoPrincipal}
                onChange={(e) => handleInputChange('motivoPrincipal', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 bg-white/10 border border-blue-400/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describa el motivo principal por el que acude el paciente..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">
                Tiempo de Evolución *
              </label>
              <input
                type="text"
                value={formData.tiempoEvolucion}
                onChange={(e) => handleInputChange('tiempoEvolucion', e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-blue-400/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: 3 días, 2 semanas, 1 mes..."
              />
            </div>

            {/* Características del síntoma */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-blue-300">Características del Síntoma</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-2">
                    Inicio
                  </label>
                  <select
                    value={formData.caracteristicas.inicio}
                    onChange={(e) => handleCaracteristicaChange('inicio', e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-blue-400/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="brusco">Brusco</option>
                    <option value="gradual">Gradual</option>
                    <option value="insidioso">Insidioso</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-2">
                    Curso
                  </label>
                  <select
                    value={formData.caracteristicas.curso}
                    onChange={(e) => handleCaracteristicaChange('curso', e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-blue-400/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="continuo">Continuo</option>
                    <option value="intermitente">Intermitente</option>
                    <option value="recurrente">Recurrente</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">
                  Intensidad (1-10)
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.caracteristicas.intensidad}
                    onChange={(e) => handleCaracteristicaChange('intensidad', parseInt(e.target.value))}
                    className="flex-1 h-2 bg-blue-600 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-2xl font-bold text-blue-300 min-w-[3rem] text-center">
                    {formData.caracteristicas.intensidad}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-blue-200 mt-1">
                  <span>Leve</span>
                  <span>Moderado</span>
                  <span>Severo</span>
                </div>
              </div>
            </div>

            {/* Síntomas asociados */}
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">
                Síntomas Asociados
              </label>
              <div className="flex space-x-2 mb-3">
                <input
                  type="text"
                  value={newSymptom}
                  onChange={(e) => setNewSymptom(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addSymptom()}
                  className="flex-1 px-4 py-2 bg-white/10 border border-blue-400/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Agregar síntoma..."
                />
                <button
                  onClick={addSymptom}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  +
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.sintomasAsociados.map((symptom, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-600/50 text-white rounded-full text-sm flex items-center space-x-2"
                  >
                    <span>{symptom}</span>
                    <button
                      onClick={() => removeSymptom(index)}
                      className="text-blue-200 hover:text-white"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Factores agravantes y mejorantes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">
                  Factores Agravantes
                </label>
                <div className="flex space-x-2 mb-3">
                  <input
                    type="text"
                    value={newFactor}
                    onChange={(e) => setNewFactor(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addFactor('agravantes')}
                    className="flex-1 px-4 py-2 bg-white/10 border border-red-400/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Factor agravante..."
                  />
                  <button
                    onClick={() => addFactor('agravantes')}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    +
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.factoresAgravantes.map((factor, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-red-600/50 text-white rounded-full text-sm flex items-center space-x-2"
                    >
                      <span>{factor}</span>
                      <button
                        onClick={() => removeFactor('agravantes', index)}
                        className="text-red-200 hover:text-white"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">
                  Factores Mejorantes
                </label>
                <div className="flex space-x-2 mb-3">
                  <input
                    type="text"
                    value={newFactor}
                    onChange={(e) => setNewFactor(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addFactor('mejorantes')}
                    className="flex-1 px-4 py-2 bg-white/10 border border-green-400/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Factor mejorante..."
                  />
                  <button
                    onClick={() => addFactor('mejorantes')}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    +
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.factoresMejorantes.map((factor, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-green-600/50 text-white rounded-full text-sm flex items-center space-x-2"
                    >
                      <span>{factor}</span>
                      <button
                        onClick={() => removeFactor('mejorantes', index)}
                        className="text-green-200 hover:text-white"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Localización 3D */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-blue-300 border-b border-blue-600 pb-2">
              Localización del Síntoma
            </h3>
            
            <div className="bg-blue-900/30 rounded-lg p-6 border border-blue-600/30">
              <p className="text-blue-200 mb-4">
                Seleccione las áreas del cuerpo donde se localiza el síntoma principal:
              </p>
              
              <div className="grid grid-cols-2 gap-3">
                {[
                  'cabeza', 'cuello', 'torax', 'abdomen', 'espalda',
                  'brazo_derecho', 'brazo_izquierdo', 'pierna_derecha', 'pierna_izquierda'
                ].map((bodyPart) => (
                  <button
                    key={bodyPart}
                    onClick={() => handleBodyPartClick(bodyPart)}
                    className={`p-3 rounded-lg border transition-all duration-200 text-left ${
                      formData.caracteristicas.localizacion.includes(bodyPart)
                        ? 'border-blue-500 bg-blue-600/50 text-white'
                        : 'border-gray-600 hover:border-blue-400 text-gray-300 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-current"></div>
                      <span className="capitalize">{bodyPart.replace('_', ' ')}</span>
                    </div>
                  </button>
                ))}
              </div>

              {formData.caracteristicas.localizacion.length > 0 && (
                <div className="mt-4 p-3 bg-blue-800/30 rounded-lg">
                  <p className="text-sm text-blue-200 font-medium mb-2">Áreas seleccionadas:</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.caracteristicas.localizacion.map((part, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-600/70 text-white rounded text-xs capitalize"
                      >
                        {part.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Resumen del motivo */}
            <div className="bg-purple-900/30 rounded-lg p-6 border border-purple-600/30">
              <h4 className="text-lg font-semibold text-purple-300 mb-3">Resumen del Motivo</h4>
              <div className="space-y-2 text-sm">
                <p><span className="text-purple-200 font-medium">Motivo:</span> {formData.motivoPrincipal || 'No especificado'}</p>
                <p><span className="text-purple-200 font-medium">Evolución:</span> {formData.tiempoEvolucion || 'No especificado'}</p>
                <p><span className="text-purple-200 font-medium">Inicio:</span> {formData.caracteristicas.inicio}</p>
                <p><span className="text-purple-200 font-medium">Curso:</span> {formData.caracteristicas.curso}</p>
                <p><span className="text-purple-200 font-medium">Intensidad:</span> {formData.caracteristicas.intensidad}/10</p>
                <p><span className="text-purple-200 font-medium">Localización:</span> {formData.caracteristicas.localizacion.length > 0 ? formData.caracteristicas.localizacion.join(', ') : 'No especificada'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}