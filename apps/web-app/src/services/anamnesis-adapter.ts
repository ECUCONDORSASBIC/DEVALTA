/**
 * Adaptador de Anamnesis - Altamedica
 * Convierte datos del juego de anamnesis al formato compartido
 */

import { anamnesisSharedService } from '../../../packages/shared/src/services/anamnesis-shared-service'
import { AnamnesisCompleta, AnamnesisExport } from '../../../packages/shared/src/types/anamnesis-shared'
import { SECCIONES_ANAMNESIS, PreguntaAnamnesis } from '../data/anamnesis-alvarez'

export class AnamnesisAdapter {
  /**
   * Convierte respuestas del juego a formato de anamnesis completa
   */
  static convertirJuegoAAnamnesis(
    respuestas: Record<string, any>,
    pacienteId: string,
    doctorId?: string
  ): AnamnesisCompleta {
    const ahora = new Date()
    
    const anamnesis: AnamnesisCompleta = {
      id: `anamnesis-${pacienteId}-${Date.now()}`,
      pacienteId,
      doctorId,
      fechaCreacion: ahora,
      fechaActualizacion: ahora,
      estado: 'completada',
      
      // Datos personales
      datosPersonales: {
        nombre: respuestas.nombre || '',
        edad: parseInt(respuestas.edad) || 0,
        genero: respuestas.genero || '',
        estadoCivil: respuestas['estado-civil'] || undefined,
        ocupacion: respuestas.ocupacion || undefined
      },
      
      // Antecedentes familiares
      antecedentesFamiliares: {
        diabetes: respuestas['diabetes-familiar'] || false,
        hipertension: respuestas['hipertension-familiar'] || false,
        cancer: respuestas['cancer-familiar'] || false,
        enfermedadesCardiovasculares: respuestas['enfermedades-cardiovasculares'] || false,
        otrasEnfermedades: respuestas['otras-enfermedades-familiares'] || undefined
      },
      
      // Antecedentes personales
      antecedentesPersonales: {
        alergias: respuestas.alergias || false,
        alergiasDescripcion: respuestas['alergias-descripcion'] || undefined,
        cirugiasPrevias: respuestas['cirugias-previas'] || false,
        cirugiasDescripcion: respuestas['cirugias-descripcion'] || undefined,
        medicamentosActuales: respuestas['medicamentos-actuales'] || false,
        medicamentosLista: respuestas['medicamentos-lista'] || undefined,
        enfermedadesCronicas: []
      },
      
      // Hábitos
      habitos: {
        fuma: respuestas.fuma || false,
        alcohol: respuestas.alcohol || false,
        ejercicio: respuestas.ejercicio || false,
        dieta: respuestas.dieta || undefined,
        sueno: parseInt(respuestas.sueno) || undefined
      },
      
      // Motivo de consulta (simulado para el juego)
      motivoConsulta: {
        sintomaPrincipal: respuestas['motivo-consulta'] || 'Evaluación general',
        duracion: respuestas['duracion-sintomas'] || 'No especificado',
        intensidad: parseInt(respuestas['intensidad-dolor']) || undefined,
        factoresAgravantes: respuestas['factores-agravantes'] || undefined,
        factoresMejorantes: respuestas['factores-mejorantes'] || undefined,
        sintomasAsociados: respuestas['sintomas-asociados'] ? 
          respuestas['sintomas-asociados'].split(',').map((s: string) => s.trim()) : []
      },
      
      // Enfermedad actual
      enfermedadActual: {
        inicio: respuestas['inicio-sintomas'] || 'No especificado',
        evolucion: respuestas['evolucion-sintomas'] || 'No especificado',
        tratamientosPrevios: respuestas['tratamientos-previos'] || undefined,
        respuestaTratamientos: respuestas['respuesta-tratamientos'] || undefined
      },
      
      // Revisión por sistemas
      revisionSistemas: {
        cardiovascular: respuestas['sistema-cardiovascular'] || undefined,
        respiratorio: respuestas['sistema-respiratorio'] || undefined,
        digestivo: respuestas['sistema-digestivo'] || undefined,
        genitourinario: respuestas['sistema-genitourinario'] || undefined,
        neurologico: respuestas['sistema-neurologico'] || undefined,
        musculoesqueletico: respuestas['sistema-musculoesqueletico'] || undefined,
        endocrino: respuestas['sistema-endocrino'] || undefined,
        psiquiatrico: respuestas['sistema-psiquiatrico'] || undefined
      },
      
      // Examen físico (vacío para el juego)
      examenFisico: undefined,
      
      // Impresión diagnóstica (vacío para el juego)
      impresionDiagnostica: undefined,
      
      // Plan terapéutico (vacío para el juego)
      planTerapeutico: undefined,
      
      // Metadatos
      metadata: {
        version: '1.0.0',
        fuente: 'anamnesis_juego',
        tiempoCompletado: this.calcularTiempoCompletado(respuestas),
        puntosTotales: this.calcularPuntosTotales(respuestas),
        logrosObtenidos: this.obtenerLogros(respuestas),
        calidadDatos: this.calcularCalidadDatos(respuestas)
      }
    }
    
    return anamnesis
  }

