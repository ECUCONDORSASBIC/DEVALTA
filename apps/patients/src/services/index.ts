/**
 * 🏥 MIGRATED SERVICES INDEX - AltaMedica
 * 
 * ⚠️ DEPRECATED: Esta carpeta está siendo migrada hacia @altamedica/api-client
 * 
 * Nuevo patrón recomendado:
 * - Usar hooks de @altamedica/api-client para data fetching
 * - Usar @altamedica/auth para autenticación
 * - Toda lógica de negocio debe residir en el api-server
 */

// Re-exportar desde el cliente API centralizado
export { useApiClient } from '@altamedica/api-client';
export { useAuth } from '@altamedica/auth';

// Tipos que pueden ser útiles durante la transición
export type {
  ApiError,
  ApiResponse
} from '@altamedica/types';

/**
 * @deprecated Usar @altamedica/api-client en su lugar
 * Esta función será eliminada en la próxima versión
 */
export function useLegacyAPI() {
  // console.warn(
  //   '⚠️ useLegacyAPI está deprecated. Migrar a @altamedica/api-client'
  // );
  
  // Retornar métodos básicos para compatibilidad durante migración
  return {
    // Placeholder para evitar errores durante migración
    get: () => Promise.reject(new Error('Migrar a @altamedica/api-client')),
    post: () => Promise.reject(new Error('Migrar a @altamedica/api-client')),
    put: () => Promise.reject(new Error('Migrar a @altamedica/api-client')),
    delete: () => Promise.reject(new Error('Migrar a @altamedica/api-client'))
  };
}
