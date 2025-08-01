/**
 * Servicio de Anamnesis para Pacientes - Altamedica
 * Importa y gestiona datos de anamnesis desde el juego
 */

import { buildApiUrl, getDefaultHeaders } from '../config/api';

// Interfaces para los datos de anamnesis
export interface AnamnesisData {
  id: string;
  pacienteId: string;
  doctorId?: string;
  fechaCompletada: string;
  estado: 'completada' | 'en_progreso' | 'pendiente';
  datos: {
    // Datos personales
    nombre: string;
    edad: string;
    genero: string;
    estadoCivil: string;
    ocupacion: string;
    
    // Antecedentes familiares
    antecedentesFamiliares: {
      diabetes: boolean;
      hipertension: boolean;
      cancer: boolean;
      enfermedadesCardiovasculares: boolean;
      otrasEnfermedades?: string;
    };
    
    // Antecedentes personales
    alergias: boolean;
    alergiasDescripcion?: string;
    cirugiasPrevias: boolean;
    cirugiasDescripcion?: string;
    medicamentosActuales: boolean;
    medicamentosLista?: string;
    
    // Hábitos
    fuma: boolean;
    alcohol: boolean;
    ejercicio: boolean;
    dieta: string;
    sueno: string;
    
    // Motivo de consulta
    motivoConsulta: string;
    duracionSintomas: string;
    intensidadDolor?: string;
    factoresAgravantes?: string;
    factoresMejorantes?: string;
    sintomasAsociados?: string;
    inicioSintomas: string;
    evolucionSintomas: string;
    
    // Revisión por sistemas
    sistemaCardiovascular: string;
    sistemaRespiratorio: string;
    sistemaDigestivo: string;
    sistemaNeurologico: string;
    sistemaMusculoesqueletico: string;
  };
  
  // Análisis clínico
  analisis?: {
    urgencia: 'baja' | 'media' | 'alta' | 'crítica';
    alertas: string[];
    factoresRiesgo: string[];
    recomendaciones: string[];
  };
  
  // Validación
  validacion?: {
    esValida: boolean;
    completitud: number;
    calidad: number;
    advertencias: string[];
  };
  
  // Resúmenes
  resumenMedico?: string;
  resumenPaciente?: string;
}

export interface AnamnesisSummary {
  totalAnamnesis: number;
  completadas: number;
  enProgreso: number;
  ultimaActualizacion: string;
  calidadPromedio: number;
}

/**
 * Servicio principal de anamnesis
 */
export class AnamnesisService {
  private static instance: AnamnesisService;
  private baseUrl: string;

  constructor() {
    this.baseUrl = buildApiUrl('/api/v1/anamnesis');
  }

  static getInstance(): AnamnesisService {
    if (!AnamnesisService.instance) {
      AnamnesisService.instance = new AnamnesisService();
    }
    return AnamnesisService.instance;
  }

