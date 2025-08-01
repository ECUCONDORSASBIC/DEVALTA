// Tipos compartidos para telemedicina

export interface TelemedicineSession {
  id: string;
  appointmentId: string;
  roomId: string;
  doctorId: string;
  patientId: string;
  doctorName: string;
  patientName: string;
  specialty: string;
  scheduledAt: string;
  status: 'waiting' | 'active' | 'ended' | 'cancelled';
  startTime?: string;
  endTime?: string;
  duration?: number;
  notes?: string;
  isTelemedicine: boolean;
  type: 'video' | 'audio' | 'chat';
}

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

export interface WebRTCActions {
  joinRoom: () => Promise<void>;
  leaveRoom: () => Promise<void>;
  toggleMute: () => void;
  toggleVideo: () => void;
  toggleScreenShare: () => Promise<void>;
  sendMessage: (message: string) => void;
  setVideoQuality: (quality: 'low' | 'medium' | 'high') => Promise<void>;
  enableNoiseReduction: (enabled: boolean) => Promise<void>;
  enableEchoCancellation: (enabled: boolean) => Promise<void>;
  getStats: () => ConnectionStats;
}

export interface ChatMessage {
  id: string;
  sender: 'doctor' | 'patient';
  message: string;
  timestamp: string;
  type: 'text' | 'file' | 'image';
  metadata?: {
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
  };
}

export interface TranscriptionSegment {
  id: string;
  speaker: 'doctor' | 'patient';
  text: string;
  timestamp: string;
  confidence: number;
}

export interface AIAnalysis {
  symptoms: string[];
  confidence: number;
  possibleConditions: Array<{
    condition: string;
    probability: number;
    severity: 'low' | 'medium' | 'high';
  }>;
  recommendations: string[];
  riskFactors: string[];
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

export interface PatientVitals {
  bloodPressure: string;
  heartRate: number;
  temperature: number;
  oxygenSaturation: number;
  weight: number;
  lastUpdated: string;
}

export interface SessionRecording {
  id: string;
  sessionId: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  fileUrl?: string;
  fileSize?: number;
  isEncrypted: boolean;
  encryptionKey?: string;
}

export interface TelemedicineSettings {
  videoQuality: 'low' | 'medium' | 'high';
  enableNoiseReduction: boolean;
  enableEchoCancellation: boolean;
  enableAutoGainControl: boolean;
  enableBandwidthOptimization: boolean;
  enableVirtualBackground: boolean;
  enableRecording: boolean;
  enableTranscription: boolean;
  enableAIAnalysis: boolean;
}

export interface SignalingMessage {
  type: 'offer' | 'answer' | 'ice-candidate' | 'join-room' | 'leave-room' | 'chat-message';
  roomId: string;
  userId: string;
  userType: 'doctor' | 'patient';
  data: any;
  timestamp: string;
}

export interface RoomParticipant {
  userId: string;
  userType: 'doctor' | 'patient';
  userName: string;
  isConnected: boolean;
  hasAudio: boolean;
  hasVideo: boolean;
  isScreenSharing: boolean;
  joinTime: string;
}

export interface TelemedicineError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// Eventos de WebRTC
export interface WebRTCEvents {
  'connection-state-change': (state: RTCPeerConnectionState) => void;
  'ice-connection-state-change': (state: RTCIceConnectionState) => void;
  'stream-added': (stream: MediaStream) => void;
  'stream-removed': (stream: MediaStream) => void;
  'error': (error: TelemedicineError) => void;
  'stats-update': (stats: ConnectionStats) => void;
}

// Eventos de sesión
export interface SessionEvents {
  'session-joined': (session: TelemedicineSession) => void;
  'session-left': (sessionId: string) => void;
  'participant-joined': (participant: RoomParticipant) => void;
  'participant-left': (userId: string) => void;
  'chat-message': (message: ChatMessage) => void;
  'transcription-update': (segments: TranscriptionSegment[]) => void;
  'ai-analysis': (analysis: AIAnalysis) => void;
  'vitals-update': (vitals: PatientVitals) => void;
  'recording-started': (recording: SessionRecording) => void;
  'recording-stopped': (recording: SessionRecording) => void;
} 