/**
 * API Route para Anamnesis - Altamedica
 * Maneja las operaciones CRUD de anamnesis
 */

import { NextRequest, NextResponse } from 'next/server';

// Simulación de base de datos (en producción usar Firebase/Firestore)
const anamnesisDB: any[] = [];

export async function GET(request: NextRequest) {
  try {
    // Verificación simple de autorización
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token de autorización requerido' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const pacienteId = searchParams.get('pacienteId');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!pacienteId) {
      return NextResponse.json(
        { error: 'ID de paciente requerido' },
        { status: 400 }
      );
    }

    // Filtrar anamnesis por paciente
    const anamnesisPaciente = anamnesisDB
      .filter(a => a.pacienteId === pacienteId)
      .sort((a, b) => new Date(b.fechaCompletada).getTime() - new Date(a.fechaCompletada).getTime())
      .slice(0, limit);

    return NextResponse.json({
      success: true,
      data: anamnesisPaciente,
      total: anamnesisPaciente.length
    });

  } catch (error) {
    console.error('Error en GET /api/v1/anamnesis:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verificación simple de autorización
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

    // Crear nueva anamnesis
    const nuevaAnamnesis = {
      id: `anamnesis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...anamnesis,
      fechaCompletada: new Date().toISOString(),
      fechaCreacion: new Date().toISOString(),
      fuente: fuente || 'api',
      metadata: metadata || {},
      version: '1.0.0'
    };

    // Agregar a la base de datos simulada
    anamnesisDB.push(nuevaAnamnesis);

    console.log('✅ Anamnesis creada:', nuevaAnamnesis.id);

    return NextResponse.json({
      success: true,
      data: nuevaAnamnesis,
      message: 'Anamnesis creada exitosamente'
    }, { status: 201 });

  } catch (error) {
    console.error('Error en POST /api/v1/anamnesis:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verificación simple de autorización
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token de autorización requerido' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, ...datosActualizados } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID de anamnesis requerido' },
        { status: 400 }
      );
    }

    // Buscar anamnesis existente
    const index = anamnesisDB.findIndex(a => a.id === id);
    
    if (index === -1) {
      return NextResponse.json(
        { error: 'Anamnesis no encontrada' },
        { status: 404 }
      );
    }

    // Actualizar anamnesis
    anamnesisDB[index] = {
      ...anamnesisDB[index],
      ...datosActualizados,
      fechaActualizacion: new Date().toISOString()
    };

    console.log('✅ Anamnesis actualizada:', id);

    return NextResponse.json({
      success: true,
      data: anamnesisDB[index],
      message: 'Anamnesis actualizada exitosamente'
    });

  } catch (error) {
    console.error('Error en PUT /api/v1/anamnesis:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Verificación simple de autorización
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token de autorización requerido' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID de anamnesis requerido' },
        { status: 400 }
      );
    }

    // Buscar y eliminar anamnesis
    const index = anamnesisDB.findIndex(a => a.id === id);
    
    if (index === -1) {
      return NextResponse.json(
        { error: 'Anamnesis no encontrada' },
        { status: 404 }
      );
    }

    const anamnesisEliminada = anamnesisDB.splice(index, 1)[0];

    console.log('✅ Anamnesis eliminada:', id);

    return NextResponse.json({
      success: true,
      data: anamnesisEliminada,
      message: 'Anamnesis eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error en DELETE /api/v1/anamnesis:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 