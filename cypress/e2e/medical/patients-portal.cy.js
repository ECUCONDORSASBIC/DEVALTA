/**
 * 🏥 AltaMedica - Cypress E2E Tests
 * Portal de Pacientes - Flujo Completo
 */

describe('Portal de Pacientes - AltaMedica', () => {
  const PATIENTS_URL = 'http://localhost:3003'
  
  beforeEach(() => {
    // Verificar que el servicio esté disponible
    cy.request(`${PATIENTS_URL}/api/health`).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body.status).to.eq('healthy')
    })
  })

  describe('Página Principal', () => {
    it('debe cargar la landing page correctamente', () => {
      cy.visit(PATIENTS_URL)
      
      // Verificar elementos principales
      cy.contains('AltaMedica').should('be.visible')
      cy.contains('Portal de Pacientes').should('be.visible')
      cy.contains('Sistema Activo').should('be.visible')
      
      // Verificar enlaces principales
      cy.contains('Ir al Dashboard').should('be.visible')
      cy.contains('Ver Citas').should('be.visible')
      
      // Verificar compliance HIPAA
      cy.request(PATIENTS_URL).then((response) => {
        expect(response.headers).to.have.property('x-hipaa-compliant', 'true')
      })
    })

    it('debe mostrar todas las funcionalidades médicas', () => {
      cy.visit(PATIENTS_URL)
      
      // Verificar funcionalidades listadas
      cy.contains('Mis Citas').should('be.visible')
      cy.contains('Historial Médico').should('be.visible')
      cy.contains('Medicamentos').should('be.visible')
      cy.contains('Telemedicina').should('be.visible')
    })
  })

  describe('Dashboard de Paciente', () => {
    it('debe cargar el dashboard con datos del paciente', () => {
      cy.visit(`${PATIENTS_URL}/dashboard`)
      
      // Verificar respuesta de API
      cy.request(`${PATIENTS_URL}/dashboard`).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).to.have.property('patient')
        expect(response.body.patient.name).to.eq('María González')
        expect(response.body.patient.id).to.eq('patient_001')
      })
    })

    it('debe mostrar quick actions del paciente', () => {
      cy.request(`${PATIENTS_URL}/dashboard`).then((response) => {
        expect(response.body.quickActions).to.be.an('array')
        expect(response.body.quickActions).to.have.length.greaterThan(0)
        
        const actionNames = response.body.quickActions.map(action => action.name)
        expect(actionNames).to.include('Nueva Cita')
        expect(actionNames).to.include('Telemedicina')
      })
    })
  })

  describe('Gestión de Citas', () => {
    it('debe mostrar lista de citas del paciente', () => {
      cy.request(`${PATIENTS_URL}/appointments`).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).to.have.property('appointments')
        expect(response.body.appointments).to.be.an('array')
        
        // Verificar estructura de citas
        if (response.body.appointments.length > 0) {
          const firstAppointment = response.body.appointments[0]
          expect(firstAppointment).to.have.property('doctorName')
          expect(firstAppointment).to.have.property('date')
          expect(firstAppointment).to.have.property('status')
        }
      })
    })

    it('debe incluir citas con Dr. Martínez', () => {
      cy.request(`${PATIENTS_URL}/appointments`).then((response) => {
        const appointments = response.body.appointments
        const drMartinezAppointment = appointments.find(apt => 
          apt.doctorName.includes('Dr. Martínez')
        )
        expect(drMartinezAppointment).to.exist
        expect(drMartinezAppointment.type).to.be.oneOf([
          'consultation', 'follow_up', 'emergency', 'telemedicine'
        ])
      })
    })
  })

  describe('Telemedicina', () => {
    it('debe mostrar sesiones de telemedicina', () => {
      cy.request(`${PATIENTS_URL}/telemedicine`).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).to.have.property('sessions')
        expect(response.body.sessions).to.be.an('array')
        
        // Verificar estructura de sesiones
        if (response.body.sessions.length > 0) {
          const firstSession = response.body.sessions[0]
          expect(firstSession).to.have.property('doctorName')
          expect(firstSession).to.have.property('scheduledTime')
          expect(firstSession).to.have.property('roomUrl')
          expect(firstSession.roomUrl).to.include('localhost:3003')
        }
      })
    })

    it('debe tener sesiones programadas con médicos', () => {
      cy.request(`${PATIENTS_URL}/telemedicine`).then((response) => {
        const sessions = response.body.sessions
        if (sessions.length > 0) {
          sessions.forEach(session => {
            expect(session.status).to.eq('scheduled')
            expect(session.type).to.eq('video_consultation')
            expect(session.doctorName).to.be.a('string')
          })
        }
      })
    })
  })

  describe('Health Check y Compliance', () => {
    it('debe responder health check correctamente', () => {
      cy.request(`${PATIENTS_URL}/api/health`).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body.status).to.eq('healthy')
        expect(response.body.service).to.eq('patients-app')
        expect(response.body.port).to.eq(3003)
      })
    })

    it('debe incluir headers de seguridad HIPAA', () => {
      cy.request(`${PATIENTS_URL}/api/health`).then((response) => {
        expect(response.headers).to.have.property('x-powered-by', 'AltaMedica Patients App')
        expect(response.headers).to.have.property('x-medical-app', 'AltaMedica-Patients')
        expect(response.headers).to.have.property('x-hipaa-compliant', 'true')
      })
    })
  })

  describe('Manejo de Errores', () => {
    it('debe manejar rutas no encontradas correctamente', () => {
      cy.request({
        url: `${PATIENTS_URL}/ruta-inexistente`,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(404)
        expect(response.body.error).to.include('Página no encontrada')
        expect(response.body.service).to.eq('patients-app')
        expect(response.body.availableRoutes).to.be.an('array')
      })
    })
  })

  describe('Integración con API Central', () => {
    it('debe poder conectarse al API Server', () => {
      cy.request('http://localhost:3001/api/health').then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body.status).to.eq('healthy')
      })
    })

    it('debe validar datos consistentes entre servicios', () => {
      // Comparar datos de pacientes entre API central y portal
      cy.request('http://localhost:3001/api/v1/patients').then((apiResponse) => {
        cy.request(`${PATIENTS_URL}/dashboard`).then((dashboardResponse) => {
          const apiPatients = apiResponse.body.patients
          const dashboardPatient = dashboardResponse.body.patient
          
          const apiPatient = apiPatients.find(p => p.id === dashboardPatient.id)
          expect(apiPatient).to.exist
          expect(apiPatient.name).to.eq(dashboardPatient.name)
        })
      })
    })
  })
})

// Tests de Performance
describe('Performance del Portal de Pacientes', () => {
  it('debe cargar en menos de 2 segundos', () => {
    const start = Date.now()
    
    cy.visit(PATIENTS_URL)
    cy.get('body').should('be.visible').then(() => {
      const loadTime = Date.now() - start
      expect(loadTime).to.be.lessThan(2000)
    })
  })

  it('debe responder APIs en menos de 500ms', () => {
    const start = Date.now()
    
    cy.request(`${PATIENTS_URL}/api/health`).then(() => {
      const responseTime = Date.now() - start
      expect(responseTime).to.be.lessThan(500)
    })
  })
})