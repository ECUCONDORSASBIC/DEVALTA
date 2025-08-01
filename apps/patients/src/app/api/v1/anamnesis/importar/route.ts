/**
 * API Route para Importar Anamnesis desde Juego - Altamedica
 * Maneja la importación de datos de anamnesis desde el juego interactivo
 */

import { NextRequest, NextResponse } from 'next/server';

// Simulación de base de datos (en producción usar Firebase/Firestore)
const anamnesisDB: any[] = [];

export async function POST(request: NextRequest) {
  try {
    // Verificación simple de autorización (en producción usar autenticación real)
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token de autorización requerido' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { anamnesis, fuente, metadata } = body;

    if (!anamnesis || !anamnesis.pacienteId) {
      return NextResponse.json(
        { error: 'Datos de anamnesis requeridos' },
        { status: 400 }
      );
    }

    // Verificar que el paciente existe (simulación)
    // En producción, validar contra base de datos de usuarios
    if (!anamnesis.pacienteId) {
      return NextResponse.json(
        { error: 'ID de paciente inválido' },
        { status: 400 }
      );
    }

    // Verificar si ya existe una anamnesis para este paciente
    const anamnesisExistente = anamnesisDB.find(a => a.pacienteId === anamnesis.pacienteId);
    
    let anamnesisFinal;
    
    if (anamnesisExistente) {
      // Actualizar anamnesis existente
      const index = anamnesisDB.findIndex(a => a.id === anamnesisExistente.id);
      
      anamnesisFinal = {
        ...anamnesisExistente,
        ...anamnesis,
        fechaActualizacion: new Date().toISOString(),
        fechaImportacion: new Date().toISOString(),
        fuente: fuente || 'anamnesis_juego',
        metadata: {
          ...anamnesisExistente.metadata,
          ...metadata,
          ultimaImportacion: new Date().toISOString()
        },
        version: '1.0.0'
      };
      
      anamnesisDB[index] = anamnesisFinal;
      
      console.log('✅ Anamnesis actualizada desde juego:', anamnesisFinal.id);
      
    } else {
      // Crear nueva anamnesis
      anamnesisFinal = {
        id: `anamnesis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...anamnesis,
        fechaCompletada: new Date().toISOString(),
        fechaCreacion: new Date().toISOString(),
        fechaImportacion: new Date().toISOString(),
        fuente: fuente || 'anamnesis_juego',
        metadata: metadata || {
          importadoEn: new Date().toISOString(),
          version: '1.0.0',
          origen: 'juego_anamnesis'
        },
        version: '1.0.0'
      };
      
      anamnesisDB.push(anamnesisFinal);
      
      console.log('✅ Nueva anamnesis importada desde juego:', anamnesisFinal.id);
    }

    // Simular procesamiento adicional
    await procesarAnamnesisImportada(anamnesisFinal);

    return NextResponse.json({
      success: true,
      data: anamnesisFinal,
      message: anamnesisExistente ? 'Anamnesis actualizada desde juego' : 'Anamnesis importada exitosamente',
      metadata: {
        importadoEn: new Date().toISOString(),
        fuente: fuente || 'anamnesis_juego',
        procesado: true
      }
    }, { status: anamnesisExistente ? 200 : 201 });

  } catch (error) {
    console.error('Error en POST /api/v1/anamnesis/importar:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * Procesa la anamnesis importada (análisis clínico, validación, etc.)
 */
async function procesarAnamnesisImportada(anamnesis: any) {
  try {
    console.log('🔍 Procesando anamnesis importada...');
    
    // Simular análisis clínico
    const analisisClinico = await realizarAnalisisClinico(anamnesis);
    
    // Simular validación
    const validacion = await validarAnamnesis(anamnesis);
    
    // Simular generación de resúmenes
    const resumenes = await generarResumenes(anamnesis);
    
    // Actualizar anamnesis con resultados del procesamiento
    const index = anamnesisDB.findIndex(a => a.id === anamnesis.id);
    if (index !== -1) {
      anamnesisDB[index] = {
        ...anamnesisDB[index],
        analisis: analisisClinico,
        validacion: validacion,
        resumenMedico: resumenes.resumenMedico,
        resumenPaciente: resumenes.resumenPaciente,
        procesado: true,
        fechaProcesamiento: new Date().toISOString()
      };
    }
    
    console.log('✅ Anamnesis procesada exitosamente');
    
  } catch (error) {
    console.error('❌ Error al procesar anamnesis:', error);
  }
}

/**
 * Realiza análisis clínico de la anamnesis
 */
async function realizarAnalisisClinico(anamnesis: any) {
  // Simular delay de procesamiento
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const datos = anamnesis.datos;
  const alertas: string[] = [];
  const factoresRiesgo: string[] = [];
  const recomendaciones: string[] = [];
  
  // Análisis de alertas
  if (datos.alergias) {
    alertas.push('Paciente con alergias documentadas');
  }
  
  if (datos.medicamentosActuales) {
    alertas.push('Paciente bajo medicación actual');
  }
  
  if (datos.fuma) {
    alertas.push('Paciente fumador');
    factoresRiesgo.push('Tabaquismo');
  }
  
  const intensidadDolor = parseInt(datos.intensidadDolor || '0');
  if (intensidadDolor >= 7) {
    alertas.push('Dolor de intensidad alta reportado');
  }
  
  // Análisis de factores de riesgo
  if (datos.antecedentesFamiliares?.diabetes) {
    factoresRiesgo.push('Antecedentes familiares de diabetes');
  }
  
  if (datos.antecedentesFamiliares?.hipertension) {
    factoresRiesgo.push('Antecedentes familiares de hipertensión');
  }
  
  if (datos.antecedentesFamiliares?.enfermedadesCardiovasculares) {
    factoresRiesgo.push('Antecedentes familiares de enfermedades cardiovasculares');
  }
  
  // Generar recomendaciones
  if (!datos.ejercicio) {
    recomendaciones.push('Considerar incorporar actividad física regular');
  }
  
  if (datos.fuma) {
    recomendaciones.push('Evaluar programa de cesación tabáquica');
  }
  
  if (parseInt(datos.sueno || '0') < 6) {
    recomendaciones.push('Evaluar hábitos de sueño');
  }
  
  // Determinar urgencia
  let urgencia: 'baja' | 'media' | 'alta' | 'crítica' = 'baja';
  
  if (intensidadDolor >= 8 || alertas.length >= 3) {
    urgencia = 'alta';
  } else if (intensidadDolor >= 5 || alertas.length >= 1) {
    urgencia = 'media';
  }
  
  return {
    urgencia,
    alertas,
    factoresRiesgo,
    recomendaciones,
    fechaAnalisis: new Date().toISOString()
  };
}

/**
 * Valida la anamnesis
 */
async function validarAnamnesis(anamnesis: any) {
  // Simular delay de validación
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const datos = anamnesis.datos;
  const camposObligatorios = [
    'nombre', 'edad', 'genero', 'motivoConsulta', 'duracionSintomas'
  ];
  
  const camposCompletados = camposObligatorios.filter(campo => 
    datos[campo] && datos[campo].toString().trim() !== ''
  );
  
  const completitud = Math.round((camposCompletados.length / camposObligatorios.length) * 100);
  
  // Calcular calidad
  let calidad = 70; // Base
  
  if (datos.sintomasAsociados) calidad += 10;
  if (datos.factoresAgravantes) calidad += 5;
  if (datos.factoresMejorantes) calidad += 5;
  if (datos.alergiasDescripcion) calidad += 5;
  if (datos.medicamentosLista) calidad += 5;
  
  calidad = Math.min(calidad, 100);
  
  const advertencias: string[] = [];
  
  if (completitud < 80) {
    advertencias.push('Anamnesis incompleta - faltan datos importantes');
  }
  
  if (calidad < 70) {
    advertencias.push('Calidad de datos baja - considerar completar información adicional');
  }
  
  return {
    esValida: completitud >= 60 && calidad >= 50,
    completitud,
    calidad,
    advertencias,
    fechaValidacion: new Date().toISOString()
  };
}

/**
 * Genera resúmenes de la anamnesis
 */
async function generarResumenes(anamnesis: any) {
  // Simular delay de generación
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const datos = anamnesis.datos;
  
  // Resumen médico
  const resumenMedico = `Paciente ${datos.edad} años, ${datos.genero}. Motivo de consulta: ${datos.motivoConsulta}. Duración: ${datos.duracionSintomas}. ${datos.alergias ? 'Con alergias documentadas.' : ''} ${datos.medicamentosActuales ? 'Bajo medicación actual.' : ''}`;
  
  // Resumen para paciente
  const resumenPaciente = `Has completado tu anamnesis médica. Motivo de consulta: ${datos.motivoConsulta}. Duración de síntomas: ${datos.duracionSintomas}. ${datos.alergias ? 'Se han registrado tus alergias.' : ''} ${datos.medicamentosActuales ? 'Se ha documentado tu medicación actual.' : ''}`;
  
  return {
    resumenMedico,
    resumenPaciente,
    fechaGeneracion: new Date().toISOString()
  };
} 