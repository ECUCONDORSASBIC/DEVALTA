'use client'
import { Group } from 'three'

interface HabitosStepProps {
  patientAvatarRef: React.RefObject<Group>
}

export default function HabitosStep({ patientAvatarRef }: HabitosStepProps) {
  return (
    <div className="p-6 text-white">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-4">Hábitos y Estilo de Vida</h2>
          <p className="text-blue-200 text-lg">
            Hábitos tóxicos, ejercicio, alimentación y sueño según Álvarez
          </p>
        </div>
        
        <div className="bg-blue-900/30 rounded-lg p-8 border border-blue-600/30 text-center">
          <div className="animate-pulse">
            <div className="w-24 h-24 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Paso en Desarrollo</h3>
            <p className="text-blue-200">El paso de Hábitos será implementado próximamente</p>
          </div>
        </div>
      </div>
    </div>
  )
}