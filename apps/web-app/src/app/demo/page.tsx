'use client';

import React, { useState } from 'react';
import { 
  Calendar, 
  Video, 
  FileText, 
  Heart, 
  Activity, 
  Brain,
  ChevronRight,
  CheckCircle,
  User,
  Clock,
  MessageSquare,
  Pill,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface DemoStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: string;
}

const DEMO_STEPS: DemoStep[] = [
  {
    id: 'consultation',
    title: 'Agenda una consulta',
    description: 'Encuentra el especialista perfecto en segundos',
    icon: <Calendar className="h-6 w-6" />,
    action: 'Buscar médico',
  },
  {
    id: 'video-call',
    title: 'Consulta por video',
    description: 'Conecta con tu médico desde cualquier lugar',
    icon: <Video className="h-6 w-6" />,
    action: 'Iniciar videollamada',
  },
  {
    id: 'diagnosis',
    title: 'Diagnóstico con IA',
    description: 'Recibe análisis precisos asistidos por inteligencia artificial',
    icon: <Brain className="h-6 w-6" />,
    action: 'Ver diagnóstico',
  },
  {
    id: 'prescription',
    title: 'Prescripción digital',
    description: 'Recibe y gestiona tus recetas médicas digitalmente',
    icon: <Pill className="h-6 w-6" />,
    action: 'Ver prescripciones',
  },
  {
    id: 'history',
    title: 'Historial médico',
    description: 'Accede a tu información médica completa y segura',
    icon: <FileText className="h-6 w-6" />,
    action: 'Ver historial',
  },
];

