#!/usr/bin/env node

/**
 * 🏥 ALTAMEDICA REDIS CLUSTER SETUP
 * Configuración automática de Redis Cluster para alta disponibilidad médica
 * Última actualización: 2025-08-08
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

class RedisClusterSetup {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '../..');
    this.configDir = path.join(this.projectRoot, 'config/redis');
    this.dataDir = path.join(this.projectRoot, 'data/redis-cluster');
    this.logsDir = path.join(this.projectRoot, 'logs/redis');
    
    // Configuración del cluster médico
    this.clusterConfig = {
      nodes: [
        { port: 7001, role: 'master' },
        { port: 7002, role: 'master' }, 
        { port: 7003, role: 'master' },
        { port: 7004, role: 'replica' },
        { port: 7005, role: 'replica' },
        { port: 7006, role: 'replica' }
      ],
      password: 'altamedica_redis_2025!',
      medicalCacheConfig: {
        patientDataTTL: 3600,    // 1 hora para datos de pacientes activos
        appointmentTTL: 86400,   // 24 horas para citas
        sessionTTL: 1800,        // 30 minutos para sesiones WebRTC
        auditLogTTL: 2592000     // 30 días para logs de auditoría en cache
      }
    };
  }

  /**
   * Configurar cluster completo de Redis
   */
  async setupCluster() {
    console.log('🏥 Iniciando configuración de Redis Cluster para AltaMedica...');
    
    try {
      // 1. Preparar directorios
      await this.preparDirectories();
      
      // 2. Generar configuraciones por nodo
      await this.generateNodeConfigurations();
      
      // 3. Iniciar nodos Redis
      await this.startRedisNodes();
      
      // 4. Crear cluster
      await this.createCluster();
      
      // 5. Configurar datos médicos iniciales
      await this.setupMedicalCacheStructure();
      
      // 6. Crear scripts de monitoreo
      await this.createMonitoringScripts();
      
      // 7. Configurar backup del cluster
      await this.setupClusterBackup();

      console.log('✅ Redis Cluster de AltaMedica configurado exitosamente');
      console.log('🔍 Verificar estado con: redis-cli --cluster check 127.0.0.1:7001');
      
    } catch (error) {
      console.error('❌ Error configurando Redis Cluster:', error);
      throw error;
    }
  }

  /**
   * Preparar directorios necesarios
   */
  async preparDirectories() {
    console.log('📁 Preparando directorios...');
    
    const dirs = [
      this.configDir,
      this.dataDir,
      this.logsDir,
      path.join(this.dataDir, 'backups'),
      path.join(this.configDir, 'certs')
    ];

    for (const dir of dirs) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`📁 Creado: ${dir}`);
      }
    }
  }

  /**
   * Generar configuraciones específicas para cada nodo
   */
  async generateNodeConfigurations() {
    console.log('⚙️ Generando configuraciones de nodos...');

    for (const node of this.clusterConfig.nodes) {
      const config = this.generateNodeConfig(node);
      const configPath = path.join(this.configDir, `redis-${node.port}.conf`);
      
      fs.writeFileSync(configPath, config);
      console.log(`⚙️ Configuración creada: redis-${node.port}.conf`);
    }
  }

  /**
   * Generar configuración específica por nodo
   */
  generateNodeConfig(node) {
    return `# 🏥 ALTAMEDICA REDIS CLUSTER NODE ${node.port}
# Configuración para ${node.role} - ${new Date().toISOString()}

# ===== CONFIGURACIÓN BÁSICA =====
port ${node.port}
bind 0.0.0.0
protected-mode no
daemonize yes
pidfile ./data/redis-cluster/redis-${node.port}.pid

# ===== CLUSTER CONFIGURATION =====
cluster-enabled yes
cluster-config-file ./data/redis-cluster/nodes-${node.port}.conf
cluster-node-timeout 15000
cluster-announce-ip 127.0.0.1
cluster-announce-port ${node.port}
cluster-announce-bus-port ${node.port + 10000}

# ===== LOGGING =====
loglevel notice
logfile ./logs/redis/redis-${node.port}.log
syslog-enabled no

# ===== PERSISTENCIA MÉDICA =====
save 900 1
save 300 10  
save 60 10000

appendonly yes
appendfilename "appendonly-${node.port}.aof"
appendfsync everysec
no-appendfsync-on-rewrite no
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb

dir ./data/redis-cluster

# ===== SEGURIDAD =====
requirepass ${this.clusterConfig.password}
masterauth ${this.clusterConfig.password}

rename-command FLUSHDB ""
rename-command FLUSHALL ""
rename-command SHUTDOWN ALTAMEDICA_SHUTDOWN_${node.port}
rename-command DEBUG ""
rename-command CONFIG ALTAMEDICA_CONFIG_${node.port}

# ===== MEMORIA PARA DATOS MÉDICOS =====
maxmemory 256mb
maxmemory-policy allkeys-lru

# ===== TIMEOUTS =====
timeout 300
tcp-keepalive 300

# ===== OPTIMIZACIONES MÉDICAS =====
hash-max-ziplist-entries 512
hash-max-ziplist-value 64
list-max-ziplist-size -2
set-max-intset-entries 512
zset-max-ziplist-entries 128

# ===== NETWORKING =====
tcp-backlog 511
client-output-buffer-limit normal 0 0 0
client-output-buffer-limit replica 256mb 64mb 60
client-output-buffer-limit pubsub 32mb 8mb 60

# ===== REPLICACIÓN =====
${node.role === 'replica' ? `
replica-serve-stale-data yes
replica-read-only yes
repl-diskless-sync no
repl-diskless-sync-delay 5
repl-ping-replica-period 10
repl-timeout 60
` : ''}

# ===== CLUSTER SPECIFIC =====
cluster-require-full-coverage no
cluster-replica-validity-factor 10
cluster-migration-barrier 1

# ===== SLOWLOG PARA MONITOREO =====
slowlog-log-slower-than 10000
slowlog-max-len 128

# ===== LATENCY MONITORING =====
latency-monitor-threshold 100`;
  }

  /**
   * Iniciar todos los nodos Redis
   */
  async startRedisNodes() {
    console.log('🚀 Iniciando nodos Redis...');

    for (const node of this.clusterConfig.nodes) {
      try {
        const configFile = path.join(this.configDir, `redis-${node.port}.conf`);
        
        console.log(`🚀 Iniciando nodo ${node.port} (${node.role})...`);
        
        // Comando para iniciar Redis con configuración
        const command = `redis-server ${configFile}`;
        
        execSync(command, { 
          stdio: 'pipe',
          timeout: 10000 // 10 segundos timeout
        });
        
        // Verificar que el nodo esté corriendo
        await this.waitForNodeStartup(node.port);
        
        console.log(`✅ Nodo ${node.port} iniciado correctamente`);
        
      } catch (error) {
        console.error(`❌ Error iniciando nodo ${node.port}:`, error.message);
        throw error;
      }
    }

    // Esperar un poco más para estabilización
    console.log('⏳ Esperando estabilización de nodos...');
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  /**
   * Esperar que un nodo Redis esté listo
   */
  async waitForNodeStartup(port) {
    const maxAttempts = 10;
    const delay = 1000; // 1 segundo

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        execSync(`redis-cli -p ${port} -a "${this.clusterConfig.password}" ping`, {
          stdio: 'pipe'
        });
        return; // Nodo está listo
      } catch (error) {
        if (attempt === maxAttempts) {
          throw new Error(`Nodo ${port} no respondió después de ${maxAttempts} intentos`);
        }
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  /**
   * Crear cluster Redis
   */
  async createCluster() {
    console.log('🔗 Creando Redis Cluster...');

    try {
      // Construir comando para crear cluster
      const nodeAddresses = this.clusterConfig.nodes
        .map(node => `127.0.0.1:${node.port}`)
        .join(' ');

      const createCommand = [
        'redis-cli',
        '--cluster', 'create',
        nodeAddresses,
        '--cluster-replicas', '1',
        '--cluster-yes',
        '-a', this.clusterConfig.password
      ].join(' ');

      console.log('🔗 Ejecutando:', createCommand);
      
      execSync(createCommand, { 
        stdio: 'inherit',
        timeout: 30000 // 30 segundos
      });

      console.log('✅ Redis Cluster creado exitosamente');

      // Verificar estado del cluster
      await this.verifyClusterHealth();

    } catch (error) {
      console.error('❌ Error creando cluster:', error.message);
      throw error;
    }
  }

  /**
   * Verificar salud del cluster
   */
  async verifyClusterHealth() {
    console.log('🔍 Verificando salud del cluster...');

    try {
      // Verificar estado del cluster
      const clusterInfo = execSync(
        `redis-cli -c -p 7001 -a "${this.clusterConfig.password}" cluster info`,
        { encoding: 'utf8' }
      );

      console.log('📊 Estado del cluster:');
      console.log(clusterInfo);

      // Verificar nodos
      const clusterNodes = execSync(
        `redis-cli -c -p 7001 -a "${this.clusterConfig.password}" cluster nodes`,
        { encoding: 'utf8' }
      );

      console.log('🔍 Nodos del cluster:');
      console.log(clusterNodes);

      // Verificar que todos los slots estén asignados
      if (clusterInfo.includes('cluster_state:ok')) {
        console.log('✅ Cluster está funcionando correctamente');
      } else {
        console.warn('⚠️ Cluster puede tener problemas');
      }

    } catch (error) {
      console.error('❌ Error verificando cluster:', error.message);
    }
  }

  /**
   * Configurar estructura de cache médico
   */
  async setupMedicalCacheStructure() {
    console.log('🏥 Configurando estructura de cache médico...');

    try {
      // Configurar espacios de nombres para datos médicos
      const namespaces = [
        'patient:profile:',     // Perfiles de pacientes
        'doctor:profile:',      // Perfiles de doctores  
        'appointment:',         // Citas médicas
        'session:webrtc:',      // Sesiones de telemedicina
        'medical:record:',      // Registros médicos (cache temporal)
        'audit:log:',           // Logs de auditoría (cache)
        'notification:',        // Notificaciones médicas
        'emergency:alert:'      // Alertas de emergencia
      ];

      // Crear configuración de TTL por namespace
      const ttlConfig = {
        'patient:profile:': this.clusterConfig.medicalCacheConfig.patientDataTTL,
        'appointment:': this.clusterConfig.medicalCacheConfig.appointmentTTL,
        'session:webrtc:': this.clusterConfig.medicalCacheConfig.sessionTTL,
        'audit:log:': this.clusterConfig.medicalCacheConfig.auditLogTTL
      };

      // Guardar configuración en Redis
      const configScript = `
        -- Configuración de espacios de nombres médicos
        local ttl_config = cjson.decode('${JSON.stringify(ttlConfig)}')
        for namespace, ttl in pairs(ttl_config) do
          redis.call('HSET', 'altamedica:cache:config', namespace, ttl)
        end
        return 'OK'
      `;

      execSync(
        `redis-cli -c -p 7001 -a "${this.clusterConfig.password}" --eval - <<< "${configScript}"`,
        { stdio: 'pipe' }
      );

      console.log('✅ Estructura de cache médico configurada');

    } catch (error) {
      console.error('❌ Error configurando cache médico:', error.message);
    }
  }

  /**
   * Crear scripts de monitoreo
   */
  async createMonitoringScripts() {
    const monitoringScript = `#!/usr/bin/env node

/**
 * 🏥 ALTAMEDICA REDIS CLUSTER MONITOR
 * Monitoreo de salud del cluster Redis médico
 */

const { execSync } = require('child_process');

class RedisClusterMonitor {
  constructor() {
    this.nodes = [7001, 7002, 7003, 7004, 7005, 7006];
    this.password = '${this.clusterConfig.password}';
  }

  async checkClusterHealth() {
    console.log('🔍 Verificando salud del cluster Redis médico...');
    
    const checks = {
      clusterStatus: await this.checkClusterStatus(),
      nodeHealth: await this.checkNodesHealth(),
      memoryUsage: await this.checkMemoryUsage(),
      slowQueries: await this.checkSlowQueries(),
      medicalCacheStatus: await this.checkMedicalCacheStatus()
    };

    const overallHealth = Object.values(checks).every(check => check.passed);
    
    console.log('📊 Reporte de salud del cluster:');
    Object.entries(checks).forEach(([check, result]) => {
      const status = result.passed ? '✅' : '❌';
      console.log(\`  \${status} \${check}: \${result.message}\`);
    });

    if (!overallHealth) {
      console.error('🚨 ALERTA: Problemas detectados en Redis Cluster');
      return false;
    }

    console.log('✅ Redis Cluster funcionando correctamente');
    return true;
  }

  async checkClusterStatus() {
    try {
      const info = execSync(
        \`redis-cli -c -p 7001 -a "\${this.password}" cluster info\`,
        { encoding: 'utf8' }
      );
      
      if (info.includes('cluster_state:ok')) {
        return { passed: true, message: 'Cluster estado OK' };
      } else {
        return { passed: false, message: 'Cluster en estado inconsistente' };
      }
    } catch (error) {
      return { passed: false, message: \`Error verificando cluster: \${error.message}\` };
    }
  }

  async checkNodesHealth() {
    try {
      let healthyNodes = 0;
      
      for (const port of this.nodes) {
        try {
          execSync(\`redis-cli -p \${port} -a "\${this.password}" ping\`, { stdio: 'pipe' });
          healthyNodes++;
        } catch (error) {
          console.warn(\`⚠️ Nodo \${port} no responde\`);
        }
      }
      
      const healthRatio = healthyNodes / this.nodes.length;
      
      if (healthRatio >= 0.8) {
        return { passed: true, message: \`\${healthyNodes}/\${this.nodes.length} nodos saludables\` };
      } else {
        return { passed: false, message: \`Solo \${healthyNodes}/\${this.nodes.length} nodos funcionando\` };
      }
    } catch (error) {
      return { passed: false, message: \`Error verificando nodos: \${error.message}\` };
    }
  }

  async checkMemoryUsage() {
    try {
      const memInfo = execSync(
        \`redis-cli -c -p 7001 -a "\${this.password}" info memory\`,
        { encoding: 'utf8' }
      );
      
      const usedMemoryMatch = memInfo.match(/used_memory_human:([^\\r\\n]+)/);
      const maxMemoryMatch = memInfo.match(/maxmemory_human:([^\\r\\n]+)/);
      
      if (usedMemoryMatch && maxMemoryMatch) {
        return { 
          passed: true, 
          message: \`Memoria: \${usedMemoryMatch[1]} / \${maxMemoryMatch[1]}\` 
        };
      } else {
        return { passed: true, message: 'Información de memoria obtenida' };
      }
    } catch (error) {
      return { passed: false, message: \`Error verificando memoria: \${error.message}\` };
    }
  }

  async checkSlowQueries() {
    try {
      const slowlog = execSync(
        \`redis-cli -c -p 7001 -a "\${this.password}" slowlog len\`,
        { encoding: 'utf8' }
      );
      
      const slowCount = parseInt(slowlog.trim());
      
      if (slowCount < 10) {
        return { passed: true, message: \`\${slowCount} queries lentas\` };
      } else {
        return { passed: false, message: \`\${slowCount} queries lentas detectadas\` };
      }
    } catch (error) {
      return { passed: false, message: \`Error verificando slowlog: \${error.message}\` };
    }
  }

  async checkMedicalCacheStatus() {
    try {
      const configExists = execSync(
        \`redis-cli -c -p 7001 -a "\${this.password}" exists altamedica:cache:config\`,
        { encoding: 'utf8' }
      );
      
      if (configExists.trim() === '1') {
        return { passed: true, message: 'Configuración de cache médico presente' };
      } else {
        return { passed: false, message: 'Configuración de cache médico faltante' };
      }
    } catch (error) {
      return { passed: false, message: \`Error verificando cache médico: \${error.message}\` };
    }
  }
}

if (require.main === module) {
  const monitor = new RedisClusterMonitor();
  monitor.checkClusterHealth()
    .then(healthy => process.exit(healthy ? 0 : 1))
    .catch(error => {
      console.error('💥 Error en monitoreo:', error);
      process.exit(1);
    });
}

module.exports = RedisClusterMonitor;`;

    const monitoringPath = path.join(this.projectRoot, 'scripts/redis/redis-cluster-monitor.js');
    fs.writeFileSync(monitoringPath, monitoringScript);
    
    console.log(`📊 Script de monitoreo creado: ${monitoringPath}`);
  }

  /**
   * Configurar backup del cluster
   */
  async setupClusterBackup() {
    console.log('💾 Configurando backup del cluster...');

    const backupScript = `#!/usr/bin/env node

/**
 * 🏥 ALTAMEDICA REDIS CLUSTER BACKUP
 * Backup de datos críticos del cluster Redis médico
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class RedisClusterBackup {
  constructor() {
    this.backupDir = './data/redis-cluster/backups';
    this.password = '${this.clusterConfig.password}';
    this.nodes = [7001, 7002, 7003];
  }

  async executeBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = \`redis-cluster-\${timestamp}\`;
    
    console.log(\`💾 Iniciando backup de Redis Cluster: \${backupName}\`);

    try {
      // Crear directorio de backup
      const backupPath = path.join(this.backupDir, backupName);
      fs.mkdirSync(backupPath, { recursive: true });

      // Backup de cada nodo master
      for (const port of this.nodes) {
        await this.backupNode(port, backupPath);
      }

      // Crear manifest
      await this.createBackupManifest(backupName, backupPath);

      console.log(\`✅ Backup completado: \${backupName}\`);
      return { success: true, backupName, path: backupPath };

    } catch (error) {
      console.error(\`❌ Error en backup: \${error.message}\`);
      throw error;
    }
  }

  async backupNode(port, backupPath) {
    console.log(\`💾 Backup nodo \${port}...\`);

    try {
      // Ejecutar BGSAVE
      execSync(
        \`redis-cli -p \${port} -a "\${this.password}" BGSAVE\`,
        { stdio: 'pipe' }
      );

      // Esperar que complete
      let saveInProgress = true;
      while (saveInProgress) {
        try {
          const lastSave = execSync(
            \`redis-cli -p \${port} -a "\${this.password}" LASTSAVE\`,
            { encoding: 'utf8' }
          );
          
          // Verificar si terminó comparando con timestamp previo
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const newLastSave = execSync(
            \`redis-cli -p \${port} -a "\${this.password}" LASTSAVE\`,
            { encoding: 'utf8' }
          );
          
          if (lastSave === newLastSave) {
            saveInProgress = false;
          }
        } catch (error) {
          console.warn(\`⚠️ Error verificando BGSAVE en \${port}\`);
          break;
        }
      }

      // Copiar archivo RDB
      const sourceRdb = \`./data/redis-cluster/dump-\${port}.rdb\`;
      const targetRdb = path.join(backupPath, \`dump-\${port}.rdb\`);
      
      if (fs.existsSync(sourceRdb)) {
        fs.copyFileSync(sourceRdb, targetRdb);
        console.log(\`✅ Nodo \${port} backup completado\`);
      } else {
        console.warn(\`⚠️ Archivo RDB no encontrado para nodo \${port}\`);
      }

    } catch (error) {
      console.error(\`❌ Error backup nodo \${port}: \${error.message}\`);
    }
  }

  async createBackupManifest(backupName, backupPath) {
    const manifest = {
      backupName,
      timestamp: new Date().toISOString(),
      type: 'redis-cluster',
      nodes: this.nodes,
      files: fs.readdirSync(backupPath),
      metadata: {
        clusterInfo: await this.getClusterInfo(),
        totalKeys: await this.getTotalKeys()
      }
    };

    const manifestPath = path.join(backupPath, 'MANIFEST.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  }

  async getClusterInfo() {
    try {
      return execSync(
        \`redis-cli -c -p 7001 -a "\${this.password}" cluster info\`,
        { encoding: 'utf8' }
      );
    } catch (error) {
      return 'Error obteniendo info del cluster';
    }
  }

  async getTotalKeys() {
    try {
      const info = execSync(
        \`redis-cli -c -p 7001 -a "\${this.password}" info keyspace\`,
        { encoding: 'utf8' }
      );
      
      const keyMatch = info.match(/keys=(\\d+)/);
      return keyMatch ? parseInt(keyMatch[1]) : 0;
    } catch (error) {
      return 0;
    }
  }
}

if (require.main === module) {
  const backup = new RedisClusterBackup();
  backup.executeBackup()
    .then(result => {
      console.log('🎉 Backup de cluster completado exitosamente');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Backup de cluster falló:', error);
      process.exit(1);
    });
}

module.exports = RedisClusterBackup;`;

    const backupPath = path.join(this.projectRoot, 'scripts/redis/redis-cluster-backup.js');
    fs.writeFileSync(backupPath, backupScript);
    
    console.log(`💾 Script de backup creado: ${backupPath}`);
  }
}

// Ejecutar setup si se llama directamente
if (require.main === module) {
  const setup = new RedisClusterSetup();
  setup.setupCluster()
    .then(() => {
      console.log('🎉 Redis Cluster de AltaMedica configurado exitosamente');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Error configurando Redis Cluster:', error);
      process.exit(1);
    });
}

module.exports = RedisClusterSetup;