  /**
   * Exporta anamnesis del juego para uso en otras aplicaciones
   */
  static exportarParaDoctores(
    respuestas: Record<string, any>,
    pacienteId: string,
    doctorId?: string
  ): AnamnesisExport {
    const anamnesis = this.convertirJuegoAAnamnesis(respuestas, pacienteId, doctorId)
    
    return anamnesisSharedService.exportarAnamnesis(
      anamnesis,
      'json',
      'anamnesis_juego',
      'sistema_automatico'
    )
  }

  /**
   * Exporta anamnesis del juego para uso en aplicación de pacientes
   */
  static exportarParaPacientes(
    respuestas: Record<string, any>,
    pacienteId: string
  ): AnamnesisExport {
    const anamnesis = this.convertirJuegoAAnamnesis(respuestas, pacienteId)
    
    return anamnesisSharedService.exportarAnamnesis(
      anamnesis,
      'json',
      'anamnesis_juego',
      'paciente'
    )
  }

  /**
   * Genera resumen médico para doctores
   */
  static generarResumenMedico(anamnesis: AnamnesisCompleta): string {
    const resumen = []
    
    // Datos del paciente
    resumen.push(`PACIENTE: ${anamnesis.datosPersonales.nombre}`)
    resumen.push(`EDAD: ${anamnesis.datosPersonales.edad} años`)
    resumen.push(`GÉNERO: ${anamnesis.datosPersonales.genero}`)
    if (anamnesis.datosPersonales.ocupacion) {
      resumen.push(`OCUPACIÓN: ${anamnesis.datosPersonales.ocupacion}`)
    }
    
    resumen.push('')
    resumen.push('MOTIVO DE CONSULTA:')
    resumen.push(`- Síntoma principal: ${anamnesis.motivoConsulta.sintomaPrincipal}`)
    resumen.push(`- Duración: ${anamnesis.motivoConsulta.duracion}`)
    if (anamnesis.motivoConsulta.intensidad) {
      resumen.push(`- Intensidad: ${anamnesis.motivoConsulta.intensidad}/10`)
    }
    
    // Antecedentes familiares
    const antecedentesFamiliares = []
    if (anamnesis.antecedentesFamiliares.diabetes) antecedentesFamiliares.push('Diabetes')
    if (anamnesis.antecedentesFamiliares.hipertension) antecedentesFamiliares.push('Hipertensión')
    if (anamnesis.antecedentesFamiliares.cancer) antecedentesFamiliares.push('Cáncer')
    if (anamnesis.antecedentesFamiliares.enfermedadesCardiovasculares) antecedentesFamiliares.push('Enfermedades cardiovasculares')
    
    if (antecedentesFamiliares.length > 0) {
      resumen.push('')
      resumen.push('ANTECEDENTES FAMILIARES:')
      antecedentesFamiliares.forEach(antecedente => {
        resumen.push(`- ${antecedente}`)
      })
    }
    
    // Antecedentes personales
    const antecedentesPersonales = []
    if (anamnesis.antecedentesPersonales.alergias) {
      antecedentesPersonales.push(`Alergias: ${anamnesis.antecedentesPersonales.alergiasDescripcion || 'Sí, no especificadas'}`)
    }
    if (anamnesis.antecedentesPersonales.cirugiasPrevias) {
      antecedentesPersonales.push(`Cirugías previas: ${anamnesis.antecedentesPersonales.cirugiasDescripcion || 'Sí, no especificadas'}`)
    }
    if (anamnesis.antecedentesPersonales.medicamentosActuales) {
      antecedentesPersonales.push(`Medicamentos actuales: ${anamnesis.antecedentesPersonales.medicamentosLista || 'Sí, no especificados'}`)
    }
    
    if (antecedentesPersonales.length > 0) {
      resumen.push('')
      resumen.push('ANTECEDENTES PERSONALES:')
      antecedentesPersonales.forEach(antecedente => {
        resumen.push(`- ${antecedente}`)
      })
    }
    
    // Hábitos
    const habitos = []
    if (anamnesis.habitos.fuma) habitos.push('Fumador')
    if (anamnesis.habitos.alcohol) habitos.push('Consumo de alcohol')
    if (anamnesis.habitos.ejercicio) habitos.push('Realiza ejercicio')
    if (anamnesis.habitos.dieta) habitos.push(`Dieta: ${anamnesis.habitos.dieta}`)
    if (anamnesis.habitos.sueno) habitos.push(`${anamnesis.habitos.sueno} horas de sueño`)
    
    if (habitos.length > 0) {
      resumen.push('')
      resumen.push('HÁBITOS:')
      habitos.forEach(habito => {
        resumen.push(`- ${habito}`)
      })
    }
    
    // Análisis clínico
    const analisis = anamnesisSharedService.analizarClinico(anamnesis)
    if (analisis.urgencia !== 'baja') {
      resumen.push('')
      resumen.push(`NIVEL DE URGENCIA: ${analisis.urgencia.toUpperCase()}`)
    }
    
    if (analisis.alertas.length > 0) {
      resumen.push('')
      resumen.push('ALERTAS:')
      analisis.alertas.forEach(alerta => {
        resumen.push(`- ${alerta}`)
      })
    }
    
    if (analisis.factoresRiesgo.length > 0) {
      resumen.push('')
      resumen.push('FACTORES DE RIESGO:')
      analisis.factoresRiesgo.forEach(factor => {
        resumen.push(`- ${factor}`)
      })
    }
    
    resumen.push('')
    resumen.push(`Fecha de generación: ${new Date().toLocaleString()}`)
    resumen.push(`Calidad de datos: ${anamnesis.metadata.calidadDatos}%`)
    
    return resumen.join('\n')
  }

