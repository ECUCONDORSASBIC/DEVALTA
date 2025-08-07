'use client';

import { useState, useEffect } from 'react';
import { MapPin, Clock, Bed, Phone, Navigation, AlertTriangle, Heart, Zap, Car, Star } from 'lucide-react';

interface EmergencyHospital {
  id: string;
  name: string;
  emergencyWaitTime: number;
  availableBeds: number;
  distance: number;
  emergencyContact: string;
  address: string;
  rating: number;
  specialties: string[];
  isOpen24h: boolean;
  traumaCenter: boolean;
}

const mockEmergencyHospitals: EmergencyHospital[] = [
  {
    id: '1',
    name: 'Hospital Universitario',
    emergencyWaitTime: 15,
    availableBeds: 5,
    distance: 2.5,
    emergencyContact: '+34912345678',
    address: 'Av. Principal 123, Barcelona',
    rating: 4.8,
    specialties: ['Cardiología', 'Traumatología', 'Neurología'],
    isOpen24h: true,
    traumaCenter: true
  },
  {
    id: '2',
    name: 'Hospital del Mar',
    emergencyWaitTime: 25,
    availableBeds: 3,
    distance: 1.8,
    emergencyContact: '+34912345679',
    address: 'Paseo Marítimo 25, Barcelona',
    rating: 4.6,
    specialties: ['Medicina Interna', 'Pediatría', 'Cirugía'],
    isOpen24h: true,
    traumaCenter: false
  },
  {
    id: '3',
    name: 'Clínica Sant Joan',
    emergencyWaitTime: 35,
    availableBeds: 2,
    distance: 3.1,
    emergencyContact: '+34912345680',
    address: 'Calle Mayor 45, Barcelona',
    rating: 4.4,
    specialties: ['Urgencias', 'Medicina General'],
    isOpen24h: true,
    traumaCenter: false
  }
];

const emergencyTypes = [
  { value: 'cardiac', label: 'Problemas Cardíacos', icon: Heart, color: 'red' },
  { value: 'trauma', label: 'Trauma/Accidente', icon: AlertTriangle, color: 'orange' },
  { value: 'respiratory', label: 'Dificultad Respiratoria', icon: Zap, color: 'blue' },
  { value: 'neurological', label: 'Emergencia Neurológica', icon: Zap, color: 'purple' },
  { value: 'poisoning', label: 'Intoxicación', icon: AlertTriangle, color: 'green' },
  { value: 'other', label: 'Otra Emergencia', icon: AlertTriangle, color: 'gray' }
];

const urgencyLevels = [
  { value: 'low', label: 'Baja - No urgente', color: 'green' },
  { value: 'medium', label: 'Media - Urgente', color: 'yellow' },
  { value: 'high', label: 'Alta - Muy urgente', color: 'red' },
  { value: 'critical', label: 'Crítica - Inmediata', color: 'red' }
];

