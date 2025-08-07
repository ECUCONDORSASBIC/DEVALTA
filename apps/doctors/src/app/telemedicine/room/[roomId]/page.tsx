'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { ProfessionalTelemedicineCall } from '@/components/telemedicine/ProfessionalTelemedicineCall';
import { useAuth } from '@altamedica/hooks'; // Hook de autenticación centralizado

const TelemedicineRoomPage = () => {
  const params = useParams();
  const { user } = useAuth(); // Obtener el doctor autenticado
  const roomId = params.roomid as string;

  // En una aplicación real, el sessionId y patientId vendrían de la base de datos
  // o del estado de la aplicación al iniciar la llamada. 
  // Aquí usamos valores de ejemplo.
  const sessionId = `session-for-room-${roomId}`;
  const patientId = 'mock-patient-id'; // Esto debería ser dinámico

  if (!user) {
    return <div className="text-center p-8">Por favor, inicie sesión para unirse a la consulta.</div>;
  }

  return (
    <main className="w-full h-screen bg-gray-900">
      <ProfessionalTelemedicineCall 
        sessionId={sessionId}
        doctorId={user.id}
        patientId={patientId}
      />
    </main>
  );
};

export default TelemedicineRoomPage;