// FHIR R4 Implementation for Altamedica Medical Platform
export * from './types';
export * from './validators';
export * from './compliance';

// Main FHIR client
export { default as FHIRClient } from './client';

// Re-export FHIR types
export type {
  Patient,
  Practitioner,
  Organization,
  Appointment,
  Observation,
  Condition,
  MedicationRequest,
  Bundle
} from 'fhir/r4'; 