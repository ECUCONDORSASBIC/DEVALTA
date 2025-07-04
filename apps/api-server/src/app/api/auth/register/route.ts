import { NextRequest, NextResponse } from 'next/server';
import { query, transaction } from '@/lib/database';
import bcrypt from 'bcrypt';
import { z } from 'zod';

// Esquema de validación para registro
const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  role: z.enum(['patient', 'doctor', 'company'], {
    errorMap: () => ({ message: 'Rol inválido' })
  }),
  first_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  last_name: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar datos de entrada
    const validatedData = registerSchema.parse(body);
    
    // Verificar si el usuario ya existe
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [validatedData.email]
    );
    
    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: 'El email ya está registrado' },
        { status: 409 }
      );
    }
    
    // Hash de la contraseña
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(validatedData.password, saltRounds);
    
    // Crear usuario en transacción
    const result = await transaction(async (client) => {
      // Insertar usuario principal
      const userResult = await client.query(
        `INSERT INTO users (
          email, password_hash, role, first_name, last_name, phone, 
          date_of_birth, gender, medical_license, specialty, years_experience,
          company_name, company_type, tax_id, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING id, email, role, first_name, last_name, status, created_at`,
        [
          validatedData.email,
          passwordHash,
          validatedData.role,
          validatedData.first_name,
          validatedData.last_name,
          validatedData.phone,
          validatedData.date_of_birth ? new Date(validatedData.date_of_birth) : null,
          validatedData.gender,
          validatedData.medical_license,
          validatedData.specialty,
          validatedData.years_experience,
          validatedData.company_name,
          validatedData.company_type,
          validatedData.tax_id,
          null // created_by será null para registros iniciales
        ]
      );
      
      const user = userResult.rows[0];
      
      // Si es paciente, crear perfil médico básico
      if (validatedData.role === 'patient') {
        await client.query(
          `INSERT INTO medical_profiles (
            patient_id, created_by
          ) VALUES ($1, $2)`,
          [user.id, user.id]
        );
      }
      
      // Crear log de auditoría
      await client.query(
        `INSERT INTO audit_logs (
          action, table_name, record_id, user_id, new_values
        ) VALUES ($1, $2, $3, $4, $5)`,
        [
          'CREATE',
          'users',
          user.id,
          user.id,
          JSON.stringify(user)
        ]
      );
      
      return user;
    });
    
    // Respuesta exitosa
    return NextResponse.json({
      success: true,
      message: 'Usuario registrado exitosamente',
      user: {
        id: result.id,
        email: result.email,
        role: result.role,
        first_name: result.first_name,
        last_name: result.last_name,
        status: result.status
      }
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error en registro:', error);
    
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