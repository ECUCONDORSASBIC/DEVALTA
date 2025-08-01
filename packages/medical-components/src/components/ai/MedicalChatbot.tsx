/**
 * 💬 ALTAMEDICA MEDICAL CHATBOT
 * Chatbot médico inteligente con IA avanzada
 */

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Send, 
  Bot, 
  User, 
  Brain, 
  AlertTriangle,
  Clock,
  Mic,
  MicOff,
  Paperclip,
  Smile,
  Activity,
  Shield,
  Heart,
  Zap
} from 'lucide-react';

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type: 'text' | 'suggestion' | 'warning' | 'recommendation';
  metadata?: {
    confidence?: number;
    urgency?: 'low' | 'medium' | 'high' | 'emergency';
    sources?: string[];
    relatedSymptoms?: string[];
  };
}

interface QuickResponse {
  id: string;
  text: string;
  category: 'symptoms' | 'appointment' | 'medication' | 'general';
}

export const MedicalChatbot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: '¡Hola! Soy el asistente médico virtual de Altamedica. ¿En qué puedo ayudarte hoy? Puedo responder preguntas sobre síntomas, medicamentos, programar citas y más.',
      sender: 'bot',
      timestamp: new Date(),
      type: 'text',
      metadata: {
        confidence: 1,
        urgency: 'low'
      }
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [userType, setUserType] = useState<'patient' | 'doctor' | 'nurse'>('patient');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickResponses: QuickResponse[] = [
    { id: '1', text: 'Tengo dolor de cabeza', category: 'symptoms' },
    { id: '2', text: 'Quiero programar una cita', category: 'appointment' },
    { id: '3', text: '¿Cuáles son los efectos secundarios?', category: 'medication' },
    { id: '4', text: '¿Cuál es el horario de atención?', category: 'general' },
    { id: '5', text: 'Tengo fiebre y tos', category: 'symptoms' },
    { id: '6', text: '¿Cómo tomo mi medicamento?', category: 'medication' }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Simular respuesta del chatbot con IA
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const botResponse = await generateBotResponse(content);
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Error generating response:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: 'Lo siento, tuve un problema procesando tu mensaje. ¿Podrías intentarlo de nuevo?',
        sender: 'bot',
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const generateBotResponse = async (userInput: string): Promise<ChatMessage> => {
    // Simulación de respuestas inteligentes basadas en el input
    const lowerInput = userInput.toLowerCase();
    
    if (lowerInput.includes('dolor') && lowerInput.includes('cabeza')) {
      return {
        id: Date.now().toString(),
        content: 'Entiendo que tienes dolor de cabeza. Te ayudo a evaluar la situación:\n\n• ¿Cuándo comenzó el dolor?\n• ¿Es constante o intermitente?\n• ¿Qué tan intenso es (1-10)?\n• ¿Tienes otros síntomas como náuseas o sensibilidad a la luz?\n\n⚠️ **Señales de alarma:** Si el dolor es muy intenso y repentino, o tienes síntomas neurológicos, busca atención médica inmediata.',
        sender: 'bot',
        timestamp: new Date(),
        type: 'recommendation',
        metadata: {
          confidence: 0.92,
          urgency: 'medium',
          relatedSymptoms: ['náuseas', 'fotofobia', 'mareos']
        }
      };
    }
    
    if (lowerInput.includes('cita') || lowerInput.includes('appointment')) {
      return {
        id: Date.now().toString(),
        content: 'Te ayudo a programar una cita médica:\n\n📅 **Horarios disponibles:**\n• Lunes a Viernes: 8:00 AM - 6:00 PM\n• Sábados: 9:00 AM - 2:00 PM\n\n👨‍⚕️ **Especialidades disponibles:**\n• Medicina General\n• Cardiología\n• Dermatología\n• Pediatría\n• Ginecología\n\n¿Qué especialidad necesitas y en qué horario prefieres?',
        sender: 'bot',
        timestamp: new Date(),
        type: 'suggestion',
        metadata: {
          confidence: 0.95,
          urgency: 'low'
        }
      };
    }
    
    if (lowerInput.includes('fiebre') || lowerInput.includes('temperatura')) {
      return {
        id: Date.now().toString(),
        content: 'La fiebre puede indicar una infección. Te recomiendo:\n\n🌡️ **Monitoreo:**\n• Toma tu temperatura cada 4-6 horas\n• Mantente hidratado\n• Descansa lo suficiente\n\n🚨 **Busca atención médica si:**\n• Temperatura > 39°C (102°F)\n• Fiebre por más de 3 días\n• Síntomas graves (dificultad para respirar, confusión)\n\n¿Cuál es tu temperatura actual y desde cuándo tienes fiebre?',
        sender: 'bot',
        timestamp: new Date(),
        type: 'warning',
        metadata: {
          confidence: 0.88,
          urgency: 'medium',
          relatedSymptoms: ['escalofríos', 'sudoración', 'dolor muscular']
        }
      };
    }
    
    if (lowerInput.includes('medicamento') || lowerInput.includes('medicina')) {
      return {
        id: Date.now().toString(),
        content: 'Para información sobre medicamentos:\n\n💊 **Información disponible:**\n• Dosis y horarios\n• Efectos secundarios\n• Interacciones\n• Contraindicaciones\n\n⚠️ **Importante:** Siempre consulta con tu médico antes de cambiar cualquier medicamento.\n\n¿Qué medicamento específico te interesa consultar?',
        sender: 'bot',
        timestamp: new Date(),
        type: 'recommendation',
        metadata: {
          confidence: 0.90,
          urgency: 'low'
        }
      };
    }
    
    // Respuesta general
    return {
      id: Date.now().toString(),
      content: 'Gracias por tu mensaje. Como asistente médico virtual, puedo ayudarte con:\n\n• Evaluación de síntomas\n• Información sobre medicamentos\n• Programación de citas\n• Información general de salud\n\n¿En qué área específica necesitas ayuda?',
      sender: 'bot',
      timestamp: new Date(),
      type: 'text',
      metadata: {
        confidence: 0.85,
        urgency: 'low'
      }
    };
  };

  const toggleVoiceInput = () => {
    setIsListening(!isListening);
    // Aquí se implementaría la funcionalidad de reconocimiento de voz
  };

  const getMessageStyle = (message: ChatMessage) => {
    const baseStyle = "p-4 rounded-lg max-w-[80%]";
    
    if (message.sender === 'user') {
      return `${baseStyle} bg-blue-600 text-white ml-auto`;
    }
    
    switch (message.type) {
      case 'warning':
        return `${baseStyle} bg-orange-50 border border-orange-200 text-orange-800`;
      case 'recommendation':
        return `${baseStyle} bg-green-50 border border-green-200 text-green-800`;
      case 'suggestion':
        return `${baseStyle} bg-blue-50 border border-blue-200 text-blue-800`;
      default:
        return `${baseStyle} bg-gray-50 border border-gray-200 text-gray-800`;
    }
  };

  const getUrgencyColor = (urgency?: string) => {
    switch (urgency) {
      case 'emergency': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Asistente Médico Virtual</h1>
          <p className="text-gray-600">IA avanzada para consultas médicas</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            HIPAA Seguro
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Brain className="h-3 w-3" />
            IA Avanzada
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Panel de Información */}
        <div className="space-y-6">
          
          {/* Tipo de Usuario */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Tipo de Usuario
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { value: 'patient', label: 'Paciente', icon: '👤' },
                  { value: 'doctor', label: 'Médico', icon: '👨‍⚕️' },
                  { value: 'nurse', label: 'Enfermero', icon: '👩‍⚕️' }
                ].map((type) => (
                  <Button
                    key={type.value}
                    variant={userType === type.value ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => setUserType(type.value as any)}
                  >
                    <span className="mr-2">{type.icon}</span>
                    {type.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Respuestas Rápidas */}
          <Card>
            <CardHeader>
              <CardTitle>Respuestas Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {quickResponses.map((response) => (
                  <Button
                    key={response.id}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-left h-auto p-2"
                    onClick={() => sendMessage(response.text)}
                  >
                    {response.text}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Estadísticas */}
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Mensajes</span>
                <span className="font-medium">{messages.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Tiempo promedio</span>
                <span className="font-medium">1.8s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Satisfacción</span>
                <span className="font-medium">94.2%</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Principal */}
        <div className="lg:col-span-3">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-blue-600" />
                Chat Médico
                {isTyping && (
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Activity className="h-4 w-4 animate-spin" />
                    Escribiendo...
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="flex-1 overflow-hidden p-0">
              {/* Mensajes */}
              <div className="h-full overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className="flex items-start gap-3">
                    {message.sender === 'bot' && (
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                    )}
                    
                    <div className={getMessageStyle(message)}>
                      <div className="whitespace-pre-line">{message.content}</div>
                      
                      {message.metadata && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <div className="flex items-center gap-2 text-xs">
                            {message.metadata.confidence && (
                              <Badge variant="outline">
                                Confianza: {(message.metadata.confidence * 100).toFixed(0)}%
                              </Badge>
                            )}
                            {message.metadata.urgency && (
                              <Badge className={getUrgencyColor(message.metadata.urgency)}>
                                {message.metadata.urgency}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {message.sender === 'user' && (
                      <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </CardContent>
            
            {/* Input de Mensaje */}
            <div className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Escribe tu mensaje..."
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage(inputMessage)}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleVoiceInput}
                  className={isListening ? 'bg-red-100 text-red-600' : ''}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => sendMessage(inputMessage)}
                  disabled={!inputMessage.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="mt-2 text-xs text-gray-500">
                💡 Tip: Puedes hacer preguntas sobre síntomas, medicamentos, citas médicas y más.
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}; 