/**
 * 📋 MEDICAL RECORDS VALIDATION SCHEMAS
 * Esquemas de validación con Zod para historiales médicos
 */

import { z } from 'zod';
import {
    AccessLevel,
    RecordStatus,
    RecordType,
    SeverityLevel
} from './types';

// Esquemas base
export const VitalSignsSchema = z.object({
  temperature: z.number().min(30).max(45).optional(),
  bloodPressure: z.object({
    systolic: z.number().min(60).max(300),
    diastolic: z.number().min(30).max(200)
  }).optional(),
  heartRate: z.number().min(30).max(250).optional(),
  respiratoryRate: z.number().min(5).max(60).optional(),
  oxygenSaturation: z.number().min(70).max(100).optional(),
  weight: z.number().min(0.5).max(500).optional(),
  height: z.number().min(30).max(250).optional(),
  bmi: z.number().min(10).max(80).optional(),
  recordedAt: z.coerce.date(),
  recordedBy: z.string().min(1)
});

export const SymptomSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(1000),
  severity: z.nativeEnum(SeverityLevel),
  duration: z.string().min(1).max(100),
  onset: z.enum(['sudden', 'gradual']),
  triggers: z.array(z.string()).optional(),
  relievingFactors: z.array(z.string()).optional(),
  associatedSymptoms: z.array(z.string()).optional()
});

export const DiagnosisSchema = z.object({
  id: z.string().min(1),
  code: z.string().min(1).max(20), // ICD-10
  name: z.string().min(1).max(300),
  description: z.string().min(1).max(1000),
  type: z.enum(['primary', 'secondary', 'differential']),
  certainty: z.enum(['confirmed', 'probable', 'suspected']),
  severity: z.nativeEnum(SeverityLevel),
  onsetDate: z.coerce.date().optional(),
  notes: z.string().max(2000).optional()
});

export const TreatmentSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['medication', 'procedure', 'therapy', 'surgery', 'lifestyle']),
  name: z.string().min(1).max(300),
  description: z.string().min(1).max(1000),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  status: z.enum(['planned', 'ongoing', 'completed', 'discontinued']),
  provider: z.string().min(1),
  notes: z.string().max(2000).optional()
});

export const AllergySchema = z.object({
  id: z.string().min(1),
  allergen: z.string().min(1).max(200),
  type: z.enum(['drug', 'food', 'environmental', 'other']),
  reaction: z.string().min(1).max(500),
  severity: z.nativeEnum(SeverityLevel),
  onsetDate: z.coerce.date().optional(),
  notes: z.string().max(1000).optional()
});

export const MedicationSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(300),
  genericName: z.string().max(300).optional(),
  dosage: z.string().min(1).max(100),
  frequency: z.string().min(1).max(100),
  route: z.enum(['oral', 'iv', 'im', 'topical', 'inhalation', 'other']),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  prescribedBy: z.string().min(1),
  status: z.enum(['active', 'discontinued', 'completed']),
  notes: z.string().max(1000).optional()
});

