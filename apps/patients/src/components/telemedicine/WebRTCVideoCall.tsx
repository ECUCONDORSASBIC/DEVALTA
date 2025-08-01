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

  // Configuración WebRTC con servidores STUN/TURN seguros
  const webRTCConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      // En producción: agregar servidores TURN propios
    ],
    audio: true,
    video: true
  };

  const {
    localStream,
    remoteStream,
    peerConnection,
    isConnected,
    error,
    startLocalStream,
    stopLocalStream,
    createOffer,
    createAnswer,
    setRemoteDescription,
    addIceCandidate,
    disconnect
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

  // Auto-iniciar stream local
  useEffect(() => {
    startLocalStream();
    return () => {
      stopLocalStream();
    };
  }, [startLocalStream, stopLocalStream]);

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
    disconnect();
    onEndCall();
  };

  // Toggle micrófono
  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
      }
    }
  };

  // Toggle video
  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
      }
    }
  };

  // Obtener estado del micrófono
  const isMuted = localStream?.getAudioTracks()[0]?.enabled === false;
  const isVideoEnabled = localStream?.getVideoTracks()[0]?.enabled !== false;

  // Obtener estado de conexión
  const getConnectionStatus = () => {
    if (isConnected) return { text: 'Conectado', color: 'bg-green-500' };
    if (peerConnection?.connectionState === 'connecting') return { text: 'Conectando...', color: 'bg-yellow-500' };
    return { text: 'Esperando conexión', color: 'bg-gray-500' };
  };

  const connectionStatus = getConnectionStatus();

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
        {localStream && (
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
        {!remoteStream && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="text-center">
              <div className="w-32 h-32 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="w-16 h-16 text-white" />
              </div>
              <p className="text-white text-lg">
                {connectionStatus.text}
              </p>
              <p className="text-gray-400 text-sm">
                Esperando que se conecte el {userType === 'doctor' ? 'paciente' : 'médico'}
              </p>
            </div>
          </div>
        )}

        {/* Estado de conexión */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <div className={`px-3 py-1 rounded-full text-sm font-medium text-white ${connectionStatus.color}`}>
            {connectionStatus.text}
          </div>
          <div className="px-2 py-1 bg-blue-500 text-white rounded text-xs">
            {userType === 'doctor' ? 'MÉDICO' : 'PACIENTE'}
          </div>
        </div>

        {/* Controles de ventana */}
        <div className="absolute top-4 left-64 flex gap-2">
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

        {/* Panel de configuración */}
        {showSettings && (
          <div className="absolute top-16 left-4 bg-white rounded-lg shadow-lg p-4 w-64 z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Configuración de Llamada</h3>
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
              
              <div className="pt-3 border-t">
                <div className="text-xs text-gray-600">
                  <div>Conexión: {peerConnection?.connectionState || 'Sin conexión'}</div>
                  <div>ICE: {peerConnection?.iceConnectionState || 'No iniciado'}</div>
                  <div>Sala: {roomId}</div>
                </div>
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
              className="p-3 rounded-full bg-gray-700 text-white hover:bg-gray-600 transition-colors"
              title="Compartir pantalla (próximamente)"
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
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 z-20">
            <div className="bg-white rounded-lg p-6 max-w-md text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error de Telemedicina</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => startLocalStream()}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Reintentar
                </button>
                <button
                  onClick={handleEndCall}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Terminar Llamada
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
