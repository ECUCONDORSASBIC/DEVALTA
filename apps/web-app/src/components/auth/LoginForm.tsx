'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { GoogleSignInButton } from './GoogleSignInButton'
import { useRateLimiter } from '@/lib/rate-limiter'
import { AlertCircle, Lock } from 'lucide-react'

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { checkLimit, recordAttempt, resetLimit } = useRateLimiter()
  const [showCaptcha, setShowCaptcha] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    // Verificar rate limit
    const limitCheck = checkLimit(email)
    
    if (!limitCheck.allowed) {
      const minutes = Math.ceil(limitCheck.blockedSeconds / 60)
      setError(`Demasiados intentos fallidos. Por favor, espera ${minutes} minutos antes de intentar nuevamente.`)
      
      // Mostrar captcha después de 3 intentos
      if (limitCheck.attemptsRemaining <= 2) {
        setShowCaptcha(true)
      }
      return
    }
    
    // Advertencia si quedan pocos intentos
    if (limitCheck.attemptsRemaining <= 2 && limitCheck.attemptsRemaining > 0) {
      setError(`Atención: Te quedan ${limitCheck.attemptsRemaining} intentos antes del bloqueo temporal.`)
    }
    
    setLoading(true)

    try {
      console.log('[LoginForm] Intentando login SSO para:', email)
      
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3011'
      const response = await fetch(`${apiBaseUrl}/api/v1/auth/sso`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })

      const result = await response.json()

      if (!response.ok) {
        // Registrar intento fallido
        recordAttempt(email)
        const errorMessage = result.error?.message || result.message || 'Error al iniciar sesión'
        throw new Error(errorMessage)
      }

      console.log('[LoginForm] Login SSO exitoso:', result.data?.user?.email)

      // Login exitoso - resetear rate limit
      resetLimit(email)
      
      // Extraer datos de la respuesta SSO
      const responseData = result.data || result
      
      // Guardar tokens SSO
      if (responseData.token) {
        localStorage.setItem('altamedica_token', responseData.token)
      }
      if (responseData.refreshToken) {
        localStorage.setItem('altamedica_refresh_token', responseData.refreshToken)
      }
      if (responseData.user) {
        localStorage.setItem('altamedica_user', JSON.stringify(responseData.user))
      }

      // Redirigir basado en el rol del usuario o URL especificada
      const redirectUrl = responseData.redirectUrl || 
                         (responseData.user?.role === 'patient' ? 'http://localhost:3003/dashboard' :
                          responseData.user?.role === 'doctor' ? 'http://localhost:3002/dashboard' :
                          responseData.user?.role === 'company' ? 'http://localhost:3004/dashboard' :
                          responseData.user?.role === 'admin' ? 'http://localhost:3005/dashboard' :
                          '/dashboard')
      
      console.log('[LoginForm] Redirigiendo a:', redirectUrl)
      
      // Si la URL es externa (diferente app), hacer redirect completo
      if (redirectUrl.startsWith('http')) {
        window.location.href = redirectUrl
      } else {
        router.push(redirectUrl)
      }
    } catch (err) {
      // Registrar intento fallido
      recordAttempt(email)
      
      // Verificar intentos restantes después del fallo
      const limitCheck = checkLimit(email)
      let errorMessage = err instanceof Error ? err.message : 'Error al iniciar sesión'
      
      if (limitCheck.attemptsRemaining === 0) {
        const minutes = Math.ceil(limitCheck.blockedSeconds / 60)
        errorMessage += `. Cuenta bloqueada temporalmente por ${minutes} minutos.`
      } else if (limitCheck.attemptsRemaining <= 2) {
        errorMessage += `. Te quedan ${limitCheck.attemptsRemaining} intentos.`
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-altamedica-lg border border-neutral-200">
        <div>
          <h2 className="mt-6 text-center text-3xl font-display font-bold text-neutral-900">
            Acceso al Sistema de Gestión
          </h2>
          <p className="mt-2 text-center text-sm text-neutral-600">
            Ingresa a tu plataforma sanitaria o{' '}
            <Link href="/register" className="font-medium text-primary-500 hover:text-primary-600 transition-colors">
              regístrate aquí
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className={`rounded-lg p-4 border ${
              error.includes('bloqueada') ? 'bg-alert-50 border-alert-300' : 
              error.includes('quedan') ? 'bg-orange-50 border-orange-300' : 
              'bg-red-50 border-red-300'
            }`}>
              <div className="flex items-start">
                {error.includes('bloqueada') ? (
                  <Lock className="w-5 h-5 text-alert-500 mt-0.5 mr-3 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                )}
                <div>
                  <h3 className={`text-sm font-semibold ${
                    error.includes('bloqueada') ? 'text-alert-800' : 
                    error.includes('quedan') ? 'text-orange-800' : 
                    'text-red-800'
                  }`}>
                    {error.includes('bloqueada') ? 'Cuenta Bloqueada Temporalmente' : 
                     error.includes('quedan') ? 'Advertencia de Seguridad' : 
                     'Error al iniciar sesión'}
                  </h3>
                  <div className={`mt-1 text-sm ${
                    error.includes('bloqueada') ? 'text-alert-700' : 
                    error.includes('quedan') ? 'text-orange-700' : 
                    'text-red-700'
                  }`}>
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-neutral-300 placeholder-neutral-500 text-neutral-900 rounded-t-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm transition-all"
                placeholder="Email médico o corporativo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-neutral-300 placeholder-neutral-500 text-neutral-900 rounded-b-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm transition-all"
                placeholder="Contraseña de acceso"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-neutral-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-neutral-900">
                Recordarme
              </label>
            </div>

            <div className="text-sm">
              <Link href="/forgot-password" className="font-medium text-primary-500 hover:text-primary-600 transition-colors">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-base font-medium rounded-lg text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-altamedica hover:shadow-altamedica-lg transition-all active:scale-95"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                'Iniciar sesión'
              )}
            </button>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">O continúa con</span>
              </div>
            </div>

            <div className="mt-6">
              <GoogleSignInButton />
            </div>
          </div>
        </form>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Al iniciar sesión, aceptas nuestros{' '}
            <Link href="/terms" className="text-blue-600 hover:text-blue-500">
              Términos de Servicio
            </Link>{' '}
            y{' '}
            <Link href="/privacy" className="text-blue-600 hover:text-blue-500">
              Política de Privacidad
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}