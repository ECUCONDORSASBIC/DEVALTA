/**
 * 🏥 SERVICIO DE TELEMEDICINA
 * Conexión con APIs de telemedicina del servidor
 */

export interface TelemedicineSession {
  id: string;
  appointmentId: string;
  doctorId: string;
  patientId: string;
  sessionType: 'video' | 'audio' | 'chat';
  provider: 'webrtc' | 'agora' | 'zoom' | 'google_meet';
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  scheduledAt: Date;
  startedAt?: Date;
  endedAt?: Date;
  scheduledDuration: number; // minutes
  title?: string;
  notes?: string;
  
  // Información del doctor y paciente
  doctor?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  patient?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  
  // Información de la cita
  appointment?: {
    id: string;
    type: string;
    status: string;
    scheduledAt: Date;
  };
  
  // Configuración del proveedor
  providerConfig?: {
    roomId?: string;
    iceServers?: any[];
    constraints?: any;
    joinUrls?: {
      doctor: string;
      patient: string;
    };
  };
  
  // Participantes
  participants?: {
    doctor: {
      id: string;
      joinedAt?: Date;
      leftAt?: Date;
      isConnected: boolean;
    };
    patient: {
      id: string;
      joinedAt?: Date;
      leftAt?: Date;
      isConnected: boolean;
    };
  };
  
