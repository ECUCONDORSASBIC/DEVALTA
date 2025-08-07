"use client"

import { Doctor, doctorSchema } from '@altamedica/types'
import { Button } from '@altamedica/ui/button'
import {
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@altamedica/ui/dialog'
import { Input } from '@altamedica/ui/input'
import { Label } from '@altamedica/ui/label'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

interface DoctorFormProps {
  doctor?: Doctor
  onSubmit: (data: Doctor) => void
  onCancel: () => void
  isLoading?: boolean
}

export function DoctorForm({ doctor, onSubmit, onCancel, isLoading }: DoctorFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Doctor>({
    resolver: zodResolver(doctorSchema),
    defaultValues: doctor || {
      id: crypto.randomUUID(),
      name: '',
      email: '',
      specialty: '',
      licenseNumber: '',
      phone: '',
      experience: 0,
      status: 'Activo',
      consultationFee: 0,
      availability: 'Disponible',
      hireDate: new Date(),
    },
  })

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {doctor ? 'Editar Doctor' : 'Nuevo Doctor'}
        </DialogTitle>
        <DialogDescription>
          {doctor 
            ? 'Modifica la información del doctor.' 
            : 'Completa los datos para agregar un nuevo doctor.'
          }
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre completo</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Dr. Juan Pérez"
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="juan.perez@example.com"
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="specialty">Especialidad</Label>
            <Input
              id="specialty"
              {...register('specialty')}
              placeholder="Cardiología"
            />
            {errors.specialty && (
              <p className="text-sm text-red-500">{errors.specialty.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="licenseNumber">Número de Licencia</Label>
            <Input
              id="licenseNumber"
              {...register('licenseNumber')}
              placeholder="CARD-2024-001"
            />
            {errors.licenseNumber && (
              <p className="text-sm text-red-500">{errors.licenseNumber.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono (opcional)</Label>
            <Input
              id="phone"
              {...register('phone')}
              placeholder="+54 11 1234-5678"
            />
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience">Años de experiencia</Label>
            <Input
              id="experience"
              type="number"
              {...register('experience', { valueAsNumber: true })}
              placeholder="5"
            />
            {errors.experience && (
              <p className="text-sm text-red-500">{errors.experience.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="consultationFee">Tarifa de consulta (USD)</Label>
            <Input
              id="consultationFee"
              type="number"
              {...register('consultationFee', { valueAsNumber: true })}
              placeholder="85"
            />
            {errors.consultationFee && (
              <p className="text-sm text-red-500">{errors.consultationFee.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="availability">Disponibilidad</Label>
            <select
              id="availability"
              {...register('availability')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Disponible">Disponible</option>
              <option value="Ocupado">Ocupado</option>
              <option value="No Disponible">No Disponible</option>
            </select>
            {errors.availability && (
              <p className="text-sm text-red-500">{errors.availability.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Estado</Label>
            <select
              id="status"
              {...register('status')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
              <option value="De Vacaciones">De Vacaciones</option>
            </select>
            {errors.status && (
              <p className="text-sm text-red-500">{errors.status.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="hireDate">Fecha de contratación</Label>
          <Input
            id="hireDate"
            type="date"
            {...register('hireDate', {
              valueAsDate: true,
            })}
          />
          {errors.hireDate && (
            <p className="text-sm text-red-500">{errors.hireDate.message}</p>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogFooter>
      </form>
    </>
  )
}
