"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { VideoCall } from "../../../components/telemedicine/VideoCall";
import { ChatPanel } from "../../../components/telemedicine/ChatPanel";
import { SessionControls } from "../../../components/telemedicine/SessionControls";
import { User, Calendar, Clock, ArrowLeft } from "lucide-react";

// Datos mock para la sesión
const sessionMock = {
  id: "tm-001",
  doctorName: "Dra. Ana López",
  specialty: "Medicina General",
  date: "2025-07-01",
  time: "15:00",
  status: "active",
  notes: "Consulta de seguimiento",
};

export default function TelemedicineSessionPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b shadow-sm px-4 py-4 flex items-center space-x-4">
        <button
          onClick={() => router.back()}
          className="p-2 rounded hover:bg-gray-100"
        >
          <ArrowLeft className="w-5 h-5 text-blue-600" />
        </button>
        <h1 className="text-xl font-bold text-gray-900 flex items-center">
          <VideoCall.Icon className="w-6 h-6 mr-2 text-blue-600" />
          Sesión de Telemedicina
        </h1>
      </div>
      <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Panel principal: Videollamada y controles */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-4 mb-4">
              <User className="w-8 h-8 text-blue-500" />
              <div>
                <div className="font-semibold text-gray-900">
                  {sessionMock.doctorName}
                </div>
                <div className="text-sm text-gray-600">
                  {sessionMock.specialty}
                </div>
                <div className="flex items-center text-xs text-gray-500 mt-1">
                  <Calendar className="w-4 h-4 mr-1" />
                  {sessionMock.date}
                  <Clock className="w-4 h-4 ml-4 mr-1" />
                  {sessionMock.time}
                </div>
              </div>
            </div>
            <VideoCall sessionId={sessionMock.id} />
            <SessionControls
              sessionId={sessionMock.id}
              status={sessionMock.status}
            />
          </div>
        </div>
        {/* Panel lateral: Chat */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Chat en tiempo real
            </h2>
            <ChatPanel sessionId={sessionMock.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
