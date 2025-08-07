'use client'

import { PublicUserRole, useAuth } from "@altamedica/auth"
import { ArrowRight, Building, Loader2, User, UserCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function CompleteProfileForm() {
  const { user, updateUserProfile, loading } = useAuth()
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<PublicUserRole | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Si el usuario no está autenticado o ya tiene un rol, no debería estar aquí.
    if (!loading && (!user || user.role !== PublicUserRole.PATIENT)) { // Asumiendo que 'guest' o un rol temporal se usa
      router.push('/login')
    }
  }, [user, loading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRole) {
      setError('Por favor, selecciona un rol para continuar.')
      return
    }
    setIsSubmitting(true)
    setError('')

    try {
      await updateUserProfile(user!.id, { role: selectedRole })
      // Redirigir al dashboard correspondiente
      // Esta lógica puede ser más compleja (ej. obtener URL del backend)
      switch (selectedRole) {
        case PublicUserRole.DOCTOR:
          window.location.href = 'http://localhost:3002/dashboard'
          break
        case Public.UserRole.COMPANY:
            window.location.href = 'http://localhost:3004/dashboard'
            break
        default:
          router.push('/dashboard') // Dashboard de paciente en la misma app
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error al actualizar tu perfil.')
      setIsSubmitting(false)
    }
  }

  const roles = [
    { id: PublicUserRole.PATIENT, label: 'Soy un Paciente', icon: User },
    { id: PublicUserRole.DOCTOR, label: 'Soy un Médico', icon: UserCheck },
    { id: PublicUserRole.COMPANY, label: 'Soy una Empresa', icon: Building },
  ]

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="max-w-lg w-full space-y-8 p-10 bg-white rounded-2xl shadow-xl">
        <div className="text-center">
          <h2 className="text-3xl font-display font-bold text-neutral-900">
            Un último paso, {user.displayName}
          </h2>
          <p className="mt-2 text-lg text-neutral-600">
            Ayúdanos a personalizar tu experiencia en AltaMedica.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-lg font-medium text-neutral-800 mb-4 text-center">
              ¿Cómo usarás nuestra plataforma?
            </label>
            <div className="grid grid-cols-1 gap-4">
              {roles.map(({ id, label, icon: Icon }) => (
                <label
                  key={id}
                  className={`relative flex items-center p-5 border-2 rounded-xl cursor-pointer transition-all ${
                    selectedRole === id
                      ? 'border-primary-500 bg-primary-50 shadow-lg'
                      : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={id}
                    checked={selectedRole === id}
                    onChange={() => setSelectedRole(id)}
                    className="sr-only"
                  />
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      selectedRole === id ? 'bg-primary-500 text-white' : 'bg-neutral-200 text-neutral-600'
                    }`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-lg font-semibold text-neutral-800">{label}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={isSubmitting || !selectedRole}
              className="w-full bg-primary-500 hover:bg-primary-600 text-white py-4 rounded-xl font-semibold shadow-altamedica hover:shadow-altamedica-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span>Continuando...</span>
                </>
              ) : (
                <>
                  <span>Continuar</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
