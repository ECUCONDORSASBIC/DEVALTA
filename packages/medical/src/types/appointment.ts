/**
 * Appointment-related type definitions
 * @module @altamedica/medical/types/appointment
 */

export type AppointmentType = 'consultation' | 'telemedicine' | 'emergency' | 'follow-up' | 'routine-checkup';
export type AppointmentStatus = 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: Date;
  duration: number; // in minutes
  type: AppointmentType;
  status: AppointmentStatus;
  reason?: string;
  notes?: string;
  prescription?: string[];
  videoCallRoomId?: string; // For telemedicine
  createdAt: Date;
  updatedAt: Date;
}

export interface AppointmentCreate extends Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'> {}

export interface AppointmentUpdate extends Partial<Appointment> {
  id: string;
}