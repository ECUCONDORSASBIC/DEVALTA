/**
 * API Server Root Page
 * Provides basic information about the API server
 */

export default function APIServerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full mx-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🏥 ALTAMEDICA API Server
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Servidor de API para la plataforma médica ALTAMEDICA
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-blue-900 mb-2">
                🩺 Endpoints Médicos
              </h3>
              <p className="text-blue-700">
                APIs para gestión de doctores, pacientes y citas médicas
              </p>
            </div>
            
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-green-900 mb-2">
                🔔 Notificaciones
              </h3>
              <p className="text-green-700">
                Sistema de notificaciones en tiempo real
              </p>
            </div>
            
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-purple-900 mb-2">
                💼 Empleos Médicos
              </h3>
              <p className="text-purple-700">
                API para ofertas laborales en el sector médico
              </p>
            </div>
            
            <div className="bg-orange-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-orange-900 mb-2">
                📊 Analytics
              </h3>
              <p className="text-orange-700">
                Métricas y estadísticas de la plataforma
              </p>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              Status: <span className="text-green-600 font-semibold">Operational</span>
            </p>
            <p className="text-sm text-gray-600">
              Version: 1.0.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}