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
    const { role } = body;

    // Validar rol
    const validRoles = ['ADMIN', 'DOCTOR', 'PATIENT', 'COMPANY', 'MODERATOR'];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Rol inválido' }, { status: 400 });
    }

    // Obtener el usuario a actualizar
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const userData = userDoc.data();

    // No permitir cambiar el rol de otro administrador
    if (userData?.role === 'ADMIN' && user.uid !== userId) {
      return NextResponse.json({ error: 'No se puede cambiar el rol de otro administrador' }, { status: 403 });
    }

    // Actualizar rol
    await userRef.update({
      role,
      updatedAt: new Date(),
      updatedBy: user.uid
    });

    // Crear registro de auditoría
    await db.collection('audit_logs').add({
      type: 'USER_ROLE_UPDATED',
      userId: user.uid,
      targetUserId: userId,
      description: `Rol actualizado de ${userData?.role || 'USER'} a ${role}`,
      timestamp: new Date(),
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      userAgent: request.headers.get('user-agent'),
      metadata: {
        previousRole: userData?.role || 'USER',
        newRole: role
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
      status: updatedData.status || 'ACTIVE',
      createdAt: updatedData.createdAt?.toDate?.() || updatedData.createdAt,
      lastLogin: updatedData.lastLoginAt?.toDate?.() || updatedData.lastLoginAt,
      isVerified: updatedData.emailVerified || false,
      profilePicture: updatedData.profilePicture || updatedData.photoURL,
      metadata: {
        phoneNumber: updatedData.phoneNumber,
        address: updatedData.address,
        specialty: updatedData.specialty,
        company: updatedData.company
      }
    });

  } catch (error) {
    console.error('Error actualizando rol de usuario:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 