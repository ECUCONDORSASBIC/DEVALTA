import React from "react";
import { MedicalRecord } from "../../types";

interface StatsPanelProps {
  records: MedicalRecord[];
}

const StatsPanel: React.FC<StatsPanelProps> = ({ records }) => {
  if (!records || records.length === 0) return null;
  const byType = records.reduce(
    (acc, r) => {
      acc[r.type] = (acc[r.type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
  const byPriority = records.reduce(
    (acc, r) => {
      acc[r.priority] = (acc[r.priority] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
  return (
    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
      <div className="font-semibold mb-2">Estadísticas</div>
      <div className="text-sm text-gray-700 mb-1">Por tipo:</div>
      <ul className="mb-2">
        {Object.entries(byType).map(([type, count]) => (
          <li key={type}>
            {type}: {count}
          </li>
        ))}
      </ul>
      <div className="text-sm text-gray-700 mb-1">Por prioridad:</div>
      <ul>
        {Object.entries(byPriority).map(([priority, count]) => (
          <li key={priority}>
            {priority}: {count}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StatsPanel;
