'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Brain, Stethoscope, UserCheck } from 'lucide-react';
import NoSSR from '../NoSSR';

// Importación completamente dinámica del Canvas 3D
const Medical3DCanvas = dynamic(() => import('./Medical3DCanvas'), {
  ssr: false,
  loading: () => <Demo3DLoading />
});

// Componente de loading simple
const Demo3DLoading = () => (
  <div className="w-full h-32 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center">
    <div className="text-center space-y-2">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-200 border-t-blue-600 mx-auto"></div>
      <p className="text-xs text-blue-600 font-medium">Cargando consulta...</p>
    </div>
  </div>
);

// Solo doctor_male.glb - modelo único para simplificar

// Componente principal del demo
interface MedicalConsultation3DDemoProps {
  height?: string;
}

export default function MedicalConsultation3DDemo({ 
  height = '140px' 
}: MedicalConsultation3DDemoProps) {
  const [step, setStep] = useState(0);
  
  // Estados de la simulación IA
  const steps = [
    { text: "Analizando historial médico...", icon: Brain },
    { text: "Evaluando síntomas actuales...", icon: Stethoscope },
    { text: "Recomendando especialista...", icon: UserCheck }
  ];

  useEffect(() => {
    // Solo ciclo de simulación IA (cada 3 segundos)
    const stepInterval = setInterval(() => {
      setStep(prev => (prev + 1) % steps.length);
    }, 3000);
    
    return () => {
      clearInterval(stepInterval);
    };
  }, []);

  const currentStep = steps[step];
  const Icon = currentStep.icon;

  return (
    <div className="relative w-full bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg overflow-hidden flex" style={{ height }}>
      {/* Doctor 3D - 50% izquierda con fondo negro */}
      <div className="w-1/2 relative bg-black rounded-l-lg">
        <NoSSR fallback={<Demo3DLoading />}>
          <Medical3DCanvas height={height} />
        </NoSSR>
        
        {/* Indicador de IA sobre el doctor */}
        <div className="absolute top-2 left-2">
          <div className="bg-blue-600/90 text-white px-2 py-1 rounded-full text-xs font-semibold backdrop-blur-sm">
            👨‍⚕️ IA Médica
          </div>
        </div>

        {/* Estado de simulación sobre el doctor */}
        <div className="absolute bottom-2 left-2 right-2">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-sm">
            <div className="flex items-center gap-2">
              <Icon className="h-3 w-3 text-blue-600 animate-pulse" />
              <span className="text-xs font-medium text-gray-700">{currentStep.text}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Texto explicativo - 50% derecha */}
      <div className="w-1/2 p-4 flex flex-col justify-center">
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-gray-800 leading-tight">
            Consulta Médica Virtual
          </h3>
          
          <div className="space-y-2 text-sm text-gray-700">
            <p className="leading-relaxed">
              <span className="font-semibold text-blue-600">IA analiza</span> tu historia clínica y anamnesis para recomendarte el <span className="font-semibold">especialista exacto</span> que necesitas, sin consultar médico general.
            </p>
            
            <div className="flex items-start gap-2 text-xs text-gray-600 bg-white/60 rounded-lg p-2">
              <Brain className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
              <span><span className="font-medium">IA + Historial permanente:</span> Consultas recursivas y seguimiento continuo de tu salud</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}