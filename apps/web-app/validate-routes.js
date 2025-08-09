#!/usr/bin/env node

/**
 * 🔍 ROUTE VALIDATION TOOL
 * 
 * Verifica que todas las rutas referenciadas en el código realmente existan
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 VALIDANDO RUTAS DE WEB-APP');
console.log('===============================\n');

const appDir = path.join(__dirname, 'src', 'app');
const srcDir = path.join(__dirname, 'src');

// Rutas que deberían existir
const expectedRoutes = [
  // Rutas de autenticación
  '/auth/login',
  '/auth/register', 
  '/auth/forgot-password',
  '/auth/verify-email',
  '/auth/complete-profile',
  
  // Rutas de contenido
  '/contact',
  '/contacto',
  '/servicios',
  '/especialistas',
  '/telemedicine',
  
  // Rutas existentes
  '/demo',
  '/privacy',
  '/terms',
  '/help',
  '/status',
  
  // Rutas específicas
  '/anamnesis-interactiva',
  '/anamnesis-juego',
  '/calculadora-precios',
  '/hospital3d',
  '/landing-demo'
];

// Función para verificar si una ruta existe
function routeExists(route) {
  // Remover el slash inicial para la búsqueda de archivos
  const routePath = route.slice(1);
  
  // Casos especiales para rutas con grupos
  const possiblePaths = [
    path.join(appDir, routePath, 'page.tsx'),
    path.join(appDir, routePath, 'page.ts'),
    path.join(appDir, routePath, 'page.js'),
    path.join(appDir, `(auth)`, routePath, 'page.tsx'),
    path.join(appDir, `(auth)`, routePath, 'page.ts'),
    path.join(appDir, `(auth)`, routePath, 'page.js'),
  ];
  
  for (const possiblePath of possiblePaths) {
    if (fs.existsSync(possiblePath)) {
      return { exists: true, path: possiblePath };
    }
  }
  
  return { exists: false, path: null };
}

// Verificar todas las rutas esperadas
console.log('📊 RESULTADO DE VALIDACIÓN:\n');

let totalRoutes = 0;
let existingRoutes = 0;
let missingRoutes = [];

expectedRoutes.forEach(route => {
  totalRoutes++;
  const result = routeExists(route);
  
  if (result.exists) {
    console.log(`✅ ${route} - EXISTE (${result.path.replace(__dirname, '')})`);
    existingRoutes++;
  } else {
    console.log(`❌ ${route} - NO EXISTE`);
    missingRoutes.push(route);
  }
});

console.log(`\n📊 RESUMEN:`);
console.log(`   Total rutas verificadas: ${totalRoutes}`);
console.log(`   ✅ Existen: ${existingRoutes}`);
console.log(`   ❌ Faltan: ${missingRoutes.length}`);
console.log(`   📈 Porcentaje completado: ${Math.round((existingRoutes / totalRoutes) * 100)}%`);

if (missingRoutes.length > 0) {
  console.log(`\n❌ RUTAS FALTANTES:`);
  missingRoutes.forEach(route => {
    console.log(`   ${route}`);
  });
}

// Buscar rutas referenciadas en el código que podrían no existir
console.log(`\n🔍 BUSCANDO REFERENCIAS EN EL CÓDIGO...\n`);

function findRouteReferences(dir) {
  const references = new Set();
  
  function scanFile(filePath) {
    if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts') && !filePath.endsWith('.js')) {
      return;
    }
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Buscar patrones comunes de rutas
      const patterns = [
        /router\.push\(['"]([^'"]+)['"]\)/g,
        /href=['"]([^'"]+)['"]/g,
        /redirect\(['"]([^'"]+)['"]\)/g,
      ];
      
      patterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          const route = match[1];
          if (route.startsWith('/') && !route.startsWith('//') && !route.includes('http')) {
            references.add(route);
          }
        }
      });
    } catch (error) {
      // Ignorar errores de lectura
    }
  }
  
  function scanDirectory(dirPath) {
    try {
      const items = fs.readdirSync(dirPath);
      
      items.forEach(item => {
        const itemPath = path.join(dirPath, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          scanDirectory(itemPath);
        } else if (stat.isFile()) {
          scanFile(itemPath);
        }
      });
    } catch (error) {
      // Ignorar errores de directorio
    }
  }
  
  scanDirectory(dir);
  return Array.from(references).sort();
}

const referencedRoutes = findRouteReferences(srcDir);

console.log('📋 RUTAS REFERENCIADAS EN EL CÓDIGO:');
referencedRoutes.forEach(route => {
  const result = routeExists(route);
  const status = result.exists ? '✅' : '❌';
  console.log(`   ${status} ${route}`);
});

// Detectar posibles rutas problemáticas
const problematicRoutes = referencedRoutes.filter(route => {
  const result = routeExists(route);
  return !result.exists;
});

if (problematicRoutes.length > 0) {
  console.log(`\n⚠️  RUTAS REFERENCIADAS PERO NO EXISTEN:`);
  problematicRoutes.forEach(route => {
    console.log(`   ${route}`);
  });
  
  console.log(`\n💡 RECOMENDACIONES:`);
  console.log(`   1. Crear las páginas faltantes`);
  console.log(`   2. Actualizar las referencias a rutas correctas`);
  console.log(`   3. Usar redirects temporales si es necesario`);
}

console.log(`\n✅ VALIDACIÓN COMPLETADA`);

// Generar reporte de estado
const reportPath = path.join(__dirname, 'routes-report.json');
const report = {
  timestamp: new Date().toISOString(),
  total: totalRoutes,
  existing: existingRoutes,
  missing: missingRoutes,
  referenced: referencedRoutes,
  problematic: problematicRoutes,
  percentage: Math.round((existingRoutes / totalRoutes) * 100)
};

fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(`📄 Reporte guardado en: routes-report.json`);