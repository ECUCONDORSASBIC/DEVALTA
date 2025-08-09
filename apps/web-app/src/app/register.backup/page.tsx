'use client'

import { useState } from 'react'
import { Eye, EyeOff, Mail, Lock, User, Phone, Stethoscope, ArrowRight, Heart, Award, Users } from 'lucide-react'
import { Button } from '@altamedica/ui'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

type UserRole = 'patient' | 'doctor' | 'company'

const roleConfig = {
  patient: {
    icon: Heart,
    title: 'Registro de Paciente',
    description: 'Accede a consultas médicas, gestiona tu historial y recibe atención 24/7',
    color: 'text-primary-500'
  },
  doctor: {
    icon: Stethoscope,
    title: 'Registro de Médico',
    description: 'Gestiona pacientes, realiza teleconsultas y accede a herramientas de IA',
    color: 'text-success-500'
  },
  company: {
    icon: Award,
    title: 'Registro de Empresa',
    description: 'Contrata servicios médicos para empleados y gestiona salud corporativa',
    color: 'text-warning-500'
  }
}

export default function RegisterPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<UserRole>(
    (searchParams?.get('role') as UserRole) || 'patient'
  )
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    speciality: '', // Para médicos
    licenseNumber: '', // Para médicos
    companyName: '', // Para empresas
    taxId: '', // Para empresas
    agreeTerms: false,
    agreePrivacy: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const currentRole = roleConfig[selectedRole]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Validaciones básicas
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden')
      setIsLoading(false)
      return
    }

    if (!formData.agreeTerms || !formData.agreePrivacy) {
      setError('Debes aceptar los términos y condiciones')
      setIsLoading(false)
      return
    }

    try {
      console.log('[Register] Registrando usuario:', { 
        role: selectedRole, 
        email: formData.email 
      })
      
      // Mock registration logic
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      console.log('[Register] Registro exitoso')
      // Redirigir a login o dashboard
      router.push('/login?registered=true')
      
    } catch (err) {
      console.error('[Register] Error:', err)
      setError('Error en el registro. Intenta nuevamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-neutral-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center mb-6 group">
            <Stethoscope className="w-8 h-8 text-primary-600 mr-2 group-hover:text-primary-700 transition-colors" />
            <span className="text-2xl font-bold text-primary-600 group-hover:text-primary-700 transition-colors">
              ALTAMEDICA
            </span>
          </Link>
          
          {/* Role Header */}
          <div className="flex items-center justify-center mb-4">
            <currentRole.icon className={`w-8 h-8 ${currentRole.color} mr-3`} />
            <h1 className="text-3xl font-bold text-neutral-900">
              {currentRole.title}
            </h1>
          </div>
          <p className="text-neutral-600 max-w-md mx-auto">
            {currentRole.description}
          </p>
        </div>

        {/* Role Selector */}
        <div className="grid grid-cols-3 gap-2 mb-8 bg-white p-1 rounded-lg shadow-sm border border-neutral-200">
          {Object.entries(roleConfig).map(([role, config]) => (
            <button
              key={role}
              onClick={() => setSelectedRole(role as UserRole)}
              className={`flex flex-col items-center p-3 rounded-md transition-all ${
                selectedRole === role
                  ? 'bg-primary-100 text-primary-700 shadow-sm'
                  : 'text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              <config.icon className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium capitalize">{role}</span>
            </button>
          ))}
        </div>

        {/* Registration Form */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-neutral-200">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Nombre
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    placeholder="Juan"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Apellido
                </label>
                <input
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  placeholder="Pérez"
                  required
                />
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    placeholder="juan@ejemplo.com"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Teléfono
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    placeholder="+54 11 1234-5678"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Role-specific fields */}
            {selectedRole === 'doctor' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Especialidad
                  </label>
                  <select
                    name="speciality"
                    value={formData.speciality}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    required
                  >
                    <option value="">Seleccionar especialidad</option>
                    <option value="medicina-general">Medicina General</option>
                    <option value="cardiologia">Cardiología</option>
                    <option value="dermatologia">Dermatología</option>
                    <option value="ginecologia">Ginecología</option>
                    <option value="pediatria">Pediatría</option>
                    <option value="psiquiatria">Psiquiatría</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Número de Matrícula
                  </label>
                  <input
                    name="licenseNumber"
                    type="text"
                    value={formData.licenseNumber}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    placeholder="MP 12345"
                    required
                  />
                </div>
              </div>
            )}

            {selectedRole === 'company' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Nombre de la Empresa
                  </label>
                  <input
                    name="companyName"
                    type="text"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    placeholder="Empresa SA"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    CUIT
                  </label>
                  <input
                    name="taxId"
                    type="text"
                    value={formData.taxId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    placeholder="20-12345678-9"
                    required
                  />
                </div>
              </div>
            )}

            {/* Password Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-12 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-12 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Terms and Privacy */}
            <div className="space-y-3">
              <label className="flex items-start">
                <input 
                  name="agreeTerms"
                  type="checkbox" 
                  checked={formData.agreeTerms}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500 mt-1"
                  required
                />
                <span className="ml-2 text-sm text-neutral-600">
                  Acepto los{' '}
                  <Link href="/terms" className="text-primary-600 hover:text-primary-700 font-medium">
                    términos y condiciones
                  </Link>
                </span>
              </label>
              
              <label className="flex items-start">
                <input 
                  name="agreePrivacy"
                  type="checkbox" 
                  checked={formData.agreePrivacy}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500 mt-1"
                  required
                />
                <span className="ml-2 text-sm text-neutral-600">
                  Acepto la{' '}
                  <Link href="/privacy" className="text-primary-600 hover:text-primary-700 font-medium">
                    política de privacidad
                  </Link>{' '}
                  y el{' '}
                  <Link href="/hipaa" className="text-primary-600 hover:text-primary-700 font-medium">
                    cumplimiento HIPAA
                  </Link>
                </span>
              </label>
            </div>

            {/* Register Button */}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                  Creando cuenta...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  Crear Cuenta
                  <ArrowRight className="ml-2 w-5 h-5" />
                </div>
              )}
            </Button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-neutral-600 text-sm">
              ¿Ya tienes cuenta?{' '}
              <Link 
                href="/login" 
                className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
              >
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center">
          <p className="text-xs text-neutral-500">
            Desarrollado por <span className="text-primary-600 font-medium">Eduardo Marques</span> - Medicina UBA
          </p>
        </div>
      </div>
    </div>
  )
}
