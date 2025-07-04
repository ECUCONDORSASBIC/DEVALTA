/**
 * Entidades Médicas - Cumplimiento CI-11 y SNOMED CT
 * Sistema Altamedica - Tipos de datos fundamentales
 */

export interface Patient {
  id: string;
  // Datos de identificación (cifrados)
  personalInfo: {
    firstName: string;
    lastName: string;
    dateOfBirth: string; // ISO 8601
    socialSecurityNumber?: string; // Cifrado AES-256
    nationalId: string;
    phoneNumber: string;
    email: string;
    emergencyContact: EmergencyContact;
  };
  
  // Datos clínicos
  medicalInfo: {
    bloodType: BloodType;
    allergies: Allergy[];
    chronicConditions: ChronicCondition[];
    currentMedications: Medication[];
    medicalHistory: MedicalHistoryEntry[];
    vitalSigns: VitalSigns;
  };
  
  // Metadatos de auditoría
  auditInfo: {
    createdAt: string;
    createdBy: string; // User ID del profesional
    lastModified: string;
    lastModifiedBy: string;
    dataClassification: 'PUBLIC' | 'CONFIDENTIAL' | 'RESTRICTED';
    consentStatus: ConsentStatus;
  };
  
  // Configuración de privacidad GDPR/HIPAA
  privacySettings: {
    dataRetentionPeriod: number; // días
    shareWithResearch: boolean;
    marketingConsent: boolean;
    thirdPartyAccess: ThirdPartyAccess[];
  };
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phoneNumber: string;
  email?: string;
  address: Address;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Allergy {
  id: string;
  allergen: string;
  severity: 'MILD' | 'MODERATE' | 'SEVERE' | 'LIFE_THREATENING';
  snomedCode: string; // Código SNOMED CT
  symptoms: string[];
  onsetDate?: string;
  verifiedBy: string; // Professional ID
}

export interface ChronicCondition {
  id: string;
  conditionName: string;
  icd11Code: string; // Código ICD-11
  snomedCode: string;
  diagnosisDate: string;
  severity: 'MILD' | 'MODERATE' | 'SEVERE';
  treatmentPlan: TreatmentPlan;
  status: 'ACTIVE' | 'RESOLVED' | 'IN_REMISSION';
}

export interface Medication {
  id: string;
  medicationName: string;
  atcCode: string; // Código ATC WHO
  dosage: string;
  frequency: string;
  prescribedBy: string; // Professional ID
  prescriptionDate: string;
  endDate?: string;
  sideEffects?: string[];
  contraindications?: string[];
}

export interface VitalSigns {
  id: string;
  recordedAt: string;
  recordedBy: string;
  bloodPressure: {
    systolic: number;
    diastolic: number;
  };
  heartRate: number; // bpm
  temperature: number; // Celsius
  respiratoryRate: number; // breaths per minute
  oxygenSaturation: number; // percentage
  weight: number; // kg
  height: number; // cm
  bmi: number; // calculado automáticamente
}

export interface MedicalHistoryEntry {
  id: string;
  date: string;
  type: 'CONSULTATION' | 'PROCEDURE' | 'DIAGNOSIS' | 'TEST_RESULT' | 'EMERGENCY';
  title: string;
  description: string;
  professionalId: string;
  facility: string;
  attachments?: MedicalAttachment[];
  followUp?: FollowUpPlan;
  
  // Clasificación de urgencia
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  
  // Metadata FHIR
  fhirResource?: {
    resourceType: string;
    resourceId: string;
    version: string;
  };
}

export interface MedicalAttachment {
  id: string;
  fileName: string;
  fileType: 'PDF' | 'DICOM' | 'IMAGE' | 'DOCUMENT';
  filePath: string; // Firebase Storage path
  uploadedAt: string;
  uploadedBy: string;
  fileSize: number; // bytes
  encrypted: boolean;
  accessLevel: 'PATIENT' | 'TREATING_PHYSICIAN' | 'AUTHORIZED_STAFF';
}

export interface TreatmentPlan {
  id: string;
  planName: string;
  startDate: string;
  estimatedDuration: number; // días
  goals: string[];
  interventions: Intervention[];
  medicationRegimen: Medication[];
  followUpSchedule: FollowUpSchedule[];
  assignedProfessionals: string[]; // Professional IDs
}

export interface Intervention {
  id: string;
  type: 'MEDICATION' | 'THERAPY' | 'SURGERY' | 'LIFESTYLE' | 'MONITORING';
  description: string;
  frequency: string;
  duration: number; // días
  expectedOutcome: string;
  riskFactors?: string[];
}

export interface FollowUpPlan {
  nextAppointment?: string; // ISO date
  recommendedTests?: string[];
  warnings: string[];
  emergencyInstructions: string;
  professionalNotes: string;
}

export interface FollowUpSchedule {
  id: string;
  scheduledDate: string;
  type: 'ROUTINE_CHECKUP' | 'TEST_REVIEW' | 'MEDICATION_ADJUSTMENT' | 'EMERGENCY_FOLLOWUP';
  assignedProfessional: string;
  estimatedDuration: number; // minutos
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED';
  reminderSent: boolean;
}

export interface ConsentStatus {
  hipaaConsent: boolean;
  gdprConsent: boolean;
  researchParticipation: boolean;
  dataSharing: boolean;
  consentDate: string;
  consentVersion: string; // Version del formulario de consentimiento
  digitalSignature: string; // Hash verificable
  witnessProfessional?: string; // Para casos especiales
}

export interface ThirdPartyAccess {
  organizationName: string;
  accessType: 'READ' | 'WRITE' | 'FULL';
  purposeOfAccess: string;
  accessGrantedDate: string;
  expirationDate: string;
  dataCategories: string[]; // Qué datos específicos
  legalBasis: 'CONSENT' | 'LEGITIMATE_INTEREST' | 'LEGAL_OBLIGATION';
}

// Tipos de utilidad
export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export interface AuditLog {
  id: string;
  timestamp: string;
  action: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'EXPORT';
  entityType: 'PATIENT' | 'APPOINTMENT' | 'MEDICAL_HISTORY' | 'MEDICATION' | 'USER';
  entityId: string;
  userId: string;
  userRole: string;
  ipAddress: string;
  userAgent: string;
  changes?: Record<string, any>; // Para operaciones UPDATE
  reasonForAccess: string;
  dataClassification: 'PUBLIC' | 'CONFIDENTIAL' | 'RESTRICTED';
  complianceFlags: {
    hipaaCompliant: boolean;
    gdprCompliant: boolean;
    auditRetentionPeriod: number; // años
  };
}
