// Componente de Gestión de Citas Médicas - Altamedica
// Incluye: calendario inteligente, telemedicina, recordatorios automáticos, compliance

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { 
  Calendar,
  Clock,
  User,
  Phone,
  Video,
  MapPin,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  AlertCircle,
  Bell,
  Filter,
  ChevronLeft,
  ChevronRight,
  Search
} from 'lucide-react'
import { useCitasMedicas, usePacientes } from '@/hooks/useMedical'
import { 
  formatearFecha,
  formatearTelefono,
  esHorarioLaboral,
  obtenerProximaFechaLaboral
} from '@/lib/medical-utils'
import { CitaMedica, PacienteBase, TipoCita, EstadoCita } from '@/types/medical'
import { format, addDays, startOfWeek, endOfWeek, isSameDay, addHours, setHours } from 'date-fns'
import { es } from 'date-fns/locale'

interface NuevaCita {
  pacienteId: string
  fechaCita: Date
  duracionMinutos: number
  tipoCita: TipoCita
  modalidad: 'PRESENCIAL' | 'TELEMEDICINA' | 'DOMICILIO'
  motivo: string
  observaciones?: string
}

interface VistaCalendario {
  fecha: Date
  vista: 'dia' | 'semana' | 'mes'
}

interface FiltrosCitas {
  medico: string
  estado: EstadoCita | ''
  modalidad: 'PRESENCIAL' | 'TELEMEDICINA' | 'DOMICILIO' | ''
  fechaDesde: Date
  fechaHasta: Date
}

