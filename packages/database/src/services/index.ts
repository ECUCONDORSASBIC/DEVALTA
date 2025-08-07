/**
 * 🔧 SERVICES INDEX - ALTAMEDICA DATABASE
 * Export centralizado de servicios de alto nivel
 */

// Company Services
export { companiesService, marketplaceService, analyticsService } from './CompanyService';

// B2C Communication Services
export { 
  jobApplicationsService,
  messagingService,
  interviewsService,
  notificationsService,
  communicationEventsService,
  realtimeService
} from './B2CCommunicationService';

// TODO: Implement additional service layer
// export { MedicalRecordService } from './MedicalRecordService';
// export { PatientService } from './PatientService';
// export { AppointmentService } from './AppointmentService';

// Version export
export const servicesVersion = '1.1.0';