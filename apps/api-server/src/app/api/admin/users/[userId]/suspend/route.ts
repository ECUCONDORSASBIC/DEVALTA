import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { db } from '@/lib/firebase-admin';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    // Verificar autenticación
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar que el usuario es administrador
    const adminDoc = await db.collection('users').doc(user.uid).get();
    if (!adminDoc.exists) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const adminData = adminDoc.data();
    if (adminData?.role !== 'ADMIN' && !adminData?.isAdmin) {
      return NextResponse.json({ error: 'Acceso denegado. Se requieren permisos de administrador' }, { status: 403 });
    }

    const { userId } = params;
    const body = await request.json();
    const { reason } = body;

    if (!reason) {
      return NextResponse.json({ error: 'Se requiere una razón para la suspensión' }, { status: 400 });
    }

    // Obtener el usuario a suspender
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const userData = userDoc.data();

    // No permitir suspender administradores
    if (userData?.role === 'ADMIN') {
      return NextResponse.json({ error: 'No se puede suspender a un administrador' }, { status: 403 });
    }

    // No permitir suspender el propio usuario
    if (user.uid === userId) {
      return NextResponse.json({ error: 'No se puede suspender su propia cuenta' }, { status: 400 });
    }

    // Actualizar estado
    await userRef.update({
      status: 'SUSPENDED',
      suspendedAt: new Date(),
      suspendedBy: user.uid,
      suspensionReason: reason,
      updatedAt: new Date()
    });

    // Crear registro de auditoría
    await db.collection('audit_logs').add({
      type: 'USER_SUSPENDED',
      userId: user.uid,
      targetUserId: userId,
      description: `Usuario suspendido: ${reason}`,
      timestamp: new Date(),
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      userAgent: request.headers.get('user-agent'),
      metadata: {
        reason,
        previousStatus: userData?.status || 'ACTIVE'
      }
    });

    // Obtener datos actualizados
    const updatedDoc = await userRef.get();
    const updatedData = updatedDoc.data();

    return NextResponse.json({
      id: userId,
      email: updatedData.email || '',
      fullName: updatedData.fullName || updatedData.displayName || '',
      role: updatedData.role,
      status: updatedData.status,
      createdAt: updatedData.createdAt?.toDate?.() || updatedData.createdAt,
      lastLogin: updatedData.lastLoginAt?.toDate?.() || updatedData.lastLoginAt,
      isVerified: updatedData.emailVerified || false,
      profilePicture: updatedData.profilePicture || updatedData.photoURL,
      suspendedAt: updatedData.suspendedAt?.toDate?.() || updatedData.suspendedAt,
      suspensionReason: updatedData.suspensionReason,
      metadata: {
        phoneNumber: updatedData.phoneNumber,
        address: updatedData.address,
        specialty: updatedData.specialty,
        company: updatedData.company
      }
    });

  } catch (error) {
    console.error('Error suspendiendo usuario:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 