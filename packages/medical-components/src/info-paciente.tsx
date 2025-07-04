// Componente base para información de paciente
import React from 'react'
import { User, Calendar, Phone, Mail } from 'lucide-react'
import type { PacienteBase } from '@altamedica/medical-types'
import { formatearFecha, calcularEdad, formatearDNI, formatearTelefono } from '@altamedica/medical-utils'

interface InfoPacienteProps {
  paciente: PacienteBase
  mostrarDatosSensibles?: boolean
  className?: string
}

export function InfoPaciente({ 
  paciente, 
  mostrarDatosSensibles = false, 
  className = '' 
}: InfoPacienteProps) {
  const edad = calcularEdad(paciente.fechaNacimiento)

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center mb-4">
        <User className="h-8 w-8 text-blue-600 mr-3" />
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {paciente.nombres} {paciente.apellidos}
          </h2>
          <p className="text-sm text-gray-500">HC: {paciente.numeroHistoriaClinica}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
            <span className="text-sm text-gray-600">
              {formatearFecha(paciente.fechaNacimiento, 'largo')} ({edad} años)
            </span>
          </div>

          <div className="flex items-center">
            <span className="text-sm text-gray-600">
              <strong>Documento:</strong> {paciente.tipoDocumento} {formatearDNI(paciente.numeroDocumento)}
            </span>
          </div>

          <div className="flex items-center">
            <span className="text-sm text-gray-600">
              <strong>Género:</strong> {paciente.genero}
            </span>
          </div>

          {paciente.grupoSanguineo && (
            <div className="flex items-center">
              <span className="text-sm text-gray-600">
                <strong>Grupo Sanguíneo:</strong> {paciente.grupoSanguineo}{paciente.factorRh}
              </span>
            </div>
          )}
        </div>

        {mostrarDatosSensibles && (
          <div className="space-y-3">
            {paciente.telefono && (
              <div className="flex items-center">
                <Phone className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600">
                  {formatearTelefono(paciente.telefono)}
                </span>
              </div>
            )}

            {paciente.email && (
              <div className="flex items-center">
                <Mail className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600">
                  {paciente.email}
                </span>
              </div>
            )}

            <div className="text-sm text-gray-600">
              <strong>Dirección:</strong><br />
              {paciente.direccion.calle} {paciente.direccion.numero}
              {paciente.direccion.piso && `, Piso ${paciente.direccion.piso}`}
              {paciente.direccion.departamento && `, Depto ${paciente.direccion.departamento}`}<br />
              {paciente.direccion.ciudad}, {paciente.direccion.provincia}
              <br />CP: {paciente.direccion.codigoPostal}
            </div>
          </div>
        )}
      </div>

      {paciente.alergias && paciente.alergias.length > 0 && (
        <div className="mt-4 p-3 bg-red-50 rounded-md">
          <h3 className="text-sm font-medium text-red-800 mb-1">⚠️ Alergias</h3>
          <p className="text-sm text-red-700">
            {paciente.alergias.join(', ')}
          </p>
        </div>
      )}

      {paciente.obraSocial && (
        <div className="mt-4 p-3 bg-blue-50 rounded-md">
          <h3 className="text-sm font-medium text-blue-800 mb-1">💳 Obra Social</h3>
          <p className="text-sm text-blue-700">
            {paciente.obraSocial.nombre} - {paciente.obraSocial.planCobertura}
            {paciente.numeroAfiliado && ` - Afiliado: ${paciente.numeroAfiliado}`}
          </p>
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="flex justify-between text-xs text-gray-500">
          <span>Estado: {paciente.estadoPaciente}</span>
          <span>Actualizado: {formatearFecha(paciente.fechaUltimaActualizacion)}</span>
        </div>
      </div>
    </div>
  )
}

export default InfoPaciente