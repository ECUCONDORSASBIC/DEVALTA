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

---

## 📦 Arquitectura de Paquetes (Packages)

La aplicación se apoya en un ecosistema de paquetes compartidos desde el directorio `packages/`, siguiendo una filosofía de alta cohesión y bajo acoplamiento. Cada paquete tiene una responsabilidad única y bien definida, eliminando la duplicación de código y centralizando la lógica de negocio.

### Principales Paquetes Utilizados:

- **`@altamedica/ui`**:
  - **Propósito**: Es la biblioteca de componentes de interfaz de usuario (UI) centralizada. Contiene todos los componentes reutilizables de React (botones, tarjetas, modales, etc.) construidos con Radix UI y estilizados con Tailwind CSS.
  - **Tecnología**: React, TypeScript, Tailwind CSS, `cva` (Class Variance Authority) para variantes de componentes.
  - **Uso**: Proporciona una base visual consistente y de alta calidad para todas las aplicaciones del monorepo.

- **`@altamedica/types`**:
  - **Propósito**: Define todas las interfaces y tipos de datos compartidos, especialmente los esquemas de validación de Zod para las entidades principales (Paciente, Doctor, Cita, etc.).
  - **Tecnología**: TypeScript, Zod.
  - **Uso**: Garantiza la consistencia y seguridad de los tipos de datos entre el frontend y el backend. Es la fuente única de verdad para las formas de los datos.

- **`@altamedica/auth`**:
  - **Propósito**: Centraliza toda la lógica de autenticación y autorización. Maneja la interacción con Firebase Auth, la gestión de tokens, y los hooks relacionados con el estado del usuario (`useAuth`).
  - **Tecnología**: React, TypeScript, Firebase SDK.
  - **Uso**: Proporciona una capa de autenticación unificada para todas las aplicaciones que la requieran.

- **`@altamedica/hooks`**:
  - **Propósito**: Colección de hooks de React reutilizables que encapsulan lógica de negocio compleja pero no están directamente ligados a la obtención de datos (data-fetching).
  - **Tecnología**: React, TypeScript.
  - **Uso**: Fomenta la reutilización de lógica en el lado del cliente, como `useLocalStorage` o `useWindowSize`.

- **`@altamedica/utils`**:
  - **Propósito**: Contiene funciones de utilidad puras y genéricas (sin estado, no son hooks) que pueden ser usadas en cualquier parte del sistema (frontend o backend).
  - **Tecnología**: TypeScript.
  - **Uso**: Para tareas comunes como formateo de fechas (`formatDate`), cálculos (`calculateAge`), o manipulación de strings.

- **`@altamedica/medical-hooks`**:
  - **Propósito**: Un conjunto de hooks especializados para la lógica del dominio médico. A diferencia de los hooks de data-fetching, estos encapsulan cálculos o flujos de trabajo específicos de la medicina.
  - **Tecnología**: React, TypeScript.
  - **Uso**: Por ejemplo, `useAnamnesisCalculator` o `useVitalSignsMonitor`.

- **`@altamedica/telemedicine-core`**:
  - **Propósito**: Contiene la lógica central y agnóstica de la interfaz de usuario para las funcionalidades de telemedicina, como la gestión del estado de una llamada WebRTC.
  - **Tecnología**: TypeScript.
  - **Uso**: Permite compartir la lógica de telemedicina entre diferentes aplicaciones (pacientes, doctores) sin duplicar el código de manejo de estado de la conexión.

---

## 3. Reglas de Codificación (App-Specific)
- **Componentes:** Deben ser funcionales, usar hooks y estar tipados con TypeScript.
- **Estilos:** Prioriza el uso de clases de Tailwind CSS. Evita CSS en línea o archivos de CSS modular salvo que sea estrictamente necesario.
- **Pruebas:** Cada nueva funcionalidad debe ir acompañada de pruebas unitarias (Jest/Vitest) y de integración (Cypress) que cubran los flujos críticos del usuario.
