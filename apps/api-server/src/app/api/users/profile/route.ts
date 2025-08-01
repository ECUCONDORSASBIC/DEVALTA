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

// Esquema de validación para actualizar perfil
const updateProfileSchema = z.object({
  first_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').optional(),
  last_name: z.string().min(2, 'El apellido debe tener al menos 2 caracteres').optional(),
  phone: z.string().optional(),
  date_of_birth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
  
  // Campos específicos para médicos
  medical_license: z.string().optional(),
  specialty: z.string().optional(),
  years_experience: z.number().optional(),
  
  // Campos específicos para empresas
  company_name: z.string().optional(),
  company_type: z.string().optional(),
  tax_id: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const authResult = requireAuth()(request);
    if (authResult) {
      return authResult;
    }

    const user = getUserFromRequest(request);
    
    if (!user.id) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Obtener perfil completo del usuario
    const userResult = await query(
      `SELECT 
        id, email, role, first_name, last_name, 
        status, phone, date_of_birth, gender,
        medical_license, specialty, years_experience,
        company_name, company_type, tax_id,
        created_at, last_login
      FROM users 
      WHERE id = $1`,
      [user.id]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    const userData = userResult.rows[0];

    // Obtener datos adicionales según el rol
    let additionalData = {};

    if (userData.role === 'patient') {
      // Obtener perfil médico del paciente
      const medicalProfileResult = await query(
        `SELECT 
          id, blood_type, allergies, chronic_conditions,
          emergency_contact_name, emergency_contact_phone,
          insurance_provider, insurance_number,
          created_at, updated_at
        FROM medical_profiles 
        WHERE patient_id = $1`,
        [user.id]
      );

      if (medicalProfileResult.rows.length > 0) {
        additionalData = medicalProfileResult.rows[0];
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        ...userData,
        ...additionalData
      }
    });

  } catch (error) {
    console.error('Error al obtener perfil:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verificar autenticación
    const authResult = requireAuth()(request);
    if (authResult) {
      return authResult;
    }

    const user = getUserFromRequest(request);
    const body = await request.json();
    
    // Validar datos de entrada
    const validatedData = updateProfileSchema.parse(body);
    
    if (!user.id) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Construir query de actualización dinámicamente
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramIndex = 1;

    Object.entries(validatedData).forEach(([key, value]) => {
      if (value !== undefined) {
        updateFields.push(`${key} = $${paramIndex}`);
        updateValues.push(value);
        paramIndex++;
      }
    });

    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: 'No hay campos para actualizar' },
        { status: 400 }
      );
    }

    // Agregar ID del usuario al final
    updateValues.push(user.id);

    // Actualizar usuario
    const updateQuery = `
      UPDATE users 
      SET ${updateFields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramIndex}
      RETURNING id, email, role, first_name, last_name, status, updated_at
    `;

    const result = await query(updateQuery, updateValues);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Crear log de auditoría
    await query(
      `INSERT INTO audit_logs (
        action, table_name, record_id, user_id, new_values
      ) VALUES ($1, $2, $3, $4, $5)`,
      [
        'UPDATE',
        'users',
        user.id,
        user.id,
        JSON.stringify(validatedData)
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      user: result.rows[0]
    });

  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    
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