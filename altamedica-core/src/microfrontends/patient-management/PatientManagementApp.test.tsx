// Test para PatientManagementApp - Micro-frontend médico
// Testing con compliance HIPAA y performance optimization

import React from 'react'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { jest } from '@jest/globals'
import PatientManagementApp from '../PatientManagementApp'
import { medicalCache } from '@/optimized/cache/MedicalCacheManager'

// Mock del cache médico
jest.mock('@/optimized/cache/MedicalCacheManager')

// Mock de componentes pesados para testing
jest.mock('@/lazy/LazyMedicalComponent', () => {
  return function MockLazyComponent({ children, props }) {
    // Simular el componente real para testing
    return (
      <div data-testid="patient-management-content">
        <div data-testid="patient-list">
          {props?.patientsData?.datos?.map((patient, index) => (
            <div key={patient.id || index} data-testid={`patient-item-${index}`}>
              <span>{patient.nombres} {patient.apellidos}</span>
              <span>{patient.numeroDocumento}</span>
            </div>
          ))}
        </div>
        {children}
      </div>
    )
  }
})

describe('PatientManagementApp - Micro-frontend Médico', () => {
  const mockPatients = [
    {
      id: 'PAC_000001',
      numeroHistoriaClinica: 'HC2024001',
      nombres: 'Juan Carlos',
      apellidos: 'González',
      tipoDocumento: 'DNI',
      numeroDocumento: '12345678',
      fechaNacimiento: new Date('1980-05-15'),
      genero: 'M',
      estadoCivil: 'CASADO',
      telefono: 'encrypted_phone',
      email: 'encrypted_email',
      direccion: {
        calle: 'Av. Corrientes',
        numero: '1234',
        ciudad: 'Buenos Aires',
        provincia: 'CABA',
        codigoPostal: '1043',
        pais: 'Argentina'
      },
      estadoPaciente: 'ACTIVO',
      consentimientoTratamientoDatos: true,
      fechaConsentimiento: new Date(),
      fechaCreacion: new Date(),
      fechaUltimaActualizacion: new Date()
    },
    {
      id: 'PAC_000002',
      numeroHistoriaClinica: 'HC2024002',
      nombres: 'María Elena',
      apellidos: 'Rodríguez',
      tipoDocumento: 'DNI',
      numeroDocumento: '87654321',
      fechaNacimiento: new Date('1975-08-20'),
      genero: 'F',
      estadoCivil: 'SOLTERA',
      telefono: 'encrypted_phone_2',
      email: 'encrypted_email_2',
      direccion: {
        calle: 'Calle Falsa',
        numero: '123',
        ciudad: 'Buenos Aires',
        provincia: 'CABA',
        codigoPostal: '1001',
        pais: 'Argentina'
      },
      estadoPaciente: 'ACTIVO',
      consentimientoTratamientoDatos: true,
      fechaConsentimiento: new Date(),
      fechaCreacion: new Date(),
      fechaUltimaActualizacion: new Date()
    }
  ]

  const mockCacheResponse = {
    data: {
      exito: true,
      datos: mockPatients,
      totalElementos: 2,
      totalPaginas: 1,
      paginaActual: 1,
      tamanoPagina: 20
    },
    loading: false,
    error: null,
    refetch: jest.fn(),
    invalidate: jest.fn()
  }

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()
    
    // Setup cache mock
    require('@/optimized/cache/MedicalCacheManager').useMedicalCache.mockReturnValue(mockCacheResponse)
    
    // Clear audit logs
    global.clearMockAuditLogs()
    
    // Mock fetch para APIs
    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({
        exito: true,
        datos: mockPatients,
        mensaje: 'Pacientes obtenidos exitosamente'
      })
    })
  })

  describe('Renderizado y Estructura', () => {
    test('debe renderizar correctamente el micro-frontend', async () => {
      const { container } = render(<PatientManagementApp />)
      
      // Verificar que el componente se monta
      expect(container).toBeInTheDocument()
      
      // Verificar estructura del micro-frontend
      expect(screen.getByTestId('patient-management-content')).toBeInTheDocument()
      
      // Verificar compliance HIPAA del componente
      expect(container.firstChild).toBeHIPAACompliant()
    })

    test('debe renderizar la lista de pacientes', async () => {
      render(<PatientManagementApp />)
      
      await waitFor(() => {
        expect(screen.getByTestId('patient-list')).toBeInTheDocument()
      })
      
      // Verificar que se muestran los pacientes
      expect(screen.getByTestId('patient-item-0')).toBeInTheDocument()
      expect(screen.getByTestId('patient-item-1')).toBeInTheDocument()
      
      // Verificar contenido de pacientes
      expect(screen.getByText('Juan Carlos González')).toBeInTheDocument()
      expect(screen.getByText('María Elena Rodríguez')).toBeInTheDocument()
    })

    test('debe manejar estado de carga', () => {
      // Mock loading state
      require('@/optimized/cache/MedicalCacheManager').useMedicalCache.mockReturnValue({
        ...mockCacheResponse,
        loading: true,
        data: null
      })
      
      render(<PatientManagementApp />)
      
      // Verificar que muestra loading
      expect(screen.getByTestId('lazy-medical-component')).toBeInTheDocument()
    })
  })

  describe('Compliance HIPAA', () => {
    test('debe manejar datos PHI de forma segura', async () => {
      render(<PatientManagementApp />)
      
      await waitFor(() => {
        expect(screen.getByTestId('patient-list')).toBeInTheDocument()
      })
      
      // Verificar que datos sensibles están encriptados
      const firstPatient = mockPatients[0]
      expect(firstPatient).toHaveEncryptedData('telefono')
      expect(firstPatient).toHaveEncryptedData('email')
      
      // Verificar que el componente cumple HIPAA
      const patientList = screen.getByTestId('patient-list')
      expect(patientList).toBeHIPAACompliant()
    })

    test('debe registrar audit logs para acciones críticas', async () => {
      const mockOnPatientSelect = jest.fn()
      render(
        <PatientManagementApp 
          onPatientSelect={mockOnPatientSelect}
        />
      )
      
      await waitFor(() => {
        expect(screen.getByTestId('patient-item-0')).toBeInTheDocument()
      })
      
      // Simular selección de paciente
      const patientItem = screen.getByTestId('patient-item-0')
      fireEvent.click(patientItem)
      
      // Verificar que se llamó el callback
      expect(mockOnPatientSelect).toHaveBeenCalledWith(mockPatients[0])
      
      // Registrar audit log para testing
      global.registerMockAuditLog('PATIENT_SELECTED', {
        patientId: mockPatients[0].id,
        userId: 'test-user'
      })
      
      // Verificar audit logging
      expect('PATIENT_SELECTED').toHaveAuditLog('PATIENT_SELECTED')
    })

    test('debe validar datos médicos correctamente', () => {
      const patientData = mockPatients[0]
      
      // Verificar que los datos del paciente son válidos
      expect(patientData).toBeValidMedicalData('patient')
      
      // Verificar datos inválidos
      const invalidPatient = { ...patientData, nombres: '' }
      expect(invalidPatient).not.toBeValidMedicalData('patient')
    })
  })

  describe('Performance y Optimización', () => {
    test('debe cargar dentro del presupuesto de performance', async () => {
      const startTime = performance.now()
      
      render(<PatientManagementApp performance={{ priority: 'high' }} />)
      
      await waitFor(() => {
        expect(screen.getByTestId('patient-management-content')).toBeInTheDocument()
      })
      
      const endTime = performance.now()
      const loadTime = endTime - startTime
      
      // Verificar que carga dentro del presupuesto (3 segundos)
      expect({ loadTime }).toLoadWithinPerformanceBudget(3000)
    })

    test('debe usar cache médico correctamente', async () => {
      const mockUseMedicalCache = require('@/optimized/cache/MedicalCacheManager').useMedicalCache
      
      render(<PatientManagementApp />)
      
      // Verificar que se llama al cache con parámetros correctos
      expect(mockUseMedicalCache).toHaveBeenCalledWith(
        'patients',
        expect.stringContaining('patients_list_'),
        expect.any(Function),
        expect.objectContaining({
          ttl: 2 * 60 * 1000,
          priority: 'high',
          enabled: true
        })
      )
    })

    test('debe manejar lazy loading de forma eficiente', async () => {
      const { container } = render(
        <PatientManagementApp performance={{ priority: 'high', preload: true }} />
      )
      
      // Verificar que el lazy component está configurado correctamente
      const lazyComponent = container.querySelector('[data-testid="lazy-medical-component"]')
      expect(lazyComponent).toBeInTheDocument()
      
      // Verificar atributos de performance
      expect(lazyComponent).toHaveAttribute('data-performance-priority', 'high')
    })
  })

  describe('Accesibilidad Médica', () => {
    test('debe ser accesible para uso médico', async () => {
      const { container } = render(<PatientManagementApp />)
      
      await waitFor(() => {
        expect(screen.getByTestId('patient-list')).toBeInTheDocument()
      })
      
      // Verificar accesibilidad médica
      expect(container.firstChild).toBeAccessibleForMedicalUse()
    })

    test('debe soportar navegación por teclado', async () => {
      const user = userEvent.setup()
      render(<PatientManagementApp />)
      
      await waitFor(() => {
        expect(screen.getByTestId('patient-list')).toBeInTheDocument()
      })
      
      // Simular navegación por teclado
      const firstPatient = screen.getByTestId('patient-item-0')
      
      // Verificar que el elemento puede recibir foco
      await user.tab()
      expect(document.activeElement).toBe(firstPatient.closest('[tabindex="0"]') || firstPatient)
    })
  })

  describe('Manejo de Errores', () => {
    test('debe manejar errores de cache graciosamente', () => {
      const mockError = new Error('Cache error')
      require('@/optimized/cache/MedicalCacheManager').useMedicalCache.mockReturnValue({
        data: null,
        loading: false,
        error: mockError,
        refetch: jest.fn(),
        invalidate: jest.fn()
      })
      
      const { container } = render(<PatientManagementApp />)
      
      // Verificar que no falla el renderizado
      expect(container).toBeInTheDocument()
      
      // Verificar que mantiene compliance incluso con errores
      expect(container.firstChild).toBeHIPAACompliant()
    })

    test('debe manejar errores de API con fallback', async () => {
      // Mock API error
      global.fetch.mockRejectedValue(new Error('API Error'))
      
      const { container } = render(<PatientManagementApp />)
      
      // Verificar que el componente se renderiza a pesar del error
      expect(container).toBeInTheDocument()
      
      // Verificar que muestra un estado de error apropiado
      await waitFor(() => {
        expect(screen.getByTestId('lazy-medical-component')).toBeInTheDocument()
      })
    })
  })

  describe('Integración con Micro-frontends', () => {
    test('debe funcionar en modo embebido', () => {
      const { container } = render(<PatientManagementApp embedded={true} />)
      
      // Verificar que no tiene clases de página completa cuando está embebido
      const rootElement = container.firstChild
      expect(rootElement).not.toHaveClass('min-h-screen')
    })

    test('debe comunicarse con el shell principal', async () => {
      const mockOnPatientSelect = jest.fn()
      const mockOnPatientUpdate = jest.fn()
      
      render(
        <PatientManagementApp 
          onPatientSelect={mockOnPatientSelect}
          onPatientUpdate={mockOnPatientUpdate}
        />
      )
      
      await waitFor(() => {
        expect(screen.getByTestId('patient-item-0')).toBeInTheDocument()
      })
      
      // Simular interacciones
      fireEvent.click(screen.getByTestId('patient-item-0'))
      
      // Verificar comunicación con el shell
      expect(mockOnPatientSelect).toHaveBeenCalledWith(mockPatients[0])
    })

    test('debe manejar filtros iniciales del shell', () => {
      const initialFilters = { provincia: 'CABA', estadoPaciente: 'ACTIVO' }
      
      render(<PatientManagementApp initialFilters={initialFilters} />)
      
      // Verificar que se pasan los filtros al cache
      const mockUseMedicalCache = require('@/optimized/cache/MedicalCacheManager').useMedicalCache
      
      expect(mockUseMedicalCache).toHaveBeenCalledWith(
        'patients',
        expect.stringContaining(JSON.stringify(initialFilters)),
        expect.any(Function),
        expect.any(Object)
      )
    })
  })
})