"use client";

import React, { useState } from "react";
import {
  SearchFilters,
  MedicalRecord,
  MedicalRecordType,
  Priority,
} from "../../types";

interface MedicalHistoryFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  records: MedicalRecord[];
}

export default function MedicalHistoryFilters({
  filters,
  onFiltersChange,
  records,
}: MedicalHistoryFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const getRecordTypes = () => {
    const types = new Set(records.map((record) => record.type));
    return Array.from(types);
  };

  const getPriorities = () => {
    const priorities = new Set(records.map((record) => record.priority));
    return Array.from(priorities);
  };

  const activeFiltersCount = Object.keys(filters).filter(
    (key) =>
      filters[key as keyof SearchFilters] !== undefined &&
      filters[key as keyof SearchFilters] !== ""
  ).length;

  return (
    <div className="space-y-4">
      {/* Búsqueda */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Buscar
        </label>
        <input
          type="text"
          placeholder="Buscar en registros..."
          value={filters.query || ""}
          onChange={(e) => handleFilterChange("query", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Filtros expandibles */}
      <div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-700 mb-2"
        >
          Filtros avanzados
          <span
            className={`transform transition-transform ${isExpanded ? "rotate-180" : ""}`}
          >
            ▼
          </span>
        </button>

        {isExpanded && (
          <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
            {/* Tipo de registro */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de registro
              </label>
              <select
                value={filters.type || ""}
                onChange={(e) => handleFilterChange("type", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todos los tipos</option>
                {getRecordTypes().map((type) => (
                  <option key={type} value={type}>
                    {type === "consultation" && "Consulta"}
                    {type === "diagnosis" && "Diagnóstico"}
                    {type === "treatment" && "Tratamiento"}
                    {type === "test_result" && "Resultado de prueba"}
                    {type === "prescription" && "Prescripción"}
                    {type === "surgery" && "Cirugía"}
                    {type === "emergency" && "Emergencia"}
                    {type === "vaccination" && "Vacunación"}
                    {type === "other" && "Otro"}
                  </option>
                ))}
              </select>
            </div>

            {/* Prioridad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prioridad
              </label>
              <select
                value={filters.priority || ""}
                onChange={(e) => handleFilterChange("priority", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todas las prioridades</option>
                {getPriorities().map((priority) => (
                  <option key={priority} value={priority}>
                    {priority === "urgent" && "Urgente"}
                    {priority === "high" && "Alta"}
                    {priority === "normal" && "Normal"}
                    {priority === "low" && "Baja"}
                  </option>
                ))}
              </select>
            </div>

            {/* Rango de fechas */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Desde
                </label>
                <input
                  type="date"
                  value={filters.dateFrom || ""}
                  onChange={(e) =>
                    handleFilterChange("dateFrom", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hasta
                </label>
                <input
                  type="date"
                  value={filters.dateTo || ""}
                  onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filtros activos */}
      {activeFiltersCount > 0 && (
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Filtros activos ({activeFiltersCount})
            </span>
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Limpiar todo
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {filters.query && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                Búsqueda: {filters.query}
                <button
                  onClick={() => handleFilterChange("query", "")}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            )}

            {filters.type && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                Tipo: {filters.type}
                <button
                  onClick={() => handleFilterChange("type", "")}
                  className="ml-1 text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </span>
            )}

            {filters.priority && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
                Prioridad: {filters.priority}
                <button
                  onClick={() => handleFilterChange("priority", "")}
                  className="ml-1 text-orange-600 hover:text-orange-800"
                >
                  ×
                </button>
              </span>
            )}

            {(filters.dateFrom || filters.dateTo) && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                Fecha: {filters.dateFrom} - {filters.dateTo}
                <button
                  onClick={() => {
                    handleFilterChange("dateFrom", "");
                    handleFilterChange("dateTo", "");
                  }}
                  className="ml-1 text-purple-600 hover:text-purple-800"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Estadísticas rápidas */}
      <div className="pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Resumen</h4>
        <div className="space-y-1 text-xs text-gray-600">
          <div>Total: {records.length} registros</div>
          <div>
            Urgentes: {records.filter((r) => r.priority === "urgent").length}
          </div>
          <div>
            Este mes:{" "}
            {
              records.filter((r) => {
                const recordDate = new Date(r.date);
                const now = new Date();
                return (
                  recordDate.getMonth() === now.getMonth() &&
                  recordDate.getFullYear() === now.getFullYear()
                );
              }).length
            }
          </div>
        </div>
      </div>
    </div>
  );
}
