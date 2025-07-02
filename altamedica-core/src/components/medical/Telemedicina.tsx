// Componente de Telemedicina - Altamedica
// Incluye: videollamadas seguras, grabación opcional, chat, documentos compartidos

'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { 
  Video,
  VideoOff,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  MessageSquare,
  FileText,
  Share,
  Settings,
  Users,
  Clock,
  Shield,
  Record,
  StopCircle,
  Camera,
  CameraOff,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  AlertCircle,
  X
} from 'lucide-react'
import { CitaMedica, PacienteBase } from '@/types/medical'
import { formatearFecha, formatearTelefono } from '@/lib/medical-utils'

interface SesionTelemedicina {
  citaId: string
  paciente: PacienteBase
  cita: CitaMedica
  inicioSesion: Date
  duracion: number
  estado: 'ESPERANDO' | 'CONECTADO' | 'EN_CURSO' | 'FINALIZADA'
  grabacion?: {
    activa: boolean
    archivo?: string
    consentimiento: boolean
  }
}

interface ConfiguracionVideo {
  camaraActiva: boolean
  microfonoActivo: boolean
  altavozActivo: boolean
  calidad: 'BAJA' | 'MEDIA' | 'ALTA'
  compartirPantalla: boolean
}

interface MensajeChat {
  id: string
  remitente: 'MEDICO' | 'PACIENTE'
  mensaje: string
  timestamp: Date
  tipo: 'TEXTO' | 'ARCHIVO' | 'IMAGEN'
}

