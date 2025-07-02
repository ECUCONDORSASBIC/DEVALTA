'use client'

import React, { useState } from 'react'
import { 
  validarDNI, 
  validarCUIL, 
  formatearTelefono, 
  calcularIMC,
  generarNumeroHistoriaClinica,
  encriptarDatosPHI,
  desencriptarDatosPHI
} from '@altamedica/core'

export default function MedicalUtilsExample() {
  const [dni, setDni] = useState('')
  const [cuil, setCuil] = useState('')
  const [telefono, setTelefono] = useState('')
  const [peso, setPeso] = useState('')
  const [altura, setAltura] = useState('')
  const [datosSensibles, setDatosSensibles] = useState('')
  const [resultados, setResultados] = useState<any>({})

  const validarDatos = () => {
    const resultados = {
      dni: validarDNI(dni),
      cuil: validarCUIL(cuil),
      telefono: formatearTelefono(telefono),
      imc: peso && altura ? calcularIMC(Number(peso), Number(altura)) : null,
      historiaClinica: generarNumeroHistoriaClinica(),
      datosEncriptados: datosSensibles ? encriptarDatosPHI(datosSensibles) : null
    }
    
    setResultados(resultados)
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Ejemplo de Utilidades Médicas</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">DNI:</label>
          <input
            type="text"
            value={dni}
            onChange={(e) => setDni(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="12345678"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">CUIL:</label>
          <input
            type="text"
            value={cuil}
            onChange={(e) => setCuil(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="20123456789"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Teléfono:</label>
          <input
            type="text"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="+5491112345678"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Peso (kg):</label>
            <input
              type="number"
              value={peso}
              onChange={(e) => setPeso(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Altura (cm):</label>
            <input
              type="number"
              value={altura}
              onChange={(e) => setAltura(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Datos Sensibles (para encriptar):</label>
          <input
            type="text"
            value={datosSensibles}
            onChange={(e) => setDatosSensibles(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Datos PHI para encriptar"
          />
        </div>

        <button
          onClick={validarDatos}
          className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700"
        >
          Validar y Procesar
        </button>

        {Object.keys(resultados).length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 rounded">
            <h3 className="font-bold mb-2">Resultados:</h3>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(resultados, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
} 