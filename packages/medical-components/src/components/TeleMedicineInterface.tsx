// 🎥 TELEMEDICINE INTERFACE - ALTAMEDICA
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Activity,
  Clock,
  FileText, Heart,
  MessageSquare,
  Mic, MicOff,
  Monitor,
  PhoneOff,
  Settings,
  Share2,
  Shield,
  Users,
  Video, VideoOff
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface TeleMedicineProps {
  sessionId: string;
  participantId: string;
  participantName: string;
  role: 'doctor' | 'patient';
  onSessionEnd?: () => void;
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderType: 'doctor' | 'patient';
  message: string;
  timestamp: Date;
  type: 'text' | 'file' | 'vital' | 'prescription';
}

interface Participant {
  id: string;
  name: string;
  role: 'doctor' | 'patient';
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
}

interface VitalSigns {
  heartRate: number;
  bloodPressure: { systolic: number; diastolic: number };
  temperature: number;
  oxygenSaturation: number;
  timestamp: Date;
}

export const TeleMedicineInterface: React.FC<TeleMedicineProps> = ({
  sessionId,
  participantId,
  participantName,
  role,
  onSessionEnd
}) => {
  // State Management
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [sessionStatus, setSessionStatus] = useState<'connecting' | 'connected' | 'ended'>('connecting');
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [vitals, setVitals] = useState<VitalSigns | null>(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [activeTab, setActiveTab] = useState('video');

  // Refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io('http://localhost:3001', {
      transports: ['websocket'],
    });

    setSocket(newSocket);

    // Socket event listeners
    newSocket.on('connect', () => {
      setIsConnected(true);
      // Join the session
      newSocket.emit('join-session', {
        sessionId,
        participantId,
        role,
        name: participantName,
      });
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('session-ready', (data) => {
      setSessionStatus('connected');
      setParticipants(data.participants);
      console.log('Session ready:', data);
    });

    newSocket.on('router-capabilities', (capabilities) => {
      console.log('Router capabilities received:', capabilities);
      // Initialize WebRTC with MediaSoup capabilities
      initializeWebRTC(capabilities);
    });

    newSocket.on('chat-message', (message: ChatMessage) => {
      setChatMessages(prev => [...prev, message]);
    });

    newSocket.on('vitals-shared', (data) => {
      setVitals(data.vitals);
    });

    newSocket.on('participant-media-changed', (data) => {
      setParticipants(prev => 
        prev.map(p => 
          p.id === data.participantId 
            ? { ...p, [data.type === 'video' ? 'isVideoEnabled' : 'isAudioEnabled']: data.enabled }
            : p
        )
      );
    });

    newSocket.on('session-ended', (data) => {
      setSessionStatus('ended');
      console.log('Session ended:', data.summary);
      if (onSessionEnd) {
        onSessionEnd();
      }
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    return () => {
      newSocket.close();
    };
  }, [sessionId, participantId, participantName, role, onSessionEnd]);

  // Initialize WebRTC
  const initializeWebRTC = async (routerCapabilities: any) => {
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      localStreamRef.current = stream;
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Create peer connection
      const peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
        ],
      });

      peerConnectionRef.current = peerConnection;

      // Add local stream to peer connection
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });

      // Handle remote stream
      peerConnection.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate && socket) {
          socket.emit('ice-candidate', {
            candidate: event.candidate,
            sessionId,
          });
        }
      };

      console.log('WebRTC initialized successfully');
    } catch (error) {
      console.error('Error initializing WebRTC:', error);
    }
  };

  // Session duration timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (sessionStatus === 'connected') {
      interval = setInterval(() => {
        setSessionDuration(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [sessionStatus]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Toggle video
  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
        
        if (socket) {
          socket.emit('toggle-media', {
            type: 'video',
            enabled: videoTrack.enabled,
          });
        }
      }
    }
  };

  // Toggle audio
  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
        
        if (socket) {
          socket.emit('toggle-media', {
            type: 'audio',
            enabled: audioTrack.enabled,
          });
        }
      }
    }
  };

  // Send chat message
  const sendMessage = () => {
    if (newMessage.trim() && socket) {
      socket.emit('chat-message', {
        sessionId,
        message: newMessage,
        type: 'text',
      });
      setNewMessage('');
    }
  };

  // Share vitals (patient only)
  const shareVitals = () => {
    if (role === 'patient' && socket) {
      const mockVitals: VitalSigns = {
        heartRate: 75 + Math.floor(Math.random() * 20),
        bloodPressure: {
          systolic: 120 + Math.floor(Math.random() * 20),
          diastolic: 80 + Math.floor(Math.random() * 10),
        },
        temperature: 36.5 + Math.random() * 2,
        oxygenSaturation: 95 + Math.floor(Math.random() * 5),
        timestamp: new Date(),
      };

      socket.emit('share-vitals', {
        sessionId,
        vitals: mockVitals,
      });
    }
  };

  // End session
  const endSession = () => {
    if (socket) {
      socket.emit('end-session', { sessionId });
    }
    
    // Clean up local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    
    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
  };

  // Format duration
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Render connection status
  const renderConnectionStatus = () => {
    if (sessionStatus === 'connecting') {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Conectando a la sesión...</p>
          </div>
        </div>
      );
    }

    if (sessionStatus === 'ended') {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <PhoneOff className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">La sesión ha terminado</p>
            <p className="text-sm text-gray-500 mt-2">
              Duración: {formatDuration(sessionDuration)}
            </p>
          </div>
        </div>
      );
    }

    return null;
  };

  if (sessionStatus !== 'connected') {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Consulta Virtual - {role === 'doctor' ? 'Doctor' : 'Paciente'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderConnectionStatus()}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Video className="h-6 w-6 text-blue-600" />
              Consulta Virtual
            </h1>
            <Badge variant="outline" className="bg-green-50 text-green-700">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Conectado
            </Badge>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              {formatDuration(sessionDuration)}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={isVideoEnabled ? "default" : "secondary"}
              size="sm"
              onClick={toggleVideo}
            >
              {isVideoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
            </Button>
            <Button
              variant={isAudioEnabled ? "default" : "secondary"}
              size="sm"
              onClick={toggleAudio}
            >
              {isAudioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={endSession}
            >
              <PhoneOff className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* Video Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-4">
                <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
                  {/* Remote Video */}
                  <video
                    ref={remoteVideoRef}
                    className="w-full h-full object-cover"
                    autoPlay
                    playsInline
                  />
                  
                  {/* Local Video (Picture-in-Picture) */}
                  <div className="absolute top-4 right-4 w-32 h-24 bg-gray-800 rounded-lg overflow-hidden">
                    <video
                      ref={localVideoRef}
                      className="w-full h-full object-cover"
                      autoPlay
                      playsInline
                      muted
                    />
                  </div>
                  
                  {/* Overlay Information */}
                  <div className="absolute bottom-4 left-4 text-white">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span className="text-sm">
                        {participants.length} participantes
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Side Panel */}
          <div className="space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="chat">Chat</TabsTrigger>
                <TabsTrigger value="vitals">Vitales</TabsTrigger>
                <TabsTrigger value="tools">Herramientas</TabsTrigger>
              </TabsList>

              {/* Chat Tab */}
              <TabsContent value="chat" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Chat
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ScrollArea className="h-64">
                      <div className="space-y-2">
                        {chatMessages.map((message) => (
                          <div
                            key={message.id}
                            className={`p-2 rounded-lg ${
                              message.senderId === participantId
                                ? 'bg-blue-500 text-white ml-4'
                                : 'bg-gray-100 text-gray-800 mr-4'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium">
                                {message.senderType === 'doctor' ? 'Dr.' : 'Paciente'}
                              </span>
                              <span className="text-xs opacity-70">
                                {message.timestamp.toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-sm">{message.message}</p>
                          </div>
                        ))}
                        <div ref={chatEndRef} />
                      </div>
                    </ScrollArea>
                    
                    <div className="flex gap-2">
                      <Input
                        placeholder="Escribir mensaje..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      />
                      <Button onClick={sendMessage}>
                        Enviar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Vitals Tab */}
              <TabsContent value="vitals" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="h-4 w-4" />
                      Signos Vitales
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {role === 'patient' && (
                      <Button onClick={shareVitals} className="w-full">
                        <Share2 className="h-4 w-4 mr-2" />
                        Compartir Vitales
                      </Button>
                    )}
                    
                    {vitals && (
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Ritmo Cardíaco:</span>
                          <span className="font-medium">{vitals.heartRate} bpm</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Presión Arterial:</span>
                          <span className="font-medium">
                            {vitals.bloodPressure.systolic}/{vitals.bloodPressure.diastolic}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Temperatura:</span>
                          <span className="font-medium">{vitals.temperature.toFixed(1)}°C</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Saturación O2:</span>
                          <span className="font-medium">{vitals.oxygenSaturation}%</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Última actualización: {vitals.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tools Tab */}
              <TabsContent value="tools" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Herramientas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <Monitor className="h-4 w-4 mr-2" />
                      Compartir Pantalla
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="h-4 w-4 mr-2" />
                      Crear Prescripción
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Activity className="h-4 w-4 mr-2" />
                      Generar Reporte
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Shield className="h-4 w-4 mr-2" />
                      Iniciar Grabación
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeleMedicineInterface;
