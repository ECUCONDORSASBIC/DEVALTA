/**
 * 📋 CENTRALIZED SCHEMAS - ALTAMEDICA DATABASE
 * Todos los schemas Zod centralizados para validación consistente
 * Migrados desde API server y mejorados con validaciones médicas
 */

// Re-export medical schemas
export { MedicalRecordSchema, type MedicalRecord } from '../repositories/MedicalRecordRepository';
export { PatientSchema, type Patient } from '../repositories/PatientRepository';

// Nuevos schemas centralizados
export * from './medical-schemas';
export * from './user-schemas';
export * from './appointment-schemas';
export * from './common-schemas';