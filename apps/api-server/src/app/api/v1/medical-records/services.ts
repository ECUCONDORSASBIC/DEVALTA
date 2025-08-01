/**
 * 📋 MEDICAL RECORDS SERVICE
 * Servicio principal para gestión de historiales médicos
 */

import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { validateMedicalRecordCompleteness } from './schemas';
import {
    AccessLevel,
    CreateMedicalRecordRequest,
    MedicalRecord,
    MedicalRecordError,
    MedicalRecordExecutionContext,
    MedicalRecordNotFoundError,
    MedicalRecordQueryFilters,
    RecordStatus,
    UpdateMedicalRecordRequest,
    ValidationResult
} from './types';

export class MedicalRecordService {
  private readonly collectionName = 'medical_records';

  /**
   * Crear nuevo historial médico
   */
  async createMedicalRecord(
    request: CreateMedicalRecordRequest,
    context: MedicalRecordExecutionContext
  ): Promise<MedicalRecord> {
    try {
      const recordId = this.generateRecordId();
      const now = new Date();

      // Validar completitud y calidad
      const validation = validateMedicalRecordCompleteness(request);

      // Crear registro completo
      const record: MedicalRecord = {
        id: recordId,
        patientId: (request as any).patientId,
        type: (request as any).type,
        status: RecordStatus.DRAFT,
        accessLevel: request.accessLevel || AccessLevel.RESTRICTED,

        metadata: {
          ...request.metadata,
          createdBy: context.userId,
          createdAt: now,
          version: 1
        },

        encounter: {
          id: this.generateEncounterId(),
          ...request.encounter
        },
        clinical: request.clinical || {},
        plan: request.plan || {},

        compliance: {
          completeness: validation.completeness,
          accuracy: 95, // Valor inicial, se actualizará con validaciones
          validationStatus: 'pending',
          qualityScore: validation.qualityScore
        },

        permissions: {
          read: [context.userId, (request as any).patientId],
          write: [context.userId],
          delete: [context.userId]
        },

        audit: {
          accessLog: [{
            userId: context.userId,
            action: 'write',
            timestamp: now,
            ipAddress: context.ipAddress
          }],
          modifications: []
        }
      };

      // Guardar en Firestore
      await adminDb.collection(this.collectionName).doc(recordId).set(record);

      // Índices adicionales para búsquedas eficientes
      await this.updateSearchIndices(record);

      // Log de auditoría
      await this.logAuditEvent(recordId, 'created', context);

      return record;

    } catch (error: any) {
      throw new MedicalRecordError(
        'Error al crear historial médico',
        'CREATE_FAILED',
        { originalError: error.message }
      );
    }
  }

  /**
   * Obtener historial médico por ID
   */
  async getMedicalRecord(
    recordId: string,
    context: MedicalRecordExecutionContext
  ): Promise<MedicalRecord> {
    try {
      const doc = await adminDb.collection(this.collectionName).doc(recordId).get();
      
      if (!doc.exists) {
        throw new MedicalRecordNotFoundError(recordId);
      }

      const record = doc.data() as MedicalRecord;

      // Verificar permisos de lectura
      if (!record.permissions.read.includes(context.userId) && 
          !context.permissions.includes('medical_records:read_all')) {
        throw new MedicalRecordError(
          'Sin permisos para acceder a este historial médico',
          'ACCESS_DENIED',
          { recordId, userId: context.userId }
        );
      }

      // Log de acceso
      await this.logAccess(recordId, context);

      return record;

    } catch (error: any) {
      if (error instanceof MedicalRecordError || error instanceof MedicalRecordNotFoundError) {
        throw error;
      }
      throw new MedicalRecordError(
        'Error al obtener historial médico',
        'GET_FAILED',
        { recordId, originalError: error.message }
      );
    }
  }

