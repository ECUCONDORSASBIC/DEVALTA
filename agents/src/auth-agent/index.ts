import { BaseAgent, AgentConfig, MetricPoint } from '../shared/BaseAgent.js';
import { AuthConfig, authConfigSchema, loadConfig } from '../shared/config.js';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import axios from 'axios';

interface TokenPayload {
  userId: string;
  email: string;
  roles: string[];
}

interface RefreshToken {
  token: string;
  userId: string;
  expiresAt: Date;
}

interface Session {
  id: string;
  userId: string;
  createdAt: Date;
  lastActive: Date;
  ipAddress: string;
  userAgent: string;
  anomalyScore?: number;
  riskFactors?: string[];
}

interface TokenLeakPattern {
  pattern: RegExp;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface AnomalyScore {
  userId: string;
  score: number;
  factors: string[];
  timestamp: Date;
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const refreshTokenSchema = z.object({
  refreshToken: z.string(),
});

const revokeTokenSchema = z.object({
  token: z.string(),
});

export class AuthAgent extends BaseAgent {
  private config: AuthConfig;
  private refreshTokens: Map<string, RefreshToken> = new Map();
  private sessions: Map<string, Session> = new Map();
  private revokedTokens: Set<string> = new Set();
  private tokenLeakPatterns: TokenLeakPattern[] = [];
  private anomalyScores: Map<string, AnomalyScore> = new Map();
  private userActivityHistory: Map<string, any[]> = new Map();
  private leakDetectionInterval: NodeJS.Timeout | null = null;

  constructor() {
    const config = loadConfig(authConfigSchema, 'auth-agent');
    super(config);
    this.config = config;
    this.initializeTokenLeakPatterns();
    this.startProactiveLeakDetection();
  }

  protected setupCustomRoutes(): void {
    // Authentication routes
    this.app.post('/auth/login', this.handleLogin.bind(this));
    this.app.post('/auth/refresh', this.handleRefresh.bind(this));
    this.app.post('/auth/logout', this.handleLogout.bind(this));
    this.app.post('/auth/revoke', this.handleRevoke.bind(this));
    
    // Token verification routes
    this.app.post('/auth/verify', this.handleVerify.bind(this));
    this.app.get('/auth/validate/:token', this.handleValidate.bind(this));
    
    // Session management
    this.app.get('/auth/sessions', this.handleGetSessions.bind(this));
    this.app.delete('/auth/sessions/:sessionId', this.handleDeleteSession.bind(this));
    
    // User management
    this.app.post('/auth/users', this.handleCreateUser.bind(this));
    this.app.get('/auth/users/:userId', this.handleGetUser.bind(this));
    this.app.put('/auth/users/:userId', this.handleUpdateUser.bind(this));
    
    // Token rotation
    this.app.post('/auth/rotate', this.handleRotateTokens.bind(this));
    
    // Token leak detection
    this.app.post('/auth/check-leak', this.handleCheckTokenLeak.bind(this));
    this.app.get('/auth/leak-patterns', this.handleGetLeakPatterns.bind(this));
    
    // Anomaly scoring
    this.app.get('/auth/anomaly-score/:userId', this.handleGetAnomalyScore.bind(this));
    this.app.get('/auth/anomalies', this.handleGetAnomalies.bind(this));
  }

  private async handleLogin(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = this.validateSchema(loginSchema, req.body);
      
      // Simulate user lookup (in real implementation, this would query a database)
      const user = await this.findUserByEmail(email);
      if (!user || !await bcrypt.compare(password, user.hashedPassword)) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }
      
      // Create tokens
      const accessToken = this.createAccessToken(user);
      const refreshToken = this.createRefreshToken(user.id);
      
      // Create session with anomaly detection
      const session = this.createSession(user.id, req.ip, req.get('User-Agent') || '');
      
      // Calculate anomaly score for this login
      const anomalyScore = await this.calculateAnomalyScore(user.id, {
        ip: req.ip,
        userAgent: req.get('User-Agent') || '',
        timestamp: new Date(),
        action: 'login'
      });
      
      session.anomalyScore = anomalyScore.score;
      session.riskFactors = anomalyScore.factors;
      
      this.recordMetric('auth_login_success', 1, { userId: user.id });
      this.recordMetric('auth_anomaly_score', anomalyScore.score, { userId: user.id });
      this.log('info', 'User logged in successfully', { userId: user.id, email, anomalyScore: anomalyScore.score });
      
      res.json({
        accessToken,
        refreshToken,
        expiresIn: this.config.jwt.expiresIn,
        user: {
          id: user.id,
          email: user.email,
          roles: user.roles,
        },
        session: session.id,
      });
    } catch (error) {
      this.recordMetric('auth_login_error', 1);
      this.log('error', 'Login failed', { error: error.message });
      res.status(400).json({ error: 'Login failed' });
    }
  }

