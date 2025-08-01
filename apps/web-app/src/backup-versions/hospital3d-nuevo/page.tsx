'use client'
import React, { useState, useRef, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, useGLTF } from '@react-three/drei'
import { AnamnesisInteractivaAvanzada } from '../../components/anamnesis/AnamnesisInteractivaAvanzada'
import { ResumenAnamnesis } from '../../components/anamnesis/ResumenAnamnesis'
import { RespuestaAnamnesis } from '../../types/anamnesis.types'

function HospitalModel() {
  const { scene } = useGLTF('/models/hospital.glb')
  return <primitive object={scene} />
}

export default function Hospital3DPage() {
  const [mostrarAnamnesis, setMostrarAnamnesis] = useState(false)
  const [mostrarResumen, setMostrarResumen] = useState(false)
  const [respuestasAnamnesis, setRespuestasAnamnesis] = useState<Record<string, RespuestaAnamnesis>>({})
  const [puntosTotal, setPuntosTotal] = useState(0)
  const [logrosObtenidos, setLogrosObtenidos] = useState<string[]>([])
  const [tiempoTotal, setTiempoTotal] = useState(0)

  const handleCompletarAnamnesis = (respuestas: Record<string, RespuestaAnamnesis>) => {
    setRespuestasAnamnesis(respuestas)
    
    // Calcular puntos totales
    const puntos = Object.values(respuestas).reduce((acc, resp) => acc + (resp.puntosObtenidos || 0), 0)
    setPuntosTotal(puntos)
    
    // Simular logros obtenidos
    setLogrosObtenidos(['primer-paso', 'explorador', 'detective'])
    
    // Calcular tiempo total
    const tiempo = Object.values(respuestas).reduce((acc, resp) => acc + resp.tiempoRespuesta, 0)
    setTiempoTotal(tiempo)
    
    setMostrarAnamnesis(false)
    setMostrarResumen(true)
  }

  return (
    <div className="relative w-full h-screen">
      {/* Escena 3D de fondo */}
      <Canvas
        camera={{ position: [0, 5, 10], fov: 75 }}
        style={{ background: 'linear-gradient(to bottom, #87CEEB, #98FB98)' }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <HospitalModel />
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
        <Environment preset="sunset" />
      </Canvas>

      {/* Overlay de controles */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            🏥 Hospital 3D - Altamedica
          </h1>
          
          <div className="space-y-3">
            <button
              onClick={() => setMostrarAnamnesis(true)}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              🩺 Iniciar Anamnesis Interactiva
            </button>
            
            <button
              onClick={() => setMostrarResumen(true)}
              className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              �� Ver Resumen Médico
            </button>
          </div>

          {/* Información del paciente */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">👤 Paciente Demo</h3>
            <p className="text-sm text-blue-700">
              Nombre: Juan Pérez<br/>
              Edad: 35 años<br/>
              Motivo: Dolor de cabeza
            </p>
          </div>
        </div>
      </div>

      {/* Anamnesis Interactiva */}
      {mostrarAnamnesis && (
        <AnamnesisInteractivaAvanzada
          onComplete={handleCompletarAnamnesis}
          onClose={() => setMostrarAnamnesis(false)}
          pacienteId="demo-123"
        />
      )}

      {/* Resumen de Anamnesis */}
      {mostrarResumen && Object.keys(respuestasAnamnesis).length > 0 && (
        <ResumenAnamnesis
          respuestas={respuestasAnamnesis}
          puntosTotal={puntosTotal}
          logrosObtenidos={logrosObtenidos}
          tiempoTotal={tiempoTotal}
          onCerrar={() => setMostrarResumen(false)}
        />
      )}

      {/* Instrucciones flotantes */}
      <div className="absolute bottom-4 right-4 z-10">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg max-w-sm">
          <h3 className="font-semibold text-gray-800 mb-2">💡 Instrucciones</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Usa el mouse para rotar la vista</li>
            <li>• Scroll para hacer zoom</li>
            <li>• Haz clic en "Iniciar Anamnesis" para comenzar</li>
            <li>• Completa todas las preguntas para obtener puntos</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

useGLTF.preload('/models/hospital.glb')