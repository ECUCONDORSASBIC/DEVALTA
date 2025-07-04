/**
 * Tipos compartidos para pacientes
 * Compatible con SSR
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
  observaciones: string;
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
  fullName: string;
  dateOfBirth: string;
  age: number;
  bloodType: string;
  lastVisit: string | undefined;
  activeConditions: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  profilePicture?: string;
  contactPhone: string;
  emergencyContact: string;
}

export interface PatientSearchFilters {
  firstName?: string;
  lastName?: string;
  nationalId?: string;
  dateOfBirth?: string;
  phoneNumber?: string;
  email?: string;
  bloodType?: string;
  facilityId?: string;
  departmentId?: string;
  hasAllergies?: boolean;
  hasChronicConditions?: boolean;
  isActive?: boolean;
}

export interface PatientSearchOptions {
  pageSize?: number;
  lastDocument?: any;
  sortBy?: 'lastName' | 'firstName' | 'dateOfBirth' | 'lastModified';
  sortOrder?: 'asc' | 'desc';
  includeInactive?: boolean;
}

export interface PatientSearchResult {
  patients: Patient[];
  totalCount: number;
  hasMore: boolean;
  lastDocument?: any;
} 