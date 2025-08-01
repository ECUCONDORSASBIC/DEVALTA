import { z } from 'zod';
import { 
  AltamedicaPatientSchema, 
  EmergencyContactSchema, 
  InsuranceInfoSchema,
  AltamedicaPatient,
  EmergencyContact,
  InsuranceInfo 
} from './types';

// Medical data validators
export class MedicalDataValidator {
  
  /**
   * Validate patient data according to FHIR R4 and medical standards
   */
  static validatePatient(patientData: any): { isValid: boolean; errors: string[]; data?: AltamedicaPatient } {
    try {
      const validatedData = AltamedicaPatientSchema.parse(patientData);
      return { isValid: true, errors: [], data: validatedData };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { 
          isValid: false, 
          errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
        };
      }
      return { isValid: false, errors: ['Unknown validation error'] };
    }
  }

  /**
   * Validate emergency contact information
   */
  static validateEmergencyContact(contact: any): { isValid: boolean; errors: string[]; data?: EmergencyContact } {
    try {
      const validatedData = EmergencyContactSchema.parse(contact);
      return { isValid: true, errors: [], data: validatedData };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { 
          isValid: false, 
          errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
        };
      }
      return { isValid: false, errors: ['Unknown validation error'] };
    }
  }

  /**
   * Validate insurance information
   */
  static validateInsuranceInfo(insurance: any): { isValid: boolean; errors: string[]; data?: InsuranceInfo } {
    try {
      const validatedData = InsuranceInfoSchema.parse(insurance);
      return { isValid: true, errors: [], data: validatedData };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { 
          isValid: false, 
          errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
        };
      }
      return { isValid: false, errors: ['Unknown validation error'] };
    }
  }

  /**
   * Validate medical identifiers (SSN, Medicare, etc.)
   */
  static validateMedicalIdentifier(identifier: string, type: 'ssn' | 'medicare' | 'medicaid' | 'license'): boolean {
    const patterns = {
      ssn: /^\d{3}-?\d{2}-?\d{4}$/,
      medicare: /^[1-9]\d{10}$/,
      medicaid: /^[A-Z]{2}\d{10}$/,
      license: /^[A-Z]{2}\d{6}$/
    };

    return patterns[type].test(identifier);
  }

  /**
   * Validate phone numbers for medical communications
   */
  static validatePhoneNumber(phone: string): boolean {
    const phonePattern = /^\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/;
    return phonePattern.test(phone);
  }

  /**
   * Validate email for medical communications
   */
  static validateEmail(email: string): boolean {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }

  /**
   * Validate date of birth (must be reasonable for medical purposes)
   */
  static validateDateOfBirth(birthDate: string): boolean {
    const date = new Date(birthDate);
    const now = new Date();
    const age = now.getFullYear() - date.getFullYear();
    
    // Must be between 0 and 150 years old
    return age >= 0 && age <= 150 && !isNaN(date.getTime());
  }

  /**
   * Validate medical codes (ICD-10, CPT, etc.)
   */
  static validateMedicalCode(code: string, type: 'icd10' | 'cpt' | 'snomed'): boolean {
    const patterns = {
      icd10: /^[A-Z]\d{2}\.?\d{0,2}$/,
      cpt: /^\d{5}$/,
      snomed: /^\d{6,18}$/
    };

    return patterns[type].test(code);
  }

  /**
   * Validate blood type
   */
  static validateBloodType(bloodType: string): boolean {
    const validTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    return validTypes.includes(bloodType);
  }

  /**
   * Validate vital signs ranges
   */
  static validateVitalSigns(vitals: {
    systolic?: number;
    diastolic?: number;
    heartRate?: number;
    temperature?: number;
    respiratoryRate?: number;
    oxygenSaturation?: number;
  }): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (vitals.systolic !== undefined) {
      if (vitals.systolic < 70 || vitals.systolic > 200) {
        errors.push('Systolic blood pressure out of normal range (70-200 mmHg)');
      }
    }

    if (vitals.diastolic !== undefined) {
      if (vitals.diastolic < 40 || vitals.diastolic > 130) {
        errors.push('Diastolic blood pressure out of normal range (40-130 mmHg)');
      }
    }

    if (vitals.heartRate !== undefined) {
      if (vitals.heartRate < 40 || vitals.heartRate > 200) {
        errors.push('Heart rate out of normal range (40-200 bpm)');
      }
    }

    if (vitals.temperature !== undefined) {
      if (vitals.temperature < 35 || vitals.temperature > 42) {
        errors.push('Temperature out of normal range (35-42°C)');
      }
    }

    if (vitals.respiratoryRate !== undefined) {
      if (vitals.respiratoryRate < 8 || vitals.respiratoryRate > 40) {
        errors.push('Respiratory rate out of normal range (8-40 breaths/min)');
      }
    }

    if (vitals.oxygenSaturation !== undefined) {
      if (vitals.oxygenSaturation < 70 || vitals.oxygenSaturation > 100) {
        errors.push('Oxygen saturation out of normal range (70-100%)');
      }
    }

    return { isValid: errors.length === 0, errors };
  }

  /**
   * Validate medication dosage
   */
  static validateMedicationDosage(dosage: {
    value: number;
    unit: string;
    frequency: string;
  }): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (dosage.value <= 0) {
      errors.push('Dosage value must be positive');
    }

    const validUnits = ['mg', 'mcg', 'g', 'ml', 'units', 'puffs', 'tablets', 'capsules'];
    if (!validUnits.includes(dosage.unit.toLowerCase())) {
      errors.push(`Invalid dosage unit. Must be one of: ${validUnits.join(', ')}`);
    }

    const frequencyPattern = /^(\d+)\s*(times?|x)\s*(day|week|month|hour)s?$/i;
    if (!frequencyPattern.test(dosage.frequency)) {
      errors.push('Invalid frequency format. Use format like "2 times daily" or "1x week"');
    }

    return { isValid: errors.length === 0, errors };
  }

  /**
   * Validate allergy information
   */
  static validateAllergy(allergy: {
    substance: string;
    severity: 'mild' | 'moderate' | 'severe';
    reaction: string;
    onsetDate?: string;
  }): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!allergy.substance || allergy.substance.trim().length === 0) {
      errors.push('Allergy substance is required');
    }

    if (!['mild', 'moderate', 'severe'].includes(allergy.severity)) {
      errors.push('Allergy severity must be mild, moderate, or severe');
    }

    if (!allergy.reaction || allergy.reaction.trim().length === 0) {
      errors.push('Allergy reaction description is required');
    }

    if (allergy.onsetDate) {
      const date = new Date(allergy.onsetDate);
      if (isNaN(date.getTime())) {
        errors.push('Invalid allergy onset date');
      }
    }

    return { isValid: errors.length === 0, errors };
  }
}

