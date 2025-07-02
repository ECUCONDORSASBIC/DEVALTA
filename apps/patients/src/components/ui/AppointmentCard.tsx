// 📅 APPOINTMENT CARD CORPORATIVO ALTAMEDICA
// Componente médico especializado para visualización de citas
// CONSERVADOR: Basado en CardCorporate, datos mock, UI pura sin lógica compleja

'use client';

import React from 'react';
import { Calendar, Clock, User, MapPin, Phone, Video, AlertCircle, CheckCircle } from 'lucide-react';
import CardCorporate, { CardHeaderCorporate, CardContentCorporate, CardFooterCorporate } from './CardCorporate';
import ButtonCorporate from './ButtonCorporate';
import { StatusBadge } from './StatusBadge';

// 📝 TIPOS ROBUSTOS PARA CITAS MÉDICAS
export type AppointmentType = 
  | 'consultation' 
  | 'follow_up' 
  | 'emergency' 
  | 'routine_checkup'
  | 'specialist_referral'
  | 'telemedicine'
  | 'vaccination';

export type AppointmentStatus = 
  | 'scheduled' 
  | 'confirmed' 
  | 'in_progress'
  | 'completed' 
  | 'cancelled'
  | 'no_show'
  | 'rescheduled';

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  avatar?: string;
  rating?: number;
}

export interface AppointmentData {
  id: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  duration: number; // minutos
  type: AppointmentType;
  status: AppointmentStatus;
  doctor: Doctor;
  location?: string;
  isTelemedicine: boolean;
  patientNotes?: string;
  doctorNotes?: string;
  cost?: number;
  insurance?: string;
}

export interface AppointmentCardProps {
  appointment: AppointmentData;
  variant?: 'default' | 'compact' | 'detailed';
  showActions?: boolean;
  onView?: (id: string) => void;
  onReschedule?: (id: string) => void;
  onCancel?: (id: string) => void;
  onJoinCall?: (id: string) => void;
  className?: string;
}

// 🏥 CONFIGURACIÓN DE TIPOS DE CITA
const APPOINTMENT_TYPE_CONFIG = {
  consultation: {
    label: 'Consulta Médica',
    icon: User,
    color: 'text-primary-altamedica',
    bgColor: 'bg-blue-100'
  },
  follow_up: {
    label: 'Seguimiento',
    icon: CheckCircle,
    color: 'text-secondary-altamedica',
    bgColor: 'bg-green-100'
  },
  emergency: {
    label: 'Emergencia',
    icon: AlertCircle,
    color: 'text-danger',
    bgColor: 'bg-red-100'
  },
  routine_checkup: {
    label: 'Chequeo Rutinario',
    icon: Calendar,
    color: 'text-secondary-altamedica',
    bgColor: 'bg-green-100'
  },
  specialist_referral: {
    label: 'Especialista',
    icon: User,
    color: 'text-primary-altamedica',
    bgColor: 'bg-blue-100'
  },
  telemedicine: {
    label: 'Telemedicina',
    icon: Video,
    color: 'text-secondary-altamedica',
    bgColor: 'bg-green-100'
  },
  vaccination: {
    label: 'Vacunación',
    icon: CheckCircle,
    color: 'text-secondary-altamedica',
    bgColor: 'bg-green-100'
  }
};

// 🎨 COMPONENTE INFORMACIÓN DEL DOCTOR
const DoctorInfo: React.FC<{ doctor: Doctor; compact?: boolean }> = ({ doctor, compact = false }) => (
  <div className="flex items-center space-x-3">
    <div className="w-10 h-10 bg-secondary-altamedica rounded-full flex items-center justify-center shadow-md">
      {doctor.avatar ? (
        <img src={doctor.avatar} alt={doctor.name} className="w-10 h-10 rounded-full object-cover" />
      ) : (
        <User className="w-5 h-5 text-white" />
      )}
    </div>
    <div className="flex-1 min-w-0">
      <p className={`font-medium text-primary-altamedica truncate ${compact ? 'text-sm' : 'text-base'}`}>
        {doctor.name}
      </p>
      <p className={`text-gray-600 truncate ${compact ? 'text-xs' : 'text-sm'}`}>
        {doctor.specialty}
      </p>
      {doctor.rating && (
        <div className="flex items-center space-x-1">
          <span className="text-yellow-500">★</span>
          <span className="text-xs text-gray-500">{doctor.rating}/5</span>
        </div>
      )}
    </div>
  </div>
);

