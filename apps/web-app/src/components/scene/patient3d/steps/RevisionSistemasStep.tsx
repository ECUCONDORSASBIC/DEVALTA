'use client'
import { Group } from 'three'

interface RevisionSistemasStepProps {
  patientAvatarRef: React.RefObject<Group>
}

export default function RevisionSistemasStep({ patientAvatarRef }: RevisionSistemasStepProps) {
  return (
    <div className="p-6 text-white">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-4">Revisión por Sistemas</h2>
          <p className="text-blue-200 text-lg">
            Exploración sistemática de todos los sistemas corporales según Álvarez
          </p>
        </div>
        
        <div className="bg-blue-900/30 rounded-lg p-8 border border-blue-600/30 text-center">
          <div className="animate-pulse">
            <div className="w-24 h-24 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Paso en Desarrollo</h3>
            <p className="text-blue-200">El paso de Revisión por Sistemas será implementado próximamente</p>
          </div>
        </div>
      </div>
    </div>
  )
}