import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import winston from 'winston';

import { serverConfig } from './config/server.config.js';
import { RoomService } from './services/room.service.js';
import { SocketController } from './controllers/socket.controller.js';
import { authenticateToken, requireRole } from './middleware/auth.middleware.js';

// Configurar logger
const logger = winston.createLogger({
  level: serverConfig.logging.level,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    })
  ]
});

// Crear aplicación Express
const app = express();
const httpServer = createServer(app);

// Middleware
app.use(helmet());
app.use(cors(serverConfig.cors));
app.use(compression());
app.use(express.json());

// Rate limiting
const limiter = rateLimit(serverConfig.rateLimit);
app.use('/api/', limiter);

// Health check
app.get('/health', (_, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
const roomService = new RoomService();

// Crear sala (requiere autenticación)
app.post('/api/rooms', authenticateToken, requireRole(['doctor', 'admin']), async (req, res) => {
  try {
    const { sessionId, appointmentId } = req.body;
    
    if (!sessionId || !appointmentId) {
      return res.status(400).json({ 
        error: 'sessionId and appointmentId are required' 
      });
    }

    const room = await roomService.createRoom(sessionId, appointmentId);
    
    res.json({
      success: true,
      room: {
        id: room.id,
        sessionId: room.sessionId,
        createdAt: room.createdAt
      }
    });
    return;
  } catch (error) {
    logger.error('Error creating room:', error);
    return res.status(500).json({ 
      error: 'Failed to create room' 
    });
  }
});

// Obtener información de sala
app.get('/api/rooms/:roomId', authenticateToken, async (req, res) => {
  try {
    const room = await roomService.getRoom(req.params.roomId);
    
    if (!room) {
      return res.status(404).json({ 
        error: 'Room not found' 
      });
    }

    const participants = await roomService.getRoomParticipants(req.params.roomId);
    
    res.json({
      success: true,
      room: {
        id: room.id,
        sessionId: room.sessionId,
        status: room.status,
        createdAt: room.createdAt,
        participants: participants.map(p => ({
          id: p.id,
          name: p.name,
          role: p.role,
          status: p.status,
          joinedAt: p.joinedAt
        }))
      }
    });
    return;
  } catch (error) {
    logger.error('Error getting room:', error);
    return res.status(500).json({ 
      error: 'Failed to get room information' 
    });
  }
});

// Estadísticas del servidor
app.get('/api/stats', authenticateToken, requireRole(['admin']), async (_, res) => {
  try {
    const stats = await roomService.getRoomStats();
    
    res.json({
      success: true,
      stats: {
        ...stats,
        serverUptime: process.uptime(),
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error getting stats:', error);
    res.status(500).json({ 
      error: 'Failed to get statistics' 
    });
  }
});

// Configurar Socket.IO
const io = new Server(httpServer, {
  cors: serverConfig.cors,
  transports: serverConfig.socketIO.transports as any,
  pingTimeout: serverConfig.socketIO.pingTimeout,
  pingInterval: serverConfig.socketIO.pingInterval,
  maxHttpBufferSize: serverConfig.socketIO.maxHttpBufferSize
});

// Inicializar controlador de sockets
const socketController = new SocketController(io, roomService);

// Manejar conexiones de Socket.IO
io.on('connection', (socket) => {
  socketController.handleConnection(socket);
});

// Limpieza periódica de salas inactivas
setInterval(async () => {
  try {
    await roomService.cleanupInactiveRooms();
  } catch (error) {
    logger.error('Error cleaning up rooms:', error);
  }
}, 60 * 60 * 1000); // Cada hora

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  httpServer.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

// Iniciar servidor
const PORT = serverConfig.port;
httpServer.listen(PORT, () => {
  logger.info(`
    🚀 Altamedica Signaling Server is running!
    📡 Port: ${PORT}
    🔒 Environment: ${serverConfig.environment}
    🏥 WebSocket ready for telemedicine connections
    
    Available endpoints:
    - GET  /health              - Health check
    - POST /api/rooms           - Create new room
    - GET  /api/rooms/:roomId   - Get room info
    - GET  /api/stats           - Server statistics
    
    Socket events:
    - authenticate              - Authenticate socket
    - join-room                 - Join telemedicine room
    - leave-room                - Leave room
    - webrtc-signal             - WebRTC signaling
    - chat-message              - Send chat message
    - toggle-media              - Toggle audio/video
    - vitals-update             - Update vital signs
  `);
});