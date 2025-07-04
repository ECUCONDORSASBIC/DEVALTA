import CryptoJS from 'crypto-js';

// Configuración de encriptación para datos médicos
const ENCRYPTION_KEY = process.env.MEDICAL_ENCRYPTION_KEY || 'default-key-change-in-production';
const ALGORITHM = 'AES-256-CBC';

export interface EncryptedData {
  encrypted: string;
  iv: string;
  algorithm: string;
  timestamp: string;
}

export interface DecryptionResult {
  success: boolean;
  data?: string;
  error?: string;
}

/**
 * Encripta datos médicos sensibles (PHI - Protected Health Information)
 * Cumple con estándares HIPAA para encriptación de datos en reposo
 */
export const encryptMedicalData = (data: string, salt?: string): EncryptedData => {
  try {
    const iv = CryptoJS.lib.WordArray.random(16);
    const key = salt ? 
      CryptoJS.PBKDF2(ENCRYPTION_KEY, salt, { keySize: 256/32 }) :
      CryptoJS.enc.Utf8.parse(ENCRYPTION_KEY);
    
    const encrypted = CryptoJS.AES.encrypt(data, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });

    return {
      encrypted: encrypted.toString(),
      iv: iv.toString(),
      algorithm: ALGORITHM,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    throw new Error(`Error encriptando datos médicos: ${error}`);
  }
};

/**
 * Desencripta datos médicos sensibles
 */
export const decryptMedicalData = (encryptedData: EncryptedData, salt?: string): DecryptionResult => {
  try {
    const key = salt ? 
      CryptoJS.PBKDF2(ENCRYPTION_KEY, salt, { keySize: 256/32 }) :
      CryptoJS.enc.Utf8.parse(ENCRYPTION_KEY);
    
    const decrypted = CryptoJS.AES.decrypt(encryptedData.encrypted, key, {
      iv: CryptoJS.enc.Hex.parse(encryptedData.iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });

    const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!decryptedString) {
      return {
        success: false,
        error: 'Datos encriptados inválidos o clave incorrecta'
      };
    }

    return {
      success: true,
      data: decryptedString
    };
  } catch (error) {
    return {
      success: false,
      error: `Error desencriptando datos: ${error}`
    };
  }
};

/**
 * Genera un hash seguro para contraseñas médicas
 */
export const hashMedicalPassword = (password: string, salt?: string): string => {
  const saltToUse = salt || CryptoJS.lib.WordArray.random(128/8).toString();
  const hash = CryptoJS.PBKDF2(password, saltToUse, {
    keySize: 256/32,
    iterations: 10000
  });
  
  return `${saltToUse}:${hash.toString()}`;
};

/**
 * Verifica una contraseña médica contra su hash
 */
export const verifyMedicalPassword = (password: string, hashedPassword: string): boolean => {
  try {
    const [salt, hash] = hashedPassword.split(':');
    const testHash = CryptoJS.PBKDF2(password, salt, {
      keySize: 256/32,
      iterations: 10000
    }).toString();
    
    return testHash === hash;
  } catch (error) {
    return false;
  }
};

/**
 * Genera un token seguro para sesiones médicas
 */
export const generateMedicalToken = (userId: string, sessionData: Record<string, any>): string => {
  const payload = {
    userId,
    sessionData,
    timestamp: Date.now(),
    nonce: CryptoJS.lib.WordArray.random(16).toString()
  };
  
  const payloadString = JSON.stringify(payload);
  return encryptMedicalData(payloadString).encrypted;
};

/**
 * Valida un token de sesión médica
 */
export const validateMedicalToken = (token: string): { valid: boolean; data?: any } => {
  try {
    const decrypted = decryptMedicalData({ 
      encrypted: token, 
      iv: '', 
      algorithm: ALGORITHM, 
      timestamp: new Date().toISOString() 
    });
    
    if (!decrypted.success || !decrypted.data) {
      return { valid: false };
    }
    
    const payload = JSON.parse(decrypted.data);
    const tokenAge = Date.now() - payload.timestamp;
    const maxAge = 24 * 60 * 60 * 1000; // 24 horas
    
    if (tokenAge > maxAge) {
      return { valid: false };
    }
    
    return { valid: true, data: payload };
  } catch (error) {
    return { valid: false };
  }
}; 