/**
 * Utilidades de rendimiento para AltaMedica Companies
 * Implementa las nuevas características de Chrome DevTools
 */

// Detección del header Save-Data
export const detectSaveDataMode = (): boolean => {
  if (typeof navigator !== 'undefined') {
    // @ts-ignore - Save-Data header support
    return navigator.connection?.saveData === true || 
           navigator.connection?.effectiveType === 'slow-2g' ||
           navigator.connection?.effectiveType === '2g';
  }
  return false;
};

// Configuración para modo de datos reducidos
export const getOptimizedConfig = () => {
  const saveDataMode = detectSaveDataMode();
  
  return {
    // Imágenes optimizadas
    images: {
      quality: saveDataMode ? 60 : 80,
      format: saveDataMode ? 'webp' : 'auto',
      lazy: true,
      placeholder: saveDataMode ? 'blur' : 'empty'
    },
    
    // JavaScript optimizado
    javascript: {
      chunking: saveDataMode ? 'minimal' : 'optimal',
      preload: !saveDataMode,
      modulePreload: !saveDataMode
    },
    
    // CSS optimizado
    css: {
      inlineCritical: saveDataMode,
      minify: true,
      removeUnused: saveDataMode
    },
    
    // Red optimizada
    network: {
      timeout: saveDataMode ? 10000 : 5000,
      retries: saveDataMode ? 3 : 1,
      compression: true
    }
  };
};

// Hook para usar en componentes React
export const usePerformanceMode = () => {
  const [saveDataMode, setSaveDataMode] = useState(false);
  
  useEffect(() => {
    setSaveDataMode(detectSaveDataMode());
    
    // Listener para cambios en la conexión
    const handleConnectionChange = () => {
      setSaveDataMode(detectSaveDataMode());
    };
    
    if (navigator.connection) {
      navigator.connection.addEventListener('change', handleConnectionChange);
      return () => {
        navigator.connection.removeEventListener('change', handleConnectionChange);
      };
    }
  }, []);
  
  return {
    saveDataMode,
    config: getOptimizedConfig()
  };
};

// Métricas de rendimiento para el dashboard
export const collectPerformanceMetrics = () => {
  if (typeof window === 'undefined') return null;
  
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  const paint = performance.getEntriesByType('paint');
  
  return {
    // Core Web Vitals aproximados
    loadTime: navigation.loadEventEnd - navigation.loadEventStart,
    domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
    firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
    firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
    
    // Información de red
    connectionType: navigator.connection?.effectiveType || 'unknown',
    saveDataMode: detectSaveDataMode(),
    
    // Recursos
    resources: performance.getEntriesByType('resource').length,
    
    // Timestamp
    timestamp: Date.now()
  };
};

// Componente de alerta para conexiones lentas
export const SlowConnectionAlert = () => {
  const { saveDataMode } = usePerformanceMode();
  
  if (!saveDataMode) return null;
  
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-yellow-800">
            <strong>Conexión lenta detectada.</strong> Estamos optimizando la experiencia para reducir el uso de datos.
          </p>
        </div>
      </div>
    </div>
  );
};
