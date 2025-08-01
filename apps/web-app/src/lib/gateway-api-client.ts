// Gateway API Client for Web-App (Phase 1 - Refactoring)
// Only legitimate endpoints for authentication gateway functionality

import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: (failureCount, error: any) => {
        if (error?.status === 401) return false
        return failureCount < 2
      }
    }
  }
})

// PHASE 1: Connect to actual backend API server
// Auth endpoints use /api/v1, Health uses /api directly
const API_BASE_V1 = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api/v1'
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api'

export class GatewayAPI {
  private async request<T>(endpoint: string, options: RequestInit = {}, useV1: boolean = false): Promise<T> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
    const baseUrl = useV1 ? API_BASE_V1 : API_BASE
    
    const response = await fetch(`${baseUrl}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    })
    
    if (!response.ok) {
      if (response.status === 401) {
        // Auto logout on 401
        if (typeof window !== 'undefined') {
          localStorage.removeItem('authToken')
          window.location.href = '/login'
        }
      }
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }
    
    return response.json()
  }
  
  // ✅ LEGITIMATE GATEWAY ENDPOINTS ONLY
  
  // 🔐 Authentication APIs (5 endpoints) - CORE GATEWAY FUNCTION
  auth = {
    login: (data: { email: string; password: string }) => 
      this.request('/auth/login', { method: 'POST', body: JSON.stringify(data) }, true),
    register: (data: any) => 
      this.request('/auth/register', { method: 'POST', body: JSON.stringify(data) }, true),
    me: () => this.request('/auth/me', {}, true),
    logout: () => this.request('/auth/logout', { method: 'POST' }, true),
    refresh: () => this.request('/auth/refresh', { method: 'POST' }, true)
  }
  
  // 🏥 Health Check APIs (3 endpoints) - SYSTEM MONITORING
  health = {
    status: () => this.request('/health'),
    version: () => this.request('/health/version'),
    metrics: () => this.request('/health/metrics')
  }
  
  // 🔔 Global Notifications APIs (2 endpoints) - CROSS-APP ALERTS
  notifications = {
    global: (params?: any) => this.request(`/notifications/global${params ? '?' + new URLSearchParams(params) : ''}`),
    markRead: (id: string) => this.request(`/notifications/${id}/read`, { method: 'POST' })
  }
}

export const gatewayAPI = new GatewayAPI()

// Helper functions for authentication
export const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken')
  }
  return null
}

export const isAuthenticated = () => {
  return !!getAuthToken()
}

export const setAuthToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('authToken', token)
  }
}

export const clearAuthToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authToken')
  }
}

// Types for gateway functionality
export interface AuthResponse {
  token: string
  user: {
    id: string
    email: string
    name: string
    role: 'patient' | 'doctor' | 'company' | 'admin'
    status: 'active' | 'inactive' | 'suspended'
  }
  expiresIn: number
}

export interface GlobalNotification {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'error' | 'success'
  read: boolean
  createdAt: string
  targetRoles?: string[]
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  service: string
  version: string
  uptime: number
  dependencies: {
    database: 'healthy' | 'unhealthy'
    redis: 'healthy' | 'unhealthy'
    external_apis: 'healthy' | 'unhealthy'
  }
}

// Migration tracking interface
export interface MigrationStatus {
  phase: number
  endpointsRemaining: number
  migratedApps: string[]
  trafficRouting: {
    [key: string]: {
      webApp: number
      targetApp: number
    }
  }
  rollbackReady: boolean
}

export default gatewayAPI