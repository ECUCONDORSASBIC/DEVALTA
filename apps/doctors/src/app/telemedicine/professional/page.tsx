'use client';

import React from 'react';
import ProfessionalTelemedicineCall from '@/components/telemedicine/ProfessionalTelemedicineCall';

export default function ProfessionalTelemedicinePage() {
  const handleEndCall = () => {
    console.log('Llamada finalizada');
    // Aquí puedes agregar lógica para redirigir o mostrar mensaje
  };

  return (
    <ProfessionalTelemedicineCall
      sessionId="professional-session-123"
      userType="doctor"
      userId="doctor-1"
      patientName="María González"
      doctorName="Dr. Carlos López"
      onEndCall={handleEndCall}
    />
  );
} 