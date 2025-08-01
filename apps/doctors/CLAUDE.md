
# CLAUDE.md - App: Doctors 🏥
**Última actualización:** 28 de enero de 2025

## 🎯 Resumen de la Aplicación
- **Propósito:** Plataforma para que los profesionales médicos gestionen su agenda, atiendan pacientes (telemedicina) y actualicen historiales clínicos.
- **Tecnologías Clave:** Next.js 15, React 18, TypeScript, Tailwind CSS, WebRTC.
- **Puerto:** 3002
- **Rutas Principales:**
  - `/schedule`: Visualización y gestión de la agenda.
  - `/telemedicine/:sessionId`: Sala de consulta virtual.
  - `/patients/:patientId`: Perfil del paciente y su historial clínico.

---

## 🏗️ Arquitectura Backend - AltaMedica

### 📍 **Ubicación de Servicios Backend**
```
🌐 API Server (Puerto 3001)
├── 📂 /mnt/c/Users/Eduardo/Documents/devaltamedica/apps/api-server/
├── 🔗 URL: http://localhost:3001
└── 📚 Documentación: /apps/api-server/CLAUDE.md

🎥 Signaling Server (Puerto 8888)  
├── 📂 /mnt/c/Users/Eduardo/Documents/devaltamedica/apps/signaling-server/
├── 🔗 URL: ws://localhost:8888
└── 🎯 Propósito: WebRTC signaling para videollamadas

🔥 Firebase Services
├── 🗄️ Firestore: Base de datos principal
├── 🔐 Firebase Auth: Autenticación de usuarios
├── 💾 Firebase Storage: Almacenamiento de archivos médicos
└── 📱 Cloud Messaging: Notificaciones push
```

### 🔌 **APIs Principales para Doctors App**
| Endpoint | Propósito | Estado |
|---|---|---|
| `/api/v1/auth/*` | Login/registro médico | ✅ **PRODUCCIÓN** |
| `/api/v1/appointments/*` | Gestión completa de citas | ✅ **PRODUCCIÓN** |
| `/api/v1/patients` | Lista y gestión de pacientes | ✅ **PRODUCCIÓN** |
| `/api/v1/medical-records/*` | Historiales clínicos | ✅ **PRODUCCIÓN** |
| `/api/v1/prescriptions/*` | Emisión de recetas | ✅ **PRODUCCIÓN** |
| `/api/v1/telemedicine/sessions/*` | Videollamadas médicas | ✅ **NIVEL EMPRESARIAL** |
| `/api/v1/jobs` | Ofertas de trabajo médico | ✅ **PRODUCCIÓN** |

### 🚀 **Funcionalidades Tiempo Real**
- ✅ **WebRTC + MediaSoup:** Videollamadas HD con <100ms latencia
- ✅ **Socket.io:** Notificaciones de citas en tiempo real
- ✅ **Firestore Listeners:** Cambios de estado automáticos
- ✅ **WebRTC Signaling:** Sistema completo de señalización (263 líneas)

### 🔐 **Express + Middleware Stack**
- ✅ **UnifiedAuth:** Middleware de autenticación centralizado
- ✅ **Rate Limiting:** Protección contra spam
- ✅ **HIPAA Compliance:** Auditoría automática de acciones médicas
- ✅ **Service Pattern:** Lógica de negocio en servicios especializados

---

## 🔗 Integraciones Técnicas
### APIs Backend
- **API Principal:** Interactúa con el `api-server` (Puerto 3001) para gestión de datos médicos
- **Telemedicina:** Se integra con el `signaling-server` (Puerto 8888) para WebRTC
- **Autenticación:** Firebase Auth + custom tokens del API server

### Estándares de UI/UX
- **Componentes:** Reutiliza componentes de `@altamedica/ui` y componentes específicos de la app de doctores (`/components`).
- **Flujo de Telemedicina:** La lógica de WebRTC está encapsulada en hooks (`useWebRTC`) para simplificar la gestión de la conexión, el streaming y los eventos.

## 3. Reglas de Codificación (App-Specific)
- **Seguridad en Telemedicina:** Asegúrate de que la conexión WebRTC sea segura (DTLS-SRTP). No se debe transmitir PHI a través del servidor de señalización.
- **Manejo de Estado:** Utiliza Zustand para estados complejos como la gestión de la sala de telemedicina (participantes, estado de la llamada).
- **Pruebas:** Las pruebas de telemedicina deben usar mocks para la API de WebRTC y centrarse en la lógica de señalización y la gestión del estado de la llamada.