// Esquema principal para crear historial médico
export const CreateMedicalRecordSchema = z.object({
  patientId: z.string().min(1, 'ID del paciente requerido'),
  type: z.nativeEnum(RecordType),
  accessLevel: z.nativeEnum(AccessLevel).default(AccessLevel.RESTRICTED),
  
  metadata: z.object({
    title: z.string().min(1).max(300),
    description: z.string().max(1000).optional(),
    tags: z.array(z.string().max(50)).max(10).optional()
  }),

  encounter: z.object({
    date: z.coerce.date(),
    type: z.enum(['inpatient', 'outpatient', 'emergency', 'telemedicine']),
    location: z.string().min(1).max(200),
    provider: z.object({
      id: z.string().min(1),
      name: z.string().min(1).max(200),
      specialty: z.string().min(1).max(100),
      license: z.string().min(1).max(50)
    }),
    duration: z.number().min(1).max(1440).optional() // max 24 hours
  }),

  clinical: z.object({
    chiefComplaint: z.string().max(500).optional(),
    historyOfPresentIllness: z.string().max(2000).optional(),
    vitalSigns: z.array(VitalSignsSchema).optional(),
    symptoms: z.array(SymptomSchema).optional(),
    physicalExamination: z.object({
      general: z.string().max(1000).optional(),
      systems: z.record(z.string().max(1000)).optional()
    }).optional(),
    diagnostics: z.object({
      labResults: z.array(z.any()).optional(),
      imagingStudies: z.array(z.any()).optional(),
      otherTests: z.array(z.any()).optional()
    }).optional(),
    diagnoses: z.array(DiagnosisSchema).optional(),
    treatments: z.array(TreatmentSchema).optional(),
    medications: z.array(MedicationSchema).optional(),
    allergies: z.array(AllergySchema).optional()
  }).optional(),

  plan: z.object({
    immediate: z.array(z.string().max(500)).optional(),
    shortTerm: z.array(z.string().max(500)).optional(),
    longTerm: z.array(z.string().max(500)).optional(),
    followUp: z.object({
      date: z.coerce.date().optional(),
      provider: z.string().max(200).optional(),
      reason: z.string().max(500).optional()
    }).optional(),
    referrals: z.array(z.object({
      specialty: z.string().min(1).max(100),
      provider: z.string().max(200).optional(),
      reason: z.string().min(1).max(500),
      urgency: z.enum(['routine', 'urgent', 'stat'])
    })).optional()
  }).optional()
});

// Esquema para actualizar historial médico
export const UpdateMedicalRecordSchema = z.object({
  recordId: z.string().min(1),
  updates: z.object({
    metadata: z.object({
      title: z.string().min(1).max(300).optional(),
      description: z.string().max(1000).optional(),
      tags: z.array(z.string().max(50)).max(10).optional()
    }).optional(),
    clinical: z.object({
      chiefComplaint: z.string().max(500).optional(),
      historyOfPresentIllness: z.string().max(2000).optional(),
      vitalSigns: z.array(VitalSignsSchema).optional(),
      symptoms: z.array(SymptomSchema).optional(),
      physicalExamination: z.object({
        general: z.string().max(1000).optional(),
        systems: z.record(z.string().max(1000)).optional()
      }).optional(),
      diagnoses: z.array(DiagnosisSchema).optional(),
      treatments: z.array(TreatmentSchema).optional(),
      medications: z.array(MedicationSchema).optional(),
      allergies: z.array(AllergySchema).optional()
    }).optional(),
    plan: z.object({
      immediate: z.array(z.string().max(500)).optional(),
      shortTerm: z.array(z.string().max(500)).optional(),
      longTerm: z.array(z.string().max(500)).optional(),
      followUp: z.object({
        date: z.coerce.date().optional(),
        provider: z.string().max(200).optional(),
        reason: z.string().max(500).optional()
      }).optional(),
      referrals: z.array(z.object({
        specialty: z.string().min(1).max(100),
        provider: z.string().max(200).optional(),
        reason: z.string().min(1).max(500),
        urgency: z.enum(['routine', 'urgent', 'stat'])
      })).optional()
    }).optional(),
    status: z.nativeEnum(RecordStatus).optional(),
    accessLevel: z.nativeEnum(AccessLevel).optional()
  }),
  updateReason: z.string().max(500).optional()
});

