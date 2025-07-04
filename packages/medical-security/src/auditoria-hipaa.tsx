// Sistema de Auditoría HIPAA - ALTAMEDICA
// Seguimiento y logging de acceso a PHI (Protected Health Information)

'use client'

import React, { useEffect, useRef } from 'react'
import type { UsuarioSistema, RegistroAuditoria, AccionAuditoria } from '@altamedica/medical-types'

interface EventoAuditoriaHIPAA {
  timestamp: string
  usuarioId: string
  accion: AccionAuditoria
  recursoAccedido: string
  direccionIP: string
  userAgent: string
  resultado: 'EXITOSO' | 'FALLIDO' | 'ACCESO_DENEGADO'
  detalles?: Record<string, any>
}

interface ConfiguracionAuditoria {
  bufferSize?: number
  intervalEnvio?: number
  endpointAuditoria?: string
  habilitarLogsConsola?: boolean
}

class AuditorHIPAA {
  private static instance: AuditorHIPAA
  private eventos: EventoAuditoriaHIPAA[] = []
  private configuracion: Required<ConfiguracionAuditoria>

  private constructor(config: ConfiguracionAuditoria = {}) {
    this.configuracion = {
      bufferSize: config.bufferSize || 100,
      intervalEnvio: config.intervalEnvio || 60000, // 1 minuto
      endpointAuditoria: config.endpointAuditoria || '/api/auditoria-hipaa',
      habilitarLogsConsola: config.habilitarLogsConsola || false
    }
    
    this.iniciarEnvioPeriodicoo()
  }

  static getInstance(config?: ConfiguracionAuditoria): AuditorHIPAA {
    if (!AuditorHIPAA.instance) {
      AuditorHIPAA.instance = new AuditorHIPAA(config)
    }
    return AuditorHIPAA.instance
  }

  registrarEvento(evento: Omit<EventoAuditoriaHIPAA, 'timestamp' | 'direccionIP' | 'userAgent'>) {
    const eventoCompleto: EventoAuditoriaHIPAA = {
      ...evento,
      timestamp: new Date().toISOString(),
      direccionIP: this.obtenerDireccionIP(),
      userAgent: navigator.userAgent
    }

    this.eventos.push(eventoCompleto)

    // Enviar inmediatamente si es un evento crítico
    if (evento.resultado === 'FALLIDO' || evento.resultado === 'ACCESO_DENEGADO') {
      this.enviarEventosInmediatos([eventoCompleto])
    }

    // Mantener el buffer en el tamaño límite
    if (this.eventos.length > this.configuracion.bufferSize) {
      this.eventos = this.eventos.slice(-this.configuracion.bufferSize)
    }

    // Log local para debugging
    if (this.configuracion.habilitarLogsConsola) {
      console.log('[HIPAA-AUDIT]', eventoCompleto)
    }
  }

  private obtenerDireccionIP(): string {
    // En un entorno real, esto vendría del servidor
    return 'CLIENT-IP-MASKED'
  }

  private async enviarEventosInmediatos(eventos: EventoAuditoriaHIPAA[]) {
    try {
      await fetch(this.configuracion.endpointAuditoria, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ eventos, urgente: true })
      })
    } catch (error) {
      console.error('[HIPAA-AUDIT] Error enviando eventos críticos:', error)
    }
  }

  private iniciarEnvioPeriodicoo() {
    setInterval(() => {
      if (this.eventos.length > 0) {
        this.enviarEventosPendientes()
      }
    }, this.configuracion.intervalEnvio)
  }

  private async enviarEventosPendientes() {
    if (this.eventos.length === 0) return

    const eventosAEnviar = [...this.eventos]
    this.eventos = []

    try {
      await fetch(this.configuracion.endpointAuditoria, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ eventos: eventosAEnviar, urgente: false })
      })
    } catch (error) {
      console.error('[HIPAA-AUDIT] Error enviando eventos:', error)
      // Restaurar eventos si falla el envío
      this.eventos.unshift(...eventosAEnviar)
    }
  }

  // Método para obtener estadísticas de auditoría
  obtenerEstadisticas() {
    return {
      eventosEnBuffer: this.eventos.length,
      configuracion: this.configuracion,
      ultimoEvento: this.eventos[this.eventos.length - 1]
    }
  }

  // Método para limpiar buffer manualmente
  limpiarBuffer() {
    this.eventos = []
  }
}

// Hook para usar la auditoría HIPAA
export function useAuditoriaHIPAA(usuario?: UsuarioSistema | null, config?: ConfiguracionAuditoria) {
  const auditor = useRef<AuditorHIPAA>()

  useEffect(() => {
    auditor.current = AuditorHIPAA.getInstance(config)
  }, [config])

  const registrarAccesoPHI = (
    accion: AccionAuditoria,
    recurso: string,
    exitoso: boolean = true,
    detalles?: Record<string, any>
  ) => {
    if (!auditor.current || !usuario) return

    auditor.current.registrarEvento({
      usuarioId: usuario.id,
      accion,
      recursoAccedido: recurso,
      resultado: exitoso ? 'EXITOSO' : 'FALLIDO',
      detalles
    })
  }

  const registrarAccesoDenegado = (recurso: string, razon: string) => {
    if (!auditor.current || !usuario) return

    auditor.current.registrarEvento({
      usuarioId: usuario.id,
      accion: 'ACCESO_PACIENTE',
      recursoAccedido: recurso,
      resultado: 'ACCESO_DENEGADO',
      detalles: { razon }
    })
  }

  const obtenerEstadisticas = () => {
    return auditor.current?.obtenerEstadisticas()
  }

  return {
    registrarAccesoPHI,
    registrarAccesoDenegado,
    obtenerEstadisticas
  }
}

// Componente principal de auditoría
interface AuditoriaHIPAAProps {
  usuario?: UsuarioSistema | null
  configuracion?: ConfiguracionAuditoria
  children?: React.ReactNode
}

export function AuditoriaHIPAA({ usuario, configuracion, children }: AuditoriaHIPAAProps) {
  const auditor = useRef<AuditorHIPAA>()

  useEffect(() => {
    auditor.current = AuditorHIPAA.getInstance(configuracion)

    // Registrar inicio de sesión
    if (usuario && auditor.current) {
      auditor.current.registrarEvento({
        usuarioId: usuario.id,
        accion: 'LOGIN',
        recursoAccedido: 'SISTEMA_ALTAMEDICA',
        resultado: 'EXITOSO'
      })
    }

    // Registrar cierre de ventana/pestaña
    const handleBeforeUnload = () => {
      if (usuario && auditor.current) {
        auditor.current.registrarEvento({
          usuarioId: usuario.id,
          accion: 'LOGOUT',
          recursoAccedido: 'SISTEMA_ALTAMEDICA',
          resultado: 'EXITOSO'
        })
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [usuario, configuracion])

  // Monitorear cambios de visibilidad de la página
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!usuario || !auditor.current) return

      const accion: AccionAuditoria = document.hidden ? 'LOGOUT' : 'LOGIN'
      
      auditor.current.registrarEvento({
        usuarioId: usuario.id,
        accion,
        recursoAccedido: 'SISTEMA_ALTAMEDICA',
        resultado: 'EXITOSO',
        detalles: { tipo: document.hidden ? 'suspension' : 'reanudacion' }
      })
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [usuario])

  // Renderizar children si se proporcionan
  return children ? <>{children}</> : null
}

export default AuditoriaHIPAA
export { AuditorHIPAA as AuditorClass }
export type { EventoAuditoriaHIPAA, ConfiguracionAuditoria }