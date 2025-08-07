import React, { useState, useEffect, useRef } from 'react';
import { grokService, GrokMessage, GrokConnectionStatus } from '../services/grok-connector';
import { Button } from '@/components/ui/Button';
import { Send, Bot, User, Loader2, AlertCircle, Shield, Settings, TestTube } from 'lucide-react';

interface GrokChatProps {
  className?: string;
}

export const GrokChat: React.FC<GrokChatProps> = ({ className = '' }) => {
  const [messages, setMessages] = useState<GrokMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<GrokConnectionStatus>({
    isConnected: false,
    isAuthenticated: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Intentar conectar al cargar el componente
    connectToGrok();
    
    return () => {
      // Desconectar al desmontar
      grokService.disconnect();
    };
  }, []);

  useEffect(() => {
    // Auto-scroll al último mensaje
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const connectToGrok = async () => {
    try {
      setIsLoading(true);
      
      const success = await grokService.connect();
      const status = grokService.getConnectionStatus();
      setConnectionStatus(status);
      
      if (success) {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          content: 'Conectado a Grok 4 (modo simulación). ¡Puedes empezar a chatear!',
          timestamp: new Date(),
          role: 'assistant'
        }]);
      } else {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          content: 'No se pudo conectar a Grok. Verifica tu conexión.',
          timestamp: new Date(),
          role: 'assistant'
        }]);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        content: `Error de conexión: ${errorMsg}`,
        timestamp: new Date(),
        role: 'assistant'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const testConnection = async () => {
    try {
      setIsTesting(true);
      const result = await grokService.testConnection();
      
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        content: result.success 
          ? `✅ ${result.message}` 
          : `❌ ${result.message}`,
        timestamp: new Date(),
        role: 'assistant'
      }]);

      // Actualizar estado de conexión
      const status = grokService.getConnectionStatus();
      setConnectionStatus(status);
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        content: `❌ Error en prueba: ${errorMsg}`,
        timestamp: new Date(),
        role: 'assistant'
      }]);
    } finally {
      setIsTesting(false);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !connectionStatus.isConnected || isLoading) return;

    const userMessage: GrokMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      timestamp: new Date(),
      role: 'user'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await grokService.sendMessage(inputMessage);
      
      const assistantMessage: GrokMessage = {
        id: (Date.now() + 1).toString(),
        content: response,
        timestamp: new Date(),
        role: 'assistant'
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        content: `❌ Error: ${errorMsg}`,
        timestamp: new Date(),
        role: 'assistant'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getStatusColor = () => {
    if (connectionStatus.isConnected && connectionStatus.isAuthenticated) return 'text-green-600';
    if (connectionStatus.isConnected) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusText = () => {
    if (connectionStatus.isConnected && connectionStatus.isAuthenticated) return 'Conectado y Autenticado';
    if (connectionStatus.isConnected) return 'Conectado (Simulación)';
    return 'Desconectado';
  };

  return (
    <div className={`bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-500 to-blue-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Bot className="h-6 w-6" />
            <div>
              <h3 className="font-semibold">Grok 4 Chat</h3>
              <div className="flex items-center space-x-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${getStatusColor().replace('text-', 'bg-')}`}></div>
                <span className="text-sky-100">{getStatusText()}</span>
                {connectionStatus.isAuthenticated && (
                  <Shield className="h-3 w-3 text-green-300" />
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={testConnection}
              disabled={isTesting}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              size="sm"
            >
              {isTesting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <TestTube className="h-4 w-4" />
              )}
            </Button>
            <Button
              onClick={() => setShowConfig(!showConfig)}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              size="sm"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Info Panel */}
      {showConfig && (
        <div className="bg-slate-50 border-b border-slate-200 p-4">
          <div className="space-y-3">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h4 className="font-semibold text-blue-800 mb-2">ℹ️ Modo Simulación</h4>
              <p className="text-sm text-blue-700">
                Esta es una simulación de la integración con Grok 4. 
                Para la implementación completa, se requiere un servidor backend separado.
              </p>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={connectToGrok}
                disabled={isLoading}
                className="bg-sky-500 hover:bg-sky-600 text-white"
                size="sm"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Conectar'
                )}
              </Button>
              <Button
                onClick={() => setShowConfig(false)}
                className="bg-slate-500 hover:bg-slate-600 text-white"
                size="sm"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="h-96 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !isLoading && (
          <div className="text-center text-gray-500 py-8">
            <Bot className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>Inicia una conversación con Grok 4</p>
            {!connectionStatus.isConnected && (
              <p className="text-sm mt-2">Haz clic en "Conectar" para comenzar</p>
            )}
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                message.role === 'user'
                  ? 'bg-sky-500 text-white'
                  : 'bg-slate-100 text-slate-800'
              }`}
            >
              <div className="flex items-start space-x-2">
                {message.role === 'assistant' && (
                  <Bot className="h-4 w-4 mt-1 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.role === 'user' ? 'text-sky-100' : 'text-slate-500'
                  }`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
                {message.role === 'user' && (
                  <User className="h-4 w-4 mt-1 flex-shrink-0" />
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 text-slate-800 max-w-xs lg:max-w-md px-4 py-2 rounded-2xl">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Grok está pensando...</span>
              </div>
            </div>
          </div>
        )}

        {connectionStatus.lastError && (
          <div className="flex justify-center">
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2 max-w-md">
              <div className="flex items-center space-x-2 text-red-700">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{connectionStatus.lastError}</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-slate-200 p-4">
        <div className="flex space-x-2">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              !connectionStatus.isConnected 
                ? "Conecta primero con Grok..." 
                : "Escribe tu mensaje para Grok..."
            }
            className="flex-1 resize-none border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            rows={1}
            disabled={!connectionStatus.isConnected || isLoading}
          />
          <Button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || !connectionStatus.isConnected || isLoading}
            className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}; 