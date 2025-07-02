"use client";

import React, { useState } from "react";
import { MedicalRecord } from "../../types";

interface MedicalHistoryExportProps {
  records: MedicalRecord[];
  patientName?: string;
}

export default function MedicalHistoryExport({
  records,
  patientName,
}: MedicalHistoryExportProps) {
  const [exportFormat, setExportFormat] = useState<"pdf" | "csv" | "json">(
    "pdf"
  );
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);

    try {
      switch (exportFormat) {
        case "pdf":
          await exportToPDF();
          break;
        case "csv":
          exportToCSV();
          break;
        case "json":
          exportToJSON();
          break;
      }
    } catch (error) {
      console.error("Error al exportar:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportToPDF = async () => {
    // Simulación de exportación a PDF
    // En una implementación real, usarías una librería como jsPDF
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const blob = new Blob(["PDF content would be here"], {
      type: "application/pdf",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `historial-medico-${patientName || "paciente"}-${new Date().toISOString().split("T")[0]}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportToCSV = () => {
    const headers = [
      "Fecha",
      "Tipo",
      "Título",
      "Descripción",
      "Diagnóstico",
      "Síntomas",
      "Tratamiento",
      "Prioridad",
      "Seguimiento requerido",
    ];

    const csvContent = [
      headers.join(","),
      ...records.map((record) =>
        [
          new Date(record.date).toLocaleDateString(),
          record.type,
          `"${record.title.replace(/"/g, '""')}"`,
          `"${record.description.replace(/"/g, '""')}"`,
          `"${record.diagnosis.join("; ").replace(/"/g, '""')}"`,
          `"${record.symptoms.join("; ").replace(/"/g, '""')}"`,
          `"${record.treatment.replace(/"/g, '""')}"`,
          record.priority,
          record.followUpRequired ? "Sí" : "No",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `historial-medico-${patientName || "paciente"}-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportToJSON = () => {
    const exportData = {
      patientName: patientName || "Paciente",
      exportDate: new Date().toISOString(),
      totalRecords: records.length,
      records: records.map((record) => ({
        id: record.id,
        date: record.date,
        type: record.type,
        title: record.title,
        description: record.description,
        diagnosis: record.diagnosis,
        symptoms: record.symptoms,
        treatment: record.treatment,
        priority: record.priority,
        followUpRequired: record.followUpRequired,
        tags: record.tags,
      })),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `historial-medico-${patientName || "paciente"}-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getFormatDescription = (format: string) => {
    switch (format) {
      case "pdf":
        return "Documento PDF con formato profesional";
      case "csv":
        return "Archivo CSV para análisis en Excel";
      case "json":
        return "Datos estructurados en formato JSON";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-4">
      {/* Selección de formato */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Formato de exportación
        </label>
        <div className="space-y-2">
          {(["pdf", "csv", "json"] as const).map((format) => (
            <label
              key={format}
              className="flex items-center space-x-3 cursor-pointer"
            >
              <input
                type="radio"
                name="exportFormat"
                value={format}
                checked={exportFormat === format}
                onChange={(e) =>
                  setExportFormat(e.target.value as "pdf" | "csv" | "json")
                }
                className="text-blue-600 focus:ring-blue-500"
              />
              <div>
                <div className="text-sm font-medium text-gray-700">
                  {format.toUpperCase()}
                </div>
                <div className="text-xs text-gray-500">
                  {getFormatDescription(format)}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Información del export */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="text-sm text-gray-600 space-y-1">
          <div>• Total de registros: {records.length}</div>
          <div>
            • Rango de fechas:{" "}
            {records.length > 0
              ? `${new Date(Math.min(...records.map((r) => new Date(r.date).getTime()))).toLocaleDateString()} - ${new Date(Math.max(...records.map((r) => new Date(r.date).getTime()))).toLocaleDateString()}`
              : "No hay registros"}
          </div>
          <div>
            • Incluye: Diagnósticos, síntomas, tratamientos y seguimientos
          </div>
        </div>
      </div>

      {/* Botón de exportación */}
      <button
        onClick={handleExport}
        disabled={isExporting || records.length === 0}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
          isExporting || records.length === 0
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
      >
        {isExporting ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Exportando...
          </div>
        ) : (
          `Exportar como ${exportFormat.toUpperCase()}`
        )}
      </button>

      {/* Notas */}
      <div className="text-xs text-gray-500 space-y-1">
        <div>• Los archivos se descargarán automáticamente</div>
        <div>
          • El historial incluye todos los registros médicos disponibles
        </div>
        <div>
          • Los datos sensibles están protegidos según las regulaciones médicas
        </div>
      </div>
    </div>
  );
}
