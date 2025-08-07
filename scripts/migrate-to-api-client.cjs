/**
 * 🔄 SCRIPT DE MIGRACIÓN AUTOMÁTICA A API-CLIENT
 * Migra llamadas fetch/axios a hooks de @altamedica/api-client
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Mapeo de endpoints a hooks
const ENDPOINT_TO_HOOK_MAP = {
  // Auth
  '/api/v1/auth/login': 'useLogin',
  '/api/v1/auth/logout': 'useLogout',
  '/api/v1/auth/register': 'useRegister',
  '/api/v1/auth/me': 'useCurrentUser',
  
  // Appointments
  '/api/appointments': {
    GET: 'useAppointments',
    POST: 'useCreateAppointment'
  },
  '/api/v1/appointments': {
    GET: 'useAppointments',
    POST: 'useCreateAppointment'
  },
  
  // Patients
  '/api/v1/patients': {
    GET: 'usePatients',
    POST: 'useCreatePatient'
  },
  
  // Doctors
  '/api/v1/doctors': {
    GET: 'useDoctors',
    POST: 'useCreateDoctor'
  },
  
  // Telemedicine
  '/api/telemedicine': 'useTelemedicineSessions',
  '/api/v1/telemedicine/sessions': {
    GET: 'useTelemedicineSessions',
    POST: 'useCreateTelemedicineSession'
  },
  
  // Prescriptions
  '/api/v1/prescriptions': {
    GET: 'usePrescriptions',
    POST: 'useCreatePrescription'
  }
};

// Patrones de transformación
const TRANSFORMATIONS = [
  {
    // Transformar fetch GET
    pattern: /fetch\s*\(\s*`?\$\{[^}]+\}\/api\/([^`\s]+)`?\s*,\s*\{[^}]*\}\s*\)/g,
    transform: (match, endpoint) => {
      const hook = findHookForEndpoint(`/api/${endpoint}`, 'GET');
      if (hook) {
        return `/* TODO: Migrar a ${hook} hook */\n    // ${match}`;
      }
      return match;
    }
  },
  {
    // Transformar fetch POST
    pattern: /fetch\s*\(\s*`?\$\{[^}]+\}\/api\/([^`\s]+)`?\s*,\s*\{[^}]*method:\s*['"]POST['"]/g,
    transform: (match, endpoint) => {
      const hook = findHookForEndpoint(`/api/${endpoint}`, 'POST');
      if (hook) {
        return `/* TODO: Migrar a ${hook} hook */\n    // ${match}`;
      }
      return match;
    }
  },
  {
    // Transformar axios.get
    pattern: /axios\.get\s*\(\s*`?\$\{[^}]+\}\/api\/([^`\s]+)`?\s*\)/g,
    transform: (match, endpoint) => {
      const hook = findHookForEndpoint(`/api/${endpoint}`, 'GET');
      if (hook) {
        return `/* TODO: Migrar a ${hook} hook */\n    // ${match}`;
      }
      return match;
    }
  },
  {
    // Transformar axios.post
    pattern: /axios\.post\s*\(\s*`?\$\{[^}]+\}\/api\/([^`\s]+)`?\s*/g,
    transform: (match, endpoint) => {
      const hook = findHookForEndpoint(`/api/${endpoint}`, 'POST');
      if (hook) {
        return `/* TODO: Migrar a ${hook} hook */\n    // ${match}`;
      }
      return match;
    }
  }
];

// Función para encontrar el hook correcto
function findHookForEndpoint(endpoint, method = 'GET') {
  // Buscar coincidencia exacta
  const mapping = ENDPOINT_TO_HOOK_MAP[endpoint];
  
  if (typeof mapping === 'string') {
    return mapping;
  } else if (mapping && mapping[method]) {
    return mapping[method];
  }
  
  // Buscar coincidencia parcial
  for (const [key, value] of Object.entries(ENDPOINT_TO_HOOK_MAP)) {
    if (endpoint.includes(key)) {
      if (typeof value === 'string') {
        return value;
      } else if (value[method]) {
        return value[method];
      }
    }
  }
  
  return null;
}

// Función para generar el código de importación
function generateImports(hooks) {
  if (hooks.length === 0) return '';
  
  return `import { ${hooks.join(', ')} } from '@altamedica/api-client';`;
}

// Función para analizar un archivo
function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const suggestions = [];
  const foundHooks = new Set();
  
  // Buscar patrones de fetch/axios
  TRANSFORMATIONS.forEach(({ pattern }) => {
    const matches = content.matchAll(pattern);
    for (const match of matches) {
      const endpoint = match[1];
      const method = match[0].includes('POST') ? 'POST' : 'GET';
      const hook = findHookForEndpoint(`/api/${endpoint}`, method);
      
      if (hook) {
        foundHooks.add(hook);
        suggestions.push({
          line: getLineNumber(content, match.index),
          original: match[0],
          hook,
          endpoint
        });
      }
    }
  });
  
  return {
    suggestions,
    hooks: Array.from(foundHooks)
  };
}

