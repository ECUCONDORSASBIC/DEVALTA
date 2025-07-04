/**
 * Sistema de Citas Médicas y Gestión de Usuarios
 * Cumplimiento RBAC/ABAC - Control de Acceso Granular
 */

export interface Appointment {
  id: string;
  
  // Datos básicos de la cita
  patientId: string;
  professionalId: string;
  facilityId: string;
  departmentId: string;
  
  // Programación temporal
  scheduling: {
    scheduledDateTime: string; // ISO 8601
    estimatedDuration: number; // minutos
    timeZone: string;
    recurringPattern?: RecurringPattern;
    bufferTime: number; // minutos entre citas
  };
  
  // Detalles clínicos
  clinicalInfo: {
    appointmentType: AppointmentType;
    reasonForVisit: string;
    urgencyLevel: 'ROUTINE' | 'URGENT' | 'EMERGENCY' | 'CRITICAL';
    specialInstructions?: string;
    preparationInstructions?: string[];
    estimatedCost?: number;
    insurancePreauthorization?: string;
  };
  
  // Estado y seguimiento
  status: AppointmentStatus;
  statusHistory: StatusChange[];
  
  // Comunicaciones
  notifications: {
    patientReminders: NotificationLog[];
    professionalAlerts: NotificationLog[];
    confirmationRequired: boolean;
    lastConfirmedAt?: string;
  };
  
  // Resultado de la cita
  outcome?: AppointmentOutcome;
  
  // Metadata de auditoría
  auditInfo: {
    createdAt: string;
    createdBy: string;
    lastModified: string;
    lastModifiedBy: string;
    cancellationReason?: string;
    rescheduleCount: number;
  };
}

export interface RecurringPattern {
  type: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  interval: number; // cada X días/semanas/meses
  endDate?: string;
  occurrences?: number;
  daysOfWeek?: number[]; // 0=domingo, 1=lunes...
  monthlyPattern?: 'DAY_OF_MONTH' | 'DAY_OF_WEEK';
}

export type AppointmentType = 
  | 'CONSULTATION' 
  | 'FOLLOW_UP' 
  | 'PROCEDURE' 
  | 'DIAGNOSTIC_TEST' 
  | 'VACCINATION' 
  | 'SURGERY' 
  | 'THERAPY_SESSION' 
  | 'EMERGENCY' 
  | 'TELEMEDICINE';

export type AppointmentStatus = 
  | 'SCHEDULED' 
  | 'CONFIRMED' 
  | 'CHECKED_IN' 
  | 'IN_PROGRESS' 
  | 'COMPLETED' 
  | 'CANCELLED' 
  | 'NO_SHOW' 
  | 'RESCHEDULED';

export interface StatusChange {
  timestamp: string;
  previousStatus: AppointmentStatus;
  newStatus: AppointmentStatus;
  changedBy: string;
  reason?: string;
  automaticChange: boolean;
}

export interface NotificationLog {
  id: string;
  timestamp: string;
  channel: 'EMAIL' | 'SMS' | 'PUSH' | 'PHONE_CALL';
  recipient: string;
  message: string;
  delivered: boolean;
  opened?: boolean;
  clickedThrough?: boolean;
  errorMessage?: string;
}

export interface AppointmentOutcome {
  id: string;
  completedAt: string;
  duration: number; // minutos reales
  diagnosis?: string[];
  prescriptions?: Prescription[];
  proceduresPerformed?: Procedure[];
  testResults?: TestResult[];
  followUpRequired: boolean;
  nextAppointmentRecommended?: string;
  patientSatisfactionScore?: number; // 1-5
  professionalNotes: string;
  billingCode?: string;
  insuranceCoverage?: InsuranceCoverage;
}

export interface Prescription {
  id: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: number; // días
  refillsAllowed: number;
  pharmacyInstructions: string;
  sideEffectWarnings: string[];
  interactionWarnings: string[];
  prescribedAt: string;
  electronicSignature: string;
}

