/**
 * 💊 PRESCRIPTIONS VALIDATION SCHEMAS
 * Esquemas de validación con Zod para prescripciones médicas con cumplimiento FDA/DEA
 */

import { z } from 'zod';
import {
    DrugSchedule,
    InteractionSeverity,
    PrescriptionStatus,
    PrescriptionType,
    PrescriptionUrgency,
    RouteOfAdministration
} from './types';

// Esquemas base para validación médica
export const DrugInformationSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1).max(200),
  genericName: z.string().min(1).max(200).optional(),
  ndcNumber: z.string().regex(/^\d{4,5}-\d{3,4}-\d{1,2}$/).optional(), // NDC format
  strength: z.string().min(1).max(50),
  dosageForm: z.string().min(1).max(100),
  route: z.nativeEnum(RouteOfAdministration).optional(),
  schedule: z.nativeEnum(DrugSchedule).optional()
});

export const DosageSchema = z.object({
  strength: z.string().min(1).max(50),
  frequency: z.string().min(1).max(100),
  route: z.nativeEnum(RouteOfAdministration),
  quantity: z.number().min(1).max(1000),
  quantityUnit: z.string().min(1).max(20),
  daysSupply: z.number().min(1).max(365),
  refillsAuthorized: z.number().min(0).max(5), // DEA limit for most controlled substances
  instructions: z.string().min(1).max(500),
  takeWith: z.string().max(100).optional(),
  specialInstructions: z.array(z.string().max(200)).max(5).optional()
});

export const ElectronicSignatureSchema = z.object({
  method: z.enum(['password', 'biometric', 'token', 'certificate']),
  credentials: z.string().min(1),
  timestamp: z.coerce.date().optional()
});

export const PharmacyInformationSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(200),
  address: z.object({
    street: z.string().min(1).max(200),
    city: z.string().min(1).max(100),
    state: z.string().length(2), // US state code
    zipCode: z.string().regex(/^\d{5}(-\d{4})?$/), // US ZIP format
    country: z.string().default('US')
  }),
  phone: z.string().regex(/^\+?1?[2-9]\d{2}[2-9]\d{2}\d{4}$/), // US phone format
  ncpdpId: z.string().length(7), // NCPDP ID is always 7 digits
  npiNumber: z.string().length(10).regex(/^\d+$/), // NPI is 10 digits
  acceptsEPrescriptions: z.boolean().default(true)
});

// Schema principal para crear prescripción
export const CreatePrescriptionSchema = z.object({
  patientId: z.string().min(1, 'ID del paciente requerido'),
  prescriberId: z.string().min(1, 'ID del prescriptor requerido'),
  type: z.nativeEnum(PrescriptionType).default(PrescriptionType.NEW),
  urgency: z.nativeEnum(PrescriptionUrgency).default(PrescriptionUrgency.ROUTINE),
  
  drug: DrugInformationSchema,
  dosage: DosageSchema,
  
  indication: z.string().min(1).max(500),
  diagnosis: z.array(z.string().regex(/^[A-Z]\d{2}\.\d+$/)).min(1), // ICD-10 format
  medicalRecordId: z.string().optional(),
  
  pharmacyId: z.string().optional(),
  pharmacyInstructions: z.string().max(1000).optional(),
  
  priorAuthorizationRequired: z.boolean().default(false),
  
  metadata: z.object({
    notes: z.string().max(2000).optional(),
    tags: z.array(z.string().max(50)).max(10).optional()
  }).optional()
});

// Schema para generar prescripción con validaciones avanzadas
export const GeneratePrescriptionSchema = CreatePrescriptionSchema.extend({
  checkInteractions: z.boolean().default(true),
  checkAllergies: z.boolean().default(true),
  validateDosage: z.boolean().default(true),
  electronicSignature: ElectronicSignatureSchema.optional()
});

// Schema para actualizar prescripción
export const UpdatePrescriptionSchema = z.object({
  prescriptionId: z.string().min(1),
  updates: z.object({
    dosage: DosageSchema.partial().optional(),
    pharmacyId: z.string().optional(),
    pharmacyInstructions: z.string().max(1000).optional(),
    status: z.nativeEnum(PrescriptionStatus).optional(),
    notes: z.string().max(2000).optional()
  }),
  updateReason: z.string().min(1).max(500),
  electronicSignature: ElectronicSignatureSchema.optional()
});

