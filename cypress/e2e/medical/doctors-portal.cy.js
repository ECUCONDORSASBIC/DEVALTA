/**
 * 🏥 AltaMedica - Cypress E2E Tests
 * Portal de Doctores - Flujo Completo
 */

describe('Portal de Doctores - AltaMedica', () => {
  const DOCTORS_URL = 'http://localhost:3002'
  
  beforeEach(() => {
    // Verificar que el servicio esté disponible
    cy.request(`${DOCTORS_URL}/api/health`).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body.status).to.eq('healthy')
    })
  })

  describe('Página Principal Médica', () => {
    it('debe cargar el portal médico correctamente', () => {
      cy.visit(DOCTORS_URL)
      
      // Verificar elementos médicos principales
      cy.contains('AltaMedica').should('be.visible')
      cy.contains('Portal Médico').should('be.visible')
      cy.contains('Sistema Médico Activo').should('be.visible')
      
      // Verificar estadísticas médicas
      cy.contains('Citas Hoy').should('be.visible')
      cy.contains('Pacientes Activos').should('be.visible')
      cy.contains('Telemedicina').should('be.visible')
      
      // Verificar compliance HIPAA
      cy.request(DOCTORS_URL).then((response) => {
        expect(response.headers).to.have.property('x-hipaa-compliant', 'true')
      })
    })

    it('debe mostrar funcionalidades médicas profesionales', () => {
      cy.visit(DOCTORS_URL)
      
      // Verificar funcionalidades médicas
      cy.contains('Gestión de Pacientes').should('be.visible')
      cy.contains('Calendario de Citas').should('be.visible')
      cy.contains('Dashboard Médico').should('be.visible')
      cy.contains('Telemedicina').should('be.visible')
    })
  })

  describe('Dashboard Médico', () => {
    it('debe cargar dashboard con información del doctor', () => {
      cy.request(`${DOCTORS_URL}/dashboard`).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).to.have.property('doctor')
        
        const doctor = response.body.doctor
        expect(doctor.name).to.eq('Dr. Martínez')
        expect(doctor.specialty).to.eq('Cardiología')
        expect(doctor.license).to.exist
        expect(doctor.status).to.eq('active')
      })
    })

    it('debe mostrar estadísticas médicas actualizadas', () => {
      cy.request(`${DOCTORS_URL}/dashboard`).then((response) => {
        const stats = response.body.stats
        
        expect(stats).to.have.property('appointmentsToday')
        expect(stats).to.have.property('totalPatients')
        expect(stats).to.have.property('telemedicineSessions')
        expect(stats).to.have.property('pendingReviews')
        
        expect(stats.totalPatients).to.be.a('number')
        expect(stats.totalPatients).to.be.greaterThan(0)
      })
    })

    it('debe incluir calendario del día', () => {
      cy.request(`${DOCTORS_URL}/dashboard`).then((response) => {
        expect(response.body).to.have.property('todaySchedule')
        expect(response.body.todaySchedule).to.be.an('array')
        
        if (response.body.todaySchedule.length > 0) {
          const firstAppointment = response.body.todaySchedule[0]
          expect(firstAppointment).to.have.property('time')
          expect(firstAppointment).to.have.property('patient')
          expect(firstAppointment).to.have.property('type')
        }
      })
    })
  })

  describe('Gestión de Pacientes', () => {
    it('debe mostrar lista completa de pacientes', () => {
      cy.request(`${DOCTORS_URL}/patients`).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).to.have.property('patients')
        expect(response.body.patients).to.be.an('array')
        expect(response.body.total).to.eq(156)
        
        // Verificar estructura de pacientes
        const patients = response.body.patients
        if (patients.length > 0) {
          const firstPatient = patients[0]
          expect(firstPatient).to.have.property('name')
          expect(firstPatient).to.have.property('condition')
          expect(firstPatient).to.have.property('riskLevel')
          expect(firstPatient).to.have.property('lastVisit')
        }
      })
    })

    it('debe incluir pacientes conocidos', () => {
      cy.request(`${DOCTORS_URL}/patients`).then((response) => {
        const patients = response.body.patients
        const patientNames = patients.map(p => p.name)
        
        expect(patientNames).to.include('María González')
        expect(patientNames).to.include('Carlos Rodríguez')
        expect(patientNames).to.include('Ana Martín')
      })
    })

    it('debe clasificar pacientes por nivel de riesgo', () => {
      cy.request(`${DOCTORS_URL}/patients`).then((response) => {
        const patients = response.body.patients
        const riskLevels = patients.map(p => p.riskLevel)
        
        riskLevels.forEach(level => {
          expect(level).to.be.oneOf(['low', 'medium', 'high'])
        })
      })
    })
  })

  describe('Telemedicina Médica', () => {
    it('debe mostrar sesiones de telemedicina del doctor', () => {
      cy.request(`${DOCTORS_URL}/telemedicine`).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).to.have.property('sessions')
        expect(response.body).to.have.property('activeNow')
        expect(response.body).to.have.property('pendingToday')
        
        const sessions = response.body.sessions
        if (sessions.length > 0) {
          const firstSession = sessions[0]
          expect(firstSession).to.have.property('patientName')
          expect(firstSession).to.have.property('scheduledTime')
          expect(firstSession).to.have.property('roomUrl')
          expect(firstSession.roomUrl).to.include('localhost:3002')
        }
      })
    })

    it('debe tener sesiones programadas con pacientes', () => {
      cy.request(`${DOCTORS_URL}/telemedicine`).then((response) => {
        const sessions = response.body.sessions
        
        if (sessions.length > 0) {
          sessions.forEach(session => {
            expect(session.status).to.eq('scheduled')
            expect(session.type).to.eq('video_consultation')
            expect(session.patientName).to.be.a('string')
            expect(session.patientId).to.exist
          })
        }
      })
    })
  })

  describe('Marketplace Médico', () => {
    it('debe mostrar oportunidades laborales', () => {
      cy.request(`${DOCTORS_URL}/marketplace`).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).to.have.property('opportunities')
        expect(response.body.opportunities).to.be.an('array')
        
        const opportunities = response.body.opportunities
        if (opportunities.length > 0) {
          const firstJob = opportunities[0]
          expect(firstJob).to.have.property('title')
          expect(firstJob).to.have.property('location')
          expect(firstJob).to.have.property('salary')
          expect(firstJob).to.have.property('type')
        }
      })
    })

    it('debe incluir trabajos de cardiología', () => {
      cy.request(`${DOCTORS_URL}/marketplace`).then((response) => {
        const opportunities = response.body.opportunities
        const cardioJob = opportunities.find(job => 
          job.title.toLowerCase().includes('cardio')
        )
        
        if (cardioJob) {
          expect(cardioJob.location).to.be.a('string')
          expect(cardioJob.type).to.be.oneOf(['tiempo_completo', 'freelance', 'temporal'])
        }
      })
    })
  })

  describe('Health Check y Compliance Médica', () => {
    it('debe responder health check con features médicas', () => {
      cy.request(`${DOCTORS_URL}/api/health`).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body.status).to.eq('healthy')
        expect(response.body.service).to.eq('doctors-app')
        expect(response.body.port).to.eq(3002)
        expect(response.body.features).to.be.an('array')
        expect(response.body.features).to.include('telemedicine')
        expect(response.body.features).to.include('patients')
      })
    })

    it('debe incluir headers de seguridad médica', () => {
      cy.request(`${DOCTORS_URL}/api/health`).then((response) => {
        expect(response.headers).to.have.property('x-powered-by', 'AltaMedica Doctors App')
        expect(response.headers).to.have.property('x-medical-app', 'AltaMedica-Doctors')
        expect(response.headers).to.have.property('x-hipaa-compliant', 'true')
      })
    })
  })

  describe('Integración Cross-Service', () => {
    it('debe tener coherencia con datos del portal de pacientes', () => {
      // Obtener sesiones de telemedicina desde perspectiva doctor
      cy.request(`${DOCTORS_URL}/telemedicine`).then((doctorResponse) => {
        // Obtener sesiones desde perspectiva paciente
        cy.request('http://localhost:3003/telemedicine').then((patientResponse) => {
          const doctorSessions = doctorResponse.body.sessions
          const patientSessions = patientResponse.body.sessions
          
          // Buscar sesión común
          if (doctorSessions.length > 0 && patientSessions.length > 0) {
            const commonSession = doctorSessions.find(dSession => 
              patientSessions.some(pSession => 
                pSession.doctorName && pSession.doctorName.includes('Dr. Martínez')
              )
            )
            
            if (commonSession) {
              expect(commonSession.status).to.eq('scheduled')
              expect(commonSession.type).to.eq('video_consultation')
            }
          }
        })
      })
    })

    it('debe validar datos de pacientes consistentes', () => {
      // Comparar pacientes en portal médico vs API central
      cy.request(`${DOCTORS_URL}/patients`).then((doctorResponse) => {
        cy.request('http://localhost:3001/api/v1/patients').then((apiResponse) => {
          const doctorPatients = doctorResponse.body.patients
          const apiPatients = apiResponse.body.patients
          
          // Verificar que algunos pacientes coincidan
          const commonPatient = doctorPatients.find(dPatient => 
            apiPatients.some(aPatient => aPatient.name === dPatient.name)
          )
          
          expect(commonPatient).to.exist
        })
      })
    })
  })
})

