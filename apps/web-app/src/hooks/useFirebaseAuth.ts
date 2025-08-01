'use client'

import { useState, useEffect, useContext, createContext } from 'react'
import { User } from 'firebase/auth'
import firebaseAuth, { UserProfile } from '@/services/firebase-auth'

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  error: string | null
  // Métodos de autenticación
  signIn: (email: string, password: string) => Promise<void>
  signUp: (userData: any) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signInWithFacebook: () => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  // Estado
  isAuthenticated: boolean
  isDoctor: boolean
  isPatient: boolean
  isCompany: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Escuchar cambios en la autenticación
  useEffect(() => {
    const unsubscribe = firebaseAuth.onAuthChange(async (user) => {
      setUser(user)
      setError(null)
      
      if (user) {
        try {
          // Obtener perfil del usuario
          const profile = await firebaseAuth.getUserProfile(user.uid)
          setUserProfile(profile)
        } catch (error) {
          console.error('Error obteniendo perfil:', error)
          setError((error as Error).message)
        }
      } else {
        setUserProfile(null)
      }
      
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // Métodos de autenticación
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      setError(null)
      await firebaseAuth.signIn(email, password)
    } catch (error) {
      setError((error as Error).message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (userData: any) => {
    try {
      setLoading(true)
      setError(null)
      await firebaseAuth.signUp(userData)
    } catch (error) {
      setError((error as Error).message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signInWithGoogle = async () => {
    try {
      setLoading(true)
      setError(null)
      await firebaseAuth.signInWithGoogle()
    } catch (error) {
      setError((error as Error).message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signInWithFacebook = async () => {
    try {
      setLoading(true)
      setError(null)
      await firebaseAuth.signInWithFacebook()
    } catch (error) {
      setError((error as Error).message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      setError(null)
      await firebaseAuth.signOut()
    } catch (error) {
      setError((error as Error).message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      setError(null)
      await firebaseAuth.resetPassword(email)
    } catch (error) {
      setError((error as Error).message)
      throw error
    }
  }

  // Estados computados
  const isAuthenticated = !!user
  const isDoctor = userProfile?.role === 'doctor'
  const isPatient = userProfile?.role === 'patient'
  const isCompany = userProfile?.role === 'company'

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    error,
    signIn,
    signUp,
    signInWithGoogle,
    signInWithFacebook,
    signOut,
    resetPassword,
    isAuthenticated,
    isDoctor,
    isPatient,
    isCompany
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider')
  }
  return context
}

// Hook personalizado para verificar permisos
export function usePermissions() {
  const { userProfile, isAuthenticated } = useAuth()

  const hasPermission = (permission: string): boolean => {
    if (!isAuthenticated || !userProfile) return false

    // Lógica de permisos basada en roles
    switch (permission) {
      case 'view_patient_data':
        return userProfile.role === 'doctor' || userProfile.role === 'patient'
      case 'prescribe_medication':
        return userProfile.role === 'doctor'
      case 'schedule_appointments':
        return userProfile.role === 'doctor' || userProfile.role === 'patient'
      case 'access_lab_results':
        return userProfile.role === 'doctor' || userProfile.role === 'patient'
      case 'manage_company_users':
        return userProfile.role === 'company'
      default:
        return false
    }
  }

  const canAccessRoute = (route: string): boolean => {
    if (!isAuthenticated) return false

    // Rutas protegidas por rol
    if (route.startsWith('/doctor')) {
      return userProfile?.role === 'doctor'
    }
    if (route.startsWith('/patient')) {
      return userProfile?.role === 'patient'
    }
    if (route.startsWith('/company')) {
      return userProfile?.role === 'company'
    }

    return true
  }

  return {
    hasPermission,
    canAccessRoute
  }
}

export default useAuth