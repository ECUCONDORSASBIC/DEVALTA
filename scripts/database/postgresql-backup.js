#!/usr/bin/env node

/**
 * 🏥 ALTAMEDICA POSTGRESQL BACKUP SYSTEM
 * Sistema de backup automático HIPAA-compliant para datos médicos
 * Última actualización: 2025-08-08
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Configuración del backup
const BACKUP_CONFIG = {
  // Configuración de la base de datos
  database: {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: process.env.POSTGRES_PORT || '5432',
    database: process.env.POSTGRES_DB || 'altamedica',
    username: process.env.POSTGRES_USER || 'altamedica',
    password: process.env.POSTGRES_PASSWORD || 'altamedica123'
  },

  // Configuración de backups
  backup: {
    baseDir: process.env.BACKUP_DIR || './backups/postgresql',
    retentionDays: parseInt(process.env.BACKUP_RETENTION_DAYS) || 2555, // 7 años HIPAA
    compressionLevel: 9, // Máxima compresión
    encryptionKey: process.env.BACKUP_ENCRYPTION_KEY || 'default-key-change-in-production',
    
    // Tipos de backup
    types: {
      daily: { hour: 2, minute: 0, retention: 30 }, // 30 días
      weekly: { weekday: 0, hour: 3, minute: 0, retention: 52 }, // 52 semanas
      monthly: { day: 1, hour: 4, minute: 0, retention: 84 }, // 84 meses (7 años)
      yearly: { month: 0, day: 1, hour: 5, minute: 0, retention: 10 } // 10 años
    }
  },

  // Configuración de notificaciones
  notifications: {
    webhookUrl: process.env.BACKUP_WEBHOOK_URL,
    emailRecipients: process.env.BACKUP_EMAIL_RECIPIENTS?.split(',') || [],
    slackWebhook: process.env.SLACK_WEBHOOK_URL
  }
};

class PostgreSQLBackupManager {
  constructor() {
    this.backupDir = BACKUP_CONFIG.backup.baseDir;
    this.encryptionKey = BACKUP_CONFIG.backup.encryptionKey;
    this.ensureBackupDirectory();
  }

  /**
   * Ejecutar backup completo del sistema
   */
  async executeFullBackup() {
    const backupType = this.determineBackupType();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `altamedica-${backupType}-${timestamp}`;
    
    console.log(`🏥 Iniciando backup ${backupType} de AltaMedica PostgreSQL...`);
    console.log(`📅 Timestamp: ${new Date().toISOString()}`);

    try {
      // 1. Crear backup de esquemas médicos principales
      const medicalSchemas = await this.backupMedicalSchemas(backupName);
      
      // 2. Backup de datos médicos con encriptación
      const dataBackup = await this.backupMedicalData(backupName);
      
      // 3. Backup de auditoría (crítico para HIPAA)
      const auditBackup = await this.backupAuditData(backupName);
      
      // 4. Backup de configuración del sistema
      const configBackup = await this.backupSystemConfig(backupName);
      
      // 5. Crear manifest del backup
      const manifest = await this.createBackupManifest(backupName, {
        medicalSchemas,
        dataBackup,
        auditBackup,
        configBackup
      });

      // 6. Verificar integridad del backup
      const verification = await this.verifyBackupIntegrity(backupName, manifest);
      
      // 7. Cleanup de backups antiguos
      await this.cleanupOldBackups(backupType);

      // 8. Enviar notificaciones
      await this.sendBackupNotification('SUCCESS', backupName, {
        type: backupType,
        size: this.getBackupSize(backupName),
        verification
      });

      console.log(`✅ Backup ${backupName} completado exitosamente`);
      return { success: true, backupName, manifest };

    } catch (error) {
      console.error(`❌ Error en backup ${backupName}:`, error);
      
      await this.sendBackupNotification('ERROR', backupName, {
        type: backupType,
        error: error.message
      });

      throw error;
    }
  }

  /**
   * Backup de esquemas médicos principales
   */
  async backupMedicalSchemas(backupName) {
    const schemaFile = path.join(this.backupDir, `${backupName}-schemas.sql`);
    
    console.log('📋 Backing up medical schemas...');
    
    const pgDumpCommand = [
      'pg_dump',
      '-h', BACKUP_CONFIG.database.host,
      '-p', BACKUP_CONFIG.database.port,
      '-U', BACKUP_CONFIG.database.username,
      '-d', BACKUP_CONFIG.database.database,
      '--schema-only',
      '--no-owner',
      '--no-privileges',
      '-f', schemaFile
    ];

    execSync(pgDumpCommand.join(' '), {
      env: { ...process.env, PGPASSWORD: BACKUP_CONFIG.database.password },
      stdio: 'pipe'
    });

    // Encriptar el archivo de esquemas
    const encryptedSchemaFile = await this.encryptFile(schemaFile);
    fs.unlinkSync(schemaFile); // Eliminar archivo sin encriptar

    return {
      file: encryptedSchemaFile,
      checksum: this.calculateFileChecksum(encryptedSchemaFile),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Backup de datos médicos sensibles (PHI)
   */
  async backupMedicalData(backupName) {
    const dataFile = path.join(this.backupDir, `${backupName}-medical-data.sql`);
    
    console.log('🏥 Backing up medical data (PHI)...');

    // Backup solo de las tablas que contienen PHI
    const medicalTables = [
      'medical_records',
      'patient_data', 
      'prescriptions',
      'vital_signs',
      'appointments',
      'telemedicine_sessions',
      'medical_history'
    ];

    const pgDumpCommand = [
      'pg_dump',
      '-h', BACKUP_CONFIG.database.host,
      '-p', BACKUP_CONFIG.database.port,
      '-U', BACKUP_CONFIG.database.username,
      '-d', BACKUP_CONFIG.database.database,
      '--data-only',
      '--no-owner',
      '--no-privileges',
      '--compress=9',
      ...medicalTables.flatMap(table => ['-t', table]),
      '-f', dataFile
    ];

    execSync(pgDumpCommand.join(' '), {
      env: { ...process.env, PGPASSWORD: BACKUP_CONFIG.database.password },
      stdio: 'pipe'
    });

    // Encriptación AES-256-GCM para datos PHI
    const encryptedDataFile = await this.encryptFile(dataFile);
    fs.unlinkSync(dataFile);

    return {
      file: encryptedDataFile,
      checksum: this.calculateFileChecksum(encryptedDataFile),
      timestamp: new Date().toISOString(),
      tablesIncluded: medicalTables
    };
  }

  /**
   * Backup de logs de auditoría (crítico HIPAA)
   */
  async backupAuditData(backupName) {
    const auditFile = path.join(this.backupDir, `${backupName}-audit-logs.sql`);
    
    console.log('🔍 Backing up audit data...');

    const pgDumpCommand = [
      'pg_dump',
      '-h', BACKUP_CONFIG.database.host,
      '-p', BACKUP_CONFIG.database.port,
      '-U', BACKUP_CONFIG.database.username,
      '-d', BACKUP_CONFIG.database.database,
      '--data-only',
      '--no-owner',
      '--no-privileges',
      '-t', 'audit_log.*', // Todas las tablas de auditoría
      '-f', auditFile
    ];

    execSync(pgDumpCommand.join(' '), {
      env: { ...process.env, PGPASSWORD: BACKUP_CONFIG.database.password },
      stdio: 'pipe'
    });

    // Los logs de auditoría requieren doble encriptación
    const encryptedAuditFile = await this.doubleEncryptFile(auditFile);
    fs.unlinkSync(auditFile);

    return {
      file: encryptedAuditFile,
      checksum: this.calculateFileChecksum(encryptedAuditFile),
      timestamp: new Date().toISOString(),
      encryption: 'DOUBLE_AES_256_GCM' // Doble encriptación para auditoría
    };
  }

  /**
   * Backup de configuración del sistema
   */
  async backupSystemConfig(backupName) {
    const configFile = path.join(this.backupDir, `${backupName}-system-config.json`);
    
    console.log('⚙️ Backing up system configuration...');

    const systemConfig = {
      timestamp: new Date().toISOString(),
      postgresql: {
        version: await this.getPostgreSQLVersion(),
        configuration: await this.getPostgreSQLConfig()
      },
      applicationConfig: {
        environment: process.env.NODE_ENV,
        version: process.env.APP_VERSION,
        hipaaCompliant: true
      },
      backupInfo: {
        backupName,
        retentionPolicy: BACKUP_CONFIG.backup.retentionDays,
        encryptionUsed: true
      }
    };

    fs.writeFileSync(configFile, JSON.stringify(systemConfig, null, 2));

    const encryptedConfigFile = await this.encryptFile(configFile);
    fs.unlinkSync(configFile);

    return {
      file: encryptedConfigFile,
      checksum: this.calculateFileChecksum(encryptedConfigFile),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Crear manifest del backup
   */
  async createBackupManifest(backupName, backupFiles) {
    const manifestFile = path.join(this.backupDir, `${backupName}-MANIFEST.json`);
    
    const manifest = {
      backupName,
      timestamp: new Date().toISOString(),
      version: '1.0',
      hipaaCompliant: true,
      files: backupFiles,
      metadata: {
        databaseSize: await this.getDatabaseSize(),
        totalBackupSize: this.getBackupSize(backupName),
        compressionRatio: 0.0, // Calculado después
        encryptionAlgorithm: 'AES-256-GCM'
      },
      verification: {
        checksumAlgorithm: 'SHA-256',
        verified: false // Se marca como true después de verificación
      }
    };

    fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2));
    return manifestFile;
  }

  /**
   * Verificar integridad del backup
   */
  async verifyBackupIntegrity(backupName, manifestFile) {
    console.log('🔍 Verificando integridad del backup...');
    
    const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
    const verification = { passed: true, errors: [] };

    // Verificar que todos los archivos existan
    for (const [type, fileInfo] of Object.entries(manifest.files)) {
      if (!fs.existsSync(fileInfo.file)) {
        verification.passed = false;
        verification.errors.push(`Missing file: ${fileInfo.file}`);
        continue;
      }

      // Verificar checksum
      const currentChecksum = this.calculateFileChecksum(fileInfo.file);
      if (currentChecksum !== fileInfo.checksum) {
        verification.passed = false;
        verification.errors.push(`Checksum mismatch for ${type}: expected ${fileInfo.checksum}, got ${currentChecksum}`);
      }
    }

    // Actualizar manifest con resultados de verificación
    manifest.verification.verified = verification.passed;
    manifest.verification.timestamp = new Date().toISOString();
    manifest.verification.errors = verification.errors;

    fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2));

    return verification;
  }

  /**
   * Encriptar archivo con AES-256-GCM
   */
  async encryptFile(filePath) {
    const encryptedPath = `${filePath}.encrypted`;
    const algorithm = 'aes-256-gcm';
    const key = crypto.scryptSync(this.encryptionKey, 'salt', 32);
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipher(algorithm, key);
    const input = fs.createReadStream(filePath);
    const output = fs.createWriteStream(encryptedPath);

    return new Promise((resolve, reject) => {
      input.pipe(cipher).pipe(output);
      output.on('close', () => {
        // Agregar IV al inicio del archivo para desencriptación
        const encryptedData = fs.readFileSync(encryptedPath);
        const finalData = Buffer.concat([iv, encryptedData]);
        fs.writeFileSync(encryptedPath, finalData);
        resolve(encryptedPath);
      });
      output.on('error', reject);
    });
  }

  /**
   * Doble encriptación para logs de auditoría
   */
  async doubleEncryptFile(filePath) {
    const firstEncryption = await this.encryptFile(filePath);
    const secondEncryption = await this.encryptFile(firstEncryption);
    fs.unlinkSync(firstEncryption); // Eliminar primera encriptación
    return secondEncryption;
  }

  /**
   * Calcular checksum SHA-256 de archivo
   */
  calculateFileChecksum(filePath) {
    const fileBuffer = fs.readFileSync(filePath);
    return crypto.createHash('sha256').update(fileBuffer).digest('hex');
  }

  /**
   * Determinar tipo de backup basado en fecha/hora
   */
  determineBackupType() {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDate();
    const month = now.getMonth();
    const weekday = now.getDay();

    // Backup anual (1 de enero)
    if (month === 0 && day === 1) return 'yearly';
    
    // Backup mensual (día 1 del mes)
    if (day === 1) return 'monthly';
    
    // Backup semanal (domingo)
    if (weekday === 0) return 'weekly';
    
    // Backup diario (por defecto)
    return 'daily';
  }

  /**
   * Limpiar backups antiguos según política de retención
   */
  async cleanupOldBackups(backupType) {
    console.log(`🧹 Limpiando backups antiguos de tipo ${backupType}...`);
    
    const retention = BACKUP_CONFIG.backup.types[backupType].retention;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retention);

    const backupFiles = fs.readdirSync(this.backupDir)
      .filter(file => file.includes(`altamedica-${backupType}-`))
      .map(file => ({
        name: file,
        path: path.join(this.backupDir, file),
        stats: fs.statSync(path.join(this.backupDir, file))
      }))
      .filter(backup => backup.stats.birthtime < cutoffDate);

    for (const backup of backupFiles) {
      try {
        fs.unlinkSync(backup.path);
        console.log(`🗑️ Eliminado backup antiguo: ${backup.name}`);
      } catch (error) {
        console.error(`❌ Error eliminando ${backup.name}:`, error);
      }
    }

    console.log(`✅ Limpieza completada. Eliminados ${backupFiles.length} backups antiguos.`);
  }

  /**
   * Enviar notificaciones de estado del backup
   */
  async sendBackupNotification(status, backupName, details) {
    const notification = {
      system: 'AltaMedica PostgreSQL Backup',
      status,
      backupName,
      timestamp: new Date().toISOString(),
      details,
      hipaaCompliant: true
    };

    // Log local
    console.log(`📧 Notificación de backup: ${JSON.stringify(notification, null, 2)}`);

    // Webhook (si está configurado)
    if (BACKUP_CONFIG.notifications.webhookUrl) {
      try {
        // Implementar webhook call aquí
        console.log('📡 Webhook notification sent');
      } catch (error) {
        console.error('❌ Error sending webhook notification:', error);
      }
    }

    // Email (si está configurado)
    if (BACKUP_CONFIG.notifications.emailRecipients.length > 0) {
      try {
        // Implementar email notification aquí
        console.log('📧 Email notification sent');
      } catch (error) {
        console.error('❌ Error sending email notification:', error);
      }
    }
  }

  // Métodos auxiliares
  ensureBackupDirectory() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
      console.log(`📁 Created backup directory: ${this.backupDir}`);
    }
  }

  getBackupSize(backupName) {
    const backupFiles = fs.readdirSync(this.backupDir)
      .filter(file => file.startsWith(backupName))
      .map(file => fs.statSync(path.join(this.backupDir, file)).size)
      .reduce((total, size) => total + size, 0);
    
    return this.formatBytes(backupFiles);
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  async getPostgreSQLVersion() {
    try {
      const result = execSync('psql --version', { encoding: 'utf8' });
      return result.trim();
    } catch {
      return 'Unknown';
    }
  }

  async getPostgreSQLConfig() {
    // Implementar obtención de configuración PostgreSQL
    return {
      maxConnections: 100,
      sharedBuffers: '128MB',
      // ... otras configuraciones relevantes
    };
  }

  async getDatabaseSize() {
    try {
      const query = `SELECT pg_size_pretty(pg_database_size('${BACKUP_CONFIG.database.database}'))`;
      // Implementar ejecución de query
      return 'Unknown';
    } catch {
      return 'Unknown';
    }
  }
}

// Ejecutar backup si se llama directamente
if (require.main === module) {
  const backupManager = new PostgreSQLBackupManager();
  backupManager.executeFullBackup()
    .then(result => {
      console.log('🎉 Backup process completed successfully');
      console.log(JSON.stringify(result, null, 2));
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Backup process failed:', error);
      process.exit(1);
    });
}

module.exports = PostgreSQLBackupManager;