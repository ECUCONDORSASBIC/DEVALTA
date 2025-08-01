import crypto from 'crypto';
import bcrypt from 'bcryptjs';

// Configuración de encriptación para datos médicos PHI
interface EncryptionConfig {
  algorithm: string;
  keyLength: number;
  ivLength: number;
  tagLength: number;
  saltLength: number;
  iterations: number;
}

interface EncryptionResult {
  encryptedData: string;
  iv: string;
  tag: string;
  salt?: string;
}

interface DecryptionResult {
  success: boolean;
  data?: string;
  error?: string;
}

// Configuración de encriptación AES-256-GCM (estándar HIPAA)
const encryptionConfig: EncryptionConfig = {
  algorithm: 'aes-256-gcm',
  keyLength: 32, // 256 bits
  ivLength: 16,  // 128 bits
  tagLength: 16, // 128 bits
  saltLength: 64, // 512 bits
  iterations: 100000 // PBKDF2 iterations
};

// Clave maestra de encriptación (en producción: usar AWS KMS, HashiCorp Vault, etc.)
const MASTER_KEY = process.env.ENCRYPTION_MASTER_KEY || 'CHANGE-THIS-IN-PRODUCTION-USE-PROPER-KEY-MANAGEMENT';

// Tipos de datos médicos que requieren encriptación
const PHI_DATA_TYPES = [
  'ssn',
  'medical_record_number',
  'patient_id',
  'diagnosis',
  'medication',
  'lab_result',
  'prescription',
  'medical_note',
  'genetic_info',
  'biometric_data',
  'insurance_info',
  'financial_info'
];

// Función para derivar clave de encriptación usando PBKDF2
function deriveKey(password: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(password, salt, encryptionConfig.iterations, encryptionConfig.keyLength, 'sha256');
}

