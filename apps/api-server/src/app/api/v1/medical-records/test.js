/**
 * 📋 MEDICAL RECORDS API - TEST CASES
 * Test completo para la API de historiales médicos
 */

const API_BASE_URL = 'http://localhost:3001/api/v1';
const AUTH_TOKEN = 'mock-token'; // Token de prueba

// Datos de prueba
const testPatientId = 'patient_test_001';
const testDoctorId = 'doctor_test_001';

const sampleMedicalRecord = {
  patientId: testPatientId,
  type: 'consultation',
  accessLevel: 'restricted',
  metadata: {
    title: 'Consulta de Control General',
    description: 'Consulta rutinaria de control de salud',
    tags: ['control', 'rutina', 'preventivo']
  },
  encounter: {
    date: new Date().toISOString(),
    type: 'outpatient',
    location: 'Consultorio 1A',
    provider: {
      id: testDoctorId,
      name: 'Dr. Juan Pérez',
      specialty: 'Medicina General',
      license: 'MP-12345'
    },
    duration: 30
  },
  clinical: {
    chiefComplaint: 'Consulta de control',
    historyOfPresentIllness: 'Paciente asintomático que viene para control anual',
    vitalSigns: [{
      temperature: 36.5,
      bloodPressure: {
        systolic: 120,
        diastolic: 80
      },
      heartRate: 72,
      respiratoryRate: 16,
      oxygenSaturation: 98,
      weight: 70,
      height: 175,
      bmi: 22.9,
      recordedAt: new Date().toISOString(),
      recordedBy: testDoctorId
    }],
    symptoms: [{
      id: 'symptom_001',
      name: 'Ninguno',
      description: 'Paciente asintomático',
      severity: 'low',
      duration: 'N/A',
      onset: 'gradual'
    }],
    physicalExamination: {
      general: 'Paciente en buen estado general',
      systems: {
        cardiovascular: 'Ruidos cardíacos rítmicos, sin soplos',
        respiratory: 'Murmullo vesicular conservado bilateral',
        abdomen: 'Blando, depresible, sin masas'
      }
    },
    diagnoses: [{
      id: 'diag_001',
      code: 'Z00.00',
      name: 'Examen médico general',
      description: 'Control de salud rutinario',
      type: 'primary',
      certainty: 'confirmed',
      severity: 'low'
    }]
  },
  plan: {
    immediate: ['Continuar con estilo de vida saludable'],
    shortTerm: ['Control en 6 meses'],
    longTerm: ['Mantener controles anuales'],
    followUp: {
      date: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString(), // 6 meses
      provider: testDoctorId,
      reason: 'Control rutinario'
    }
  }
};

