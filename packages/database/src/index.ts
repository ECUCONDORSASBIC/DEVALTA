/**
 * 🏥 @ALTAMEDICA/DATABASE - UNIFIED DATABASE LAYER
 * Versión 2.0.0 - Arquitectura consolidada con Firebase/Firestore
 * Repository Pattern + HIPAA Compliance + Performance Optimization
 */

// Version
export const databaseVersion = '2.0.0';

// Core Database Connection
export { DatabaseConnection, dbConnection, getAuthAdmin, getFirestoreDB, getStorageAdmin } from './core/DatabaseConnection.js';

// Base Repository Pattern
export { BaseRepository, type BaseEntity, type QueryOptions, type RepositoryResult, type ServiceContext } from './repositories/BaseRepository.js';

// Specialized Repositories
export { AppointmentRepository, appointmentRepository } from './repositories/AppointmentRepository.js';
export { DoctorRepository, doctorRepository } from './repositories/DoctorRepository.js';
export { MedicalRecordRepository, medicalRecordRepository } from './repositories/MedicalRecordRepository.js';
export { PatientRepository, patientRepository } from './repositories/PatientRepository.js';
export { CompanyRepository, companyRepository } from './repositories/CompanyRepository.js';
export { MarketplaceRepository, marketplaceRepository, ApplicationRepository, applicationRepository } from './repositories/MarketplaceRepository.js';

// Centralized Schemas (namespaced to avoid type name collisions)
export * as Schemas from './schemas';

// Repository Index Export
export * from './repositories';

// Services Export
export * from './services';

// Security & HIPAA
export * from './security';

// Cache Layer
export * from './cache';

// Monitoring
export * from './monitoring';

// Firebase Configuration
export * from './firebase/config';

// Import instances for convenience functions
import { dbConnection } from './core/DatabaseConnection.js';
import { appointmentRepository } from './repositories/AppointmentRepository.js';
import { doctorRepository } from './repositories/DoctorRepository.js';
import { medicalRecordRepository } from './repositories/MedicalRecordRepository.js';
import { patientRepository } from './repositories/PatientRepository.js';
import { companyRepository } from './repositories/CompanyRepository.js';
import { marketplaceRepository, applicationRepository } from './repositories/MarketplaceRepository.js';

// Convenience Functions for Quick Setup
export async function initializeAltaMedicaDatabase() {
  try {
    const db = await dbConnection.getFirestore();
    if (!db) {
      throw new Error('Failed to initialize AltaMedica Database');
    }
    
    const healthCheck = await dbConnection.healthCheck();
    console.log('🏥 AltaMedica Database initialized successfully', {
      version: databaseVersion,
      status: healthCheck.status,
      services: healthCheck.services
    });
    
    return {
      connection: dbConnection,
      healthCheck,
      repositories: {
        medicalRecord: medicalRecordRepository,
        patient: patientRepository,
        doctor: doctorRepository,
        appointment: appointmentRepository,
        company: companyRepository,
        marketplace: marketplaceRepository,
        application: applicationRepository
      }
    };
  } catch (error) {
    console.error('❌ Failed to initialize AltaMedica Database:', error);
    throw error;
  }
}

// Quick Health Check
export async function checkDatabaseHealth() {
  return await dbConnection.healthCheck();
}

// Database Metrics
export function getDatabaseMetrics() {
  return dbConnection.getMetrics();
}