// Función principal para encriptar datos PHI
export function encryptPHI(data: string, context?: string): EncryptionResult {
  try {
    if (!data || data.trim() === '') {
      throw new Error('No data provided for encryption');
    }

    // Generar salt único para cada encriptación
    const salt = crypto.randomBytes(encryptionConfig.saltLength);
    
    // Derivar clave de encriptación
    const key = deriveKey(MASTER_KEY, salt);
    
    // Generar IV único
    const iv = crypto.randomBytes(encryptionConfig.ivLength);
    
    // Crear cipher
    const cipher = crypto.createCipher(encryptionConfig.algorithm, key);
    cipher.setAutoPadding(true);
    
    // Encriptar datos
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Obtener tag de autenticación
    const tag = cipher.getAuthTag();
    
    console.log(`[ENCRYPTION] PHI data encrypted successfully (${context || 'unknown context'})`);
    
    return {
      encryptedData: encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex'),
      salt: salt.toString('hex')
    };
    
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error(`Failed to encrypt PHI data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Función principal para desencriptar datos PHI
export function decryptPHI(encryptionResult: EncryptionResult, context?: string): DecryptionResult {
  try {
    if (!encryptionResult.encryptedData || !encryptionResult.iv || !encryptionResult.tag) {
      throw new Error('Invalid encryption data provided');
    }

    // Convertir hexadecimales a buffers
    const iv = Buffer.from(encryptionResult.iv, 'hex');
    const tag = Buffer.from(encryptionResult.tag, 'hex');
    const salt = encryptionResult.salt ? Buffer.from(encryptionResult.salt, 'hex') : Buffer.from('default-salt');
    
    // Derivar clave de desencriptación
    const key = deriveKey(MASTER_KEY, salt);
    
    // Crear decipher
    const decipher = crypto.createDecipher(encryptionConfig.algorithm, key);
    decipher.setAuthTag(tag);
    decipher.setAutoPadding(true);
    
    // Desencriptar datos
    let decrypted = decipher.update(encryptionResult.encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    console.log(`[DECRYPTION] PHI data decrypted successfully (${context || 'unknown context'})`);
    
    return {
      success: true,
      data: decrypted
    };
    
  } catch (error) {
    console.error('Decryption error:', error);
    return {
      success: false,
      error: `Failed to decrypt PHI data: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

// Función para encriptar objeto completo de paciente
export function encryptPatientData(patientData: any): any {
  const encryptedPatient = { ...patientData };
  
  // Campos que requieren encriptación
  const fieldsToEncrypt = [
    'firstName',
    'lastName', 
    'email',
    'phone',
    'dateOfBirth',
    'ssn',
    'medicalRecordNumber',
    'address',
    'emergencyContact',
    'insurance'
  ];
  
  fieldsToEncrypt.forEach(field => {
    if (encryptedPatient[field]) {
      try {
        if (typeof encryptedPatient[field] === 'object') {
          encryptedPatient[field] = encryptPHI(JSON.stringify(encryptedPatient[field]), `patient.${field}`);
        } else {
          encryptedPatient[field] = encryptPHI(encryptedPatient[field].toString(), `patient.${field}`);
        }
      } catch (error) {
        console.error(`Error encrypting field ${field}:`, error);
      }
    }
  });
  
  return encryptedPatient;
}

// Función para desencriptar objeto completo de paciente
export function decryptPatientData(encryptedPatientData: any): any {
  const decryptedPatient = { ...encryptedPatientData };
  
  const fieldsToDecrypt = [
    'firstName',
    'lastName',
    'email', 
    'phone',
    'dateOfBirth',
    'ssn',
    'medicalRecordNumber',
    'address',
    'emergencyContact',
    'insurance'
  ];
  
  fieldsToDecrypt.forEach(field => {
    if (decryptedPatient[field] && typeof decryptedPatient[field] === 'object' && decryptedPatient[field].encryptedData) {
      try {
        const decryptionResult = decryptPHI(decryptedPatient[field], `patient.${field}`);
        if (decryptionResult.success) {
          // Intentar parsear JSON si era un objeto
          try {
            decryptedPatient[field] = JSON.parse(decryptionResult.data!);
          } catch {
            decryptedPatient[field] = decryptionResult.data;
          }
        } else {
          console.error(`Failed to decrypt field ${field}:`, decryptionResult.error);
          decryptedPatient[field] = '[DECRYPTION_FAILED]';
        }
      } catch (error) {
        console.error(`Error decrypting field ${field}:`, error);
        decryptedPatient[field] = '[DECRYPTION_ERROR]';
      }
    }
  });
  
  return decryptedPatient;
}

// Función para encriptar registros médicos
export function encryptMedicalRecord(recordData: any): any {
  const encryptedRecord = { ...recordData };
  
  // Campos médicos sensibles
  const medicalFields = [
    'diagnosis',
    'symptoms',
    'medications',
    'vitalSigns',
    'description',
    'notes',
    'labResults',
    'prescriptions',
    'attachments'
  ];
  
  medicalFields.forEach(field => {
    if (encryptedRecord[field]) {
      try {
        const dataToEncrypt = typeof encryptedRecord[field] === 'object' 
          ? JSON.stringify(encryptedRecord[field])
          : encryptedRecord[field].toString();
          
        encryptedRecord[field] = encryptPHI(dataToEncrypt, `medical_record.${field}`);
      } catch (error) {
        console.error(`Error encrypting medical field ${field}:`, error);
      }
    }
  });
  
  return encryptedRecord;
}

// Función para desencriptar registros médicos
export function decryptMedicalRecord(encryptedRecordData: any): any {
  const decryptedRecord = { ...encryptedRecordData };
  
  const medicalFields = [
    'diagnosis',
    'symptoms', 
    'medications',
    'vitalSigns',
    'description',
    'notes',
    'labResults',
    'prescriptions',
    'attachments'
  ];
  
  medicalFields.forEach(field => {
    if (decryptedRecord[field] && typeof decryptedRecord[field] === 'object' && decryptedRecord[field].encryptedData) {
      try {
        const decryptionResult = decryptPHI(decryptedRecord[field], `medical_record.${field}`);
        if (decryptionResult.success) {
          try {
            decryptedRecord[field] = JSON.parse(decryptionResult.data!);
          } catch {
            decryptedRecord[field] = decryptionResult.data;
          }
        } else {
          console.error(`Failed to decrypt medical field ${field}:`, decryptionResult.error);
          decryptedRecord[field] = '[DECRYPTION_FAILED]';
        }
      } catch (error) {
        console.error(`Error decrypting medical field ${field}:`, error);
        decryptedRecord[field] = '[DECRYPTION_ERROR]';
      }
    }
  });
  
  return decryptedRecord;
}

// Función para hashear contraseñas de forma segura
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12; // Aumentado para mayor seguridad médica
  return await bcrypt.hash(password, saltRounds);
}

// Función para verificar contraseñas
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

// Función para generar tokens seguros
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

// Función para generar ID únicos seguros para pacientes
export function generateSecurePatientId(): string {
  const timestamp = Date.now().toString(36);
  const randomBytes = crypto.randomBytes(8).toString('hex');
  return `PAT_${timestamp}_${randomBytes}`.toUpperCase();
}

// Función para generar ID únicos seguros para médicos
export function generateSecureDoctorId(): string {
  const timestamp = Date.now().toString(36);
  const randomBytes = crypto.randomBytes(8).toString('hex');
  return `DOC_${timestamp}_${randomBytes}`.toUpperCase();
}

// Función para generar ID seguros para citas médicas
export function generateSecureAppointmentId(): string {
  const timestamp = Date.now().toString(36);
  const randomBytes = crypto.randomBytes(8).toString('hex');
  return `APT_${timestamp}_${randomBytes}`.toUpperCase();
}

// Función para detectar si un campo contiene PHI
export function isPHIData(fieldName: string, value: any): boolean {
  if (!value) return false;
  
  const fieldNameLower = fieldName.toLowerCase();
  
  // Verificar si el nombre del campo indica PHI
  const containsPHIKeyword = PHI_DATA_TYPES.some(type => 
    fieldNameLower.includes(type.replace('_', ''))
  );
  
  if (containsPHIKeyword) return true;
  
  // Verificar patrones comunes de PHI en el valor
  const valueStr = value.toString();
  
  // SSN pattern
  if (/^\d{3}-?\d{2}-?\d{4}$/.test(valueStr)) return true;
  
  // Medical record number pattern
  if (/^(MRN|MR|MED)\d+$/i.test(valueStr)) return true;
  
  // Fecha de nacimiento pattern
  if (/^\d{4}-\d{2}-\d{2}$/.test(valueStr) && fieldNameLower.includes('birth')) return true;
  
  return false;
}

// Función para auditar acceso a datos encriptados
export async function auditEncryptionAccess(action: 'encrypt' | 'decrypt', dataType: string, userId: string, success: boolean): Promise<void> {
  try {
    const { auditLog } = await import('./audit');
    
    await auditLog({
      action: `phi_${action}`,
      userId,
      resource: 'encryption',
      details: {
        dataType,
        algorithm: encryptionConfig.algorithm,
        timestamp: new Date().toISOString()
      },
      success,
      category: 'medical',
      severity: 'high',
      containsPHI: true
    });
  } catch (error) {
    console.error('Failed to audit encryption access:', error);
  }
}

// Función para rotar claves de encriptación (para producción)
export function rotateEncryptionKey(): string {
  console.warn('🔄 Key rotation should be implemented with proper key management system (AWS KMS, HashiCorp Vault, etc.)');
  
  // En producción: implementar rotación real con sistema de gestión de claves
  const newKey = crypto.randomBytes(32).toString('hex');
  
  console.log('🔑 New encryption key generated (implement proper storage)');
  return newKey;
}

// Función para verificar integridad de configuración de encriptación
export function verifyEncryptionConfig(): boolean {
  try {
    // Verificar que el algoritmo está disponible
    const testCipher = crypto.createCipher(encryptionConfig.algorithm, 'test-key');
    testCipher.update('test', 'utf8', 'hex');
    testCipher.final('hex');
    
    // Verificar longitudes de configuración
    if (encryptionConfig.keyLength < 32) {
      console.error('⚠️  Key length too short for medical data');
      return false;
    }
    
    if (encryptionConfig.iterations < 100000) {
      console.error('⚠️  PBKDF2 iterations too low for medical data');
      return false;
    }
    
    // Verificar clave maestra
    if (MASTER_KEY === 'CHANGE-THIS-IN-PRODUCTION-USE-PROPER-KEY-MANAGEMENT') {
      console.warn('⚠️  Using default master key - CHANGE IN PRODUCTION!');
      return false;
    }
    
    console.log('✅ Encryption configuration verified');
    return true;
    
  } catch (error) {
    console.error('❌ Encryption configuration verification failed:', error);
    return false;
  }
}

// Exportar configuración para monitoreo
export function getEncryptionStatus() {
  return {
    algorithm: encryptionConfig.algorithm,
    keyLength: encryptionConfig.keyLength,
    configValid: verifyEncryptionConfig(),
    masterKeyConfigured: MASTER_KEY !== 'CHANGE-THIS-IN-PRODUCTION-USE-PROPER-KEY-MANAGEMENT'
  };
}

export default {
  encryptPHI,
  decryptPHI,
  encryptPatientData,
  decryptPatientData,
  encryptMedicalRecord,
  decryptMedicalRecord,
  hashPassword,
  verifyPassword,
  generateSecureToken,
  generateSecurePatientId,
  generateSecureDoctorId,
  generateSecureAppointmentId,
  isPHIData,
  auditEncryptionAccess,
  rotateEncryptionKey,
  verifyEncryptionConfig,
  getEncryptionStatus
};
