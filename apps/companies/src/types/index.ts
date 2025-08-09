/**
 * 🏢 ALTAMEDICA COMPANIES - TYPES RE-EXPORT
 * Todos los tipos de Company migrados a @altamedica/types para reutilización
 * Este archivo mantiene compatibilidad temporal
 */

// =====================================
// MIGRATED TO @altamedica/types
// =====================================

// Todos los tipos de Company ahora están en @altamedica/types/company
export * from '@altamedica/types';

// Re-export específico para claridad
export type {
  Company,
  CompanyType,
  CompanySize,
  CompanyStatus,
  CompanyDoctor,
  DoctorStatus,
  EmploymentType,
  JobOffer,
  JobType,
  JobStatus,
  ExperienceLevel,
  JobApplication,
  ApplicationStatus,
  CompanyAnalytics,
  Address,
  ContactInfo,
  BusinessHours,
  CompanyFilters,
  JobFilters,
  APIResponse,
  PaginatedResponse,
  CompanyFormData,
  JobOfferFormData,
  CreateCompanyData,
  UpdateCompanyData,
  CreateJobOfferData,
  UpdateJobOfferData
} from '@altamedica/types';

// Re-export schemas para validación
export {
  AddressSchema,
  ContactInfoSchema,
  BusinessHoursSchema,
  CompanySchema,
  JobOfferSchema
} from '@altamedica/types';

/**
 * @deprecated Use direct imports from @altamedica/types instead
 * Este archivo será removido en la próxima versión
 */