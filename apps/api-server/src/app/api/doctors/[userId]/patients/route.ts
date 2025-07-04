import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/auth';
import { db } from '@/lib/firebase-admin';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    // Verificar autenticación
    const user = await verifyAuthToken(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { userId } = params;
    const { searchParams } = new URL(request.url);
    
    // Parámetros de filtro
    const search = searchParams.get('search');
    const riskLevel = searchParams.get('riskLevel');
    const isActive = searchParams.get('isActive');

    // Verificar que el usuario accede a sus propios datos
    if (user.uid !== userId) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    // Construir query base
    let patientsQuery = db.collection('patients').where('doctorId', '==', userId);

    // Aplicar filtros
    if (isActive !== null) {
      patientsQuery = patientsQuery.where('isActive', '==', isActive === 'true');
    }

    if (riskLevel) {
      patientsQuery = patientsQuery.where('riskLevel', '==', riskLevel);
    }

    // Ejecutar query
    const patientsSnapshot = await patientsQuery.get();

    // Procesar resultados
    const patients = [];
    for (const doc of patientsSnapshot.docs) {
      const patientData = doc.data();
      
      // Aplicar filtro de búsqueda si existe
      if (search) {
        const searchLower = search.toLowerCase();
        const fullName = patientData.fullName?.toLowerCase() || '';
        const email = patientData.email?.toLowerCase() || '';
        
        if (!fullName.includes(searchLower) && !email.includes(searchLower)) {
          continue;
        }
      }

      // Calcular edad
      const birthDate = new Date(patientData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) 
        ? age - 1 
        : age;

      patients.push({
        id: doc.id,
        fullName: patientData.fullName || '',
        email: patientData.email || '',
        phoneNumber: patientData.phoneNumber || '',
        dateOfBirth: patientData.dateOfBirth,
        age: actualAge,
        gender: patientData.gender || 'OTHER',
        bloodType: patientData.bloodType || '',
        address: patientData.address || '',
        emergencyContact: patientData.emergencyContact || {
          name: '',
          relationship: '',
          phone: ''
        },
        medicalHistory: patientData.medicalHistory || [],
        allergies: patientData.allergies || [],
        medications: patientData.medications || [],
        lastVisit: patientData.lastVisit,
        nextAppointment: patientData.nextAppointment,
        totalVisits: patientData.totalVisits || 0,
        riskLevel: patientData.riskLevel || 'LOW',
        isActive: patientData.isActive !== false,
        createdAt: patientData.createdAt?.toDate?.() || patientData.createdAt
      });
    }

    // Ordenar por nombre
    patients.sort((a, b) => a.fullName.localeCompare(b.fullName));

    return NextResponse.json(patients);

  } catch (error) {
    console.error('Error obteniendo pacientes:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 