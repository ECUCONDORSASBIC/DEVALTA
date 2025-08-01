'use client'
import dynamic from 'next/dynamic'
import { Suspense, useState, useEffect } from 'react'
import '@/styles/patient3d.css'

const Patient3DAnamnesis = dynamic(() => import('@/components/scene/patient3d/Patient3DAnamnesis'), {
  ssr: false,
  loading: () => (
    <div className="w-screen h-screen patient3d-page flex items-center justify-center">
      <div className="text-center text-white">
        <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-white mx-auto mb-6 animate-pulse-glow"></div>
        <h2 className="text-3xl font-bold mb-3 text-white drop-shadow-lg text-glow">Cargando Anamnesis Inmersiva</h2>
        <p className="text-xl opacity-90 text-sky-100">Basada en Semiología Médica de Álvarez</p>
        <div className="mt-6 flex justify-center space-x-2">
          <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  )
})

const Patient3DFormSidebar = dynamic(() => import('@/components/scene/patient3d/AnamnesisInterface'), {
  ssr: false,
  loading: () => (
    <div className="w-screen h-screen flex items-center justify-center">
      <div className="text-center text-white">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
        <h2 className="text-xl font-bold mb-2">Cargando Formulario Médico</h2>
      </div>
    </div>
  )
})

export default function Patient3DPage() {
  const [show3D, setShow3D] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)

  // Detectar tamaño de pantalla
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth
      setIsMobile(width < 768)
      setIsTablet(width >= 768 && width < 1024)
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  return (
    <main className="w-screen h-screen patient3d-page overflow-hidden">
      {/* Header médico profesional responsive */}
      <div className="absolute top-0 left-0 right-0 z-10 medical-header">
        <div className={`flex items-center justify-between ${
          isMobile ? 'px-4 py-2' : isTablet ? 'px-6 py-3' : 'px-6 py-3'
        }`}>
          <div className={`flex items-center ${
            isMobile ? 'space-x-2' : 'space-x-3'
          }`}>
            <div className={`bg-white/20 rounded-full flex items-center justify-center animate-pulse-glow ${
              isMobile ? 'w-8 h-8' : 'w-10 h-10'
            }`}>
              <svg className={`text-white ${isMobile ? 'w-4 h-4' : 'w-6 h-6'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div className={isMobile ? 'min-w-0' : ''}>
              <h1 className={`font-bold text-white text-shadow-medical ${
                isMobile ? 'text-lg' : isTablet ? 'text-xl' : 'text-xl'
              }`}>
                Anamnesis Médica 3D
              </h1>
              <p className={`text-sky-100 ${
                isMobile ? 'text-xs' : 'text-sm'
              }`}>
                Protocolo Álvarez - Experiencia Inmersiva
              </p>
            </div>
          </div>
          
          {/* Información responsive */}
          <div className={`flex items-center ${
            isMobile ? 'space-x-2' : 'space-x-4'
          }`}>
            <div className={`rounded-full px-3 py-2 text-white text-sm font-medium bg-gradient-to-r from-sky-500 to-cyan-600 shadow-md ${
              isMobile ? 'px-2 py-1 text-xs' : 'px-4 py-2'
            }`}>
              <span className="mr-1">🕒</span>
              {isMobile ? '15 min' : 'Tiempo estimado: 15 min'}
            </div>
            <div className={`rounded-full px-3 py-2 text-white text-sm font-medium bg-gradient-to-r from-sky-500 to-cyan-600 shadow-md ${
              isMobile ? 'px-2 py-1 text-xs' : 'px-4 py-2'
            }`}>
              <span className="mr-1">📋</span>
              {isMobile ? 'HIPAA' : 'Protocolo HIPAA'}
            </div>
          </div>
        </div>
      </div>

      {/* Renderizar solo el formulario y sidebar al inicio */}
      {!show3D && (
        <div className={`flex flex-col items-center justify-center h-full w-full ${
          isMobile ? 'px-4' : isTablet ? 'px-8' : 'px-0'
        }`}>
          <div className={`mx-auto ${
            isMobile ? 'w-full' : isTablet ? 'max-w-5xl' : 'max-w-4xl'
          }`}>
            <Suspense fallback={<div>Cargando...</div>}>
              <Patient3DFormSidebar patientAvatarRef={null} />
            </Suspense>
          </div>
          <button
            className={`mt-8 px-8 py-4 btn-medical rounded-xl shadow-lg animate-float ${
              isMobile ? 'text-base px-6 py-3' : isTablet ? 'text-lg' : 'text-lg'
            }`}
            onClick={() => setShow3D(true)}
          >
            {isMobile ? 'Iniciar 3D' : 'Iniciar experiencia 3D'}
          </button>
        </div>
      )}

      {/* Renderizar el canvas 3D solo tras interacción */}
      {show3D && (
        <Suspense fallback={<div>Cargando experiencia 3D...</div>}>
          <Patient3DAnamnesis />
        </Suspense>
      )}

      {/* Footer informativo responsive */}
      <div className="absolute bottom-0 left-0 right-0 z-10 medical-header">
        <div className={`text-center ${
          isMobile ? 'px-4 py-2' : 'px-6 py-2'
        }`}>
          <p className={`text-sky-100 ${
            isMobile ? 'text-xs' : 'text-sm'
          }`}>
            © 2025 Altamedica - Sistema de Anamnesis Inmersiva | 
            <span className="ml-2">🔒 Datos protegidos por HIPAA</span>
          </p>
        </div>
      </div>
    </main>
  )
}