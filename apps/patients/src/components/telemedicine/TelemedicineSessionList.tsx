import React from "react";
import { TelemedicineSession } from "../../types";
import { useRouter } from "next/navigation";

interface TelemedicineSessionListProps {
  sessions: TelemedicineSession[];
}

const TelemedicineSessionList: React.FC<TelemedicineSessionListProps> = ({
  sessions,
}) => {
  const router = useRouter();
  if (!sessions || sessions.length === 0) {
    return (
      <div className="text-center text-gray-500 py-12">
        No hay sesiones de telemedicina
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-4">
      {sessions.map((session) => (
        <div
          key={session.id}
          className="bg-white rounded-xl shadow p-4 flex flex-col hover:shadow-lg transition cursor-pointer"
          onClick={() => router.push(`/telemedicine/room/${session.id}`)}
        >
          <div className="font-bold text-lg mb-1">{session.doctorName}</div>
          <div className="text-gray-600 text-sm mb-2">
            {session.date} • {session.status}
          </div>
          <div className="text-gray-500 text-xs">
            Especialidad: {session.specialty}
          </div>
          <div className="mt-2 text-blue-600 text-sm">
            Entrar a la sala &rarr;
          </div>
        </div>
      ))}
    </div>
  );
};

export default TelemedicineSessionList;
