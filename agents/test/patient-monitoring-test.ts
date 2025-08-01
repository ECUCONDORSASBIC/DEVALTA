import axios from 'axios';
import WebSocket from 'ws';

const API_BASE = 'http://localhost:3004';
const WS_ALERTS = 'ws://localhost:3004/stream/alerts';

// Test patient data
const testPatients = [
  { id: 'patient-001', name: 'John Doe' },
  { id: 'patient-002', name: 'Jane Smith' },
  { id: 'patient-003', name: 'Bob Johnson' },
];

// Helper function to generate vital signs
function generateVitals(patientId: string, scenario: 'normal' | 'critical' | 'deteriorating') {
  const base = {
    patientId,
    timestamp: new Date().toISOString(),
  };

  switch (scenario) {
    case 'normal':
      return {
        ...base,
        heartRate: 72 + Math.random() * 10,
        bloodPressureSystolic: 120 + Math.random() * 10,
        bloodPressureDiastolic: 80 + Math.random() * 5,
        respiratoryRate: 16 + Math.random() * 2,
        temperature: 36.5 + Math.random() * 0.5,
        oxygenSaturation: 97 + Math.random() * 2,
      };
    case 'critical':
      return {
        ...base,
        heartRate: 140 + Math.random() * 20, // Tachycardia
        bloodPressureSystolic: 180 + Math.random() * 20, // Hypertension
        bloodPressureDiastolic: 110 + Math.random() * 10,
        respiratoryRate: 28 + Math.random() * 4, // Tachypnea
        temperature: 39 + Math.random() * 0.5, // Fever
        oxygenSaturation: 85 + Math.random() * 3, // Hypoxia
      };
    case 'deteriorating':
      // Start normal and gradually worsen
      const progress = Math.random();
      return {
        ...base,
        heartRate: 72 + progress * 50,
        bloodPressureSystolic: 120 - progress * 20,
        bloodPressureDiastolic: 80 - progress * 15,
        respiratoryRate: 16 + progress * 10,
        temperature: 36.5 + progress * 2.5,
        oxygenSaturation: 97 - progress * 7,
      };
  }
}

// Helper function to generate wearable data
function generateWearableData(patientId: string, deviceType: string) {
  const base = {
    patientId,
    deviceId: `device-${Math.random().toString(36).substring(7)}`,
    timestamp: new Date().toISOString(),
    type: deviceType,
  };

  switch (deviceType) {
    case 'fitbit':
      return {
        ...base,
        data: {
          hrv: 45 + Math.random() * 20,
          activity: Math.floor(Math.random() * 10000),
          sleep: { quality: Math.random(), duration: 6 + Math.random() * 3 },
        },
      };
    case 'continuous_glucose_monitor':
      return {
        ...base,
        data: {
          glucose: 100 + Math.random() * 50,
          trend: Math.random() > 0.5 ? 'rising' : 'falling',
        },
      };
    case 'ecg_patch':
      return {
        ...base,
        data: {
          features: { qrs: 0.08 + Math.random() * 0.02, pr: 0.16 + Math.random() * 0.04 },
          arrhythmia: Math.random() > 0.8,
        },
      };
    default:
      return base;
  }
}

// Helper function to generate EHR updates
function generateEHRUpdate(patientId: string, updateType: string) {
  const base = {
    patientId,
    timestamp: new Date().toISOString(),
    updateType,
  };

  switch (updateType) {
    case 'lab_results':
      return {
        ...base,
        data: {
          wbc: 7.5 + Math.random() * 5, // White blood cell count
          hemoglobin: 13 + Math.random() * 3,
          platelets: 200 + Math.random() * 100,
          creatinine: 0.8 + Math.random() * 0.4,
          lactate: 1 + Math.random() * 2,
        },
      };
    case 'medication':
      return {
        ...base,
        data: {
          medication: 'Acetaminophen',
          dose: '500mg',
          route: 'PO',
          frequency: 'q6h',
        },
      };
    case 'diagnosis':
      return {
        ...base,
        data: {
          code: 'A41.9',
          description: 'Sepsis, unspecified organism',
          severity: 'moderate',
        },
      };
    default:
      return base;
  }
}

