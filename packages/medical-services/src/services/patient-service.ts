/**
 * 👥 SERVICIO DE PACIENTES CENTRALIZADO - ALTAMEDICA
 * Gestión unificada de pacientes para todas las aplicaciones médicas
 */

import type { 
  Patient, 
  HistorialMedico, 
  SeguroMedico, 
  ContactoEmergencia,
  PatientSummary,
  PatientSearchFilters,
  PatientSearchOptions,
  PatientSearchResult,
  PatientStats
} from '../types/patient';

export class PatientService {
  private isClient = false;
  private cache: Map<string, Patient> = new Map();

  constructor() {
    // Verificar si estamos en el cliente
    this.isClient = typeof window !== 'undefined';
  }

  /**
   * Obtener lista de pacientes con filtros opcionales
   */
  async getPatients(
    filters: PatientSearchFilters = {},
    options: PatientSearchOptions = {}
  ): Promise<PatientSearchResult> {
    try {
      // Mock data para desarrollo - en producción se conectaría a la API
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
        },
        {
          id: '3',
          nombre: 'Carlos',
          apellido: 'Rodríguez',
          email: 'carlos.rodriguez@example.com',
          telefono: '+54 11 3456-7890',
          fechaNacimiento: new Date('1978-12-03'),
          historialMedico: [],
          fechaRegistro: new Date('2024-02-20'),
          estado: 'pendiente'
        }
      ];

      // Aplicar filtros
      let filteredPatients = mockPatients;

      if (filters.nombre) {
        const searchTerm = filters.nombre.toLowerCase();
        filteredPatients = filteredPatients.filter(p => 
          p.nombre.toLowerCase().includes(searchTerm) ||
          p.apellido.toLowerCase().includes(searchTerm)
        );
      }

      if (filters.email) {
        filteredPatients = filteredPatients.filter(p => 
          p.email.toLowerCase().includes(filters.email!.toLowerCase())
        );
      }

      if (filters.estado) {
        filteredPatients = filteredPatients.filter(p => p.estado === filters.estado);
      }

      // Aplicar paginación
      const page = options.page || 1;
      const limit = options.limit || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      const paginatedPatients = filteredPatients.slice(startIndex, endIndex);

      // Convertir a summary
      const patientSummaries: PatientSummary[] = paginatedPatients.map(patient => ({
        id: patient.id,
        nombre: patient.nombre,
        apellido: patient.apellido,
        email: patient.email,
        edad: this.calculateAge(patient.fechaNacimiento),
        ultimaConsulta: patient.historialMedico[0]?.fecha,
        estado: patient.estado
      }));

      return {
        patients: patientSummaries,
        total: filteredPatients.length,
        page,
        totalPages: Math.ceil(filteredPatients.length / limit)
      };

    } catch (error) {
      console.error('Error obteniendo pacientes:', error);
      return {
        patients: [],
        total: 0,
        page: 1,
        totalPages: 0
      };
    }
  }

  /**
   * Obtener paciente por ID
   */
  async getPatientById(id: string): Promise<Patient | null> {
    try {
      // Verificar cache primero
      if (this.cache.has(id)) {
        return this.cache.get(id)!;
      }

      // En un escenario real, esto haría una llamada a la API
      const result = await this.getPatients();
      const allPatients = await this.getAllPatientsForSearch();
      const patient = allPatients.find(p => p.id === id);

      if (patient) {
        this.cache.set(id, patient);
        return patient;
      }

      return null;
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
        id: this.generateId(),
        fechaRegistro: new Date()
      };

      // En producción, aquí se haría la llamada a la API
      console.log('Creando paciente:', newPatient);

      // Agregar al cache
      this.cache.set(newPatient.id, newPatient);

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

      const updatedPatient: Patient = {
        ...existingPatient,
        ...patientData,
        id: existingPatient.id,
        fechaRegistro: existingPatient.fechaRegistro
      };

      // En producción, aquí se haría la llamada a la API
      console.log('Actualizando paciente:', updatedPatient);

      // Actualizar cache
      this.cache.set(id, updatedPatient);

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
      // En producción, aquí se haría la llamada a la API
      console.log(`Eliminando paciente con ID: ${id}`);

      // Remover del cache
      this.cache.delete(id);

      return true;
    } catch (error) {
      console.error('Error eliminando paciente:', error);
      return false;
    }
  }

  /**
   * Buscar pacientes por término
   */
  async searchPatients(searchTerm: string): Promise<PatientSummary[]> {
    try {
      const filters: PatientSearchFilters = {
        nombre: searchTerm
      };

      const result = await this.getPatients(filters);
      return result.patients;
    } catch (error) {
      console.error('Error buscando pacientes:', error);
      return [];
    }
  }

  /**
   * Obtener estadísticas de pacientes
   */
  async getPatientStats(): Promise<PatientStats> {
    try {
      const result = await this.getPatients({}, { limit: 1000 });
      const allPatients = await this.getAllPatientsForSearch();
      
      return {
        total: allPatients.length,
        activos: allPatients.filter(p => p.estado === 'activo').length,
        inactivos: allPatients.filter(p => p.estado === 'inactivo').length,
        pendientes: allPatients.filter(p => p.estado === 'pendiente').length
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      return { total: 0, activos: 0, inactivos: 0, pendientes: 0 };
    }
  }

  /**
   * Agregar entrada al historial médico
   */
  async addMedicalRecord(patientId: string, record: Omit<HistorialMedico, 'id'>): Promise<Patient | null> {
    try {
      const patient = await this.getPatientById(patientId);
      if (!patient) {
        return null;
      }

      const newRecord: HistorialMedico = {
        ...record,
        id: this.generateId()
      };

      const updatedPatient = {
        ...patient,
        historialMedico: [newRecord, ...patient.historialMedico]
      };

      return await this.updatePatient(patientId, updatedPatient);
    } catch (error) {
      console.error('Error agregando historial médico:', error);
      throw error;
    }
  }

  /**
   * Verificar si el servicio está listo
   */
  isServiceReady(): boolean {
    return this.isClient;
  }

  /**
   * Limpiar cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  // Métodos privados de utilidad
  private calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  private async getAllPatientsForSearch(): Promise<Patient[]> {
    // Esta función obtendría todos los pacientes para búsquedas y estadísticas
    // En el mock, retornamos los datos de ejemplo
    const result = await this.getPatients({}, { limit: 1000 });
    
    // Simular conversión de summary a Patient completo
    return result.patients.map(summary => ({
      id: summary.id,
      nombre: summary.nombre,
      apellido: summary.apellido,
      email: summary.email,
      telefono: '+54 11 0000-0000', // Mock data
      fechaNacimiento: new Date(Date.now() - (summary.edad * 365 * 24 * 60 * 60 * 1000)),
      historialMedico: [],
      fechaRegistro: new Date(),
      estado: summary.estado
    }));
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

// Export por defecto
export default getPatientService();