/**
 * API Route para Obtener Resumen de Anamnesis - Altamedica
 * Obtiene el resumen clínico de la anamnesis de un paciente
 */

import { NextRequest, NextResponse } from 'next/server';

// Simulación de base de datos (en producción usar Firebase/Firestore)
const anamnesisDB: any[] = [];

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificación simple de autorización
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token de autorización requerido' },
        { status: 401 }
      );
    }

    const pacienteId = params.id;

    // Validación básica del ID de paciente
    if (!pacienteId) {
      return NextResponse.json(
        { error: 'ID de paciente requerido' },
        { status: 400 }
      );
    }

    // Buscar anamnesis del paciente
    const anamnesis = anamnesisDB.find(a => a.pacienteId === pacienteId);
    
    if (!anamnesis) {
      return NextResponse.json(
        { error: 'Anamnesis no encontrada' },
        { status: 404 }
      );
    }

    // Generar resumen clínico
    const resumen = await generarResumenClinico(anamnesis);

    return NextResponse.json({
      success: true,
      data: resumen
    });

  } catch (error) {
    console.error('Error en GET /api/v1/anamnesis/paciente/[id]/resumen:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * Genera un resumen clínico completo de la anamnesis
 */
async function generarResumenClinico(anamnesis: any) {
  // Simular delay de procesamiento
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const datos = anamnesis.datos;
  const analisis = anamnesis.analisis;
  const validacion = anamnesis.validacion;
  
  // Resumen médico detallado
  const resumenMedico = generarResumenMedicoDetallado(datos, analisis);
  
  // Resumen para paciente
  const resumenPaciente = generarResumenPacienteDetallado(datos, analisis);
  
  // Alertas clínicas
  const alertas = analisis?.alertas || [];
  
  // Recomendaciones específicas
  const recomendaciones = analisis?.recomendaciones || [];
  
  // Factores de riesgo
  const factoresRiesgo = analisis?.factoresRiesgo || [];
  
  // Métricas de calidad
  const metricas = {
    completitud: validacion?.completitud || 0,
    calidad: validacion?.calidad || 0,
    urgencia: analisis?.urgencia || 'baja',
    fechaGeneracion: new Date().toISOString()
  };
  
  // Información de contacto de emergencia
  const contactoEmergencia = {
    telefono: '+54 11 2233-4455',
    horario: '24/7',
    instrucciones: 'En caso de emergencia, contactar inmediatamente'
  };
  
  return {
    resumenMedico,
    resumenPaciente,
    alertas,
    recomendaciones,
    factoresRiesgo,
    metricas,
    contactoEmergencia,
    fechaResumen: new Date().toISOString()
  };
}

/**
 * Genera resumen médico detallado
 */
function generarResumenMedicoDetallado(datos: any, analisis: any): string {
  let resumen = `Paciente ${datos.edad} años, ${datos.genero}. `;
  
  // Motivo de consulta
  resumen += `Motivo de consulta: ${datos.motivoConsulta}. `;
  resumen += `Duración de síntomas: ${datos.duracionSintomas}. `;
  
  // Antecedentes importantes
  if (datos.alergias) {
    resumen += `Alergias: ${datos.alergiasDescripcion || 'Documentadas'}. `;
  }
  
  if (datos.medicamentosActuales) {
    resumen += `Medicación actual: ${datos.medicamentosLista || 'Documentada'}. `;
  }
  
  // Antecedentes familiares relevantes
  const antecedentesFamiliares = [];
  if (datos.antecedentesFamiliares?.diabetes) antecedentesFamiliares.push('diabetes');
  if (datos.antecedentesFamiliares?.hipertension) antecedentesFamiliares.push('hipertensión');
  if (datos.antecedentesFamiliares?.enfermedadesCardiovasculares) antecedentesFamiliares.push('enfermedades cardiovasculares');
  
  if (antecedentesFamiliares.length > 0) {
    resumen += `Antecedentes familiares: ${antecedentesFamiliares.join(', ')}. `;
  }
  
  // Hábitos de vida
  const habitos = [];
  if (datos.fuma) habitos.push('fumador');
  if (datos.alcohol) habitos.push('consumo de alcohol');
  if (datos.ejercicio) habitos.push('actividad física regular');
  
  if (habitos.length > 0) {
    resumen += `Hábitos: ${habitos.join(', ')}. `;
  }
  
  // Análisis clínico
  if (analisis?.urgencia && analisis.urgencia !== 'baja') {
    resumen += `Nivel de urgencia: ${analisis.urgencia}. `;
  }
  
  // Síntomas asociados
  if (datos.sintomasAsociados) {
    resumen += `Síntomas asociados: ${datos.sintomasAsociados}. `;
  }
  
  return resumen.trim();
}

/**
 * Genera resumen para paciente
 */
function generarResumenPacienteDetallado(datos: any, analisis: any): string {
  let resumen = `Has completado tu anamnesis médica. `;
  
  // Información básica
  resumen += `Motivo de consulta: ${datos.motivoConsulta}. `;
  resumen += `Duración de síntomas: ${datos.duracionSintomas}. `;
  
  // Confirmaciones importantes
  if (datos.alergias) {
    resumen += `Se han registrado tus alergias. `;
  }
  
  if (datos.medicamentosActuales) {
    resumen += `Se ha documentado tu medicación actual. `;
  }
  
  // Información sobre calidad
  if (analisis?.urgencia && analisis.urgencia !== 'baja') {
    resumen += `Tu caso requiere atención ${analisis.urgencia === 'alta' ? 'prioritaria' : 'especial'}. `;
  }
  
  // Recomendaciones generales
  if (analisis?.recomendaciones && analisis.recomendaciones.length > 0) {
    resumen += `Recomendaciones: ${analisis.recomendaciones.slice(0, 2).join(', ')}. `;
  }
  
  resumen += `Esta información estará disponible para tu médico en tu próxima consulta.`;
  
  return resumen.trim();
} 