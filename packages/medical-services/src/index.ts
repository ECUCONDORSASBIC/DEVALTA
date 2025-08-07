/**
 * 🏥 @ALTAMEDICA/MEDICAL-SERVICES
 * Servicios médicos centralizados para el ecosistema AltaMedica
 */

// Types
export * from './types/patient';

// Services
export * from './services/patient-service';
export { default as patientService } from './services/patient-service';

// Re-exports for convenience
export { getPatientService } from './services/patient-service';