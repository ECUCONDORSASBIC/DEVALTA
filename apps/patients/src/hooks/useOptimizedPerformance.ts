/**
 * @fileoverview Re-export de hooks de performance optimizada (MIGRADO)
 * @description Este archivo mantiene compatibilidad durante la migración desde packages/hooks
 * @deprecated Importar directamente desde '@altamedica/hooks/performance' en lugar de este archivo
 */

// Re-exportar desde el package centralizado
export {
  useLazyComponent,
  useIntersectionObserver,
  useOptimizedState,
  usePrefetch,
  usePerformanceMonitor,
  useThrottle,
  useWhyDidYouUpdate,
  useLazyLoad,
  useImageOptimization
} from '@altamedica/hooks';

// Re-exportar debounce que también está en utils
export { useDebounce } from '@altamedica/hooks';