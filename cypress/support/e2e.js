// ***********************************************************
// AltaMedica E2E Support File
// Configuración global para pruebas E2E de telemedicina
// ***********************************************************

import './commands';

// Configuración global antes de cada test
beforeEach(() => {
  // Configurar viewport para simulación médica
  cy.viewport(1280, 800);
  
  // Verificar servicios médicos antes de cada test
  cy.task('checkMedicalServices').then((services) => {
    const healthyServices = services.filter(s => s.status === 'healthy');
    cy.log(`✅ Servicios activos: ${healthyServices.length}/${services.length}`);
  });
  
  // Mock Firebase Auth si no usamos Firebase real
  if (!Cypress.env('ENABLE_REAL_FIREBASE')) {
    cy.intercept('POST', '**/api/auth/**', { fixture: 'auth-success.json' }).as('authRequest');
  }
  
  // Mock WebRTC signaling si no usamos WebRTC real
  if (!Cypress.env('ENABLE_REAL_WEBRTC')) {
    cy.intercept('POST', '**/api/webrtc/**', { fixture: 'webrtc-success.json' }).as('webrtcRequest');
  }
  
  // Configurar datos médicos de prueba
  if (Cypress.env('MOCK_MEDICAL_DATA')) {
    cy.intercept('GET', '**/api/patients/**', { fixture: 'medical-data.json' }).as('medicalData');
    cy.intercept('POST', '**/api/telemedicine/**', { fixture: 'telemedicine-session.json' }).as('telemedicineSession');
  }
});

// Configuración global después de cada test  
afterEach(() => {
  // Limpiar localStorage y sessionStorage
  cy.clearLocalStorage();
  cy.clearCookies();
  
  // Limpiar datos de prueba si es necesario
  cy.task('clearTestData');
});

// Manejo global de errores no capturados
Cypress.on('uncaught:exception', (err, runnable) => {
  // Ignorar errores específicos de desarrollo que no afectan la funcionalidad
  const ignoredErrors = [
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',
    'Loading CSS chunk',
    'ChunkLoadError'
  ];
  
  if (ignoredErrors.some(ignoredError => err.message.includes(ignoredError))) {
    return false;
  }
  
  // No fallar en errores de WebRTC en entorno de testing
  if (err.message.includes('WebRTC') || err.message.includes('getUserMedia')) {
    return false;
  }
  
  // Permitir que otros errores fallen el test
  return true;
});

// Configuración de comandos personalizados para debugging
Cypress.Commands.add('logTestStep', (step) => {
  cy.log(`🧪 Test Step: ${step}`);
  console.log(`[E2E Test] ${new Date().toISOString()} - ${step}`);
});

Cypress.Commands.add('waitForApp', () => {
  cy.logTestStep('Esperando que la aplicación cargue completamente');
  cy.get('body').should('be.visible');
  cy.wait(1000); // Buffer para asegurar que React haya renderizado
});

// Configuración de screenshots personalizados
Cypress.Commands.add('takeTestScreenshot', (name) => {
  cy.screenshot(`${Cypress.currentTest.title}-${name}`, {
    capture: 'viewport',
    clip: { x: 0, y: 0, width: 1280, height: 800 }
  });
});