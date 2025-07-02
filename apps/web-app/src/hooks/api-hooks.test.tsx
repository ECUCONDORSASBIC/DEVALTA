/**
 * 🧪 ALTAMEDICA WEB-APP - API HOOKS TESTS
 * Unit tests for typed fetch hooks with ≥80% coverage
 */
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import {
  usePatients,
  usePatient,
  useCreatePatient,
  useUpdatePatient,
  useAuth,
  useLogin,
  useLogout,
  useAppointments,
  useCreateAppointment,
  useDoctors,
  usePrescriptions
} from './api-hooks'
import { api } from '@/lib/api-client'

// Mock the API client
vi.mock('@/lib/api-client', () => ({
  api: {
    patients: {
      list: vi.fn(),
      get: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      appointments: vi.fn(),
    },
    auth: {
      me: vi.fn(),
      login: vi.fn(),
      logout: vi.fn(),
    },
    appointments: {
      list: vi.fn(),
      create: vi.fn(),
    },
    doctors: {
      list: vi.fn(),
    },
    prescriptions: {
      list: vi.fn(),
    },
  },
}))

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  })

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('API Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllTimers()
  })

  describe('Patient Hooks', () => {
    test('usePatients should fetch patients list', async () => {
      const mockPatients = [
        { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
        { id: '2', firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com' },
      ]

      vi.mocked(api.patients.list).mockResolvedValue(mockPatients)

      const { result } = renderHook(() => usePatients(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockPatients)
      expect(api.patients.list).toHaveBeenCalledWith(undefined)
    })

    test('usePatients should handle parameters', async () => {
      const params = { limit: 10, search: 'john' }
      vi.mocked(api.patients.list).mockResolvedValue([])

      renderHook(() => usePatients(params), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(api.patients.list).toHaveBeenCalledWith(params)
      })
    })

    test('usePatient should fetch single patient by ID', async () => {
      const mockPatient = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      }

      vi.mocked(api.patients.get).mockResolvedValue(mockPatient)

      const { result } = renderHook(() => usePatient('1'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockPatient)
      expect(api.patients.get).toHaveBeenCalledWith('1')
    })

    test('usePatient should not fetch when ID is empty', () => {
      renderHook(() => usePatient(''), {
        wrapper: createWrapper(),
      })

      expect(api.patients.get).not.toHaveBeenCalled()
    })

    test('useCreatePatient should create a new patient', async () => {
      const newPatient = {
        firstName: 'New',
        lastName: 'Patient',
        email: 'new@example.com',
      }
      const createdPatient = { id: '3', ...newPatient }

      vi.mocked(api.patients.create).mockResolvedValue(createdPatient)

      const { result } = renderHook(() => useCreatePatient(), {
        wrapper: createWrapper(),
      })

      result.current.mutate(newPatient)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(api.patients.create).toHaveBeenCalledWith(newPatient)
    })

    test('useUpdatePatient should update existing patient', async () => {
      const patientUpdate = {
        id: '1',
        data: { firstName: 'Updated' },
      }
      const updatedPatient = { id: '1', firstName: 'Updated', lastName: 'Doe' }

      vi.mocked(api.patients.update).mockResolvedValue(updatedPatient)

      const { result } = renderHook(() => useUpdatePatient(), {
        wrapper: createWrapper(),
      })

      result.current.mutate(patientUpdate)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(api.patients.update).toHaveBeenCalledWith('1', { firstName: 'Updated' })
    })
  })

  describe('Auth Hooks', () => {
    test('useAuth should fetch current user', async () => {
      const mockUser = { id: '1', email: 'user@example.com', role: 'patient' }
      vi.mocked(api.auth.me).mockResolvedValue(mockUser)

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockUser)
      expect(api.auth.me).toHaveBeenCalled()
    })

    test('useLogin should handle login mutation', async () => {
      const loginData = { email: 'user@example.com', password: 'password' }
      const loginResponse = { token: 'mock-token', user: { id: '1', email: 'user@example.com' } }

      vi.mocked(api.auth.login).mockResolvedValue(loginResponse)

      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      })

      result.current.mutate(loginData)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(api.auth.login).toHaveBeenCalledWith(loginData)
      expect(localStorage.setItem).toHaveBeenCalledWith('authToken', 'mock-token')
    })

    test('useLogout should handle logout mutation', async () => {
      vi.mocked(api.auth.logout).mockResolvedValue({})

      const { result } = renderHook(() => useLogout(), {
        wrapper: createWrapper(),
      })

      result.current.mutate()

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(api.auth.logout).toHaveBeenCalled()
      expect(localStorage.removeItem).toHaveBeenCalledWith('authToken')
    })
  })

  describe('Appointment Hooks', () => {
    test('useAppointments should fetch appointments list', async () => {
      const mockAppointments = [
        { id: '1', patientId: '1', doctorId: '1', dateTime: '2024-01-01T10:00:00Z' },
        { id: '2', patientId: '2', doctorId: '1', dateTime: '2024-01-01T11:00:00Z' },
      ]

      vi.mocked(api.appointments.list).mockResolvedValue(mockAppointments)

      const { result } = renderHook(() => useAppointments(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockAppointments)
      expect(api.appointments.list).toHaveBeenCalled()
    })

    test('useCreateAppointment should create new appointment', async () => {
      const newAppointment = {
        patientId: '1',
        doctorId: '1',
        dateTime: '2024-01-01T10:00:00Z',
        type: 'consultation' as const,
      }
      const createdAppointment = { id: '3', ...newAppointment }

      vi.mocked(api.appointments.create).mockResolvedValue(createdAppointment)

      const { result } = renderHook(() => useCreateAppointment(), {
        wrapper: createWrapper(),
      })

      result.current.mutate(newAppointment)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(api.appointments.create).toHaveBeenCalledWith(newAppointment)
    })
  })

  describe('Doctor Hooks', () => {
    test('useDoctors should fetch doctors list', async () => {
      const mockDoctors = [
        { id: '1', firstName: 'Dr. Jane', lastName: 'Smith', specialization: 'Cardiology' },
        { id: '2', firstName: 'Dr. John', lastName: 'Johnson', specialization: 'Neurology' },
      ]

      vi.mocked(api.doctors.list).mockResolvedValue(mockDoctors)

      const { result } = renderHook(() => useDoctors(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockDoctors)
      expect(api.doctors.list).toHaveBeenCalled()
    })
  })

  describe('Prescription Hooks', () => {
    test('usePrescriptions should fetch prescriptions list', async () => {
      const mockPrescriptions = [
        { id: '1', patientId: '1', doctorId: '1', medications: [] },
        { id: '2', patientId: '2', doctorId: '1', medications: [] },
      ]

      vi.mocked(api.prescriptions.list).mockResolvedValue(mockPrescriptions)

      const { result } = renderHook(() => usePrescriptions(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockPrescriptions)
      expect(api.prescriptions.list).toHaveBeenCalled()
    })
  })

  describe('Error Handling', () => {
    test('should handle API errors gracefully', async () => {
      const error = new Error('API Error')
      vi.mocked(api.patients.list).mockRejectedValue(error)

      const { result } = renderHook(() => usePatients(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(error)
    })
  })
})
