/**
 * Exportación de Anamnesis - Altamedica
 * Ejemplo de cómo exportar datos del juego para uso en otras aplicaciones
 */

import { AnamnesisAdapter } from '../../services/anamnesis-adapter'
import { altamedicaAnamnesis } from '../../../../packages/shared/src/index'

// Ejemplo de uso: Exportar anamnesis completada
export async function exportarAnamnesisCompletada(
  respuestas: Record<string, any>,
  pacienteId: string,
  doctorId?: string
) {
  try {
    console.log('🚀 Exportando anamnesis para interoperabilidad...')
    
    // 1. Convertir respuestas del juego a formato compartido
    const anamnesisCompleta = AnamnesisAdapter.convertirJuegoAAnamnesis(
      respuestas,
      pacienteId,
      doctorId
    )
    
    console.log('✅ Anamnesis convertida:', anamnesisCompleta.id)
    
    // 2. Validar la anamnesis
    const validacion = altamedicaAnamnesis.validate(anamnesisCompleta)
    console.log('📊 Validación:', {
      esValida: validacion.esValida,
      completitud: validacion.completitud + '%',
      calidad: validacion.calidad + '%'
    })
    
    if (!validacion.esValida) {
      console.warn('⚠️ Advertencias en la anamnesis:', validacion.advertencias)
    }
    
    // 3. Analizar clínicamente
    const analisis = altamedicaAnamnesis.analyze(anamnesisCompleta)
    console.log('🔍 Análisis clínico:', {
      urgencia: analisis.urgencia,
      alertas: analisis.alertas.length,
      factoresRiesgo: analisis.factoresRiesgo.length
    })
    
    // 4. Exportar para doctores
    const exportDoctores = AnamnesisAdapter.exportarParaDoctores(
      respuestas,
      pacienteId,
      doctorId
    )
    
    // 5. Exportar para pacientes
    const exportPacientes = AnamnesisAdapter.exportarParaPacientes(
      respuestas,
      pacienteId
    )
    
    // 6. Generar resúmenes
    const resumenMedico = AnamnesisAdapter.generarResumenMedico(anamnesisCompleta)
    const resumenPaciente = AnamnesisAdapter.generarResumenPaciente(anamnesisCompleta)
    
    // 7. Preparar datos para envío
    const datosExportacion = {
      anamnesis: anamnesisCompleta,
      exportDoctores,
      exportPacientes,
      resumenMedico,
      resumenPaciente,
      validacion,
      analisis,
      metadata: {
        exportadoEn: new Date().toISOString(),
        version: '1.0.0',
        fuente: 'anamnesis_juego'
      }
    }
    
    console.log('📤 Datos preparados para exportación')
    
    // 8. Aquí se enviarían los datos a las aplicaciones correspondientes
    await enviarADoctores(datosExportacion.exportDoctores)
    await enviarAPacientes(datosExportacion.exportPacientes)
    
    return {
      success: true,
      anamnesisId: anamnesisCompleta.id,
      datos: datosExportacion
    }
    
  } catch (error) {
    console.error('❌ Error al exportar anamnesis:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

// Función para enviar datos a la aplicación de doctores
async function enviarADoctores(exportData: any) {
  try {
    // Simulación de envío a API de doctores
    console.log('📋 Enviando anamnesis a aplicación de doctores...')
    
    // En implementación real, aquí se haría una llamada HTTP
    // const response = await fetch('/api/doctors/anamnesis', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(exportData)
    // })
    
    // Simulación de respuesta exitosa
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log('✅ Anamnesis enviada a doctores exitosamente')
    
  } catch (error) {
    console.error('❌ Error al enviar a doctores:', error)
    throw error
  }
}

// Función para enviar datos a la aplicación de pacientes
async function enviarAPacientes(exportData: any) {
  try {
    // Simulación de envío a API de pacientes
    console.log('👤 Enviando anamnesis a aplicación de pacientes...')
    
    // En implementación real, aquí se haría una llamada HTTP
    // const response = await fetch('/api/patients/anamnesis', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(exportData)
    // })
    
    // Simulación de respuesta exitosa
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log('✅ Anamnesis enviada a pacientes exitosamente')
    
  } catch (error) {
    console.error('❌ Error al enviar a pacientes:', error)
    throw error
  }
}

// Función para obtener estadísticas de anamnesis
export async function obtenerEstadisticasAnamnesis(anamnesisList: any[]) {
  try {
    console.log('📊 Generando estadísticas de anamnesis...')
    
    const estadisticas = altamedicaAnamnesis.generateStats(anamnesisList)
    
    console.log('📈 Estadísticas generadas:', {
      total: estadisticas.totalAnamnesis,
      completadas: estadisticas.completadas,
      enProgreso: estadisticas.enProgreso,
      calidadPromedio: estadisticas.calidadPromedio + '%'
    })
    
    return estadisticas
    
  } catch (error) {
    console.error('❌ Error al generar estadísticas:', error)
    throw error
  }
}

// Función para filtrar anamnesis
export function filtrarAnamnesis(anamnesisList: any[], filtros: any) {
  try {
    console.log('🔍 Filtrando anamnesis...')
    
    const anamnesisFiltradas = altamedicaAnamnesis.filter(anamnesisList, filtros)
    
    console.log(`✅ Filtradas ${anamnesisFiltradas.length} de ${anamnesisList.length} anamnesis`)
    
    return anamnesisFiltradas
    
  } catch (error) {
    console.error('❌ Error al filtrar anamnesis:', error)
    throw error
  }
}

// Ejemplo de uso en el componente de anamnesis
export function usarEnComponenteAnamnesis() {
  // Ejemplo de respuestas del juego
  const respuestasEjemplo = {
    nombre: 'Juan Pérez',
    edad: '35',
    genero: 'Masculino',
    'estado-civil': 'Casado/a',
    ocupacion: 'Ingeniero',
    'diabetes-familiar': true,
    'hipertension-familiar': false,
    'cancer-familiar': false,
    'enfermedades-cardiovasculares': true,
    'otras-enfermedades-familiares': 'Asma en la familia',
    alergias: true,
    'alergias-descripcion': 'Penicilina y polen',
    'cirugias-previas': false,
    'medicamentos-actuales': true,
    'medicamentos-lista': 'Ibuprofeno ocasional',
    fuma: false,
    alcohol: true,
    ejercicio: true,
    dieta: 'Equilibrada',
    sueno: '7',
    'motivo-consulta': 'Dolor de cabeza frecuente',
    'duracion-sintomas': '2 semanas',
    'intensidad-dolor': '6',
    'factores-agravantes': 'Estrés y falta de sueño',
    'factores-mejorantes': 'Descanso y relajación',
    'sintomas-asociados': 'Fatiga, irritabilidad',
    'inicio-sintomas': 'Hace 2 semanas',
    'evolucion-sintomas': 'Progresivo',
    'sistema-cardiovascular': 'Normal',
    'sistema-respiratorio': 'Normal',
    'sistema-digestivo': 'Normal',
    'sistema-neurologico': 'Dolor de cabeza',
    'sistema-musculoesqueletico': 'Normal'
  }
  
  // Ejemplo de uso
  const pacienteId = 'paciente-123'
  const doctorId = 'doctor-456'
  
  exportarAnamnesisCompletada(respuestasEjemplo, pacienteId, doctorId)
    .then(resultado => {
      if (resultado.success) {
        console.log('🎉 Anamnesis exportada exitosamente:', resultado.anamnesisId)
      } else {
        console.error('❌ Error en la exportación:', resultado.error)
      }
    })
    .catch(error => {
      console.error('❌ Error inesperado:', error)
    })
}

// Exportar funciones para uso en otros componentes
export default {
  exportarAnamnesisCompletada,
  obtenerEstadisticasAnamnesis,
  filtrarAnamnesis,
  usarEnComponenteAnamnesis
} 