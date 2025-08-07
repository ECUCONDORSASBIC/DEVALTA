/**
 * 📅 APPOINTMENT SERVICE - ALTAMEDICA
 * Servicio centralizado de gestión de citas médicas
 * Usado por: Patients, Doctors, Companies Apps
 */

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  doctor_first_name: string;
  doctor_last_name: string;
  specialty: string;
  appointment_type: 'consultation' | 'follow_up' | 'emergency' | 'telemedicine';
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  scheduled_at: string;
  duration_minutes: number;
  reason?: string;
  symptoms?: string;
  notes?: string;
  actual_start_time?: string;
  actual_end_time?: string;
  created_at: string;
  updated_at: string;
  telemedicine_session_id?: string;
  room_id?: string;
}

export interface Prescription {
  id: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  prescribedAt: string;
}

export interface CreateAppointmentRequest {
  doctor_id: string;
  appointment_type: 'consultation' | 'follow_up' | 'emergency' | 'telemedicine';
  scheduled_at: string;
  duration_minutes: number;
  reason?: string;
  symptoms?: string;
}

export interface UpdateAppointmentRequest {
  status?: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  scheduled_at?: string;
  duration_minutes?: number;
  reason?: string;
  symptoms?: string;
  notes?: string;
  actual_start_time?: string;
  actual_end_time?: string;
}

export interface AppointmentFilters {
  status?: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  date_from?: string;
  date_to?: string;
  doctor_id?: string;
  patient_id?: string;
  limit?: number;
  offset?: number;
}

export interface AppointmentStats {
  total: number;
  upcoming: number;
  completed: number;
  cancelled: number;
  telemedicine: number;
  thisMonth: number;
}

export interface AppointmentResponse {
  appointments: Appointment[];
  stats?: AppointmentStats;
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
  };
}

/**
 * Servicio de Citas Médicas Centralizado
 */