async function testPatientMonitoring() {
  console.log('🏥 Starting Patient Monitoring Agent Test Suite\n');

  // Connect to alert stream
  console.log('📡 Connecting to alert stream...');
  const alertWs = new WebSocket(WS_ALERTS);
  
  alertWs.on('open', () => {
    console.log('✅ Connected to alert stream\n');
  });

  alertWs.on('message', (data) => {
    const alert = JSON.parse(data.toString());
    console.log('🚨 ALERT RECEIVED:', {
      patientId: alert.patientId,
      type: alert.type,
      severity: alert.severity,
      score: alert.score,
      indicators: alert.indicators,
    });
  });

  // Test 1: Normal patient vitals
  console.log('Test 1: Submitting normal vital signs');
  for (const patient of testPatients) {
    const vitals = generateVitals(patient.id, 'normal');
    try {
      await axios.post(`${API_BASE}/patients/${patient.id}/vitals`, vitals);
      console.log(`✅ Submitted normal vitals for ${patient.name}`);
    } catch (error) {
      console.error(`❌ Failed to submit vitals for ${patient.name}:`, error.message);
    }
  }

  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test 2: Critical patient vitals
  console.log('\nTest 2: Submitting critical vital signs');
  const criticalPatient = testPatients[0];
  const criticalVitals = generateVitals(criticalPatient.id, 'critical');
  try {
    await axios.post(`${API_BASE}/patients/${criticalPatient.id}/vitals`, criticalVitals);
    console.log(`✅ Submitted critical vitals for ${criticalPatient.name}`);
    console.log('   Expected: Critical alert should be generated');
  } catch (error) {
    console.error(`❌ Failed to submit critical vitals:`, error.message);
  }

  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test 3: Wearable device data
  console.log('\nTest 3: Submitting wearable device data');
  for (const patient of testPatients) {
    const devices = ['fitbit', 'continuous_glucose_monitor', 'ecg_patch'];
    const device = devices[Math.floor(Math.random() * devices.length)];
    const wearableData = generateWearableData(patient.id, device);
    
    try {
      await axios.post(`${API_BASE}/patients/${patient.id}/wearable`, wearableData);
      console.log(`✅ Submitted ${device} data for ${patient.name}`);
    } catch (error) {
      console.error(`❌ Failed to submit wearable data:`, error.message);
    }
  }

  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test 4: EHR updates
  console.log('\nTest 4: Submitting EHR updates');
  for (const patient of testPatients) {
    const updateTypes = ['lab_results', 'medication', 'diagnosis'];
    const updateType = updateTypes[Math.floor(Math.random() * updateTypes.length)];
    const ehrUpdate = generateEHRUpdate(patient.id, updateType);
    
    try {
      await axios.post(`${API_BASE}/patients/${patient.id}/ehr`, ehrUpdate);
      console.log(`✅ Submitted ${updateType} for ${patient.name}`);
    } catch (error) {
      console.error(`❌ Failed to submit EHR update:`, error.message);
    }
  }

  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test 5: Deteriorating patient simulation
  console.log('\nTest 5: Simulating deteriorating patient');
  const deterioratingPatient = testPatients[1];
  for (let i = 0; i < 5; i++) {
    const vitals = generateVitals(deterioratingPatient.id, 'deteriorating');
    try {
      await axios.post(`${API_BASE}/patients/${deterioratingPatient.id}/vitals`, vitals);
      console.log(`✅ Submitted deteriorating vitals ${i + 1}/5 for ${deterioratingPatient.name}`);
    } catch (error) {
      console.error(`❌ Failed to submit vitals:`, error.message);
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test 6: Query patient status
  console.log('\nTest 6: Querying patient status');
  for (const patient of testPatients) {
    try {
      const response = await axios.get(`${API_BASE}/patients/${patient.id}/status`);
      console.log(`✅ ${patient.name} status:`, {
        lastUpdated: response.data.lastUpdated,
        riskScores: response.data.riskScores,
        activeAlerts: response.data.activeAlerts.length,
      });
    } catch (error) {
      console.error(`❌ Failed to get patient status:`, error.message);
    }
  }

  // Test 7: Query active alerts
  console.log('\nTest 7: Querying active alerts');
  try {
    const response = await axios.get(`${API_BASE}/alerts/active`);
    console.log(`✅ Active alerts: ${response.data.length}`);
    response.data.forEach((alert: any) => {
      console.log(`   - ${alert.patientId}: ${alert.type} (${alert.severity})`);
    });
  } catch (error) {
    console.error('❌ Failed to get active alerts:', error.message);
  }

  // Test 8: Query ML models
  console.log('\nTest 8: Querying ML model status');
  try {
    const response = await axios.get(`${API_BASE}/models`);
    console.log(`✅ ML Models: ${response.data.length}`);
    response.data.forEach((model: any) => {
      console.log(`   - ${model.name}: ${model.enabled ? 'Enabled' : 'Disabled'} (threshold: ${model.threshold})`);
    });
  } catch (error) {
    console.error('❌ Failed to get model status:', error.message);
  }

  // Test 9: Health check
  console.log('\nTest 9: Health check');
  try {
    const response = await axios.get(`${API_BASE}/health`);
    console.log('✅ Health status:', response.data);
  } catch (error) {
    console.error('❌ Failed to get health status:', error.message);
  }

  // Test 10: Metrics
  console.log('\nTest 10: Agent metrics');
  try {
    const response = await axios.get(`${API_BASE}/metrics`);
    console.log('✅ Key metrics:');
    console.log(`   - Active patients: ${response.data.active_patients?.[0]?.value || 0}`);
    console.log(`   - Total alerts: ${response.data.total_alerts?.[0]?.value || 0}`);
    console.log(`   - Critical alerts: ${response.data.critical_alerts?.[0]?.value || 0}`);
  } catch (error) {
    console.error('❌ Failed to get metrics:', error.message);
  }

  // Close WebSocket connection
  setTimeout(() => {
    console.log('\n📡 Closing connections...');
    alertWs.close();
    console.log('✅ Test suite completed!');
    process.exit(0);
  }, 5000);
}

// Run the test
testPatientMonitoring().catch(console.error);
