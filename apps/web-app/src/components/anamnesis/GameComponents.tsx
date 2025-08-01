// components/anamnesis/GameComponents.tsx
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { Logro } from '../../types/anamnesis.types'

interface BarraProgresoProps {
  progreso: number
  nivel: number
  puntosActuales: number
  puntosNecesarios: number
}

export const BarraProgresoGamificada: React.FC<BarraProgresoProps> = ({
  progreso,
  nivel,
  puntosActuales,
  puntosNecesarios
}) => {
  return (
    <motion.div 
      className="relative w-full"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Barra de nivel */}
      <div className="mb-2 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <motion.div
            className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Nivel {nivel}
          </motion.div>
          <span className="text-sm text-gray-600">
            {puntosActuales} / {puntosNecesarios} XP
          </span>
        </div>
        <motion.div
          className="text-3xl"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          ⭐
        </motion.div>
      </div>

      {/* Barra de progreso principal */}
      <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden shadow-inner">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500"
          initial={{ width: 0 }}
          animate={{ width: `${progreso}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div className="absolute inset-0 bg-white/20 animate-pulse" />
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <motion.span
              className="text-white font-bold text-sm"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              {Math.round(progreso)}%
            </motion.span>
          </div>
        </motion.div>
      </div>

      {/* Partículas animadas */}
      <div className="absolute -top-2 left-0 w-full h-full pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-yellow-400 rounded-full"
            initial={{ 
              left: `${Math.random() * 100}%`,
              top: '50%',
              opacity: 0 
            }}
            animate={{
              top: '-20px',
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0]
            }}
            transition={{
              duration: 2,
              delay: i * 0.2,
              repeat: Infinity,
              repeatDelay: 3
            }}
          />
        ))}
      </div>
    </motion.div>
  )
}

interface NotificacionLogroProps {
  logro: Logro
  onClose: () => void
}

export const NotificacionLogro: React.FC<NotificacionLogroProps> = ({ logro, onClose }) => {
  useEffect(() => {
    // Lanzar confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    })

    const timer = setTimeout(onClose, 5000)
    return () => clearTimeout(timer)
  }, [onClose])

  const coloresPorRareza = {
    comun: 'from-gray-400 to-gray-600',
    raro: 'from-blue-400 to-blue-600',
    epico: 'from-purple-400 to-purple-600',
    legendario: 'from-yellow-400 to-orange-600'
  }

  return (
    <motion.div
      className="fixed top-20 right-4 z-50"
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
    >
      <div className={`bg-gradient-to-r ${coloresPorRareza[logro.rareza]} p-6 rounded-xl shadow-2xl text-white`}>
        <div className="flex items-center gap-4">
          <motion.div
            className="text-5xl"
            animate={{ 
              rotate: [0, -10, 10, -10, 10, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 0.5 }}
          >
            {logro.icono}
          </motion.div>
          <div>
            <h3 className="text-xl font-bold mb-1">¡Logro Desbloqueado!</h3>
            <p className="text-lg font-semibold">{logro.nombre}</p>
            <p className="text-sm opacity-90">{logro.descripcion}</p>
            <p className="text-sm mt-1">+{logro.puntos} XP</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

interface AnimacionTransicionProps {
  tipo: 'pregunta' | 'seccion' | 'completado'
  onComplete: () => void
}

export const AnimacionTransicion: React.FC<AnimacionTransicionProps> = ({ tipo, onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 1500)
    return () => clearTimeout(timer)
  }, [onComplete])

  const mensajes = {
    pregunta: ['¡Excelente!', '¡Sigue así!', '¡Genial!'],
    seccion: ['¡Sección completada!', '¡Nuevo territorio desbloqueado!'],
    completado: ['¡Misión cumplida!', '¡Eres un héroe de la salud!']
  }

  const mensaje = mensajes[tipo][Math.floor(Math.random() * mensajes[tipo].length)]

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center z-50 bg-black/50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white p-8 rounded-2xl shadow-2xl"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", damping: 15 }}
      >
        <motion.h2
          className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent text-center"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 1 }}
        >
          {mensaje}
        </motion.h2>
      </motion.div>
    </motion.div>
  )
}

interface PuntosFlotantesProps {
  puntos: number
  x: number
  y: number
}

export const PuntosFlotantes: React.FC<PuntosFlotantesProps> = ({ puntos, x, y }) => {
  return (
    <motion.div
      className="fixed pointer-events-none z-50 font-bold text-2xl text-yellow-500"
      style={{ left: x, top: y }}
      initial={{ opacity: 1, y: 0 }}
      animate={{ opacity: 0, y: -50 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
    >
      +{puntos} XP
    </motion.div>
  )
}

interface MascotaMedicaProps {
  estado: 'neutral' | 'feliz' | 'pensando' | 'celebrando'
  mensaje?: string
}

export const MascotaMedica: React.FC<MascotaMedicaProps> = ({ estado, mensaje }) => {
  const expresiones = {
    neutral: '😊',
    feliz: '😄',
    pensando: '🤔',
    celebrando: '🎉'
  }

  const mensajes = {
    neutral: '¡Sigue así!',
    feliz: '¡Excelente respuesta!',
    pensando: 'Hmm, interesante...',
    celebrando: '¡Felicidades!'
  }

  return (
    <motion.div
      className="fixed bottom-4 right-4 z-40"
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", damping: 15 }}
    >
      <div className="bg-white rounded-full p-4 shadow-lg border-2 border-purple-200">
        <motion.div
          className="text-4xl"
          animate={{ 
            scale: estado === 'celebrando' ? [1, 1.3, 1] : 1,
            rotate: estado === 'feliz' ? [0, -10, 10, 0] : 0
          }}
          transition={{ 
            scale: { duration: 0.5, repeat: estado === 'celebrando' ? Infinity : 0 },
            rotate: { duration: 0.3, repeat: estado === 'feliz' ? 2 : 0 }
          }}
        >
          {expresiones[estado]}
        </motion.div>
        {mensaje && (
          <motion.div
            className="absolute bottom-full right-0 mb-2 bg-purple-600 text-white px-3 py-1 rounded-lg text-sm whitespace-nowrap"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            {mensaje}
            <div className="absolute top-full right-2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-purple-600"></div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
} 