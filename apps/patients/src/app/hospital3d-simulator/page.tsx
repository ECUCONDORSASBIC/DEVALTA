// 🏥 PÁGINA DEL SIMULADOR HOSPITALARIO 3D
// Integración con MCP y sistema AltaMedica
// PROACTIVO: <350 líneas, optimizado, inmersivo

"use client";

import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import PatientLayout from "../../components/layout/PatientLayout";
import {
  Activity,
  Gamepad2,
  Heart,
  Info,
  Play,
  Settings,
  Volume2,
  VolumeX,
} from "lucide-react";

// 🎮 IMPORTACIÓN DINÁMICA DEL SIMULADOR 3D
// const Hospital3DSimulator = dynamic(
//   () => import('../../components/Hospital3DSimulator'),
//   {
//     ssr: false,
//     loading: () => (
//       <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-blue-600 mx-auto mb-6"></div>
//           <h2 className="text-2xl font-bold text-gray-900 mb-2">Cargando Simulador 3D</h2>
//           <p className="text-gray-600">Preparando experiencia inmersiva...</p>
//           <div className="mt-4 flex items-center justify-center space-x-2">
//             <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
//             <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
//             <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
//           </div>
//         </div>
//       </div>
//     )
//   }
// );

// 🎯 COMPONENTE DE INTRODUCCIÓN
function SimulatorIntro({ onStart }: { onStart: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
            <div className="flex items-center justify-center mb-4">
              <Heart className="w-12 h-12 text-red-400 mr-4" />
              <h1 className="text-4xl font-bold">Hospital AltaMedica 3D</h1>
            </div>
            <p className="text-xl text-center text-blue-100">
              Experiencia inmersiva de simulación hospitalaria
            </p>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Características */}
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Activity className="w-6 h-6 text-blue-600 mr-2" />
                  Características
                </h2>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></div>
                    <span className="text-gray-700">
                      Navegación automática por el hospital
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3"></div>
                    <span className="text-gray-700">
                      Interacción con profesionales médicos
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 mr-3"></div>
                    <span className="text-gray-700">
                      Anamnesis interactiva con IA
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-red-600 rounded-full mt-2 mr-3"></div>
                    <span className="text-gray-700">
                      Entorno 3D realista y educativo
                    </span>
                  </li>
                </ul>
              </div>

              {/* Controles */}
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Gamepad2 className="w-6 h-6 text-purple-600 mr-2" />
                  Controles
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">← →</span>
                    <span className="text-gray-600">
                      Mirar izquierda/derecha
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">ESPACIO</span>
                    <span className="text-gray-600">Pausar/Reanudar</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">ENTER</span>
                    <span className="text-gray-600">Interactuar con NPCs</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Profesionales */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Conoce a Nuestros Profesionales
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-4xl mb-2">👨‍⚕️</div>
                  <h3 className="font-semibold text-gray-900">
                    Dr. Eduardo Marques
                  </h3>
                  <p className="text-sm text-gray-600">Director Médico</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-4xl mb-2">👩‍⚕️</div>
                  <h3 className="font-semibold text-gray-900">
                    Dra. Reina Mosquera
                  </h3>
                  <p className="text-sm text-gray-600">Cardióloga</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-4xl mb-2">🧙‍♂️</div>
                  <h3 className="font-semibold text-gray-900">
                    Dr. Hipócrates
                  </h3>
                  <p className="text-sm text-gray-600">Medicina General</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-4xl mb-2">👩‍⚕️</div>
                  <h3 className="font-semibold text-gray-900">
                    Enf. Ana Rodríguez
                  </h3>
                  <p className="text-sm text-gray-600">Enfermera Jefe</p>
                </div>
              </div>
            </div>

            {/* Botón de inicio */}
            <div className="text-center">
              <button
                onClick={onStart}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                <Play className="w-6 h-6 mr-2" />
                Iniciar Simulador 3D
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 🎮 COMPONENTE PRINCIPAL
export default function Hospital3DSimulatorPage() {
  const [showIntro, setShowIntro] = React.useState(true);
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const startSimulator = () => {
    setShowIntro(false);
    // Intentar activar fullscreen
    if (document.documentElement.requestFullscreen) {
      document.documentElement
        .requestFullscreen()
        .then(() => {
          setIsFullscreen(true);
        })
        .catch(() => {
          console.log("No se pudo activar pantalla completa");
        });
    }
  };

  const exitSimulator = () => {
    setShowIntro(true);
    if (document.exitFullscreen && isFullscreen) {
      document
        .exitFullscreen()
        .then(() => {
          setIsFullscreen(false);
        })
        .catch(() => {
          console.log("No se pudo salir de pantalla completa");
        });
    }
  };

  // Mostrar introducción o simulador
  if (showIntro) {
    return <SimulatorIntro onStart={startSimulator} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-gray-500 text-xl">
        Simulador 3D de hospital (pendiente de implementación)
      </div>
    </div>
  );
}
