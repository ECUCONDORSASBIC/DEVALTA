/**
 * 🔄 SCRIPT DE MIGRACIÓN API - ALTAMEDICA
 * Migra llamadas fetch/axios al nuevo @altamedica/api-client
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Patrones a buscar
const FETCH_PATTERNS = [
  /fetch\s*\(\s*[`'"]/g,
  /axios\.(get|post|put|patch|delete)\s*\(/g,
  /axios\s*\(\s*\{/g,
];

// Archivos a analizar
const APPS_TO_MIGRATE = ['patients', 'doctors', 'companies'];

// Función para detectar llamadas API
function detectApiCalls(content, filePath) {
  const calls = [];
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    FETCH_PATTERNS.forEach(pattern => {
      if (pattern.test(line)) {
        // Extraer información de la llamada
        let endpoint = '';
        let method = 'GET';
        
        // Detectar fetch
        if (line.includes('fetch')) {
          const endpointMatch = line.match(/fetch\s*\(\s*[`'"]([^`'"]+)[`'"]/);
          if (endpointMatch) {
            endpoint = endpointMatch[1];
          }
          
          // Buscar método en las siguientes líneas
          for (let i = index + 1; i < Math.min(index + 10, lines.length); i++) {
            if (lines[i].includes('method:')) {
              const methodMatch = lines[i].match(/method:\s*[`'"](\w+)[`'"]/);
              if (methodMatch) {
                method = methodMatch[1].toUpperCase();
              }
              break;
            }
          }
        }
        
        // Detectar axios
        if (line.includes('axios')) {
          const axiosMatch = line.match(/axios\.(\w+)\s*\(\s*[`'"]([^`'"]+)[`'"]/);
          if (axiosMatch) {
            method = axiosMatch[1].toUpperCase();
            endpoint = axiosMatch[2];
          }
        }
        
        if (endpoint) {
          calls.push({
            line: index + 1,
            method,
            endpoint,
            originalLine: line.trim(),
          });
        }
      }
    });
  });
  
  return calls;
}

// Función para determinar el hook apropiado
function determineHook(endpoint, method) {
  // Auth endpoints
  if (endpoint.includes('/auth/login')) return 'useLogin';
  if (endpoint.includes('/auth/register')) return 'useRegister';
  if (endpoint.includes('/auth/logout')) return 'useLogout';
  if (endpoint.includes('/auth/me')) return 'useCurrentUser';
  
  // Patient endpoints
  if (endpoint.includes('/patients') && method === 'GET') return 'usePatients';
  if (endpoint.includes('/patients') && method === 'POST') return 'useCreatePatient';
  if (endpoint.match(/\/patients\/[^/]+$/) && method === 'PUT') return 'useUpdatePatient';
  
  // Doctor endpoints
  if (endpoint.includes('/doctors') && method === 'GET') return 'useDoctors';
  if (endpoint.includes('/doctors') && method === 'POST') return 'useCreateDoctor';
  
  // Appointment endpoints
  if (endpoint.includes('/appointments') && method === 'GET') return 'useAppointments';
  if (endpoint.includes('/appointments') && method === 'POST') return 'useCreateAppointment';
  if (endpoint.includes('/appointments') && endpoint.includes('/cancel')) return 'useCancelAppointment';
  
  // Telemedicine endpoints
  if (endpoint.includes('/telemedicine/sessions') && method === 'GET') return 'useTelemedicineSessions';
  if (endpoint.includes('/telemedicine/sessions') && method === 'POST') return 'useCreateTelemedicineSession';
  if (endpoint.includes('/telemedicine') && endpoint.includes('/join')) return 'useJoinTelemedicineSession';
  
  // Company endpoints
  if (endpoint.includes('/companies') && method === 'GET') return 'useCompanies';
  
  // Marketplace endpoints
  if (endpoint.includes('/marketplace/listings') && method === 'GET') return 'useMarketplaceListings';
  if (endpoint.includes('/marketplace/apply')) return 'useApplyToListing';
  
  // Generic fallback
  return null;
}

// Función para generar reporte
function generateReport(apiCalls) {
  const report = {
    totalCalls: 0,
    byApp: {},
    byEndpoint: {},
    byMethod: {},
    hooks: {},
  };
  
  Object.entries(apiCalls).forEach(([app, files]) => {
    report.byApp[app] = 0;
    
    Object.entries(files).forEach(([filePath, calls]) => {
      report.totalCalls += calls.length;
      report.byApp[app] += calls.length;
      
      calls.forEach(call => {
        // Por endpoint
        const cleanEndpoint = call.endpoint.replace(/\$\{[^}]+\}/g, ':id').replace(/[`'"]/g, '');
        report.byEndpoint[cleanEndpoint] = (report.byEndpoint[cleanEndpoint] || 0) + 1;
        
        // Por método
        report.byMethod[call.method] = (report.byMethod[call.method] || 0) + 1;
        
        // Hook sugerido
        const hook = determineHook(cleanEndpoint, call.method);
        if (hook) {
          report.hooks[hook] = (report.hooks[hook] || 0) + 1;
        }
      });
    });
  });
  
  return report;
}

// Función principal
async function main() {
  console.log('🔍 Analizando llamadas API en las aplicaciones...\n');
  
  const apiCalls = {};
  
  for (const app of APPS_TO_MIGRATE) {
    apiCalls[app] = {};
    const appPath = path.join(__dirname, '..', 'apps', app);
    
    // Buscar archivos .ts y .tsx
    const files = glob.sync('src/**/*.{ts,tsx}', { 
      cwd: appPath,
      ignore: ['**/node_modules/**', '**/*.test.*', '**/*.spec.*']
    });
    
    console.log(`📱 ${app}: Analizando ${files.length} archivos...`);
    
    for (const file of files) {
      const filePath = path.join(appPath, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      const calls = detectApiCalls(content, filePath);
      if (calls.length > 0) {
        apiCalls[app][file] = calls;
        console.log(`  📄 ${file}: ${calls.length} llamadas API encontradas`);
      }
    }
  }
  
  // Generar reporte
  const report = generateReport(apiCalls);
  
  console.log('\n📊 RESUMEN DE LLAMADAS API:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Total de llamadas: ${report.totalCalls}`);
  console.log('\nPor aplicación:');
  Object.entries(report.byApp).forEach(([app, count]) => {
    console.log(`  ${app}: ${count} llamadas`);
  });
  
  console.log('\nPor método HTTP:');
  Object.entries(report.byMethod).forEach(([method, count]) => {
    console.log(`  ${method}: ${count} llamadas`);
  });
  
  console.log('\nTop 10 endpoints más usados:');
  const sortedEndpoints = Object.entries(report.byEndpoint)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10);
  sortedEndpoints.forEach(([endpoint, count]) => {
    console.log(`  ${endpoint}: ${count} llamadas`);
  });
  
  console.log('\nHooks sugeridos para migración:');
  Object.entries(report.hooks).forEach(([hook, count]) => {
    console.log(`  ${hook}: ${count} usos potenciales`);
  });
  
  // Guardar reporte detallado
  const detailedReport = {
    timestamp: new Date().toISOString(),
    summary: report,
    details: apiCalls,
  };
  
  fs.writeFileSync(
    path.join(__dirname, 'api-migration-report.json'),
    JSON.stringify(detailedReport, null, 2)
  );
  
  console.log('\n✅ Reporte detallado guardado en: scripts/api-migration-report.json');
  
  // Sugerir próximos pasos
  console.log('\n🎯 PRÓXIMOS PASOS:');
  console.log('1. Instalar @altamedica/api-client en cada app:');
  console.log('   pnpm add @altamedica/api-client --filter @altamedica/patients');
  console.log('   pnpm add @altamedica/api-client --filter @altamedica/doctors');
  console.log('   pnpm add @altamedica/api-client --filter @altamedica/companies');
  console.log('\n2. Configurar el cliente API en cada app');
  console.log('3. Migrar gradualmente cada llamada usando los hooks sugeridos');
  console.log('4. Ejecutar tests para verificar que todo funcione correctamente');
}

main().catch(console.error);