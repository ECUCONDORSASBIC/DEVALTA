'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'

interface AuthFormData {
  email: string
  password: string
  confirmPassword?: string
  role?: 'patient' | 'doctor' | 'company'
  first_name?: string
  last_name?: string
}

export default function SimpleAuthSystemAPI() {
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const router = useRouter()

  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'patient',
    first_name: '',
    last_name: ''
  })

  const getDashboardUrl = (role: string) => {
    const baseUrl = 'http://localhost'
    
    switch (role) {
      case 'patient':
        return `${baseUrl}:3002/dashboard`
      case 'doctor':
        return `${baseUrl}:3003/dashboard`
      case 'company':
        return `${baseUrl}:3004/dashboard`
      default:
        return '/dashboard'
    }
  }

  const validateForm = () => {
    setErrorMessage('')
    
    if (!formData.email || !formData.password) {
      setErrorMessage('Email y contraseña son requeridos')
      return false
    }
    
    if (!isLogin) {
      if (!formData.first_name || !formData.last_name) {
        setErrorMessage('Nombre y apellido son requeridos')
        return false
      }
      if (formData.password !== formData.confirmPassword) {
        setErrorMessage('Las contraseñas no coinciden')
        return false
      }
      if (formData.password && formData.password.length < 8) {
        setErrorMessage('La contraseña debe tener al menos 8 caracteres')
        return false
      }
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)

    try {
      const apiUrl = 'http://localhost:3001'
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register'
      
      const submitData = isLogin 
        ? { 
            email: formData.email, 
            password: formData.password 
          }
        : {
            email: formData.email,
            password: formData.password,
            role: formData.role,
            first_name: formData.first_name,
            last_name: formData.last_name
          }

      const response = await fetch(`${apiUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData)
      })

      const data = await response.json()

      if (response.ok) {
        if (isLogin) {
          setSuccessMessage('Inicio de sesión exitoso')
          localStorage.setItem('auth_token', data.token)
          localStorage.setItem('user_data', JSON.stringify(data.user))
          
          setTimeout(() => {
            window.location.href = getDashboardUrl(data.user.role)
          }, 1500)
        } else {
          setSuccessMessage('Registro exitoso. Ahora puedes iniciar sesión.')
          setTimeout(() => setIsLogin(true), 2000)
        }
      } else {
        setErrorMessage(data.error || 'Error en la autenticación')
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Error en la autenticación')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof AuthFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </CardTitle>
            <CardDescription>
              {isLogin 
                ? 'Accede a tu cuenta de AltaMedica' 
                : 'Únete a la plataforma de telemedicina más avanzada'
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {errorMessage && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {errorMessage}
              </div>
            )}
            
            {successMessage && (
              <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                {successMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="tu@email.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <>
                  <div>
                    <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="first_name">Nombre</Label>
                    <Input
                      id="first_name"
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => handleInputChange('first_name', e.target.value)}
                      placeholder="Tu nombre"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="last_name">Apellido</Label>
                    <Input
                      id="last_name"
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => handleInputChange('last_name', e.target.value)}
                      placeholder="Tu apellido"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="role">Tipo de Usuario</Label>
                    <select
                      id="role"
                      value={formData.role}
                      onChange={(e) => handleInputChange('role', e.target.value as 'patient' | 'doctor' | 'company')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="patient">Paciente</option>
                      <option value="doctor">Médico</option>
                      <option value="company">Empresa</option>
                    </select>
                  </div>
                </>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? '⏳ Procesando...' : (isLogin ? 'Iniciar Sesión' : 'Registrarse')}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-blue-600 hover:text-blue-500 text-sm"
              >
                {isLogin 
                  ? '¿No tienes cuenta? Regístrate aquí' 
                  : '¿Ya tienes cuenta? Inicia sesión'
                }
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}