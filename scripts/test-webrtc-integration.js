#!/usr/bin/env node

/**
 * 🧪 SCRIPT DE PRUEBA - INTEGRACIÓN WEBRTC
 * Verifica que el sistema WebRTC funciona correctamente
 * PROACTIVO: Prueba completa del flujo de telemedicina
 */

const BASE_URL = 'http://localhost:3001/api/v1/telemedicine/webrtc';

// Datos de prueba
const TEST_ROOM = {
  roomId: 'test-room-' + Date.now(),
  appointmentId: 'test-appointment-123',
  doctorId: 'test-doctor-456',
  patientId: 'test-patient-789',
  status: 'waiting'
};

const TEST_SIGNALING_MESSAGES = [
  {
    type: 'join',
    roomId: TEST_ROOM.roomId,
    from: 'test-user-1',
    data: { userType: 'doctor', timestamp: Date.now() }
  },
  {
    type: 'join',
    roomId: TEST_ROOM.roomId,
    from: 'test-user-2',
    data: { userType: 'patient', timestamp: Date.now() }
  },
  {
    type: 'offer',
    roomId: TEST_ROOM.roomId,
    from: 'test-user-1',
    to: 'test-user-2',
    data: {
      type: 'offer',
      sdp: 'v=0\r\no=- 1234567890 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=group:BUNDLE 0\r\nm=application 9 UDP/DTLS/SCTP webrtc-datachannel\r\nc=IN IP4 0.0.0.0\r\na=ice-ufrag:test\r\na=ice-pwd:test\r\na=ice-options:trickle\r\na=fingerprint:sha-256 test\r\na=setup:actpass\r\na=mid:0\r\na=sctp-port:5000\r\na=max-message-size:262144\r\n'
    }
  }
];

class WebRTCTester {
  constructor() {
    this.testResults = [];
  }

  async runTests() {
    console.log('🧪 INICIANDO PRUEBAS DE INTEGRACIÓN WEBRTC');
    console.log('=' .repeat(60));

    try {
      // 1. Probar creación de sala
      await this.testRoomCreation();

      // 2. Probar signaling server
      await this.testSignalingServer();

      // 3. Probar gestión de salas
      await this.testRoomManagement();

      // 4. Probar mensajes de signaling
      await this.testSignalingMessages();

      // 5. Limpiar datos de prueba
      await this.cleanupTestData();

      // 6. Mostrar resultados
      this.showResults();

    } catch (error) {
      console.error('❌ Error en las pruebas:', error);
      process.exit(1);
    }
  }

