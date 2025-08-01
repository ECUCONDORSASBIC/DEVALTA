// ***********************************************
// AltaMedica Custom Cypress Commands
// Comandos específicos para testing de telemedicina
// ***********************************************

// ============================================
// COMANDOS DE AUTENTICACIÓN
// ============================================

/**
 * Login como doctor en la aplicación
 */
Cypress.Commands.add('loginAsDoctor', (email = null, password = null) => {
  const doctorEmail = email || Cypress.env('DOCTOR_EMAIL');
  const doctorPassword = password || Cypress.env('DOCTOR_PASSWORD');
  
  cy.logTestStep(`Iniciando sesión como doctor: ${doctorEmail}`);
  
  cy.visit('/login');
  cy.waitForApp();
  
  // Llenar formulario de login
  cy.get('[data-cy=email-input]', { timeout: 10000 })
    .should('be.visible')
    .type(doctorEmail);
    
  cy.get('[data-cy=password-input]')
    .should('be.visible')
    .type(doctorPassword);
    
  cy.get('[data-cy=login-button]')
    .should('be.visible')
    .click();
  
  // Verificar que el login fue exitoso
  cy.url({ timeout: 15000 }).should('include', '/dashboard');
  cy.get('[data-cy=user-menu]', { timeout: 10000 }).should('be.visible');
  
  cy.logTestStep('Login como doctor completado exitosamente');
});

/**
 * Login como paciente en la aplicación
 */
Cypress.Commands.add('loginAsPatient', (email = null, password = null) => {
  const patientEmail = email || Cypress.env('PATIENT_EMAIL');
  const patientPassword = password || Cypress.env('PATIENT_PASSWORD');
  
  cy.logTestStep(`Iniciando sesión como paciente: ${patientEmail}`);
  
  // Cambiar a la URL de pacientes
  const patientsUrl = Cypress.env('PATIENTS_URL');
  cy.visit(`${patientsUrl}/login`);
  cy.waitForApp();
  
  // Llenar formulario de login
  cy.get('[data-cy=email-input]', { timeout: 10000 })
    .should('be.visible')
    .type(patientEmail);
    
  cy.get('[data-cy=password-input]')
    .should('be.visible')
    .type(patientPassword);
    
  cy.get('[data-cy=login-button]')
    .should('be.visible')
    .click();
  
  // Verificar que el login fue exitoso
  cy.url({ timeout: 15000 }).should('include', '/dashboard');
  cy.get('[data-cy=patient-dashboard]', { timeout: 10000 }).should('be.visible');
  
  cy.logTestStep('Login como paciente completado exitosamente');
});

// ============================================
// COMANDOS DE TELEMEDICINA
// ============================================

/**
 * Crear una sesión de telemedicina como doctor
 */
Cypress.Commands.add('createTelemedicineSession', (patientId = null) => {
  const testPatientId = patientId || 'patient_e2e_test';
  
  cy.logTestStep('Creando sesión de telemedicina');
  
  // Ir al dashboard de doctores
  cy.visit('/dashboard');
  cy.waitForApp();
  
  // Buscar botón para crear nueva sesión
  cy.get('[data-cy=new-telemedicine-session]', { timeout: 10000 })
    .should('be.visible')
    .click();
    
  // Seleccionar paciente
  cy.get('[data-cy=patient-selector]')
    .should('be.visible')
    .select(testPatientId);
    
  // Configurar tipo de sesión
  cy.get('[data-cy=session-type-video]')
    .should('be.visible')
    .check();
    
  // Crear sesión
  cy.get('[data-cy=create-session-button]')
    .should('be.visible')
    .click();
    
  // Verificar que la sesión fue creada
  cy.get('[data-cy=telemedicine-session-active]', { timeout: 15000 })
    .should('be.visible');
    
  cy.logTestStep('Sesión de telemedicina creada exitosamente');
});

/**
 * Unirse a una sesión de telemedicina como paciente
 */
Cypress.Commands.add('joinTelemedicineSession', (sessionId = null) => {
  cy.logTestStep('Uniéndose a sesión de telemedicina como paciente');
  
  const patientsUrl = Cypress.env('PATIENTS_URL');
  
  // Ir al dashboard de pacientes
  cy.visit(`${patientsUrl}/dashboard`);
  cy.waitForApp();
  
  // Buscar sesión activa y unirse
  cy.get('[data-cy=active-telemedicine-session]', { timeout: 10000 })
    .should('be.visible')
    .within(() => {
      cy.get('[data-cy=join-session-button]')
        .should('be.visible')
        .click();
    });
    
  // Verificar que se unió a la sesión
  cy.url({ timeout: 15000 }).should('include', '/telemedicine/');
  cy.get('[data-cy=telemedicine-session-patient]', { timeout: 10000 })
    .should('be.visible');
    
  cy.logTestStep('Paciente se unió a la sesión exitosamente');
});

