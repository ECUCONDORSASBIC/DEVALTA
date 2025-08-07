#!/usr/bin/env node
/**
 * 🔍 DIAGNÓSTICO AUTOMÁTICO SSO - LOOP DE REDIRECCIÓN
 * Audita archivos críticos para identificar problemas de sesión persistente
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = process.cwd();
const APPS_PATH = path.join(PROJECT_ROOT, 'apps');

console.log('🔍 INICIANDO AUDITORÍA SSO - SESIÓN PERSISTENTE');
console.log('=' * 60);

// 📂 ARCHIVOS CRÍTICOS PARA AUDITAR
const CRITICAL_FILES = {
  'auth_contexts': [
    'apps/web-app/src/contexts/AuthContext.tsx',
    'apps/patients/src/providers/AuthProviderSimple.tsx',
    'apps/patients/src/contexts/AuthContext.tsx'
  ],
  'auth_guards': [
    'apps/patients/src/components/auth/AuthGuard.tsx',
    'apps/web-app/src/components/auth/AuthGuard.tsx'
  ],
  'auth_hooks': [
    'apps/patients/src/hooks/useAuth.tsx',
    'apps/patients/src/hooks/useAuthSimple.tsx',
    'apps/web-app/src/hooks/useAuth.tsx'
  ],
  'firebase_config': [
    'apps/patients/src/lib/firebase.ts',
    'apps/web-app/src/lib/firebase.ts',
    'apps/patients/src/services/auth.ts',
    'apps/web-app/src/services/auth.ts'
  ],
  'pages_layouts': [
    'apps/patients/src/app/layout.tsx',
    'apps/patients/src/app/page.tsx',
    'apps/web-app/src/app/(auth)/login/page.tsx'
  ],
  'middleware_config': [
    'apps/patients/src/middleware.ts',
    'apps/web-app/src/middleware.ts',
    'apps/patients/next.config.js',
    'apps/web-app/next.config.js'
  ],
  'env_files': [
    'apps/patients/.env.local',
    'apps/web-app/.env.local',
    '.env'
  ]
};

// 🔍 PATRONES PROBLEMÁTICOS A BUSCAR
const PROBLEM_PATTERNS = {
  'missing_sso_cookies': [
    /sso_token/g,
    /altamedica_sso_token/g,
    /document\.cookie/g,
    /setCookie/g
  ],
  'auth_redirects': [
    /window\.location\.href\s*=/g,
    /router\.push.*login/g,
    /redirect.*login/g
  ],
  'firebase_persistence': [
    /firebase.*persistence/gi,
    /onAuthStateChanged/g,
    /currentUser/g
  ],
  'auth_loading': [
    /loading.*auth/gi,
    /isLoading/g,
    /setLoading/g
  ]
};

// 🚨 ISSUES DETECTADOS
let issues = [];
let fileAnalysis = {};

function analyzeFile(filePath) {
  const fullPath = path.join(PROJECT_ROOT, filePath);
  
  if (!fs.existsSync(fullPath)) {
    issues.push({
      type: 'MISSING_FILE',
      file: filePath,
      severity: 'HIGH',
      message: 'Archivo crítico no encontrado'
    });
    return null;
  }

  try {
    const content = fs.readFileSync(fullPath, 'utf8');
    const analysis = {
      exists: true,
      size: content.length,
      lines: content.split('\n').length,
      patterns: {}
    };

    // Buscar patrones problemáticos
    Object.entries(PROBLEM_PATTERNS).forEach(([category, patterns]) => {
      analysis.patterns[category] = [];
      patterns.forEach(pattern => {
        const matches = content.match(pattern);
        if (matches) {
          analysis.patterns[category].push({
            pattern: pattern.toString(),
            count: matches.length,
            matches: matches.slice(0, 3) // Primeros 3 matches
          });
        }
      });
    });

    // Análisis específico por tipo de archivo
    if (filePath.includes('AuthContext') || filePath.includes('AuthProvider')) {
      analyzeAuthContext(content, filePath, analysis);
    }
    
    if (filePath.includes('AuthGuard')) {
      analyzeAuthGuard(content, filePath, analysis);
    }

    if (filePath.includes('firebase')) {
      analyzeFirebaseConfig(content, filePath, analysis);
    }

    return analysis;
  } catch (error) {
    issues.push({
      type: 'READ_ERROR',
      file: filePath,
      severity: 'HIGH',
      message: `Error leyendo archivo: ${error.message}`
    });
    return null;
  }
}

function analyzeAuthContext(content, filePath, analysis) {
  // Verificar cookies SSO
  const hasSSOCookies = /sso_token|altamedica_sso_token/g.test(content);
  const hasSetCookie = /setCookie|document\.cookie/g.test(content);
  const hasSignIn = /signIn.*function|const.*signIn/g.test(content);
  
  if (!hasSSOCookies && filePath.includes('web-app')) {
    issues.push({
      type: 'MISSING_SSO_COOKIES',
      file: filePath,
      severity: 'CRITICAL',
      message: 'AuthContext no maneja cookies SSO para compartir entre apps'
    });
  }

  if (!hasSignIn) {
    issues.push({
      type: 'MISSING_SIGNIN',
      file: filePath,
      severity: 'HIGH',
      message: 'AuthContext no tiene función signIn definida'
    });
  }

  analysis.authContext = {
    hasSSOCookies,
    hasSetCookie,
    hasSignIn
  };
}

function analyzeAuthGuard(content, filePath, analysis) {
  // Verificar lógica de redirección
  const hasAggressiveRedirect = /window\.location\.href|router\.push.*login/g.test(content);
  const hasLoadingCheck = /loading.*&&|isLoading.*&&/g.test(content);
  const hasDelayBeforeRedirect = /setTimeout|delay|wait/g.test(content);
  
  if (hasAggressiveRedirect && !hasLoadingCheck) {
    issues.push({
      type: 'AGGRESSIVE_REDIRECT',
      file: filePath,
      severity: 'CRITICAL',
      message: 'AuthGuard redirige sin verificar estado de loading'
    });
  }

  if (hasAggressiveRedirect && !hasDelayBeforeRedirect) {
    issues.push({
      type: 'NO_REDIRECT_DELAY',
      file: filePath,
      severity: 'HIGH',
      message: 'AuthGuard redirige inmediatamente sin delay para auth state'
    });
  }

  analysis.authGuard = {
    hasAggressiveRedirect,
    hasLoadingCheck,
    hasDelayBeforeRedirect
  };
}

function analyzeFirebaseConfig(content, filePath, analysis) {
  // Verificar configuración Firebase
  const hasAuthPersistence = /persistence|setPersistence/gi.test(content);
  const hasAuthStateChanged = /onAuthStateChanged/g.test(content);
  const hasFirebaseConfig = /apiKey|authDomain|projectId/g.test(content);
  
  if (!hasAuthPersistence) {
    issues.push({
      type: 'MISSING_PERSISTENCE',
      file: filePath,
      severity: 'HIGH',
      message: 'Firebase no tiene configuración de persistencia explícita'
    });
  }

  analysis.firebase = {
    hasAuthPersistence,
    hasAuthStateChanged,
    hasFirebaseConfig
  };
}

// 🚀 EJECUTAR AUDITORÍA
console.log('📂 Analizando archivos críticos...\n');

Object.entries(CRITICAL_FILES).forEach(([category, files]) => {
  console.log(`\n🔍 CATEGORÍA: ${category.toUpperCase()}`);
  console.log('-'.repeat(40));
  
  files.forEach(file => {
    const analysis = analyzeFile(file);
    fileAnalysis[file] = analysis;
    
    if (analysis) {
      console.log(`✅ ${file} - ${analysis.lines} líneas`);
    } else {
      console.log(`❌ ${file} - NO ENCONTRADO`);
    }
  });
});

// 📊 REPORTE DE ISSUES
console.log('\n\n🚨 ISSUES DETECTADOS');
console.log('='.repeat(60));

if (issues.length === 0) {
  console.log('✅ No se detectaron issues críticos');
} else {
  issues.forEach((issue, index) => {
    console.log(`\n${index + 1}. ${issue.type} - ${issue.severity}`);
    console.log(`   📁 ${issue.file}`);
    console.log(`   💬 ${issue.message}`);
  });
}

// 🎯 RECOMENDACIONES ESPECÍFICAS
console.log('\n\n🎯 RECOMENDACIONES ESPECÍFICAS');
console.log('='.repeat(60));

const criticalIssues = issues.filter(i => i.severity === 'CRITICAL');
const highIssues = issues.filter(i => i.severity === 'HIGH');

if (criticalIssues.length > 0) {
  console.log('\n🚨 CRÍTICO - RESOLVER INMEDIATAMENTE:');
  criticalIssues.forEach((issue, index) => {
    console.log(`${index + 1}. ${issue.message} (${issue.file})`);
  });
}

if (highIssues.length > 0) {
  console.log('\n⚠️ ALTO - RESOLVER PRONTO:');
  highIssues.forEach((issue, index) => {
    console.log(`${index + 1}. ${issue.message} (${issue.file})`);
  });
}

// 📋 PLAN DE ACCIÓN
console.log('\n\n📋 PLAN DE ACCIÓN SUGERIDO');
console.log('='.repeat(60));

console.log(`
1. 🍪 COOKIES SSO:
   - Verificar apps/web-app/src/contexts/AuthContext.tsx crea cookies SSO
   - Verificar apps/patients/src/providers/AuthProviderSimple.tsx lee cookies SSO
   - Asegurar domain/path permite sharing entre puertos

2. 🔒 AUTHGUARD:
   - Agregar delay en apps/patients/src/components/auth/AuthGuard.tsx
   - Verificar estado loading antes de redirigir
   - Manejar estados intermedios apropiadamente

3. 🔥 FIREBASE:
   - Unificar configuración entre apps
   - Habilitar persistencia explícitamente
   - Sincronizar onAuthStateChanged handlers

4. 🧪 TESTING:
   - Test flujo 3000 → 3003 sin loops
   - Verificar persistencia en page reload
   - Validar cookies en DevTools
`);

console.log('\n✅ AUDITORÍA COMPLETADA');
console.log(`Total issues: ${issues.length} (${criticalIssues.length} críticos, ${highIssues.length} altos)`);
