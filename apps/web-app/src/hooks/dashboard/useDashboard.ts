import { useState } from 'react'
import { api } from '@/lib/api-client'

// Store simplificado sin zustand
interface DashboardState {
  user: any
  selectedPatient: any
  dashboardView: 'overview' | 'appointments' | 'patients' | 'analytics'
  sidebarCollapsed: boolean
  modalOpen: string | null
  searchQuery: string
}

const defaultState: DashboardState = {
  user: null,
  selectedPatient: null,
  dashboardView: 'overview',
  sidebarCollapsed: false,
  modalOpen: null,
  searchQuery: ''
}

// Hook para el estado del dashboard usando useState
export function useDashboard() {
  const [state, setState] = useState<DashboardState>(defaultState)
  
  return {
    // Estado
    ...state,
    
    // Acciones
    setUser: (user: any) => setState(prev => ({ ...prev, user })),
    setSelectedPatient: (patient: any) => setState(prev => ({ ...prev, selectedPatient: patient })),
    setDashboardView: (view: DashboardState['dashboardView']) => setState(prev => ({ ...prev, dashboardView: view })),
    setSidebarCollapsed: (collapsed: boolean) => setState(prev => ({ ...prev, sidebarCollapsed: collapsed })),
    setModalOpen: (modal: string | null) => setState(prev => ({ ...prev, modalOpen: modal })),
    setSearchQuery: (query: string) => setState(prev => ({ ...prev, searchQuery: query })),
    
    // Acciones compuestas
    selectPatientAndView: (patient: any) => {
      setState(prev => ({
        ...prev,
        selectedPatient: patient,
        dashboardView: 'patients'
      }))
    },
    
    openPatientModal: (patient: any) => {
      setState(prev => ({
        ...prev,
        selectedPatient: patient,
        modalOpen: 'patient-details'
      }))
    },
    
    closeAllModals: () => {
      setState(prev => ({
        ...prev,
        modalOpen: null,
        selectedPatient: null
      }))
    },
    
    // Acciones asíncronas
    refreshDashboard: async () => {
      try {
        const user = await api.auth.me()
        setState(prev => ({ ...prev, user }))
      } catch (error) {
        console.error('Error refreshing dashboard:', error)
      }
    }
  }
}
