/**
 * @altamedica/medical-types
 * Tipos e interfaces unificados para toda la plataforma médica AltaMedica
 */

// ==========================================
// ENUMS Y TIPOS BASE
// ==========================================

export enum UserRole {
  ADMIN = 'admin',
  DOCTOR = 'doctor',
  PATIENT = 'patient',
  NURSE = 'nurse',
  STAFF = 'staff',
  COMPANY_ADMIN = 'company-admin',
  COMPANY_USER = 'company-user',
  GUEST = 'guest'
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other'
}

export enum BloodType {
  A_POSITIVE = 'A+',
  A_NEGATIVE = 'A-',
  B_POSITIVE = 'B+',
  B_NEGATIVE = 'B-',
  AB_POSITIVE = 'AB+',
  AB_NEGATIVE = 'AB-',
  O_POSITIVE = 'O+',
  O_NEGATIVE = 'O-'
}

export enum AppointmentType {
  CONSULTATION = 'consultation',
  FOLLOW_UP = 'follow-up',
  PROCEDURE = 'procedure',
  EMERGENCY = 'emergency',
  TELEMEDICINE = 'telemedicine',
  CHECK_UP = 'check-up',
  VACCINATION = 'vaccination'
}

export enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no-show',
  RESCHEDULED = 'rescheduled'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled'
}

export enum MedicalSpecialty {
  GENERAL_PRACTICE = 'general-practice',
  CARDIOLOGY = 'cardiology',
  DERMATOLOGY = 'dermatology',
  ENDOCRINOLOGY = 'endocrinology',
  GASTROENTEROLOGY = 'gastroenterology',
  GYNECOLOGY = 'gynecology',
  HEMATOLOGY = 'hematology',
  IMMUNOLOGY = 'immunology',
  INTERNAL_MEDICINE = 'internal-medicine',
  NEPHROLOGY = 'nephrology',
  NEUROLOGY = 'neurology',
  OBSTETRICS = 'obstetrics',
  ONCOLOGY = 'oncology',
  OPHTHALMOLOGY = 'ophthalmology',
  ORTHOPEDICS = 'orthopedics',
  OTOLARYNGOLOGY = 'otolaryngology',
  PEDIATRICS = 'pediatrics',
  PSYCHIATRY = 'psychiatry',
  PULMONOLOGY = 'pulmonology',
  RADIOLOGY = 'radiology',
  RHEUMATOLOGY = 'rheumatology',
  SURGERY = 'surgery',
  UROLOGY = 'urology'
}

export enum MedicationRoute {
  ORAL = 'oral',
  INJECTION = 'injection',
  TOPICAL = 'topical',
  INHALATION = 'inhalation',
  SUBLINGUAL = 'sublingual',
  RECTAL = 'rectal',
  TRANSDERMAL = 'transdermal',
  OPHTHALMIC = 'ophthalmic',
  OTIC = 'otic',
  NASAL = 'nasal',
  OTHER = 'other'
}

export enum MedicationStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  COMPLETED = 'completed',
  DISCONTINUED = 'discontinued'
}

export enum VitalSignStatus {
  NORMAL = 'normal',
  WARNING = 'warning',
  CRITICAL = 'critical'
}

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// ==========================================
// INTERFACES BASE
// ==========================================

