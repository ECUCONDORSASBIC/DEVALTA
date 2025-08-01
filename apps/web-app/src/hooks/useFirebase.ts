// hooks/useFirebase.ts
import { useState, useEffect } from 'react'
import { db, auth, storage } from '../../config/firebase'

interface FirebaseServices {
  db: any
  auth: any
  storage: any
  isLoading: boolean
  error: string | null
}

export const useFirebase = (): FirebaseServices => {
  const [services, setServices] = useState<FirebaseServices>({
    db: null,
    auth: null,
    storage: null,
    isLoading: true,
    error: null
  })

  useEffect(() => {
    const initializeFirebase = () => {
      try {
        // Usar la configuración centralizada
        setServices({
          db,
          auth,
          storage,
          isLoading: false,
          error: null
        })
      } catch (error) {
        console.error('Error inicializando Firebase:', error)
        setServices(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Error desconocido'
        }))
      }
    }

    // Solo inicializar en el cliente
    if (typeof window !== 'undefined') {
      initializeFirebase()
    } else {
      setServices(prev => ({
        ...prev,
        isLoading: false
      }))
    }
  }, [])

  return services
}

// Hook específico para obtener solo la base de datos
export const useFirestore = () => {
  const { db, isLoading, error } = useFirebase()
  return { db, isLoading, error }
}

// Hook específico para obtener solo la autenticación
export const useFirebaseAuth = () => {
  const { auth, isLoading, error } = useFirebase()
  return { auth, isLoading, error }
}

// Hook específico para obtener solo el storage
export const useFirebaseStorage = () => {
  const { storage, isLoading, error } = useFirebase()
  return { storage, isLoading, error }
} 