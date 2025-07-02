/**
 * 🧪 ALTAMEDICA COMPANIES - E2E PATIENT WORKFLOW
 * Tests end-to-end para flujo completo de pacientes
 */

describe('Patient Workflow - Company Integration', () => {
  beforeEach(() => {
    // Mock de datos de empresa
    cy.intercept('GET', '/api/companies/1', {
      statusCode: 200,
      body: {
        data: {
          id: '1',
          name: 'Hospital Universitario',
          type: 'hospital',
          address: {
            street: 'Av. Principal 123',
            city: 'Barcelona',
            state: 'Cataluña',
            zipCode: '08001',
            country: 'España'
          },
          contactInfo: {
            phone: '+34912345678',
            email: 'info@hospital.com',
            website: 'https://hospital.com'
          },
          businessHours: {
            monday: { open: '08:00', close: '20:00', closed: false },
            tuesday: { open: '08:00', close: '20:00', closed: false },
            wednesday: { open: '08:00', close: '20:00', closed: false },
            thursday: { open: '08:00', close: '20:00', closed: false },
            friday: { open: '08:00', close: '20:00', closed: false },
            saturday: { open: '09:00', close: '14:00', closed: false },
            sunday: { open: '00:00', close: '00:00', closed: true }
          },
          specialties: ['cardiology', 'neurology', 'surgery'],
          services: ['emergency', 'surgery', 'lab'],
          configuration: {
            allowOnlineBooking: true,
            allowTelehealth: true,
            acceptsInsurance: true,
            emergencyServices: true,
            requiresAppointment: false,
            languages: ['es', 'en', 'ca']
          },
          rating: 4.5,
          reviewCount: 150,
          isVerified: true,
          isActive: true
        }
      }
    }).as('getCompany')

    // Mock de doctores
    cy.intercept('GET', '/api/companies/1/doctors', {
      statusCode: 200,
      body: {
        data: [
          {
            id: '1',
            doctorId: 'doc1',
            companyId: '1',
            role: 'cardiologist',
            isActive: true,
            workSchedule: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
            permissions: ['read', 'write', 'schedule']
          },
          {
            id: '2',
            doctorId: 'doc2',
            companyId: '1',
            role: 'neurologist',
            isActive: true,
            workSchedule: ['tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
            permissions: ['read', 'write', 'schedule']
          }
        ]
      }
    }).as('getCompanyDoctors')

    // Mock de disponibilidad
    cy.intercept('GET', '/api/companies/1/availability**', {
      statusCode: 200,
      body: {
        data: {
          availableSlots: [
            { date: '2024-01-15', time: '09:00', doctorId: 'doc1', available: true },
            { date: '2024-01-15', time: '10:00', doctorId: 'doc1', available: true },
            { date: '2024-01-15', time: '11:00', doctorId: 'doc2', available: true },
            { date: '2024-01-15', time: '14:00', doctorId: 'doc2', available: true }
          ]
        }
      }
    }).as('getAvailability')
  })

  describe('Company Discovery and Selection', () => {
    it('should allow patient to search and select company', () => {
      cy.visit('/companies')
      
      // Buscar empresas por especialidad
      cy.get('[data-testid="search-input"]').type('cardiología')
      cy.get('[data-testid="specialty-filter"]').select('cardiology')
      cy.get('[data-testid="search-button"]').click()

      // Verificar resultados
      cy.get('[data-testid="company-card"]').should('be.visible')
      cy.get('[data-testid="company-name"]').should('contain', 'Hospital Universitario')
      cy.get('[data-testid="company-rating"]').should('contain', '4.5')
      cy.get('[data-testid="company-specialties"]').should('contain', 'Cardiología')

      // Ver detalles de la empresa
      cy.get('[data-testid="view-company-details"]').click()
      cy.url().should('include', '/companies/1')
    })

    it('should display company information correctly', () => {
      cy.visit('/companies/1')
      cy.wait('@getCompany')

      // Verificar información básica
      cy.get('[data-testid="company-name"]').should('contain', 'Hospital Universitario')
      cy.get('[data-testid="company-address"]').should('contain', 'Av. Principal 123')
      cy.get('[data-testid="company-phone"]').should('contain', '+34912345678')
      cy.get('[data-testid="company-rating"]').should('contain', '4.5')

      // Verificar horarios
      cy.get('[data-testid="business-hours"]').should('be.visible')
      cy.get('[data-testid="hours-monday"]').should('contain', '08:00 - 20:00')
      cy.get('[data-testid="hours-sunday"]').should('contain', 'Cerrado')

      // Verificar servicios
      cy.get('[data-testid="services-list"]').should('contain', 'Emergencias')
      cy.get('[data-testid="services-list"]').should('contain', 'Cirugía')
      cy.get('[data-testid="services-list"]').should('contain', 'Laboratorio')

      // Verificar configuraciones
      cy.get('[data-testid="online-booking-badge"]').should('be.visible')
      cy.get('[data-testid="telehealth-badge"]').should('be.visible')
      cy.get('[data-testid="insurance-badge"]').should('be.visible')
    })

    it('should show nearby companies on map', () => {
      cy.visit('/companies/map')
      
      // Simular ubicación del usuario
      cy.window().then((win) => {
        cy.stub(win.navigator.geolocation, 'getCurrentPosition').callsFake((callback) => {
          callback({
            coords: {
              latitude: 41.3851,
              longitude: 2.1734
            }
          })
        })
      })

      // Verificar que el mapa se carga
      cy.get('[data-testid="companies-map"]').should('be.visible')
      cy.get('[data-testid="map-marker"]').should('have.length.at.least', 1)

      // Hacer clic en un marcador
      cy.get('[data-testid="map-marker"]').first().click()
      cy.get('[data-testid="company-popup"]').should('be.visible')
      cy.get('[data-testid="popup-company-name"]').should('contain', 'Hospital Universitario')
    })
  })

  describe('Doctor Selection and Availability', () => {
    it('should display available doctors for selected company', () => {
      cy.visit('/companies/1/doctors')
      cy.wait('@getCompanyDoctors')

      // Verificar lista de doctores
      cy.get('[data-testid="doctor-card"]').should('have.length', 2)
      cy.get('[data-testid="doctor-role"]').first().should('contain', 'Cardiólogo')
      cy.get('[data-testid="doctor-schedule"]').should('be.visible')

      // Filtrar por especialidad
      cy.get('[data-testid="specialty-filter"]').select('cardiology')
      cy.get('[data-testid="doctor-card"]').should('have.length', 1)
    })

    it('should show doctor availability calendar', () => {
      cy.visit('/companies/1/booking')
      cy.wait('@getAvailability')

      // Seleccionar doctor
      cy.get('[data-testid="doctor-select"]').select('doc1')
      
      // Verificar calendario
      cy.get('[data-testid="availability-calendar"]').should('be.visible')
      cy.get('[data-testid="available-slot"]').should('have.length.at.least', 2)

      // Seleccionar fecha
      cy.get('[data-testid="calendar-date-2024-01-15"]').click()
      cy.get('[data-testid="time-slot-09:00"]').should('be.visible')
      cy.get('[data-testid="time-slot-10:00"]').should('be.visible')
    })
  })

  describe('Appointment Booking Flow', () => {
    it('should complete appointment booking process', () => {
      cy.visit('/companies/1/booking')
      cy.wait('@getAvailability')

      // Mock de reserva de cita
      cy.intercept('POST', '/api/appointments', {
        statusCode: 201,
        body: {
          data: {
            id: 'apt1',
            companyId: '1',
            doctorId: 'doc1',
            patientId: 'patient1',
            date: '2024-01-15',
            time: '09:00',
            status: 'confirmed',
            type: 'consultation'
          }
        }
      }).as('createAppointment')

      // Paso 1: Seleccionar doctor
      cy.get('[data-testid="doctor-select"]').select('doc1')
      cy.get('[data-testid="next-step"]').click()

      // Paso 2: Seleccionar fecha y hora
      cy.get('[data-testid="calendar-date-2024-01-15"]').click()
      cy.get('[data-testid="time-slot-09:00"]').click()
      cy.get('[data-testid="next-step"]').click()

      // Paso 3: Información del paciente
      cy.get('[data-testid="patient-name"]').type('Juan Pérez')
      cy.get('[data-testid="patient-phone"]').type('+34612345678')
      cy.get('[data-testid="patient-email"]').type('juan@email.com')
      cy.get('[data-testid="appointment-reason"]').type('Consulta de cardiología')
      cy.get('[data-testid="next-step"]').click()

      // Paso 4: Confirmación
      cy.get('[data-testid="booking-summary"]').should('be.visible')
      cy.get('[data-testid="summary-doctor"]').should('contain', 'Cardiólogo')
      cy.get('[data-testid="summary-date"]').should('contain', '15/01/2024')
      cy.get('[data-testid="summary-time"]').should('contain', '09:00')

      cy.get('[data-testid="confirm-booking"]').click()
      cy.wait('@createAppointment')

      // Verificar confirmación
      cy.get('[data-testid="booking-success"]').should('be.visible')
      cy.get('[data-testid="appointment-id"]').should('contain', 'apt1')
      cy.get('[data-testid="download-receipt"]').should('be.visible')
    })

    it('should handle booking conflicts gracefully', () => {
      cy.visit('/companies/1/booking')

      // Mock de conflicto de reserva
      cy.intercept('POST', '/api/appointments', {
        statusCode: 409,
        body: {
          error: 'Slot no longer available',
          message: 'Este horario ya no está disponible'
        }
      }).as('conflictAppointment')

      // Completar el proceso de reserva
      cy.get('[data-testid="doctor-select"]').select('doc1')
      cy.get('[data-testid="calendar-date-2024-01-15"]').click()
      cy.get('[data-testid="time-slot-09:00"]').click()
      
      cy.get('[data-testid="patient-name"]').type('Juan Pérez')
      cy.get('[data-testid="patient-phone"]').type('+34612345678')
      cy.get('[data-testid="patient-email"]').type('juan@email.com')
      
      cy.get('[data-testid="confirm-booking"]').click()
      cy.wait('@conflictAppointment')

      // Verificar manejo del error
      cy.get('[data-testid="booking-error"]').should('be.visible')
      cy.get('[data-testid="error-message"]').should('contain', 'ya no está disponible')
      cy.get('[data-testid="select-alternative"]').should('be.visible')
    })
  })

  describe('Patient Dashboard Integration', () => {
    it('should display patient appointments with company info', () => {
      // Mock de citas del paciente
      cy.intercept('GET', '/api/patients/patient1/appointments', {
        statusCode: 200,
        body: {
          data: [
            {
              id: 'apt1',
              companyId: '1',
              companyName: 'Hospital Universitario',
              doctorId: 'doc1',
              doctorName: 'Dr. García',
              specialty: 'Cardiología',
              date: '2024-01-15',
              time: '09:00',
              status: 'confirmed',
              type: 'consultation'
            }
          ]
        }
      }).as('getPatientAppointments')

      cy.visit('/patient/dashboard')
      cy.wait('@getPatientAppointments')

      // Verificar lista de citas
      cy.get('[data-testid="appointment-card"]').should('be.visible')
      cy.get('[data-testid="appointment-company"]').should('contain', 'Hospital Universitario')
      cy.get('[data-testid="appointment-doctor"]').should('contain', 'Dr. García')
      cy.get('[data-testid="appointment-specialty"]').should('contain', 'Cardiología')
      cy.get('[data-testid="appointment-datetime"]').should('contain', '15/01/2024 09:00')

      // Acciones de la cita
      cy.get('[data-testid="view-company-details"]').should('be.visible')
      cy.get('[data-testid="reschedule-appointment"]').should('be.visible')
      cy.get('[data-testid="cancel-appointment"]').should('be.visible')
    })

    it('should allow patient to reschedule appointment', () => {
      // Mock para reprogramación
      cy.intercept('PUT', '/api/appointments/apt1/reschedule', {
        statusCode: 200,
        body: {
          data: {
            id: 'apt1',
            date: '2024-01-16',
            time: '10:00',
            status: 'confirmed'
          }
        }
      }).as('rescheduleAppointment')

      cy.visit('/patient/appointments/apt1/reschedule')
      cy.wait('@getAvailability')

      // Seleccionar nueva fecha y hora
      cy.get('[data-testid="calendar-date-2024-01-16"]').click()
      cy.get('[data-testid="time-slot-10:00"]').click()
      cy.get('[data-testid="reschedule-reason"]').type('Conflicto de horario')
      
      cy.get('[data-testid="confirm-reschedule"]').click()
      cy.wait('@rescheduleAppointment')

      // Verificar confirmación
      cy.get('[data-testid="reschedule-success"]').should('be.visible')
      cy.get('[data-testid="new-datetime"]').should('contain', '16/01/2024 10:00')
    })
  })

  describe('Emergency Services Flow', () => {
    it('should handle emergency appointment booking', () => {
      cy.visit('/emergency')

      // Mock de servicios de emergencia
      cy.intercept('GET', '/api/companies/emergency**', {
        statusCode: 200,
        body: {
          data: [
            {
              id: '1',
              name: 'Hospital Universitario',
              emergencyWaitTime: 15,
              availableBeds: 5,
              distance: 2.5,
              emergencyContact: '+34912345678'
            }
          ]
        }
      }).as('getEmergencyServices')

      // Seleccionar tipo de emergencia
      cy.get('[data-testid="emergency-type"]').select('cardiac')
      cy.get('[data-testid="urgency-level"]').select('high')
      cy.get('[data-testid="find-emergency-care"]').click()

      cy.wait('@getEmergencyServices')

      // Verificar resultados de emergencia
      cy.get('[data-testid="emergency-hospital"]').should('be.visible')
      cy.get('[data-testid="wait-time"]').should('contain', '15 minutos')
      cy.get('[data-testid="available-beds"]').should('contain', '5 camas')
      cy.get('[data-testid="distance"]').should('contain', '2.5 km')

      // Llamar directamente
      cy.get('[data-testid="call-emergency"]').click()
      cy.get('[data-testid="calling-modal"]').should('be.visible')
      cy.get('[data-testid="emergency-number"]').should('contain', '+34912345678')
    })
  })

  describe('Reviews and Feedback', () => {
    it('should allow patient to leave review after appointment', () => {
      // Mock para crear reseña
      cy.intercept('POST', '/api/companies/1/reviews', {
        statusCode: 201,
        body: {
          data: {
            id: 'review1',
            rating: 5,
            comment: 'Excelente atención médica',
            patientId: 'patient1',
            companyId: '1'
          }
        }
      }).as('createReview')

      cy.visit('/patient/appointments/apt1/review')

      // Completar reseña
      cy.get('[data-testid="rating-stars"]').within(() => {
        cy.get('[data-star="5"]').click()
      })
      
      cy.get('[data-testid="review-comment"]').type('Excelente atención médica. El doctor fue muy profesional y el personal muy amable.')
      cy.get('[data-testid="recommend-company"]').check()
      
      cy.get('[data-testid="submit-review"]').click()
      cy.wait('@createReview')

      // Verificar confirmación
      cy.get('[data-testid="review-success"]').should('be.visible')
      cy.get('[data-testid="thank-you-message"]').should('contain', 'Gracias por tu reseña')
    })

    it('should display company reviews to other patients', () => {
      // Mock de reseñas
      cy.intercept('GET', '/api/companies/1/reviews', {
        statusCode: 200,
        body: {
          data: [
            {
              id: 'review1',
              rating: 5,
              comment: 'Excelente atención médica',
              patientName: 'Juan P.',
              createdAt: '2024-01-10T10:00:00Z'
            },
            {
              id: 'review2',
              rating: 4,
              comment: 'Muy buena experiencia en general',
              patientName: 'María G.',
              createdAt: '2024-01-08T15:30:00Z'
            }
          ],
          pagination: { page: 1, limit: 20, total: 2 }
        }
      }).as('getCompanyReviews')

      cy.visit('/companies/1/reviews')
      cy.wait('@getCompanyReviews')

      // Verificar reseñas
      cy.get('[data-testid="review-item"]').should('have.length', 2)
      cy.get('[data-testid="review-rating"]').first().should('contain', '5')
      cy.get('[data-testid="review-comment"]').first().should('contain', 'Excelente atención médica')
      cy.get('[data-testid="reviewer-name"]').first().should('contain', 'Juan P.')
    })
  })

  describe('Mobile Responsiveness', () => {
    it('should work correctly on mobile devices', () => {
      cy.viewport('iphone-x')
      cy.visit('/companies')

      // Verificar que la búsqueda funciona en mobile
      cy.get('[data-testid="mobile-search-toggle"]').click()
      cy.get('[data-testid="search-input"]').type('cardiología')
      cy.get('[data-testid="search-button"]').click()

      // Verificar cards responsivas
      cy.get('[data-testid="company-card"]').should('be.visible')
      cy.get('[data-testid="company-card"]').should('have.css', 'width').and('match', /^(100%|[0-9]+px)$/)

      // Verificar navegación mobile
      cy.get('[data-testid="mobile-menu-toggle"]').click()
      cy.get('[data-testid="mobile-menu"]').should('be.visible')
      cy.get('[data-testid="mobile-menu-companies"]').click()
      cy.url().should('include', '/companies')
    })
  })

  describe('Accessibility Features', () => {
    it('should be accessible with keyboard navigation', () => {
      cy.visit('/companies/1')

      // Navegación con teclado
      cy.get('body').tab()
      cy.focused().should('have.attr', 'data-testid', 'main-navigation')
      
      cy.focused().tab()
      cy.focused().should('have.attr', 'data-testid', 'company-name')

      // Verificar aria-labels
      cy.get('[data-testid="rating-stars"]').should('have.attr', 'aria-label')
      cy.get('[data-testid="book-appointment"]').should('have.attr', 'aria-label')

      // Verificar contraste de colores (esto requeriría una herramienta adicional)
      cy.get('[data-testid="primary-button"]').should('have.css', 'color')
      cy.get('[data-testid="primary-button"]').should('have.css', 'background-color')
    })

    it('should work with screen readers', () => {
      cy.visit('/companies/1')

      // Verificar headings semánticos
      cy.get('h1').should('contain', 'Hospital Universitario')
      cy.get('h2').should('exist')

      // Verificar landmark roles
      cy.get('main').should('have.attr', 'role', 'main')
      cy.get('nav').should('have.attr', 'role', 'navigation')

      // Verificar descripciones alt en imágenes
      cy.get('img').each(($img) => {
        cy.wrap($img).should('have.attr', 'alt')
      })
    })
  })

  describe('Performance and Loading', () => {
    it('should load company data efficiently', () => {
      // Medir tiempo de carga
      const start = performance.now()
      
      cy.visit('/companies/1')
      cy.wait('@getCompany')
      
      cy.then(() => {
        const loadTime = performance.now() - start
        expect(loadTime).to.be.lessThan(3000) // Menos de 3 segundos
      })

      // Verificar lazy loading de imágenes
      cy.get('[data-testid="company-images"]').should('be.visible')
      cy.get('[data-testid="lazy-image"]').should('have.attr', 'loading', 'lazy')
    })

    it('should handle network errors gracefully', () => {
      // Simular error de red
      cy.intercept('GET', '/api/companies/1', {
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('getCompanyError')

      cy.visit('/companies/1')
      cy.wait('@getCompanyError')

      // Verificar manejo del error
      cy.get('[data-testid="error-message"]').should('be.visible')
      cy.get('[data-testid="retry-button"]').should('be.visible')
      cy.get('[data-testid="retry-button"]').click()
    })
  })
})
