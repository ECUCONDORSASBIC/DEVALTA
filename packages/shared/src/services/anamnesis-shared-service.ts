/**
 * Servicio Compartido para Anamnesis - Altamedica
 * Manejo de datos de anamnesis entre aplicaciones
 */

import {
  AnamnesisCompleta,
  AnamnesisExport,
  AnalisisClinico,
  ValidacionAnamnesis,
  FiltrosAnamnesis,
  EstadisticasAnamnesis,
  AuditoriaAnamnesis,
  NotificacionAnamnesis,
  RespuestaAnamnesis,
  PreguntaAnamnesis
} from '../types/anamnesis-shared'

export class AnamnesisSharedService {
  private static instance: AnamnesisSharedService
  private version = '1.0.0'

  static getInstance(): AnamnesisSharedService {
    if (!AnamnesisSharedService.instance) {
      AnamnesisSharedService.instance = new AnamnesisSharedService()
    }
    return AnamnesisSharedService.instance
  }

  /**
   * Exporta datos de anamnesis en formato interoperable
   */
  exportarAnamnesis(
    anamnesis: AnamnesisCompleta,
    formato: 'json' | 'fhir' | 'hl7' | 'pdf',
    aplicacionOrigen: string,
    exportadoPor: string
  ): AnamnesisExport {
    const exportData: AnamnesisExport = {
      version: this.version,
      timestamp: new Date(),
      anamnesis,
      formato,
      metadata: {
        exportadoPor,
        aplicacionOrigen,
        encriptado: false,
        hashIntegridad: this.generarHashIntegridad(anamnesis)
      }
    }

    return exportData
  }

  /**
   * Importa datos de anamnesis desde formato interoperable
   */
  importarAnamnesis(exportData: AnamnesisExport): AnamnesisCompleta {
    // Validar integridad
    const hashCalculado = this.generarHashIntegridad(exportData.anamnesis)
    if (exportData.metadata.hashIntegridad && hashCalculado !== exportData.metadata.hashIntegridad) {
      throw new Error('Los datos de anamnesis han sido modificados')
    }

    // Actualizar metadatos de importación
    const anamnesisImportada = {
      ...exportData.anamnesis,
      fechaActualizacion: new Date(),
      metadata: {
        ...exportData.anamnesis.metadata,
        fuente: 'importada' as any
      }
    }

    return anamnesisImportada
  }

  /**
   * Valida la completitud y calidad de los datos de anamnesis
   */
  validarAnamnesis(anamnesis: AnamnesisCompleta): ValidacionAnamnesis {
    const errores: string[] = []
    const advertencias: string[] = []
    let completitud = 0
    let calidad = 0

    // Validar datos personales obligatorios
    if (!anamnesis.datosPersonales.nombre) {
      errores.push('Nombre del paciente es obligatorio')
    }
    if (!anamnesis.datosPersonales.edad) {
      errores.push('Edad del paciente es obligatoria')
    }
    if (!anamnesis.datosPersonales.genero) {
      errores.push('Género del paciente es obligatorio')
    }

    // Validar motivo de consulta
    if (!anamnesis.motivoConsulta.sintomaPrincipal) {
      errores.push('Síntoma principal es obligatorio')
    }

    // Calcular completitud
    const camposObligatorios = [
      'datosPersonales.nombre',
      'datosPersonales.edad',
      'datosPersonales.genero',
      'motivoConsulta.sintomaPrincipal'
    ]
    const camposOpcionales = [
      'antecedentesFamiliares',
      'antecedentesPersonales',
      'habitos',
      'revisionSistemas',
      'examenFisico'
    ]

    let camposCompletados = 0
    camposObligatorios.forEach(campo => {
      if (this.obtenerValorCampo(anamnesis, campo)) {
        camposCompletados++
      }
    })

    completitud = (camposCompletados / camposObligatorios.length) * 100

    // Calcular calidad basada en completitud de campos opcionales
    let calidadCampos = 0
    camposOpcionales.forEach(campo => {
      if (this.obtenerValorCampo(anamnesis, campo)) {
        calidadCampos++
      }
    })
    calidad = completitud + (calidadCampos / camposOpcionales.length) * 20

    // Advertencias
    if (anamnesis.datosPersonales.edad && anamnesis.datosPersonales.edad > 100) {
      advertencias.push('Verificar edad del paciente')
    }
    if (anamnesis.motivoConsulta.intensidad && anamnesis.motivoConsulta.intensidad > 8) {
      advertencias.push('Síntoma de alta intensidad - considerar urgencia')
    }

    return {
      esValida: errores.length === 0,
      errores,
      advertencias,
      completitud: Math.round(completitud),
      calidad: Math.round(calidad),
      recomendaciones: this.generarRecomendaciones(anamnesis, completitud, calidad)
    }
  }

