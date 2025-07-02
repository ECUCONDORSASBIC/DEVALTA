/**
 * 💊 PRESCRIPTIONS API TYPES
 * Sistema completo de prescripciones médicas electrónicas con cumplimiento FDA/DEA
 */

export enum PrescriptionStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  SENT_TO_PHARMACY = 'sent_to_pharmacy',
  FILLED = 'filled',
  PARTIALLY_FILLED = 'partially_filled',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  ON_HOLD = 'on_hold'
}

export enum PrescriptionType {
  NEW = 'new',
  REFILL = 'refill',
  RENEWAL = 'renewal',
  MODIFICATION = 'modification',
  DISCONTINUATION = 'discontinuation'
}

export enum DrugSchedule {
  SCHEDULE_I = 'schedule_1',      // DEA Schedule I - No accepted medical use
  SCHEDULE_II = 'schedule_2',     // DEA Schedule II - High abuse potential
  SCHEDULE_III = 'schedule_3',    // DEA Schedule III - Moderate abuse potential
  SCHEDULE_IV = 'schedule_4',     // DEA Schedule IV - Low abuse potential
  SCHEDULE_V = 'schedule_5',      // DEA Schedule V - Lowest abuse potential
  NON_CONTROLLED = 'non_controlled'
}

export enum RouteOfAdministration {
  ORAL = 'oral',
  TOPICAL = 'topical',
  INJECTION = 'injection',
  INTRAVENOUS = 'intravenous',
  INTRAMUSCULAR = 'intramuscular',
  SUBCUTANEOUS = 'subcutaneous',
  INHALATION = 'inhalation',
  NASAL = 'nasal',
  OPHTHALMIC = 'ophthalmic',
  OTIC = 'otic',
  RECTAL = 'rectal',
  VAGINAL = 'vaginal',
  TRANSDERMAL = 'transdermal'
}

export enum InteractionSeverity {
  MINOR = 'minor',
  MODERATE = 'moderate',
  MAJOR = 'major',
  CONTRAINDICATED = 'contraindicated'
}

export enum PrescriptionUrgency {
  ROUTINE = 'routine',
  URGENT = 'urgent',
  EMERGENCY = 'emergency',
  STAT = 'stat'
}

// Interfaces principales
export interface DrugInformation {
  id: string;
  name: string;
  genericName: string;
  brandNames: string[];
  ndcNumber: string; // National Drug Code
  rxcui?: string; // RxNorm Concept Unique Identifier
  schedule: DrugSchedule;
  strength: string;
  dosageForm: string;
  route: RouteOfAdministration;
  manufacturer: string;
  fdaApproved: boolean;
  blackBoxWarning?: string;
  therapeuticClass: string[];
  pharmacologicalClass: string[];
  contraindications: string[];
  warnings: string[];
  sideEffects: string[];
  pregnancyCategory?: string;
  lactationCategory?: string;
  isGenericAvailable: boolean;
  averageWholesalePrice?: number;
}

export interface Dosage {
  strength: string;          // e.g., "500mg", "10ml"
  frequency: string;         // e.g., "twice daily", "every 8 hours"
  route: RouteOfAdministration;
  quantity: number;          // Total quantity to dispense
  quantityUnit: string;      // e.g., "tablets", "ml", "capsules"
  daysSupply: number;        // Number of days the prescription should last
  refillsAuthorized: number; // Number of refills allowed
  instructions: string;      // Patient instructions (SIG)
  takeWith?: string;         // "food", "water", "empty stomach"
  specialInstructions?: string[];
}

export interface DrugInteraction {
  id: string;
  drugA: string;            // Drug name or ID
  drugB: string;            // Interacting drug name or ID
  severity: InteractionSeverity;
  mechanism: string;        // How the interaction occurs
  clinicalEffect: string;   // What happens to the patient
  management: string;       // How to manage the interaction
  evidence: 'theoretical' | 'case_report' | 'study' | 'established';
  onset: 'rapid' | 'delayed' | 'unknown';
  documentation: 'excellent' | 'good' | 'fair' | 'poor';
  references?: string[];
}

