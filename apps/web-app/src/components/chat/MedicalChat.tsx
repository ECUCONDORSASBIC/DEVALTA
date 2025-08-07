'use client'

import React, { useState, useEffect, useRef } from 'react'
import { 
  Send, 
  Phone, 
  Video, 
  MoreVertical, 
  Paperclip, 
  Image, 
  Calendar,
  Pill,
  Shield,
  Clock,
  CheckCheck,
  Search
} from 'lucide-react'
import { firebaseChat, ChatConversation, ChatMessage } from '../services/firebase-chat'
import { auth } from '../../config/firebase'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface MedicalChatProps {
  conversationId?: string
  onConversationSelect?: (conversationId: string) => void
}

export default function MedicalChat({ conversationId, onConversationSelect }: MedicalChatProps) {
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [currentConversation, setCurrentConversation] = useState<ChatConversation | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const currentUser = auth()?.currentUser

  // Suscribirse a conversaciones
  useEffect(() => {
    if (!currentUser) return

    const unsubscribe = firebaseChat.subscribeToConversations(
      currentUser.uid,
      (conversations) => {
        setConversations(conversations)
      }
    )

    return () => unsubscribe()
  }, [currentUser])

  // Suscribirse a mensajes de la conversación actual
  useEffect(() => {
    if (!conversationId) return

    const unsubscribe = firebaseChat.subscribeToMessages(
      conversationId,
      (messages) => {
        setMessages(messages)
        scrollToBottom()
        
        // Marcar mensajes como leídos
        if (currentUser) {
          firebaseChat.markMessagesAsRead(conversationId, currentUser.uid)
        }
      }
    )

    return () => unsubscribe()
  }, [conversationId, currentUser])

  // Encontrar conversación actual
  useEffect(() => {
    if (conversationId && conversations.length > 0) {
      const conversation = conversations.find(c => c.id === conversationId)
      setCurrentConversation(conversation || null)
    }
  }, [conversationId, conversations])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !conversationId) return

    setIsLoading(true)
    try {
      await firebaseChat.sendMessage(conversationId, newMessage.trim())
      setNewMessage('')
    } catch (error) {
      console.error('Error enviando mensaje:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendPrescription = async (prescriptionData: any) => {
    if (!conversationId) return

    try {
      await firebaseChat.sendPrescription(conversationId, prescriptionData)
      setShowPrescriptionModal(false)
    } catch (error) {
      console.error('Error enviando prescripción:', error)
    }
  }

  const formatMessageTime = (timestamp: any) => {
    if (!timestamp?.toDate) return ''
    return formatDistanceToNow(timestamp.toDate(), { 
      addSuffix: true, 
      locale: es 
    })
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 border-red-300 text-red-800'
      case 'high': return 'bg-orange-100 border-orange-300 text-orange-800'
      case 'medium': return 'bg-yellow-100 border-yellow-300 text-yellow-800'
      default: return 'bg-green-100 border-green-300 text-green-800'
    }
  }

  const renderMessage = (message: ChatMessage) => {
    const isOwnMessage = message.senderId === currentUser?.uid
    
    return (
      <div key={message.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
          isOwnMessage 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-100 text-gray-900'
        }`}>
          {/* Información del remitente */}
          {!isOwnMessage && (
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-xs font-medium text-gray-600">
                {message.senderName}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                message.senderRole === 'doctor' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {message.senderRole === 'doctor' ? '🩺 Médico' : '👤 Paciente'}
              </span>
            </div>
          )}

          {/* Contenido del mensaje */}
          {message.messageType === 'prescription' && message.prescriptionData ? (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Pill className="h-4 w-4" />
                <span className="font-medium">Prescripción Médica</span>
              </div>
              {message.prescriptionData.medications.map((med, index) => (
                <div key={index} className="text-sm bg-white/10 rounded p-2">
                  <div className="font-medium">{med.name}</div>
                  <div className="text-xs opacity-90">
                    {med.dosage} - {med.frequency} - {med.duration}
                  </div>
                </div>
              ))}
            </div>
          ) : message.messageType === 'appointment' && message.appointmentData ? (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span className="font-medium">Cita Médica</span>
              </div>
              <div className="text-sm">
                <div>Fecha: {message.appointmentData.date?.toDate?.()?.toLocaleDateString()}</div>
                <div>Duración: {message.appointmentData.duration} min</div>
                <div>Tipo: {message.appointmentData.type}</div>
              </div>
            </div>
          ) : (
            <p className="text-sm">{message.message}</p>
          )}

          {/* Tiempo y estado */}
          <div className={`flex items-center justify-between mt-2 text-xs ${
            isOwnMessage ? 'text-blue-100' : 'text-gray-500'
          }`}>
            <span>{formatMessageTime(message.timestamp)}</span>
            {isOwnMessage && (
              <div className="flex items-center space-x-1">
                {message.read ? (
                  <CheckCheck className="h-3 w-3" />
                ) : (
                  <Clock className="h-3 w-3" />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (!conversationId) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Chat Médico Seguro
          </h3>
          <p className="text-gray-600">
            Selecciona una conversación para comenzar a chatear de forma segura
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header de la conversación */}
      {currentConversation && (
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {currentConversation.title.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {currentConversation.title}
                </h3>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                    getPriorityColor(currentConversation.priority)
                  }`}>
                    {currentConversation.priority === 'urgent' && '🚨 Urgente'}
                    {currentConversation.priority === 'high' && '⚠️ Alta'}
                    {currentConversation.priority === 'medium' && '📋 Media'}
                    {currentConversation.priority === 'low' && '📝 Baja'}
                  </span>
                  <span className="text-sm text-gray-500">
                    {currentConversation.type === 'doctor-patient' ? 'Consulta Médica' : 'Chat Profesional'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full">
                <Phone className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full">
                <Video className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full">
                <MoreVertical className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Área de mensajes */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-gray-500">No hay mensajes aún. ¡Envía el primer mensaje!</p>
          </div>
        ) : (
          messages.map(renderMessage)
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input de mensaje */}
      <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
        <form onSubmit={handleSendMessage} className="flex items-end space-x-3">
          <div className="flex-1">
            <div className="relative">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Escribe tu mensaje médico..."
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none max-h-32"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage(e)
                  }
                }}
              />
            </div>
          </div>
          
          {/* Botones de acción */}
          <div className="flex items-center space-x-2">
            <button
              type="button"
              className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
            >
              <Paperclip className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
            >
              <Image className="h-5 w-5" />
            </button>
            {currentUser && currentConversation?.participantDetails.find(p => p.role === 'doctor' && p.uid === currentUser.uid) && (
              <button
                type="button"
                onClick={() => setShowPrescriptionModal(true)}
                className="p-3 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full"
                title="Enviar prescripción"
              >
                <Pill className="h-5 w-5" />
              </button>
            )}
            <button
              type="submit"
              disabled={!newMessage.trim() || isLoading}
              className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export { MedicalChat }