  /**
   * Genera resumen para pacientes
   */
  static generarResumenPaciente(anamnesis: AnamnesisCompleta): string {
    const resumen = []
    
    resumen.push('RESUMEN DE TU EVALUACIÓN MÉDICA')
    resumen.push('================================')
    resumen.push('')
    
    resumen.push(`Hola ${anamnesis.datosPersonales.nombre},`)
    resumen.push('')
    resumen.push('Hemos completado tu evaluación médica inicial. Aquí tienes un resumen:')
    resumen.push('')
    
    // Motivo de consulta
    resumen.push('📋 MOTIVO DE CONSULTA:')
    resumen.push(`   ${anamnesis.motivoConsulta.sintomaPrincipal}`)
    resumen.push('')
    
    // Antecedentes importantes
    const antecedentesImportantes = []
    if (anamnesis.antecedentesPersonales.alergias) {
      antecedentesImportantes.push('• Tienes alergias conocidas')
    }
    if (anamnesis.antecedentesPersonales.medicamentosActuales) {
      antecedentesImportantes.push('• Tomas medicamentos actualmente')
    }
    if (anamnesis.antecedentesFamiliares.diabetes || anamnesis.antecedentesFamiliares.hipertension) {
      antecedentesImportantes.push('• Tienes antecedentes familiares importantes')
    }
    
    if (antecedentesImportantes.length > 0) {
      resumen.push('⚠️ INFORMACIÓN IMPORTANTE:')
      antecedentesImportantes.forEach(item => {
        resumen.push(`   ${item}`)
      })
      resumen.push('')
    }
    
    // Recomendaciones
    const analisis = anamnesisSharedService.analizarClinico(anamnesis)
    if (analisis.recomendaciones.length > 0) {
      resumen.push('💡 RECOMENDACIONES:')
      analisis.recomendaciones.forEach(recomendacion => {
        resumen.push(`   • ${recomendacion}`)
      })
      resumen.push('')
    }
    
    resumen.push('📞 PRÓXIMOS PASOS:')
    resumen.push('   Un profesional médico revisará tu información y se pondrá en contacto contigo.')
    resumen.push('')
    
    resumen.push('Gracias por completar tu evaluación.')
    resumen.push('')
    resumen.push(`Fecha: ${new Date().toLocaleDateString()}`)
    
    return resumen.join('\n')
  }

  // Métodos privados auxiliares
  private static calcularTiempoCompletado(respuestas: Record<string, any>): number {
    // Simulación - en implementación real se calcularía desde el inicio
    return Math.floor(Math.random() * 30) + 10 // 10-40 minutos
  }

  private static calcularPuntosTotales(respuestas: Record<string, any>): number {
    let puntos = 0
    const preguntas = SECCIONES_ANAMNESIS.flatMap(seccion => seccion.preguntas)
    
    preguntas.forEach(pregunta => {
      if (respuestas[pregunta.id]) {
        puntos += pregunta.puntosGamificacion || 5
      }
    })
    
    return puntos
  }

  private static obtenerLogros(respuestas: Record<string, any>): string[] {
    const logros = []
    
    // Logros basados en completitud
    const preguntasCompletadas = Object.keys(respuestas).length
    if (preguntasCompletadas >= 20) logros.push('Anamnesis Completa')
    if (preguntasCompletadas >= 15) logros.push('Información Detallada')
    if (preguntasCompletadas >= 10) logros.push('Datos Básicos')
    
    // Logros específicos
    if (respuestas['antecedentes-familiares']) logros.push('Historia Familiar')
    if (respuestas['antecedentes-personales']) logros.push('Historia Personal')
    if (respuestas.habitos) logros.push('Hábitos de Vida')
    
    return logros
  }

  private static calcularCalidadDatos(respuestas: Record<string, any>): number {
    let calidad = 50 // Base
    
    // Aumentar por completitud
    const preguntasCompletadas = Object.keys(respuestas).length
    const totalPreguntas = SECCIONES_ANAMNESIS.flatMap(seccion => seccion.preguntas).length
    calidad += (preguntasCompletadas / totalPreguntas) * 30
    
    // Aumentar por detalles específicos
    if (respuestas['alergias-descripcion']) calidad += 5
    if (respuestas['medicamentos-lista']) calidad += 5
    if (respuestas['otras-enfermedades-familiares']) calidad += 5
    if (respuestas['cirugias-descripcion']) calidad += 5
    
    return Math.min(100, Math.max(0, calidad))
  }
} 