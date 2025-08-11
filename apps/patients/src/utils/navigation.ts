/**
 * 🧭 DEPRECATED - Navigation Utils
 * 
 * ⚠️ Este archivo ha sido migrado a @altamedica/utils/navigation
 * 
 * Para migrar tu código:
 * 
 * ANTES:
 * import { getAppUrl, findRoute } from './utils/navigation';
 * 
 * DESPUÉS:
 * import { getAppUrl, findRoute } from '@altamedica/utils/navigation';
 */

// console.warn('⚠️ /utils/navigation está deprecated. Migrar a @altamedica/utils/navigation');

// Re-exportar desde el paquete centralizado para compatibilidad temporal
export {
  getAppUrl,
  getAllRoutes,
  getRoutesByApp,
  findRoute,
  getAuthenticatedRoutes,
  getRoutesByRole,
  getRoutesStats,
  APPS
} from '@altamedica/utils/navigation';

export type {
  RouteInfo,
  AppInfo
} from '@altamedica/utils/navigation';