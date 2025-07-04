// Utilidades médicas para Altamedica
// Incluye: encriptación PHI, validaciones médicas, formateo de datos Argentina

import CryptoJS from 'crypto-js'
import { format, parse, isValid, differenceInYears } from 'date-fns'
import { es } from 'date-fns/locale'

// Configuración de encriptación HIPAA
const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_PHI_ENCRYPTION_KEY || 'default-key-change-in-production'

// === FUNCIONES DE ENCRIPTACIÓN PHI ===

export const encriptarDatosPHI = (data: string): string => {
  try {
    const encrypted = CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString()
    return encrypted
  } catch (error) {
    console.error('Error al encriptar datos PHI:', error)
    throw new Error('Error de encriptación')
  }
}

export const desencriptarDatosPHI = (encryptedData: string): string => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY)
    const decrypted = bytes.toString(CryptoJS.enc.Utf8)
    return decrypted
  } catch (error) {
    console.error('Error al desencriptar datos PHI:', error)
    throw new Error('Error de desencriptación')
  }
}

// Enmascarar datos sensibles para logs
export const enmascararDatosSensibles = (data: string, tipo: 'dni' | 'telefono' | 'email'): string => {
  switch (tipo) {
    case 'dni':
      return data.replace(/(\d{2})(\d{3})(\d{3})/, '$1***$3')
    case 'telefono':
      return data.replace(/(\d{3})(\d{3})(\d{4})/, '$1***$3')
    case 'email':
      const [user, domain] = data.split('@')
      return `${user.charAt(0)}***@${domain}`
    default:
      return '***'
  }
}

// === VALIDACIONES MÉDICAS ===

export const validarDNI = (dni: string): boolean => {
  const dniLimpio = dni.replace(/\D/g, '')
  return dniLimpio.length >= 7 && dniLimpio.length <= 8 && /^\d+$/.test(dniLimpio)
}

export const validarCUIL = (cuil: string): boolean => {
  const cuilLimpio = cuil.replace(/\D/g, '')
  
  if (cuilLimpio.length !== 11) return false
  
  const multiplicadores = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2]
  let suma = 0
  
  for (let i = 0; i < 10; i++) {
    suma += parseInt(cuilLimpio[i]) * multiplicadores[i]
  }
  
  const resto = suma % 11
  const digitoVerificador = resto < 2 ? resto : 11 - resto
  
  return digitoVerificador === parseInt(cuilLimpio[10])
}

export const validarTelefonoArgentino = (telefono: string): boolean => {
  const telefonoLimpio = telefono.replace(/\D/g, '')
  return telefonoLimpio.length >= 10 && telefonoLimpio.length <= 13
}

export const validarEmailMedico = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}

export const validarFechaNacimiento = (fecha: Date): { valido: boolean; mensaje?: string } => {
  if (!isValid(fecha)) {
    return { valido: false, mensaje: 'Fecha inválida' }
  }
  
  const hoy = new Date()
  const edad = differenceInYears(hoy, fecha)
  
  if (fecha > hoy) {
    return { valido: false, mensaje: 'La fecha no puede ser futura' }
  }
  
  if (edad > 150) {
    return { valido: false, mensaje: 'Edad no realista (mayor a 150 años)' }
  }
  
  return { valido: true }
}

// === FORMATEO DE DATOS ARGENTINOS ===

export const formatearDNI = (dni: string): string => {
  const dniLimpio = dni.replace(/\D/g, '')
  
  if (dniLimpio.length <= 8) {
    return dniLimpio.replace(/(\d{1,2})(\d{3})(\d{3})/, '$1.$2.$3')
  }
  
  return dni
}

export const formatearTelefono = (telefono: string): string => {
  const telefonoLimpio = telefono.replace(/\D/g, '')
  
  if (telefonoLimpio.startsWith('54')) {
    const sinCodigo = telefonoLimpio.substring(2)
    if (sinCodigo.startsWith('9')) {
      const numero = sinCodigo.substring(1)
      if (numero.length === 10) {
        return `+54 9 ${numero.substring(0, 2)} ${numero.substring(2, 6)}-${numero.substring(6)}`
      }
    }
  }
  
  return telefono
}

