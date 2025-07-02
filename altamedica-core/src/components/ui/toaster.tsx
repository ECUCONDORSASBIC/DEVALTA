// Sistema de Notificaciones (Toaster) - Altamedica
// Notificaciones médicas con compliance HIPAA

'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Info, 
  Shield,
  X 
} from 'lucide-react'
import { useNotificaciones } from '@/components/Providers'

const iconos = {
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
  info: Info,
  hipaa: Shield
}

const estilos = {
  success: 'bg-green-50 border-green-200 text-green-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
  hipaa: 'bg-purple-50 border-purple-200 text-purple-800'
}

const iconosEstilos = {
  success: 'text-green-600',
  warning: 'text-yellow-600',
  error: 'text-red-600',
  info: 'text-blue-600',
  hipaa: 'text-purple-600'
}

export function Toaster() {
  const { notificaciones, remover } = useNotificaciones()

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-md">
      <AnimatePresence>
        {notificaciones.map((notificacion) => {
          const IconoComponente = iconos[notificacion.tipo]
          
          return (
            <motion.div
              key={notificacion.id}
              initial={{ opacity: 0, x: 100, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.95 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className={
                p-4 rounded-lg border shadow-lg backdrop-blur-sm
                
                max-w-md w-full
              }
            >
              <div className="flex items-start space-x-3">
                <IconoComponente 
                  className={w-5 h-5 mt-0.5 flex-shrink-0 }
                />
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm">
                    {notificacion.titulo}
                  </h4>
                  <p className="text-sm mt-1 opacity-90">
                    {notificacion.mensaje}
                  </p>
                  
                  {notificacion.acciones && notificacion.acciones.length > 0 && (
                    <div className="flex space-x-2 mt-3">
                      {notificacion.acciones.map((accion, index) => (
                        <button
                          key={index}
                          onClick={accion.accion}
                          className={
                            px-3 py-1 text-xs font-medium rounded transition-colors
                            
                          }
                        >
                          {accion.texto}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => remover(notificacion.id)}
                  className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              {/* Barra de progreso para notificaciones con duración */}
              {notificacion.duracion && notificacion.duracion > 0 && (
                <motion.div
                  className="absolute bottom-0 left-0 h-1 bg-current opacity-30 rounded-b-lg"
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ 
                    duration: notificacion.duracion / 1000,
                    ease: 'linear'
                  }}
                />
              )}
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

export default Toaster
