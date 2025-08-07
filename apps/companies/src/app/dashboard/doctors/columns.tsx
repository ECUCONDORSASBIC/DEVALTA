"use client"

import { Doctor } from "@altamedica/types"
import { Badge } from "@altamedica/ui"
import { ColumnDef } from "@tanstack/react-table"

export const columns: ColumnDef<Doctor>[] = [
  {
    accessorKey: "name",
    header: "Nombre",
  },
  {
    accessorKey: "email", 
    header: "Email",
  },
  {
    accessorKey: "specialty",
    header: "Especialidad",
  },
  {
    accessorKey: "licenseNumber",
    header: "Licencia",
  },
  {
    accessorKey: "experience",
    header: "Experiencia",
    cell: ({ row }) => {
      const years = row.getValue("experience") as number
      return <div>{years} años</div>
    },
  },
  {
    accessorKey: "consultationFee",
    header: "Tarifa",
    cell: ({ row }) => {
      const fee = row.getValue("consultationFee") as number
      const formatted = new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "USD",
      }).format(fee)
      return <div>{formatted}</div>
    },
  },
  {
    accessorKey: "availability",
    header: "Disponibilidad",
    cell: ({ row }) => {
      const availability = row.getValue("availability") as string
      const variant = availability === 'Disponible' ? 'default' : 
                    availability === 'Ocupado' ? 'secondary' : 'destructive'
      return <Badge variant={variant}>{availability}</Badge>
    }
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      const variant = status === 'Activo' ? 'default' : 
                    status === 'De Vacaciones' ? 'secondary' : 'destructive'
      return <Badge variant={variant}>{status}</Badge>
    }
  },
]
