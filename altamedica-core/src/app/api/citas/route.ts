// API de Gestión de Citas Médicas - Altamedica
// Incluye: programación, cancelación, reprogramación, recordatorios, telemedicina

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { 
  CitaMedica, 
  RespuestaAPI, 
  TipoCita,
  EstadoCita,
  Recordatorio
} from '@/types/medical'
import { 
  esHorarioLaboral,
  obtenerProximaFechaLaboral,
  generarIdCita
} from '@/lib/medical-utils'

// Esquemas de validación
const esquemaCita = z.object({
  pacienteId: z.string().min(1, 'ID de paciente requerido'),
  medicoId: z.string().min(1, 'ID de médico requerido'),
  fechaCita: z.string().transform(str => new Date(str)),
  duracionMinutos: z.number().min(15).max(180).default(30),
  tipoCita: z.enum([
    'CONSULTA_GENERAL', 'CONTROL', 'URGENCIA', 'ESTUDIO', 
    'PROCEDIMIENTO', 'CIRUGIA', 'REHABILITACION', 'VACUNACION'
  ] as [TipoCita, ...TipoCita[]]),
  modalidad: z.enum(['PRESENCIAL', 'TELEMEDICINA', 'DOMICILIO']),
  motivo: z.string().min(5, 'Motivo debe tener al menos 5 caracteres'),
  observaciones: z.string().optional(),
  consultorio: z.string().optional(),
  direccionConsultorio: z.string().optional(),
  linkVideoconferencia: z.string().optional(),
  plataformaTelemedicina: z.enum(['ZOOM', 'MEET', 'TEAMS', 'PROPIA']).optional(),
  recordatorios: z.array(z.object({
    tipo: z.enum(['SMS', 'EMAIL', 'WHATSAPP', 'LLAMADA']),
    tiempoAnticipacion: z.number().min(0),
    enviado: z.boolean().default(false)
  })).default([])
})

const esquemaFiltrosCitas = z.object({
  fechaInicio: z.string().transform(str => new Date(str)),
  fechaFin: z.string().transform(str => new Date(str)),
  medicoId: z.string().optional(),
  pacienteId: z.string().optional(),
  estado: z.enum([
    'PROGRAMADA', 'CONFIRMADA', 'EN_CURSO', 'COMPLETADA', 
    'CANCELADA', 'NO_ASISTIO', 'REPROGRAMADA'
  ] as [EstadoCita, ...EstadoCita[]]).optional(),
  modalidad: z.enum(['PRESENCIAL', 'TELEMEDICINA', 'DOMICILIO']).optional()
})

const esquemaDisponibilidad = z.object({
  medicoId: z.string().min(1),
  fecha: z.string().transform(str => new Date(str)),
  duracionMinutos: z.number().min(15).max(180)
})

// Simulación de base de datos en memoria
let citasDB: CitaMedica[] = []
let contadorCitas = 1

// Simulación de disponibilidad de médicos (en producción vendría de la DB)
const obtenerHorariosOcupados = (medicoId: string, fecha: Date): { inicio: Date; fin: Date }[] => {
  const citasDelDia = citasDB.filter(cita => {
    const fechaCita = new Date(cita.fechaCita)
    return cita.medicoId === medicoId &&
           fechaCita.toDateString() === fecha.toDateString() &&
           (cita.estado === 'PROGRAMADA' || cita.estado === 'CONFIRMADA' || cita.estado === 'EN_CURSO')
  })

  return citasDelDia.map(cita => ({
    inicio: new Date(cita.fechaCita),
    fin: new Date(new Date(cita.fechaCita).getTime() + cita.duracionMinutos * 60000)
  }))
}