export interface Procedure {
  id: string;
  procedureName: string;
  cptCode: string; // Current Procedural Terminology
  description: string;
  performedAt: string;
  performedBy: string[];
  complications?: string[];
  outcome: 'SUCCESSFUL' | 'PARTIAL' | 'FAILED' | 'CANCELLED';
  postProcedureInstructions: string[];
}

export interface TestResult {
  id: string;
  testName: string;
  loincCode: string; // Logical Observation Identifiers Names and Codes
  orderedAt: string;
  resultDate: string;
  results: LabValue[];
  interpretation: string;
  criticalValues: boolean;
  referenceRanges: ReferenceRange[];
  performingLab: string;
  reviewedBy: string;
  reportUrl?: string;
}

export interface LabValue {
  parameter: string;
  value: string | number;
  unit: string;
  abnormalFlag?: 'HIGH' | 'LOW' | 'CRITICAL_HIGH' | 'CRITICAL_LOW';
  status: 'PRELIMINARY' | 'FINAL' | 'CORRECTED' | 'CANCELLED';
}

export interface ReferenceRange {
  parameter: string;
  minValue?: number;
  maxValue?: number;
  ageGroup?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  units: string;
}

export interface InsuranceCoverage {
  providerId: string;
  providerName: string;
  policyNumber: string;
  groupNumber: string;
  coveragePercentage: number;
  deductible: number;
  copayAmount: number;
  preauthorizationRequired: boolean;
  preauthorizationNumber?: string;
  claimNumber?: string;
  claimStatus: 'PENDING' | 'APPROVED' | 'DENIED' | 'PROCESSING';
}

// Sistema de Usuarios y Roles (RBAC/ABAC)
export interface User {
  id: string;
  
  // Información personal
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    dateOfBirth: string;
    nationalId: string;
    profilePicture?: string;
  };
  
  // Credenciales y autenticación
  authentication: {
    firebaseUid: string;
    emailVerified: boolean;
    phoneVerified: boolean;
    mfaEnabled: boolean;
    lastLogin: string;
    passwordLastChanged: string;
    failedLoginAttempts: number;
    accountLocked: boolean;
    lockoutExpiry?: string;
  };
  
  // Roles y permisos
  authorization: {
    roles: Role[];
    permissions: Permission[];
    departments: string[]; // IDs de departamentos
    facilities: string[]; // IDs de instalaciones
    dataAccessLevel: 'DEPARTMENT' | 'FACILITY' | 'ORGANIZATION' | 'PATIENT_SPECIFIC';
    sessionTimeout: number; // minutos
  };
  
  // Información profesional (para staff médico)
  professionalInfo?: ProfessionalInfo;
  
  // Estado de la cuenta
  accountStatus: {
    status: 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED' | 'PENDING_VERIFICATION';
    createdAt: string;
    createdBy: string;
    lastModified: string;
    lastModifiedBy: string;
    deactivationReason?: string;
    suspensionEndDate?: string;
  };
  
  // Preferencias y configuración
  preferences: {
    language: string;
    timeZone: string;
    notifications: NotificationPreferences;
    dashboard: DashboardPreferences;
    accessibility: AccessibilitySettings;
  };
}

export interface Role {
  id: string;
  name: string;
  displayName: string;
  description: string;
  permissions: string[]; // Permission IDs
  hierarchy: number; // 0 = máximo privilegio
  departmentSpecific: boolean;
  facilitySpecific: boolean;
  inheritedRoles?: string[]; // Role IDs que hereda
  isSystemRole: boolean; // Roles que no se pueden modificar
}

