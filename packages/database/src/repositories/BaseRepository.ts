/**
 * 🏥 BASE REPOSITORY - ALTAMEDICA
 * Repository Pattern base para todas las entidades con funciones CRUD optimizadas
 * Incluye auditoría HIPAA, validación Zod y manejo de errores robusto
 */

import { Firestore, DocumentData, QueryDocumentSnapshot, Query, WriteBatch } from 'firebase-admin/firestore';
import { z } from 'zod';
import { dbConnection } from '../core/DatabaseConnection.js';
import { v4 as uuidv4 } from 'uuid';

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy?: string;
  status: 'active' | 'inactive' | 'archived';
}

export interface ServiceContext {
  userId: string;
  userRole: 'patient' | 'doctor' | 'admin' | 'company';
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
}

export interface QueryOptions {
  limit?: number;
  offset?: number;
  cursor?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
  includeInactive?: boolean;
}

export interface RepositoryResult<T> {
  data: T[];
  total: number;
  hasMore: boolean;
  cursor?: string;
}

export abstract class BaseRepository<T extends BaseEntity> {
  protected abstract collectionName: string;
  protected abstract entitySchema: z.ZodSchema<any>;
  protected firestore: Firestore | null = null;

  constructor() {
    this.initializeFirestore();
  }

  private async initializeFirestore(): Promise<void> {
    this.firestore = await dbConnection.getFirestore();
    if (!this.firestore) {
      throw new Error(`Failed to initialize Firestore for ${this.constructor.name}`);
    }
  }

  /**
   * Asegura que Firestore esté inicializado
   */
  protected async ensureFirestore(): Promise<Firestore> {
    if (!this.firestore) {
      await this.initializeFirestore();
    }
    if (!this.firestore) {
      throw new Error('Firestore is not available');
    }
    return this.firestore;
  }

  /**
   * Valida los datos de entrada usando el schema Zod
   */
  protected validateData(data: any, isPartial: boolean = false): any {
    const startTime = Date.now();
    
    try {
      const schema = isPartial && 'partial' in this.entitySchema 
        ? (this.entitySchema as any).partial() 
        : this.entitySchema;
      const validatedData = schema.parse(data);
      
      const duration = Date.now() - startTime;
      dbConnection.recordQuery(`validate_${this.collectionName}`, duration, true);
      
      return validatedData;
    } catch (error) {
      const duration = Date.now() - startTime;
      dbConnection.recordQuery(`validate_${this.collectionName}`, duration, false);
      
      if (error instanceof z.ZodError) {
        throw new Error(`Validation failed: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`);
      }
      throw error;
    }
  }

  /**
   * Registra acciones para auditoría HIPAA
   */
  protected async logAudit(action: string, entityId: string, context: ServiceContext, metadata?: any): Promise<void> {
    const db = await this.ensureFirestore();
    
    try {
      await db.collection('audit_logs').add({
        action,
        entityType: this.collectionName,
        entityId,
        userId: context.userId,
        userRole: context.userRole,
        ipAddress: context.ipAddress || 'unknown',
        userAgent: context.userAgent || 'unknown',
        sessionId: context.sessionId || uuidv4(),
        timestamp: new Date(),
        metadata: metadata || {},
        environment: process.env.NODE_ENV || 'development'
      });
    } catch (error) {
      console.error('Failed to log audit entry:', error);
      // No lanzar error para no interferir con la operación principal
    }
  }

