/**
 * 🧑‍⚕️ PATIENT SERVICE - ALTAMEDICA
 * Servicio para la gestión de la entidad de pacientes.
 */
import { adminDb } from '@/lib/firebase-admin';
import { z } from 'zod';
import { ServiceContext } from '@/lib/patterns/ServicePattern';
import { optimizedMedicalRecordService } from './OptimizedMedicalRecordService';

// Esquema para la creación de un paciente
export const CreatePatientSchema = z.object({
  userId: z.string().min(1, "El ID de usuario es requerido."),
  firstName: z.string().min(2, "El nombre es requerido."),
  lastName: z.string().min(2, "El apellido es requerido."),
  email: z.string().email("El email no es válido."),
  dateOfBirth: z.string().datetime("La fecha de nacimiento no es válida."),
  // ... otros campos relevantes del paciente
});

class PatientService {
  private collectionName = 'patients';

  /**
   * Obtiene todos los pacientes.
   * TODO: Implementar paginación y filtros.
   */
  async getAllPatients(context: ServiceContext): Promise<any[]> {
    // Solo doctores y admins pueden ver la lista de pacientes.
    if (context.userRole !== 'admin' && context.userRole !== 'doctor') {
      throw new Error('FORBIDDEN');
    }
    const snapshot = await adminDb.collection(this.collectionName).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  /**
   * Crea un nuevo paciente.
   */
  async createPatient(data: z.infer<typeof CreatePatientSchema>, context: ServiceContext): Promise<any> {
    // Solo doctores y admins pueden crear pacientes.
    if (context.userRole !== 'admin' && context.userRole !== 'doctor') {
      throw new Error('FORBIDDEN');
    }
    
    const patientPayload = {
      ...data,
      createdAt: new Date(),
      createdBy: context.userId,
    };

    const docRef = await adminDb.collection(this.collectionName).add(patientPayload);
    return { id: docRef.id, ...patientPayload };
  }

  /**
   * Obtiene todos los registros médicos de un paciente específico.
   */
  async getRecordsForPatient(patientId: string, options: any, context: ServiceContext): Promise<any> {
    // Permisos: El propio paciente, o un doctor/admin pueden ver los registros.
    if (context.userRole !== 'admin' && context.userRole !== 'doctor' && context.userId !== patientId) {
      throw new Error('FORBIDDEN');
    }

    // Reutilizamos el servicio optimizado, forzando el filtro por paciente.
    const queryOptions = {
      ...options,
      filters: {
        ...options.filters,
        patientId: patientId,
      }
    };
    
    return optimizedMedicalRecordService.findManyOptimized(queryOptions, context);
  }
}

export const patientService = new PatientService();