const verificarConflictoHorario = (
  medicoId: string, 
  fechaInicio: Date, 
  duracionMinutos: number,
  citaIdExcluir?: string
): boolean => {
  const fechaFin = new Date(fechaInicio.getTime() + duracionMinutos * 60000)
  
  const horariosOcupados = obtenerHorariosOcupados(medicoId, fechaInicio)
  
  return horariosOcupados.some(horario => {
    // Excluir la cita actual si se está editando
    const citaConflicto = citasDB.find(c => 
      c.fechaCita.getTime() === horario.inicio.getTime() && 
      c.medicoId === medicoId
    )
    
    if (citaConflicto && citaConflicto.id === citaIdExcluir) {
      return false
    }
    
    return (fechaInicio < horario.fin && fechaFin > horario.inicio)
  })
}

// Función de auditoría
const registrarAuditoriaHIPAA = async (
  accion: string,
  recurso: string,
  req: NextRequest,
  resultado: 'EXITOSO' | 'FALLIDO'
) => {
  const registro = {
    timestamp: new Date(),
    accion,
    recursoAccedido: recurso,
    ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
    userAgent: req.headers.get('user-agent') || 'unknown',
    resultado
  }
  console.log('Auditoría HIPAA Citas:', registro)
}

// GET: Obtener citas con filtros
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  try {
    // Validar parámetros de filtro
    const filtros = esquemaFiltrosCitas.parse({
      fechaInicio: searchParams.get('fechaInicio') || new Date().toISOString(),
      fechaFin: searchParams.get('fechaFin') || new Date(Date.now() + 7*24*60*60*1000).toISOString(),
      medicoId: searchParams.get('medicoId'),
      pacienteId: searchParams.get('pacienteId'),
      estado: searchParams.get('estado'),
      modalidad: searchParams.get('modalidad')
    })

    // Filtrar citas según criterios
    let citasFiltradas = citasDB.filter(cita => {
      const fechaCita = new Date(cita.fechaCita)
      return fechaCita >= filtros.fechaInicio && fechaCita <= filtros.fechaFin
    })

    if (filtros.medicoId) {
      citasFiltradas = citasFiltradas.filter(c => c.medicoId === filtros.medicoId)
    }

    if (filtros.pacienteId) {
      citasFiltradas = citasFiltradas.filter(c => c.pacienteId === filtros.pacienteId)
    }

    if (filtros.estado) {
      citasFiltradas = citasFiltradas.filter(c => c.estado === filtros.estado)
    }

    if (filtros.modalidad) {
      citasFiltradas = citasFiltradas.filter(c => c.modalidad === filtros.modalidad)
    }

    // Ordenar por fecha
    citasFiltradas.sort((a, b) => new Date(a.fechaCita).getTime() - new Date(b.fechaCita).getTime())

    await registrarAuditoriaHIPAA('ACCESO_CITAS', `filtros_${JSON.stringify(filtros)}`, request, 'EXITOSO')

    const respuesta: RespuestaAPI<CitaMedica[]> = {
      exito: true,
      datos: citasFiltradas,
      mensaje: 'Citas obtenidas exitosamente',
      timestamp: new Date(),
      trazabilidad: Date.now().toString()
    }

    return NextResponse.json(respuesta)

  } catch (error) {
    await registrarAuditoriaHIPAA('ACCESO_CITAS', 'error', request, 'FALLIDO')
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          exito: false,
          mensaje: 'Parámetros de filtro inválidos',
          codigoError: 'FILTROS_INVALIDOS',
          datos: error.errors,
          timestamp: new Date(),
          trazabilidad: Date.now().toString()
        } as RespuestaAPI,
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        exito: false,
        mensaje: 'Error al obtener citas',
        codigoError: 'GET_CITAS_ERROR',
        timestamp: new Date(),
        trazabilidad: Date.now().toString()
      } as RespuestaAPI,
      { status: 500 }
    )
  }
}

