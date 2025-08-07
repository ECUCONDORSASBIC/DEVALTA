/**
 * 🏥 DEPRECATED - MedicalService
 * 
 * ⚠️ Este archivo ha sido reemplazado por hooks especializados en @altamedica/api-client
 * 
 * Para migrar tu código:
 * 
 * ANTES:
 * import { medicalService } from './services/MedicalService';
 * const patients = await medicalService.getPatients();
 * 
 * DESPUÉS:
 * import { usePatients } from '@altamedica/api-client';
 * const { data: patients } = usePatients();
 * 
 * ANTES:
 * import { medicalService } from './services/MedicalService';
 * const appointments = await medicalService.getAppointments();
 * 
 * DESPUÉS:
 * import { useAppointments } from '@altamedica/api-client';
 * const { data: appointments } = useAppointments();
 */

// Re-exportar tipos que pueden ser útiles
export type {
  PatientSearchParams,
  AppointmentFilters,
  MedicalRecordFilters
} from '@altamedica/types';

export class DeprecatedMedicalService {
  constructor() {
    console.warn('⚠️ MedicalService está deprecated. Usar hooks de @altamedica/api-client');
  }
}

export const medicalService = new DeprecatedMedicalService();