  /**
   * Importa datos de anamnesis desde el juego
   */
  async importarDesdeJuego(
    respuestasJuego: Record<string, any>,
    pacienteId: string,
    token: string,
    doctorId?: string
  ): Promise<AnamnesisData> {
    try {
      console.log('🚀 Importando anamnesis desde el juego...');
      
      // Convertir respuestas del juego al formato de anamnesis
      const anamnesisData = this.convertirRespuestasJuego(respuestasJuego, pacienteId, doctorId);
      
      // Enviar a la API
      const response = await fetch(`${this.baseUrl}/importar`, {
        method: 'POST',
        headers: {
          ...getDefaultHeaders(token),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          anamnesis: anamnesisData,
          fuente: 'anamnesis_juego',
          metadata: {
            importadoEn: new Date().toISOString(),
            version: '1.0.0',
            origen: 'juego_anamnesis'
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.error || 'Error al importar anamnesis');
      }

      const result = await response.json();
      console.log('✅ Anamnesis importada exitosamente:', result.data.id);
      
      return result.data;
      
    } catch (error) {
      console.error('❌ Error al importar anamnesis:', error);
      throw error;
    }
  }

  /**
   * Obtiene la anamnesis del paciente
   */
  async obtenerAnamnesis(
    pacienteId: string,
    token: string
  ): Promise<AnamnesisData | null> {
    try {
      const response = await fetch(`${this.baseUrl}/paciente/${pacienteId}`, {
        headers: getDefaultHeaders(token),
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null; // No hay anamnesis
        }
        const errorData = await response.json();
        throw new Error(errorData?.error || 'Error al obtener anamnesis');
      }

      const result = await response.json();
      return result.data;
      
    } catch (error) {
      console.error('❌ Error al obtener anamnesis:', error);
      throw error;
    }
  }

  /**
   * Obtiene el resumen de anamnesis del paciente
   */
  async obtenerResumenAnamnesis(
    pacienteId: string,
    token: string
  ): Promise<{
    resumenMedico: string;
    resumenPaciente: string;
    alertas: string[];
    recomendaciones: string[];
  } | null> {
    try {
      const response = await fetch(`${this.baseUrl}/paciente/${pacienteId}/resumen`, {
        headers: getDefaultHeaders(token),
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        const errorData = await response.json();
        throw new Error(errorData?.error || 'Error al obtener resumen');
      }

      const result = await response.json();
      return result.data;
      
    } catch (error) {
      console.error('❌ Error al obtener resumen de anamnesis:', error);
      throw error;
    }
  }

  /**
   * Actualiza la anamnesis
   */
  async actualizarAnamnesis(
    anamnesisId: string,
    datosActualizados: Partial<AnamnesisData>,
    token: string
  ): Promise<AnamnesisData> {
    try {
      const response = await fetch(`${this.baseUrl}/${anamnesisId}`, {
        method: 'PUT',
        headers: {
          ...getDefaultHeaders(token),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datosActualizados),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.error || 'Error al actualizar anamnesis');
      }

      const result = await response.json();
      return result.data;
      
    } catch (error) {
      console.error('❌ Error al actualizar anamnesis:', error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas de anamnesis
   */
  async obtenerEstadisticas(token: string): Promise<AnamnesisSummary> {
    try {
      const response = await fetch(`${this.baseUrl}/estadisticas`, {
        headers: getDefaultHeaders(token),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.error || 'Error al obtener estadísticas');
      }

      const result = await response.json();
      return result.data;
      
    } catch (error) {
      console.error('❌ Error al obtener estadísticas:', error);
      throw error;
    }
  }

  /**
   * Convierte las respuestas del juego al formato de anamnesis
   */
  private convertirRespuestasJuego(
    respuestas: Record<string, any>,
    pacienteId: string,
    doctorId?: string
  ): Omit<AnamnesisData, 'id' | 'fechaCompletada'> {
    return {
      pacienteId,
      doctorId,
      estado: 'completada',
      datos: {
        // Datos personales
        nombre: respuestas.nombre || '',
        edad: respuestas.edad || '',
        genero: respuestas.genero || '',
        estadoCivil: respuestas['estado-civil'] || '',
        ocupacion: respuestas.ocupacion || '',
        
        // Antecedentes familiares
        antecedentesFamiliares: {
          diabetes: respuestas['diabetes-familiar'] || false,
          hipertension: respuestas['hipertension-familiar'] || false,
          cancer: respuestas['cancer-familiar'] || false,
          enfermedadesCardiovasculares: respuestas['enfermedades-cardiovasculares'] || false,
          otrasEnfermedades: respuestas['otras-enfermedades-familiares'] || undefined,
        },
        
        // Antecedentes personales
        alergias: respuestas.alergias || false,
        alergiasDescripcion: respuestas['alergias-descripcion'] || undefined,
        cirugiasPrevias: respuestas['cirugias-previas'] || false,
        cirugiasDescripcion: respuestas['cirugias-descripcion'] || undefined,
        medicamentosActuales: respuestas['medicamentos-actuales'] || false,
        medicamentosLista: respuestas['medicamentos-lista'] || undefined,
        
        // Hábitos
        fuma: respuestas.fuma || false,
        alcohol: respuestas.alcohol || false,
        ejercicio: respuestas.ejercicio || false,
        dieta: respuestas.dieta || '',
        sueno: respuestas.sueno || '',
        
        // Motivo de consulta
        motivoConsulta: respuestas['motivo-consulta'] || '',
        duracionSintomas: respuestas['duracion-sintomas'] || '',
        intensidadDolor: respuestas['intensidad-dolor'] || undefined,
        factoresAgravantes: respuestas['factores-agravantes'] || undefined,
        factoresMejorantes: respuestas['factores-mejorantes'] || undefined,
        sintomasAsociados: respuestas['sintomas-asociados'] || undefined,
        inicioSintomas: respuestas['inicio-sintomas'] || '',
        evolucionSintomas: respuestas['evolucion-sintomas'] || '',
        
        // Revisión por sistemas
        sistemaCardiovascular: respuestas['sistema-cardiovascular'] || '',
        sistemaRespiratorio: respuestas['sistema-respiratorio'] || '',
        sistemaDigestivo: respuestas['sistema-digestivo'] || '',
        sistemaNeurologico: respuestas['sistema-neurologico'] || '',
        sistemaMusculoesqueletico: respuestas['sistema-musculoesqueletico'] || '',
      },
      
      // Análisis clínico básico
      analisis: {
        urgencia: this.determinarUrgencia(respuestas),
        alertas: this.generarAlertas(respuestas),
        factoresRiesgo: this.identificarFactoresRiesgo(respuestas),
        recomendaciones: this.generarRecomendaciones(respuestas),
      },
      
      // Validación básica
      validacion: {
        esValida: true,
        completitud: this.calcularCompletitud(respuestas),
        calidad: this.calcularCalidad(respuestas),
        advertencias: [],
      },
      
      // Resúmenes
      resumenMedico: this.generarResumenMedico(respuestas),
      resumenPaciente: this.generarResumenPaciente(respuestas),
    };
  }

  /**
   * Determina la urgencia basada en las respuestas
   */
  private determinarUrgencia(respuestas: Record<string, any>): 'baja' | 'media' | 'alta' | 'crítica' {
    const intensidadDolor = parseInt(respuestas['intensidad-dolor'] || '0');
    const motivoConsulta = respuestas['motivo-consulta']?.toLowerCase() || '';
    
    // Palabras clave de urgencia
    const palabrasUrgencia = ['dolor', 'fiebre', 'sangrado', 'trauma', 'accidente'];
    const tienePalabrasUrgencia = palabrasUrgencia.some(palabra => 
      motivoConsulta.includes(palabra)
    );
    
    if (intensidadDolor >= 8 || tienePalabrasUrgencia) {
      return 'alta';
    } else if (intensidadDolor >= 5) {
      return 'media';
    } else {
      return 'baja';
    }
  }

  /**
   * Genera alertas basadas en las respuestas
   */
  private generarAlertas(respuestas: Record<string, any>): string[] {
    const alertas: string[] = [];
    
    if (respuestas.alergias) {
      alertas.push('Paciente con alergias documentadas');
    }
    
    if (respuestas['medicamentos-actuales']) {
      alertas.push('Paciente bajo medicación actual');
    }
    
    if (respuestas.fuma) {
      alertas.push('Paciente fumador');
    }
    
    const intensidadDolor = parseInt(respuestas['intensidad-dolor'] || '0');
    if (intensidadDolor >= 7) {
      alertas.push('Dolor de intensidad alta reportado');
    }
    
    return alertas;
  }

  /**
   * Identifica factores de riesgo
   */
  private identificarFactoresRiesgo(respuestas: Record<string, any>): string[] {
    const factores: string[] = [];
    
    if (respuestas['diabetes-familiar']) {
      factores.push('Antecedentes familiares de diabetes');
    }
    
    if (respuestas['hipertension-familiar']) {
      factores.push('Antecedentes familiares de hipertensión');
    }
    
    if (respuestas['enfermedades-cardiovasculares']) {
      factores.push('Antecedentes familiares de enfermedades cardiovasculares');
    }
    
    if (respuestas.fuma) {
      factores.push('Tabaquismo');
    }
    
    if (respuestas.alcohol) {
      factores.push('Consumo de alcohol');
    }
    
    return factores;
  }

  /**
   * Genera recomendaciones básicas
   */
  private generarRecomendaciones(respuestas: Record<string, any>): string[] {
    const recomendaciones: string[] = [];
    
    if (!respuestas.ejercicio) {
      recomendaciones.push('Considerar incorporar actividad física regular');
    }
    
    if (respuestas.fuma) {
      recomendaciones.push('Evaluar programa de cesación tabáquica');
    }
    
    if (parseInt(respuestas.sueno || '0') < 6) {
      recomendaciones.push('Evaluar hábitos de sueño');
    }
    
    return recomendaciones;
  }

  /**
   * Calcula la completitud de la anamnesis
   */
  private calcularCompletitud(respuestas: Record<string, any>): number {
    const camposObligatorios = [
      'nombre', 'edad', 'genero', 'motivo-consulta', 'duracion-sintomas'
    ];
    
    const camposCompletados = camposObligatorios.filter(campo => 
      respuestas[campo] && respuestas[campo].toString().trim() !== ''
    );
    
    return Math.round((camposCompletados.length / camposObligatorios.length) * 100);
  }

  /**
   * Calcula la calidad de la anamnesis
   */
  private calcularCalidad(respuestas: Record<string, any>): number {
    let calidad = 70; // Base
    
    // Bonificaciones por información detallada
    if (respuestas['sintomas-asociados']) calidad += 10;
    if (respuestas['factores-agravantes']) calidad += 5;
    if (respuestas['factores-mejorantes']) calidad += 5;
    if (respuestas['alergias-descripcion']) calidad += 5;
    if (respuestas['medicamentos-lista']) calidad += 5;
    
    return Math.min(calidad, 100);
  }

  /**
   * Genera resumen médico
   */
  private generarResumenMedico(respuestas: Record<string, any>): string {
    const edad = respuestas.edad || 'N/A';
    const genero = respuestas.genero || 'N/A';
    const motivo = respuestas['motivo-consulta'] || 'No especificado';
    const duracion = respuestas['duracion-sintomas'] || 'No especificada';
    
    return `Paciente ${edad} años, ${genero}. Motivo de consulta: ${motivo}. Duración: ${duracion}.`;
  }

  /**
   * Genera resumen para paciente
   */
  private generarResumenPaciente(respuestas: Record<string, any>): string {
    const motivo = respuestas['motivo-consulta'] || 'No especificado';
    const duracion = respuestas['duracion-sintomas'] || 'No especificada';
    
    return `Has completado tu anamnesis médica. Motivo de consulta: ${motivo}. Duración de síntomas: ${duracion}.`;
  }
}

// Exportar instancia singleton
export const anamnesisService = AnamnesisService.getInstance(); 