// ARCHIVO MIGRADO - Ver auth/UnifiedAuthSystem.ts
// Este archivo ha sido consolidado en el sistema unificado de autenticación

import { NextRequest, NextResponse } from 'next/server';
import { 
  UnifiedAuthService, 
  type SSOLoginRequest,
  TokenRefreshSchema 
} from '../../auth/UnifiedAuthSystem';

export class AuthController {
  static async ssoLogin(request: NextRequest): Promise<NextResponse> {
    try {
      const body: SSOLoginRequest = await request.json();
      const result = await UnifiedAuthService.ssoLogin(body);
      
      if (result.success) {
        return NextResponse.json({
          success: true,
          data: {
            user: result.user,
            token: result.token,
            refreshToken: result.refreshToken,
            expiresIn: result.expiresIn
          }
        });
      } else {
        return NextResponse.json({
          success: false,
          error: result.error
        }, { status: 400 });
      }
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: 'Error interno del servidor'
      }, { status: 500 });
    }
  }

  static async refreshToken(request: NextRequest): Promise<NextResponse> {
    try {
      const body = await request.json();
      const { refreshToken } = TokenRefreshSchema.parse(body);
      
      const result = await UnifiedAuthService.refreshToken(refreshToken);
      
      if (result.success) {
        return NextResponse.json({
          success: true,
          data: {
            user: result.user,
            token: result.token,
            refreshToken: result.refreshToken,
            expiresIn: result.expiresIn
          }
        });
      } else {
        return NextResponse.json({
          success: false,
          error: result.error
        }, { status: 400 });
      }
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: 'Error interno del servidor'
      }, { status: 500 });
    }
  }

  static async logout(request: NextRequest): Promise<NextResponse> {
    try {
      // Get user from authorization header or request context
      const authHeader = request.headers.get('authorization');
      const token = authHeader?.replace('Bearer ', '');
      
      if (!token) {
        return NextResponse.json({
          success: false,
          error: 'Token requerido'
        }, { status: 400 });
      }

      const user = await UnifiedAuthService.verifyAuthToken(token);
      if (!user) {
        return NextResponse.json({
          success: false,
          error: 'Token inválido'
        }, { status: 401 });
      }

      const result = await UnifiedAuthService.logout(user.userId);
      
      return NextResponse.json({
        success: result.success,
        error: result.error
      });
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: 'Error interno del servidor'
      }, { status: 500 });
    }
  }

  static async getProfile(request: NextRequest): Promise<NextResponse> {
    try {
      const authHeader = request.headers.get('authorization');
      const token = authHeader?.replace('Bearer ', '');
      
      if (!token) {
        return NextResponse.json({
          success: false,
          error: 'Token requerido'
        }, { status: 400 });
      }

      const user = await UnifiedAuthService.verifyAuthToken(token);
      if (!user) {
        return NextResponse.json({
          success: false,
          error: 'Token inválido'
        }, { status: 401 });
      }

      const profile = await UnifiedAuthService.getUserProfile(user.userId);
      
      return NextResponse.json({
        success: true,
        data: profile
      });
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: 'Error interno del servidor'
      }, { status: 500 });
    }
  }
}