import { NextRequest, NextResponse } from 'next/server';
import { MemoryDB } from '@/lib/memory-db';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Solicitud de estadísticas de usuarios');
    
    const stats = MemoryDB.getStats();
    const allUsers = MemoryDB.getAllUsers();
    
    // Preparar datos para respuesta (sin contraseñas)
    const usersData = allUsers.map(user => ({
      id: user.id,
      email: user.email,
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone,
      medical_license: user.medical_license,
      specialty: user.specialty,
      company_name: user.company_name,
      status: user.status,
      created_at: user.created_at,
      last_login: user.last_login
    }));
    
    const response = {
      success: true,
      data: {
        stats,
        users: usersData,
        timestamp: new Date().toISOString()
      }
    };
    
    console.log('✅ Estadísticas enviadas:', stats);
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}