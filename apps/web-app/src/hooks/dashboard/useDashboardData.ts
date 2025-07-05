// EMERGENCY HIPAA: MOCK DATA DISABLED
// Original file backed up to: apps/web-app/src/hooks/dashboard/useDashboardData.ts.backup.20250705_142927
// Timestamp: 2025-07-05 14:29:27

export const MOCK_DATA_DISABLED = {
  error: 'MOCK_DATA_DISABLED_EMERGENCY_HIPAA',
  message: 'Mock data has been disabled due to HIPAA compliance emergency',
  timestamp: new Date().toISOString(),
  compliance: {
    hipaa: 'DISABLED',
    gdpr: 'DISABLED',
    fhir: 'DISABLED'
  }
};

// Exportar arrays vacíos para evitar errores
export const MOCK_LISTINGS: any[] = [];
export const MOCK_COMPANIES: any[] = [];
export const MOCK_DOCTORS: any[] = [];
export const mockStats = null;
export const mockAppointment = null;
export const mockPrescriptions: any[] = [];
export const mockActivities: any[] = [];
