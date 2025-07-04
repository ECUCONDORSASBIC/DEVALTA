import { NextRequest, NextResponse } from 'next/server';
import { query, transaction } from '@/lib/database';
import { z } from 'zod';
import { verifyToken } from '@/lib/auth';

// Esquemas de validación
const createAppointmentSchema = z.object({
  patient_id: z.string().uuid('ID de paciente inválido'),
  doctor_id: z.string().uuid('ID de doctor inválido'),
  appointment_type: z.enum(['consultation', 'follow_up', 'emergency', 'telemedicine']),
  scheduled_at: z.string().datetime('Fecha y hora inválida'),
  duration_minutes: z.number().min(15).max(240).default(30),
  reason: z.string().optional(),
  symptoms: z.string().optional(),
});

const updateAppointmentSchema = z.object({
  status: z.enum(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show']).optional(),
  scheduled_at: z.string().datetime().optional(),
  duration_minutes: z.number().min(15).max(240).optional(),
  reason: z.string().optional(),
  symptoms: z.string().optional(),
  notes: z.string().optional(),
  actual_start_time: z.string().datetime().optional(),
  actual_end_time: z.string().datetime().optional(),
});

// GET - Obtener citas
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token de autenticación requerido' },
        { status: 401 }
      );
    }
    
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }
    
    // Parámetros de consulta
    const patient_id = searchParams.get('patient_id');
    const doctor_id = searchParams.get('doctor_id');
    const status = searchParams.get('status');
    const date_from = searchParams.get('date_from');
    const date_to = searchParams.get('date_to');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // Construir query base
    let queryText = `
      SELECT 
        a.id, a.patient_id, a.doctor_id, a.appointment_type, a.status,
        a.scheduled_at, a.duration_minutes, a.reason, a.symptoms, a.notes,
        a.actual_start_time, a.actual_end_time, a.created_at, a.updated_at,
        p.first_name as patient_first_name, p.last_name as patient_last_name, p.email as patient_email,
        d.first_name as doctor_first_name, d.last_name as doctor_last_name, d.specialty,
        ts.room_id, ts.status as telemedicine_status
      FROM appointments a
      JOIN users p ON a.patient_id = p.id
      JOIN users d ON a.doctor_id = d.id
      LEFT JOIN telemedicine_sessions ts ON a.id = ts.appointment_id
      WHERE 1=1
    `;
    
    const queryParams: any[] = [];
    let paramIndex = 1;
    
    // Aplicar filtros según el rol del usuario
    if (decoded.role === 'patient') {
      queryText += ` AND a.patient_id = $${paramIndex}`;
      queryParams.push(decoded.userId);
      paramIndex++;
    } else if (decoded.role === 'doctor') {
      queryText += ` AND a.doctor_id = $${paramIndex}`;
      queryParams.push(decoded.userId);
      paramIndex++;
    }
    
    // Filtros adicionales
    if (patient_id) {
      queryText += ` AND a.patient_id = $${paramIndex}`;
      queryParams.push(patient_id);
      paramIndex++;
    }
    
    if (doctor_id) {
      queryText += ` AND a.doctor_id = $${paramIndex}`;
      queryParams.push(doctor_id);
      paramIndex++;
    }
    
    if (status) {
      queryText += ` AND a.status = $${paramIndex}`;
      queryParams.push(status);
      paramIndex++;
    }
    
    if (date_from) {
      queryText += ` AND a.scheduled_at >= $${paramIndex}`;
      queryParams.push(new Date(date_from));
      paramIndex++;
    }
    
    if (date_to) {
      queryText += ` AND a.scheduled_at <= $${paramIndex}`;
      queryParams.push(new Date(date_to));
      paramIndex++;
    }
    
    // Ordenar y paginar
    queryText += ` ORDER BY a.scheduled_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(limit, offset);
    
    const result = await query(queryText, queryParams);
    
    return NextResponse.json({
      success: true,
      appointments: result.rows,
      pagination: {
        limit,
        offset,
        total: result.rows.length
      }
    });
    
  } catch (error) {
    console.error('Error obteniendo citas:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Crear nueva cita
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token de autenticación requerido' },
        { status: 401 }
      );
    }
    
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }
    
    // Validar datos de entrada
    const validatedData = createAppointmentSchema.parse(body);
    
    // Verificar que el usuario tenga permisos para crear la cita
    if (decoded.role === 'patient' && validatedData.patient_id !== decoded.userId) {
      return NextResponse.json(
        { error: 'No tienes permisos para crear citas para otros pacientes' },
        { status: 403 }
      );
    }
    
    // Verificar que el doctor existe y está activo
    const doctorResult = await query(
      'SELECT id, status FROM users WHERE id = $1 AND role = $2',
      [validatedData.doctor_id, 'doctor']
    );
    
    if (doctorResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Doctor no encontrado' },
        { status: 404 }
      );
    }
    
    if (doctorResult.rows[0].status !== 'active') {
      return NextResponse.json(
        { error: 'Doctor no disponible' },
        { status: 400 }
      );
    }
    
    // Verificar disponibilidad del doctor
    const conflictResult = await query(
      `SELECT id FROM appointments 
       WHERE doctor_id = $1 
       AND scheduled_at = $2 
       AND status NOT IN ('cancelled', 'no_show')`,
      [validatedData.doctor_id, new Date(validatedData.scheduled_at)]
    );
    
    if (conflictResult.rows.length > 0) {
      return NextResponse.json(
        { error: 'El doctor no está disponible en ese horario' },
        { status: 409 }
      );
    }
    
    // Crear la cita en transacción
    const result = await transaction(async (client) => {
      const appointmentResult = await client.query(
        `INSERT INTO appointments (
          patient_id, doctor_id, appointment_type, scheduled_at, 
          duration_minutes, reason, symptoms, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *`,
        [
          validatedData.patient_id,
          validatedData.doctor_id,
          validatedData.appointment_type,
          new Date(validatedData.scheduled_at),
          validatedData.duration_minutes,
          validatedData.reason,
          validatedData.symptoms,
          decoded.userId
        ]
      );
      
      const appointment = appointmentResult.rows[0];
      
      // Si es telemedicina, crear sesión
      if (validatedData.appointment_type === 'telemedicine') {
        const roomId = `room_${appointment.id}_${Date.now()}`;
        await client.query(
          `INSERT INTO telemedicine_sessions (
            appointment_id, session_type, room_id, scheduled_start
          ) VALUES ($1, $2, $3, $4)`,
          [
            appointment.id,
            'video',
            roomId,
            new Date(validatedData.scheduled_at)
          ]
        );
      }
      
      // Crear notificación para el paciente
      await client.query(
        `INSERT INTO notifications (
          user_id, type, title, message, priority, data
        ) VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          validatedData.patient_id,
          'appointment_confirmation',
          'Cita Confirmada',
          `Tu cita ha sido programada para ${new Date(validatedData.scheduled_at).toLocaleString()}`,
          'normal',
          JSON.stringify({ appointment_id: appointment.id })
        ]
      );
      
      // Crear log de auditoría
      await client.query(
        `INSERT INTO audit_logs (
          action, table_name, record_id, user_id, new_values
        ) VALUES ($1, $2, $3, $4, $5)`,
        [
          'CREATE',
          'appointments',
          appointment.id,
          decoded.userId,
          JSON.stringify(appointment)
        ]
      );
      
      return appointment;
    });
    
    return NextResponse.json({
      success: true,
      message: 'Cita creada exitosamente',
      appointment: result
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creando cita:', error);
    
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