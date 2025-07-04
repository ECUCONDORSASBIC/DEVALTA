#!/usr/bin/env node

/**
 * Script de Diagnóstico y Corrección Automática de Configuraciones
 * Sistema Altamedica - Corrección de problemas ESM/CJS y configuraciones
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colores para consola
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
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(`🔧 ${title}`, 'cyan');
  console.log('='.repeat(60));
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Configuraciones a verificar y corregir
const configsToCheck = [
  {
    name: 'api-server',
    path: 'apps/api-server',
    issues: [
      {
        type: 'esm_cjs_conflict',
        files: ['postcss.config.js', 'tailwind.config.js'],
        fix: (filePath) => {
          let content = fs.readFileSync(filePath, 'utf8');
          if (content.includes('module.exports')) {
            content = content.replace('module.exports =', 'export default');
            fs.writeFileSync(filePath, content);
            return true;
          }
          return false;
        }
      }
    ]
  },
  {
    name: 'doctors',
    path: 'apps/doctors',
    issues: [
      {
        type: 'next_config_turbo',
        files: ['next.config.js'],
        fix: (filePath) => {
          let content = fs.readFileSync(filePath, 'utf8');
          if (content.includes('turbo: false')) {
            content = content.replace(/turbo:\s*false,?/g, '');
            fs.writeFileSync(filePath, content);
            return true;
          }
          return false;
        }
      }
    ]
  },
  {
    name: 'admin',
    path: 'apps/admin',
    issues: [
      {
        type: 'missing_components',
        files: [
          'src/components/dashboard/AdminStats.tsx',
          'src/components/dashboard/UserManagement.tsx',
          'src/components/dashboard/SystemHealth.tsx',
          'src/components/dashboard/AuditLogs.tsx'
        ],
        fix: (filePath) => {
          if (!fs.existsSync(filePath)) {
            // Crear componente básico
            const componentName = path.basename(filePath, '.tsx');
            const content = `// Componente ${componentName} - Creado automáticamente
import React from 'react';

const ${componentName}: React.FC = () => {
  return (
    <div className="p-4">
      <h2>${componentName}</h2>
      <p>Componente en desarrollo</p>
    </div>
  );
};

export default ${componentName};
`;
            fs.writeFileSync(filePath, content);
            return true;
          }
          return false;
        }
      }
    ]
  }
];

// Verificar estructura de directorios
function checkDirectoryStructure() {
  logSection('Verificando Estructura de Directorios');
  
  const requiredDirs = [
    'apps/api-server',
    'apps/doctors', 
    'apps/admin',
    'apps/patients',
    'apps/companies',
    'packages',
    'configs'
  ];

  for (const dir of requiredDirs) {
    if (fs.existsSync(dir)) {
      logSuccess(`Directorio ${dir} existe`);
    } else {
      logWarning(`Directorio ${dir} no encontrado`);
    }
  }
}

// Verificar archivos de configuración
function checkConfigurationFiles() {
  logSection('Verificando Archivos de Configuración');
  
  const configFiles = [
    'package.json',
    'next.config.js',
    'tsconfig.json',
    'tailwind.config.js',
    'postcss.config.js'
  ];

  for (const app of configsToCheck) {
    logInfo(`Verificando ${app.name}...`);
    
    for (const configFile of configFiles) {
      const filePath = path.join(app.path, configFile);
      if (fs.existsSync(filePath)) {
        logSuccess(`  ✓ ${configFile}`);
      } else {
        logWarning(`  ⚠ ${configFile} no encontrado`);
      }
    }
  }
}

// Corregir problemas de configuración
function fixConfigurationIssues() {
  logSection('Corrigiendo Problemas de Configuración');
  
  for (const app of configsToCheck) {
    logInfo(`Procesando ${app.name}...`);
    
    for (const issue of app.issues) {
      for (const file of issue.files) {
        const filePath = path.join(app.path, file);
        
        if (fs.existsSync(filePath)) {
          try {
            const fixed = issue.fix(filePath);
            if (fixed) {
              logSuccess(`  ✓ Corregido: ${file}`);
            } else {
              logInfo(`  ℹ ${file} - Sin cambios necesarios`);
            }
          } catch (error) {
            logError(`  ❌ Error corrigiendo ${file}: ${error.message}`);
          }
        } else {
          logWarning(`  ⚠ ${file} no encontrado`);
        }
      }
    }
  }
}

// Verificar dependencias
function checkDependencies() {
  logSection('Verificando Dependencias');
  
  for (const app of configsToCheck) {
    const packagePath = path.join(app.path, 'package.json');
    
    if (fs.existsSync(packagePath)) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        
        // Verificar tipo de módulo
        if (packageJson.type === 'module') {
          logSuccess(`  ✓ ${app.name}: ESM configurado`);
        } else {
          logInfo(`  ℹ ${app.name}: CommonJS (por defecto)`);
        }
        
        // Verificar dependencias críticas
        const criticalDeps = ['next', 'react', 'react-dom'];
        for (const dep of criticalDeps) {
          if (packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]) {
            logSuccess(`    ✓ ${dep} instalado`);
          } else {
            logWarning(`    ⚠ ${dep} no encontrado`);
          }
        }
        
      } catch (error) {
        logError(`  ❌ Error leyendo package.json de ${app.name}: ${error.message}`);
      }
    }
  }
}

// Verificar variables de entorno
function checkEnvironmentVariables() {
  logSection('Verificando Variables de Entorno');
  
  const envFiles = [
    '.env.local',
    '.env.example',
    '.env'
  ];
  
  for (const app of configsToCheck) {
    logInfo(`Verificando ${app.name}...`);
    
    for (const envFile of envFiles) {
      const envPath = path.join(app.path, envFile);
      if (fs.existsSync(envPath)) {
        logSuccess(`  ✓ ${envFile} encontrado`);
        
        // Verificar variables críticas
        const envContent = fs.readFileSync(envPath, 'utf8');
        const criticalVars = [
          'NEXT_PUBLIC_FIREBASE_API_KEY',
          'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
          'NEXT_PUBLIC_API_URL'
        ];
        
        for (const varName of criticalVars) {
          if (envContent.includes(varName)) {
            logSuccess(`    ✓ ${varName} configurada`);
          } else {
            logWarning(`    ⚠ ${varName} no encontrada`);
          }
        }
      } else {
        logInfo(`  ℹ ${envFile} no encontrado`);
      }
    }
  }
}

// Generar reporte de diagnóstico
function generateDiagnosticReport() {
  logSection('Generando Reporte de Diagnóstico');
  
  const report = {
    timestamp: new Date().toISOString(),
    apps: configsToCheck.map(app => ({
      name: app.name,
      path: app.path,
      exists: fs.existsSync(app.path),
      hasPackageJson: fs.existsSync(path.join(app.path, 'package.json')),
      hasNextConfig: fs.existsSync(path.join(app.path, 'next.config.js'))
    })),
    issues: []
  };
  
  // Detectar problemas específicos
  for (const app of configsToCheck) {
    if (!fs.existsSync(app.path)) {
      report.issues.push({
        type: 'missing_app_directory',
        app: app.name,
        severity: 'high',
        description: `Directorio de aplicación ${app.name} no encontrado`
      });
    }
    
    const packagePath = path.join(app.path, 'package.json');
    if (fs.existsSync(packagePath)) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        
        if (packageJson.type === 'module') {
          // Verificar conflictos ESM/CJS
          const configFiles = ['postcss.config.js', 'tailwind.config.js'];
          for (const configFile of configFiles) {
            const configPath = path.join(app.path, configFile);
            if (fs.existsSync(configPath)) {
              const content = fs.readFileSync(configPath, 'utf8');
              if (content.includes('module.exports')) {
                report.issues.push({
                  type: 'esm_cjs_conflict',
                  app: app.name,
                  file: configFile,
                  severity: 'medium',
                  description: `Archivo ${configFile} usa sintaxis CommonJS en proyecto ESM`
                });
              }
            }
          }
        }
      } catch (error) {
        report.issues.push({
          type: 'package_json_error',
          app: app.name,
          severity: 'high',
          description: `Error leyendo package.json: ${error.message}`
        });
      }
    }
  }
  
  // Guardar reporte
  const reportPath = path.join('logs', 'diagnostic-report.json');
  if (!fs.existsSync('logs')) {
    fs.mkdirSync('logs', { recursive: true });
  }
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  logSuccess(`Reporte guardado en ${reportPath}`);
  
  // Mostrar resumen
  logInfo(`\n📊 Resumen del Diagnóstico:`);
  logInfo(`  • Aplicaciones verificadas: ${report.apps.length}`);
  logInfo(`  • Problemas detectados: ${report.issues.length}`);
  
  if (report.issues.length > 0) {
    logWarning('\n🚨 Problemas encontrados:');
    for (const issue of report.issues) {
      logWarning(`  • ${issue.app}: ${issue.description}`);
    }
  } else {
    logSuccess('\n🎉 No se detectaron problemas críticos');
  }
}

// Función principal
function main() {
  log('🚀 Iniciando Diagnóstico y Corrección de Configuraciones', 'bright');
  log('Sistema Altamedica - Verificación Automática', 'cyan');
  
  try {
    checkDirectoryStructure();
    checkConfigurationFiles();
    fixConfigurationIssues();
    checkDependencies();
    checkEnvironmentVariables();
    generateDiagnosticReport();
    
    logSection('Diagnóstico Completado');
    logSuccess('✅ Proceso de diagnóstico y corrección completado exitosamente');
    logInfo('Recomendaciones:');
    logInfo('  1. Ejecuta "npm install" en cada aplicación si hay dependencias faltantes');
    logInfo('  2. Verifica las variables de entorno en cada aplicación');
    logInfo('  3. Ejecuta "npm run dev" para probar las aplicaciones');
    
  } catch (error) {
    logError(`Error durante el diagnóstico: ${error.message}`);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = {
  checkDirectoryStructure,
  checkConfigurationFiles,
  fixConfigurationIssues,
  checkDependencies,
  checkEnvironmentVariables,
  generateDiagnosticReport
}; 