export interface Permission {
  id: string;
  name: string;
  displayName: string;
  description: string;
  resource: string; // e.g., 'patients', 'appointments'
  action: string; // e.g., 'read', 'write', 'delete'
  scope: 'GLOBAL' | 'FACILITY' | 'DEPARTMENT' | 'PERSONAL' | 'PATIENT_SPECIFIC';
  conditions?: AccessCondition[]; // Para ABAC
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface AccessCondition {
  attribute: string; // e.g., 'time', 'location', 'patient_age'
  operator: 'EQUALS' | 'NOT_EQUALS' | 'GREATER_THAN' | 'LESS_THAN' | 'IN' | 'NOT_IN';
  value: any;
  required: boolean;
}

export interface ProfessionalInfo {
  licenseNumber: string;
  licenseState: string;
  licenseExpiry: string;
  licenseType: LicenseType;
  specializations: Specialization[];
  certifications: Certification[];
  education: Education[];
  experience: WorkExperience[];
  languages: string[];
  consultationFee: number;
  availableHours: AvailabilitySchedule[];
  malpracticeInsurance: Insurance;
  deaNumber?: string; // Drug Enforcement Administration
  npiNumber: string; // National Provider Identifier
}

export type LicenseType = 
  | 'MD' // Medical Doctor
  | 'DO' // Doctor of Osteopathic Medicine
  | 'RN' // Registered Nurse
  | 'NP' // Nurse Practitioner
  | 'PA' // Physician Assistant
  | 'RPh' // Registered Pharmacist
  | 'PT' // Physical Therapist
  | 'OT' // Occupational Therapist
  | 'LCSW' // Licensed Clinical Social Worker
  | 'OTHER';

export interface Specialization {
  id: string;
  name: string;
  boardCertified: boolean;
  certificationDate?: string;
  certificationExpiry?: string;
  certifyingBoard: string;
  isPrimarySpecialty: boolean;
}

export interface Certification {
  id: string;
  name: string;
  issuingOrganization: string;
  issueDate: string;
  expiryDate?: string;
  certificateNumber: string;
  requiresRenewal: boolean;
  renewalPeriod?: number; // meses
  status: 'ACTIVE' | 'EXPIRED' | 'SUSPENDED' | 'REVOKED';
}

export interface Education {
  id: string;
  institutionName: string;
  degree: string;
  fieldOfStudy: string;
  graduationDate: string;
  gpa?: number;
  honors?: string[];
  accredited: boolean;
}

export interface WorkExperience {
  id: string;
  facilityName: string;
  position: string;
  department: string;
  startDate: string;
  endDate?: string;
  responsibilities: string[];
  isCurrent: boolean;
  verificationContact?: ContactInfo;
}

export interface ContactInfo {
  name: string;
  title: string;
  email: string;
  phoneNumber: string;
}

export interface AvailabilitySchedule {
  dayOfWeek: number; // 0=domingo
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  facilityId: string;
  appointmentTypes: AppointmentType[];
  maxConsecutiveAppointments: number;
  breakDuration: number; // minutos
}

export interface Insurance {
  providerId: string;
  providerName: string;
  policyNumber: string;
  coverageAmount: number;
  effectiveDate: string;
  expiryDate: string;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
}

export interface NotificationPreferences {
  email: {
    appointmentReminders: boolean;
    cancellations: boolean;
    emergencyAlerts: boolean;
    systemUpdates: boolean;
    marketingCommunications: boolean;
  };
  sms: {
    appointmentReminders: boolean;
    criticalAlerts: boolean;
    authenticationCodes: boolean;
  };
  push: {
    realTimeAlerts: boolean;
    appointmentUpdates: boolean;
    systemNotifications: boolean;
  };
  frequency: 'IMMEDIATE' | 'HOURLY' | 'DAILY' | 'WEEKLY';
}

export interface DashboardPreferences {
  defaultView: 'CALENDAR' | 'LIST' | 'KANBAN';
  widgetsEnabled: string[];
  refreshInterval: number; // segundos
  compactMode: boolean;
  showPatientPhotos: boolean;
  colorScheme: 'LIGHT' | 'DARK' | 'AUTO';
}

export interface AccessibilitySettings {
  fontSize: 'SMALL' | 'MEDIUM' | 'LARGE' | 'EXTRA_LARGE';
  highContrast: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  reducedMotion: boolean;
  captionsEnabled: boolean;
}
