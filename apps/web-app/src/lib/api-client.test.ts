/**
 * 🧪 ALTAMEDICA WEB-APP - API CLIENT TESTS
 * Unit tests for the AltamedicaAPI class and related utilities
 */
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { AltamedicaAPI, getAuthToken, isAuthenticated } from './api-client'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
})

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000',
  },
  writable: true,
})

describe('AltamedicaAPI', () => {
  let api: AltamedicaAPI

  beforeEach(() => {
    api = new AltamedicaAPI()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('Authentication Methods', () => {
    test('login should make POST request with credentials', async () => {
      const loginData = { email: 'test@example.com', password: 'password' }
      const mockResponse = { token: 'mock-token', user: { id: '1' } }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await api.auth.login(loginData)

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/v1/auth/login',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify(loginData),
        })
      )
      expect(result).toEqual(mockResponse)
    })

    test('me should include auth token in headers when available', async () => {
      mockLocalStorage.getItem.mockReturnValue('test-token')
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: '1', email: 'test@example.com' }),
      })

      await api.auth.me()

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/v1/auth/me',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      )
    })

    test('logout should make POST request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      })

      await api.auth.logout()

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/v1/auth/logout',
        expect.objectContaining({
          method: 'POST',
        })
      )
    })
  })

  describe('Patient Methods', () => {
    test('patients.list should handle query parameters', async () => {
      const params = { limit: 10, search: 'john' }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [{ id: '1', name: 'John Doe' }],
      })

      await api.patients.list(params)

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/v1/patients?limit=10&search=john',
        expect.any(Object)
      )
    })

    test('patients.get should fetch single patient', async () => {
      const patientId = '123'
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: patientId, name: 'John Doe' }),
      })

      await api.patients.get(patientId)

      expect(mockFetch).toHaveBeenCalledWith(
        `http://localhost:3001/api/v1/patients/${patientId}`,
        expect.any(Object)
      )
    })

    test('patients.create should make POST request with data', async () => {
      const patientData = { firstName: 'John', lastName: 'Doe', email: 'john@example.com' }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: '1', ...patientData }),
      })

      await api.patients.create(patientData)

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/v1/patients',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(patientData),
        })
      )
    })

    test('patients.update should make PUT request', async () => {
      const patientId = '123'
      const updateData = { firstName: 'Jane' }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: patientId, ...updateData }),
      })

      await api.patients.update(patientId, updateData)

      expect(mockFetch).toHaveBeenCalledWith(
        `http://localhost:3001/api/v1/patients/${patientId}`,
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(updateData),
        })
      )
    })
  })

  describe('Doctor Methods', () => {
    test('doctors.list should fetch doctors list', async () => {
      const mockDoctors = [
        { id: '1', firstName: 'Dr. Jane', lastName: 'Smith' },
        { id: '2', firstName: 'Dr. John', lastName: 'Johnson' },
      ]
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockDoctors,
      })

      const result = await api.doctors.list()

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/v1/doctors',
        expect.any(Object)
      )
      expect(result).toEqual(mockDoctors)
    })

    test('doctors.availability should fetch doctor availability', async () => {
      const doctorId = '123'
      const mockAvailability = [
        { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' },
      ]
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAvailability,
      })

      const result = await api.doctors.availability(doctorId)

      expect(mockFetch).toHaveBeenCalledWith(
        `http://localhost:3001/api/v1/doctors/${doctorId}/availability`,
        expect.any(Object)
      )
      expect(result).toEqual(mockAvailability)
    })
  })

  describe('Appointment Methods', () => {
    test('appointments.create should make POST request', async () => {
      const appointmentData = {
        patientId: '1',
        doctorId: '2',
        dateTime: '2024-01-01T10:00:00Z',
        type: 'consultation',
      }
      const mockResponse = { id: '123', ...appointmentData }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await api.appointments.create(appointmentData)

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/v1/appointments',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(appointmentData),
        })
      )
      expect(result).toEqual(mockResponse)
    })

    test('appointments.cancel should make POST request to cancel endpoint', async () => {
      const appointmentId = '123'
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      })

      await api.appointments.cancel(appointmentId)

      expect(mockFetch).toHaveBeenCalledWith(
        `http://localhost:3001/api/v1/appointments/${appointmentId}/cancel`,
        expect.objectContaining({
          method: 'POST',
        })
      )
    })
  })

  describe('Error Handling', () => {
    test('should throw error for non-ok responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
      })

      await expect(api.patients.list()).rejects.toThrow('API Error: 400 Bad Request')
    })

    test('should handle 401 errors by clearing token and redirecting', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      })

      await expect(api.auth.me()).rejects.toThrow('API Error: 401 Unauthorized')
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('authToken')
    })

    test('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(api.patients.list()).rejects.toThrow('Network error')
    })
  })

  describe('Health and Analytics', () => {
    test('health.status should fetch health status', async () => {
      const mockHealth = { status: 'healthy', timestamp: '2024-01-01T10:00:00Z' }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockHealth,
      })

      const result = await api.health.status()

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/v1/health',
        expect.any(Object)
      )
      expect(result).toEqual(mockHealth)
    })

    test('analytics.patientStats should fetch patient statistics', async () => {
      const params = { period: '30d' }
      const mockStats = { totalPatients: 150, newPatients: 25 }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockStats,
      })

      const result = await api.analytics.patientStats(params)

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/v1/analytics/patients?period=30d',
        expect.any(Object)
      )
      expect(result).toEqual(mockStats)
    })
  })
})

describe('Auth Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('getAuthToken should return token from localStorage', () => {
    mockLocalStorage.getItem.mockReturnValue('test-token')

    const token = getAuthToken()

    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('authToken')
    expect(token).toBe('test-token')
  })

  test('getAuthToken should return null when no token exists', () => {
    mockLocalStorage.getItem.mockReturnValue(null)

    const token = getAuthToken()

    expect(token).toBeNull()
  })

  test('isAuthenticated should return true when token exists', () => {
    mockLocalStorage.getItem.mockReturnValue('test-token')

    const authenticated = isAuthenticated()

    expect(authenticated).toBe(true)
  })

  test('isAuthenticated should return false when no token exists', () => {
    mockLocalStorage.getItem.mockReturnValue(null)

    const authenticated = isAuthenticated()

    expect(authenticated).toBe(false)
  })
})