export const formatearFecha = (fecha: Date, formato: 'corto' | 'largo' | 'completo' = 'corto'): string => {
  if (!isValid(fecha)) return 'Fecha inválida'
  
  switch (formato) {
    case 'corto':
      return format(fecha, 'dd/MM/yyyy', { locale: es })
    case 'largo':
      return format(fecha, 'dd \'de\' MMMM \'de\' yyyy', { locale: es })
    case 'completo':
      return format(fecha, 'EEEE, dd \'de\' MMMM \'de\' yyyy', { locale: es })
    default:
      return format(fecha, 'dd/MM/yyyy', { locale: es })
  }
}

// === CÁLCULOS MÉDICOS ===

export const calcularEdad = (fechaNacimiento: Date): number => {
  return differenceInYears(new Date(), fechaNacimiento)
}

export const calcularIMC = (peso: number, altura: number): { imc: number; categoria: string } => {
  const imc = peso / Math.pow(altura / 100, 2)
  
  let categoria: string
  if (imc < 18.5) categoria = 'Bajo peso'
  else if (imc < 25) categoria = 'Normal'
  else if (imc < 30) categoria = 'Sobrepeso'
  else categoria = 'Obesidad'
  
  return { imc: Math.round(imc * 100) / 100, categoria }
}

// === GENERADORES DE CÓDIGOS MÉDICOS ===

export const generarNumeroHistoriaClinica = (): string => {
  const fecha = new Date()
  const año = fecha.getFullYear().toString().slice(-2)
  const mes = (fecha.getMonth() + 1).toString().padStart(2, '0')
  const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0')
  
  return `HC${año}${mes}${random}`
}

export const generarIdCita = (medicoId: string, fecha: Date): string => {
  const fechaStr = format(fecha, 'yyyyMMdd')
  const hora = format(fecha, 'HHmm')
  const random = Math.floor(Math.random() * 99).toString().padStart(2, '0')
  
  return `CITA${fechaStr}${hora}${medicoId.slice(-3)}${random}`
}

// === CONSTANTES MÉDICAS ARGENTINAS ===

export const PROVINCIAS_ARGENTINA = [
  { codigo: 'CABA', nombre: 'Ciudad Autónoma de Buenos Aires' },
  { codigo: 'BUENOS_AIRES', nombre: 'Buenos Aires' },
  { codigo: 'CATAMARCA', nombre: 'Catamarca' },
  { codigo: 'CHACO', nombre: 'Chaco' },
  { codigo: 'CHUBUT', nombre: 'Chubut' },
  { codigo: 'CORDOBA', nombre: 'Córdoba' },
  { codigo: 'CORRIENTES', nombre: 'Corrientes' },
  { codigo: 'ENTRE_RIOS', nombre: 'Entre Ríos' },
  { codigo: 'FORMOSA', nombre: 'Formosa' },
  { codigo: 'JUJUY', nombre: 'Jujuy' },
  { codigo: 'LA_PAMPA', nombre: 'La Pampa' },
  { codigo: 'LA_RIOJA', nombre: 'La Rioja' },
  { codigo: 'MENDOZA', nombre: 'Mendoza' },
  { codigo: 'MISIONES', nombre: 'Misiones' },
  { codigo: 'NEUQUEN', nombre: 'Neuquén' },
  { codigo: 'RIO_NEGRO', nombre: 'Río Negro' },
  { codigo: 'SALTA', nombre: 'Salta' },
  { codigo: 'SAN_JUAN', nombre: 'San Juan' },
  { codigo: 'SAN_LUIS', nombre: 'San Luis' },
  { codigo: 'SANTA_CRUZ', nombre: 'Santa Cruz' },
  { codigo: 'SANTA_FE', nombre: 'Santa Fe' },
  { codigo: 'SANTIAGO_DEL_ESTERO', nombre: 'Santiago del Estero' },
  { codigo: 'TIERRA_DEL_FUEGO', nombre: 'Tierra del Fuego' },
  { codigo: 'TUCUMAN', nombre: 'Tucumán' }
]

export const OBRAS_SOCIALES_PRINCIPALES = [
  'OSDE',
  'Swiss Medical',
  'Medicus',
  'IOMA',
  'PAMI',
  'OSECAC',
  'OSMATA',
  'UPCN',
  'Hospital Italiano',
  'Hospital Alemán'
]

export const ESPECIALIDADES_MEDICAS = [
  'Medicina General',
  'Cardiología',
  'Dermatología',
  'Neurología',
  'Pediatría',
  'Ginecología',
  'Traumatología',
  'Oftalmología',
  'Otorrinolaringología',
  'Psiquiatría',
  'Endocrinología',
  'Gastroenterología',
  'Urología',
  'Neumología',
  'Reumatología'
]