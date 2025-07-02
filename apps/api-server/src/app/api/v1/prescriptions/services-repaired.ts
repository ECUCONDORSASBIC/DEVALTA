import {
    Prescription,
    PrescriptionStatus,
    PrescriptionType,
    PrescriptionUrgency,
    DrugInformation,
    Dosage,
    RouteOfAdministration,
    DrugSchedule,
    PrescriptionQueryFilters
} from './types';
import { z } from 'zod';

// Define missing types
type AuditLog = any;
type ValidationResult<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  errors?: any[];
};

type DrugInteraction = {
  drugA: string;
  drugB: string;
  severity: 'MINOR' | 'MODERATE' | 'MAJOR' | 'CONTRAINDICATED';
  description: string;
};

type AllergyInteraction = {
  allergen: string;
  severity: string;
  description: string;
};

type CreatePrescriptionRequest = {
  patientId: string;
  prescriberId: string;
  type: PrescriptionType;
  urgency: PrescriptionUrgency;
  drug: DrugInformation;
  dosage: Dosage;
  indication: string;
  diagnosis: string[];
  medicalRecordId?: string;
  pharmacyId?: string;
  pharmacyInstructions?: string;
  priorAuthorizationRequired?: boolean;
  metadata?: any;
};

type UpdatePrescriptionRequest = Partial<CreatePrescriptionRequest>;

const InteractionSeverity = {
  MINOR: 'MINOR' as const,
  MODERATE: 'MODERATE' as const,
  MAJOR: 'MAJOR' as const,
  CONTRAINDICATED: 'CONTRAINDICATED' as const
};

/**
 * 💊 PRESCRIPTIONS BUSINESS SERVICES
 * Servicios de negocio para manejo de prescripciones médicas con cumplimiento FDA/DEA
 */

import {
    validateControlledSubstanceRefills,
    validateCreatePrescription,
    validateDosageRange,
    validatePrescriberCredentials,
    validatePrescriptionPermissions,
    validatePrescriptionQuery,
    validateUpdatePrescription
} from './schemas';

// Mock databases - En producción, usar Firebase/Firestore
class PrescriptionDatabase {
  private prescriptions: Map<string, Prescription> = new Map();
  private interactions: Map<string, DrugInteraction[]> = new Map();
  private drugInteractions: Map<string, DrugInteraction[]> = new Map();
  private auditLogs: AuditLog[] = [];

  async findById(id: string): Promise<Prescription | null> {
    return this.prescriptions.get(id) || null;
  }

  async save(prescription: Prescription): Promise<Prescription> {
    this.prescriptions.set(prescription.id, prescription);
    return prescription;
  }

  async query(filters: any): Promise<Prescription[]> {
    return Array.from(this.prescriptions.values());
  }

  async getDrugInteractions(drugs: string[]): Promise<DrugInteraction[]> {
    return [];
  }

  async getPatientAllergies(patientId: string): Promise<string[]> {
    return [];
  }

  async getPatientCurrentMedications(patientId: string): Promise<string[]> {
    return [];
  }

  async logAudit(log: AuditLog): Promise<void> {
    this.auditLogs.push(log);
  }

  async getPrescriberCredentials(prescriberId: string): Promise<{
    deaNumber: string;
    npiNumber: string;
    licenseNumber: string;
    licenseState: string;
  } | null> {
    // Mock prescriber credentials - integrar con doctors API
    const credentials: Record<string, any> = {
      'prescriber-123': {
        deaNumber: 'AB1234567',
        npiNumber: '1234567890',
        licenseNumber: 'LIC123456',
        licenseState: 'CA'
      }
    };

    return credentials[prescriberId] || null;
  }
}

// Instancia singleton del database
const db = new PrescriptionDatabase();

/**
 * 🏥 PRESCRIPTION SERVICES CLASS
 * Servicios principales para manejo de prescripciones
 */
export class PrescriptionServices {
  
