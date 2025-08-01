/**
 * 🔐 AUTH SERVICE - ALTAMEDICA
 * Servicio para la gestión de autenticación y registro de usuarios.
 */
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { z } from 'zod';
import { ServiceContext } from '@/lib/patterns/ServicePattern';

// Esquema para el registro de un nuevo usuario
export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
  role: z.enum(['patient', 'doctor', 'company']),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  // Campos específicos del rol
  specialties: z.array(z.string()).optional(), // Doctor
  licenseNumber: z.string().optional(), // Doctor
  companyName: z.string().optional(), // Company
});

class AuthService {
  /**
   * Registra un nuevo usuario en Firebase Auth y crea su perfil en Firestore.
   */
  async registerUser(data: z.infer<typeof RegisterSchema>): Promise<any> {
    const { email, password, role, firstName, lastName, ...profileData } = data;

    // 1. Crear usuario en Firebase Authentication
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: `${firstName} ${lastName}`,
      disabled: false,
    });

    // 2. Asignar custom claim para el rol
    await adminAuth.setCustomUserClaims(userRecord.uid, { role });

    // 3. Crear perfil de usuario base en Firestore
    const userProfile = {
      uid: userRecord.uid,
      email,
      role,
      firstName,
      lastName,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await adminDb.collection('users').doc(userRecord.uid).set(userProfile);

    // 4. Crear perfil específico del rol (doctor, paciente, etc.)
    const roleProfilePayload: any = {
        userId: userRecord.uid,
        email,
        firstName,
        lastName,
        createdAt: new Date(),
    };

    if (role === 'doctor') {
        roleProfilePayload.specialties = profileData.specialties || [];
        roleProfilePayload.licenseNumber = profileData.licenseNumber;
        await adminDb.collection('doctors').doc(userRecord.uid).set(roleProfilePayload);
    } else if (role === 'patient') {
        // Añadir campos específicos de paciente si los hubiera
        await adminDb.collection('patients').doc(userRecord.uid).set(roleProfilePayload);
    } else if (role === 'company') {
        roleProfilePayload.name = profileData.companyName;
        await adminDb.collection('companies').doc(userRecord.uid).set(roleProfilePayload);
    }
    
    // 5. Devolver el perfil de usuario creado
    return { uid: userRecord.uid, ...userProfile };
  }
}

export const authService = new AuthService();
