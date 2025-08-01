'use client';

import React, { useState } from 'react';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  employeeId: string;
  status: 'active' | 'vacation' | 'license' | 'inactive';
  shift: string;
  email: string;
  phone: string;
  joinDate: string;
  licenseNumber: string;
  licenseExpiry: string;
  profileImage?: string;
  schedule: {
    [key: string]: { start: string; end: string; note?: string } | null;
  };
  metrics: {
    patientsThisMonth: number;
    avgConsultationTime: number;
    satisfaction: number;
    attendance: number;
  };
  currentLocation?: string;
  nextAppointment?: string;
  vacationStart?: string;
  vacationEnd?: string;
  licenseType?: string;
  licenseStart?: string;
  licenseEnd?: string;
}

// Mock de médicos empleados por esta empresa
const myCompanyDoctors: Doctor[] = [
  {
    id: "emp1",
    name: "Dr. Roberto Sánchez",
    specialty: "Cardiología",
    employeeId: "MED-001",
    status: "active",
    shift: "Mañana",
    email: "r.sanchez@hospital.com",
    phone: "+54 11 4567-8901",
    joinDate: "2020-03-15",
    licenseNumber: "MAT-12345",
    licenseExpiry: "2026-12-31",
    profileImage: "/doctor1.jpg",
    schedule: {
      monday: { start: "08:00", end: "16:00" },
      tuesday: { start: "08:00", end: "16:00" },
      wednesday: { start: "08:00", end: "16:00" },
      thursday: { start: "08:00", end: "16:00" },
      friday: { start: "08:00", end: "16:00" },
      saturday: null,
      sunday: null
    },
    metrics: {
      patientsThisMonth: 127,
      avgConsultationTime: 25,
      satisfaction: 4.8,
      attendance: 98
    },
    currentLocation: "Consultorio 205",
    nextAppointment: "14:30 - Juan Pérez"
  },
  {
    id: "emp2",
    name: "Dra. Laura Martínez",
    specialty: "Pediatría",
    employeeId: "MED-002",
    status: "active",
    shift: "Tarde",
    email: "l.martinez@hospital.com",
    phone: "+54 11 4567-8902",
    joinDate: "2019-07-20",
    licenseNumber: "MAT-23456",
    licenseExpiry: "2025-06-30",
    profileImage: "/doctor2.jpg",
    schedule: {
      monday: { start: "14:00", end: "22:00" },
      tuesday: { start: "14:00", end: "22:00" },
      wednesday: { start: "14:00", end: "22:00" },
      thursday: { start: "14:00", end: "22:00" },
      friday: { start: "14:00", end: "22:00" },
      saturday: { start: "09:00", end: "13:00" },
      sunday: null
    },
    metrics: {
      patientsThisMonth: 156,
      avgConsultationTime: 20,
      satisfaction: 4.9,
      attendance: 100
    },
    currentLocation: "Consultorio 102",
    nextAppointment: "15:00 - María González"
  },
  {
    id: "emp3",
    name: "Dr. Carlos Fernández",
    specialty: "Traumatología",
    employeeId: "MED-003",
    status: "vacation",
    shift: "Rotativo",
    email: "c.fernandez@hospital.com",
    phone: "+54 11 4567-8903",
    joinDate: "2021-01-10",
    licenseNumber: "MAT-34567",
    licenseExpiry: "2027-03-15",
    profileImage: "/doctor3.jpg",
    vacationStart: "2025-01-20",
    vacationEnd: "2025-02-03",
    schedule: {
      monday: { start: "07:00", end: "15:00" },
      tuesday: { start: "15:00", end: "23:00" },
      wednesday: { start: "07:00", end: "15:00" },
      thursday: { start: "15:00", end: "23:00" },
      friday: { start: "07:00", end: "15:00" },
      saturday: null,
      sunday: { start: "08:00", end: "20:00", note: "Guardia" }
    },
    metrics: {
      patientsThisMonth: 89,
      avgConsultationTime: 30,
      satisfaction: 4.7,
      attendance: 95
    }
  },
  {
    id: "emp4",
    name: "Dra. Ana Rodríguez",
    specialty: "Medicina General",
    employeeId: "MED-004",
    status: "license",
    shift: "Noche",
    email: "a.rodriguez@hospital.com",
    phone: "+54 11 4567-8904",
    joinDate: "2018-05-22",
    licenseNumber: "MAT-45678",
    licenseExpiry: "2024-11-30",
    licenseType: "Maternidad",
    licenseStart: "2025-01-01",
    licenseEnd: "2025-04-01",
    profileImage: "/doctor4.jpg",
    schedule: {
      monday: { start: "20:00", end: "08:00" },
      tuesday: { start: "20:00", end: "08:00" },
      wednesday: { start: "20:00", end: "08:00" },
      thursday: { start: "20:00", end: "08:00" },
      friday: { start: "20:00", end: "08:00" },
      saturday: null,
      sunday: null
    },
    metrics: {
      patientsThisMonth: 0,
      avgConsultationTime: 0,
      satisfaction: 4.8,
      attendance: 100
    }
  }
];

