/**
 * 🧪 LAB RESULTS SERVICES
 * PROACTIVO compliant business logic for laboratory results
 * Max lines: 250 (PROACTIVO standard)
 */

import { Firestore, getFirestore } from 'firebase-admin/firestore';
import {
    AccessLevel,
    CreateLabResultRequest,
    LabResult,
    LabResultAuditLog,
    LabResultError,
    LabResultMetrics,
    LabResultNotFoundError,
    LabResultQueryFilters,
    Priority,
    TestCategory,
    TestStatus,
    UpdateLabResultRequest
} from './types';

export class LabResultService {
  private db: Firestore;
  private collectionName = 'lab_results';
  private auditCollectionName = 'lab_results_audit';

  constructor() {
    this.db = getFirestore();
  }

  /**
   * Create a new lab result
   */  async create(
    request: CreateLabResultRequest,
    context: { userId: string; companyId: string }
  ): Promise<LabResult> {
    try {
      // Validar que el contexto tenga valores definidos
      if (!context.userId || !context.companyId) {
        throw new LabResultError(
          'User ID and Company ID are required in context',
          'INVALID_CONTEXT'
        );
      }

      const now = new Date().toISOString();
      const id = this.generateId();      // Construir labResult sin campos undefined (SOLUCIÓN OFICIAL FIREBASE)
      // Usar función helper para eliminar undefined automáticamente
      const labResult = this.removeUndefinedFields({
        id,
        patientId: (request as any).patientId,
        doctorId: context.userId,
        companyId: context.companyId,
        orderNumber: request.orderNumber,
        testName: request.testName,
        category: request.category,
        status: TestStatus.PENDING,
        priority: request.priority || Priority.NORMAL,
        accessLevel: request.accessLevel || AccessLevel.RESTRICTED,
        orderedAt: now,
        sampleCollectedAt: request.sampleCollectedAt, // Puede ser undefined
        clinicalNotes: request.clinicalNotes, // Puede ser undefined
        laboratory: request.laboratoryId ? {
          id: request.laboratoryId,
          name: 'Unknown Lab',
          address: '',
          accreditation: ''
        } : undefined, // Puede ser undefined
        metadata: {
          createdAt: now,
          updatedAt: now,
          createdBy: context.userId,
          version: 1
        }
      });      await this.db.collection(this.collectionName).doc(id).set(labResult);
      await this.createAuditLog(id, 'created', context.userId);

      return labResult as LabResult;
    } catch (error: unknown) {
      throw new LabResultError(
        `Failed to create lab result: ${error}`,
        'CREATE_FAILED'
      );
    }
  }

  /**
   * Find lab results by query filters
   */
  async findMany(
    filters: LabResultQueryFilters,
    context: { userId: string; companyId: string }
  ): Promise<{ results: LabResult[]; total: number }> {
    try {
      let query: any = this.db.collection(this.collectionName).where('companyId', '==', context.companyId);

      // Apply filters
      if ((filters as any).patientId) {
        query = (query as any).where('patientId', '==', (filters as any).patientId);
      }
      if ((filters as any).doctorId) {
        query = (query as any).where('doctorId', '==', (filters as any).doctorId);
      }
      if (filters.category) {
        query = (query as any).where('category', '==', filters.category);
      }
      if ((filters as any).status) {
        query = (query as any).where('status', '==', (filters as any).status);
      }
      if (filters.priority) {
        query = (query as any).where('priority', '==', filters.priority);
      }
      if (filters.orderNumber) {
        query = (query as any).where('orderNumber', '==', filters.orderNumber);
      }

      // Apply pagination
      const limit = Math.min(filters.limit || 50, 1000);
      const offset = filters.offset || 0;

      query = (query as any).orderBy('(metadata as any).createdAt', 'desc').limit(limit).offset(offset);

      const snapshot = await query.get();
      const results = snapshot.docs.map((doc: any) => doc.data() as LabResult);

      // Get total count for pagination
      const countQuery = this.db.collection(this.collectionName).where('companyId', '==', context.companyId);
      const countSnapshot = await countQuery.count().get();
      const total = countSnapshot.data().count;

      return { results, total };
    } catch (error: unknown) {
      throw new LabResultError(
        `Failed to query lab results: ${error}`,
        'QUERY_FAILED'
      );
    }
  }

  /**
   * Find lab result by ID
   */
  async findById(
    id: string,
    context: { userId: string; companyId: string }
  ): Promise<LabResult> {
    try {
      const doc = await this.db.collection(this.collectionName).doc(id).get();

      if (!doc.exists) {
        throw new LabResultNotFoundError(id);
      }

      const labResult = doc.data() as LabResult;

      // Verify company access
      if (labResult.companyId !== context.companyId) {
        throw new LabResultNotFoundError(id);
      }

      await this.createAuditLog(id, 'viewed', context.userId);
      return labResult;
    } catch (error: unknown) {
      if (error instanceof LabResultNotFoundError) {
        throw error;
      }
      throw new LabResultError(
        `Failed to find lab result: ${error}`,
        'FIND_FAILED'
      );
    }
  }

