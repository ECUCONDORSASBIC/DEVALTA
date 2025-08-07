/**
 * 👥 TIPOS DE PACIENTES - ALTAMEDICA
 * Definiciones centralizadas para manejo de pacientes
 */

export interface Patient {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  fechaNacimiento: Date;
  historialMedico: HistorialMedico[];
  seguroMedico?: SeguroMedico;
  contactoEmergencia?: ContactoEmergencia;
  fechaRegistro: Date;
  estado: 'activo' | 'inactivo' | 'pendiente';
}

export interface HistorialMedico {
  id: string;
  fecha: Date;
  diagnostico: string;
  tratamiento: string;
  medicamentos: string[];
  observaciones?: string;
  medico: string;
}

export interface SeguroMedico {
  empresa: string;
  numeroPoliza: string;
  vigencia: Date;
  cobertura: string[];
}

export interface ContactoEmergencia {
  nombre: string;
  relacion: string;
  telefono: string;
  email?: string;
}

export interface PatientSummary {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  edad: number;
  ultimaConsulta?: Date;
  estado: Patient['estado'];
}

export interface PatientSearchFilters {
  nombre?: string;
  email?: string;
  estado?: Patient['estado'];
  fechaDesde?: Date;
  fechaHasta?: Date;
  medico?: string;
}

export interface PatientSearchOptions {
  page?: number;
  limit?: number;
  sortBy?: 'nombre' | 'fechaRegistro' | 'ultimaConsulta';
  sortOrder?: 'asc' | 'desc';
}

export interface PatientSearchResult {
  patients: PatientSummary[];
  total: number;
  page: number;
  totalPages: number;
}

export interface PatientStats {
  total: number;
  activos: number;
  inactivos: number;
  pendientes: number;
}