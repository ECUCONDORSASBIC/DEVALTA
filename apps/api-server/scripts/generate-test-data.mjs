#!/usr/bin/env node

/**
 * Script para generar datos de prueba en Firebase
 * Ejecutar: node scripts/generate-test-data.mjs
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Inicializar Firebase Admin con configuración de desarrollo
if (getApps().length === 0) {
  initializeApp({
    projectId: 'altamedica-medical',
    databaseURL: 'https://altamedica-medical-default-rtdb.firebaseio.com',
    storageBucket: 'altamedica-medical.appspot.com',
  });
}

const adminDb = getFirestore();

// Datos de prueba
const testUsers = [
  {
    id: 'igrz7JiIlaTKnxPmp16xqvygtBy2',
    firstName: 'Juan',
    lastName: 'Pérez',
    email: 'juan.perez@example.com',
    phone: '+573001234567',
    role: 'patient',
    isActive: true,
    avatar: 'https://ui-avatars.com/api/?name=Juan+Perez&background=0D9488&color=fff',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'doctor123',
    firstName: 'María',
    lastName: 'García',
    email: 'maria.garcia@altamedica.com',
    phone: '+573001234568',
    role: 'doctor',
    isActive: true,
    licenseNumber: 'MD-12345',
    specialties: ['Cardiología', 'Medicina Interna'],
    avatar: 'https://ui-avatars.com/api/?name=Maria+Garcia&background=1E40AF&color=fff',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'doctor456',
    firstName: 'Carlos',
    lastName: 'Rodríguez',
    email: 'carlos.rodriguez@altamedica.com',
    phone: '+573001234569',
    role: 'doctor',
    isActive: true,
    licenseNumber: 'MD-67890',
    specialties: ['Pediatría', 'Medicina Familiar'],
    avatar: 'https://ui-avatars.com/api/?name=Carlos+Rodriguez&background=1E40AF&color=fff',
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

const testPatients = [
  {
    id: 'igrz7JiIlaTKnxPmp16xqvygtBy2',
    dateOfBirth: '1985-03-15',
    gender: 'male',
    bloodType: 'O+',
    emergencyContact: {
      name: 'Ana Pérez',
      phone: '+573001234570',
      relationship: 'Esposa'
    },
    medicalHistory: {
      allergies: ['Penicilina'],
      chronicConditions: ['Hipertensión'],
      medications: ['Losartán 50mg']
    },
    insurance: {
      provider: 'EPS Sura',
      policyNumber: 'POL-123456',
      groupNumber: 'GRP-789'
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

const testAppointments = [
  {
    id: 'apt001',
    doctorId: 'doctor123',
    patientId: 'igrz7JiIlaTKnxPmp16xqvygtBy2',
    scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Mañana
    estimatedDuration: 30,
    type: 'consultation',
    reason: 'Control de presión arterial',
    symptoms: ['Dolor de cabeza', 'Fatiga'],
    status: 'scheduled',
    priority: 'normal',
    notes: 'Paciente con hipertensión controlada',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'apt002',
    doctorId: 'doctor456',
    patientId: 'igrz7JiIlaTKnxPmp16xqvygtBy2',
    scheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // En una semana
    estimatedDuration: 45,
    type: 'follow_up',
    reason: 'Seguimiento de tratamiento',
    symptoms: [],
    status: 'scheduled',
    priority: 'normal',
    notes: 'Revisión de medicación',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'apt003',
    doctorId: 'doctor123',
    patientId: 'igrz7JiIlaTKnxPmp16xqvygtBy2',
    scheduledAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Hace una semana
    estimatedDuration: 30,
    type: 'consultation',
    reason: 'Control rutinario',
    symptoms: [],
    status: 'completed',
    priority: 'normal',
    notes: 'Paciente estable',
    completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  }
];

const testTelemedicineSessions = [
  {
    id: 'session001',
    appointmentId: 'apt001',
    doctorId: 'doctor123',
    patientId: 'igrz7JiIlaTKnxPmp16xqvygtBy2',
    sessionType: 'video',
    provider: 'webrtc',
    scheduledDuration: 30,
    status: 'scheduled',
    scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    title: 'Consulta de telemedicina - Control de presión',
    notes: 'Sesión programada para control de hipertensión',
    providerConfig: {
      roomId: 'room_001',
      joinToken: 'token_001'
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

async function generateTestData() {
  console.log('🚀 Iniciando generación de datos de prueba...');

  try {
    // Crear usuarios
    console.log('👥 Creando usuarios...');
    for (const user of testUsers) {
      await adminDb.collection('users').doc(user.id).set(user);
      console.log(`✅ Usuario creado: ${user.firstName} ${user.lastName}`);
    }

    // Crear pacientes
    console.log('🏥 Creando pacientes...');
    for (const patient of testPatients) {
      await adminDb.collection('patients').doc(patient.id).set(patient);
      console.log(`✅ Paciente creado: ${patient.id}`);
    }

    // Crear citas
    console.log('📅 Creando citas...');
    for (const appointment of testAppointments) {
      await adminDb.collection('appointments').doc(appointment.id).set(appointment);
      console.log(`✅ Cita creada: ${appointment.id}`);
    }

    // Crear sesiones de telemedicina
    console.log('🩺 Creando sesiones de telemedicina...');
    for (const session of testTelemedicineSessions) {
      await adminDb.collection('telemedicine_sessions').doc(session.id).set(session);
      console.log(`✅ Sesión de telemedicina creada: ${session.id}`);
    }

    console.log('🎉 ¡Datos de prueba generados exitosamente!');
    console.log('\n📊 Resumen:');
    console.log(`- ${testUsers.length} usuarios creados`);
    console.log(`- ${testPatients.length} pacientes creados`);
    console.log(`- ${testAppointments.length} citas creadas`);
    console.log(`- ${testTelemedicineSessions.length} sesiones de telemedicina creadas`);
    
    console.log('\n🔗 URLs de prueba:');
    console.log('- Paciente: http://localhost:3001/api/v1/patients/igrz7JiIlaTKnxPmp16xqvygtBy2');
    console.log('- Citas: http://localhost:3001/api/v1/appointments?patientId=igrz7JiIlaTKnxPmp16xqvygtBy2');
    console.log('- Sesiones: http://localhost:3001/api/v1/telemedicine/sessions?patientId=igrz7JiIlaTKnxPmp16xqvygtBy2');

  } catch (error) {
    console.error('❌ Error generando datos de prueba:', error);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  generateTestData();
}

export { generateTestData }; 