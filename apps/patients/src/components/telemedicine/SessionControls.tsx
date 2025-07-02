import React from "react";
import { PhoneOff, MicOff, Monitor } from "lucide-react";

export function SessionControls({
  sessionId,
  status,
}: {
  sessionId: string;
  status: string;
}) {
  return (
    <div className="flex space-x-4 mt-4 justify-center">
      <button
        className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-red-700 transition-colors"
        onClick={() => alert("Finalizar sesión (mock)")}
      >
        <PhoneOff className="w-5 h-5" />
        <span>Finalizar</span>
      </button>
      <button
        className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-gray-300 transition-colors"
        onClick={() => alert("Micrófono silenciado (mock)")}
      >
        <MicOff className="w-5 h-5" />
        <span>Silenciar</span>
      </button>
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
        onClick={() => alert("Compartir pantalla (mock)")}
      >
        <Monitor className="w-5 h-5" />
        <span>Pantalla</span>
      </button>
    </div>
  );
}
