'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, Eye, EyeOff, Loader2, Shield, Heart, Users, ArrowRight } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { getDashboardUrl } from '@/config/app-urls'
import { useRedirection } from '@/hooks/useRedirection'
import RedirectingLoader from '@/components/common/RedirectingLoader'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  
  const { user, userProfile, signIn, signInWithGoogle, loading, error } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [localError, setLocalError] = useState('')
  const [success, setSuccess] = useState('')
  const { isRedirecting } = useRedirection({ showLoader: true })

  // Redirigir si ya está autenticado (solo al cargar la página)
  useEffect(() => {
    console.log('🔄 [LoginPage] useEffect ejecutado:', {
      user: user?.uid,
      userProfile: userProfile?.role,
      loading,
      isSubmitting
    });
    
    // Solo redirigir si el usuario ya estaba autenticado antes de llegar a esta página
    if (user && userProfile && !loading && !isSubmitting) {
      console.log('🎯 [LoginPage] Usuario autenticado detectado, preparando redirección...');
      const dashboardUrl = userProfile.role === 'patient' 
        ? '/dashboard' // Los pacientes se quedan en web-app
        : getDashboardUrl(userProfile.role as any);
      
      console.log('🚀 [LoginPage] URL de redirección:', dashboardUrl);
      
      // Si es una URL externa, usar window.location
      if (dashboardUrl.startsWith('http')) {
        console.log('🌐 [LoginPage] Redirección externa detectada');
        window.location.href = dashboardUrl;
      } else {
        console.log('📍 [LoginPage] Redirección interna detectada');
        router.push(dashboardUrl);
      }
    }
  }, [user, userProfile, loading])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('📝 [LoginPage] Formulario enviado');
    console.log('📧 [LoginPage] Email:', email);
    
    setIsSubmitting(true)
    setLocalError('')

    try {
      console.log('🔐 [LoginPage] Llamando a signIn...');
      await signIn(email, password)
      console.log('✅ [LoginPage] signIn completado exitosamente');
      setSuccess('¡Login exitoso! Redirigiendo...')
    } catch (error) {
      console.error('❌ [LoginPage] Error en login:', error);
      // El error ya se muestra con toast desde el contexto
      setLocalError((error as Error).message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true)
    setLocalError('')

    try {
      await signInWithGoogle()
      setSuccess('¡Login con Google exitoso!')
    } catch (error) {
      // El error ya se muestra con toast desde el contexto
      setLocalError((error as Error).message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Mostrar loader durante redirección
  if (isRedirecting || (user && userProfile && !loading)) {
    const targetApp = userProfile?.role === 'doctor' ? 'Portal Médico' 
      : userProfile?.role === 'company' ? 'Portal Empresarial'
      : userProfile?.role === 'admin' ? 'Panel Administrativo'
      : undefined;
    
    return <RedirectingLoader targetApp={targetApp} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <div className="flex min-h-screen">
        {/* Mitad Izquierda - Información */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-cyan-600 p-12 items-center justify-center">
          <div className="max-w-lg text-white">
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-4">🏥 AltaMedica</h1>
              <h2 className="text-2xl font-semibold mb-6">Tu Salud, Nuestra Prioridad</h2>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Heart className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Atención Médica Integral</h3>
                  <p className="text-blue-100">Conectamos pacientes con especialistas calificados para una atención médica de calidad las 24 horas.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Shield className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Datos Protegidos</h3>
                  <p className="text-blue-100">Tu información médica está protegida con encriptación de nivel hospitalario y cumplimiento HIPAA.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Red de Especialistas</h3>
                  <p className="text-blue-100">Accede a más de 1,000 médicos especialistas y profesionales de la salud certificados.</p>
                </div>
              </div>
            </div>
            
            <div className="mt-12 p-6 bg-white/10 rounded-2xl backdrop-blur-sm">
              <p className="text-sm text-blue-100 italic">
                "AltaMedica ha transformado la forma en que accedo a atención médica especializada. 
                La plataforma es intuitiva y los doctores son excepcionales."
              </p>
              <div className="mt-4 text-sm font-medium">
                - María González, Paciente verificada
              </div>
            </div>
          </div>
        </div>

        {/* Mitad Derecha - Funcionalidad */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-3xl shadow-2xl p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Iniciar Sesión</h2>
                <p className="text-gray-600">Accede a tu cuenta médica segura</p>
              </div>

              {(localError || error) && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs">!</span>
                    </div>
                    <p className="text-red-600 text-sm">{localError || error}</p>
                  </div>
                </div>
              )}

              {success && (
                <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <p className="text-green-600 text-sm">{success}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      required
                      className="w-full py-3 px-4 pl-12 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full py-3 px-4 pl-12 pr-12 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                      Recordarme
                    </label>
                  </div>

                  <div className="text-sm">
                    <Link href="/forgot-password" className="text-blue-600 hover:text-blue-800 font-medium">
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isSubmitting || loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Procesando...</span>
                    </>
                  ) : (
                    <>
                      <span>Iniciar Sesión</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              {/* OAuth Buttons */}
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">O continúa con</span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-3">
                  <button
                    onClick={handleGoogleSignIn}
                    disabled={isSubmitting || loading}
                    className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-all duration-200 disabled:opacity-50"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="ml-2">Continuar con Google</span>
                  </button>
                </div>
              </div>

              <div className="mt-6 text-center">
                <p className="text-gray-600 text-sm">
                  ¿No tienes cuenta?{' '}
                  <Link href="/register" className="text-blue-600 hover:text-blue-800 font-medium">
                    Regístrate aquí
                  </Link>
                </p>
              </div>

              <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <h3 className="text-sm font-semibold text-blue-800 mb-2">👤 Usuario de Prueba:</h3>
                <div className="space-y-1 text-xs text-blue-700">
                  <p>Email: <code className="bg-blue-200 px-2 py-1 rounded">eeecucondor@gmail.com</code></p>
                  <p>Password: <code className="bg-blue-200 px-2 py-1 rounded">test123</code></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}