// 📝 TIPOS TYPESCRIPT ALTAMEDICA
// Definiciones centralizadas para todo el proyecto
// PROACTIVO: <350 líneas, tipado estricto, extensible

// 🏥 TIPOS MÉDICOS PRINCIPALES
export interface Patient {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  bloodType?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  emergencyContact?: EmergencyContact;
  medicalHistory?: MedicalHistory;
  allergies: Allergy[];
  currentMedications: Medication[];
  insuranceInfo?: InsuranceInfo;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface Doctor {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  specialty: MedicalSpecialty;
  licenseNumber: string;
  experience: number;
  education: Education[];
  certifications: Certification[];
  consultationFee: number;
  availability: DoctorAvailability[];
  rating: number;
  reviewCount: number;
  profileImage?: string;
  bio?: string;
  languages: string[];
  hospitalAffiliations: string[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  duration: number; // en minutos
  type: AppointmentType;
  status: AppointmentStatus;
  reason: string;
  symptoms?: string[];
  notes?: string;
  diagnosis?: string;
  prescriptions?: Prescription[];
  isTelemedicine: boolean;
  videoSessionId?: string;
  location?: string;
  estimatedCost: number;
  actualCost?: number;
  paymentStatus: PaymentStatus;
  createdAt: string;
  updatedAt: string;
  cancelledAt?: string;
  cancelReason?: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentId?: string;
  date: string;
  type: MedicalRecordType;
  title: string;
  description: string;
  diagnosis: string[];
  symptoms: string[];
  treatment: string;
  medications: Medication[];
  testResults: TestResult[];
  attachments: Attachment[];
  followUpRequired: boolean;
  followUpDate?: string;
  priority: Priority;
  isPrivate: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentId?: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  quantity: number;
  refillsAllowed: number;
  refillsUsed: number;
  prescribedDate: string;
  expiryDate: string;
  status: PrescriptionStatus;
  pharmacyId?: string;
  digitalSignature: string;
  verificationCode: string;
  sideEffects: string[];
  contraindications: string[];
  interactions: DrugInteraction[];
  createdAt: string;
  updatedAt: string;
}

// 🔧 TIPOS DE ENUMERACIÓN
export type AppointmentType = 
  | 'consultation' 
  | 'follow_up' 
  | 'emergency' 
  | 'routine_checkup'
  | 'specialist_referral'
  | 'diagnostic_test'
  | 'vaccination'
  | 'surgery_consultation';

export type AppointmentStatus = 
  | 'scheduled' 
  | 'confirmed' 
  | 'in_progress'
  | 'completed' 
  | 'cancelled'
  | 'no_show'
  | 'rescheduled';

export type MedicalRecordType = 
  | 'consultation'
  | 'diagnosis'
  | 'treatment'
  | 'test_result'
  | 'prescription'
  | 'surgery'
  | 'emergency'
  | 'vaccination'
  | 'other';

export type PrescriptionStatus = 
  | 'active'
  | 'completed'
  | 'cancelled'
  | 'expired'
  | 'partially_filled';

export type PaymentStatus = 
  | 'pending'
  | 'paid'
  | 'partially_paid'
  | 'refunded'
  | 'cancelled';

export type Priority = 'low' | 'normal' | 'high' | 'urgent' | 'critical';

export type MedicalSpecialty = 
  | 'general_medicine'
  | 'cardiology'
  | 'dermatology'
  | 'neurology'
  | 'orthopedics'
  | 'pediatrics'
  | 'psychiatry'
  | 'radiology'
  | 'surgery'
  | 'emergency_medicine'
  | 'family_medicine'
  | 'internal_medicine'
  | 'oncology'
  | 'gynecology'
  | 'urology'
  | 'ophthalmology'
  | 'ent'
  | 'anesthesiology'
  | 'pathology';

// 🏗️ TIPOS AUXILIARES
export interface EmergencyContact {
  name: string;
  relationship: string;
  phoneNumber: string;
  email?: string;
}

export interface MedicalHistory {
  conditions: string[];
  surgeries: Surgery[];
  hospitalizations: Hospitalization[];
  familyHistory: FamilyHistory[];
}

export interface Allergy {
  allergen: string;
  severity: 'mild' | 'moderate' | 'severe';
  reaction: string;
  diagnosedDate?: string;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  prescribedBy: string;
  notes?: string;
}

export interface InsuranceInfo {
  provider: string;
  policyNumber: string;
  groupNumber?: string;
  validUntil: string;
  coverageType: string;
}

export interface Education {
  institution: string;
  degree: string;
  year: number;
  country: string;
}

export interface Certification {
  name: string;
  issuingBody: string;
  issueDate: string;
  expiryDate?: string;
  certificateNumber: string;
}

export interface DoctorAvailability {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:mm format
  endTime: string;
  isAvailable: boolean;
}

export interface TestResult {
  testName: string;
  result: string;
  normalRange?: string;
  unit?: string;
  notes?: string;
  status: 'normal' | 'abnormal' | 'critical' | 'pending';
  performedDate: string;
  labName?: string;
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface DrugInteraction {
  drugName: string;
  severity: 'mild' | 'moderate' | 'severe';
  description: string;
  recommendation: string;
}

export interface Surgery {
  name: string;
  date: string;
  hospital: string;
  surgeon: string;
  notes?: string;
}

export interface Hospitalization {
  hospital: string;
  admissionDate: string;
  dischargeDate: string;
  reason: string;
  attendingPhysician: string;
}

export interface FamilyHistory {
  relation: string;
  condition: string;
  ageOfOnset?: number;
  notes?: string;
}

// 🎯 TIPOS DE RESPUESTA API
export interface APIResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
  };
  success: false;
  timestamp: string;
}

// 🔐 TIPOS DE AUTENTICACIÓN
export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  permissions: string[];
  patientId?: string;
  doctorId?: string;
  lastLogin?: string;
  isActive: boolean;
}

