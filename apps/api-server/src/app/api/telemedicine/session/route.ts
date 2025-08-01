import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseConnection } from '@/lib/database';
import { getUserFromRequest, requireAuth } from '@/middleware/auth';
import { z } from 'zod';

// Funciones locales para simular consultas de base de datos
async function query(sql: string, params: any[] = []): Promise<any> {
  try {
    const db = getDatabaseConnection();
    // Simular respuesta de base de datos
    return {
      rows: [
        {
          id: Math.floor(Math.random() * 1000) + 1,
          name: 'Usuario Simulado',
          email: 'usuario@altamedica.com',
          role: 'user',
          status: 'active',
          created_at: new Date().toISOString()
        }
      ]
    };
  } catch (error) {
    console.error('Error en consulta simulada:', error);
    return { rows: [] };
  }
}

async function transaction(callback: (client: any) => Promise<any>): Promise<any> {
  try {
    const db = getDatabaseConnection();
    // Simular transacción
    return await callback(db);
  } catch (error) {
    console.error('Error en transacción simulada:', error);
    throw error;
  }
}

// Esquema de validación para sesiones de telemedicina
const sessionSchema = z.object({
  appointment_id: z.string().uuid('ID de cita inválido'),
  session_type: z.enum(['video', 'audio', 'chat']).default('video'),
  room_config: z.object({
    max_participants: z.number().min(2).max(10).default(2),
    recording_enabled: z.boolean().default(false),
    chat_enabled: z.boolean().default(true),
    screen_sharing_enabled: z.boolean().default(true),
  }).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const authResult = requireAuth()(request);
    if (authResult) {
      return authResult;
    }

    const user = getUserFromRequest(request);
    const body = await request.json();
    
    // Validar datos de entrada
    const validatedData = sessionSchema.parse(body);
    
    // Verificar que la cita existe y el usuario tiene acceso
    const appointmentResult = await query(
      `SELECT 
        id, patient_id, doctor_id, appointment_date, 
        appointment_type, status
      FROM appointments 
      WHERE id = $1`,
      [validatedData.appointment_id]
    );

    if (appointmentResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Cita no encontrada' },
        { status: 404 }
      );
    }

    const appointment = appointmentResult.rows[0];

    // Verificar permisos según el rol
    if (user.role === 'patient' && appointment.patient_id !== user.id) {
      return NextResponse.json(
        { error: 'No tienes permisos para acceder a esta cita' },
        { status: 403 }
      );
    }

    if (user.role === 'doctor' && appointment.doctor_id !== user.id) {
      return NextResponse.json(
        { error: 'No tienes permisos para acceder a esta cita' },
        { status: 403 }
      );
    }

    // Verificar que la cita es de telemedicina
    if (appointment.appointment_type !== 'telemedicine') {
      return NextResponse.json(
        { error: 'Esta cita no es de telemedicina' },
        { status: 400 }
      );
    }

    // Verificar que la cita está confirmada
    if (appointment.status !== 'confirmed' && appointment.status !== 'in_progress') {
      return NextResponse.json(
        { error: 'La cita debe estar confirmada para iniciar la sesión' },
        { status: 400 }
      );
    }

    // Verificar que no hay una sesión activa
    const existingSessionResult = await query(
      `SELECT id, status FROM telemedicine_sessions 
       WHERE appointment_id = $1 AND status IN ('active', 'waiting')`,
      [validatedData.appointment_id]
    );

    if (existingSessionResult.rows.length > 0) {
      return NextResponse.json(
        { error: 'Ya existe una sesión activa para esta cita' },
        { status: 409 }
      );
    }

    // Crear sesión de telemedicina
    const result = await transaction(async (client) => {
      // Generar room ID único
      const roomId = `room_${validatedData.appointment_id}_${Date.now()}`;
      
      const sessionResult = await client.query(
        `INSERT INTO telemedicine_sessions (
          appointment_id, session_type, room_id, room_config,
          status, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, appointment_id, session_type, room_id, 
                  room_config, status, created_at`,
        [
          validatedData.appointment_id,
          validatedData.session_type,
          roomId,
          validatedData.room_config ? JSON.stringify(validatedData.room_config) : null,
          'waiting',
          user.id
        ]
      );

      const session = sessionResult.rows[0];

      // Actualizar estado de la cita a 'in_progress'
      await client.query(
        `UPDATE appointments 
         SET status = 'in_progress', updated_at = NOW()
         WHERE id = $1`,
        [validatedData.appointment_id]
      );

      // Crear notificaciones para ambos participantes
      const participants = [appointment.patient_id, appointment.doctor_id].filter(id => id !== user.id);
      
      for (const participantId of participants) {
        await client.query(
          `INSERT INTO notifications (
            user_id, type, title, message, related_id, related_type
          ) VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            participantId,
            'telemedicine_session_started',
            'Sesión de Telemedicina Iniciada',
            'La sesión de telemedicina ha comenzado. Únete ahora.',
            session.id,
            'telemedicine_session'
          ]
        );
      }

      // Crear log de auditoría
      await client.query(
        `INSERT INTO audit_logs (
          action, table_name, record_id, user_id, new_values
        ) VALUES ($1, $2, $3, $4, $5)`,
        [
          'CREATE',
          'telemedicine_sessions',
          session.id,
          user.id,
          JSON.stringify(session)
        ]
      );

      return session;
    });

    return NextResponse.json({
      success: true,
      message: 'Sesión de telemedicina creada exitosamente',
      session: result,
      roomUrl: `/telemedicine/room/${result.room_id}`
    }, { status: 201 });

  } catch (error) {
    console.error('Error al crear sesión de telemedicina:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Datos de entrada inválidos',
          details: error.errors 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const authResult = requireAuth()(request);
    if (authResult) {
      return authResult;
    }

    const user = getUserFromRequest(request);
    const { searchParams } = new URL(request.url);
    
    const appointment_id = searchParams.get('appointment_id');
    const status = searchParams.get('status');

    if (!appointment_id) {
      return NextResponse.json(
        { error: 'ID de cita requerido' },
        { status: 400 }
      );
    }

    // Verificar permisos
    const appointmentResult = await query(
      `SELECT patient_id, doctor_id FROM appointments WHERE id = $1`,
      [appointment_id]
    );

    if (appointmentResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Cita no encontrada' },
        { status: 404 }
      );
    }

    const appointment = appointmentResult.rows[0];

    if (user.role === 'patient' && appointment.patient_id !== user.id) {
      return NextResponse.json(
        { error: 'No tienes permisos para acceder a esta cita' },
        { status: 403 }
      );
    }

    if (user.role === 'doctor' && appointment.doctor_id !== user.id) {
      return NextResponse.json(
        { error: 'No tienes permisos para acceder a esta cita' },
        { status: 403 }
      );
    }

    // Construir query
    let queryConditions = [`appointment_id = $1`];
    let queryParams = [appointment_id];
    let paramIndex = 2;

    if (status) {
      queryConditions.push(`status = $${paramIndex}`);
      queryParams.push(status);
      paramIndex++;
    }

    const whereClause = queryConditions.join(' AND ');

    const sessionsResult = await query(
      `SELECT 
        id, appointment_id, session_type, room_id, room_config,
        status, started_at, ended_at, duration_minutes,
        created_at, updated_at
      FROM telemedicine_sessions 
      WHERE ${whereClause}
      ORDER BY created_at DESC`,
      queryParams
    );

    return NextResponse.json({
      success: true,
      sessions: sessionsResult.rows
    });

  } catch (error) {
    console.error('Error al obtener sesiones de telemedicina:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}