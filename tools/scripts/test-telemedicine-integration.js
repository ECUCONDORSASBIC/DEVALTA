/**
 * Script de prueba para verificar la integración de telemedicina
 * Este script verifica que el sistema de videollamadas esté funcionando
 */

const { AltaMedicaVideoCallClient, createConsultationCall } = require('./packages/telemedicine-core/src/videoCallClient.ts');

console.log('🏥 AltaMedica - Prueba de Integración de Telemedicina');
console.log('='.repeat(60));

// Función para simular una prueba de integración
async function testTelemedicineIntegration() {
  try {
    console.log('📋 Iniciando pruebas de integración...\n');

    // Datos de prueba
    const doctorEmail = 'dr.garcia@altamedica.com';
    const patientEmail = 'maria.gonzalez@email.com';
    const consultationId = 'test_integration_' + Date.now();

    console.log('👨‍⚕️ Doctor:', doctorEmail);
    console.log('👨‍🦱 Paciente:', patientEmail);
    console.log('🆔 ID de Consulta:', consultationId);
    console.log();

    // Test 1: Verificar conectividad del servidor
    console.log('🔍 Test 1: Verificando conectividad del servidor...');
    try {
      const response = await fetch('http://localhost:8888/health');
      if (response.ok) {
        const health = await response.json();
        console.log('✅ Servidor de videollamadas respondiendo:', health.status || 'OK');
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.log('❌ Servidor no disponible:', error.message);
      console.log('💡 Asegúrate de que el servidor esté ejecutándose en puerto 8888');
      return false;
    }

    // Test 2: Crear videollamada
    console.log('\n🔍 Test 2: Creando videollamada...');
    try {
      const result = await createConsultationCall(doctorEmail, patientEmail, consultationId, {
        specialty: 'Cardiología',
        duration: 30,
        scheduledTime: new Date().toISOString()
      });

      if (result.error) {
        console.log('❌ Error creando videollamada:', result.error);
        return false;
      }

      console.log('✅ Videollamada creada exitosamente!');
      console.log('🆔 Room ID:', result.room_id);
      console.log('👨‍⚕️ URL Doctor:', result.doctor_url);
      console.log('👨‍🦱 URL Paciente:', result.patient_url);

      // Test 3: Verificar estado de la llamada
      console.log('\n🔍 Test 3: Verificando estado de la llamada...');
      const client = new AltaMedicaVideoCallClient();
      const status = await client.getCallStatus(result.room_id);
      
      if (status.error) {
        console.log('❌ Error obteniendo estado:', status.error);
        return false;
      }

      console.log('✅ Estado obtenido correctamente:');
      console.log('  - Doctor conectado:', status.doctor_connected ? '✅' : '❌');
      console.log('  - Paciente conectado:', status.patient_connected ? '✅' : '❌');
      console.log('  - Llamada activa:', status.is_active ? '✅' : '❌');
      console.log('  - Creada en:', status.created_at);

      return true;

    } catch (error) {
      console.log('❌ Error en la prueba:', error.message);
      return false;
    }

  } catch (error) {
    console.log('❌ Error general:', error.message);
    return false;
  }
}

// Función para mostrar instrucciones de uso
function showUsageInstructions() {
  console.log('\n📋 Instrucciones de Uso:');
  console.log('='.repeat(30));
  console.log('');
  console.log('🏥 Para Pacientes (Puerto 3003):');
  console.log('  1. Navegar a: http://localhost:3003/telemedicine');
  console.log('  2. Hacer clic en "Unirse a la Consulta" en una sesión activa');
  console.log('  3. La videollamada se abrirá automáticamente');
  console.log('');
  console.log('👨‍⚕️ Para Doctores (Puerto 3002):');
  console.log('  1. Navegar a: http://localhost:3002/telemedicine');
  console.log('  2. Hacer clic en "Iniciar Consulta" en una sesión programada');
  console.log('  3. Revisar información del paciente y comenzar la videollamada');
  console.log('');
  console.log('🔗 URLs de Prueba Directas:');
  console.log('  - Paciente: http://localhost:3003/telemedicine/room/session-001');
  console.log('  - Doctor: http://localhost:3002/telemedicine/session/session-001');
  console.log('');
  console.log('🎥 Sistema de Videollamadas:');
  console.log('  - Servidor: http://localhost:8888');
  console.log('  - API Docs: http://localhost:8888/docs');
  console.log('  - Health Check: http://localhost:8888/health');
}

// Ejecutar pruebas
(async () => {
  const success = await testTelemedicineIntegration();
  
  console.log('\n' + '='.repeat(60));
  if (success) {
    console.log('🎉 ¡INTEGRACIÓN EXITOSA!');
    console.log('✅ El sistema de telemedicina está funcionando correctamente');
    showUsageInstructions();
  } else {
    console.log('❌ INTEGRACIÓN FALLIDA');
    console.log('⚠️  Revise los errores anteriores y asegúrese de que:');
    console.log('   1. El servidor de videollamadas esté ejecutándose (puerto 8888)');
    console.log('   2. Las aplicaciones de pacientes y doctores estén compiladas');
    console.log('   3. Las dependencias estén instaladas correctamente');
  }
  console.log('='.repeat(60));
})();