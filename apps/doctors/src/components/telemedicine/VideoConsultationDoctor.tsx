'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, MessageSquare, Users, Monitor, Wifi, WifiOff, FileText, Camera } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

interface VideoConsultationDoctorProps {
  roomId: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  patientName: string;
  authToken: string;
  onCallEnd?: () => void;
  onError?: (error: string) => void;
}

interface Participant {
  id: string;
  userId: string;
  role: 'patient' | 'doctor';
  name: string;
  status: 'waiting' | 'connected' | 'disconnected';
  videoEnabled?: boolean;
  audioEnabled?: boolean;
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: Date;
  type: 'text' | 'system' | 'medical';
}

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  // Add TURN servers here for production
];

const VideoConsultationDoctor: React.FC<VideoConsultationDoctorProps> = ({
  roomId,
  appointmentId,
  patientId,
  doctorId,
  doctorName,
  patientName,
  authToken,
  onCallEnd,
  onError
}) => {
  // Refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoVideo>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // State
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showMedicalTools, setShowMedicalTools] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'poor'>('excellent');
  const [error, setError] = useState<string | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<Date>(new Date());
  const [sessionDuration, setSessionDuration] = useState<string>('00:00');

  // Session timer
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const duration = Math.floor((now.getTime() - sessionStartTime.getTime()) / 1000);
      const minutes = Math.floor(duration / 60);
      const seconds = duration % 60;
      setSessionDuration(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(timer);
  }, [sessionStartTime]);

  // Initialize socket connection
  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_SIGNALING_SERVER_URL || 'ws://localhost:8888';
    
    const socket = io(socketUrl, {
      transports: ['websocket'],
      timeout: 10000,
    });

    socketRef.current = socket;

    // Socket event handlers
    socket.on('connect', () => {
      console.log('Doctor connected to signaling server');
      socket.emit('authenticate', { token: authToken, role: 'doctor' });
    });

    socket.on('authenticated', () => {
      console.log('Doctor socket authenticated');
      socket.emit('join-room', {
        roomId,
        userId: doctorId,
        role: 'doctor',
        name: doctorName,
        appointmentId,
        token: authToken
      });
    });

    socket.on('auth-error', (data) => {
      setError('Error de autenticación médica');
      onError?.('Error de autenticación médica');
    });

    socket.on('room-joined', async (data) => {
      console.log('Doctor joined room:', data);
      setParticipants(data.participants);
      setIsConnecting(false);
      setIsConnected(true);
      
      await initializeWebRTC();
      addSystemMessage('Sesión médica iniciada');
    });

    socket.on('participant-joined', (data) => {
      console.log('Patient joined:', data);
      setParticipants(prev => [...prev, data.participant]);
      addSystemMessage(`Paciente ${data.participant.name} se conectó`);
    });

    socket.on('participant-left', (data) => {
      console.log('Participant left:', data);
      setParticipants(data.remainingParticipants);
      addSystemMessage('Paciente desconectado');
    });

    socket.on('webrtc-signal', async (data) => {
      console.log('Doctor received WebRTC signal:', data.type);
      await handleWebRTCSignal(data);
    });

    socket.on('chat-message', (message: ChatMessage) => {
      setChatMessages(prev => [...prev, message]);
    });

    socket.on('participant-toggled-media', (data) => {
      setParticipants(prev => prev.map(p => 
        p.userId === data.userId 
          ? { ...p, [`${data.type}Enabled`]: data.enabled }
          : p
      ));
    });

    socket.on('error', (error) => {
      console.error('Doctor socket error:', error);
      setError(error.message);
      onError?.(error.message);
    });

    socket.on('disconnect', () => {
      console.log('Doctor disconnected from signaling server');
      setIsConnected(false);
    });

    return () => {
      socket.close();
    };
  }, [roomId, doctorId, doctorName, appointmentId, authToken, onError]);

  // Initialize WebRTC
  const initializeWebRTC = useCallback(async () => {
    try {
      // Get high-quality media for doctor
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920, min: 1280 },
          height: { ideal: 1080, min: 720 },
          facingMode: 'user',
          frameRate: { ideal: 30 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000
        }
      });

      localStreamRef.current = stream;
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Create peer connection with enhanced config for medical use
      const pc = new RTCPeerConnection({ 
        iceServers: ICE_SERVERS,
        iceCandidatePoolSize: 10
      });
      peerConnectionRef.current = pc;

      // Add local stream tracks
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      // Handle remote stream
      pc.ontrack = (event) => {
        console.log('Doctor received patient stream');
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate && socketRef.current) {
          socketRef.current.emit('webrtc-signal', {
            type: 'ice-candidate',
            sessionId: roomId,
            from: doctorId,
            to: patientId,
            data: event.candidate
          });
        }
      };

      // Monitor connection state
      pc.onconnectionstatechange = () => {
        console.log('Doctor connection state:', pc.connectionState);
        if (pc.connectionState === 'connected') {
          setConnectionQuality('excellent');
          addSystemMessage('Conexión estable establecida');
        } else if (pc.connectionState === 'connecting') {
          setConnectionQuality('good');
        } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
          setConnectionQuality('poor');
          addSystemMessage('Problemas de conexión detectados');
        }
      };

      // Doctor initiates the call
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });
      await pc.setLocalDescription(offer);
      
      socketRef.current?.emit('webrtc-signal', {
        type: 'offer',
        sessionId: roomId,
        from: doctorId,
        to: patientId,
        data: offer
      });

    } catch (error) {
      console.error('Error initializing doctor WebRTC:', error);
      setError('No se pudo acceder a la cámara o micrófono');
      onError?.('No se pudo acceder a la cámara o micrófono');
    }
  }, [roomId, doctorId, patientId, onError]);

  // Handle incoming WebRTC signals
  const handleWebRTCSignal = async (signal: any) => {
    if (!peerConnectionRef.current) return;

    try {
      if (signal.type === 'answer') {
        await peerConnectionRef.current.setRemoteDescription(signal.data);
        addSystemMessage('Paciente conectado exitosamente');
      } else if (signal.type === 'ice-candidate') {
        await peerConnectionRef.current.addIceCandidate(signal.data);
      }
    } catch (error) {
      console.error('Error handling doctor WebRTC signal:', error);
    }
  };

  // Start screen sharing
  const startScreenShare = useCallback(async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });

      if (peerConnectionRef.current && localStreamRef.current) {
        // Replace video track with screen share
        const videoTrack = screenStream.getVideoTracks()[0];
        const sender = peerConnectionRef.current.getSenders().find(s => 
          s.track && s.track.kind === 'video'
        );
        
        if (sender) {
          await sender.replaceTrack(videoTrack);
          setIsScreenSharing(true);
          addSystemMessage('Compartiendo pantalla');
        }

        screenStream.getVideoTracks()[0].onended = () => {
          stopScreenShare();
        };
      }
    } catch (error) {
      console.error('Error starting screen share:', error);
    }
  }, []);

  // Stop screen sharing
  const stopScreenShare = useCallback(async () => {
    if (peerConnectionRef.current && localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      const sender = peerConnectionRef.current.getSenders().find(s => 
        s.track && s.track.kind === 'video'
      );
      
      if (sender && videoTrack) {
        await sender.replaceTrack(videoTrack);
        setIsScreenSharing(false);
        addSystemMessage('Pantalla compartida finalizada');
      }
    }
  }, []);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
        
        socketRef.current?.emit('toggle-media', {
          type: 'video',
          enabled: videoTrack.enabled,
          sessionId: roomId
        });
      }
    }
  }, [roomId]);

  // Toggle audio
  const toggleAudio = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
        
        socketRef.current?.emit('toggle-media', {
          type: 'audio',
          enabled: audioTrack.enabled,
          sessionId: roomId
        });
      }
    }
  }, [roomId]);

  // Send medical message
  const sendMedicalMessage = (message: string) => {
    const medicalMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: doctorId,
      senderName: `Dr. ${doctorName}`,
      message,
      timestamp: new Date(),
      type: 'medical'
    };

    socketRef.current?.emit('chat-message', {
      sessionId: roomId,
      message: medicalMessage
    });

    setChatMessages(prev => [...prev, medicalMessage]);
  };

  // End call
  const endCall = useCallback(() => {
    // Stop all tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    
    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    
    // Leave room
    if (socketRef.current) {
      socketRef.current.emit('leave-room', { roomId, userId: doctorId });
      socketRef.current.emit('session-ended', { 
        roomId, 
        appointmentId, 
        duration: sessionDuration 
      });
      socketRef.current.disconnect();
    }
    
    onCallEnd?.();
  }, [roomId, doctorId, appointmentId, sessionDuration, onCallEnd]);

  // Add system message
  const addSystemMessage = (message: string) => {
    setChatMessages(prev => [...prev, {
      id: Date.now().toString(),
      senderId: 'system',
      senderName: 'Sistema Médico',
      message,
      timestamp: new Date(),
      type: 'system'
    }]);
  };

  // Connection quality indicator
  const getConnectionIcon = () => {
    switch (connectionQuality) {
      case 'excellent': return <Wifi className="text-green-500" size={20} />;
      case 'good': return <Wifi className="text-yellow-500" size={20} />;
      case 'poor': return <WifiOff className="text-red-500" size={20} />;
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Error en la Consulta Médica</h2>
          <p className="mb-4">{error}</p>
          <button 
            onClick={endCall}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg"
          >
            Finalizar Sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Professional Header */}
      <div className="flex items-center justify-between p-4 bg-blue-900">
        <div className="flex items-center gap-4">
          <h2 className="text-white text-lg font-semibold">
            Consulta Médica - {patientName}
          </h2>
          {getConnectionIcon()}
          <span className="text-blue-200 text-sm">Duración: {sessionDuration}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-blue-200 text-sm">
            Cita: {appointmentId}
          </div>
          <Users className="text-blue-300" size={20} />
          <span className="text-blue-300">{participants.length} participantes</span>
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Patient Video (Main) */}
        <div className="relative bg-gray-800 rounded-lg overflow-hidden order-1 lg:order-1">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4 bg-blue-600 bg-opacity-75 px-3 py-1 rounded-lg">
            <span className="text-white text-sm font-medium">Paciente: {patientName}</span>
          </div>
          <div className="absolute bottom-4 right-4">
            {participants.find(p => p.role === 'patient' && !p.videoEnabled) && (
              <div className="bg-gray-700 p-2 rounded-full">
                <VideoOff className="text-gray-300" size={24} />
              </div>
            )}
          </div>
        </div>

        {/* Doctor Video (Picture-in-Picture) */}
        <div className="relative bg-gray-800 rounded-lg overflow-hidden order-2 lg:order-2">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4 bg-green-600 bg-opacity-75 px-3 py-1 rounded-lg">
            <span className="text-white text-sm font-medium">Dr. {doctorName}</span>
          </div>
          {!isVideoEnabled && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
              <Camera className="text-gray-500" size={64} />
            </div>
          )}
          {isScreenSharing && (
            <div className="absolute bottom-4 left-4 bg-purple-600 px-2 py-1 rounded">
              <span className="text-white text-xs">Compartiendo pantalla</span>
            </div>
          )}
        </div>
      </div>

      {/* Professional Controls */}
      <div className="flex items-center justify-center gap-4 p-4 bg-gray-800">
        <button
          onClick={toggleAudio}
          className={`p-4 rounded-full transition-colors ${
            isAudioEnabled 
              ? 'bg-green-600 hover:bg-green-700 text-white' 
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
          title={isAudioEnabled ? 'Silenciar micrófono' : 'Activar micrófono'}
        >
          {isAudioEnabled ? <Mic size={24} /> : <MicOff size={24} />}
        </button>

        <button
          onClick={toggleVideo}
          className={`p-4 rounded-full transition-colors ${
            isVideoEnabled 
              ? 'bg-green-600 hover:bg-green-700 text-white' 
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
          title={isVideoEnabled ? 'Desactivar cámara' : 'Activar cámara'}
        >
          {isVideoEnabled ? <Video size={24} /> : <VideoOff size={24} />}
        </button>

        <button
          onClick={isScreenSharing ? stopScreenShare : startScreenShare}
          className={`p-4 rounded-full transition-colors ${
            isScreenSharing 
              ? 'bg-purple-600 hover:bg-purple-700 text-white' 
              : 'bg-gray-700 hover:bg-gray-600 text-white'
          }`}
          title={isScreenSharing ? 'Dejar de compartir' : 'Compartir pantalla'}
        >
          <Monitor size={24} />
        </button>

        <button
          onClick={() => setShowChat(!showChat)}
          className="p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors"
          title="Chat médico"
        >
          <MessageSquare size={24} />
        </button>

        <button
          onClick={() => setShowMedicalTools(!showMedicalTools)}
          className="p-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition-colors"
          title="Herramientas médicas"
        >
          <FileText size={24} />
        </button>

        <button
          onClick={endCall}
          className="p-4 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors"
          title="Finalizar consulta"
        >
          <PhoneOff size={24} />
        </button>
      </div>

      {/* Loading Overlay */}
      {isConnecting && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-white text-lg">Conectando con el paciente...</p>
            <p className="text-gray-300 text-sm mt-2">Verificando credenciales médicas</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoConsultationDoctor;