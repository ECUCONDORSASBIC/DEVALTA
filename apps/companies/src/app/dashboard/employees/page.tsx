'use client'

import { Employee } from "@altamedica/types"
import { useState } from 'react'
import { EmployeeList } from './employee-list'

// Mock data - en el futuro se reemplazará por llamadas a la API
const mockEmployees: Employee[] = [
  {
    id: "e7a4a2f8-3e9c-4f1b-8d1a-9c8b7a6f5e4d",
    name: "Dr. Alejandro García",
    email: "alejandro.garcia@example.com",
    role: "Doctor",
    department: "Cardiología",
    hireDate: new Date("2022-08-15"),
    status: "Activo"
  },
  {
    id: "f8b5c3e9-2a7d-4f9b-8c6a-5e4d3c2b1a0f",
    name: "Lic. Laura Fernández",
    email: "laura.fernandez@example.com",
    role: "Enfermero",
    department: "Pediatría",
    hireDate: new Date("2023-01-20"),
    status: "Activo"
  },
  {
    id: "a9c8b7d6-5e4f-3a2b-1c0d-9f8e7d6c5b4a",
    name: "Carlos Martínez",
    email: "carlos.martinez@example.com",
    role: "Recepción",
    department: "Administración",
    hireDate: new Date("2021-11-05"),
    status: "De Licencia"
  },
  {
    id: "b1d2c3e4-f5a6-7b8c-9d0e-1f2a3b4c5d6e",
    name: "Dra. Sofía Rodríguez",
    email: "sofia.rodriguez@example.com",
    role: "Doctor",
    department: "Neurología",
    hireDate: new Date("2022-03-10"),
    status: "Activo"
  },
  {
    id: "c5d6e7f8-a9b0-c1d2-e3f4-a5b6c7d8e9f0",
    name: "Martín Pérez",
    email: "martin.perez@example.com",
    role: "Otro",
    department: "Mantenimiento",
    hireDate: new Date("2020-07-22"),
    status: "Inactivo"
  }
]

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees)
  const [isLoading, setIsLoading] = useState(false)

  const handleCreateEmployee = async (employee: Employee) => {
    setIsLoading(true)
    try {
      // Simular llamada a la API
      await new Promise(resolve => setTimeout(resolve, 1000))
      setEmployees(prev => [...prev, employee])
    } catch (error) {
      console.error('Error creating employee:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateEmployee = async (updatedEmployee: Employee) => {
    setIsLoading(true)
    try {
      // Simular llamada a la API
      await new Promise(resolve => setTimeout(resolve, 1000))
      setEmployees(prev => 
        prev.map(emp => emp.id === updatedEmployee.id ? updatedEmployee : emp)
      )
    } catch (error) {
      console.error('Error updating employee:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteEmployee = async (id: string) => {
    setIsLoading(true)
    try {
      // Simular llamada a la API
      await new Promise(resolve => setTimeout(resolve, 1000))
      setEmployees(prev => prev.filter(emp => emp.id !== id))
    } catch (error) {
      console.error('Error deleting employee:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <EmployeeList
        employees={employees}
        onCreateEmployee={handleCreateEmployee}
        onUpdateEmployee={handleUpdateEmployee}
        onDeleteEmployee={handleDeleteEmployee}
        isLoading={isLoading}
      />
    </div>
  )
}
