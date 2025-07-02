// 🏥 ÍNDICE PRINCIPAL DE SERVICIOS ALTAMEDICA
// Exportación centralizada y configuración de servicios
// ARQUITECTURA: Punto único de acceso para todos los servicios

// 📡 Servicios principales
export { ApiService, apiService } from "./ApiService";
export { MedicalService, medicalService } from "./MedicalService";

// 📝 Tipos y interfaces de servicios
export type {
  ApiConfig,
  ApiError,
  ApiResponse,
  RequestConfig,
} from "./ApiService";

export type {
  PatientSearchParams,
  AppointmentFilters,
  MedicalRecordFilters,
} from "./MedicalService";

// 🎯 CONFIGURACIÓN CENTRALIZADA DE SERVICIOS
export class ServiceManager {
  private static instance: ServiceManager;

  private constructor() {}

  public static getInstance(): ServiceManager {
    if (!ServiceManager.instance) {
      ServiceManager.instance = new ServiceManager();
    }
    return ServiceManager.instance;
  }

  // 🔧 Configurar todos los servicios
  public async configureServices(config: {
    apiBaseURL?: string;
    enableLogging?: boolean;
    timeout?: number;
  }): Promise<void> {
    if (config.apiBaseURL || config.enableLogging || config.timeout) {
      const apiConfig = {
        ...(config.apiBaseURL && { baseURL: config.apiBaseURL }),
        ...(config.enableLogging !== undefined && {
          enableLogging: config.enableLogging,
        }),
        ...(config.timeout && { timeout: config.timeout }),
      };

      // Actualizar configuración del servicio API
      await updateApiConfig(apiConfig);
    }
  }

  // 🔍 Verificar salud de todos los servicios
  public async healthCheck(): Promise<{
    api: { status: string; timestamp: string };
    medical: { status: string; timestamp: string };
  }> {
    try {
      const apiHealth = await (
        await import("./ApiService")
      ).apiService.healthCheck();

      return {
        api: apiHealth,
        medical: {
          status: "ok",
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      throw new Error(`Service health check failed: ${error}`);
    }
  }
}

// 🎯 Instancia singleton del gestor de servicios
export const serviceManager = ServiceManager.getInstance();

// 🔄 Hook para migración gradual desde useAltaMedicaAPI
export function useMigratedAPI() {
  console.warn(
    "⚠️ useMigratedAPI: Consider migrating to individual service hooks"
  );

  return {
    // Mantener compatibilidad con métodos existentes
    getPatients: medicalService.getPatients.bind(medicalService),
    getPatient: medicalService.getPatientById.bind(medicalService),
    updatePatient: medicalService.updatePatient.bind(medicalService),
    getAppointments: medicalService.getAppointments.bind(medicalService),
    createAppointment: medicalService.createAppointment.bind(medicalService),
    updateAppointment: medicalService.updateAppointment.bind(medicalService),
    cancelAppointment: medicalService.cancelAppointment.bind(medicalService),
    getMedicalRecords: medicalService.getMedicalRecords.bind(medicalService),
    getPrescriptions: medicalService.getPrescriptions.bind(medicalService),
    verifyPrescription: medicalService.verifyPrescription.bind(medicalService),
    analyzeSymptoms: medicalService.analyzeSymptoms.bind(medicalService),
    checkDrugInteractions:
      medicalService.checkDrugInteractions.bind(medicalService),

    // Métodos del servicio API base
    login: async (email: string, password: string) => {
      const response = await apiService.post("/auth/login", {
        email,
        password,
      });
      if (response.token) {
        apiService.setToken(response.token, true);
      }
      return response;
    },

    logout: async () => {
      await apiService.post("/auth/logout");
      apiService.clearToken();
    },

    getProfile: () => apiService.get("/auth/me"),

    getDashboard: (patientId?: string) => {
      const endpoint = patientId
        ? `/dashboard/patient/${patientId}`
        : "/dashboard";
      return apiService.get(endpoint);
    },
  };
}

export default {
  ServiceManager,
  serviceManager,
  useMigratedAPI,
};

// Corregido: await solo dentro de funciones async
export async function updateApiConfig(apiConfig: any) {
  const apiServiceModule = await import("./ApiService");
  apiServiceModule.apiService.updateConfig(apiConfig);
}
