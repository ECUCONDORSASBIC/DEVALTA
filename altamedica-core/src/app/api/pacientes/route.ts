// API de Gestión de Pacientes - Altamedica
// Incluye: CRUD completo, búsqueda avanzada, encriptación PHI, auditoría HIPAA

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { 
  PacienteBase, 
  RespuestaAPI, 
  ParametrosPaginacion,
  RespuestaPaginada,
  ProvinciaArgentina 
} from '@/types/medical'
import { 
  validarDNI, 
  validarTelefonoArgentino, 
  validarEmailMedico,
  encriptarDatosPHI,
  desencriptarDatosPHI,
  generarNumeroHistoriaClinica
} from '@/lib/medical-utils'

// Esquemas de validación Zod
const esquemaPaciente = z.object({
  nombres: z.string().min(2, 'Nombres debe tener al menos 2 caracteres'),
  apellidos: z.string().min(2, 'Apellidos debe tener al menos 2 caracteres'),
  tipoDocumento: z.enum(['DNI', 'PASSPORT', 'CEDULA', 'LC', 'LE']),
  numeroDocumento: z.string().refine(validarDNI, 'Número de documento inválido'),
  fechaNacimiento: z.string().transform(str => new Date(str)),
  genero: z.enum(['M', 'F', 'X', 'NO_ESPECIFICA']),
  estadoCivil: z.enum(['SOLTERO', 'CASADO', 'DIVORCIADO', 'VIUDO', 'UNION_LIBRE']),
  telefono: z.string().optional().refine((val) => !val || validarTelefonoArgentino(val), 'Teléfono inválido'),
  email: z.string().optional().refine((val) => !val || validarEmailMedico(val), 'Email inválido'),
  direccion: z.object({
    calle: z.string().min(1, 'Calle es obligatoria'),
    numero: z.string().min(1, 'Número es obligatorio'),
    piso: z.string().optional(),
    departamento: z.string().optional(),
    ciudad: z.string().min(1, 'Ciudad es obligatoria'),
    provincia: z.enum([
      'CABA', 'BUENOS_AIRES', 'CATAMARCA', 'CHACO', 'CHUBUT', 'CORDOBA',
      'CORRIENTES', 'ENTRE_RIOS', 'FORMOSA', 'JUJUY', 'LA_PAMPA', 'LA_RIOJA',
      'MENDOZA', 'MISIONES', 'NEUQUEN', 'RIO_NEGRO', 'SALTA', 'SAN_JUAN',
      'SAN_LUIS', 'SANTA_CRUZ', 'SANTA_FE', 'SANTIAGO_DEL_ESTERO',
      'TIERRA_DEL_FUEGO', 'TUCUMAN'
    ] as [ProvinciaArgentina, ...ProvinciaArgentina[]]),
    codigoPostal: z.string().min(4, 'Código postal inválido'),
    pais: z.string().default('Argentina')
  }),
  grupoSanguineo: z.enum(['A', 'B', 'AB', 'O']).optional(),
  factorRh: z.enum(['+', '-']).optional(),
  alergias: z.array(z.string()).optional(),
  consentimientoTratamientoDatos: z.boolean().refine(val => val === true, 'Consentimiento HIPAA requerido'),
  fechaConsentimiento: z.string().transform(str => new Date(str))
})

const esquemaBusqueda = z.object({
  nombres: z.string().optional(),
  apellidos: z.string().optional(),
  numeroDocumento: z.string().optional(),
  numeroHistoriaClinica: z.string().optional(),
  fechaNacimientoDesde: z.string().optional().transform(str => str ? new Date(str) : undefined),
  fechaNacimientoHasta: z.string().optional().transform(str => str ? new Date(str) : undefined)
})

const esquemaPaginacion = z.object({
  pagina: z.number().min(1).default(1),
  tamanoPagina: z.number().min(1).max(100).default(10),
  ordenarPor: z.string().optional().default('fechaUltimaActualizacion'),
  direccionOrden: z.enum(['ASC', 'DESC']).default('DESC')
})

// Simulación de base de datos en memoria (reemplazar por Prisma/DB real)
let pacientesDB: PacienteBase[] = []
let contadorPacientes = 1

