/**
 * 🔗 @ALTAMEDICA/SHARED
 * Utilidades y servicios compartidos
 */

export * from './utils';
export * from './constants';
export * from './services';
export * from './api-client';
export * from './types/user';
export * from './types/roles';

// Payment Service - use the modern service instead of legacy payments module
export * from './services/payment-service';
export { default as paymentService } from './services/payment-service';

// Admin Service
export * from './services/admin-service';
export { default as adminService } from './services/admin-service';

// Notification Service
export * from './services/notification-service';
export { default as notificationService } from './services/notification-service';

// JWT Service
export * from './services/jwt-service';
export { default as jwtService } from './services/jwt-service';