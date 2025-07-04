#!/usr/bin/env node

/**
 * 🧪 SCRIPT DE PRUEBA - INTEGRACIÓN DE CITAS REALES
 * Verifica que la API de citas funciona correctamente con datos reales
 * PROACTIVO: Prueba completa del flujo de citas
 */

const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, collection, addDoc, query, where, getDocs, deleteDoc, doc } = require('firebase/firestore');

// Configuración de Firebase (usar la misma que en el proyecto)
const firebaseConfig = {
  apiKey: "AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "altamedica-dev.firebaseapp.com",
  projectId: "altamedica-dev",
  storageBucket: "altamedica-dev.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Credenciales de prueba
const TEST_CREDENTIALS = {
  email: 'test@altamedica.com',
  password: 'test123456'
};

// Datos de prueba
const TEST_APPOINTMENT = {
  doctorId: 'test-doctor-id',
  patientId: 'test-patient-id',
  scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Mañana
  estimatedDuration: 30,
  type: 'consultation',
  reason: 'Consulta de prueba - Integración API',
  symptoms: ['Dolor de cabeza', 'Fatiga'],
  notes: 'Cita creada para probar la integración',
  priority: 'normal'
};

class AppointmentIntegrationTester {
  constructor() {
    this.authToken = null;
    this.testResults = [];
  }

  async runTests() {
    console.log('🧪 INICIANDO PRUEBAS DE INTEGRACIÓN DE CITAS');
    console.log('=' .repeat(60));

    try {
      // 1. Autenticación
      await this.testAuthentication();

      // 2. Crear usuarios de prueba
      await this.createTestUsers();

      // 3. Probar API de citas
      await this.testAppointmentsAPI();

      // 4. Limpiar datos de prueba
      await this.cleanupTestData();

      // 5. Mostrar resultados
      this.showResults();

    } catch (error) {
      console.error('❌ Error en las pruebas:', error);
      process.exit(1);
    }
  }

  async testAuthentication() {
    console.log('🔐 Probando autenticación...');
    
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        TEST_CREDENTIALS.email, 
        TEST_CREDENTIALS.password
      );
      
      this.authToken = await userCredential.user.getIdToken();
      console.log('✅ Autenticación exitosa');
      this.testResults.push({ test: 'Authentication', status: 'PASS' });
      
    } catch (error) {
      console.log('❌ Error de autenticación:', error.message);
      this.testResults.push({ test: 'Authentication', status: 'FAIL', error: error.message });
      throw error;
    }
  }

  async createTestUsers() {
    console.log('👥 Creando usuarios de prueba...');
    
    try {
      // Crear doctor de prueba
      const doctorData = {
        firstName: 'Dr. Test',
        lastName: 'Médico',
        email: 'doctor.test@altamedica.com',
        role: 'doctor',
        isActive: true,
        licenseNumber: 'TEST123',
        specialties: ['general_medicine'],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const doctorRef = await addDoc(collection(db, 'users'), doctorData);
      TEST_APPOINTMENT.doctorId = doctorRef.id;

      // Crear paciente de prueba
      const patientData = {
        firstName: 'Paciente',
        lastName: 'Test',
        email: 'patient.test@altamedica.com',
        role: 'patient',
        isActive: true,
        dateOfBirth: '1990-01-01',
        phone: '+1234567890',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const patientRef = await addDoc(collection(db, 'users'), patientData);
      TEST_APPOINTMENT.patientId = patientRef.id;

      console.log('✅ Usuarios de prueba creados');
      this.testResults.push({ test: 'Create Test Users', status: 'PASS' });
      
    } catch (error) {
      console.log('❌ Error creando usuarios:', error.message);
      this.testResults.push({ test: 'Create Test Users', status: 'FAIL', error: error.message });
      throw error;
    }
  }

  async testAppointmentsAPI() {
    console.log('📅 Probando API de citas...');
    
    const baseUrl = 'http://localhost:3001/api/v1/appointments';
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.authToken}`
    };

    try {
      // 1. Crear cita
      console.log('  ➕ Creando cita...');
      const createResponse = await fetch(baseUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(TEST_APPOINTMENT)
      });

      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        throw new Error(`Error ${createResponse.status}: ${errorData.message || createResponse.statusText}`);
      }

      const createResult = await createResponse.json();
      const appointmentId = createResult.data.id;
      console.log('  ✅ Cita creada:', appointmentId);
      this.testResults.push({ test: 'Create Appointment', status: 'PASS' });

      // 2. Obtener cita por ID
      console.log('  📋 Obteniendo cita...');
      const getResponse = await fetch(`${baseUrl}/${appointmentId}`, {
        method: 'GET',
        headers
      });

      if (!getResponse.ok) {
        throw new Error(`Error ${getResponse.status}: ${getResponse.statusText}`);
      }

      const getResult = await getResponse.json();
      console.log('  ✅ Cita obtenida:', getResult.data.id);
      this.testResults.push({ test: 'Get Appointment', status: 'PASS' });

      // 3. Listar citas
      console.log('  📋 Listando citas...');
      const listResponse = await fetch(`${baseUrl}?patientId=${TEST_APPOINTMENT.patientId}`, {
        method: 'GET',
        headers
      });

      if (!listResponse.ok) {
        throw new Error(`Error ${listResponse.status}: ${listResponse.statusText}`);
      }

      const listResult = await listResponse.json();
      console.log('  ✅ Citas listadas:', listResult.data.length, 'citas encontradas');
      this.testResults.push({ test: 'List Appointments', status: 'PASS' });

      // 4. Actualizar cita
      console.log('  ✏️ Actualizando cita...');
      const updateData = {
        notes: 'Cita actualizada - Prueba de integración completada'
      };

      const updateResponse = await fetch(`${baseUrl}/${appointmentId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updateData)
      });

      if (!updateResponse.ok) {
        throw new Error(`Error ${updateResponse.status}: ${updateResponse.statusText}`);
      }

      const updateResult = await updateResponse.json();
      console.log('  ✅ Cita actualizada');
      this.testResults.push({ test: 'Update Appointment', status: 'PASS' });

      // 5. Cancelar cita
      console.log('  ❌ Cancelando cita...');
      const cancelResponse = await fetch(`${baseUrl}/${appointmentId}/cancel`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ reason: 'Prueba de integración completada' })
      });

      if (!cancelResponse.ok) {
        throw new Error(`Error ${cancelResponse.status}: ${cancelResponse.statusText}`);
      }

      const cancelResult = await cancelResponse.json();
      console.log('  ✅ Cita cancelada');
      this.testResults.push({ test: 'Cancel Appointment', status: 'PASS' });

    } catch (error) {
      console.log('❌ Error en API de citas:', error.message);
      this.testResults.push({ test: 'Appointments API', status: 'FAIL', error: error.message });
      throw error;
    }
  }

  async cleanupTestData() {
    console.log('🧹 Limpiando datos de prueba...');
    
    try {
      // Eliminar citas de prueba
      const appointmentsQuery = query(
        collection(db, 'appointments'),
        where('reason', '==', 'Consulta de prueba - Integración API')
      );
      
      const appointmentsSnapshot = await getDocs(appointmentsQuery);
      const deletePromises = appointmentsSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      // Eliminar usuarios de prueba
      const usersQuery = query(
        collection(db, 'users'),
        where('email', 'in', ['doctor.test@altamedica.com', 'patient.test@altamedica.com'])
      );
      
      const usersSnapshot = await getDocs(usersQuery);
      const userDeletePromises = usersSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(userDeletePromises);

      console.log('✅ Datos de prueba limpiados');
      this.testResults.push({ test: 'Cleanup Test Data', status: 'PASS' });
      
    } catch (error) {
      console.log('⚠️ Error limpiando datos:', error.message);
      this.testResults.push({ test: 'Cleanup Test Data', status: 'WARNING', error: error.message });
    }
  }

  showResults() {
    console.log('\n📊 RESULTADOS DE LAS PRUEBAS');
    console.log('=' .repeat(60));
    
    const passed = this.testResults.filter(r => r.status === 'PASS').length;
    const failed = this.testResults.filter(r => r.status === 'FAIL').length;
    const warnings = this.testResults.filter(r => r.status === 'WARNING').length;
    
    this.testResults.forEach(result => {
      const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️';
      console.log(`${icon} ${result.test}: ${result.status}`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    });
    
    console.log('\n📈 RESUMEN:');
    console.log(`✅ Exitosas: ${passed}`);
    console.log(`❌ Fallidas: ${failed}`);
    console.log(`⚠️ Advertencias: ${warnings}`);
    
    if (failed === 0) {
      console.log('\n🎉 ¡Todas las pruebas pasaron! La integración de citas está funcionando correctamente.');
    } else {
      console.log('\n⚠️ Algunas pruebas fallaron. Revisar los errores antes de continuar.');
      process.exit(1);
    }
  }
}

// Ejecutar pruebas
async function main() {
  const tester = new AppointmentIntegrationTester();
  await tester.runTests();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { AppointmentIntegrationTester }; 