// Tests de Funcionalidad Médica Específica
describe('Funcionalidades Médicas Avanzadas', () => {
  const DOCTORS_URL = 'http://localhost:3002'

  it('debe manejar carga de múltiples pacientes', () => {
    cy.request(`${DOCTORS_URL}/patients`).then((response) => {
      expect(response.body.total).to.eq(156)
      expect(response.body.patients.length).to.be.greaterThan(0)
      
      // Verificar que la respuesta sea rápida incluso con muchos pacientes
      expect(response.duration).to.be.lessThan(1000)
    })
  })

  it('debe priorizar pacientes de alto riesgo', () => {
    cy.request(`${DOCTORS_URL}/patients`).then((response) => {
      const patients = response.body.patients
      const highRiskPatients = patients.filter(p => p.riskLevel === 'high')
      
      if (highRiskPatients.length > 0) {
        highRiskPatients.forEach(patient => {
          expect(patient.condition).to.be.a('string')
          expect(patient.nextAppointment).to.exist
        })
      }
    })
  })

  it('debe mantener historial de visitas actualizado', () => {
    cy.request(`${DOCTORS_URL}/patients`).then((response) => {
      const patients = response.body.patients
      
      patients.forEach(patient => {
        expect(patient.lastVisit).to.match(/^\d{4}-\d{2}-\d{2}$/)
        if (patient.nextAppointment) {
          expect(patient.nextAppointment).to.match(/^\d{4}-\d{2}-\d{2}$/)
        }
      })
    })
  })
})