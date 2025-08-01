# @altamedica/telemedicine-core

Paquete compartido para funcionalidades de telemedicina entre las aplicaciones de doctores y pacientes.

## 🎯 **Objetivo**

Proporcionar una base sólida y compartida para las funcionalidades de telemedicina, eliminando duplicación de código y asegurando consistencia entre aplicaciones.

## 🏗️ **Arquitectura**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   App Doctores  │    │  Servidor       │    │  App Pacientes  │
│                 │    │  WebRTC         │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ WebRTC      │◄────►│ │ Mediasoup   │ │◄────►│ │ WebRTC      │ │
│ │ Client      │ │    │ │ Server      │ │    │ │ Client      │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ UI          │ │    │ │ Signaling   │ │    │ │ UI          │ │
│ │ Components  │ │    │ │ Server      │ │    │ │ Components  │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📦 **Componentes Principales**

### **1. WebRTCClient**
Cliente WebRTC avanzado con funcionalidades completas:
- Gestión de conexión peer-to-peer
- Manejo de streams de audio/video
- Compartir pantalla
- Grabación de sesiones
- Configuración de calidad
- Monitoreo de estadísticas

### **2. useWebRTC Hook**
Hook React para integración fácil:
```typescript
const {
  localStream,
  remoteStream,
  isConnected,
  toggleMute,
  toggleVideo,
  toggleScreenShare,
  // ... más funcionalidades
} = useWebRTC(config);
```

### **3. useTelemedicineSession Hook**
Hook para gestión completa de sesiones:
```typescript
const {
  session,
  chatMessages,
  transcription,
  aiAnalysis,
  patientVitals,
  // ... más funcionalidades
} = useTelemedicineSession(options);
```

### **4. VideoCall Component**
Componente de videollamada listo para usar:
```typescript
<VideoCall
  config={webRTCConfig}
  onEndCall={handleEndCall}
  showControls={true}
  showStats={true}
/>
```

## 🚀 **Instalación**

```bash
# En cada aplicación (doctors y patients)
pnpm add @altamedica/telemedicine-core
```

## 📖 **Uso Básico**

### **1. Configuración WebRTC**
```typescript
import { useWebRTC } from '@altamedica/telemedicine-core';

const webRTCConfig = {
  serverUrl: process.env.NEXT_PUBLIC_TELEMEDICINE_SERVER_URL,
  roomId: 'room-123',
  userId: 'user-456',
  userType: 'doctor', // o 'patient'
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' }
  ]
};

const {
  localStream,
  remoteStream,
  isConnected,
  joinRoom,
  leaveRoom,
  toggleMute,
  toggleVideo
} = useWebRTC(webRTCConfig);
```

### **2. Gestión de Sesión**
```typescript
import { useTelemedicineSession } from '@altamedica/telemedicine-core';

const {
  session,
  chatMessages,
  sendChatMessage,
  transcription,
  aiAnalysis,
  patientVitals,
  joinSession,
  leaveSession
} = useTelemedicineSession({
  sessionId: 'session-123',
  userId: 'user-456',
  userType: 'doctor',
  autoJoin: true,
  enableChat: true,
  enableRecording: true
});
```

### **3. Componente de Video**
```typescript
import { VideoCall } from '@altamedica/telemedicine-core';

function TelemedicineRoom() {
  return (
    <VideoCall
      config={webRTCConfig}
      onEndCall={() => router.push('/dashboard')}
      showControls={true}
      showStats={true}
      className="h-screen"
    />
  );
}
```

## 🔧 **Configuración Avanzada**

### **Variables de Entorno**
```env
NEXT_PUBLIC_TELEMEDICINE_SERVER_URL=http://localhost:3001
NEXT_PUBLIC_TELEMEDICINE_ICE_SERVERS=stun:stun.l.google.com:19302
NEXT_PUBLIC_TELEMEDICINE_TURN_SERVERS=turn:your-turn-server.com:3478
```

### **Configuración de Calidad**
```typescript
const settings = {
  videoQuality: 'high', // 'low' | 'medium' | 'high'
  enableNoiseReduction: true,
  enableEchoCancellation: true,
  enableAutoGainControl: true,
  enableBandwidthOptimization: false,
  enableVirtualBackground: false,
  enableRecording: true,
  enableTranscription: true,
  enableAIAnalysis: true
};
```

## 🎨 **Personalización de UI**

### **Tema Personalizado**
```typescript
// Los componentes usan Tailwind CSS y pueden ser personalizados
<VideoCall
  config={config}
  onEndCall={handleEndCall}
  className="custom-video-call-theme"
/>
```

### **Controles Personalizados**
```typescript
const {
  toggleMute,
  toggleVideo,
  toggleScreenShare,
  setVideoQuality,
  enableNoiseReduction
} = useWebRTC(config);

// Usar en componentes personalizados
<button onClick={toggleMute}>
  {isMuted ? <MicOff /> : <Mic />}
</button>
```

## 🔒 **Seguridad y Compliance**

### **Encriptación**
- Todas las comunicaciones WebRTC están encriptadas
- Grabaciones se almacenan encriptadas
- Claves de encriptación se manejan de forma segura

### **HIPAA Compliance**
- Logs de auditoría completos
- Acceso controlado a sesiones
- Eliminación automática de datos sensibles
- Cumplimiento con estándares médicos

## 📊 **Monitoreo y Analytics**

### **Estadísticas de Conexión**
```typescript
const { stats } = useWebRTC(config);

console.log({
  bitrate: stats.bitrate,        // kbps
  packetLoss: stats.packetLoss,  // %
  latency: stats.latency,        // ms
  quality: stats.quality         // 'excellent' | 'good' | 'fair' | 'poor'
});
```

### **Eventos de Sesión**
```typescript
const {
  session,
  chatMessages,
  transcription,
  aiAnalysis
} = useTelemedicineSession(options);

// Todos los eventos se registran para auditoría
```

## 🧪 **Testing**

```bash
# Ejecutar tests
pnpm test

# Tests con coverage
pnpm test:coverage

# Tests en modo watch
pnpm test:watch
```

## 🔄 **Migración desde Implementaciones Existentes**

### **Desde apps/doctors**
1. Reemplazar `@/lib/webrtc-client` con `@altamedica/telemedicine-core`
2. Actualizar imports en componentes de telemedicina
3. Migrar configuraciones específicas

### **Desde apps/patients**
1. Restaurar hooks deshabilitados usando el paquete compartido
2. Actualizar componentes existentes
3. Migrar configuraciones específicas

## 🚀 **Roadmap**

### **Fase 1: Core WebRTC** ✅
- [x] Cliente WebRTC básico
- [x] Hooks React
- [x] Componentes UI básicos
- [x] Gestión de sesiones

### **Fase 2: Funcionalidades Avanzadas** 🚧
- [ ] Integración con Mediasoup
- [ ] Grabación en servidor
- [ ] Transcripción en tiempo real
- [ ] Análisis de IA integrado

### **Fase 3: Optimización** 📋
- [ ] Optimización de ancho de banda
- [ ] Fondo virtual
- [ ] Filtros de video
- [ ] Calidad adaptativa

### **Fase 4: Enterprise** 📋
- [ ] Multi-room support
- [ ] Escalabilidad horizontal
- [ ] Analytics avanzados
- [ ] Integración con EHR

## 🤝 **Contribución**

1. Fork el repositorio
2. Crear feature branch
3. Implementar cambios
4. Agregar tests
5. Crear pull request

## 📄 **Licencia**

MIT License - ver LICENSE para detalles.

## 🆘 **Soporte**

Para soporte técnico, contactar al equipo de desarrollo de Altamedica. 