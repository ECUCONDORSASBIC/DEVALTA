"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createConsultationCall, useVideoCall, CallStatus, webrtcConfig, WebRTCMessage } from '../../lib/videoCall';
import { useAuth } from "@altamedica/auth';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff, 
  Settings, 
  Monitor,
  AlertCircle,
  Clock,
  User
} from 'lucide-react';

interface IntegratedVideoCallProps {
  sessionId: string;
  doctorEmail: string;
  doctorName: string;
  specialty?: string;
  onCallEnd?: () => void;
}

interface CallState {
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  roomId: string | null;
  callUrls: {
    doctor_url?: string;
    patient_url?: string;
  } | null;
  status: CallStatus | null;
}

export default function IntegratedVideoCall({ 
  sessionId, 
  doctorEmail, 
  doctorName, 
  specialty,
  onCallEnd 
}: IntegratedVideoCallProps) {
  const router = useRouter();
  const { authState } = useAuth();
  const { createCall, getStatus, client } = useVideoCall();
  
  const [callState, setCallState] = useState<CallState>({
    isConnected: false,
    isLoading: true,
    error: null,
    roomId: null,
    callUrls: null,
    status: null
  });
  
  const [localControls, setLocalControls] = useState({
    videoEnabled: true,
    audioEnabled: true,
    isFullscreen: false
  });
  
  const videoIframeRef = useRef<HTMLIFrameElement>(null);
  const statusInterval = useRef<NodeJS.Timeout | null>(null);

  // Inicializar videollamada
  useEffect(() => {
    const initializeCall = async () => {
      if (!authState?.user?.email) {
        setCallState(prev => ({ 
          ...prev, 
          error: 'Usuario no autenticado', 
          isLoading: false 
        }));
        return;
      }

      try {
        // Verificar conectividad del servidor
        const isHealthy = await client.checkServerHealth();
        if (!isHealthy) {
          throw new Error('Servidor de videollamadas no disponible');
        }

        // Crear la videollamada
        const result = await createCall(
          doctorEmail, 
          authState.user.email, 
          sessionId,
          {
            specialty,
            duration: 30,
            scheduledTime: new Date().toISOString()
          }
        );

        if (result.error) {
          throw new Error(result.error);
        }

        if (result.room_id) {
          setCallState(prev => ({
            ...prev,
            isConnected: true,
            isLoading: false,
            roomId: result.room_id!,
            callUrls: {
              doctor_url: result.doctor_url,
              patient_url: result.patient_url
            },
            error: null
          }));

          // Iniciar monitoreo de estado
          startStatusMonitoring(result.room_id);
        } else {
          throw new Error('No se pudo crear la videollamada');
        }

      } catch (error) {
        console.error('Error initializing video call:', error);
        setCallState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Error desconocido',
          isLoading: false
        }));
      }
    };

    initializeCall();

    // Cleanup
    return () => {
      if (statusInterval.current) {
        clearInterval(statusInterval.current);
      }
    };
  }, [sessionId, doctorEmail, authState?.user?.email]);

  // Monitorear estado de la llamada
  const startStatusMonitoring = (roomId: string) => {
    statusInterval.current = setInterval(async () => {
      try {
        const status = await getStatus(roomId);
        if (!status || 'error' in status) {
          console.error('Error getting call status:', status);
          return;
        }

        setCallState(prev => ({ ...prev, status }));
        
        // Si la llamada ha terminado
        if (status.call_ended_at) {
          if (statusInterval.current) {
            clearInterval(statusInterval.current);
          }
          if (onCallEnd) {
            onCallEnd();
          }
        }
      } catch (error) {
        console.error('Error monitoring call status:', error);
      }
    }, 5000); // Verificar cada 5 segundos
  };

  const handleEndCall = () => {
    if (statusInterval.current) {
      clearInterval(statusInterval.current);
    }
    if (onCallEnd) {
      onCallEnd();
    } else {
      router.push('/telemedicine');
    }
  };

  const toggleVideo = () => {
    setLocalControls(prev => ({ ...prev, videoEnabled: !prev.videoEnabled }));
    // TODO: Implementar control real del video cuando se integre con WebRTC
  };

  const toggleAudio = () => {
    setLocalControls(prev => ({ ...prev, audioEnabled: !prev.audioEnabled }));
    // TODO: Implementar control real del audio cuando se integre con WebRTC
  };

  const toggleFullscreen = () => {
    if (videoIframeRef.current) {
      if (!document.fullscreenElement) {
        videoIframeRef.current.requestFullscreen();
        setLocalControls(prev => ({ ...prev, isFullscreen: true }));
      } else {
        document.exitFullscreen();
        setLocalControls(prev => ({ ...prev, isFullscreen: false }));
      }
    }
  };

  // Estados de carga y error
  if (callState.isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Iniciando videollamada...</h2>
          <p className="text-gray-300">Conectando con {doctorName}</p>
        </div>
      </div>
    );
  }

  if (callState.error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white max-w-md mx-auto p-6">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-4">Error en la videollamada</h2>
          <p className="text-gray-300 mb-6">{callState.error}</p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Reintentar
            </button>
            <button
              onClick={() => router.push('/telemedicine')}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Volver a Telemedicina
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 relative">
      {/* Header de información */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/50 to-transparent p-4">
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-500 rounded-full">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold">{doctorName}</h2>
              <p className="text-sm text-gray-300">{specialty}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Estado de conexión */}
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                callState.status?.is_active ? 'bg-green-500' : 'bg-yellow-500'
              }`}></div>
              <span className="text-sm">
                {callState.status?.is_active ? 'Conectado' : 'Esperando...'}
              </span>
            </div>
            
            {/* Duración */}
            {callState.status?.call_started_at && (
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span className="text-sm">
                  {/* TODO: Implementar timer en tiempo real */}
                  00:00
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Video principal */}
      <div className="relative w-full h-screen">
        {callState.callUrls?.patient_url ? (
          <iframe
            ref={videoIframeRef}
            src={`${callState.callUrls.patient_url}&embed=true`}
            className="w-full h-full border-0"
            allow="camera; microphone; fullscreen"
            title="Videollamada médica"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-800">
            <div className="text-center text-white">
              <Video className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-300">Preparando video...</p>
            </div>
          </div>
        )}
      </div>

      {/* Controles de la videollamada */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/80 to-transparent p-6">
        {/* Botón principal para abrir videollamada WebRTC real */}
        {callState.roomId && (
          <div className="flex justify-center mb-4">
            <button
              onClick={() => {
                const url = `http://localhost:8888/video-call/${callState.roomId}?user_id=${authState?.user?.email}&user_type=patient`;
                window.open(url, '_blank', 'width=1200,height=800,resizable=yes,scrollbars=yes');
              }}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center space-x-2 font-semibold"
            >
              <Video className="w-5 h-5" />
              <span>🎥 Abrir VideoLlamada WebRTC Real</span>
            </button>
          </div>
        )}
        
        <div className="flex items-center justify-center space-x-4">
          {/* Control de audio */}
          <button
            onClick={toggleAudio}
            className={`p-3 rounded-full transition-colors ${
              localControls.audioEnabled 
                ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
            title={localControls.audioEnabled ? 'Silenciar micrófono' : 'Activar micrófono'}
          >
            {localControls.audioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>

          {/* Control de video */}
          <button
            onClick={toggleVideo}
            className={`p-3 rounded-full transition-colors ${
              localControls.videoEnabled 
                ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
            title={localControls.videoEnabled ? 'Desactivar cámara' : 'Activar cámara'}
          >
            {localControls.videoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>

          {/* Colgar llamada */}
          <button
            onClick={handleEndCall}
            className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors"
            title="Terminar llamada"
          >
            <PhoneOff className="w-5 h-5" />
          </button>

          {/* Pantalla completa */}
          <button
            onClick={toggleFullscreen}
            className="p-3 bg-gray-700 hover:bg-gray-600 text-white rounded-full transition-colors"
            title="Pantalla completa"
          >
            <Monitor className="w-5 h-5" />
          </button>

          {/* Configuración */}
          <button
            onClick={() => {/* TODO: Abrir panel de configuración */}}
            className="p-3 bg-gray-700 hover:bg-gray-600 text-white rounded-full transition-colors"
            title="Configuración"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
        
        {/* Información de estado */}
        <div className="mt-4 text-center">
          <p className="text-white text-sm">
            {callState.status?.doctor_connected && callState.status?.patient_connected
              ? '✅ Ambos participantes conectados'
              : callState.status?.patient_connected
              ? '⏳ Esperando al doctor...'
              : '🔄 Conectando...'
            }
          </p>
        </div>
      </div>
    </div>
  );
}