#!/usr/bin/env node

/**
 * Script simple para verificar el sistema de redirección basado en roles
 */

console.log('🔍 Verificando Sistema de Redirección por Rol\n');

// Colores para la consola
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

// Mapeo correcto de puertos según CLAUDE.md
const correctPortMapping = {
  'web-app': 3000,
  'api-server': 3001,
  'doctors': 3002,
  'patients': 3003,
  'companies': 3004,
  'admin': 3005
};

console.log(`${colors.blue}📋 Mapeo Correcto de Aplicaciones y Puertos:${colors.reset}\n`);

Object.entries(correctPortMapping).forEach(([app, port]) => {
  console.log(`  ${colors.yellow}${app.padEnd(12)}${colors.reset} → Puerto ${colors.green}${port}${colors.reset}`);
});

console.log(`\n${colors.blue}🔄 Flujos de Redirección por Rol:${colors.reset}\n`);

const redirectFlows = [
  {
    role: 'patient',
    description: 'Los pacientes permanecen en web-app',
    loginUrl: 'http://localhost:3000/login',
    dashboardUrl: 'http://localhost:3000/dashboard',
    note: 'NO se redirige a otra app'
  },
  {
    role: 'doctor',
    description: 'Los doctores van a la app doctors',
    loginUrl: 'http://localhost:3000/login',
    dashboardUrl: 'http://localhost:3002/dashboard',
    note: 'Redirección EXTERNA'
  },
  {
    role: 'company',
    description: 'Las empresas van a la app companies',
    loginUrl: 'http://localhost:3000/login',
    dashboardUrl: 'http://localhost:3004/dashboard',
    note: 'Redirección EXTERNA'
  },
  {
    role: 'admin',
    description: 'Los admins van a la app admin',
    loginUrl: 'http://localhost:3000/login',
    dashboardUrl: 'http://localhost:3005/dashboard',
    note: 'Redirección EXTERNA'
  }
];

redirectFlows.forEach(flow => {
  console.log(`${colors.yellow}Rol: ${flow.role.toUpperCase()}${colors.reset}`);
  console.log(`  📝 ${flow.description}`);
  console.log(`  🔗 Login en: ${colors.blue}${flow.loginUrl}${colors.reset}`);
  console.log(`  ➡️  Dashboard: ${colors.green}${flow.dashboardUrl}${colors.reset}`);
  console.log(`  ℹ️  ${flow.note}`);
  console.log('');
});

console.log(`${colors.blue}🧪 Cómo Probar:${colors.reset}\n`);

console.log('1. Asegúrate de que todas las apps estén corriendo:');
console.log(`   ${colors.yellow}cd apps/web-app && npm run dev${colors.reset} (puerto 3000)`);
console.log(`   ${colors.yellow}cd apps/api-server && npm run dev${colors.reset} (puerto 3001)`);
console.log(`   ${colors.yellow}cd apps/doctors && npm run dev${colors.reset} (puerto 3002)`);
console.log(`   ${colors.yellow}cd apps/patients && npm run dev${colors.reset} (puerto 3003)`);
console.log(`   ${colors.yellow}cd apps/companies && npm run dev${colors.reset} (puerto 3004)`);
console.log(`   ${colors.yellow}cd apps/admin && npm run dev${colors.reset} (puerto 3005)`);
console.log('');

console.log('2. Ve a http://localhost:3000/login');
console.log('');

console.log('3. Prueba con estos usuarios:');
console.log(`   ${colors.green}Paciente:${colors.reset} paciente.test@email.com / Patient123!`);
console.log(`   ${colors.green}Doctor:${colors.reset} dr.martinez@altamedica.com / Doctor123!`);
console.log(`   ${colors.green}Empresa:${colors.reset} (crear uno nuevo con rol company)`);
console.log(`   ${colors.green}Admin:${colors.reset} admin@altamedica.com / Admin123!`);
console.log('');

console.log(`${colors.blue}✅ Verificaciones:${colors.reset}\n`);

console.log('[ ] Paciente se queda en localhost:3000/dashboard');
console.log('[ ] Doctor redirige a localhost:3002/dashboard');
console.log('[ ] Empresa redirige a localhost:3004/dashboard');
console.log('[ ] Admin redirige a localhost:3005/dashboard');
console.log('[ ] El token se mantiene entre aplicaciones');
console.log('[ ] Logout funciona desde cualquier app');
console.log('');

console.log(`${colors.yellow}⚠️  Problemas Comunes:${colors.reset}\n`);
console.log('- CORS: Asegúrate de que cada app acepte requests desde las demás');
console.log('- Cookies: Deben configurarse con sameSite: "lax" o "none"');
console.log('- Tokens: JWT debe ser el mismo formato en todas las apps');
console.log('');

console.log(`${colors.green}✨ Script completado${colors.reset}`);