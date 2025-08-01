/**
 * 📋 MEDICAL RECORDS TYPES
 * Tipos y interfaces para el sistema de historiales médicos
 */

export enum RecordType {
  CONSULTATION = 'consultation',
  DIAGNOSIS = 'diagnosis',
  TREATMENT = 'treatment',
  SURGERY = 'surgery',
  EMERGENCY = 'emergency',
  FOLLOW_UP = 'follow_up',
  DISCHARGE = 'discharge'
}

export enum RecordStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
  CANCELLED = 'cancelled'
}

export enum SeverityLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum AccessLevel {
  PUBLIC = 'public',
  RESTRICTED = 'restricted',
  CONFIDENTIAL = 'confidential',
  TOP_SECRET = 'top_secret'
}

// Interfaces principales
export interface VitalSigns {
  temperature?: number; // Celsius
  bloodPressure?: {
    systolic: number;
    diastolic: number;
  };
  heartRate?: number; // BPM
  respiratoryRate?: number;
  oxygenSaturation?: number; // %
  weight?: number; // kg
  height?: number; // cm
  bmi?: number;
  recordedAt: Date;
  recordedBy: string;
}

export interface Symptom {
  id: string;
  name: string;
  description: string;
  severity: SeverityLevel;
  duration: string; // e.g., "3 days", "2 weeks"
  onset: 'sudden' | 'gradual';
  triggers?: string[];
  relievingFactors?: string[];
  associatedSymptoms?: string[];
}

export interface Diagnosis {
  id: string;
  code: string; // ICD-10
  name: string;
  description: string;
  type: 'primary' | 'secondary' | 'differential';
  certainty: 'confirmed' | 'probable' | 'suspected';
  severity: SeverityLevel;
  onsetDate?: Date;
  notes?: string;
}

export interface Treatment {
  id: string;
  type: 'medication' | 'procedure' | 'therapy' | 'surgery' | 'lifestyle';
  name: string;
  description: string;
  startDate: Date;
  endDate?: Date;
  status: 'planned' | 'ongoing' | 'completed' | 'discontinued';
  provider: string;
  notes?: string;
}

export interface Allergy {
  id: string;
  allergen: string;
  type: 'drug' | 'food' | 'environmental' | 'other';
  reaction: string;
  severity: SeverityLevel;
  onsetDate?: Date;
  notes?: string;
}

export interface Medication {
  id: string;
  name: string;
  genericName?: string;
  dosage: string;
  frequency: string;
  route: 'oral' | 'iv' | 'im' | 'topical' | 'inhalation' | 'other';
  startDate: Date;
  endDate?: Date;
  prescribedBy: string;
  status: 'active' | 'discontinued' | 'completed';
  notes?: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  type: RecordType;
  status: RecordStatus;
  accessLevel: AccessLevel;
  
  // Metadatos
  metadata: {
    title: string;
    description?: string;
    createdBy: string;
    createdAt: Date;
    updatedBy?: string;
    updatedAt?: Date;
    version: number;
    tags?: string[];
  };

  // Información de la consulta/evento
  encounter: {
    id: string;
    date: Date;
    type: 'inpatient' | 'outpatient' | 'emergency' | 'telemedicine';
    location: string;
    provider: {
      id: string;
      name: string;
      specialty: string;
      license: string;
    };
    duration?: number; // minutes
  };

  // Datos clínicos
  clinical: {
    chiefComplaint?: string;
    historyOfPresentIllness?: string;
    vitalSigns?: VitalSigns[];
    symptoms?: Symptom[];
    physicalExamination?: {
      general?: string;
      systems?: Record<string, string>; // e.g., cardiovascular, respiratory
    };
    diagnostics?: {
      labResults?: any[];
      imagingStudies?: any[];
      otherTests?: any[];
    };
    diagnoses?: Diagnosis[];
    treatments?: Treatment[];
    medications?: Medication[];
    allergies?: Allergy[];
  };

