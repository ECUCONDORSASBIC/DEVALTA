/**
 * Thin wrapper around @altamedica/shared/auth module
 * Re-exports shared authentication functions for backward compatibility
 */

import {
  createAuthToken,
  verifyAuthToken,
  refreshAuthToken,
  authStorage,
  AUTH_CONSTANTS,
  UserType
} from '@altamedica/shared';
import { getDashboardUrl } from '../config/app-urls';

// Re-export core functions from shared module
export {
  createAuthToken,
  verifyAuthToken,
  refreshAuthToken,
  authStorage,
  AUTH_CONSTANTS
};

// Re-export types separately
export type { UserType };

// Legacy interface for backward compatibility
interface LegacyAuthToken {
  uid: string;
  email: string;
  userType: UserType;
  firstName?: string;
  lastName?: string;
  emailVerified?: boolean;
  expiresAt?: number;
}

// Legacy functions for backward compatibility
export function saveAuthToken(token: LegacyAuthToken): void {
  // Convert legacy token to JWT and store
  const jwtToken = createAuthToken({
    uid: token.uid,
    email: token.email,
    userType: token.userType
  });
  authStorage.setAccessToken(jwtToken);
  
  // Also save user profile
  authStorage.setUserProfile({
    uid: token.uid,
    email: token.email,
    userType: token.userType,
    firstName: token.firstName,
    lastName: token.lastName,
    emailVerified: token.emailVerified
  });
}

export function getAuthToken(): LegacyAuthToken | null {
  const jwtToken = authStorage.getAccessToken();
  const profile = authStorage.getUserProfile();
  
  if (!jwtToken || !profile) {
    return null;
  }
  
  try {
    const decoded = verifyAuthToken(jwtToken);
    return {
      uid: decoded.uid,
      email: decoded.email,
      userType: decoded.userType,
      firstName: profile.firstName,
      lastName: profile.lastName,
      emailVerified: profile.emailVerified,
      expiresAt: decoded.exp * 1000 // Convert to milliseconds
    };
  } catch (error) {
    // Token is invalid, clear it
    authStorage.clearAll();
    return null;
  }
}

export function clearAuthToken(): void {
  authStorage.clearAll();
}

// Redirect URL management (using session storage for temporary data)
const REDIRECT_KEY = 'altamedica_auth_redirect';

export function saveRedirectUrl(url: string): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(REDIRECT_KEY, url);
  }
}

export function getAndClearRedirectUrl(): string | null {
  if (typeof window === 'undefined') return null;
  
  const url = sessionStorage.getItem(REDIRECT_KEY);
  if (url) {
    sessionStorage.removeItem(REDIRECT_KEY);
  }
  return url;
}

// Enhanced auth redirect with JWT tokens
export async function prepareAuthRedirect(
  userData: {
    uid: string;
    email: string;
    userType: UserType;
    firstName?: string;
    lastName?: string;
    emailVerified?: boolean;
  },
  targetUrl?: string
): Promise<void> {
  // Create JWT token
  const jwtToken = createAuthToken({
    uid: userData.uid,
    email: userData.email,
    userType: userData.userType
  });
  
  // Store token and profile
  authStorage.setAccessToken(jwtToken);
  authStorage.setUserProfile(userData);
  
  // Determine target URL
  const redirectUrl = targetUrl || getDashboardUrl(userData.userType);
  
  // Set cookie for cross-origin requests
  if (typeof document !== 'undefined') {
    document.cookie = `${AUTH_CONSTANTS.STORAGE_KEYS.ACCESS_TOKEN}=${jwtToken}; Path=/; SameSite=Lax; Max-Age=${AUTH_CONSTANTS.SESSION_DURATION}`;
  }
  
  // Perform redirect
  window.location.href = redirectUrl;
}

// Modern hook for authentication state
export function useSharedAuth() {
  const token = getAuthToken();
  const isAuthenticated = authStorage.isAuthenticated();
  
  return {
    isAuthenticated,
    user: token,
    profile: authStorage.getUserProfile(),
    clearAuth: clearAuthToken,
    refreshToken: () => {
      const currentToken = authStorage.getAccessToken();
      if (currentToken) {
        try {
          const newToken = refreshAuthToken(currentToken);
          authStorage.setAccessToken(newToken);
          return true;
        } catch (error) {
          clearAuthToken();
          return false;
        }
      }
      return false;
    }
  };
}
