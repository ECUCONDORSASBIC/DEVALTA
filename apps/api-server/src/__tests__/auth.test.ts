import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { createMocks } from 'node-mocks-http';
import { POST as loginHandler } from '../app/api/v1/auth/login/route';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

// Mock de Firebase
jest.mock('@/lib/firebase-admin', () => ({
  adminAuth: {
    verifyIdToken: jest.fn(),
    createCustomToken: jest.fn(),
  },
  adminDb: {
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn(),
        update: jest.fn(),
      })),
    })),
  },
}));

// Mock de middleware
jest.mock('@/lib/security', () => ({
  withSecurity: (handler: any) => handler,
}));

jest.mock('@/middleware/rateLimiter', () => ({
  withRateLimit: (request: any, rateLimit: any, handler: any) => handler(request),
  authRateLimit: {},
}));

describe('Auth API - Login', () => {
  const mockDecodedToken = {
    uid: 'test-uid-123',
    email: 'test@example.com',
  };

  const mockUserData = {
    firstName: 'Juan',
    lastName: 'Pérez',
    role: 'patient',
    emailVerified: true,
    phoneNumber: '+1234567890',
    isActive: true,
    metadata: {
      signInCount: 5,
    },
  };

  const mockPatientProfile = {
    id: 'test-uid-123',
    firstName: 'Juan',
    lastName: 'Pérez',
    dateOfBirth: '1990-01-01',
    bloodType: 'O+',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('POST /api/v1/auth/login', () => {
    it('should successfully login with valid token', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: {
          idToken: 'valid-firebase-token',
        },
      });

      // Mock Firebase Auth
      jest.mocked(adminAuth.verifyIdToken).mockResolvedValue(mockDecodedToken);
      jest.mocked(adminAuth.createCustomToken).mockResolvedValue('custom-token-123');

      // Mock Firestore
      const mockUserDoc = {
        exists: true,
        data: () => mockUserData,
      };
      const mockPatientDoc = {
        exists: true,
        data: () => mockPatientProfile,
      };

      jest.mocked(adminDb.collection).mockReturnValue({
        doc: jest.fn((docId: string) => ({
          get: jest.fn().mockResolvedValue(
            docId === 'test-uid-123' ? mockUserDoc : mockPatientDoc
          ),
          update: jest.fn().mockResolvedValue(undefined),
        })),
      } as any);

      await loginHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data.user.uid).toBe('test-uid-123');
      expect(data.data.user.email).toBe('test@example.com');
      expect(data.data.user.role).toBe('patient');
      expect(data.data.customToken).toBe('custom-token-123');
    });

    it('should return 404 for non-existent user', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: {
          idToken: 'valid-firebase-token',
        },
      });

      jest.mocked(adminAuth.verifyIdToken).mockResolvedValue(mockDecodedToken);

      const mockUserDoc = {
        exists: false,
        data: () => null,
      };

      jest.mocked(adminDb.collection).mockReturnValue({
        doc: jest.fn(() => ({
          get: jest.fn().mockResolvedValue(mockUserDoc),
          update: jest.fn(),
        })),
      } as any);

      await loginHandler(req, res);

      expect(res._getStatusCode()).toBe(404);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('USER_NOT_FOUND');
    });

    it('should return 403 for inactive user', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: {
          idToken: 'valid-firebase-token',
        },
      });

      jest.mocked(adminAuth.verifyIdToken).mockResolvedValue(mockDecodedToken);

      const mockUserDoc = {
        exists: true,
        data: () => ({ ...mockUserData, isActive: false }),
      };

      jest.mocked(adminDb.collection).mockReturnValue({
        doc: jest.fn(() => ({
          get: jest.fn().mockResolvedValue(mockUserDoc),
          update: jest.fn(),
        })),
      } as any);

      await loginHandler(req, res);

      expect(res._getStatusCode()).toBe(403);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('USER_INACTIVE');
    });

    it('should return 401 for expired token', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: {
          idToken: 'expired-firebase-token',
        },
      });

      jest.mocked(adminAuth.verifyIdToken).mockRejectedValue({
        code: 'auth/id-token-expired',
      });

      await loginHandler(req, res);

      expect(res._getStatusCode()).toBe(401);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('TOKEN_EXPIRED');
    });

    it('should return 401 for invalid token', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: {
          idToken: 'invalid-firebase-token',
        },
      });

      jest.mocked(adminAuth.verifyIdToken).mockRejectedValue({
        code: 'auth/invalid-id-token',
      });

      await loginHandler(req, res);

      expect(res._getStatusCode()).toBe(401);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_TOKEN');
    });

    it('should return 400 for invalid request body', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: {
          // Missing idToken
        },
      });

      await loginHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle doctor role profile', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: {
          idToken: 'valid-firebase-token',
        },
      });

      jest.mocked(adminAuth.verifyIdToken).mockResolvedValue(mockDecodedToken);
      jest.mocked(adminAuth.createCustomToken).mockResolvedValue('custom-token-123');

      const mockUserDoc = {
        exists: true,
        data: () => ({ ...mockUserData, role: 'doctor' }),
      };

      const mockDoctorProfile = {
        id: 'test-uid-123',
        firstName: 'Dr. María',
        lastName: 'García',
        specialty: 'Cardiología',
        license: 'MD123456',
      };

      const mockDoctorDoc = {
        exists: true,
        data: () => mockDoctorProfile,
      };

      jest.mocked(adminDb.collection).mockReturnValue({
        doc: jest.fn((docId: string) => ({
          get: jest.fn().mockResolvedValue(
            docId === 'test-uid-123' ? mockUserDoc : mockDoctorDoc
          ),
          update: jest.fn().mockResolvedValue(undefined),
        })),
      } as any);

      await loginHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.data.user.role).toBe('doctor');
      expect(data.data.roleProfile).toEqual(mockDoctorProfile);
    });

    it('should handle company role profile', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: {
          idToken: 'valid-firebase-token',
        },
      });

      jest.mocked(adminAuth.verifyIdToken).mockResolvedValue(mockDecodedToken);
      jest.mocked(adminAuth.createCustomToken).mockResolvedValue('custom-token-123');

      const mockUserDoc = {
        exists: true,
        data: () => ({ ...mockUserData, role: 'company' }),
      };

      const mockCompanyProfile = {
        id: 'test-uid-123',
        name: 'Hospital General',
        type: 'hospital',
        address: '123 Main St',
      };

      const mockCompanyDoc = {
        exists: true,
        data: () => mockCompanyProfile,
      };

      jest.mocked(adminDb.collection).mockReturnValue({
        doc: jest.fn((docId: string) => ({
          get: jest.fn().mockResolvedValue(
            docId === 'test-uid-123' ? mockUserDoc : mockCompanyDoc
          ),
          update: jest.fn().mockResolvedValue(undefined),
        })),
      } as any);

      await loginHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.data.user.role).toBe('company');
      expect(data.data.roleProfile).toEqual(mockCompanyProfile);
    });

    it('should return 500 for unexpected errors', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: {
          idToken: 'valid-firebase-token',
        },
      });

      jest.mocked(adminAuth.verifyIdToken).mockRejectedValue(new Error('Unexpected error'));

      await loginHandler(req, res);

      expect(res._getStatusCode()).toBe(500);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('LOGIN_FAILED');
    });
  });
}); 