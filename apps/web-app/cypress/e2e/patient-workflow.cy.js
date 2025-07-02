/**
 * 🧪 ALTAMEDICA WEB-APP - CYPRESS PATIENT WORKFLOW TEST
 * End-to-end test simulating a patient login and appointment booking
 */
describe('Patient Workflow', () => {
  beforeEach(() => {
    // Reset database or mock server state
    // E.g., cy.task('resetDatabase')

    cy.visit('/login')
  })

  it('should login as a patient and book an appointment', () => {
    // Login
    cy.get('[name="email"]').type('patient@example.com')
    cy.get('[name="password"]').type('password')
    cy.get('button[type="submit"]').click()

    // Verify login
    cy.url().should('include', '/dashboard')    
    cy.contains('Welcome, Patient!').should('be.visible')

    // Navigate to Appointments Page
    cy.contains('Appointments').click()
    cy.url().should('include', '/appointments')

    // Book an Appointment
    cy.contains('Book Appointment').click()
    cy.get('[name="doctorId"]').select('Doctor Example')
    cy.get('[name="dateTime"]').type('2024-01-01T10:00')
    cy.get('button[type="submit"]').click()

    // Verify appointment creation
    cy.contains('Appointments').click()
    cy.contains('Doctor Example - 2024-01-01T10:00').should('be.visible')
  })
})