// 📅 COMPONENTE INFORMACIÓN DE FECHA Y HORA
const DateTimeInfo: React.FC<{ date: string; time: string; duration: number; compact?: boolean }> = ({ 
  date, time, duration, compact = false 
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', { 
      weekday: compact ? 'short' : 'long',
      year: 'numeric', 
      month: compact ? 'short' : 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  return (
    <div className={`space-y-2 ${compact ? 'text-sm' : ''}`}>
      <div className="flex items-center space-x-2 text-gray-700">
        <Calendar className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-primary-altamedica`} />
        <span className="font-medium">{formatDate(date)}</span>
      </div>
      <div className="flex items-center space-x-2 text-gray-700">
        <Clock className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-secondary-altamedica`} />
        <span>{formatTime(time)} ({duration} min)</span>
      </div>
    </div>
  );
};

// 📍 COMPONENTE INFORMACIÓN DE UBICACIÓN
const LocationInfo: React.FC<{ 
  location?: string; 
  isTelemedicine: boolean; 
  compact?: boolean 
}> = ({ location, isTelemedicine, compact = false }) => (
  <div className="flex items-center space-x-2 text-gray-700">
    {isTelemedicine ? (
      <>
        <Video className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-secondary-altamedica`} />
        <span className={`${compact ? 'text-sm' : ''}`}>Consulta Virtual</span>
      </>
    ) : (
      <>
        <MapPin className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-primary-altamedica`} />
        <span className={`${compact ? 'text-sm' : ''}`}>
          {location || 'Consultorio Médico'}
        </span>
      </>
    )}
  </div>
);

