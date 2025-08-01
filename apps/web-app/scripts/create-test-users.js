#!/usr/bin/env node

/**
 * Script para crear usuarios de prueba con roles específicos
 * 
 * NOTA: Este script debe ejecutarse en un entorno seguro con acceso a Firebase Admin SDK
 */

const testUsers = [
  {
    email: 'patient.test@altamedica.com',
    password: 'Patient123!',
    profile: {
      role: 'patient',
      firstName: 'Juan',
      lastName: 'Pérez',
      displayName: 'Juan Pérez',
      verified: true
    }
  },
  {
    email: 'dr.martinez@altamedica.com',
    password: 'Doctor123!',
    profile: {
      role: 'doctor',
      firstName: 'Carlos',
      lastName: 'Martínez',
      displayName: 'Dr. Carlos Martínez',
      medicalLicense: '12345-MD',
      specialty: 'Cardiología',
      yearsExperience: 15,
      verified: true
    }
  },
  {
    email: 'company.test@altamedica.com',
    password: 'Company123!',
    profile: {
      role: 'company',
      firstName: 'Admin',
      lastName: 'Empresa',
      displayName: 'Hospital Central',
      companyName: 'Hospital Central',
      companyType: 'hospital',
      verified: true
    }
  },
  {
    email: 'admin@altamedica.com',
    password: 'Admin123!',
    profile: {
      role: 'admin',
      firstName: 'Super',
      lastName: 'Admin',
      displayName: 'Super Admin',
      verified: true
    }
  }
];

console.log('🧪 USUARIOS DE PRUEBA PARA ALTAMEDICA');
console.log('=====================================\n');

console.log('📝 Para crear estos usuarios manualmente:\n');
console.log('1. Ve a Firebase Console > Authentication');
console.log('2. Crea cada usuario con email y contraseña');
console.log('3. Ve a Firestore > users');
console.log('4. Crea un documento para cada usuario con el UID como ID\n');

testUsers.forEach(user => {
  console.log(`\n📧 Email: ${user.email}`);
  console.log(`🔑 Password: ${user.password}`);
  console.log(`🎭 Rol: ${user.profile.role}`);
  console.log(`📋 Datos del perfil en Firestore:`);
  console.log(JSON.stringify(user.profile, null, 2));
  
  const expectedRedirect = {
    patient: 'http://localhost:3003/dashboard',
    doctor: 'http://localhost:3002/dashboard',
    company: 'http://localhost:3004/dashboard',
    admin: 'http://localhost:3005/dashboard'
  };
  
  console.log(`🚀 Redirección esperada: ${expectedRedirect[user.profile.role]}`);
  console.log('---');
});

console.log('\n\n💡 ESTRUCTURA DE FIRESTORE:');
console.log('========================');
console.log(`
users/
  {userId}/
    - uid: string
    - email: string
    - displayName: string
    - photoURL?: string
    - role: 'patient' | 'doctor' | 'company' | 'admin'
    - firstName: string
    - lastName: string
    - phone?: string
    - dateOfBirth?: string (patients)
    - gender?: string (patients)
    - medicalLicense?: string (doctors)
    - specialty?: string (doctors)
    - yearsExperience?: number (doctors)
    - companyName?: string (companies)
    - companyType?: string (companies)
    - verified: boolean
    - createdAt: timestamp
    - lastLogin: timestamp
`);

console.log('\n🔐 EJEMPLO DE DOCUMENTO FIRESTORE:');
console.log('=================================');
console.log(`
// Para un doctor:
{
  "uid": "abc123...",
  "email": "dr.martinez@altamedica.com",
  "displayName": "Dr. Carlos Martínez",
  "role": "doctor",
  "firstName": "Carlos",
  "lastName": "Martínez",
  "medicalLicense": "12345-MD",
  "specialty": "Cardiología",
  "yearsExperience": 15,
  "verified": true,
  "createdAt": serverTimestamp(),
  "lastLogin": serverTimestamp()
}
`);

console.log('\n⚠️  IMPORTANTE:');
console.log('===============');
console.log('- El campo "role" es CRÍTICO para la redirección');
console.log('- Debe ser exactamente: "patient", "doctor", "company" o "admin"');
console.log('- Sin el rol correcto, la redirección fallará');
console.log('- Los usuarios OAuth (Google/Facebook) se crean como "patient" por defecto');