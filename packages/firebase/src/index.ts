// Exportar configuración principal
export * from './config';

// Exportar funciones de performance
export * from './performance';

// Exportar cliente con funciones de inicialización
export * from './client';

// Exportar cliente-only para aplicaciones del lado del cliente
export * from './client-only';

// NO exportar admin directamente para evitar problemas en el cliente
// Las funciones admin están disponibles en './admin-server' para uso en API routes

