// Simple logger functions to replace @/lib/logger
export function logPHIAccess(action: string, userId: string, patientId?: string) {
  console.log(`[PHI ACCESS] ${action} by user ${userId} ${patientId ? `for patient ${patientId}` : ''}`, {
    timestamp: new Date().toISOString(),
    action,
    userId,
    patientId,
    level: 'audit'
  });
}

export function logMedicalAction(action: string, userId: string, details?: any) {
  console.log(`[MEDICAL ACTION] ${action} by user ${userId}`, {
    timestamp: new Date().toISOString(),
    action,
    userId,
    details,
    level: 'medical'
  });
}

export const medicalLogger = {
  info: (message: string, meta?: any) => console.log(`[MEDICAL INFO] ${message}`, meta),
  error: (message: string, meta?: any) => console.error(`[MEDICAL ERROR] ${message}`, meta),
  warn: (message: string, meta?: any) => console.warn(`[MEDICAL WARN] ${message}`, meta),
};

const logger = {
  info: (message: string, meta?: any) => console.log(`[INFO] ${message}`, meta),
  error: (message: string, meta?: any) => console.error(`[ERROR] ${message}`, meta),
  warn: (message: string, meta?: any) => console.warn(`[WARN] ${message}`, meta),
};

export default logger;
