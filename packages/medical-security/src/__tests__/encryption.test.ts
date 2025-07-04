import { 
  encryptMedicalData, 
  decryptMedicalData, 
  hashMedicalPassword, 
  verifyMedicalPassword 
} from '../encryption';

describe('Medical Encryption Module', () => {
  const testData = 'Datos médicos sensibles del paciente';
  const testPassword = 'ContraseñaSegura123!';

  describe('encryptMedicalData', () => {
    it('should encrypt medical data successfully', () => {
      const encrypted = encryptMedicalData(testData);
      
      expect(encrypted).toBeDefined();
      expect(encrypted.encrypted).toBeDefined();
      expect(encrypted.iv).toBeDefined();
      expect(encrypted.algorithm).toBe('AES-256-CBC');
      expect(encrypted.timestamp).toBeDefined();
      expect(encrypted.encrypted).not.toBe(testData);
    });

    it('should encrypt data with custom salt', () => {
      const salt = 'custom-salt-for-testing';
      const encrypted = encryptMedicalData(testData, salt);
      
      expect(encrypted).toBeDefined();
      expect(encrypted.encrypted).not.toBe(testData);
    });
  });

  describe('decryptMedicalData', () => {
    it('should decrypt data successfully', () => {
      const encrypted = encryptMedicalData(testData);
      const decrypted = decryptMedicalData(encrypted);
      
      expect(decrypted.success).toBe(true);
      expect(decrypted.data).toBe(testData);
    });

    it('should fail with invalid encrypted data', () => {
      const invalidEncrypted = {
        encrypted: 'invalid-data',
        iv: 'invalid-iv',
        algorithm: 'AES-256-CBC',
        timestamp: new Date().toISOString()
      };
      
      const decrypted = decryptMedicalData(invalidEncrypted);
      
      expect(decrypted.success).toBe(false);
      expect(decrypted.error).toBeDefined();
    });
  });

  describe('hashMedicalPassword', () => {
    it('should hash password successfully', () => {
      const hashed = hashMedicalPassword(testPassword);
      
      expect(hashed).toBeDefined();
      expect(hashed).toContain(':');
      expect(hashed).not.toBe(testPassword);
    });

    it('should hash password with custom salt', () => {
      const salt = 'custom-salt';
      const hashed = hashMedicalPassword(testPassword, salt);
      
      expect(hashed).toBeDefined();
      expect(hashed).toContain(salt);
    });
  });

  describe('verifyMedicalPassword', () => {
    it('should verify correct password', () => {
      const hashed = hashMedicalPassword(testPassword);
      const isValid = verifyMedicalPassword(testPassword, hashed);
      
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', () => {
      const hashed = hashMedicalPassword(testPassword);
      const isValid = verifyMedicalPassword('wrong-password', hashed);
      
      expect(isValid).toBe(false);
    });

    it('should handle invalid hash format', () => {
      const isValid = verifyMedicalPassword(testPassword, 'invalid-hash');
      
      expect(isValid).toBe(false);
    });
  });

  describe('End-to-End Encryption/Decryption', () => {
    it('should encrypt and decrypt medical records correctly', () => {
      const medicalRecord = {
        patientId: 'P12345',
        diagnosis: 'Hipertensión arterial',
        medications: ['Lisinopril 10mg'],
        notes: 'Paciente requiere seguimiento mensual'
      };

      const recordString = JSON.stringify(medicalRecord);
      const encrypted = encryptMedicalData(recordString);
      const decrypted = decryptMedicalData(encrypted);
      
      expect(decrypted.success).toBe(true);
      expect(decrypted.data).toBe(recordString);
      
      const decryptedRecord = JSON.parse(decrypted.data!);
      expect(decryptedRecord.patientId).toBe(medicalRecord.patientId);
      expect(decryptedRecord.diagnosis).toBe(medicalRecord.diagnosis);
    });
  });
}); 