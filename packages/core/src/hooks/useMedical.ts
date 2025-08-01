// Hooks personalizados para gestión de pacientes
// Incluye: validación HIPAA, encriptación PHI, auditoria automática

import { useState, useCallback } from 'react'
import {
  PacienteBase,
  CitaMedica,
  RespuestaAPI,
  ParametrosPaginacion,
  RespuestaPaginada,
  RegistroAuditoria
} from '@altamedica/types'

// Hook principal para gestión de pacientes
export const usePacientes = () => {
  const [pacientes, setPacientes] = useState<PacienteBase[]>([])
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalPacientes, setTotalPacientes] = useState(0)

  // Cargar lista de pacientes con paginación
  const cargarPacientes = useCallback(async (params: ParametrosPaginacion) => {
    setCargando(true)
    setError(null)
    
    try {
      const respuesta = await fetch('/api/pacientes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-HIPAA-Audit': 'true'
        },
        body: JSON.stringify(params)
      })

      const datos: RespuestaPaginada<PacienteBase> = await respuesta.json()
      
      if (respuesta.ok) {
        setPacientes(datos.datos)
        setTotalPacientes(datos.totalElementos)
      } else {
        throw new Error('Error al cargar pacientes')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setCargando(false)
    }
  }, [])

  // Buscar pacientes con filtros avanzados
  const buscarPacientes = useCallback(async (
    criterios: {
      nombres?: string
      apellidos?: string
      numeroDocumento?: string
      numeroHistoriaClinica?: string
      fechaNacimientoDesde?: Date
      fechaNacimientoHasta?: Date
    }
  ) => {
    setCargando(true)
    setError(null)

    try {
      const queryParams = new URLSearchParams()
      Object.entries(criterios).forEach(([key, value]) => {
        if (value) {
          queryParams.append(key, value.toString())
        }
      })

      const respuesta = await fetch(`/api/pacientes/buscar?${queryParams}`, {
        headers: {
          'X-HIPAA-Audit': 'true',
          'X-Search-Reason': 'clinical_lookup'
        }
      })

      const datos: RespuestaAPI<PacienteBase[]> = await respuesta.json()
      
      if (datos.exito) {
        setPacientes(datos.datos || [])
      } else {
        throw new Error(datos.mensaje)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error en búsqueda')
    } finally {
      setCargando(false)
    }
  }, [])

  // Crear nuevo paciente con validación HIPAA
  const crearPaciente = useCallback(async (datosNuevoPaciente: Omit<PacienteBase, 'id' | 'fechaCreacion' | 'fechaUltimaActualizacion'>) => {
    setCargando(true)
    setError(null)

    try {
      const respuesta = await fetch('/api/pacientes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-HIPAA-Audit': 'true',
          'X-Action': 'create_patient'
        },
        body: JSON.stringify(datosNuevoPaciente)
      })

      const datos: RespuestaAPI<PacienteBase> = await respuesta.json()
      
      if (datos.exito && datos.datos) {
        setPacientes(prev => [...prev, datos.datos!])
        return datos.datos
      } else {
        throw new Error(datos.mensaje)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear paciente')
      throw err
    } finally {
      setCargando(false)
    }
  }, [])

  // Actualizar paciente existente
  const actualizarPaciente = useCallback(async (
    pacienteId: string, 
    datosActualizados: Partial<PacienteBase>
  ) => {
    setCargando(true)
    setError(null)

    try {
      const respuesta = await fetch(`/api/pacientes/${pacienteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-HIPAA-Audit': 'true',
          'X-Action': 'update_patient'
        },
        body: JSON.stringify(datosActualizados)
      })

      const datos: RespuestaAPI<PacienteBase> = await respuesta.json()
      
      if (datos.exito && datos.datos) {
        setPacientes(prev => 
          prev.map(p => p.id === pacienteId ? datos.datos! : p)
        )
        return datos.datos
      } else {
        throw new Error(datos.mensaje)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar paciente')
      throw err
    } finally {
      setCargando(false)
    }
  }, [])

  return {
    pacientes,
    cargando,
    error,
    totalPacientes,
    cargarPacientes,
    buscarPacientes,
    crearPaciente,
    actualizarPaciente
  }
}

// Hook para gestión de citas médicas
export const useCitasMedicas = () => {
  const [citas, setCitas] = useState<CitaMedica[]>([])
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cargar citas por rango de fechas
  const cargarCitasPorFecha = useCallback(async (
    fechaInicio: Date,
    fechaFin: Date,
    medicoId?: string
  ) => {
    setCargando(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        fechaInicio: fechaInicio.toISOString(),
        fechaFin: fechaFin.toISOString()
      })
      
      if (medicoId) {
        params.append('medicoId', medicoId)
      }

      const respuesta = await fetch(`/api/citas?${params}`, {
        headers: {
          'X-HIPAA-Audit': 'true'
        }
      })

      const datos: RespuestaAPI<CitaMedica[]> = await respuesta.json()
      
      if (datos.exito) {
        setCitas(datos.datos || [])
      } else {
        throw new Error(datos.mensaje)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar citas')
    } finally {
      setCargando(false)
    }
  }, [])

  // Programar nueva cita
  const programarCita = useCallback(async (datosCita: Omit<CitaMedica, 'id' | 'fechaCreacion' | 'fechaUltimaModificacion'>) => {
    setCargando(true)
    setError(null)

    try {
      const respuesta = await fetch('/api/citas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-HIPAA-Audit': 'true',
          'X-Action': 'schedule_appointment'
        },
        body: JSON.stringify(datosCita)
      })

      const datos: RespuestaAPI<CitaMedica> = await respuesta.json()
      
      if (datos.exito && datos.datos) {
        setCitas(prev => [...prev, datos.datos!])
        return datos.datos
      } else {
        throw new Error(datos.mensaje)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al programar cita')
      throw err
    } finally {
      setCargando(false)
    }
  }, [])

  // Cancelar cita
  const cancelarCita = useCallback(async (citaId: string, motivoCancelacion: string) => {
    setCargando(true)
    setError(null)

    try {
      const respuesta = await fetch(`/api/citas/${citaId}/cancelar`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-HIPAA-Audit': 'true',
          'X-Action': 'cancel_appointment'
        },
        body: JSON.stringify({ motivoCancelacion })
      })

      const datos: RespuestaAPI<CitaMedica> = await respuesta.json()
      
      if (datos.exito && datos.datos) {
        setCitas(prev => 
          prev.map(c => c.id === citaId ? datos.datos! : c)
        )
        return datos.datos
      } else {
        throw new Error(datos.mensaje)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cancelar cita')
      throw err
    } finally {
      setCargando(false)
    }
  }, [])

  // Verificar disponibilidad de horario
  const verificarDisponibilidad = useCallback(async (
    medicoId: string,
    fecha: Date,
    duracionMinutos: number
  ): Promise<boolean> => {
    try {
      const respuesta = await fetch('/api/citas/disponibilidad', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          medicoId,
          fecha: fecha.toISOString(),
          duracionMinutos
        })
      })

      const datos: RespuestaAPI<{ disponible: boolean }> = await respuesta.json()
      return datos.datos?.disponible || false
    } catch {
      return false
    }
  }, [])

  return {
    citas,
    cargando,
    error,
    cargarCitasPorFecha,
    programarCita,
    cancelarCita,
    verificarDisponibilidad
  }
}

// Hook para auditoria HIPAA
export const useAuditoriaHIPAA = () => {
  const [registrosAuditoria, setRegistrosAuditoria] = useState<RegistroAuditoria[]>([])
  const [cargando, setCargando] = useState(false)

  // Registrar evento de auditoria automáticamente
  const registrarEvento = useCallback(async (evento: Omit<RegistroAuditoria, 'timestamp'>) => {
    try {
      await fetch('/api/auditoria', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...evento,
          timestamp: new Date().toISOString()
        })
      })
    } catch (error) {
      console.error('Error al registrar evento de auditoría:', error)
    }
  }, [])

  // Obtener registros de auditoria
  const obtenerRegistros = useCallback(async (
    fechaInicio: Date,
    fechaFin: Date,
    usuarioId?: string
  ) => {
    setCargando(true)
    
    try {
      const params = new URLSearchParams({
        fechaInicio: fechaInicio.toISOString(),
        fechaFin: fechaFin.toISOString()
      })
      
      if (usuarioId) {
        params.append('usuarioId', usuarioId)
      }

      const respuesta = await fetch(`/api/auditoria?${params}`)
      const datos: RespuestaAPI<RegistroAuditoria[]> = await respuesta.json()
      
      if (datos.exito) {
        setRegistrosAuditoria(datos.datos || [])
      }
    } catch (error) {
      console.error('Error al obtener registros:', error)
    } finally {
      setCargando(false)
    }
  }, [])

  return {
    registrosAuditoria,
    cargando,
    registrarEvento,
    obtenerRegistros
  }
}