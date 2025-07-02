"use client";
import React, { useState } from "react";
import { useLabResults } from "../../hooks/useLabResults";
import LabResultList from "../../components/lab-results/LabResultList";
import LabResultFilters from "../../components/lab-results/LabResultFilters";

export default function LabResultsPage() {
  const [filters, setFilters] = useState({});
  const { labResults, loading, error, pagination, searchLabResults } =
    useLabResults({ initialFetch: true });

  const handleFiltersChange = async (newFilters: any) => {
    setFilters(newFilters);
    await searchLabResults(newFilters);
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <div className="md:w-1/4">
        <LabResultFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
        />
      </div>
      <div className="md:w-3/4">
        {loading ? (
          <div className="text-center py-12">Cargando resultados...</div>
        ) : error ? (
          <div className="text-center text-red-600 py-12">Error: {error}</div>
        ) : (
          <LabResultList labResults={labResults} />
        )}
        {/* Paginación */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center mt-8 space-x-2">
            {Array.from({ length: pagination.totalPages }, (_, i) => (
              <button
                key={i + 1}
                className={`px-4 py-2 rounded ${pagination.page === i + 1 ? "bg-blue-600 text-white" : "bg-white border"}`}
                onClick={() => searchLabResults({ ...filters, page: i + 1 })}
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