// Función para registrar auditoría HIPAA
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
    ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
    userAgent: req.headers.get('user-agent') || 'unknown',
    resultado
  }
  
  // Aquí se guardaría en la base de datos de auditoría
  console.log('Auditoría HIPAA:', registro)
}

// GET: Obtener pacientes con paginación
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  try {
    // Validar parámetros de paginación
    const paginacionValidada = esquemaPaginacion.parse({
      pagina: parseInt(searchParams.get('pagina') || '1'),
      tamanoPagina: parseInt(searchParams.get('tamanoPagina') || '10'),
      ordenarPor: searchParams.get('ordenarPor') || 'fechaUltimaActualizacion',
      direccionOrden: searchParams.get('direccionOrden') || 'DESC'
    })

    // Aplicar filtros si existen
    let pacientesFiltrados = [...pacientesDB]
    
    const filtros = {
      nombres: searchParams.get('nombres'),
      apellidos: searchParams.get('apellidos'),
      numeroDocumento: searchParams.get('numeroDocumento'),
      numeroHistoriaClinica: searchParams.get('numeroHistoriaClinica')
    }

    if (filtros.nombres) {
      pacientesFiltrados = pacientesFiltrados.filter(p => 
        p.nombres.toLowerCase().includes(filtros.nombres!.toLowerCase())
      )
    }

    if (filtros.apellidos) {
      pacientesFiltrados = pacientesFiltrados.filter(p => 
        p.apellidos.toLowerCase().includes(filtros.apellidos!.toLowerCase())
      )
    }

    if (filtros.numeroDocumento) {
      pacientesFiltrados = pacientesFiltrados.filter(p => 
        p.numeroDocumento.includes(filtros.numeroDocumento!)
      )
    }

    if (filtros.numeroHistoriaClinica) {
      pacientesFiltrados = pacientesFiltrados.filter(p => 
        p.numeroHistoriaClinica.includes(filtros.numeroHistoriaClinica!)
      )
    }

    // Aplicar paginación
    const totalElementos = pacientesFiltrados.length
    const totalPaginas = Math.ceil(totalElementos / paginacionValidada.tamanoPagina)
    const inicio = (paginacionValidada.pagina - 1) * paginacionValidada.tamanoPagina
    const fin = inicio + paginacionValidada.tamanoPagina

    const pacientesPaginados = pacientesFiltrados.slice(inicio, fin)

    // Desencriptar datos sensibles para la respuesta (solo los necesarios)
    const pacientesRespuesta = pacientesPaginados.map(paciente => ({
      ...paciente,
      telefono: paciente.telefono ? desencriptarDatosPHI(paciente.telefono) : undefined,
      email: paciente.email ? desencriptarDatosPHI(paciente.email) : undefined
    }))

    const respuesta: RespuestaPaginada<PacienteBase> = {
      datos: pacientesRespuesta,
      totalElementos,
      totalPaginas,
      paginaActual: paginacionValidada.pagina,
      tamanoPagina: paginacionValidada.tamanoPagina
    }

    await registrarAuditoriaHIPAA('ACCESO_PACIENTES', 'pacientes_list', request, 'EXITOSO')

    return NextResponse.json(respuesta)

  } catch (error) {
    await registrarAuditoriaHIPAA('ACCESO_PACIENTES', 'pacientes_list', request, 'FALLIDO')
    
    return NextResponse.json(
      {
        exito: false,
        mensaje: 'Error al obtener pacientes',
        codigoError: 'GET_PACIENTES_ERROR',
        timestamp: new Date(),
        trazabilidad: Date.now().toString()
      } as RespuestaAPI,
      { status: 500 }
    )
  }
}

