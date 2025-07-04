'use client'
import { Html } from '@react-three/drei'
import { useAnamnesisStore } from '@/stores/anamnesisStore'

interface ReviewStepProps {
  position?: [number, number, number]
}

export function ReviewStep({ position = [0, 3, 0] }: ReviewStepProps) {
  const { reviewData, isCompleted, actions } = useAnamnesisStore()

  const handleConfirm = () => {
    actions.confirmReview()
  }

  return (
    <Html
      position={position}
      distanceFactor={8}
      occlude={false}
      transform={false}
      sprite
      center
      className="review-step"
    >
      <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-gray-200 p-6 max-w-lg">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            📑 Revisión y Confirmación
          </h2>
          <p className="text-gray-600 text-sm">
            Revise toda la información antes de enviar su anamnesis.
          </p>
        </div>

        <div className="space-y-4">
          {/* Patient Summary */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Información Personal</h3>
            <p className="text-sm text-gray-600">
              {reviewData.patientSummary?.firstName} {reviewData.patientSummary?.lastName}, {reviewData.patientSummary?.age} años
            </p>
            <p className="text-xs text-gray-500">
              {reviewData.patientSummary?.email} | {reviewData.patientSummary?.phone}
            </p>
          </div>

          {/* Symptoms Summary */}
          {reviewData.symptomsSummary.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Síntomas Reportados</h3>
              <ul className="space-y-1">
                {reviewData.symptomsSummary.map(({ location, details }, index) => (
                  <li key={index} className="text-sm text-gray-600">
                    • {location.description}: Dolor {details.painType} de nivel {details.painLevel} 
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Doctor Notes */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Notas del doctor</label>
            <textarea
              value={reviewData.doctorNotes}
              onChange={(e) => actions.updateDoctorNotes(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={4}
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex space-x-3 mt-6">
          <button
            onClick={() => actions.previousStep()}
            className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-200 transition-colors"
          >
            Anterior
          </button>
          <button
            onClick={handleConfirm}
            disabled={isCompleted}
            className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all ${
              isCompleted
                ? 'bg-green-500 text-white cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
            }`}
          >
            Confirmar y Enviar
          </button>
        </div>

        {isCompleted && (
          <p className="text-green-600 text-sm mt-4 text-center">
            La anamnesis ha sido enviada exitosamente.
          </p>
        )}
      </div>
    </Html>
  )
}

