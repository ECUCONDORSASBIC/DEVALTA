#!/usr/bin/env node

/**
 * Script to test authentication and role-based redirection
 * 
 * Microservices ports:
 * - web-app: 3000
 * - api-server: 3001
 * - doctors: 3002
 * - patients: 3003
 * - companies: 3004
 * - admin: 3005
 * - signaling-server: 8888
 */

const roles = {
  patient: {
    name: 'Patient',
    port: 3003,
    dashboardUrl: 'http://localhost:3003/dashboard',
    description: 'Portal de pacientes'
  },
  doctor: {
    name: 'Doctor',
    port: 3002,
    dashboardUrl: 'http://localhost:3002/dashboard',
    description: 'Portal médico'
  },
  company: {
    name: 'Company',
    port: 3004,
    dashboardUrl: 'http://localhost:3004/dashboard',
    description: 'Portal empresarial'
  },
  admin: {
    name: 'Admin',
    port: 3005,
    dashboardUrl: 'http://localhost:3005/dashboard',
    description: 'Panel administrativo'
  }
};

console.log('🏥 AltaMedica - Sistema de Autenticación y Redirección por Roles\n');
console.log('📍 Configuración de Microservicios:');
console.log('================================');

for (const [role, config] of Object.entries(roles)) {
  console.log(`\n${config.name} (${role}):`);
  console.log(`- Puerto: ${config.port}`);
  console.log(`- Dashboard: ${config.dashboardUrl}`);
  console.log(`- Descripción: ${config.description}`);
}

console.log('\n\n📝 Flujo de Autenticación:');
console.log('========================');
console.log('1. Usuario entra a web-app (http://localhost:3000)');
console.log('2. Se registra/inicia sesión seleccionando su rol');
console.log('3. Sistema redirige automáticamente según el rol:');
console.log('   - Pacientes → localhost:3003/dashboard');
console.log('   - Doctores → localhost:3002/dashboard');
console.log('   - Empresas → localhost:3004/dashboard');
console.log('   - Admins → localhost:3005/dashboard');

console.log('\n\n🔐 Usuarios de Prueba:');
console.log('===================');
const testUsers = [
  {
    email: 'patient.test@altamedica.com',
    password: 'Patient123!',
    role: 'patient',
    expectedRedirect: 'http://localhost:3003/dashboard'
  },
  {
    email: 'dr.martinez@altamedica.com',
    password: 'Doctor123!',
    role: 'doctor',
    expectedRedirect: 'http://localhost:3002/dashboard'
  },
  {
    email: 'company.test@altamedica.com',
    password: 'Company123!',
    role: 'company',
    expectedRedirect: 'http://localhost:3004/dashboard'
  },
  {
    email: 'admin@altamedica.com',
    password: 'Admin123!',
    role: 'admin',
    expectedRedirect: 'http://localhost:3005/dashboard'
  }
];

testUsers.forEach(user => {
  console.log(`\n${user.role.toUpperCase()}:`);
  console.log(`Email: ${user.email}`);
  console.log(`Password: ${user.password}`);
  console.log(`Redirección esperada: ${user.expectedRedirect}`);
});

console.log('\n\n⚠️  Notas Importantes:');
console.log('==================');
console.log('- Usuarios OAuth (Google/Facebook) se asignan como "patient" por defecto');
console.log('- Para cambiar rol de usuario OAuth, se debe actualizar en Firestore');
console.log('- Signaling server (puerto 8888) es solo para WebRTC, no tiene UI');

console.log('\n\n🚀 Para probar el sistema:');
console.log('=======================');
console.log('1. Asegúrate de que todos los microservicios estén corriendo:');
console.log('   pnpm dev:all');
console.log('\n2. Abre http://localhost:3000 en tu navegador');
console.log('3. Registra o inicia sesión con los usuarios de prueba');
console.log('4. Verifica que la redirección sea correcta según el rol\n');