// Schema para consultas de prescripciones
export const PrescriptionQuerySchema = z.object({
  patientId: z.string().optional(),
  prescriberId: z.string().optional(),
  status: z.array(z.nativeEnum(PrescriptionStatus)).optional(),
  type: z.array(z.nativeEnum(PrescriptionType)).optional(),
  urgency: z.array(z.nativeEnum(PrescriptionUrgency)).optional(),
  drugName: z.string().max(200).optional(),
  dateRange: z.object({
    start: z.coerce.date(),
    end: z.coerce.date()
  }).optional(),
  pharmacyId: z.string().optional(),
  expiringWithinDays: z.coerce.number().min(1).max(365).optional(),
  needsRefill: z.boolean().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
  sortBy: z.enum(['date', 'patient', 'drug', 'status', 'expiration']).default('date'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// Schema para interacciones de medicamentos
export const DrugInteractionSchema = z.object({
  drugA: z.string().min(1),
  drugB: z.string().min(1),
  severity: z.nativeEnum(InteractionSeverity),
  mechanism: z.string().min(1).max(500),
  clinicalEffect: z.string().min(1).max(500),
  management: z.string().min(1).max(1000),
  evidence: z.enum(['theoretical', 'case_report', 'study', 'established']),
  documentation: z.enum(['excellent', 'good', 'fair', 'poor'])
});

// Funciones de validación
export function validateCreatePrescription(data: any) {
  try {
    const validatedData = CreatePrescriptionSchema.parse(data);
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

export function validateGeneratePrescription(data: any) {
  try {
    const validatedData = GeneratePrescriptionSchema.parse(data);
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

export function validateUpdatePrescription(data: any) {
  try {
    const validatedData = UpdatePrescriptionSchema.parse(data);
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

export function validatePrescriptionQuery(data: any) {
  try {
    const validatedData = PrescriptionQuerySchema.parse(data);
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

// Validaciones específicas de negocio médico
export function validateDEANumber(deaNumber: string): boolean {
  // DEA number format: 2 letters + 7 digits
  const deaRegex = /^[A-Z]{2}\d{7}$/;
  if (!deaRegex.test(deaNumber)) {
    return false;
  }

  // DEA checksum validation
  const digits = deaNumber.substring(2);
  const checksum = (
    parseInt(digits[0]) + parseInt(digits[2]) + parseInt(digits[4]) + parseInt(digits[6])
  ) + 2 * (
    parseInt(digits[1]) + parseInt(digits[3]) + parseInt(digits[5])
  );
  
  return checksum % 10 === parseInt(digits[6]);
}

export function validateNPINumber(npiNumber: string): boolean {
  // NPI is 10 digits with Luhn algorithm validation
  if (!/^\d{10}$/.test(npiNumber)) {
    return false;
  }

  // Luhn algorithm
  let sum = 0;
  let alternate = false;
  
  for (let i = npiNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(npiNumber[i]);
    
    if (alternate) {
      digit *= 2;
      if (digit > 9) {
        digit = Math.floor(digit / 10) + (digit % 10);
      }
    }
    
    sum += digit;
    alternate = !alternate;
  }
  
  return sum % 10 === 0;
}

export function validateControlledSubstanceRefills(schedule: DrugSchedule, refills: number): { isValid: boolean; maxAllowed: number; reason?: string } {
  
  switch (schedule) {
    case DrugSchedule.SCHEDULE_I:
      return {
        isValid: false,
        maxAllowed: 0,
        reason: 'Schedule I substances cannot be prescribed'
      };
      
    case DrugSchedule.SCHEDULE_II:
      return {
        isValid: refills === 0,
        maxAllowed: 0,
        reason: 'Schedule II substances cannot have refills'
      };
      
    case DrugSchedule.SCHEDULE_III:
    case DrugSchedule.SCHEDULE_IV:
      return {
        isValid: refills <= 5,
        maxAllowed: 5,
        reason: refills > 5 ? 'Schedule III/IV substances limited to 5 refills' : undefined
      };
      
    case DrugSchedule.SCHEDULE_V:
    case DrugSchedule.NON_CONTROLLED:
      return {
        isValid: refills <= 5, // Institutional limit
        maxAllowed: 5,
        reason: refills > 5 ? 'Institutional limit of 5 refills' : undefined
      };
      
    default:
      return {
        isValid: false,
        maxAllowed: 0,
        reason: 'Unknown drug schedule'
      };
  }
}

export function validateDosageRange(drugName: string, strength: string, frequency: string, route: RouteOfAdministration): {
  isValid: boolean;
  warnings: string[];
  recommendations?: string;
} {
  const warnings: string[] = [];
  
  // Basic dosage validation rules (expandible with drug database)
  const commonDrugs: Record<string, any> = {
    'acetaminophen': {
      maxDailyDose: 4000, // mg
      unit: 'mg',
      warnings: ['Do not exceed 4000mg in 24 hours', 'Monitor liver function']
    },
    'ibuprofen': {
      maxDailyDose: 3200, // mg
      unit: 'mg',
      warnings: ['Take with food', 'Monitor kidney function', 'Avoid in heart disease']
    },
    'amoxicillin': {
      maxDailyDose: 3000, // mg
      unit: 'mg',
      warnings: ['Complete full course', 'Check for penicillin allergy']
    }
  };

  const drugKey = drugName.toLowerCase();
  const drugInfo = commonDrugs[drugKey];
  
  if (drugInfo) {
    // Extract numeric dose from strength (e.g., "500mg" -> 500)
    const doseMatch = strength.match(/(\d+(?:\.\d+)?)/);
    if (doseMatch) {
      const dose = parseFloat(doseMatch[1]);
      
      // Extract frequency multiplier (e.g., "twice daily" -> 2)
      const frequencyMultipliers: Record<string, number> = {
        'once': 1, 'daily': 1,
        'twice': 2, 'bid': 2,
        'three times': 3, 'tid': 3,
        'four times': 4, 'qid': 4,
        'every 4 hours': 6,
        'every 6 hours': 4,
        'every 8 hours': 3,
        'every 12 hours': 2
      };
      
      let dailyMultiplier = 1;
      for (const [key, multiplier] of Object.entries(frequencyMultipliers)) {
        if (frequency.toLowerCase().includes(key)) {
          dailyMultiplier = multiplier;
          break;
        }
      }
      
      const dailyDose = dose * dailyMultiplier;
      
      if (dailyDose > drugInfo.maxDailyDose) {
        warnings.push(`Daily dose (${dailyDose}${drugInfo.unit}) exceeds maximum recommended (${drugInfo.maxDailyDose}${drugInfo.unit})`);
      }
      
      warnings.push(...drugInfo.warnings);
    }
  }
  
  // Route-specific warnings
  if (route === RouteOfAdministration.INTRAVENOUS) {
    warnings.push('IV administration requires hospital setting');
  }
  
  return {
    isValid: warnings.length === 0,
    warnings,
    recommendations: drugInfo ? `Standard dose range available in drug database` : 'Verify dosage with drug reference'
  };
}

export function validatePrescriberCredentials(deaNumber: string, npiNumber: string, licenseNumber: string, drugSchedule: DrugSchedule): {
  isValid: boolean;
  errors: string[];
  canPrescribeControlled: boolean;
} {
  const errors: string[] = [];
  
  // Validate DEA number
  if (!validateDEANumber(deaNumber)) {
    errors.push('Invalid DEA number format or checksum');
  }
  
  // Validate NPI number
  if (!validateNPINumber(npiNumber)) {
    errors.push('Invalid NPI number format or checksum');
  }
  
  // License number basic validation (format varies by state)
  if (!licenseNumber || licenseNumber.length < 3) {
    errors.push('Invalid medical license number');
  }
  
  // Check if can prescribe controlled substances
  const canPrescribeControlled = drugSchedule === DrugSchedule.NON_CONTROLLED || 
                                 (validateDEANumber(deaNumber) && 
                                  drugSchedule !== DrugSchedule.SCHEDULE_I);
  
  if (!canPrescribeControlled && drugSchedule as any !== DrugSchedule.NON_CONTROLLED) {
    errors.push(`Cannot prescribe ${drugSchedule} substances with current credentials`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    canPrescribeControlled
  };
}

// Validación de permisos para prescripciones
export function validatePrescriptionPermissions(userRole: string, operation: 'create' | 'read' | 'update' | 'delete' | 'sign', prescriptionType: PrescriptionType, drugSchedule: DrugSchedule, userPermissions: string[]): { allowed: boolean; reason?: string } {
  
  // Solo médicos pueden prescribir
  if (operation === 'create' || operation === 'sign') {
    if (!['doctor', 'physician', 'nurse_practitioner', 'physician_assistant'].includes(userRole)) {
      return { 
        allowed: false, 
        reason: 'Solo profesionales médicos autorizados pueden prescribir medicamentos' 
      };
    }
  }
  
  // Verificar permisos específicos
  const requiredPermission = `prescriptions:${operation}`;
  if (!userPermissions.includes(requiredPermission) && 
      !userPermissions.includes('prescriptions:all')) {
    return { 
      allowed: false, 
      reason: `Permiso requerido: ${requiredPermission}` 
    };
  }
  
  // Validaciones adicionales para sustancias controladas
  if (drugSchedule as any !== DrugSchedule.NON_CONTROLLED) {
    const controlledPermission = 'prescriptions:controlled_substances';
    if (!userPermissions.includes(controlledPermission)) {
      return {
        allowed: false,
        reason: 'Permiso especial requerido para prescribir sustancias controladas'
      };
    }
  }
  
  return { allowed: true };
}
