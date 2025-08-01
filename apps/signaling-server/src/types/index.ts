export interface User {
  id: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin';
  firstName: string;
  lastName: string;
}

export interface TelemedicineSession {
  id: string;
  appointmentId: string;
  doctorId: string;
  patientId: string;
  status: 'waiting' | 'active' | 'ended' | 'cancelled';
  startTime: Date;
  endTime?: Date;
  duration?: number;
  roomId: string;
  participants: Participant[];
  chatHistory: ChatMessage[];
  vitals?: VitalSigns;
  recordingUrl?: string;
  notes?: MedicalNote[];
  consentGiven: boolean;
  encryptionEnabled: boolean;
}

export interface Participant {
  id: string;
  userId: string;
  role: 'patient' | 'doctor';
  name: string;
  status: 'waiting' | 'connected' | 'disconnected';
  joinedAt: Date;
  leftAt?: Date;
  connectionInfo: ConnectionInfo;
}

export interface ConnectionInfo {
  socketId: string;
  ipAddress: string;
  userAgent: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  os: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: Date;
  type: 'text' | 'file' | 'system';
  fileUrl?: string;
  fileName?: string;
}

export interface VitalSigns {
  heartRate?: number;
  bloodPressure?: {
    systolic: number;
    diastolic: number;
  };
  temperature?: number;
  oxygenSaturation?: number;
  respiratoryRate?: number;
  timestamp: Date;
}

export interface MedicalNote {
  id: string;
  content: string;
  authorId: string;
  timestamp: Date;
}

// WebRTC Signaling Types
export interface SignalingMessage {
  type: 'offer' | 'answer' | 'ice-candidate' | 'error';
  sessionId: string;
  from: string;
  to: string;
  data: any;
}

export interface IceCandidate {
  candidate: string;
  sdpMLineIndex: number;
  sdpMid: string;
}

// Socket Events
export interface JoinRoomData {
  roomId: string;
  userId: string;
  role: 'patient' | 'doctor';
  token: string;
}

export interface LeaveRoomData {
  roomId: string;
  userId: string;
}

export interface ToggleMediaData {
  type: 'audio' | 'video';
  enabled: boolean;
  sessionId: string;
}

export interface ChatMessageData {
  roomId: string;
  from: string;
  message: string;
  type: 'text' | 'file';
  fileUrl?: string;
  fileName?: string;
}

export interface VitalsUpdateData {
  sessionId: string;
  vitals: VitalSigns;
}

// Room Management
export interface Room {
  id: string;
  sessionId: string;
  participants: Map<string, Participant>;
  createdAt: Date;
  status: 'active' | 'ended';
  recordingEnabled: boolean;
  recordingId?: string;
}

// Error Types
export interface SignalingError {
  code: string;
  message: string;
  details?: any;
}