  /**
   * Update lab result
   */
  async update(
    request: UpdateLabResultRequest,
    context: { userId: string; companyId: string }
  ): Promise<LabResult> {
    try {
      const existing = await this.findById(request.id, context);
      const now = new Date().toISOString();

      const updates: Partial<LabResult> = {
        ...request,
        metadata: {
          ...existing.metadata,
          updatedAt: now,
          updatedBy: context.userId,
          version: existing.metadata.version + 1
        }
      };

      // Handle status transitions
      if ((request as any).status) {
        if (request.status === TestStatus.COMPLETED && !existing.reportedAt) {
          updates.reportedAt = request.reportedAt || now;
        }
        if (request.status === TestStatus.IN_PROGRESS && !existing.receivedAt) {
          updates.receivedAt = now;
        }
      }

      await this.db.collection(this.collectionName).doc(request.id).update(updates);
      await this.createAuditLog(request.id, 'updated', context.userId, {
        changes: this.calculateChanges(existing, updates)
      });

      return { ...existing, ...updates } as LabResult;
    } catch (error: unknown) {
      throw new LabResultError(
        `Failed to update lab result: ${error}`,
        'UPDATE_FAILED'
      );
    }
  }

  /**
   * Delete lab result
   */
  async delete(
    id: string,
    context: { userId: string; companyId: string }
  ): Promise<void> {
    try {
      const existing = await this.findById(id, context);

      await this.db.collection(this.collectionName).doc(id).delete();
      await this.createAuditLog(id, 'deleted', context.userId);
    } catch (error: unknown) {
      throw new LabResultError(
        `Failed to delete lab result: ${error}`,
        'DELETE_FAILED'
      );
    }
  }

  /**
   * Get lab result metrics
   */
  async getMetrics(companyId: string): Promise<LabResultMetrics> {
    try {
      const snapshot = await this.db
        .collection(this.collectionName)
        .where('companyId', '==', companyId)
        .get();

      const results = snapshot.docs.map((doc: any) => doc.data() as LabResult);

      return {
        totalTests: results.length,
        pendingTests: results.filter((r: any) => r.status === TestStatus.PENDING).length,
        completedTests: results.filter((r: any) => r.status === TestStatus.COMPLETED).length,
        averageProcessingTime: this.calculateAverageProcessingTime(results),
        testsByCategory: this.groupByCategory(results),
        testsByPriority: this.groupByPriority(results)
      };
    } catch (error: unknown) {
      throw new LabResultError(
        `Failed to get metrics: ${error}`,
        'METRICS_FAILED'
      );
    }
  }
  // Private helper methods
  private generateId(): string {
    return `lab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  /**
   * Remove undefined fields from object (FIREBASE OFFICIAL SOLUTION)
   * Firestore does not accept undefined values
   */
  private removeUndefinedFields<T>(obj: T): Partial<T> {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj as any)) {
      if (value !== undefined) {
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          // Recursively clean nested objects
          cleaned[key] = this.removeUndefinedFields(value);
        } else {
          cleaned[key] = value;
        }
      }
    }
    return cleaned as Partial<T>;
  }

  private async createAuditLog(
    labResultId: string,
    action: LabResultAuditLog['action'],
    userId: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    const auditLog: LabResultAuditLog = {
      id: this.generateId(),
      labResultId,
      action,
      userId,
      timestamp: new Date().toISOString(),
      metadata
    };

    await this.db.collection(this.auditCollectionName).doc(auditLog.id).set(auditLog);
  }

  private calculateChanges(existing: LabResult, updates: Partial<LabResult>): any[] {
    const changes: any[] = [];
    Object.keys(updates).forEach((key: any) => {
      if (key !== 'metadata' && (existing as any)[key] !== (updates as any)[key]) {
        changes.push({
          field: key,
          oldValue: (existing as any)[key],
          newValue: (updates as any)[key]
        });
      }
    });
    return changes;
  }

  private calculateAverageProcessingTime(results: LabResult[]): number {
    const completed = results.filter((r: any) => r.reportedAt && r.orderedAt);
    if (completed.length === 0) return 0;

    const totalTime = completed.reduce((sum, result) => {
      const ordered = new Date(result.orderedAt).getTime();
      const reported = new Date(result.reportedAt!).getTime();
      return sum + (reported - ordered);
    }, 0);

    return Math.round(totalTime / completed.length / (1000 * 60 * 60)); // Hours
  }

  private groupByCategory(results: LabResult[]): Record<TestCategory, number> {
    return results.reduce((acc, result) => {
      acc[result.category] = (acc[result.category] || 0) + 1;
      return acc;
    }, {} as Record<TestCategory, number>);
  }

  private groupByPriority(results: LabResult[]): Record<Priority, number> {
    return results.reduce((acc, result) => {
      acc[result.priority] = (acc[result.priority] || 0) + 1;
      return acc;
    }, {} as Record<Priority, number>);
  }
}