export interface AllergyInteraction {
  allergen: string;
  reaction: string;
  severity: 'mild' | 'moderate' | 'severe' | 'life_threatening';
  crossReactivity: string[];
  avoidanceInstructions: string;
}

export interface ElectronicSignature {
  prescriberId: string;
  prescriberName: string;
  deaNumber: string;
  npiNumber: string;
  licenseNumber: string;
  signatureTimestamp: Date;
  signatureMethod: 'password' | 'biometric' | 'token' | 'certificate';
  ipAddress: string;
  digitalCertificate?: string;
  isValid: boolean;
}

export interface PharmacyInformation {
  id: string;
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  phone: string;
  fax?: string;
  email?: string;
  ncpdpId: string; // National Council for Prescription Drug Programs ID
  deaNumber?: string;
  npiNumber: string;
  isActive: boolean;
  acceptsEPrescriptions: boolean;
  preferredPharmacy: boolean;
  networkPlan?: string[];
}

export interface Prescription {
  id: string;
  prescriptionNumber: string;
  status: PrescriptionStatus;
  type: PrescriptionType;
  urgency: PrescriptionUrgency;
  
  // Patient Information
  patientId: string;
  patientName: string;
  patientDateOfBirth: Date;
  patientAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  
  // Prescriber Information
  prescriberId: string;
  prescriberName: string;
  prescriberSpecialty: string;
  deaNumber: string;
  npiNumber: string;
  licenseNumber: string;
  prescriberAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  prescriberPhone: string;
  
  // Drug Information
  drug: DrugInformation;
  dosage: Dosage;
  
  // Clinical Information
  indication: string;          // Why the drug is being prescribed
  diagnosis: string[];         // ICD-10 codes
  medicalRecordId?: string;    // Link to medical record
  
  // Safety Information
  drugInteractions: DrugInteraction[];
  allergyInteractions: AllergyInteraction[];
  contraindications: string[];
  warnings: string[];
  
  // Pharmacy Information
  pharmacy?: PharmacyInformation;
  pharmacyInstructions?: string;
  
  // Electronic Signature
  electronicSignature?: ElectronicSignature;
  
  // Dates and Tracking
  datePrescribed: Date;
  dateWritten: Date;
  effectiveDate: Date;
  expirationDate: Date;
  lastFillDate?: Date;
  nextRefillDate?: Date;
  
  // Refill Information
  refillsRemaining: number;
  fillHistory: PrescriptionFill[];
  
  // Compliance and Monitoring
  priorAuthorization?: {
    required: boolean;
    status: 'pending' | 'approved' | 'denied';
    authorizationNumber?: string;
    expirationDate?: Date;
  };
  
  // Insurance Information
  insurance?: {
    planName: string;
    groupNumber: string;
    memberNumber: string;
    rxBin?: string;
    rxPcn?: string;
    copay?: number;
    deductible?: number;
  };
  
  // Audit Trail
  auditTrail: PrescriptionAuditEvent[];
  
  // Metadata
  metadata: {
    createdBy: string;
    createdAt: Date;
    updatedBy?: string;
    updatedAt?: Date;
    version: number;
    notes?: string;
    tags?: string[];
  };
}

export interface PrescriptionFill {
  fillNumber: number;
  fillDate: Date;
  quantityFilled: number;
  daysSupplyFilled: number;
  pharmacyId: string;
  pharmacistId: string;
  ndcFilled: string;
  lotNumber?: string;
  expirationDate?: Date;
  priceCharged?: number;
  insurancePayment?: number;
  patientPayment?: number;
  fillStatus: 'completed' | 'partial' | 'cancelled';
}

export interface PrescriptionAuditEvent {
  eventId: string;
  eventType: 'created' | 'modified' | 'signed' | 'transmitted' | 'filled' | 'cancelled';
  timestamp: Date;
  userId: string;
  userRole: string;
  ipAddress: string;
  description: string;
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
}

// Request/Response interfaces
export interface CreatePrescriptionRequest {
  patientId: string;
  prescriberId: string;
  type?: PrescriptionType;
  urgency?: PrescriptionUrgency;
  
