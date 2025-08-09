/**
 * 🔧 SETUP TEST USERS - CONFIGURACIÓN DE USUARIOS DE PRUEBA
 * 
 * Script para crear usuarios de prueba en Firebase con todos los datos necesarios
 * para ejecutar tests E2E completos incluyendo telemedicina
 */

const admin = require('firebase-admin');
const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, setDoc, collection, addDoc, serverTimestamp } = require('firebase/firestore');

// Configuración de Firebase (client)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBh7WkKURPPLjPR4LMJqYvlfyTdRPdQuDw",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "altamedica-a0773.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "altamedica-a0773",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "altamedica-a0773.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "584565550210",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:584565550210:web:af1dd9e59c06c0b46db907"
};

// Inicializar Firebase Client
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Colores para consola
const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Datos de usuarios de prueba
const TEST_USERS = {
  patient: {
    email: 'paciente.test@altamedica.com',
    password: 'Test123!@#',
    profile: {
      firstName: 'Juan',
      lastName: 'Pérez Test',
      role: 'PATIENT',
      dni: '12345678',
      phone: '+54 11 5555-0001',
      birthDate: '1990-01-15',
      gender: 'male',
      bloodType: 'O+',
      address: {
        street: 'Av. Corrientes 1234',
        city: 'Buenos Aires',
        state: 'CABA',
        country: 'Argentina',
        zipCode: 'C1043'
      },
      emergencyContact: {
        name: 'María Pérez',
        relationship: 'Esposa',
        phone: '+54 11 5555-0002'
      },
      medicalInfo: {
        allergies: ['Penicilina'],
        chronicConditions: ['Hipertensión leve'],
        currentMedications: [{
          name: 'Enalapril',
          dosage: '10mg',
          frequency: 'Una vez al día'
        }]
      }
    }
  },
  doctor: {
    email: 'doctor.test@altamedica.com',
    password: 'Test123!@#',
    profile: {
      firstName: 'Dr. Carlos',
      lastName: 'Martínez Test',
      role: 'DOCTOR',
      specialties: ['Medicina General', 'Cardiología'],
      licenseNumber: 'MN 12345',
      phone: '+54 11 5555-1001',
      consultationPrice: 5000,
      availableForTelemedicine: true,
      schedule: {
        monday: { start: '09:00', end: '17:00' },
        tuesday: { start: '09:00', end: '17:00' },
        wednesday: { start: '09:00', end: '17:00' },
        thursday: { start: '09:00', end: '17:00' },
        friday: { start: '09:00', end: '17:00' }
      },
      hospital: {
        name: 'Hospital Central Test',
        address: 'Av. Rivadavia 2000, CABA'
      }
    }
  }
};

// Función para crear usuario con Firebase Auth
async function createAuthUser(email, password) {
  try {
    // Primero intentar hacer login para ver si ya existe
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    log(`✅ Usuario ${email} ya existe en Auth`, 'yellow');
    return userCredential.user;
  } catch (error) {
    if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
      // Usuario no existe, crearlo mediante API
      log(`📝 Creando usuario ${email} en Firebase Auth...`, 'cyan');
      
      // NOTA: En producción, esto debería hacerse a través del API server
      // Por ahora, simulamos que el usuario ya fue creado
      log(`⚠️  Usuario ${email} debe ser creado manualmente o mediante Admin SDK`, 'yellow');
      return null;
    }
    throw error;
  }
}

// Función para crear perfil en Firestore
async function createUserProfile(userId, userData) {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      ...userData.profile,
      email: userData.email,
      uid: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: true,
      emailVerified: true
    });
    log(`✅ Perfil creado para ${userData.email}`, 'green');
  } catch (error) {
    log(`❌ Error creando perfil: ${error.message}`, 'red');
    throw error;
  }
}

// Función para crear una cita de prueba
async function createTestAppointment(patientId, doctorId) {
  try {
    // Fecha para mañana a las 10:00 AM
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);

    const appointmentData = {
      patientId,
      doctorId,
      patientName: TEST_USERS.patient.profile.firstName + ' ' + TEST_USERS.patient.profile.lastName,
      doctorName: TEST_USERS.doctor.profile.firstName + ' ' + TEST_USERS.doctor.profile.lastName,
      date: tomorrow,
      time: '10:00',
      duration: 30,
      type: 'telemedicine',
      status: 'confirmed',
      reason: 'Consulta de seguimiento - Hipertensión',
      notes: 'Paciente de prueba para E2E testing',
      videoCallEnabled: true,
      videoCallLink: `https://meet.altamedica.com/test-appointment-${Date.now()}`,
      price: TEST_USERS.doctor.profile.consultationPrice,
      isPaid: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const appointmentRef = await addDoc(collection(db, 'appointments'), appointmentData);
    log(`✅ Cita de telemedicina creada: ${appointmentRef.id}`, 'green');
    log(`   📅 Fecha: ${tomorrow.toLocaleDateString()} a las 10:00 AM`, 'cyan');
    
    return appointmentRef.id;
  } catch (error) {
    log(`❌ Error creando cita: ${error.message}`, 'red');
    throw error;
  }
}

