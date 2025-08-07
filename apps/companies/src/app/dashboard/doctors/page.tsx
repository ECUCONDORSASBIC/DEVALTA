'use client'

import { DoctorForm } from '@/components/forms/doctor-form'
import { Doctor } from "@altamedica/types"
import { Button } from '@altamedica/ui/button'
import { DataTable } from '@altamedica/ui/data-table'
import { Dialog, DialogContent } from '@altamedica/ui/dialog'
import { Plus } from 'lucide-react'
import React, { useState } from 'react'
import { columns } from './columns'

// Mock data - en el futuro se reemplazará por llamadas a la API
const mockDoctors: Doctor[] = [
  {
    id: "d1a2b3c4-e5f6-7890-abcd-ef1234567890",
    name: "Dr. Carlos Martínez",
    email: "carlos.martinez@example.com",
    specialty: "Cardiología",
    licenseNumber: "CARD-2019-001",
    phone: "+54 11 1234-5678",
    experience: 8,
    status: "Activo",
    consultationFee: 85,
    availability: "Disponible",
    hireDate: new Date("2019-03-15")
  },
  {
    id: "d2b3c4d5-f6g7-8901-bcde-f23456789012",
    name: "Dra. María López",
    email: "maria.lopez@example.com",
    specialty: "Pediatría",
    licenseNumber: "PED-2020-015",
    phone: "+54 11 2345-6789",
    experience: 6,
    status: "Activo",
    consultationFee: 75,
    availability: "Disponible",
    hireDate: new Date("2020-08-10")
  },
  {
    id: "d3c4d5e6-g7h8-9012-cdef-34567890123a",
    name: "Dr. Alejandro Rodríguez",
    email: "alejandro.rodriguez@example.com",
    specialty: "Neurología",
    licenseNumber: "NEU-2018-007",
    phone: "+54 11 3456-7890",
    experience: 12,
    status: "Activo",
    consultationFee: 120,
    availability: "Ocupado",
    hireDate: new Date("2018-01-20")
  },
  {
    id: "d4d5e6f7-h8i9-0123-defg-456789012345",
    name: "Dra. Ana Fernández",
    email: "ana.fernandez@example.com",
    specialty: "Ginecología",
    licenseNumber: "GIN-2021-003",
    phone: "+54 11 4567-8901",
    experience: 4,
    status: "De Vacaciones",
    consultationFee: 90,
    availability: "No Disponible",
    hireDate: new Date("2021-06-05")
  },
  {
    id: "d5e6f7g8-i9j0-1234-efgh-56789012345b",
    name: "Dr. Roberto Silva",
    email: "roberto.silva@example.com",
    specialty: "Traumatología",
    licenseNumber: "TRA-2017-012",
    phone: "+54 11 5678-9012",
    experience: 15,
    status: "Inactivo",
    consultationFee: 100,
    availability: "No Disponible",
    hireDate: new Date("2017-09-12")
  }
]

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>(mockDoctors)
  const [isLoading, setIsLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingDoctor, setEditingDoctor] = useState<Doctor | undefined>()

  const handleCreateDoctor = async (doctor: Doctor) => {
    setIsLoading(true)
    try {
      // Simular llamada a la API
      await new Promise(resolve => setTimeout(resolve, 1000))
      setDoctors(prev => [...prev, doctor])
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Error creating doctor:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateDoctor = async (updatedDoctor: Doctor) => {
    setIsLoading(true)
    try {
      // Simular llamada a la API
      await new Promise(resolve => setTimeout(resolve, 1000))
      setDoctors(prev => 
        prev.map(doc => doc.id === updatedDoctor.id ? updatedDoctor : doc)
      )
      setIsDialogOpen(false)
      setEditingDoctor(undefined)
    } catch (error) {
      console.error('Error updating doctor:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditDoctor = (doctor: Doctor) => {
    setEditingDoctor(doctor)
    setIsDialogOpen(true)
  }

  const handleDeleteDoctor = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este doctor?')) {
      setIsLoading(true)
      try {
        // Simular llamada a la API
        await new Promise(resolve => setTimeout(resolve, 1000))
        setDoctors(prev => prev.filter(doc => doc.id !== id))
      } catch (error) {
        console.error('Error deleting doctor:', error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingDoctor(undefined)
  }

  // Agregar las acciones a las columnas
  const columnsWithActions = React.useMemo(() => [
    ...columns,
    {
      id: "actions",
      cell: ({ row }: { row: any }) => {
        const doctor = row.original
        return (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEditDoctor(doctor)}
            >
              Editar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDeleteDoctor(doctor.id)}
            >
              Eliminar
            </Button>
          </div>
        )
      },
    },
  ], [])

  return (
    <div className="container mx-auto py-10">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Gestión de Doctores</h1>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Agregar Doctor
          </Button>
        </div>

        <DataTable columns={columnsWithActions} data={doctors} />

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DoctorForm
              doctor={editingDoctor}
              onSubmit={editingDoctor ? handleUpdateDoctor : handleCreateDoctor}
              onCancel={handleCloseDialog}
              isLoading={isLoading}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
