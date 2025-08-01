import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AuthAgent } from '../../src/auth/index';
import { createMockRequest, createMockResponse } from '../utils/test-helpers';
import jwt from 'jsonwebtoken';

vi.mock('jsonwebtoken');

describe('AuthAgent Unit Tests', () => {
  let authAgent: AuthAgent;
  
  beforeEach(() => {
    authAgent = new AuthAgent({
      port: 3001,
      jwtSecret: 'test-secret',
      tokenExpiry: '1h',
      refreshTokenExpiry: '7d'
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Token Management', () => {
    it('should create a valid JWT token', async () => {
      const userId = 'user123';
      const role = 'doctor';
      const mockToken = 'mock.jwt.token';
      
      vi.mocked(jwt.sign).mockReturnValue(mockToken as any);
      
      const token = await authAgent.createToken(userId, role);
      
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId, role },
        'test-secret',
        { expiresIn: '1h' }
      );
      expect(token).toBe(mockToken);
    });

    it('should verify a valid token', async () => {
      const token = 'valid.jwt.token';
      const decodedToken = { userId: 'user123', role: 'doctor' };
      
      vi.mocked(jwt.verify).mockReturnValue(decodedToken as any);
      
      const result = await authAgent.verifyToken(token);
      
      expect(jwt.verify).toHaveBeenCalledWith(token, 'test-secret');
      expect(result).toEqual(decodedToken);
    });

    it('should throw error for invalid token', async () => {
      const token = 'invalid.jwt.token';
      
      vi.mocked(jwt.verify).mockImplementation(() => {
        throw new Error('Invalid token');
      });
      
      await expect(authAgent.verifyToken(token)).rejects.toThrow('Invalid token');
    });
  });

  describe('Session Management', () => {
    it('should create a new session', async () => {
      const userId = 'user123';
      const sessionData = { ip: '192.168.1.1', userAgent: 'test-browser' };
      
      const session = await authAgent.createSession(userId, sessionData);
      
      expect(session).toHaveProperty('sessionId');
      expect(session).toHaveProperty('userId', userId);
      expect(session).toHaveProperty('createdAt');
      expect(session).toHaveProperty('expiresAt');
    });

    it('should invalidate a session', async () => {
      const sessionId = 'session123';
      
      const result = await authAgent.invalidateSession(sessionId);
      
      expect(result).toBe(true);
      expect(await authAgent.getSession(sessionId)).toBeNull();
    });

    it('should handle session rotation', async () => {
      const oldSessionId = 'old-session';
      const userId = 'user123';
      
      const newSession = await authAgent.rotateSession(oldSessionId, userId);
      
      expect(newSession.sessionId).not.toBe(oldSessionId);
      expect(await authAgent.getSession(oldSessionId)).toBeNull();
    });
  });

  describe('Token Rotation', () => {
    it('should rotate refresh token', async () => {
      const oldRefreshToken = 'old.refresh.token';
      const userId = 'user123';
      
      vi.mocked(jwt.verify).mockReturnValue({ userId } as any);
      vi.mocked(jwt.sign).mockReturnValueOnce('new.access.token' as any)
        .mockReturnValueOnce('new.refresh.token' as any);
      
      const result = await authAgent.rotateTokens(oldRefreshToken);
      
      expect(result).toHaveProperty('accessToken', 'new.access.token');
      expect(result).toHaveProperty('refreshToken', 'new.refresh.token');
    });

    it('should blacklist old refresh token after rotation', async () => {
      const oldRefreshToken = 'old.refresh.token';
      
      vi.mocked(jwt.verify).mockReturnValue({ userId: 'user123' } as any);
      
      await authAgent.rotateTokens(oldRefreshToken);
      
      expect(await authAgent.isTokenBlacklisted(oldRefreshToken)).toBe(true);
    });
  });

  describe('Security Audit', () => {
    it('should log authentication attempts', async () => {
      const logSpy = vi.spyOn(authAgent, 'auditLog');
      
      await authAgent.recordAuthAttempt({
        userId: 'user123',
        success: true,
        ip: '192.168.1.1',
        timestamp: new Date()
      });
      
      expect(logSpy).toHaveBeenCalledWith(expect.objectContaining({
        event: 'AUTH_ATTEMPT',
        userId: 'user123',
        success: true
      }));
    });

    it('should detect and flag suspicious activity', async () => {
      const userId = 'user123';
      
      // Simulate multiple failed attempts
      for (let i = 0; i < 5; i++) {
        await authAgent.recordAuthAttempt({
          userId,
          success: false,
          ip: '192.168.1.1',
          timestamp: new Date()
        });
      }
      
      const isSuspicious = await authAgent.checkSuspiciousActivity(userId);
      expect(isSuspicious).toBe(true);
    });
  });
});
