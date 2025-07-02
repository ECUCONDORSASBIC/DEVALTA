"use client";

import React, { useState } from "react";
import { useMedicalHistory } from "../../hooks/useMedicalHistory";
import MedicalTimeline from "../../components/medical-history/MedicalTimeline";
import FilterPanel from "../../components/medical-history/FilterPanel";
import StatsPanel from "../../components/medical-history/StatsPanel";

export default function MedicalHistoryPage() {
  const [filters, setFilters] = useState({});
  const { records, loading, error, pagination, searchRecords } =
    useMedicalHistory({ initialFetch: true });

  const handleFiltersChange = async (newFilters: any) => {
    setFilters(newFilters);
    await searchRecords(newFilters);
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <div className="md:w-1/4">
        <FilterPanel filters={filters} onFiltersChange={handleFiltersChange} />
        <StatsPanel records={records} />
      </div>
      <div className="md:w-3/4">
        {loading ? (
          <div className="text-center py-12">Cargando registros...</div>
        ) : error ? (
          <div className="text-center text-red-600 py-12">Error: {error}</div>
        ) : (
          <MedicalTimeline records={records} />
        )}
        {/* Paginación */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center mt-8 space-x-2">
            {Array.from({ length: pagination.totalPages }, (_, i) => (
              <button
                key={i + 1}
                className={`px-4 py-2 rounded ${pagination.page === i + 1 ? "bg-blue-600 text-white" : "bg-white border"}`}
                onClick={() => searchRecords({ ...filters, page: i + 1 })}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