export interface BaseEntity {
  id: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface ContactInfo {
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

// ==========================================
// USUARIO Y AUTENTICACIÓN
// ==========================================

export interface User extends BaseEntity {
  uid: string;
  email: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  photoURL?: string;
  emailVerified: boolean;
  phoneNumber?: string;
  isActive: boolean;
  lastLoginAt?: string | Date;
  profileComplete?: boolean;
  metadata?: Record<string, any>;
}

// ==========================================
// PACIENTE
// ==========================================

export interface Patient extends BaseEntity {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  dateOfBirth: string | Date;
  age?: number;
  gender: Gender;
  bloodType?: BloodType;
  nationalId?: string;
  insuranceNumber?: string;
  photo?: string;
  contactInfo: ContactInfo;
  emergencyContact?: EmergencyContact;
  medicalHistory?: MedicalHistory;
  conditions?: MedicalCondition[];
  allergies: Allergy[];
  currentMedications: Medication[];
  insuranceInfo?: InsuranceInfo;
  riskLevel?: RiskLevel;
  primaryDoctorId?: string;
  lastVisit?: string | Date;
  nextAppointment?: string | Date;
  isActive: boolean;
}

// ==========================================
// DOCTOR
// ==========================================

export interface Doctor extends BaseEntity {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  specialty: MedicalSpecialty;
  subspecialties?: MedicalSpecialty[];
  licenseNumber: string;
  experience: number; // años
  education: Education[];
  certifications: Certification[];
  consultationFee: number;
  availability: DoctorAvailability[];
  rating?: number;
  reviewCount?: number;
  profileImage?: string;
  bio?: string;
  languages: string[];
  hospitalAffiliations: string[];
  acceptedInsurances?: string[];
  isActive: boolean;
  isAvailableForTelemedicine?: boolean;
}

export interface Education {
  degree: string;
  institution: string;
  year: number;
  country: string;
}

export interface Certification {
  name: string;
  issuingOrganization: string;
  issueDate: string;
  expiryDate?: string;
  certificateNumber?: string;
}

export interface DoctorAvailability {
  dayOfWeek: number; // 0-6 (domingo-sábado)
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  isAvailable: boolean;
  location?: string;
  maxAppointments?: number;
}

// ==========================================
// CITAS MÉDICAS
// ==========================================

export interface Appointment extends BaseEntity {
  patientId: string;
  patientName?: string;
  doctorId: string;
  doctorName?: string;
  specialty?: MedicalSpecialty;
  date: string | Date;
  time: string;
  duration: number; // minutos
  type: AppointmentType;
  status: AppointmentStatus;
  reason: string;
  symptoms?: string[];
  notes?: string;
  diagnosis?: string;
  prescriptions?: Prescription[];
  isTelemedicine: boolean;
  isVirtual?: boolean;
  videoSessionId?: string;
  meetingUrl?: string;
  location?: string;
  roomNumber?: string;
  estimatedCost?: number;
  actualCost?: number;
  paymentStatus: PaymentStatus;
  paymentId?: string;
  preparationInstructions?: string;
  reminderSent?: boolean;
  followUpRequired?: boolean;
  followUpDate?: string | Date;
  cancelledAt?: string | Date;
  cancelReason?: string;
  attachments?: MedicalDocument[];
}

// ==========================================
// HISTORIAL MÉDICO
// ==========================================

export interface MedicalHistory extends BaseEntity {
  patientId: string;
  chronicConditions: string[];
  pastSurgeries: Surgery[];
  familyHistory: FamilyHistory[];
  socialHistory: SocialHistory;
  immunizations: Immunization[];
  screenings: MedicalScreening[];
  hospitalizations: Hospitalization[];
}

export interface Surgery {
  name: string;
  date: string | Date;
  hospital?: string;
  surgeon?: string;
  complications?: string;
  notes?: string;
}

export interface FamilyHistory {
  relationship: string;
  condition: string;
  ageAtDiagnosis?: number;
  isDeceased?: boolean;
  ageAtDeath?: number;
  causeOfDeath?: string;
}

export interface SocialHistory {
  smokingStatus: 'never' | 'former' | 'current' | 'unknown';
  alcoholUse: 'none' | 'social' | 'moderate' | 'heavy' | 'unknown';
  drugUse?: string;
  exerciseFrequency: 'none' | 'occasional' | 'regular' | 'daily';
  diet?: string;
  occupation?: string;
  maritalStatus?: string;
}

export interface Immunization {
  vaccine: string;
  date: string | Date;
  boosterDate?: string | Date;
  nextDueDate?: string | Date;
  provider?: string;
  lotNumber?: string;
  site?: string;
  notes?: string;
}

export interface MedicalScreening {
  type: string;
  date: string | Date;
  result: string;
  nextDueDate?: string | Date;
  provider?: string;
  notes?: string;
}

export interface Hospitalization {
  admissionDate: string | Date;
  dischargeDate?: string | Date;
  hospital: string;
  reason: string;
  diagnosis?: string;
  procedures?: string[];
  complications?: string;
  dischargeSummary?: string;
}

// ==========================================
// REGISTROS MÉDICOS
// ==========================================

export interface MedicalRecord extends BaseEntity {
  patientId: string;
  doctorId: string;
  appointmentId?: string;
  type: 'consultation' | 'lab-result' | 'imaging' | 'procedure' | 'discharge-summary' | 'other';
  title: string;
  date: string | Date;
  chiefComplaint?: string;
  historyOfPresentIllness?: string;
  physicalExamination?: PhysicalExamination;
  vitalSigns?: VitalSigns;
  diagnosis: string[];
  differentialDiagnosis?: string[];
  treatmentPlan?: string;
  medications?: Medication[];
  labOrders?: LabOrder[];
  imagingOrders?: ImagingOrder[];
  followUpInstructions?: string;
  attachments?: MedicalDocument[];
  notes?: string;
  isConfidential?: boolean;
}

export interface PhysicalExamination {
  general?: string;
  heent?: string; // Head, Eyes, Ears, Nose, Throat
  cardiovascular?: string;
  respiratory?: string;
  gastrointestinal?: string;
  genitourinary?: string;
  musculoskeletal?: string;
  neurological?: string;
  psychiatric?: string;
  skin?: string;
  other?: string;
}

// ==========================================
// SIGNOS VITALES
// ==========================================

export interface VitalSigns extends BaseEntity {
  patientId: string;
  recordedAt: string | Date;
  heartRate?: VitalSignReading;
  bloodPressure?: BloodPressureReading;
  temperature?: VitalSignReading;
  respiratoryRate?: VitalSignReading;
  oxygenSaturation?: VitalSignReading;
  glucose?: VitalSignReading;
  weight?: number;
  height?: number;
  bmi?: number;
  painScore?: number; // 0-10
  hasAnomalies?: boolean;
  recordedBy?: string;
  notes?: string;
}

export interface VitalSignReading {
  value: number;
  unit: string;
  status: VitalSignStatus;
  referenceRange?: {
    min: number;
    max: number;
  };
}

export interface BloodPressureReading {
  systolic: number;
  diastolic: number;
  unit: string;
  status: VitalSignStatus;
  position?: 'sitting' | 'standing' | 'lying';
  arm?: 'left' | 'right';
}

// ==========================================
// MEDICAMENTOS Y PRESCRIPCIONES
// ==========================================

export interface Medication extends BaseEntity {
  name: string;
  genericName?: string;
  dosage: string;
  frequency: string;
  route: MedicationRoute;
  startDate: string | Date;
  endDate?: string | Date;
  duration?: string;
  status: MedicationStatus;
  prescribedBy?: string;
  prescribedDate?: string | Date;
  purpose: string;
  instructions?: string;
  sideEffects?: string[];
  interactions?: string[];
  contraindications?: string[];
  refillsRemaining?: number;
  lastRefillDate?: string | Date;
  pharmacy?: string;
  manufacturerInfo?: {
    manufacturer: string;
    lotNumber?: string;
    expiryDate?: string | Date;
  };
}

export interface Prescription extends BaseEntity {
  patientId: string;
  doctorId: string;
  appointmentId?: string;
  medications: Medication[];
  prescriptionNumber?: string;
  issueDate: string | Date;
  validUntil?: string | Date;
  status: 'active' | 'filled' | 'partially-filled' | 'expired' | 'cancelled';
  pharmacyId?: string;
  pharmacyName?: string;
  dispensedDate?: string | Date;
  dispensedBy?: string;
  notes?: string;
  isControlled?: boolean;
  requiresAuthorization?: boolean;
  authorizationNumber?: string;
}

// ==========================================
// CONDICIONES Y ALERGIAS
// ==========================================

export interface MedicalCondition {
  id: string;
  name: string;
  icdCode?: string; // ICD-10 code
  diagnosedDate: string | Date;
  diagnosedBy?: string;
  severity: 'mild' | 'moderate' | 'severe';
  status: 'active' | 'resolved' | 'chronic' | 'in-remission';
  treatment?: string;
  notes?: string;
}

export interface Allergy {
  id: string;
  allergen: string;
  type: 'drug' | 'food' | 'environmental' | 'other';
  severity: 'mild' | 'moderate' | 'severe' | 'life-threatening';
  reaction: string;
  diagnosedDate?: string | Date;
  diagnosedBy?: string;
  notes?: string;
  verificationStatus: 'confirmed' | 'suspected' | 'refuted';
}

// ==========================================
// LABORATORIO Y DIAGNÓSTICO
// ==========================================

export interface LabOrder extends BaseEntity {
  patientId: string;
  doctorId: string;
  orderNumber?: string;
  tests: LabTest[];
  priority: 'routine' | 'urgent' | 'stat';
  status: 'ordered' | 'collected' | 'in-progress' | 'completed' | 'cancelled';
  orderDate: string | Date;
  collectionDate?: string | Date;
  resultDate?: string | Date;
  collectionSite?: string;
  fastingRequired?: boolean;
  specialInstructions?: string;
  results?: LabResult[];
}

export interface LabTest {
  code: string;
  name: string;
  category?: string;
  specimen?: string;
  method?: string;
}

export interface LabResult {
  testCode: string;
  testName: string;
  value: string | number;
  unit?: string;
  referenceRange?: string;
  flag?: 'normal' | 'high' | 'low' | 'critical' | 'abnormal';
  interpretation?: string;
  comments?: string;
  performedBy?: string;
  verifiedBy?: string;
}

export interface ImagingOrder extends BaseEntity {
  patientId: string;
  doctorId: string;
  orderNumber?: string;
  type: 'x-ray' | 'ct' | 'mri' | 'ultrasound' | 'pet' | 'mammography' | 'other';
  bodyPart: string;
  indication: string;
  priority: 'routine' | 'urgent' | 'stat';
  status: 'ordered' | 'scheduled' | 'completed' | 'cancelled';
  contrast?: boolean;
  contrastType?: string;
  orderDate: string | Date;
  scheduledDate?: string | Date;
  completedDate?: string | Date;
  facility?: string;
  technician?: string;
  radiologist?: string;
  findings?: string;
  impression?: string;
  report?: MedicalDocument;
  images?: MedicalDocument[];
}

// ==========================================
// DOCUMENTOS Y ARCHIVOS
// ==========================================

export interface MedicalDocument {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'dicom' | 'video' | 'other';
  category: 'lab-result' | 'imaging' | 'report' | 'prescription' | 'consent' | 'insurance' | 'other';
  url?: string;
  size?: number;
  mimeType?: string;
  uploadedBy: string;
  uploadedAt: string | Date;
  patientId?: string;
  appointmentId?: string;
  description?: string;
  tags?: string[];
  isConfidential?: boolean;
  metadata?: Record<string, any>;
}

// ==========================================
// SEGUROS Y PAGOS
// ==========================================

export interface InsuranceInfo {
  provider: string;
  policyNumber: string;
  groupNumber?: string;
  subscriberName?: string;
  subscriberId?: string;
  relationship?: 'self' | 'spouse' | 'child' | 'other';
  effectiveDate: string | Date;
  expirationDate?: string | Date;
  copayAmount?: number;
  deductible?: number;
  outOfPocketMax?: number;
  coverageDetails?: string;
  primaryCarePhysician?: string;
  priorAuthorizationRequired?: boolean;
  contactPhone?: string;
  claimsAddress?: string;
}

export interface Payment extends BaseEntity {
  patientId: string;
  appointmentId?: string;
  amount: number;
  currency: string;
  method: 'cash' | 'credit-card' | 'debit-card' | 'insurance' | 'transfer' | 'other';
  status: PaymentStatus;
  transactionId?: string;
  paymentDate?: string | Date;
  receiptNumber?: string;
  insuranceClaim?: InsuranceClaim;
  notes?: string;
}

export interface InsuranceClaim {
  claimNumber: string;
  submittedDate: string | Date;
  approvedAmount?: number;
  deniedAmount?: number;
  pendingAmount?: number;
  status: 'submitted' | 'pending' | 'approved' | 'denied' | 'partially-approved';
  denialReason?: string;
  appealDate?: string | Date;
  appealStatus?: string;
}

// ==========================================
// NOTIFICACIONES Y ALERTAS
// ==========================================

export interface MedicalAlert {
  id: string;
  patientId: string;
  type: 'allergy' | 'condition' | 'medication' | 'lab-result' | 'vital-sign' | 'other';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  triggerValue?: string | number;
  isActive: boolean;
  createdBy: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string | Date;
  expiresAt?: string | Date;
}

export interface Notification extends BaseEntity {
  userId: string;
  type: 'appointment' | 'medication' | 'lab-result' | 'message' | 'alert' | 'other';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isRead: boolean;
  readAt?: string | Date;
  actionUrl?: string;
  actionText?: string;
  metadata?: Record<string, any>;
}

// ==========================================
// ACTIVIDAD Y METRICAS
// ==========================================

export interface PatientActivity extends BaseEntity {
  patientId: string;
  type: 'login' | 'appointment-booked' | 'appointment-cancelled' | 'record-viewed' | 'message-sent' | 'other';
  description: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

export interface HealthMetric extends BaseEntity {
  patientId: string;
  type: string;
  value: number;
  unit: string;
  source: 'manual' | 'device' | 'import';
  deviceId?: string;
  recordedAt: string | Date;
  notes?: string;
}

// ==========================================
// EXPORTACIONES ADICIONALES
// ==========================================

// Version info para medical-types
export const MEDICAL_TYPES_VERSION = '1.0.0';

// Type guards útiles
export const isPatient = (user: User): user is User & { role: UserRole.PATIENT } => {
  return user.role === UserRole.PATIENT;
};

export const isDoctor = (user: User): user is User & { role: UserRole.DOCTOR } => {
  return user.role === UserRole.DOCTOR;
};

export const isAdmin = (user: User): user is User & { role: UserRole.ADMIN } => {
  return user.role === UserRole.ADMIN;
};

// Utilidades de fecha
export const toDateString = (date: string | Date): string => {
  if (typeof date === 'string') return date;
  return date.toISOString();
};

export const toDate = (date: string | Date): Date => {
  if (date instanceof Date) return date;
  return new Date(date);
};