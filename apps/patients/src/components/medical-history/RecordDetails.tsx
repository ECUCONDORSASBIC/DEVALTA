import React from "react";
import { MedicalRecord } from "../../types";

interface RecordDetailsProps {
  record: MedicalRecord;
}

const RecordDetails: React.FC<RecordDetailsProps> = ({ record }) => {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-bold mb-2">{record.title}</h2>
      <div className="text-gray-600 mb-2">
        {record.date} • {record.type} • Prioridad: {record.priority}
      </div>
      <div className="mb-4 text-gray-700">{record.description}</div>
      {record.diagnosis && record.diagnosis.length > 0 && (
        <div className="mb-2">
          <div className="font-semibold">Diagnóstico:</div>
          <ul className="list-disc list-inside text-sm">
            {record.diagnosis.map((d, i) => (
              <li key={i}>{d}</li>
            ))}
          </ul>
        </div>
      )}
      {record.symptoms && record.symptoms.length > 0 && (
        <div className="mb-2">
          <div className="font-semibold">Síntomas:</div>
          <ul className="list-disc list-inside text-sm">
            {record.symptoms.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}
      {record.treatment && (
        <div className="mb-2">
          <div className="font-semibold">Tratamiento:</div>
          <div className="text-sm">{record.treatment}</div>
        </div>
      )}
      {record.medications && record.medications.length > 0 && (
        <div className="mb-2">
          <div className="font-semibold">Medicamentos:</div>
          <ul className="list-disc list-inside text-sm">
            {record.medications.map((m, i) => (
              <li key={i}>
                {m.name} ({m.dosage}, {m.frequency})
              </li>
            ))}
          </ul>
        </div>
      )}
      {record.attachments && record.attachments.length > 0 && (
        <div className="mb-2">
          <div className="font-semibold">Archivos adjuntos:</div>
          <ul className="list-disc list-inside text-sm">
            {record.attachments.map((a, i) => (
              <li key={i}>
                <a href={a.url} className="text-blue-600 underline">
                  {a.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default RecordDetails;
