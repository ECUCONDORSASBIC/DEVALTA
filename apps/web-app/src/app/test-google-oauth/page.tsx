'use client'

import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton'
import { useAuth } from "@altamedica/auth"
import { AlertCircle, CheckCircle, Info, User } from 'lucide-react'
import { useState } from 'react'

export default function GoogleOAuthTestPage() {
  const { user, loginWithGoogle, isLoading, error } = useAuth()
  const [testResults, setTestResults] = useState<string[]>([])
  const [isTestingGoogle, setIsTestingGoogle] = useState(false)

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`])
  }

  const handleTestGoogleOAuth = async () => {
    setIsTestingGoogle(true)
    clearError()
    addTestResult('🧪 Iniciando test de Google OAuth...')

    try {
      if (!loginWithGoogle) {
        addTestResult('❌ loginWithGoogle no está disponible en el contexto')
        return
      }

      addTestResult('🔑 Llamando a loginWithGoogle()...')
      await loginWithGoogle()
      addTestResult('✅ Google OAuth completado exitosamente')
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido'
      addTestResult(`❌ Error en Google OAuth: ${errorMsg}`)
    } finally {
      setIsTestingGoogle(false)
    }
  }

  const clearResults = () => {
    setTestResults([])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🔐 Test de Google OAuth
          </h1>
          <p className="text-lg text-gray-600">
            Prueba la implementación de Google Sign-In en AltaMedica
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Panel de Control */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
              <User className="w-6 h-6 mr-2 text-blue-600" />
              Estado de Autenticación
            </h2>

            {/* Estado Actual */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">Usuario Actual:</h3>
              {user ? (
                <div className="space-y-2">
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    <span>Autenticado</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p><strong>ID:</strong> {user.id}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Nombre:</strong> {user.name}</p>
                    <p><strong>Rol:</strong> {user.role}</p>
                    {user.avatar && <p><strong>Avatar:</strong> <img src={user.avatar} alt="Avatar" className="w-8 h-8 rounded-full inline-block ml-2" /></p>}
                  </div>
                </div>
              ) : (
                <div className="flex items-center text-gray-500">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  <span>No autenticado</span>
                </div>
              )}
            </div>

            {/* Botón de Google OAuth */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-700 mb-3">Test de Google OAuth:</h3>
              <GoogleSignInButton
                onSuccess={() => addTestResult('✅ Callback onSuccess ejecutado')}
                onError={(error) => addTestResult(`❌ Callback onError: ${error}`)}
                disabled={isTestingGoogle}
                className="mb-4"
              />
              
              {/* Botón de test manual */}
              <button
                onClick={handleTestGoogleOAuth}
                disabled={isTestingGoogle || isLoading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isTestingGoogle ? (
                  <span>🧪 Probando Google OAuth...</span>
                ) : (
                  <span>🧪 Test Manual de Google OAuth</span>
                )}
              </button>
            </div>

            {/* Información de Estado */}
            <div className="space-y-3">
              <div className={`p-3 rounded-lg flex items-center ${isLoading ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-600'}`}>
                <Info className="w-4 h-4 mr-2" />
                <span>Loading: {isLoading ? 'Sí' : 'No'}</span>
              </div>
              
              {error && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  <span>Error: {error}</span>
                </div>
              )}
            </div>
          </div>

          {/* Panel de Resultados */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
                📊 Resultados de Test
              </h2>
              <button
                onClick={clearResults}
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Limpiar
              </button>
            </div>

            <div className="bg-gray-900 text-green-400 rounded-lg p-4 font-mono text-sm max-h-96 overflow-y-auto">
              {testResults.length === 0 ? (
                <div className="text-gray-500 italic">
                  No hay resultados de test aún. Haz clic en "Test Manual de Google OAuth" para comenzar.
                </div>
              ) : (
                <div className="space-y-1">
                  {testResults.map((result, index) => (
                    <div key={index} className="break-words">
                      {result}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Información de Debug */}
        <div className="mt-8 bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">🔧 Información de Debug</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Función loginWithGoogle</h3>
              <p className="text-sm text-blue-600">
                Disponible: {loginWithGoogle ? '✅ Sí' : '❌ No'}
              </p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">AuthContext</h3>
              <p className="text-sm text-green-600">
                Estado: {user ? 'Conectado' : 'Desconectado'}
              </p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-800 mb-2">Entorno</h3>
              <p className="text-sm text-purple-600">
                Modo: {process.env.NODE_ENV || 'production'}
              </p>
            </div>
          </div>
        </div>

        {/* Volver al Login */}
        <div className="mt-8 text-center">
          <a 
            href="/login" 
            className="inline-flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            ← Volver al Login
          </a>
        </div>
      </div>
    </div>
  )
}
