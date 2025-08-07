/**
 * @altamedica/medical - Medical domain package
 * 
 * This package provides types, utilities, components, and hooks
 * for medical-related functionality in the AltaMedica platform.
 * 
 * @packageDocumentation
 */

// Types - Core medical data structures
export * from './types';
export type {
  Patient,
  PatientCreate,
  PatientUpdate,
  Doctor,
  DoctorCreate,
  DoctorUpdate,
  Appointment,
  AppointmentType,
  AppointmentStatus,
  AppointmentCreate,
  AppointmentUpdate,
  MedicalRecord,
  MedicalRecordCreate,
  MedicalRecordUpdate
} from './types';

// Utilities - Helper functions for medical data
export * from './utils';
export {
  // Date utilities
  formatMedicalDate,
  formatShortDate,
  calculateAge,
  isPastAppointment,
  getTimeUntilAppointment,
  // Health calculations
  calculateBMI,
  calculateIdealWeight,
  calculateHeartRateZones,
  classifyBloodPressure,
  // Validation
  validatePatientData,
  validateDoctorData,
  validateAppointmentData,
  validateMedicalRecordData
} from './utils';

// Components - React components for medical UI
export * from './components';
export {
  PatientCard,
  type PatientCardProps,
  DoctorCard,
  type DoctorCardProps,
  AppointmentCard,
  type AppointmentCardProps
} from './components';

// Hooks - React hooks for medical functionality
export * from './hooks';
export {
  useMedicalData,
  type MedicalDataHook,
  type PatientFilters,
  type DoctorFilters,
  type AppointmentFilters,
  useHealthMetrics,
  type HealthMetrics,
  type HealthMetricsAnalysis
} from './hooks';

// Configuration - Constants and Firebase config
export * from './config';
export {
  medicalFirebaseConfig,
  getFirestorePath,
  MEDICAL_SPECIALIZATIONS,
  COMMON_CONDITIONS,
  APPOINTMENT_DURATIONS,
  VITAL_RANGES,
  LAB_TEST_TYPES,
  PRESCRIPTION_FREQUENCIES,
  EMERGENCY_LEVELS
} from './config';

// Package metadata
export const PACKAGE_NAME = '@altamedica/medical';
export const PACKAGE_VERSION = '2.0.0';
