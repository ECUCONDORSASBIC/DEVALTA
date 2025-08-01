import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

interface JWTPayload {
  userId: string
  email: string
  role: string
  firstName: string
  lastName: string
  iat: number
  exp: number
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const jwtSecret = process.env.JWT_SECRET || 'altamedica_jwt_secret_2024'
    const decoded = jwt.verify(token, jwtSecret) as JWTPayload
    return decoded
  } catch (error) {
    return null
  }
}

export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.substring(7)
}

export function authMiddleware(
  request: NextRequest,
  allowedRoles?: string[]
): NextResponse | null {
  const authHeader = request.headers.get('authorization')
  const token = extractTokenFromHeader(authHeader)

  if (!token) {
    return NextResponse.json(
      { error: 'Token de autenticación requerido' },
      { status: 401 }
    )
  }

  const decoded = verifyToken(token)
  if (!decoded) {
    return NextResponse.json(
      { error: 'Token inválido o expirado' },
      { status: 401 }
    )
  }

  // Verificar roles si se especifican
  if (allowedRoles && !allowedRoles.includes(decoded.role)) {
    return NextResponse.json(
      { error: 'Acceso denegado. Rol no autorizado' },
      { status: 403 }
    )
  }

  // Agregar información del usuario al request
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-user-id', decoded.userId)
  requestHeaders.set('x-user-email', decoded.email)
  requestHeaders.set('x-user-role', decoded.role)
  requestHeaders.set('x-user-name', `${decoded.firstName} ${decoded.lastName}`)

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

// Middleware específico para roles
export const requireAuth = (allowedRoles?: string[]) => {
  return (request: NextRequest) => authMiddleware(request, allowedRoles)
}

export const requirePatient = () => requireAuth(['patient'])
export const requireDoctor = () => requireAuth(['doctor'])
export const requireCompany = () => requireAuth(['company'])
export const requireAdmin = () => requireAuth(['admin'])

// Helper para obtener información del usuario del request
export function getUserFromRequest(request: NextRequest) {
  return {
    id: request.headers.get('x-user-id'),
    email: request.headers.get('x-user-email'),
    role: request.headers.get('x-user-role'),
    name: request.headers.get('x-user-name'),
  }
}