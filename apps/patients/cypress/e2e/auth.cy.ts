/// <reference types="cypress" />

describe('Patient App Authentication', () => {
  const patientUrl = Cypress.env('PATIENTS_URL') || 'http://localhost:3002';

  beforeEach(() => {
    // Visitar la página de inicio de sesión de la app de pacientes
    cy.visit(patientUrl);
    cy.url().should('include', 'localhost:3002');
  });

  it('should allow a patient to log in with correct credentials', () => {
    // Obtener credenciales de las variables de entorno de Cypress
    const patientEmail = Cypress.env('PATIENT_EMAIL');
    const patientPassword = Cypress.env('PATIENT_PASSWORD');

    // Asegurarse de que las credenciales existen
    expect(patientEmail, 'patient email was set').to.be.a('string');
    expect(patientPassword, 'patient password was set').to.be.a('string');

    // Rellenar el formulario de login
    // Usamos selectores de datos para mayor robustez
    cy.get('[data-cy="email-input"]').should('be.visible').type(patientEmail);
    cy.get('[data-cy="password-input"]').should('be.visible').type(patientPassword);

    // Enviar el formulario
    cy.get('[data-cy="login-button"]').should('be.visible').click();

    // Verificar la redirección al dashboard
    cy.url().should('include', '/dashboard');

    // Verificar que el contenido del dashboard es visible
    cy.get('[data-cy="welcome-header"]').should('be.visible').and('contain.text', 'Bienvenido');
    cy.get('[data-cy="patient-dashboard"]').should('be.visible');
  });

  it('should show an error message with incorrect credentials', () => {
    // Rellenar el formulario con credenciales incorrectas
    cy.get('[data-cy="email-input"]').type('wrong@email.com');
    cy.get('[data-cy="password-input"]').type('WrongPassword123');

    // Enviar el formulario
    cy.get('[data-cy="login-button"]').click();

    // Verificar que aparece un mensaje de error
    cy.get('[data-cy="error-message"]').should('be.visible').and('contain.text', 'Credenciales incorrectas');

    // Verificar que la URL no ha cambiado
    cy.url().should('not.include', '/dashboard');
  });
});
