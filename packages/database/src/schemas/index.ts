/**
 * 📋 CENTRALIZED SCHEMAS - ALTAMEDICA DATABASE
 * Todos los schemas Zod centralizados para validación consistente
 * Migrados desde API server y mejorados con validaciones médicas
 */

// Re-export medical schemas
export { MedicalRecordSchema, type MedicalRecord } from '../repositories/MedicalRecordRepository.js';
export { PatientSchema, type Patient } from '../repositories/PatientRepository.js';
export { CompanySchema, type Company } from '../repositories/CompanyRepository.js';
export { MarketplaceOfferSchema, ApplicationSchema, type MarketplaceOffer, type Application } from '../repositories/MarketplaceRepository.js';

// Nuevos schemas centralizados
export * from './medical-schemas.js';
export * from './user-schemas.js';
export * from './appointment-schemas.js';
export * from './common-schemas.js';