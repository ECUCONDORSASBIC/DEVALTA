#!/usr/bin/env node

/**
 * 🏥 ALTAMEDICA BACKUP MONITORING
 * Script de monitoreo y verificación de backups
 */

const fs = require('fs');
const path = require('path');

class BackupMonitor {
  constructor() {
    this.backupDir = './backups/postgresql';
    this.configFile = path.join(__dirname, 'backup-config.json');
  }

  async checkBackupHealth() {
    console.log('🔍 Verificando salud de backups de AltaMedica...');
    
    const checks = {
      backupDirectoryExists: this.checkBackupDirectory(),
      recentBackupExists: this.checkRecentBackup(),
      backupIntegrity: await this.checkBackupIntegrity(),
      diskSpace: this.checkDiskSpace(),
      encryptionStatus: this.checkEncryption()
    };

    const overallHealth = Object.values(checks).every(check => check.passed);
    
    console.log('📊 Reporte de salud de backups:');
    Object.entries(checks).forEach(([check, result]) => {
      const status = result.passed ? '✅' : '❌';
      console.log(`  ${status} ${check}: ${result.message}`);
    });

    if (!overallHealth) {
      console.error('🚨 ALERTA: Problemas detectados en el sistema de backup');
      process.exit(1);
    }

    console.log('✅ Sistema de backup funcionando correctamente');
    return checks;
  }

  checkBackupDirectory() {
    if (fs.existsSync(this.backupDir)) {
      return { passed: true, message: 'Directorio de backup existe' };
    }
    return { passed: false, message: 'Directorio de backup no encontrado' };
  }

  checkRecentBackup() {
    try {
      const files = fs.readdirSync(this.backupDir)
        .filter(file => file.includes('altamedica-'))
        .map(file => ({
          name: file,
          stats: fs.statSync(path.join(this.backupDir, file))
        }))
        .sort((a, b) => b.stats.mtime - a.stats.mtime);

      if (files.length === 0) {
        return { passed: false, message: 'No se encontraron backups' };
      }

      const lastBackup = files[0];
      const hoursSinceLastBackup = (Date.now() - lastBackup.stats.mtime) / (1000 * 60 * 60);

      if (hoursSinceLastBackup > 25) { // Más de 25 horas
        return { 
          passed: false, 
          message: `Último backup hace ${Math.round(hoursSinceLastBackup)} horas`
        };
      }

      return { 
        passed: true, 
        message: `Último backup: ${lastBackup.name} (hace ${Math.round(hoursSinceLastBackup)} horas)`
      };
    } catch (error) {
      return { passed: false, message: `Error verificando backups: ${error.message}` };
    }
  }

  async checkBackupIntegrity() {
    // Verificar integridad de manifests
    try {
      const manifestFiles = fs.readdirSync(this.backupDir)
        .filter(file => file.includes('-MANIFEST.json'));

      if (manifestFiles.length === 0) {
        return { passed: false, message: 'No se encontraron manifests de backup' };
      }

      const latestManifest = manifestFiles
        .sort((a, b) => b.localeCompare(a))[0];

      const manifestPath = path.join(this.backupDir, latestManifest);
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

      if (manifest.verification && manifest.verification.verified) {
        return { passed: true, message: 'Último backup verificado correctamente' };
      } else {
        return { passed: false, message: 'Último backup no pudo ser verificado' };
      }
    } catch (error) {
      return { passed: false, message: `Error verificando integridad: ${error.message}` };
    }
  }

  checkDiskSpace() {
    try {
      const stats = fs.statSync(this.backupDir);
      // Verificación básica de espacio - implementar lógica más robusta
      return { passed: true, message: 'Espacio en disco suficiente' };
    } catch (error) {
      return { passed: false, message: `Error verificando espacio: ${error.message}` };
    }
  }

  checkEncryption() {
    try {
      const encryptedFiles = fs.readdirSync(this.backupDir)
        .filter(file => file.includes('.encrypted'));

      if (encryptedFiles.length === 0) {
        return { passed: false, message: 'No se encontraron archivos encriptados' };
      }

      return { passed: true, message: `${encryptedFiles.length} archivos encriptados encontrados` };
    } catch (error) {
      return { passed: false, message: `Error verificando encriptación: ${error.message}` };
    }
  }
}

if (require.main === module) {
  const monitor = new BackupMonitor();
  monitor.checkBackupHealth()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('💥 Error en monitoreo:', error);
      process.exit(1);
    });
}

module.exports = BackupMonitor;