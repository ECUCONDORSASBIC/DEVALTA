/**
 * 👥 USER SERVICE - ALTAMEDICA
 * Implementación del Service Pattern para gestión de usuarios
 * Ejemplo de referencia para todos los servicios
 */

import { adminDb } from '@/lib/firebase-admin';
import { z } from 'zod';
import { BaseService, BaseEntity, ServiceContext, QueryOptions, ServiceResponse } from '@/lib/patterns/ServicePattern';

// User entity schema
export const UserSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  role: z.enum(['admin', 'doctor', 'patient', 'company', 'nurse']),
  phoneNumber: z.string().optional(),
  isActive: z.boolean().default(true),
  emailVerified: z.boolean().default(false),
  companyId: z.string().optional(),
  profile: z.object({
    avatar: z.string().optional(),
    bio: z.string().optional(),
    specialties: z.array(z.string()).optional(),
    languages: z.array(z.string()).optional(),
    timezone: z.string().optional()
  }).optional(),
  settings: z.object({
    notifications: z.object({
      email: z.boolean().default(true),
      push: z.boolean().default(true),
      sms: z.boolean().default(false)
    }).optional(),
    privacy: z.object({
      profileVisible: z.boolean().default(true),
      shareData: z.boolean().default(false)
    }).optional()
  }).optional(),
  metadata: z.object({
    lastSignIn: z.date().optional(),
    signInCount: z.number().default(0),
    lastIP: z.string().optional(),
    lastUserAgent: z.string().optional(),
    createdFrom: z.string().optional()
  }).optional()
});

export interface User extends BaseEntity {
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'doctor' | 'patient' | 'company' | 'nurse';
  phoneNumber?: string;
  isActive: boolean;
  emailVerified: boolean;
  companyId?: string;
  profile?: {
    avatar?: string;
    bio?: string;
    specialties?: string[];
    languages?: string[];
    timezone?: string;
  };
  settings?: {
    notifications?: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    privacy?: {
      profileVisible: boolean;
      shareData: boolean;
    };
  };
  metadata?: {
    lastSignIn?: Date;
    signInCount: number;
    lastIP?: string;
    lastUserAgent?: string;
    createdFrom?: string;
  };
}

export class UserService extends BaseService<User> {
  protected collectionName = 'users';
  protected entitySchema = UserSchema;