  drug: {
    id?: string;
    name: string;
    genericName?: string;
    ndcNumber?: string;
    strength: string;
    dosageForm: string;
  };
  
  dosage: Omit<Dosage, 'route'> & {
    route: RouteOfAdministration;
  };
  
  indication: string;
  diagnosis: string[];
  medicalRecordId?: string;
  
  pharmacyId?: string;
  pharmacyInstructions?: string;
  
  priorAuthorizationRequired?: boolean;
  
  metadata?: {
    notes?: string;
    tags?: string[];
  };
}

export interface GeneratePrescriptionRequest extends CreatePrescriptionRequest {
  checkInteractions?: boolean;
  checkAllergies?: boolean;
  validateDosage?: boolean;
  electronicSignature?: {
    method: 'password' | 'biometric' | 'token';
    credentials: string;
  };
}

export interface UpdatePrescriptionRequest {
  prescriptionId: string;
  updates: {
    dosage?: Partial<Dosage>;
    pharmacyId?: string;
    pharmacyInstructions?: string;
    status?: PrescriptionStatus;
    notes?: string;
  };
  updateReason: string;
  electronicSignature?: {
    method: 'password' | 'biometric' | 'token';
    credentials: string;
  };
}

export interface PrescriptionQueryFilters {
  patientId?: string;
  prescriberId?: string;
  status?: PrescriptionStatus[];
  type?: PrescriptionType[];
  urgency?: PrescriptionUrgency[];
  drugName?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  pharmacyId?: string;
  expiringWithinDays?: number;
  needsRefill?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: 'date' | 'patient' | 'drug' | 'status' | 'expiration';
  sortOrder?: 'asc' | 'desc';
}

export interface PrescriptionResponse {
  success: boolean;
  prescription?: Prescription;
  prescriptions?: Prescription[];
  interactions?: DrugInteraction[];
  allergyInteractions?: AllergyInteraction[];
  warnings?: string[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    hasNext: boolean;
  };
  summary?: {
    totalPrescriptions: number;
    byStatus: Record<PrescriptionStatus, number>;
    byType: Record<PrescriptionType, number>;
    expiringCount: number;
    refillsNeeded: number;
  };
  message?: string;
  error?: string;
  code?: string;
}

// Error classes específicas
export class PrescriptionError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'PrescriptionError';
  }
}

export class DrugInteractionError extends Error {
  constructor(
    message: string,
    public interactions: DrugInteraction[],
    public severity: InteractionSeverity
  ) {
    super(message);
    this.name = 'DrugInteractionError';
  }
}

export class InvalidDosageError extends Error {
  constructor(
    message: string,
    public field: string,
    public value: any,
    public validRange?: any
  ) {
    super(message);
    this.name = 'InvalidDosageError';
  }
}

export class PrescriptionValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    public value?: any
  ) {
    super(message);
    this.name = 'PrescriptionValidationError';
  }
}

export class UnauthorizedPrescriberError extends Error {
  constructor(
    message: string,
    public prescriberId: string,
    public requiredCredentials: string[]
  ) {
    super(message);
    this.name = 'UnauthorizedPrescriberError';
  }
}

export class PrescriptionNotFoundError extends Error {
  constructor(prescriptionId: string) {
    super(`Prescription not found: ${prescriptionId}`);
    this.name = 'PrescriptionNotFoundError';
  }
}

// Execution context
export interface PrescriptionExecutionContext {
  userId: string;
  userRole: string;
  permissions: string[];
  companyId?: string;
  requestId: string;
  startTime: Date;
  ipAddress?: string;
  deaNumber?: string;
  npiNumber?: string;
}

// Validation result
export interface PrescriptionValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  interactions: DrugInteraction[];
  allergyInteractions: AllergyInteraction[];
  dosageValidation: {
    isValid: boolean;
    recommendedRange?: string;
    maxDailyDose?: string;
    warnings: string[];
  };
  regulatoryCompliance: {
    deaCompliant: boolean;
    fdaApproved: boolean;
    schedulingCompliant: boolean;
    issues: string[];
  };
}