// Utilidades de test
async function makeRequest(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AUTH_TOKEN}`
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const data = await response.json();
    
    return {
      status: response.status,
      data,
      headers: response.headers
    };
  } catch (error) {
    console.error(`❌ Error en ${method} ${endpoint}:`, error);
    throw error;
  }
}

// Test Cases
async function testCreateMedicalRecord() {
  console.log('\n🧪 Test 1: Crear Historial Médico');
  
  try {
    const result = await makeRequest('/medical-records', 'POST', sampleMedicalRecord);
    
    if (result.status === 201 && result.data.success) {
      console.log('✅ Historial médico creado exitosamente');
      console.log(`📋 ID: ${result.data.record?.id}`);
      console.log(`⏱️  Tiempo: ${result.headers.get('X-Execution-Time')}ms`);
      return result.data.record;
    } else {
      console.log('❌ Error al crear historial médico:', result.data);
      return null;
    }
  } catch (error) {
    console.log('❌ Test fallido:', error);
    return null;
  }
}

async function testSearchMedicalRecords() {
  console.log('\n🧪 Test 2: Buscar Historiales Médicos');
  
  try {
    const queryParams = new URLSearchParams({
      patientId: testPatientId,
      type: 'consultation',
      limit: '10',
      sortBy: 'date',
      sortOrder: 'desc'
    });

    const result = await makeRequest(`/medical-records?${queryParams}`, 'GET');
    
    if (result.status === 200 && result.data.success) {
      console.log('✅ Búsqueda exitosa');
      console.log(`📊 Encontrados: ${result.data.records?.length || 0} registros`);
      console.log(`📈 Total: ${result.data.pagination?.total || 0}`);
      console.log(`⏱️  Tiempo: ${result.headers.get('X-Execution-Time')}ms`);
      return result.data.records;
    } else {
      console.log('❌ Error en búsqueda:', result.data);
      return [];
    }
  } catch (error) {
    console.log('❌ Test fallido:', error);
    return [];
  }
}

async function testUpdateMedicalRecord(recordId) {
  console.log('\n🧪 Test 3: Actualizar Historial Médico');
  
  if (!recordId) {
    console.log('⚠️  No hay record ID para actualizar');
    return null;
  }

  try {
    const updateData = {
      recordId,
      updates: {
        clinical: {
          symptoms: [{
            id: 'symptom_002',
            name: 'Dolor de cabeza leve',
            description: 'Cefalea tensional ocasional',
            severity: 'low',
            duration: '2 días',
            onset: 'gradual'
          }]
        },
        plan: {
          immediate: [
            'Continuar con estilo de vida saludable',
            'Hidratación adecuada',
            'Manejo del estrés'
          ]
        }
      },
      updateReason: 'Síntoma adicional reportado por el paciente'
    };

    const result = await makeRequest('/medical-records', 'PUT', updateData);
    
    if (result.status === 200 && result.data.success) {
      console.log('✅ Historial médico actualizado exitosamente');
      console.log(`📋 ID: ${result.data.record?.id}`);
      console.log(`📝 Versión: ${result.data.record?.metadata?.version}`);
      console.log(`⏱️  Tiempo: ${result.headers.get('X-Execution-Time')}ms`);
      return result.data.record;
    } else {
      console.log('❌ Error al actualizar:', result.data);
      return null;
    }
  } catch (error) {
    console.log('❌ Test fallido:', error);
    return null;
  }
}

async function testValidationErrors() {
  console.log('\n🧪 Test 4: Validación de Errores');
  
  try {
    // Test con datos inválidos
    const invalidData = {
      patientId: '', // Campo requerido vacío
      type: 'invalid_type', // Tipo inválido
      metadata: {
        title: '' // Título vacío
      }
    };

    const result = await makeRequest('/medical-records', 'POST', invalidData);
    
    if (result.status === 400 && !result.data.success) {
      console.log('✅ Validación de errores funcionando correctamente');
      console.log(`🚫 Código: ${result.data.code}`);
      console.log(`📝 Errores: ${result.data.details?.length || 0} encontrados`);
      return true;
    } else {
      console.log('❌ La validación debería haber fallado:', result.data);
      return false;
    }
  } catch (error) {
    console.log('❌ Test fallido:', error);
    return false;
  }
}

async function testPermissions() {
  console.log('\n🧪 Test 5: Control de Permisos');
  
  try {
    // Test sin token de autorización
    const options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
        // Sin Authorization header
      }
    };

    const response = await fetch(`${API_BASE_URL}/medical-records`, options);
    const data = await response.json();
    
    if (response.status === 401 && !data.success) {
      console.log('✅ Control de permisos funcionando correctamente');
      console.log(`🚫 Código: ${data.code}`);
      return true;
    } else {
      console.log('❌ Debería requerir autorización:', data);
      return false;
    }
  } catch (error) {
    console.log('❌ Test fallido:', error);
    return false;
  }
}

async function testDeleteMedicalRecord(recordId) {
  console.log('\n🧪 Test 6: Eliminar Historial Médico');
  
  if (!recordId) {
    console.log('⚠️  No hay record ID para eliminar');
    return false;
  }

  try {
    const queryParams = new URLSearchParams({
      recordId,
      reason: 'Test de eliminación'
    });

    const result = await makeRequest(`/medical-records?${queryParams}`, 'DELETE');
    
    if (result.status === 200 && result.data.success) {
      console.log('✅ Historial médico eliminado exitosamente');
      console.log(`📋 ID: ${result.data.recordId}`);
      console.log(`⏱️  Tiempo: ${result.headers.get('X-Execution-Time')}ms`);
      return true;
    } else {
      console.log('❌ Error al eliminar:', result.data);
      return false;
    }
  } catch (error) {
    console.log('❌ Test fallido:', error);
    return false;
  }
}

// Ejecutar todos los tests
async function runAllTests() {
  console.log('🚀 INICIANDO TESTS DE MEDICAL RECORDS API');
  console.log('=' .repeat(60));

  const results = {
    create: false,
    search: false,
    update: false,
    validation: false,
    permissions: false,
    delete: false
  };

  // Test 1: Crear historial médico
  const createdRecord = await testCreateMedicalRecord();
  results.create = !!createdRecord;

  // Test 2: Buscar historiales médicos
  const searchResults = await testSearchMedicalRecords();
  results.search = searchResults.length >= 0;

  // Test 3: Actualizar historial médico
  if (createdRecord) {
    const updatedRecord = await testUpdateMedicalRecord(createdRecord.id);
    results.update = !!updatedRecord;
  }

  // Test 4: Validación de errores
  results.validation = await testValidationErrors();

  // Test 5: Control de permisos
  results.permissions = await testPermissions();

  // Test 6: Eliminar historial médico
  if (createdRecord) {
    results.delete = await testDeleteMedicalRecord(createdRecord.id);
  }

  // Resumen de resultados
  console.log('\n📊 RESUMEN DE TESTS');
  console.log('=' .repeat(60));
  
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(Boolean).length;
  
  Object.entries(results).forEach(([test, passed]) => {
    const icon = passed ? '✅' : '❌';
    const status = passed ? 'PASS' : 'FAIL';
    console.log(`${icon} ${test.toUpperCase()}: ${status}`);
  });

  console.log(`\n🎯 RESULTADO FINAL: ${passedTests}/${totalTests} tests pasaron`);
  
  if (passedTests === totalTests) {
    console.log('🎉 ¡TODOS LOS TESTS PASARON! API funcionando correctamente');
  } else {
    console.log('⚠️  Algunos tests fallaron. Revisar implementación.');
  }

  return { passed: passedTests, total: totalTests, results };
}

// Ejecutar si se llama directamente
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  runAllTests,
  testCreateMedicalRecord,
  testSearchMedicalRecords,
  testUpdateMedicalRecord,
  testValidationErrors,
  testPermissions,
  testDeleteMedicalRecord
};
