// 🪝 ÍNDICE CENTRALIZADO DE HOOKS ESPECIALIZADOS - ALTAMEDICA
// Exportación unificada y configuración de hooks granulares
// CONSERVADOR: Mantiene compatibilidad total, migración gradual

// 🔐 Hooks de autenticación (existentes)
export { useAuth, useUser, useIsAuthenticated, usePermissions, ProtectedRoute, usePatientData } from './useAuth';

// 👤 Hooks de pacientes especializados
export { usePatients, usePatient } from './usePatients';
export type { UsePatientState, UsePatientActions, UsePatientOptions } from './usePatients';

// 📅 Hooks de citas médicas
export { useAppointments, useUpcomingAppointments } from './useAppointments';
export type { UseAppointmentState, UseAppointmentActions, UseAppointmentOptions } from './useAppointments';

// 📋 Hooks médicos especializados
export { useMedicalRecords, usePrescriptions, useMedicalAI, useMedicalDashboard } from './useMedicalRecords';

// 🔄 Hook de migración conservadora (mantiene compatibilidad)
export { useAltaMedicaAPI, useAPIRequest } from './useAltaMedicaAPI';

// 🎯 HOOK COMPUESTO PARA DASHBOARD COMPLETO
export function useCompleteDashboard(patientId?: string) {
  const patientData = usePatient(patientId);
  const upcomingAppointments = useUpcomingAppointments(patientId, 3);
  const medicalDashboard = useMedicalDashboard(patientId);
  const prescriptions = usePrescriptions(patientId, { initialFetch: true });

  const isLoading = patientData.loading || 
                   upcomingAppointments.loading || 
                   medicalDashboard.loading || 
                   prescriptions.loading;

  const hasError = patientData.error || 
                   upcomingAppointments.error || 
                   medicalDashboard.error || 
                   prescriptions.error;

  const refreshAll = async () => {
    const promises = [
      patientData.refreshPatient(),
      upcomingAppointments.refresh(),
      medicalDashboard.refreshDashboard(),
      prescriptions.refreshPrescriptions()
    ];

    await Promise.allSettled(promises);
  };

  return {
    patient: patientData.patient,
    upcomingAppointments: upcomingAppointments.appointments,
    recentRecords: medicalDashboard.recentRecords,
    activePrescriptions: prescriptions.activePrescriptions,
    expiringSoon: prescriptions.expiringSoon,
    criticalItems: medicalDashboard.criticalPrescriptions,
    isLoading,
    hasError,
    refreshAll,
    clearErrors: () => {
      patientData.clearError();
      upcomingAppointments.refresh();
      medicalDashboard.clearError();
      prescriptions.clearError();
    }
  };
}

// 🔧 CONFIGURADOR DE HOOKS GLOBALES
export class HookManager {
  private static instance: HookManager;
  private config = {
    defaultPageSize: 10,
    autoRefreshInterval: 60000,
    enableCache: true,
    cacheTimeout: 300000
  };

  private constructor() {}

  public static getInstance(): HookManager {
    if (!HookManager.instance) {
      HookManager.instance = new HookManager();
    }
    return HookManager.instance;
  }

  public configure(newConfig: Partial<typeof this.config>) {
    this.config = { ...this.config, ...newConfig };
  }

  public getConfig() {
    return { ...this.config };
  }
}

// 🎯 Instancia singleton del gestor de hooks
export const hookManager = HookManager.getInstance();

// 🔄 HOOK DE MIGRACIÓN GRADUAL PARA COMPATIBILIDAD
export function useLegacyCompatibility() {
  console.warn('⚠️ useLegacyCompatibility: Consider migrating to specialized hooks');
  
  const altamedicaAPI = useAltaMedicaAPI();
  
  return {
    // Mantener métodos legacy para transición gradual
    ...altamedicaAPI,
    
    // Nuevos métodos especializados recomendados
    patients: {
      usePatients,
      usePatient
    },
    appointments: {
      useAppointments,
      useUpcomingAppointments
    },
    medical: {
      useMedicalRecords,
      usePrescriptions,
      useMedicalAI,
      useMedicalDashboard
    },
    
    // Hook compuesto para dashboard
    useDashboard: useCompleteDashboard,
    
    // Utilidades
    hookManager
  };
}

export default {
  // Hooks principales
  useAuth,
  usePatients,
  useAppointments,
  useMedicalRecords,
  usePrescriptions,
  useMedicalAI,
  useCompleteDashboard,
  
  // Migración y compatibilidad
  useLegacyCompatibility,
  hookManager
};