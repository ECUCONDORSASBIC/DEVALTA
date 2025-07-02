"use client";

import React from "react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  Phone,
  PhoneOff,
} from "lucide-react";

interface VideoCallProps {
  isConnected: boolean;
  isMuted: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onEndCall: () => void;
  onJoinCall: () => void;
}

export default function VideoCall({
  isConnected,
  isMuted,
  isVideoEnabled,
  isScreenSharing,
  onToggleMute,
  onToggleVideo,
  onToggleScreenShare,
  onEndCall,
  onJoinCall,
}: VideoCallProps) {
  return (
    <div className="w-full h-full bg-gray-900 rounded-lg overflow-hidden">
      {/* Video Area */}
      <div className="relative h-full">
        {/* Video Placeholder */}
        <div className="absolute inset-0 flex items-center justify-center">
          {isConnected ? (
            <div className="text-center">
              <div className="w-32 h-32 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="w-16 h-16 text-white" />
              </div>
              <p className="text-white text-lg">Conexión de video activa</p>
              <p className="text-gray-400 text-sm">
                Dr. Martínez - Cardiología
              </p>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-32 h-32 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-16 h-16 text-gray-400" />
              </div>
              <p className="text-white text-lg">Sala de espera virtual</p>
              <p className="text-gray-400 text-sm">
                Esperando conexión del médico
              </p>
            </div>
          )}
        </div>

        {/* Connection Status */}
        <div className="absolute top-4 left-4">
          <div
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              isConnected
                ? "bg-green-500 text-white"
                : "bg-yellow-500 text-white"
            }`}
          >
            {isConnected ? "Conectado" : "Esperando"}
          </div>
        </div>

        {/* Controls */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <div className="flex items-center space-x-4 bg-black bg-opacity-50 rounded-full px-6 py-3">
            {/* Mute Button */}
            <button
              onClick={onToggleMute}
              className={`p-3 rounded-full transition-colors ${
                isMuted
                  ? "bg-red-500 text-white"
                  : "bg-gray-700 text-white hover:bg-gray-600"
              }`}
            >
              {isMuted ? (
                <MicOff className="w-5 h-5" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </button>

            {/* Video Button */}
            <button
              onClick={onToggleVideo}
              className={`p-3 rounded-full transition-colors ${
                !isVideoEnabled
                  ? "bg-red-500 text-white"
                  : "bg-gray-700 text-white hover:bg-gray-600"
              }`}
            >
              {isVideoEnabled ? (
                <Video className="w-5 h-5" />
              ) : (
                <VideoOff className="w-5 h-5" />
              )}
            </button>

            {/* Screen Share Button */}
            <button
              onClick={onToggleScreenShare}
              className={`p-3 rounded-full transition-colors ${
                isScreenSharing
                  ? "bg-blue-500 text-white"
                  : "bg-gray-700 text-white hover:bg-gray-600"
              }`}
            >
              <Monitor className="w-5 h-5" />
            </button>

            {/* Join/End Call Button */}
            {isConnected ? (
              <button
                onClick={onEndCall}
                className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <PhoneOff className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={onJoinCall}
                className="p-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
              >
                <Phone className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Timer */}
        {isConnected && (
          <div className="absolute top-4 right-4">
            <div className="bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
              00:15:32
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
