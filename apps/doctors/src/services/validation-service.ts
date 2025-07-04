/**
 * Servicio de Validación para Datos Médicos
 * Estándares: CI-11, SNOMED CT, HL7 FHIR
 */

import { 
  Patient, 
  MedicalHistoryEntry, 
  Allergy, 
  ChronicCondition, 
  Medication, 
  VitalSigns 
} from '../types/medical-entities';
import { Appointment, User } from '../types/appointments-users';

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  severity: 'ERROR' | 'WARNING' | 'INFO';
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

export class ValidationService {
  
  // Expresiones regulares para validación
  private readonly emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private readonly phoneRegex = /^(\+?1-?)?(\([0-9]{3}\)|[0-9]{3})[-.]?[0-9]{3}[-.]?[0-9]{4}$/;
  private readonly nationalIdRegex = /^[0-9]{8,12}$/;
  private readonly postalCodeRegex = /^[0-9]{5}(-[0-9]{4})?$/;
  private readonly icd11Regex = /^[A-Z][0-9][A-Z0-9](\.[0-9A-Z]+)*$/;
  private readonly snomedRegex = /^[0-9]{6,18}$/;
  private readonly loincRegex = /^[0-9]+-[0-9]+$/;
  private readonly cptRegex = /^[0-9]{5}$/;
  private readonly atcRegex = /^[A-N][0-9]{2}[A-Z]{2}[0-9]{2}$/;

  // Rangos normales para signos vitales por edad
  private readonly vitalSignsRanges = {
    bloodPressure: {
      adult: { systolic: { min: 90, max: 140 }, diastolic: { min: 60, max: 90 } },
      elderly: { systolic: { min: 100, max: 150 }, diastolic: { min: 60, max: 90 } },
      child: { systolic: { min: 80, max: 120 }, diastolic: { min: 50, max: 80 } }
    },
    heartRate: {
      adult: { min: 60, max: 100 },
      elderly: { min: 60, max: 100 },
      child: { min: 70, max: 130 }
    },
    temperature: {
      normal: { min: 36.1, max: 37.2 },
      fever: { min: 37.3, max: 42.0 },
      hypothermia: { min: 32.0, max: 36.0 }
    },
    respiratoryRate: {
      adult: { min: 12, max: 20 },
      elderly: { min: 12, max: 25 },
      child: { min: 15, max: 30 }
    },
    oxygenSaturation: {
      normal: { min: 95, max: 100 },
      low: { min: 90, max: 94 },
      critical: { min: 0, max: 89 }
    }
  };

  /**
   * Validar datos completos de paciente
   */
  validatePatientData(patient: Partial<Patient>): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Validar información personal
    if (patient.personalInfo) {
      const personalValidation = this.validatePersonalInfo(patient.personalInfo);
      errors.push(...personalValidation.errors);
      warnings.push(...personalValidation.warnings);
    }

    // Validar información médica
    if (patient.medicalInfo) {
      const medicalValidation = this.validateMedicalInfo(patient.medicalInfo);
      errors.push(...medicalValidation.errors);
      warnings.push(...medicalValidation.warnings);
    }

