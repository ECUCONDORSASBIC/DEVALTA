'use client'
import { useState, useEffect } from 'react'
import { Group } from 'three'
import { usePatient3DStore } from '../store/patient3DStore'
import { PatientIdentification } from '../types/anamnesisTypes'

interface IdentificationStepProps {
  patientAvatarRef: React.RefObject<Group>
}

export default function IdentificationStep({ patientAvatarRef }: IdentificationStepProps) {
  const { anamnesisData, actions } = usePatient3DStore()
  const [formData, setFormData] = useState<PatientIdentification>(
    anamnesisData.identificacion || {
      nombre: '',
      apellidos: '',
      edad: 0,
      sexo: 'masculino',
      fechaNacimiento: '',
      documentoIdentidad: '',
      telefono: '',
      email: '',
      direccion: '',
      ocupacion: '',
      estadoCivil: '',
      nacionalidad: '',
      religion: ''
    }
  )

  useEffect(() => {
    // Actualizar el store cuando cambien los datos del formulario
    actions.updateAnamnesisData({ identificacion: formData })
  }, [formData, actions])

  const handleInputChange = (field: keyof PatientIdentification, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAutoFill = () => {
    // Simulación de autocompletado desde base de datos
    const mockData: PatientIdentification = {
      nombre: 'Juan Carlos',
      apellidos: 'González Martínez',
      edad: 45,
      sexo: 'masculino',
      fechaNacimiento: '1978-03-15',
      documentoIdentidad: 'DNI-12345678',
      telefono: '+34 612 345 678',
      email: 'juan.gonzalez@email.com',
      direccion: 'Calle Mayor 123, Madrid',
      ocupacion: 'Ingeniero Informático',
      estadoCivil: 'Casado',
      nacionalidad: 'Española',
      religion: 'Católica'
    }
    setFormData(mockData)
  }

  return (
    <div className="p-6 text-white">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-4">Identificación del Paciente</h2>
          <p className="text-blue-200 text-lg">
            Complete los datos personales y demográficos del paciente según el protocolo de Álvarez
          </p>
        </div>

        {/* Botón de autocompletado */}
        <div className="mb-6">
          <button
            onClick={handleAutoFill}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span>Cargar Datos del Paciente</span>
          </button>
        </div>

        {/* Formulario */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Datos personales básicos */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-blue-300 border-b border-blue-600 pb-2">
              Datos Personales
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">
                Nombre *
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => handleInputChange('nombre', e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-blue-400/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ingrese el nombre"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">
                Apellidos *
              </label>
              <input
                type="text"
                value={formData.apellidos}
                onChange={(e) => handleInputChange('apellidos', e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-blue-400/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ingrese los apellidos"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">
                  Edad *
                </label>
                <input
                  type="number"
                  value={formData.edad}
                  onChange={(e) => handleInputChange('edad', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-white/10 border border-blue-400/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Años"
                  min="0"
                  max="150"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">
                  Sexo *
                </label>
                <select
                  value={formData.sexo}
                  onChange={(e) => handleInputChange('sexo', e.target.value as 'masculino' | 'femenino' | 'otro')}
                  className="w-full px-4 py-3 bg-white/10 border border-blue-400/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="masculino">Masculino</option>
                  <option value="femenino">Femenino</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">
                Fecha de Nacimiento *
              </label>
              <input
                type="date"
                value={formData.fechaNacimiento}
                onChange={(e) => handleInputChange('fechaNacimiento', e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-blue-400/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">
                Documento de Identidad *
              </label>
              <input
                type="text"
                value={formData.documentoIdentidad}
                onChange={(e) => handleInputChange('documentoIdentidad', e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-blue-400/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="DNI, Pasaporte, etc."
              />
            </div>
          </div>

          {/* Información de contacto y social */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-blue-300 border-b border-blue-600 pb-2">
              Información de Contacto
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">
                Teléfono *
              </label>
              <input
                type="tel"
                value={formData.telefono}
                onChange={(e) => handleInputChange('telefono', e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-blue-400/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+34 612 345 678"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-blue-400/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="paciente@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">
                Dirección *
              </label>
              <textarea
                value={formData.direccion}
                onChange={(e) => handleInputChange('direccion', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-white/10 border border-blue-400/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Dirección completa"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">
                Ocupación
              </label>
              <input
                type="text"
                value={formData.ocupacion}
                onChange={(e) => handleInputChange('ocupacion', e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-blue-400/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Profesión u ocupación"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">
                  Estado Civil
                </label>
                <select
                  value={formData.estadoCivil}
                  onChange={(e) => handleInputChange('estadoCivil', e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-blue-400/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Seleccionar</option>
                  <option value="soltero">Soltero/a</option>
                  <option value="casado">Casado/a</option>
                  <option value="divorciado">Divorciado/a</option>
                  <option value="viudo">Viudo/a</option>
                  <option value="union_libre">Unión Libre</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">
                  Nacionalidad
                </label>
                <input
                  type="text"
                  value={formData.nacionalidad}
                  onChange={(e) => handleInputChange('nacionalidad', e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-blue-400/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nacionalidad"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">
                Religión
              </label>
              <input
                type="text"
                value={formData.religion}
                onChange={(e) => handleInputChange('religion', e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-blue-400/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Religión (opcional)"
              />
            </div>
          </div>
        </div>

        {/* Resumen de datos */}
        <div className="mt-8 p-6 bg-blue-900/30 rounded-lg border border-blue-600/30">
          <h3 className="text-xl font-semibold text-blue-300 mb-4">Resumen de Identificación</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-blue-200 font-medium">Nombre completo:</p>
              <p className="text-white">{formData.nombre} {formData.apellidos}</p>
            </div>
            <div>
              <p className="text-blue-200 font-medium">Edad y sexo:</p>
              <p className="text-white">{formData.edad} años, {formData.sexo}</p>
            </div>
            <div>
              <p className="text-blue-200 font-medium">Documento:</p>
              <p className="text-white">{formData.documentoIdentidad}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}