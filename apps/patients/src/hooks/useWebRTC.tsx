import { useState, useEffect, useCallback, useRef } from 'react';

export interface WebRTCConfig {
  serverUrl: string;
  roomId: string;
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
}

export function useWebRTC(config: WebRTCConfig) {
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

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  // Configurar WebRTC
  const setupPeerConnection = useCallback(() => {
    const peerConnection = new RTCPeerConnection({
      iceServers: config.iceServers || [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });

    peerConnectionRef.current = peerConnection;

    // Event listeners
    peerConnection.onconnectionstatechange = () => {
      setState(prev => ({
        ...prev,
        connectionState: peerConnection.connectionState,
        isConnected: peerConnection.connectionState === 'connected'
      }));
    };

    peerConnection.oniceconnectionstatechange = () => {
      setState(prev => ({
        ...prev,
        iceConnectionState: peerConnection.iceConnectionState
      }));
    };

    peerConnection.ontrack = (event) => {
      remoteStreamRef.current = event.streams[0];
      setState(prev => ({
        ...prev,
        remoteStream: event.streams[0],
        hasRemoteStream: true
      }));
    };

    return peerConnection;
  }, [config.iceServers]);

  // Obtener stream local
  const getLocalStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: config.enableAudio !== false,
        video: config.enableVideo !== false
      });

      localStreamRef.current = stream;
      setState(prev => ({
        ...prev,
        localStream: stream,
        hasLocalStream: true
      }));

      // Agregar tracks al peer connection
      if (peerConnectionRef.current) {
        stream.getTracks().forEach(track => {
          peerConnectionRef.current!.addTrack(track, stream);
        });
      }

      return stream;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: `Error al obtener stream: ${error}`
      }));
      throw error;
    }
  }, [config.enableAudio, config.enableVideo]);

  // Conectar al room
  const joinRoom = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isConnecting: true, error: null }));

      // Configurar WebSocket
      const socket = new WebSocket(config.serverUrl);
      socketRef.current = socket;

      socket.onopen = async () => {
        // Enviar mensaje de join
        socket.send(JSON.stringify({
          type: 'join-room',
          roomId: config.roomId,
          userId: config.userId,
          userType: config.userType
        }));

        // Obtener stream local
        await getLocalStream();
      };

      socket.onmessage = async (event) => {
        const message = JSON.parse(event.data);
        
        if (message.type === 'offer') {
          const peerConnection = setupPeerConnection();
          await peerConnection.setRemoteDescription(new RTCSessionDescription(message.data));
          const answer = await peerConnection.createAnswer();
          await peerConnection.setLocalDescription(answer);
          
          socket.send(JSON.stringify({
            type: 'answer',
            roomId: config.roomId,
            userId: config.userId,
            data: answer
          }));
        } else if (message.type === 'answer') {
          if (peerConnectionRef.current) {
            await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(message.data));
          }
        } else if (message.type === 'ice-candidate') {
          if (peerConnectionRef.current) {
            await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(message.data));
          }
        }
      };

      socket.onerror = (error) => {
        setState(prev => ({
          ...prev,
          error: `Error de WebSocket: ${error}`
        }));
      };

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: `Error al conectar: ${error}`,
        isConnecting: false
      }));
    }
  }, [config, setupPeerConnection, getLocalStream]);

  // Desconectar
  const leaveRoom = useCallback(async () => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
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
      iceConnectionState: 'new'
    }));
  }, []);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
      }
    }
  }, []);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
      }
    }
  }, []);

  // Toggle screen share
  const toggleScreenShare = useCallback(async () => {
    try {
      if (!localStreamRef.current) return;

      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        if (videoTrack.getSettings().displaySurface) {
          // Detener screen share
          videoTrack.stop();
          const newStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: config.enableAudio !== false
          });
          const newVideoTrack = newStream.getVideoTracks()[0];
          localStreamRef.current.removeTrack(videoTrack);
          localStreamRef.current.addTrack(newVideoTrack);
        } else {
          // Iniciar screen share
          const screenStream = await navigator.mediaDevices.getDisplayMedia({
            video: true
          });
          const screenTrack = screenStream.getVideoTracks()[0];
          localStreamRef.current.removeTrack(videoTrack);
          localStreamRef.current.addTrack(screenTrack);
        }
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: `Error en screen share: ${error}`
      }));
    }
  }, [config.enableAudio]);

  // Enviar mensaje
  const sendMessage = useCallback((message: string) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'chat-message',
        roomId: config.roomId,
        userId: config.userId,
        data: { message }
      }));
    }
  }, [config.roomId, config.userId]);

  // Obtener estadísticas
  const getStats = useCallback((): ConnectionStats => {
    return {
      bitrate: 0,
      packetLoss: 0,
      latency: 0,
      quality: 'good'
    };
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      leaveRoom();
    };
  }, [leaveRoom]);

  return {
    ...state,
    joinRoom,
    leaveRoom,
    toggleMute,
    toggleVideo,
    toggleScreenShare,
    sendMessage,
    getStats
  };
} 