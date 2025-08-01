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

// Esquema de validación para crear/actualizar citas
const appointmentSchema = z.object({
  patient_id: z.string().uuid('ID de paciente inválido').optional(),
  doctor_id: z.string().uuid('ID de médico inválido').optional(),
  appointment_date: z.string().datetime('Fecha de cita inválida'),
  duration_minutes: z.number().min(15).max(180).default(30),
  appointment_type: z.enum(['in_person', 'telemedicine', 'follow_up']).default('telemedicine'),
  reason: z.string().min(10, 'La razón debe tener al menos 10 caracteres'),
  notes: z.string().optional(),
  status: z.enum(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled']).default('scheduled'),
  insurance_info: z.object({
    provider: z.string().optional(),
    policy_number: z.string().optional(),
    coverage_percentage: z.number().min(0).max(100).optional(),
  }).optional(),
});

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const authResult = requireAuth()(request);
    if (authResult) {
      return authResult;
    }

    const user = getUserFromRequest(request);
    const { searchParams } = new URL(request.url);
    
    const status = searchParams.get('status');
    const date_from = searchParams.get('date_from');
    const date_to = searchParams.get('date_to');
    const type = searchParams.get('type');

    let queryConditions = [];
    let queryParams = [];
    let paramIndex = 1;

    // Construir condiciones según el rol del usuario
    if (user.role === 'patient') {
      queryConditions.push(`patient_id = $${paramIndex}`);
      queryParams.push(user.id);
      paramIndex++;
    } else if (user.role === 'doctor') {
      queryConditions.push(`doctor_id = $${paramIndex}`);
      queryParams.push(user.id);
      paramIndex++;
    } else if (user.role === 'company') {
      // Las empresas pueden ver citas de sus médicos
      queryConditions.push(`doctor_id IN (
        SELECT id FROM users WHERE company_id = (
          SELECT company_id FROM users WHERE id = $${paramIndex}
        )
      )`);
      queryParams.push(user.id);
      paramIndex++;
    }

    // Agregar filtros adicionales
    if (status) {
      queryConditions.push(`status = $${paramIndex}`);
      queryParams.push(status);
      paramIndex++;
    }

    if (date_from) {
      queryConditions.push(`appointment_date >= $${paramIndex}`);
      queryParams.push(date_from);
      paramIndex++;
    }

    if (date_to) {
      queryConditions.push(`appointment_date <= $${paramIndex}`);
      queryParams.push(date_to);
      paramIndex++;
    }

    if (type) {
      queryConditions.push(`appointment_type = $${paramIndex}`);
      queryParams.push(type);
      paramIndex++;
    }

    const whereClause = queryConditions.length > 0 ? `WHERE ${queryConditions.join(' AND ')}` : '';

    const appointmentsResult = await query(
      `SELECT 
        a.id, a.patient_id, a.doctor_id, a.appointment_date, 
        a.duration_minutes, a.appointment_type, a.reason, a.notes,
        a.status, a.insurance_info, a.created_at, a.updated_at,
        p.first_name as patient_first_name, p.last_name as patient_last_name,
        p.email as patient_email, p.phone as patient_phone,
        d.first_name as doctor_first_name, d.last_name as doctor_last_name,
        d.email as doctor_email, d.specialty as doctor_specialty
      FROM appointments a
      LEFT JOIN users p ON a.patient_id = p.id
      LEFT JOIN users d ON a.doctor_id = d.id
      ${whereClause}
      ORDER BY a.appointment_date DESC`,
      queryParams
    );

    return NextResponse.json({
      success: true,
      appointments: appointmentsResult.rows
    });

  } catch (error) {
    console.error('Error al obtener citas:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

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
    const validatedData = appointmentSchema.parse(body);
    
    // Verificar permisos según el rol
    if (user.role === 'patient') {
      // Los pacientes solo pueden crear citas para sí mismos
      validatedData.patient_id = user.id || undefined;
    } else if (user.role === 'doctor') {
      // Los médicos pueden crear citas para sus pacientes
      if (!validatedData.patient_id) {
        return NextResponse.json(
          { error: 'ID de paciente requerido para médicos' },
          { status: 400 }
        );
      }
      validatedData.doctor_id = user.id || undefined;
    } else if (user.role === 'company') {
      // Las empresas necesitan especificar tanto paciente como médico
      if (!validatedData.patient_id || !validatedData.doctor_id) {
        return NextResponse.json(
          { error: 'ID de paciente y médico requeridos para empresas' },
          { status: 400 }
        );
      }
    }

    // Verificar disponibilidad del médico
    if (validatedData.doctor_id) {
      const availabilityResult = await query(
        `SELECT COUNT(*) as count
         FROM appointments 
         WHERE doctor_id = $1 
         AND appointment_date = $2 
         AND status NOT IN ('cancelled', 'completed')`,
        [validatedData.doctor_id, validatedData.appointment_date]
      );

      if (parseInt(availabilityResult.rows[0].count) > 0) {
        return NextResponse.json(
          { error: 'El médico no está disponible en esa fecha y hora' },
          { status: 409 }
        );
      }
    }

    // Crear cita en transacción
    const result = await transaction(async (client) => {
      const appointmentResult = await client.query(
        `INSERT INTO appointments (
          patient_id, doctor_id, appointment_date, duration_minutes,
          appointment_type, reason, notes, status, insurance_info,
          created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id, patient_id, doctor_id, appointment_date, 
                  duration_minutes, appointment_type, reason, status, created_at`,
        [
          validatedData.patient_id,
          validatedData.doctor_id,
          validatedData.appointment_date,
          validatedData.duration_minutes,
          validatedData.appointment_type,
          validatedData.reason,
          validatedData.notes,
          validatedData.status,
          validatedData.insurance_info ? JSON.stringify(validatedData.insurance_info) : null,
          user.id
        ]
      );

      const appointment = appointmentResult.rows[0];

      // Crear notificación para el médico
      if (validatedData.doctor_id) {
        await client.query(
          `INSERT INTO notifications (
            user_id, type, title, message, related_id, related_type
          ) VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            validatedData.doctor_id,
            'appointment_request',
            'Nueva solicitud de cita',
            `Nueva cita solicitada para ${validatedData.appointment_date}`,
            appointment.id,
            'appointment'
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
          'appointments',
          appointment.id,
          user.id,
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
    console.error('Error al crear cita:', error);
    
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