'use client'

import React from 'react'
import { GestionPacientes } from '@altamedica/ui'
import { usePacientes } from '@altamedica/core'

export default function PacientesPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Gestión de Pacientes
        </h1>
        
        <GestionPacientes />
      </div>
    </div>
  )
} 