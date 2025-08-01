import { NextRequest, NextResponse } from 'next/server';
import { SignJWT, jwtVerify } from 'jose';
import { UserType } from '../types/user';
import { AUTH_CONSTANTS } from './constants';

// Cookie configuration for SSO
export const SSO_COOKIE_CONFIG = {
  name: 'altamedica_sso_token',
  domain: process.env.NODE_ENV === 'production' ? '.altamedica.com' : 'localhost',
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 24 * 60 * 60, // 24 hours in seconds
};

// Refresh token cookie config
export const REFRESH_COOKIE_CONFIG = {
  ...SSO_COOKIE_CONFIG,
  name: 'altamedica_refresh_token',
  maxAge: 7 * 24 * 60 * 60, // 7 days
};

interface SSOTokenPayload {
  uid: string;
  email: string;
  userType: UserType;
  roles: string[];
  permissions: string[];
  iat: number;
  exp: number;
}

interface RefreshTokenPayload {
  uid: string;
  tokenId: string;
  iat: number;
  exp: number;
}

/**
 * Creates SSO token with enhanced security
 */
export async function createSSOToken(user: {
  uid: string;
  email: string;
  userType: UserType;
  roles?: string[];
  permissions?: string[];
}): Promise<{ accessToken: string; refreshToken: string }> {
  const secret = new TextEncoder().encode(AUTH_CONSTANTS.JWT_SECRET);
  
  // Create access token (15 minutes)
  const accessToken = await new SignJWT({
    uid: user.uid,
    email: user.email,
    userType: user.userType,
    roles: user.roles || [],
    permissions: user.permissions || [],
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(secret);

  // Create refresh token (7 days)
  const refreshToken = await new SignJWT({
    uid: user.uid,
    tokenId: crypto.randomUUID(),
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);

  return { accessToken, refreshToken };
}

/**
 * Verifies SSO token
 */
export async function verifySSOToken(token: string): Promise<SSOTokenPayload> {
  const secret = new TextEncoder().encode(AUTH_CONSTANTS.JWT_SECRET);
  
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as SSOTokenPayload;
  } catch (error) {
    throw new Error('Invalid or expired SSO token');
  }
}

/**
 * Sets SSO cookies in response
 */
export function setSSOCookies(
  response: NextResponse,
  accessToken: string,
  refreshToken: string
): NextResponse {
  // Set access token cookie
  response.cookies.set({
    ...SSO_COOKIE_CONFIG,
    value: accessToken,
  });

  // Set refresh token cookie
  response.cookies.set({
    ...REFRESH_COOKIE_CONFIG,
    value: refreshToken,
  });

  return response;
}

/**
 * Clears SSO cookies
 */
export function clearSSOCookies(response: NextResponse): NextResponse {
  response.cookies.delete(SSO_COOKIE_CONFIG.name);
  response.cookies.delete(REFRESH_COOKIE_CONFIG.name);
  return response;
}

/**
 * Gets SSO token from request
 */
export function getSSOTokenFromRequest(request: NextRequest): string | null {
  return request.cookies.get(SSO_COOKIE_CONFIG.name)?.value || null;
}

/**
 * Validates user role for specific app
 */
export function validateUserRoleForApp(
  userType: UserType,
  appName: 'patients' | 'doctors' | 'companies' | 'admin'
): boolean {
  const roleMapping: Record<string, UserType[]> = {
    patients: [UserType.PATIENT],
    doctors: [UserType.DOCTOR],
    companies: [UserType.COMPANY],
    admin: [UserType.ADMIN],
  };

  return roleMapping[appName]?.includes(userType) || false;
}

/**
 * Generates redirect URL based on user type
 */
export function getRedirectURLForUserType(userType: UserType): string {
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://altamedica.com' 
    : 'http://localhost';

  const portMapping: Record<UserType, number> = {
    [UserType.PATIENT]: 3003,
    [UserType.DOCTOR]: 3002,
    [UserType.COMPANY]: 3004,
    [UserType.ADMIN]: 3005,
  };

  const port = portMapping[userType] || 3000;
  
  return process.env.NODE_ENV === 'production'
    ? `${baseUrl}/${userType.toLowerCase()}`
    : `${baseUrl}:${port}`;
}