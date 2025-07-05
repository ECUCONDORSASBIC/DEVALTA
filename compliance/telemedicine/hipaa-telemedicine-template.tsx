/**
 * Template de Compliance HIPAA para Telemedicina
 * Altamedica - Telemedicine Security Template
 */

import React, { useState, useEffect, useRef } from 'react';
import { useWebRTC } from '@/hooks/useWebRTC';
import { useTelemedicineSession } from '@/hooks/useTelemedicineSession';
import { auditLog } from '@/lib/audit';
import { encryptStream } from '@/lib/stream-encryption';

interface TelemedicineProps {
  patientId: string;
  doctorId: string;
  sessionId: string;
  onConsent: () => void;
}

export default function HIPAACompliantVideoCall({ 
  patientId, 
  doctorId, 
  sessionId, 
  onConsent 
}: TelemedicineProps) {
  const [consentGiven, setConsentGiven] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [encryptionEnabled, setEncryptionEnabled] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState(30 * 60 * 1000); // 30 minutos
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  
  // Configuración de WebRTC segura
  const rtcConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { 
        urls: process.env.TURN_SERVER_URL,
        username: process.env.TURN_USERNAME,
        credential: process.env.TURN_PASSWORD
      }
    ],
    iceCandidatePoolSize: 10
  };
  
  const { 
    localStream, 
    remoteStream, 
    connectionState,
    startCall,
    endCall,
    enableEncryption 
  } = useWebRTC(rtcConfig);
  
  const {
    sessionData,
    startSession,
    endSession,
    logActivity
  } = useTelemedicineSession(sessionId, sessionTimeout);
  
  // Solicitar consentimiento del paciente
  const requestConsent = async () => {
    try {
      // Mostrar modal de consentimiento
      const consent = await showConsentModal();
      
      if (consent) {
        setConsentGiven(true);
        onConsent();
        
        // Log de consentimiento
        await auditLog({
          action: 'TELEMEDICINE_CONSENT',
          patientId,
          doctorId,
          sessionId,
          timestamp: new Date().toISOString()
        });
        
        // Iniciar sesión
        await startSession();
        setSessionActive(true);
      }
    } catch (error) {
      console.error('Error al solicitar consentimiento:', error);
    }
  };
  
  // Iniciar llamada segura
  const startSecureCall = async () => {
    try {
      // Habilitar encriptación
      await enableEncryption();
      setEncryptionEnabled(true);
      
      // Iniciar llamada
      await startCall();
      
      // Log de inicio de llamada
      await auditLog({
        action: 'TELEMEDICINE_CALL_STARTED',
        patientId,
        doctorId,
        sessionId,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Error al iniciar llamada:', error);
    }
  };
  
  // Finalizar llamada
  const endSecureCall = async () => {
    try {
      await endCall();
      await endSession();
      setSessionActive(false);
      setEncryptionEnabled(false);
      
      // Log de fin de llamada
      await auditLog({
        action: 'TELEMEDICINE_CALL_ENDED',
        patientId,
        doctorId,
        sessionId,
        duration: sessionData.duration,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Error al finalizar llamada:', error);
    }
  };
  
  // Timeout automático
  useEffect(() => {
    if (sessionActive) {
      const timeout = setTimeout(() => {
        endSecureCall();
        alert('Sesión expirada por seguridad');
      }, sessionTimeout);
      
      return () => clearTimeout(timeout);
    }
  }, [sessionActive, sessionTimeout]);
  
  // Efectos de streams
  useEffect(() => {
    if (localStream && videoRef.current) {
      videoRef.current.srcObject = localStream;
    }
  }, [localStream]);
  
  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);
  
  if (!consentGiven) {
    return (
      <div className="consent-container">
        <h2>Consentimiento para Telemedicina</h2>
        <p>Para continuar, debe dar su consentimiento para la consulta virtual.</p>
        <button onClick={requestConsent}>
          Dar Consentimiento
        </button>
      </div>
    );
  }
  
  return (
    <div className="telemedicine-container">
      <div className="video-container">
        <video 
          ref={videoRef} 
          autoPlay 
          muted 
          playsInline
          className="local-video"
        />
        <video 
          ref={remoteVideoRef} 
          autoPlay 
          playsInline
          className="remote-video"
        />
      </div>
      
      <div className="controls">
        <div className="status">
          <span>Estado: {connectionState}</span>
          <span>Encriptación: {encryptionEnabled ? '✅' : '❌'}</span>
          <span>Sesión: {sessionActive ? 'Activa' : 'Inactiva'}</span>
        </div>
        
        <div className="buttons">
          {!sessionActive ? (
            <button onClick={startSecureCall}>
              Iniciar Llamada
            </button>
          ) : (
            <button onClick={endSecureCall}>
              Finalizar Llamada
            </button>
          )}
        </div>
      </div>
      
      <div className="session-info">
        <p>ID de Sesión: {sessionId}</p>
        <p>Duración: {sessionData.duration || '0:00'}</p>
        <p>Timeout: {Math.floor(sessionTimeout / 60000)} minutos</p>
      </div>
    </div>
  );
}

// Modal de consentimiento
async function showConsentModal(): Promise<boolean> {
  return new Promise((resolve) => {
    // Implementar modal de consentimiento
    const confirmed = confirm(
      '¿Consiente en participar en una consulta virtual?\n\n' +
      '• Su información médica será protegida\n' +
      '• La sesión será encriptada\n' +
      '• Se registrará la actividad para auditoría\n' +
      '• Puede finalizar la sesión en cualquier momento'
    );
    resolve(confirmed);
  });
}
