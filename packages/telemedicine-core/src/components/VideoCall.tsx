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
  Record,
  Square,
  Download
} from 'lucide-react';
import { useWebRTC, WebRTCConfig, ConnectionStats } from '../types';

interface VideoCallProps {
  config: WebRTCConfig;
  onEndCall: () => void;
  onError?: (error: string) => void;
  showControls?: boolean;
  showStats?: boolean;
  className?: string;
}

export function VideoCall({
  config,
  onEndCall,
  onError,
  showControls = true,
  showStats = true,
  className = ''
}: VideoCallProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingUrl, setRecordingUrl] = useState<string>('');
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

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
    setVideoQuality,
    enableNoiseReduction,
    enableEchoCancellation
  } = useWebRTC(config);

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

  // Auto-conectar
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

  // Manejar grabación
  const startRecording = async () => {
    if (localStream) {
      const recorder = new MediaRecorder(localStream, {
        mimeType: 'video/webm;codecs=vp9'
      });
      
      const chunks: Blob[] = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setRecordingUrl(url);
      };
      
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const downloadRecording = () => {
    if (recordingUrl) {
      const a = document.createElement('a');
      a.href = recordingUrl;
      a.download = `telemedicine-recording-${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
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
      case 'excellent':
        return <div className="w-3 h-3 bg-green-500 rounded-full" />;
      case 'good':
        return <div className="w-3 h-3 bg-blue-500 rounded-full" />;
      case 'fair':
        return <div className="w-3 h-3 bg-yellow-500 rounded-full" />;
      case 'poor':
        return <div className="w-3 h-3 bg-red-500 rounded-full" />;
      default:
        return <div className="w-3 h-3 bg-gray-500 rounded-full" />;
    }
  };

  if (isConnecting) {
    return (
      <div className={`flex items-center justify-center min-h-[400px] bg-gray-50 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Conectando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative bg-black rounded-lg overflow-hidden ${className}`}>
      {/* Video remoto (principal) */}
      <video
        ref={remoteVideoRef}
        className="w-full h-full object-cover"
        autoPlay
        playsInline
        muted={false}
      />

      {/* Video local (esquina) */}
      <div className="absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden">
        <video
          ref={localVideoRef}
          className="w-full h-full object-cover"
          autoPlay
          playsInline
          muted
        />
      </div>

      {/* Indicador de estado */}
      <div className="absolute top-4 left-4 bg-black bg-opacity-75 rounded-lg p-2 text-white text-sm">
        <div className="flex items-center gap-2">
          {getConnectionQualityIcon(stats.quality)}
          <span>{getConnectionStatus()}</span>
        </div>
      </div>

      {/* Estadísticas */}
      {showStats && (
        <div className="absolute bottom-4 right-4 bg-black bg-opacity-75 rounded-lg p-2 text-white text-xs">
          <div className="flex items-center gap-4">
            <div>
              <span>Bitrate: {Math.round(stats.bitrate)} kbps</span>
            </div>
            <div>
              <span>Latencia: {Math.round(stats.latency)}ms</span>
            </div>
            <div>
              <span>Pérdida: {stats.packetLoss.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Controles */}
      {showControls && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
          <div className="flex items-center justify-center gap-4">
            {/* Mute */}
            <button
              onClick={toggleMute}
              className="p-3 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-colors"
            >
              {localStream?.getAudioTracks()[0]?.enabled ? (
                <Mic className="w-5 h-5 text-white" />
              ) : (
                <MicOff className="w-5 h-5 text-white" />
              )}
            </button>

            {/* Video */}
            <button
              onClick={toggleVideo}
              className="p-3 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-colors"
            >
              {localStream?.getVideoTracks()[0]?.enabled ? (
                <Video className="w-5 h-5 text-white" />
              ) : (
                <VideoOff className="w-5 h-5 text-white" />
              )}
            </button>

            {/* Compartir pantalla */}
            <button
              onClick={toggleScreenShare}
              className="p-3 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-colors"
            >
              <Monitor className="w-5 h-5 text-white" />
            </button>

            {/* Grabación */}
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`p-3 rounded-full transition-colors ${
                isRecording 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-white bg-opacity-20 hover:bg-opacity-30'
              }`}
            >
              {isRecording ? (
                <Square className="w-5 h-5 text-white" />
              ) : (
                <Record className="w-5 h-5 text-white" />
              )}
            </button>

            {/* Descargar grabación */}
            {recordingUrl && (
              <button
                onClick={downloadRecording}
                className="p-3 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-colors"
              >
                <Download className="w-5 h-5 text-white" />
              </button>
            )}

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-3 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-colors"
            >
              {isFullscreen ? (
                <Minimize className="w-5 h-5 text-white" />
              ) : (
                <Maximize className="w-5 h-5 text-white" />
              )}
            </button>

            {/* Configuración */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-3 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-colors"
            >
              <Settings className="w-5 h-5 text-white" />
            </button>

            {/* Finalizar llamada */}
            <button
              onClick={handleEndCall}
              className="p-3 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
            >
              <PhoneOff className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      )}

      {/* Panel de configuración */}
      {showSettings && (
        <div className="absolute top-4 left-4 bg-white rounded-lg p-4 shadow-lg">
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Configuración</h3>
            
            {/* Calidad de video */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Calidad de video
              </label>
              <select
                onChange={(e) => setVideoQuality(e.target.value as any)}
                className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
              </select>
            </div>

            {/* Supresión de ruido */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="noise-reduction"
                onChange={(e) => enableNoiseReduction(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="noise-reduction" className="text-sm text-gray-700">
                Supresión de ruido
              </label>
            </div>

            {/* Cancelación de eco */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="echo-cancellation"
                onChange={(e) => enableEchoCancellation(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="echo-cancellation" className="text-sm text-gray-700">
                Cancelación de eco
              </label>
            </div>

            <button
              onClick={() => setShowSettings(false)}
              className="w-full px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Indicador de error */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-4 max-w-sm text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-600 font-medium">Error de conexión</p>
            <p className="text-gray-600 text-sm mt-1">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Reintentar
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 