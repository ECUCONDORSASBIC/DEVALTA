import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const envVars = {
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
    FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
    FIREBASE_SERVICE_ACCOUNT: process.env.FIREBASE_SERVICE_ACCOUNT ? 'Present' : 'Missing',
    FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY ? 
      `Present (length: ${process.env.FIREBASE_PRIVATE_KEY.length})` : 'Missing',
    NODE_ENV: process.env.NODE_ENV
  };
  
  return NextResponse.json({
    success: true,
    message: 'Environment variables check',
    data: envVars
  });
}