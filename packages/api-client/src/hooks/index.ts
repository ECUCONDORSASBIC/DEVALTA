/**
 * 🪝 REACT QUERY HOOKS - ALTAMEDICA
 * Hooks personalizados para gestión de datos con caché y optimizaciones
 */

export * from './useAuth';
export * from './usePatients';
export * from './useDoctors';
export * from './useAppointments';
export * from './useTelemedicine';
export * from './usePrescriptions';
export * from './useCompanies';
export * from './useMarketplace';
export * from './useNotifications';
export * from './useAnalytics';

// Re-export common query utilities from centralized hooks
export { useTanstackQuery as useQuery, useMutation, useQueryClient } from '@altamedica/hooks';