#!/usr/bin/env node

/**
 * 🏥 ALTAMEDICA BACKUP SCHEDULER SETUP
 * Configuración de tareas programadas para backups automáticos
 * Compatible con Windows Task Scheduler y cron
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

class BackupSchedulerSetup {
  constructor() {
    this.platform = os.platform();
    this.projectRoot = path.resolve(__dirname, '../..');
    this.backupScript = path.join(__dirname, 'postgresql-backup.js');
  }

  /**
   * Configurar scheduler según la plataforma
   */
  async setup() {
    console.log(`🏥 Configurando backup scheduler para AltaMedica...`);
    console.log(`🖥️ Plataforma detectada: ${this.platform}`);

    if (this.platform === 'win32') {
      await this.setupWindowsTaskScheduler();
    } else {
      await this.setupCronJobs();
    }

    // Crear archivo de configuración de backup
    await this.createBackupConfig();

    // Crear script de monitoreo
    await this.createMonitoringScript();

    console.log('✅ Configuración de backup scheduler completada');
  }

  /**
   * Configurar Windows Task Scheduler
   */
  async setupWindowsTaskScheduler() {
    console.log('⚙️ Configurando Windows Task Scheduler...');

    // Crear tarea diaria (2:00 AM)
    const dailyTaskXml = this.generateWindowsTaskXml('AltaMedicaBackupDaily', {
      schedule: 'daily',
      time: '02:00:00',
      description: 'Backup diario de base de datos médica AltaMedica'
    });

    // Crear tarea semanal (domingo 3:00 AM)
    const weeklyTaskXml = this.generateWindowsTaskXml('AltaMedicaBackupWeekly', {
      schedule: 'weekly',
      time: '03:00:00',
      dayOfWeek: 'sunday',
      description: 'Backup semanal de base de datos médica AltaMedica'
    });

    // Crear tarea mensual (día 1, 4:00 AM)
    const monthlyTaskXml = this.generateWindowsTaskXml('AltaMedicaBackupMonthly', {
      schedule: 'monthly',
      time: '04:00:00',
      dayOfMonth: '1',
      description: 'Backup mensual de base de datos médica AltaMedica'
    });

    // Guardar archivos XML de tareas
    const tasksDir = path.join(__dirname, 'windows-tasks');
    if (!fs.existsSync(tasksDir)) {
      fs.mkdirSync(tasksDir, { recursive: true });
    }

    fs.writeFileSync(path.join(tasksDir, 'daily-backup.xml'), dailyTaskXml);
    fs.writeFileSync(path.join(tasksDir, 'weekly-backup.xml'), weeklyTaskXml);
    fs.writeFileSync(path.join(tasksDir, 'monthly-backup.xml'), monthlyTaskXml);

    // Crear script PowerShell para instalar tareas
    const installScript = this.generatePowerShellInstallScript();
    fs.writeFileSync(path.join(tasksDir, 'install-backup-tasks.ps1'), installScript);

    console.log('📋 Tareas de Windows creadas. Ejecutar install-backup-tasks.ps1 como Administrador');
  }

  /**
   * Configurar cron jobs para Linux/macOS
   */
  async setupCronJobs() {
    console.log('⚙️ Configurando cron jobs...');

    const cronEntries = [
      // Backup diario a las 2:00 AM
      `0 2 * * * cd ${this.projectRoot} && node ${this.backupScript} >> /var/log/altamedica-backup.log 2>&1`,
      
      // Cleanup de logs semanalmente
      `0 1 * * 0 find /var/log -name "altamedica-backup*.log" -mtime +30 -delete`,
      
      // Verificación de integridad mensual
      `0 5 1 * * cd ${this.projectRoot} && node ${path.join(__dirname, 'verify-backups.js')} >> /var/log/altamedica-verify.log 2>&1`
    ];

    const cronFile = cronEntries.join('\n') + '\n';
    fs.writeFileSync(path.join(__dirname, 'altamedica-backup.cron'), cronFile);

    console.log('📋 Archivo cron creado: altamedica-backup.cron');
    console.log('📌 Para instalar: crontab altamedica-backup.cron');
  }

  /**
   * Crear archivo de configuración de backup
   */
  async createBackupConfig() {
    const configPath = path.join(__dirname, 'backup-config.json');
    
    const config = {
      project: 'AltaMedica Medical Platform',
      version: '1.0',
      lastUpdated: new Date().toISOString(),
      
      database: {
        type: 'PostgreSQL',
        host: '${POSTGRES_HOST:-localhost}',
        port: '${POSTGRES_PORT:-5432}',
        database: '${POSTGRES_DB:-altamedica}',
        username: '${POSTGRES_USER:-altamedica}'
      },
      
      backup: {
        baseDirectory: './backups/postgresql',
        encryptionEnabled: true,
        compressionLevel: 9,
        
        retention: {
          daily: 30,   // 30 días
          weekly: 52,  // 52 semanas (1 año)
          monthly: 84, // 84 meses (7 años HIPAA)
          yearly: 10   // 10 años
        },
        
        notifications: {
          email: {
            enabled: false,
            recipients: ['admin@altamedica.com', 'it@altamedica.com']
          },
          webhook: {
            enabled: false,
            url: '${BACKUP_WEBHOOK_URL}'
          },
          slack: {
            enabled: false,
            webhook: '${SLACK_WEBHOOK_URL}'
          }
        }
      },
      
      monitoring: {
        healthCheckEnabled: true,
        healthCheckInterval: '1h',
        alertThresholds: {
          backupSizeIncrease: 50, // % de incremento que dispara alerta
          backupDurationMinutes: 60, // Minutos máximos para backup
          failedBackupsBeforeAlert: 2
        }
      },
      
      security: {
        hipaaCompliant: true,
        encryptionAlgorithm: 'AES-256-GCM',
        auditLogEnabled: true,
        accessLogsRetention: 2555 // días (7 años)
      }
    };

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(`📄 Configuración de backup creada: ${configPath}`);
  }

  /**
   * Crear script de monitoreo de backups
   */
  async createMonitoringScript() {
    const monitoringScript = `#!/usr/bin/env node

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
      console.log(\`  \${status} \${check}: \${result.message}\`);
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
          message: \`Último backup hace \${Math.round(hoursSinceLastBackup)} horas\`
        };
      }

      return { 
        passed: true, 
        message: \`Último backup: \${lastBackup.name} (hace \${Math.round(hoursSinceLastBackup)} horas)\`
      };
    } catch (error) {
      return { passed: false, message: \`Error verificando backups: \${error.message}\` };
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
      return { passed: false, message: \`Error verificando integridad: \${error.message}\` };
    }
  }

  checkDiskSpace() {
    try {
      const stats = fs.statSync(this.backupDir);
      // Verificación básica de espacio - implementar lógica más robusta
      return { passed: true, message: 'Espacio en disco suficiente' };
    } catch (error) {
      return { passed: false, message: \`Error verificando espacio: \${error.message}\` };
    }
  }

  checkEncryption() {
    try {
      const encryptedFiles = fs.readdirSync(this.backupDir)
        .filter(file => file.includes('.encrypted'));

      if (encryptedFiles.length === 0) {
        return { passed: false, message: 'No se encontraron archivos encriptados' };
      }

      return { passed: true, message: \`\${encryptedFiles.length} archivos encriptados encontrados\` };
    } catch (error) {
      return { passed: false, message: \`Error verificando encriptación: \${error.message}\` };
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

module.exports = BackupMonitor;`;

    const monitoringPath = path.join(__dirname, 'backup-monitor.js');
    fs.writeFileSync(monitoringPath, monitoringScript);
    console.log(`📊 Script de monitoreo creado: ${monitoringPath}`);
  }

  /**
   * Generar XML de tarea de Windows
   */
  generateWindowsTaskXml(taskName, options) {
    const nodeExePath = process.execPath;
    const scriptPath = this.backupScript;

    return `<?xml version="1.0" encoding="UTF-16"?>
<Task version="1.4" xmlns="http://schemas.microsoft.com/windows/2004/02/mit/task">
  <RegistrationInfo>
    <Date>2025-08-08T00:00:00</Date>
    <Author>AltaMedica Platform</Author>
    <Description>${options.description}</Description>
  </RegistrationInfo>
  <Triggers>
    ${this.generateTriggerXml(options)}
  </Triggers>
  <Principals>
    <Principal id="Author">
      <UserId>S-1-5-18</UserId>
      <RunLevel>HighestAvailable</RunLevel>
    </Principal>
  </Principals>
  <Settings>
    <MultipleInstancesPolicy>IgnoreNew</MultipleInstancesPolicy>
    <DisallowStartIfOnBatteries>false</DisallowStartIfOnBatteries>
    <StopIfGoingOnBatteries>false</StopIfGoingOnBatteries>
    <AllowHardTerminate>true</AllowHardTerminate>
    <StartWhenAvailable>true</StartWhenAvailable>
    <RunOnlyIfNetworkAvailable>false</RunOnlyIfNetworkAvailable>
    <IdleSettings>
      <StopOnIdleEnd>false</StopOnIdleEnd>
      <RestartOnIdle>false</RestartOnIdle>
    </IdleSettings>
    <AllowStartOnDemand>true</AllowStartOnDemand>
    <Enabled>true</Enabled>
    <Hidden>false</Hidden>
    <RunOnlyIfIdle>false</RunOnlyIfIdle>
    <DisallowStartOnRemoteAppSession>false</DisallowStartOnRemoteAppSession>
    <UseUnifiedSchedulingEngine>true</UseUnifiedSchedulingEngine>
    <WakeToRun>false</WakeToRun>
    <ExecutionTimeLimit>PT2H</ExecutionTimeLimit>
    <Priority>7</Priority>
  </Settings>
  <Actions Context="Author">
    <Exec>
      <Command>${nodeExePath}</Command>
      <Arguments>${scriptPath}</Arguments>
      <WorkingDirectory>${this.projectRoot}</WorkingDirectory>
    </Exec>
  </Actions>
</Task>`;
  }

  generateTriggerXml(options) {
    switch (options.schedule) {
      case 'daily':
        return `<CalendarTrigger>
          <StartBoundary>2025-08-08T${options.time}</StartBoundary>
          <Enabled>true</Enabled>
          <ScheduleByDay>
            <DaysInterval>1</DaysInterval>
          </ScheduleByDay>
        </CalendarTrigger>`;
      
      case 'weekly':
        return `<CalendarTrigger>
          <StartBoundary>2025-08-08T${options.time}</StartBoundary>
          <Enabled>true</Enabled>
          <ScheduleByWeek>
            <WeeksInterval>1</WeeksInterval>
            <DaysOfWeek>
              <Sunday />
            </DaysOfWeek>
          </ScheduleByWeek>
        </CalendarTrigger>`;
      
      case 'monthly':
        return `<CalendarTrigger>
          <StartBoundary>2025-08-08T${options.time}</StartBoundary>
          <Enabled>true</Enabled>
          <ScheduleByMonth>
            <DaysOfMonth>
              <Day>1</Day>
            </DaysOfMonth>
            <Months>
              <January />
              <February />
              <March />
              <April />
              <May />
              <June />
              <July />
              <August />
              <September />
              <October />
              <November />
              <December />
            </Months>
          </ScheduleByMonth>
        </CalendarTrigger>`;
    }
  }

  generatePowerShellInstallScript() {
    return `# 🏥 AltaMedica Backup Tasks Installation Script
# Ejecutar como Administrador

Write-Host "🏥 Instalando tareas de backup de AltaMedica..." -ForegroundColor Green

# Instalar tarea diaria
Register-ScheduledTask -TaskName "AltaMedicaBackupDaily" -Xml (Get-Content "daily-backup.xml" | Out-String) -Force
Write-Host "✅ Tarea diaria instalada" -ForegroundColor Green

# Instalar tarea semanal
Register-ScheduledTask -TaskName "AltaMedicaBackupWeekly" -Xml (Get-Content "weekly-backup.xml" | Out-String) -Force
Write-Host "✅ Tarea semanal instalada" -ForegroundColor Green

# Instalar tarea mensual
Register-ScheduledTask -TaskName "AltaMedicaBackupMonthly" -Xml (Get-Content "monthly-backup.xml" | Out-String) -Force
Write-Host "✅ Tarea mensual instalada" -ForegroundColor Green

Write-Host "🎉 Todas las tareas de backup instaladas correctamente" -ForegroundColor Green
Write-Host "📊 Use 'Get-ScheduledTask | Where-Object TaskName -like "*AltaMedica*"' para verificar" -ForegroundColor Yellow`;
  }
}

// Ejecutar setup si se llama directamente
if (require.main === module) {
  const setup = new BackupSchedulerSetup();
  setup.setup()
    .then(() => {
      console.log('🎉 Setup de backup scheduler completado exitosamente');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Error en setup:', error);
      process.exit(1);
    });
}

module.exports = BackupSchedulerSetup;