  async testRoomCreation() {
    console.log('🏠 Probando creación de sala...');
    
    try {
      const response = await fetch(`${BASE_URL}/rooms/${TEST_ROOM.roomId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || 'test-token'}`
        },
        body: JSON.stringify(TEST_ROOM)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Sala creada exitosamente:', result.data.roomId);
        this.testResults.push({ test: 'Room Creation', status: 'PASS' });
      } else {
        const errorData = await response.json();
        console.log('❌ Error creando sala:', errorData.message);
        this.testResults.push({ 
          test: 'Room Creation', 
          status: 'FAIL', 
          error: errorData.message 
        });
      }
    } catch (error) {
      console.log('❌ Error de conexión:', error.message);
      this.testResults.push({ 
        test: 'Room Creation', 
        status: 'FAIL', 
        error: error.message 
      });
    }
  }

  async testSignalingServer() {
    console.log('📡 Probando signaling server...');
    
    try {
      const response = await fetch(`${BASE_URL}/signaling`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || 'test-token'}`
        },
        body: JSON.stringify(TEST_SIGNALING_MESSAGES[0])
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Signaling server funciona');
        this.testResults.push({ test: 'Signaling Server', status: 'PASS' });
      } else {
        const errorData = await response.json();
        console.log('❌ Error en signaling:', errorData.message);
        this.testResults.push({ 
          test: 'Signaling Server', 
          status: 'FAIL', 
          error: errorData.message 
        });
      }
    } catch (error) {
      console.log('❌ Error de conexión:', error.message);
      this.testResults.push({ 
        test: 'Signaling Server', 
        status: 'FAIL', 
        error: error.message 
      });
    }
  }

  async testRoomManagement() {
    console.log('📋 Probando gestión de salas...');
    
    try {
      // Obtener sala
      const getResponse = await fetch(`${BASE_URL}/rooms/${TEST_ROOM.roomId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken') || 'test-token'}`
        }
      });

      if (getResponse.ok) {
        const result = await response.json();
        console.log('✅ Sala obtenida:', result.data.roomId);
        
        // Actualizar sala
        const updateResponse = await fetch(`${BASE_URL}/rooms/${TEST_ROOM.roomId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken') || 'test-token'}`
          },
          body: JSON.stringify({ status: 'active' })
        });

        if (updateResponse.ok) {
          console.log('✅ Sala actualizada');
          this.testResults.push({ test: 'Room Management', status: 'PASS' });
        } else {
          console.log('❌ Error actualizando sala');
          this.testResults.push({ 
            test: 'Room Management', 
            status: 'FAIL', 
            error: 'Update failed' 
          });
        }
      } else {
        console.log('❌ Error obteniendo sala');
        this.testResults.push({ 
          test: 'Room Management', 
          status: 'FAIL', 
          error: 'Get failed' 
        });
      }
    } catch (error) {
      console.log('❌ Error de conexión:', error.message);
      this.testResults.push({ 
        test: 'Room Management', 
        status: 'FAIL', 
        error: error.message 
      });
    }
  }

  async testSignalingMessages() {
    console.log('💬 Probando mensajes de signaling...');
    
    try {
      let successCount = 0;
      
      for (const message of TEST_SIGNALING_MESSAGES) {
        const response = await fetch(`${BASE_URL}/signaling`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken') || 'test-token'}`
          },
          body: JSON.stringify(message)
        });

        if (response.ok) {
          successCount++;
        }
      }

      if (successCount === TEST_SIGNALING_MESSAGES.length) {
        console.log('✅ Todos los mensajes de signaling procesados');
        this.testResults.push({ test: 'Signaling Messages', status: 'PASS' });
      } else {
        console.log(`❌ Solo ${successCount}/${TEST_SIGNALING_MESSAGES.length} mensajes exitosos`);
        this.testResults.push({ 
          test: 'Signaling Messages', 
          status: 'FAIL', 
          error: `${successCount}/${TEST_SIGNALING_MESSAGES.length} messages failed` 
        });
      }
    } catch (error) {
      console.log('❌ Error de conexión:', error.message);
      this.testResults.push({ 
        test: 'Signaling Messages', 
        status: 'FAIL', 
        error: error.message 
      });
    }
  }

  async cleanupTestData() {
    console.log('🧹 Limpiando datos de prueba...');
    
    try {
      const response = await fetch(`${BASE_URL}/rooms/${TEST_ROOM.roomId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken') || 'test-token'}`
        }
      });

      if (response.ok) {
        console.log('✅ Datos de prueba limpiados');
        this.testResults.push({ test: 'Cleanup Test Data', status: 'PASS' });
      } else {
        console.log('⚠️ Error limpiando datos (no crítico)');
        this.testResults.push({ test: 'Cleanup Test Data', status: 'WARNING' });
      }
    } catch (error) {
      console.log('⚠️ Error limpiando datos:', error.message);
      this.testResults.push({ 
        test: 'Cleanup Test Data', 
        status: 'WARNING', 
        error: error.message 
      });
    }
  }

  showResults() {
    console.log('\n📊 RESULTADOS DE LAS PRUEBAS WEBRTC');
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
      console.log('\n🎉 ¡Todas las pruebas pasaron! El sistema WebRTC está funcionando correctamente.');
      console.log('\n🚀 Próximos pasos:');
      console.log('1. Configurar TURN servers para producción');
      console.log('2. Implementar grabación de sesiones');
      console.log('3. Añadir notificaciones push');
    } else {
      console.log('\n⚠️ Algunas pruebas fallaron. Revisar los errores antes de continuar.');
      process.exit(1);
    }
  }
}

// Ejecutar pruebas
async function main() {
  const tester = new WebRTCTester();
  await tester.runTests();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { WebRTCTester }; 