const GestionCitas: React.FC = () => {
  // Estados principales
  const [vistaActual, setVistaActual] = useState<'calendario' | 'programar' | 'editar' | 'detalle'>('calendario')
  const [vistasCalendario, setVistasCalendario] = useState<VistaCalendario>({
    fecha: new Date(),
    vista: 'semana'
  })
  const [citaSeleccionada, setCitaSeleccionada] = useState<CitaMedica | null>(null)
  const [mostrarFiltros, setMostrarFiltros] = useState(false)
  const [busquedaPaciente, setBusquedaPaciente] = useState('')

  // Estados para nueva cita
  const [nuevaCita, setNuevaCita] = useState<Partial<NuevaCita>>({
    duracionMinutos: 30,
    modalidad: 'PRESENCIAL',
    tipoCita: 'CONSULTA_GENERAL'
  })
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<PacienteBase | null>(null)
  const [horariosDisponibles, setHorariosDisponibles] = useState<Date[]>([])
  const [guardandoCita, setGuardandoCita] = useState(false)

  // Estados de filtros
  const [filtros, setFiltros] = useState<FiltrosCitas>({
    medico: '',
    estado: '',
    modalidad: '',
    fechaDesde: new Date(),
    fechaHasta: addDays(new Date(), 7)
  })

  // Hooks
  const { citas, cargando, cargarCitasPorFecha, programarCita, cancelarCita, verificarDisponibilidad } = useCitasMedicas()
  const { pacientes, buscarPacientes } = usePacientes()

  // Cargar citas según la vista actual
  useEffect(() => {
    let fechaInicio: Date
    let fechaFin: Date

    switch (vistasCalendario.vista) {
      case 'dia':
        fechaInicio = new Date(vistasCalendario.fecha)
        fechaFin = new Date(vistasCalendario.fecha)
        break
      case 'semana':
        fechaInicio = startOfWeek(vistasCalendario.fecha, { weekStartsOn: 1 })
        fechaFin = endOfWeek(vistasCalendario.fecha, { weekStartsOn: 1 })
        break
      case 'mes':
        fechaInicio = new Date(vistasCalendario.fecha.getFullYear(), vistasCalendario.fecha.getMonth(), 1)
        fechaFin = new Date(vistasCalendario.fecha.getFullYear(), vistasCalendario.fecha.getMonth() + 1, 0)
        break
    }

    cargarCitasPorFecha(fechaInicio, fechaFin)
  }, [vistasCalendario, cargarCitasPorFecha])

  // Buscar pacientes cuando cambia el término de búsqueda
  useEffect(() => {
    if (busquedaPaciente.length >= 2) {
      buscarPacientes({ nombres: busquedaPaciente })
    }
  }, [busquedaPaciente, buscarPacientes])

  // Generar horarios disponibles para nueva cita
  const generarHorariosDisponibles = useCallback(async (fecha: Date) => {
    const horarios: Date[] = []
    const inicioJornada = setHours(fecha, 8) // 8:00 AM
    const finJornada = setHours(fecha, 18) // 6:00 PM

    for (let hora = inicioJornada; hora < finJornada; hora = addHours(hora, 0.5)) {
      if (esHorarioLaboral(hora)) {
        const disponible = await verificarDisponibilidad(
          'medico-actual-id', // Aquí iría el ID del médico actual
          hora,
          nuevaCita.duracionMinutos || 30
        )
        
        if (disponible) {
          horarios.push(new Date(hora))
        }
      }
    }

    setHorariosDisponibles(horarios)
  }, [verificarDisponibilidad, nuevaCita.duracionMinutos])

  // Manejar programación de nueva cita
  const manejarProgramarCita = async () => {
    if (!pacienteSeleccionado || !nuevaCita.fechaCita) {
      return
    }

    setGuardandoCita(true)

    try {
      const datosCompletsCita: Omit<CitaMedica, 'id' | 'fechaCreacion' | 'fechaUltimaModificacion'> = {
        pacienteId: pacienteSeleccionado.id,
        medicoId: 'medico-actual-id', // Aquí iría el ID del médico actual
        fechaCita: nuevaCita.fechaCita,
        duracionMinutos: nuevaCita.duracionMinutos || 30,
        tipoCita: nuevaCita.tipoCita || 'CONSULTA_GENERAL',
        modalidad: nuevaCita.modalidad || 'PRESENCIAL',
        estado: 'PROGRAMADA',
        motivo: nuevaCita.motivo || '',
        observaciones: nuevaCita.observaciones,
        recordatorios: [
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
        ],
        creadoPor: 'usuario-actual-id'
      }

      await programarCita(datosCompletsCita)
      
      // Limpiar formulario y volver al calendario
      setNuevaCita({
        duracionMinutos: 30,
        modalidad: 'PRESENCIAL',
        tipoCita: 'CONSULTA_GENERAL'
      })
      setPacienteSeleccionado(null)
      setVistaActual('calendario')
      
    } catch (error) {
      console.error('Error al programar cita:', error)
    } finally {
      setGuardandoCita(false)
    }
  }

  // Obtener citas por día para el calendario
  const obtenerCitasPorDia = (fecha: Date): CitaMedica[] => {
    return citas.filter(cita => isSameDay(new Date(cita.fechaCita), fecha))
  }

  // Renderizar vista de calendario
  const renderizarCalendario = () => {
    const dias = []
    const inicioSemana = startOfWeek(vistasCalendario.fecha, { weekStartsOn: 1 })

    for (let i = 0; i < 7; i++) {
      const dia = addDays(inicioSemana, i)
      const citasDelDia = obtenerCitasPorDia(dia)
      
      dias.push(
        <div key={i} className="border border-gray-200 min-h-32 p-2">
          <div className="font-semibold text-medical-text mb-2">
            {format(dia, 'EEE dd', { locale: es })}
          </div>
          
          <div className="space-y-1">
            {citasDelDia.map(cita => (
              <div
                key={cita.id}
                onClick={() => {
                  setCitaSeleccionada(cita)
                  setVistaActual('detalle')
                }}
                className={`text-xs p-2 rounded cursor-pointer ${
                  cita.modalidad === 'TELEMEDICINA'
                    ? 'bg-medical-accent/20 text-medical-primary border-l-2 border-medical-accent'
                    : 'bg-medical-primary/20 text-medical-primary border-l-2 border-medical-primary'
                }`}
              >
                <div className="font-medium">
                  {format(new Date(cita.fechaCita), 'HH:mm')}
                </div>
                <div className="truncate">
                  {/* Aquí iría el nombre del paciente */}
                  Paciente: {cita.pacienteId.slice(-6)}
                </div>
                <div className="flex items-center gap-1">
                  {cita.modalidad === 'TELEMEDICINA' && <Video className="w-3 h-3" />}
                  {cita.modalidad === 'PRESENCIAL' && <MapPin className="w-3 h-3" />}
                  {cita.modalidad === 'DOMICILIO' && <User className="w-3 h-3" />}
                  <span>{cita.tipoCita.replace('_', ' ')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        {/* Cabecera del calendario */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-medical-text">
              Agenda Médica
            </h1>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setVistasCalendario(prev => ({
                  ...prev,
                  fecha: addDays(prev.fecha, -7)
                }))}
                className="p-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <span className="px-4 py-2 font-medium text-medical-text">
                {format(vistasCalendario.fecha, 'MMMM yyyy', { locale: es })}
              </span>
              
              <button
                onClick={() => setVistasCalendario(prev => ({
                  ...prev,
                  fecha: addDays(prev.fecha, 7)
                }))}
                className="p-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => setVistasCalendario(prev => ({
                  ...prev,
                  fecha: new Date()
                }))}
                className="px-4 py-2 bg-medical-background border border-gray-300 rounded hover:bg-gray-50"
              >
                Hoy
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className={`p-2 border rounded ${
                mostrarFiltros 
                  ? 'bg-medical-primary text-white border-medical-primary'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => setVistaActual('programar')}
              className="flex items-center gap-2 px-4 py-2 bg-medical-primary text-white rounded hover:bg-medical-secondary transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nueva Cita
            </button>
          </div>
        </div>

        {/* Filtros */}
        {mostrarFiltros && (
          <div className="medical-card">
            <h3 className="text-lg font-semibold text-medical-text mb-4">Filtros</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <select
                value={filtros.estado}
                onChange={(e) => setFiltros(prev => ({ ...prev, estado: e.target.value as EstadoCita | '' }))}
                className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-medical-primary"
              >
                <option value="">Todos los estados</option>
                <option value="PROGRAMADA">Programada</option>
                <option value="CONFIRMADA">Confirmada</option>
                <option value="EN_CURSO">En curso</option>
                <option value="COMPLETADA">Completada</option>
                <option value="CANCELADA">Cancelada</option>
                <option value="NO_ASISTIO">No asistió</option>
              </select>
              
              <select
                value={filtros.modalidad}
                onChange={(e) => setFiltros(prev => ({ ...prev, modalidad: e.target.value as any }))}
                className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-medical-primary"
              >
                <option value="">Todas las modalidades</option>
                <option value="PRESENCIAL">Presencial</option>
                <option value="TELEMEDICINA">Telemedicina</option>
                <option value="DOMICILIO">Domicilio</option>
              </select>
              
              <input
                type="date"
                value={format(filtros.fechaDesde, 'yyyy-MM-dd')}
                onChange={(e) => setFiltros(prev => ({ ...prev, fechaDesde: new Date(e.target.value) }))}
                className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-medical-primary"
              />
              
              <input
                type="date"
                value={format(filtros.fechaHasta, 'yyyy-MM-dd')}
                onChange={(e) => setFiltros(prev => ({ ...prev, fechaHasta: new Date(e.target.value) }))}
                className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-medical-primary"
              />
            </div>
          </div>
        )}

        {/* Vista de calendario semanal */}
        <div className="medical-card">
          <div className="grid grid-cols-7 gap-0 border border-gray-200 rounded-lg overflow-hidden">
            {/* Cabeceras de días */}
            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(dia => (
              <div key={dia} className="bg-medical-background p-3 border-b border-gray-200 font-semibold text-center text-medical-text">
                {dia}
              </div>
            ))}
            
            {/* Días del calendario */}
            {dias}
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="medical-card">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-medical-primary/20 rounded">
                <Calendar className="w-5 h-5 text-medical-primary" />
              </div>
              <div>
                <p className="text-sm text-medical-neutral">Total Citas Hoy</p>
                <p className="text-2xl font-bold text-medical-text">
                  {obtenerCitasPorDia(new Date()).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="medical-card">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-medical-accent/20 rounded">
                <Video className="w-5 h-5 text-medical-primary" />
              </div>
              <div>
                <p className="text-sm text-medical-neutral">Telemedicina</p>
                <p className="text-2xl font-bold text-medical-text">
                  {citas.filter(c => c.modalidad === 'TELEMEDICINA').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="medical-card">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-medical-success/20 rounded">
                <Check className="w-5 h-5 text-medical-success" />
              </div>
              <div>
                <p className="text-sm text-medical-neutral">Completadas</p>
                <p className="text-2xl font-bold text-medical-text">
                  {citas.filter(c => c.estado === 'COMPLETADA').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="medical-card">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-medical-warning/20 rounded">
                <Bell className="w-5 h-5 text-medical-warning" />
              </div>
              <div>
                <p className="text-sm text-medical-neutral">Pendientes</p>
                <p className="text-2xl font-bold text-medical-text">
                  {citas.filter(c => c.estado === 'PROGRAMADA').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Renderizar formulario de nueva cita
  const renderizarFormularioNuevaCita = () => (
    <div className="max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => setVistaActual('calendario')}
          className="p-2 border border-gray-300 rounded hover:bg-gray-50"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-bold text-medical-text">
          Programar Nueva Cita
        </h2>
      </div>

      <div className="space-y-6">
        {/* Búsqueda y selección de paciente */}
        <div className="medical-card">
          <h3 className="text-lg font-semibold text-medical-text mb-4">Seleccionar Paciente</h3>
          
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-medical-neutral w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar paciente por nombre o DNI..."
              value={busquedaPaciente}
              onChange={(e) => setBusquedaPaciente(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-primary focus:border-medical-primary"
            />
          </div>

          {pacienteSeleccionado ? (
            <div className="p-4 bg-medical-success/10 border border-medical-success/20 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-medical-text">
                    {pacienteSeleccionado.nombres} {pacienteSeleccionado.apellidos}
                  </p>
                  <p className="text-sm text-medical-neutral">
                    {pacienteSeleccionado.tipoDocumento}: {pacienteSeleccionado.numeroDocumento}
                  </p>
                </div>
                <button
                  onClick={() => setPacienteSeleccionado(null)}
                  className="p-1 text-medical-error hover:bg-medical-error/10 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="max-h-40 overflow-y-auto space-y-2">
              {pacientes.map(paciente => (
                <div
                  key={paciente.id}
                  onClick={() => setPacienteSeleccionado(paciente)}
                  className="p-3 border border-gray-200 rounded-lg hover:bg-medical-background cursor-pointer transition-colors"
                >
                  <p className="font-medium text-medical-text">
                    {paciente.nombres} {paciente.apellidos}
                  </p>
                  <p className="text-sm text-medical-neutral">
                    {paciente.tipoDocumento}: {paciente.numeroDocumento} - HC: {paciente.numeroHistoriaClinica}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detalles de la cita */}
        {pacienteSeleccionado && (
          <div className="medical-card">
            <h3 className="text-lg font-semibold text-medical-text mb-4">Detalles de la Cita</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-medical-text mb-1">
                  Fecha <span className="text-medical-error">*</span>
                </label>
                <input
                  type="date"
                  value={nuevaCita.fechaCita ? format(nuevaCita.fechaCita, 'yyyy-MM-dd') : ''}
                  onChange={(e) => {
                    const fecha = new Date(e.target.value)
                    setNuevaCita(prev => ({ ...prev, fechaCita: fecha }))
                    generarHorariosDisponibles(fecha)
                  }}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-primary focus:border-medical-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-medical-text mb-1">
                  Hora <span className="text-medical-error">*</span>
                </label>
                <select
                  value={nuevaCita.fechaCita ? format(nuevaCita.fechaCita, 'HH:mm') : ''}
                  onChange={(e) => {
                    if (nuevaCita.fechaCita && e.target.value) {
                      const [hora, minuto] = e.target.value.split(':')
                      const fechaConHora = new Date(nuevaCita.fechaCita)
                      fechaConHora.setHours(parseInt(hora), parseInt(minuto))
                      setNuevaCita(prev => ({ ...prev, fechaCita: fechaConHora }))
                    }
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-primary focus:border-medical-primary"
                >
                  <option value="">Seleccionar hora</option>
                  {horariosDisponibles.map(horario => (
                    <option key={horario.toString()} value={format(horario, 'HH:mm')}>
                      {format(horario, 'HH:mm')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-medical-text mb-1">
                  Duración (minutos)
                </label>
                <select
                  value={nuevaCita.duracionMinutos}
                  onChange={(e) => setNuevaCita(prev => ({ ...prev, duracionMinutos: parseInt(e.target.value) }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-primary focus:border-medical-primary"
                >
                  <option value={15}>15 minutos</option>
                  <option value={30}>30 minutos</option>
                  <option value={45}>45 minutos</option>
                  <option value={60}>60 minutos</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-medical-text mb-1">
                  Modalidad
                </label>
                <select
                  value={nuevaCita.modalidad}
                  onChange={(e) => setNuevaCita(prev => ({ ...prev, modalidad: e.target.value as any }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-primary focus:border-medical-primary"
                >
                  <option value="PRESENCIAL">Presencial</option>
                  <option value="TELEMEDICINA">Telemedicina</option>
                  <option value="DOMICILIO">Domicilio</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-medical-text mb-1">
                  Tipo de Cita
                </label>
                <select
                  value={nuevaCita.tipoCita}
                  onChange={(e) => setNuevaCita(prev => ({ ...prev, tipoCita: e.target.value as TipoCita }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-primary focus:border-medical-primary"
                >
                  <option value="CONSULTA_GENERAL">Consulta General</option>
                  <option value="CONTROL">Control</option>
                  <option value="URGENCIA">Urgencia</option>
                  <option value="ESTUDIO">Estudio</option>
                  <option value="PROCEDIMIENTO">Procedimiento</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-medical-text mb-1">
                  Motivo de la Consulta <span className="text-medical-error">*</span>
                </label>
                <textarea
                  value={nuevaCita.motivo || ''}
                  onChange={(e) => setNuevaCita(prev => ({ ...prev, motivo: e.target.value }))}
                  placeholder="Describa el motivo de la consulta..."
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-primary focus:border-medical-primary"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-medical-text mb-1">
                  Observaciones
                </label>
                <textarea
                  value={nuevaCita.observaciones || ''}
                  onChange={(e) => setNuevaCita(prev => ({ ...prev, observaciones: e.target.value }))}
                  placeholder="Observaciones adicionales (opcional)..."
                  rows={2}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-primary focus:border-medical-primary"
                />
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setVistaActual('calendario')}
                className="px-6 py-2 border border-gray-300 text-medical-text rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              
              <button
                onClick={manejarProgramarCita}
                disabled={!nuevaCita.fechaCita || !nuevaCita.motivo || guardandoCita}
                className="flex items-center gap-2 px-6 py-2 bg-medical-primary text-white rounded-lg hover:bg-medical-secondary transition-colors disabled:opacity-50"
              >
                {guardandoCita ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Programando...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Programar Cita
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  // Renderizar vista principal
  return (
    <div className="min-h-screen bg-medical-background p-6">
      <div className="max-w-7xl mx-auto">
        {vistaActual === 'calendario' && renderizarCalendario()}
        {vistaActual === 'programar' && renderizarFormularioNuevaCita()}
        {/* Otras vistas se implementarían aquí */}
      </div>
    </div>
  )
}

export default GestionCitas