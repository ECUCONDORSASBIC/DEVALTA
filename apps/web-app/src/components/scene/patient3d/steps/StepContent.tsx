'use client'
import { Group } from 'three'
import { AnamnesisStep } from '../types/anamnesisTypes'
import IdentificationStep from './IdentificationStep'
import MotivoConsultaStep from './MotivoConsultaStep'
import EnfermedadActualStep from './EnfermedadActualStep'
import AntecedentesStep from './AntecedentesStep'
import RevisionSistemasStep from './RevisionSistemasStep'
import HabitosStep from './HabitosStep'
import FamiliaresStep from './FamiliaresStep'
import SocialesStep from './SocialesStep'
import ExamenFisicoStep from './ExamenFisicoStep'
import ConclusionesStep from './ConclusionesStep'

interface StepContentProps {
  step: AnamnesisStep | undefined
  patientAvatarRef: React.RefObject<Group>
}

export default function StepContent({ step, patientAvatarRef }: StepContentProps) {
  if (!step) {
    return (
      <div className="flex items-center justify-center h-full text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Cargando paso de anamnesis...</p>
        </div>
      </div>
    )
  }

  const renderStepContent = () => {
    switch (step.category) {
      case 'identificacion':
        return <IdentificationStep patientAvatarRef={patientAvatarRef} />
      
      case 'motivo':
        return <MotivoConsultaStep patientAvatarRef={patientAvatarRef} />
      
      case 'enfermedad_actual':
        return <EnfermedadActualStep patientAvatarRef={patientAvatarRef} />
      
      case 'antecedentes':
        return <AntecedentesStep patientAvatarRef={patientAvatarRef} />
      
      case 'revision_sistemas':
        return <RevisionSistemasStep patientAvatarRef={patientAvatarRef} />
      
      case 'habitos':
        return <HabitosStep patientAvatarRef={patientAvatarRef} />
      
      case 'familiares':
        return <FamiliaresStep patientAvatarRef={patientAvatarRef} />
      
      case 'sociales':
        return <SocialesStep patientAvatarRef={patientAvatarRef} />
      
      case 'examen_fisico':
        return <ExamenFisicoStep patientAvatarRef={patientAvatarRef} />
      
      case 'conclusiones':
        return <ConclusionesStep patientAvatarRef={patientAvatarRef} />
      
      default:
        return (
          <div className="flex items-center justify-center h-full text-white">
            <div className="text-center">
              <p className="text-xl font-bold mb-2">Paso no implementado</p>
              <p className="text-gray-300">{step.title}</p>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="h-full overflow-y-auto">
      {renderStepContent()}
    </div>
  )
}