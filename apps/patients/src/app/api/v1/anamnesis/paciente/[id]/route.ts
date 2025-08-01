/**
 * API Route para Obtener Anamnesis por Paciente - Altamedica
 * Obtiene la anamnesis específica de un paciente
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

    return NextResponse.json({
      success: true,
      data: anamnesis
    });

  } catch (error) {
    console.error('Error en GET /api/v1/anamnesis/paciente/[id]:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    const body = await request.json();

    // Validación básica del ID de paciente
    if (!pacienteId) {
      return NextResponse.json(
        { error: 'ID de paciente requerido' },
        { status: 400 }
      );
    }

    // Buscar anamnesis existente
    const index = anamnesisDB.findIndex(a => a.pacienteId === pacienteId);
    
    if (index === -1) {
      return NextResponse.json(
        { error: 'Anamnesis no encontrada' },
        { status: 404 }
      );
    }

    // Actualizar anamnesis
    anamnesisDB[index] = {
      ...anamnesisDB[index],
      ...body,
      fechaActualizacion: new Date().toISOString()
    };

    console.log('✅ Anamnesis actualizada:', pacienteId);

    return NextResponse.json({
      success: true,
      data: anamnesisDB[index],
      message: 'Anamnesis actualizada exitosamente'
    });

  } catch (error) {
    console.error('Error en PUT /api/v1/anamnesis/paciente/[id]:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Buscar y eliminar anamnesis
    const index = anamnesisDB.findIndex(a => a.pacienteId === pacienteId);
    
    if (index === -1) {
      return NextResponse.json(
        { error: 'Anamnesis no encontrada' },
        { status: 404 }
      );
    }

    const anamnesisEliminada = anamnesisDB.splice(index, 1)[0];

    console.log('✅ Anamnesis eliminada:', pacienteId);

    return NextResponse.json({
      success: true,
      data: anamnesisEliminada,
      message: 'Anamnesis eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error en DELETE /api/v1/anamnesis/paciente/[id]:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 