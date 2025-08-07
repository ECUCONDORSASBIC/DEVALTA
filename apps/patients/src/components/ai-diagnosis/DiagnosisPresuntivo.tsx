"use client";

import React, { useState, useEffect } from 'react';
import {
  Brain,
  Info,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Shield,
  Calendar
} from 'lucide-react';
import { ButtonCorporate } from '@altamedica/ui';
import { useRouter } from 'next/navigation';

interface DiagnosisRestriction {
  canUse: boolean;
  nextAvailableDate?: string;
  daysRemaining?: number;
  totalDiagnosesCount: number;
  lastDiagnosisDate?: string;
}

interface QuickSymptom {
  id: string;
  text: string;
  icon: string;
}

const QUICK_SYMPTOMS: QuickSymptom[] = [
  { id: '1', text: 'Dolor de cabeza', icon: '🤕' },
  { id: '2', text: 'Fiebre', icon: '🌡️' },
  { id: '3', text: 'Tos', icon: '🤧' },
  { id: '4', text: 'Dolor de garganta', icon: '👄' },
  { id: '5', text: 'Fatiga', icon: '😴' },
  { id: '6', text: 'Náuseas', icon: '🤢' }
];

export default function DiagnosisPresuntivo() {
  const router = useRouter();
  const [restriction, setRestriction] = useState<DiagnosisRestriction | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [showDataUsageInfo, setShowDataUsageInfo] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<string | null>(null);

  // Simulación de verificación de restricciones (en producción vendría del API)
  useEffect(() => {
    checkRestrictions();
  }, []);

  const checkRestrictions = () => {
    // Simular datos de restricción
    const lastDate = localStorage.getItem('lastDiagnosisDate');
    const count = parseInt(localStorage.getItem('diagnosisCount') || '0');
    
    if (lastDate) {
      const daysSince = Math.floor((Date.now() - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24));
      const canUse = daysSince >= 10;
      
      setRestriction({
        canUse,
        nextAvailableDate: canUse ? undefined : new Date(new Date(lastDate).getTime() + (10 * 24 * 60 * 60 * 1000)).toLocaleDateString(),
        daysRemaining: canUse ? 0 : 10 - daysSince,
        totalDiagnosesCount: count,
        lastDiagnosisDate: lastDate
      });
    } else {
      setRestriction({
        canUse: true,
        totalDiagnosesCount: 0
      });
    }
  };

  const toggleSymptom = (symptomId: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptomId) 
        ? prev.filter(id => id !== symptomId)
        : [...prev, symptomId]
    );
  };

  const handleQuickAnalysis = async () => {
    if (!restriction?.canUse || selectedSymptoms.length === 0) return;

    setIsAnalyzing(true);
    
    // Simular análisis (en producción llamaría al API)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Actualizar restricciones locales
    localStorage.setItem('lastDiagnosisDate', new Date().toISOString());
    localStorage.setItem('diagnosisCount', String((restriction?.totalDiagnosesCount || 0) + 1));
    
    setIsAnalyzing(false);
    setLastAnalysis('Posible infección respiratoria leve. Se recomienda consulta con medicina general.');
    
    // Redirigir a la página completa de diagnóstico después de 3 segundos
    setTimeout(() => {
      router.push('/ai-diagnosis');
    }, 3000);
  };

  const canUseDiagnosis = restriction?.canUse ?? true;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-sky-100 p-4 sm:p-6 h-full flex flex-col">
      {/* Header - Optimizado para móvil */}
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="p-1.5 sm:p-2 bg-gradient-to-br from-sky-500 to-blue-600 rounded-lg">
            <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900">Diagnóstico IA</h3>
            <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Análisis rápido de síntomas</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowDataUsageInfo(!showDataUsageInfo)}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Info className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Aviso de uso de datos - Optimizado para móvil */}
      {showDataUsageInfo && (
        <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start space-x-2">
            <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-blue-800">
              <p className="font-medium mb-0.5 sm:mb-1">Uso de datos para investigación</p>
              <p className="text-xs">
                Datos anónimos para mejorar la salud poblacional.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Estado de restricción */}
      {restriction && !canUseDiagnosis && (
        <div className="mb-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-amber-600" />
            <div className="text-sm">
              <p className="font-medium text-amber-800">
                Próximo diagnóstico disponible en {restriction.daysRemaining} días
              </p>
              <p className="text-xs text-amber-700">
                Límite: 1 diagnóstico cada 10 días
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Síntomas rápidos - Optimizado para móvil */}
      <div className="flex-1 space-y-3 sm:space-y-4">
        <div>
          <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2">
            Selecciona síntomas:
          </p>
          <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
            {QUICK_SYMPTOMS.map(symptom => (
              <button
                key={symptom.id}
                onClick={() => toggleSymptom(symptom.id)}
                disabled={!canUseDiagnosis}
                className={`p-1.5 sm:p-2 rounded-lg border text-xs sm:text-sm font-medium transition-all ${
                  selectedSymptoms.includes(symptom.id)
                    ? 'bg-sky-100 border-sky-300 text-sky-700'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-sky-200'
                } ${!canUseDiagnosis ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span className="mr-0.5 sm:mr-1 text-sm sm:text-base">{symptom.icon}</span>
                <span className="hidden sm:inline">{symptom.text}</span>
                <span className="sm:hidden">{symptom.text.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Resultado rápido */}
        {lastAnalysis && (
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-green-800 mb-1">Análisis completado</p>
                <p className="text-green-700">{lastAnalysis}</p>
              </div>
            </div>
          </div>
        )}

        {/* Estadísticas */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <Activity className="w-4 h-4" />
            <span>Diagnósticos realizados: {restriction?.totalDiagnosesCount || 0}</span>
          </div>
          {restriction?.lastDiagnosisDate && (
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>Último: {new Date(restriction.lastDiagnosisDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </div>

      {/* Botones de acción */}
      <div className="mt-4 space-y-2">
        <ButtonCorporate
          variant="primary"
          className="w-full"
          onClick={handleQuickAnalysis}
          disabled={!canUseDiagnosis || selectedSymptoms.length === 0 || isAnalyzing}
        >
          {isAnalyzing ? (
            <span className="flex items-center justify-center">
              <Activity className="w-4 h-4 mr-2 animate-pulse" />
              Analizando síntomas...
            </span>
          ) : (
            <span className="flex items-center justify-center">
              <Brain className="w-4 h-4 mr-2" />
              Obtener diagnóstico rápido
            </span>
          )}
        </ButtonCorporate>
        
        <ButtonCorporate
          variant="ghost"
          className="w-full"
          onClick={() => router.push('/ai-diagnosis')}
        >
          <span className="flex items-center justify-center text-sm">
            Análisis completo con IA
            <ChevronRight className="w-4 h-4 ml-1" />
          </span>
        </ButtonCorporate>
      </div>
    </div>
  );
}