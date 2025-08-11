// services/anamnesisService.ts
import type { Firestore } from 'firebase/firestore'
import { db } from '../../config/firebase'
import {
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where
} from '../lib/firestore-mock'
import { ProgresoAnamnesis, RespuestaAnamnesis } from '../types/anamnesis.types'

interface AnamnesisFirebase extends ProgresoAnamnesis {
  pacienteId: string
  fechaCreacion: any
  fechaActualizacion: any
  completada?: boolean
  fechaCompletado?: any
}

// Instancia centralizada de Firestore (SDK modular v9); SSR-safe por configuración en config/firebase
const getFirestoreInstance = (): Firestore => db as unknown as Firestore

// Guardar o actualizar progreso de anamnesis
export const guardarAnamnesisFirebase = async (
  pacienteId: string, 
  progreso: ProgresoAnamnesis
): Promise<void> => {
  try {
  const db = getFirestoreInstance()

    const anamnesisRef = doc(db, 'anamnesis', `${pacienteId}_${Date.now()}`)
    
    const datosAnamnesis: AnamnesisFirebase = {
      ...progreso,
      pacienteId,
      fechaCreacion: serverTimestamp(),
      fechaActualizacion: serverTimestamp()
    }

    await setDoc(anamnesisRef, datosAnamnesis)
  } catch (error) {
    console.error('Error guardando anamnesis:', error)
    throw error
  }
}

// Obtener última anamnesis de un paciente
export const obtenerUltimaAnamnesis = async (
  pacienteId: string
): Promise<AnamnesisFirebase | null> => {
  try {
  const db = getFirestoreInstance()

    const anamnesisQuery = query(
      collection(db, 'anamnesis'),
      where('pacienteId', '==', pacienteId),
      orderBy('fechaCreacion', 'desc'),
      limit(1)
    )

    const snapshot = await getDocs(anamnesisQuery)
    
    if (snapshot.empty) {
      return null
    }

    return snapshot.docs[0].data() as AnamnesisFirebase
  } catch (error) {
    console.error('Error obteniendo anamnesis:', error)
    throw error
  }
}

// Generar resumen médico estructurado
export const generarResumenMedico = (respuestas: Record<string, RespuestaAnamnesis>): string => {
  const secciones = {
    datosPersonales: [] as string[],
    motivoConsulta: [] as string[],
    enfermedadActual: [] as string[],
    antecedentesPersonales: [] as string[],
    antecedentesFamiliares: [] as string[],
    revisionSistemas: [] as string[]
  }

  // Organizar respuestas por sección
  Object.entries(respuestas).forEach(([preguntaId, respuesta]) => {
    const valor = respuesta.respuesta
    
    // Clasificar por ID de pregunta
    if (preguntaId.includes('nombre')) {
      secciones.datosPersonales.push(`Nombre: ${valor}`)
    } else if (preguntaId.includes('edad')) {
      secciones.datosPersonales.push(`Edad: ${valor} años`)
    } else if (preguntaId.includes('sexo')) {
      secciones.datosPersonales.push(`Sexo: ${valor}`)
    } else if (preguntaId.includes('ocupacion')) {
      secciones.datosPersonales.push(`Ocupación: ${valor}`)
    } else if (preguntaId.includes('motivo')) {
      secciones.motivoConsulta.push(valor)
    } else if (preguntaId.includes('inicio') || preguntaId.includes('como-comenzo')) {
      secciones.enfermedadActual.push(valor)
    } else if (preguntaId.includes('dolor')) {
      secciones.enfermedadActual.push(`Características del dolor: ${valor}`)
    } else if (preguntaId.includes('enfermedades-previas')) {
      secciones.antecedentesPersonales.push(`Enfermedades previas: ${valor}`)
    } else if (preguntaId.includes('alergias')) {
      secciones.antecedentesPersonales.push(`Alergias: ${valor}`)
    } else if (preguntaId.includes('habitos')) {
      secciones.antecedentesPersonales.push(`Hábitos: ${valor}`)
    } else if (preguntaId.includes('familiares')) {
      secciones.antecedentesFamiliares.push(valor)
    }
  })

  // Construir resumen
  let resumen = '# HISTORIA CLÍNICA - ANAMNESIS\n\n'
  
  resumen += '## DATOS DE FILIACIÓN\n'
  secciones.datosPersonales.forEach(dato => {
    resumen += `- ${dato}\n`
  })
  
  resumen += '\n## MOTIVO DE CONSULTA\n'
  secciones.motivoConsulta.forEach(motivo => {
    resumen += `${motivo}\n`
  })
  
  resumen += '\n## ENFERMEDAD ACTUAL\n'
  secciones.enfermedadActual.forEach(info => {
    resumen += `${info}\n`
  })
  
  if (secciones.antecedentesPersonales.length > 0) {
    resumen += '\n## ANTECEDENTES PERSONALES\n'
    secciones.antecedentesPersonales.forEach(ant => {
      resumen += `- ${ant}\n`
    })
  }
  
  if (secciones.antecedentesFamiliares.length > 0) {
    resumen += '\n## ANTECEDENTES FAMILIARES\n'
    secciones.antecedentesFamiliares.forEach(ant => {
      resumen += `${ant}\n`
    })
  }

  resumen += '\n---\n'
  resumen += `Fecha: ${new Date().toLocaleDateString('es-ES')}\n`
  resumen += `Hora: ${new Date().toLocaleTimeString('es-ES')}\n`

  return resumen
}

// Analizar respuestas para recomendaciones
export const analizarRespuestasParaRecomendaciones = (
  respuestas: Record<string, RespuestaAnamnesis>
): string[] => {
  const recomendaciones: string[] = []

  // Analizar edad
  const edad = respuestas['edad']?.respuesta
  if (edad && parseInt(edad) > 65) {
    recomendaciones.push('Considerar evaluación geriátrica integral')
  }

  // Analizar alergias
  const alergias = respuestas['alergias']?.respuesta
  if (alergias && alergias.toLowerCase().includes('medicamento')) {
    recomendaciones.push('⚠️ ALERTA: Paciente con alergias medicamentosas - Verificar antes de prescribir')
  }

  // Analizar síntomas de alarma
  const motivoConsulta = respuestas['motivo-principal']?.respuesta?.toLowerCase() || ''
  const dolor = respuestas['dolor-caracteristicas']?.respuesta?.toLowerCase() || ''
  
  if (motivoConsulta.includes('pecho') || dolor.includes('opresivo')) {
    recomendaciones.push('🚨 Posibles síntomas cardíacos - Evaluar con ECG urgente')
  }

  if (motivoConsulta.includes('cabeza') && dolor.includes('peor de mi vida')) {
    recomendaciones.push('🚨 Cefalea de alarma - Descartar hemorragia subaracnoidea')
  }

  // Factores de riesgo
  const habitos = respuestas['habitos']?.respuesta?.toLowerCase() || ''
  if (habitos.includes('tabaco') || habitos.includes('fumar')) {
    recomendaciones.push('Programa de cesación tabáquica recomendado')
  }

  if (habitos.includes('sedentario') || !habitos.includes('ejercicio')) {
    recomendaciones.push('Recomendar actividad física regular')
  }

  return recomendaciones
} 