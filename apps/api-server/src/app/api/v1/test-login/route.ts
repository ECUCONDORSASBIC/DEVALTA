import { NextRequest, NextResponse } from 'next/server';
import { getAuthAdmin } from '@/lib/firebase-admin';

// Este endpoint simula lo que haría el frontend para obtener un ID token
export async function POST(request: NextRequest) {
  try {
    const adminAuth = getAuthAdmin();
    
    if (!adminAuth) {
      return NextResponse.json({
        success: false,
        error: 'Firebase Auth not available'
      });
    }
    
    const body = await request.json();
    const { email, password } = body;
    
    // En un escenario real, esto se haría desde el frontend con Firebase Client SDK
    // Para testing, vamos a usar el custom token que tenemos del registro
    
    // Buscar el usuario por email
    const userRecord = await adminAuth.getUserByEmail(email);
    
    if (!userRecord) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Generar un custom token para simular autenticación
    const customToken = await adminAuth.createCustomToken(userRecord.uid);
    
    return NextResponse.json({
      success: true,
      message: 'Test login token generated',
      data: {
        uid: userRecord.uid,
        email: userRecord.email,
        customToken,
        note: 'En producción, esto se haría desde el frontend con Firebase Client SDK'
      }
    });
    
  } catch (error: any) {
    console.error('Test login error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    });
  }
}