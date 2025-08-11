/**
 * Servicio de Telemedicina - Integración con Backend Dockerizado
 * Conecta el frontend con las APIs de telemedicina del servidor Docker
 */

import { apiClient, ApiResponse } from './api-client';
import { API_CONFIG } from '../config/api';

export interface TelemedicineSession {
  id: string;
  patient: string;
  doctor: string;
  status: 'active' | 'waiting' | 'completed' | 'cancelled';
  duration: string;
  roomId?: string;
  createdAt?: string;
  startedAt?: string;
  endedAt?: string;
  quality?: {
    video: number;
    audio: number;
    connection: number;
  };
}

export interface SessionsResponse {
  sessions: TelemedicineSession[];
  total: number;
  active: number;
  message: string;
}

export interface WebRTCConfig {
  roomId: string;
  userId: string;
  userName: string;
  isDoctor: boolean;
  iceServers: RTCIceServer[];
}

export interface JoinSessionRequest {
  patientId: string;
  doctorId: string;
  sessionType: 'video' | 'audio' | 'chat';
}

export interface SessionJoinResponse {
  sessionId: string;
  roomId: string;
  webrtcConfig: WebRTCConfig;
  participants: string[];
  status: string;
}

class TelemedicineService {
  
  /**
   * Obtener todas las sesiones de telemedicina activas
   */
  async getSessions(): Promise<ApiResponse<SessionsResponse>> {
    return apiClient.get<SessionsResponse>(API_CONFIG.TELEMEDICINE.SESSIONS);
  }

  /**
   * Obtener una sesión específica por ID
   */
  async getSessionById(sessionId: string): Promise<ApiResponse<TelemedicineSession>> {
    return apiClient.get<TelemedicineSession>(
      API_CONFIG.TELEMEDICINE.SESSION_BY_ID(sessionId)
    );
  }

  /**
   * Crear una nueva sesión de telemedicina
   */
  async createSession(sessionData: JoinSessionRequest): Promise<ApiResponse<SessionJoinResponse>> {
    return apiClient.post<SessionJoinResponse>(
      API_CONFIG.TELEMEDICINE.SESSIONS,
      sessionData
    );
  }

  /**
   * Unirse a una sesión existente
   */
  async joinSession(sessionId: string, userId: string): Promise<ApiResponse<SessionJoinResponse>> {
    return apiClient.post<SessionJoinResponse>(
      `/api/v1/telemedicine/sessions/${sessionId}/join`,
      { userId, timestamp: new Date().toISOString() }
    );
  }

  /**
   * Finalizar una sesión de telemedicina
   */
  async endSession(sessionId: string, reason?: string): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return apiClient.post<{ success: boolean; message: string }>(
      `/api/v1/telemedicine/sessions/${sessionId}/end`,
      { reason, endedAt: new Date().toISOString() }
    );
  }

  /**
   * Obtener configuración WebRTC para una sala
   */
  async getWebRTCConfig(roomId: string): Promise<ApiResponse<WebRTCConfig>> {
    return apiClient.get<WebRTCConfig>(
      API_CONFIG.TELEMEDICINE.WEBRTC_ROOMS(roomId)
    );
  }

  /**
   * Enviar señal WebRTC (offer, answer, ice candidate)
   */
  async sendWebRTCSignal(roomId: string, signal: RTCSessionDescriptionInit | RTCIceCandidate): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.post<{ success: boolean }>(
      `/api/v1/telemedicine/webrtc/signaling`,
      {
        roomId,
        signal,
        timestamp: new Date().toISOString()
      }
    );
  }

  /**
   * Reportar calidad de la sesión
   */
  async reportSessionQuality(
    sessionId: string, 
    quality: { video: number; audio: number; connection: number }
  ): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.post<{ success: boolean }>(
      `/api/v1/telemedicine/sessions/${sessionId}/quality`,
      quality
    );
  }

  /**
   * Obtener historial de sesiones del paciente
   */
  async getPatientSessionHistory(patientId: string): Promise<ApiResponse<TelemedicineSession[]>> {
    return apiClient.get<TelemedicineSession[]>(
      `/api/v1/telemedicine/sessions?patientId=${patientId}&status=completed`
    );
  }

  /**
   * Obtener sesiones activas del doctor
   */
  async getDoctorActiveSessions(doctorId: string): Promise<ApiResponse<TelemedicineSession[]>> {
    return apiClient.get<TelemedicineSession[]>(
      `/api/v1/telemedicine/sessions?doctorId=${doctorId}&status=active`
    );
  }

  /**
   * Actualizar estado de la sesión
   */
  async updateSessionStatus(
    sessionId: string, 
    status: 'active' | 'waiting' | 'completed' | 'cancelled'
  ): Promise<ApiResponse<TelemedicineSession>> {
    return apiClient.patch<TelemedicineSession>(
      API_CONFIG.TELEMEDICINE.SESSION_BY_ID(sessionId),
      { status, updatedAt: new Date().toISOString() }
    );
  }

  /**
   * Enviar mensaje de chat durante la sesión
   */
  async sendChatMessage(
    sessionId: string, 
    message: string, 
    senderId: string
  ): Promise<ApiResponse<{ success: boolean; messageId: string }>> {
    return apiClient.post<{ success: boolean; messageId: string }>(
      `/api/v1/telemedicine/sessions/${sessionId}/chat`,
      {
        message,
        senderId,
        timestamp: new Date().toISOString()
      }
    );
  }

  /**
   * Obtener mensajes de chat de la sesión
   */
  async getChatMessages(sessionId: string): Promise<ApiResponse<ChatMessage[]>> {
    return apiClient.get<ChatMessage[]>(
      `/api/v1/telemedicine/sessions/${sessionId}/chat`
    );
  }

  /**
   * Compartir pantalla en la sesión
   */
  async startScreenShare(sessionId: string, userId: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.post<{ success: boolean }>(
      `/api/v1/telemedicine/sessions/${sessionId}/screen-share`,
      { userId, action: 'start', timestamp: new Date().toISOString() }
    );
  }

  /**
   * Detener compartir pantalla
   */
  async stopScreenShare(sessionId: string, userId: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.post<{ success: boolean }>(
      `/api/v1/telemedicine/sessions/${sessionId}/screen-share`,
      { userId, action: 'stop', timestamp: new Date().toISOString() }
    );
  }

  /**
   * Grabar sesión (si está permitido y configurado)
   */
  async startRecording(sessionId: string): Promise<ApiResponse<{ success: boolean; recordingId: string }>> {
    return apiClient.post<{ success: boolean; recordingId: string }>(
      `/api/v1/telemedicine/sessions/${sessionId}/recording`,
      { action: 'start', timestamp: new Date().toISOString() }
    );
  }

  /**
   * Detener grabación de sesión
   */
  async stopRecording(sessionId: string): Promise<ApiResponse<{ success: boolean; recordingUrl: string }>> {
    return apiClient.post<{ success: boolean; recordingUrl: string }>(
      `/api/v1/telemedicine/sessions/${sessionId}/recording`,
      { action: 'stop', timestamp: new Date().toISOString() }
    );
  }
}

// Singleton del servicio de telemedicina
export const telemedicineService = new TelemedicineService();

// Exportar como default también
export default telemedicineService;