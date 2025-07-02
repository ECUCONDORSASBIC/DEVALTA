'use client'

import React from 'react'
import { GestionCitas } from '@altamedica/ui'
import { useCitasMedicas } from '@altamedica/core'

export default function CitasPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Gestión de Citas Médicas
        </h1>
        
        <GestionCitas />
      </div>
    </div>
  )
} 