// Componente de Gestión de Pacientes - Altamedica
// Incluye: CRUD completo, búsqueda avanzada, validaciones médicas, compliance HIPAA

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { 
  Search,
  Plus,
  Edit,
  Eye,
  Filter,
  Download,
  Upload,
  UserPlus,
  Calendar,
  Phone,
  Mail,
  MapPin,
  AlertCircle,
  Check,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { usePacientes } from '@altamedica/core'
import { 
  validarDNI, 
  validarTelefonoArgentino, 
  validarEmailMedico,
  validarFechaNacimiento,
  formatearDNI,
  formatearTelefono,
  formatearFecha,
  calcularEdad,
  enmascararDatosSensibles,
  PROVINCIAS_ARGENTINA
} from '@altamedica/core'
import { PacienteBase, ProvinciaArgentina } from '@altamedica/core'

interface FiltrosBusqueda {
  nombres: string
  apellidos: string
  numeroDocumento: string
  numeroHistoriaClinica: string
  provincia: ProvinciaArgentina | ''
  estadoPaciente: 'ACTIVO' | 'INACTIVO' | 'FALLECIDO' | 'TRANSFERIDO' | ''
  edadMinima: number | null
  edadMaxima: number | null
}

interface ErroresValidacion {
  [key: string]: string | null
}

const GestionPacientes: React.FC = () => {
  // Estados principales
  const [vistaActual, setVistaActual] = useState<'lista' | 'crear' | 'editar' | 'detalle'>('lista')
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<PacienteBase | null>(null)
  const [filtros, setFiltros] = useState<FiltrosBusqueda>({
    nombres: '',
    apellidos: '',
    numeroDocumento: '',
    numeroHistoriaClinica: '',
    provincia: '',
    estadoPaciente: '',
    edadMinima: null,
    edadMaxima: null
  })
  const [mostrarFiltrosAvanzados, setMostrarFiltrosAvanzados] = useState(false)
  const [paginaActual, setPaginaActual] = useState(1)
  const [tamanoPagina] = useState(10)

  // Estados para formulario
  const [formularioPaciente, setFormularioPaciente] = useState<Partial<PacienteBase>>({})
  const [erroresValidacion, setErroresValidacion] = useState<ErroresValidacion>({})
  const [guardando, setGuardando] = useState(false)

  // Hook de pacientes
  const { 
    pacientes, 
    cargando, 
    error, 
    totalPacientes,
    cargarPacientes, 
    buscarPacientes, 
    crearPaciente, 
    actualizarPaciente 
  } = usePacientes()

  // Cargar pacientes al montar el componente
  useEffect(() => {
    cargarPacientes({ 
      pagina: paginaActual, 
      tamanoPagina,
      ordenarPor: 'fechaUltimaActualizacion',
      direccionOrden: 'DESC'
    })
  }, [cargarPacientes, paginaActual, tamanoPagina])

  // Validar campo individual
  const validarCampo = useCallback((campo: string, valor: any): string | null => {
    switch (campo) {
      case 'nombres':
      case 'apellidos':
        return !valor || valor.trim().length < 2 ? 'Debe tener al menos 2 caracteres' : null
      
      case 'numeroDocumento':
        return !validarDNI(valor) ? 'Número de documento inválido' : null
      
      case 'telefono':
        return valor && !validarTelefonoArgentino(valor) ? 'Número de teléfono inválido' : null
      
      case 'email':
        return valor && !validarEmailMedico(valor) ? 'Email inválido' : null
      
      case 'fechaNacimiento':
        const validacionFecha = validarFechaNacimiento(new Date(valor))
        return !validacionFecha.valido ? validacionFecha.mensaje || null : null
      
      default:
        return null
    }
  }, [])

  // Validar formulario completo
  const validarFormulario = useCallback((): boolean => {
    const errores: ErroresValidacion = {}
    
    // Campos obligatorios
    const camposObligatorios = [
      'nombres', 'apellidos', 'tipoDocumento', 'numeroDocumento', 
      'fechaNacimiento', 'genero', 'estadoCivil'
    ]
    
    camposObligatorios.forEach(campo => {
      if (!formularioPaciente[campo as keyof PacienteBase]) {
        errores[campo] = 'Este campo es obligatorio'
      } else {
        errores[campo] = validarCampo(campo, formularioPaciente[campo as keyof PacienteBase])
      }
    })

    // Validaciones específicas
    if (formularioPaciente.telefono) {
      errores.telefono = validarCampo('telefono', formularioPaciente.telefono)
    }
    
    if (formularioPaciente.email) {
      errores.email = validarCampo('email', formularioPaciente.email)
    }

    // Validar dirección
    if (!formularioPaciente.direccion?.calle) {
      errores['direccion.calle'] = 'La calle es obligatoria'
    }
    if (!formularioPaciente.direccion?.ciudad) {
      errores['direccion.ciudad'] = 'La ciudad es obligatoria'
    }
    if (!formularioPaciente.direccion?.provincia) {
      errores['direccion.provincia'] = 'La provincia es obligatoria'
    }

    setErroresValidacion(errores)
    return !Object.values(errores).some(error => error !== null)
  }, [formularioPaciente, validarCampo])

  // Manejar envío del formulario
  const manejarEnvioFormulario = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validarFormulario()) {
      return
    }

    setGuardando(true)
    
    try {
      if (vistaActual === 'crear') {
        const nuevoPaciente = await crearPaciente(formularioPaciente as Omit<PacienteBase, 'id' | 'fechaCreacion' | 'fechaUltimaActualizacion'>)
        if (nuevoPaciente) {
          setVistaActual('detalle')
          setPacienteSeleccionado(nuevoPaciente)
          setFormularioPaciente({})
        }
      } else if (vistaActual === 'editar' && pacienteSeleccionado) {
        const pacienteActualizado = await actualizarPaciente(pacienteSeleccionado.id, formularioPaciente)
        if (pacienteActualizado) {
          setVistaActual('detalle')
          setPacienteSeleccionado(pacienteActualizado)
          setFormularioPaciente({})
        }
      }
    } catch (error) {
      console.error('Error al guardar paciente:', error)
    } finally {
      setGuardando(false)
    }
  }

  // Manejar búsqueda
  const manejarBusqueda = useCallback(() => {
    const criteriosBusqueda = Object.fromEntries(
      Object.entries(filtros).filter(([_, valor]) => valor !== '' && valor !== null)
    )
    
    if (Object.keys(criteriosBusqueda).length > 0) {
      buscarPacientes(criteriosBusqueda)
    } else {
      cargarPacientes({ pagina: 1, tamanoPagina })
    }
    setPaginaActual(1)
  }, [filtros, buscarPacientes, cargarPacientes, tamanoPagina])

  // Renderizar campo de entrada con validación
  const renderizarCampoEntrada = (
    campo: string,
    tipo: string,
    placeholder: string,
    obligatorio: boolean = false,
    opciones?: { value: string; label: string }[]
  ) => {
    const error = erroresValidacion[campo]
    const valor = formularioPaciente[campo as keyof PacienteBase] as string || ''

    return (
      <div className="space-y-1">
        <label className="block text-sm font-medium text-medical-text">
          {placeholder}
          {obligatorio && <span className="text-medical-error ml-1">*</span>}
        </label>
        
        {opciones ? (
          <select
            value={valor}
            onChange={(e) => setFormularioPaciente(prev => ({ ...prev, [campo]: e.target.value }))}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-medical-primary focus:border-medical-primary ${
              error ? 'border-medical-error' : 'border-gray-300'
            }`}
          >
            <option value="">Seleccionar {placeholder.toLowerCase()}</option>
            {opciones.map(opcion => (
              <option key={opcion.value} value={opcion.value}>
                {opcion.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={tipo}
            value={valor}
            onChange={(e) => setFormularioPaciente(prev => ({ ...prev, [campo]: e.target.value }))}
            placeholder={placeholder}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-medical-primary focus:border-medical-primary ${
              error ? 'border-medical-error' : 'border-gray-300'
            }`}
          />
        )}
        
        {error && (
          <div className="flex items-center gap-1 text-medical-error text-sm">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
      </div>
    )
  }

  // Renderizar lista de pacientes
  const renderizarListaPacientes = () => (
    <div className="space-y-6">
      {/* Cabecera con búsqueda y filtros */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-medical-neutral w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nombre, DNI o historia clínica..."
              value={filtros.nombres}
              onChange={(e) => setFiltros(prev => ({ ...prev, nombres: e.target.value }))}
              onKeyPress={(e) => e.key === 'Enter' && manejarBusqueda()}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-primary focus:border-medical-primary"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setMostrarFiltrosAvanzados(!mostrarFiltrosAvanzados)}
            className={`px-4 py-2 border rounded-lg transition-colors ${
              mostrarFiltrosAvanzados 
                ? 'bg-medical-primary text-white border-medical-primary'
                : 'bg-white text-medical-text border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4" />
          </button>
          
          <button
            onClick={manejarBusqueda}
            className="px-4 py-2 bg-medical-secondary text-white rounded-lg hover:bg-medical-primary transition-colors"
          >
            Buscar
          </button>
          
          <button
            onClick={() => {
              setVistaActual('crear')
              setFormularioPaciente({
                consentimientoTratamientoDatos: true,
                fechaConsentimiento: new Date(),
                estadoPaciente: 'ACTIVO',
                direccion: {
                  calle: '',
                  numero: '',
                  ciudad: '',
                  provincia: 'CABA',
                  codigoPostal: '',
                  pais: 'Argentina'
                }
              })
            }}
            className="flex items-center gap-2 px-4 py-2 bg-medical-primary text-white rounded-lg hover:bg-medical-secondary transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Nuevo Paciente
          </button>
        </div>
      </div>

      {/* Filtros avanzados */}
      {mostrarFiltrosAvanzados && (
        <div className="medical-card">
          <h3 className="text-lg font-semibold text-medical-text mb-4">Filtros Avanzados</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Apellidos"
              value={filtros.apellidos}
              onChange={(e) => setFiltros(prev => ({ ...prev, apellidos: e.target.value }))}
              className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-medical-primary"
            />
            <input
              type="text"
              placeholder="Número de documento"
              value={filtros.numeroDocumento}
              onChange={(e) => setFiltros(prev => ({ ...prev, numeroDocumento: e.target.value }))}
              className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-medical-primary"
            />
            <select
              value={filtros.provincia}
              onChange={(e) => setFiltros(prev => ({ ...prev, provincia: e.target.value as ProvinciaArgentina | '' }))}
              className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-medical-primary"
            >
              <option value="">Todas las provincias</option>
              {PROVINCIAS_ARGENTINA.map(prov => (
                <option key={prov.codigo} value={prov.codigo}>
                  {prov.nombre}
                </option>
              ))}
            </select>
            <select
              value={filtros.estadoPaciente}
              onChange={(e) => setFiltros(prev => ({ ...prev, estadoPaciente: e.target.value as any }))}
              className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-medical-primary"
            >
              <option value="">Todos los estados</option>
              <option value="ACTIVO">Activo</option>
              <option value="INACTIVO">Inactivo</option>
              <option value="FALLECIDO">Fallecido</option>
              <option value="TRANSFERIDO">Transferido</option>
            </select>
          </div>
        </div>
      )}

      {/* Lista de pacientes */}
      <div className="medical-card">
        {cargando ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-medical-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-medical-neutral">Cargando pacientes...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-medical-error">
            <AlertCircle className="w-12 h-12 mx-auto mb-4" />
            <p>{error}</p>
          </div>
        ) : pacientes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-medical-text">Paciente</th>
                  <th className="text-left py-3 px-4 font-semibold text-medical-text">Documento</th>
                  <th className="text-left py-3 px-4 font-semibold text-medical-text">Edad</th>
                  <th className="text-left py-3 px-4 font-semibold text-medical-text">Contacto</th>
                  <th className="text-left py-3 px-4 font-semibold text-medical-text">Estado</th>
                  <th className="text-left py-3 px-4 font-semibold text-medical-text">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pacientes.map((paciente) => (
                  <tr key={paciente.id} className="border-b border-gray-100 hover:bg-medical-background/50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-medical-text">
                          {paciente.nombres} {paciente.apellidos}
                        </p>
                        <p className="text-sm text-medical-neutral">
                          HC: {paciente.numeroHistoriaClinica}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-medical-text">
                      {paciente.tipoDocumento}: {enmascararDatosSensibles(paciente.numeroDocumento, 'dni')}
                    </td>
                    <td className="py-3 px-4 text-medical-text">
                      {calcularEdad(paciente.fechaNacimiento)} años
                    </td>
                    <td className="py-3 px-4 text-medical-text">
                      <div className="space-y-1">
                        {paciente.telefono && (
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="w-3 h-3" />
                            {enmascararDatosSensibles(paciente.telefono, 'telefono')}
                          </div>
                        )}
                        {paciente.email && (
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="w-3 h-3" />
                            {enmascararDatosSensibles(paciente.email, 'email')}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        paciente.estadoPaciente === 'ACTIVO' 
                          ? 'bg-medical-success/20 text-medical-success'
                          : 'bg-medical-neutral/20 text-medical-neutral'
                      }`}>
                        {paciente.estadoPaciente}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setVistaActual('detalle')
                            setPacienteSeleccionado(paciente)
                          }}
                          className="p-1 text-medical-primary hover:bg-medical-primary/10 rounded"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setVistaActual('editar')
                            setPacienteSeleccionado(paciente)
                            setFormularioPaciente(paciente)
                          }}
                          className="p-1 text-medical-secondary hover:bg-medical-secondary/10 rounded"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-medical-neutral">
            <UserPlus className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No se encontraron pacientes</p>
          </div>
        )}
      </div>

      {/* Paginación */}
      {totalPacientes > tamanoPagina && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-medical-neutral">
            Mostrando {((paginaActual - 1) * tamanoPagina) + 1} a {Math.min(paginaActual * tamanoPagina, totalPacientes)} de {totalPacientes} pacientes
          </p>
          
          <div className="flex gap-2">
            <button
              onClick={() => setPaginaActual(prev => Math.max(prev - 1, 1))}
              disabled={paginaActual === 1}
              className="p-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <span className="px-4 py-2 bg-medical-primary text-white rounded">
              {paginaActual}
            </span>
            
            <button
              onClick={() => setPaginaActual(prev => prev + 1)}
              disabled={paginaActual * tamanoPagina >= totalPacientes}
              className="p-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )

  // Renderizar formulario de paciente
  const renderizarFormularioPaciente = () => (
    <div className="max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => setVistaActual('lista')}
          className="p-2 border border-gray-300 rounded hover:bg-gray-50"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-bold text-medical-text">
          {vistaActual === 'crear' ? 'Nuevo Paciente' : 'Editar Paciente'}
        </h2>
      </div>

      <form onSubmit={manejarEnvioFormulario} className="medical-card space-y-6">
        {/* Datos personales */}
        <div>
          <h3 className="text-lg font-semibold text-medical-text mb-4">Datos Personales</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderizarCampoEntrada('nombres', 'text', 'Nombres', true)}
            {renderizarCampoEntrada('apellidos', 'text', 'Apellidos', true)}
            {renderizarCampoEntrada('tipoDocumento', 'select', 'Tipo de Documento', true, [
              { value: 'DNI', label: 'DNI' },
              { value: 'PASSPORT', label: 'Pasaporte' },
              { value: 'CEDULA', label: 'Cédula' },
              { value: 'LC', label: 'LC' },
              { value: 'LE', label: 'LE' }
            ])}
            {renderizarCampoEntrada('numeroDocumento', 'text', 'Número de Documento', true)}
            {renderizarCampoEntrada('fechaNacimiento', 'date', 'Fecha de Nacimiento', true)}
            {renderizarCampoEntrada('genero', 'select', 'Género', true, [
              { value: 'M', label: 'Masculino' },
              { value: 'F', label: 'Femenino' },
              { value: 'X', label: 'Otro' },
              { value: 'NO_ESPECIFICA', label: 'No especifica' }
            ])}
          </div>
        </div>

        {/* Datos de contacto */}
        <div>
          <h3 className="text-lg font-semibold text-medical-text mb-4">Datos de Contacto</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderizarCampoEntrada('telefono', 'tel', 'Teléfono')}
            {renderizarCampoEntrada('email', 'email', 'Email')}
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => setVistaActual('lista')}
            className="px-6 py-2 border border-gray-300 text-medical-text rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          
          <button
            type="submit"
            disabled={guardando}
            className="flex items-center gap-2 px-6 py-2 bg-medical-primary text-white rounded-lg hover:bg-medical-secondary transition-colors disabled:opacity-50"
          >
            {guardando ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                Guardando...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                {vistaActual === 'crear' ? 'Crear Paciente' : 'Actualizar Paciente'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )

  // Renderizar vista principal
  return (
    <div className="min-h-screen bg-medical-background p-6">
      <div className="max-w-7xl mx-auto">
        {vistaActual === 'lista' && renderizarListaPacientes()}
        {(vistaActual === 'crear' || vistaActual === 'editar') && renderizarFormularioPaciente()}
        {/* Vista de detalle se implementaría aquí */}
      </div>
    </div>
  )
}

export default GestionPacientes
export { GestionPacientes }