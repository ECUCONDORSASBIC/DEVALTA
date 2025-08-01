'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { PatientTelemedicineCall } from '@/components/telemedicine/PatientTelemedicineCall';
import { useAuth } from '@/hooks/useAuth'; // Suponiendo que existe un hook de autenticación

const PatientRoomPage = () => {
  const params = useParams();
  const { user } = useAuth(); // Obtener el paciente autenticado
  const roomId = params.roomid as string;

  // En una aplicación real, el sessionId y doctorId vendrían de la base de datos
  // o del estado de la aplicación al iniciar la llamada. 
  // Aquí usamos valores de ejemplo.
  const sessionId = `session-for-room-${roomId}`;
  const doctorId = 'mock-doctor-id'; // Esto debería ser dinámico

  if (!user) {
    return <div className="text-center p-8">Por favor, inicie sesión para unirse a la consulta.</div>;
  }

  return (
    <main className="w-full h-screen bg-gray-100">
      <PatientTelemedicineCall 
        sessionId={sessionId}
        patientId={user.id}
        doctorId={doctorId}
      />
    </main>
  );
};

export default PatientRoomPage;
