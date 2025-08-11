"use client";

import { useState } from 'react';
import ChatPanel from '../../../components/telemedicine/ChatPanel';
import DoctorVideoCall from '../../../components/telemedicine/DoctorVideoCall';
import SessionControls from '../../../components/telemedicine/SessionControls';

export default function TelemedicineTestPage() {
  const [isInCall, setIsInCall] = useState(false);
  const [roomId, setRoomId] = useState('test-room-123');
  const [patientId, setPatientId] = useState('patient-456');
  const [patientName, setPatientName] = useState('Carlos Rodríguez');

  const handleStartCall = () => {
    setIsInCall(true);
  };

  const handleEndCall = () => {
    setIsInCall(false);
  };

  const handleError = (error: string) => {
    console.error('Error en videollamada:', error);
    alert(`Error: ${error}`);
  };

  if (!isInCall) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              🏥 Prueba de Telemedicina
            </h1>
            <p className="text-gray-600">
              Simula una consulta médica virtual
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID de Sala
              </label>
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ingresa el ID de la sala"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID del Paciente
              </label>
              <input
                type="text"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="ID del paciente"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Paciente
              </label>
              <input
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nombre del paciente"
              />
            </div>

            <button
              onClick={handleStartCall}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              🎥 Iniciar Videollamada
            </button>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Instrucciones:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Asegúrate de permitir acceso a cámara y micrófono</li>
              <li>• Para probar la conexión, abre otra pestaña con la app de pacientes</li>
              <li>• Usa el mismo Room ID en ambas aplicaciones</li>
              <li>• Verifica que el servidor de señalización esté ejecutándose</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 flex">
      <div className="flex-1 flex flex-col">
        <DoctorVideoCall
          roomId={roomId}
          patientId={patientId}
          patientName={patientName}
          onEndCall={handleEndCall}
          onError={handleError}
        />
        <SessionControls
          sessionId={roomId}
          status="active"
        />
      </div>
      <div className="w-80 bg-white border-l border-gray-200">
        <ChatPanel
          sessionId={roomId}
        />
      </div>
    </div>
  );
} 