#!/usr/bin/env node

/**
 * Script de verificación rápida del sistema de autenticación
 * Verifica que todos los componentes necesarios existen y están configurados
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando Sistema de Autenticación de AltaMedica\n');

// Colores para la consola
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

const checkMark = `${colors.green}✓${colors.reset}`;
const crossMark = `${colors.red}✗${colors.reset}`;
const warningMark = `${colors.yellow}⚠${colors.reset}`;

// Lista de archivos críticos para verificar
const criticalFiles = [
  {
    path: 'src/contexts/AuthContext.tsx',
    description: 'Context de autenticación principal'
  },
  {
    path: 'src/services/firebase-auth.ts',
    description: 'Servicio de Firebase Auth'
  },
  {
    path: 'src/components/auth/AuthGuard.tsx',
    description: 'Componente de protección de rutas'
  },
  {
    path: 'src/components/auth/LoginForm.tsx',
    description: 'Formulario de login'
  },
  {
    path: 'src/components/auth/RegisterForm.tsx',
    description: 'Formulario de registro'
  },
  {
    path: 'src/hooks/useProtectedRoute.ts',
    description: 'Hook para rutas protegidas'
  },
  {
    path: 'src/app/(auth)/login/page.tsx',
    description: 'Página de login'
  },
  {
    path: 'src/app/(auth)/register/page.tsx',
    description: 'Página de registro'
  },
  {
    path: 'src/app/dashboard/page.tsx',
    description: 'Dashboard (ruta protegida)'
  },
  {
    path: 'src/app/profile/page.tsx',
    description: 'Perfil de usuario (ruta protegida)'
  },
  {
    path: 'src/app/unauthorized/page.tsx',
    description: 'Página de acceso no autorizado'
  }
];

// Verificar archivos
console.log(`${colors.blue}📁 Verificando archivos críticos:${colors.reset}\n`);

let allFilesExist = true;
criticalFiles.forEach(file => {
  const fullPath = path.join(process.cwd(), file.path);
  const exists = fs.existsSync(fullPath);
  
  if (exists) {
    console.log(`${checkMark} ${file.description}`);
    console.log(`  └─ ${colors.blue}${file.path}${colors.reset}`);
  } else {
    console.log(`${crossMark} ${file.description}`);
    console.log(`  └─ ${colors.red}${file.path} NO ENCONTRADO${colors.reset}`);
    allFilesExist = false;
  }
});

// Verificar configuración de Firebase
console.log(`\n${colors.blue}🔥 Verificando configuración de Firebase:${colors.reset}\n`);

const envPath = path.join(process.cwd(), '.env.local');
const envExists = fs.existsSync(envPath);

if (envExists) {
  console.log(`${checkMark} Archivo .env.local encontrado`);
  
  // Verificar variables críticas
  const envContent = fs.readFileSync(envPath, 'utf8');
  const requiredVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID'
  ];
  
  requiredVars.forEach(varName => {
    if (envContent.includes(varName)) {
      console.log(`${checkMark} ${varName} configurada`);
    } else {
      console.log(`${warningMark} ${varName} no encontrada en .env.local`);
    }
  });
} else {
  console.log(`${crossMark} Archivo .env.local NO encontrado`);
  console.log(`${warningMark} Copia .env.example a .env.local y configura las variables`);
}

// Verificar estructura de rutas
console.log(`\n${colors.blue}🛣️  Verificando estructura de rutas:${colors.reset}\n`);

const authRoutes = [
  { path: 'src/app/(auth)', description: 'Grupo de rutas de autenticación' },
  { path: 'src/app/(dashboard)', description: 'Grupo de rutas del dashboard' }
];

authRoutes.forEach(route => {
  const fullPath = path.join(process.cwd(), route.path);
  const exists = fs.existsSync(fullPath);
  
  if (exists) {
    console.log(`${checkMark} ${route.description}`);
    console.log(`  └─ ${colors.blue}${route.path}${colors.reset}`);
  } else {
    console.log(`${warningMark} ${route.description} no encontrado`);
    console.log(`  └─ ${colors.yellow}${route.path}${colors.reset}`);
  }
});

// Verificar dependencias
console.log(`\n${colors.blue}📦 Verificando dependencias:${colors.reset}\n`);

const packageJsonPath = path.join(process.cwd(), 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const requiredDeps = [
    'firebase',
    'react',
    'next',
    'sonner',
    'lucide-react'
  ];
  
  requiredDeps.forEach(dep => {
    if (packageJson.dependencies && packageJson.dependencies[dep]) {
      console.log(`${checkMark} ${dep} v${packageJson.dependencies[dep]}`);
    } else {
      console.log(`${crossMark} ${dep} NO instalado`);
    }
  });
}

// Resumen final
console.log(`\n${colors.blue}📊 Resumen:${colors.reset}\n`);

if (allFilesExist && envExists) {
  console.log(`${checkMark} ${colors.green}¡Sistema de autenticación configurado correctamente!${colors.reset}`);
  console.log(`\n${colors.blue}🚀 Próximos pasos:${colors.reset}`);
  console.log('1. Ejecuta: npm run dev');
  console.log('2. Abre: http://localhost:3000');
  console.log('3. Prueba el flujo completo según manual-auth-test.md');
} else {
  console.log(`${crossMark} ${colors.red}Hay problemas en la configuración${colors.reset}`);
  console.log(`\n${colors.yellow}⚠️  Acciones requeridas:${colors.reset}`);
  if (!allFilesExist) {
    console.log('- Verifica que todos los archivos críticos existen');
  }
  if (!envExists) {
    console.log('- Crea el archivo .env.local con la configuración de Firebase');
  }
}

console.log(`\n${colors.blue}📚 Documentación:${colors.reset}`);
console.log('- Manual de testing: scripts/manual-auth-test.md');
console.log('- Tests automatizados: scripts/test-auth-flow.ts');
console.log('- Usuarios de prueba: Revisa CLAUDE.local.md\n');