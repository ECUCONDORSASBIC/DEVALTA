import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

export interface AuthToken {
  userId: string;
  email: string;
  role: string;
  exp: number;
}

export const verifyAuthToken = async (token: string): Promise<AuthToken | null> => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as AuthToken;
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
};

export const generateAuthToken = (payload: Omit<AuthToken, 'exp'>): string => {
  return jwt.sign(payload, process.env.JWT_SECRET || 'fallback-secret', {
    expiresIn: '24h'
  });
};

export const extractTokenFromHeader = (authHeader: string | null): string | null => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice(7);
};

// Add the missing verifyAuth function that many routes are trying to import
export const verifyAuth = async (request: NextRequest): Promise<{ isValid: boolean; user: AuthToken | null }> => {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);
    
    if (!token) {
      return { isValid: false, user: null };
    }

    const user = await verifyAuthToken(token);
    
    if (!user) {
      return { isValid: false, user: null };
    }

    return { isValid: true, user };
  } catch (error) {
    console.error('Auth verification failed:', error);
    return { isValid: false, user: null };
  }
};