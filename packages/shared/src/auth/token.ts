import jwt from 'jsonwebtoken';
import { AUTH_CONSTANTS } from './constants';
import { UserType } from '../types/user';

interface TokenPayload {
  uid: string;
  email: string;
  userType: UserType;
  exp: number;
}

/**
 * Creates a JWT token using the user profile data
 *
 * @param profile - An object containing user information such as uid, email, and userType
 * @returns A string which is a signed JWT token
 */
export function createAuthToken(profile: { uid: string; email: string; userType: UserType }): string {
  const payload = {
    uid: profile.uid,
    email: profile.email,
    userType: profile.userType,
    exp: Math.floor(Date.now() / 1000) + 60 * 15, // Token valid for 15 minutes
  };
  return jwt.sign(payload, AUTH_CONSTANTS.JWT_SECRET, { algorithm: AUTH_CONSTANTS.JWT_ALGORITHM });
}

/**
 * Verifies a JWT token and extracts the payload
 *
 * @param token - The JWT token to verify
 * @returns The decoded TokenPayload if valid, or throws an error if invalid
 */
export function verifyAuthToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, AUTH_CONSTANTS.JWT_SECRET, { algorithms: [AUTH_CONSTANTS.JWT_ALGORITHM] }) as TokenPayload;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Token verification failed: ${errorMessage}`);
  }
}

/**
 * Refreshes a JWT token before expiration
 *
 * @param token - The original JWT token
 * @returns A new JWT token with refreshed expiry
 */
export function refreshAuthToken(token: string): string {
  const decoded = verifyAuthToken(token);

  // Create a new token with extended expiry
  const newPayload = {
    ...decoded,
    exp: Math.floor(Date.now() / 1000) + 60 * 15, // Refresh token valid for another 15 minutes
  };

  return jwt.sign(newPayload, AUTH_CONSTANTS.JWT_SECRET, { algorithm: AUTH_CONSTANTS.JWT_ALGORITHM });
}

