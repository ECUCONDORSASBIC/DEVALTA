"use client";

import React from "react";
import { EnhancedPatientOnboarding } from "@altamedica/ui";

export default function OnboardingPage() {
  const handleComplete = (data: any) => {
    console.log("Onboarding completado:", data);
    // Aquí se procesarían los datos del paciente
    // Se guardaría en la base de datos
    // Se redirigiría al dashboard
  };

  const handleSkip = () => {
    console.log("Onboarding saltado");
    // Redirigir al dashboard sin completar onboarding
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <EnhancedPatientOnboarding 
        onComplete={handleComplete}
        onSkip={handleSkip}
      />
    </div>
  );
}
