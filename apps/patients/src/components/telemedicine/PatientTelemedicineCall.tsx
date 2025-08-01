'use client';

import React, { useState, useRef } from 'react';
import { useTelemedicinePatient } from '@/hooks/useTelemedicinePatient';
import { useWebRTCDoctorHybrid } from '@/hooks/useWebRTCDoctorHybrid'; // Reutilizamos el hook de WebRTC
import { Video, Mic, PhoneOff, MessageSquare } from 'lucide-react';

const VideoPanel = ({ localStream, remoteStream, connectionState }) => (
  <div className="relative w-full h-full bg-gray-800 rounded-lg overflow-hidden">
    <video ref={remoteStream} autoPlay playsInline className="w-full h-full object-cover" />
    <video ref={localStream} autoPlay playsInline muted className="absolute w-40 h-30 bottom-4 right-4 border-2 border-white rounded-lg object-cover" />
    <div className="absolute top-4 left-4 bg-gray-700 bg-opacity-60 text-white px-3 py-1 rounded-full text-sm">
      {connectionState}
    </div>
  </div>
);

const ChatPanel = ({ messages, onSendMessage }) => {
  const [newMessage, setNewMessage] = useState('');
  const messageEndRef = useRef(null);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-200 p-4">
      <h3 className="text-lg font-bold mb-4 text-gray-800">Chat con su Médico</h3>
      <div className="flex-grow overflow-y-auto mb-4 pr-2">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-start mb-3 ${msg.sender === 'patient' ? 'justify-end' : ''}`}>
            <div className={`p-3 rounded-lg max-w-xs ${msg.sender === 'patient' ? 'bg-blue-500 text-white' : 'bg-white text-gray-800'}`}>
              <p className="text-sm">{msg.text}</p>
              <p className="text-xs opacity-70 mt-1 text-right">{new Date(msg.timestamp).toLocaleTimeString()}</p>
            </div>
          </div>
        ))}
        <div ref={messageEndRef} />
      </div>
      <div className="flex">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          className="flex-grow bg-white text-gray-800 rounded-l-md px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Escriba un mensaje..."
        />
        <button onClick={handleSend} className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600">
          Enviar
        </button>
      </div>
    </div>
  );
};

const CallControls = ({ onHangUp, onToggleAudio, onToggleVideo, isAudioMuted, isVideoMuted }) => (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white bg-opacity-90 p-3 rounded-full shadow-lg">
        <button onClick={onToggleAudio} className={`p-3 rounded-full ${isAudioMuted ? 'bg-red-500' : 'bg-gray-200'} text-gray-800 hover:bg-gray-300`}>
            <Mic className="w-6 h-6" />
        </button>
        <button onClick={onToggleVideo} className={`p-3 rounded-full ${isVideoMuted ? 'bg-red-500' : 'bg-gray-200'} text-gray-800 hover:bg-gray-300`}>
            <Video className="w-6 h-6" />
        </button>
        <button onClick={onHangUp} className="p-3 rounded-full bg-red-600 text-white hover:bg-red-700">
            <PhoneOff className="w-6 h-6" />
        </button>
    </div>
);

export const PatientTelemedicineCall = ({ sessionId, patientId, doctorId }) => {
  const { session, chatHistory, sendMessage, error } = useTelemedicinePatient(sessionId, patientId, doctorId);
  const { 
    localStreamRef, 
    remoteStreamRef, 
    connectionState, 
    isAudioMuted, 
    isVideoMuted, 
    toggleAudio, 
    toggleVideo, 
    hangUp 
  } = useWebRTCDoctorHybrid(sessionId, patientId, session?.roomId); // Reutilizamos el hook WebRTC

  if (error) {
    return <div className="text-red-500 text-center p-8">Error: {error}</div>;
  }

  if (!session) {
    return <div className="text-gray-800 text-center p-8">Conectando a la consulta...</div>;
  }

  return (
    <div className="w-full h-screen bg-gray-100 flex p-4 gap-4">
      <div className="flex-grow h-full">
        <VideoPanel localStream={localStreamRef} remoteStream={remoteStreamRef} connectionState={connectionState} />
        <CallControls 
            onHangUp={hangUp}
            onToggleAudio={toggleAudio}
            onToggleVideo={toggleVideo}
            isAudioMuted={isAudioMuted}
            isVideoMuted={isVideoMuted}
        />
      </div>
      <div className="w-1/3 h-full">
        <ChatPanel messages={chatHistory} onSendMessage={sendMessage} />
      </div>
    </div>
  );
};