// Función principal
async function setupTestUsers() {
  log('\n🔧 CONFIGURACIÓN DE USUARIOS DE PRUEBA PARA E2E', 'bold');
  log('================================================\n', 'bold');

  try {
    // Crear usuarios
    let patientUser = null;
    let doctorUser = null;

    // Intentar con usuarios existentes o informar que deben crearse
    log('👤 Configurando usuario PACIENTE...', 'blue');
    patientUser = await createAuthUser(TEST_USERS.patient.email, TEST_USERS.patient.password);
    
    log('\n👨‍⚕️ Configurando usuario DOCTOR...', 'blue');
    doctorUser = await createAuthUser(TEST_USERS.doctor.email, TEST_USERS.doctor.password);

    if (!patientUser || !doctorUser) {
      log('\n⚠️  IMPORTANTE: Debes crear los usuarios manualmente:', 'yellow');
      log('   1. Usa el formulario de registro en http://localhost:3000/auth/register', 'yellow');
      log('   2. O usa Firebase Console: https://console.firebase.google.com', 'yellow');
      log('\n📧 Usuarios a crear:', 'cyan');
      log(`   - Paciente: ${TEST_USERS.patient.email} / ${TEST_USERS.patient.password}`, 'cyan');
      log(`   - Doctor: ${TEST_USERS.doctor.email} / ${TEST_USERS.doctor.password}`, 'cyan');
      
      return;
    }

    // Crear perfiles en Firestore
    log('\n📝 Creando perfiles en Firestore...', 'blue');
    await createUserProfile(patientUser.uid, TEST_USERS.patient);
    await createUserProfile(doctorUser.uid, TEST_USERS.doctor);

    // Crear cita de prueba
    log('\n📅 Creando cita de telemedicina...', 'blue');
    const appointmentId = await createTestAppointment(patientUser.uid, doctorUser.uid);

    // Resumen final
    log('\n✅ CONFIGURACIÓN COMPLETADA', 'bold');
    log('===========================\n', 'bold');
    
    log('👤 PACIENTE:', 'green');
    log(`   Email: ${TEST_USERS.patient.email}`, 'cyan');
    log(`   Password: ${TEST_USERS.patient.password}`, 'cyan');
    log(`   UID: ${patientUser.uid}`, 'cyan');
    
    log('\n👨‍⚕️ DOCTOR:', 'green');
    log(`   Email: ${TEST_USERS.doctor.email}`, 'cyan');
    log(`   Password: ${TEST_USERS.doctor.password}`, 'cyan');
    log(`   UID: ${doctorUser.uid}`, 'cyan');
    
    log('\n📅 CITA:', 'green');
    log(`   ID: ${appointmentId}`, 'cyan');
    log(`   Tipo: Telemedicina`, 'cyan');
    log(`   Estado: Confirmada`, 'cyan');
    
    log('\n🎯 Próximos pasos:', 'yellow');
    log('   1. Ejecuta el test E2E: pnpm test:patient:telemedicine', 'yellow');
    log('   2. El test debe poder hacer login y llegar hasta la videollamada', 'yellow');

  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
    
    if (error.code === 'auth/network-request-failed') {
      log('\n💡 Verifica tu conexión a internet y las reglas de Firebase', 'yellow');
    }
  }
}

// Script para crear usuarios via API
async function createUsersViaAPI() {
  log('\n🚀 Creando usuarios a través del API...', 'blue');
  
  const users = [
    { ...TEST_USERS.patient, type: 'patient' },
    { ...TEST_USERS.doctor, type: 'doctor' }
  ];

  for (const user of users) {
    try {
      log(`\n📝 Registrando ${user.type}: ${user.email}`, 'cyan');
      
      const response = await fetch('http://localhost:3001/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          password: user.password,
          role: user.profile.role,
          profile: user.profile
        })
      });

      if (response.ok) {
        const data = await response.json();
        log(`✅ ${user.type} registrado exitosamente`, 'green');
      } else {
        const error = await response.text();
        log(`❌ Error registrando ${user.type}: ${error}`, 'red');
      }
    } catch (error) {
      log(`❌ Error de conexión: ${error.message}`, 'red');
    }
  }
}

// Verificar argumentos
const args = process.argv.slice(2);

if (args.includes('--via-api')) {
  // Crear usuarios mediante API REST
  createUsersViaAPI().catch(console.error);
} else {
  // Configuración directa con Firebase
  setupTestUsers().catch(console.error);
}