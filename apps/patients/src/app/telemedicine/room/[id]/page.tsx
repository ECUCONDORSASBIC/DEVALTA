"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useTelemedicineSession } from "../../../hooks/useTelemedicine";
import VideoCall from "../../../components/telemedicine/VideoCall";
import ChatPanel from "../../../components/telemedicine/ChatPanel";

export default function TelemedicineRoomPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const router = useRouter();

  const {
    session,
    videoCallState,
    messages,
    isLoading,
    error,
    sendMessage,
    toggleMute,
    toggleVideo,
    toggleScreenShare,
    endCall,
    joinCall,
  } = useTelemedicineSession(id);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando sala de telemedicina...</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Error al cargar la sesión
          </h2>
          <p className="text-gray-600 mb-4">
            No se pudo encontrar la sala de telemedicina
          </p>
          <button
            onClick={() => router.push("/telemedicine")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Volver a Telemedicina
          </button>
        </div>
      </div>
    );
  }

  const handleSendMessage = (message: string) => {
    sendMessage(message, "patient-1", "Paciente");
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Video Call Section */}
      <div className="flex-1 p-4">
        <div className="h-full">
          <VideoCall
            isConnected={videoCallState.isConnected}
            isMuted={videoCallState.isMuted}
            isVideoEnabled={videoCallState.isVideoEnabled}
            isScreenSharing={videoCallState.isScreenSharing}
            onToggleMute={toggleMute}
            onToggleVideo={toggleVideo}
            onToggleScreenShare={toggleScreenShare}
            onEndCall={endCall}
            onJoinCall={joinCall}
          />
        </div>
      </div>

      {/* Chat Section */}
      <div className="w-full md:w-96 h-screen">
        <ChatPanel
          messages={messages}
          onSendMessage={handleSendMessage}
          currentUserId="patient-1"
          currentUserName="Paciente"
        />
      </div>
    </div>
  );
}
