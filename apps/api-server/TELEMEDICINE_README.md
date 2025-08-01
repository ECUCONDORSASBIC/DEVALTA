# 🏥 AltaMedica Telemedicine Server

Sistema de telemedicina completo con videollamadas en tiempo real, cumplimiento HIPAA y auditoría médica.

## 🚀 Características Principales

### 🎥 Videollamadas en Tiempo Real
- **Mediasoup**: Servidor WebRTC de alto rendimiento
- **Video/Audio HD**: Soporte para múltiples codecs (VP8, H.264, Opus)
- **Screen Sharing**: Compartir pantalla durante consultas
- **Chat en tiempo real**: Mensajería integrada en sesiones

### 🔒 Cumplimiento HIPAA
- **Auditoría completa**: Logging de todos los accesos a PHI
- **Encriptación**: Datos sensibles encriptados en tránsito y reposo
- **Control de acceso**: Verificación de permisos por rol
- **Retención de logs**: 7 años de logs de auditoría

### 📊 Monitoreo y Métricas
- **Health checks**: Monitoreo de estado del sistema
- **Métricas en tiempo real**: Sesiones activas, rendimiento
- **Alertas**: Notificaciones de eventos críticos
- **Dashboard**: Interfaz de monitoreo integrada

## 🏗️ Arquitectura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Server    │    │   Mediasoup     │
│   (React/Next)  │◄──►│   (Next.js)     │◄──►│   (WebRTC)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   Database      │
                       │   (PostgreSQL)  │
                       └─────────────────┘
```

## 📋 Requisitos del Sistema

### Software
- Node.js 18+ 
- PostgreSQL 14+
- Redis (opcional)
- Elasticsearch (opcional)

### Hardware Recomendado
- **Desarrollo**: 4GB RAM, 2 CPU cores
- **Producción**: 8GB+ RAM, 4+ CPU cores
- **Alto tráfico**: 16GB+ RAM, 8+ CPU cores

### Puertos Requeridos
- `3001`: API Server
- `10000-10100`: WebRTC (Mediasoup)
- `5432`: PostgreSQL
- `6379`: Redis (opcional)
- `9200`: Elasticsearch (opcional)

## 🛠️ Instalación

### 1. Clonar y Configurar
```bash
# Navegar al directorio del API server
cd apps/api-server

# Instalar dependencias
pnpm install

# Copiar configuración de ejemplo
cp env.telemedicine.example .env.telemedicine
```

### 2. Configurar Variables de Entorno
Editar `.env.telemedicine` con tus valores:

```bash
# Configuración básica
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://user:pass@localhost:5432/altamedica

# Seguridad
JWT_SECRET=tu-clave-secreta-super-segura-minimo-32-caracteres
ENCRYPTION_KEY=tu-clave-de-encriptacion-32-caracteres

# Mediasoup
MEDIASOUP_WORKERS=2
MEDIASOUP_LISTEN_IP=127.0.0.1
MEDIASOUP_ANNOUNCED_IP=127.0.0.1
```

### 3. Configurar Base de Datos
```bash
# Crear base de datos
createdb altamedica_telemedicine

# Ejecutar migraciones
pnpm db:migrate

# Poblar datos de prueba (opcional)
pnpm db:seed
```

### 4. Iniciar Servidor
```bash
# Usando el script de inicio
node scripts/start-telemedicine.js

# O usando pnpm
pnpm dev:telemedicine

# O directamente
pnpm tsx src/lib/telemedicine-server.ts
```

## 🎯 Uso del Sistema

### Crear una Sesión de Telemedicina

```javascript
// 1. Crear cita de telemedicina
const appointment = await fetch('/api/appointments', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    patient_id: 'patient-uuid',
    doctor_id: 'doctor-uuid',
    appointment_type: 'telemedicine',
    scheduled_at: '2024-01-15T10:00:00Z',
    duration_minutes: 30,
    reason: 'Consulta de seguimiento'
  })
});

// 2. Crear sesión de telemedicina
const session = await fetch('/api/telemedicine', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    appointment_id: appointment.id,
    session_type: 'video',
    room_settings: {
      recording_enabled: false,
      chat_enabled: true,
      vitals_sharing: true
    }
  })
});
```

### Conectar a una Sesión WebRTC

```javascript
// Conectar al servidor WebSocket
const socket = io('ws://localhost:3001');

// Unirse a la sesión
socket.emit('join-session', {
  sessionId: 'room-uuid',
  participantId: 'user-uuid',
  role: 'doctor', // o 'patient'
  name: 'Dr. García',
  deviceInfo: {
    browser: 'Chrome',
    os: 'Windows',
    device_type: 'desktop'
  }
});

// Escuchar eventos
socket.on('session-ready', (data) => {
  console.log('Sesión lista:', data);
});

socket.on('participant-joined', (data) => {
  console.log('Participante conectado:', data);
});
```

## 🔧 Configuración Avanzada

### Mediasoup Workers
```bash
# Para desarrollo
MEDIASOUP_WORKERS=2

