"use client";

import React, { useRef, useEffect } from "react";
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
  X
} from "lucide-react";
import { useWebRTC } from "../../hooks/useWebRTC";

interface WebRTCVideoCallProps {
  roomId: string;
  userId: string;
  userType: 'doctor' | 'patient';
  onEndCall: () => void;
  onError?: (error: string) => void;
}

export default function WebRTCVideoCall({
  roomId,
  userId,
  userType,
  onEndCall,
  onError
}: WebRTCVideoCallProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [showSettings, setShowSettings] = React.useState(false);

  const {
    isConnected,
    isConnecting,
    hasLocalStream,
    hasRemoteStream,
    localStream,
    remoteStream,
    connectionState,
    iceConnectionState,
    error,
    joinRoom,
    leaveRoom,
    toggleMute,
    toggleVideo,
    toggleScreenShare,
    sendMessage
  } = useWebRTC({
    roomId,
    userId,
    userType
  });

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

  // Auto-join al montar
  useEffect(() => {
    joinRoom();
    return () => {
      leaveRoom();
    };
  }, [joinRoom, leaveRoom]);

  // Manejar fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Manejar fin de llamada
  const handleEndCall = async () => {
    await leaveRoom();
    onEndCall();
  };

  // Obtener estado del micrófono
  const isMuted = localStream?.getAudioTracks()[0]?.enabled === false;
  const isVideoEnabled = localStream?.getVideoTracks()[0]?.enabled !== false;

  // Obtener color de estado de conexión
  const getConnectionColor = () => {
    switch (connectionState) {
      case 'connected': return 'bg-green-500';
      case 'connecting': return 'bg-yellow-500';
      case 'disconnected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  // Obtener texto de estado
  const getConnectionText = () => {
    if (isConnecting) return 'Conectando...';
    if (isConnected) return 'Conectado';
    if (connectionState === 'disconnected') return 'Desconectado';
    return 'Esperando...';
  };

  return (
    <div className={`w-full h-full bg-gray-900 rounded-lg overflow-hidden relative ${
      isFullscreen ? 'fixed inset-0 z-50' : ''
    }`}>
      {/* Video Area */}
      <div className="relative h-full">
        {/* Video Remoto (Principal) */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />

        {/* Video Local (Picture-in-Picture) */}
        {hasLocalStream && (
          <div className="absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden border-2 border-white shadow-lg">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              style={{ transform: 'scaleX(-1)' }} // Efecto espejo
            />
            
            {/* Indicadores de estado local */}
            <div className="absolute bottom-2 left-2 flex gap-1">
              {!isVideoEnabled && (
                <div className="p-1 bg-red-500 rounded">
                  <VideoOff className="w-3 h-3 text-white" />
                </div>
              )}
              {isMuted && (
                <div className="p-1 bg-red-500 rounded">
                  <MicOff className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Overlay cuando no hay video remoto */}
        {!hasRemoteStream && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="text-center">
              <div className="w-32 h-32 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="w-16 h-16 text-white" />
              </div>
              <p className="text-white text-lg">
                {isConnecting ? 'Conectando...' : 'Esperando conexión'}
              </p>
              <p className="text-gray-400 text-sm">
                {userType === 'doctor' ? 'Paciente' : 'Médico'} se conectará pronto
              </p>
            </div>
          </div>
        )}

        {/* Estado de conexión */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <div className={`px-3 py-1 rounded-full text-sm font-medium text-white ${getConnectionColor()}`}>
            {getConnectionText()}
          </div>
          {iceConnectionState !== 'connected' && (
            <div className="px-2 py-1 bg-yellow-500 text-white rounded text-xs">
              ICE: {iceConnectionState}
            </div>
          )}
        </div>

        {/* Controles de ventana */}
        <div className="absolute top-4 left-20 flex gap-2">
          <button
            onClick={toggleFullscreen}
            className="p-2 bg-black/50 text-white rounded hover:bg-black/70 transition-colors"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 bg-black/50 text-white rounded hover:bg-black/70 transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {/* Timer */}
        {isConnected && (
          <div className="absolute top-4 right-4">
            <div className="bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
              00:15:32
            </div>
          </div>
        )}

        {/* Panel de configuración */}
        {showSettings && (
          <div className="absolute top-16 left-4 bg-white rounded-lg shadow-lg p-4 w-64">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Configuración</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Cámara</span>
                <button
                  onClick={toggleVideo}
                  className={`p-2 rounded ${isVideoEnabled ? 'bg-green-500' : 'bg-red-500'} text-white`}
                >
                  {isVideoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Micrófono</span>
                <button
                  onClick={toggleMute}
                  className={`p-2 rounded ${!isMuted ? 'bg-green-500' : 'bg-red-500'} text-white`}
                >
                  {!isMuted ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Altavoz</span>
                <button className="p-2 rounded bg-gray-500 text-white">
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Controles principales */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="flex items-center space-x-4 bg-black bg-opacity-50 rounded-full px-6 py-3">
            {/* Mute Button */}
            <button
              onClick={toggleMute}
              className={`p-3 rounded-full transition-colors ${
                isMuted
                  ? "bg-red-500 text-white"
                  : "bg-gray-700 text-white hover:bg-gray-600"
              }`}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Video Button */}
            <button
              onClick={toggleVideo}
              className={`p-3 rounded-full transition-colors ${
                !isVideoEnabled
                  ? "bg-red-500 text-white"
                  : "bg-gray-700 text-white hover:bg-gray-600"
              }`}
            >
              {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>

            {/* Screen Share Button */}
            <button
              onClick={toggleScreenShare}
              className="p-3 rounded-full bg-gray-700 text-white hover:bg-gray-600 transition-colors"
            >
              <Monitor className="w-5 h-5" />
            </button>

            {/* End Call Button */}
            <button
              onClick={handleEndCall}
              className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <PhoneOff className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Error overlay */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75">
            <div className="bg-white rounded-lg p-6 max-w-md text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error de conexión</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={joinRoom}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Reintentar
                </button>
                <button
                  onClick={handleEndCall}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Salir
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 