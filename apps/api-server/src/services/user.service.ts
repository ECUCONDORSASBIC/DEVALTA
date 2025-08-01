/**
 * 👤 USER SERVICE - ALTAMEDICA
 * Servicio para la gestión de usuarios.
 */
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { z } from 'zod';
import { BaseService, ServiceContext } from '@/lib/patterns/ServicePattern';

// Esquema de Zod para la actualización de un usuario.
// Solo se permiten ciertos campos para ser actualizados a través de la API.
export const UserUpdateSchema = z.object({
  firstName: z.string().min(2, "El nombre debe tener al menos 2 caracteres.").optional(),
  lastName: z.string().min(2, "El apellido debe tener al menos 2 caracteres.").optional(),
  phoneNumber: z.string().optional(),
  // Datos de perfil específicos según el rol
  profile: z.object({
    specialties: z.array(z.string()).optional(), // Para doctores
    title: z.string().optional(), // Para doctores/staff
    bio: z.string().optional(),
    avatarUrl: z.string().url().optional(),
  }).optional(),
});

// Esquema para cambios realizados por un administrador
export const AdminUserUpdateSchema = UserUpdateSchema.extend({
    role: z.enum(['patient', 'doctor', 'nurse', 'company', 'admin']).optional(),
    isActive: z.boolean().optional(),
});


export interface User {
  id: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  profile?: any;
}

class UserService extends BaseService<User> {
  protected collectionName = 'users';
  protected entitySchema = UserUpdateSchema; // Usado para la validación base

  async findById(id: string, context: ServiceContext): Promise<User | null> {
    // Un usuario solo puede ver su propio perfil, a menos que sea un admin.
    if (context.userRole !== 'admin' && context.userId !== id) {
      throw new Error('FORBIDDEN');
    }

    const doc = await adminDb.collection(this.collectionName).doc(id).get();
    if (!doc.exists) {
      return null;
    }

    const userData = doc.data();
    // Excluir datos sensibles antes de devolver
    const { passwordHash, ...safeUserData } = userData!;
    
    return { id: doc.id, ...safeUserData } as User;
  }

  async update(id: string, data: Partial<User>, context: ServiceContext): Promise<User> {
    let validatedData;
    // Determinar qué esquema de validación usar
    if (context.userRole === 'admin') {
        validatedData = AdminUserUpdateSchema.parse(data);
    } else {
        // Un usuario solo puede actualizar su propio perfil
        if (context.userId !== id) {
            throw new Error('FORBIDDEN');
        }
        validatedData = UserUpdateSchema.parse(data);
    }

    const userRef = adminDb.collection(this.collectionName).doc(id);
    if (!(await userRef.get()).exists) {
      throw new Error('NOT_FOUND');
    }

    const updatePayload = {
      ...validatedData,
      updatedAt: new Date(),
      updatedBy: context.userId,
    };

    await userRef.update(updatePayload);

    // Si el rol fue cambiado por un admin, actualizar también en Firebase Auth
    if (validatedData.role && context.userRole === 'admin') {
        await adminAuth.setCustomUserClaims(id, { role: validatedData.role });
    }

    await this.logAction('update', id, context, { updatedFields: Object.keys(validatedData) });

    return (await this.findById(id, context))!;
  }

  /**
   * Desactiva un usuario (borrado lógico).
   */
  async delete(id: string, context: ServiceContext): Promise<boolean> {
    // Solo un admin puede desactivar un usuario. Un usuario no puede eliminarse a sí mismo.
    if (context.userRole !== 'admin') {
      throw new Error('FORBIDDEN');
    }
    if (context.userId === id) {
        throw new Error('BAD_REQUEST: An admin cannot deactivate themselves.');
    }

    const userRef = adminDb.collection(this.collectionName).doc(id);
    if (!(await userRef.get()).exists) {
      return false;
    }

    // Desactivar en Firestore
    await userRef.update({
      isActive: false,
      updatedAt: new Date(),
      updatedBy: context.userId,
    });

    // Desactivar en Firebase Auth
    await adminAuth.updateUser(id, { disabled: true });

    await this.logAction('delete', id, context, { reason: 'deactivated by admin' });
    return true;
  }

  /**
   * Obtiene el perfil completo del usuario autenticado, incluyendo su perfil de rol.
   */
  async getMe(context: ServiceContext): Promise<User | null> {
    const userDoc = await adminDb.collection(this.collectionName).doc(context.userId).get();
    if (!userDoc.exists) {
      return null;
    }

    const userData = userDoc.data() as User;
    let roleProfile = null;

    // Colecciones de perfiles por rol
    const roleCollections: { [key: string]: string } = {
      doctor: 'doctors',
      patient: 'patients',
      company: 'companies',
      nurse: 'nurses',
    };

    const roleCollection = roleCollections[userData.role];
    if (roleCollection) {
      const roleDoc = await adminDb.collection(roleCollection).doc(context.userId).get();
      if (roleDoc.exists) {
        roleProfile = roleDoc.data();
      }
    }

    return {
      ...userData,
      id: userDoc.id,
      profile: roleProfile, // Añadir el perfil específico del rol
    };
  }

  // No implementados para este alcance
  async create(data: any, context: ServiceContext): Promise<User> {
    throw new Error("Method not implemented.");
  }
  async findMany(options: any, context: ServiceContext): Promise<any> {
    throw new Error("Method not implemented.");
  }
}

export const userService = new UserService();