    // Validar configuración de privacidad
    if (patient.privacySettings) {
      const privacyValidation = this.validatePrivacySettings(patient.privacySettings);
      errors.push(...privacyValidation.errors);
      warnings.push(...privacyValidation.warnings);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validar información personal
   */
  validatePersonalInfo(personalInfo: any): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Nombre requerido
    if (!personalInfo.firstName || personalInfo.firstName.trim().length < 2) {
      errors.push({
        field: 'personalInfo.firstName',
        message: 'El nombre debe tener al menos 2 caracteres',
        code: 'INVALID_FIRST_NAME',
        severity: 'ERROR'
      });
    }

    // Apellido requerido
    if (!personalInfo.lastName || personalInfo.lastName.trim().length < 2) {
      errors.push({
        field: 'personalInfo.lastName',
        message: 'El apellido debe tener al menos 2 caracteres',
        code: 'INVALID_LAST_NAME',
        severity: 'ERROR'
      });
    }

    // Fecha de nacimiento
    if (!personalInfo.dateOfBirth) {
      errors.push({
        field: 'personalInfo.dateOfBirth',
        message: 'La fecha de nacimiento es requerida',
        code: 'MISSING_DATE_OF_BIRTH',
        severity: 'ERROR'
      });
    } else {
      const birthDate = new Date(personalInfo.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();

      if (birthDate > today) {
        errors.push({
          field: 'personalInfo.dateOfBirth',
          message: 'La fecha de nacimiento no puede ser futura',
          code: 'FUTURE_DATE_OF_BIRTH',
          severity: 'ERROR'
        });
      }

      if (age > 150) {
        warnings.push({
          field: 'personalInfo.dateOfBirth',
          message: 'La edad parece inusualmente alta, verifique la fecha',
          code: 'UNUSUAL_AGE',
          severity: 'WARNING'
        });
      }
    }

    // Identificación nacional
    if (!personalInfo.nationalId) {
      errors.push({
        field: 'personalInfo.nationalId',
        message: 'La identificación nacional es requerida',
        code: 'MISSING_NATIONAL_ID',
        severity: 'ERROR'
      });
    } else if (!this.nationalIdRegex.test(personalInfo.nationalId)) {
      errors.push({
        field: 'personalInfo.nationalId',
        message: 'Formato de identificación nacional inválido',
        code: 'INVALID_NATIONAL_ID_FORMAT',
        severity: 'ERROR'
      });
    }

    // Email
    if (!personalInfo.email) {
      warnings.push({
        field: 'personalInfo.email',
        message: 'Se recomienda proporcionar un email de contacto',
        code: 'MISSING_EMAIL',
        severity: 'WARNING'
      });
    } else if (!this.emailRegex.test(personalInfo.email)) {
      errors.push({
        field: 'personalInfo.email',
        message: 'Formato de email inválido',
        code: 'INVALID_EMAIL_FORMAT',
        severity: 'ERROR'
      });
    }

    // Teléfono
    if (!personalInfo.phoneNumber) {
      warnings.push({
        field: 'personalInfo.phoneNumber',
        message: 'Se recomienda proporcionar un teléfono de contacto',
        code: 'MISSING_PHONE',
        severity: 'WARNING'
      });
    } else if (!this.phoneRegex.test(personalInfo.phoneNumber)) {
      errors.push({
        field: 'personalInfo.phoneNumber',
        message: 'Formato de teléfono inválido',
        code: 'INVALID_PHONE_FORMAT',
        severity: 'ERROR'
      });
    }

    // Contacto de emergencia
    if (personalInfo.emergencyContact) {
      if (!personalInfo.emergencyContact.name) {
        errors.push({
          field: 'personalInfo.emergencyContact.name',
          message: 'El nombre del contacto de emergencia es requerido',
          code: 'MISSING_EMERGENCY_CONTACT_NAME',
          severity: 'ERROR'
        });
      }

      if (!personalInfo.emergencyContact.phoneNumber) {
        errors.push({
          field: 'personalInfo.emergencyContact.phoneNumber',
          message: 'El teléfono del contacto de emergencia es requerido',
          code: 'MISSING_EMERGENCY_CONTACT_PHONE',
          severity: 'ERROR'
        });
      } else if (!this.phoneRegex.test(personalInfo.emergencyContact.phoneNumber)) {
        errors.push({
          field: 'personalInfo.emergencyContact.phoneNumber',
          message: 'Formato de teléfono del contacto de emergencia inválido',
          code: 'INVALID_EMERGENCY_CONTACT_PHONE',
          severity: 'ERROR'
        });
      }
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Validar información médica
   */
  validateMedicalInfo(medicalInfo: any): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Tipo de sangre
    const validBloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    if (!medicalInfo.bloodType) {
      warnings.push({
        field: 'medicalInfo.bloodType',
        message: 'Se recomienda especificar el tipo de sangre',
        code: 'MISSING_BLOOD_TYPE',
        severity: 'WARNING'
      });
    } else if (!validBloodTypes.includes(medicalInfo.bloodType)) {
      errors.push({
        field: 'medicalInfo.bloodType',
        message: 'Tipo de sangre inválido',
        code: 'INVALID_BLOOD_TYPE',
        severity: 'ERROR'
      });
    }

    // Validar alergias
    if (medicalInfo.allergies && Array.isArray(medicalInfo.allergies)) {
      medicalInfo.allergies.forEach((allergy: Allergy, index: number) => {
        const allergyValidation = this.validateAllergy(allergy, `medicalInfo.allergies[${index}]`);
        errors.push(...allergyValidation.errors);
        warnings.push(...allergyValidation.warnings);
      });
    }

    // Validar condiciones crónicas
    if (medicalInfo.chronicConditions && Array.isArray(medicalInfo.chronicConditions)) {
      medicalInfo.chronicConditions.forEach((condition: ChronicCondition, index: number) => {
        const conditionValidation = this.validateChronicCondition(condition, `medicalInfo.chronicConditions[${index}]`);
        errors.push(...conditionValidation.errors);
        warnings.push(...conditionValidation.warnings);
      });
    }

    // Validar medicamentos
    if (medicalInfo.currentMedications && Array.isArray(medicalInfo.currentMedications)) {
      medicalInfo.currentMedications.forEach((medication: Medication, index: number) => {
        const medicationValidation = this.validateMedication(medication, `medicalInfo.currentMedications[${index}]`);
        errors.push(...medicationValidation.errors);
        warnings.push(...medicationValidation.warnings);
      });

      // Verificar interacciones medicamentosas
      const interactionValidation = this.validateMedicationInteractions(medicalInfo.currentMedications);
      errors.push(...interactionValidation.errors);
      warnings.push(...interactionValidation.warnings);
    }

    // Validar signos vitales
    if (medicalInfo.vitalSigns) {
      const vitalSignsValidation = this.validateVitalSigns(medicalInfo.vitalSigns);
      errors.push(...vitalSignsValidation.errors);
      warnings.push(...vitalSignsValidation.warnings);
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Validar alergia individual
   */
  validateAllergy(allergy: Allergy, fieldPath: string): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    if (!allergy.allergen || allergy.allergen.trim().length < 2) {
      errors.push({
        field: `${fieldPath}.allergen`,
        message: 'El nombre del alérgeno es requerido',
        code: 'MISSING_ALLERGEN',
        severity: 'ERROR'
      });
    }

    const validSeverities = ['MILD', 'MODERATE', 'SEVERE', 'LIFE_THREATENING'];
    if (!validSeverities.includes(allergy.severity)) {
      errors.push({
        field: `${fieldPath}.severity`,
        message: 'Severidad de alergia inválida',
        code: 'INVALID_ALLERGY_SEVERITY',
        severity: 'ERROR'
      });
    }

    if (allergy.snomedCode && !this.snomedRegex.test(allergy.snomedCode)) {
      errors.push({
        field: `${fieldPath}.snomedCode`,
        message: 'Código SNOMED CT inválido',
        code: 'INVALID_SNOMED_CODE',
        severity: 'ERROR'
      });
    }

    if (allergy.severity === 'LIFE_THREATENING' && (!allergy.symptoms || allergy.symptoms.length === 0)) {
      warnings.push({
        field: `${fieldPath}.symptoms`,
        message: 'Se recomienda especificar síntomas para alergias que amenazan la vida',
        code: 'MISSING_CRITICAL_ALLERGY_SYMPTOMS',
        severity: 'WARNING'
      });
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Validar condición crónica
   */
  validateChronicCondition(condition: ChronicCondition, fieldPath: string): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    if (!condition.conditionName || condition.conditionName.trim().length < 2) {
      errors.push({
        field: `${fieldPath}.conditionName`,
        message: 'El nombre de la condición es requerido',
        code: 'MISSING_CONDITION_NAME',
        severity: 'ERROR'
      });
    }

    if (condition.icd11Code && !this.icd11Regex.test(condition.icd11Code)) {
      errors.push({
        field: `${fieldPath}.icd11Code`,
        message: 'Código ICD-11 inválido',
        code: 'INVALID_ICD11_CODE',
        severity: 'ERROR'
      });
    }

    if (condition.snomedCode && !this.snomedRegex.test(condition.snomedCode)) {
      errors.push({
        field: `${fieldPath}.snomedCode`,
        message: 'Código SNOMED CT inválido',
        code: 'INVALID_SNOMED_CODE',
        severity: 'ERROR'
      });
    }

    if (!condition.diagnosisDate) {
      errors.push({
        field: `${fieldPath}.diagnosisDate`,
        message: 'La fecha de diagnóstico es requerida',
        code: 'MISSING_DIAGNOSIS_DATE',
        severity: 'ERROR'
      });
    } else {
      const diagnosisDate = new Date(condition.diagnosisDate);
      const today = new Date();
      
      if (diagnosisDate > today) {
        errors.push({
          field: `${fieldPath}.diagnosisDate`,
          message: 'La fecha de diagnóstico no puede ser futura',
          code: 'FUTURE_DIAGNOSIS_DATE',
          severity: 'ERROR'
        });
      }
    }

    const validStatuses = ['ACTIVE', 'RESOLVED', 'IN_REMISSION'];
    if (!validStatuses.includes(condition.status)) {
      errors.push({
        field: `${fieldPath}.status`,
        message: 'Estado de condición inválido',
        code: 'INVALID_CONDITION_STATUS',
        severity: 'ERROR'
      });
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Validar medicamento
   */
  validateMedication(medication: Medication, fieldPath: string): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    if (!medication.medicationName || medication.medicationName.trim().length < 2) {
      errors.push({
        field: `${fieldPath}.medicationName`,
        message: 'El nombre del medicamento es requerido',
        code: 'MISSING_MEDICATION_NAME',
        severity: 'ERROR'
      });
    }

    if (medication.atcCode && !this.atcRegex.test(medication.atcCode)) {
      errors.push({
        field: `${fieldPath}.atcCode`,
        message: 'Código ATC inválido',
        code: 'INVALID_ATC_CODE',
        severity: 'ERROR'
      });
    }

    if (!medication.dosage || medication.dosage.trim().length === 0) {
      errors.push({
        field: `${fieldPath}.dosage`,
        message: 'La dosis es requerida',
        code: 'MISSING_DOSAGE',
        severity: 'ERROR'
      });
    }

    if (!medication.frequency || medication.frequency.trim().length === 0) {
      errors.push({
        field: `${fieldPath}.frequency`,
        message: 'La frecuencia es requerida',
        code: 'MISSING_FREQUENCY',
        severity: 'ERROR'
      });
    }

    if (!medication.prescriptionDate) {
      errors.push({
        field: `${fieldPath}.prescriptionDate`,
        message: 'La fecha de prescripción es requerida',
        code: 'MISSING_PRESCRIPTION_DATE',
        severity: 'ERROR'
      });
    } else {
      const prescriptionDate = new Date(medication.prescriptionDate);
      const today = new Date();
      
      if (prescriptionDate > today) {
        errors.push({
          field: `${fieldPath}.prescriptionDate`,
          message: 'La fecha de prescripción no puede ser futura',
          code: 'FUTURE_PRESCRIPTION_DATE',
          severity: 'ERROR'
        });
      }
    }

    if (medication.endDate) {
      const endDate = new Date(medication.endDate);
      const prescriptionDate = new Date(medication.prescriptionDate);
      
      if (endDate <= prescriptionDate) {
        errors.push({
          field: `${fieldPath}.endDate`,
          message: 'La fecha de fin debe ser posterior a la prescripción',
          code: 'INVALID_END_DATE',
          severity: 'ERROR'
        });
      }
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Validar signos vitales
   */
  validateVitalSigns(vitalSigns: VitalSigns, patientAge?: number): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Determinar rango de edad para validación
    const ageGroup = this.determineAgeGroup(patientAge);

    // Presión arterial
    if (vitalSigns.bloodPressure) {
      const bpRange = this.vitalSignsRanges.bloodPressure[ageGroup];
      
      if (vitalSigns.bloodPressure.systolic < 50 || vitalSigns.bloodPressure.systolic > 250) {
        errors.push({
          field: 'vitalSigns.bloodPressure.systolic',
          message: 'Presión sistólica fuera de rango plausible (50-250 mmHg)',
          code: 'IMPLAUSIBLE_SYSTOLIC_BP',
          severity: 'ERROR'
        });
      } else if (vitalSigns.bloodPressure.systolic < bpRange.systolic.min || 
                 vitalSigns.bloodPressure.systolic > bpRange.systolic.max) {
        warnings.push({
          field: 'vitalSigns.bloodPressure.systolic',
          message: `Presión sistólica fuera del rango normal para la edad (${bpRange.systolic.min}-${bpRange.systolic.max} mmHg)`,
          code: 'ABNORMAL_SYSTOLIC_BP',
          severity: 'WARNING'
        });
      }

      if (vitalSigns.bloodPressure.diastolic < 30 || vitalSigns.bloodPressure.diastolic > 150) {
        errors.push({
          field: 'vitalSigns.bloodPressure.diastolic',
          message: 'Presión diastólica fuera de rango plausible (30-150 mmHg)',
          code: 'IMPLAUSIBLE_DIASTOLIC_BP',
          severity: 'ERROR'
        });
      } else if (vitalSigns.bloodPressure.diastolic < bpRange.diastolic.min || 
                 vitalSigns.bloodPressure.diastolic > bpRange.diastolic.max) {
        warnings.push({
          field: 'vitalSigns.bloodPressure.diastolic',
          message: `Presión diastólica fuera del rango normal para la edad (${bpRange.diastolic.min}-${bpRange.diastolic.max} mmHg)`,
          code: 'ABNORMAL_DIASTOLIC_BP',
          severity: 'WARNING'
        });
      }

      // Verificar relación sistólica/diastólica
      if (vitalSigns.bloodPressure.systolic <= vitalSigns.bloodPressure.diastolic) {
        errors.push({
          field: 'vitalSigns.bloodPressure',
          message: 'La presión sistólica debe ser mayor que la diastólica',
          code: 'INVALID_BP_RELATION',
          severity: 'ERROR'
        });
      }
    }

    // Frecuencia cardíaca
    const hrRange = this.vitalSignsRanges.heartRate[ageGroup];
    if (vitalSigns.heartRate < 30 || vitalSigns.heartRate > 300) {
      errors.push({
        field: 'vitalSigns.heartRate',
        message: 'Frecuencia cardíaca fuera de rango plausible (30-300 bpm)',
        code: 'IMPLAUSIBLE_HEART_RATE',
        severity: 'ERROR'
      });
    } else if (vitalSigns.heartRate < hrRange.min || vitalSigns.heartRate > hrRange.max) {
      warnings.push({
        field: 'vitalSigns.heartRate',
        message: `Frecuencia cardíaca fuera del rango normal (${hrRange.min}-${hrRange.max} bpm)`,
        code: 'ABNORMAL_HEART_RATE',
        severity: 'WARNING'
      });
    }

    // Temperatura
    if (vitalSigns.temperature < 30 || vitalSigns.temperature > 45) {
      errors.push({
        field: 'vitalSigns.temperature',
        message: 'Temperatura fuera de rango plausible (30-45°C)',
        code: 'IMPLAUSIBLE_TEMPERATURE',
        severity: 'ERROR'
      });
    } else if (vitalSigns.temperature > this.vitalSignsRanges.temperature.fever.min) {
      warnings.push({
        field: 'vitalSigns.temperature',
        message: 'Temperatura indica fiebre',
        code: 'FEVER_DETECTED',
        severity: 'WARNING'
      });
    } else if (vitalSigns.temperature < this.vitalSignsRanges.temperature.normal.min) {
      warnings.push({
        field: 'vitalSigns.temperature',
        message: 'Temperatura por debajo del rango normal',
        code: 'LOW_TEMPERATURE',
        severity: 'WARNING'
      });
    }

    // Saturación de oxígeno
    if (vitalSigns.oxygenSaturation < 50 || vitalSigns.oxygenSaturation > 100) {
      errors.push({
        field: 'vitalSigns.oxygenSaturation',
        message: 'Saturación de oxígeno fuera de rango plausible (50-100%)',
        code: 'IMPLAUSIBLE_OXYGEN_SATURATION',
        severity: 'ERROR'
      });
    } else if (vitalSigns.oxygenSaturation < this.vitalSignsRanges.oxygenSaturation.normal.min) {
      const severity = vitalSigns.oxygenSaturation < this.vitalSignsRanges.oxygenSaturation.low.min ? 'ERROR' : 'WARNING';
      warnings.push({
        field: 'vitalSigns.oxygenSaturation',
        message: 'Saturación de oxígeno baja',
        code: 'LOW_OXYGEN_SATURATION',
        severity
      });
    }

    // IMC (si se proporcionan peso y altura)
    if (vitalSigns.weight && vitalSigns.height) {
      const heightInMeters = vitalSigns.height / 100;
      const calculatedBMI = vitalSigns.weight / (heightInMeters * heightInMeters);
      
      if (Math.abs(vitalSigns.bmi - calculatedBMI) > 0.5) {
        warnings.push({
          field: 'vitalSigns.bmi',
          message: 'El IMC calculado no coincide con el peso y altura proporcionados',
          code: 'BMI_CALCULATION_MISMATCH',
          severity: 'WARNING'
        });
      }

      if (calculatedBMI < 16 || calculatedBMI > 50) {
        warnings.push({
          field: 'vitalSigns.bmi',
          message: 'IMC fuera del rango normal',
          code: 'ABNORMAL_BMI',
          severity: 'WARNING'
        });
      }
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Validar entrada de historial médico
   */
  validateHistoryEntry(entry: MedicalHistoryEntry): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    if (!entry.title || entry.title.trim().length < 3) {
      errors.push({
        field: 'title',
        message: 'El título de la entrada es requerido (mínimo 3 caracteres)',
        code: 'MISSING_HISTORY_TITLE',
        severity: 'ERROR'
      });
    }

    if (!entry.description || entry.description.trim().length < 10) {
      errors.push({
        field: 'description',
        message: 'La descripción debe tener al menos 10 caracteres',
        code: 'INSUFFICIENT_DESCRIPTION',
        severity: 'ERROR'
      });
    }

    const validTypes = ['CONSULTATION', 'PROCEDURE', 'DIAGNOSIS', 'TEST_RESULT', 'EMERGENCY'];
    if (!validTypes.includes(entry.type)) {
      errors.push({
        field: 'type',
        message: 'Tipo de entrada de historial inválido',
        code: 'INVALID_HISTORY_TYPE',
        severity: 'ERROR'
      });
    }

    const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    if (!validPriorities.includes(entry.priority)) {
      errors.push({
        field: 'priority',
        message: 'Prioridad inválida',
        code: 'INVALID_PRIORITY',
        severity: 'ERROR'
      });
    }

    if (entry.date) {
      const entryDate = new Date(entry.date);
      const today = new Date();
      
      if (entryDate > today) {
        errors.push({
          field: 'date',
          message: 'La fecha de la entrada no puede ser futura',
          code: 'FUTURE_ENTRY_DATE',
          severity: 'ERROR'
        });
      }
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Validar interacciones medicamentosas
   */
  validateMedicationInteractions(medications: Medication[]): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Base de datos simplificada de interacciones conocidas
    const knownInteractions = [
      { drug1: 'warfarin', drug2: 'aspirin', severity: 'HIGH', description: 'Riesgo aumentado de sangrado' },
      { drug1: 'digoxin', drug2: 'furosemide', severity: 'MEDIUM', description: 'Riesgo de toxicidad por digoxina' },
      { drug1: 'metformin', drug2: 'contrast', severity: 'HIGH', description: 'Riesgo de acidosis láctica' }
    ];

    for (let i = 0; i < medications.length; i++) {
      for (let j = i + 1; j < medications.length; j++) {
        const med1 = medications[i].medicationName.toLowerCase();
        const med2 = medications[j].medicationName.toLowerCase();

        const interaction = knownInteractions.find(inter => 
          (inter.drug1 === med1 && inter.drug2 === med2) ||
          (inter.drug1 === med2 && inter.drug2 === med1)
        );

        if (interaction) {
          const severity = interaction.severity === 'HIGH' ? 'ERROR' : 'WARNING';
          warnings.push({
            field: 'currentMedications',
            message: `Posible interacción entre ${medications[i].medicationName} y ${medications[j].medicationName}: ${interaction.description}`,
            code: 'DRUG_INTERACTION',
            severity
          });
        }
      }
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Validar configuración de privacidad
   */
  validatePrivacySettings(privacySettings: any): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    if (privacySettings.dataRetentionPeriod < 1 || privacySettings.dataRetentionPeriod > 3650) {
      errors.push({
        field: 'privacySettings.dataRetentionPeriod',
        message: 'El período de retención debe estar entre 1 y 3650 días',
        code: 'INVALID_RETENTION_PERIOD',
        severity: 'ERROR'
      });
    }

    if (privacySettings.dataRetentionPeriod < 365) {
      warnings.push({
        field: 'privacySettings.dataRetentionPeriod',
        message: 'Período de retención menor a 1 año puede afectar la continuidad del cuidado',
        code: 'SHORT_RETENTION_PERIOD',
        severity: 'WARNING'
      });
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  // Métodos auxiliares

  private determineAgeGroup(age?: number): 'child' | 'adult' | 'elderly' {
    if (!age) return 'adult';
    if (age < 18) return 'child';
    if (age >= 65) return 'elderly';
    return 'adult';
  }

  /**
   * Validar formato de fecha ISO 8601
   */
  isValidISODate(dateString: string): boolean {
    const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
    return iso8601Regex.test(dateString) && !isNaN(Date.parse(dateString));
  }

  /**
   * Sanitizar entrada de texto
   */
  sanitizeText(input: string): string {
    return input
      .trim()
      .replace(/[<>]/g, '') // Remover caracteres HTML básicos
      .replace(/\s+/g, ' '); // Normalizar espacios
  }

  /**
   * Validar código postal por país
   */
  validatePostalCode(postalCode: string, country: string): boolean {
    const patterns: Record<string, RegExp> = {
      'US': /^\d{5}(-\d{4})?$/,
      'CA': /^[A-Z]\d[A-Z] \d[A-Z]\d$/,
      'ES': /^\d{5}$/,
      'MX': /^\d{5}$/
    };

    const pattern = patterns[country];
    return pattern ? pattern.test(postalCode) : true; // Si no hay patrón específico, aceptar
  }
}

export const validationService = new ValidationService();
export default validationService;