  private async handleRefresh(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = this.validateSchema(refreshTokenSchema, req.body);
      
      const tokenData = this.refreshTokens.get(refreshToken);
      if (!tokenData || tokenData.expiresAt < new Date()) {
        res.status(401).json({ error: 'Invalid refresh token' });
        return;
      }
      
      const user = await this.findUserById(tokenData.userId);
      if (!user) {
        res.status(401).json({ error: 'User not found' });
        return;
      }
      
      // Create new access token
      const newAccessToken = this.createAccessToken(user);
      
      this.recordMetric('auth_token_refresh', 1, { userId: user.id });
      this.log('info', 'Token refreshed', { userId: user.id });
      
      res.json({
        accessToken: newAccessToken,
        expiresIn: this.config.jwt.expiresIn,
      });
    } catch (error) {
      this.recordMetric('auth_refresh_error', 1);
      this.log('error', 'Token refresh failed', { error: error.message });
      res.status(400).json({ error: 'Token refresh failed' });
    }
  }

  private async handleLogout(req: Request, res: Response): Promise<void> {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (token) {
        this.revokedTokens.add(token);
        
        // Remove associated refresh tokens and sessions
        const decoded = jwt.decode(token) as TokenPayload;
        if (decoded?.userId) {
          this.removeUserTokensAndSessions(decoded.userId);
        }
        
        this.recordMetric('auth_logout', 1, { userId: decoded?.userId });
        this.log('info', 'User logged out', { userId: decoded?.userId });
      }
      
      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      this.log('error', 'Logout failed', { error: error.message });
      res.status(400).json({ error: 'Logout failed' });
    }
  }

  private async handleRevoke(req: Request, res: Response): Promise<void> {
    try {
      const { token } = this.validateSchema(revokeTokenSchema, req.body);
      
      this.revokedTokens.add(token);
      
      this.recordMetric('auth_token_revoked', 1);
      this.log('info', 'Token revoked', { token: token.substring(0, 20) + '...' });
      
      res.json({ message: 'Token revoked successfully' });
    } catch (error) {
      this.log('error', 'Token revocation failed', { error: error.message });
      res.status(400).json({ error: 'Token revocation failed' });
    }
  }

  private async handleVerify(req: Request, res: Response): Promise<void> {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        res.status(401).json({ error: 'No token provided' });
        return;
      }
      
      const isValid = this.verifyToken(token);
      if (!isValid) {
        res.status(401).json({ error: 'Invalid token' });
        return;
      }
      
      const decoded = jwt.decode(token) as TokenPayload;
      
      res.json({
        valid: true,
        user: {
          id: decoded.userId,
          email: decoded.email,
          roles: decoded.roles,
        },
      });
    } catch (error) {
      this.log('error', 'Token verification failed', { error: error.message });
      res.status(400).json({ error: 'Token verification failed' });
    }
  }

  private async handleValidate(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.params;
      const isValid = this.verifyToken(token);
      
      res.json({ valid: isValid });
    } catch (error) {
      res.json({ valid: false });
    }
  }

  private async handleGetSessions(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        res.status(400).json({ error: 'User ID required' });
        return;
      }
      
      const userSessions = Array.from(this.sessions.values())
        .filter(session => session.userId === userId)
        .map(session => ({
          id: session.id,
          createdAt: session.createdAt,
          lastActive: session.lastActive,
          ipAddress: session.ipAddress,
          userAgent: session.userAgent,
        }));
      
      res.json({ sessions: userSessions });
    } catch (error) {
      this.log('error', 'Failed to get sessions', { error: error.message });
      res.status(500).json({ error: 'Failed to get sessions' });
    }
  }

  private async handleDeleteSession(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      
      const session = this.sessions.get(sessionId);
      if (!session) {
        res.status(404).json({ error: 'Session not found' });
        return;
      }
      
      this.sessions.delete(sessionId);
      this.log('info', 'Session deleted', { sessionId });
      
      res.json({ message: 'Session deleted successfully' });
    } catch (error) {
      this.log('error', 'Failed to delete session', { error: error.message });
      res.status(500).json({ error: 'Failed to delete session' });
    }
  }

  private async handleCreateUser(req: Request, res: Response): Promise<void> {
    // Implementation for user creation
    res.status(501).json({ error: 'Not implemented' });
  }

  private async handleGetUser(req: Request, res: Response): Promise<void> {
    // Implementation for user retrieval
    res.status(501).json({ error: 'Not implemented' });
  }

  private async handleUpdateUser(req: Request, res: Response): Promise<void> {
    // Implementation for user update
    res.status(501).json({ error: 'Not implemented' });
  }

  private async handleRotateTokens(req: Request, res: Response): Promise<void> {
    try {
      // Rotate JWT secret and invalidate all tokens
      this.revokedTokens.clear();
      this.refreshTokens.clear();
      this.sessions.clear();
      
      this.recordMetric('auth_tokens_rotated', 1);
      this.log('info', 'All tokens rotated');
      
      res.json({ message: 'All tokens rotated successfully' });
    } catch (error) {
      this.log('error', 'Token rotation failed', { error: error.message });
      res.status(500).json({ error: 'Token rotation failed' });
    }
  }

  private createAccessToken(user: any): string {
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      roles: user.roles,
    };
    
    return jwt.sign(payload, this.config.jwt.secret, {
      expiresIn: this.config.jwt.expiresIn,
      algorithm: this.config.jwt.algorithm,
    });
  }

  private createRefreshToken(userId: string): string {
    const token = jwt.sign({ userId }, this.config.jwt.secret, {
      expiresIn: this.config.jwt.refreshExpiresIn,
      algorithm: this.config.jwt.algorithm,
    });
    
    const expiresAt = new Date();
    expiresAt.setTime(expiresAt.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 days
    
    this.refreshTokens.set(token, {
      token,
      userId,
      expiresAt,
    });
    
    return token;
  }

  private createSession(userId: string, ipAddress: string, userAgent: string): Session {
    const session: Session = {
      id: this.generateSessionId(),
      userId,
      createdAt: new Date(),
      lastActive: new Date(),
      ipAddress,
      userAgent,
    };
    
    this.sessions.set(session.id, session);
    return session;
  }

  private verifyToken(token: string): boolean {
    try {
      if (this.revokedTokens.has(token)) {
        return false;
      }
      
      jwt.verify(token, this.config.jwt.secret, { algorithms: [this.config.jwt.algorithm] });
      return true;
    } catch (error) {
      return false;
    }
  }

  private removeUserTokensAndSessions(userId: string): void {
    // Remove refresh tokens
    for (const [token, tokenData] of this.refreshTokens) {
      if (tokenData.userId === userId) {
        this.refreshTokens.delete(token);
      }
    }
    
    // Remove sessions
    for (const [sessionId, session] of this.sessions) {
      if (session.userId === userId) {
        this.sessions.delete(sessionId);
      }
    }
  }

  private generateSessionId(): string {
    return 'sess_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
  
  private initializeTokenLeakPatterns(): void {
    this.tokenLeakPatterns = [
      {
        pattern: /Bearer\s+[A-Za-z0-9\-\._~\+\/]+=*/g,
        description: 'JWT token in HTTP logs',
        severity: 'critical'
      },
      {
        pattern: /eyJ[A-Za-z0-9\-\._~\+\/]+=*/g,
        description: 'JWT token pattern in code',
        severity: 'high'
      },
      {
        pattern: /refresh_token["']?\s*[:=]\s*["']?[A-Za-z0-9\-\._~\+\/]+/g,
        description: 'Refresh token exposure',
        severity: 'critical'
      },
      {
        pattern: /api[_\-]?key["']?\s*[:=]\s*["']?[A-Za-z0-9\-]+/gi,
        description: 'API key exposure',
        severity: 'high'
      }
    ];
  }
  
  private startProactiveLeakDetection(): void {
    // Run leak detection every 5 minutes
    this.leakDetectionInterval = setInterval(() => {
      this.scanForTokenLeaks();
    }, 300000);
    
    // Initial scan
    this.scanForTokenLeaks();
  }
  
  private async scanForTokenLeaks(): Promise<void> {
    try {
      // Scan logs for token patterns
      const leaksDetected: any[] = [];
      
      // Check active tokens against known leak patterns
      for (const [token, tokenData] of this.refreshTokens) {
        for (const pattern of this.tokenLeakPatterns) {
          if (pattern.pattern.test(token)) {
            leaksDetected.push({
              type: 'refresh_token',
              pattern: pattern.description,
              severity: pattern.severity,
              userId: tokenData.userId
            });
            
            // Automatically revoke leaked tokens
            this.refreshTokens.delete(token);
            this.revokedTokens.add(token);
          }
        }
      }
      
      if (leaksDetected.length > 0) {
        this.recordMetric('token_leaks_detected', leaksDetected.length);
        this.log('critical', 'Token leaks detected', { leaks: leaksDetected });
        
        // Notify security team
        this.sendSecurityAlert('Token Leak Detected', leaksDetected);
      }
    } catch (error) {
      this.log('error', 'Token leak scan failed', { error: error.message });
    }
  }
  
  private async calculateAnomalyScore(userId: string, activity: any): Promise<AnomalyScore> {
    const factors: string[] = [];
    let score = 0;
    
    // Get user's activity history
    const history = this.userActivityHistory.get(userId) || [];
    this.userActivityHistory.set(userId, [...history, activity]);
    
    // Factor 1: New IP address
    const knownIps = history.map(h => h.ip).filter(Boolean);
    if (activity.ip && !knownIps.includes(activity.ip)) {
      factors.push('new_ip_address');
      score += 25;
    }
    
    // Factor 2: New user agent
    const knownUserAgents = history.map(h => h.userAgent).filter(Boolean);
    if (activity.userAgent && !knownUserAgents.includes(activity.userAgent)) {
      factors.push('new_user_agent');
      score += 20;
    }
    
    // Factor 3: Unusual time of access
    const hour = new Date(activity.timestamp).getHours();
    if (hour < 6 || hour > 22) {
      factors.push('unusual_time');
      score += 15;
    }
    
    // Factor 4: Rapid succession of logins
    const recentLogins = history.filter(h => 
      h.action === 'login' && 
      (Date.now() - new Date(h.timestamp).getTime()) < 60000
    );
    if (recentLogins.length > 3) {
      factors.push('rapid_logins');
      score += 30;
    }
    
    // Factor 5: Geographic anomaly (simplified)
    if (activity.ip && this.isGeographicAnomaly(userId, activity.ip)) {
      factors.push('geographic_anomaly');
      score += 40;
    }
    
    const anomalyScore: AnomalyScore = {
      userId,
      score: Math.min(score, 100),
      factors,
      timestamp: new Date()
    };
    
    this.anomalyScores.set(userId, anomalyScore);
    
    // Alert on high anomaly scores
    if (score > 70) {
      this.log('warn', 'High anomaly score detected', { userId, score, factors });
      this.sendSecurityAlert('High Anomaly Score', { userId, score, factors });
    }
    
    return anomalyScore;
  }
  
  private isGeographicAnomaly(userId: string, ip: string): boolean {
    // Simplified geographic anomaly detection
    // In production, use GeoIP database
    const history = this.userActivityHistory.get(userId) || [];
    const recentIps = history.slice(-10).map(h => h.ip).filter(Boolean);
    
    // If IP changes frequently, it might be an anomaly
    const uniqueIps = new Set(recentIps);
    return uniqueIps.size > 5;
  }
  
  private async sendSecurityAlert(subject: string, data: any): Promise<void> {
    // Send security alerts through monitoring agent
    try {
      await axios.post('http://localhost:3000/monitoring/alerts', {
        service: 'auth-agent',
        level: 'critical',
        message: subject,
        metadata: data
      });
    } catch (error) {
      this.log('error', 'Failed to send security alert', { error: error.message });
    }
  }
  
  private async handleCheckTokenLeak(req: Request, res: Response): Promise<void> {
    try {
      const { content } = req.body;
      
      if (!content) {
        res.status(400).json({ error: 'Content is required' });
        return;
      }
      
      const leaks: any[] = [];
      
      for (const pattern of this.tokenLeakPatterns) {
        const matches = content.match(pattern.pattern);
        if (matches) {
          leaks.push({
            pattern: pattern.description,
            severity: pattern.severity,
            matches: matches.length,
            sample: matches[0].substring(0, 20) + '...'
          });
        }
      }
      
      if (leaks.length > 0) {
        this.recordMetric('token_leak_check_positive', 1);
      }
      
      res.json({ leaks, detected: leaks.length > 0 });
      
    } catch (error) {
      this.log('error', 'Token leak check failed', { error: error.message });
      res.status(500).json({ error: 'Token leak check failed' });
    }
  }
  
  private async handleGetLeakPatterns(req: Request, res: Response): Promise<void> {
    try {
      const patterns = this.tokenLeakPatterns.map(p => ({
        description: p.description,
        severity: p.severity,
        pattern: p.pattern.source
      }));
      
      res.json({ patterns });
      
    } catch (error) {
      res.status(500).json({ error: 'Failed to get leak patterns' });
    }
  }
  
  private async handleGetAnomalyScore(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      
      const anomalyScore = this.anomalyScores.get(userId);
      if (!anomalyScore) {
        res.status(404).json({ error: 'Anomaly score not found' });
        return;
      }
      
      res.json(anomalyScore);
      
    } catch (error) {
      res.status(500).json({ error: 'Failed to get anomaly score' });
    }
  }
  
  private async handleGetAnomalies(req: Request, res: Response): Promise<void> {
    try {
      const { threshold = 50 } = req.query;
      
      const anomalies = Array.from(this.anomalyScores.values())
        .filter(a => a.score >= Number(threshold))
        .sort((a, b) => b.score - a.score);
      
      res.json({ anomalies });
      
    } catch (error) {
      res.status(500).json({ error: 'Failed to get anomalies' });
    }
  }

  private async findUserByEmail(email: string): Promise<any | null> {
    // Simulate database lookup
    if (email === 'admin@altamedica.com') {
      return {
        id: 'user_1',
        email: 'admin@altamedica.com',
        hashedPassword: await bcrypt.hash('password123', 10),
        roles: ['admin'],
      };
    }
    return null;
  }

  private async findUserById(userId: string): Promise<any | null> {
    // Simulate database lookup
    if (userId === 'user_1') {
      return {
        id: 'user_1',
        email: 'admin@altamedica.com',
        roles: ['admin'],
      };
    }
    return null;
  }

  protected performHealthChecks(): Record<string, boolean> {
    return {
      jwt_secret: !!this.config.jwt.secret,
      database_connection: true, // Simulate database check
      refresh_tokens_count: this.refreshTokens.size < 10000,
      revoked_tokens_count: this.revokedTokens.size < 50000,
    };
  }

  protected getCustomMetrics(): MetricPoint[] {
    return [
      {
        name: 'auth_active_sessions',
        value: this.sessions.size,
        timestamp: new Date().toISOString(),
      },
      {
        name: 'auth_refresh_tokens',
        value: this.refreshTokens.size,
        timestamp: new Date().toISOString(),
      },
      {
        name: 'auth_revoked_tokens',
        value: this.revokedTokens.size,
        timestamp: new Date().toISOString(),
      },
    ];
  }
  
  public async stop(): Promise<void> {
    if (this.leakDetectionInterval) {
      clearInterval(this.leakDetectionInterval);
      this.leakDetectionInterval = null;
    }
    
    await super.stop();
  }
}

// Start the agent if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const agent = new AuthAgent();
  agent.start().catch(console.error);
  
  // Graceful shutdown
  process.on('SIGTERM', () => agent.stop());
  process.on('SIGINT', () => agent.stop());
}