// Función para obtener número de línea
function getLineNumber(content, index) {
  return content.substring(0, index).split('\n').length;
}

// Función para generar reporte de migración
function generateMigrationReport(file, analysis) {
  if (analysis.suggestions.length === 0) return null;
  
  const report = [`\n📄 ${file}`];
  report.push(`   Hooks necesarios: ${analysis.hooks.join(', ')}`);
  report.push(`   Sugerencias de migración:`);
  
  analysis.suggestions.forEach(suggestion => {
    report.push(`   - Línea ${suggestion.line}: Migrar a ${suggestion.hook}`);
    report.push(`     Endpoint: ${suggestion.endpoint}`);
  });
  
  return report.join('\n');
}

// Función para generar archivo de migración
function generateMigrationFile(filePath, analysis) {
  const content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;
  
  // Agregar importaciones si no existen
  if (analysis.hooks.length > 0 && !content.includes('@altamedica/api-client')) {
    const importStatement = generateImports(analysis.hooks);
    newContent = importStatement + '\n\n' + newContent;
  }
  
  // Agregar comentarios TODO
  TRANSFORMATIONS.forEach(({ pattern, transform }) => {
    newContent = newContent.replace(pattern, transform);
  });
  
  return newContent;
}

// Función principal
async function main() {
  const app = process.argv[2];
  
  if (!app || !['patients', 'doctors', 'companies'].includes(app)) {
    console.log('Uso: node migrate-to-api-client.cjs [patients|doctors|companies]');
    process.exit(1);
  }
  
  console.log(`🔄 Analizando migración para app: ${app}\n`);
  
  const appPath = path.join(__dirname, '..', 'apps', app);
  const files = glob.sync('src/**/*.{ts,tsx}', { 
    cwd: appPath,
    ignore: ['**/node_modules/**', '**/*.test.*', '**/*.spec.*']
  });
  
  const migrationPlan = [];
  let totalSuggestions = 0;
  
  for (const file of files) {
    const filePath = path.join(appPath, file);
    const analysis = analyzeFile(filePath);
    
    if (analysis.suggestions.length > 0) {
      const report = generateMigrationReport(file, analysis);
      if (report) {
        migrationPlan.push(report);
        totalSuggestions += analysis.suggestions.length;
      }
    }
  }
  
  if (migrationPlan.length > 0) {
    console.log('📊 PLAN DE MIGRACIÓN:');
    console.log('━━━━━━━━━━━━━━━━━━━');
    migrationPlan.forEach(report => console.log(report));
    
    console.log(`\n✅ Total de migraciones sugeridas: ${totalSuggestions}`);
    
    // Preguntar si generar archivos
    console.log('\n¿Deseas generar archivos de migración con comentarios TODO? (y/n)');
    
    // Para automatización, asumir 'n'
    const generate = false;
    
    if (generate) {
      console.log('\n🔧 Generando archivos de migración...');
      // Aquí iría la lógica para generar los archivos
    }
    
    // Generar guía de migración
    const guideContent = `
# 📚 GUÍA DE MIGRACIÓN A @altamedica/api-client

## 1. Instalar dependencias
\`\`\`bash
pnpm add @altamedica/api-client --filter @altamedica/${app}
\`\`\`

## 2. Configurar el cliente API
Crear archivo: apps/${app}/src/lib/api-client.ts

## 3. Agregar QueryProvider
Actualizar el layout principal para incluir QueryProvider

## 4. Migrar llamadas
Seguir los ejemplos en appointment-service-migrated.ts

## 5. Hooks más comunes
- useLogin() - Para autenticación
- useCurrentUser() - Obtener usuario actual  
- useAppointments() - Listar citas
- useCreateAppointment() - Crear nueva cita
- usePatients() - Listar pacientes
- useDoctors() - Listar doctores

## 6. Ventajas
- ✅ Gestión automática del estado
- ✅ Cache inteligente
- ✅ Type safety mejorado
- ✅ Menos código boilerplate
`;
    
    fs.writeFileSync(
      path.join(appPath, 'MIGRATION_GUIDE.md'),
      guideContent
    );
    
    console.log(`\n📝 Guía de migración guardada en: apps/${app}/MIGRATION_GUIDE.md`);
  } else {
    console.log('✅ No se encontraron llamadas API para migrar');
  }
}

main().catch(console.error);