// Componente de Auditoría HIPAA - Altamedica
// Seguimiento y logging de acceso a PHI (Protected Health Information)

'use client'

import React, { useEffect, useRef } from 'react'
import { useAltamedica } from '@/components/Providers'

interface EventoAuditoriaHIPAA {
  timestamp: string
  usuarioId: string
  accion: string
  recursoAccedido: string
  direccionIP: string
  userAgent: string
  resultado: 'EXITOSO' | 'FALLIDO' | 'ACCESO_DENEGADO'
  detalles?: Record<string, any>
}

class AuditorHIPAA {
  private static instance: AuditorHIPAA
  private eventos: EventoAuditoriaHIPAA[] = []
  private bufferSize = 100
  private intervalEnvio = 60000 // 1 minuto

  private constructor() {
    this.iniciarEnvioPeriodicoo()
  }

  static getInstance(): AuditorHIPAA {
    if (!AuditorHIPAA.instance) {
      AuditorHIPAA.instance = new AuditorHIPAA()
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
    if (this.eventos.length > this.bufferSize) {
      this.eventos = this.eventos.slice(-this.bufferSize)
    }

    // Log local para debugging (remover en producción)
    console.log('[HIPAA-AUDIT]', eventoCompleto)
  }

  private obtenerDireccionIP(): string {
    // En un entorno real, esto vendría del servidor
    return 'CLIENT-IP-MASKED'
  }

  private async enviarEventosInmediatos(eventos: EventoAuditoriaHIPAA[]) {
    try {
      // En implementación real, enviar a sistema de auditoría seguro
      await fetch('/api/auditoria-hipaa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ eventos })
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
    }, this.intervalEnvio)
  }

  private async enviarEventosPendientes() {
    if (this.eventos.length === 0) return

    const eventosAEnviar = [...this.eventos]
    this.eventos = []

    try {
      await fetch('/api/auditoria-hipaa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ eventos: eventosAEnviar })
      })
    } catch (error) {
      console.error('[HIPAA-AUDIT] Error enviando eventos:', error)
      // Restaurar eventos si falla el envío
      this.eventos.unshift(...eventosAEnviar)
    }
  }
}

// Hook para usar la auditoría HIPAA
export function useAuditoriaHIPAA() {
  const { usuario } = useAltamedica()
  const auditor = useRef<AuditorHIPAA>()

  useEffect(() => {
    auditor.current = AuditorHIPAA.getInstance()
  }, [])

  const registrarAccesoPHI = (
    accion: string,
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
      accion: 'ACCESO_DENEGADO',
      recursoAccedido: recurso,
      resultado: 'ACCESO_DENEGADO',
      detalles: { razon }
    })
  }

  return {
    registrarAccesoPHI,
    registrarAccesoDenegado
  }
}

// Componente principal de auditoría
export function AuditoriaHIPAA() {
  const { usuario } = useAltamedica()
  const auditor = useRef<AuditorHIPAA>()

  useEffect(() => {
    auditor.current = AuditorHIPAA.getInstance()

    // Registrar inicio de sesión
    if (usuario && auditor.current) {
      auditor.current.registrarEvento({
        usuarioId: usuario.id,
        accion: 'INICIO_SESION',
        recursoAccedido: 'SISTEMA_ALTAMEDICA',
        resultado: 'EXITOSO'
      })
    }

    // Registrar cierre de ventana/pestaña
    const handleBeforeUnload = () => {
      if (usuario && auditor.current) {
        auditor.current.registrarEvento({
          usuarioId: usuario.id,
          accion: 'CIERRE_SESION',
          recursoAccedido: 'SISTEMA_ALTAMEDICA',
          resultado: 'EXITOSO'
        })
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [usuario])

  // Monitorear cambios de visibilidad de la página
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!usuario || !auditor.current) return

      const accion = document.hidden ? 'SUSPENSION_SESION' : 'REANUDACION_SESION'
      
      auditor.current.registrarEvento({
        usuarioId: usuario.id,
        accion,
        recursoAccedido: 'SISTEMA_ALTAMEDICA',
        resultado: 'EXITOSO'
      })
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [usuario])

  // Este componente no renderiza nada, solo maneja la lógica de auditoría
  return null
}

export default AuditoriaHIPAA
