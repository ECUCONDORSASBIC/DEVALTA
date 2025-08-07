/**
 * 🔄 DATABASE COMPATIBILITY LAYER - ALTAMEDICA
 * Capa de compatibilidad para migrar de database local a @altamedica/database
 * Este archivo proporcionaa un wrapper temporal mientras se migra todo el código
 */

import { 
  initializeAltaMedicaDatabase, 
  dbConnection,
  patientRepository,
  doctorRepository,
  appointmentRepository,
  medicalRecordRepository,
  type Patient,
  type Doctor,
  type Appointment,
  type MedicalRecord
} from '@altamedica/database';

// Inicializar la base de datos centralizada
let initialized = false;

async function ensureInitialized() {
  if (!initialized) {
    await initializeAltaMedicaDatabase();
    initialized = true;
  }
}

/**
 * Capa de compatibilidad para patientsDb
 * Mapea las funciones del sistema anterior a los nuevos repositorios
 */
export const patientsDb = {
  async create(patientData: any) {
    await ensureInitialized();
    const result = await patientRepository.create(patientData);
    if (!result.success) {
      throw new Error(result.error || 'Error creating patient');
    }
    return result.data;
  },

  async findById(id: string) {
    await ensureInitialized();
    const result = await patientRepository.findById(id);
    if (!result.success) {
      throw new Error(result.error || 'Error finding patient');
    }
    return result.data;
  },

  async findByEmail(email: string) {
    await ensureInitialized();
    const result = await patientRepository.findByEmail(email);
    if (!result.success) {
      throw new Error(result.error || 'Error finding patient by email');
    }
    return result.data;
  },

  async update(id: string, updateData: any) {
    await ensureInitialized();
    const result = await patientRepository.update(id, updateData);
    if (!result.success) {
      throw new Error(result.error || 'Error updating patient');
    }
    return result.data;
  },

  async delete(id: string) {
    await ensureInitialized();
    const result = await patientRepository.delete(id);
    if (!result.success) {
      throw new Error(result.error || 'Error deleting patient');
    }
    return true;
  },

  async search(filters: any) {
    await ensureInitialized();
    // Para búsquedas complejas, usar findMany con filtros básicos
    const result = await patientRepository.findMany({}, { limit: filters.limit || 20 });
    if (!result.success) {
      throw new Error(result.error || 'Error searching patients');
    }
    return {
      patients: result.data || [],
      total: result.data?.length || 0,
      page: filters.page || 1,
      limit: filters.limit || 20
    };
  }
};

/**
 * Capa de compatibilidad para doctorsDb
 */
export const doctorsDb = {
  async create(doctorData: any) {
    await ensureInitialized();
    const result = await doctorRepository.create(doctorData);
    if (!result.success) {
      throw new Error(result.error || 'Error creating doctor');
    }
    return result.data;
  },

  async findById(id: string) {
    await ensureInitialized();
    const result = await doctorRepository.findById(id);
    if (!result.success) {
      throw new Error(result.error || 'Error finding doctor');
    }
    return result.data;
  },

  async findBySpecialty(specialty: string) {
    await ensureInitialized();
    const result = await doctorRepository.findBySpecialty(specialty);
    if (!result.success) {
      throw new Error(result.error || 'Error finding doctors by specialty');
    }
    return result.data || [];
  },

  async update(id: string, updateData: any) {
    await ensureInitialized();
    const result = await doctorRepository.update(id, updateData);
    if (!result.success) {
      throw new Error(result.error || 'Error updating doctor');
    }
    return result.data;
  }
};

/**
 * Capa de compatibilidad para appointmentsDb
 */
export const appointmentsDb = {
  async create(appointmentData: any) {
    await ensureInitialized();
    const result = await appointmentRepository.createWithAppointmentNumber(appointmentData);
    if (!result.success) {
      throw new Error(result.error || 'Error creating appointment');
    }
    return result.data;
  },

  async findById(id: string) {
    await ensureInitialized();
    const result = await appointmentRepository.findById(id);
    if (!result.success) {
      throw new Error(result.error || 'Error finding appointment');
    }
    return result.data;
  },

  async findByPatient(patientId: string, filters?: any) {
    await ensureInitialized();
    const result = await appointmentRepository.findByPatient(patientId, filters);
    if (!result.success) {
      throw new Error(result.error || 'Error finding appointments by patient');
    }
    return result.data || [];
  },

  async findByDoctor(doctorId: string, filters?: any) {
    await ensureInitialized();
    const result = await appointmentRepository.findByDoctor(doctorId, filters);
    if (!result.success) {
      throw new Error(result.error || 'Error finding appointments by doctor');
    }
    return result.data || [];
  },

  async update(id: string, updateData: any) {
    await ensureInitialized();
    const result = await appointmentRepository.update(id, updateData);
    if (!result.success) {
      throw new Error(result.error || 'Error updating appointment');
    }
    return result.data;
  }
};

/**
 * Capa de compatibilidad para medicalRecordsDb
 */
export const medicalRecordsDb = {
  async create(recordData: any) {
    await ensureInitialized();
    const result = await medicalRecordRepository.create(recordData);
    if (!result.success) {
      throw new Error(result.error || 'Error creating medical record');
    }
    return result.data;
  },

  async findByPatient(patientId: string) {
    await ensureInitialized();
    const result = await medicalRecordRepository.findByPatientId(patientId);
    if (!result.success) {
      throw new Error(result.error || 'Error finding medical records by patient');
    }
    return result.data || [];
  },

  async findById(id: string) {
    await ensureInitialized();
    const result = await medicalRecordRepository.findById(id);
    if (!result.success) {
      throw new Error(result.error || 'Error finding medical record');
    }
    return result.data;
  }
};

/**
 * Funciones de inicialización y utilidades
 */
export async function initializeDatabase(): Promise<void> {
  console.log('🔄 Inicializando base de datos (usando @altamedica/database)...');
  
  try {
    await initializeAltaMedicaDatabase();
    initialized = true;
    console.log('✅ Base de datos inicializada correctamente');
  } catch (error) {
    console.error('❌ Error inicializando base de datos:', error);
    throw error;
  }
}

export async function closeDatabase(): Promise<void> {
  // La conexión de @altamedica/database maneja su propio ciclo de vida
  console.log('✅ Conexión de base de datos cerrada (centralizada)');
}

export function getDatabaseConnection() {
  return dbConnection;
}

// Export por defecto con compatibilidad
export default {
  patients: patientsDb,
  doctors: doctorsDb,
  appointments: appointmentsDb,
  medicalRecords: medicalRecordsDb,
  initialize: initializeDatabase,
  close: closeDatabase,
  connection: getDatabaseConnection
};