export default function DoctorManagementDashboard() {
  const [activeView, setActiveView] = useState<'roster' | 'schedule'>('roster');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  return (
    <div className="flex h-[calc(100vh-120px)]">
      {/* Barra lateral de navegación */}
      <div className="w-64 bg-white border-r border-gray-200 p-4">
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Gestión de Personal</h2>
          <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            ➕ Agregar Médico
          </button>
        </div>
        
        <nav className="space-y-1">
          <button
            onClick={() => setActiveView('roster')}
            className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
              activeView === 'roster' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
            }`}
          >
            👥 Roster de Médicos
            <span className="block text-sm text-gray-500">
              {myCompanyDoctors.filter(d => d.status === 'active').length} activos de {myCompanyDoctors.length} total
            </span>
          </button>
          
          <button
            onClick={() => setActiveView('schedule')}
            className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
              activeView === 'schedule' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
            }`}
          >
            📅 Gestión de Horarios
            <span className="block text-sm text-gray-500">Turnos y guardias</span>
          </button>
        </nav>
        
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium mb-2">Resumen Rápido</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Activos hoy:</span>
              <span className="font-medium">{myCompanyDoctors.filter(d => d.status === 'active').length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">En vacaciones:</span>
              <span className="font-medium">{myCompanyDoctors.filter(d => d.status === 'vacation').length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Con licencia:</span>
              <span className="font-medium">{myCompanyDoctors.filter(d => d.status === 'license').length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 bg-gray-50 overflow-hidden">
        {activeView === 'roster' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Roster de Médicos</h2>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  ➕ Agregar Médico
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  📥 Exportar Lista
                </button>
              </div>
            </div>
            
            {/* Filtros */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Especialidad</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option>Todas las especialidades</option>
                    <option>Cardiología</option>
                    <option>Pediatría</option>
                    <option>Traumatología</option>
                    <option>Medicina General</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option>Todos los estados</option>
                    <option>Activo</option>
                    <option>Vacaciones</option>
                    <option>Licencia</option>
                    <option>Inactivo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Turno</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option>Todos los turnos</option>
                    <option>Mañana</option>
                    <option>Tarde</option>
                    <option>Noche</option>
                    <option>Rotativo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
                  <input 
                    type="text" 
                    placeholder="Nombre o ID..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>
            
            {/* Lista de médicos */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="grid gap-px bg-gray-200">
                {myCompanyDoctors.map(doctor => (
                  <div key={doctor.id} className="bg-white p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        {/* Avatar placeholder */}
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                          {doctor.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        
                        {/* Información básica */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-lg font-semibold">{doctor.name}</h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              doctor.status === 'active' ? 'bg-green-100 text-green-700' :
                              doctor.status === 'vacation' ? 'bg-yellow-100 text-yellow-700' :
                              doctor.status === 'license' ? 'bg-orange-100 text-orange-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {doctor.status === 'active' ? '✅ Activo' :
                               doctor.status === 'vacation' ? '🏖️ Vacaciones' :
                               doctor.status === 'license' ? '📋 Licencia' :
                               '⚫ Inactivo'}
                            </span>
                          </div>
                          
                          <div className="text-sm text-gray-600 mb-3">
                            <span className="font-medium">{doctor.specialty}</span> • 
                            ID: {doctor.employeeId} • 
                            Turno: {doctor.shift}
                          </div>
                          
                          {/* Métricas */}
                          <div className="grid grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Pacientes/mes</span>
                              <p className="font-semibold text-lg">{doctor.metrics.patientsThisMonth}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Tiempo consulta</span>
                              <p className="font-semibold text-lg">{doctor.metrics.avgConsultationTime} min</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Satisfacción</span>
                              <p className="font-semibold text-lg flex items-center">
                                {doctor.metrics.satisfaction} <span className="text-yellow-400 ml-1">⭐</span>
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-500">Asistencia</span>
                              <p className="font-semibold text-lg">{doctor.metrics.attendance}%</p>
                            </div>
                          </div>
                          
                          {/* Información adicional según estado */}
                          {doctor.status === 'active' && doctor.currentLocation && (
                            <div className="mt-3 p-2 bg-blue-50 rounded-lg text-sm">
                              <span className="text-blue-700">📍 {doctor.currentLocation}</span>
                              {doctor.nextAppointment && (
                                <span className="text-blue-700 ml-3">⏰ Próxima cita: {doctor.nextAppointment}</span>
                              )}
                            </div>
                          )}
                          
                          {doctor.status === 'vacation' && doctor.vacationEnd && (
                            <div className="mt-3 p-2 bg-yellow-50 rounded-lg text-sm text-yellow-700">
                              🏖️ Regresa el {new Date(doctor.vacationEnd).toLocaleDateString('es-ES')}
                            </div>
                          )}
                          
                          {doctor.status === 'license' && doctor.licenseType && (
                            <div className="mt-3 p-2 bg-orange-50 rounded-lg text-sm text-orange-700">
                              📋 Licencia por {doctor.licenseType} hasta {doctor.licenseEnd && new Date(doctor.licenseEnd).toLocaleDateString('es-ES')}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Acciones */}
                      <div className="flex flex-col gap-2">
                        <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                          Ver Perfil
                        </button>
                        <button className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                          Ver Horario
                        </button>
                        <button className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                          Editar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Resumen del roster */}
            <div className="mt-6 grid grid-cols-4 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600">Médicos Activos</p>
                    <p className="text-2xl font-bold text-green-700">
                      {myCompanyDoctors.filter(d => d.status === 'active').length}
                    </p>
                  </div>
                  <span className="text-3xl">✅</span>
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-yellow-600">En Vacaciones</p>
                    <p className="text-2xl font-bold text-yellow-700">
                      {myCompanyDoctors.filter(d => d.status === 'vacation').length}
                    </p>
                  </div>
                  <span className="text-3xl">🏖️</span>
                </div>
              </div>
              
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-orange-600">Con Licencia</p>
                    <p className="text-2xl font-bold text-orange-700">
                      {myCompanyDoctors.filter(d => d.status === 'license').length}
                    </p>
                  </div>
                  <span className="text-3xl">📋</span>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600">Total Plantilla</p>
                    <p className="text-2xl font-bold text-blue-700">{myCompanyDoctors.length}</p>
                  </div>
                  <span className="text-3xl">👥</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeView === 'schedule' && (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Gestión de Horarios</h2>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <p className="text-gray-600">Vista de calendario y gestión de horarios próximamente...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}