// POST: Programar nueva cita
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const datosValidados = esquemaCita.parse(body)

    // Validar que la fecha sea futura
    if (datosValidados.fechaCita <= new Date()) {
      return NextResponse.json(
        {
          exito: false,
          mensaje: 'La fecha de la cita debe ser futura',
          codigoError: 'FECHA_INVALIDA',
          timestamp: new Date(),
          trazabilidad: Date.now().toString()
        } as RespuestaAPI,
        { status: 400 }
      )
    }

    // Validar horario laboral
    if (!esHorarioLaboral(datosValidados.fechaCita)) {
      return NextResponse.json(
        {
          exito: false,
          mensaje: 'La cita debe programarse en horario laboral',
          codigoError: 'HORARIO_INVALIDO',
          timestamp: new Date(),
          trazabilidad: Date.now().toString()
        } as RespuestaAPI,
        { status: 400 }
      )
    }

    // Verificar disponibilidad del médico
    if (verificarConflictoHorario(datosValidados.medicoId, datosValidados.fechaCita, datosValidados.duracionMinutos)) {
      return NextResponse.json(
        {
          exito: false,
          mensaje: 'El médico no está disponible en ese horario',
          codigoError: 'HORARIO_NO_DISPONIBLE',
          timestamp: new Date(),
          trazabilidad: Date.now().toString()
        } as RespuestaAPI,
        { status: 409 }
      )
    }

    // Configurar recordatorios por defecto si no se proporcionaron
    let recordatorios = datosValidados.recordatorios
    if (recordatorios.length === 0) {
      recordatorios = [
        {
          tipo: 'SMS',
          tiempoAnticipacion: 1440, // 24 horas
          enviado: false
        },
        {
          tipo: 'EMAIL',
          tiempoAnticipacion: 60, // 1 hora
          enviado: false
        }
      ]
    }

    // Crear nueva cita
    const nuevaCita: CitaMedica = {
      id: generarIdCita(datosValidados.medicoId, datosValidados.fechaCita),
      ...datosValidados,
      estado: 'PROGRAMADA',
      recordatorios,
      fechaCreacion: new Date(),
      fechaUltimaModificacion: new Date(),
      creadoPor: 'usuario-actual' // En producción vendría del token JWT
    }

    // Configurar link de telemedicina si es necesario
    if (datosValidados.modalidad === 'TELEMEDICINA' && !datosValidados.linkVideoconferencia) {
      nuevaCita.linkVideoconferencia = `https://telemedicina.altamedica.com/sala/${nuevaCita.id}`
      nuevaCita.plataformaTelemedicina = 'PROPIA'
    }

    citasDB.push(nuevaCita)
    contadorCitas++

    await registrarAuditoriaHIPAA('CREACION_CITA', nuevaCita.id, request, 'EXITOSO')

    const respuesta: RespuestaAPI<CitaMedica> = {
      exito: true,
      datos: nuevaCita,
      mensaje: 'Cita programada exitosamente',
      timestamp: new Date(),
      trazabilidad: Date.now().toString()
    }

    return NextResponse.json(respuesta, { status: 201 })

  } catch (error) {
    await registrarAuditoriaHIPAA('CREACION_CITA', 'error', request, 'FALLIDO')
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          exito: false,
          mensaje: 'Datos de cita inválidos',
          codigoError: 'VALIDACION_ERROR',
          datos: error.errors,
          timestamp: new Date(),
          trazabilidad: Date.now().toString()
        } as RespuestaAPI,
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        exito: false,
        mensaje: 'Error interno del servidor',
        codigoError: 'INTERNAL_ERROR',
        timestamp: new Date(),
        trazabilidad: Date.now().toString()
      } as RespuestaAPI,
      { status: 500 }
    )
  }
}

