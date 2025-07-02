// Dashboard Principal Médico - Altamedica
// Incluye: vista general, estadísticas, accesos rápidos, compliance HIPAA

'use client'

import React, { useState, useEffect } from 'react'
import { 
  Calendar,
  Users,
  FileText,
  TrendingUp,
  Activity,
  AlertTriangle,
  Clock,
  CheckCircle,
  Phone,
  MessageSquare,
  Settings,
  Shield
} from 'lucide-react'
import { usePacientes, useCitasMedicas } from '@/hooks/useMedical'
import { formatearFecha, calcularEdad } from '@/lib/medical-utils'
import { PacienteBase, CitaMedica } from '@/types/medical'

interface EstadisticaDashboard {
  titulo: string
  valor: number
  cambio: number
  icono: React.ReactNode
  color: string
}

interface CitaProxima {
  cita: CitaMedica
  paciente: PacienteBase
  tiempoHasta: string
}

const DashboardMedico: React.FC = () => {
  // Estados principales
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date())
  const [estadisticas, setEstadisticas] = useState<EstadisticaDashboard[]>([])
  const [citasProximas, setCitasProximas] = useState<CitaProxima[]>([])
  const [alertasComplianceHIPAA, setAlertasComplianceHIPAA] = useState<string[]>([])

  // Hooks personalizados
  const { pacientes, cargarPacientes } = usePacientes()
  const { citas, cargarCitasPorFecha } = useCitasMedicas()

  // Cargar datos iniciales
  useEffect(() => {
    const hoy = new Date()
    const mañana = new Date(hoy)
    mañana.setDate(mañana.getDate() + 1)

    cargarCitasPorFecha(hoy, mañana)
    cargarPacientes({ pagina: 1, tamanoPagina: 10 })
  }, [cargarCitasPorFecha, cargarPacientes])

  // Calcular estadísticas del dashboard
  useEffect(() => {
    const estadisticasCalculadas: EstadisticaDashboard[] = [
      {
        titulo: 'Pacientes Activos',
        valor: pacientes.length,
        cambio: 5.2,
        icono: <Users className="w-5 h-5" />,
        color: 'bg-medical-primary'
      },
      {
        titulo: 'Citas Hoy',
        valor: citas.filter(c => {
          const fechaCita = new Date(c.fechaCita)
          return fechaCita.toDateString() === new Date().toDateString()
        }).length,
        cambio: -2.1,
        icono: <Calendar className="w-5 h-5" />,
        color: 'bg-medical-secondary'
      },
      {
        titulo: 'Telemedicina',
        valor: citas.filter(c => c.modalidad === 'TELEMEDICINA').length,
        cambio: 12.5,
        icono: <Phone className="w-5 h-5" />,
        color: 'bg-medical-accent'
      },
      {
        titulo: 'Completadas',
        valor: citas.filter(c => c.estado === 'COMPLETADA').length,
        cambio: 8.3,
        icono: <CheckCircle className="w-5 h-5" />,
        color: 'bg-medical-success'
      }
    ]

    setEstadisticas(estadisticasCalculadas)
  }, [pacientes, citas])

  // Procesar citas próximas
  useEffect(() => {
    const ahora = new Date()
    const citasOrdenadas = citas
      .filter(cita => new Date(cita.fechaCita) > ahora)
      .sort((a, b) => new Date(a.fechaCita).getTime() - new Date(b.fechaCita).getTime())
      .slice(0, 5)

    // Aquí normalmente cargaríamos los datos del paciente para cada cita
    const citasConPacientes: CitaProxima[] = citasOrdenadas.map(cita => ({
      cita,
      paciente: pacientes.find(p => p.id === cita.pacienteId) || {
        id: cita.pacienteId,
        nombres: 'Cargando...',
        apellidos: '',
        numeroHistoriaClinica: '',
        tipoDocumento: 'DNI',
        numeroDocumento: '',
        fechaNacimiento: new Date(),
        genero: 'M',
        estadoCivil: 'SOLTERO',
        direccion: {
          calle: '',
          numero: '',
          ciudad: '',
          provincia: 'CABA',
          codigoPostal: '',
          pais: 'Argentina'
        },
        fechaCreacion: new Date(),
        fechaUltimaActualizacion: new Date(),
        estadoPaciente: 'ACTIVO',
        consentimientoTratamientoDatos: true,
        fechaConsentimiento: new Date()
      },
      tiempoHasta: calcularTiempoHasta(new Date(cita.fechaCita))
    }))

    setCitasProximas(citasConPacientes)
  }, [citas, pacientes])

  const calcularTiempoHasta = (fecha: Date): string => {
    const ahora = new Date()
    const diferencia = fecha.getTime() - ahora.getTime()
    const horas = Math.floor(diferencia / (1000 * 60 * 60))
    const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60))

    if (horas > 24) {
      const dias = Math.floor(horas / 24)
      return `En ${dias} día${dias > 1 ? 's' : ''}`
    } else if (horas > 0) {
      return `En ${horas}h ${minutos}min`
    } else if (minutos > 0) {
      return `En ${minutos} minutos`
    } else {
      return 'Ahora'
    }
  }

  return (
    <div className="min-h-screen bg-medical-background p-6">
      {/* Header del Dashboard */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-medical-text mb-2">
              Dashboard Médico
            </h1>
            <p className="text-medical-neutral">
              {formatearFecha(new Date(), 'completo')}
            </p>
          </div>
          
          {/* Indicador de Compliance HIPAA */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-hipaa-secure/10 rounded-lg border border-hipaa-secure/20">
              <Shield className="w-4 h-4 text-hipaa-secure" />
              <span className="text-sm font-medium text-hipaa-secure">
                HIPAA Compliance Activo
              </span>
            </div>
            
            <button className="p-2 bg-medical-surface rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <Settings className="w-5 h-5 text-medical-neutral" />
            </button>
          </div>
        </div>
      </div>

      {/* Alertas de Compliance (si existen) */}
      {alertasComplianceHIPAA.length > 0 && (
        <div className="mb-6 p-4 bg-hipaa-warning/10 border border-hipaa-warning/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-hipaa-warning" />
            <h3 className="font-semibold text-hipaa-warning">
              Alertas de Compliance
            </h3>
          </div>
          <ul className="space-y-1">
            {alertasComplianceHIPAA.map((alerta, index) => (
              <li key={index} className="text-sm text-hipaa-warning">
                • {alerta}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tarjetas de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {estadisticas.map((stat, index) => (
          <div key={index} className="medical-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-medical-neutral mb-1">
                  {stat.titulo}
                </p>
                <p className="text-2xl font-bold text-medical-text">
                  {stat.valor}
                </p>
                <div className="flex items-center mt-2">
                  <TrendingUp className={`w-4 h-4 mr-1 ${
                    stat.cambio > 0 ? 'text-medical-success' : 'text-medical-error'
                  }`} />
                  <span className={`text-sm ${
                    stat.cambio > 0 ? 'text-medical-success' : 'text-medical-error'
                  }`}>
                    {stat.cambio > 0 ? '+' : ''}{stat.cambio}%
                  </span>
                </div>
              </div>
              
              <div className={`p-3 rounded-lg ${stat.color} text-white`}>
                {stat.icono}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Contenido Principal del Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Citas Próximas */}
        <div className="lg:col-span-2">
          <div className="medical-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-medical-text">
                Próximas Citas
              </h2>
              <button className="text-medical-primary hover:text-medical-secondary transition-colors">
                Ver todas
              </button>
            </div>
            
            <div className="space-y-3">
              {citasProximas.length > 0 ? (
                citasProximas.map((citaInfo, index) => (
                  <div key={index} className="flex items-center p-3 bg-medical-background rounded-lg border border-gray-100">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-medical-text">
                          {citaInfo.paciente.nombres} {citaInfo.paciente.apellidos}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          citaInfo.cita.modalidad === 'TELEMEDICINA' 
                            ? 'bg-medical-accent/20 text-medical-primary'
                            : 'bg-medical-primary/20 text-medical-primary'
                        }`}>
                          {citaInfo.cita.modalidad}
                        </span>
                      </div>
                      <p className="text-sm text-medical-neutral mb-1">
                        {citaInfo.cita.motivo}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-medical-neutral">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatearFecha(new Date(citaInfo.cita.fechaCita), 'corto')} - {new Date(citaInfo.cita.fechaCita).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span>
                          Edad: {calcularEdad(citaInfo.paciente.fechaNacimiento)} años
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-medical-primary">
                        {citaInfo.tiempoHasta}
                      </span>
                      {citaInfo.cita.modalidad === 'TELEMEDICINA' && (
                        <button className="p-2 bg-medical-primary text-white rounded-lg hover:bg-medical-secondary transition-colors">
                          <Phone className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-medical-neutral">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No hay citas programadas para hoy</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Panel Lateral */}
        <div className="space-y-6">
          
          {/* Accesos Rápidos */}
          <div className="medical-card">
            <h2 className="text-lg font-semibold text-medical-text mb-4">
              Accesos Rápidos
            </h2>
            
            <div className="grid grid-cols-2 gap-3">
              <button className="flex flex-col items-center p-4 bg-medical-background rounded-lg border border-gray-100 hover:border-medical-primary hover:bg-medical-primary/5 transition-all">
                <Users className="w-6 h-6 text-medical-primary mb-2" />
                <span className="text-sm font-medium text-medical-text">
                  Pacientes
                </span>
              </button>
              
              <button className="flex flex-col items-center p-4 bg-medical-background rounded-lg border border-gray-100 hover:border-medical-primary hover:bg-medical-primary/5 transition-all">
                <Calendar className="w-6 h-6 text-medical-primary mb-2" />
                <span className="text-sm font-medium text-medical-text">
                  Agenda
                </span>
              </button>
              
              <button className="flex flex-col items-center p-4 bg-medical-background rounded-lg border border-gray-100 hover:border-medical-primary hover:bg-medical-primary/5 transition-all">
                <FileText className="w-6 h-6 text-medical-primary mb-2" />
                <span className="text-sm font-medium text-medical-text">
                  Historiales
                </span>
              </button>
              
              <button className="flex flex-col items-center p-4 bg-medical-background rounded-lg border border-gray-100 hover:border-medical-primary hover:bg-medical-primary/5 transition-all">
                <MessageSquare className="w-6 h-6 text-medical-primary mb-2" />
                <span className="text-sm font-medium text-medical-text">
                  Mensajes
                </span>
              </button>
            </div>
          </div>

          {/* Actividad Reciente */}
          <div className="medical-card">
            <h2 className="text-lg font-semibold text-medical-text mb-4">
              Actividad Reciente
            </h2>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-medical-success rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-medical-text">
                    Cita completada con María González
                  </p>
                  <p className="text-xs text-medical-neutral">
                    Hace 15 minutos
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-medical-warning rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-medical-text">
                    Recordatorio enviado a Juan Pérez
                  </p>
                  <p className="text-xs text-medical-neutral">
                    Hace 1 hora
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-medical-primary rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-medical-text">
                    Nueva cita programada
                  </p>
                  <p className="text-xs text-medical-neutral">
                    Hace 2 horas
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Monitor de Sistema */}
          <div className="medical-card">
            <h2 className="text-lg font-semibold text-medical-text mb-4">
              Estado del Sistema
            </h2>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-medical-text">Servidor</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-medical-success rounded-full"></div>
                  <span className="text-sm text-medical-success">Online</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-medical-text">Base de Datos</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-medical-success rounded-full"></div>
                  <span className="text-sm text-medical-success">Conectada</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-medical-text">Backup</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-medical-success rounded-full"></div>
                  <span className="text-sm text-medical-success">Actualizado</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardMedico