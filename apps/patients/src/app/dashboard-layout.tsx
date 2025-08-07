/**
 * dashboard-layout.tsx - Layout Protegido para Dashboard de Paciente
 * Proyecto: Altamedica Pacientes
 * Diseño: Ultra-conservador con autenticación robusta
 */

"use client";

import React, { ReactNode } from "react";
// ProtectedRoute no disponible en auth-service
import { AuthProvider } from "@altamedica/auth';

interface DashboardLayoutProps {
  children: ReactNode;
}

/**
 * DashboardLayout - Layout con protección de autenticación
 * Envuelve el dashboard en verificación de autenticación obligatoria
 */
const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <AuthProvider>
      <ProtectedRoute
        requiredRole={["patient", "doctor", "admin"]}
        fallback={
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-600 text-2xl">🚫</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Acceso Denegado
              </h2>
              <p className="text-gray-600 mb-6">
                No tienes permisos para acceder a esta sección. Solo pacientes
                autenticados pueden ver el dashboard.
              </p>
              <button
                onClick={() => (window.location.href = "/login")}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Iniciar Sesión
              </button>
            </div>
          </div>
        }
      >
        <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <main className="flex-1">{children}</main>
          {/* La barra lateral se renderizará aquí, pero su contenido se define en page.tsx */}
        </div>
      </ProtectedRoute>
    </AuthProvider>
  );
};

export default DashboardLayout; 