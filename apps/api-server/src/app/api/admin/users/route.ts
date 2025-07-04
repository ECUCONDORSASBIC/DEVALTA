import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/auth';
import { db } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const user = await verifyAuthToken(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar que el usuario es administrador
    const userDoc = await db.collection('users').doc(user.uid).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const userData = userDoc.data();
    if (userData?.role !== 'ADMIN' && !userData?.isAdmin) {
      return NextResponse.json({ error: 'Acceso denegado. Se requieren permisos de administrador' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const role = searchParams.get('role');
    const status = searchParams.get('status');

    // Construir query base
    let usersQuery = db.collection('users');

    // Aplicar filtros
    if (role) {
      usersQuery = usersQuery.where('role', '==', role);
    }

    if (status) {
      usersQuery = usersQuery.where('status', '==', status);
    }

    // Ejecutar query
    const usersSnapshot = await usersQuery
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    // Procesar usuarios
    const users = usersSnapshot.docs.map(doc => {
      const userData = doc.data();
      return {
        id: doc.id,
        email: userData.email || '',
        fullName: userData.fullName || userData.displayName || '',
        role: userData.role || 'USER',
        status: userData.status || 'ACTIVE',
        createdAt: userData.createdAt?.toDate?.() || userData.createdAt,
        lastLogin: userData.lastLoginAt?.toDate?.() || userData.lastLoginAt,
        isVerified: userData.emailVerified || false,
        profilePicture: userData.profilePicture || userData.photoURL,
        metadata: {
          phoneNumber: userData.phoneNumber,
          address: userData.address,
          specialty: userData.specialty,
          company: userData.company
        }
      };
    });

    return NextResponse.json(users);

  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 