export class AppointmentService {
  private baseUrl: string;
  private authToken: string | null = null;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    this.loadToken();
  }

  private loadToken() {
    if (typeof window !== 'undefined') {
      this.authToken = localStorage.getItem('auth_token');
    }
  }

  private getAuthHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      ...(this.authToken && { 'Authorization': `Bearer ${this.authToken}` }),
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  /**
   * Obtener citas del paciente
   */
  async getPatientAppointments(filters: AppointmentFilters = {}): Promise<AppointmentResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters.status) params.append('status', filters.status);
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);
      if (filters.doctor_id) params.append('doctor_id', filters.doctor_id);
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.offset) params.append('offset', filters.offset.toString());

      const response = await fetch(
        `${this.baseUrl}/api/v1/appointments?${params.toString()}`,
        {
          headers: this.getAuthHeaders(),
        }
      );

      const result = await this.handleResponse<{
        success: boolean;
        data: AppointmentResponse;
      }>(response);

      return result.data;
    } catch (error) {
      console.error('Error obteniendo citas:', error);
      throw error;
    }
  }

  /**
   * Obtener citas del doctor
   */
  async getDoctorAppointments(filters: AppointmentFilters = {}): Promise<AppointmentResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters.status) params.append('status', filters.status);
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);
      if (filters.patient_id) params.append('patient_id', filters.patient_id);
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.offset) params.append('offset', filters.offset.toString());

      const response = await fetch(
        `${this.baseUrl}/api/v1/appointments/doctor?${params.toString()}`,
        {
          headers: this.getAuthHeaders(),
        }
      );

      const result = await this.handleResponse<{
        success: boolean;
        data: AppointmentResponse;
      }>(response);

      return result.data;
    } catch (error) {
      console.error('Error obteniendo citas del doctor:', error);
      throw error;
    }
  }

  /**
   * Obtener cita específica por ID
   */
  async getAppointment(appointmentId: string): Promise<Appointment> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/v1/appointments/${appointmentId}`,
        {
          headers: this.getAuthHeaders(),
        }
      );

      const result = await this.handleResponse<{
        success: boolean;
        data: Appointment;
      }>(response);

      return result.data;
    } catch (error) {
      console.error('Error obteniendo cita:', error);
      throw error;
    }
  }

  /**
   * Crear nueva cita
   */
  async createAppointment(appointmentData: CreateAppointmentRequest): Promise<Appointment> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/v1/appointments`,
        {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify(appointmentData),
        }
      );

      const result = await this.handleResponse<{
        success: boolean;
        data: Appointment;
      }>(response);

      return result.data;
    } catch (error) {
      console.error('Error creando cita:', error);
      throw error;
    }
  }

  /**
   * Actualizar cita existente
   */
  async updateAppointment(appointmentId: string, updates: UpdateAppointmentRequest): Promise<Appointment> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/v1/appointments/${appointmentId}`,
        {
          method: 'PATCH',
          headers: this.getAuthHeaders(),
          body: JSON.stringify(updates),
        }
      );

      const result = await this.handleResponse<{
        success: boolean;
        data: Appointment;
      }>(response);

      return result.data;
    } catch (error) {
      console.error('Error actualizando cita:', error);
      throw error;
    }
  }

  /**
   * Cancelar cita
   */
  async cancelAppointment(appointmentId: string, reason?: string): Promise<void> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/v1/appointments/${appointmentId}/cancel`,
        {
          method: 'PATCH',
          headers: this.getAuthHeaders(),
          body: JSON.stringify({ reason }),
        }
      );

      await this.handleResponse(response);
    } catch (error) {
      console.error('Error cancelando cita:', error);
      throw error;
    }
  }

  /**
   * Confirmar cita
   */
  async confirmAppointment(appointmentId: string): Promise<Appointment> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/v1/appointments/${appointmentId}/confirm`,
        {
          method: 'PATCH',
          headers: this.getAuthHeaders(),
        }
      );

      const result = await this.handleResponse<{
        success: boolean;
        data: Appointment;
      }>(response);

      return result.data;
    } catch (error) {
      console.error('Error confirmando cita:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de citas
   */
  async getAppointmentStats(): Promise<AppointmentStats> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/v1/appointments/stats`,
        {
          headers: this.getAuthHeaders(),
        }
      );

      const result = await this.handleResponse<{
        success: boolean;
        data: AppointmentStats;
      }>(response);

      return result.data;
    } catch (error) {
      console.error('Error obteniendo estadísticas de citas:', error);
      throw error;
    }
  }

  /**
   * Obtener citas próximas
   */
  async getUpcomingAppointments(limit: number = 5): Promise<Appointment[]> {
    try {
      const response = await this.getPatientAppointments({
        status: 'scheduled',
        limit,
        offset: 0
      });

      return response.appointments;
    } catch (error) {
      console.error('Error obteniendo citas próximas:', error);
      throw error;
    }
  }

  /**
   * Iniciar sesión de telemedicina
   */
  async startTelemedicineSession(appointmentId: string): Promise<{
    session_id: string;
    room_id: string;
    signaling_server: string;
  }> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/v1/appointments/${appointmentId}/telemedicine/start`,
        {
          method: 'POST',
          headers: this.getAuthHeaders(),
        }
      );

      const result = await this.handleResponse<{
        success: boolean;
        data: {
          session_id: string;
          room_id: string;
          signaling_server: string;
        };
      }>(response);

      return result.data;
    } catch (error) {
      console.error('Error iniciando sesión de telemedicina:', error);
      throw error;
    }
  }

  /**
   * Actualizar token de autenticación
   */
  updateToken(token: string | null): void {
    this.authToken = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('auth_token', token);
      } else {
        localStorage.removeItem('auth_token');
      }
    }
  }
}

// Singleton para uso global
let appointmentServiceInstance: AppointmentService | null = null;

export const getAppointmentService = (): AppointmentService => {
  if (!appointmentServiceInstance) {
    appointmentServiceInstance = new AppointmentService();
  }
  return appointmentServiceInstance;
};

// Export por defecto
export default getAppointmentService();