/**
 * Prueba rápida del sistema de telemedicina integrado
 * Este script verifica que todas las piezas estén funcionando
 */

console.log('🏥 AltaMedica - Prueba Rápida de Telemedicina');
console.log('='.repeat(50));

async function testServices() {
    const tests = [
        {
            name: 'Video Server Health',
            url: 'http://localhost:8888/health',
            test: (response) => response.status === 'healthy'
        },
        {
            name: 'API Server Health', 
            url: 'http://localhost:3001/api/health',
            test: (response) => response.success === true
        },
        {
            name: 'Doctors App',
            url: 'http://localhost:3002/',
            test: (html) => html.includes('ALTAMEDICA Doctors')
        },
        {
            name: 'Patients App',
            url: 'http://localhost:3003/',
            test: (html) => html.includes('Altamedica - Portal de Pacientes')
        }
    ];

    console.log('📋 Ejecutando pruebas...\n');

    let passed = 0;
    let total = tests.length;

    for (const test of tests) {
        try {
            const response = await fetch(test.url, { 
                timeout: 5000,
                headers: { 'User-Agent': 'AltaMedica-Test/1.0' }
            });
            
            let data;
            if (test.url.includes('/health')) {
                data = await response.json();
            } else {
                data = await response.text();
            }

            if (test.test(data)) {
                console.log(`✅ ${test.name}: FUNCIONANDO`);
                passed++;
            } else {
                console.log(`❌ ${test.name}: FALLO EN VALIDACIÓN`);
            }
        } catch (error) {
            console.log(`❌ ${test.name}: ERROR - ${error.message}`);
        }
    }

    console.log('\n' + '='.repeat(50));
    console.log(`📊 Resultado: ${passed}/${total} servicios funcionando`);

    if (passed === total) {
        console.log('🎉 ¡SISTEMA COMPLETAMENTE OPERATIVO!');
        console.log('');
        console.log('🚀 URLs Para Probar Ahora:');
        console.log('========================');
        console.log('👨‍⚕️ Doctores:');
        console.log('  - Dashboard: http://localhost:3002/telemedicine');
        console.log('  - Sesión Demo: http://localhost:3002/telemedicine/session/session-001');
        console.log('');
        console.log('👨‍🦱 Pacientes:');
        console.log('  - Dashboard: http://localhost:3003/telemedicine');
        console.log('  - Sala Demo: http://localhost:3003/telemedicine/room/session-001');
        console.log('');
        console.log('🎥 Servidor Video:');
        console.log('  - API: http://localhost:8888');
        console.log('  - Health: http://localhost:8888/health');
        console.log('');
        console.log('💡 INSTRUCCIONES:');
        console.log('1. Abre las URLs de doctores y pacientes en pestañas separadas');
        console.log('2. Las videollamadas se crearán automáticamente');
        console.log('3. Permite acceso a cámara y micrófono cuando se solicite');
        console.log('4. ¡Disfruta de las videollamadas médicas en tiempo real!');
    } else {
        console.log('⚠️  Algunos servicios tienen problemas');
        console.log('Revisa los logs anteriores para más detalles');
    }

    return passed === total;
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
                consultation_id: 'test_' + Date.now()
            })
        });

        if (response.ok) {
            const result = await response.json();
            console.log('✅ Videollamada creada exitosamente!');
            console.log(`🆔 Room ID: ${result.room_id}`);
            console.log(`👨‍⚕️ URL Doctor: ${result.doctor_url}`);
            console.log(`👨‍🦱 URL Paciente: ${result.patient_url}`);
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

// Ejecutar todas las pruebas
(async () => {
    const success = await testServices();
    
    if (success) {
        await testVideoCallCreation();
    }
    
    console.log('\n✨ Pruebas completadas');
    process.exit(success ? 0 : 1);
})();