  async create(data: Omit<User, keyof BaseEntity>, context: ServiceContext): Promise<User> {
    // Check if user already exists
    const existingUser = await this.findByEmail(data.email);
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Validate permissions
    if (!this.checkPermission(context, 'create')) {
      throw new Error('Insufficient permissions to create user');
    }

    const now = new Date();
    const newUser: User = {
      ...data,
      id: '', // Will be set by Firestore
      createdAt: now,
      updatedAt: now,
      createdBy: context.userId,
      metadata: {
        ...data.metadata,
        signInCount: 0,
        createdFrom: 'api'
      }
    };

    try {
      const docRef = await adminDb.collection(this.collectionName).add({
        ...newUser,
        id: undefined // Remove id field for Firestore
      });

      const createdUser = { ...newUser, id: docRef.id };

      // Log action
      await this.logAction('create', docRef.id, context, {
        userRole: data.role,
        companyId: data.companyId
      });

      return createdUser;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async findById(id: string, context: ServiceContext): Promise<User | null> {
    try {
      const doc = await adminDb.collection(this.collectionName).doc(id).get();
      
      if (!doc.exists) {
        return null;
      }

      const userData = doc.data()!;
      
      // Check if user can access this record
      if (!this.canAccessUser(id, context)) {
        throw new Error('Insufficient permissions to access this user');
      }

      return {
        id: doc.id,
        ...userData,
        createdAt: userData.createdAt?.toDate() || userData.createdAt,
        updatedAt: userData.updatedAt?.toDate() || userData.updatedAt,
        metadata: {
          ...userData.metadata,
          lastSignIn: userData.metadata?.lastSignIn?.toDate() || userData.metadata?.lastSignIn
        }
      } as User;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  }

  async findMany(options: QueryOptions, context: ServiceContext): Promise<ServiceResponse<User[]>> {
    const query = this.buildQuery(options);

    try {
      let firestoreQuery: any = adminDb.collection(this.collectionName);

      // Apply role-based filtering
      if (context.userRole !== 'admin') {
        if (context.userRole === 'company' && context.companyId) {
          firestoreQuery = firestoreQuery.where('companyId', '==', context.companyId);
        } else if (context.userRole === 'doctor') {
          // Doctors can only see patients and other doctors in their company
          firestoreQuery = firestoreQuery.where('role', 'in', ['patient', 'doctor']);
          if (context.companyId) {
            firestoreQuery = firestoreQuery.where('companyId', '==', context.companyId);
          }
        } else {
          // Patients and others can only see their own record
          firestoreQuery = firestoreQuery.where('id', '==', context.userId);
        }
      }

      // Apply filters
      Object.entries(query.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          firestoreQuery = firestoreQuery.where(key, '==', value);
        }
      });

      // Apply sorting
      firestoreQuery = firestoreQuery.orderBy(query.sortBy, query.sortOrder);

      // Get total count
      const totalSnapshot = await firestoreQuery.get();
      const total = totalSnapshot.size;

      // Apply pagination
      const paginatedQuery = firestoreQuery.offset(query.offset).limit(query.limit);
      const snapshot = await paginatedQuery.get();

      const users: User[] = [];
      for (const doc of snapshot.docs) {
        const userData = doc.data();
        users.push({
          id: doc.id,
          ...userData,
          createdAt: userData.createdAt?.toDate() || userData.createdAt,
          updatedAt: userData.updatedAt?.toDate() || userData.updatedAt,
          metadata: {
            ...userData.metadata,
            lastSignIn: userData.metadata?.lastSignIn?.toDate() || userData.metadata?.lastSignIn
          }
        } as User);
      }

      return {
        data: users,
        total,
        page: query.page,
        limit: query.limit,
        hasNext: query.offset + query.limit < total,
        hasPrev: query.page > 1
      };
    } catch (error) {
      console.error('Error finding users:', error);
      throw error;
    }
  }

  async update(id: string, data: Partial<User>, context: ServiceContext): Promise<User> {
    // Check if user exists
    const existingUser = await this.findById(id, context);
    if (!existingUser) {
      throw new Error('User not found');
    }

    // Check permissions
    if (!this.canAccessUser(id, context) || !this.checkPermission(context, 'update')) {
      throw new Error('Insufficient permissions to update this user');
    }

    // Prevent role changes unless admin
    if (data.role && context.userRole !== 'admin') {
      throw new Error('Only admins can change user roles');
    }

    const updateData = {
      ...data,
      updatedAt: new Date(),
      updatedBy: context.userId
    };

    try {
      await adminDb.collection(this.collectionName).doc(id).update(updateData);

      // Get updated user
      const updatedUser = await this.findById(id, context);
      if (!updatedUser) {
        throw new Error('Failed to retrieve updated user');
      }

      // Log action
      await this.logAction('update', id, context, {
        updatedFields: Object.keys(data)
      });

      return updatedUser;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async delete(id: string, context: ServiceContext): Promise<boolean> {
    // Check if user exists
    const existingUser = await this.findById(id, context);
    if (!existingUser) {
      return false;
    }

    // Check permissions (only admins can delete users)
    if (context.userRole !== 'admin') {
      throw new Error('Only admins can delete users');
    }

    try {
      // Soft delete by marking as inactive
      await adminDb.collection(this.collectionName).doc(id).update({
        isActive: false,
        deletedAt: new Date(),
        deletedBy: context.userId,
        updatedAt: new Date()
      });

      // Log action
      await this.logAction('delete', id, context);

      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  // Additional methods specific to User service

  async findByEmail(email: string): Promise<User | null> {
    try {
      const snapshot = await adminDb.collection(this.collectionName)
        .where('email', '==', email)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      const userData = doc.data();

      return {
        id: doc.id,
        ...userData,
        createdAt: userData.createdAt?.toDate() || userData.createdAt,
        updatedAt: userData.updatedAt?.toDate() || userData.updatedAt,
        metadata: {
          ...userData.metadata,
          lastSignIn: userData.metadata?.lastSignIn?.toDate() || userData.metadata?.lastSignIn
        }
      } as User;
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }

  async updateLastSignIn(userId: string, ipAddress?: string, userAgent?: string): Promise<void> {
    try {
      const updateData: any = {
        'metadata.lastSignIn': new Date(),
        'metadata.lastIP': ipAddress,
        'metadata.lastUserAgent': userAgent,
        'metadata.signInCount': adminDb.FieldValue.increment(1),
        updatedAt: new Date()
      };

      await adminDb.collection(this.collectionName).doc(userId).update(updateData);
    } catch (error) {
      console.error('Error updating last sign in:', error);
      throw error;
    }
  }

  async findByRole(role: string, context: ServiceContext): Promise<User[]> {
    if (!this.checkPermission(context, 'read')) {
      throw new Error('Insufficient permissions to read users');
    }

    try {
      let query: any = adminDb.collection(this.collectionName).where('role', '==', role);

      // Apply company filtering if not admin
      if (context.userRole !== 'admin' && context.companyId) {
        query = query.where('companyId', '==', context.companyId);
      }

      const snapshot = await query.get();
      const users: User[] = [];

      for (const doc of snapshot.docs) {
        const userData = doc.data();
        users.push({
          id: doc.id,
          ...userData,
          createdAt: userData.createdAt?.toDate() || userData.createdAt,
          updatedAt: userData.updatedAt?.toDate() || userData.updatedAt,
          metadata: {
            ...userData.metadata,
            lastSignIn: userData.metadata?.lastSignIn?.toDate() || userData.metadata?.lastSignIn
          }
        } as User);
      }

      return users;
    } catch (error) {
      console.error('Error finding users by role:', error);
      throw error;
    }
  }

  // Helper method to check if user can access another user's data
  private canAccessUser(targetUserId: string, context: ServiceContext): boolean {
    // Admins can access all users
    if (context.userRole === 'admin') {
      return true;
    }

    // Users can access their own data
    if (context.userId === targetUserId) {
      return true;
    }

    // Company admins can access users in their company
    if (context.userRole === 'company' && context.companyId) {
      // This would require checking if target user belongs to same company
      // For now, we'll allow it - in production, add proper check
      return true;
    }

    // Doctors can access their patients (requires additional logic)
    if (context.userRole === 'doctor') {
      // This would require checking doctor-patient relationships
      // For now, we'll allow read access - implement proper relationship check in production
      return true;
    }

    return false;
  }
}