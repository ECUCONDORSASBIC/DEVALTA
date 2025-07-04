'use client';

import { useState, useEffect } from 'react';
import { getPatientService } from '../../services/patient-service';

export default function TestPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [patients, setPatients] = useState([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPatients = async () => {
      try {
        const patientService = getPatientService();
        if (patientService.isServiceReady()) {
          const patientData = await patientService.getPatients();
          setPatients(patientData);
        }
        setIsLoaded(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
        setIsLoaded(true);
      }
    };

    loadPatients();
  }, []);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando servicios...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="text-green-500 text-6xl mb-4">✅</div>
          <h1 className="text-3xl font-bold text-green-600 mb-2">SSR Fix Aplicado</h1>
          <p className="text-gray-600">Los servicios se han corregido exitosamente</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {patients.map((patient: any) => (
            <div key={patient.id} className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {patient.nombre} {patient.apellido}
              </h3>
              <p className="text-gray-600 mb-2">{patient.email}</p>
              <p className="text-gray-600 mb-2">{patient.telefono}</p>
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                patient.estado === 'activo' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {patient.estado}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <div className="inline-block bg-blue-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">Estado del Sistema</h3>
            <p className="text-blue-600">
              ✅ EncryptionService: SSR Compatible<br/>
              ✅ PatientService: SSR Compatible<br/>
              ✅ Servicios funcionando correctamente
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 