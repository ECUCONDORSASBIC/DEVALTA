'use client'
import { Group } from 'three'

interface SocialesStepProps {
  patientAvatarRef: React.RefObject<Group>
}

export default function SocialesStep({ patientAvatarRef }: SocialesStepProps) {
  return (
    <div className="p-6 text-white">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-4">Antecedentes Sociales</h2>
          <p className="text-blue-200 text-lg">
            Contexto social, laboral y ambiental según Álvarez
          </p>
        </div>
        
        <div className="bg-blue-900/30 rounded-lg p-8 border border-blue-600/30 text-center">
          <div className="animate-pulse">
            <div className="w-24 h-24 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Paso en Desarrollo</h3>
            <p className="text-blue-200">El paso de Antecedentes Sociales será implementado próximamente</p>
          </div>
        </div>
      </div>
    </div>
  )
}