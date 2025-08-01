export interface PacienteBase {
    id: string;
    numeroHistoriaClinica: string;
    nombres: string;
    apellidos: string;
    tipoDocumento: 'DNI' | 'PASSPORT' | 'CEDULA' | 'LC' | 'LE';
    numeroDocumento: string;
    fechaNacimiento: Date;
    genero: 'M' | 'F' | 'X' | 'NO_ESPECIFICA';
    estadoCivil: 'SOLTERO' | 'CASADO' | 'DIVORCIADO' | 'VIUDO' | 'UNION_LIBRE';
    telefono?: string;
    telefonoSecundario?: string;
    email?: string;
    direccion: DireccionCompleta;
    grupoSanguineo?: GrupoSanguineo;
    factorRh?: '+' | '-';
    alergias?: string[];
    obraSocial?: ObraSocial;
    numeroAfiliado?: string;
    fechaCreacion: Date;
    fechaUltimaActualizacion: Date;
    estadoPaciente: 'ACTIVO' | 'INACTIVO' | 'FALLECIDO' | 'TRANSFERIDO';
    consentimientoTratamientoDatos: boolean;
    fechaConsentimiento: Date;
    revocacionConsentimiento?: Date;
}
export interface DireccionCompleta {
    calle: string;
    numero: string;
    piso?: string;
    departamento?: string;
    ciudad: string;
    provincia: ProvinciaArgentina;
    codigoPostal: string;
    pais: string;
    coordenadas?: {
        latitud: number;
        longitud: number;
    };
}
export type ProvinciaArgentina = 'CABA' | 'BUENOS_AIRES' | 'CATAMARCA' | 'CHACO' | 'CHUBUT' | 'CORDOBA' | 'CORRIENTES' | 'ENTRE_RIOS' | 'FORMOSA' | 'JUJUY' | 'LA_PAMPA' | 'LA_RIOJA' | 'MENDOZA' | 'MISIONES' | 'NEUQUEN' | 'RIO_NEGRO' | 'SALTA' | 'SAN_JUAN' | 'SAN_LUIS' | 'SANTA_CRUZ' | 'SANTA_FE' | 'SANTIAGO_DEL_ESTERO' | 'TIERRA_DEL_FUEGO' | 'TUCUMAN';
export type GrupoSanguineo = 'A' | 'B' | 'AB' | 'O';
export interface ObraSocial {
    id: string;
    nombre: string;
    sigla: string;
    codigoRNOS: string;
    planCobertura: string;
    vigenciaDesde: Date;
    vigenciaHasta?: Date;
}
export interface CitaMedica {
    id: string;
    pacienteId: string;
    medicoId: string;
    fechaCita: Date;
    duracionMinutos: number;
    tipoCita: TipoCita;
    modalidad: 'PRESENCIAL' | 'TELEMEDICINA' | 'DOMICILIO';
    estado: EstadoCita;
    motivo: string;
    observaciones?: string;
    consultorio?: string;
    direccionConsultorio?: string;
    linkVideoconferencia?: string;
    plataformaTelemedicina?: 'ZOOM' | 'MEET' | 'TEAMS' | 'PROPIA';
    recordatorios: Recordatorio[];
    fechaCreacion: Date;
    fechaUltimaModificacion: Date;
    creadoPor: string;
}
export type TipoCita = 'CONSULTA_GENERAL' | 'CONTROL' | 'URGENCIA' | 'ESTUDIO' | 'PROCEDIMIENTO' | 'CIRUGIA' | 'REHABILITACION' | 'VACUNACION';
export type EstadoCita = 'PROGRAMADA' | 'CONFIRMADA' | 'EN_CURSO' | 'COMPLETADA' | 'CANCELADA' | 'NO_ASISTIO' | 'REPROGRAMADA';
export interface Recordatorio {
    tipo: 'SMS' | 'EMAIL' | 'WHATSAPP' | 'LLAMADA';
    tiempoAnticipacion: number;
    enviado: boolean;
    fechaEnvio?: Date;
}
export interface ProfesionalMedico {
    id: string;
    matriculaNacional: string;
    matriculaProvincial: string;
    nombres: string;
    apellidos: string;
    tipoDocumento: 'DNI' | 'PASSPORT';
    numeroDocumento: string;
    especialidades: EspecialidadMedica[];
    titulo: string;
    universidadTitulo: string;
    fechaTitulo: Date;
    telefono: string;
    email: string;
    estadoMatricula: 'ACTIVA' | 'SUSPENDIDA' | 'INHABILITADO';
    fechaIngresoSistema: Date;
    configAgenda: ConfiguracionAgenda;
}
export interface EspecialidadMedica {
    codigo: string;
    nombre: string;
    certificacion?: string;
    fechaCertificacion?: Date;
}
export interface ConfiguracionAgenda {
    duracionCitaDefault: number;
    horariosAtencion: HorarioAtencion[];
    diasLaborales: DiaSemana[];
    pausasAlmuerzo: PausaAlmuerzo[];
    limitePacientesDia: number;
    anticipacionMaximaCita: number;
}
export interface HorarioAtencion {
    diaSemana: DiaSemana;
    horaInicio: string;
    horaFin: string;
}
export interface PausaAlmuerzo {
    diaSemana: DiaSemana;
    horaInicio: string;
    horaFin: string;
}
export type DiaSemana = 'LUNES' | 'MARTES' | 'MIERCOLES' | 'JUEVES' | 'VIERNES' | 'SABADO' | 'DOMINGO';
export interface UsuarioSistema {
    id: string;
    email: string;
    roles: RolSistema[];
    permisos: PermisoSistema[];
    ultimoAcceso: Date;
    sesionActiva: boolean;
    tokensActivos: string[];
    nivelAccesoPHI: NivelAccesoPHI;
    registroAuditoria: RegistroAuditoria[];
}
export type RolSistema = 'ADMIN_SISTEMA' | 'MEDICO' | 'ENFERMERO' | 'RECEPCIONISTA' | 'PACIENTE' | 'AUDITOR';
export type PermisoSistema = 'LEER_PACIENTES' | 'ESCRIBIR_PACIENTES' | 'ELIMINAR_PACIENTES' | 'LEER_CITAS' | 'ESCRIBIR_CITAS' | 'CANCELAR_CITAS' | 'LEER_HISTORIA_CLINICA' | 'ESCRIBIR_HISTORIA_CLINICA' | 'ACCESO_REPORTES' | 'CONFIGURAR_SISTEMA';
export type NivelAccesoPHI = 'COMPLETO' | 'LIMITADO' | 'SOLO_LECTURA' | 'NINGUNO';
export interface RegistroAuditoria {
    timestamp: Date;
    accion: AccionAuditoria;
    recursoAccedido: string;
    ipAddress: string;
    userAgent: string;
    resultado: 'EXITOSO' | 'FALLIDO' | 'BLOQUEADO';
}
export type AccionAuditoria = 'LOGIN' | 'LOGOUT' | 'ACCESO_PACIENTE' | 'MODIFICACION_PACIENTE' | 'CREACION_CITA' | 'CANCELACION_CITA' | 'DESCARGA_REPORTE' | 'CAMBIO_CONFIGURACION';
export interface RespuestaAPI<T = any> {
    exito: boolean;
    datos?: T;
    mensaje: string;
    codigoError?: string;
    timestamp: Date;
    trazabilidad: string;
}
export interface ErrorValidacion {
    campo: string;
    mensaje: string;
    valor?: any;
}
export interface RespuestaValidacion {
    valido: boolean;
    errores: ErrorValidacion[];
}
export interface ParametrosPaginacion {
    pagina: number;
    tamanoPagina: number;
    ordenarPor?: string;
    direccionOrden?: 'ASC' | 'DESC';
}
export interface RespuestaPaginada<T> {
    datos: T[];
    totalElementos: number;
    totalPaginas: number;
    paginaActual: number;
    tamanoPagina: number;
}
//# sourceMappingURL=medical.d.ts.map