  // Plan y seguimiento
  plan: {
    immediate?: string[];
    shortTerm?: string[];
    longTerm?: string[];
    followUp?: {
      date?: Date;
      provider?: string;
      reason?: string;
    };
    referrals?: {
      specialty: string;
      provider?: string;
      reason: string;
      urgency: 'routine' | 'urgent' | 'stat';
    }[];
  };

  // Cumplimiento y calidad
  compliance: {
    completeness: number; // 0-100%
    accuracy: number; // 0-100%
    validationStatus: 'pending' | 'validated' | 'rejected';
    validatedBy?: string;
    validatedAt?: Date;
    qualityScore?: number; // 0-100%
  };

  // Permisos y auditoría
  permissions: {
    read: string[]; // user IDs
    write: string[]; // user IDs
    delete: string[]; // user IDs
  };

  audit: {
    accessLog: {
      userId: string;
      action: 'read' | 'write' | 'delete';
      timestamp: Date;
      ipAddress?: string;
    }[];
    modifications: {
      field: string;
      oldValue: any;
      newValue: any;
      modifiedBy: string;
      modifiedAt: Date;
      reason?: string;
    }[];
  };
}

// Request/Response interfaces
export interface CreateMedicalRecordRequest {
  patientId: string;
  type: RecordType;
  accessLevel?: AccessLevel;
  metadata: {
    title: string;
    description?: string;
    tags?: string[];
  };
  encounter: {
    date: Date;
    type: 'inpatient' | 'outpatient' | 'emergency' | 'telemedicine';
    location: string;
    provider: {
      id: string;
      name: string;
      specialty: string;
      license: string;
    };
    duration?: number;
  };
  clinical?: Partial<MedicalRecord['clinical']>;
  plan?: Partial<MedicalRecord['plan']>;
}

export interface UpdateMedicalRecordRequest {
  recordId: string;
  updates: {
    metadata?: Partial<MedicalRecord['metadata']>;
    clinical?: Partial<MedicalRecord['clinical']>;
    plan?: Partial<MedicalRecord['plan']>;
    status?: RecordStatus;
    accessLevel?: AccessLevel;
  };
  updateReason?: string;
}

export interface MedicalRecordQueryFilters {
  patientId?: string;
  type?: RecordType[];
  status?: RecordStatus[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  provider?: string;
  diagnosis?: string;
  tags?: string[];
  accessLevel?: AccessLevel[];
  limit?: number;
  offset?: number;
  sortBy?: 'date' | 'type' | 'provider' | 'severity';
  sortOrder?: 'asc' | 'desc';
}

export interface MedicalRecordResponse {
  success: boolean;
  record?: MedicalRecord;
  records?: MedicalRecord[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    hasNext: boolean;
  };
  summary?: {
    totalRecords: number;
    byType: Record<RecordType, number>;
    byStatus: Record<RecordStatus, number>;
    recentActivity: {
      created: number;
      updated: number;
      accessed: number;
    };
  };
  message?: string;
  error?: string;
  code?: string;
}

// Errores específicos
export class MedicalRecordError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'MedicalRecordError';
  }
}

export class MedicalRecordValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    public value?: any
  ) {
    super(message);
    this.name = 'MedicalRecordValidationError';
  }
}

export class MedicalRecordPermissionError extends Error {
  constructor(
    message: string,
    public requiredPermission: string,
    public userPermissions: string[]
  ) {
    super(message);
    this.name = 'MedicalRecordPermissionError';
  }
}

export class MedicalRecordNotFoundError extends Error {
  constructor(recordId: string) {
    super(`Medical record not found: ${recordId}`);
    this.name = 'MedicalRecordNotFoundError';
  }
}

// Utilidades de validación
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  completeness: number;
  qualityScore: number;
}

export interface MedicalRecordExecutionContext {
  userId: string;
  userRole: string;
  permissions: string[];
  companyId?: string;
  requestId: string;
  startTime: Date;
  ipAddress?: string;
}
