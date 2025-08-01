/**
 * Hook WebRTC Híbrido - Integración completa
 * WebRTC + Socket.IO Signaling + Firebase Persistence
 * Altamedica - Integración de useWebRTC con sistema híbrido
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './useAuth';

// Interfaces del WebRTC original
export interface WebRTCConfig {
  sessionId: string;
  roomId: string;
  socket: Socket | null;
  userId: string;
  userType: 'doctor' | 'patient';
  iceServers?: RTCIceServer[];
  enableAudio?: boolean;
  enableVideo?: boolean;
  enableScreenShare?: boolean;
  enableRecording?: boolean;
}

export interface ConnectionStats {
  bitrate: number;
  packetLoss: number;
  latency: number;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  resolution?: {
    width: number;
    height: number;
  };
  frameRate?: number;
}

export interface WebRTCState {
  isConnected: boolean;
  isConnecting: boolean;
  hasLocalStream: boolean;
  hasRemoteStream: boolean;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  connectionState: RTCPeerConnectionState;
  iceConnectionState: RTCIceConnectionState;
  error: string | null;
  stats: ConnectionStats;
  
  // Nuevas propiedades híbridas
  isRecording: boolean;
  recordingUrl?: string;
  audioEnabled: boolean;
  videoEnabled: boolean;
  screenShareEnabled: boolean;
  sessionPersisted: boolean;
}

const DEFAULT_ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  // En producción, agregar TURN servers
  // { urls: 'turn:your-turn-server.com:3478', username: 'user', credential: 'pass' }
];

export function useWebRTCHybrid(config: WebRTCConfig) {
  const { authState } = useAuth();
  
  const [state, setState] = useState<WebRTCState>({
    isConnected: false,
    isConnecting: false,
    hasLocalStream: false,
    hasRemoteStream: false,
    localStream: null,
    remoteStream: null,
    connectionState: 'new',
    iceConnectionState: 'new',
    error: null,
    stats: {
      bitrate: 0,
      packetLoss: 0,
      latency: 0,
      quality: 'good'
    },
    // Propiedades híbridas
    isRecording: false,
    audioEnabled: config.enableAudio !== false,
    videoEnabled: config.enableVideo !== false,
    screenShareEnabled: false,
    sessionPersisted: false
  });

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const statsIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Persistir estado en Firebase
  const persistWebRTCState = useCallback(async (updates: Partial<WebRTCState>) => {
    if (!config.sessionId || !db) return;

    try {
      const sessionRef = doc(db, 'telemedicine_sessions', config.sessionId);
      await updateDoc(sessionRef, {
        webrtcState: {
          connectionState: updates.connectionState || state.connectionState,
          iceConnectionState: updates.iceConnectionState || state.iceConnectionState,
          audioEnabled: updates.audioEnabled ?? state.audioEnabled,
          videoEnabled: updates.videoEnabled ?? state.videoEnabled,
          screenShareEnabled: updates.screenShareEnabled ?? state.screenShareEnabled,
          isRecording: updates.isRecording ?? state.isRecording,
          recordingUrl: updates.recordingUrl || state.recordingUrl,
          lastUpdate: serverTimestamp()
        },
        updatedAt: serverTimestamp()
      });

      setState(prev => ({ ...prev, sessionPersisted: true }));
      console.log('💾 Estado WebRTC persistido en Firebase');
    } catch (error) {
      console.error('Error persistiendo estado WebRTC:', error);
    }
  }, [config.sessionId, state]);

  // Configurar peer connection con eventos híbridos
  const setupPeerConnection = useCallback(() => {
    const peerConnection = new RTCPeerConnection({
      iceServers: config.iceServers || DEFAULT_ICE_SERVERS
    });

    peerConnectionRef.current = peerConnection;

    // Eventos WebRTC con persistencia Firebase
    peerConnection.onconnectionstatechange = () => {
      const newState = peerConnection.connectionState;
      console.log('🔗 Estado de conexión WebRTC:', newState);
      
      setState(prev => ({
        ...prev,
        connectionState: newState,
        isConnected: newState === 'connected',
        isConnecting: newState === 'connecting'
      }));

      // Persistir cambio de estado
      persistWebRTCState({ 
        connectionState: newState,
        isConnected: newState === 'connected'
      });

      // Notificar via Socket.IO para tiempo real
      if (config.socket) {
        config.socket.emit('webrtc-connection-state', {
          sessionId: config.sessionId,
          state: newState,
          userId: config.userId
        });
      }
    };

    peerConnection.oniceconnectionstatechange = () => {
      const newState = peerConnection.iceConnectionState;
      console.log('🧊 Estado de conexión ICE:', newState);
      
      setState(prev => ({
        ...prev,
        iceConnectionState: newState
      }));

      persistWebRTCState({ iceConnectionState: newState });
    };

    peerConnection.ontrack = (event) => {
      console.log('📹 Stream remoto recibido');
      const remoteStream = event.streams[0];
      remoteStreamRef.current = remoteStream;
      
      setState(prev => ({
        ...prev,
        remoteStream: remoteStream,
        hasRemoteStream: true
      }));

      // Notificar recepción de stream
      if (config.socket) {
        config.socket.emit('webrtc-stream-received', {
          sessionId: config.sessionId,
          userId: config.userId,
          streamType: 'remote'
        });
      }
    };

    peerConnection.onicecandidate = (event) => {
      if (event.candidate && config.socket) {
        console.log('🧊 Enviando candidato ICE');
        config.socket.emit('webrtc-signal', {
          type: 'ice-candidate',
          sessionId: config.sessionId,
          from: config.userId,
          data: event.candidate
        });
      }
    };

    // Estadísticas en tiempo real
    if (statsIntervalRef.current) {
      clearInterval(statsIntervalRef.current);
    }

    statsIntervalRef.current = setInterval(async () => {
      if (peerConnection.connectionState === 'connected') {
        try {
          const stats = await peerConnection.getStats();
          const connectionStats = parseWebRTCStats(stats);
          
          setState(prev => ({
            ...prev,
            stats: connectionStats
          }));
        } catch (error) {
          console.error('Error obteniendo estadísticas:', error);
        }
      }
    }, 2000);

    return peerConnection;
  }, [config, persistWebRTCState]);

  // Parsear estadísticas WebRTC
  const parseWebRTCStats = (stats: RTCStatsReport): ConnectionStats => {
    let bitrate = 0;
    let packetLoss = 0;
    let latency = 0;
    let resolution = { width: 0, height: 0 };
    let frameRate = 0;

    stats.forEach((report) => {
      if (report.type === 'inbound-rtp' && report.mediaType === 'video') {
        bitrate = report.bytesReceived * 8 / 1000; // Convert to kbps
        packetLoss = report.packetsLost || 0;
        frameRate = report.framesPerSecond || 0;
      }
      
      if (report.type === 'track' && report.kind === 'video') {
        resolution.width = report.frameWidth || 0;
        resolution.height = report.frameHeight || 0;
      }
      
      if (report.type === 'candidate-pair' && report.state === 'succeeded') {
        latency = report.currentRoundTripTime * 1000 || 0; // Convert to ms
      }
    });

    const quality: ConnectionStats['quality'] = 
      bitrate > 1000 && packetLoss < 1 ? 'excellent' :
      bitrate > 500 && packetLoss < 3 ? 'good' :
      bitrate > 200 && packetLoss < 5 ? 'fair' : 'poor';

    return { bitrate, packetLoss, latency, quality, resolution, frameRate };
  };

  // Obtener stream local con persistencia
  const getLocalStream = useCallback(async () => {
    try {
      console.log('🔄 Obteniendo stream local...');
      setState(prev => ({ ...prev, isConnecting: true }));
      
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: config.enableAudio !== false,
        video: config.enableVideo !== false ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        } : false
      });

      localStreamRef.current = stream;
      
      setState(prev => ({
        ...prev,
        localStream: stream,
        hasLocalStream: true,
        error: null,
        isConnecting: false
      }));

      // Persistir obtención de stream
      persistWebRTCState({ hasLocalStream: true });

      console.log('✅ Stream local obtenido:', stream.getTracks().map(t => t.kind));
      return stream;
    } catch (error) {
      const errorMsg = `Error al obtener stream: ${error}`;
      console.error('❌', errorMsg);
      
      setState(prev => ({
        ...prev,
        error: errorMsg,
        isConnecting: false
      }));
      
      throw error;
    }
  }, [config.enableAudio, config.enableVideo, persistWebRTCState]);

  // Inicializar WebRTC híbrido
  const initializeWebRTC = useCallback(async () => {
    if (!config.socket || !config.sessionId) {
      console.warn('❌ Socket o sessionId no disponible');
      return;
    }

    try {
      console.log('🚀 Inicializando WebRTC híbrido...');
      
      // 1. Obtener stream local
      await getLocalStream();
      
      // 2. Configurar peer connection
      const peerConnection = setupPeerConnection();
      
      // 3. Agregar tracks al peer connection
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => {
          peerConnection.addTrack(track, localStreamRef.current!);
          console.log('🎵 Track agregado:', track.kind);
        });
      }

      // 4. Configurar eventos Socket.IO para WebRTC
      config.socket.on('webrtc-signal', async (data) => {
        console.log('📡 Señal WebRTC recibida:', data.type);
        
        try {
          if (data.type === 'offer' && config.userType === 'patient') {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(data.data));
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            
            config.socket!.emit('webrtc-signal', {
              type: 'answer',
              sessionId: config.sessionId,
              from: config.userId,
              to: data.from,
              data: answer
            });
            
          } else if (data.type === 'answer' && config.userType === 'doctor') {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(data.data));
            
          } else if (data.type === 'ice-candidate') {
            await peerConnection.addIceCandidate(new RTCIceCandidate(data.data));
          }
        } catch (error) {
          console.error('Error procesando señal WebRTC:', error);
        }
      });

      // 5. Si somos doctor, crear oferta automáticamente
      if (config.userType === 'doctor') {
        setTimeout(() => createOffer(), 1000);
      }

    } catch (error) {
      console.error('❌ Error inicializando WebRTC:', error);
      setState(prev => ({
        ...prev,
        error: `Error de inicialización: ${error instanceof Error ? error.message : 'Error desconocido'}`
      }));
    }
  }, [config, getLocalStream, setupPeerConnection]);

  // Crear oferta WebRTC
  const createOffer = useCallback(async () => {
    if (!peerConnectionRef.current || !config.socket) return;
    
    try {
      console.log('📤 Creando oferta WebRTC...');
      const offer = await peerConnectionRef.current.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });
      
      await peerConnectionRef.current.setLocalDescription(offer);
      
      config.socket.emit('webrtc-signal', {
        type: 'offer',
        sessionId: config.sessionId,
        from: config.userId,
        data: offer
      });
      
      console.log('✅ Oferta WebRTC enviada');
    } catch (error) {
      console.error('❌ Error creando oferta:', error);
    }
  }, [config]);

  // Toggle audio con persistencia
  const toggleAudio = useCallback(async () => {
    if (!localStreamRef.current) return;

    const audioTrack = localStreamRef.current.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      const newState = audioTrack.enabled;
      
      setState(prev => ({ ...prev, audioEnabled: newState }));
      persistWebRTCState({ audioEnabled: newState });
      
      // Notificar cambio via Socket.IO
      if (config.socket) {
        config.socket.emit('toggle-media', {
          sessionId: config.sessionId,
          type: 'audio',
          enabled: newState
        });
      }
      
      console.log('🎤 Audio:', newState ? 'activado' : 'desactivado');
    }
  }, [config.socket, config.sessionId, persistWebRTCState]);

  // Toggle video con persistencia
  const toggleVideo = useCallback(async () => {
    if (!localStreamRef.current) return;

    const videoTrack = localStreamRef.current.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      const newState = videoTrack.enabled;
      
      setState(prev => ({ ...prev, videoEnabled: newState }));
      persistWebRTCState({ videoEnabled: newState });
      
      // Notificar cambio via Socket.IO
      if (config.socket) {
        config.socket.emit('toggle-media', {
          sessionId: config.sessionId,
          type: 'video',
          enabled: newState
        });
      }
      
      console.log('📹 Video:', newState ? 'activado' : 'desactivado');
    }
  }, [config.socket, config.sessionId, persistWebRTCState]);

  // Screen share híbrido
  const toggleScreenShare = useCallback(async () => {
    if (!localStreamRef.current || !peerConnectionRef.current) return;

    try {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      const isScreenSharing = videoTrack?.getSettings().displaySurface !== undefined;
      
      if (isScreenSharing) {
        // Detener screen share, volver a cámara
        videoTrack?.stop();
        const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
        const newVideoTrack = cameraStream.getVideoTracks()[0];
        
        // Reemplazar track en peer connection
        const sender = peerConnectionRef.current.getSenders().find(s => 
          s.track && s.track.kind === 'video'
        );
        if (sender) {
          await sender.replaceTrack(newVideoTrack);
        }
        
        // Actualizar stream local
        localStreamRef.current.removeTrack(videoTrack);
        localStreamRef.current.addTrack(newVideoTrack);
        
        setState(prev => ({ 
          ...prev, 
          screenShareEnabled: false,
          localStream: localStreamRef.current 
        }));
        persistWebRTCState({ screenShareEnabled: false });
        
        console.log('🖥️ Screen share detenido');
        
      } else {
        // Iniciar screen share
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: { width: 1920, height: 1080 },
          audio: true
        });
        const screenTrack = screenStream.getVideoTracks()[0];
        
        // Reemplazar track en peer connection
        const sender = peerConnectionRef.current.getSenders().find(s => 
          s.track && s.track.kind === 'video'
        );
        if (sender) {
          await sender.replaceTrack(screenTrack);
        }
        
        // Actualizar stream local
        videoTrack?.stop();
        localStreamRef.current.removeTrack(videoTrack);
        localStreamRef.current.addTrack(screenTrack);
        
        setState(prev => ({ 
          ...prev, 
          screenShareEnabled: true,
          localStream: localStreamRef.current 
        }));
        persistWebRTCState({ screenShareEnabled: true });
        
        // Notificar via Socket.IO
        if (config.socket) {
          config.socket.emit('screen-share-started', config.sessionId);
        }
        
        console.log('🖥️ Screen share iniciado');
        
        // Detectar cuando se detiene el screen share
        screenTrack.onended = () => {
          toggleScreenShare(); // Volver a cámara automáticamente
        };
      }
    } catch (error) {
      console.error('❌ Error en screen share:', error);
      setState(prev => ({
        ...prev,
        error: `Error en compartir pantalla: ${error instanceof Error ? error.message : 'Error desconocido'}`
      }));
    }
  }, [config.socket, config.sessionId, persistWebRTCState]);

  // Iniciar grabación
  const startRecording = useCallback(async () => {
    if (!localStreamRef.current) return;

    try {
      const options = { mimeType: 'video/webm;codecs=vp9' };
      mediaRecorderRef.current = new MediaRecorder(localStreamRef.current, options);
      recordedChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const recordedBlob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const recordingUrl = URL.createObjectURL(recordedBlob);
        
        setState(prev => ({ 
          ...prev, 
          isRecording: false, 
          recordingUrl 
        }));
        
        persistWebRTCState({ 
          isRecording: false, 
          recordingUrl 
        });
        
        console.log('🎬 Grabación completada:', recordingUrl);
      };

      mediaRecorderRef.current.start(1000); // 1 segundo de chunks
      
      setState(prev => ({ ...prev, isRecording: true }));
      persistWebRTCState({ isRecording: true });
      
      console.log('🔴 Grabación iniciada');
    } catch (error) {
      console.error('❌ Error iniciando grabación:', error);
    }
  }, [persistWebRTCState]);

  // Detener grabación
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording) {
      mediaRecorderRef.current.stop();
      console.log('⏹️ Grabación detenida');
    }
  }, [state.isRecording]);

  // Limpiar recursos
  const cleanup = useCallback(() => {
    console.log('🧹 Limpiando recursos WebRTC...');
    
    if (statsIntervalRef.current) {
      clearInterval(statsIntervalRef.current);
      statsIntervalRef.current = null;
    }

    if (mediaRecorderRef.current && state.isRecording) {
      mediaRecorderRef.current.stop();
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      localStreamRef.current = null;
    }

    setState(prev => ({
      ...prev,
      isConnected: false,
      isConnecting: false,
      hasLocalStream: false,
      hasRemoteStream: false,
      localStream: null,
      remoteStream: null,
      connectionState: 'new',
      iceConnectionState: 'new',
      isRecording: false,
      screenShareEnabled: false
    }));
  }, [state.isRecording]);

  // Inicializar cuando el socket esté disponible
  useEffect(() => {
    if (config.socket && config.sessionId && authState?.user) {
      initializeWebRTC();
    }

    return cleanup;
  }, [config.socket, config.sessionId, authState?.user, initializeWebRTC, cleanup]);

  return {
    ...state,
    
    // Métodos originales
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    
    // Métodos nuevos híbridos
    startRecording,
    stopRecording,
    createOffer,
    getStats: () => state.stats,
    
    // Control manual
    initializeWebRTC,
    cleanup
  };
}

export default useWebRTCHybrid;