export default function EmergencyPage() {
  const [selectedEmergencyType, setSelectedEmergencyType] = useState('');
  const [urgencyLevel, setUrgencyLevel] = useState('');
  const [hospitals, setHospitals] = useState<EmergencyHospital[]>([]);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState<EmergencyHospital | null>(null);

  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          // Default location (Barcelona)
          setUserLocation({ lat: 41.3851, lng: 2.1734 });
        }
      );
    } else {
      setUserLocation({ lat: 41.3851, lng: 2.1734 });
    }
  }, []);

  const handleSearch = async () => {
    if (!selectedEmergencyType || !urgencyLevel) {
      return;
    }

    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Sort hospitals by urgency and distance
      const sortedHospitals = [...mockEmergencyHospitals].sort((a, b) => {
        if (urgencyLevel === 'critical' || urgencyLevel === 'high') {
          // For critical cases, prioritize trauma centers and shorter wait times
          if (a.traumaCenter && !b.traumaCenter) return -1;
          if (!a.traumaCenter && b.traumaCenter) return 1;
          return a.emergencyWaitTime - b.emergencyWaitTime;
        } else {
          // For non-critical cases, prioritize distance
          return a.distance - b.distance;
        }
      });

      setHospitals(sortedHospitals);
    } catch (error) {
      console.error('Error fetching emergency services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCall = (hospital: EmergencyHospital) => {
    setSelectedHospital(hospital);
    setShowModal(true);
  };

  const getUrgencyColor = (level: string) => {
    const colors = {
      low: 'text-green-600 bg-green-50 border-green-200',
      medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      high: 'text-red-600 bg-red-50 border-red-200',
      critical: 'text-red-700 bg-red-100 border-red-300'
    };
    return colors[level as keyof typeof colors] || colors.medium;
  };

  const getWaitTimeColor = (waitTime: number) => {
    if (waitTime <= 15) return 'text-green-600';
    if (waitTime <= 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Emergency Header */}
      <div className="bg-red-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-8 w-8" />
            <div>
              <h1 className="text-2xl font-bold">Servicios de Emergencia</h1>
              <p className="text-red-100">Encuentra atención médica de urgencia cerca de ti</p>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Warning */}
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                <strong>En caso de emergencia grave, llame al 112 inmediatamente.</strong> 
                Esta herramienta es para situaciones menos críticas donde puedes elegir el centro médico.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Emergency Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Describe tu Emergencia
              </h2>
              
              <div className="space-y-6">
                {/* Emergency Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Tipo de Emergencia *
                  </label>
                  <select
                    data-testid="emergency-type"
                    value={selectedEmergencyType}
                    onChange={(e) => setSelectedEmergencyType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="">Selecciona el tipo</option>
                    {emergencyTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Urgency Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Nivel de Urgencia *
                  </label>
                  <select
                    data-testid="urgency-level"
                    value={urgencyLevel}
                    onChange={(e) => setUrgencyLevel(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="">Selecciona la urgencia</option>
                    {urgencyLevels.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Search Button */}
                <button
                  data-testid="find-emergency-care"
                  onClick={handleSearch}
                  disabled={!selectedEmergencyType || !urgencyLevel || loading}
                  className="w-full bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2 inline-block"></div>
                      Buscando...
                    </>
                  ) : (
                    'Buscar Atención de Emergencia'
                  )}
                </button>

                {/* Emergency Call */}
                <div className="border-t pt-6">
                  <div className="bg-red-600 text-white p-4 rounded-lg text-center">
                    <Phone className="h-6 w-6 mx-auto mb-2" />
                    <p className="font-semibold mb-2">Emergencia Crítica</p>
                    <a
                      href="tel:112"
                      className="inline-block bg-white text-red-600 px-4 py-2 rounded-md font-bold hover:bg-red-50 transition-colors"
                    >
                      Llamar 112
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-md border border-gray-200 p-6 animate-pulse">
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-8 bg-gray-200 rounded w-20"></div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : hospitals.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Centros de Emergencia Cercanos ({hospitals.length})
                  </h2>
                  {urgencyLevel && (
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getUrgencyColor(urgencyLevel)}`}>
                      Urgencia: {urgencyLevels.find(l => l.value === urgencyLevel)?.label}
                    </span>
                  )}
                </div>

                {hospitals.map((hospital) => (
                  <div 
                    key={hospital.id}
                    data-testid="emergency-hospital"
                    className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {hospital.name}
                          </h3>
                          {hospital.traumaCenter && (
                            <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">
                              Centro de Trauma
                            </span>
                          )}
                          {hospital.isOpen24h && (
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                              24/7
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-medium">{hospital.rating}</span>
                          <span className="text-sm text-gray-500">• {hospital.specialties.join(', ')}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span>{hospital.address}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCall(hospital)}
                          data-testid="call-emergency"
                          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors font-medium"
                        >
                          <Phone className="h-4 w-4 mr-2 inline" />
                          Llamar
                        </button>
                        <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors">
                          <Navigation className="h-4 w-4 mr-2 inline" />
                          Ruta
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-gray-50 rounded-md">
                        <Clock className="h-5 w-5 mx-auto mb-1 text-gray-600" />
                        <div data-testid="wait-time" className={`font-semibold ${getWaitTimeColor(hospital.emergencyWaitTime)}`}>
                          {hospital.emergencyWaitTime} minutos
                        </div>
                        <div className="text-xs text-gray-500">Tiempo de espera</div>
                      </div>

                      <div className="text-center p-3 bg-gray-50 rounded-md">
                        <Bed className="h-5 w-5 mx-auto mb-1 text-gray-600" />
                        <div data-testid="available-beds" className="font-semibold text-gray-900">
                          {hospital.availableBeds} camas
                        </div>
                        <div className="text-xs text-gray-500">Disponibles</div>
                      </div>

                      <div className="text-center p-3 bg-gray-50 rounded-md">
                        <Car className="h-5 w-5 mx-auto mb-1 text-gray-600" />
                        <div data-testid="distance" className="font-semibold text-gray-900">
                          {hospital.distance} km
                        </div>
                        <div className="text-xs text-gray-500">Distancia</div>
                      </div>

                      <div className="text-center p-3 bg-green-50 rounded-md">
                        <Phone className="h-5 w-5 mx-auto mb-1 text-green-600" />
                        <div className="font-semibold text-green-700 text-sm">
                          Disponible
                        </div>
                        <div className="text-xs text-gray-500">Estado</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : !loading && selectedEmergencyType && urgencyLevel ? (
              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 text-center">
                <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No se encontraron centros de emergencia
                </h3>
                <p className="text-gray-600">
                  Intenta expandir tu búsqueda o llama al 112 para emergencias críticas.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 text-center">
                <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Encuentra Atención de Emergencia
                </h3>
                <p className="text-gray-600">
                  Completa el formulario para encontrar los centros médicos de emergencia más cercanos.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Calling Modal */}
      {showModal && selectedHospital && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div data-testid="calling-modal" className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="h-8 w-8 text-red-600" />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Llamando a {selectedHospital.name}
              </h3>
              
              <div data-testid="emergency-number" className="text-2xl font-bold text-red-600 mb-4">
                {selectedHospital.emergencyContact}
              </div>
              
              <p className="text-gray-600 mb-6">
                La llamada se realizará automáticamente. Mantente calmado y describe tu emergencia claramente.
              </p>
              
              <div className="flex gap-4 justify-center">
                <a
                  href={`tel:${selectedHospital.emergencyContact}`}
                  className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors font-medium"
                >
                  Llamar Ahora
                </a>
                <button
                  onClick={() => setShowModal(false)}
                  className="border border-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}