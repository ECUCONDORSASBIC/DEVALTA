#!/usr/bin/env node

/**
 * 🧪 SCRIPT SIMPLE DE PRUEBA - API DE CITAS
 * Prueba básica de la API de citas sin dependencias externas
 */

const BASE_URL = 'http://localhost:3001/api/v1/appointments';

// Datos de prueba
const TEST_APPOINTMENT = {
  doctorId: 'test-doctor-123',
  patientId: 'test-patient-456',
  scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  estimatedDuration: 30,
  type: 'consultation',
  reason: 'Consulta de prueba - API Simple',
  symptoms: ['Dolor de cabeza'],
  notes: 'Prueba de integración',
  priority: 'normal'
};

class SimpleAppointmentTester {
  constructor() {
    this.testResults = [];
  }

  async runTests() {
    console.log('🧪 PRUEBA SIMPLE DE API DE CITAS');
    console.log('=' .repeat(50));

    try {
      // 1. Probar endpoint de listado
      await this.testListEndpoint();

      // 2. Probar creación (sin autenticación real)
      await this.testCreateEndpoint();

      // 3. Mostrar resultados
      this.showResults();

    } catch (error) {
      console.error('❌ Error en las pruebas:', error.message);
    }
  }

  async testListEndpoint() {
    console.log('📋 Probando endpoint de listado...');
    
    try {
      const response = await fetch(`${BASE_URL}?limit=5`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Endpoint de listado funciona');
        console.log(`   Status: ${response.status}`);
        console.log(`   Datos recibidos: ${data.data ? data.data.length : 0} citas`);
        this.testResults.push({ test: 'List Endpoint', status: 'PASS' });
      } else {
        console.log(`❌ Error ${response.status}: ${response.statusText}`);
        this.testResults.push({ 
          test: 'List Endpoint', 
          status: 'FAIL', 
          error: `${response.status}: ${response.statusText}` 
        });
      }
    } catch (error) {
      console.log('❌ Error de conexión:', error.message);
      this.testResults.push({ 
        test: 'List Endpoint', 
        status: 'FAIL', 
        error: error.message 
      });
    }
  }

  async testCreateEndpoint() {
    console.log('➕ Probando endpoint de creación...');
    
    try {
      const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(TEST_APPOINTMENT)
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Endpoint de creación funciona');
        console.log(`   Status: ${response.status}`);
        console.log(`   Cita creada: ${data.data?.id || 'N/A'}`);
        this.testResults.push({ test: 'Create Endpoint', status: 'PASS' });
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.log(`❌ Error ${response.status}: ${errorData.message || response.statusText}`);
        this.testResults.push({ 
          test: 'Create Endpoint', 
          status: 'FAIL', 
          error: `${response.status}: ${errorData.message || response.statusText}` 
        });
      }
    } catch (error) {
      console.log('❌ Error de conexión:', error.message);
      this.testResults.push({ 
        test: 'Create Endpoint', 
        status: 'FAIL', 
        error: error.message 
      });
    }
  }

  showResults() {
    console.log('\n📊 RESULTADOS:');
    console.log('=' .repeat(30));
    
    const passed = this.testResults.filter(r => r.status === 'PASS').length;
    const failed = this.testResults.filter(r => r.status === 'FAIL').length;
    
    this.testResults.forEach(result => {
      const icon = result.status === 'PASS' ? '✅' : '❌';
      console.log(`${icon} ${result.test}: ${result.status}`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    });
    
    console.log(`\n📈 Resumen: ${passed} exitosas, ${failed} fallidas`);
    
    if (failed === 0) {
      console.log('🎉 ¡API de citas funcionando correctamente!');
    } else {
      console.log('⚠️ Algunos endpoints tienen problemas.');
    }
  }
}

// Ejecutar pruebas
async function main() {
  const tester = new SimpleAppointmentTester();
  await tester.runTests();
}

main().catch(console.error); 