// HIPAA compliance validators
export class HIPAAValidator {
  
  /**
   * Check if data contains PHI (Protected Health Information)
   */
  static containsPHI(data: any): boolean {
    const phiFields = [
      'name', 'address', 'phone', 'email', 'ssn', 'dateOfBirth',
      'medicalRecordNumber', 'healthPlanNumber', 'accountNumber',
      'licenseNumber', 'vehicleIdentifier', 'deviceIdentifier',
      'ipAddress', 'biometricIdentifier', 'fullFacePhoto'
    ];

    const checkObject = (obj: any): boolean => {
      for (const key in obj) {
        if (phiFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
          return true;
        }
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          if (checkObject(obj[key])) return true;
        }
      }
      return false;
    };

    return checkObject(data);
  }

  /**
   * Validate HIPAA compliance for data transmission
   */
  static validateTransmission(data: any, transmissionType: 'encrypted' | 'unencrypted'): { compliant: boolean; warnings: string[] } {
    const warnings: string[] = [];

    if (this.containsPHI(data) && transmissionType === 'unencrypted') {
      warnings.push('PHI detected in unencrypted transmission - HIPAA violation risk');
    }

    return { 
      compliant: warnings.length === 0, 
      warnings 
    };
  }

  /**
   * Validate audit trail requirements
   */
  static validateAuditTrail(auditEntry: {
    timestamp: string;
    userId: string;
    action: string;
    resourceType: string;
    resourceId: string;
    ipAddress?: string;
    userAgent?: string;
  }): { compliant: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!auditEntry.timestamp) {
      errors.push('Audit timestamp is required');
    }

    if (!auditEntry.userId) {
      errors.push('Audit user ID is required');
    }

    if (!auditEntry.action) {
      errors.push('Audit action is required');
    }

    if (!auditEntry.resourceType) {
      errors.push('Audit resource type is required');
    }

    if (!auditEntry.resourceId) {
      errors.push('Audit resource ID is required');
    }

    return { compliant: errors.length === 0, errors };
  }
} 