/**
 * Establecer conexión WebRTC (simulada en testing)
 */
Cypress.Commands.add('establishWebRTCConnection', () => {
  cy.logTestStep('Estableciendo conexión WebRTC');
  
  // Verificar que los controles de video estén disponibles
  cy.get('[data-cy=video-controls]', { timeout: 20000 })
    .should('be.visible');
    
  // Simular habilitación de cámara y micrófono
  cy.get('[data-cy=enable-camera-button]')
    .should('be.visible')
    .click();
    
  cy.get('[data-cy=enable-microphone-button]')
    .should('be.visible')
    .click();
    
  // Verificar estado de conexión
  cy.get('[data-cy=connection-status]', { timeout: Cypress.env('WEBRTC_CONNECTION_TIMEOUT') })
    .should('contain.text', 'Conectado');
    
  cy.logTestStep('Conexión WebRTC establecida exitosamente');
});

// ============================================
// COMANDOS DE COMUNICACIÓN
// ============================================

/**
 * Enviar mensaje de chat en la sesión de telemedicina
 */
Cypress.Commands.add('sendChatMessage', (message, userType = 'doctor') => {
  cy.logTestStep(`Enviando mensaje de chat como ${userType}: "${message}"`);
  
  // Abrir panel de chat si no está visible
  cy.get('body').then($body => {
    if ($body.find('[data-cy=chat-panel]').length === 0) {
      cy.get('[data-cy=chat-tab]').click();
    }
  });
  
  // Escribir y enviar mensaje
  cy.get('[data-cy=chat-input]', { timeout: 10000 })
    .should('be.visible')
    .type(message);
    
  cy.get('[data-cy=send-message-button]')
    .should('be.visible')
    .click();
    
  // Verificar que el mensaje aparece en el chat
  cy.get('[data-cy=chat-messages]')
    .should('contain.text', message);
    
  cy.logTestStep('Mensaje de chat enviado exitosamente');
});

/**
 * Registrar signos vitales en la sesión
 */
Cypress.Commands.add('recordVitalSigns', (vitalSigns = {}) => {
  const defaultVitals = {
    bloodPressure: { systolic: 120, diastolic: 80 },
    heartRate: 75,
    temperature: 36.5,
    oxygenSaturation: 98,
    ...vitalSigns
  };
  
  cy.logTestStep('Registrando signos vitales');
  
  // Abrir panel de signos vitales
  cy.get('[data-cy=vital-signs-tab]')
    .should('be.visible')
    .click();
    
  // Llenar signos vitales
  cy.get('[data-cy=blood-pressure-systolic]')
    .clear()
    .type(defaultVitals.bloodPressure.systolic.toString());
    
  cy.get('[data-cy=blood-pressure-diastolic]')
    .clear()
    .type(defaultVitals.bloodPressure.diastolic.toString());
    
  cy.get('[data-cy=heart-rate]')
    .clear()
    .type(defaultVitals.heartRate.toString());
    
  cy.get('[data-cy=temperature]')
    .clear()
    .type(defaultVitals.temperature.toString());
    
  cy.get('[data-cy=oxygen-saturation]')
    .clear()
    .type(defaultVitals.oxygenSaturation.toString());
    
  // Guardar signos vitales
  cy.get('[data-cy=save-vital-signs]')
    .should('be.visible')
    .click();
    
  // Verificar que se guardaron
  cy.get('[data-cy=vital-signs-saved]', { timeout: 5000 })
    .should('be.visible');
    
  cy.logTestStep('Signos vitales registrados exitosamente');
});

// ============================================
// COMANDOS DE NOTAS MÉDICAS
// ============================================

/**
 * Crear nota médica usando template
 */
Cypress.Commands.add('createMedicalNote', (noteType = 'consultation', content = null) => {
  const defaultContent = content || `Nota médica de prueba E2E - ${noteType} - ${new Date().toISOString()}`;
  
  cy.logTestStep(`Creando nota médica: ${noteType}`);
  
  // Abrir panel de notas médicas
  cy.get('[data-cy=notes-tab]')
    .should('be.visible')
    .click();
    
  // Crear nueva nota
  cy.get('[data-cy=new-note-button]')
    .should('be.visible')
    .click();
    
  // Seleccionar template
  cy.get('[data-cy=note-template-selector]')
    .should('be.visible')
    .select(noteType);
    
  // Escribir contenido
  cy.get('[data-cy=note-content-editor]')
    .should('be.visible')
    .type(defaultContent);
    
  // Guardar nota
  cy.get('[data-cy=save-note-button]')
    .should('be.visible')
    .click();
    
  // Verificar que la nota se guardó
  cy.get('[data-cy=note-saved-confirmation]', { timeout: 5000 })
    .should('be.visible');
    
  cy.logTestStep('Nota médica creada exitosamente');
});

