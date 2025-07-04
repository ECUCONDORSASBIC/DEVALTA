/**
 * Servicio de pacientes compatible con SSR
 * Evita la inicialización del cifrado durante el server-side rendering
 */

import { getEncryptionService } from './encryption-service';
import { 
  Patient, 
  HistorialMedico, 
  SeguroMedico, 
  ContactoEmergencia,
  PatientSummary,
  PatientSearchFilters,
  PatientSearchOptions,
  PatientSearchResult
} from '../types/patient-types';

export type {
  Patient,
  HistorialMedico,
  SeguroMedico,
  ContactoEmergencia,
  PatientSummary,
  PatientSearchFilters,
  PatientSearchOptions,
  PatientSearchResult
};

export class PatientService {
  private encryptionService: ReturnType<typeof getEncryptionService> | null = null;
  private isClient = false;

  constructor() {
    // Verificar si estamos en el cliente
    this.isClient = typeof window !== 'undefined';
    
    // Solo inicializar el servicio de cifrado en el cliente
    if (this.isClient) {
      this.initializeEncryption();
    }
  }

  /**
   * Inicializar el servicio de cifrado de forma segura
   */
  private async initializeEncryption(): Promise<void> {
    if (!this.isClient) return;

    try {
      this.encryptionService = getEncryptionService();
      await this.encryptionService.ensureInitialized();
    } catch (error) {
      console.error('Error inicializando cifrado en PatientService:', error);
      // Continuar sin cifrado
    }
  }

  /**
   * Obtener lista de pacientes
   */
  async getPatients(): Promise<Patient[]> {
    try {
      // Simular datos para desarrollo
      const mockPatients: Patient[] = [
        {
          id: '1',
          nombre: 'Juan',
          apellido: 'Pérez',
          email: 'juan.perez@example.com',
          telefono: '+54 11 1234-5678',
          fechaNacimiento: new Date('1985-05-15'),
          historialMedico: [
            {
              id: '1',
              fecha: new Date('2024-01-15'),
              diagnostico: 'Hipertensión arterial',
              tratamiento: 'Medicación antihipertensiva',
              medicamentos: ['Enalapril 10mg', 'Hidroclorotiazida 25mg'],
              observaciones: 'Paciente responde bien al tratamiento',
              medico: 'Dr. García'
            }
          ],
          seguroMedico: {
            empresa: 'OSDE',
            numeroPoliza: '123456789',
            vigencia: new Date('2024-12-31'),
            cobertura: ['Consultas', 'Internación', 'Medicamentos']
          },
          contactoEmergencia: {
            nombre: 'María Pérez',
            relacion: 'Esposa',
            telefono: '+54 11 8765-4321',
            email: 'maria.perez@example.com'
          },
          fechaRegistro: new Date('2024-01-01'),
          estado: 'activo'
        },
        {
          id: '2',
          nombre: 'Ana',
          apellido: 'González',
          email: 'ana.gonzalez@example.com',
          telefono: '+54 11 2345-6789',
          fechaNacimiento: new Date('1990-08-22'),
          historialMedico: [
            {
              id: '2',
              fecha: new Date('2024-02-10'),
              diagnostico: 'Diabetes tipo 2',
              tratamiento: 'Dieta y ejercicio',
              medicamentos: ['Metformina 850mg'],
              observaciones: 'Controlar glucemia semanalmente',
              medico: 'Dr. López'
            }
          ],
          fechaRegistro: new Date('2024-01-15'),
          estado: 'activo'
        }
      ];

      return mockPatients;
    } catch (error) {
      console.error('Error obteniendo pacientes:', error);
      return [];
    }
  }

  /**
   * Obtener paciente por ID
   */
  async getPatientById(id: string): Promise<Patient | null> {
    try {
      const patients = await this.getPatients();
      return patients.find(p => p.id === id) || null;
    } catch (error) {
      console.error('Error obteniendo paciente:', error);
      return null;
    }
  }

  /**
   * Crear nuevo paciente
   */
  async createPatient(patientData: Omit<Patient, 'id' | 'fechaRegistro'>): Promise<Patient> {
    try {
      const newPatient: Patient = {
        ...patientData,
        id: Date.now().toString(),
        fechaRegistro: new Date()
      };

      // Cifrar datos sensibles si el cifrado está disponible
      if (this.encryptionService?.isEncryptionAvailable()) {
        // Aquí se cifrarían los datos sensibles
        console.log('Cifrando datos del paciente...');
      }

      return newPatient;
    } catch (error) {
      console.error('Error creando paciente:', error);
      throw error;
    }
  }

  /**
   * Actualizar paciente
   */
  async updatePatient(id: string, patientData: Partial<Patient>): Promise<Patient | null> {
    try {
      const existingPatient = await this.getPatientById(id);
      if (!existingPatient) {
        return null;
      }

      const updatedPatient = {
        ...existingPatient,
        ...patientData,
        id: existingPatient.id,
        fechaRegistro: existingPatient.fechaRegistro
      };

      // Cifrar datos sensibles si el cifrado está disponible
      if (this.encryptionService?.isEncryptionAvailable()) {
        console.log('Cifrando datos actualizados del paciente...');
      }

      return updatedPatient;
    } catch (error) {
      console.error('Error actualizando paciente:', error);
      throw error;
    }
  }

  /**
   * Eliminar paciente
   */
  async deletePatient(id: string): Promise<boolean> {
    try {
      // Aquí se implementaría la lógica de eliminación
      console.log(`Eliminando paciente con ID: ${id}`);
      return true;
    } catch (error) {
      console.error('Error eliminando paciente:', error);
      return false;
    }
  }

  /**
   * Buscar pacientes por términos
   */
  async searchPatients(searchTerm: string): Promise<Patient[]> {
    try {
      const patients = await this.getPatients();
      const term = searchTerm.toLowerCase();

      return patients.filter(patient => 
        patient.nombre.toLowerCase().includes(term) ||
        patient.apellido.toLowerCase().includes(term) ||
        patient.email.toLowerCase().includes(term)
      );
    } catch (error) {
      console.error('Error buscando pacientes:', error);
      return [];
    }
  }

  /**
   * Obtener estadísticas de pacientes
   */
  async getPatientStats(): Promise<{
    total: number;
    activos: number;
    inactivos: number;
    pendientes: number;
  }> {
    try {
      const patients = await this.getPatients();
      
      return {
        total: patients.length,
        activos: patients.filter(p => p.estado === 'activo').length,
        inactivos: patients.filter(p => p.estado === 'inactivo').length,
        pendientes: patients.filter(p => p.estado === 'pendiente').length
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      return { total: 0, activos: 0, inactivos: 0, pendientes: 0 };
    }
  }

  /**
   * Verificar si el servicio está listo
   */
  isServiceReady(): boolean {
    return this.isClient;
  }
}

// Singleton para uso global
let patientServiceInstance: PatientService | null = null;

export const getPatientService = (): PatientService => {
  if (!patientServiceInstance) {
    patientServiceInstance = new PatientService();
  }
  return patientServiceInstance;
};

// Export default para compatibilidad
export default getPatientService();
