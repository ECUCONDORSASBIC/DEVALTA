/**
 * @fileoverview Punto de entrada simplificado para @altamedica/types
 * @module @altamedica/types
 * @description Exporta tipos básicos esenciales para compilación
 */

// ==================== CORE TYPES ====================
export * from './core';

// ==================== MEDICAL DOMAIN ====================
export * from './medical';

// ==================== API TYPES ====================
export * from './api';

// ==================== SECURITY TYPES ====================
export * from './security';

// Version info
export const TYPES_VERSION = '1.1.0';
export const TYPES_COMPATIBILITY = {
  minimum: '1.0.0',
  breaking: '2.0.0'
};