"use client";

import React, { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  Phone,
  PhoneOff,
  AlertCircle,
  Wifi,
  WifiOff,
  Clock,
  User
} from "lucide-react";

interface VideoCallProps {
  sessionId: string;
  onEndCall?: () => void;
  onError?: (error: string) => void;
}

export default function VideoCall({
  sessionId,
  onEndCall,
  onError
}: VideoCallProps) {
  // Estados de la llamada
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'poor'>('good');
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [participants, setParticipants] = useState<string[]>([]);

  // Refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  // Configuración WebRTC
  const rtcConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  // Inicializar conexión WebRTC real
  const initializeWebRTC = async () => {
    try {
      // 1. Obtener stream local
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // 2. Conectar al servidor de señalización
      const socket = io('http://localhost:3001', {
        transports: ['websocket']
      });
      
      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('🔌 Conectado al servidor de señalización');
        
        // Unirse a la sala
        socket.emit('join-room', {
          roomId: sessionId,
          userId: `patient-${Date.now()}`,
          userType: 'patient'
        });
      });

      socket.on('user-joined', (data) => {
        console.log('👥 Usuario unido:', data);
        setParticipants(prev => [...prev, data.userId]);
        
        // Si es el primer usuario, crear oferta
        if (data.userType === 'doctor') {
          createOffer();
        }
      });

      socket.on('offer', async (data) => {
        console.log('📤 Oferta recibida');
        await handleOffer(data.offer);
      });

      socket.on('answer', async (data) => {
        console.log('📤 Respuesta recibida');
        await handleAnswer(data.answer);
      });

      socket.on('ice-candidate', async (data) => {
        console.log('🧊 Candidato ICE recibido');
        await handleIceCandidate(data.candidate);
      });

      socket.on('user-left', (data) => {
        console.log('👋 Usuario salió:', data);
        setParticipants(prev => prev.filter(id => id !== data.userId));
        setIsConnected(false);
      });

      socket.on('disconnect', () => {
        console.log('🔌 Desconectado del servidor');
        setIsConnected(false);
      });

      // 3. Crear PeerConnection
      const peerConnection = new RTCPeerConnection(rtcConfig);
      peerConnectionRef.current = peerConnection;

      // Agregar tracks locales
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });

      // Manejar stream remoto
      peerConnection.ontrack = (event) => {
        console.log('📹 Stream remoto recibido');
        setRemoteStream(event.streams[0]);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      // Manejar candidatos ICE
      peerConnection.onicecandidate = (event) => {
        if (event.candidate && socketRef.current) {
          socketRef.current.emit('ice-candidate', {
            roomId: sessionId,
            candidate: event.candidate
          });
        }
      };

      // Manejar cambios de conexión
      peerConnection.onconnectionstatechange = () => {
        console.log('🔗 Estado de conexión:', peerConnection.connectionState);
        if (peerConnection.connectionState === 'connected') {
          setIsConnected(true);
          setIsConnecting(false);
        } else if (peerConnection.connectionState === 'disconnected') {
          setIsConnected(false);
        }
      };

    } catch (error) {
      console.error('Error inicializando WebRTC:', error);
      if (onError) {
        onError('Error al acceder a la cámara o micrófono');
      }
    }
  };

  // Crear oferta WebRTC
  const createOffer = async () => {
    if (!peerConnectionRef.current) return;
    
    try {
      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);
      
      if (socketRef.current) {
        socketRef.current.emit('offer', {
          roomId: sessionId,
          offer: offer
        });
      }
    } catch (error) {
      console.error('Error creando oferta:', error);
    }
  };

  // Manejar oferta recibida
  const handleOffer = async (offer: RTCSessionDescriptionInit) => {
    if (!peerConnectionRef.current) return;
    
    try {
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);
      
      if (socketRef.current) {
        socketRef.current.emit('answer', {
          roomId: sessionId,
          answer: answer
        });
      }
    } catch (error) {
      console.error('Error manejando oferta:', error);
    }
  };

  // Manejar respuesta recibida
  const handleAnswer = async (answer: RTCSessionDescriptionInit) => {
    if (!peerConnectionRef.current) return;
    
    try {
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
    } catch (error) {
      console.error('Error manejando respuesta:', error);
    }
  };

  // Manejar candidato ICE
  const handleIceCandidate = async (candidate: RTCIceCandidateInit) => {
    if (!peerConnectionRef.current) return;
    
    try {
      await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.error('Error agregando candidato ICE:', error);
    }
  };

  // Iniciar llamada
  const handleJoinCall = async () => {
    setIsConnecting(true);
    await initializeWebRTC();
  };

  // Finalizar llamada
  const handleEndCall = () => {
    setIsConnected(false);
    setIsConnecting(false);
    
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    
    if (onEndCall) {
      onEndCall();
    }
  };

  // Toggle mute
  const handleToggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  // Toggle video
  const handleToggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  // Toggle screen share
  const handleToggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true
        });
        setIsScreenSharing(true);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }
      } catch (error) {
        console.error('Error sharing screen:', error);
      }
    } else {
      setIsScreenSharing(false);
      if (localStream && localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
      }
    }
  };

  // Timer de sesión
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isConnected) {
      interval = setInterval(() => {
        setSessionDuration(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isConnected]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      handleEndCall();
    };
  }, []);

  // Formatear duración
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Obtener icono de calidad de conexión
  const getConnectionQualityIcon = () => {
    switch (connectionQuality) {
      case 'excellent':
        return <Wifi className="w-4 h-4 text-green-500" />;
      case 'good':
        return <Wifi className="w-4 h-4 text-yellow-500" />;
      case 'poor':
        return <WifiOff className="w-4 h-4 text-red-500" />;
      default:
        return <Wifi className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="w-full h-96 bg-gray-900 rounded-lg overflow-hidden relative">
      {/* Video Area */}
      <div className="relative h-full">
        {/* Video Remoto (Principal) */}
        <div className="absolute inset-0 flex items-center justify-center">
          {isConnected && remoteStream ? (
            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="text-center">
              <div className="w-32 h-32 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-16 h-16 text-gray-400" />
              </div>
              <p className="text-white text-lg">Sala de espera virtual</p>
              <p className="text-gray-400 text-sm">
                {isConnecting ? "Conectando..." : "Esperando conexión del médico"}
              </p>
              {participants.length > 0 && (
                <p className="text-green-400 text-sm mt-2">
                  {participants.length} participante(s) conectado(s)
                </p>
              )}
            </div>
          )}
        </div>

        {/* Video Local (Esquina) */}
        {isConnected && localStream && (
          <div className="absolute top-4 right-4 w-48 h-36 bg-black rounded-lg overflow-hidden border-2 border-white shadow-lg">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Estado de Conexión */}
        <div className="absolute top-4 left-4 flex items-center space-x-2">
          <div
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              isConnected
                ? "bg-green-500 text-white"
                : isConnecting
                ? "bg-yellow-500 text-white"
                : "bg-gray-500 text-white"
            }`}
          >
            {isConnected ? "Conectado" : isConnecting ? "Conectando..." : "Desconectado"}
          </div>
          
          {isConnected && (
            <>
              {getConnectionQualityIcon()}
              <div className="bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                <Clock className="w-3 h-3 inline mr-1" />
                {formatDuration(sessionDuration)}
              </div>
            </>
          )}
        </div>

        {/* Controles */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <div className="flex items-center space-x-4 bg-black bg-opacity-50 rounded-full px-6 py-3">
            {/* Botón Mute */}
            <button
              onClick={handleToggleMute}
              className={`p-3 rounded-full transition-colors ${
                isMuted
                  ? "bg-red-500 text-white"
                  : "bg-gray-700 text-white hover:bg-gray-600"
              }`}
              disabled={!isConnected}
            >
              {isMuted ? (
                <MicOff className="w-5 h-5" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </button>

            {/* Botón Video */}
            <button
              onClick={handleToggleVideo}
              className={`p-3 rounded-full transition-colors ${
                !isVideoEnabled
                  ? "bg-red-500 text-white"
                  : "bg-gray-700 text-white hover:bg-gray-600"
              }`}
              disabled={!isConnected}
            >
              {isVideoEnabled ? (
                <Video className="w-5 h-5" />
              ) : (
                <VideoOff className="w-5 h-5" />
              )}
            </button>

            {/* Botón Compartir Pantalla */}
            <button
              onClick={handleToggleScreenShare}
              className={`p-3 rounded-full transition-colors ${
                isScreenSharing
                  ? "bg-blue-500 text-white"
                  : "bg-gray-700 text-white hover:bg-gray-600"
              }`}
              disabled={!isConnected}
            >
              <Monitor className="w-5 h-5" />
            </button>

            {/* Botón Iniciar/Finalizar Llamada */}
            {isConnected ? (
              <button
                onClick={handleEndCall}
                className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <PhoneOff className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleJoinCall}
                disabled={isConnecting}
                className={`p-3 rounded-full transition-colors ${
                  isConnecting
                    ? "bg-gray-500 text-white cursor-not-allowed"
                    : "bg-green-500 text-white hover:bg-green-600"
                }`}
              >
                {isConnecting ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <Phone className="w-5 h-5" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Información de Sesión */}
        <div className="absolute top-4 right-4">
          <div className="bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm">
            ID: {sessionId}
          </div>
        </div>
      </div>
    </div>
  );
}
