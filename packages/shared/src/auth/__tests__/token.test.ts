import { createAuthToken, verifyAuthToken, refreshAuthToken } from '../token';
import { AUTH_CONSTANTS } from '../constants';

// Mock JWT
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn((payload, secret, options) => 'mock.jwt.token'),
  verify: jest.fn((token, secret, options) => ({
    uid: 'test-uid',
    email: 'test@example.com',
    userType: 'doctor',
    exp: Math.floor(Date.now() / 1000) + 900
  }))
}));

describe('Token Management', () => {
  const mockProfile = {
    uid: 'test-uid',
    email: 'test@example.com',
    userType: 'doctor' as const
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createAuthToken', () => {
    it('should create a JWT token with correct payload', () => {
      const token = createAuthToken(mockProfile);
      
      expect(token).toBe('mock.jwt.token');
      expect(require('jsonwebtoken').sign).toHaveBeenCalledWith(
        expect.objectContaining({
          uid: mockProfile.uid,
          email: mockProfile.email,
          userType: mockProfile.userType,
          exp: expect.any(Number)
        }),
        AUTH_CONSTANTS.JWT_SECRET,
        expect.objectContaining({
          algorithm: AUTH_CONSTANTS.JWT_ALGORITHM
        })
      );
    });

    it('should set token expiration to 15 minutes', () => {
      const now = Math.floor(Date.now() / 1000);
      createAuthToken(mockProfile);
      
      const callArgs = (require('jsonwebtoken').sign as jest.Mock).mock.calls[0][0];
      expect(callArgs.exp).toBeGreaterThan(now);
      expect(callArgs.exp).toBeLessThanOrEqual(now + 900);
    });
  });

  describe('verifyAuthToken', () => {
    it('should verify and return token payload', () => {
      const token = 'valid.jwt.token';
      const result = verifyAuthToken(token);
      
      expect(result).toEqual({
        uid: 'test-uid',
        email: 'test@example.com',
        userType: 'doctor',
        exp: expect.any(Number)
      });
      
      expect(require('jsonwebtoken').verify).toHaveBeenCalledWith(
        token,
        AUTH_CONSTANTS.JWT_SECRET,
        expect.objectContaining({
          algorithms: [AUTH_CONSTANTS.JWT_ALGORITHM]
        })
      );
    });

    it('should throw error for invalid token', () => {
      const jwt = require('jsonwebtoken');
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      expect(() => verifyAuthToken('invalid.token')).toThrow('Token verification failed: Invalid token');
    });
  });

  describe('refreshAuthToken', () => {
    it('should create new token with extended expiry', () => {
      const originalToken = 'original.jwt.token';
      const newToken = refreshAuthToken(originalToken);
      
      expect(newToken).toBe('mock.jwt.token');
      expect(require('jsonwebtoken').verify).toHaveBeenCalledWith(originalToken, AUTH_CONSTANTS.JWT_SECRET, expect.any(Object));
      expect(require('jsonwebtoken').sign).toHaveBeenCalledWith(
        expect.objectContaining({
          uid: 'test-uid',
          email: 'test@example.com',
          userType: 'doctor',
          exp: expect.any(Number)
        }),
        AUTH_CONSTANTS.JWT_SECRET,
        expect.objectContaining({
          algorithm: AUTH_CONSTANTS.JWT_ALGORITHM
        })
      );
    });
  });
}); 