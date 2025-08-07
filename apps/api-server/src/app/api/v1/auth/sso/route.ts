import { NextRequest, NextResponse } from 'next/server'
import { AuthController } from '@/domains/auth/auth.controller'

export async function POST(request: NextRequest) {
  return AuthController.ssoLogin(request);
}

export async function GET(request: NextRequest) {
  return AuthController.verifyAuth(request);
}

export async function DELETE(request: NextRequest) {
  return AuthController.logout(request);
}