import React from "react";
import { MedicalRecord } from "../../types";

interface ExportPanelProps {
  records: MedicalRecord[];
}

const ExportPanel: React.FC<ExportPanelProps> = ({ records }) => {
  const handleExport = (format: string) => {
    // Aquí iría la lógica real de exportación
    alert(`Exportando ${records.length} registros como ${format}`);
  };
  return (
    <div className="flex gap-2">
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        onClick={() => handleExport("PDF")}
      >
        Exportar PDF
      </button>
      <button
        className="px-4 py-2 bg-green-600 text-white rounded-lg"
        onClick={() => handleExport("CSV")}
      >
        Exportar CSV
      </button>
      <button
        className="px-4 py-2 bg-gray-600 text-white rounded-lg"
        onClick={() => handleExport("JSON")}
      >
        Exportar JSON
      </button>
    </div>
  );
};

export default ExportPanel;
