/**
 * Medical types barrel export
 * @module @altamedica/medical/types
 */

// Re-export Patient types from the unified source
export type {
  Patient,
  CreatePatient,
  UpdatePatient,
  PatientFilters,
  EmergencyContact,
  Insurance,
  VitalSigns,
  Allergy,
  ChronicCondition,
  Medication,
  MedicalHistory,
  GenderType,
  BloodTypeType,
  PatientStatusType,
  MaritalStatusType
} from '@altamedica/types';

// Re-export Appointment types from the unified source
export type {
  Appointment,
  CreateAppointment,
  UpdateAppointment,
  AppointmentFilters,
  AppointmentStats,
  RecurringPattern,
  StatusChange,
  NotificationLog,
  Prescription,
  Procedure,
  TestResult,
  LabValue,
  ReferenceRange,
  InsuranceCoverage,
  AppointmentOutcome,
  AppointmentType,
  AppointmentStatus,
  UrgencyLevel,
  NotificationChannel
} from '@altamedica/types';

// Export local types
export * from './doctor';
export * from './medical-record';