"use client";

import React from "react";
import { MedicalRecord } from "../../types";

interface MedicalHistoryStatsProps {
  records: MedicalRecord[];
}

export default function MedicalHistoryStats({
  records,
}: MedicalHistoryStatsProps) {
  const getStats = () => {
    const total = records.length;
    const urgent = records.filter((r) => r.priority === "urgent").length;
    const high = records.filter((r) => r.priority === "high").length;
    const thisMonth = records.filter((r) => {
      const recordDate = new Date(r.date);
      const now = new Date();
      return (
        recordDate.getMonth() === now.getMonth() &&
        recordDate.getFullYear() === now.getFullYear()
      );
    }).length;

    const thisYear = records.filter((r) => {
      const recordDate = new Date(r.date);
      const now = new Date();
      return recordDate.getFullYear() === now.getFullYear();
    }).length;

    const byType = records.reduce(
      (acc, record) => {
        acc[record.type] = (acc[record.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const followUpRequired = records.filter((r) => r.followUpRequired).length;

    return {
      total,
      urgent,
      high,
      thisMonth,
      thisYear,
      byType,
      followUpRequired,
    };
  };

  const stats = getStats();

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "consultation":
        return "👨‍⚕️";
      case "diagnosis":
        return "🔍";
      case "treatment":
        return "💊";
      case "test_result":
        return "🔬";
      case "prescription":
        return "📋";
      case "surgery":
        return "🏥";
      case "emergency":
        return "🚨";
      case "vaccination":
        return "💉";
      default:
        return "📄";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "consultation":
        return "Consultas";
      case "diagnosis":
        return "Diagnósticos";
      case "treatment":
        return "Tratamientos";
      case "test_result":
        return "Pruebas";
      case "prescription":
        return "Prescripciones";
      case "surgery":
        return "Cirugías";
      case "emergency":
        return "Emergencias";
      case "vaccination":
        return "Vacunaciones";
      default:
        return "Otros";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Estadísticas del Historial
      </h3>

      {/* Resumen general */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <div className="text-2xl font-bold text-red-600">{stats.urgent}</div>
          <div className="text-sm text-gray-600">Urgentes</div>
        </div>
        <div className="text-center p-3 bg-orange-50 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">{stats.high}</div>
          <div className="text-sm text-gray-600">Alta prioridad</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {stats.thisMonth}
          </div>
          <div className="text-sm text-gray-600">Este mes</div>
        </div>
      </div>

      {/* Seguimientos pendientes */}
      {stats.followUpRequired > 0 && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center">
            <div className="text-yellow-600 text-xl mr-3">⚠️</div>
            <div>
              <div className="font-semibold text-yellow-800">
                {stats.followUpRequired} seguimiento
                {stats.followUpRequired !== 1 ? "s" : ""} pendiente
                {stats.followUpRequired !== 1 ? "s" : ""}
              </div>
              <div className="text-sm text-yellow-700">
                Requieren atención médica de seguimiento
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Distribución por tipo */}
      <div>
        <h4 className="text-md font-semibold text-gray-700 mb-3">
          Distribución por tipo
        </h4>
        <div className="space-y-2">
          {Object.entries(stats.byType)
            .sort(([, a], [, b]) => b - a)
            .map(([type, count]) => (
              <div
                key={type}
                className="flex items-center justify-between p-2 bg-gray-50 rounded"
              >
                <div className="flex items-center">
                  <span className="text-lg mr-2">{getTypeIcon(type)}</span>
                  <span className="text-sm text-gray-700">
                    {getTypeLabel(type)}
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(count / stats.total) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-600">
                    {count}
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Actividad reciente */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-md font-semibold text-gray-700 mb-3">
          Actividad reciente
        </h4>
        <div className="space-y-2 text-sm text-gray-600">
          <div>
            • {stats.thisYear} registros en {new Date().getFullYear()}
          </div>
          <div>
            • {stats.thisMonth} registros en{" "}
            {new Date().toLocaleDateString("es-ES", { month: "long" })}
          </div>
          <div>
            • Promedio:{" "}
            {stats.total > 0
              ? Math.round(
                  stats.total / Math.max(1, new Date().getFullYear() - 2020)
                )
              : 0}{" "}
            por año
          </div>
        </div>
      </div>
    </div>
  );
}
