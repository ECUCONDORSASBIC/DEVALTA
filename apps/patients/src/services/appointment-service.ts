/**
 * Servicio de Gestión de Citas Médicas
 * Conecta con la API del servidor para operaciones CRUD de citas
 */

import { auth } from '@altamedica/firebase';

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

class AppointmentService {
  private baseUrl: string;
  private authToken: string | null = null;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    this.initializeAuth();
  }

  private async initializeAuth() {
    const user = auth.currentUser;
    if (user) {
      this.authToken = await user.getIdToken();
    }

    // Escuchar cambios de autenticación
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        this.authToken = await user.getIdToken();
      } else {
        this.authToken = null;
      }
    });
  }

  private async getAuthHeaders(): Promise<HeadersInit> {
    if (!this.authToken) {
      await this.initializeAuth();
    }

    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.authToken}`,
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
   * Obtener todas las citas del paciente
   */
  async getAppointments(filters: AppointmentFilters = {}): Promise<Appointment[]> {
    try {
      const params = new URLSearchParams();
      
      if (filters.status) {
        params.append('status', filters.status);
      }
      if (filters.date_from) {
        params.append('date_from', filters.date_from);
      }
      if (filters.date_to) {
        params.append('date_to', filters.date_to);
      }
      if (filters.doctor_id) {
        params.append('doctor_id', filters.doctor_id);
      }
      if (filters.limit) {
        params.append('limit', filters.limit.toString());
      }
      if (filters.offset) {
        params.append('offset', filters.offset.toString());
      }

      const response = await fetch(
        `${this.baseUrl}/api/appointments?${params.toString()}`,
        {
          headers: await this.getAuthHeaders(),
        }
      );

      const result = await this.handleResponse<{ appointments: Appointment[] }>(response);
      return result.appointments;
    } catch (error) {
      console.error('Error obteniendo citas:', error);
      throw error;
    }
  }

  /**
   * Obtener una cita específica por ID
   */
  async getAppointmentById(id: string): Promise<Appointment> {
    try {
      const response = await fetch(`${this.baseUrl}/api/appointments/${id}`, {
        headers: await this.getAuthHeaders(),
      });

      const result = await this.handleResponse<{ appointment: Appointment }>(response);
      return result.appointment;
    } catch (error) {
      console.error('Error obteniendo cita:', error);
      throw error;
    }
  }

  /**
   * Crear una nueva cita
   */
  async createAppointment(appointmentData: CreateAppointmentRequest): Promise<Appointment> {
    try {
      const response = await fetch(`${this.baseUrl}/api/appointments`, {
        method: 'POST',
        headers: await this.getAuthHeaders(),
        body: JSON.stringify(appointmentData),
      });

      const result = await this.handleResponse<{ appointment: Appointment }>(response);
      return result.appointment;
    } catch (error) {
      console.error('Error creando cita:', error);
      throw error;
    }
  }

  /**
   * Actualizar una cita existente
   */
  async updateAppointment(id: string, updateData: UpdateAppointmentRequest): Promise<Appointment> {
    try {
      const response = await fetch(`${this.baseUrl}/api/appointments/${id}`, {
        method: 'PUT',
        headers: await this.getAuthHeaders(),
        body: JSON.stringify(updateData),
      });

      const result = await this.handleResponse<{ appointment: Appointment }>(response);
      return result.appointment;
    } catch (error) {
      console.error('Error actualizando cita:', error);
      throw error;
    }
  }

  /**
   * Cancelar una cita
   */
  async cancelAppointment(id: string, reason?: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/appointments/${id}/status`, {
        method: 'PATCH',
        headers: await this.getAuthHeaders(),
        body: JSON.stringify({ 
          status: 'cancelled',
          notes: reason ? `Cancelada: ${reason}` : 'Cancelada por el paciente'
        }),
      });

      await this.handleResponse(response);
    } catch (error) {
      console.error('Error cancelando cita:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de citas
   */
  async getAppointmentStats(): Promise<AppointmentStats> {
    try {
      const appointments = await this.getAppointments();
      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const stats: AppointmentStats = {
        total: appointments.length,
        upcoming: appointments.filter(a => 
          a.status === 'scheduled' && new Date(a.scheduled_at) > now
        ).length,
        completed: appointments.filter(a => a.status === 'completed').length,
        cancelled: appointments.filter(a => a.status === 'cancelled').length,
        telemedicine: appointments.filter(a => a.appointment_type === 'telemedicine').length,
        thisMonth: appointments.filter(a => 
          new Date(a.scheduled_at) >= thisMonth
        ).length,
      };

      return stats;
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw error;
    }
  }

  /**
   * Obtener citas próximas
   */
  async getUpcomingAppointments(): Promise<Appointment[]> {
    try {
      const now = new Date();
      const appointments = await this.getAppointments();
      
      return appointments
        .filter(a => 
          a.status === 'scheduled' && 
          new Date(a.scheduled_at) > now
        )
        .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
    } catch (error) {
      console.error('Error obteniendo citas próximas:', error);
      throw error;
    }
  }

  /**
   * Obtener citas de hoy
   */
  async getTodayAppointments(): Promise<Appointment[]> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const appointments = await this.getAppointments({
        date_from: today.toISOString(),
        date_to: tomorrow.toISOString(),
      });

      return appointments.filter(a => a.status === 'scheduled');
    } catch (error) {
      console.error('Error obteniendo citas de hoy:', error);
      throw error;
    }
  }

  /**
   * Obtener historial de citas
   */
  async getAppointmentHistory(limit: number = 20): Promise<Appointment[]> {
    try {
      const appointments = await this.getAppointments({ limit });
      
      return appointments
        .filter(a => a.status === 'completed')
        .sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime());
    } catch (error) {
      console.error('Error obteniendo historial:', error);
      throw error;
    }
  }

  /**
   * Verificar disponibilidad de un médico en una fecha/hora específica
   */
  async checkDoctorAvailability(doctorId: string, date: string, time: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/v1/appointments/check-availability?doctorId=${doctorId}&date=${date}&time=${time}`,
        {
          headers: await this.getAuthHeaders(),
        }
      );

      const result = await this.handleResponse<{ available: boolean }>(response);
      return result.available;
    } catch (error) {
      console.error('Error verificando disponibilidad:', error);
      throw error;
    }
  }

  /**
   * Obtener horarios disponibles de un médico
   */
  async getAvailableSlots(doctorId: string, date: string): Promise<TimeSlot[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/v1/appointments/available-slots?doctorId=${doctorId}&date=${date}`,
        {
          headers: await this.getAuthHeaders(),
        }
      );

      const result = await this.handleResponse<{ data: TimeSlot[] }>(response);
      return result.data;
    } catch (error) {
      console.error('Error obteniendo horarios disponibles:', error);
      throw error;
    }
  }

  /**
   * Obtener médicos por especialidad
   */
  async getDoctorsBySpecialty(specialty: string): Promise<Doctor[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/v1/doctors?specialty=${encodeURIComponent(specialty)}`,
        {
          headers: await this.getAuthHeaders(),
        }
      );

      const result = await this.handleResponse<{ data: Doctor[] }>(response);
      return result.data;
    } catch (error) {
      console.error('Error obteniendo médicos:', error);
      throw error;
    }
  }

  /**
   * Obtener especialidades disponibles
   */
  async getSpecialties(): Promise<Specialty[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/specialties`, {
        headers: await this.getAuthHeaders(),
      });

      const result = await this.handleResponse<{ data: Specialty[] }>(response);
      return result.data;
    } catch (error) {
      console.error('Error obteniendo especialidades:', error);
      throw error;
    }
  }

  /**
   * Enviar recordatorio de cita
   */
  async sendAppointmentReminder(appointmentId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/appointments/${appointmentId}/remind`, {
        method: 'POST',
        headers: await this.getAuthHeaders(),
      });

      await this.handleResponse(response);
    } catch (error) {
      console.error('Error enviando recordatorio:', error);
      throw error;
    }
  }

  /**
   * Obtener prescripciones de una cita
   */
  async getAppointmentPrescriptions(appointmentId: string): Promise<Prescription[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/v1/appointments/${appointmentId}/prescriptions`,
        {
          headers: await this.getAuthHeaders(),
        }
      );

      const result = await this.handleResponse<{ data: Prescription[] }>(response);
      return result.data;
    } catch (error) {
      console.error('Error obteniendo prescripciones:', error);
      throw error;
    }
  }

  /**
   * Obtener notas médicas de una cita
   */
  async getAppointmentNotes(appointmentId: string): Promise<string> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/v1/appointments/${appointmentId}/notes`,
        {
          headers: await this.getAuthHeaders(),
        }
      );

      const result = await this.handleResponse<{ notes: string }>(response);
      return result.notes;
    } catch (error) {
      console.error('Error obteniendo notas médicas:', error);
      throw error;
    }
  }
}

// Interfaces adicionales
export interface TimeSlot {
  time: string;
  available: boolean;
  isTelemedicine: boolean;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  experience: number;
  languages: string[];
  isAvailable: boolean;
  consultationFee: number;
  telemedicineAvailable: boolean;
  avatar?: string;
}

export interface Specialty {
  id: string;
  name: string;
  description: string;
  icon: string;
}

// Exportar instancia singleton
export const appointmentService = new AppointmentService(); 