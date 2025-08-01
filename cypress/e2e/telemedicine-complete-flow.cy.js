/**
 * 🏥 AltaMedica E2E Test - Flujo Completo de Telemedicina
 * 
 * Esta suite de pruebas valida el flujo completo de una consulta de telemedicina
 * desde el login del doctor hasta la finalización de la sesión, incluyendo:
 * - Autenticación de doctor y paciente
 * - Creación y unión a sesiones de telemedicina
 * - Establecimiento de conexión WebRTC
 * - Comunicación bidireccional (chat médico)
 * - Registro de signos vitales
 * - Creación y firma de notas médicas
 * - Finalización de sesión
 */

describe('🏥 Flujo Completo de Telemedicina', () => {
  
  beforeEach(() => {
    // Verificar que todos los servicios estén disponibles
    cy.verifyServicesHealth();
    
    // Generar datos de prueba únicos para cada test
    cy.task('generateMedicalTestData').then((testData) => {
      cy.wrap(testData).as('testData');
    });
  });
  
  it('Debe completar un flujo completo de consulta médica exitosamente', function() {
    cy.logTestStep('🚀 Iniciando flujo completo de consulta médica E2E');
    
    // ====================================
    // PASO 1: DOCTOR - LOGIN Y PREPARACIÓN
    // ====================================
    
    cy.logTestStep('👨‍⚕️ PASO 1: Doctor - Login y preparación de sesión');
    
    // Login como doctor
    cy.loginAsDoctor();
    cy.takeTestScreenshot('doctor-dashboard');
    
    // Verificar dashboard del doctor
    cy.get('[data-cy=doctor-dashboard]', { timeout: 10000 })
      .should('be.visible');
      
    cy.get('[data-cy=welcome-message]')
      .should('contain.text', 'Bienvenido, Dr.');
    
    // ====================================
    // PASO 2: CREAR SESIÓN DE TELEMEDICINA
    // ====================================
    
    cy.logTestStep('📺 PASO 2: Creando sesión de telemedicina');
    
    // Crear nueva sesión de telemedicina
    cy.createTelemedicineSession(this.testData.patientId);
    cy.takeTestScreenshot('telemedicine-session-created');
    
    // Verificar que la sesión está activa
    cy.get('[data-cy=session-status]')
      .should('contain.text', 'Sesión Activa');
      
    cy.get('[data-cy=session-id]')
      .should('be.visible')
      .invoke('text')
      .then((sessionId) => {
        cy.wrap(sessionId).as('sessionId');
      });
    
    // ====================================
    // PASO 3: PACIENTE - LOGIN Y UNIÓN
    // ====================================
    
    cy.logTestStep('👤 PASO 3: Paciente - Login y unión a sesión');
    
    // Abrir nueva ventana/tab para el paciente (simulado con visit)
    const patientsUrl = Cypress.env('PATIENTS_URL');
    
    // Login como paciente en nueva "ventana"
    cy.loginAsPatient();
    cy.takeTestScreenshot('patient-dashboard');
    
    // Verificar que hay una sesión activa disponible
    cy.get('[data-cy=active-telemedicine-session]')
      .should('be.visible')
      .should('contain.text', 'Dr. Test Usuario');
    
    // Unirse a la sesión de telemedicina
    cy.joinTelemedicineSession(this.sessionId);
    cy.takeTestScreenshot('patient-joined-session');
    
    // ====================================
    // PASO 4: ESTABLECER CONEXIÓN WEBRTC
    // ====================================
    
    cy.logTestStep('🔗 PASO 4: Estableciendo conexión WebRTC');
    
    // Establecer conexión WebRTC desde el lado del paciente
    cy.establishWebRTCConnection();
    cy.takeTestScreenshot('webrtc-connected-patient');
    
    // Regresar a la ventana del doctor para verificar conexión
    cy.visit(Cypress.env('DOCTORS_URL') + '/telemedicine/' + this.sessionId);
    cy.waitForApp();
    
    // Verificar conexión del lado del doctor
    cy.get('[data-cy=connection-status]')
      .should('contain.text', 'Conectado');
      
    cy.get('[data-cy=remote-video]', { timeout: 15000 })
      .should('be.visible');
      
    cy.takeTestScreenshot('webrtc-connected-doctor');
    
    // ====================================
    // PASO 5: COMUNICACIÓN BIDIRECCIONAL
    // ====================================
    
    cy.logTestStep('💬 PASO 5: Probando comunicación bidireccional');
    
    // Doctor envía mensaje inicial
    cy.sendChatMessage('Hola, ¿cómo se siente hoy?', 'doctor');
    cy.takeTestScreenshot('doctor-sent-message');
    
    // Simular respuesta del paciente (cambiando contexto)
    cy.visit(`${patientsUrl}/telemedicine/` + this.sessionId);
    cy.waitForApp();
    
    // Verificar que el paciente recibió el mensaje
    cy.get('[data-cy=chat-messages]')
      .should('contain.text', '¿cómo se siente hoy?');
    
    // Paciente responde
    cy.sendChatMessage('Me siento mejor, gracias doctor', 'patient');
    cy.takeTestScreenshot('patient-sent-message');
    
    // Regresar al doctor para verificar respuesta
    cy.visit(Cypress.env('DOCTORS_URL') + '/telemedicine/' + this.sessionId);
    cy.waitForApp();
    
    cy.get('[data-cy=chat-messages]')
      .should('contain.text', 'Me siento mejor');
    
    // ====================================
    // PASO 6: REGISTRO DE SIGNOS VITALES
    // ====================================
    
    cy.logTestStep('📊 PASO 6: Registrando signos vitales');
    
    // Doctor registra signos vitales del paciente
    cy.recordVitalSigns({
      bloodPressure: { systolic: 125, diastolic: 82 },
      heartRate: 78,
      temperature: 36.7,
      oxygenSaturation: 97
    });
    
    cy.takeTestScreenshot('vital-signs-recorded');
    
    // Verificar que los signos vitales se muestran correctamente
    cy.get('[data-cy=vital-signs-display]')
      .should('be.visible')
      .within(() => {
        cy.get('[data-cy=blood-pressure-value]')
          .should('contain.text', '125/82');
        cy.get('[data-cy=heart-rate-value]')
          .should('contain.text', '78');
      });
    
    // ====================================
    // PASO 7: CREACIÓN DE NOTAS MÉDICAS
    // ====================================
    
    cy.logTestStep('📝 PASO 7: Creando notas médicas');
    
    // Crear nota médica de la consulta
    const consultationNote = `
      CONSULTA DE TELEMEDICINA - ${new Date().toLocaleDateString()}
      
      MOTIVO DE CONSULTA:
      Seguimiento de tratamiento, paciente refiere mejoría.
      
      EXAMEN FÍSICO:
      - Signos vitales estables
      - Presión arterial: 125/82 mmHg
      - Frecuencia cardíaca: 78 bpm
      - Temperatura: 36.7°C
      - Saturación de oxígeno: 97%
      
      EVALUACIÓN:
      Paciente en evolución favorable. Continuar tratamiento actual.
      
      PLAN:
      - Continuar medicación actual
      - Control en 2 semanas
      - Consulta presencial si empeora sintomatología
    `;
    
    cy.createMedicalNote('consultation', consultationNote);
    cy.takeTestScreenshot('medical-note-created');
    
    // Firmar la nota médica digitalmente
    cy.signMedicalNote();
    cy.takeTestScreenshot('medical-note-signed');
    
    // Verificar que la nota está firmada y guardada
    cy.get('[data-cy=medical-notes-list]')
      .should('contain.text', 'CONSULTA DE TELEMEDICINA')
      .within(() => {
        cy.get('[data-cy=note-signed-indicator]')
          .should('be.visible');
        cy.get('[data-cy=note-timestamp]')
          .should('be.visible');
      });
    
    // ====================================
    // PASO 8: VERIFICAR DESDE PACIENTE
    // ====================================
    
    cy.logTestStep('👁️ PASO 8: Verificando visibilidad desde paciente');
    
    // Cambiar a vista del paciente
    cy.visit(`${patientsUrl}/telemedicine/` + this.sessionId);
    cy.waitForApp();
    
    // Verificar que el paciente puede ver los signos vitales
    cy.get('[data-cy=patient-vital-signs-view]')
      .should('be.visible')
      .within(() => {
        cy.get('[data-cy=blood-pressure-display]')
          .should('contain.text', '125/82');
      });
    
    // Verificar que el paciente puede ver el resumen de la consulta
    cy.get('[data-cy=consultation-summary]')
      .should('be.visible')
      .should('contain.text', 'evolución favorable');
    
    cy.takeTestScreenshot('patient-view-consultation-summary');
    
    // ====================================
    // PASO 9: FINALIZACIÓN DE SESIÓN
    // ====================================
    
    cy.logTestStep('🏁 PASO 9: Finalizando sesión de telemedicina');
    
    // Regresar al doctor para finalizar sesión
    cy.visit(Cypress.env('DOCTORS_URL') + '/telemedicine/' + this.sessionId);
    cy.waitForApp();
    
    // Finalizar sesión
    cy.endTelemedicineSession();
    cy.takeTestScreenshot('session-ended');
    
    // Verificar que la sesión terminó correctamente
    cy.get('[data-cy=session-summary]')
      .should('be.visible')
      .within(() => {
        cy.get('[data-cy=session-duration]').should('be.visible');
        cy.get('[data-cy=notes-count]').should('contain.text', '1');
        cy.get('[data-cy=messages-count]').should('be.visible');
      });
    
    // ====================================
    // PASO 10: VERIFICACIONES FINALES
    // ====================================
    
    cy.logTestStep('✅ PASO 10: Verificaciones finales del flujo');
    
    // Verificar que se regresó al dashboard
    cy.url().should('include', '/dashboard');
    
    // Verificar que la sesión aparece en el historial
    cy.get('[data-cy=recent-sessions]')
      .should('be.visible')
      .within(() => {
        cy.get('[data-cy=session-item]')
          .first()
          .should('contain.text', 'Paciente E2E Test')
          .should('contain.text', 'Completada');
      });
    
    // Verificar métricas actualizadas
    cy.get('[data-cy=today-consultations-count]')
      .should('be.visible')
      .invoke('text')
      .then((count) => {
        expect(parseInt(count)).to.be.greaterThan(0);
      });
    
    cy.takeTestScreenshot('final-dashboard-verification');
    
    // ====================================
    // LIMPIEZA Y LOGOUT
    // ====================================
    
    cy.logTestStep('🧹 Limpieza final y logout');
    
    // Logout del doctor
    cy.logoutUser();
    
    // Verificar logout exitoso
    cy.url().should('include', '/login');
    cy.get('[data-cy=login-form]').should('be.visible');
    
    cy.logTestStep('🎉 Flujo completo de telemedicina E2E completado exitosamente');
  });
  
  it('Debe manejar errores de conexión WebRTC graciosamente', function() {
    cy.logTestStep('🔧 Probando manejo de errores WebRTC');
    
    // Login como doctor
    cy.loginAsDoctor();
    
    // Crear sesión de telemedicina
    cy.createTelemedicineSession(this.testData.patientId);
    
    // Simular error de WebRTC interceptando la llamada
    cy.intercept('POST', '**/api/webrtc/**', {
      statusCode: 500,
      body: { error: 'WebRTC Connection Failed' }
    }).as('webrtcError');
    
    // Intentar establecer conexión WebRTC
    cy.get('[data-cy=enable-camera-button]').click();
    
    // Verificar que se muestra mensaje de error apropiado
    cy.get('[data-cy=webrtc-error-message]')
      .should('be.visible')
      .should('contain.text', 'Error de conexión');
    
    // Verificar que la sesión puede continuar sin video
    cy.get('[data-cy=continue-without-video]').click();
    
    // Verificar que el chat sigue funcionando
    cy.sendChatMessage('Continuamos sin video por problemas técnicos');
    
    cy.logTestStep('✅ Manejo de errores WebRTC verificado');
  });
  
  it('Debe sincronizar datos entre doctor y paciente en tiempo real', function() {
    cy.logTestStep('🔄 Probando sincronización en tiempo real');
    
    // Setup inicial
    cy.loginAsDoctor();
    cy.createTelemedicineSession(this.testData.patientId);
    
    // Simular cambios del doctor
    cy.sendChatMessage('Mensaje desde doctor');
    cy.recordVitalSigns({ heartRate: 85 });
    
    // Verificar que los cambios se sincronizan al lado del paciente
    const patientsUrl = Cypress.env('PATIENTS_URL');
    cy.visit(`${patientsUrl}/telemedicine/` + this.sessionId);
    cy.waitForApp();
    
    // Verificar sincronización de chat
    cy.get('[data-cy=chat-messages]', { timeout: 5000 })
      .should('contain.text', 'Mensaje desde doctor');
    
    // Verificar sincronización de signos vitales
    cy.get('[data-cy=patient-vital-signs-view]')
      .should('contain.text', '85');
    
    cy.logTestStep('✅ Sincronización en tiempo real verificada');
  });
  
  after(() => {
    // Limpieza final después de todas las pruebas
    cy.task('clearTestData');
    cy.logTestStep('🧹 Limpieza final de datos de prueba completada');
  });
  
});