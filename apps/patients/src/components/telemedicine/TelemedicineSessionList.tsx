import React from "react";
import { TelemedicineSession } from "../../hooks/useTelemedicine";
import { useRouter } from "next/navigation";

interface TelemedicineSessionListProps {
  sessions: TelemedicineSession[];
}

const TelemedicineSessionList: React.FC<TelemedicineSessionListProps> = ({
  sessions,
}) => {
  const router = useRouter();

  // Función para obtener el nombre del doctor (simulado)
  const getDoctorName = (doctorId: string) => {
    const doctors: Record<string, string> = {
      'doctor-1': 'Dr. María García',
      'doctor-2': 'Dr. Carlos López',
      'doctor-3': 'Dr. Ana Martínez',
      'doctor-4': 'Dr. Roberto Silva'
    };
    return doctors[doctorId] || 'Dr. No especificado';
  };

  // Función para obtener la especialidad (simulada)
  const getSpecialty = (doctorId: string) => {
    const specialties: Record<string, string> = {
      'doctor-1': 'Medicina Interna',
      'doctor-2': 'Cardiología',
      'doctor-3': 'Endocrinología',
      'doctor-4': 'Neurología'
    };
    return specialties[doctorId] || 'General';
  };

  // Función para formatear el estado
  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'scheduled': 'Programada',
      'waiting': 'En espera',
      'active': 'Activa',
      'completed': 'Completada',
      'cancelled': 'Cancelada'
    };
    return statusMap[status] || status;
  };

  // Función para obtener el color del estado
  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      'scheduled': 'bg-blue-100 text-blue-800',
      'waiting': 'bg-yellow-100 text-yellow-800',
      'active': 'bg-green-100 text-green-800',
      'completed': 'bg-gray-100 text-gray-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  // Función para formatear fecha
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-MX');
  };

  // Función para formatear hora
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('es-MX', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!sessions || sessions.length === 0) {
    return (
      <div className="text-center text-gray-500 py-12">
        <div className="mb-4">
          <span className="text-4xl">📹</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No hay sesiones de telemedicina
        </h3>
        <p className="text-gray-600">
          Cuando tengas citas programadas, aparecerán aquí
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {sessions.map((session) => (
        <div
          key={session.id}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col hover:shadow-lg transition-all duration-200 cursor-pointer hover:border-blue-300"
          onClick={() => router.push(`/telemedicine/room/${session.id}`)}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-blue-600 text-lg">👨‍⚕️</span>
              </div>
              <div>
                <div className="font-semibold text-lg text-gray-900">
                  {getDoctorName(session.doctorId)}
                </div>
                <div className="text-sm text-gray-600">
                  {getSpecialty(session.doctorId)}
                </div>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
              {getStatusText(session.status)}
            </span>
          </div>
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <span className="mr-2">📅</span>
              <span>
                {formatDate(session.scheduledAt)} • {formatTime(session.scheduledAt)}
              </span>
            </div>
            
            {session.startedAt && (
              <div className="flex items-center text-sm text-gray-600">
                <span className="mr-2">▶️</span>
                <span>Inició: {formatTime(session.startedAt)}</span>
              </div>
            )}
            
            {session.endedAt && (
              <div className="flex items-center text-sm text-gray-600">
                <span className="mr-2">⏹️</span>
                <span>Finalizó: {formatTime(session.endedAt)}</span>
              </div>
            )}
            
            {session.duration && (
              <div className="flex items-center text-sm text-gray-600">
                <span className="mr-2">⏱️</span>
                <span>Duración: {Math.floor(session.duration / 60)} minutos</span>
              </div>
            )}
          </div>
          
          {session.notes && (
            <div className="p-3 bg-gray-50 rounded-lg mb-4">
              <div className="text-sm text-gray-700">
                <span className="font-medium">Notas:</span> {session.notes}
              </div>
            </div>
          )}
          
          <div className="mt-auto flex items-center justify-between">
            <div className="text-blue-600 text-sm font-medium">
              Entrar a la sala →
            </div>
            <div className="flex space-x-2">
              {session.status === 'waiting' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/telemedicine/waiting/${session.id}`);
                  }}
                  className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-medium hover:bg-yellow-200"
                >
                  Sala de espera
                </button>
              )}
              {session.status === 'active' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/telemedicine/room/${session.id}`);
                  }}
                  className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium hover:bg-green-200"
                >
                  Unirse ahora
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TelemedicineSessionList;
