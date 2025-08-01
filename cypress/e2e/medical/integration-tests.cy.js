/**
 * 🏥 AltaMedica - Cypress E2E Tests
 * Tests de Integración Completa del Ecosistema
 */

describe('Integración Completa AltaMedica', () => {
  const services = {
    api: 'http://localhost:3001',
    patients: 'http://localhost:3003', 
    doctors: 'http://localhost:3002',
    companies: 'http://localhost:3004'
  }

  before(() => {
    // Verificar que todos los servicios estén disponibles
    Object.entries(services).forEach(([name, url]) => {
      cy.request(`${url}/api/health`).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body.status).to.eq('healthy')
      })
    })
  })

  describe('Flujo End-to-End: Cita Médica Completa', () => {
    it('debe completar flujo completo de cita médica', () => {
      // 1. Paciente revisa sus citas
      cy.request(`${services.patients}/appointments`).then((patientResponse) => {
        expect(patientResponse.status).to.eq(200)
        const patientAppointments = patientResponse.body.appointments
        expect(patientAppointments).to.be.an('array')
        
        if (patientAppointments.length > 0) {
          const appointment = patientAppointments[0]
          
          // 2. Doctor revisa mismo paciente
          cy.request(`${services.doctors}/patients`).then((doctorResponse) => {
            const doctorPatients = doctorResponse.body.patients
            const matchingPatient = doctorPatients.find(p => 
              appointment.doctorName && appointment.doctorName.includes('Martínez')
            )
            
            if (matchingPatient) {
              expect(matchingPatient.name).to.be.a('string')
              expect(matchingPatient.nextAppointment).to.exist
            }
          })
          
          // 3. Verificar datos en API central
          cy.request(`${services.api}/api/v1/appointments`).then((apiResponse) => {
            expect(apiResponse.status).to.eq(200)
            const apiAppointments = apiResponse.body.appointments
            expect(apiAppointments).to.be.an('array')
          })
        }
      })
    })
  })

  describe('Flujo Telemedicina Cross-Portal', () => {
    it('debe sincronizar sesiones de telemedicina entre portales', () => {
      // Obtener sesiones desde portal de pacientes
      cy.request(`${services.patients}/telemedicine`).then((patientResponse) => {
        const patientSessions = patientResponse.body.sessions
        
        // Obtener sesiones desde portal de doctores
        cy.request(`${services.doctors}/telemedicine`).then((doctorResponse) => {
          const doctorSessions = doctorResponse.body.sessions
          
          // Verificar coherencia de datos
          if (patientSessions.length > 0 && doctorSessions.length > 0) {
            // Buscar sesión común por doctor
            const patientSession = patientSessions.find(ps => 
              ps.doctorName && ps.doctorName.includes('Dr. Martínez')
            )
            
            const doctorSession = doctorSessions.find(ds => 
              ds.patientName && ds.patientName.includes('María González')
            )
            
            if (patientSession && doctorSession) {
              expect(patientSession.status).to.eq(doctorSession.status)
              expect(patientSession.type).to.eq(doctorSession.type)
              expect(patientSession.scheduledTime).to.eq(doctorSession.scheduledTime)
            }
          }
        })
      })
    })
  })

  describe('Marketplace Integration', () => {
    it('debe sincronizar datos de marketplace entre empresas y doctores', () => {
      // Obtener ofertas desde portal empresarial
      cy.request(`${services.companies}/jobs`).then((companyResponse) => {
        const companyJobs = companyResponse.body.jobs
        
        // Obtener oportunidades desde portal de doctores
        cy.request(`${services.doctors}/marketplace`).then((doctorResponse) => {
          const doctorOpportunities = doctorResponse.body.opportunities
          
          // Verificar que haya ofertas disponibles en ambos
          expect(companyJobs.length).to.be.greaterThan(0)
          expect(doctorOpportunities.length).to.be.greaterThan(0)
          
          // Buscar ofertas similares
          const cardioJobCompany = companyJobs.find(job => 
            job.title.toLowerCase().includes('cardio')
          )
          
          const cardioJobDoctor = doctorOpportunities.find(opp => 
            opp.title.toLowerCase().includes('cardio')
          )
          
          if (cardioJobCompany && cardioJobDoctor) {
            expect(cardioJobCompany.location).to.be.a('string')
            expect(cardioJobDoctor.location).to.be.a('string')
          }
        })
      })
    })

    it('debe mostrar empresas médicas consistentes', () => {
      cy.request(`${services.companies}/marketplace`).then((response) => {
        const companies = response.body.companies
        expect(companies).to.be.an('array')
        expect(response.body.totalCompanies).to.eq(45)
        expect(response.body.activeJobs).to.eq(18)
        
        companies.forEach(company => {
          expect(company.rating).to.be.a('number')
          expect(company.rating).to.be.within(1, 5)
          expect(company.activeJobs).to.be.a('number')
        })
      })
    })
  })

  describe('HIPAA Compliance Cross-Service', () => {
    it('debe verificar compliance HIPAA en todos los servicios', () => {
      Object.entries(services).forEach(([serviceName, serviceUrl]) => {
        cy.request(`${serviceUrl}/api/health`).then((response) => {
          // Verificar headers de seguridad médica
          if (serviceName !== 'companies') { // Companies no maneja PHI
            expect(response.headers).to.have.property('x-hipaa-compliant', 'true')
          }
          expect(response.headers).to.have.property('x-medical-app')
        })
      })
    })

    it('debe proteger datos médicos sensibles', () => {
      // Verificar que no se expongan datos sensibles sin headers apropiados
      cy.request(`${services.api}/api/v1/patients`).then((response) => {
        const patients = response.body.patients
        
        patients.forEach(patient => {
          // Verificar que no se expongan datos extremadamente sensibles
          expect(patient).to.not.have.property('ssn')
          expect(patient).to.not.have.property('password')
          expect(patient).to.not.have.property('creditCard')
          
          // Verificar que tengan campos necesarios pero no sensibles
          expect(patient).to.have.property('id')
          expect(patient).to.have.property('name')
          expect(patient).to.have.property('status')
        })
      })
    })
  })

  describe('Performance Cross-Service', () => {
    it('debe mantener tiempo de respuesta bajo en todos los servicios', () => {
      const maxResponseTime = 1000 // 1 segundo
      
      Object.entries(services).forEach(([serviceName, serviceUrl]) => {
        const startTime = Date.now()
        
        cy.request(`${serviceUrl}/api/health`).then((response) => {
          const responseTime = Date.now() - startTime
          expect(responseTime).to.be.lessThan(maxResponseTime)
          expect(response.status).to.eq(200)
        })
      })
    })

    it('debe manejar carga concurrente', () => {
      // Simular múltiples requests simultáneos
      const requests = []
      
      for (let i = 0; i < 5; i++) {
        Object.values(services).forEach(serviceUrl => {
          requests.push(cy.request(`${serviceUrl}/api/health`))
        })
      }
      
      // Todos los requests deben completarse exitosamente
      Cypress.Promise.all(requests).then((responses) => {
        responses.forEach(response => {
          expect(response.status).to.eq(200)
        })
      })
    })
  })

  describe('Data Consistency Validation', () => {
    it('debe mantener datos de pacientes consistentes entre servicios', () => {
      // Obtener paciente desde API central
      cy.request(`${services.api}/api/v1/patients`).then((apiResponse) => {
        const apiPatients = apiResponse.body.patients
        const mariaGonzalez = apiPatients.find(p => p.name === 'María González')
        
        if (mariaGonzalez) {
          // Verificar en dashboard de pacientes
          cy.request(`${services.patients}/dashboard`).then((patientResponse) => {
            const dashboardPatient = patientResponse.body.patient
            expect(dashboardPatient.name).to.eq(mariaGonzalez.name)
            expect(dashboardPatient.id).to.eq(mariaGonzalez.id)
          })
          
          // Verificar en lista de doctores
          cy.request(`${services.doctors}/patients`).then((doctorResponse) => {
            const doctorPatients = doctorResponse.body.patients
            const doctorMaria = doctorPatients.find(p => p.name === 'María González')
            
            if (doctorMaria) {
              expect(doctorMaria.name).to.eq(mariaGonzalez.name)
            }
          })
        }
      })
    })

    it('debe validar estructura de datos médicos', () => {
      const requiredPatientFields = ['id', 'name', 'status']
      const requiredAppointmentFields = ['id', 'doctorName', 'date', 'status']
      
      // Validar estructura de pacientes
      cy.request(`${services.api}/api/v1/patients`).then((response) => {
        const patients = response.body.patients
        
        patients.forEach(patient => {
          requiredPatientFields.forEach(field => {
            expect(patient).to.have.property(field)
          })
        })
      })
      
      // Validar estructura de citas
      cy.request(`${services.api}/api/v1/appointments`).then((response) => {
        const appointments = response.body.appointments
        
        appointments.forEach(appointment => {
          requiredAppointmentFields.forEach(field => {
            expect(appointment).to.have.property(field)
          })
        })
      })
    })
  })

  describe('Error Handling Cross-Service', () => {
    it('debe manejar rutas no encontradas consistentemente', () => {
      Object.entries(services).forEach(([serviceName, serviceUrl]) => {
        cy.request({
          url: `${serviceUrl}/ruta-inexistente`,
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.eq(404)
          expect(response.body).to.have.property('error')
          expect(response.body).to.have.property('availableRoutes')
        })
      })
    })
  })
})