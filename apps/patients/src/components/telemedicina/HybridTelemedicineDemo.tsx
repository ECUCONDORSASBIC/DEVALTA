/**
 * Componente de Demostración - Telemedicina Híbrida
 * Socket.IO (Tiempo Real) + Firebase (Persistencia)
 * Altamedica - Fase 2 Implementation
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { useTelemedicineSessionHybrid } from '../../hooks/useTelemedicineSessionHybrid';
import { useAuth } from '../../hooks/useAuth';

interface HybridTelemedicineDemoProps {
  sessionId?: string;
}

export function HybridTelemedicineDemo({ sessionId = 'demo-session-123' }: HybridTelemedicineDemoProps) {
  const { authState } = useAuth();
  const {
    // Firebase State (Persistencia)
    session,
    chatMessages,
    
    // Socket.IO State (Tiempo Real)
    socket,
    isConnected,
    participants,
    currentVitals,
    
    // Estado General
    loading,
    error,
    
    // Métodos
    joinSession,
    leaveSession,
    sendChatMessage,
    updateVitalSigns,
    toggleMedia
  } = useTelemedicineSessionHybrid();

  const [chatInput, setChatInput] = useState('');
  const [mediaStates, setMediaStates] = useState({
    audio: true,
    video: true
  });

  // Estado para signos vitales simulados  
  const [vitalsInput, setVitalsInput] = useState({
    heartRate: 72,
    systolic: 120,
    diastolic: 80,
    temperature: 36.5,
    oxygenSaturation: 98
  });

  // Simular signos vitales cambiantes
  useEffect(() => {
    if (!session || session.status !== 'active') return;

    const interval = setInterval(() => {
      const newVitals = {
        heartRate: Math.floor(Math.random() * 20) + 60, // 60-80
        bloodPressure: {
          systolic: Math.floor(Math.random() * 40) + 110, // 110-150
          diastolic: Math.floor(Math.random() * 20) + 70   // 70-90
        },
        temperature: Math.round((Math.random() * 2 + 36) * 10) / 10, // 36.0-38.0
        oxygenSaturation: Math.floor(Math.random() * 5) + 95, // 95-100
        timestamp: new Date()
      };

      updateVitalSigns(newVitals);
    }, 30000); // Cada 30 segundos

    return () => clearInterval(interval);
  }, [session?.status, updateVitalSigns]);

  const handleJoinSession = () => {
    joinSession(sessionId);
  };

  const handleLeaveSession = () => {
    leaveSession();
  };

  const handleSendMessage = () => {
    if (chatInput.trim()) {
      sendChatMessage(chatInput);
      setChatInput('');
    }
  };

  const handleToggleMedia = (type: 'audio' | 'video') => {
    const newState = !mediaStates[type];
    setMediaStates(prev => ({ ...prev, [type]: newState }));
    toggleMedia(type, newState);
  };

  const handleUpdateVitals = () => {
    updateVitalSigns({
      heartRate: vitalsInput.heartRate,
      bloodPressure: {
        systolic: vitalsInput.systolic,
        diastolic: vitalsInput.diastolic
      },
      temperature: vitalsInput.temperature,
      oxygenSaturation: vitalsInput.oxygenSaturation,
      timestamp: new Date()
    });
  };

  if (!authState?.user) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center text-red-600">
            🔒 Autenticación Requerida
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-600">
            Debes iniciar sesión para usar la telemedicina.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🏥 Telemedicina Híbrida - Demo
        </h1>
        <p className="text-gray-600">
          Socket.IO (Tiempo Real) + Firebase (Persistencia)
        </p>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-red-800">
              ❌ <strong>Error:</strong> {error}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Estado de Conexión */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🔌 Estado de Conexión
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Socket.IO:</span>
                <span className={`px-2 py-1 rounded text-sm ${
                  isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {isConnected ? '✅ Conectado' : '❌ Desconectado'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span>Firebase:</span>
                <span className={`px-2 py-1 rounded text-sm ${
                  session ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {session ? '✅ Sincronizado' : '⏳ Esperando'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span>Usuario:</span>
                <span className="text-sm text-gray-600">
                  {authState.user.firstName} ({authState.user.role})
                </span>
              </div>
            </div>

            <div className="space-y-2">
              {!session ? (
                <Button 
                  onClick={handleJoinSession}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? '⏳ Uniéndose...' : '🏥 Unirse a Sesión'}
                </Button>
              ) : (
                <Button 
                  onClick={handleLeaveSession}
                  variant="destructive"
                  className="w-full"
                >
                  🚪 Salir de Sesión
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Información de Sesión */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📋 Información de Sesión
            </CardTitle>
          </CardHeader>
          <CardContent>
            {session ? (
              <div className="space-y-2 text-sm">
                <div><strong>ID:</strong> {session.id}</div>
                <div><strong>Estado:</strong> 
                  <span className={`ml-2 px-2 py-1 rounded text-xs ${
                    session.status === 'active' ? 'bg-green-100 text-green-800' :
                    session.status === 'waiting' ? 'bg-yellow-100 text-yellow-800' :
                    session.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {session.status.toUpperCase()}
                  </span>
                </div>
                <div><strong>Iniciada:</strong> {session.startedAt?.toLocaleTimeString() || 'No iniciada'}</div>
                <div><strong>Duración:</strong> {session.duration ? `${Math.round(session.duration / 1000)}s` : 'En curso'}</div>
                <div><strong>Participantes:</strong> {participants.length}</div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">
                No hay sesión activa
              </p>
            )}
          </CardContent>
        </Card>

        {/* Participantes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              👥 Participantes ({participants.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {participants.map((participant) => (
                <div key={participant.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <div className="font-medium text-sm">{participant.name}</div>
                    <div className="text-xs text-gray-500">{participant.role}</div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    participant.status === 'connected' ? 'bg-green-100 text-green-800' :
                    participant.status === 'waiting' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {participant.status}
                  </span>
                </div>
              ))}
              
              {participants.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-4">
                  No hay participantes conectados
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Chat en Tiempo Real */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              💬 Chat en Tiempo Real ({chatMessages.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-64 overflow-y-auto border rounded p-3 bg-gray-50">
                {chatMessages.map((message) => (
                  <div key={message.id} className="mb-3 p-2 bg-white rounded shadow-sm">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-sm text-blue-600">
                        {message.senderName}
                      </span>
                      <span className="text-xs text-gray-500">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-sm text-gray-800">{message.message}</div>
                  </div>
                ))}
                
                {chatMessages.length === 0 && (
                  <p className="text-gray-500 text-sm text-center py-8">
                    No hay mensajes aún. ¡Envía el primero!
                  </p>
                )}
              </div>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Escribe un mensaje..."
                  className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!isConnected || !session}
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!isConnected || !session || !chatInput.trim()}
                >
                  📤 Enviar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Signos Vitales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              ❤️ Signos Vitales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {currentVitals && (
                <div className="p-3 bg-blue-50 rounded border">
                  <div className="text-sm font-medium text-blue-800 mb-2">
                    Última Actualización: {currentVitals.timestamp.toLocaleTimeString()}
                  </div>
                  <div className="space-y-1 text-sm">
                    <div>💓 FC: {currentVitals.heartRate} bpm</div>
                    <div>🩸 PA: {currentVitals.bloodPressure?.systolic}/{currentVitals.bloodPressure?.diastolic} mmHg</div>
                    <div>🌡️ Temp: {currentVitals.temperature}°C</div>
                    <div>🫁 SpO2: {currentVitals.oxygenSaturation}%</div>
                  </div>
                </div>
              )}
              
              {authState.user.role === 'patient' && (
                <div className="space-y-2">
                  <div className="text-sm font-medium">Simular Valores:</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <input
                      type="number"
                      value={vitalsInput.heartRate}
                      onChange={(e) => setVitalsInput(prev => ({ ...prev, heartRate: Number(e.target.value) }))}
                      placeholder="FC"
                      className="px-2 py-1 border rounded"
                    />
                    <input
                      type="number"
                      value={vitalsInput.systolic}
                      onChange={(e) => setVitalsInput(prev => ({ ...prev, systolic: Number(e.target.value) }))}
                      placeholder="Sistólica"
                      className="px-2 py-1 border rounded"
                    />
                    <input
                      type="number"
                      value={vitalsInput.diastolic}
                      onChange={(e) => setVitalsInput(prev => ({ ...prev, diastolic: Number(e.target.value) }))}
                      placeholder="Diastólica"
                      className="px-2 py-1 border rounded"
                    />
                    <input
                      type="number"
                      step="0.1"
                      value={vitalsInput.temperature}
                      onChange={(e) => setVitalsInput(prev => ({ ...prev, temperature: Number(e.target.value) }))}
                      placeholder="Temp"
                      className="px-2 py-1 border rounded"
                    />
                  </div>
                  <Button
                    onClick={handleUpdateVitals}
                    disabled={!isConnected || !session}
                    className="w-full text-xs"
                    size="sm"
                  >
                    📊 Actualizar Signos
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Controles de Media */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🎥 Controles de Audio/Video
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => handleToggleMedia('audio')}
                disabled={!isConnected || !session}
                className={`px-6 py-3 ${
                  mediaStates.audio 
                    ? 'bg-green-500 hover:bg-green-600' 
                    : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {mediaStates.audio ? '🎤 Audio ON' : '🔇 Audio OFF'}
              </Button>
              
              <Button
                onClick={() => handleToggleMedia('video')}
                disabled={!isConnected || !session}
                className={`px-6 py-3 ${
                  mediaStates.video 
                    ? 'bg-green-500 hover:bg-green-600' 
                    : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {mediaStates.video ? '📹 Video ON' : '📵 Video OFF'}
              </Button>
            </div>
            
            <div className="mt-4 text-center text-sm text-gray-600">
              Los cambios se sincronizan en tiempo real con todos los participantes
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Información de Debug */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="text-sm text-gray-600">
            🔧 Información de Debug
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <strong>Socket ID:</strong><br />
              {socket?.id || 'No conectado'}
            </div>
            <div>
              <strong>Session ID:</strong><br />
              {sessionId}
            </div>
            <div>
              <strong>Mensajes Chat:</strong><br />
              {chatMessages.length}
            </div>
            <div>
              <strong>Tiempo Activo:</strong><br />
              {session?.startedAt ? `${Math.round((Date.now() - session.startedAt.getTime()) / 1000)}s` : '0s'}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default HybridTelemedicineDemo;