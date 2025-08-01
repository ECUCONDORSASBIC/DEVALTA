
# CLAUDE.md - App: Patients 👤
**Última actualización:** 28 de enero de 2025

## 🎯 Resumen de la Aplicación
- **Propósito:** Portal del paciente para gestionar citas, ver historial médico y comunicarse con los doctores.
- **Tecnologías Clave:** Next.js 15, React 18, TypeScript, Tailwind CSS, Zustand.
- **Puerto:** 3003
- **Rutas Principales:**
  - `/dashboard`: Vista principal con próximas citas y notificaciones.
  - `/appointments`: Gestión de citas (agendar, cancelar, ver historial).
  - `/records`: Acceso a historial médico.
  - `/messages`: Comunicación segura con doctores.

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

### 🔌 **APIs Principales para Patients App**
| Endpoint | Propósito | Estado |
|---|---|---|
| `/api/v1/auth/*` | Login/registro pacientes | ✅ **PRODUCCIÓN** |
| `/api/v1/appointments/*` | Reserva y gestión de citas | ✅ **PRODUCCIÓN** |
| `/api/v1/medical-records/*` | Consulta de historial | ✅ **PRODUCCIÓN** |
| `/api/v1/prescriptions/verify` | Verificación de recetas | ✅ **PRODUCCIÓN** |
| `/api/v1/telemedicine/sessions/*` | Videollamadas médicas | ✅ **NIVEL EMPRESARIAL** |
| `/api/v1/ai/analyze-symptoms` | IA médica para síntomas | ✅ **NIVEL EMPRESARIAL** |
| `/api/v1/payments/mercadopago/*` | Pagos de consultas | ✅ **PRODUCCIÓN** |

### 🚀 **Funcionalidades Tiempo Real**
- ✅ **WebRTC:** Videollamadas HD con doctores
- ✅ **Socket.io:** Notificaciones de citas en tiempo real
- ✅ **Firestore Listeners:** Cambios automáticos de estado
- ✅ **AI Chat:** Análisis inteligente de síntomas (369 líneas)

### 🔐 **Express + Middleware Stack**
- ✅ **UnifiedAuth:** Middleware de autenticación centralizado
- ✅ **Rate Limiting:** Protección contra spam
- ✅ **HIPAA Compliance:** Auditoría automática de acciones médicas
- ✅ **Service Pattern:** Lógica de negocio en servicios especializados

---

## 🔗 Integraciones Técnicas
### APIs Backend
- **API Principal:** Se comunica exclusivamente con el `api-server` (Puerto 3001) para todas las operaciones
- **Autenticación:** Firebase Auth + custom tokens del API server con flujo SSO centralizado
- **Notificaciones:** WebSockets del `api-server` para actualizaciones en tiempo real

### Estándares de UI/UX
- **Componentes:** Utiliza el sistema de diseño de AltaMedica (`@altamedica/ui`) disponible en `packages/ui`.
- **Estado:** Gestiona el estado global con Zustand, especialmente para la información del usuario y el estado de la conexión.
- **Data Fetching:** Usa React Query (`useQuery`, `useMutation`) para interactuar con la API, gestionando caching, reintentos y estado de carga.

## 3. Reglas de Codificación (App-Specific)
- **Componentes:** Deben ser funcionales, usar hooks y estar tipados con TypeScript.
- **Estilos:** Prioriza el uso de clases de Tailwind CSS. Evita CSS en línea o archivos de CSS modular salvo que sea estrictamente necesario.
- **Pruebas:** Cada nueva funcionalidad debe ir acompañada de pruebas unitarias (Jest/Vitest) y de integración (Cypress) que cubran los flujos críticos del usuario.
