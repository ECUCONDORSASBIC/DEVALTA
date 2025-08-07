'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Calendar, Clock, ArrowLeft, User, MapPin, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface TimeSlot {
  time: string;
  available: boolean;
}

const mockTimeSlots: TimeSlot[] = [
  { time: '09:00', available: true },
  { time: '10:00', available: true },
  { time: '11:00', available: false },
  { time: '14:00', available: true },
  { time: '15:00', available: true },
  { time: '16:00', available: false },
];

const availableDates = [
  '2024-01-16',
  '2024-01-17', 
  '2024-01-18',
  '2024-01-19',
  '2024-01-22'
];

export default function RescheduleAppointmentPage() {
  const params = useParams();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const currentAppointment = {
    id: 'apt1',
    companyName: 'Hospital Universitario',
    doctorName: 'Dr. García',
    specialty: 'Cardiología',
    currentDate: '2024-01-15',
    currentTime: '09:00',
    location: 'Consulta 3A, Planta 2'
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedTime) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSuccess(true);
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 text-center">
            <div data-testid="reschedule-success" className="space-y-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  ¡Cita Reprogramada Exitosamente!
                </h2>
                <p className="text-gray-600">
                  Tu cita ha sido reprogramada. Recibirás un email de confirmación.
                </p>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4">
                <div data-testid="new-datetime" className="text-sm">
                  <strong>Nueva fecha:</strong> {new Date(selectedDate).toLocaleDateString('es-ES')} a las {selectedTime}
                </div>
                <div className="text-sm mt-1">
                  <strong>Médico:</strong> {currentAppointment.doctorName} - {currentAppointment.specialty}
                </div>
              </div>
              
              <div className="flex gap-4 justify-center">
                <Link
                  href="/patient/dashboard"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Ir al Dashboard
                </Link>
                
                <Link
                  href={`/companies/${currentAppointment.id.split('apt')[1]}`}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Ver Institución
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/patient/dashboard"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver al Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Reprogramar Cita</h1>
          <p className="text-gray-600">Selecciona una nueva fecha y hora para tu cita médica</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Current Appointment Info */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <h2 className="text-lg font-semibold text-gray-900">Cita Actual</h2>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">{currentAppointment.companyName}</p>
                  <p className="text-sm text-gray-600">{currentAppointment.location}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">{currentAppointment.doctorName}</p>
                  <p className="text-sm text-gray-600">{currentAppointment.specialty}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">
                    {new Date(currentAppointment.currentDate).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <p className="text-sm text-gray-600">{currentAppointment.currentTime}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Reschedule Form */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Nueva Fecha y Hora
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Date Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Seleccionar nueva fecha
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {availableDates.map((date) => (
                    <button
                      key={date}
                      type="button"
                      data-testid={`calendar-date-${date}`}
                      onClick={() => setSelectedDate(date)}
                      className={`
                        p-3 rounded-lg border text-sm font-medium transition-colors text-center
                        ${selectedDate === date 
                          ? 'border-blue-500 bg-blue-50 text-blue-700' 
                          : 'border-gray-200 text-gray-900 hover:border-gray-300'
                        }
                      `}
                    >
                      {new Date(date).toLocaleDateString('es-ES', { 
                        weekday: 'short', 
                        day: 'numeric', 
                        month: 'short' 
                      })}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Selection */}
              {selectedDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Horarios disponibles
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {mockTimeSlots
                      .filter(slot => slot.available)
                      .map((slot) => (
                      <button
                        key={slot.time}
                        type="button"
                        data-testid={`time-slot-${slot.time}`}
                        onClick={() => setSelectedTime(slot.time)}
                        className={`
                          p-3 rounded-lg border text-sm font-medium transition-colors
                          ${selectedTime === slot.time 
                            ? 'border-green-500 bg-green-50 text-green-700' 
                            : 'border-gray-200 text-gray-900 hover:border-gray-300'
                          }
                        `}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motivo de la reprogramación (opcional)
                </label>
                <textarea
                  data-testid="reschedule-reason"
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Ej. Conflicto de horario laboral..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                data-testid="confirm-reschedule"
                disabled={!selectedDate || !selectedTime || loading}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2 inline-block"></div>
                    Reprogramando...
                  </>
                ) : (
                  'Confirmar Reprogramación'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}