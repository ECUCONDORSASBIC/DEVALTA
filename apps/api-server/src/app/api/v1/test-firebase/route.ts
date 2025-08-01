import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

export async function GET(request: NextRequest) {
  try {
    // Test directo de inicialización
    let testResults = {
      serviceAccountPresent: !!process.env.FIREBASE_SERVICE_ACCOUNT,
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKeyLength: process.env.FIREBASE_PRIVATE_KEY?.length || 0,
      existingApps: getApps().length,
      initialized: false,
      error: null as string | null,
      usersCount: null as number | null
    };
    
    try {
      // Intentar parsear el service account JSON
      if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        
        // Inicializar Firebase Admin directamente
        const app = getApps().length > 0 ? getApps()[0] : initializeApp({
          credential: cert({
            projectId: serviceAccount.project_id,
            clientEmail: serviceAccount.client_email,
            privateKey: serviceAccount.private_key
          })
        });
        
        testResults.initialized = true;
        
        // Probar autenticación
        const auth = getAuth(app);
        const listResult = await auth.listUsers(1);
        testResults.usersCount = listResult.users.length;
      }
    } catch (error) {
      testResults.error = error instanceof Error ? error.message : 'Unknown error';
      console.error('Firebase test error:', error);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Firebase Admin SDK Direct Test',
      data: testResults
    });
    
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error testing Firebase Admin'
      },
      { status: 500 }
    );
  }
}