  /**
   * Actualizar historial médico
   */
  async updateMedicalRecord(
    request: UpdateMedicalRecordRequest,
    context: MedicalRecordExecutionContext
  ): Promise<MedicalRecord> {
    try {
      const { recordId, updates, updateReason } = request;

      // Obtener registro actual
      const currentRecord = await this.getMedicalRecord(recordId, context);

      // Verificar permisos de escritura
      if (!currentRecord.permissions.write.includes(context.userId) && 
          !context.permissions.includes('medical_records:write_all')) {
        throw new MedicalRecordError(
          'Sin permisos para modificar este historial médico',
          'WRITE_ACCESS_DENIED',
          { recordId, userId: context.userId }
        );
      }

      const now = new Date();

      // Preparar actualizaciones
      const updatedRecord: MedicalRecord = {
        ...currentRecord,
        ...updates,
        metadata: {
          ...currentRecord.metadata,
          ...updates.metadata,
          updatedBy: context.userId,
          updatedAt: now,
          version: currentRecord.metadata.version + 1
        }
      };

      // Si se actualizan datos clínicos, recalcular completitud
      if (updates.clinical) {
        updatedRecord.clinical = {
          ...currentRecord.clinical,
          ...updates.clinical
        };
        
        const validation = validateMedicalRecordCompleteness(updatedRecord);
        updatedRecord.compliance = {
          ...currentRecord.compliance,
          completeness: validation.completeness,
          qualityScore: validation.qualityScore,
          validationStatus: 'pending'
        };
      }

      // Registrar modificaciones para auditoría
      const modifications = this.trackModifications(
        currentRecord,
        updatedRecord,
        context.userId,
        now,
        updateReason
      );

      updatedRecord.audit = {
        ...currentRecord.audit,
        accessLog: [
          ...currentRecord.audit.accessLog,
          {
            userId: context.userId,
            action: 'write',
            timestamp: now,
            ipAddress: context.ipAddress
          }
        ],
        modifications: [
          ...currentRecord.audit.modifications,
          ...modifications
        ]
      };

      // Guardar cambios
      await adminDb.collection(this.collectionName).doc(recordId).set(updatedRecord);

      // Actualizar índices
      await this.updateSearchIndices(updatedRecord);

      return updatedRecord;

    } catch (error: any) {
      if (error instanceof MedicalRecordError || error instanceof MedicalRecordNotFoundError) {
        throw error;
      }
      throw new MedicalRecordError(
        'Error al actualizar historial médico',
        'UPDATE_FAILED',
        { originalError: error.message }
      );
    }
  }

  /**
   * Buscar historiales médicos con filtros
   */  async searchMedicalRecords(
    filters: MedicalRecordQueryFilters,
    context: MedicalRecordExecutionContext
  ): Promise<{
    records: MedicalRecord[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      hasNext: boolean;
    };
    summary: any;
  }> {
    try {
      let query: any = adminDb.collection(this.collectionName);

      // Aplicar filtros
      if ((filters as any).patientId) {
        query = (query as any).where('patientId', '==', (filters as any).patientId);
      }

      if ((filters as any).type && (filters as any).type.length > 0) {
        query = (query as any).where('type', 'in', (filters as any).type);
      }

      if ((filters as any).status && (filters as any).status.length > 0) {
        query = (query as any).where('status', 'in', (filters as any).status);
      }

      if (filters.provider) {
        query = (query as any).where('encounter.provider.id', '==', filters.provider);
      }

      if (filters.dateRange) {
        query = query
          .where('encounter.date', '>=', filters.dateRange.start)
          .where('encounter.date', '<=', filters.dateRange.end);
      }

      // Aplicar ordenamiento
      const sortField = filters.sortBy === 'date' ? 'encounter.date' : 
                       filters.sortBy === 'type' ? 'type' :
                       filters.sortBy === 'provider' ? 'encounter.provider.name' : 'encounter.date';
      
      query = (query as any).orderBy(sortField, filters.sortOrder || 'desc');

      // Aplicar paginación
      if (filters.offset && filters.offset > 0) {
        query = (query as any).offset(filters.offset);
      }

      const limit = filters.limit || 20;
      query = (query as any).limit(limit);

      // Ejecutar consulta
      const snapshot = await query.get();
      const allRecords = snapshot.docs.map((doc: any) => doc.data() as MedicalRecord);

      // Filtrar por permisos de acceso
      const accessibleRecords = allRecords.filter((record: any) => 
        record.permissions.read.includes(context.userId) || 
        context.permissions.includes('medical_records:read_all')
      );

      // Aplicar filtros adicionales que no se pueden hacer en Firestore
      let filteredRecords = accessibleRecords;

      if (filters.accessLevel && filters.accessLevel.length > 0) {
        filteredRecords = filteredRecords.filter((record: any) => 
          filters.accessLevel!.includes(record.accessLevel)
        );
      }

      if (filters.tags && filters.tags.length > 0) {
        filteredRecords = filteredRecords.filter((record: any) => 
          record.metadata.tags?.some((tag: any) => filters.tags!.includes(tag))
        );
      }

      if (filters.diagnosis) {
        filteredRecords = filteredRecords.filter((record: any) =>
          record.clinical.diagnoses?.some((diagnosis: any) => 
            diagnosis.name.toLowerCase().includes(filters.diagnosis!.toLowerCase()) ||
            diagnosis.code.includes(filters.diagnosis!)
          )
        );
      }

      // Log de búsqueda para auditoría
      await this.logSearchEvent(filters, filteredRecords.length, context);

      // Calcular paginación
      const total = filteredRecords.length;
      const page = Math.floor((filters.offset || 0) / limit) + 1;
      const hasNext = (filters.offset || 0) + limit < total;

      // Generar resumen
      const summary = this.generateSummary(filteredRecords);

      return {
        records: filteredRecords,
        pagination: {
          total,
          page,
          limit,
          hasNext
        },
        summary
      };

    } catch (error: any) {
      throw new MedicalRecordError(
        'Error al buscar historiales médicos',
        'SEARCH_FAILED',
        { filters, originalError: error.message }
      );
    }
  }

