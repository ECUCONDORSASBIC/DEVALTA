/**
 * Template de Compliance HIPAA para Base de Datos
 * Altamedica - Database Security Template
 */

import { PrismaClient } from '@prisma/client';
import { encrypt, decrypt } from '@/lib/encryption';
import { auditLog } from '@/lib/audit';

// Configuración de seguridad
const SECURITY_CONFIG = {
  encryptionKey: process.env.DATABASE_ENCRYPTION_KEY,
  backupInterval: 24 * 60 * 60 * 1000, // 24 horas
  retentionPeriod: 7 * 365 * 24 * 60 * 60 * 1000 // 7 años
};

// Cliente Prisma con middleware de seguridad
const prisma = new PrismaClient({
  log: [
    { level: 'query', emit: 'event' },
    { level: 'error', emit: 'event' },
    { level: 'info', emit: 'event' },
    { level: 'warn', emit: 'event' }
  ]
});

// Middleware de logging de auditoría
prisma.$use(async (params, next) => {
  const startTime = Date.now();
  
  try {
    const result = await next(params);
    
    // Log de auditoría para operaciones sensibles
    if (['create', 'update', 'delete'].includes(params.action)) {
      await auditLog({
        action: `DB_${params.action.toUpperCase()}`,
        model: params.model,
        userId: params.args?.data?.userId || 'system',
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime
      });
    }
    
    return result;
  } catch (error) {
    // Log de errores
    await auditLog({
      action: 'DB_ERROR',
      model: params.model,
      error: error.message,
      timestamp: new Date().toISOString()
    });
    throw error;
  }
});

// Función para encriptar datos sensibles
export function encryptSensitiveData(data: any): any {
  const sensitiveFields = ['ssn', 'medicalRecord', 'diagnosis', 'prescription'];
  
  const encryptedData = { ...data };
  
  sensitiveFields.forEach(field => {
    if (encryptedData[field]) {
      encryptedData[field] = encrypt(encryptedData[field], SECURITY_CONFIG.encryptionKey);
    }
  });
  
  return encryptedData;
}

// Función para desencriptar datos sensibles
export function decryptSensitiveData(data: any): any {
  const sensitiveFields = ['ssn', 'medicalRecord', 'diagnosis', 'prescription'];
  
  const decryptedData = { ...data };
  
  sensitiveFields.forEach(field => {
    if (decryptedData[field]) {
      decryptedData[field] = decrypt(decryptedData[field], SECURITY_CONFIG.encryptionKey);
    }
  });
  
  return decryptedData;
}

// Operaciones seguras de pacientes
export class SecurePatientService {
  // Crear paciente con datos encriptados
  static async createPatient(patientData: any) {
    const encryptedData = encryptSensitiveData(patientData);
    
    const patient = await prisma.patient.create({
      data: encryptedData
    });
    
    return patient;
  }
  
  // Obtener paciente con datos desencriptados
  static async getPatient(id: string) {
    const patient = await prisma.patient.findUnique({
      where: { id }
    });
    
    if (!patient) {
      throw new Error('Paciente no encontrado');
    }
    
    return decryptSensitiveData(patient);
  }
  
  // Actualizar paciente
  static async updatePatient(id: string, updateData: any) {
    const encryptedData = encryptSensitiveData(updateData);
    
    const patient = await prisma.patient.update({
      where: { id },
      data: encryptedData
    });
    
    return patient;
  }
  
  // Eliminar paciente (soft delete)
  static async deletePatient(id: string) {
    const patient = await prisma.patient.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false
      }
    });
    
    return patient;
  }
}

// Operaciones seguras de citas médicas
export class SecureAppointmentService {
  // Crear cita
  static async createAppointment(appointmentData: any) {
    const appointment = await prisma.appointment.create({
      data: appointmentData,
      include: {
        patient: true,
        doctor: true
      }
    });
    
    return appointment;
  }
  
  // Obtener citas de un paciente
  static async getPatientAppointments(patientId: string) {
    const appointments = await prisma.appointment.findMany({
      where: {
        patientId,
        isActive: true
      },
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            specialty: true
          }
        }
      }
    });
    
    return appointments;
  }
  
  // Actualizar cita
  static async updateAppointment(id: string, updateData: any) {
    const appointment = await prisma.appointment.update({
      where: { id },
      data: updateData
    });
    
    return appointment;
  }
}

// Función de backup automático
export async function performBackup() {
  try {
    const timestamp = new Date().toISOString();
    const backupPath = `./backups/backup_${timestamp}.sql`;
    
    // Ejecutar backup
    const { exec } = require('child_process');
    exec(`pg_dump -h ${process.env.DATABASE_HOST} -U ${process.env.DATABASE_USER} -d ${process.env.DATABASE_NAME} > ${backupPath}`);
    
    // Log de backup
    await auditLog({
      action: 'DATABASE_BACKUP',
      backupPath,
      timestamp: new Date().toISOString()
    });
    
    console.log(`Backup completado: ${backupPath}`);
  } catch (error) {
    console.error('Error en backup:', error);
    throw error;
  }
}

// Función de limpieza de datos antiguos
export async function cleanupOldData() {
  try {
    const cutoffDate = new Date(Date.now() - SECURITY_CONFIG.retentionPeriod);
    
    // Eliminar datos antiguos (mantener solo 7 años)
    const deletedRecords = await prisma.patient.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate
        }
      }
    });
    
    await auditLog({
      action: 'DATA_CLEANUP',
      deletedCount: deletedRecords.count,
      cutoffDate: cutoffDate.toISOString(),
      timestamp: new Date().toISOString()
    });
    
    console.log(`Limpieza completada: ${deletedRecords.count} registros eliminados`);
  } catch (error) {
    console.error('Error en limpieza:', error);
    throw error;
  }
}

export default prisma;
