'use client'
import { useState } from 'react'
import { Html } from '@react-three/drei'
import { useAnamnesisStore, ConsentData } from '@/stores/anamnesisStore'

interface ConsentStepProps {
  position?: [number, number, number]
}

export function ConsentStep({ position = [0, 3, 0] }: ConsentStepProps) {
  const { consent, actions } = useAnamnesisStore()
  const [formData, setFormData] = useState<Partial<ConsentData>>({
    hasConsented: false,
    dataProcessingAgreement: false,
    telemedicineAgreement: false,
    consentType: 'full'
  })

  const handleSubmit = () => {
    if (formData.hasConsented && formData.dataProcessingAgreement && formData.telemedicineAgreement) {
      const consentData: ConsentData = {
        hasConsented: true,
        consentDate: new Date(),
        consentType: formData.consentType || 'full',
        dataProcessingAgreement: true,
        telemedicineAgreement: true
      }
      
      actions.setConsent(consentData)
      actions.nextStep()
    }
  }

  const isValid = formData.hasConsented && formData.dataProcessingAgreement && formData.telemedicineAgreement

  return (
    <Html
      position={position}
      distanceFactor={8}
      occlude={false}
      transform={false}
      sprite
      center
      className="consent-step"
    >
      <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-gray-200 p-6 max-w-md">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            🏥 Bienvenido a la Anamnesis Digital
          </h2>
          <p className="text-gray-600 text-sm">
            Para comenzar el proceso de evaluación médica, necesitamos su consentimiento para el tratamiento de datos y la realización de la consulta.
          </p>
        </div>

        <div className="space-y-4">
          {/* Main consent */}
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.hasConsented || false}
              onChange={(e) => setFormData({ ...formData, hasConsented: e.target.checked })}
              className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <div className="text-sm">
              <span className="font-medium text-gray-800">Consentimiento médico</span>
              <p className="text-gray-600 mt-1">
                Acepto participar en esta evaluación médica digital y proporcionar información sobre mi estado de salud.
              </p>
            </div>
          </label>

          {/* Data processing agreement */}
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.dataProcessingAgreement || false}
              onChange={(e) => setFormData({ ...formData, dataProcessingAgreement: e.target.checked })}
              className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <div className="text-sm">
              <span className="font-medium text-gray-800">Tratamiento de datos</span>
              <p className="text-gray-600 mt-1">
                Autorizo el tratamiento de mis datos personales y de salud conforme a la normativa RGPD.
              </p>
            </div>
          </label>

          {/* Telemedicine agreement */}
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.telemedicineAgreement || false}
              onChange={(e) => setFormData({ ...formData, telemedicineAgreement: e.target.checked })}
              className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <div className="text-sm">
              <span className="font-medium text-gray-800">Telemedicina</span>
              <p className="text-gray-600 mt-1">
                Comprendo que esta es una consulta de telemedicina y acepto sus limitaciones.
              </p>
            </div>
          </label>

          {/* Consent type selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Tipo de consentimiento:</label>
            <select
              value={formData.consentType || 'full'}
              onChange={(e) => setFormData({ ...formData, consentType: e.target.value as ConsentData['consentType'] })}
              className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="full">Consentimiento completo</option>
              <option value="partial">Consentimiento parcial</option>
              <option value="emergency">Consentimiento de emergencia</option>
            </select>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex space-x-3 mt-6">
          <button
            onClick={handleSubmit}
            disabled={!isValid}
            className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all ${
              isValid
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Comenzar Anamnesis
          </button>
        </div>

        {!isValid && (
          <p className="text-red-500 text-xs mt-2 text-center">
            Debe aceptar todos los consentimientos para continuar
          </p>
        )}

        {/* Legal notice */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Sus datos están protegidos por cifrado de extremo a extremo y cumplimos con RGPD y normativas sanitarias.
          </p>
        </div>
      </div>
    </Html>
  )
}
