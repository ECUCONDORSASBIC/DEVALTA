'use client'
import { Group } from 'three'

interface EnfermedadActualStepProps {
  patientAvatarRef: React.RefObject<Group>
}

export default function EnfermedadActualStep({ patientAvatarRef }: EnfermedadActualStepProps) {
  return (
    <div className="p-6 text-white">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-4">Enfermedad Actual</h2>
          <p className="text-blue-200 text-lg">
            Historia detallada del problema actual según el protocolo de Álvarez
          </p>
        </div>
        
        <div className="bg-blue-900/30 rounded-lg p-8 border border-blue-600/30 text-center">
          <div className="animate-pulse">
            <div className="w-24 h-24 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Paso en Desarrollo</h3>
            <p className="text-blue-200">El paso de Enfermedad Actual será implementado próximamente</p>
          </div>
        </div>
      </div>
    </div>
  )
}