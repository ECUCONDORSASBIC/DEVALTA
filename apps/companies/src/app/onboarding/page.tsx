"use client";

import React from "react";
import { EnhancedCompanyOnboarding } from "@altamedica/ui";

export default function CompanyOnboardingPage() {
  const handleComplete = (data: any) => {
    console.log("Onboarding de empresa completado:", data);
    // Aquí se procesarían los datos de la empresa
    // Se configurarían los sistemas
    // Se programaría la implementación
    // Se asignaría un gerente de cuenta
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <EnhancedCompanyOnboarding 
        onComplete={handleComplete}
      />
    </div>
  );
} 