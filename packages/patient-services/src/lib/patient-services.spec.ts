/**
 * 🧪 PRUEBAS UNITARIAS PARA PATIENTS SERVICE
 *
 * @group unit
 */
import { PatientsService, createPatientsService } from './patients-service';
import type { ApiClient, Patient, ApiResponse } from './types';

// Mock del ApiClient para aislar el servicio
const mockApiClient: jest.Mocked<ApiClient> = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
};

// Datos de prueba
const mockPatients: Patient[] = [
  { id: '1', firstName: 'Juan', lastName: 'Perez', email: 'juan@test.com', status: 'active', age: 30, lastVisit: new Date().toISOString() },
  { id: '2', firstName: 'Ana', lastName: 'Gomez', email: 'ana@test.com', status: 'inactive', age: 45, lastVisit: new Date().toISOString() },
];

describe('PatientsService', () => {
  let service: PatientsService;

  beforeEach(() => {
    // Resetear mocks antes de cada prueba
    jest.clearAllMocks();
    // Crear una nueva instancia del servicio
    service = createPatientsService(mockApiClient);
  });

  it('debe ser creado correctamente', () => {
    expect(service).toBeDefined();
  });

  // Pruebas para getPatientById
  describe('getPatientById', () => {
    it('debe retornar un paciente si la API lo encuentra', async () => {
      const mockResponse: ApiResponse<Patient> = {
        success: true,
        data: mockPatients[0],
        message: 'Paciente encontrado',
      };
      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await service.getPatientById('1');

      expect(result).toEqual(mockPatients[0]);
      expect(mockApiClient.get).toHaveBeenCalledWith('/patients/1');
    });

    it('debe lanzar un error si el paciente no existe', async () => {
      const mockResponse: ApiResponse<null> = {
        success: false,
        error: 'Paciente no encontrado',
      };
      mockApiClient.get.mockResolvedValue(mockResponse);

      await expect(service.getPatientById('999')).rejects.toThrow('Paciente no encontrado');
      expect(mockApiClient.get).toHaveBeenCalledWith('/patients/999');
    });
  });

  // Pruebas para getAllPatients
  describe('getAllPatients', () => {
    it('debe retornar una lista de pacientes', async () => {
      const mockResponse: ApiResponse<Patient[]> = {
        success: true,
        data: mockPatients,
      };
      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await service.getAllPatients();

      expect(result).toEqual(mockPatients);
      expect(mockApiClient.get).toHaveBeenCalledWith('/patients');
    });
  });

  // Pruebas para createPatient
  describe('createPatient', () => {
    it('debe crear y retornar un nuevo paciente', async () => {
      const newPatientData = { firstName: 'Carlos', lastName: 'Ruiz', email: 'carlos@test.com', age: 25 };
      const createdPatient: Patient = { id: '3', ...newPatientData, status: 'pending', lastVisit: new Date().toISOString() };
      const mockResponse: ApiResponse<Patient> = {
        success: true,
        data: createdPatient,
      };
      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await service.createPatient(newPatientData);

      expect(result).toEqual(createdPatient);
      expect(mockApiClient.post).toHaveBeenCalledWith('/patients', newPatientData);
    });
  });

  // Pruebas para updatePatient
  describe('updatePatient', () => {
    it('debe actualizar y retornar los datos del paciente', async () => {
      const updates = { status: 'active' as const };
      const updatedPatient: Patient = { ...mockPatients[0], ...updates };
      const mockResponse: ApiResponse<Patient> = {
        success: true,
        data: updatedPatient,
      };
      mockApiClient.put.mockResolvedValue(mockResponse);

      const result = await service.updatePatient('1', updates);

      expect(result).toEqual(updatedPatient);
      expect(mockApiClient.put).toHaveBeenCalledWith('/patients/1', updates);
    });
  });

  // Pruebas para deletePatient
  describe('deletePatient', () => {
    it('debe eliminar un paciente y retornar true', async () => {
      const mockResponse: ApiResponse<void> = {
        success: true,
      };
      mockApiClient.delete.mockResolvedValue(mockResponse);

      const result = await service.deletePatient('1');

      expect(result).toBe(true);
      expect(mockApiClient.delete).toHaveBeenCalledWith('/patients/1');
    });

    it('debe retornar false si la eliminación falla', async () => {
        const mockResponse: ApiResponse<void> = {
          success: false,
          error: 'No se pudo eliminar'
        };
        mockApiClient.delete.mockResolvedValue(mockResponse);
  
        const result = await service.deletePatient('1');
  
        expect(result).toBe(false);
      });
  });

  // Pruebas para searchPatients
  describe('searchPatients', () => {
    it('debe buscar pacientes por un término y retornar una lista', async () => {
        const searchTerm = 'Juan';
        const mockResponse: ApiResponse<Patient[]> = {
            success: true,
            data: [mockPatients[0]],
        };
        mockApiClient.get.mockResolvedValue(mockResponse);

        const result = await service.searchPatients({ name: searchTerm });

        expect(result).toEqual([mockPatients[0]]);
        expect(mockApiClient.get).toHaveBeenCalledWith('/patients/search', { params: { name: searchTerm } });
    });
  });
});
