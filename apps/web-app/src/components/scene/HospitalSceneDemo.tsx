'use client'
import { useEffect } from 'react'
import HospitalScene from './HospitalScene'
import { useAnamnesis, useSceneControls } from './contexts'

// Control panel component
function SceneControlPanel() {
  const { state: anamnesisState, actions: anamnesisActions } = useAnamnesis()
  const { state: sceneState, actions: sceneActions } = useSceneControls()

  // Start anamnesis session on mount
  useEffect(() => {
    if (!anamnesisState.isInProgress) {
      anamnesisActions.startAnamnesis('patient_123', 'doctor_456')
    }
  }, [anamnesisState.isInProgress, anamnesisActions])

  return (
    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg max-w-xs z-10">
      <h3 className="font-semibold mb-3">Controles de Escena</h3>
      
      {/* Scene Controls */}
      <div className="space-y-3">
        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={sceneState.scene.showVitals}
              onChange={() => sceneActions.updateSceneSettings({ 
                showVitals: !sceneState.scene.showVitals 
              })}
            />
            <span className="text-sm">Mostrar Vitales</span>
          </label>
        </div>
        
        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={sceneState.scene.enableShadows}
              onChange={() => sceneActions.toggleShadows()}
            />
            <span className="text-sm">Sombras</span>
          </label>
        </div>
        
        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={sceneState.animations.isAnimationPlaying}
              onChange={() => sceneActions.toggleAnimationPlaying()}
            />
            <span className="text-sm">Animaciones</span>
          </label>
        </div>
        
        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={sceneState.debug.enabled}
              onChange={() => sceneActions.toggleDebug()}
            />
            <span className="text-sm">Modo Debug</span>
          </label>
        </div>
      </div>

      {/* Animation Controls */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <h4 className="text-sm font-medium mb-2">Animaciones</h4>
        <div className="space-y-2">
          <div>
            <label className="text-xs text-gray-600">Paciente:</label>
            <select 
              value={sceneState.animations.patientAnimation}
              onChange={(e) => sceneActions.setPatientAnimation(e.target.value)}
              className="w-full text-xs border rounded px-1 py-1"
            >
              <option value="idle">Reposo</option>
              <option value="breathing">Respirando</option>
              <option value="coughing">Tosiendo</option>
            </select>
          </div>
          
          <div>
            <label className="text-xs text-gray-600">Doctor:</label>
            <select 
              value={sceneState.animations.doctorAnimation}
              onChange={(e) => sceneActions.setDoctorAnimation(e.target.value)}
              className="w-full text-xs border rounded px-1 py-1"
            >
              <option value="examining">Examinando</option>
              <option value="writing">Escribiendo</option>
              <option value="talking">Hablando</option>
            </select>
          </div>
        </div>
      </div>

      {/* Device Optimization */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <h4 className="text-sm font-medium mb-2">Optimización</h4>
        <div className="space-x-1">
          <button
            onClick={() => sceneActions.optimizeForDevice('mobile')}
            className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
          >
            Móvil
          </button>
          <button
            onClick={() => sceneActions.optimizeForDevice('desktop')}
            className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded"
          >
            Escritorio
          </button>
        </div>
      </div>
    </div>
  )
}

// Anamnesis progress panel
function AnamnesisPanel() {
  const { state: anamnesisState, actions: anamnesisActions } = useAnamnesis()

  if (!anamnesisState.isInProgress) return null

  return (
    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg max-w-xs z-10">
      <h3 className="font-semibold mb-3">Progreso de Anamnesis</h3>
      
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm">
            <span>Paso {anamnesisState.currentStep + 1} de {anamnesisState.totalSteps}</span>
            <span>{Math.round(anamnesisState.progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${anamnesisState.progress}%` }}
            />
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium">
            {anamnesisState.steps[anamnesisState.currentStep]?.title}
          </h4>
          <p className="text-xs text-gray-600">
            {anamnesisState.steps[anamnesisState.currentStep]?.description}
          </p>
        </div>

        {/* Quick actions */}
        <div className="flex space-x-2">
          <button
            onClick={anamnesisActions.previousStep}
            disabled={anamnesisState.currentStep === 0}
            className="flex-1 text-xs bg-gray-200 text-gray-700 py-2 px-3 rounded disabled:opacity-50"
          >
            Anterior
          </button>
          <button
            onClick={anamnesisActions.nextStep}
            disabled={anamnesisState.currentStep === anamnesisState.totalSteps - 1}
            className="flex-1 text-xs bg-blue-600 text-white py-2 px-3 rounded disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>

        {/* Vital signs */}
        {Object.keys(anamnesisState.patientVitals).length > 0 && (
          <div className="pt-3 border-t border-gray-200">
            <h4 className="text-sm font-medium mb-2">Signos Vitales</h4>
            <div className="text-xs space-y-1">
              {anamnesisState.patientVitals.heartRate && (
                <div className="flex justify-between">
                  <span>Pulso:</span>
                  <span>{anamnesisState.patientVitals.heartRate} bpm</span>
                </div>
              )}
              {anamnesisState.patientVitals.bloodPressure && (
                <div className="flex justify-between">
                  <span>PA:</span>
                  <span>
                    {anamnesisState.patientVitals.bloodPressure.systolic}/
                    {anamnesisState.patientVitals.bloodPressure.diastolic} mmHg
                  </span>
                </div>
              )}
              {anamnesisState.patientVitals.temperature && (
                <div className="flex justify-between">
                  <span>Temp:</span>
                  <span>{anamnesisState.patientVitals.temperature}°C</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        {anamnesisState.currentExamination.notes.length > 0 && (
          <div className="pt-3 border-t border-gray-200">
            <h4 className="text-sm font-medium mb-2">Notas</h4>
            <div className="text-xs space-y-1 max-h-20 overflow-y-auto">
              {anamnesisState.currentExamination.notes.map((note, index) => (
                <div key={index} className="text-gray-600">• {note}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Main demo component
export default function HospitalSceneDemo() {
  return (
    <div className="relative w-full h-screen bg-gray-900">
      {/* 3D Scene */}
      <HospitalScene />
      
      {/* Control Panels */}
      <SceneControlPanel />
      <AnamnesisPanel />
      
      {/* Instructions */}
      <div className="absolute bottom-4 left-4 bg-black/50 text-white rounded-lg p-3 max-w-md text-sm">
        <h4 className="font-medium mb-2">Controles:</h4>
        <ul className="space-y-1 text-xs">
          <li>• Click y arrastra para rotar la cámara</li>
          <li>• Rueda del mouse para hacer zoom</li>
          <li>• Click en dispositivos médicos para interactuar</li>
          <li>• Usa los paneles de control para personalizar la escena</li>
        </ul>
      </div>
    </div>
  )
}