  /**
   * Convierte DocumentSnapshot a entidad tipada
   */
  protected documentToEntity(doc: QueryDocumentSnapshot<DocumentData>): T {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date()
    } as T;
  }

  /**
   * Crea una nueva entidad
   */
  public async create(data: Omit<T, keyof BaseEntity>, context: ServiceContext): Promise<T> {
    const startTime = Date.now();
    const db = await this.ensureFirestore();

    try {
      const validatedData = this.validateData(data);
      
      const newEntity = {
        ...validatedData,
        id: uuidv4(),
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: context.userId,
        status: 'active'
      };

      const docRef = db.collection(this.collectionName).doc(newEntity.id);
      await docRef.set(newEntity);

      await this.logAudit('create', newEntity.id, context, { 
        fields: Object.keys(validatedData) 
      });

      const duration = Date.now() - startTime;
      dbConnection.recordQuery(`create_${this.collectionName}`, duration, true);

      return newEntity as T;
    } catch (error) {
      const duration = Date.now() - startTime;
      dbConnection.recordQuery(`create_${this.collectionName}`, duration, false);
      throw error;
    }
  }

  /**
   * Encuentra una entidad por ID
   */
  public async findById(id: string, context: ServiceContext): Promise<T | null> {
    const startTime = Date.now();
    const db = await this.ensureFirestore();

    try {
      const docRef = db.collection(this.collectionName).doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        const duration = Date.now() - startTime;
        dbConnection.recordQuery(`findById_${this.collectionName}`, duration, true);
        return null;
      }

      const entity = this.documentToEntity(doc as QueryDocumentSnapshot<DocumentData>);
      
      await this.logAudit('read', id, context);

      const duration = Date.now() - startTime;
      dbConnection.recordQuery(`findById_${this.collectionName}`, duration, true);

      return entity;
    } catch (error) {
      const duration = Date.now() - startTime;
      dbConnection.recordQuery(`findById_${this.collectionName}`, duration, false);
      throw error;
    }
  }

  /**
   * Encuentra múltiples entidades con paginación y filtros
   */
  public async findMany(options: QueryOptions = {}, context: ServiceContext): Promise<RepositoryResult<T>> {
    const startTime = Date.now();
    const db = await this.ensureFirestore();

    try {
      let query = db.collection(this.collectionName) as Query<DocumentData>;

      // Aplicar filtros
      if (options.filters) {
        Object.entries(options.filters).forEach(([field, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            if (Array.isArray(value)) {
              query = query.where(field, 'in', value);
            } else {
              query = query.where(field, '==', value);
            }
          }
        });
      }

      // Excluir inactivos por defecto
      if (!options.includeInactive) {
        query = query.where('status', '!=', 'archived');
      }

      // Ordenamiento
      const sortBy = options.sortBy || 'createdAt';
      const sortOrder = options.sortOrder || 'desc';
      query = query.orderBy(sortBy, sortOrder);

      // Cursor para paginación
      if (options.cursor) {
        const cursorDoc = await db.collection(this.collectionName).doc(options.cursor).get();
        if (cursorDoc.exists) {
          query = query.startAfter(cursorDoc);
        }
      }

      // Límite
      const limit = Math.min(options.limit || 50, 100); // Máximo 100 elementos
      query = query.limit(limit + 1); // +1 para saber si hay más

      const snapshot = await query.get();
      const docs = snapshot.docs;
      
      const hasMore = docs.length > limit;
      const data = docs.slice(0, limit).map(doc => this.documentToEntity(doc));
      const cursor = hasMore ? docs[limit - 1].id : undefined;

      // Contar total (solo para la primera página)
      let total = data.length;
      if (!options.cursor && !options.offset) {
        const countQuery = db.collection(this.collectionName);
        const countSnapshot = await countQuery.count().get();
        total = countSnapshot.data().count;
      }

      await this.logAudit('read_many', 'collection', context, {
        count: data.length,
        filters: options.filters,
        limit: options.limit
      });

      const duration = Date.now() - startTime;
      dbConnection.recordQuery(`findMany_${this.collectionName}`, duration, true);

      return {
        data,
        total,
        hasMore,
        cursor
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      dbConnection.recordQuery(`findMany_${this.collectionName}`, duration, false);
      throw error;
    }
  }

  /**
   * Actualiza una entidad existente
   */
  public async update(id: string, data: Partial<Omit<T, keyof BaseEntity>>, context: ServiceContext): Promise<T | null> {
    const startTime = Date.now();
    const db = await this.ensureFirestore();

    try {
      const validatedData = this.validateData(data, true);
      
      const docRef = db.collection(this.collectionName).doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        const duration = Date.now() - startTime;
        dbConnection.recordQuery(`update_${this.collectionName}`, duration, true);
        return null;
      }

      const updatePayload = {
        ...validatedData,
        updatedAt: new Date(),
        updatedBy: context.userId
      };

      await docRef.update(updatePayload);

      await this.logAudit('update', id, context, {
        updatedFields: Object.keys(validatedData)
      });

      const duration = Date.now() - startTime;
      dbConnection.recordQuery(`update_${this.collectionName}`, duration, true);

      // Retornar la entidad actualizada
      return await this.findById(id, context);
    } catch (error) {
      const duration = Date.now() - startTime;
      dbConnection.recordQuery(`update_${this.collectionName}`, duration, false);
      throw error;
    }
  }

  /**
   * Elimina una entidad (borrado lógico)
   */
  public async delete(id: string, context: ServiceContext): Promise<boolean> {
    const startTime = Date.now();
    const db = await this.ensureFirestore();

    try {
      const docRef = db.collection(this.collectionName).doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        const duration = Date.now() - startTime;
        dbConnection.recordQuery(`delete_${this.collectionName}`, duration, true);
        return false;
      }

      // Borrado lógico
      await docRef.update({
        status: 'archived',
        updatedAt: new Date(),
        updatedBy: context.userId
      });

      await this.logAudit('delete', id, context);

      const duration = Date.now() - startTime;
      dbConnection.recordQuery(`delete_${this.collectionName}`, duration, true);

      return true;
    } catch (error) {
      const duration = Date.now() - startTime;
      dbConnection.recordQuery(`delete_${this.collectionName}`, duration, false);
      throw error;
    }
  }

  /**
   * Operaciones en lote para mejor rendimiento
   */
  public async batchOperations(operations: {
    type: 'create' | 'update' | 'delete';
    id?: string;
    data?: any;
  }[], context: ServiceContext): Promise<{ success: boolean; errors: string[] }> {
    const startTime = Date.now();
    const db = await this.ensureFirestore();
    const errors: string[] = [];

    try {
      const batch = db.batch();

      for (const [index, operation] of operations.entries()) {
        try {
          const docRef = operation.id 
            ? db.collection(this.collectionName).doc(operation.id)
            : db.collection(this.collectionName).doc();

          switch (operation.type) {
            case 'create':
              const validatedCreateData = this.validateData(operation.data);
              batch.set(docRef, {
                ...validatedCreateData,
                id: docRef.id,
                createdAt: new Date(),
                updatedAt: new Date(),
                createdBy: context.userId,
                status: 'active'
              });
              break;

            case 'update':
              const validatedUpdateData = this.validateData(operation.data, true);
              batch.update(docRef, {
                ...validatedUpdateData,
                updatedAt: new Date(),
                updatedBy: context.userId
              });
              break;

            case 'delete':
              batch.update(docRef, {
                status: 'archived',
                updatedAt: new Date(),
                updatedBy: context.userId
              });
              break;
          }
        } catch (error) {
          errors.push(`Operation ${index}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      if (errors.length === 0) {
        await batch.commit();
        
        await this.logAudit('batch_operation', 'multiple', context, {
          operationsCount: operations.length,
          types: operations.map(op => op.type)
        });
      }

      const duration = Date.now() - startTime;
      dbConnection.recordQuery(`batch_${this.collectionName}`, duration, errors.length === 0);

      return {
        success: errors.length === 0,
        errors
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      dbConnection.recordQuery(`batch_${this.collectionName}`, duration, false);
      
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Batch operation failed']
      };
    }
  }

  /**
   * Cuenta documentos con filtros
   */
  public async count(filters?: Record<string, any>): Promise<number> {
    const startTime = Date.now();
    const db = await this.ensureFirestore();

    try {
      let query: Query<DocumentData> = db.collection(this.collectionName);

      if (filters) {
        Object.entries(filters).forEach(([field, value]) => {
          if (value !== undefined && value !== null) {
            query = query.where(field, '==', value);
          }
        });
      }

      const countSnapshot = await query.count().get();
      const count = countSnapshot.data().count;

      const duration = Date.now() - startTime;
      dbConnection.recordQuery(`count_${this.collectionName}`, duration, true);

      return count;
    } catch (error) {
      const duration = Date.now() - startTime;
      dbConnection.recordQuery(`count_${this.collectionName}`, duration, false);
      throw error;
    }
  }
}