// 🎯 COMPONENTE PRINCIPAL APPOINTMENT CARD
export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  variant = 'default',
  showActions = true,
  onView,
  onReschedule,
  onCancel,
  onJoinCall,
  className = ''
}) => {
  const typeConfig = APPOINTMENT_TYPE_CONFIG[appointment.type];
  const TypeIcon = typeConfig.icon;
  
  // 🛡️ VALIDACIONES ROBUSTAS
  const isUpcoming = new Date(appointment.date) > new Date();
  const canJoinCall = appointment.isTelemedicine && appointment.status === 'confirmed' && isUpcoming;
  const canReschedule = ['scheduled', 'confirmed'].includes(appointment.status) && isUpcoming;
  const canCancel = ['scheduled', 'confirmed'].includes(appointment.status) && isUpcoming;

  // 🎨 VARIANTES DE VISUALIZACIÓN
  const isCompact = variant === 'compact';
  const isDetailed = variant === 'detailed';

  // 🚨 DETERMINAR VARIANTE DE CARD BASADO EN ESTADO
  const getCardVariant = () => {
    if (appointment.type === 'emergency') return 'emergency';
    if (appointment.status === 'cancelled') return 'warning';
    if (appointment.status === 'completed') return 'success';
    return 'default';
  };

  return (
    <CardCorporate
      variant={getCardVariant()}
      medical={appointment.type !== 'emergency'}
      emergency={appointment.type === 'emergency'}
      hover={true}
      className={className}
    >
      {/* 📋 HEADER */}
      <CardHeaderCorporate
        title={appointment.title}
        subtitle={isDetailed ? appointment.description : undefined}
        medical={appointment.type !== 'emergency'}
        actions={
          <div className="flex items-center space-x-2">
            <StatusBadge status={appointment.status} size={isCompact ? 'sm' : 'md'} />
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-lg ${typeConfig.bgColor}`}>
              <TypeIcon className={`${isCompact ? 'w-3 h-3' : 'w-4 h-4'} ${typeConfig.color}`} />
              <span className={`${isCompact ? 'text-xs' : 'text-sm'} font-medium ${typeConfig.color}`}>
                {typeConfig.label}
              </span>
            </div>
          </div>
        }
      />

      {/* 📄 CONTENIDO */}
      <CardContentCorporate>
        <div className={`space-y-${isCompact ? '3' : '4'}`}>
          {/* 👨‍⚕️ INFORMACIÓN DEL DOCTOR */}
          <DoctorInfo doctor={appointment.doctor} compact={isCompact} />

          {/* 📅 FECHA, HORA Y UBICACIÓN */}
          <div className={`grid ${isCompact ? 'grid-cols-1 gap-2' : 'grid-cols-1 md:grid-cols-2 gap-4'}`}>
            <DateTimeInfo 
              date={appointment.date} 
              time={appointment.time} 
              duration={appointment.duration}
              compact={isCompact}
            />
            <LocationInfo 
              location={appointment.location} 
              isTelemedicine={appointment.isTelemedicine}
              compact={isCompact}
            />
          </div>

          {/* 📝 NOTAS ADICIONALES (SOLO EN VISTA DETALLADA) */}
          {isDetailed && (appointment.patientNotes || appointment.doctorNotes) && (
            <div className="space-y-2 pt-4 border-t border-gray-200">
              {appointment.patientNotes && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Notas del Paciente:</p>
                  <p className="text-sm text-gray-600">{appointment.patientNotes}</p>
                </div>
              )}
              {appointment.doctorNotes && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Notas del Doctor:</p>
                  <p className="text-sm text-gray-600">{appointment.doctorNotes}</p>
                </div>
              )}
            </div>
          )}

          {/* 💰 INFORMACIÓN DE COSTO (SOLO EN VISTA DETALLADA) */}
          {isDetailed && (appointment.cost || appointment.insurance) && (
            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              {appointment.cost && (
                <span className="text-sm text-gray-600">
                  Costo: <span className="font-medium text-primary-altamedica">${appointment.cost}</span>
                </span>
              )}
              {appointment.insurance && (
                <span className="text-sm text-gray-600">
                  Obra Social: <span className="font-medium">{appointment.insurance}</span>
                </span>
              )}
            </div>
          )}
        </div>
      </CardContentCorporate>

      {/* 🦶 FOOTER CON ACCIONES */}
      {showActions && (
        <CardFooterCorporate align="between">
          <div className="flex items-center space-x-2">
            {/* 📞 BOTÓN UNIRSE A LLAMADA (TELEMEDICINA) */}
            {canJoinCall && (
              <ButtonCorporate
                variant="medical"
                size={isCompact ? 'sm' : 'md'}
                icon={<Video className="w-4 h-4" />}
                onClick={() => onJoinCall?.(appointment.id)}
                animate={true}
              >
                Unirse a Consulta
              </ButtonCorporate>
            )}
            
            {/* 👁️ BOTÓN VER DETALLES */}
            <ButtonCorporate
              variant="ghost"
              size={isCompact ? 'sm' : 'md'}
              onClick={() => onView?.(appointment.id)}
            >
              Ver Detalles
            </ButtonCorporate>
          </div>

          <div className="flex items-center space-x-2">
            {/* 📅 BOTÓN REPROGRAMAR */}
            {canReschedule && (
              <ButtonCorporate
                variant="outline"
                size={isCompact ? 'sm' : 'md'}
                onClick={() => onReschedule?.(appointment.id)}
              >
                Reprogramar
              </ButtonCorporate>
            )}
            
            {/* ❌ BOTÓN CANCELAR */}
            {canCancel && (
              <ButtonCorporate
                variant="danger"
                size={isCompact ? 'sm' : 'md'}
                onClick={() => onCancel?.(appointment.id)}
              >
                Cancelar
              </ButtonCorporate>
            )}
          </div>
        </CardFooterCorporate>
      )}
    </CardCorporate>
  );
};

export default AppointmentCard;