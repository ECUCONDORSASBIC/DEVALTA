"use client";
import React, { useState } from "react";
import { usePrescriptions } from "../../hooks/usePrescriptions";
import PrescriptionList from "../../components/prescriptions/PrescriptionList";
import PrescriptionFilters from "../../components/prescriptions/PrescriptionFilters";

export default function PrescriptionsPage() {
  const [filters, setFilters] = useState({});
  const { prescriptions, loading, error, pagination, searchPrescriptions } =
    usePrescriptions({ initialFetch: true });

  const handleFiltersChange = async (newFilters: any) => {
    setFilters(newFilters);
    await searchPrescriptions(newFilters);
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <div className="md:w-1/4">
        <PrescriptionFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
        />
      </div>
      <div className="md:w-3/4">
        {loading ? (
          <div className="text-center py-12">Cargando prescripciones...</div>
        ) : error ? (
          <div className="text-center text-red-600 py-12">Error: {error}</div>
        ) : (
          <PrescriptionList prescriptions={prescriptions} />
        )}
        {/* Paginación */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center mt-8 space-x-2">
            {Array.from({ length: pagination.totalPages }, (_, i) => (
              <button
                key={i + 1}
                className={`px-4 py-2 rounded ${pagination.page === i + 1 ? "bg-blue-600 text-white" : "bg-white border"}`}
                onClick={() => searchPrescriptions({ ...filters, page: i + 1 })}
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
