import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from './auth.service';
import { SSOLoginRequest } from './auth.types';

export class AuthController {
  static async ssoLogin(request: NextRequest): Promise<NextResponse> {
    try {
      const body: SSOLoginRequest = await request.json();
      
      const result = await AuthService.ssoLogin(body);
      
      if (!result.success) {
        return NextResponse.json(
          { success: false, error: result.error }, 
          { status: 401 }
        );
      }

      // Configurar cookies de sesión
      const response = NextResponse.json({
        success: true,
        user: result.user,
        redirectUrl: result.redirectUrl
      });

      // Establecer cookies seguras
      if (result.accessToken) {
        response.cookies.set('auth-token', result.accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // 7 días
          path: '/'
        });
      }

      return response;
    } catch (error) {
      console.error('Error en login controller:', error);
      return NextResponse.json(
        { success: false, error: 'Error interno del servidor' },
        { status: 500 }
      );
    }
  }

  static async refreshToken(request: NextRequest): Promise<NextResponse> {
    try {
      const { refreshToken } = await request.json();
      
      if (!refreshToken) {
        return NextResponse.json(
          { success: false, error: 'Refresh token requerido' },
          { status: 400 }
        );
      }

      const result = await AuthService.refreshToken(refreshToken);
      
      if (!result.success) {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: 401 }
        );
      }

      const response = NextResponse.json({
        success: true,
        accessToken: result.accessToken
      });

      // Actualizar cookie del token
      if (result.accessToken) {
        response.cookies.set('auth-token', result.accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // 7 días
          path: '/'
        });
      }

      return response;
    } catch (error) {
      console.error('Error en refresh token controller:', error);
      return NextResponse.json(
        { success: false, error: 'Error interno del servidor' },
        { status: 500 }
      );
    }
  }

  static async verifyAuth(request: NextRequest): Promise<NextResponse> {
    try {
      const authToken = request.cookies.get('auth-token')?.value;
      
      if (!authToken) {
        return NextResponse.json(
          { success: false, error: 'Token no encontrado' },
          { status: 401 }
        );
      }

      const user = await AuthService.verifyToken(authToken);
      
      if (!user) {
        return NextResponse.json(
          { success: false, error: 'Token inválido' },
          { status: 401 }
        );
      }

      return NextResponse.json({
        success: true,
        user
      });
    } catch (error) {
      console.error('Error en verify auth controller:', error);
      return NextResponse.json(
        { success: false, error: 'Error interno del servidor' },
        { status: 500 }
      );
    }
  }

  static async logout(request: NextRequest): Promise<NextResponse> {
    try {
      const response = NextResponse.json({
        success: true,
        message: 'Sesión cerrada correctamente'
      });

      // Limpiar cookie de autenticación
      response.cookies.delete('auth-token');

      return response;
    } catch (error) {
      console.error('Error en logout controller:', error);
      return NextResponse.json(
        { success: false, error: 'Error interno del servidor' },
        { status: 500 }
      );
    }
  }
}