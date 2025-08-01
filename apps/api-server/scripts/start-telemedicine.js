#!/usr/bin/env node

/**
 * Script para iniciar el servidor de telemedicina AltaMedica
 * Incluye Mediasoup para videollamadas en tiempo real
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuración del servidor
const config = {
  port: process.env.PORT || 3001,
  hostname: process.env.HOSTNAME || 'localhost',
  environment: process.env.NODE_ENV || 'development',
  mediasoupWorkers: parseInt(process.env.MEDIASOUP_WORKERS || '2'),
  mediasoupLogLevel: process.env.MEDIASOUP_LOG_LEVEL || 'warn'
};

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  const timestamp = new Date().toISOString();
  console.log(`${colors[color]}[${timestamp}] ${message}${colors.reset}`);
}

function logBanner() {
  console.log(`
${colors.cyan}╔══════════════════════════════════════════════════════════════╗
║                    🏥 ALTAMEDICA TELEMEDICINE SERVER                    ║
║                                                                          ║
║  🎥 Video calls with Mediasoup                                          ║
║  🔒 HIPAA compliant logging                                             ║
║  📊 Real-time monitoring                                                ║
║  🚀 High performance WebRTC                                             ║
╚══════════════════════════════════════════════════════════════╝${colors.reset}

${colors.yellow}Configuration:${colors.reset}
  • Port: ${colors.bright}${config.port}${colors.reset}
  • Environment: ${colors.bright}${config.environment}${colors.reset}
  • Mediasoup Workers: ${colors.bright}${config.mediasoupWorkers}${colors.reset}
  • Log Level: ${colors.bright}${config.mediasoupLogLevel}${colors.reset}

${colors.green}Starting server...${colors.reset}
`);
}

function checkDependencies() {
  log('Checking dependencies...', 'blue');
  
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    log('❌ package.json not found', 'red');
    process.exit(1);
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const requiredDeps = ['mediasoup', 'socket.io', '@altamedica/logger', '@altamedica/medical-security'];
  
  const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies?.[dep] && !packageJson.devDependencies?.[dep]);
  
  if (missingDeps.length > 0) {
    log(`❌ Missing dependencies: ${missingDeps.join(', ')}`, 'red');
    log('Run: pnpm install', 'yellow');
    process.exit(1);
  }
  
  log('✅ All dependencies found', 'green');
}

function checkEnvironment() {
  log('Checking environment variables...', 'blue');
  
  const requiredEnvVars = [
    'DATABASE_URL',
    'JWT_SECRET'
  ];
  
  const optionalEnvVars = [
    'MEDIASOUP_WORKERS',
    'MEDIASOUP_LOG_LEVEL',
    'MEDIASOUP_LISTEN_IP',
    'MEDIASOUP_ANNOUNCED_IP',
    'SENTRY_DSN',
    'ELASTICSEARCH_URL',
    'REDIS_URL'
  ];
  
  const missingRequired = requiredEnvVars.filter(env => !process.env[env]);
  
  if (missingRequired.length > 0) {
    log(`❌ Missing required environment variables: ${missingRequired.join(', ')}`, 'red');
    log('Please check your .env file', 'yellow');
    process.exit(1);
  }
  
  log('✅ Environment variables configured', 'green');
  
  // Log optional env vars status
  optionalEnvVars.forEach(env => {
    if (process.env[env]) {
      log(`  • ${env}: ${colors.green}configured${colors.reset}`, 'reset');
    } else {
      log(`  • ${env}: ${colors.yellow}not configured${colors.reset}`, 'reset');
    }
  });
}

function startServer() {
  log('Starting telemedicine server...', 'green');
  
  const serverPath = path.join(__dirname, '..', 'src', 'lib', 'telemedicine-server.ts');
  
  // Configurar variables de entorno para el proceso hijo
  const env = {
    ...process.env,
    NODE_ENV: config.environment,
    PORT: config.port.toString(),
    HOSTNAME: config.hostname,
    MEDIASOUP_WORKERS: config.mediasoupWorkers.toString(),
    MEDIASOUP_LOG_LEVEL: config.mediasoupLogLevel
  };
  
  // Iniciar el servidor usando tsx para TypeScript
  const serverProcess = spawn('npx', ['tsx', serverPath], {
    stdio: 'inherit',
    env,
    cwd: path.join(__dirname, '..')
  });
  
  serverProcess.on('error', (error) => {
    log(`❌ Failed to start server: ${error.message}`, 'red');
    process.exit(1);
  });
  
  serverProcess.on('exit', (code) => {
    if (code === 0) {
      log('✅ Server stopped gracefully', 'green');
    } else {
      log(`❌ Server stopped with code ${code}`, 'red');
      process.exit(code);
    }
  });
  
  // Manejar señales de terminación
  process.on('SIGINT', () => {
    log('🛑 Received SIGINT, stopping server...', 'yellow');
    serverProcess.kill('SIGINT');
  });
  
  process.on('SIGTERM', () => {
    log('🛑 Received SIGTERM, stopping server...', 'yellow');
    serverProcess.kill('SIGTERM');
  });
  
  return serverProcess;
}

function showHelp() {
  console.log(`
${colors.cyan}AltaMedica Telemedicine Server${colors.reset}

Usage: node start-telemedicine.js [options]

Options:
  --help, -h          Show this help message
  --port <number>     Set server port (default: 3001)
  --workers <number>  Set Mediasoup workers (default: 2)
  --dev               Run in development mode
  --prod              Run in production mode

Environment Variables:
  DATABASE_URL        Database connection string
  JWT_SECRET          JWT secret for authentication
  MEDIASOUP_WORKERS   Number of Mediasoup workers
  MEDIASOUP_LOG_LEVEL Mediasoup log level (debug, warn, error)
  SENTRY_DSN          Sentry DSN for error tracking
  ELASTICSEARCH_URL   Elasticsearch URL for logging
  REDIS_URL           Redis URL for caching

Examples:
  node start-telemedicine.js --dev
  node start-telemedicine.js --port 3002 --workers 4
  NODE_ENV=production node start-telemedicine.js
`);
}

function parseArgs() {
  const args = process.argv.slice(2);
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--help':
      case '-h':
        showHelp();
        process.exit(0);
        break;
        
      case '--port':
        const port = parseInt(args[++i]);
        if (isNaN(port) || port < 1 || port > 65535) {
          log('❌ Invalid port number', 'red');
          process.exit(1);
        }
        config.port = port;
        break;
        
      case '--workers':
        const workers = parseInt(args[++i]);
        if (isNaN(workers) || workers < 1 || workers > 10) {
          log('❌ Invalid number of workers (1-10)', 'red');
          process.exit(1);
        }
        config.mediasoupWorkers = workers;
        break;
        
      case '--dev':
        config.environment = 'development';
        break;
        
      case '--prod':
        config.environment = 'production';
        break;
        
      default:
        log(`❌ Unknown option: ${arg}`, 'red');
        showHelp();
        process.exit(1);
    }
  }
}

// Función principal
async function main() {
  try {
    logBanner();
    parseArgs();
    checkDependencies();
    checkEnvironment();
    
    log('🚀 Initializing AltaMedica Telemedicine Server...', 'green');
    
    const serverProcess = startServer();
    
    // Mostrar información de inicio
    setTimeout(() => {
      log(`✅ Server should be running at http://${config.hostname}:${config.port}`, 'green');
      log(`📊 Health check: http://${config.hostname}:${config.port}/api/health`, 'cyan');
      log(`🎥 WebRTC endpoint: ws://${config.hostname}:${config.port}`, 'cyan');
      log('Press Ctrl+C to stop the server', 'yellow');
    }, 2000);
    
  } catch (error) {
    log(`❌ Failed to start server: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Ejecutar si es el archivo principal
if (require.main === module) {
  main();
}

module.exports = { main, config }; 