const DemoPage = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const handleStepClick = (index: number) => {
    setActiveStep(index);
    if (!completedSteps.includes(index)) {
      setCompletedSteps([...completedSteps, index]);
    }
  };

  const handleNextStep = () => {
    if (activeStep < DEMO_STEPS.length - 1) {
      handleStepClick(activeStep + 1);
    }
  };

  const renderDemoContent = () => {
    switch (activeStep) {
      case 0: // Consultation
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900">Encuentra tu médico ideal</h3>
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="¿Qué síntomas tienes?"
                    className="flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    defaultValue="Dolor de cabeza frecuente"
                  />
                  <Button className="bg-blue-600 text-white px-6 py-3 rounded-lg">
                    Buscar
                  </Button>
                </div>
                
                <div className="space-y-3">
                  <div className="bg-white rounded-lg p-4 border hover:border-blue-500 cursor-pointer transition-all">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">Dr. Roberto Martínez</h4>
                        <p className="text-sm text-gray-600">Neurólogo • 15 años experiencia</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex text-yellow-400">
                            {"★★★★★".split("").map((star, i) => (
                              <span key={i}>{star}</span>
                            ))}
                          </div>
                          <span className="text-sm text-gray-500">(4.9)</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-green-600 font-semibold">Disponible ahora</p>
                        <p className="text-sm text-gray-600">$50 USD</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 border">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">Dra. Ana García</h4>
                        <p className="text-sm text-gray-600">Médico General • 10 años experiencia</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex text-yellow-400">
                            {"★★★★★".split("").map((star, i) => (
                              <span key={i}>{star}</span>
                            ))}
                          </div>
                          <span className="text-sm text-gray-500">(4.8)</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-blue-600 font-semibold">En 30 min</p>
                        <p className="text-sm text-gray-600">$35 USD</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 1: // Video call
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900">Consulta médica en vivo</h3>
            <div className="bg-gray-900 rounded-xl aspect-video flex items-center justify-center relative">
              <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                EN VIVO
              </div>
              
              <div className="text-center text-white">
                <div className="w-32 h-32 bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <User className="h-16 w-16" />
                </div>
                <p className="text-xl font-semibold">Dr. Roberto Martínez</p>
                <p className="text-gray-300">Neurólogo</p>
              </div>

              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
                <button className="bg-white/20 backdrop-blur text-white p-3 rounded-full">
                  <Video className="h-5 w-5" />
                </button>
                <button className="bg-white/20 backdrop-blur text-white p-3 rounded-full">
                  <MessageSquare className="h-5 w-5" />
                </button>
                <button className="bg-red-500 text-white p-3 rounded-full">
                  <Clock className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-blue-900">Conexión segura y encriptada</p>
                <p className="text-blue-700">Tu consulta está protegida con encriptación de grado médico HIPAA.</p>
              </div>
            </div>
          </div>
        );

      case 2: // AI Diagnosis
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900">Análisis con IA médica</h3>
            
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Brain className="h-8 w-8 text-purple-600" />
                <div>
                  <h4 className="font-semibold text-gray-900">Análisis en progreso</h4>
                  <p className="text-sm text-gray-600">Procesando síntomas y antecedentes...</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-white rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Migraña tensional</span>
                    <span className="text-sm text-purple-600 font-semibold">87% probabilidad</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '87%' }} />
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Cefalea en racimos</span>
                    <span className="text-sm text-blue-600 font-semibold">12% probabilidad</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '12%' }} />
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Otros</span>
                    <span className="text-sm text-gray-600 font-semibold">1% probabilidad</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gray-600 h-2 rounded-full" style={{ width: '1%' }} />
                  </div>
                </div>
              </div>

              <div className="mt-4 p-4 bg-purple-100 rounded-lg">
                <p className="text-sm text-purple-900">
                  <strong>Recomendación:</strong> Basado en el análisis, se recomienda tratamiento preventivo
                  y cambios en el estilo de vida. El médico proporcionará un plan personalizado.
                </p>
              </div>
            </div>
          </div>
        );

      case 3: // Prescription
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900">Prescripción digital</h3>
            
            <div className="bg-white border rounded-xl p-6 shadow-sm">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h4 className="font-semibold text-gray-900">Receta Médica Digital</h4>
                  <p className="text-sm text-gray-600">Fecha: {new Date().toLocaleDateString()}</p>
                </div>
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  Activa
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h5 className="font-semibold">Ibuprofeno 400mg</h5>
                  <p className="text-sm text-gray-600">1 tableta cada 8 horas por 5 días</p>
                  <p className="text-xs text-gray-500 mt-1">Con alimentos</p>
                </div>

                <div className="border-l-4 border-green-500 pl-4">
                  <h5 className="font-semibold">Sumatriptán 50mg</h5>
                  <p className="text-sm text-gray-600">1 tableta al inicio de la migraña</p>
                  <p className="text-xs text-gray-500 mt-1">Máximo 2 dosis por día</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button className="flex-1 bg-blue-600 text-white py-2 rounded-lg">
                  Enviar a farmacia
                </Button>
                <Button className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg">
                  Descargar PDF
                </Button>
              </div>
            </div>

            <div className="bg-amber-50 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-amber-900">Recordatorio automático</p>
                <p className="text-amber-700">Recibirás notificaciones para tomar tus medicamentos a tiempo.</p>
              </div>
            </div>
          </div>
        );

      case 4: // Medical history
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900">Tu historial médico completo</h3>
            
            <div className="space-y-4">
              <div className="bg-white border rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">Resumen de salud</h4>
                  <span className="text-sm text-gray-500">Actualizado hoy</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Heart className="h-4 w-4 text-red-500" />
                      <span className="text-sm font-medium">Presión arterial</span>
                    </div>
                    <p className="text-lg font-semibold">120/80</p>
                    <p className="text-xs text-green-600">Normal</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Activity className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">Frecuencia cardíaca</span>
                    </div>
                    <p className="text-lg font-semibold">72 bpm</p>
                    <p className="text-xs text-green-600">Normal</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border rounded-xl p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Consultas recientes</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b">
                    <div>
                      <p className="font-medium">Consulta Neurología</p>
                      <p className="text-sm text-gray-600">Dr. Roberto Martínez</p>
                    </div>
                    <span className="text-sm text-gray-500">Hoy</span>
                  </div>
                  
                  <div className="flex items-center justify-between py-2 border-b">
                    <div>
                      <p className="font-medium">Chequeo general</p>
                      <p className="text-sm text-gray-600">Dra. Ana García</p>
                    </div>
                    <span className="text-sm text-gray-500">Hace 2 meses</span>
                  </div>
                  
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="font-medium">Análisis de sangre</p>
                      <p className="text-sm text-gray-600">Laboratorio Central</p>
                    </div>
                    <span className="text-sm text-gray-500">Hace 3 meses</span>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4 flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-green-900">Historial seguro de por vida</p>
                  <p className="text-green-700">Tu información médica estará disponible siempre que la necesites, 
                    incluso después de décadas.</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                A
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Demo Interactiva - AltaMedica</h1>
                <p className="text-sm text-gray-600">Experimenta el futuro de la medicina digital</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Paso {activeStep + 1} de {DEMO_STEPS.length}
              </span>
              <Button
                onClick={() => window.location.href = '/register'}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm"
              >
                Comenzar ahora
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Steps sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Flujo de consulta médica</h2>
              
              <div className="space-y-3">
                {DEMO_STEPS.map((step, index) => (
                  <button
                    key={step.id}
                    onClick={() => handleStepClick(index)}
                    className={`w-full text-left p-4 rounded-lg transition-all ${
                      activeStep === index
                        ? 'bg-blue-50 border-2 border-blue-500'
                        : completedSteps.includes(index)
                        ? 'bg-green-50 border border-green-300'
                        : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 ${
                        activeStep === index
                          ? 'text-blue-600'
                          : completedSteps.includes(index)
                          ? 'text-green-600'
                          : 'text-gray-400'
                      }`}>
                        {completedSteps.includes(index) && activeStep !== index ? (
                          <CheckCircle className="h-6 w-6" />
                        ) : (
                          step.icon
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className={`font-semibold ${
                          activeStep === index ? 'text-blue-900' : 'text-gray-900'
                        }`}>
                          {step.title}
                        </h3>
                        <p className={`text-sm mt-1 ${
                          activeStep === index ? 'text-blue-700' : 'text-gray-600'
                        }`}>
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-900 font-medium mb-2">💡 Tip</p>
                <p className="text-sm text-blue-700">
                  Haz clic en cada paso para explorar las funcionalidades. 
                  En la versión real, todo fluye automáticamente.
                </p>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl p-8 shadow-sm">
              {renderDemoContent()}

              <div className="mt-8 flex items-center justify-between">
                <button
                  onClick={() => activeStep > 0 && handleStepClick(activeStep - 1)}
                  className={`px-6 py-2 rounded-lg border ${
                    activeStep === 0
                      ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                  disabled={activeStep === 0}
                >
                  Anterior
                </button>

                <button
                  onClick={handleNextStep}
                  className={`px-6 py-2 rounded-lg flex items-center gap-2 ${
                    activeStep === DEMO_STEPS.length - 1
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {activeStep === DEMO_STEPS.length - 1 ? (
                    <>
                      Comenzar prueba gratis
                      <CheckCircle className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Siguiente
                      <ChevronRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold mb-2">¿Listo para transformar tu salud?</h3>
                  <p className="text-blue-100">
                    Únete a más de 500,000 pacientes que confían en AltaMedica
                  </p>
                </div>
                <Button
                  onClick={() => window.location.href = '/register'}
                  className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100"
                >
                  Empezar ahora
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoPage;