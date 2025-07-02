"use client";

import React, { useState } from "react";
import { useTelemedicineSessions } from "../../hooks/useTelemedicine";
import TelemedicineSessionList from "../../components/telemedicine/TelemedicineSessionList";

export default function TelemedicinePage() {
  const [filters, setFilters] = useState({});
  const { sessions, loading, error, searchSessions } = useTelemedicineSessions({
    initialFetch: true,
  });

  const handleFiltersChange = async (newFilters: any) => {
    setFilters(newFilters);
    await searchSessions(newFilters);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Telemedicina</h1>
      {loading ? (
        <div className="text-center py-12">Cargando sesiones...</div>
      ) : error ? (
        <div className="text-center text-red-600 py-12">Error: {error}</div>
      ) : (
        <TelemedicineSessionList sessions={sessions} />
      )}
    </div>
  );
}
