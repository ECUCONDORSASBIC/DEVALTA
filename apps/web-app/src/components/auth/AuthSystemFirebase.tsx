'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

interface AuthFormData {
  email: string
  password: string
  role?: 'patient' | 'doctor' | 'company'
  first_name?: string
  last_name?: string
  phone?: string
  medical_license?: string
  specialty?: string
  company_name?: string
}

export function AuthSystemFirebase() {
  // Nota: Este componente NO usa Firebase Auth, usa API Server directo
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: '',
    role: 'patient'
  })

  const handleInputChange = (field: keyof AuthFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const getDashboardUrl = (role: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'
    
    switch (role) {
      case 'patient':
        return `${baseUrl.replace('3001', '3002')}/dashboard`
      case 'doctor':
        return `${baseUrl.replace('3001', '3003')}/dashboard`
      case 'company':
        return `${baseUrl.replace('3001', '3004')}/dashboard`
      default:
        return '/dashboard'
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register'
      
      const response = await fetch(`${apiUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error en la autenticación')
      }

      // Guardar token en localStorage
      localStorage.setItem('authToken', data.token)
      localStorage.setItem('userRole', data.user.role)
      localStorage.setItem('userData', JSON.stringify(data.user))

      toast.success(
        isLogin ? 'Inicio de sesión exitoso' : 'Registro exitoso'
      )

      // Redireccionar según el rol
      const dashboardUrl = getDashboardUrl(data.user.role)
      router.push(dashboardUrl)

    } catch (error) {
      console.error('Error de autenticación:', error)
      toast.error(error instanceof Error ? error.message : 'Error en la autenticación')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            {isLogin ? 'Iniciar Sesión' : 'Registrarse'}
          </CardTitle>
          <CardDescription>
            {isLogin 
              ? 'Accede a tu cuenta de Altamedica'
              : 'Crea tu cuenta en Altamedica'
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs value={isLogin ? 'login' : 'register'} onValueChange={(value) => setIsLogin(value === 'login')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
              <TabsTrigger value="register">Registrarse</TabsTrigger>
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
                    <Label htmlFor="first_name">Nombre</Label>
                    <Input
                      id="first_name"
                      placeholder="Juan"
                      value={formData.first_name || ''}
                      onChange={(e) => handleInputChange('first_name', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Apellido</Label>
                    <Input
                      id="last_name"
                      placeholder="Pérez"
                      value={formData.last_name || ''}
                      onChange={(e) => handleInputChange('last_name', e.target.value)}
                      required
                    />
                  </div>
                </div>

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
                  <Label htmlFor="role">Tipo de cuenta</Label>
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
                  <Label htmlFor="phone">Teléfono (opcional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 234 567 8900"
                    value={formData.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
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
        </CardContent>
      </Card>
    </div>
  )
}