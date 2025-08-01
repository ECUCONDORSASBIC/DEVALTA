'use client'
import { useState } from 'react'
import { HistoriaMedica } from '../../types/anamnesis.types'

interface HistoriaMedicaComponentProps {
  historia: HistoriaMedica
  onClose?: () => void
  onContinue?: () => void
}

export function HistoriaMedicaComponent(props: HistoriaMedicaComponentProps) {
  const [mostrarCompleta, setMostrarCompleta] = useState(false)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">{props.historia.titulo}</h2>
            <button
              onClick={props.onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6">
          {/* Imagen si existe */}
          {props.historia.imagenUrl && (
            <div className="mb-6">
              <img
                src={props.historia.imagenUrl}
                alt={props.historia.titulo}
                className="w-full h-48 object-cover rounded-lg shadow-md"
              />
            </div>
          )}

          {/* Contenido de la historia */}
          <div className="prose max-w-none">
            <div className="text-gray-700 leading-relaxed">
              {mostrarCompleta ? (
                <div>
                  <p className="mb-4">{props.historia.contenido}</p>
                  
                  {/* Información adicional médica */}
                  <div className="bg-blue-50 p-4 rounded-lg mt-6">
                    <h4 className="font-semibold text-blue-800 mb-2">💡 Perspectiva Médica</h4>
                    <p className="text-blue-700 text-sm">
                      Esta historia ilustra la importancia de {props.historia.titulo.toLowerCase()} en la práctica médica. 
                      Como futuros profesionales de la salud, debemos recordar que cada interacción con un paciente 
                      es una oportunidad para aprender y crecer.
                    </p>
                  </div>

                  {/* Reflexión personal */}
                  <div className="bg-green-50 p-4 rounded-lg mt-4">
                    <h4 className="font-semibold text-green-800 mb-2">🤔 Reflexión Personal</h4>
                    <p className="text-green-700 text-sm">
                      ¿Cómo te sientes identificado con esta historia? ¿Qué aspectos te llaman más la atención 
                      y por qué crees que son importantes en tu formación médica?
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="mb-4">
                    {props.historia.contenido.length > 200 
                      ? `${props.historia.contenido.substring(0, 200)}...` 
                      : props.historia.contenido
                    }
                  </p>
                  
                  {props.historia.contenido.length > 200 && (
                    <button
                      onClick={() => setMostrarCompleta(true)}
                      className="text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      Leer más...
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Animación si existe */}
          {props.historia.animacion && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">🎬 Animación Relacionada</h4>
              <div className="text-center">
                <div className="text-4xl mb-2">🎥</div>
                <p className="text-gray-600 text-sm">
                  {props.historia.animacion}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer con acciones */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex justify-between">
            <button
              onClick={props.onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cerrar
            </button>
            <button
              onClick={props.onContinue}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Continuar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 