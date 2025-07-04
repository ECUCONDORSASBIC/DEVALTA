'use client'
import { useEffect, useState } from 'react'
import { Html } from '@react-three/drei'
import { useAnamnesisStore, PatientPersonalData } from '@/stores/anamnesisStore'

interface PersonalDataStepProps {
  position?: [number, number, number]
}

export function PersonalDataStep({ position = [0, 3, 0] }: PersonalDataStepProps) {
  const { personalData, isLoadingPersonalData, actions } = useAnamnesisStore()
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<Partial<PatientPersonalData>>({})

  // Auto-load data when component mounts
  useEffect(() => {
    if (!personalData && !isLoadingPersonalData) {
      actions.loadPersonalDataFromAPI('patient_123')
    }
  }, [personalData, isLoadingPersonalData, actions])

  const handleEdit = () => {
    setEditData(personalData || {})
    setIsEditing(true)
  }

  const handleSave = () => {
    if (editData) {
      actions.updatePersonalData(editData)
    }
    setIsEditing(false)
    actions.nextStep()
  }

  const handleCancel = () => {
    setEditData({})
    setIsEditing(false)
  }

  const handleContinue = () => {
    actions.nextStep()
  }

  if (isLoadingPersonalData) {
    return (
      <Html
        position={position}
        distanceFactor={8}
        occlude={false}
        transform={false}
        sprite
        center
        className="personal-data-step"
      >
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-gray-200 p-6 max-w-md">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Cargando datos del paciente</h3>
            <p className="text-gray-600 text-sm">Obteniendo información desde el sistema...</p>
          </div>
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
      className="personal-data-step"
    >
      <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-gray-200 p-6 max-w-lg">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            👤 Datos Personales
          </h2>
          <p className="text-gray-600 text-sm">
            Revise y confirme sus datos personales. Puede editarlos si necesita hacer alguna corrección.
          </p>
        </div>

        {personalData && !isEditing && (
          <div className="space-y-4">
            {/* Personal Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Nombre</label>
                <p className="text-sm font-medium text-gray-800">{personalData.firstName}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Apellidos</label>
                <p className="text-sm font-medium text-gray-800">{personalData.lastName}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Edad</label>
                <p className="text-sm font-medium text-gray-800">{personalData.age} años</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Género</label>
                <p className="text-sm font-medium text-gray-800 capitalize">{personalData.gender}</p>
              </div>
            </div>

            {/* Contact Information */}
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Información de contacto</h3>
              <div className="space-y-2">
                <div>
                  <label className="text-xs font-medium text-gray-500">Email</label>
                  <p className="text-sm text-gray-800">{personalData.email}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Teléfono</label>
                  <p className="text-sm text-gray-800">{personalData.phone}</p>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Contacto de emergencia</h3>
              <div className="space-y-2">
                <div>
                  <label className="text-xs font-medium text-gray-500">Nombre</label>
                  <p className="text-sm text-gray-800">{personalData.emergencyContact.name}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500">Teléfono</label>
                    <p className="text-sm text-gray-800">{personalData.emergencyContact.phone}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500">Relación</label>
                    <p className="text-sm text-gray-800">{personalData.emergencyContact.relationship}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Medical History */}
            {personalData.medicalHistory && personalData.medicalHistory.length > 0 && (
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Antecedentes médicos</h3>
                <ul className="space-y-1">
                  {personalData.medicalHistory.map((item, index) => (
                    <li key={index} className="text-sm text-gray-600">• {item}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Allergies */}
            {personalData.allergies && personalData.allergies.length > 0 && (
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Alergias</h3>
                <div className="flex flex-wrap gap-2">
                  {personalData.allergies.map((allergy, index) => (
                    <span key={index} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                      {allergy}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Current Medications */}
            {personalData.currentMedications && personalData.currentMedications.length > 0 && (
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Medicación actual</h3>
                <ul className="space-y-1">
                  {personalData.currentMedications.map((medication, index) => (
                    <li key={index} className="text-sm text-gray-600">• {medication}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleEdit}
                className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-200 transition-colors"
              >
                Editar datos
              </button>
              <button
                onClick={handleContinue}
                className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {isEditing && (
          <div className="space-y-4">
            {/* Edit form */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  value={editData.firstName || ''}
                  onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Apellidos</label>
                <input
                  type="text"
                  value={editData.lastName || ''}
                  onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Edad</label>
                <input
                  type="number"
                  value={editData.age || ''}
                  onChange={(e) => setEditData({ ...editData, age: parseInt(e.target.value) })}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Género</label>
                <select
                  value={editData.gender || ''}
                  onChange={(e) => setEditData({ ...editData, gender: e.target.value as PatientPersonalData['gender'] })}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="male">Masculino</option>
                  <option value="female">Femenino</option>
                  <option value="other">Otro</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={editData.email || ''}
                onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Teléfono</label>
              <input
                type="tel"
                value={editData.phone || ''}
                onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Action buttons */}
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleCancel}
                className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
              >
                Guardar y continuar
              </button>
            </div>
          </div>
        )}
      </div>
    </Html>
  )
}
