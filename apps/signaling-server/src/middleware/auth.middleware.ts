import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { serverConfig } from '../config/server.config.js';
import { User } from '../types/index.js';

export interface AuthRequest extends Request {
  user?: User;
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        error: 'Access token required',
        code: 'NO_TOKEN' 
      });
    }

    jwt.verify(token, serverConfig.jwt.secret, (err, decoded) => {
      if (err) {
        return res.status(403).json({ 
          error: 'Invalid or expired token',
          code: 'INVALID_TOKEN' 
        });
      }

      req.user = decoded as User;
      next();
    });
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ 
      error: 'Authentication failed',
      code: 'AUTH_ERROR' 
    });
  }
};

export const authenticateSocketToken = async (token: string): Promise<User | null> => {
  try {
    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, serverConfig.jwt.secret) as User;
    return decoded;
  } catch (error) {
    console.error('Socket authentication error:', error);
    return null;
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'NO_AUTH' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        code: 'FORBIDDEN' 
      });
    }

    next();
  };
};