  /**
   * Analiza clínicamente los datos de anamnesis
   */
  analizarClinico(anamnesis: AnamnesisCompleta): AnalisisClinico {
    const alertas: string[] = []
    const diagnosticosDiferenciales: string[] = []
    const recomendaciones: string[] = []
    const factoresRiesgo: string[] = []

    // Análisis de urgencia basado en síntomas
    let urgencia: 'baja' | 'media' | 'alta' | 'emergencia' = 'baja'
    
    if (anamnesis.motivoConsulta.intensidad) {
      if (anamnesis.motivoConsulta.intensidad >= 9) {
        urgencia = 'emergencia'
        alertas.push('Síntoma de intensidad extrema')
      } else if (anamnesis.motivoConsulta.intensidad >= 7) {
        urgencia = 'alta'
        alertas.push('Síntoma de alta intensidad')
      } else if (anamnesis.motivoConsulta.intensidad >= 5) {
        urgencia = 'media'
      }
    }

    // Análisis de factores de riesgo
    if (anamnesis.antecedentesFamiliares.diabetes) {
      factoresRiesgo.push('Antecedentes familiares de diabetes')
    }
    if (anamnesis.antecedentesFamiliares.hipertension) {
      factoresRiesgo.push('Antecedentes familiares de hipertensión')
    }
    if (anamnesis.habitos.fuma) {
      factoresRiesgo.push('Tabaquismo')
    }
    if (anamnesis.antecedentesPersonales.alergias) {
      alertas.push('Paciente con alergias conocidas')
    }

    // Generar diagnósticos diferenciales básicos
    if (anamnesis.motivoConsulta.sintomaPrincipal.toLowerCase().includes('dolor')) {
      diagnosticosDiferenciales.push('Dolor musculoesquelético')
      diagnosticosDiferenciales.push('Dolor visceral')
      diagnosticosDiferenciales.push('Dolor neuropático')
    }

    // Recomendaciones basadas en análisis
    if (urgencia === 'emergencia' || urgencia === 'alta') {
      recomendaciones.push('Evaluación médica inmediata recomendada')
    }
    if (factoresRiesgo.length > 0) {
      recomendaciones.push('Considerar estudios preventivos')
    }
    if (anamnesis.antecedentesPersonales.medicamentosActuales) {
      recomendaciones.push('Revisar interacciones medicamentosas')
    }

    return {
      urgencia,
      alertas,
      diagnosticosDiferenciales,
      recomendaciones,
      factoresRiesgo,
      necesitaSeguimiento: urgencia !== 'baja',
      confianza: this.calcularConfianza(anamnesis),
      tiempoEstimadoEspera: this.calcularTiempoEspera(urgencia)
    }
  }

  /**
   * Convierte anamnesis a formato FHIR
   */
  convertirAFHIR(anamnesis: AnamnesisCompleta): any {
    const fhirResponse = {
      resourceType: 'QuestionnaireResponse',
      id: anamnesis.id,
      questionnaire: 'anamnesis-altamedica',
      subject: {
        reference: `Patient/${anamnesis.pacienteId}`
      },
      authored: anamnesis.fechaCreacion.toISOString(),
      status: anamnesis.estado === 'completada' ? 'completed' : 'in-progress',
      item: this.convertirRespuestasAFHIR(anamnesis)
    }

    return fhirResponse
  }

