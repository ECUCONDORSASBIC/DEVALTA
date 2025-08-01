import { NextRequest, NextResponse } from 'next/server';
import { getAuthAdmin, getFirestoreAdmin } from '@/lib/firebase-admin';
import { RegisterSchema } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Testing registration process...');
    
    // Check Firebase instances
    const adminAuth = getAuthAdmin();
    const adminDb = getFirestoreAdmin();
    
    console.log('Firebase instances:', {
      auth: !!adminAuth,
      db: !!adminDb
    });
    
    if (!adminAuth || !adminDb) {
      return NextResponse.json({
        success: false,
        error: 'Firebase instances not available',
        details: { auth: !!adminAuth, db: !!adminDb }
      });
    }
    
    const body = await request.json();
    console.log('Request body:', body);
    
    // Validate schema
    try {
      const validatedData = RegisterSchema.parse(body);
      console.log('Validated data:', validatedData);
      
      // Try to create user
      try {
        const userRecord = await adminAuth.createUser({
          email: validatedData.email,
          password: validatedData.password,
          displayName: validatedData.name,
          emailVerified: false,
        });
        
        console.log('User created successfully:', userRecord.uid);
        
        // Try to set custom claims
        await adminAuth.setCustomUserClaims(userRecord.uid, {
          role: validatedData.role,
          altamedicaUser: true,
          createdAt: Date.now(),
        });
        
        console.log('Custom claims set successfully');
        
        // Try to save to Firestore
        const userProfile = {
          uid: userRecord.uid,
          email: validatedData.email,
          name: validatedData.name,
          role: validatedData.role,
          createdAt: new Date(),
          updatedAt: new Date(),
          emailVerified: false,
          isActive: true,
        };
        
        await adminDb.collection('users').doc(userRecord.uid).set(userProfile);
        console.log('User profile saved to Firestore');
        
        return NextResponse.json({
          success: true,
          message: 'Registration test successful',
          user: {
            uid: userRecord.uid,
            email: userRecord.email,
            displayName: userRecord.displayName,
            role: validatedData.role
          }
        });
        
      } catch (authError: any) {
        console.error('Firebase Auth error:', authError);
        return NextResponse.json({
          success: false,
          error: 'Firebase Auth error',
          details: {
            code: authError.code,
            message: authError.message
          }
        });
      }
      
    } catch (validationError: any) {
      console.error('Validation error:', validationError);
      return NextResponse.json({
        success: false,
        error: 'Validation error',
        details: validationError.errors || validationError.message
      });
    }
    
  } catch (error: any) {
    console.error('General error:', error);
    return NextResponse.json({
      success: false,
      error: 'General error',
      details: error.message
    });
  }
}