// PATCH: Actualizar estado de cita (cancelar, confirmar, etc.)
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const citaId = searchParams.get('id')
    const accion = searchParams.get('accion')

    if (!citaId || !accion) {
      return NextResponse.json(
        {
          exito: false,
          mensaje: 'ID de cita y acción requeridos',
          codigoError: 'PARAMETROS_REQUERIDOS',
          timestamp: new Date(),
          trazabilidad: Date.now().toString()
        } as RespuestaAPI,
        { status: 400 }
      )
    }

    const indiceCita = citasDB.findIndex(c => c.id === citaId)
    if (indiceCita === -1) {
      await registrarAuditoriaHIPAA(`ACTUALIZACION_CITA_${accion.toUpperCase()}`, citaId, request, 'FALLIDO')
      
      return NextResponse.json(
        {
          exito: false,
          mensaje: 'Cita no encontrada',
          codigoError: 'CITA_NO_ENCONTRADA',
          timestamp: new Date(),
          trazabilidad: Date.now().toString()
        } as RespuestaAPI,
        { status: 404 }
      )
    }

    const cita = citasDB[indiceCita]

    // Procesar diferentes acciones
    switch (accion) {
      case 'cancelar':
        if (cita.estado === 'COMPLETADA' || cita.estado === 'CANCELADA') {
          return NextResponse.json(
            {
              exito: false,
              mensaje: 'No se puede cancelar una cita completada o ya cancelada',
              codigoError: 'ESTADO_INVALIDO',
              timestamp: new Date(),
              trazabilidad: Date.now().toString()
            } as RespuestaAPI,
            { status: 400 }
          )
        }
        cita.estado = 'CANCELADA'
        break

      case 'confirmar':
        if (cita.estado !== 'PROGRAMADA') {
          return NextResponse.json(
            {
              exito: false,
              mensaje: 'Solo se pueden confirmar citas programadas',
              codigoError: 'ESTADO_INVALIDO',
              timestamp: new Date(),
              trazabilidad: Date.now().toString()
            } as RespuestaAPI,
            { status: 400 }
          )
        }
        cita.estado = 'CONFIRMADA'
        break

      case 'iniciar':
        if (cita.estado !== 'CONFIRMADA' && cita.estado !== 'PROGRAMADA') {
          return NextResponse.json(
            {
              exito: false,
              mensaje: 'Solo se pueden iniciar citas programadas o confirmadas',
              codigoError: 'ESTADO_INVALIDO',
              timestamp: new Date(),
              trazabilidad: Date.now().toString()
            } as RespuestaAPI,
            { status: 400 }
          )
        }
        cita.estado = 'EN_CURSO'
        break

      case 'completar':
        if (cita.estado !== 'EN_CURSO') {
          return NextResponse.json(
            {
              exito: false,
              mensaje: 'Solo se pueden completar citas en curso',
              codigoError: 'ESTADO_INVALIDO',
              timestamp: new Date(),
              trazabilidad: Date.now().toString()
            } as RespuestaAPI,
            { status: 400 }
          )
        }
        cita.estado = 'COMPLETADA'
        break

      default:
        return NextResponse.json(
          {
            exito: false,
            mensaje: 'Acción no válida',
            codigoError: 'ACCION_INVALIDA',
            timestamp: new Date(),
            trazabilidad: Date.now().toString()
          } as RespuestaAPI,
          { status: 400 }
        )
    }

    cita.fechaUltimaModificacion = new Date()
    citasDB[indiceCita] = cita

    await registrarAuditoriaHIPAA(`ACTUALIZACION_CITA_${accion.toUpperCase()}`, citaId, request, 'EXITOSO')

    const respuesta: RespuestaAPI<CitaMedica> = {
      exito: true,
      datos: cita,
      mensaje: `Cita ${accion} exitosamente`,
      timestamp: new Date(),
      trazabilidad: Date.now().toString()
    }

    return NextResponse.json(respuesta)

  } catch (error) {
    return NextResponse.json(
      {
        exito: false,
        mensaje: 'Error interno del servidor',
        codigoError: 'INTERNAL_ERROR',
        timestamp: new Date(),
        trazabilidad: Date.now().toString()
      } as RespuestaAPI,
      { status: 500 }
    )
  }
}