import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import jwt from 'jsonwebtoken';

// Esquema de validación para login
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar datos de entrada
    const validatedData = loginSchema.parse(body);
    
    // Buscar usuario por email
    const userResult = await query(
      `SELECT 
        id, email, password_hash, role, first_name, last_name, 
        status, phone, date_of_birth, gender,
        medical_license, specialty, years_experience,
        company_name, company_type, tax_id,
        created_at, last_login
      FROM users 
      WHERE email = $1`,
      [validatedData.email]
    );
    
    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }
    
    const user = userResult.rows[0];
    
    // Verificar si el usuario está activo
    if (user.status !== 'active') {
      return NextResponse.json(
        { 
          error: 'Cuenta no activa',
          status: user.status 
        },
        { status: 403 }
      );
    }
    
    // Verificar contraseña
    const passwordValid = await bcrypt.compare(validatedData.password, user.password_hash);
    
    if (!passwordValid) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }
    
    // Actualizar último login
    await query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [user.id]
    );
    
    // Crear token JWT
    const jwtSecret = process.env.JWT_SECRET || 'altamedica_jwt_secret_2024';
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name
      },
      jwtSecret,
      { expiresIn: '24h' }
    );
    
    // Crear log de auditoría
    await query(
      `INSERT INTO audit_logs (
        action, table_name, record_id, user_id, new_values
      ) VALUES ($1, $2, $3, $4, $5)`,
      [
        'LOGIN',
        'users',
        user.id,
        user.id,
        JSON.stringify({ login_time: new Date(), ip_address: request.ip })
      ]
    );
    
    // Respuesta exitosa
    return NextResponse.json({
      success: true,
      message: 'Login exitoso',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name,
        status: user.status,
        phone: user.phone,
        date_of_birth: user.date_of_birth,
        gender: user.gender,
        medical_license: user.medical_license,
        specialty: user.specialty,
        years_experience: user.years_experience,
        company_name: user.company_name,
        company_type: user.company_type,
        tax_id: user.tax_id,
        last_login: user.last_login
      }
    });
    
  } catch (error) {
    console.error('Error en login:', error);
    
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