import { io, Socket } from 'socket.io-client';
import {
  WebRTCConfig,
  WebRTCState,
  WebRTCActions,
  SignalingMessage,
  ConnectionStats,
  TelemedicineError,
  WebRTCEvents
} from '../types';

export class WebRTCClient {
  private config: WebRTCConfig;
  private socket: Socket | null = null;
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private screenStream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private recordingChunks: Blob[] = [];
  private statsInterval: NodeJS.Timeout | null = null;
  private eventListeners: Map<keyof WebRTCEvents, Set<WebRTCEvents[keyof WebRTCEvents]>> = new Map();

  // Estado
  private state: WebRTCState = {
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
  };

  constructor(config: WebRTCConfig) {
    this.config = config;
    this.initializePeerConnection();
  }

  private initializePeerConnection(): void {
    const iceServers: RTCIceServer[] = this.config.iceServers || [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' }
    ];

    this.peerConnection = new RTCPeerConnection({ iceServers });

    // Event handlers
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendSignalingMessage('ice-candidate', event.candidate);
      }
    };

    this.peerConnection.onconnectionstatechange = () => {
      if (this.peerConnection) {
        this.state.connectionState = this.peerConnection.connectionState;
        this.state.isConnected = this.peerConnection.connectionState === 'connected';
        this.emit('connection-state-change', this.peerConnection.connectionState);
      }
    };

    this.peerConnection.oniceconnectionstatechange = () => {
      if (this.peerConnection) {
        this.state.iceConnectionState = this.peerConnection.iceConnectionState;
        this.emit('ice-connection-state-change', this.peerConnection.iceConnectionState);
      }
    };

    this.peerConnection.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        this.remoteStream = event.streams[0];
        this.state.remoteStream = this.remoteStream;
        this.state.hasRemoteStream = true;
        this.emit('stream-added', this.remoteStream);
      }
    };
  }

  async connect(): Promise<void> {
    try {
      this.state.isConnecting = true;
      this.state.error = null;

      // Conectar al servidor de signaling
      this.socket = io(this.config.serverUrl, {
        query: {
          roomId: this.config.roomId,
          userId: this.config.userId,
          userType: this.config.userType
        }
      });

      this.socket.on('connect', () => {
        console.log('Conectado al servidor de signaling');
        this.joinRoom();
      });

      this.socket.on('disconnect', () => {
        console.log('Desconectado del servidor de signaling');
        this.state.isConnected = false;
      });

      this.socket.on('offer', async (offer: RTCSessionDescriptionInit) => {
        await this.handleOffer(offer);
      });

      this.socket.on('answer', async (answer: RTCSessionDescriptionInit) => {
        await this.handleAnswer(answer);
      });

      this.socket.on('ice-candidate', async (candidate: RTCIceCandidateInit) => {
        await this.handleIceCandidate(candidate);
      });

      this.socket.on('error', (error: TelemedicineError) => {
        this.state.error = error.message;
        this.emit('error', error);
      });

    } catch (error) {
      this.state.error = error instanceof Error ? error.message : 'Error desconocido';
      this.state.isConnecting = false;
      throw error;
    }
  }

  private async joinRoom(): Promise<void> {
    if (!this.socket) return;

    this.sendSignalingMessage('join-room', {
      roomId: this.config.roomId,
      userId: this.config.userId,
      userType: this.config.userType
    });
  }

  async startLocalStream(constraints?: MediaStreamConstraints): Promise<MediaStream> {
    try {
      const defaultConstraints: MediaStreamConstraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000
        },
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
          facingMode: 'user'
        }
      };

      this.localStream = await navigator.mediaDevices.getUserMedia(
        constraints || defaultConstraints
      );

      this.state.localStream = this.localStream;
      this.state.hasLocalStream = true;

      // Agregar tracks al peer connection
      if (this.peerConnection) {
        this.localStream.getTracks().forEach(track => {
          this.peerConnection!.addTrack(track, this.localStream!);
        });
      }

      return this.localStream;
    } catch (error) {
      this.state.error = error instanceof Error ? error.message : 'Error al obtener stream local';
      throw error;
    }
  }

  async createOffer(): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) {
      throw new Error('Peer connection no inicializada');
    }

    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);
    return offer;
  }

  async createAnswer(): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) {
      throw new Error('Peer connection no inicializada');
    }

    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);
    return answer;
  }

  private async handleOffer(offer: RTCSessionDescriptionInit): Promise<void> {
    if (!this.peerConnection) return;

    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await this.createAnswer();
    this.sendSignalingMessage('answer', answer);
  }

  private async handleAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    if (!this.peerConnection) return;

    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
  }

  private async handleIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    if (!this.peerConnection) return;

    await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  }

  private sendSignalingMessage(type: SignalingMessage['type'], data: any): void {
    if (!this.socket) return;

    const message: SignalingMessage = {
      type,
      roomId: this.config.roomId,
      userId: this.config.userId,
      userType: this.config.userType,
      data,
      timestamp: new Date().toISOString()
    };

    this.socket.emit('signaling', message);
  }

  // Acciones públicas
  async joinRoom(): Promise<void> {
    await this.connect();
  }

  async leaveRoom(): Promise<void> {
    this.disconnect();
  }

  toggleMute(): void {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
      }
    }
  }

  toggleVideo(): void {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
      }
    }
  }

  async toggleScreenShare(): Promise<void> {
    try {
      if (!this.screenStream) {
        this.screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });

        // Reemplazar video track
        if (this.peerConnection && this.localStream) {
          const videoTrack = this.screenStream.getVideoTracks()[0];
          const sender = this.peerConnection.getSenders().find(s => 
            s.track?.kind === 'video'
          );
          if (sender) {
            sender.replaceTrack(videoTrack);
          }
        }
      } else {
        this.screenStream.getTracks().forEach(track => track.stop());
        this.screenStream = null;

        // Restaurar video track original
        if (this.peerConnection && this.localStream) {
          const videoTrack = this.localStream.getVideoTracks()[0];
          const sender = this.peerConnection.getSenders().find(s => 
            s.track?.kind === 'video'
          );
          if (sender && videoTrack) {
            sender.replaceTrack(videoTrack);
          }
        }
      }
    } catch (error) {
      this.state.error = error instanceof Error ? error.message : 'Error al compartir pantalla';
      throw error;
    }
  }

  sendMessage(message: string): void {
    this.sendSignalingMessage('chat-message', { message });
  }

  async setVideoQuality(quality: 'low' | 'medium' | 'high'): Promise<void> {
    if (!this.localStream) return;

    const videoTrack = this.localStream.getVideoTracks()[0];
    if (!videoTrack) return;

    const constraints = {
      low: { width: 640, height: 480, frameRate: 15 },
      medium: { width: 1280, height: 720, frameRate: 30 },
      high: { width: 1920, height: 1080, frameRate: 30 }
    };

    try {
      await videoTrack.applyConstraints(constraints[quality]);
    } catch (error) {
      this.state.error = error instanceof Error ? error.message : 'Error al cambiar calidad de video';
      throw error;
    }
  }

  async enableNoiseReduction(enabled: boolean): Promise<void> {
    if (!this.localStream) return;

    const audioTrack = this.localStream.getAudioTracks()[0];
    if (!audioTrack) return;

    try {
      await audioTrack.applyConstraints({
        noiseSuppression: enabled
      });
    } catch (error) {
      this.state.error = error instanceof Error ? error.message : 'Error al configurar supresión de ruido';
      throw error;
    }
  }

  async enableEchoCancellation(enabled: boolean): Promise<void> {
    if (!this.localStream) return;

    const audioTrack = this.localStream.getAudioTracks()[0];
    if (!audioTrack) return;

    try {
      await audioTrack.applyConstraints({
        echoCancellation: enabled
      });
    } catch (error) {
      this.state.error = error instanceof Error ? error.message : 'Error al configurar cancelación de eco';
      throw error;
    }
  }

  getStats(): ConnectionStats {
    return this.state.stats;
  }

  // Event handling
  on<K extends keyof WebRTCEvents>(event: K, listener: WebRTCEvents[K]): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(listener);
  }

  off<K extends keyof WebRTCEvents>(event: K, listener: WebRTCEvents[K]): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  private emit<K extends keyof WebRTCEvents>(event: K, ...args: Parameters<WebRTCEvents[K]>): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        (listener as any)(...args);
      });
    }
  }

  // Cleanup
  disconnect(): void {
    // Detener streams
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    if (this.screenStream) {
      this.screenStream.getTracks().forEach(track => track.stop());
      this.screenStream = null;
    }

    // Cerrar peer connection
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    // Desconectar socket
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    // Limpiar intervalos
    if (this.statsInterval) {
      clearInterval(this.statsInterval);
      this.statsInterval = null;
    }

    // Resetear estado
    this.state = {
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
    };
  }

  // Getters
  getState(): WebRTCState {
    return { ...this.state };
  }
} 