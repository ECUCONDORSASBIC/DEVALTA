/**
 * Script para probar la integración completa del sistema de telemedicina
 */

const fetch = require('node-fetch');

console.log('🏥 AltaMedica - Prueba de Integración de Telemedicina');
console.log('='.repeat(60));

async function testIntegration() {
    const services = [
        { name: 'API Server', url: 'http://localhost:3001/api/health', port: 3001 },
        { name: 'Doctors App', url: 'http://localhost:3002/', port: 3002 },
        { name: 'Patients App', url: 'http://localhost:3003/', port: 3003 },
        { name: 'Video Server', url: 'http://localhost:8888/health', port: 8888 }
    ];

    console.log('\n📋 Verificando servicios...\n');

    const results = [];

    for (const service of services) {
        try {
            console.log(`🔍 Verificando ${service.name} (puerto ${service.port})...`);
            const response = await fetch(service.url, { timeout: 5000 });
            
            if (response.ok) {
                console.log(`✅ ${service.name}: OPERATIVO`);
                results.push({ ...service, status: 'OK', response: response.status });
            } else {
                console.log(`⚠️  ${service.name}: RESPUESTA NO OK (${response.status})`);
                results.push({ ...service, status: 'WARNING', response: response.status });
            }
        } catch (error) {
            console.log(`❌ ${service.name}: ERROR - ${error.message}`);
            results.push({ ...service, status: 'ERROR', error: error.message });
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN DE INTEGRACIÓN');
    console.log('='.repeat(60));

    const operatives = results.filter(r => r.status === 'OK').length;
    const warnings = results.filter(r => r.status === 'WARNING').length;
    const errors = results.filter(r => r.status === 'ERROR').length;

    console.log(`✅ Servicios operativos: ${operatives}/${services.length}`);
    console.log(`⚠️  Servicios con advertencias: ${warnings}`);
    console.log(`❌ Servicios con errores: ${errors}`);

    if (operatives >= 3) {
        console.log('\n🎉 ¡INTEGRACIÓN EXITOSA!');
        console.log('✨ El sistema de telemedicina está listo para usar');
        
        console.log('\n📋 URLs para Testing:');
        console.log('==================');
        console.log('🏥 Para Pacientes:');
        console.log('  - Portal: http://localhost:3003');
        console.log('  - Telemedicina: http://localhost:3003/telemedicine');
        console.log('  - Sala de prueba: http://localhost:3003/telemedicine/room/session-001');
        console.log('');
        console.log('👨‍⚕️ Para Doctores:');
        console.log('  - Portal: http://localhost:3002');
        console.log('  - Telemedicina: http://localhost:3002/telemedicine');
        console.log('  - Sesión de prueba: http://localhost:3002/telemedicine/session/session-001');
        console.log('');
        console.log('🎥 Sistema de Videollamadas:');
        console.log('  - Servidor: http://localhost:8888');
        console.log('  - Health Check: http://localhost:8888/health');
        console.log('');
        console.log('🌐 API Principal:');
        console.log('  - Servidor: http://localhost:3001');
        console.log('  - Health Check: http://localhost:3001/api/health');

        console.log('\n🚀 Instrucciones de Uso:');
        console.log('========================');
        console.log('1. Abra dos navegadores o pestañas');
        console.log('2. En uno, vaya a la URL de Pacientes');
        console.log('3. En otro, vaya a la URL de Doctores');
        console.log('4. Navegue a las secciones de telemedicina');
        console.log('5. ¡Pruebe las videollamadas médicas integradas!');
        console.log('');
        console.log('⚠️  Nota: Asegúrese de permitir acceso a cámara y micrófono');

    } else {
        console.log('\n❌ INTEGRACIÓN INCOMPLETA');
        console.log('⚠️  Algunos servicios no están funcionando correctamente');
        console.log('');
        console.log('🔧 Servicios con problemas:');
        results.filter(r => r.status !== 'OK').forEach(service => {
            console.log(`  - ${service.name}: ${service.status} ${service.error ? '(' + service.error + ')' : ''}`);
        });
    }

    console.log('\n' + '='.repeat(60));
    
    return operatives >= 3;
}

// Test de creación de videollamada
async function testVideoCallCreation() {
    console.log('\n🎥 Probando creación de videollamada...');
    
    try {
        const response = await fetch('http://localhost:8888/api/video-calls/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                doctor_email: 'dr.garcia@altamedica.com',
                patient_email: 'maria.gonzalez@email.com',
                consultation_id: 'test_integration_' + Date.now()
            })
        });

        if (response.ok) {
            const result = await response.json();
            console.log('✅ Videollamada creada exitosamente!');
            console.log(`🆔 Room ID: ${result.room_id}`);
            console.log(`👨‍⚕️ URL Doctor: ${result.doctor_url}`);
            console.log(`👨‍🦲 URL Paciente: ${result.patient_url}`);
            return true;
        } else {
            console.log('❌ Error creando videollamada:', response.status);
            return false;
        }
    } catch (error) {
        console.log('❌ Error en test de videollamada:', error.message);
        return false;
    }
}

// Ejecutar pruebas
(async () => {
    const integrationSuccess = await testIntegration();
    
    if (integrationSuccess) {
        await testVideoCallCreation();
    }
    
    console.log('\n✨ Prueba de integración completada');
})();