"use client";

import React from "react";
import { MedicalRecord } from "../../types";

interface MedicalHistoryTimelineProps {
  records: MedicalRecord[];
  onRecordClick: (record: MedicalRecord) => void;
}

export default function MedicalHistoryTimeline({
  records,
  onRecordClick,
}: MedicalHistoryTimelineProps) {
  // Agrupar registros por año y mes
  const groupedRecords = records.reduce(
    (groups, record) => {
      const date = new Date(record.date);
      const year = date.getFullYear();
      const month = date.getMonth();
      const key = `${year}-${month}`;

      if (!groups[key]) {
        groups[key] = {
          year,
          month,
          records: [],
        };
      }

      groups[key].records.push(record);
      return groups;
    },
    {} as Record<
      string,
      { year: number; month: number; records: MedicalRecord[] }
    >
  );

  // Ordenar grupos por fecha (más reciente primero)
  const sortedGroups = Object.values(groupedRecords).sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.month - a.month;
  });

  const getMonthName = (month: number) => {
    const months = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ];
    return months[month];
  };

  const getRecordIcon = (type: string) => {
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "border-red-500 bg-red-50";
      case "high":
        return "border-orange-500 bg-orange-50";
      case "normal":
        return "border-blue-500 bg-blue-50";
      case "low":
        return "border-gray-500 bg-gray-50";
      default:
        return "border-gray-300 bg-white";
    }
  };

  const getPriorityTextColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "text-red-800";
      case "high":
        return "text-orange-800";
      case "normal":
        return "text-blue-800";
      case "low":
        return "text-gray-800";
      default:
        return "text-gray-800";
    }
  };

  return (
    <div className="space-y-8">
      {sortedGroups.map((group) => (
        <div key={`${group.year}-${group.month}`} className="relative">
          {/* Encabezado del mes */}
          <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-50 to-indigo-50 py-3 px-4 rounded-lg mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              {getMonthName(group.month)} {group.year}
            </h3>
            <p className="text-sm text-gray-600">
              {group.records.length} registro
              {group.records.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* Línea de tiempo */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

            {/* Registros */}
            <div className="space-y-6">
              {group.records
                .sort(
                  (a, b) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                )
                .map((record, index) => (
                  <div key={record.id} className="relative">
                    {/* Punto en la línea de tiempo */}
                    <div className="absolute left-4 top-6 w-4 h-4 bg-white border-2 border-blue-500 rounded-full z-20"></div>

                    {/* Contenido del registro */}
                    <div
                      className={`ml-12 p-4 rounded-lg border-l-4 cursor-pointer hover:shadow-lg transition-all duration-200 ${getPriorityColor(record.priority)}`}
                      onClick={() => onRecordClick(record)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="text-2xl">
                              {getRecordIcon(record.type)}
                            </span>
                            <h4 className="text-lg font-semibold text-gray-800">
                              {record.title}
                            </h4>
                          </div>

                          <p className="text-gray-600 mb-3 line-clamp-2">
                            {record.description}
                          </p>

                          <div className="flex items-center space-x-4 text-sm">
                            <span className="text-gray-500">
                              {new Date(record.date).toLocaleDateString(
                                "es-ES",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                }
                              )}
                            </span>

                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityTextColor(record.priority)} bg-white`}
                            >
                              {record.priority === "urgent" && "Urgente"}
                              {record.priority === "high" && "Alta"}
                              {record.priority === "normal" && "Normal"}
                              {record.priority === "low" && "Baja"}
                            </span>

                            <span className="text-gray-500 capitalize">
                              {record.type === "consultation" && "Consulta"}
                              {record.type === "diagnosis" && "Diagnóstico"}
                              {record.type === "treatment" && "Tratamiento"}
                              {record.type === "test_result" && "Prueba"}
                              {record.type === "prescription" && "Prescripción"}
                              {record.type === "surgery" && "Cirugía"}
                              {record.type === "emergency" && "Emergencia"}
                              {record.type === "vaccination" && "Vacunación"}
                              {record.type === "other" && "Otro"}
                            </span>
                          </div>

                          {/* Tags */}
                          {record.tags && record.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-3">
                              {record.tags.slice(0, 3).map((tag, tagIndex) => (
                                <span
                                  key={tagIndex}
                                  className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                                >
                                  {tag}
                                </span>
                              ))}
                              {record.tags.length > 3 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                  +{record.tags.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Indicador de seguimiento */}
                        {record.followUpRequired && (
                          <div className="flex-shrink-0 ml-4">
                            <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      ))}

      {sortedGroups.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📅</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            No hay registros en la cronología
          </h3>
          <p className="text-gray-600">
            Los registros médicos aparecerán aquí organizados por fecha.
          </p>
        </div>
      )}
    </div>
  );
}
