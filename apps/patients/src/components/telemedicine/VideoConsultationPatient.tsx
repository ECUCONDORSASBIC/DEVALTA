'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, MessageSquare, Users, Wifi, WifiOff, Heart, Clock } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

interface VideoConsultationPatientProps {
  roomId: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  patientName: string;
  doctorName: string;
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

const VideoConsultationPatient: React.FC<VideoConsultationPatientProps> = ({
  roomId,
  appointmentId,
  patientId,
  doctorId,
  patientName,
  doctorName,
  authToken,
  onCallEnd,
  onError
}) => {
  // Refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // State
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [isDoctorConnected, setIsDoctorConnected] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'poor'>('excellent');
  const [error, setError] = useState<string | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<Date>(new Date());
  const [sessionDuration, setSessionDuration] = useState<string>('00:00');
  const [waitingMessage, setWaitingMessage] = useState('Conectando con su médico...');

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

  // Waiting messages rotation
  useEffect(() => {
    if (!isDoctorConnected) {
      const messages = [
        'Conectando con su médico...',
        'Por favor espere mientras el doctor se conecta',
        'Su consulta comenzará en breve',
        'Verificando su conexión...'
      ];
      
      let messageIndex = 0;
      const messageTimer = setInterval(() => {
        messageIndex = (messageIndex + 1) % messages.length;
        setWaitingMessage(messages[messageIndex]);
      }, 3000);

      return () => clearInterval(messageTimer);
    }
  }, [isDoctorConnected]);

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
      console.log('Patient connected to signaling server');
      socket.emit('authenticate', { token: authToken, role: 'patient' });
    });

    socket.on('authenticated', () => {
      console.log('Patient socket authenticated');
      socket.emit('join-room', {
        roomId,
        userId: patientId,
        role: 'patient',
        name: patientName,
        appointmentId,
        token: authToken
      });
    });

    socket.on('auth-error', (data) => {
      setError('Error de autenticación de paciente');
      onError?.('Error de autenticación de paciente');
    });

    socket.on('room-joined', async (data) => {
      console.log('Patient joined room:', data);
      setParticipants(data.participants);
      setIsConnecting(false);
      setIsConnected(true);
      
      // Check if doctor is already connected
      const doctorParticipant = data.participants.find((p: Participant) => p.role === 'doctor');
      if (doctorParticipant) {
        setIsDoctorConnected(true);
        setWaitingMessage('');
      }
      
      await initializeWebRTC();
      addSystemMessage('Conectado a la sala de consulta');
    });

    socket.on('participant-joined', (data) => {
      console.log('Doctor joined:', data);
      setParticipants(prev => [...prev, data.participant]);
      
      if (data.participant.role === 'doctor') {
        setIsDoctorConnected(true);
        setWaitingMessage('');
        addSystemMessage(`Dr. ${data.participant.name} se conectó`);
      }
    });

    socket.on('participant-left', (data) => {
      console.log('Participant left:', data);
      setParticipants(data.remainingParticipants);
      
      const remainingDoctor = data.remainingParticipants.find((p: Participant) => p.role === 'doctor');
      if (!remainingDoctor) {
        setIsDoctorConnected(false);
        setWaitingMessage('El doctor se desconectó. Esperando reconexión...');
        addSystemMessage('Doctor desconectado');
      }
    });

    socket.on('webrtc-signal', async (data) => {
      console.log('Patient received WebRTC signal:', data.type);
      await handleWebRTCSignal(data);
    });

    socket.on('chat-message', (message: ChatMessage) => {
      setChatMessages(prev => [...prev, message]);
      
      // Auto-show chat for medical messages from doctor
      if (message.type === 'medical' && message.senderId === doctorId) {
        setShowChat(true);
      }
    });

    socket.on('participant-toggled-media', (data) => {
      setParticipants(prev => prev.map(p => 
        p.userId === data.userId 
          ? { ...p, [`${data.type}Enabled`]: data.enabled }
          : p
      ));
    });

    socket.on('session-ended', (data) => {
      addSystemMessage('La consulta ha finalizado');
      setTimeout(() => {
        onCallEnd?.();
      }, 2000);
    });

    socket.on('error', (error) => {
      console.error('Patient socket error:', error);
      setError(error.message);
      onError?.(error.message);
    });

    socket.on('disconnect', () => {
      console.log('Patient disconnected from signaling server');
      setIsConnected(false);
    });

    return () => {
      socket.close();
    };
  }, [roomId, patientId, doctorId, patientName, appointmentId, authToken, onError, onCallEnd]);

  // Initialize WebRTC
  const initializeWebRTC = useCallback(async () => {
    try {
      // Get patient media with appropriate quality
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
          facingMode: 'user',
          frameRate: { ideal: 24 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      localStreamRef.current = stream;
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Create peer connection
      const pc = new RTCPeerConnection({ 
        iceServers: ICE_SERVERS,
        iceCandidatePoolSize: 10
      });
      peerConnectionRef.current = pc;

      // Add local stream tracks
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      // Handle remote stream (doctor's video)
      pc.ontrack = (event) => {
        console.log('Patient received doctor stream');
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
            from: patientId,
            to: doctorId,
            data: event.candidate
          });
        }
      };

      // Monitor connection state
      pc.onconnectionstatechange = () => {
        console.log('Patient connection state:', pc.connectionState);
        if (pc.connectionState === 'connected') {
          setConnectionQuality('excellent');
          addSystemMessage('Conexión establecida con el doctor');
        } else if (pc.connectionState === 'connecting') {
          setConnectionQuality('good');
        } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
          setConnectionQuality('poor');
          addSystemMessage('Problemas de conexión. Reintentando...');
        }
      };

    } catch (error) {
      console.error('Error initializing patient WebRTC:', error);
      setError('No se pudo acceder a la cámara o micrófono');
      onError?.('No se pudo acceder a la cámara o micrófono');
    }
  }, [roomId, patientId, doctorId, onError]);

  // Handle incoming WebRTC signals
  const handleWebRTCSignal = async (signal: any) => {
    if (!peerConnectionRef.current) return;

    try {
      if (signal.type === 'offer') {
        await peerConnectionRef.current.setRemoteDescription(signal.data);
        const answer = await peerConnectionRef.current.createAnswer();
        await peerConnectionRef.current.setLocalDescription(answer);
        
        socketRef.current?.emit('webrtc-signal', {
          type: 'answer',
          sessionId: roomId,
          from: patientId,
          to: signal.from,
          data: answer
        });
        
        addSystemMessage('Respondiendo a la llamada del doctor');
      } else if (signal.type === 'ice-candidate') {
        await peerConnectionRef.current.addIceCandidate(signal.data);
      }
    } catch (error) {
      console.error('Error handling patient WebRTC signal:', error);
    }
  };

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

  // Send chat message
  const sendChatMessage = (message: string) => {
    const chatMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: patientId,
      senderName: patientName,
      message,
      timestamp: new Date(),
      type: 'text'
    };

    socketRef.current?.emit('chat-message', {
      sessionId: roomId,
      message: chatMessage
    });

    setChatMessages(prev => [...prev, chatMessage]);
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
      socketRef.current.emit('leave-room', { roomId, userId: patientId });
      socketRef.current.disconnect();
    }
    
    onCallEnd?.();
  }, [roomId, patientId, onCallEnd]);

  // Add system message
  const addSystemMessage = (message: string) => {
    setChatMessages(prev => [...prev, {
      id: Date.now().toString(),
      senderId: 'system',
      senderName: 'Sistema',
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
          <Heart className="mx-auto mb-4 text-red-400" size={64} />
          <h2 className="text-2xl font-bold mb-4">Error en la Consulta</h2>
          <p className="mb-4">{error}</p>
          <button 
            onClick={endCall}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg"
          >
            Salir de la Consulta
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Patient Header */}
      <div className="flex items-center justify-between p-4 bg-green-800">
        <div className="flex items-center gap-4">
          <Heart className="text-green-200" size={24} />
          <h2 className="text-white text-lg font-semibold">
            Consulta con Dr. {doctorName}
          </h2>
          {getConnectionIcon()}
          {isDoctorConnected && (
            <span className="text-green-200 text-sm flex items-center gap-1">
              <Clock size={16} />
              {sessionDuration}
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="text-green-200 text-sm">
            Cita: {appointmentId}
          </div>
          <div className={`px-3 py-1 rounded-full text-sm ${
            isDoctorConnected 
              ? 'bg-green-600 text-white' 
              : 'bg-yellow-600 text-white'
          }`}>
            {isDoctorConnected ? 'Doctor conectado' : 'Esperando doctor'}
          </div>
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Doctor Video (Main for patient view) */}
        <div className="relative bg-gray-800 rounded-lg overflow-hidden order-1">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4 bg-blue-600 bg-opacity-75 px-3 py-1 rounded-lg">
            <span className="text-white text-sm font-medium">Dr. {doctorName}</span>
          </div>
          
          {!isDoctorConnected && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
                <p className="text-white text-lg">{waitingMessage}</p>
                <p className="text-gray-300 text-sm mt-2">Su doctor se conectará pronto</p>
              </div>
            </div>
          )}
        </div>

        {/* Patient Video (Self view) */}
        <div className="relative bg-gray-800 rounded-lg overflow-hidden order-2">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
            style={{ transform: 'scaleX(-1)' }} // Mirror effect for self view
          />
          <div className="absolute top-4 left-4 bg-green-600 bg-opacity-75 px-3 py-1 rounded-lg">
            <span className="text-white text-sm font-medium">Usted</span>
          </div>
          {!isVideoEnabled && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
              <VideoOff className="text-gray-500" size={64} />
            </div>
          )}
        </div>
      </div>

      {/* Patient-friendly Controls */}
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
          onClick={() => setShowChat(!showChat)}
          className="p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors"
          title="Chat con el doctor"
        >
          <MessageSquare size={24} />
          {chatMessages.some(msg => msg.type === 'medical' && msg.senderId === doctorId) && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
          )}
        </button>

        <button
          onClick={endCall}
          className="p-4 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors"
          title="Finalizar consulta"
        >
          <PhoneOff size={24} />
        </button>
      </div>

      {/* Connection Status for Patient */}
      {isConnecting && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75">
          <div className="text-center">
            <Heart className="animate-pulse text-green-400 mx-auto mb-4" size={64} />
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-white text-lg">Conectando a su consulta médica...</p>
            <p className="text-gray-300 text-sm mt-2">Preparando la videollamada</p>
          </div>
        </div>
      )}

      {/* Medical Instructions Overlay */}
      {isDoctorConnected && connectionQuality === 'poor' && (
        <div className="absolute top-20 left-4 right-4 bg-yellow-600 bg-opacity-90 p-4 rounded-lg">
          <p className="text-white text-sm">
            <strong>Conexión débil detectada:</strong> Intente acercarse al router WiFi o usar conexión por cable
          </p>
        </div>
      )}
    </div>
  );
};

export default VideoConsultationPatient;