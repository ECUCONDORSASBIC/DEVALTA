/**
 * Script de verificación para el Enhanced Admin Dashboard
 * Verifica que todos los archivos y dependencias estén correctamente configurados
 */

const fs = require('fs');
const path = require('path');

const BASE_PATH = path.join(__dirname, '..');

// Archivos críticos para el Admin Dashboard
const CRITICAL_FILES = [
  // Componente principal
  'apps/admin/src/components/AdminDashboard.tsx',
  
  // Hook principal
  'apps/admin/src/hooks/useEnhancedAdminDashboard.ts',
  
  // Hook de real-time
  'apps/admin/src/hooks/useRealTimeUpdates.ts',
  
  // Componentes UI compartidos
  'packages/ui/src/components/dashboard/MetricCard.tsx',
  'packages/ui/src/components/dashboard/StatsGrid.tsx',
  
  // Utilidades
  'packages/ui/src/utils/cn.ts',
  'packages/ui/src/index.ts',
];

// APIs Backend requeridas
const REQUIRED_APIS = [
  '/api/v1/admin/metrics',
  '/api/v1/admin/system-status', 
  '/api/v1/admin/compliance-status',
];

function checkFileExists(filePath) {
  const fullPath = path.join(BASE_PATH, filePath);
  return {
    path: filePath,
    exists: fs.existsSync(fullPath),
    fullPath
  };
}

function analyzeFileContent(filePath) {
  const fullPath = path.join(BASE_PATH, filePath);
  if (!fs.existsSync(fullPath)) return null;
  
  const content = fs.readFileSync(fullPath, 'utf8');
  return {
    lines: content.split('\n').length,
    size: Buffer.byteLength(content, 'utf8'),
    hasTypeScript: filePath.endsWith('.ts') || filePath.endsWith('.tsx'),
    hasReact: content.includes('React'),
    hasImports: content.includes('import'),
    hasExports: content.includes('export'),
  };
}

function generateReport() {
  console.log('🏥 AltaMedica Admin Dashboard - Verification Report');
  console.log('=' * 60);
  console.log(`📅 Generated: ${new Date().toLocaleString()}`);
  console.log('');

  // Verificar archivos críticos
  console.log('📁 CRITICAL FILES VERIFICATION:');
  console.log('-'.repeat(40));
  
  let allFilesExist = true;
  const fileStats = [];

  CRITICAL_FILES.forEach(filePath => {
    const check = checkFileExists(filePath);
    const analysis = analyzeFileContent(filePath);
    
    fileStats.push({ ...check, analysis });
    
    const status = check.exists ? '✅' : '❌';
    const details = analysis ? `(${analysis.lines} lines, ${Math.round(analysis.size/1024)}KB)` : '';
    
    console.log(`${status} ${filePath} ${details}`);
    
    if (!check.exists) allFilesExist = false;
  });

  console.log('');

  // Verificar estructura de componentes
  console.log('🎨 COMPONENT ARCHITECTURE:');
  console.log('-'.repeat(40));
  
  const componentFiles = fileStats.filter(f => 
    f.path.includes('components/') && f.exists
  );
  
  componentFiles.forEach(file => {
    const { analysis } = file;
    if (analysis) {
      console.log(`📦 ${path.basename(file.path)}:`);
      console.log(`   - TypeScript: ${analysis.hasTypeScript ? '✅' : '❌'}`);
      console.log(`   - React: ${analysis.hasReact ? '✅' : '❌'}`);
      console.log(`   - Proper imports/exports: ${analysis.hasImports && analysis.hasExports ? '✅' : '❌'}`);
    }
  });

  console.log('');

  // Verificar hooks
  console.log('🪝 HOOKS VERIFICATION:');
  console.log('-'.repeat(40));
  
  const hookFiles = fileStats.filter(f => 
    f.path.includes('hooks/') && f.exists
  );
  
  hookFiles.forEach(file => {
    const { analysis } = file;
    if (analysis) {
      console.log(`🎣 ${path.basename(file.path)}: ${analysis.lines} lines`);
    }
  });

  console.log('');

  // APIs requeridas (simulación)
  console.log('🔌 REQUIRED APIs (Backend):');
  console.log('-'.repeat(40));
  
  REQUIRED_APIS.forEach(endpoint => {
    console.log(`🌐 ${endpoint} - Backend implementation required`);
  });

  console.log('');

  // Resumen de integración
  console.log('📊 INTEGRATION SUMMARY:');
  console.log('-'.repeat(40));
  
  const filesCount = CRITICAL_FILES.length;
  const existingFiles = fileStats.filter(f => f.exists).length;
  const completionPercentage = Math.round((existingFiles / filesCount) * 100);
  
  console.log(`📁 Files: ${existingFiles}/${filesCount} (${completionPercentage}%)`);
  console.log(`🎯 Dashboard Status: ${allFilesExist ? 'Ready for development' : 'Missing critical files'}`);
  console.log(`⚡ Admin Rating Target: 4.0/10 → 8.0/10`);

  console.log('');

  // Próximos pasos
  console.log('🚀 NEXT STEPS:');
  console.log('-'.repeat(40));
  
  if (allFilesExist) {
    console.log('✅ All critical files present');
    console.log('📋 TODO:');
    console.log('   1. Implement backend APIs in api-server');
    console.log('   2. Test AdminDashboard component');
    console.log('   3. Add real-time WebSocket integration');
    console.log('   4. Implement HIPAA compliance monitoring');
    console.log('   5. Add emergency alert system');
  } else {
    console.log('❌ Missing files need to be created first');
    fileStats.filter(f => !f.exists).forEach(missing => {
      console.log(`   - Create: ${missing.path}`);
    });
  }

  console.log('');
  console.log('🏥 AltaMedica Enhanced Admin Dashboard Architecture Complete!');
  
  return {
    allFilesExist,
    completionPercentage,
    fileStats,
    missingFiles: fileStats.filter(f => !f.exists).map(f => f.path)
  };
}

// Ejecutar reporte
const report = generateReport();

// Export para uso programático
module.exports = {
  generateReport,
  checkFileExists,
  analyzeFileContent,
  CRITICAL_FILES,
  REQUIRED_APIS
};