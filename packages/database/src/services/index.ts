/**
 * 🔧 SERVICES INDEX - ALTAMEDICA DATABASE
 * Export centralizado de servicios de alto nivel
 */

// ⚠️ DEPRECATED SERVICES - Use Repositories instead
// These services violate best practices by using Firebase Client SDK without ServiceContext
/**
 * @deprecated Use CompanyRepository and MarketplaceRepository instead
 */
export { companiesService, marketplaceService, analyticsService } from './CompanyService.js';

/**
 * @deprecated Use MarketplaceRepository and ApplicationRepository instead
 */
export { 
  jobApplicationsService,
  messagingService,
  interviewsService,
  notificationsService,
  communicationEventsService,
  realtimeService
} from './B2CCommunicationService.js';

// ✅ RECOMMENDED: Use Repository Pattern instead
export { 
  CompanyRepository, 
  companyRepository,
  MarketplaceRepository, 
  marketplaceRepository,
  ApplicationRepository,
  applicationRepository
} from '../repositories/index.js';

// TODO: Implement additional service layer
// export { MedicalRecordService } from './MedicalRecordService';
// export { PatientService } from './PatientService';
// export { AppointmentService } from './AppointmentService';

// Version export
export const servicesVersion = '2.0.0';