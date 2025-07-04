import { useState, useEffect, useRef, useCallback } from 'react';

export interface WebRTCConfig {
  roomId: string;
  userId: string;
  userType: 'doctor' | 'patient';
  iceServers?: RTCIceServer[];
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
}

export interface WebRTCActions {
  joinRoom: () => Promise<void>;
  leaveRoom: () => Promise<void>;
  toggleMute: () => void;
  toggleVideo: () => void;
  toggleScreenShare: () => Promise<void>;
  sendMessage: (message: string) => void;
}

export const useWebRTC = (config: WebRTCConfig): WebRTCState & WebRTCActions => {
  // Estados principales
  const [state, setState] = useState<WebRTCState>({
    isConnected: false,
    isConnecting: false,
    hasLocalStream: false,
    hasRemoteStream: false,
    localStream: null,
    remoteStream: null,
    connectionState: 'new',
    iceConnectionState: 'new',
    error: null
  });

  // Referencias para WebRTC
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const signalingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastMessageIdRef = useRef<number>(0);

  // Configuración ICE servers
  const iceServers: RTCIceServer[] = config.iceServers || [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' }
  ];

  // Inicializar PeerConnection
  const initializePeerConnection = useCallback(() => {
    try {
      const pc = new RTCPeerConnection({ iceServers });
      
      // Configurar event handlers
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          sendSignalingMessage('ice-candidate', event.candidate);
        }
      };

      pc.onconnectionstatechange = () => {
        setState(prev => ({
          ...prev,
          connectionState: pc.connectionState,
          isConnected: pc.connectionState === 'connected'
        }));
      };

      pc.oniceconnectionstatechange = () => {
        setState(prev => ({
          ...prev,
          iceConnectionState: pc.iceConnectionState
        }));
      };

      pc.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          remoteStreamRef.current = event.streams[0];
          setState(prev => ({
            ...prev,
            remoteStream: event.streams[0],
            hasRemoteStream: true
          }));
        }
      };

      peerConnectionRef.current = pc;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: `Error inicializando conexión: ${error}`
      }));
    }
  }, [iceServers]);

  // Obtener stream local
  const getLocalStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      localStreamRef.current = stream;
      
      // Agregar tracks al PeerConnection
      if (peerConnectionRef.current) {
        stream.getTracks().forEach(track => {
          peerConnectionRef.current!.addTrack(track, stream);
        });
      }

      setState(prev => ({
        ...prev,
        localStream: stream,
        hasLocalStream: true
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: `Error accediendo a dispositivos: ${error}`
      }));
    }
  }, []);

  // Enviar mensaje de signaling
  const sendSignalingMessage = useCallback(async (type: string, data: any, to?: string) => {
    try {
      const message = {
        type,
        roomId: config.roomId,
        from: config.userId,
        to,
        data,
        timestamp: Date.now()
      };

      const response = await fetch('/api/v1/telemedicine/webrtc/signaling', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
        },
        body: JSON.stringify(message)
      });

      if (!response.ok) {
        throw new Error(`Error enviando mensaje: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error en signaling:', error);
      setState(prev => ({
        ...prev,
        error: `Error en signaling: ${error}`
      }));
    }
  }, [config.roomId, config.userId]);

  // Polling para mensajes de signaling
  const startSignalingPolling = useCallback(() => {
    signalingIntervalRef.current = setInterval(async () => {
      try {
        const response = await fetch(
          `/api/v1/telemedicine/webrtc/signaling?roomId=${config.roomId}&userId=${config.userId}&lastMessageId=${lastMessageIdRef.current}`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
            }
          }
        );

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data.messages) {
            await handleSignalingMessages(result.data.messages);
          }
        }
      } catch (error) {
        console.error('Error polling signaling:', error);
      }
    }, 1000); // Poll cada segundo
  }, [config.roomId, config.userId]);

  // Manejar mensajes de signaling
  const handleSignalingMessages = useCallback(async (messages: any[]) => {
    for (const message of messages) {
      if (message.id > lastMessageIdRef.current) {
        lastMessageIdRef.current = message.id;
      }

      if (message.to === config.userId || message.to === undefined) {
        await processSignalingMessage(message);
      }
    }
  }, [config.userId]);

  // Procesar mensaje de signaling específico
  const processSignalingMessage = useCallback(async (message: any) => {
    const pc = peerConnectionRef.current;
    if (!pc) return;

    switch (message.type) {
      case 'user-joined':
        console.log('Usuario se unió:', message.data.userId);
        break;

      case 'user-left':
        console.log('Usuario se fue:', message.data.userId);
        break;

      case 'offer':
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(message.data));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          await sendSignalingMessage('answer', answer, message.from);
        } catch (error) {
          console.error('Error procesando offer:', error);
        }
        break;

      case 'answer':
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(message.data));
        } catch (error) {
          console.error('Error procesando answer:', error);
        }
        break;

      case 'ice-candidate':
        try {
          await pc.addIceCandidate(new RTCIceCandidate(message.data));
        } catch (error) {
          console.error('Error procesando ICE candidate:', error);
        }
        break;
    }
  }, [sendSignalingMessage]);

  // Unirse a la sala
  const joinRoom = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isConnecting: true, error: null }));

      // Inicializar PeerConnection
      initializePeerConnection();

      // Obtener stream local
      await getLocalStream();

      // Unirse a la sala
      await sendSignalingMessage('join', {
        userType: config.userType,
        timestamp: Date.now()
      });

      // Iniciar polling de signaling
      startSignalingPolling();

      // Si es el doctor, crear offer
      if (config.userType === 'doctor' && peerConnectionRef.current) {
        const offer = await peerConnectionRef.current.createOffer();
        await peerConnectionRef.current.setLocalDescription(offer);
        await sendSignalingMessage('offer', offer);
      }

      setState(prev => ({ ...prev, isConnecting: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: `Error uniéndose a la sala: ${error}`
      }));
    }
  }, [config.userType, initializePeerConnection, getLocalStream, sendSignalingMessage, startSignalingPolling]);

  // Salir de la sala
  const leaveRoom = useCallback(async () => {
    try {
      // Enviar mensaje de salida
      await sendSignalingMessage('leave', {});

      // Limpiar recursos
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }

      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }

      if (signalingIntervalRef.current) {
        clearInterval(signalingIntervalRef.current);
      }

      setState({
        isConnected: false,
        isConnecting: false,
        hasLocalStream: false,
        hasRemoteStream: false,
        localStream: null,
        remoteStream: null,
        connectionState: 'new',
        iceConnectionState: 'new',
        error: null
      });

      // Limpiar referencias
      localStreamRef.current = null;
      remoteStreamRef.current = null;
      peerConnectionRef.current = null;
    } catch (error) {
      console.error('Error saliendo de la sala:', error);
    }
  }, [sendSignalingMessage]);

  // Alternar micrófono
  const toggleMute = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
      }
    }
  }, []);

  // Alternar video
  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
      }
    }
  }, []);

  // Compartir pantalla
  const toggleScreenShare = useCallback(async () => {
    try {
      if (!localStreamRef.current) return;

      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (!videoTrack) return;

      if (videoTrack.getSettings().displaySurface) {
        // Ya está compartiendo pantalla, volver a cámara
        const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
        const cameraTrack = cameraStream.getVideoTracks()[0];
        
        const sender = peerConnectionRef.current?.getSenders().find(s => 
          s.track?.kind === 'video'
        );
        
        if (sender) {
          sender.replaceTrack(cameraTrack);
        }
        
        videoTrack.stop();
        cameraStream.getAudioTracks().forEach(track => track.stop());
      } else {
        // Compartir pantalla
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = screenStream.getVideoTracks()[0];
        
        const sender = peerConnectionRef.current?.getSenders().find(s => 
          s.track?.kind === 'video'
        );
        
        if (sender) {
          sender.replaceTrack(screenTrack);
        }
        
        videoTrack.stop();
        screenStream.getAudioTracks().forEach(track => track.stop());
      }
    } catch (error) {
      console.error('Error compartiendo pantalla:', error);
    }
  }, []);

  // Enviar mensaje de chat
  const sendMessage = useCallback((message: string) => {
    // Implementar envío de mensajes de chat
    console.log('Enviando mensaje:', message);
  }, []);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (signalingIntervalRef.current) {
        clearInterval(signalingIntervalRef.current);
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, []);

  return {
    ...state,
    joinRoom,
    leaveRoom,
    toggleMute,
    toggleVideo,
    toggleScreenShare,
    sendMessage
  };
}; 