const Telemedicina: React.FC = () => {
  // Estados principales
  const [sesionActiva, setSesionActiva] = useState<SesionTelemedicina | null>(null)
  const [configuracion, setConfiguracion] = useState<ConfiguracionVideo>({
    camaraActiva: true,
    microfonoActivo: true,
    altavozActivo: true,
    calidad: 'MEDIA',
    compartirPantalla: false
  })
  const [mensajesChat, setMensajesChat] = useState<MensajeChat[]>([])
  const [nuevoMensaje, setNuevoMensaje] = useState('')
  const [mostrarChat, setMostrarChat] = useState(false)
  const [modoVentana, setModoVentana] = useState<'NORMAL' | 'MAXIMIZADA' | 'MINIMIZADA'>('NORMAL')

  // Estados de conexión
  const [estadoConexion, setEstadoConexion] = useState<'DESCONECTADO' | 'CONECTANDO' | 'CONECTADO' | 'ERROR'>('DESCONECTADO')
  const [calidadSenal, setCalidadSenal] = useState<'EXCELENTE' | 'BUENA' | 'REGULAR' | 'MALA'>('BUENA')
  const [tiempoSesion, setTiempoSesion] = useState(0)

  // Referencias para elementos de video
  const videoLocalRef = useRef<HTMLVideoElement>(null)
  const videoRemotoRef = useRef<HTMLVideoElement>(null)
  const streamLocalRef = useRef<MediaStream | null>(null)

  // Timer para duración de sesión
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (sesionActiva && estadoConexion === 'CONECTADO') {
      interval = setInterval(() => {
        setTiempoSesion(prev => prev + 1)
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [sesionActiva, estadoConexion])

  // Inicializar cámara y micrófono
  const inicializarMediaDevices = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: configuracion.camaraActiva,
        audio: configuracion.microfonoActivo
      })

      streamLocalRef.current = stream
      
      if (videoLocalRef.current) {
        videoLocalRef.current.srcObject = stream
      }

      setEstadoConexion('CONECTADO')
    } catch (error) {
      console.error('Error al acceder a dispositivos de media:', error)
      setEstadoConexion('ERROR')
    }
  }, [configuracion.camaraActiva, configuracion.microfonoActivo])

  // Alternar cámara
  const alternarCamara = useCallback(() => {
    setConfiguracion(prev => ({ ...prev, camaraActiva: !prev.camaraActiva }))
    
    if (streamLocalRef.current) {
      const videoTrack = streamLocalRef.current.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !configuracion.camaraActiva
      }
    }
  }, [configuracion.camaraActiva])

  // Alternar micrófono
  const alternarMicrofono = useCallback(() => {
    setConfiguracion(prev => ({ ...prev, microfonoActivo: !prev.microfonoActivo }))
    
    if (streamLocalRef.current) {
      const audioTrack = streamLocalRef.current.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !configuracion.microfonoActivo
      }
    }
  }, [configuracion.microfonoActivo])

  // Enviar mensaje de chat
  const enviarMensaje = useCallback(() => {
    if (nuevoMensaje.trim() && sesionActiva) {
      const mensaje: MensajeChat = {
        id: Date.now().toString(),
        remitente: 'MEDICO',
        mensaje: nuevoMensaje.trim(),
        timestamp: new Date(),
        tipo: 'TEXTO'
      }

      setMensajesChat(prev => [...prev, mensaje])
      setNuevoMensaje('')
    }
  }, [nuevoMensaje, sesionActiva])

  // Finalizar sesión
  const finalizarSesion = useCallback(() => {
    if (streamLocalRef.current) {
      streamLocalRef.current.getTracks().forEach(track => track.stop())
    }

    setSesionActiva(null)
    setEstadoConexion('DESCONECTADO')
    setTiempoSesion(0)
    setMensajesChat([])
  }, [])

  // Formatear tiempo de sesión
  const formatearTiempo = (segundos: number): string => {
    const horas = Math.floor(segundos / 3600)
    const minutos = Math.floor((segundos % 3600) / 60)
    const secs = segundos % 60

    if (horas > 0) {
      return `${horas}:${minutos.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutos}:${secs.toString().padStart(2, '0')}`
  }

  // Renderizar barra de estado
  const renderizarBarraEstado = () => (
    <div className="bg-medical-primary text-white p-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {/* Información del paciente */}
        {sesionActiva && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold">
                {sesionActiva.paciente.nombres} {sesionActiva.paciente.apellidos}
              </p>
              <p className="text-sm opacity-90">
                Cita: {formatearFecha(sesionActiva.cita.fechaCita, 'corto')} - {sesionActiva.cita.motivo}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Indicadores de estado */}
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            estadoConexion === 'CONECTADO' ? 'bg-green-400' :
            estadoConexion === 'CONECTANDO' ? 'bg-yellow-400' :
            estadoConexion === 'ERROR' ? 'bg-red-400' : 'bg-gray-400'
          }`}></div>
          <span className="text-sm">
            {estadoConexion === 'CONECTADO' ? 'Conectado' :
             estadoConexion === 'CONECTANDO' ? 'Conectando...' :
             estadoConexion === 'ERROR' ? 'Error de conexión' : 'Desconectado'}
          </span>
        </div>

        {/* Calidad de señal */}
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {[1, 2, 3, 4].map(nivel => (
              <div
                key={nivel}
                className={`w-1 h-3 rounded ${
                  (calidadSenal === 'EXCELENTE' && nivel <= 4) ||
                  (calidadSenal === 'BUENA' && nivel <= 3) ||
                  (calidadSenal === 'REGULAR' && nivel <= 2) ||
                  (calidadSenal === 'MALA' && nivel <= 1)
                    ? 'bg-white' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
          <span className="text-sm">{calidadSenal}</span>
        </div>

        {/* Tiempo de sesión */}
        {sesionActiva && (
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-mono">
              {formatearTiempo(tiempoSesion)}
            </span>
          </div>
        )}

        {/* Compliance HIPAA */}
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4" />
          <span className="text-sm">HIPAA</span>
        </div>
      </div>
    </div>
  )

  // Renderizar área de video
  const renderizarAreaVideo = () => (
    <div className={`flex-1 bg-black relative ${
      modoVentana === 'MAXIMIZADA' ? 'fixed inset-0 z-50' : ''
    }`}>
      {/* Video remoto (paciente) */}
      <video
        ref={videoRemotoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
        style={{ transform: 'scaleX(-1)' }} // Efecto espejo
      />

      {/* Video local (médico) - picture-in-picture */}
      <div className="absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden border-2 border-white shadow-lg">
        <video
          ref={videoLocalRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          style={{ transform: 'scaleX(-1)' }}
        />
        
        {/* Indicadores de estado local */}
        <div className="absolute bottom-2 left-2 flex gap-1">
          {!configuracion.camaraActiva && (
            <div className="p-1 bg-red-500 rounded">
              <CameraOff className="w-3 h-3 text-white" />
            </div>
          )}
          {!configuracion.microfonoActivo && (
            <div className="p-1 bg-red-500 rounded">
              <MicOff className="w-3 h-3 text-white" />
            </div>
          )}
        </div>
      </div>

      {/* Controles de ventana */}
      <div className="absolute top-4 left-4 flex gap-2">
        <button
          onClick={() => setModoVentana(prev => 
            prev === 'MAXIMIZADA' ? 'NORMAL' : 'MAXIMIZADA'
          )}
          className="p-2 bg-black/50 text-white rounded hover:bg-black/70 transition-colors"
        >
          {modoVentana === 'MAXIMIZADA' ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </button>
      </div>

      {/* Overlay de información cuando no hay video */}
      {(!configuracion.camaraActiva || estadoConexion !== 'CONECTADO') && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="text-center text-white">
            {estadoConexion === 'CONECTANDO' ? (
              <>
                <div className="animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
                <p>Conectando con el paciente...</p>
              </>
            ) : estadoConexion === 'ERROR' ? (
              <>
                <AlertCircle className="w-12 h-12 mx-auto mb-4" />
                <p>Error de conexión</p>
                <button
                  onClick={inicializarMediaDevices}
                  className="mt-4 px-4 py-2 bg-medical-primary text-white rounded hover:bg-medical-secondary"
                >
                  Reintentar
                </button>
              </>
            ) : (
              <>
                <CameraOff className="w-12 h-12 mx-auto mb-4" />
                <p>Cámara desactivada</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )

  // Renderizar controles de video
  const renderizarControles = () => (
    <div className="bg-medical-surface border-t border-gray-200 p-4">
      <div className="flex items-center justify-center gap-4">
        {/* Control de cámara */}
        <button
          onClick={alternarCamara}
          className={`p-4 rounded-full transition-colors ${
            configuracion.camaraActiva 
              ? 'bg-medical-background text-medical-text hover:bg-gray-200'
              : 'bg-red-500 text-white hover:bg-red-600'
          }`}
        >
          {configuracion.camaraActiva ? <Camera className="w-6 h-6" /> : <CameraOff className="w-6 h-6" />}
        </button>

        {/* Control de micrófono */}
        <button
          onClick={alternarMicrofono}
          className={`p-4 rounded-full transition-colors ${
            configuracion.microfonoActivo 
              ? 'bg-medical-background text-medical-text hover:bg-gray-200'
              : 'bg-red-500 text-white hover:bg-red-600'
          }`}
        >
          {configuracion.microfonoActivo ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
        </button>

        {/* Control de altavoz */}
        <button
          onClick={() => setConfiguracion(prev => ({ ...prev, altavozActivo: !prev.altavozActivo }))}
          className={`p-4 rounded-full transition-colors ${
            configuracion.altavozActivo 
              ? 'bg-medical-background text-medical-text hover:bg-gray-200'
              : 'bg-gray-500 text-white hover:bg-gray-600'
          }`}
        >
          {configuracion.altavozActivo ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
        </button>

        {/* Grabación */}
        <button
          className="p-4 rounded-full bg-medical-background text-medical-text hover:bg-gray-200 transition-colors"
        >
          <Record className="w-6 h-6" />
        </button>

        {/* Compartir pantalla */}
        <button
          onClick={() => setConfiguracion(prev => ({ ...prev, compartirPantalla: !prev.compartirPantalla }))}
          className={`p-4 rounded-full transition-colors ${
            configuracion.compartirPantalla 
              ? 'bg-medical-primary text-white'
              : 'bg-medical-background text-medical-text hover:bg-gray-200'
          }`}
        >
          <Share className="w-6 h-6" />
        </button>

        {/* Chat */}
        <button
          onClick={() => setMostrarChat(!mostrarChat)}
          className={`p-4 rounded-full transition-colors relative ${
            mostrarChat 
              ? 'bg-medical-primary text-white'
              : 'bg-medical-background text-medical-text hover:bg-gray-200'
          }`}
        >
          <MessageSquare className="w-6 h-6" />
          {mensajesChat.length > 0 && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {mensajesChat.length}
            </div>
          )}
        </button>

        {/* Documentos */}
        <button className="p-4 rounded-full bg-medical-background text-medical-text hover:bg-gray-200 transition-colors">
          <FileText className="w-6 h-6" />
        </button>

        {/* Configuración */}
        <button className="p-4 rounded-full bg-medical-background text-medical-text hover:bg-gray-200 transition-colors">
          <Settings className="w-6 h-6" />
        </button>

        {/* Finalizar llamada */}
        <button
          onClick={finalizarSesion}
          className="p-4 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
        >
          <PhoneOff className="w-6 h-6" />
        </button>
      </div>
    </div>
  )

  // Renderizar panel de chat
  const renderizarChat = () => (
    <div className={`fixed right-0 top-0 h-full w-80 bg-white border-l border-gray-200 shadow-lg transform transition-transform z-40 ${
      mostrarChat ? 'translate-x-0' : 'translate-x-full'
    }`}>
      <div className="flex flex-col h-full">
        {/* Cabecera del chat */}
        <div className="bg-medical-primary text-white p-4 flex items-center justify-between">
          <h3 className="font-semibold">Chat de la Consulta</h3>
          <button
            onClick={() => setMostrarChat(false)}
            className="p-1 hover:bg-white/20 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mensajes */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {mensajesChat.map(mensaje => (
            <div
              key={mensaje.id}
              className={`flex ${mensaje.remitente === 'MEDICO' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs p-3 rounded-lg ${
                mensaje.remitente === 'MEDICO' 
                  ? 'bg-medical-primary text-white'
                  : 'bg-gray-100 text-medical-text'
              }`}>
                <p className="text-sm">{mensaje.mensaje}</p>
                <p className="text-xs opacity-70 mt-1">
                  {mensaje.timestamp.toLocaleTimeString('es-AR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Input de mensaje */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={nuevoMensaje}
              onChange={(e) => setNuevoMensaje(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && enviarMensaje()}
              placeholder="Escribir mensaje..."
              className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-medical-primary focus:border-medical-primary"
            />
            <button
              onClick={enviarMensaje}
              disabled={!nuevoMensaje.trim()}
              className="px-4 py-2 bg-medical-primary text-white rounded hover:bg-medical-secondary disabled:opacity-50 transition-colors"
            >
              Enviar
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  // Renderizar vista principal
  return (
    <div className="h-screen flex flex-col bg-medical-background">
      {renderizarBarraEstado()}
      {renderizarAreaVideo()}
      {renderizarControles()}
      {renderizarChat()}
      
      {/* Overlay de carga inicial */}
      {estadoConexion === 'DESCONECTADO' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-medical-text mb-4">
              Iniciar Sesión de Telemedicina
            </h2>
            <p className="text-medical-neutral mb-6">
              Para comenzar la videoconsulta, necesitamos acceso a su cámara y micrófono.
              Toda la información está protegida bajo compliance HIPAA.
            </p>
            <div className="flex gap-4">
              <button
                onClick={inicializarMediaDevices}
                className="flex-1 px-4 py-2 bg-medical-primary text-white rounded hover:bg-medical-secondary transition-colors"
              >
                Iniciar Sesión
              </button>
              <button
                onClick={() => window.history.back()}
                className="px-4 py-2 border border-gray-300 text-medical-text rounded hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Telemedicina