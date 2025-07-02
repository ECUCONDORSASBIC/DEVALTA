import React from "react";

interface FilterPanelProps {
  filters: any;
  onFiltersChange: (filters: any) => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFiltersChange,
}) => {
  return (
    <div className="mb-6">
      <div className="font-semibold mb-2">Filtros</div>
      <div className="flex flex-col gap-2">
        <input
          type="text"
          placeholder="Buscar por diagnóstico o doctor..."
          value={filters.query || ""}
          onChange={(e) =>
            onFiltersChange({ ...filters, query: e.target.value })
          }
          className="px-3 py-2 border rounded-lg"
        />
        <select
          value={filters.type || ""}
          onChange={(e) =>
            onFiltersChange({ ...filters, type: e.target.value })
          }
          className="px-3 py-2 border rounded-lg"
        >
          <option value="">Todos los tipos</option>
          <option value="consultation">Consulta</option>
          <option value="diagnosis">Diagnóstico</option>
          <option value="treatment">Tratamiento</option>
          <option value="test_result">Estudio</option>
          <option value="prescription">Prescripción</option>
          <option value="surgery">Cirugía</option>
          <option value="emergency">Emergencia</option>
          <option value="vaccination">Vacunación</option>
        </select>
        <select
          value={filters.priority || ""}
          onChange={(e) =>
            onFiltersChange({ ...filters, priority: e.target.value })
          }
          className="px-3 py-2 border rounded-lg"
        >
          <option value="">Todas las prioridades</option>
          <option value="low">Baja</option>
          <option value="normal">Normal</option>
          <option value="high">Alta</option>
          <option value="urgent">Urgente</option>
        </select>
        <input
          type="date"
          value={filters.dateFrom || ""}
          onChange={(e) =>
            onFiltersChange({ ...filters, dateFrom: e.target.value })
          }
          className="px-3 py-2 border rounded-lg"
        />
        <input
          type="date"
          value={filters.dateTo || ""}
          onChange={(e) =>
            onFiltersChange({ ...filters, dateTo: e.target.value })
          }
          className="px-3 py-2 border rounded-lg"
        />
        <button
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg"
          onClick={() => onFiltersChange({})}
        >
          Limpiar filtros
        </button>
      </div>
    </div>
  );
};

export default FilterPanel;
