/**
 * 🧪 ALTAMEDICA WEB-APP - CYPRESS COMPLETE PATIENT WORKFLOW
 * Comprehensive end-to-end test covering the complete patient journey
 */
describe('Complete Patient Workflow', () => {
  const patient = {
    email: 'test.patient@example.com',
    password: 'TestPassword123!',
    firstName: 'John',
    lastName: 'Doe'
  }

  beforeEach(() => {
    // Mock API responses for consistent testing
    cy.intercept('POST', '/api/v1/auth/login', {
      statusCode: 200,
      body: {
        token: 'mock-jwt-token',
        user: {
          id: '1',
          email: patient.email,
          role: 'patient',
          firstName: patient.firstName,
          lastName: patient.lastName
        }
      }
    }).as('login')

    cy.intercept('GET', '/api/v1/auth/me', {
      statusCode: 200,
      body: {
        id: '1',
        email: patient.email,
        role: 'patient',
        firstName: patient.firstName,
        lastName: patient.lastName
      }
    }).as('getMe')

    cy.intercept('GET', '/api/v1/appointments*', {
      statusCode: 200,
      body: []
    }).as('getAppointments')

    cy.intercept('GET', '/api/v1/doctors*', {
      statusCode: 200,
      body: [
        {
          id: '1',
          firstName: 'Dr. Jane',
          lastName: 'Smith',
          specialization: 'Cardiology',
          rating: 4.8,
          consultationFee: 150
        },
        {
          id: '2',
          firstName: 'Dr. John',
          lastName: 'Johnson',
          specialization: 'Neurology',
          rating: 4.9,
          consultationFee: 200
        }
      ]
    }).as('getDoctors')

    cy.intercept('POST', '/api/v1/appointments', {
      statusCode: 201,
      body: {
        id: '1',
        patientId: '1',
        doctorId: '1',
        dateTime: '2024-01-15T10:00:00Z',
        type: 'consultation',
        status: 'scheduled'
      }
    }).as('createAppointment')
  })

  it('should complete full patient workflow - login, browse doctors, book appointment', () => {
    // Step 1: Visit homepage
    cy.visit('/')
    cy.contains('ALTAMEDICA').should('be.visible')

    // Step 2: Navigate to login
    cy.contains('Login').click()
    cy.url().should('include', '/login')

    // Step 3: Login as patient
    cy.get('[data-testid="email-input"]')
      .or('[name="email"]')
      .or('input[type="email"]')
      .type(patient.email)
    
    cy.get('[data-testid="password-input"]')
      .or('[name="password"]')
      .or('input[type="password"]')
      .type(patient.password)
    
    cy.get('[data-testid="login-button"]')
      .or('button[type="submit"]')
      .or('button:contains("Login")')
      .click()

    cy.wait('@login')

    // Step 4: Verify successful login and dashboard access
    cy.url().should('match', /\/(dashboard|patients)/)
    cy.contains(patient.firstName).should('be.visible')

    // Step 5: Navigate to find doctors
    cy.get('[data-testid="find-doctors"]')
      .or('a:contains("Find Doctors")')
      .or('a:contains("Doctors")')
      .click()

    cy.wait('@getDoctors')

    // Step 6: Browse available doctors
    cy.contains('Dr. Jane Smith').should('be.visible')
    cy.contains('Cardiology').should('be.visible')
    cy.contains('4.8').should('be.visible') // Rating

    // Step 7: Select a doctor and book appointment
    cy.get('[data-testid="book-appointment-1"]')
      .or('button:contains("Book Appointment")')
      .first()
      .click()

    // Step 8: Fill appointment form
    cy.get('[data-testid="appointment-date"]')
      .or('[name="appointmentDate"]')
      .or('input[type="date"]')
      .type('2024-01-15')

    cy.get('[data-testid="appointment-time"]')
      .or('[name="appointmentTime"]')
      .or('input[type="time"]')
      .type('10:00')

    cy.get('[data-testid="appointment-type"]')
      .or('[name="appointmentType"]')
      .or('select')
      .select('consultation')

    cy.get('[data-testid="book-appointment-submit"]')
      .or('button[type="submit"]')
      .or('button:contains("Book")')
      .click()

    cy.wait('@createAppointment')

    // Step 9: Verify appointment confirmation
    cy.contains('Appointment booked successfully').should('be.visible')
    
    // Step 10: Navigate to appointments and verify it's listed
    cy.get('[data-testid="my-appointments"]')
      .or('a:contains("My Appointments")')
      .or('a:contains("Appointments")')
      .click()

    cy.wait('@getAppointments')
    
    // Step 11: Verify appointment appears in list
    cy.contains('Dr. Jane Smith').should('be.visible')
    cy.contains('2024-01-15').should('be.visible')
    cy.contains('10:00').should('be.visible')
    cy.contains('Scheduled').should('be.visible')
  })

  it('should handle appointment cancellation', () => {
    // Mock existing appointment
    cy.intercept('GET', '/api/v1/appointments*', {
      statusCode: 200,
      body: [
        {
          id: '1',
          patientId: '1',
          doctorId: '1',
          dateTime: '2024-01-15T10:00:00Z',
          type: 'consultation',
          status: 'scheduled',
          doctor: {
            firstName: 'Dr. Jane',
            lastName: 'Smith',
            specialization: 'Cardiology'
          }
        }
      ]
    }).as('getExistingAppointments')

    cy.intercept('POST', '/api/v1/appointments/1/cancel', {
      statusCode: 200,
      body: { success: true }
    }).as('cancelAppointment')

    // Login first
    cy.visit('/login')
    cy.get('input[type="email"]').type(patient.email)
    cy.get('input[type="password"]').type(patient.password)
    cy.get('button[type="submit"]').click()
    cy.wait('@login')

    // Navigate to appointments
    cy.visit('/appointments')
    cy.wait('@getExistingAppointments')

    // Cancel appointment
    cy.get('[data-testid="cancel-appointment-1"]')
      .or('button:contains("Cancel")')
      .click()

    // Confirm cancellation
    cy.get('[data-testid="confirm-cancel"]')
      .or('button:contains("Yes")')
      .or('button:contains("Confirm")')
      .click()

    cy.wait('@cancelAppointment')

    // Verify cancellation message
    cy.contains('Appointment cancelled').should('be.visible')
  })

  it('should handle prescription viewing', () => {
    // Mock prescriptions
    cy.intercept('GET', '/api/v1/prescriptions*', {
      statusCode: 200,
      body: [
        {
          id: '1',
          patientId: '1',
          doctorId: '1',
          medications: [
            {
              name: 'Aspirin',
              dosage: '100mg',
              frequency: 'Once daily',
              duration: '30 days'
            }
          ],
          issuedDate: '2024-01-10',
          status: 'active'
        }
      ]
    }).as('getPrescriptions')

    // Login first
    cy.visit('/login')
    cy.get('input[type="email"]').type(patient.email)
    cy.get('input[type="password"]').type(patient.password)
    cy.get('button[type="submit"]').click()
    cy.wait('@login')

    // Navigate to prescriptions
    cy.get('[data-testid="prescriptions"]')
      .or('a:contains("Prescriptions")')
      .click()

    cy.wait('@getPrescriptions')

    // Verify prescription details
    cy.contains('Aspirin').should('be.visible')
    cy.contains('100mg').should('be.visible')
    cy.contains('Once daily').should('be.visible')
    cy.contains('Active').should('be.visible')
  })
})
