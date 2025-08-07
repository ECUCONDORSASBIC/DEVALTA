/**
 * 🏥 @ALTAMEDICA/DATABASE - UNIFIED DATABASE LAYER
 * Versión 2.0.0 - Arquitectura consolidada con Firebase/Firestore
 * Repository Pattern + HIPAA Compliance + Performance Optimization
 */

// Version
export const databaseVersion = '2.0.0';

// Core Database Connection
export { DatabaseConnection, dbConnection, getFirestoreDB, getAuthAdmin, getStorageAdmin } from './core/DatabaseConnection';

// Base Repository Pattern
export { BaseRepository, type BaseEntity, type ServiceContext, type QueryOptions, type RepositoryResult } from './repositories/BaseRepository';

// Specialized Repositories
export { MedicalRecordRepository, medicalRecordRepository } from './repositories/MedicalRecordRepository';
export { PatientRepository, patientRepository } from './repositories/PatientRepository';
export { DoctorRepository, doctorRepository } from './repositories/DoctorRepository';
export { AppointmentRepository, appointmentRepository } from './repositories/AppointmentRepository';

// Centralized Schemas
export * from './schemas';

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
import { dbConnection } from './core/DatabaseConnection';
import { medicalRecordRepository } from './repositories/MedicalRecordRepository';
import { patientRepository } from './repositories/PatientRepository';
import { doctorRepository } from './repositories/DoctorRepository';
import { appointmentRepository } from './repositories/AppointmentRepository';

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
        appointment: appointmentRepository
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
