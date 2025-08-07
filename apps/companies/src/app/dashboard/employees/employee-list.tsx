"use client"

import { EmployeeForm } from '@/components/forms/employee-form'
import { Employee } from '@altamedica/types'
import { Button } from '@altamedica/ui/button'
import { DataTable } from '@altamedica/ui/data-table'
import { Dialog, DialogContent } from '@altamedica/ui/dialog'
import { Plus } from 'lucide-react'
import React, { useState } from 'react'
import { columns } from './columns'

interface EmployeeListProps {
  employees: Employee[]
  onCreateEmployee: (employee: Employee) => void
  onUpdateEmployee: (employee: Employee) => void
  onDeleteEmployee: (id: string) => void
  isLoading?: boolean
}

export function EmployeeList({
  employees,
  onCreateEmployee,
  onUpdateEmployee,
  onDeleteEmployee,
  isLoading
}: EmployeeListProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | undefined>()

  const handleCreateEmployee = (employee: Employee) => {
    onCreateEmployee(employee)
    setIsDialogOpen(false)
  }

  const handleUpdateEmployee = (employee: Employee) => {
    onUpdateEmployee(employee)
    setIsDialogOpen(false)
    setEditingEmployee(undefined)
  }

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee)
    setIsDialogOpen(true)
  }

  const handleDeleteEmployee = (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este empleado?')) {
      onDeleteEmployee(id)
    }
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingEmployee(undefined)
  }

  // Agregar las acciones a las columnas
  const columnsWithActions = React.useMemo(() => [
    ...columns,
    {
      id: "actions",
      cell: ({ row }: { row: any }) => {
        const employee = row.original
        return (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEditEmployee(employee)}
            >
              Editar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDeleteEmployee(employee.id)}
            >
              Eliminar
            </Button>
          </div>
        )
      },
    },
  ], [])

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestión de Empleados</h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Empleado
        </Button>
      </div>

      <DataTable columns={columnsWithActions} data={employees} />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <EmployeeForm
            employee={editingEmployee}
            onSubmit={editingEmployee ? handleUpdateEmployee : handleCreateEmployee}
            onCancel={handleCloseDialog}
            isLoading={isLoading}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
