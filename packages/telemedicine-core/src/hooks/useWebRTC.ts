import { useState, useEffect, useCallback, useRef } from 'react';
import { WebRTCClient } from '../client/WebRTCClient';
import {
  WebRTCConfig,
  WebRTCState,
  WebRTCActions,
  ConnectionStats,
  TelemedicineError
} from '../types';

export interface UseWebRTCReturn extends WebRTCState, WebRTCActions {
  client: WebRTCClient | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  // Funciones adicionales para telemedicina
  startLocalStream: () => Promise<void>;
  stopLocalStream: () => void;
  createOffer: () => Promise<RTCSessionDescriptionInit | null>;
  createAnswer: (offer: RTCSessionDescriptionInit) => Promise<RTCSessionDescriptionInit | null>;
  setRemoteDescription: (description: RTCSessionDescriptionInit) => Promise<void>;
  addIceCandidate: (candidate: RTCIceCandidateInit) => Promise<void>;
}

export function useWebRTC(config: WebRTCConfig): UseWebRTCReturn {
  const [client, setClient] = useState<WebRTCClient | null>(null);
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
    }
  });

  const clientRef = useRef<WebRTCClient | null>(null);
  const statsIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  // Inicializar cliente
  useEffect(() => {
    const newClient = new WebRTCClient(config);
    clientRef.current = newClient;
    setClient(newClient);

    // Configurar event listeners
    newClient.on('connection-state-change', (connectionState) => {
      setState(prev => ({
        ...prev,
        connectionState,
        isConnected: connectionState === 'connected'
      }));
    });

    newClient.on('ice-connection-state-change', (iceConnectionState) => {
      setState(prev => ({
        ...prev,
        iceConnectionState
      }));
    });

    newClient.on('stream-added', (stream) => {
      setState(prev => ({
        ...prev,
        remoteStream: stream,
        hasRemoteStream: true
      }));
    });

    newClient.on('error', (error: TelemedicineError) => {
      setState(prev => ({
        ...prev,
        error: error.message
      }));
    });

    return () => {
      newClient.disconnect();
    };
  }, [config]);

  // Monitorear estadísticas
  useEffect(() => {
    if (state.isConnected && clientRef.current) {
      statsIntervalRef.current = setInterval(() => {
        const stats = clientRef.current!.getStats();
        setState(prev => ({
          ...prev,
          stats
        }));
      }, 2000);
    }

    return () => {
      if (statsIntervalRef.current) {
        clearInterval(statsIntervalRef.current);
      }
    };
  }, [state.isConnected]);

  // Función mejorada para iniciar stream local con configuración médica
  const startLocalStream = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, error: null }));
      
      // Configuración de medios optimizada para telemedicina
      const constraints: MediaStreamConstraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
          channelCount: 2
        },
        video: {
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
          frameRate: { ideal: 30, min: 15 },
          facingMode: 'user',
          aspectRatio: { ideal: 16/9 }
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      setState(prev => ({
        ...prev,
        localStream: stream,
        hasLocalStream: true
      }));
      
      localStreamRef.current = stream;
      
      console.log('Stream local iniciado correctamente para telemedicina');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error accediendo a medios';
      setState(prev => ({
        ...prev,
        error: `Error de cámara/micrófono: ${errorMessage}`
      }));
      console.error('Error en startLocalStream:', err);
    }
  }, []);

  const stopLocalStream = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log(`Track ${track.kind} detenido`);
      });
      setState(prev => ({
        ...prev,
        localStream: null,
        hasLocalStream: false
      }));
      localStreamRef.current = null;
    }
  }, []);

  // Crear conexión peer con configuración médica
  const createPeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection({ 
      iceServers: config.iceServers || [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ],
      iceCandidatePoolSize: 10,
      bundlePolicy: 'max-bundle',
      rtcpMuxPolicy: 'require'
    });
    
    pc.ontrack = (event) => {
      console.log('Track remoto recibido:', event.track.kind);
      setState(prev => ({
        ...prev,
        remoteStream: event.streams[0],
        hasRemoteStream: true
      }));
    };
    
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('Nuevo candidato ICE:', event.candidate.type);
        // En producción: enviar candidato al peer remoto a través del servidor de señalización
      } else {
        console.log('Recolección de candidatos ICE completada');
      }
    };
    
    pc.onconnectionstatechange = () => {
      console.log('Estado de conexión:', pc.connectionState);
      setState(prev => ({
        ...prev,
        connectionState: pc.connectionState,
        isConnected: pc.connectionState === 'connected'
      }));
      
      if (pc.connectionState === 'failed') {
        setState(prev => ({
          ...prev,
          error: 'Conexión fallida. Verificar red o servidores TURN.'
        }));
      } else if (pc.connectionState === 'disconnected') {
        setState(prev => ({
          ...prev,
          error: 'Conexión perdida. Intentando reconectar...'
        }));
      }
    };
    
    pc.oniceconnectionstatechange = () => {
      console.log('Estado ICE:', pc.iceConnectionState);
      setState(prev => ({
        ...prev,
        iceConnectionState: pc.iceConnectionState
      }));
      
      if (pc.iceConnectionState === 'failed') {
        // Intentar reiniciar ICE
        pc.restartIce();
      }
    };

    pc.ondatachannel = (event) => {
      console.log('Canal de datos recibido:', event.channel.label);
    };
    
    return pc;
  }, [config.iceServers]);

  const createOffer = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, error: null }));
      const pc = createPeerConnection();
      peerConnectionRef.current = pc;
      
      // Agregar tracks locales
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => {
          pc.addTrack(track, localStreamRef.current!);
          console.log(`Track ${track.kind} agregado a la conexión`);
        });
      }
      
      // Crear canal de datos para chat/metadatos médicos
      const dataChannel = pc.createDataChannel('medical-data', {
        ordered: true
      });
      
      dataChannel.onopen = () => console.log('Canal de datos médicos abierto');
      dataChannel.onmessage = (event) => console.log('Mensaje de datos médicos:', event.data);
      
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });
      
      await pc.setLocalDescription(offer);
      
      console.log('Oferta creada y establecida como descripción local');
      return offer;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error creando oferta';
      setState(prev => ({
        ...prev,
        error: `Error de conexión: ${errorMessage}`
      }));
      console.error('Error en createOffer:', err);
      return null;
    }
  }, [createPeerConnection]);

  const createAnswer = useCallback(async (offer: RTCSessionDescriptionInit) => {
    try {
      setState(prev => ({ ...prev, error: null }));
      const pc = createPeerConnection();
      peerConnectionRef.current = pc;
      
      // Agregar tracks locales
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => {
          pc.addTrack(track, localStreamRef.current!);
          console.log(`Track ${track.kind} agregado a la conexión`);
        });
      }
      
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      
      const answer = await pc.createAnswer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });
      
      await pc.setLocalDescription(answer);
      
      console.log('Respuesta creada y establecida como descripción local');
      return answer;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error creando respuesta';
      setState(prev => ({
        ...prev,
        error: `Error de conexión: ${errorMessage}`
      }));
      console.error('Error en createAnswer:', err);
      return null;
    }
  }, [createPeerConnection]);

  const setRemoteDescription = useCallback(async (description: RTCSessionDescriptionInit) => {
    try {
      if (peerConnectionRef.current && peerConnectionRef.current.signalingState !== 'closed') {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(description));
        console.log('Descripción remota establecida:', description.type);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error estableciendo descripción remota';
      setState(prev => ({
        ...prev,
        error: `Error de señalización: ${errorMessage}`
      }));
      console.error('Error en setRemoteDescription:', err);
    }
  }, []);

  const addIceCandidate = useCallback(async (candidate: RTCIceCandidateInit) => {
    try {
      if (peerConnectionRef.current && peerConnectionRef.current.remoteDescription) {
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        console.log('Candidato ICE agregado:', candidate.type);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error agregando candidato ICE';
      console.warn('Candidato ICE ignorado:', errorMessage);
      // No establecer error aquí ya que algunos candidatos pueden fallar normalmente
    }
  }, []);

  // Acciones principales
  const connect = useCallback(async () => {
    if (!clientRef.current) return;

    try {
      setState(prev => ({ ...prev, isConnecting: true, error: null }));
      await clientRef.current.connect();
      
      // Obtener stream local
      await startLocalStream();
      setState(prev => ({
        ...prev,
        isConnecting: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Error de conexión',
        isConnecting: false
      }));
    }
  }, [startLocalStream]);

  const disconnect = useCallback(() => {
    console.log('Desconectando llamada de telemedicina...');
    
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
      console.log('Conexión peer cerrada');
    }
    
    if (clientRef.current) {
      clientRef.current.disconnect();
    }
    
    stopLocalStream();
    setState(prev => ({
      ...prev,
      isConnected: false,
      hasLocalStream: false,
      hasRemoteStream: false,
      localStream: null,
      remoteStream: null,
      error: null
    }));
    
    console.log('Desconexión completada');
  }, [stopLocalStream]);

  const joinRoom = useCallback(async () => {
    await connect();
  }, [connect]);

  const leaveRoom = useCallback(async () => {
    disconnect();
  }, [disconnect]);

  const toggleMute = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.toggleMute();
    }
  }, []);

  const toggleVideo = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.toggleVideo();
    }
  }, []);

  const toggleScreenShare = useCallback(async () => {
    if (clientRef.current) {
      await clientRef.current.toggleScreenShare();
    }
  }, []);

  const sendMessage = useCallback((message: string) => {
    if (clientRef.current) {
      clientRef.current.sendMessage(message);
    }
  }, []);

  const setVideoQuality = useCallback(async (quality: 'low' | 'medium' | 'high') => {
    if (clientRef.current) {
      await clientRef.current.setVideoQuality(quality);
    }
  }, []);

  const enableNoiseReduction = useCallback(async (enabled: boolean) => {
    if (clientRef.current) {
      await clientRef.current.enableNoiseReduction(enabled);
    }
  }, []);

  const enableEchoCancellation = useCallback(async (enabled: boolean) => {
    if (clientRef.current) {
      await clientRef.current.enableEchoCancellation(enabled);
    }
  }, []);

  const getStats = useCallback((): ConnectionStats => {
    if (clientRef.current) {
      return clientRef.current.getStats();
    }
    return {
      bitrate: 0,
      packetLoss: 0,
      latency: 0,
      quality: 'good'
    };
  }, []);

  // Cleanup automático al desmontar
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  // Manejo de reconexión automática
  useEffect(() => {
    if (state.error && state.error.includes('Conexión perdida')) {
      const timer = setTimeout(() => {
        console.log('Intentando reconexión automática...');
        setState(prev => ({ ...prev, error: null }));
        // En producción: implementar lógica de reconexión
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [state.error]);

  return {
    ...state,
    client,
    connect,
    disconnect,
    joinRoom,
    leaveRoom,
    toggleMute,
    toggleVideo,
    toggleScreenShare,
    sendMessage,
    setVideoQuality,
    enableNoiseReduction,
    enableEchoCancellation,
    getStats,
    // Funciones adicionales para telemedicina
    startLocalStream,
    stopLocalStream,
    createOffer,
    createAnswer,
    setRemoteDescription,
    addIceCandidate
  };
} 