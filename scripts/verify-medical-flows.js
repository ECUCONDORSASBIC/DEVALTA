#!/usr/bin/env node

/**
 * Script de Verificación de Flujos Médicos Altamedica
 * Verifica el estado y funcionamiento de todas las aplicaciones del sistema
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const APPS = {
  patients: { port: 3004, name: 'Pacientes', path: 'apps/patients' },
  doctors: { port: 3003, name: 'Médicos', path: 'apps/doctors' },
  companies: { port: 3002, name: 'Empresas', path: 'apps/companies' },
  admin: { port: 3005, name: 'Administración', path: 'apps/admin' },
  api: { port: 3001, name: 'API Server', path: 'apps/api-server' }
};

const COLORS = {
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
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function checkPort(port) {
  try {
    execSync(`netstat -ano | findstr :${port}`, { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

function checkPackageJson(appPath) {
  const packagePath = join(appPath, 'package.json');
  if (!existsSync(packagePath)) {
    return { exists: false, error: 'package.json no encontrado' };
  }
  
  try {
    const content = JSON.parse(readFileSync(packagePath, 'utf8'));
    return { 
      exists: true, 
      type: content.type || 'commonjs',
      name: content.name,
      version: content.version
    };
  } catch (error) {
    return { exists: false, error: error.message };
  }
}

function checkConfigFiles(appPath) {
  const files = ['next.config.js', 'postcss.config.js', 'tailwind.config.js'];
  const results = {};
  
  files.forEach(file => {
    const filePath = join(appPath, file);
    if (existsSync(filePath)) {
      const content = readFileSync(filePath, 'utf8');
      results[file] = {
        exists: true,
        isESM: content.includes('export default') || content.includes('export const'),
        isCommonJS: content.includes('module.exports')
      };
    } else {
      results[file] = { exists: false };
    }
  });
  
  return results;
}

function checkAppStructure(appPath) {
  const structure = {
    src: existsSync(join(appPath, 'src')),
    app: existsSync(join(appPath, 'src/app')),
    components: existsSync(join(appPath, 'src/components')),
    services: existsSync(join(appPath, 'src/services')),
    types: existsSync(join(appPath, 'src/types'))
  };
  
  return structure;
}

function verifyApp(appName, appConfig) {
  log(`\n${COLORS.bright}🔍 Verificando ${appConfig.name} (${appName})${COLORS.reset}`, 'cyan');
  log(`📁 Ruta: ${appConfig.path}`, 'blue');
  log(`🌐 Puerto: ${appConfig.port}`, 'blue');
  
  // Verificar package.json
  const packageInfo = checkPackageJson(appConfig.path);
  if (packageInfo.exists) {
    log(`✅ Package.json: ${packageInfo.name}@${packageInfo.version}`, 'green');
    log(`📦 Tipo de módulo: ${packageInfo.type}`, packageInfo.type === 'module' ? 'green' : 'yellow');
  } else {
    log(`❌ Package.json: ${packageInfo.error}`, 'red');
  }
  
  // Verificar archivos de configuración
  const configs = checkConfigFiles(appConfig.path);
  Object.entries(configs).forEach(([file, info]) => {
    if (info.exists) {
      const moduleType = info.isESM ? 'ESM' : info.isCommonJS ? 'CommonJS' : 'Desconocido';
      const status = (packageInfo.type === 'module' && info.isESM) || 
                     (packageInfo.type !== 'module' && info.isCommonJS) ? '✅' : '⚠️';
      log(`${status} ${file}: ${moduleType}`, info.isESM ? 'green' : 'yellow');
    } else {
      log(`❌ ${file}: No encontrado`, 'red');
    }
  });
  
  // Verificar estructura
  const structure = checkAppStructure(appConfig.path);
  Object.entries(structure).forEach(([dir, exists]) => {
    log(`${exists ? '✅' : '❌'} src/${dir}/`, exists ? 'green' : 'red');
  });
  
  // Verificar puerto
  const portActive = checkPort(appConfig.port);
  log(`${portActive ? '🟢' : '🔴'} Puerto ${appConfig.port}: ${portActive ? 'Activo' : 'Inactivo'}`, 
      portActive ? 'green' : 'red');
  
  return {
    package: packageInfo,
    configs,
    structure,
    portActive
  };
}

function generateReport(results) {
  log(`\n${COLORS.bright}📊 REPORTE DE VERIFICACIÓN ALTAMEDICA${COLORS.reset}`, 'magenta');
  log('='.repeat(60), 'magenta');
  
  let totalIssues = 0;
  let appsReady = 0;
  
  Object.entries(results).forEach(([appName, result]) => {
    const issues = [];
    
    if (!result.package.exists) issues.push('Package.json faltante');
    if (!result.portActive) issues.push('Aplicación no ejecutándose');
    
    Object.entries(result.configs).forEach(([file, info]) => {
      if (!info.exists) issues.push(`${file} faltante`);
      else if (result.package.type === 'module' && !info.isESM) {
        issues.push(`${file} debe usar sintaxis ESM`);
      }
    });
    
    Object.entries(result.structure).forEach(([dir, exists]) => {
      if (!exists) issues.push(`Directorio src/${dir}/ faltante`);
    });
    
    if (issues.length === 0) {
      log(`✅ ${APPS[appName].name}: Listo para producción`, 'green');
      appsReady++;
    } else {
      log(`⚠️ ${APPS[appName].name}: ${issues.length} problemas`, 'yellow');
      issues.forEach(issue => log(`   • ${issue}`, 'yellow'));
      totalIssues += issues.length;
    }
  });
  
  log('\n' + '='.repeat(60), 'magenta');
  log(`📈 Resumen: ${appsReady}/${Object.keys(APPS).length} aplicaciones listas`, 'cyan');
  log(`🔧 Problemas totales: ${totalIssues}`, totalIssues === 0 ? 'green' : 'red');
  
  if (totalIssues === 0) {
    log(`\n🎉 ¡Sistema Altamedica completamente funcional!`, 'green');
  } else {
    log(`\n🔧 Se requieren correcciones antes de producción`, 'yellow');
  }
}

function main() {
  log(`${COLORS.bright}🏥 VERIFICACIÓN DE FLUJOS MÉDICOS ALTAMEDICA${COLORS.reset}`, 'magenta');
  log('Verificando estado de todas las aplicaciones...', 'blue');
  
  const results = {};
  
  Object.entries(APPS).forEach(([appName, appConfig]) => {
    results[appName] = verifyApp(appName, appConfig);
  });
  
  generateReport(results);
  
  // Recomendaciones
  log(`\n${COLORS.bright}💡 RECOMENDACIONES${COLORS.reset}`, 'cyan');
  log('1. Ejecutar "npm run dev" en cada aplicación para iniciar el desarrollo', 'blue');
  log('2. Verificar que todos los puertos estén disponibles', 'blue');
  log('3. Revisar logs de errores en caso de problemas', 'blue');
  log('4. Ejecutar tests antes de producción', 'blue');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
} 