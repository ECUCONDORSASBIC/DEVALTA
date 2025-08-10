/**
 * @fileoverview Punto de entrada simplificado para @altamedica/types
 * @module @altamedica/types
 * @description Exporta tipos básicos esenciales para compilación
 */

// ==================== CORE TYPES ====================
export * from './core';

// ==================== MEDICAL DOMAIN ====================
export * from './medical';

// ==================== API TYPES ====================
export * from './api';

// ==================== SECURITY TYPES ====================
export * from './security';

// ==================== BUSINESS DOMAIN ====================
// Export everything except conflicting types (JobApplication, Optional, PaginatedResponse)
export type {
  // Address and Contact Types
  Address,
  ContactInfo,
  BusinessHours,
  
  // Company Types
  CompanyType,
  CompanySize,
  CompanyStatus,
  Company,
  
  // Doctor Types in Company
  DoctorStatus,
  EmploymentType,
  CompanyDoctor,
  
  // Job Offer Types
  JobType,
  JobStatus,
  ExperienceLevel,
  JobOffer,
  
  // Application Status (but not JobApplication itself - it's in B2C types)
  ApplicationStatus,
  
  // Analytics
  CompanyAnalytics,
  
  // Filter Types
  CompanyFilters,
  JobFilters,
  
  // API Types (excluding PaginatedResponse which conflicts with core)
  APIResponse,
  
  // Form Data Types
  CompanyFormData,
  JobOfferFormData,
  
  // Data Types (excluding Optional which conflicts with core)
  CreateCompanyData,
  CreateJobOfferData
} from './company';

// Export Zod schemas separately (not types)
export {
  AddressSchema,
  ContactInfoSchema,
  BusinessHoursSchema,
  CompanySchema,
  JobOfferSchema
} from './company';
export * from './employee';

// ==================== B2C COMMUNICATION ====================
// This exports JobApplication and other B2C communication types
export * from './b2c/company-doctor-communication.types';

// ==================== AI TYPES ====================
export * from './ai';

// ==================== MARKETPLACE DOMAIN ====================
// Export everything except Coordinates to avoid conflict with core types
export type {
  // Marketplace Doctor Types
  MarketplaceWorkArrangement,
  MarketplaceDoctorVerificationStatus,
  MarketplaceDoctorService,
  MarketplaceDoctor,
  
  // Marketplace Company Types
  MarketplaceCompanyType,
  MarketplaceJobOffer
} from './marketplace';


// ==================== LEGACY EXPORTS (DEPRECATED) ====================
// Estos exports se mantendrán temporalmente para compatibilidad
// y serán removidos en la versión 2.0

import { z } from 'zod';

/**
 * @deprecated Use UserRole from '@altamedica/types/core' instead
 */
export const UserRoleSchema = z.enum(["admin", "doctor", "patient", "staff"]);

/**
 * @deprecated Use specific types from their respective modules
 */
export const SpecialtySchema = z.enum([
  "cardiology",
  "dermatology",
  "endocrinology",
  "gastroenterology",
  "general_practice",
  "gynecology",
  "neurology",
  "oncology",
  "ophthalmology",
  "orthopedics",
  "pediatrics",
  "psychiatry",
  "pulmonology",
  "radiology",
  "surgery",
  "urology",
]);

// ==================== VERSION INFO ====================
export const TYPES_VERSION = '1.1.0';
export const TYPES_COMPATIBILITY = {
  minimum: '1.0.0',
  breaking: '2.0.0'
};