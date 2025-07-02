'use client'

import React from 'react'
import { DashboardMedico } from '@altamedica/ui'
import { usePacientes, useCitasMedicas } from '@altamedica/core'
import { MedicalPerformanceMonitor } from '@altamedica/core'

export default function DoctorsDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Monitor de Performance Médico */}
      <div className="mb-6">
        <MedicalPerformanceMonitor />
      </div>
      
      {/* Dashboard Principal Médico */}
      <DashboardMedico />
    </div>
  )
} 