  /**
   * Eliminar historial médico (soft delete)
   */
  async deleteMedicalRecord(
    recordId: string,
    context: MedicalRecordExecutionContext,
    reason?: string
  ): Promise<void> {
    try {
      const record = await this.getMedicalRecord(recordId, context);

      // Verificar permisos de eliminación
      if (!record.permissions.delete.includes(context.userId) && 
          !context.permissions.includes('medical_records:delete_all')) {
        throw new MedicalRecordError(
          'Sin permisos para eliminar este historial médico',
          'DELETE_ACCESS_DENIED',
          { recordId, userId: context.userId }
        );
      }

      // Soft delete - cambiar estado a archivado
      const now = new Date();
      const updatedRecord = {
        ...record,
        status: RecordStatus.ARCHIVED,
        metadata: {
          ...record.metadata,
          updatedBy: context.userId,
          updatedAt: now
        },
        audit: {
          ...record.audit,
          accessLog: [
            ...record.audit.accessLog,
            {
              userId: context.userId,
              action: 'delete' as const,
              timestamp: now,
              ipAddress: context.ipAddress
            }
          ],
          modifications: [
            ...record.audit.modifications,
            {
              field: 'status',
              oldValue: (record as any).status,
              newValue: RecordStatus.ARCHIVED,
              modifiedBy: context.userId,
              modifiedAt: now,
              reason: reason || 'Eliminación solicitada por usuario'
            }
          ]
        }
      };

      await adminDb.collection(this.collectionName).doc(recordId).set(updatedRecord);

    } catch (error: any) {
      if (error instanceof MedicalRecordError || error instanceof MedicalRecordNotFoundError) {
        throw error;
      }
      throw new MedicalRecordError(
        'Error al eliminar historial médico',
        'DELETE_FAILED',
        { recordId, originalError: error.message }
      );
    }
  }

  /**
   * Validar historial médico
   */
  async validateMedicalRecord(
    recordId: string,
    context: MedicalRecordExecutionContext
  ): Promise<ValidationResult> {
    try {
      const record = await this.getMedicalRecord(recordId, context);
      
      const validation = validateMedicalRecordCompleteness(record);
      
      // Validaciones adicionales de negocio
      const errors: string[] = [];
      const warnings: string[] = [];

      // Validar coherencia de diagnósticos
      if (record.clinical.diagnoses) {
        const primaryDiagnoses = record.clinical.diagnoses.filter((d: any) => d.type === 'primary');
        if (primaryDiagnoses.length === 0) {
          warnings.push('No se encontró diagnóstico primario');
        }
        if (primaryDiagnoses.length > 1) {
          warnings.push('Múltiples diagnósticos primarios detectados');
        }
      }

      // Validar medicamentos vs alergias
      if (record.clinical.medications && record.clinical.allergies) {
        const drugAllergies = record.clinical.allergies.filter((a: any) => a.type === 'drug');
        record.clinical.medications.forEach((med: any) => {
          drugAllergies.forEach((allergy: any) => {
            if (med.name.toLowerCase().includes(allergy.allergen.toLowerCase())) {
              errors.push(`Posible alergia: ${med.name} vs ${allergy.allergen}`);
            }
          });
        });
      }

      // Validar signos vitales
      if (record.clinical.vitalSigns) {
        record.clinical.vitalSigns.forEach((vital: any) => {
          if (vital.bloodPressure) {
            if (vital.bloodPressure.systolic <= vital.bloodPressure.diastolic) {
              errors.push('Presión sistólica debe ser mayor que diastólica');
            }
          }
        });
      }

      const isValid = errors.length === 0;
      const finalQualityScore = Math.max(validation.qualityScore - (errors.length * 10), 0);

      return {
        isValid,
        errors,
        warnings,
        completeness: validation.completeness,
        qualityScore: finalQualityScore
      };

    } catch (error: any) {
      throw new MedicalRecordError(
        'Error al validar historial médico',
        'VALIDATION_FAILED',
        { recordId, originalError: error.message }
      );
    }  }

