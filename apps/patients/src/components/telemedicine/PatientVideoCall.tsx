"use client";

import React, { useRef, useEffect, useState } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  Phone,
  PhoneOff,
  Settings,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  AlertCircle,
  X,
  Circle,
  Square,
  Download,
  Stethoscope,
  FileText,
  Camera,
  MessageSquare
} from 'lucide-react';
import { useWebRTC, WebRTCConfig } from '../../hooks/useWebRTC';

interface PatientVideoCallProps {
  roomId: string;
  doctorId: string;
  doctorName: string;
  onEndCall: () => void;
  onError?: (error: string) => void;
  showControls?: boolean;
  showStats?: boolean;
  className?: string;
}

export default function PatientVideoCall({
  roomId,
  doctorId,
  doctorName,
  onEndCall,
  onError,
  showControls = true,
  showStats = true,
  className = ''
}: PatientVideoCallProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{
    id: string;
    sender: 'doctor' | 'patient';
    message: string;
    timestamp: Date;
  }>>([]);
  const [newMessage, setNewMessage] = useState('');

  // Configuración WebRTC optimizada para telemedicina
  const webRTCConfig: WebRTCConfig = {
    serverUrl: process.env.NEXT_PUBLIC_SIGNALING_URL || 'ws://localhost:3001',
    roomId,
    userId: `patient-${Date.now()}`,
    userType: 'patient',
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      // En producción: agregar servidores TURN propios
    ],
    enableAudio: true,
    enableVideo: true
  };

  const {
    localStream,
    remoteStream,
    isConnected,
    isConnecting,
    error,
    stats,
    joinRoom,
    leaveRoom,
    toggleMute,
    toggleVideo,
    toggleScreenShare,
    sendMessage,
    getStats
  } = useWebRTC(webRTCConfig);

  // Configurar streams de video
  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Manejar errores
  useEffect(() => {
    if (error && onError) {
      onError(error);
    }
  }, [error, onError]);

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      remoteVideoRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleEndCall = async () => {
    await leaveRoom();
    onEndCall();
  };

  const getConnectionStatus = () => {
    if (isConnecting) return 'Conectando...';
    if (isConnected) return 'Conectado';
    return 'Desconectado';
  };

  const getConnectionQualityIcon = (quality: string) => {
    switch (quality) {
      case 'excellent': return '🟢';
      case 'good': return '🟡';
      case 'fair': return '🟠';
      case 'poor': return '🔴';
      default: return '⚪';
    }
  };

  const sendChatMessage = (message: string) => {
    if (message.trim()) {
      const newMsg = {
        id: Date.now().toString(),
        sender: 'patient' as const,
        message: message.trim(),
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, newMsg]);
      sendMessage(message.trim());
      setNewMessage('');
    }
  };

  return (
    <div className={`relative bg-gray-900 text-white ${className}`}>
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-black bg-opacity-50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Stethoscope className="w-5 h-5 text-blue-400" />
              <span className="font-semibold">Consulta con Dr. {doctorName}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm">{getConnectionStatus()}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {showStats && (
              <div className="flex items-center space-x-1 text-sm">
                <span>{getConnectionQualityIcon(stats.quality)}</span>
                <span>{stats.quality}</span>
              </div>
            )}
            <button
              onClick={toggleFullscreen}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              title="Pantalla completa"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Video Container */}
      <div className="relative h-screen">
        {/* Video Remoto (Principal) */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
          muted={false}
        />
        
        {/* Video Local (Picture-in-Picture) */}
        {localStream && (
          <div className="absolute top-20 right-4 w-48 h-36 bg-black rounded-lg overflow-hidden shadow-lg">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Indicador de grabación */}
        {isConnected && (
          <div className="absolute top-20 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-2">
            <Circle className="w-3 h-3 animate-pulse" />
            <span>En consulta</span>
          </div>
        )}

        {/* Chat Panel */}
        {showChat && (
          <div className="absolute bottom-20 right-4 w-80 h-96 bg-black bg-opacity-90 rounded-lg flex flex-col">
            <div className="p-3 border-b border-gray-700">
              <h3 className="font-semibold">Chat</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'patient' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-3 py-2 rounded-lg ${
                      msg.sender === 'patient'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-white'
                    }`}
                  >
                    <p className="text-sm">{msg.message}</p>
                    <p className="text-xs opacity-75 mt-1">
                      {msg.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-gray-700">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendChatMessage(newMessage)}
                  placeholder="Escribir mensaje..."
                  className="flex-1 bg-gray-800 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => sendChatMessage(newMessage)}
                  className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Controles */}
        {showControls && (
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-6">
            <div className="flex items-center justify-center space-x-4">
              {/* Botón de micrófono */}
              <button
                onClick={toggleMute}
                className="p-4 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors"
                title="Silenciar micrófono"
              >
                <Mic className="w-6 h-6 text-white" />
              </button>

              {/* Botón de cámara */}
              <button
                onClick={toggleVideo}
                className="p-4 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors"
                title="Activar/desactivar cámara"
              >
                <Video className="w-6 h-6 text-white" />
              </button>

              {/* Botón de compartir pantalla */}
              <button
                onClick={toggleScreenShare}
                className="p-4 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors"
                title="Compartir pantalla"
              >
                <Monitor className="w-6 h-6 text-white" />
              </button>

              {/* Botón de chat */}
              <button
                onClick={() => setShowChat(!showChat)}
                className="p-4 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors"
                title="Abrir chat"
              >
                <MessageSquare className="w-6 h-6 text-white" />
              </button>

              {/* Botón de configuración */}
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-4 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors"
                title="Configuración"
              >
                <Settings className="w-6 h-6 text-white" />
              </button>

              {/* Botón de colgar */}
              <button
                onClick={handleEndCall}
                className="p-4 bg-red-600 hover:bg-red-700 rounded-full transition-colors"
                title="Terminar llamada"
              >
                <PhoneOff className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>
        )}

        {/* Panel de configuración */}
        {showSettings && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-800 p-6 rounded-lg shadow-xl">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Configuración</h3>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span>Reducción de ruido</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span>Cancelación de eco</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Fondo virtual</span>
                </label>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-lg transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Overlay de conexión */}
      {isConnecting && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-lg">Conectando con el doctor...</p>
          </div>
        </div>
      )}

      {/* Overlay de error */}
      {error && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
          <div className="text-center bg-red-900 p-6 rounded-lg">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-lg font-semibold mb-2">Error de conexión</p>
            <p className="text-sm mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 