export type UserRole = 'patient' | 'doctor' | 'admin' | 'nurse' | 'staff';

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  role?: UserRole;
}

// 🤖 TIPOS DE IA MÉDICA
export interface SymptomAnalysis {
  symptoms: string[];
  possibleConditions: PossibleCondition[];
  severity: Priority;
  recommendations: string[];
  shouldSeekImmediateCare: boolean;
  confidence: number;
  analysisId: string;
  timestamp: string;
}

export interface PossibleCondition {
  name: string;
  probability: number;
  description: string;
  commonSymptoms: string[];
  recommendedTests: string[];
  urgency: Priority;
}

export interface DrugInteractionCheck {
  medications: string[];
  interactions: DrugInteraction[];
  severity: 'safe' | 'caution' | 'avoid';
  recommendations: string[];
  analysisId: string;
  timestamp: string;
}

// 📊 TIPOS DE DASHBOARD
export interface DashboardData {
  upcomingAppointments: Appointment[];
  recentRecords: MedicalRecord[];
  activePrescriptions: Prescription[];
  healthMetrics: HealthMetrics;
  notifications: Notification[];
  quickActions: QuickAction[];
}

export interface HealthMetrics {
  bloodPressure?: {
    systolic: number;
    diastolic: number;
    recordedAt: string;
  };
  heartRate?: {
    value: number;
    recordedAt: string;
  };
  weight?: {
    value: number;
    unit: 'kg' | 'lbs';
    recordedAt: string;
  };
  temperature?: {
    value: number;
    unit: 'celsius' | 'fahrenheit';
    recordedAt: string;
  };
  bloodSugar?: {
    value: number;
    unit: 'mg/dL' | 'mmol/L';
    recordedAt: string;
    type: 'fasting' | 'random' | 'post_meal';
  };
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'appointment' | 'prescription' | 'test_result';
  priority: Priority;
  isRead: boolean;
  actionUrl?: string;
  actionText?: string;
  createdAt: string;
  expiresAt?: string;
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  url: string;
  color: string;
  isEnabled: boolean;
  requiresAuth: boolean;
}

// 🔍 TIPOS DE BÚSQUEDA Y FILTROS
export interface SearchFilters {
  query?: string;
  dateFrom?: string;
  dateTo?: string;
  type?: string;
  status?: string;
  priority?: Priority;
  doctorId?: string;
  specialty?: MedicalSpecialty;
  tags?: string[];
}

export interface SortOptions {
  field: string;
  order: 'asc' | 'desc';
}

// 🎨 TIPOS DE UI
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox' | 'radio';
  placeholder?: string;
  required?: boolean;
  validation?: ValidationRule[];
  options?: SelectOption[];
  disabled?: boolean;
  helperText?: string;
}

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface ValidationRule {
  type: 'required' | 'email' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value?: any;
  message: string;
}

export interface Toast {
  id: string;
  title?: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
  autoClose?: boolean;
  actions?: ToastAction[];
}

export interface ToastAction {
  label: string;
  action: () => void;
  style?: 'primary' | 'secondary';
}
