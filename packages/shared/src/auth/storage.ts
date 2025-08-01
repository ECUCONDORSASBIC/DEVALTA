import { AUTH_CONSTANTS } from './constants';

/**
 * Storage abstraction for authentication tokens and user data
 * Works in both browser (localStorage) and server (in-memory fallback)
 */

// In-memory fallback for server-side
const memoryStorage = new Map<string, string>();

/**
 * Gets a value from storage (localStorage in browser, memory on server)
 */
function getStorageValue(key: string): string | null {
  if (typeof window !== 'undefined' && window.localStorage) {
    return localStorage.getItem(key);
  }
  return memoryStorage.get(key) || null;
}

/**
 * Sets a value in storage (localStorage in browser, memory on server)
 */
function setStorageValue(key: string, value: string): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem(key, value);
  } else {
    memoryStorage.set(key, value);
  }
}

/**
 * Removes a value from storage
 */
function removeStorageValue(key: string): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.removeItem(key);
  } else {
    memoryStorage.delete(key);
  }
}

/**
 * Clears all authentication-related data from storage
 */
function clearAuthStorage(): void {
  const keys = Object.values(AUTH_CONSTANTS.STORAGE_KEYS);
  keys.forEach(key => removeStorageValue(key));
}

// Token storage functions
export const tokenStorage = {
  /**
   * Gets the access token from storage
   */
  getAccessToken(): string | null {
    return getStorageValue(AUTH_CONSTANTS.STORAGE_KEYS.ACCESS_TOKEN);
  },

  /**
   * Sets the access token in storage
   */
  setAccessToken(token: string): void {
    setStorageValue(AUTH_CONSTANTS.STORAGE_KEYS.ACCESS_TOKEN, token);
  },

  /**
   * Removes the access token from storage
   */
  removeAccessToken(): void {
    removeStorageValue(AUTH_CONSTANTS.STORAGE_KEYS.ACCESS_TOKEN);
  },

  /**
   * Gets the refresh token from storage
   */
  getRefreshToken(): string | null {
    return getStorageValue(AUTH_CONSTANTS.STORAGE_KEYS.REFRESH_TOKEN);
  },

  /**
   * Sets the refresh token in storage
   */
  setRefreshToken(token: string): void {
    setStorageValue(AUTH_CONSTANTS.STORAGE_KEYS.REFRESH_TOKEN, token);
  },

  /**
   * Removes the refresh token from storage
   */
  removeRefreshToken(): void {
    removeStorageValue(AUTH_CONSTANTS.STORAGE_KEYS.REFRESH_TOKEN);
  },
};

// User profile storage functions
export const profileStorage = {
  /**
   * Gets the user profile from storage
   */
  getUserProfile(): any | null {
    const profile = getStorageValue(AUTH_CONSTANTS.STORAGE_KEYS.USER_PROFILE);
    return profile ? JSON.parse(profile) : null;
  },

  /**
   * Sets the user profile in storage
   */
  setUserProfile(profile: any): void {
    setStorageValue(AUTH_CONSTANTS.STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  },

  /**
   * Removes the user profile from storage
   */
  removeUserProfile(): void {
    removeStorageValue(AUTH_CONSTANTS.STORAGE_KEYS.USER_PROFILE);
  },
};

// Session storage functions
export const sessionStorage = {
  /**
   * Gets the session ID from storage
   */
  getSessionId(): string | null {
    return getStorageValue(AUTH_CONSTANTS.STORAGE_KEYS.SESSION_ID);
  },

  /**
   * Sets the session ID in storage
   */
  setSessionId(sessionId: string): void {
    setStorageValue(AUTH_CONSTANTS.STORAGE_KEYS.SESSION_ID, sessionId);
  },

  /**
   * Removes the session ID from storage
   */
  removeSessionId(): void {
    removeStorageValue(AUTH_CONSTANTS.STORAGE_KEYS.SESSION_ID);
  },
};

// Cookie helpers (for server-side use)
export const cookieHelpers = {
  /**
   * Parses cookies from a cookie string
   */
  parseCookies(cookieString: string): Record<string, string> {
    const cookies: Record<string, string> = {};
    if (!cookieString) return cookies;

    cookieString.split(';').forEach(cookie => {
      const [name, value] = cookie.split('=').map(c => c.trim());
      if (name && value) {
        cookies[name] = decodeURIComponent(value);
      }
    });

    return cookies;
  },

  /**
   * Creates a cookie string with proper options
   */
  createCookie(name: string, value: string, options: Partial<typeof AUTH_CONSTANTS.COOKIE_CONFIG> = {}): string {
    const config = { ...AUTH_CONSTANTS.COOKIE_CONFIG, ...options };
    let cookie = `${name}=${encodeURIComponent(value)}`;

    if (config.maxAge) {
      cookie += `; Max-Age=${config.maxAge / 1000}`;
    }
    if (config.path) {
      cookie += `; Path=${config.path}`;
    }
    if (config.secure) {
      cookie += '; Secure';
    }
    if (config.httpOnly) {
      cookie += '; HttpOnly';
    }
    if (config.sameSite) {
      cookie += `; SameSite=${config.sameSite}`;
    }

    return cookie;
  },
};

// Main auth storage interface
export const authStorage = {
  ...tokenStorage,
  ...profileStorage,
  ...sessionStorage,
  
  /**
   * Clears all authentication data
   */
  clearAll(): void {
    clearAuthStorage();
  },

  /**
   * Checks if user is authenticated (has valid tokens)
   */
  isAuthenticated(): boolean {
    const accessToken = this.getAccessToken();
    const profile = this.getUserProfile();
    return !!(accessToken && profile);
  },
};
