/**
 * 🏥 DEPRECATED - Local API Client
 * 
 * ⚠️ Este archivo ha sido reemplazado por @altamedica/api-client
 * 
 * Para migrar tu código:
 * 
 * ANTES:
 * import { apiClient } from './services/api-client';
 * const response = await apiClient.get('/endpoint');
 * 
 * DESPUÉS:
 * import { useApiClient } from '@altamedica/api-client';
 * const { data } = useQuery(['key'], () => apiClient.get('/endpoint'));
 * 
 * O para uso directo sin React Query:
 * import { apiClient } from '@altamedica/api-client';
 * const response = await apiClient.get('/endpoint');
 */

// console.warn('⚠️ /services/api-client está deprecated. Migrar a @altamedica/api-client');

// Re-exportar desde el paquete centralizado para compatibilidad temporal
export { apiClient } from '@altamedica/api-client';
export type { ApiResponse, RequestConfig } from '@altamedica/types';