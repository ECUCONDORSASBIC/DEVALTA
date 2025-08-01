import { Bundle, Patient, Practitioner, Organization, Appointment, Observation, Condition, MedicationRequest } from 'fhir/r4';
import { z } from 'zod';

// FHIR R4 Types with Altamedica extensions
export interface AltamedicaPatient extends Patient {
  altamedicaId: string;
  lastAccessed: string;
  complianceFlags: string[];
  emergencyContacts: EmergencyContact[];
  insuranceInfo: InsuranceInfo;
}

export interface AltamedicaPractitioner extends Practitioner {
  altamedicaId: string;
  specialties: string[];
  licenseNumber: string;
  certifications: Certification[];
  availability: AvailabilitySchedule;
}

export interface AltamedicaOrganization extends Organization {
  altamedicaId: string;
  facilityType: 'hospital' | 'clinic' | 'laboratory' | 'pharmacy';
  accreditation: Accreditation[];
  services: MedicalService[];
}

export interface AltamedicaAppointment extends Appointment {
  altamedicaId: string;
  telemedicineEnabled: boolean;
  roomSettings: RoomSettings;
  vitalsSharing: boolean;
  recordingEnabled: boolean;
}

// Custom types for medical data
export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  isPrimary: boolean;
}

export interface InsuranceInfo {
  provider: string;
  policyNumber: string;
  groupNumber?: string;
  effectiveDate: string;
  expirationDate: string;
  coverageType: 'primary' | 'secondary' | 'tertiary';
}

export interface Certification {
  name: string;
  issuingOrganization: string;
  issueDate: string;
  expirationDate?: string;
  credentialId: string;
}

export interface AvailabilitySchedule {
  daysOfWeek: ('mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun')[];
  startTime: string;
  endTime: string;
  timezone: string;
  exceptions: AvailabilityException[];
}

export interface AvailabilityException {
  date: string;
  startTime?: string;
  endTime?: string;
  reason: 'holiday' | 'vacation' | 'emergency' | 'other';
}

export interface Accreditation {
  type: string;
  organization: string;
  issueDate: string;
  expirationDate?: string;
  status: 'active' | 'expired' | 'pending';
}

export interface MedicalService {
  name: string;
  code: string;
  description: string;
  isAvailable: boolean;
  requirements: string[];
}

export interface RoomSettings {
  maxParticipants: number;
  recordingEnabled: boolean;
  chatEnabled: boolean;
  screenSharingEnabled: boolean;
  waitingRoomEnabled: boolean;
  autoRecord: boolean;
}

// Zod schemas for validation
export const EmergencyContactSchema = z.object({
  name: z.string().min(1),
  relationship: z.string().min(1),
  phone: z.string().regex(/^\+?[\d\s\-\(\)]+$/),
  email: z.string().email().optional(),
  isPrimary: z.boolean()
});

export const InsuranceInfoSchema = z.object({
  provider: z.string().min(1),
  policyNumber: z.string().min(1),
  groupNumber: z.string().optional(),
  effectiveDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  expirationDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  coverageType: z.enum(['primary', 'secondary', 'tertiary'])
});

export const AltamedicaPatientSchema = z.object({
  id: z.string(),
  altamedicaId: z.string(),
  resourceType: z.literal('Patient'),
  identifier: z.array(z.object({
    system: z.string(),
    value: z.string()
  })),
  name: z.array(z.object({
    use: z.enum(['usual', 'official', 'temp', 'nickname', 'anonymous', 'old', 'maiden']).optional(),
    text: z.string().optional(),
    family: z.string().optional(),
    given: z.array(z.string()).optional()
  })),
  telecom: z.array(z.object({
    system: z.enum(['phone', 'fax', 'email', 'pager', 'url', 'sms', 'other']),
    value: z.string(),
    use: z.enum(['home', 'work', 'temp', 'old', 'mobile']).optional()
  })).optional(),
  gender: z.enum(['male', 'female', 'other', 'unknown']).optional(),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  address: z.array(z.object({
    use: z.enum(['home', 'work', 'temp', 'old', 'billing']).optional(),
    type: z.enum(['postal', 'physical', 'both']).optional(),
    text: z.string().optional(),
    line: z.array(z.string()).optional(),
    city: z.string().optional(),
    district: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional()
  })).optional(),
  lastAccessed: z.string(),
  complianceFlags: z.array(z.string()),
  emergencyContacts: z.array(EmergencyContactSchema),
  insuranceInfo: InsuranceInfoSchema
});

// FHIR Bundle types for batch operations
export interface FHIRBundle extends Bundle {
  entry: BundleEntry[];
}

export interface BundleEntry {
  fullUrl?: string;
  resource: Patient | Practitioner | Organization | Appointment;
  request?: BundleRequest;
  response?: BundleResponse;
}

export interface BundleRequest {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  ifNoneMatch?: string;
  ifModifiedSince?: string;
  ifMatch?: string;
  ifNoneExist?: string;
}

export interface BundleResponse {
  status: string;
  location?: string;
  etag?: string;
  lastModified?: string;
  outcome?: any;
}

// Export all types
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