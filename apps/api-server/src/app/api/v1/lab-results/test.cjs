/**
 * 🧪 ALTAMEDICA LAB RESULTS API - TEST SUITE
 * Testing comprehensivo para endpoints de resultados de laboratorio
 * HIPAA compliance | FHIR R4 | Clinical decision support
 */

const axios = require('axios');
const crypto = require('crypto');

// ==================== CONFIGURACIÓN DE TESTING ====================

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api/v1/lab-results';
const AUTH_TOKEN = process.env.TEST_AUTH_TOKEN || 'test-jwt-token-lab-results';

const TEST_HEADERS = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${AUTH_TOKEN}`,
  'X-Facility-ID': 'test-facility-123',
  'X-User-Role': 'LAB_TECHNICIAN'
};

// ==================== HELPERS DE TESTING ====================

function generateTestLabResult() {
  const labResultId = `lab_${crypto.randomUUID()}`;
  const patientId = `patient_${crypto.randomBytes(8).toString('hex')}`;
  
  return {
    id: labResultId,
    patientId,
    facilityId: 'test-facility-123',
    orderNumber: `ORDER_${Date.now()}`,
    specimenId: `SPEC_${crypto.randomBytes(6).toString('hex')}`,
    testPanel: {
      id: 'panel_basic_metabolic',
      name: 'Basic Metabolic Panel',
      loinc: '24323-8',
      category: 'CHEMISTRY'
    },
    results: [
      {
        id: `result_${crypto.randomUUID()}`,
        testCode: {
          internal: 'GLU',
          loinc: '33747-0',
          name: 'Glucose, random',
          unit: 'mg/dL'
        },
        value: {
          numeric: 95,
          qualitative: null,
          unit: 'mg/dL'
        },
        referenceRange: {
          low: 70,
          high: 140,
          unit: 'mg/dL',
          population: 'ADULT_GENERAL'
        },
        status: 'FINAL',
        flags: [],
        methodology: 'ENZYMATIC',
        instrument: 'COBAS_8000'
      }
    ],
    specimen: {
      type: 'SERUM',
      collectionDateTime: new Date().toISOString(),
      receivedDateTime: new Date().toISOString(),
      volume: '5.0 mL',
      quality: 'ACCEPTABLE'
    },
    ordering: {
      physicianId: 'dr_smith_123',
      physicianName: 'Dr. Sarah Smith',
      orderDateTime: new Date().toISOString(),
      priority: 'ROUTINE',
      clinicalInfo: 'Annual physical exam'
    },
    laboratory: {
      id: 'lab_main_123',
      name: 'AltaMedica Central Laboratory',
      director: 'Dr. Michael Johnson, MD',
      accreditation: ['CAP', 'CLIA']
    },
    status: 'FINAL',
    timestamps: {
      ordered: new Date().toISOString(),
      collected: new Date().toISOString(),
      received: new Date().toISOString(),
      processed: new Date().toISOString(),
      validated: new Date().toISOString(),
      released: new Date().toISOString()
    },
    validation: {
      validatedBy: 'tech_jane_456',
      validatedAt: new Date().toISOString(),
      level: 'TECHNICAL_AND_CLINICAL',
      comments: 'All results within normal limits'
    },
    qualityControl: {
      passed: true,
      qcBatch: 'QC_2024_001',
      deltaCheck: 'PASSED',
      criticalValueCheck: 'NO_CRITICAL_VALUES'
    }
  };
}

// ==================== TESTS PRINCIPALES ====================

/**
 * 🧪 TEST 1: Crear resultado de laboratorio (POST)
 */
async function testCreateLabResult() {
  console.log('\n🧪 TEST 1: Creating Lab Result...');
  
  try {
    const testData = {
      labResult: generateTestLabResult(),
      validation: {
        autoValidate: true,
        validatorId: 'tech_jane_456',
        comments: 'Test creation via API'
      },
      notifications: {
        notifyPhysician: true,
        criticalValueAlert: true,
        methods: ['EMAIL', 'SMS']
      }
    };

    console.log('📤 Sending POST request...');
    console.log('🔬 Test Data:', {
      patientId: testData.labResult.patientId,
      orderNumber: testData.labResult.orderNumber,
      testCount: testData.labResult.results.length
    });

    const response = await axios.post(BASE_URL, testData, {
      headers: TEST_HEADERS,
      timeout: 30000
    });

    console.log('✅ SUCCESS - Lab Result Created');
    console.log('📊 Response Status:', response.status);
    console.log('🆔 Lab Result ID:', response.data.data.labResult.id);
    
    return {
      success: true,
      labResultId: response.data.data.labResult.id,
      data: response.data
    };

  } catch (error) {
    console.log('❌ FAILED - Lab Result Creation');
    console.log('🚫 Error:', error.response?.data || error.message);
    
    return { success: false, error: error.message };
  }
}

/**
 * 🔍 TEST 2: Buscar resultados (GET)
 */
async function testSearchLabResults() {
  console.log('\n🔍 TEST 2: Searching Lab Results...');
  
  try {
    const searchParams = new URLSearchParams({
      page: '1',
      pageSize: '10',
      status: 'FINAL',
      dateFrom: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      dateTo: new Date().toISOString()
    });

    console.log('🔎 Search Parameters:', Object.fromEntries(searchParams));

    const response = await axios.get(`${BASE_URL}?${searchParams}`, {
      headers: TEST_HEADERS,
      timeout: 30000
    });

    console.log('✅ SUCCESS - Lab Results Search');
    console.log('📊 Response Status:', response.status);
    console.log('📈 Total Results:', response.data.data.total);
    
    return { success: true, data: response.data };

  } catch (error) {
    console.log('❌ FAILED - Lab Results Search');
    console.log('🚫 Error:', error.response?.data || error.message);
    
    return { success: false, error: error.message };
  }
}

/**
 * 🔬 TEST 3: Análisis de resultados con IA (POST /analyze)
 */
async function testAnalyzeLabResults() {
  console.log('\n🔬 TEST 3: Analyzing Lab Results with AI...');
  
  try {
    const analysisRequest = {
      patientId: `patient_${crypto.randomBytes(8).toString('hex')}`,
      resultIds: [
        `lab_${crypto.randomUUID()}`,
        `lab_${crypto.randomUUID()}`
      ],
      analysisType: 'COMPREHENSIVE',
      includeHistory: true,
      includeTrends: true,
      includeRecommendations: true,
      parameters: {
        lookbackDays: 90,
        compareToPopulation: true,
        detectAnomalies: true,
        generateAlerts: true
      }
    };

    console.log('🧠 Analysis Request:', {
      patientId: analysisRequest.patientId,
      resultCount: analysisRequest.resultIds.length,
      analysisType: analysisRequest.analysisType
    });

    const response = await axios.post(`${BASE_URL}/analyze`, analysisRequest, {
      headers: TEST_HEADERS,
      timeout: 45000
    });

    console.log('✅ SUCCESS - Lab Results Analysis');
    console.log('📊 Response Status:', response.status);
    console.log('🧠 Analysis Engine:', response.data.metadata.analysisEngine);
    
    return { success: true, data: response.data };

  } catch (error) {
    console.log('❌ FAILED - Lab Results Analysis');
    console.log('🚫 Error:', error.response?.data || error.message);
    
    return { success: false, error: error.message };
  }
}

/**
 * 🚀 Ejecutar suite completo de tests
 */
async function runAllTests() {
  console.log('🧪 ALTAMEDICA LAB RESULTS API - TEST SUITE');
  console.log('=' .repeat(70));
  console.log('🔬 Testing Lab Results API endpoints...');
  console.log('🏥 Base URL:', BASE_URL);
  console.log('📅 Test Started:', new Date().toISOString());

  const testResults = [];
  const startTime = Date.now();

  // Ejecutar tests principales
  testResults.push(await testCreateLabResult());
  testResults.push(await testSearchLabResults());
  testResults.push(await testAnalyzeLabResults());

  const endTime = Date.now();
  const totalTime = endTime - startTime;

  // Resumen de resultados
  console.log('\n' + '=' .repeat(70));
  console.log('📊 TEST SUMMARY');
  console.log('=' .repeat(70));

  const successful = testResults.filter(r => r.success).length;
  const failed = testResults.filter(r => !r.success).length;

  console.log(`✅ Successful Tests: ${successful}`);
  console.log(`❌ Failed Tests: ${failed}`);
  console.log(`⏱️ Total Time: ${totalTime}ms`);
  console.log(`📈 Success Rate: ${(successful / testResults.length * 100).toFixed(1)}%`);

  if (failed > 0) {
    console.log('\n❌ FAILED TESTS:');
    testResults
      .filter(r => !r.success)
      .forEach((result, index) => {
        console.log(`${index + 1}. ${result.error}`);
      });
  }

  console.log('\n🏁 Tests completed!');
  console.log('📅 Test Finished:', new Date().toISOString());

  return {
    total: testResults.length,
    successful,
    failed,
    duration: totalTime,
    successRate: successful / testResults.length * 100
  };
}

// ==================== EJECUCIÓN ====================

if (require.main === module) {
  runAllTests()
    .then(summary => {
      process.exit(summary.failed > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('🚫 Test execution failed:', error);
      process.exit(1);
    });
}

module.exports = {
  runAllTests,
  testCreateLabResult,
  testSearchLabResults,
  testAnalyzeLabResults,
  generateTestLabResult
};
