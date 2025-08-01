/**
 * Sistema Completo de Telemedicina
 * Socket.IO + Firebase + WebRTC + UI Completa
 * Altamedica - Demostración de integración completa
 */

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { useTelemedicineSessionHybrid } from '../../hooks/useTelemedicineSessionHybrid';
import { useWebRTCHybrid } from '../../hooks/useWebRTCHybrid';
import { useAuth } from '../../hooks/useAuth';

interface CompleteTelemedicineSystemProps {
  sessionId?: string;
  autoJoin?: boolean;
}

export function CompleteTelemedicineSystem({ 
  sessionId = 'complete-demo-session', 
  autoJoin = false 
}: CompleteTelemedicineSystemProps) {
  const { authState } = useAuth();
  
  // Hooks híbridos
  const telemedicineSession = useTelemedicineSessionHybrid();
  const {
    // Firebase State
    session,
    chatMessages,
    // Socket.IO State
    socket,
    isConnected,
    participants,
    currentVitals,
    // General State
    loading,
    error,
    // Methods
    joinSession,
    leaveSession,
    sendChatMessage,
    updateVitalSigns,
    toggleMedia
  } = telemedicineSession;

  // Hook WebRTC híbrido
  const webrtc = useWebRTCHybrid({
    sessionId,
    roomId: session?.roomId || sessionId,
    socket,
    userId: authState?.user?.id || 'demo-user',
    userType: authState?.user?.role as 'doctor' | 'patient' || 'patient',
    enableAudio: true,
    enableVideo: true,
    enableScreenShare: true,
    enableRecording: true
  });

  // Referencias para videos
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  // Estado local
  const [chatInput, setChatInput] = useState('');
  const [isVideoUIReady, setIsVideoUIReady] = useState(false);

  // Configurar streams de video en elementos HTML
  useEffect(() => {
    if (localVideoRef.current && webrtc.localStream) {
      localVideoRef.current.srcObject = webrtc.localStream;
      console.log('📹 Stream local asignado al elemento video');
    }
  }, [webrtc.localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && webrtc.remoteStream) {
      remoteVideoRef.current.srcObject = webrtc.remoteStream;
      console.log('📹 Stream remoto asignado al elemento video');
    }
  }, [webrtc.remoteStream]);

  // Auto-join si está habilitado
  useEffect(() => {
    if (autoJoin && authState?.user && !session && !loading) {
      handleJoinSession();
    }
  }, [autoJoin, authState?.user, session, loading]);

  // Marcar UI como lista cuando tengamos video local
  useEffect(() => {
    if (webrtc.hasLocalStream && !isVideoUIReady) {
      setIsVideoUIReady(true);
    }
  }, [webrtc.hasLocalStream, isVideoUIReady]);

  const handleJoinSession = async () => {
    try {
      await joinSession(sessionId);
    } catch (error) {
      console.error('Error joining session:', error);
    }
  };

  const handleLeaveSession = async () => {
    webrtc.cleanup();
    await leaveSession();
    setIsVideoUIReady(false);
  };

  const handleSendMessage = () => {
    if (chatInput.trim()) {
      sendChatMessage(chatInput);
      setChatInput('');
    }
  };

  const handleUpdateVitals = () => {
    // Simular signos vitales
    const vitals = {
      heartRate: Math.floor(Math.random() * 20) + 65,
      bloodPressure: {
        systolic: Math.floor(Math.random() * 40) + 110,
        diastolic: Math.floor(Math.random() * 20) + 70
      },
      temperature: Math.round((Math.random() * 2 + 36) * 10) / 10,
      oxygenSaturation: Math.floor(Math.random() * 5) + 95,
      timestamp: new Date()
    };
    updateVitalSigns(vitals);
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
            Debes iniciar sesión para usar el sistema de telemedicina.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          🏥 Sistema Completo de Telemedicina
        </h1>
        <p className="text-gray-600">
          Socket.IO + Firebase + WebRTC + UI Médica Completa
        </p>
        <div className="mt-2 text-sm text-gray-500">
          Usuario: {authState.user.firstName} ({authState.user.role}) | Sesión: {sessionId}
        </div>
      </div>

      {/* Error Display */}
      {(error || webrtc.error) && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-red-800">
              ❌ <strong>Error:</strong> {error || webrtc.error}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Video Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Video Principal */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>📹 Videollamada Médica</span>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    webrtc.isConnected ? 'bg-green-100 text-green-800' :
                    webrtc.isConnecting ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {webrtc.isConnected ? '🟢 CONECTADO' :
                     webrtc.isConnecting ? '🟡 CONECTANDO' :
                     '🔴 DESCONECTADO'}
                  </span>
                  
                  {webrtc.stats.quality && (
                    <span className={`px-2 py-1 rounded text-xs ${
                      webrtc.stats.quality === 'excellent' ? 'bg-green-100 text-green-800' :
                      webrtc.stats.quality === 'good' ? 'bg-blue-100 text-blue-800' :
                      webrtc.stats.quality === 'fair' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {webrtc.stats.quality.toUpperCase()}
                    </span>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Video Remoto (Doctor/Paciente) */}
                <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
                  <video
                    ref={remoteVideoRef}
                    className="w-full h-full object-cover"
                    autoPlay
                    playsInline
                    muted={false}
                  />
                  
                  {!webrtc.hasRemoteStream && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-white">
                      <div className="text-center">
                        <div className="text-4xl mb-2">👨‍⚕️</div>
                        <div className="text-lg">Esperando conexión...</div>
                        <div className="text-sm text-gray-300 mt-2">
                          {authState.user.role === 'patient' ? 'El doctor se unirá pronto' : 'Esperando al paciente'}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Video Local (Miniatura) */}
                  <div className="absolute top-4 right-4 w-32 h-24 bg-black rounded overflow-hidden border-2 border-white">
                    <video
                      ref={localVideoRef}
                      className="w-full h-full object-cover"
                      autoPlay
                      playsInline
                      muted
                    />
                    
                    {!webrtc.hasLocalStream && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-700 text-white text-xs">
                        📹 Sin video
                      </div>
                    )}
                  </div>
                </div>

                {/* Controles de Video */}
                <div className="flex justify-center gap-4">
                  <Button
                    onClick={webrtc.toggleAudio}
                    disabled={!webrtc.hasLocalStream}
                    className={`px-4 py-2 ${
                      webrtc.audioEnabled 
                        ? 'bg-green-500 hover:bg-green-600' 
                        : 'bg-red-500 hover:bg-red-600'
                    }`}
                  >
                    {webrtc.audioEnabled ? '🎤' : '🔇'} Audio
                  </Button>
                  
                  <Button
                    onClick={webrtc.toggleVideo}
                    disabled={!webrtc.hasLocalStream}
                    className={`px-4 py-2 ${
                      webrtc.videoEnabled 
                        ? 'bg-green-500 hover:bg-green-600' 
                        : 'bg-red-500 hover:bg-red-600'
                    }`}
                  >
                    {webrtc.videoEnabled ? '📹' : '📵'} Video
                  </Button>
                  
                  <Button
                    onClick={webrtc.toggleScreenShare}
                    disabled={!webrtc.hasLocalStream}
                    className={`px-4 py-2 ${
                      webrtc.screenShareEnabled 
                        ? 'bg-blue-500 hover:bg-blue-600' 
                        : 'bg-gray-500 hover:bg-gray-600'
                    }`}
                  >
                    {webrtc.screenShareEnabled ? '🖥️ Compartiendo' : '🖥️ Compartir'}
                  </Button>
                  
                  {authState.user.role === 'doctor' && (
                    <Button
                      onClick={webrtc.isRecording ? webrtc.stopRecording : webrtc.startRecording}
                      disabled={!webrtc.hasLocalStream}
                      className={`px-4 py-2 ${
                        webrtc.isRecording 
                          ? 'bg-red-500 hover:bg-red-600' 
                          : 'bg-purple-500 hover:bg-purple-600'
                      }`}
                    >
                      {webrtc.isRecording ? '⏹️ Detener' : '🔴 Grabar'}
                    </Button>
                  )}
                </div>

                {/* Estadísticas de Conexión */}
                {webrtc.isConnected && (
                  <div className="grid grid-cols-4 gap-4 text-sm bg-gray-50 p-3 rounded">
                    <div className="text-center">
                      <div className="font-medium text-blue-600">{Math.round(webrtc.stats.bitrate)} kbps</div>
                      <div className="text-gray-600">Bitrate</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-green-600">{webrtc.stats.latency.toFixed(0)} ms</div>
                      <div className="text-gray-600">Latencia</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-orange-600">{webrtc.stats.packetLoss.toFixed(1)}%</div>
                      <div className="text-gray-600">Pérdida</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-purple-600">
                        {webrtc.stats.resolution?.width}x{webrtc.stats.resolution?.height}
                      </div>
                      <div className="text-gray-600">Resolución</div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Panel Lateral */}
        <div className="space-y-6">
          
          {/* Estado de la Sesión */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">📊 Estado de la Sesión</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!session ? (
                <div className="text-center">
                  <Button 
                    onClick={handleJoinSession}
                    disabled={loading}
                    className="w-full mb-4"
                  >
                    {loading ? '⏳ Uniéndose...' : '🏥 Iniciar Sesión Médica'}
                  </Button>
                  <p className="text-sm text-gray-600">
                    Haz clic para unirte a la sesión de telemedicina
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Estado:</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      session.status === 'active' ? 'bg-green-100 text-green-800' :
                      session.status === 'waiting' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {session.status.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>Conexión:</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {isConnected ? 'CONECTADO' : 'DESCONECTADO'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>Participantes:</span>
                    <span className="font-medium">{participants.length}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>Duración:</span>
                    <span className="font-medium">
                      {session.startedAt ? 
                        `${Math.round((Date.now() - session.startedAt.getTime()) / 1000)}s` : 
                        '0s'
                      }
                    </span>
                  </div>
                  
                  <Button 
                    onClick={handleLeaveSession}
                    variant="destructive"
                    className="w-full"
                  >
                    🚪 Finalizar Sesión
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Signos Vitales */}
          {authState.user.role === 'patient' && session && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">❤️ Signos Vitales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentVitals && (
                    <div className="p-3 bg-blue-50 rounded border">
                      <div className="text-sm font-medium text-blue-800 mb-2">
                        Última actualización: {currentVitals.timestamp.toLocaleTimeString()}
                      </div>
                      <div className="space-y-1 text-sm">
                        <div>💓 FC: {currentVitals.heartRate} bpm</div>
                        <div>🩸 PA: {currentVitals.bloodPressure?.systolic}/{currentVitals.bloodPressure?.diastolic} mmHg</div>
                        <div>🌡️ Temp: {currentVitals.temperature}°C</div>
                        <div>🫁 SpO2: {currentVitals.oxygenSaturation}%</div>
                      </div>
                    </div>
                  )}
                  
                  <Button
                    onClick={handleUpdateVitals}
                    disabled={!isConnected}
                    className="w-full"
                    size="sm"
                  >
                    📊 Simular Signos Vitales
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Participantes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">👥 Participantes ({participants.length})</CardTitle>
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
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {participant.status === 'connected' ? '🟢' : '🔴'}
                    </span>
                  </div>
                ))}
                
                {participants.length === 0 && (
                  <p className="text-gray-500 text-sm text-center py-4">
                    No hay otros participantes
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Chat Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            💬 Chat Médico en Tiempo Real ({chatMessages.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-40 overflow-y-auto border rounded p-3 bg-gray-50">
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
                placeholder="Escribe un mensaje médico..."
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

      {/* Debug Info */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="text-sm text-gray-600">
            🔧 Información del Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <strong>Socket ID:</strong><br />
              {socket?.id || 'No conectado'}
            </div>
            <div>
              <strong>WebRTC Estado:</strong><br />
              {webrtc.connectionState}
            </div>
            <div>
              <strong>ICE Estado:</strong><br />
              {webrtc.iceConnectionState}
            </div>
            <div>
              <strong>Firebase Sync:</strong><br />
              {webrtc.sessionPersisted ? '✅ Sincronizado' : '⏳ Sincronizando'}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default CompleteTelemedicineSystem;