  // Métodos auxiliares privados
  private generateRecordId(): string {
    return `mr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateEncounterId(): string {
    return `enc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async updateSearchIndices(record: MedicalRecord): Promise<void> {
    // Índices para búsquedas eficientes
    const searchIndices = {
      patientId: (record as any).patientId,
      type: (record as any).type,
      status: (record as any).status,
      providerName: record.encounter.provider.name,
      date: record.encounter.date,
      diagnoses: record.clinical.diagnoses?.map((d: any) => d.name) || [],
      tags: record.metadata.tags || []
    };

    await adminDb.collection('medical_records_search').doc(record.id).set(searchIndices);
  }

  private trackModifications(
    oldRecord: MedicalRecord,
    newRecord: MedicalRecord,
    userId: string,
    timestamp: Date,
    reason?: string
  ): any[] {
    const modifications: any[] = [];

    // Comparar campos principales
    const fieldsToTrack = ['status', 'accessLevel', 'metadata', 'clinical', 'plan'];
    
    fieldsToTrack.forEach((field: any) => {
      const oldValue = (oldRecord as any)[field];
      const newValue = (newRecord as any)[field];
      
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        modifications.push({
          field,
          oldValue,
          newValue,
          modifiedBy: userId,
          modifiedAt: timestamp,
          reason
        });
      }
    });

    return modifications;
  }

  private async logAuditEvent(
    recordId: string,
    action: string,
    context: MedicalRecordExecutionContext
  ): Promise<void> {
    const auditLog = {
      recordId,
      action,
      userId: context.userId,
      timestamp: new Date(),
      ipAddress: context.ipAddress,
      userAgent: context.requestId
    };

    await adminDb.collection('medical_records_audit').add(auditLog);
  }

  private async logAccess(
    recordId: string,
    context: MedicalRecordExecutionContext
  ): Promise<void> {
    // Actualizar log de acceso en el documento
    await adminDb.collection(this.collectionName).doc(recordId).update({
      'audit.accessLog': FieldValue.arrayUnion({
        userId: context.userId,
        action: 'read',
        timestamp: new Date(),
        ipAddress: context.ipAddress
      })
    });
  }

  private async logSearchEvent(
    filters: MedicalRecordQueryFilters,
    resultCount: number,
    context: MedicalRecordExecutionContext
  ): Promise<void> {
    const searchLog = {
      userId: context.userId,
      filters,
      resultCount,
      timestamp: new Date(),
      ipAddress: context.ipAddress
    };

    await adminDb.collection('medical_records_search_log').add(searchLog);
  }

  private generateSummary(records: MedicalRecord[]): any {
    const summary = {
      totalRecords: records.length,
      byType: {} as any,
      byStatus: {} as any,
      recentActivity: {
        created: 0,
        updated: 0,
        accessed: 0
      }
    };

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    records.forEach((record: any) => {
      // Contar por tipo
      summary.byType[(record as any).type] = (summary.byType[(record as any).type] || 0) + 1;
      
      // Contar por estado
      summary.byStatus[(record as any).status] = (summary.byStatus[(record as any).status] || 0) + 1;
      
      // Actividad reciente
      if ((record as any).createdAt > thirtyDaysAgo) {
        summary.recentActivity.created++;
      }
      if (record.metadata.updatedAt && record.metadata.updatedAt > thirtyDaysAgo) {
        summary.recentActivity.updated++;
      }
      
      const recentAccess = record.audit.accessLog.filter((log: any) => log.timestamp > thirtyDaysAgo && log.action === 'read'
      );
      summary.recentActivity.accessed += recentAccess.length;
    });

    return summary;
  }
}