# Para producción
MEDIASOUP_WORKERS=4

# Para alto tráfico
MEDIASOUP_WORKERS=8
```

### Puertos WebRTC
```bash
# Rango de puertos para WebRTC
MEDIASOUP_RTC_MIN_PORT=10000
MEDIASOUP_RTC_MAX_PORT=10100

# Para múltiples instancias
MEDIASOUP_RTC_MIN_PORT=10000
MEDIASOUP_RTC_MAX_PORT=10099
```

### Logging y Auditoría
```bash
# Nivel de logging
LOG_LEVEL=info  # debug, info, warn, error

# Auditoría HIPAA
HIPAA_AUDIT_ENABLED=true
PHI_ACCESS_LOGGING=true
AUDIT_RETENTION_DAYS=2555  # 7 años
```

## 📊 Monitoreo

### Health Check
```bash
curl http://localhost:3001/api/health
```

Respuesta:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:00:00.000Z",
  "services": {
    "database": {
      "status": "healthy",
      "latency": 5
    },
    "telemedicine": {
      "status": "available",
      "activeSessions": 3,
      "mediasoupWorkers": 2
    }
  },
  "performance": {
    "responseTime": 45,
    "memoryUsage": {
      "heapUsed": 52428800,
      "heapTotal": 104857600
    }
  }
}
```

### Métricas en Tiempo Real
```bash
# Obtener estadísticas de telemedicina
curl http://localhost:3001/api/telemedicine/stats
```

## 🔒 Seguridad HIPAA

### Logging de Auditoría
Todos los accesos a PHI se registran automáticamente:

```javascript
// Ejemplo de log de auditoría
{
  "timestamp": "2024-01-15T10:00:00.000Z",
  "userId": "doctor-uuid",
  "action": "READ_PATIENT_RECORDS",
  "patientId": "patient-uuid",
  "resource": "/api/patients/patient-uuid/records",
  "ipAddress": "192.168.1.100",
  "userAgent": "Mozilla/5.0...",
  "success": true
}
```

### Encriptación
- **En tránsito**: TLS 1.3 para todas las comunicaciones
- **En reposo**: Encriptación AES-256 para datos sensibles
- **WebRTC**: SRTP para streams de video/audio

### Control de Acceso
- **Autenticación**: JWT con expiración configurable
- **Autorización**: Verificación de roles y permisos
- **Rate Limiting**: Protección contra ataques de fuerza bruta

## 🚨 Troubleshooting

### Problemas Comunes

#### 1. Error de Conexión WebRTC
```bash
# Verificar puertos RTC
netstat -an | grep 10000

# Verificar firewall
sudo ufw status
```

#### 2. Alto Uso de CPU
```bash
# Aumentar workers de Mediasoup
MEDIASOUP_WORKERS=4

# Verificar procesos
htop
```

#### 3. Errores de Base de Datos
```bash
# Verificar conexión
psql $DATABASE_URL -c "SELECT 1"

# Verificar logs
tail -f logs/database.log
```

### Logs y Debugging
```bash
# Ver logs en tiempo real
tail -f logs/telemedicine.log

# Modo debug
DEBUG=true LOG_LEVEL=debug node scripts/start-telemedicine.js
```

## 📈 Escalabilidad

### Horizontal Scaling
```bash
# Múltiples instancias
# Instancia 1
PORT=3001 MEDIASOUP_RTC_MIN_PORT=10000 MEDIASOUP_RTC_MAX_PORT=10099

# Instancia 2  
PORT=3002 MEDIASOUP_RTC_MIN_PORT=10100 MEDIASOUP_RTC_MAX_PORT=10199
```

### Load Balancing
```nginx
# Configuración Nginx
upstream telemedicine {
    server localhost:3001;
    server localhost:3002;
}

server {
    listen 80;
    location / {
        proxy_pass http://telemedicine;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
    }
}
```

## 🤝 Contribución

### Desarrollo
```bash
# Instalar dependencias de desarrollo
pnpm install

# Ejecutar tests
pnpm test

# Linting
pnpm lint

# Type checking
pnpm type-check
```

### Estándares de Código
- **TypeScript**: Tipado estricto requerido
- **ESLint**: Reglas de linting configuradas
- **Prettier**: Formateo automático
- **Husky**: Pre-commit hooks

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver [LICENSE](../../LICENSE) para más detalles.

## 🆘 Soporte

### Documentación
- [API Documentation](./docs/api.md)
- [HIPAA Compliance](./docs/hipaa.md)
- [Deployment Guide](./docs/deployment.md)

### Contacto
- **Issues**: [GitHub Issues](https://github.com/altamedica/devaltamedica/issues)
- **Email**: support@altamedica.com
- **Discord**: [AltaMedica Community](https://discord.gg/altamedica)

---

**🏥 AltaMedica Telemedicine Server** - Cumplimiento HIPAA garantizado, videollamadas de alta calidad, auditoría completa. 