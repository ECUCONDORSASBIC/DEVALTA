/**
 * @fileoverview Hooks médicos especializados
 * @module @altamedica/hooks/medical
 * @description Hooks para manejo de datos médicos: pacientes, citas, prescripciones, etc.
 */

// TODO: Re-enable these exports once @altamedica/api-client/hooks is available
// // Hooks principales de pacientes - MIGRADO A API-CLIENT ROBUSTO
// export { 
//   usePatients, 
//   usePatient,
//   useCreatePatient,
//   useUpdatePatient,
//   useDeletePatient,
//   usePatientAppointments,
//   usePatientMedicalHistory,
//   usePatientPrescriptions,
//   usePatientDocuments,
//   useUploadPatientDocument
// } from '@altamedica/api-client/hooks';
// // Re-exportar useAppointments robusto desde api-client
// export { 
//   useAppointments, 
//   useAppointment, 
//   useCreateAppointment, 
//   useUpdateAppointment,
//   useCancelAppointment,
//   useConfirmAppointment,
//   useRescheduleAppointment,
//   useAvailableSlots,
//   useCompleteAppointment
// } from '@altamedica/api-client/hooks';
export { usePrescriptions, usePrescription } from './usePrescriptions';
export { useMedicalRecords, useMedicalRecord } from './useMedicalRecords';
export { useVitalSigns, useVitalSignsMonitoring } from './useVitalSigns';
export { useMedicalAI } from './useMedicalAI';
export { useDiagnosticEngine } from './useDiagnosticEngine';
export type { DiagnosticSession, UseDiagnosticEngineOptions } from './useDiagnosticEngine';

// Hooks de telemedicina
export { useTelemedicine, useVideoCall, useWebRTC } from './useTelemedicine';

// Hooks especializados por rol
export { useDoctorWorkflow, useDoctorSchedule } from './useDoctorWorkflow';
export { usePatientPortal, usePatientDashboard } from './usePatientPortal';

// Tipos principales
export type {
  Patient,
  PatientProfile,
  MedicalRecord,
  Appointment,
  Prescription,
  VitalSigns,
  PatientsFilters,
  PatientsSearchParams,
  UsePatientsOptions,
  UsePatientsReturn,
  MedicalDataState,
  MedicalQueryKey
} from './types';

// Constantes y utilidades
export { MEDICAL_QUERY_KEYS, createMedicalQueryKey } from './queryKeys';
export { MEDICAL_CACHE_CONFIG } from './config';