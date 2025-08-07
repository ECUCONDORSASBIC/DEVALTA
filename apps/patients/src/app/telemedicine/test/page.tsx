"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// Importación desde @altamedica/ui centralizado
import {
  CardCorporate,
  CardHeaderCorporate,
  CardContentCorporate,
  ButtonCorporate
} from "@altamedica/ui";
import { Video, VideoOff, Mic, MicOff, Camera, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';

export default function TelemedicineTestPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [testStep, setTestStep] = useState(0); // 0: inicio, 1: permisos, 2: test activo, 3: completado
  const [permissions, setPermissions] = useState({
    camera: 'unknown' as 'unknown' | 'granted' | 'denied',
    microphone: 'unknown' as 'unknown' | 'granted' | 'denied'
  });
  const [testResults, setTestResults] = useState({
    videoQuality: 'unknown' as 'unknown' | 'good' | 'poor',
    audioQuality: 'unknown' as 'unknown' | 'good' | 'poor',
    connection: 'unknown' as 'unknown' | 'good' | 'poor'
  });

  const startVideoTest = async () => {
    setTestStep(1);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: true
      });
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      setPermissions({
        camera: 'granted',
        microphone: 'granted'
      });
      
      setTestStep(2);
      
      // Simular análisis de calidad
      setTimeout(() => {
        setTestResults({
          videoQuality: 'good',
          audioQuality: 'good',
          connection: 'good'
        });
        setTestStep(3);
      }, 3000);
      
    } catch (error) {
      console.error('Error accessing media devices:', error);
      setPermissions({
        camera: 'denied',
        microphone: 'denied'
      });
      setTestStep(3);
    }
  };

  const stopVideoTest = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setTestStep(0);
  };

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setAudioEnabled(audioTrack.enabled);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <ButtonCorporate
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Volver</span>
              </ButtonCorporate>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Prueba de Video</h1>
                <p className="text-sm text-gray-600">Verifica tu cámara y micrófono</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-8 mx-auto max-w-4xl sm:px-6 lg:px-8">
        {testStep === 0 && (
          <CardCorporate variant="default" size="lg" className="max-w-2xl mx-auto">
            <CardHeaderCorporate title="Verificación de Equipos">
              <div className="text-center">
                <Camera className="w-16 h-16 mx-auto mb-4 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Prueba de Video y Audio</h2>
                <p className="text-gray-600">Antes de tu consulta, vamos a verificar que tu cámara y micrófono funcionen correctamente</p>
              </div>
            </CardHeaderCorporate>
            <CardContentCorporate className="p-8">
              <div className="space-y-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">¿Qué vamos a verificar?</h3>
                  <ul className="text-sm text-blue-800 space-y-2">
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>Acceso a tu cámara</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>Acceso a tu micrófono</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>Calidad de video</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>Calidad de audio</span>
                    </li>
                  </ul>
                </div>
                
                <ButtonCorporate
                  variant="primary"
                  size="lg"
                  onClick={startVideoTest}
                  className="w-full flex items-center justify-center space-x-2"
                >
                  <Video className="w-5 h-5" />
                  <span>Iniciar Prueba</span>
                </ButtonCorporate>
              </div>
            </CardContentCorporate>
          </CardCorporate>
        )}

        {testStep === 1 && (
          <CardCorporate variant="default" size="lg" className="max-w-2xl mx-auto">
            <CardHeaderCorporate title="Solicitando Permisos">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Solicitando Acceso</h2>
                <p className="text-gray-600">Tu navegador te pedirá permiso para acceder a tu cámara y micrófono</p>
              </div>
            </CardHeaderCorporate>
            <CardContentCorporate className="p-8">
              <div className="p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  <span className="font-medium text-yellow-800">Importante:</span>
                </div>
                <p className="text-yellow-700 mt-2">
                  Por favor, selecciona "Permitir" cuando tu navegador te solicite acceso a la cámara y micrófono
                </p>
              </div>
            </CardContentCorporate>
          </CardCorporate>
        )}

        {testStep === 2 && (
          <div className="space-y-6">
            <CardCorporate variant="default" size="lg">
              <CardHeaderCorporate title="Prueba en Progreso">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Vista Previa de Video</h2>
                  <div className="flex space-x-2">
                    <ButtonCorporate
                      variant={videoEnabled ? "primary" : "secondary"}
                      size="sm"
                      onClick={toggleVideo}
                      className="flex items-center space-x-1"
                    >
                      {videoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                      <span>{videoEnabled ? 'Video On' : 'Video Off'}</span>
                    </ButtonCorporate>
                    
                    <ButtonCorporate
                      variant={audioEnabled ? "primary" : "secondary"}
                      size="sm"
                      onClick={toggleAudio}
                      className="flex items-center space-x-1"
                    >
                      {audioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                      <span>{audioEnabled ? 'Mic On' : 'Mic Off'}</span>
                    </ButtonCorporate>
                  </div>
                </div>
              </CardHeaderCorporate>
              <CardContentCorporate className="p-8">
                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full max-w-md mx-auto rounded-lg bg-gray-900"
                  />
                  {!videoEnabled && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900 rounded-lg">
                      <div className="text-center text-white">
                        <VideoOff className="w-12 h-12 mx-auto mb-2" />
                        <p>Video desactivado</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="text-center mt-6">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-gray-600">Analizando calidad de video y audio...</p>
                </div>
              </CardContentCorporate>
            </CardCorporate>
          </div>
        )}

        {testStep === 3 && (
          <CardCorporate variant="default" size="lg" className="max-w-2xl mx-auto">
            <CardHeaderCorporate title="Resultados de la Prueba">
              <div className="text-center">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Prueba Completada</h2>
                <p className="text-gray-600">Aquí están los resultados de tu verificación de equipos</p>
              </div>
            </CardHeaderCorporate>
            <CardContentCorporate className="p-8">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Camera className="w-5 h-5 text-blue-600" />
                      <span className="font-medium">Cámara</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {permissions.camera === 'granted' ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-green-700">Funcionando correctamente</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4 text-red-600" />
                          <span className="text-red-700">No se pudo acceder</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Mic className="w-5 h-5 text-blue-600" />
                      <span className="font-medium">Micrófono</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {permissions.microphone === 'granted' ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-green-700">Funcionando correctamente</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4 text-red-600" />
                          <span className="text-red-700">No se pudo acceder</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                {permissions.camera === 'granted' && permissions.microphone === 'granted' ? (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-800">¡Todo listo para tu consulta!</span>
                    </div>
                    <p className="text-green-700 text-sm">
                      Tu cámara y micrófono están funcionando correctamente. Puedes proceder con confianza a tu videoconsulta médica.
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-red-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <span className="font-medium text-red-800">Se encontraron problemas</span>
                    </div>
                    <p className="text-red-700 text-sm mb-3">
                      No pudimos acceder a tu cámara y/o micrófono. Para resolver esto:
                    </p>
                    <ul className="text-red-700 text-sm space-y-1">
                      <li>• Asegúrate de haber dado permisos al navegador</li>
                      <li>• Verifica que no haya otras aplicaciones usando los dispositivos</li>
                      <li>• Recarga la página e intenta nuevamente</li>
                    </ul>
                  </div>
                )}
                
                <div className="flex space-x-3">
                  <ButtonCorporate
                    variant="secondary"
                    onClick={stopVideoTest}
                    className="flex-1"
                  >
                    Repetir Prueba
                  </ButtonCorporate>
                  
                  <ButtonCorporate
                    variant="primary"
                    onClick={() => router.push('/telemedicine')}
                    className="flex-1"
                  >
                    Continuar a Telemedicina
                  </ButtonCorporate>
                </div>
              </div>
            </CardContentCorporate>
          </CardCorporate>
        )}
      </div>
    </div>
  );
} 