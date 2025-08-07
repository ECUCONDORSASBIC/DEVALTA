/**
 * Script para crear un paciente real con todos sus datos en Firebase
 * Ejecutar con: node scripts/create-patient-data.js
 */

const admin = require('firebase-admin');
const path = require('path');

// Inicializar Firebase Admin
const serviceAccount = require(path.join(__dirname, '../apps/api-server/altamedic-20f69-firebase-adminsdk-fbsvc-06a561d259.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

async function createPatientWithData() {
  try {
    console.log('🚀 Creando paciente real en Firebase...');
    
    // 1. Crear usuario en Firebase Auth
    const email = 'juan.perez@example.com';
    const password = 'Test123!';
    
    let userRecord;
    try {
      // Intentar obtener usuario existente
      userRecord = await auth.getUserByEmail(email);
      console.log('✅ Usuario existente encontrado:', userRecord.uid);
    } catch (error) {
      // Si no existe, crear nuevo
      userRecord = await auth.createUser({
        email: email,
        password: password,
        displayName: 'Juan Pérez',
        emailVerified: true
      });
      console.log('✅ Nuevo usuario creado:', userRecord.uid);
    }
    
    const uid = userRecord.uid;
    const now = new Date();
    
    // 2. Crear perfil de usuario en Firestore
    const userData = {
      uid: uid,
      email: email,
      firstName: 'Juan',
      lastName: 'Pérez',
      name: 'Juan Pérez',
      role: 'patient',
      phoneNumber: '+52 55 1234 5678',
      dateOfBirth: '1985-03-15',
      gender: 'male',
      address: {
        street: 'Av. Reforma 123',
        city: 'Ciudad de México',
        state: 'CDMX',
        zipCode: '06600',
        country: 'México'
      },
      emergencyContact: {
        name: 'María Pérez',
        relationship: 'Esposa',
        phoneNumber: '+52 55 8765 4321'
      },
      bloodType: 'O+',
      allergies: ['Penicilina'],
      chronicConditions: ['Hipertensión arterial'],
      currentMedications: ['Enalapril 10mg'],
      insuranceInfo: {
        provider: 'Seguros AltaMedica',
        policyNumber: 'POL-2024-001234',
        groupNumber: 'GRP-5678'
      },
      emailVerified: true,
      isActive: true,
      photoURL: null,
      metadata: {
        createdAt: now,
        lastSignIn: now,
        signInCount: 1
      },
      permissions: ['patient:read', 'patient:appointments', 'patient:messages'],
      createdAt: now,
      updatedAt: now
    };
    
    await db.collection('users').doc(uid).set(userData);
    console.log('✅ Perfil de usuario creado');
    
    // 3. Crear perfil específico de paciente
    const patientData = {
      uid: uid,
      patientId: 'PAT-' + Date.now(),
      medicalRecordNumber: 'MRN-2024-001234',
      ...userData,
      healthMetrics: {
        height: 175, // cm
        weight: 75, // kg
        bmi: 24.5
      },
      vitalSigns: {
        bloodPressure: {
          systolic: 120,
          diastolic: 80,
          date: now,
          status: 'normal'
        },
        heartRate: {
          value: 72,
          date: now,
          status: 'normal'
        },
        temperature: {
          value: 36.5,
          date: now,
          status: 'normal'
        },
        oxygenSaturation: {
          value: 98,
          date: now,
          status: 'normal'
        }
      },
      lastCheckup: now,
      nextCheckup: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000), // 90 días
      createdAt: now,
      updatedAt: now
    };
    
    await db.collection('patients').doc(uid).set(patientData);
    console.log('✅ Perfil de paciente creado');
    
    // 4. Crear citas médicas
    const appointments = [
      {
        id: 'APT-' + Date.now() + '-1',
        patientId: uid,
        patientName: 'Juan Pérez',
        doctorId: 'DOC-001',
        doctorName: 'Dr. Carlos Mendoza',
        specialty: 'Cardiología',
        date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 días
        time: '14:30',
        duration: 30,
        type: 'consultation',
        status: 'confirmed',
        location: 'Consultorio 205, 2do Piso',
        notes: 'Control de presión arterial',
        reason: 'Seguimiento de hipertensión',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'APT-' + Date.now() + '-2',
        patientId: uid,
        patientName: 'Juan Pérez',
        doctorId: 'DOC-002',
        doctorName: 'Dra. Ana López',
        specialty: 'Medicina General',
        date: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), // 14 días
        time: '10:00',
        duration: 20,
        type: 'telemedicine',
        status: 'scheduled',
        location: 'Telemedicina',
        notes: 'Revisión de análisis de laboratorio',
        reason: 'Resultados de exámenes',
        meetingUrl: 'https://meet.altamedica.com/room-' + Date.now(),
        createdAt: now,
        updatedAt: now
      }
    ];
    
    for (const appointment of appointments) {
      await db.collection('appointments').doc(appointment.id).set(appointment);
    }
    console.log('✅ Citas médicas creadas:', appointments.length);
    
    // 5. Crear historial médico
    const medicalRecords = [
      {
        id: 'MR-' + Date.now() + '-1',
        patientId: uid,
        patientName: 'Juan Pérez',
        date: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // Hace 30 días
        doctorId: 'DOC-001',
        doctorName: 'Dr. Carlos Mendoza',
        specialty: 'Cardiología',
        chiefComplaint: 'Dolor de cabeza y mareos ocasionales',
        diagnosis: 'Hipertensión arterial leve',
        icdCode: 'I10',
        notes: 'Paciente con presión arterial elevada (140/90). Se recomienda dieta hiposódica y ejercicio regular.',
        vitalSigns: {
          bloodPressure: '140/90',
          heartRate: 85,
          temperature: 36.5,
          weight: 75
        },
        prescriptions: ['Enalapril 10mg - 1 vez al día'],
        labResults: [],
        followUpRequired: true,
        followUpDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        priority: 'medium',
        attachments: [],
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'MR-' + Date.now() + '-2',
        patientId: uid,
        patientName: 'Juan Pérez',
        date: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000), // Hace 90 días
        doctorId: 'DOC-003',
        doctorName: 'Dr. Roberto Silva',
        specialty: 'Medicina de Emergencias',
        chiefComplaint: 'Dolor torácico',
        diagnosis: 'Angina de pecho estable',
        icdCode: 'I20.9',
        notes: 'Dolor torácico evaluado en emergencias. ECG normal. Enzimas cardíacas normales. Descartado infarto agudo.',
        vitalSigns: {
          bloodPressure: '135/85',
          heartRate: 78,
          temperature: 36.8,
          oxygenSaturation: 97
        },
        prescriptions: ['Aspirina 100mg - 1 vez al día', 'Nitroglicerina SL - PRN'],
        labResults: [
          {
            testName: 'Troponina I',
            value: '0.02',
            unit: 'ng/mL',
            referenceRange: '< 0.04',
            status: 'normal'
          },
          {
            testName: 'ECG',
            value: 'Sin cambios isquémicos agudos',
            status: 'normal'
          }
        ],
        followUpRequired: true,
        followUpDate: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
        priority: 'high',
        attachments: [],
        createdAt: now,
        updatedAt: now
      }
    ];
    
    for (const record of medicalRecords) {
      await db.collection('medical-records').doc(record.id).set(record);
    }
    console.log('✅ Historial médico creado:', medicalRecords.length);
    
    // 6. Crear prescripciones activas
    const prescriptions = [
      {
        id: 'PRES-' + Date.now() + '-1',
        patientId: uid,
        patientName: 'Juan Pérez',
        doctorId: 'DOC-001',
        doctorName: 'Dr. Carlos Mendoza',
        medication: 'Enalapril',
        dosage: '10mg',
        frequency: '1 vez al día',
        route: 'Oral',
        duration: '6 meses',
        quantity: 180,
        refills: 2,
        instructions: 'Tomar en la mañana con el desayuno. No suspender sin consultar al médico.',
        prescribedDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        startDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 150 * 24 * 60 * 60 * 1000),
        status: 'active',
        remainingDoses: 150,
        lastRefillDate: now,
        nextRefillDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        sideEffects: ['Mareos', 'Tos seca'],
        contraindications: ['Embarazo', 'Insuficiencia renal grave'],
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'PRES-' + Date.now() + '-2',
        patientId: uid,
        patientName: 'Juan Pérez',
        doctorId: 'DOC-001',
        doctorName: 'Dr. Carlos Mendoza',
        medication: 'Aspirina',
        dosage: '100mg',
        frequency: '1 vez al día',
        route: 'Oral',
        duration: 'Indefinido',
        quantity: 30,
        refills: 12,
        instructions: 'Tomar después del almuerzo con abundante agua.',
        prescribedDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        startDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        status: 'active',
        remainingDoses: 25,
        lastRefillDate: now,
        nextRefillDate: new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000),
        sideEffects: ['Irritación gástrica'],
        contraindications: ['Úlcera gástrica', 'Alergia a salicilatos'],
        createdAt: now,
        updatedAt: now
      }
    ];
    
    for (const prescription of prescriptions) {
      await db.collection('prescriptions').doc(prescription.id).set(prescription);
    }
    console.log('✅ Prescripciones creadas:', prescriptions.length);
    
    // 7. Crear notificaciones
    const notifications = [
      {
        id: 'NOTIF-' + Date.now() + '-1',
        userId: uid,
        type: 'appointment_reminder',
        title: 'Recordatorio de Cita',
        message: 'Tienes una cita con Dr. Carlos Mendoza mañana a las 14:30',
        data: {
          appointmentId: appointments[0].id,
          doctorName: 'Dr. Carlos Mendoza',
          date: appointments[0].date,
          time: '14:30'
        },
        read: false,
        createdAt: now,
        priority: 'high'
      },
      {
        id: 'NOTIF-' + Date.now() + '-2',
        userId: uid,
        type: 'prescription_refill',
        title: 'Renovación de Receta',
        message: 'Es momento de renovar tu receta de Enalapril',
        data: {
          prescriptionId: prescriptions[0].id,
          medication: 'Enalapril 10mg'
        },
        read: false,
        createdAt: now,
        priority: 'medium'
      },
      {
        id: 'NOTIF-' + Date.now() + '-3',
        userId: uid,
        type: 'lab_results',
        title: 'Resultados de Laboratorio',
        message: 'Tus resultados de análisis están listos',
        data: {
          labOrderId: 'LAB-001',
          testDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
        },
        read: false,
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        priority: 'medium'
      }
    ];
    
    for (const notification of notifications) {
      await db.collection('notifications').doc(notification.id).set(notification);
    }
    console.log('✅ Notificaciones creadas:', notifications.length);
    
    console.log('\n🎉 Paciente creado exitosamente!');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('🆔 UID:', uid);
    console.log('\n📊 Resumen de datos creados:');
    console.log('- Perfil de usuario ✅');
    console.log('- Perfil de paciente ✅');
    console.log(`- ${appointments.length} citas médicas ✅`);
    console.log(`- ${medicalRecords.length} registros médicos ✅`);
    console.log(`- ${prescriptions.length} prescripciones activas ✅`);
    console.log(`- ${notifications.length} notificaciones ✅`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit();
  }
}

// Ejecutar el script
createPatientWithData();