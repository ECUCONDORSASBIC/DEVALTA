// packages/ai-medical-core/src/chatbot/types.ts

export interface MedicalContext {
  patientAge?: number;
  patientGender?: 'male' | 'female' | 'other';
  medicalHistory?: string[];
  currentMedications?: string[];
  allergies?: string[];
  vitalSigns?: VitalSigns;
  chiefComplaint?: string;
  recentLabResults?: LabResult[];
  immunizations?: Immunization[];
  familyHistory?: FamilyHistory[];
}

export interface VitalSigns {
  bloodPressure?: string;
  heartRate?: number;
  temperature?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
  weight?: number;
  height?: number;
  bmi?: number;
  painLevel?: number;
}

export interface LabResult {
  testName: string;
  value: string | number;
  unit: string;
  referenceRange: string;
  date: Date;
  isAbnormal?: boolean;
}

export interface Immunization {
  vaccine: string;
  date: Date;
  boosterDue?: Date;
}

export interface FamilyHistory {
  relationship: string;
  condition: string;
  ageAtDiagnosis?: number;
}

export interface SymptomAnalysis {
  symptoms: Symptom[];
  duration: string;
  severity: 'mild' | 'moderate' | 'severe' | 'unknown';
  possibleConditions: PossibleCondition[];
  urgencyLevel: 'low' | 'medium' | 'high' | 'emergency';
  recommendedActions: string[];
  redFlags?: string[];
}

export interface Symptom {
  name: string;
  severity: 'mild' | 'moderate' | 'severe';
  location?: string;
  characteristics?: string[];
  triggers?: string[];
  relievingFactors?: string[];
  associatedSymptoms?: string[];
}

export interface PossibleCondition {
  name: string;
  icd10Code?: string;
  probability: number;
  reasoning: string;
  commonIn?: string[];
  requiresTests?: string[];
}

export interface ChatResponse {
  response: string;
  type: 'general_information' | 'medical_guidance' | 'urgent_care_advice' | 'emergency_advice' | 'safety_warning' | 'error';
  confidence: number;
  sources: MedicalSource[];
  symptomAnalysis?: SymptomAnalysis;
  followUpQuestions?: string[];
  recommendedSpecialist?: string;
  estimatedWaitTime?: string;
  disclaimers?: string[];
}

export interface MedicalSource {
  title: string;
  url?: string;
  relevance: number;
  lastUpdated?: Date;
  credibility?: 'high' | 'medium' | 'low';
}

export interface SafetyCheckResult {
  isSafe: boolean;
  reason?: string;
  category?: 'emergency' | 'self_harm' | 'violence' | 'medication_abuse' | 'other';
  suggestedAction?: string;
}

export interface ConversationContext {
  sessionId: string;
  userId: string;
  startTime: Date;
  lastActivity: Date;
  conversationHistory: ConversationMessage[];
  symptomHistory: SymptomAnalysis[];
  patientProfile?: PatientProfile;
  preferences?: UserPreferences;
}

export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    confidence?: number;
    responseType?: string;
    symptomDetected?: boolean;
  };
}

export interface PatientProfile {
  id: string;
  demographics: {
    age: number;
    gender: 'male' | 'female' | 'other';
    location?: string;
    language: string;
  };
  medicalRecord?: {
    conditions: string[];
    medications: Medication[];
    allergies: Allergy[];
    surgeries: Surgery[];
    providers: HealthcareProvider[];
  };
  insuranceInfo?: InsuranceInfo;
  emergencyContacts?: EmergencyContact[];
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  startDate: Date;
  endDate?: Date;
  prescribedBy: string;
  reason: string;
  sideEffects?: string[];
}

export interface Allergy {
  allergen: string;
  reaction: string;
  severity: 'mild' | 'moderate' | 'severe' | 'life-threatening';
  discoveredDate?: Date;
}

export interface Surgery {
  procedure: string;
  date: Date;
  surgeon: string;
  hospital: string;
  complications?: string[];
  outcome: string;
}

export interface HealthcareProvider {
  name: string;
  specialty: string;
  phone: string;
  email?: string;
  address?: string;
  isPrimary: boolean;
}

export interface InsuranceInfo {
  provider: string;
  policyNumber: string;
  groupNumber?: string;
  coverageType: string;
  validUntil: Date;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  alternatePhone?: string;
}

export interface UserPreferences {
  communicationStyle: 'detailed' | 'concise' | 'balanced';
  medicalKnowledgeLevel: 'basic' | 'intermediate' | 'advanced';
  preferredLanguage: string;
  notificationPreferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  privacySettings: {
    shareWithProviders: boolean;
    allowAnonymousAnalytics: boolean;
    dataRetentionDays: number;
  };
}

export interface KnowledgeSearchParams {
  query: string;
  context?: MedicalContext;
  topK?: number;
  filters?: {
    specialties?: string[];
    conditionTypes?: string[];
    ageGroups?: string[];
    dateRange?: {
      start: Date;
      end: Date;
    };
  };
}

export interface DiagnosticSuggestion {
  condition: string;
  confidence: number;
  supportingSymptoms: string[];
  contradictingSymptoms?: string[];
  recommendedTests: DiagnosticTest[];
  differentialDiagnoses: string[];
  clinicalPathway?: ClinicalPathway;
}

export interface DiagnosticTest {
  name: string;
  type: 'laboratory' | 'imaging' | 'physical' | 'specialist_consultation';
  reason: string;
  urgency: 'routine' | 'urgent' | 'stat';
  estimatedCost?: {
    min: number;
    max: number;
    currency: string;
  };
  preparationRequired?: string[];
}

export interface ClinicalPathway {
  steps: PathwayStep[];
  estimatedDuration: string;
  outcomes: {
    best: string;
    typical: string;
    considerations: string[];
  };
}

export interface PathwayStep {
  order: number;
  action: string;
  responsible: 'patient' | 'primary_care' | 'specialist' | 'emergency';
  timeframe: string;
  prerequisites?: string[];
}

// Enums para valores constantes
export enum ResponseType {
  GENERAL_INFORMATION = 'general_information',
  MEDICAL_GUIDANCE = 'medical_guidance',
  URGENT_CARE_ADVICE = 'urgent_care_advice',
  EMERGENCY_ADVICE = 'emergency_advice',
  SAFETY_WARNING = 'safety_warning',
  ERROR = 'error'
}

export enum UrgencyLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  EMERGENCY = 'emergency'
}

export enum Severity {
  MILD = 'mild',
  MODERATE = 'moderate',
  SEVERE = 'severe',
  LIFE_THREATENING = 'life-threatening'
}

// Interfaces para integración con sistemas externos
export interface FHIRResource {
  resourceType: string;
  id?: string;
  meta?: {
    versionId?: string;
    lastUpdated?: string;
    profile?: string[];
  };
  [key: string]: any;
}

export interface HL7Message {
  messageType: string;
  segments: HL7Segment[];
  timestamp: Date;
}

export interface HL7Segment {
  type: string;
  fields: string[];
}