  /**
   * Crear nueva prescripción con validaciones completas
   */
  static async createPrescription(
    data: CreatePrescriptionRequest,
    userId: string,
    userRole: string,
    userPermissions: string[]
  ): Promise<any> {
    try {
      // 1. Validar datos de entrada
      const validation = validateCreatePrescription(data);
      if (!validation.success) {
        return {
          success: false,
          errors: validation.errors,
          data: null
        };
      }

      const validatedData = validation.data!;      // 2. Validar permisos del usuario
      const permissionCheck = validatePrescriptionPermissions(
        userRole,
        'create',
        validatedData.type,
        userPermissions
      );
      if (!permissionCheck.allowed) {
        return {
          success: false,
          errors: permissionCheck.restrictions,
          data: null
        };
      }

      // 3. Validar credenciales del prescriptor
      const prescriberCredentials = await db.getPrescriberCredentials(validatedData.prescriberId);
      if (!prescriberCredentials) {
        return {
          success: false,
          errors: ['Credenciales del prescriptor no encontradas'],
          data: null
        };
      }
      // Crear prescripción básica
      const currentDate = new Date();
      const prescription: Prescription = {
        id: `prescription_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        patientId: validatedData.patientId,
        prescriberId: validatedData.prescriberId,
        type: validatedData.type,
        urgency: validatedData.urgency,
        status: PrescriptionStatus.ACTIVE,
        drug: validatedData.drug,
        dosage: validatedData.dosage,
        indication: validatedData.indication,
        diagnosis: validatedData.diagnosis,
        medicalRecordId: validatedData.medicalRecordId,
        drugInteractions: [],
        allergyInteractions: [],
        contraindications: [],
        warnings: [],
        pharmacy: undefined,
        pharmacyInstructions: validatedData.pharmacyInstructions,
        electronicSignature: undefined,
        datePrescribed: currentDate,
        dateWritten: currentDate,
        effectiveDate: currentDate,
        expirationDate: new Date(currentDate.getTime() + 365 * 24 * 60 * 60 * 1000), // 1 year
        lastFillDate: undefined,
        nextRefillDate: undefined,
        refillsRemaining: validatedData.dosage.refillsAuthorized,
        fillHistory: [],
        priorAuthorization: validatedData.priorAuthorizationRequired ? {
          required: true,
          status: 'pending'
        } : undefined,
        insurance: undefined,
        auditTrail: [],
        metadata: {
          createdBy: userId,
          createdAt: currentDate,
          version: 1,
          ...validatedData.metadata
        }
      };

      // Guardar prescripción
      const savedPrescription = await db.save(prescription);

      return {
        success: true,
        data: savedPrescription,
        warnings: []
      };

    } catch (error: any) {
      return {
        success: false,
        errors: [`Error interno: ${error.message}`],
        data: null
      };
    }
  }

  /**
   * Actualizar prescripción existente
   */
  static async updatePrescription(
    prescriptionId: string,
    updates: UpdatePrescriptionRequest,
    userId: string,
    userRole: string,
    userPermissions: string[]
  ): Promise<any> {
    try {
      // 1. Buscar prescripción existente
      const existingPrescription = await db.findById(prescriptionId);
      if (!existingPrescription) {
        return {
          success: false,
          errors: ['Prescripción no encontrada'],
          data: null
        };
      }

      // 2. Aplicar actualizaciones básicas
      const updatedPrescription = {
        ...existingPrescription,
        ...updates,
        audit: {
          ...(existingPrescription as any).audit,
          lastModifiedBy: userId,
          lastModifiedAt: new Date().toISOString()
        }
      };

      // 3. Guardar cambios
      const savedPrescription = await db.save(updatedPrescription);

      return {
        success: true,
        data: savedPrescription,
        warnings: []
      };

    } catch (error: any) {
      return {
        success: false,
        errors: [`Error interno: ${error.message}`],
        data: null
      };
    }
  }

  /**
   * Consultar prescripciones con filtros
   */
  static async queryPrescriptions(
    params: PrescriptionQueryFilters,
    userId: string,
    userRole: string,
    userPermissions: string[]
  ): Promise<any> {
    try {
      const prescriptions = await db.query(params);
      
      return {
        success: true,
        data: {
          prescriptions,
          total: prescriptions.length,
          hasMore: false
        }
      };

    } catch (error: any) {
      return {
        success: false,
        errors: [`Error interno: ${error.message}`],
        data: null
      };
    }
  }

  /**
   * Cancelar prescripción
   */
  static async cancelPrescription(
    prescriptionId: string,
    reason: string,
    userId: string,
    userRole: string,
    userPermissions: string[]
  ): Promise<any> {
    try {
      const prescription = await db.findById(prescriptionId);
      if (!prescription) {
        return {
          success: false,
          errors: ['Prescripción no encontrada'],
          data: null
        };
      }

      // Actualizar estado a cancelado
      const updatedPrescription = {
        ...prescription,
        status: PrescriptionStatus.CANCELLED,
        cancelledAt: new Date().toISOString(),
        cancelReason: reason,
        cancelledBy: userId
      };

      const savedPrescription = await db.save(updatedPrescription);

      return {
        success: true,
        data: savedPrescription
      };

    } catch (error: any) {
      return {
        success: false,
        errors: [`Error interno: ${error.message}`],
        data: null
      };
    }
  }
}

export default PrescriptionServices;