// Esquema para consultas/filtros
export const MedicalRecordQuerySchema = z.object({
  patientId: z.string().optional(),
  type: z.array(z.nativeEnum(RecordType)).optional(),
  status: z.array(z.nativeEnum(RecordStatus)).optional(),
  dateRange: z.object({
    start: z.coerce.date(),
    end: z.coerce.date()
  }).optional(),
  provider: z.string().optional(),
  diagnosis: z.string().optional(),
  tags: z.array(z.string()).optional(),
  accessLevel: z.array(z.nativeEnum(AccessLevel)).optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
  sortBy: z.enum(['date', 'type', 'provider', 'severity']).default('date'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// Funciones de validación
export function validateCreateMedicalRecord(data: any) {
  try {
    const validatedData = CreateMedicalRecordSchema.parse(data);
    return {
      success: true,
      data: validatedData,
      errors: []
    };
  } catch (error: any) {
    return {
      success: false,
      data: null,
      errors: error.errors || [error.message]
    };
  }
}

export function validateUpdateMedicalRecord(data: any) {
  try {
    const validatedData = UpdateMedicalRecordSchema.parse(data);
    return {
      success: true,
      data: validatedData,
      errors: []
    };
  } catch (error: any) {
    return {
      success: false,
      data: null,
      errors: error.errors || [error.message]
    };
  }
}

export function validateMedicalRecordQuery(data: any) {
  try {
    const validatedData = MedicalRecordQuerySchema.parse(data);
    return {
      success: true,
      data: validatedData,
      errors: []
    };
  } catch (error: any) {
    return {
      success: false,
      data: null,
      errors: error.errors || [error.message]
    };
  }
}

// Validaciones específicas de negocio
export function validateMedicalRecordCompleteness(record: any): {
  completeness: number;
  missingFields: string[];
  qualityScore: number;
} {
  const requiredFields = [
    'patientId',
    'type',
    'metadata.title',
    'encounter.date',
    'encounter.provider.id',
    'encounter.provider.name'
  ];

  const recommendedFields = [
    'clinical.chiefComplaint',
    'clinical.historyOfPresentIllness',
    'clinical.vitalSigns',
    'clinical.diagnoses',
    'plan.immediate'
  ];

  let presentRequired = 0;
  let presentRecommended = 0;
  const missingFields: string[] = [];

  // Verificar campos requeridos
  requiredFields.forEach((field: any) => {
    const value = getNestedValue(record, field);
    if (value !== undefined && value !== null && value !== '') {
      presentRequired++;
    } else {
      missingFields.push(field);
    }
  });

  // Verificar campos recomendados
  recommendedFields.forEach((field: any) => {
    const value = getNestedValue(record, field);
    if (value !== undefined && value !== null && value !== '') {
      presentRecommended++;
    }
  });

  const requiredCompleteness = (presentRequired / requiredFields.length) * 100;
  const recommendedCompleteness = (presentRecommended / recommendedFields.length) * 100;
  
  const completeness = (requiredCompleteness * 0.7) + (recommendedCompleteness * 0.3);
  const qualityScore = Math.min(completeness + (presentRecommended * 2), 100);

  return {
    completeness: Math.round(completeness),
    missingFields,
    qualityScore: Math.round(qualityScore)
  };
}

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
}

// Validación de permisos
export function validateMedicalRecordPermissions(userRole: string, operation: 'create' | 'read' | 'update' | 'delete', recordAccessLevel: AccessLevel, userPermissions: string[]): { allowed: boolean; reason?: string } {
  
  // Superusuarios siempre tienen acceso
  if (userRole === 'super_admin' || userPermissions.includes('medical_records:all')) {
    return { allowed: true };
  }

  // Verificar permisos específicos por operación
  const requiredPermission = `medical_records:${operation}`;
  if (!userPermissions.includes(requiredPermission)) {
    return { 
      allowed: false, 
      reason: `Permiso requerido: ${requiredPermission}` 
    };
  }

  // Verificar nivel de acceso
  const accessLevelPermissions = {
    [AccessLevel.PUBLIC]: ['patient', 'nurse', 'doctor', 'admin'],
    [AccessLevel.RESTRICTED]: ['nurse', 'doctor', 'admin'],
    [AccessLevel.CONFIDENTIAL]: ['doctor', 'admin'],
    [AccessLevel.TOP_SECRET]: ['admin']
  };

  const allowedRoles = accessLevelPermissions[recordAccessLevel];
  if (!allowedRoles.includes(userRole)) {
    return {
      allowed: false,
      reason: `Nivel de acceso insuficiente para: ${recordAccessLevel}`
    };
  }

  return { allowed: true };
}