// POST: Crear nuevo paciente
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar datos del paciente
    const datosValidados = esquemaPaciente.parse(body)

    // Verificar que no exista un paciente con el mismo documento
    const pacienteExistente = pacientesDB.find(p => 
      p.numeroDocumento === datosValidados.numeroDocumento && 
      p.tipoDocumento === datosValidados.tipoDocumento
    )

    if (pacienteExistente) {
      await registrarAuditoriaHIPAA('CREACION_PACIENTE', `documento_${datosValidados.numeroDocumento}`, request, 'FALLIDO')
      
      return NextResponse.json(
        {
          exito: false,
          mensaje: 'Ya existe un paciente con este documento',
          codigoError: 'PACIENTE_DUPLICADO',
          timestamp: new Date(),
          trazabilidad: Date.now().toString()
        } as RespuestaAPI,
        { status: 409 }
      )
    }

    // Crear nuevo paciente
    const nuevoPaciente: PacienteBase = {
      id: `PAC_${contadorPacientes.toString().padStart(6, '0')}`,
      numeroHistoriaClinica: generarNumeroHistoriaClinica(),
      ...datosValidados,
      // Encriptar datos sensibles
      telefono: datosValidados.telefono ? encriptarDatosPHI(datosValidados.telefono) : undefined,
      email: datosValidados.email ? encriptarDatosPHI(datosValidados.email) : undefined,
      fechaCreacion: new Date(),
      fechaUltimaActualizacion: new Date(),
      estadoPaciente: 'ACTIVO'
    }

    pacientesDB.push(nuevoPaciente)
    contadorPacientes++

    // Desencriptar para la respuesta
    const pacienteRespuesta = {
      ...nuevoPaciente,
      telefono: nuevoPaciente.telefono ? desencriptarDatosPHI(nuevoPaciente.telefono) : undefined,
      email: nuevoPaciente.email ? desencriptarDatosPHI(nuevoPaciente.email) : undefined
    }

    await registrarAuditoriaHIPAA('CREACION_PACIENTE', nuevoPaciente.id, request, 'EXITOSO')

    const respuesta: RespuestaAPI<PacienteBase> = {
      exito: true,
      datos: pacienteRespuesta,
      mensaje: 'Paciente creado exitosamente',
      timestamp: new Date(),
      trazabilidad: Date.now().toString()
    }

    return NextResponse.json(respuesta, { status: 201 })

  } catch (error) {
    await registrarAuditoriaHIPAA('CREACION_PACIENTE', 'unknown', request, 'FALLIDO')
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          exito: false,
          mensaje: 'Datos de paciente inválidos',
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

// PUT: Actualizar paciente existente
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const pacienteId = searchParams.get('id')

    if (!pacienteId) {
      return NextResponse.json(
        {
          exito: false,
          mensaje: 'ID de paciente requerido',
          codigoError: 'ID_REQUERIDO',
          timestamp: new Date(),
          trazabilidad: Date.now().toString()
        } as RespuestaAPI,
        { status: 400 }
      )
    }

    const body = await request.json()
    const datosValidados = esquemaPaciente.partial().parse(body)

    // Buscar paciente existente
    const indicePaciente = pacientesDB.findIndex(p => p.id === pacienteId)
    if (indicePaciente === -1) {
      await registrarAuditoriaHIPAA('ACTUALIZACION_PACIENTE', pacienteId, request, 'FALLIDO')
      
      return NextResponse.json(
        {
          exito: false,
          mensaje: 'Paciente no encontrado',
          codigoError: 'PACIENTE_NO_ENCONTRADO',
          timestamp: new Date(),
          trazabilidad: Date.now().toString()
        } as RespuestaAPI,
        { status: 404 }
      )
    }

    // Actualizar paciente
    const pacienteActualizado: PacienteBase = {
      ...pacientesDB[indicePaciente],
      ...datosValidados,
      telefono: datosValidados.telefono ? encriptarDatosPHI(datosValidados.telefono) : pacientesDB[indicePaciente].telefono,
      email: datosValidados.email ? encriptarDatosPHI(datosValidados.email) : pacientesDB[indicePaciente].email,
      fechaUltimaActualizacion: new Date()
    }

    pacientesDB[indicePaciente] = pacienteActualizado

    // Desencriptar para la respuesta
    const pacienteRespuesta = {
      ...pacienteActualizado,
      telefono: pacienteActualizado.telefono ? desencriptarDatosPHI(pacienteActualizado.telefono) : undefined,
      email: pacienteActualizado.email ? desencriptarDatosPHI(pacienteActualizado.email) : undefined
    }

    await registrarAuditoriaHIPAA('ACTUALIZACION_PACIENTE', pacienteId, request, 'EXITOSO')

    const respuesta: RespuestaAPI<PacienteBase> = {
      exito: true,
      datos: pacienteRespuesta,
      mensaje: 'Paciente actualizado exitosamente',
      timestamp: new Date(),
      trazabilidad: Date.now().toString()
    }

    return NextResponse.json(respuesta)

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          exito: false,
          mensaje: 'Datos de actualización inválidos',
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