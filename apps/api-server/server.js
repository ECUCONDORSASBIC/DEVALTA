const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3002', 'http://localhost:3003'],
  credentials: true
}));

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    service: 'altamedica-api-server'
  });
});

// Mock data para telemedicina
const mockSessions = [
  {
    id: '1',
    roomId: 'room-1',
    patientId: 'patient-1',
    doctorId: 'doctor-1',
    status: 'waiting',
    scheduledAt: new Date(Date.now() + 3600000),
    notes: 'Consulta de seguimiento'
  },
  {
    id: '2',
    roomId: 'room-2',
    patientId: 'patient-1',
    doctorId: 'doctor-2',
    status: 'active',
    scheduledAt: new Date(),
    startedAt: new Date(),
    notes: 'Consulta urgente'
  },
  {
    id: '3',
    roomId: 'room-3',
    patientId: 'patient-1',
    doctorId: 'doctor-3',
    status: 'completed',
    scheduledAt: new Date(Date.now() - 86400000),
    startedAt: new Date(Date.now() - 86400000 + 300000),
    endedAt: new Date(Date.now() - 86400000 + 1800000),
    duration: 25,
    notes: 'Revisión general'
  }
];

// Endpoints de telemedicina
app.get('/api/telemedicine/sessions', (req, res) => {
  try {
    const { status, doctorId, patientId } = req.query;
    
    let filteredSessions = [...mockSessions];
    
    if (status) {
      filteredSessions = filteredSessions.filter(s => s.status === status);
    }
    
    if (doctorId) {
      filteredSessions = filteredSessions.filter(s => s.doctorId === doctorId);
    }
    
    if (patientId) {
      filteredSessions = filteredSessions.filter(s => s.patientId === patientId);
    }
    
    res.json({
      success: true,
      sessions: filteredSessions,
      total: filteredSessions.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/telemedicine/sessions/:id', (req, res) => {
  try {
    const { id } = req.params;
    const session = mockSessions.find(s => s.id === id);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Sesión no encontrada'
      });
    }
    
    res.json(session);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/telemedicine/sessions', (req, res) => {
  try {
    const { doctorId, patientId, notes, scheduledAt } = req.body;
    
    const newSession = {
      id: `session-${Date.now()}`,
      roomId: `room-${Date.now()}`,
      patientId,
      doctorId,
      status: 'scheduled',
      scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date(),
      notes: notes || ''
    };
    
    mockSessions.unshift(newSession);
    
    res.status(201).json(newSession);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.put('/api/telemedicine/sessions/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const sessionIndex = mockSessions.findIndex(s => s.id === id);
    
    if (sessionIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Sesión no encontrada'
      });
    }
    
    mockSessions[sessionIndex] = {
      ...mockSessions[sessionIndex],
      ...updates
    };
    
    res.json(mockSessions[sessionIndex]);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/telemedicine/sessions/:id/cancel', (req, res) => {
  try {
    const { id } = req.params;
    const sessionIndex = mockSessions.findIndex(s => s.id === id);
    
    if (sessionIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Sesión no encontrada'
      });
    }
    
    mockSessions[sessionIndex].status = 'cancelled';
    
    res.json({
      success: true,
      session: mockSessions[sessionIndex]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.put('/api/telemedicine/sessions/:id/start', (req, res) => {
  try {
    const { id } = req.params;
    const sessionIndex = mockSessions.findIndex(s => s.id === id);
    
    if (sessionIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Sesión no encontrada'
      });
    }
    
    mockSessions[sessionIndex].status = 'active';
    mockSessions[sessionIndex].startedAt = new Date();
    
    res.json(mockSessions[sessionIndex]);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.put('/api/telemedicine/sessions/:id/end', (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const sessionIndex = mockSessions.findIndex(s => s.id === id);
    
    if (sessionIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Sesión no encontrada'
      });
    }
    
    mockSessions[sessionIndex].status = 'completed';
    mockSessions[sessionIndex].endedAt = new Date();
    if (notes) {
      mockSessions[sessionIndex].notes = notes;
    }
    
    res.json(mockSessions[sessionIndex]);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Chat endpoints
app.get('/api/telemedicine/sessions/:id/chat', (req, res) => {
  try {
    const { id } = req.params;
    
    // Mock chat messages
    const chatMessages = [
      {
        id: '1',
        senderId: 'doctor-1',
        senderType: 'doctor',
        message: 'Hola, ¿cómo se siente hoy?',
        timestamp: new Date(Date.now() - 300000)
      },
      {
        id: '2',
        senderId: 'patient-1',
        senderType: 'patient',
        message: 'Hola doctor, me siento mejor, gracias',
        timestamp: new Date(Date.now() - 240000)
      }
    ];
    
    res.json(chatMessages);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/telemedicine/sessions/:id/chat', (req, res) => {
  try {
    const { id } = req.params;
    const { senderId, senderType, message } = req.body;
    
    const newMessage = {
      id: `msg-${Date.now()}`,
      senderId,
      senderType,
      message,
      timestamp: new Date()
    };
    
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Auth endpoints (mock)
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Mock authentication
    if (email && password) {
      res.json({
        success: true,
        token: 'mock-jwt-token-' + Date.now(),
        user: {
          id: 'user-1',
          email,
          name: 'Usuario Demo',
          role: 'patient'
        }
      });
    } else {
      res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'AltaMedica API Server',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      telemedicine: '/api/telemedicine/sessions',
      auth: '/api/auth/login'
    }
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint no encontrado'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 AltaMedica API Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API Base: http://localhost:${PORT}/api`);
  console.log(`📝 Telemedicine: http://localhost:${PORT}/api/telemedicine/sessions`);
});

module.exports = app; 