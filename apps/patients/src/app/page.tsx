/**
 * page.tsx - Dashboard de Paciente CONECTADO AL BACKEND REAL
 * ACTUALIZADO: Ahora usa datos reales del API Server (Puerto 3001)
 * Mantiene el diseño hermoso pero con funcionalidad completa
 */

"use client";

import React from "react";
import PatientDashboardConnected from "./page-connected";

/**
 * Componente principal que renderiza el dashboard conectado
 * Reemplaza la versión anterior con datos estáticos
 */
export default function PatientDashboard() {
  return <PatientDashboardConnected />;
}