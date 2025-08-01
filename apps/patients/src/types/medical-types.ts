// Tipos base para entidades médicas
export interface Patient {
  id: string;
  fullName: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  dateOfBirth: Date;
  bloodType: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  nationalId: string;
  insuranceNumber?: string;
  photo?: string;
  contactInfo: {
    phone: string;
    email: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
  };
  conditions: MedicalCondition[];
  allergies: Allergy[];
  lastVisit?: Date;
  nextAppointment?: Date;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  primaryDoctorId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Signos vitales
export interface VitalSigns {
  id: string;
  patientId: string;
  timestamp: Date;
  heartRate: VitalSignReading;
  bloodPressure: BloodPressureReading;
  temperature: VitalSignReading;
  respiratoryRate?: VitalSignReading;
  oxygenSaturation?: VitalSignReading;
  glucose?: VitalSignReading;
  weight?: number;
  height?: number;
  bmi?: number;
  hasAnomalies: boolean;
  recordedBy?: string;
}

export interface VitalSignReading {
  value: number;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
  timestamp?: Date;
}

export interface BloodPressureReading {
  systolic: number;
  diastolic: number;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
}

// Medicamentos
export interface Medication {
  id: string;
  name: string;
  genericName?: string;
  dosage: string;
  frequency: string;
  route: 'oral' | 'injection' | 'topical' | 'inhalation' | 'other';
  startDate: Date;
  endDate?: Date;
  status: 'active' | 'suspended' | 'completed';
  prescribedBy: string;
  purpose: string;
  instructions?: string;
  sideEffects?: string[];
  interactions?: string[];
  refillsRemaining?: number;
  lastRefillDate?: Date;
}

// Citas médicas
export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  date: Date;
  duration: number; // minutos
  type: 'consultation' | 'follow-up' | 'procedure' | 'emergency' | 'telemedicine';
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  reason: string;
  notes?: string;
  location?: string;
  isVirtual?: boolean;
  reminderSent?: boolean;
  preparationInstructions?: string;
}

// Resultados de laboratorio
export interface LabResult {
  id: string;
  patientId: string;
  orderedDate: Date;
  completedDate?: Date;
  category: 'blood' | 'urine' | 'imaging' | 'pathology' | 'other';
  tests: LabTest[];
  status: 'ordered' | 'in-progress' | 'completed' | 'cancelled';
  orderedBy: string;
  laboratory?: string;
  urgency: 'routine' | 'urgent' | 'stat';
  overallStatus?: 'normal' | 'abnormal' | 'critical';
}

export interface LabTest {
  name: string;
  result: string | number;
  unit?: string;
  referenceRange?: string;
  status: 'normal' | 'low' | 'high' | 'critical';
  notes?: string;
}

// Historial médico
export interface MedicalHistory {
  id: string;
  patientId: string;
  date: Date;
  type: 'diagnosis' | 'procedure' | 'surgery' | 'hospitalization' | 'vaccination' | 'allergy';
  title: string;
  description: string;
  provider?: string;
  facility?: string;
  documents?: MedicalDocument[];
  outcome?: string;
  followUpRequired?: boolean;
}

// Condiciones médicas
export interface MedicalCondition {
  id: string;
  name: string;
  icdCode?: string;
  diagnosedDate: Date;
  status: 'active' | 'resolved' | 'chronic' | 'managed';
  severity: 'mild' | 'moderate' | 'severe';
  notes?: string;
  medications?: string[];
}

// Alergias
export interface Allergy {
  id: string;
  allergen: string;
  type: 'medication' | 'food' | 'environmental' | 'other';
  severity: 'mild' | 'moderate' | 'severe' | 'life-threatening';
  reactions: string[];
  diagnosedDate?: Date;
  notes?: string;
}

// Contactos de emergencia
export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  alternatePhone?: string;
  email?: string;
  isPrimary: boolean;
  hasLegalAuthority?: boolean;
}

// Documentos médicos
export interface MedicalDocument {
  id: string;
  name: string;
  type: 'report' | 'image' | 'prescription' | 'consent' | 'other';
  uploadDate: Date;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  category?: string;
  description?: string;
}

// Alertas médicas
export interface MedicalAlert {
  id: string;
  patientId: string;
  type: 'vital_sign' | 'medication' | 'appointment' | 'lab_result' | 'general';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  actionRequired?: boolean;
  relatedEntityId?: string;
}

// Comunicación del equipo
export interface TeamMessage {
  id: string;
  patientId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  recipientIds: string[];
  message: string;
  timestamp: Date;
  isUrgent: boolean;
  isRead: boolean;
  attachments?: MessageAttachment[];
  parentMessageId?: string;
}

export interface MessageAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

// Actividades y eventos
export interface PatientActivity {
  id: string;
  patientId: string;
  type: string;
  description: string;
  timestamp: Date;
  performedBy?: string;
  details?: Record<string, any>;
}

// Preferencias del dashboard
export interface DashboardPreferences {
  layout: 'compact' | 'standard' | 'detailed';
  theme: 'light' | 'dark' | 'auto';
  showMetrics: boolean;
  autoRefresh: boolean;
  refreshInterval: number; // segundos
  favoritesSections: string[];
  hiddenSections: string[];
  notifications: {
    vitals: boolean;
    medications: boolean;
    appointments: boolean;
    labResults: boolean;
  };
} 