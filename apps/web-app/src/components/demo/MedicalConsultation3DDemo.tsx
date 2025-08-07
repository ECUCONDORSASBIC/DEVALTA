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
  <div className="w-full h-32 bg-white rounded-lg flex items-center justify-center">
    <div className="text-center space-y-2">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-blue-600 mx-auto"></div>
      <p className="text-xs text-blue-600 font-medium">Cargando consulta...</p>
    </div>
  </div>
);

// Solo doctor_male.glb - modelo único para simplificar

// Componente principal del demo
interface MedicalConsultation3DDemoProps {}

export default function MedicalConsultation3DDemo({}: MedicalConsultation3DDemoProps = {}) {
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
    <div className="relative w-full bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100">
      {/* Doctor 3D - 100% del ancho con aspect-ratio responsivo */}
      <div className="relative bg-gray-50 rounded-lg aspect-video">
        <NoSSR fallback={<Demo3DLoading />}>
          <Medical3DCanvas />
        </NoSSR>
        
        {/* Indicador de IA sobre el doctor */}
        <div className="absolute top-3 left-3">
          <div className="bg-blue-600/90 text-white px-3 py-1.5 rounded-full text-sm font-semibold backdrop-blur-sm shadow-lg">
            👨‍⚕️ IA Médica
          </div>
        </div>

        {/* Estado de simulación sobre el doctor */}
        <div className="absolute bottom-3 left-3 right-3">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-lg">
            <div className="flex items-center gap-3">
              <Icon className="h-4 w-4 text-blue-600 animate-pulse" />
              <span className="text-sm font-medium text-gray-700">{currentStep.text}</span>
            </div>
          </div>
        </div>

        {/* Texto explicativo superpuesto en la esquina superior derecha */}
        <div className="absolute top-3 right-3 max-w-xs">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg">
            <h3 className="text-lg font-bold text-gray-800 leading-tight mb-2">
              Consulta Médica Virtual
            </h3>
            
            <div className="space-y-2 text-sm text-gray-700">
              <p className="leading-relaxed">
                <span className="font-semibold text-blue-600">IA analiza</span> tu historia clínica y anamnesis para recomendarte el <span className="font-semibold">especialista exacto</span> que necesitas.
              </p>
              
              <div className="flex items-start gap-2 text-xs text-gray-600 bg-blue-50 rounded-lg p-2">
                <Brain className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <span><span className="font-medium">IA + Historial permanente:</span> Seguimiento continuo de tu salud</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}