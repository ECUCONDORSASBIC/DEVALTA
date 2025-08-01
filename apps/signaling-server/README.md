# 🏥 Altamedica Signaling Server

Servidor de señalización WebRTC para el sistema de telemedicina de Altamedica.

## 🚀 Características

- ✅ Señalización WebRTC con Socket.IO
- ✅ Autenticación JWT integrada
- ✅ Gestión de salas médicas virtuales
- ✅ Chat en tiempo real durante consultas
- ✅ Monitoreo de signos vitales
- ✅ Soporte para compartir pantalla
- ✅ Rate limiting y seguridad
- ✅ Logging y auditoría HIPAA
- ✅ Redis para escalabilidad

## 📋 Requisitos

- Node.js 18+
- Redis (opcional, pero recomendado para producción)
- pnpm

## 🛠️ Instalación

1. **Instalar dependencias:**
```bash
pnpm install
```

2. **Configurar variables de entorno:**
```bash
cp .env.example .env
# Editar .env con tus valores
```

3. **Compilar TypeScript:**
```bash
pnpm build
```

## 🏃‍♂️ Ejecutar

### Desarrollo
```bash
pnpm dev
```

### Producción
```bash
pnpm build
pnpm start
```

## 🔌 API Endpoints

### REST API

#### Health Check
```http
GET /health
```

#### Crear Sala
```http
POST /api/rooms
Authorization: Bearer <token>

{
  "sessionId": "session-123",
  "appointmentId": "appointment-456"
}
```

#### Obtener Información de Sala
```http
GET /api/rooms/:roomId
Authorization: Bearer <token>
```

#### Estadísticas del Servidor
```http
GET /api/stats
Authorization: Bearer <token>
```

## 📡 Eventos de Socket.IO

### Cliente → Servidor

#### Autenticación
```javascript
socket.emit('authenticate', jwtToken);
```

#### Unirse a Sala
```javascript
socket.emit('join-room', {
  roomId: 'room-123',
  userId: 'user-456',
  role: 'doctor', // o 'patient'
  token: 'jwt-token'
});
```

#### Señalización WebRTC
```javascript
socket.emit('webrtc-signal', {
  type: 'offer', // o 'answer', 'ice-candidate'
  sessionId: 'room-123',
  from: 'user-123',
  to: 'user-456',
  data: sdpData
});
```

#### Enviar Mensaje de Chat
```javascript
socket.emit('chat-message', {
  roomId: 'room-123',
  message: 'Hola, ¿cómo se siente hoy?',
  type: 'text'
});
```

#### Toggle Media
```javascript
socket.emit('toggle-media', {
  type: 'video', // o 'audio'
  enabled: false,
  sessionId: 'room-123'
});
```

### Servidor → Cliente

#### Autenticación Exitosa
```javascript
socket.on('authenticated', (data) => {
  console.log('Usuario autenticado:', data.user);
});
```

#### Unido a Sala
```javascript
socket.on('room-joined', (data) => {
  console.log('Unido a sala:', data.roomId);
  console.log('Participantes:', data.participants);
});
```

#### Participante Unido
```javascript
socket.on('participant-joined', (data) => {
  console.log('Nuevo participante:', data.participant);
});
```

#### Señal WebRTC Recibida
```javascript
socket.on('webrtc-signal', (data) => {
  // Procesar señal WebRTC
  handleWebRTCSignal(data);
});
```

## 🔒 Seguridad

- **JWT Authentication**: Todos los endpoints y sockets requieren autenticación
- **Rate Limiting**: Protección contra abuso de API
- **CORS**: Configuración estricta de orígenes permitidos
- **Helmet**: Headers de seguridad HTTP
- **Input Validation**: Validación con Zod
- **HIPAA Compliance**: Logging de auditoría para accesos médicos

## 📊 Monitoreo

El servidor incluye:
- Logging con Winston
- Métricas de rendimiento
- Estado de salas activas
- Estadísticas de conexiones

## 🏗️ Arquitectura

```
signaling-server/
├── src/
│   ├── config/          # Configuración del servidor
│   ├── controllers/     # Controladores de Socket.IO
│   ├── middleware/      # Middleware de autenticación
│   ├── services/        # Servicios de negocio
│   ├── types/           # Tipos TypeScript
│   └── index.ts         # Punto de entrada
├── logs/                # Archivos de log
└── dist/                # Código compilado
```

## 🧪 Testing

```bash
# Ejecutar tests
pnpm test

# Tests con watch mode
pnpm test:watch
```

## 🚀 Despliegue

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 8888
CMD ["node", "dist/index.js"]
```

### PM2
```bash
pm2 start dist/index.js --name altamedica-signaling
```

## 🤝 Contribuir

1. Fork el repositorio
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'feat: agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

MIT License - Copyright (c) 2025 Altamedica