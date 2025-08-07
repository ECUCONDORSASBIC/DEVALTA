// 🤖 Ejemplo de página con agentes de IA
// Archivo: apps/doctors/src/app/ai-assistant/page.tsx

'use client';

import { useState } from 'react';
import { useDoctorAI } from '@altamedica/hooks';
import { Button } from '@altamedica/ui';

export default function AIAssistantPage() {
  const {
    isLoading,
    error,
    activeJobs,
    clearError,
    diagnosePatient,
    generateTreatmentPlan,
    emergencyAnalysis
  } = useDoctorAI();

  const [patientId, setPatientId] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [results, setResults] = useState<any[]>([]);

  const handleDiagnosis = async () => {
    if (!patientId || !symptoms) return;

    try {
      const symptomsList = symptoms.split(',').map(s => s.trim());
      const { analysisJob, recordJob } = await diagnosePatient(
        patientId,
        symptomsList,
        [] // médical history - obtener de la base de datos
      );

      setResults(prev => [...prev, {
        type: 'Diagnóstico iniciado',
        jobs: [analysisJob, recordJob],
        timestamp: new Date().toLocaleString()
      }]);

    } catch (err) {
      console.error('Error en diagnóstico:', err);
    }
  };

  const handleEmergency = async () => {
    if (!patientId || !symptoms) return;

    try {
      const symptomsList = symptoms.split(',').map(s => s.trim());
      const result = await emergencyAnalysis(patientId, symptomsList);

      setResults(prev => [...prev, {
        type: 'Análisis de Emergencia',
        result: result.result,
        timestamp: new Date().toLocaleString()
      }]);

    } catch (err) {
      console.error('Error en análisis de emergencia:', err);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">🤖 Asistente de IA Médica</h1>

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
          <button 
            onClick={clearError}
            className="text-sm underline"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Input Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Datos del Paciente</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              ID del Paciente
            </label>
            <input
              type="text"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="Ej: patient_123"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Síntomas (separados por coma)
            </label>
            <input
              type="text"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="Ej: dolor abdominal, náuseas, fiebre"
            />
          </div>
        </div>

        <div className="flex gap-4 mt-4">
          <Button
            onClick={handleDiagnosis}
            disabled={isLoading || !patientId || !symptoms}
            variant="primary"
          >
            {isLoading ? '🔄 Analizando...' : '🩺 Diagnóstico Completo'}
          </Button>

          <Button
            onClick={handleEmergency}
            disabled={isLoading || !patientId || !symptoms}
            variant="destructive"
          >
            {isLoading ? '🔄 Analizando...' : '🚨 Análisis de Emergencia'}
          </Button>
        </div>
      </div>

      {/* Active Jobs */}
      {activeJobs.length > 0 && (
        <div className="bg-blue-50 p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">📊 Jobs Activos</h2>
          <div className="space-y-2">
            {activeJobs.map(job => (
              <div key={job.id} className="flex justify-between items-center p-3 bg-white rounded">
                <div>
                  <span className="font-medium">{job.type}</span>
                  <span className="text-sm text-gray-500 ml-2">
                    Paciente: {job.patientId}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={job.status} />
                  <span className="text-xs text-gray-400">
                    {job.id.substring(0, 8)}...
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="bg-green-50 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">📋 Resultados de IA</h2>
          <div className="space-y-4">
            {results.map((result, index) => (
              <div key={index} className="p-4 bg-white rounded border">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">{result.type}</h3>
                  <span className="text-sm text-gray-500">{result.timestamp}</span>
                </div>
                
                {result.result && (
                  <div className="mt-2">
                    <h4 className="font-medium text-sm mb-1">Resultado:</h4>
                    <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto">
                      {JSON.stringify(result.result, null, 2)}
                    </pre>
                  </div>
                )}

                {result.jobs && (
                  <div className="mt-2">
                    <h4 className="font-medium text-sm mb-1">Jobs creados:</h4>
                    <div className="space-y-1">
                      {result.jobs.map((job: any) => (
                        <div key={job.id} className="text-sm flex justify-between">
                          <span>{job.type}</span>
                          <span className="text-gray-500">{job.id.substring(0, 8)}...</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Agents Info */}
      <div className="mt-8 bg-gray-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">🤖 Agentes Disponibles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AgentCard 
            title="📋 Resumen Médico"
            description="Analiza y resume el historial médico completo del paciente"
            type="summarize_medical_record"
          />
          <AgentCard 
            title="🔍 Análisis de Síntomas"
            description="Evalúa síntomas y sugiere posibles diagnósticos"
            type="analyze_symptoms"
          />
          <AgentCard 
            title="💊 Generación de Recetas"
            description="Genera prescripciones basadas en el diagnóstico"
            type="generate_prescription"
          />
          <AgentCard 
            title="🧪 Análisis de Laboratorio"
            description="Interpreta resultados de estudios de laboratorio"
            type="analyze_lab_results"
          />
          <AgentCard 
            title="📝 Plan de Tratamiento"
            description="Crea planes de tratamiento personalizados"
            type="generate_treatment_plan"
          />
          <AgentCard 
            title="⚠️ Evaluación de Riesgos"
            description="Evalúa riesgos médicos del paciente"
            type="medical_risk_assessment"
          />
        </div>
      </div>
    </div>
  );
}

// Componentes auxiliares
function StatusBadge({ status }: { status: string }) {
  const statusConfig = {
    queued: { color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
    processing: { color: 'bg-blue-100 text-blue-800', icon: '🔄' },
    completed: { color: 'bg-green-100 text-green-800', icon: '✅' },
    failed: { color: 'bg-red-100 text-red-800', icon: '❌' },
    cancelled: { color: 'bg-gray-100 text-gray-800', icon: '🚫' }
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.queued;

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${config.color}`}>
      {config.icon} {status}
    </span>
  );
}

function AgentCard({ title, description, type }: { 
  title: string; 
  description: string; 
  type: string; 
}) {
  return (
    <div className="p-4 bg-white rounded border">
      <h3 className="font-medium mb-2">{title}</h3>
      <p className="text-sm text-gray-600 mb-2">{description}</p>
      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
        {type}
      </code>
    </div>
  );
}