  /**
   * Genera estadísticas de anamnesis
   */
  generarEstadisticas(anamnesisList: AnamnesisCompleta[]): EstadisticasAnamnesis {
    const totalAnamnesis = anamnesisList.length
    const completadas = anamnesisList.filter(a => a.estado === 'completada').length
    const enProgreso = anamnesisList.filter(a => a.estado === 'en_progreso').length

    const tiemposCompletados = anamnesisList
      .filter(a => a.metadata.tiempoCompletado)
      .map(a => a.metadata.tiempoCompletado!)
    
    const promedioTiempoCompletado = tiemposCompletados.length > 0 
      ? tiemposCompletados.reduce((a, b) => a + b, 0) / tiemposCompletados.length 
      : 0

    // Diagnosticos más comunes
    const diagnosticos = anamnesisList
      .filter(a => a.impresionDiagnostica?.diagnosticos)
      .flatMap(a => a.impresionDiagnostica!.diagnosticos)
    
    const frecuenciaDiagnosticos = diagnosticos.reduce((acc, diag) => {
      acc[diag] = (acc[diag] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const diagnosticosMasComunes = Object.entries(frecuenciaDiagnosticos)
      .map(([diagnostico, frecuencia]) => ({ diagnostico, frecuencia }))
      .sort((a, b) => b.frecuencia - a.frecuencia)
      .slice(0, 10)

    // Distribución de urgencia
    const nivelUrgenciaDistribucion = anamnesisList
      .filter(a => a.impresionDiagnostica?.nivelUrgencia)
      .reduce((acc, a) => {
        const urgencia = a.impresionDiagnostica!.nivelUrgencia
        acc[urgencia] = (acc[urgencia] || 0) + 1
        return acc
      }, {} as Record<string, number>)

    const calidadPromedio = anamnesisList.length > 0
      ? anamnesisList.reduce((sum, a) => sum + a.metadata.calidadDatos, 0) / anamnesisList.length
      : 0

    return {
      totalAnamnesis,
      completadas,
      enProgreso,
      promedioTiempoCompletado,
      diagnosticosMasComunes,
      nivelUrgenciaDistribucion,
      calidadPromedio
    }
  }

  /**
   * Filtra anamnesis según criterios
   */
  filtrarAnamnesis(anamnesisList: AnamnesisCompleta[], filtros: FiltrosAnamnesis): AnamnesisCompleta[] {
    return anamnesisList.filter(anamnesis => {
      if (filtros.pacienteId && anamnesis.pacienteId !== filtros.pacienteId) return false
      if (filtros.doctorId && anamnesis.doctorId !== filtros.doctorId) return false
      if (filtros.estado && !filtros.estado.includes(anamnesis.estado)) return false
      if (filtros.nivelUrgencia && anamnesis.impresionDiagnostica?.nivelUrgencia && 
          !filtros.nivelUrgencia.includes(anamnesis.impresionDiagnostica.nivelUrgencia)) return false
      if (filtros.fechaDesde && anamnesis.fechaCreacion < filtros.fechaDesde) return false
      if (filtros.fechaHasta && anamnesis.fechaCreacion > filtros.fechaHasta) return false
      if (filtros.completitud) {
        const validacion = this.validarAnamnesis(anamnesis)
        if (validacion.completitud < filtros.completitud.min || 
            validacion.completitud > filtros.completitud.max) return false
      }
      return true
    })
  }

  // Métodos privados auxiliares
  private generarHashIntegridad(anamnesis: AnamnesisCompleta): string {
    const datos = JSON.stringify(anamnesis)
    // Implementación simple de hash - en producción usar crypto
    let hash = 0
    for (let i = 0; i < datos.length; i++) {
      const char = datos.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32bit integer
    }
    return hash.toString(16)
  }

  private obtenerValorCampo(anamnesis: AnamnesisCompleta, campo: string): any {
    const partes = campo.split('.')
    let valor: any = anamnesis
    for (const parte of partes) {
      valor = valor?.[parte]
    }
    return valor
  }

  private generarRecomendaciones(anamnesis: AnamnesisCompleta, completitud: number, calidad: number): string[] {
    const recomendaciones: string[] = []
    
    if (completitud < 50) {
      recomendaciones.push('Completar datos personales obligatorios')
    }
    if (calidad < 70) {
      recomendaciones.push('Agregar más detalles en antecedentes y hábitos')
    }
    if (!anamnesis.antecedentesPersonales.alergias) {
      recomendaciones.push('Verificar si el paciente tiene alergias')
    }
    if (!anamnesis.antecedentesPersonales.medicamentosActuales) {
      recomendaciones.push('Verificar medicamentos actuales')
    }
    
    return recomendaciones
  }

  private calcularConfianza(anamnesis: AnamnesisCompleta): number {
    let confianza = 50 // Base
    
    // Aumentar confianza por completitud
    const validacion = this.validarAnamnesis(anamnesis)
    confianza += validacion.calidad * 0.3
    
    // Aumentar por detalles específicos
    if (anamnesis.motivoConsulta.duracion) confianza += 10
    if (anamnesis.motivoConsulta.intensidad) confianza += 10
    if (anamnesis.antecedentesPersonales.alergiasDescripcion) confianza += 5
    if (anamnesis.antecedentesPersonales.medicamentosLista) confianza += 5
    
    return Math.min(100, Math.max(0, confianza))
  }

  private calcularTiempoEspera(urgencia: string): number {
    switch (urgencia) {
      case 'emergencia': return 0
      case 'alta': return 30
      case 'media': return 120
      case 'baja': return 240
      default: return 120
    }
  }

  private convertirRespuestasAFHIR(anamnesis: AnamnesisCompleta): any[] {
    const items: any[] = []
    
    // Convertir datos personales
    items.push({
      linkId: 'datos-personales',
      text: 'Datos Personales',
      item: [
        {
          linkId: 'nombre',
          text: 'Nombre',
          answer: [{ valueString: anamnesis.datosPersonales.nombre }]
        },
        {
          linkId: 'edad',
          text: 'Edad',
          answer: [{ valueInteger: anamnesis.datosPersonales.edad }]
        },
        {
          linkId: 'genero',
          text: 'Género',
          answer: [{ valueString: anamnesis.datosPersonales.genero }]
        }
      ]
    })
    
    // Convertir motivo de consulta
    items.push({
      linkId: 'motivo-consulta',
      text: 'Motivo de Consulta',
      item: [
        {
          linkId: 'sintoma-principal',
          text: 'Síntoma Principal',
          answer: [{ valueString: anamnesis.motivoConsulta.sintomaPrincipal }]
        },
        {
          linkId: 'duracion',
          text: 'Duración',
          answer: [{ valueString: anamnesis.motivoConsulta.duracion }]
        }
      ]
    })
    
    return items
  }
}

// Exportar instancia singleton
export const anamnesisSharedService = AnamnesisSharedService.getInstance() 