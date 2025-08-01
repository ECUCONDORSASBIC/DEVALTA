"use client";

import React, { useState } from "react";
import { useTelemedicineSessions } from "../../hooks/useTelemedicine";
import TelemedicineSessionList from "../../components/telemedicine/TelemedicineSessionList";

export default function TelemedicinePage() {
  const [filters, setFilters] = useState({
    status: '',
    doctorId: ''
  });
  
  const { sessions, loading, error, searchSessions, createSession } = useTelemedicineSessions({
    initialFetch: true,
  });

  const handleFiltersChange = async (newFilters: any) => {
    setFilters(newFilters);
    await searchSessions(newFilters);
  };

  const handleCreateSession = async () => {
    try {
      await createSession({
        doctorId: "doctor-1",
        patientId: "patient-1",
        notes: "Nueva consulta de telemedicina"
      });
    } catch (error) {
      console.error("Error al crear sesión:", error);
    }
  };

  const handleJoinSession = (sessionId: string) => {
    // Redirigir a la nueva página de consulta
    window.location.href = `/telemedicine/consultation/${sessionId}`;
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Telemedicina</h1>
        <p className="text-gray-600">Gestiona tus consultas médicas virtuales</p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
          <button
            onClick={handleCreateSession}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <span className="mr-2">➕</span>
            Nueva Consulta
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFiltersChange({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos los estados</option>
              <option value="waiting">En espera</option>
              <option value="active">Activa</option>
              <option value="ended">Finalizada</option>
              <option value="cancelled">Cancelada</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Doctor
            </label>
            <select
              value={filters.doctorId}
              onChange={(e) => handleFiltersChange({ ...filters, doctorId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos los doctores</option>
              <option value="doctor-1">Dr. María García</option>
              <option value="doctor-2">Dr. Carlos López</option>
              <option value="doctor-3">Dr. Ana Martínez</option>
              <option value="doctor-4">Dr. Roberto Silva</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => handleFiltersChange({})}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Limpiar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-blue-600 text-xl">📅</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-lg font-semibold text-gray-900">{sessions.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-yellow-600 text-xl">⏳</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">En espera</p>
              <p className="text-lg font-semibold text-gray-900">
                {sessions.filter(s => s.status === 'waiting').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-green-600 text-xl">🟢</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Activas</p>
              <p className="text-lg font-semibold text-gray-900">
                {sessions.filter(s => s.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <span className="text-gray-600 text-xl">✅</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Completadas</p>
              <p className="text-lg font-semibold text-gray-900">
                {sessions.filter(s => s.status === 'ended').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de sesiones */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Sesiones de Telemedicina</h2>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando sesiones...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <span className="text-red-500 text-xl mb-4 block">⚠️</span>
            <p className="text-red-600">Error: {error}</p>
            <button
              onClick={() => searchSessions(filters)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        ) : (
          <TelemedicineSessionList sessions={sessions} />
        )}
      </div>
    </div>
  );
}
