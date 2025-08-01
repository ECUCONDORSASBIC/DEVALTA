'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

interface AuthFormData {
  email: string
  password: string
  confirmPassword?: string
  role?: 'patient' | 'doctor' | 'company'
  first_name?: string
  last_name?: string
  phone?: string
  medical_license?: string
  specialty?: string
  company_name?: string
}

export function AuthSystemAPI() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'patient'
  })

  const handleInputChange = (field: keyof AuthFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

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
    if (!isLogin) {
      if (!formData.first_name || !formData.last_name) {
        toast.error('Nombre y apellido son requeridos')
        return false
      }
      if (formData.password !== formData.confirmPassword) {
        toast.error('Las contraseñas no coinciden')
        return false
      }
      if (formData.password && formData.password.length < 8) {
        toast.error('La contraseña debe tener al menos 8 caracteres')
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
      
      // Preparar datos según el tipo de operación
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
            last_name: formData.last_name,
            phone: formData.phone,
            medical_license: formData.medical_license,
            specialty: formData.specialty,
            company_name: formData.company_name
          }
      
      console.log('Enviando datos:', { endpoint, data: submitData })
      
      const response = await fetch(`${apiUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      const data = await response.json()
      console.log('Respuesta del servidor:', data)

      if (!response.ok) {
        throw new Error(data.error || 'Error en la autenticación')
      }

      // Para login, guardar token y redireccionar
      if (isLogin && data.token) {
        localStorage.setItem('authToken', data.token)
        localStorage.setItem('userRole', data.user.role)
        localStorage.setItem('userData', JSON.stringify(data.user))

        toast.success('Inicio de sesión exitoso')
        
        // Redireccionar según el rol
        const dashboardUrl = getDashboardUrl(data.user.role)
        console.log('Redirigiendo a:', dashboardUrl)
        window.location.href = dashboardUrl
      } else {
        // Para registro, mostrar éxito y cambiar a login
        toast.success('Registro exitoso. Ahora puedes iniciar sesión.')
        setIsLogin(true)
        setFormData({
          email: formData.email,
          password: '',
          confirmPassword: '',
          role: 'patient'
        })
      }

    } catch (error) {
      console.error('Error de autenticación:', error)
      toast.error(error instanceof Error ? error.message : 'Error en la autenticación')
    } finally {
      setIsLoading(false)
    }
  }

  // Limpiar formulario al cambiar de tab
  useEffect(() => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      role: 'patient'
    })
  }, [isLogin])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </CardTitle>
          <CardDescription>
            {isLogin 
              ? 'Accede a tu cuenta de Altamedica'
              : 'Únete a Altamedica'
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs value={isLogin ? 'login' : 'register'} onValueChange={(value) => setIsLogin(value === 'login')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
              <TabsTrigger value="register">Crear Cuenta</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Iniciando sesión...
                    </>
                  ) : (
                    'Iniciar Sesión'
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register" className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">Nombre *</Label>
                    <Input
                      id="first_name"
                      placeholder="Eduardo"
                      value={formData.first_name || ''}
                      onChange={(e) => handleInputChange('first_name', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Apellido *</Label>
                    <Input
                      id="last_name"
                      placeholder="Marques"
                      value={formData.last_name || ''}
                      onChange={(e) => handleInputChange('last_name', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+5491124099147"
                    value={formData.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Tipo de Usuario *</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => handleInputChange('role', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona tu tipo de cuenta" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="patient">Paciente</SelectItem>
                      <SelectItem value="doctor">Médico</SelectItem>
                      <SelectItem value="company">Empresa/Clínica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.role === 'doctor' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="medical_license">Licencia Médica</Label>
                      <Input
                        id="medical_license"
                        placeholder="12345"
                        value={formData.medical_license || ''}
                        onChange={(e) => handleInputChange('medical_license', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="specialty">Especialidad</Label>
                      <Input
                        id="specialty"
                        placeholder="Cardiología"
                        value={formData.specialty || ''}
                        onChange={(e) => handleInputChange('specialty', e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {formData.role === 'company' && (
                  <div className="space-y-2">
                    <Label htmlFor="company_name">Nombre de la Empresa</Label>
                    <Input
                      id="company_name"
                      placeholder="Clínica Altamedica"
                      value={formData.company_name || ''}
                      onChange={(e) => handleInputChange('company_name', e.target.value)}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="eeecucondor@gmail.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Ab.12345"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      required
                      minLength={8}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Mínimo 8 caracteres, una mayúscula, una minúscula y un número
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.confirmPassword || ''}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creando cuenta...
                    </>
                  ) : (
                    'Crear Cuenta'
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <p className="text-center text-sm text-gray-600 mt-4">
            {isLogin ? (
              <>
                ¿No tienes cuenta?{' '}
                <button 
                  onClick={() => setIsLogin(false)}
                  className="text-blue-600 hover:underline font-medium"
                >
                  Crear cuenta
                </button>
              </>
            ) : (
              <>
                ¿Ya tienes cuenta?{' '}
                <button 
                  onClick={() => setIsLogin(true)}
                  className="text-blue-600 hover:underline font-medium"
                >
                  Inicia sesión
                </button>
              </>
            )}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}