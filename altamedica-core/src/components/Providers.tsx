// Providers principales para Altamedica
// Contextos, Firebase, estado global y configuración médica

'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

// Contexto de configuración médica
interface ConfiguracionMedica {
  centroMedico: string
  direccion: string
  telefono: string
  email: string
  licenciaSanitaria: string
  compliance: {
    hipaa: boolean
    argentina: boolean
    iso27001: boolean
  }
}

interface UsuarioMedico {
  id: string
  nombre: string
  apellido: string
  especialidad: string
  licencia: string
  email: string
  rol: 'MEDICO' | 'ENFERMERO' | 'ADMINISTRADOR' | 'ESPECIALISTA'
}

interface AltamedicaContextType {
  configuracion: ConfiguracionMedica
  usuario: UsuarioMedico | null
  setUsuario: (usuario: UsuarioMedico | null) => void
  theme: 'light' | 'dark'
  setTheme: (theme: 'light' | 'dark') => void
}

const AltamedicaContext = createContext<AltamedicaContextType | undefined>(undefined)

// Configuración por defecto del centro médico
const configuracionPorDefecto: ConfiguracionMedica = {
  centroMedico: 'Altamedica - Centro Médico Integral',
  direccion: 'Av. Corrientes 1234, CABA, Argentina',
  telefono: '+54 11 4567-8900',
  email: 'contacto@altamedica.com.ar',
  licenciaSanitaria: 'LS-CABA-2024-001',
  compliance: {
    hipaa: true,
    argentina: true,
    iso27001: true
  }
}

// Provider principal de Altamedica
export function AltamedicaProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioMedico | null>(null)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [configuracion] = useState<ConfiguracionMedica>(configuracionPorDefecto)

  // Cargar usuario desde localStorage al montar
  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('altamedica-usuario')
    if (usuarioGuardado) {
      try {
        setUsuario(JSON.parse(usuarioGuardado))
      } catch (error) {
        console.error('Error cargando usuario:', error)
        localStorage.removeItem('altamedica-usuario')
      }
    }
  }, [])

  // Guardar usuario en localStorage cuando cambie
  useEffect(() => {
    if (usuario) {
      localStorage.setItem('altamedica-usuario', JSON.stringify(usuario))
    } else {
      localStorage.removeItem('altamedica-usuario')
    }
  }, [usuario])

  // Cargar tema desde localStorage
  useEffect(() => {
    const temaGuardado = localStorage.getItem('altamedica-theme') as 'light' | 'dark'
    if (temaGuardado) {
      setTheme(temaGuardado)
    }
  }, [])

  // Guardar tema en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('altamedica-theme', theme)
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  const value: AltamedicaContextType = {
    configuracion,
    usuario,
    setUsuario,
    theme,
    setTheme
  }

  return (
    <AltamedicaContext.Provider value={value}>
      {children}
    </AltamedicaContext.Provider>
  )
}

// Hook para usar el contexto de Altamedica
export function useAltamedica() {
  const context = useContext(AltamedicaContext)
  if (context === undefined) {
    throw new Error('useAltamedica debe usarse dentro de AltamedicaProvider')
  }
  return context
}

// Provider de notificaciones médicas
interface Notificacion {
  id: string
  tipo: 'success' | 'warning' | 'error' | 'info' | 'hipaa'
  titulo: string
  mensaje: string
  duracion?: number
  acciones?: Array<{
    texto: string
    accion: () => void
    tipo?: 'primary' | 'secondary'
  }>
}

interface NotificacionesContextType {
  notificaciones: Notificacion[]
  agregar: (notificacion: Omit<Notificacion, 'id'>) => void
  remover: (id: string) => void
  limpiar: () => void
}

const NotificacionesContext = createContext<NotificacionesContextType | undefined>(undefined)

export function NotificacionesProvider({ children }: { children: React.ReactNode }) {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([])

  const agregar = (notificacion: Omit<Notificacion, 'id'>) => {
    const id = Date.now().toString()
    const nuevaNotificacion: Notificacion = {
      ...notificacion,
      id,
      duracion: notificacion.duracion || 5000
    }

    setNotificaciones(prev => [...prev, nuevaNotificacion])

    // Auto-remover después de la duración especificada
    if (nuevaNotificacion.duracion > 0) {
      setTimeout(() => {
        remover(id)
      }, nuevaNotificacion.duracion)
    }
  }

  const remover = (id: string) => {
    setNotificaciones(prev => prev.filter(n => n.id !== id))
  }

  const limpiar = () => {
    setNotificaciones([])
  }

  const value: NotificacionesContextType = {
    notificaciones,
    agregar,
    remover,
    limpiar
  }

  return (
    <NotificacionesContext.Provider value={value}>
      {children}
    </NotificacionesContext.Provider>
  )
}

// Hook para usar notificaciones
export function useNotificaciones() {
  const context = useContext(NotificacionesContext)
  if (context === undefined) {
    throw new Error('useNotificaciones debe usarse dentro de NotificacionesProvider')
  }
  return context
}

// Provider combinado principal
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AltamedicaProvider>
      <NotificacionesProvider>
        {children}
      </NotificacionesProvider>
    </AltamedicaProvider>
  )
}

// Export de tipos para uso en otros componentes
export type { ConfiguracionMedica, UsuarioMedico, Notificacion }
