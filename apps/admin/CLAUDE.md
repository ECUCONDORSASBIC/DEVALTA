
# CLAUDE.md - App: Admin ⚡
**Última actualización:** 28 de enero de 2025

## 🎯 Resumen de la Aplicación
- **Propósito:** Panel de superadministrador para la gestión global de la plataforma AltaMedica.
- **Tecnologías Clave:** Next.js 15, React 18, TypeScript, Tailwind CSS.
- **Puerto:** 3005
- **Rutas Principales:**
  - `/users`: Gestión de todos los usuarios (pacientes, doctores, admins).
  - `/system-health`: Monitorización del estado de los servicios.
  - `/data-management`: Herramientas para la gestión de datos maestros.

---

## 🏗️ Arquitectura Backend - AltaMedica

### 📍 **Ubicación de Servicios Backend**
```
🌐 API Server (Puerto 3001)
├── 📂 /mnt/c/Users/Eduardo/Documents/devaltamedica/apps/api-server/
├── 🔗 URL: http://localhost:3001
└── 📚 Documentación: /apps/api-server/CLAUDE.md

🔥 Firebase Services
├── 🗄️ Firestore: Base de datos principal
├── 🔐 Firebase Auth: Autenticación de usuarios
├── 💾 Firebase Storage: Almacenamiento de archivos del sistema
└── 📱 Cloud Messaging: Notificaciones administrativas
```

### 🔌 **APIs Principales para Admin App**
| Endpoint | Propósito | Estado |
|---|---|---|
| `/api/v1/users` | **Gestión completa usuarios** (230 líneas) | ✅ **PRODUCCIÓN** |
| `/api/v1/finops/cost-estimation` | **Sistema FinOps** (312 líneas) | ✅ **NIVEL EMPRESARIAL** |
| `/api/v1/rate-limit-stats` | Estadísticas rate limiting | ✅ **PRODUCCIÓN** |
| **Todos los endpoints con privilegios admin** | Acceso total al sistema | ✅ **PRODUCCIÓN** |

### 🚀 **Funcionalidades Tiempo Real**
- ✅ **System Monitoring:** Monitoreo en tiempo real del sistema
- ✅ **User Activity:** Actividad de usuarios en vivo
- ✅ **Security Alerts:** Alertas de seguridad inmediatas
- ✅ **Performance Metrics:** Métricas de rendimiento

### 🔐 **Express + Middleware Stack**
- ✅ **UnifiedAuth:** Middleware con permisos de super-admin requeridos
- ✅ **Rate Limiting:** Protección especial para operaciones administrativas
- ✅ **HIPAA Compliance:** Auditoría completa de todas las acciones administrativas
- ✅ **Service Pattern:** Acceso privilegiado a todos los servicios

---

## 🔗 Integraciones Técnicas
### APIs Backend
- **API Principal:** Accede a endpoints privilegiados del `api-server` (Puerto 3001)
- **Autenticación:** Requiere rol de `super-admin` con Firebase Auth

### Estándares de UI/UX
- **Enfoque:** Funcionalidad sobre estética. Interfaces claras y directas para operaciones críticas.
- **Componentes:** Uso intensivo de tablas de datos, formularios y herramientas de visualización de logs.

## 3. Reglas de Codificación (App-Specific)
- **Seguridad:** Máxima prioridad. Todas las acciones deben ser auditables y requerir confirmación para operaciones destructivas.
- **Validación:** Validaciones exhaustivas tanto en el frontend como en el backend para todas las operaciones de escritura.