  // Métricas
  metrics?: {
    totalDuration: number;
    actualDuration: number;
    connectionQuality: string;
    interruptions: number;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSessionRequest {
  appointmentId: string;
  doctorId: string;
  patientId: string;
  sessionType?: 'video' | 'audio' | 'chat';
  provider?: 'webrtc' | 'agora' | 'zoom' | 'google_meet';
  scheduledDuration?: number;
  title?: string;
  notes?: string;
}

export interface SessionFilters {
  page?: number;
  limit?: number;
  status?: 'scheduled' | 'active' | 'completed' | 'cancelled' | 'all';
  doctorId?: string;
  patientId?: string;
  sessionType?: 'video' | 'audio' | 'chat' | 'all';
  provider?: 'webrtc' | 'agora' | 'zoom' | 'google_meet' | 'all';
  startDate?: string;
  endDate?: string;
}

class TelemedicineService {
  private apiUrl: string;
  private token: string | null = null;

  constructor() {
    this.apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  }

  setAuthToken(token: string) {
    this.token = token;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  /**
   * Obtener lista de sesiones de telemedicina
   */
  async getSessions(filters: SessionFilters = {}): Promise<{
    sessions: TelemedicineSession[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });

      const response = await fetch(
        `${this.apiUrl}/api/v1/telemedicine/sessions?${queryParams.toString()}`,
        {
          method: 'GET',
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Error fetching sessions: ${response.statusText}`);
      }

      const result = await response.json();
      
      return {
        sessions: result.data.map((session: any) => ({
          ...session,
          scheduledAt: new Date(session.scheduledAt),
          startedAt: session.startedAt ? new Date(session.startedAt) : undefined,
          endedAt: session.endedAt ? new Date(session.endedAt) : undefined,
          createdAt: new Date(session.createdAt),
          updatedAt: new Date(session.updatedAt),
        })),
        pagination: result.meta || result.pagination,
      };
    } catch (error) {
      console.error('Error fetching telemedicine sessions:', error);
      throw error;
    }
  }

  /**
   * Obtener sesión específica por ID
   */
  async getSession(sessionId: string): Promise<TelemedicineSession> {
    try {
      const response = await fetch(
        `${this.apiUrl}/api/v1/telemedicine/sessions/${sessionId}`,
        {
          method: 'GET',
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Error fetching session: ${response.statusText}`);
      }

      const result = await response.json();
      const session = result.data;

      return {
        ...session,
        scheduledAt: new Date(session.scheduledAt),
        startedAt: session.startedAt ? new Date(session.startedAt) : undefined,
        endedAt: session.endedAt ? new Date(session.endedAt) : undefined,
        createdAt: new Date(session.createdAt),
        updatedAt: new Date(session.updatedAt),
      };
    } catch (error) {
      console.error('Error fetching telemedicine session:', error);
      throw error;
    }
  }

  /**
   * Crear nueva sesión de telemedicina
   */
  async createSession(sessionData: CreateSessionRequest): Promise<TelemedicineSession> {
    try {
      const response = await fetch(
        `${this.apiUrl}/api/v1/telemedicine/sessions`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(sessionData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error creating session: ${response.statusText}`);
      }

      const result = await response.json();
      const session = result.data;

      return {
        ...session,
        scheduledAt: new Date(session.scheduledAt),
        startedAt: session.startedAt ? new Date(session.startedAt) : undefined,
        endedAt: session.endedAt ? new Date(session.endedAt) : undefined,
        createdAt: new Date(session.createdAt),
        updatedAt: new Date(session.updatedAt),
      };
    } catch (error) {
      console.error('Error creating telemedicine session:', error);
      throw error;
    }
  }

  /**
   * Unirse a una sesión de telemedicina
   */
  async joinSession(sessionId: string, role: 'doctor' | 'patient'): Promise<{
    sessionData: TelemedicineSession;
    joinUrl: string;
    connectionConfig: any;
  }> {
    try {
      const response = await fetch(
        `${this.apiUrl}/api/v1/telemedicine/sessions/${sessionId}/join`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({ role }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error joining session: ${response.statusText}`);
      }

      const result = await response.json();
      
      return result.data;
    } catch (error) {
      console.error('Error joining telemedicine session:', error);
      throw error;
    }
  }

  /**
   * Finalizar sesión de telemedicina
   */
  async endSession(sessionId: string, notes?: string): Promise<TelemedicineSession> {
    try {
      const response = await fetch(
        `${this.apiUrl}/api/v1/telemedicine/sessions/${sessionId}/end`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({ notes }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error ending session: ${response.statusText}`);
      }

      const result = await response.json();
      const session = result.data;

      return {
        ...session,
        scheduledAt: new Date(session.scheduledAt),
        startedAt: session.startedAt ? new Date(session.startedAt) : undefined,
        endedAt: session.endedAt ? new Date(session.endedAt) : undefined,
        createdAt: new Date(session.createdAt),
        updatedAt: new Date(session.updatedAt),
      };
    } catch (error) {
      console.error('Error ending telemedicine session:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de telemedicina
   */
  async getStats(doctorId?: string): Promise<{
    totalSessions: number;
    activeSessions: number;
    scheduledSessions: number;
    completedSessions: number;
    todayStats: {
      sessions: number;
      duration: number;
      patients: number;
    };
    weeklyStats: {
      sessions: number[];
      duration: number[];
    };
  }> {
    try {
      const queryParams = new URLSearchParams();
      if (doctorId) {
        queryParams.append('doctorId', doctorId);
      }

      const response = await fetch(
        `${this.apiUrl}/api/v1/telemedicine/sessions/stats?${queryParams.toString()}`,
        {
          method: 'GET',
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Error fetching stats: ${response.statusText}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching telemedicine stats:', error);
      throw error;
    }
  }

  /**
   * Obtener configuración de WebRTC
   */
  async getWebRTCConfig(sessionId: string): Promise<{
    iceServers: RTCIceServer[];
    roomId: string;
    signalingUrl: string;
  }> {
    try {
      const response = await fetch(
        `${this.apiUrl}/api/v1/telemedicine/webrtc/rooms/${sessionId}`,
        {
          method: 'GET',
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Error fetching WebRTC config: ${response.statusText}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching WebRTC config:', error);
      throw error;
    }
  }

  /**
   * Actualizar estado de participante
   */
  async updateParticipantStatus(
    sessionId: string, 
    participantId: string, 
    status: 'joined' | 'left'
  ): Promise<void> {
    try {
      const response = await fetch(
        `${this.apiUrl}/api/v1/telemedicine/sessions/${sessionId}/participants/${participantId}`,
        {
          method: 'PUT',
          headers: this.getHeaders(),
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) {
        throw new Error(`Error updating participant status: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error updating participant status:', error);
      throw error;
    }
  }
}

// Exportar instancia del servicio
export const telemedicineService = new TelemedicineService();

// Hook personalizado para usar el servicio con autenticación
export function useTelemedicineService() {
  const setAuthToken = (token: string) => {
    telemedicineService.setAuthToken(token);
  };

  return {
    telemedicineService,
    setAuthToken,
  };
}