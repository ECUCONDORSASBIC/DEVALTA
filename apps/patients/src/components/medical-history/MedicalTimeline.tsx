import React from "react";
import { MedicalRecord } from "../../types";

interface MedicalTimelineProps {
  records: MedicalRecord[];
}

const MedicalTimeline: React.FC<MedicalTimelineProps> = ({ records }) => {
  if (!records || records.length === 0) {
    return (
      <div className="text-center text-gray-500 py-12">
        No hay registros médicos
      </div>
    );
  }
  return (
    <ul className="timeline timeline-vertical">
      {records.map((record) => (
        <li key={record.id} className="mb-8">
          <div className="flex items-center gap-4">
            <div className="w-3 h-3 bg-blue-600 rounded-full" />
            <div>
              <div className="font-semibold text-lg">{record.title}</div>
              <div className="text-gray-600 text-sm">
                {record.date} • {record.type}
              </div>
              <div className="text-gray-700 text-sm mt-1">
                {record.description}
              </div>
              <a
                href={`/medical-history/${record.id}`}
                className="text-blue-600 text-sm mt-2 inline-block"
              >
                Ver detalle &rarr;
              </a>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default MedicalTimeline;
