import { useState } from 'react'
import { HistoriaInteractiva } from './HistoriaInteractiva'
import { PreguntaInteractiva } from './PreguntaInteractiva'
import { LogrosComponent } from './LogrosComponent'
import { ResumenAnamnesis } from './ResumenAnamnesis'
import { HistoriaMedicaComponent } from './HistoriaMedicaComponent'

const SECCIONES = [
  { key: 'motivo', label: 'Motivo de consulta' },
  { key: 'enfermedad_actual', label: 'Enfermedad actual' },
  { key: 'antecedentes', label: 'Antecedentes personales y familiares' },
  { key: 'habitos', label: 'Hábitos y entorno' },
  { key: 'revision', label: 'Revisión por aparatos y sistemas' },
  { key: 'medicacion', label: 'Medicaciones, alergias y cirugías' },
  { key: 'resumen', label: 'Resumen final' }
]

export default function AnamnesisExhaustiva({ pacienteId, onComplete, onClose }: { pacienteId: string, onComplete: (data: any) => void, onClose: () => void }) {
  const [paso, setPaso] = useState(0)
  const [respuestas, setRespuestas] = useState<any>({})
  const [logros, setLogros] = useState<string[]>([])

  const handleSiguiente = (data: any) => {
    setRespuestas((prev: any) => ({ ...prev, ...data }))
    if (paso < SECCIONES.length - 1) {
      setPaso(paso + 1)
    } else {
      onComplete({ ...respuestas, ...data })
    }
  }

  const handleAnterior = () => {
    if (paso > 0) setPaso(paso - 1)
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6 relative">
      <div className="mb-4 flex items-center gap-2">
        <button onClick={onClose} className="text-gray-400 hover:text-red-600 text-2xl absolute top-4 right-4">×</button>
        <h2 className="text-xl font-bold">Anamnesis Exhaustiva</h2>
        <span className="ml-2 text-sm text-blue-600">{SECCIONES[paso].label}</span>
      </div>
      <div className="mb-6">
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${((paso+1)/SECCIONES.length)*100}%` }}></div>
        </div>
      </div>
      <div className="mb-6">
        {SECCIONES[paso].key === 'motivo' && (
          <PreguntaInteractiva
            pregunta="¿Cuál es el motivo principal de consulta?"
            onRespuesta={(respuesta) => handleSiguiente({ motivo: respuesta })}
            onAtras={handleAnterior}
            autoFocus
          />
        )}
        {SECCIONES[paso].key === 'enfermedad_actual' && (
          <HistoriaInteractiva
            pacienteId={pacienteId}
            tipo="enfermedad_actual"
            onComplete={(data) => handleSiguiente({ enfermedad_actual: data })}
            onAtras={handleAnterior}
          />
        )}
        {SECCIONES[paso].key === 'antecedentes' && (
          <HistoriaMedicaComponent
            pacienteId={pacienteId}
            onComplete={(data) => handleSiguiente({ antecedentes: data })}
            onAtras={handleAnterior}
          />
        )}
        {SECCIONES[paso].key === 'habitos' && (
          <PreguntaInteractiva
            pregunta="Describe tus hábitos (alimentación, sueño, actividad física, consumo de sustancias, etc.)"
            onRespuesta={(respuesta) => handleSiguiente({ habitos: respuesta })}
            onAtras={handleAnterior}
          />
        )}
        {SECCIONES[paso].key === 'revision' && (
          <PreguntaInteractiva
            pregunta="¿Presentas síntomas en algún aparato o sistema? (Respiratorio, digestivo, cardiovascular, urinario, etc.)"
            onRespuesta={(respuesta) => handleSiguiente({ revision: respuesta })}
            onAtras={handleAnterior}
          />
        )}
        {SECCIONES[paso].key === 'medicacion' && (
          <PreguntaInteractiva
            pregunta="¿Tomas alguna medicación? ¿Tienes alergias o cirugías previas?"
            onRespuesta={(respuesta) => handleSiguiente({ medicacion: respuesta })}
            onAtras={handleAnterior}
          />
        )}
        {SECCIONES[paso].key === 'resumen' && (
          <ResumenAnamnesis
            respuestas={respuestas}
            onFinalizar={() => onComplete(respuestas)}
            onAtras={handleAnterior}
          />
        )}
      </div>
      <div className="mt-4">
        <LogrosComponent logros={logros} />
      </div>
    </div>
  )
} 