/**
 * Firmar nota médica digitalmente
 */
Cypress.Commands.add('signMedicalNote', (noteId = null) => {
  cy.logTestStep('Firmando nota médica digitalmente');
  
  // Buscar la última nota si no se especifica ID
  if (!noteId) {
    cy.get('[data-cy=medical-notes-list] [data-cy=medical-note-item]')
      .last()
      .within(() => {
        cy.get('[data-cy=sign-note-button]')
          .should('be.visible')
          .click();
      });
  } else {
    cy.get(`[data-cy=medical-note-${noteId}] [data-cy=sign-note-button]`)
      .should('be.visible')
      .click();
  }
  
  // Confirmar firma digital
  cy.get('[data-cy=digital-signature-modal]')
    .should('be.visible')
    .within(() => {
      cy.get('[data-cy=confirm-signature-button]')
        .should('be.visible')
        .click();
    });
    
  // Verificar que la nota está firmada
  cy.get('[data-cy=note-signed-indicator]', { timeout: 5000 })
    .should('be.visible');
    
  cy.logTestStep('Nota médica firmada exitosamente');
});

// ============================================
// COMANDOS DE VERIFICACIÓN
// ============================================

/**
 * Verificar que todos los servicios médicos estén disponibles
 */
Cypress.Commands.add('verifyServicesHealth', () => {
  cy.logTestStep('Verificando salud de todos los servicios médicos');
  
  cy.task('checkMedicalServices').then((services) => {
    services.forEach(service => {
      if (service.status !== 'healthy') {
        cy.log(`⚠️ Servicio ${service.name} no está saludable: ${service.status}`);
      } else {
        cy.log(`✅ Servicio ${service.name} está saludable`);
      }
    });
    
    const healthyCount = services.filter(s => s.status === 'healthy').length;
    expect(healthyCount).to.be.greaterThan(0);
  });
});

/**
 * Verificar compliance HIPAA en todos los servicios
 */
Cypress.Commands.add('verifyHIPAACompliance', () => {
  cy.logTestStep('Verificando compliance HIPAA');
  
  cy.task('validateHIPAACompliance').then((results) => {
    results.forEach(result => {
      if (result.hipaaCompliant) {
        cy.log(`✅ HIPAA compliant: ${result.url}`);
      } else {
        cy.log(`❌ HIPAA non-compliant: ${result.url}`);
      }
      expect(result.hipaaCompliant).to.be.true;
    });
  });
});

/**
 * Verificar flujo completo de consulta médica
 */
Cypress.Commands.add('verifyCompleteConsultationFlow', () => {
  cy.logTestStep('Verificando flujo completo de consulta médica');
  
  // Verificar elementos clave del flujo
  const requiredElements = [
    '[data-cy=telemedicine-session-active]',
    '[data-cy=video-controls]', 
    '[data-cy=chat-panel]',
    '[data-cy=vital-signs-panel]',
    '[data-cy=medical-notes-panel]'
  ];
  
  requiredElements.forEach(element => {
    cy.get(element, { timeout: 10000 })
      .should('be.visible');
  });
  
  cy.logTestStep('Flujo completo de consulta verificado exitosamente');
});

// ============================================
// COMANDOS DE LIMPIEZA
// ============================================

/**
 * Finalizar sesión de telemedicina
 */
Cypress.Commands.add('endTelemedicineSession', () => {
  cy.logTestStep('Finalizando sesión de telemedicina');
  
  // Buscar botón de finalizar sesión
  cy.get('[data-cy=end-session-button]')
    .should('be.visible')
    .click();
    
  // Confirmar finalización
  cy.get('[data-cy=confirm-end-session]')
    .should('be.visible')
    .click();
    
  // Verificar que la sesión terminó
  cy.get('[data-cy=session-ended-confirmation]', { timeout: 10000 })
    .should('be.visible');
    
  cy.logTestStep('Sesión de telemedicina finalizada exitosamente');
});

/**
 * Logout del usuario actual
 */
Cypress.Commands.add('logoutUser', () => {
  cy.logTestStep('Cerrando sesión del usuario');
  
  // Abrir menú de usuario
  cy.get('[data-cy=user-menu]')
    .should('be.visible')
    .click();
    
  // Click en logout
  cy.get('[data-cy=logout-button]')
    .should('be.visible')
    .click();
    
  // Verificar que regresó a la página de login
  cy.url({ timeout: 10000 }).should('include', '/login');
  
  cy.logTestStep('Logout completado exitosamente');
});