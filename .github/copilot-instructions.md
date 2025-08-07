````markdown
# 📜 Instrucciones para GitHub Copilot y Agentes de IA

**Última actualización:** 6 de agosto de 2025

Bienvenido al monorepo de AltaMedica. Este documento es tu guía para entender la arquitectura, los estándares y las convenciones de este proyecto. **Leer y seguir estas instrucciones es crucial para realizar contribuciones efectivas y seguras.**

## 🎯 1. Visión General del Proyecto

AltaMedica es una plataforma de telemedicina integral diseñada para conectar pacientes, médicos, empresas y administradores. Es un monorepo `pnpm` que utiliza una arquitectura de microservicios frontend y un backend centralizado.

**Principios Clave:**
- **Seguridad Primero**: El cumplimiento de HIPAA es mandatorio. Todos los datos de pacientes (PHI) deben ser manejados con el máximo cuidado.
- **Código Compartido**: La reutilización de código a través de `packages` es fundamental para mantener la consistencia y reducir la duplicación.
- **Backend Centralizado**: La lógica de negocio crítica, la seguridad y la manipulación de datos residen en el `api-server`. Los frontends son principalmente para la presentación y la gestión del estado de la UI.

---

## 🏗️ 2. Arquitectura del Monorepo

La estructura del proyecto está diseñada para separar las preocupaciones y maximizar la reutilización del código.

```
/
├── 📱 apps/                  # Aplicaciones y servidores desplegables
│   ├── api-server/          # Backend central (Next.js API). El "cerebro" del sistema.
│   ├── web-app/             # Landing page y punto de entrada principal.
│   ├── patients/            # Portal para pacientes.
│   ├── doctors/             # Portal para médicos.
│   ├── companies/           # Portal B2B para empresas/clínicas.
│   └── admin/               # Panel de administración.
│
├── 📦 packages/              # Código compartido y reutilizable
│   ├── @altamedica/auth/    # Lógica de autenticación (hooks, providers).
│   ├── @altamedica/ui/      # Sistema de diseño y componentes React.
│   ├── @altamedica/types/   # Interfaces TypeScript y esquemas Zod.
│   ├── @altamedica/hooks/   # Hooks de React genéricos.
│   └── ...                  # Otros paquetes de lógica de negocio o utilidades.
│
├── 🛠️ tools/                 # Scripts de automatización y herramientas.
└── 📚 docs/                  # Documentación.
```

### Flujo de Interacción:
- Una **app** (ej. `patients`) importa componentes de `@altamedica/ui` y hooks de `@altamedica/auth`.
- La **app** se comunica con el `api-server` para cualquier operación de datos o lógica de negocio.
- El `api-server` utiliza `packages` como `@altamedica/database` para interactuar con la base de datos.
- **NUNCA** una aplicación frontend debe acceder directamente a la base de datos.

---

## 💻 3. Stack Tecnológico

- **Gestor de Paquetes**: `pnpm` con workspaces.
- **Build System**: Turborepo (configurado en `turbo.json`).
- **Frameworks**: Next.js 14+ (App Router) para todas las `apps`.
- **Lenguaje**: TypeScript (modo estricto).
- **Styling**: Tailwind CSS + Radix UI (a través del paquete `@altamedica/ui`).
- **Estado Global**: Zustand.
- **Data Fetching**: TanStack Query (React Query).
- **Backend**: Node.js con Next.js API Routes y middleware Express.
- **Base de Datos**: Firebase Firestore (principal) y PostgreSQL.
- **Autenticación**: Firebase Auth (para la gestión de usuarios) + JWT (para sesiones de la API).

---

## 🧠 4. Conceptos Fundamentales

### Flujo de Autenticación (¡MUY IMPORTANTE!)
Este es un punto crítico que debes entender.
1.  **Cliente (Frontend)**: El usuario se registra/loguea usando Firebase Auth (Email/Pass, Google, etc.) a través de los hooks de `@altamedica/auth`.
2.  **Token de Firebase**: El cliente obtiene un `idToken` de Firebase.
3.  **Llamada al Backend**: El cliente envía este `idToken` al `api-server` (ej. a `/api/v1/auth/login`).
4.  **Servidor API (`api-server`)**:
    - Verifica el `idToken` de Firebase usando el Admin SDK.
    - Si es válido, busca o crea el perfil del usuario en la base de datos (Firestore/Postgres).
    - Genera sus propios tokens de sesión (**JWT**).
    - Establece estos JWT en **cookies `HttpOnly` y `Secure`**.
    - Devuelve al cliente los datos del usuario y una URL de redirección (`redirectUrl`) basada en su rol.
5.  **Redirección**: El cliente recibe la respuesta y redirige al usuario a la aplicación correspondiente (ej. `patients.altamedica.dev`).

**Tu Rol como IA**:
- **NO** almacenes JWTs en `localStorage`. La lógica de sesión se maneja con cookies `HttpOnly` desde el `api-server`.
- Al depurar problemas de login, revisa el flujo completo, desde el cliente hasta el `api-server`.
- La lógica de negocio (qué puede hacer un usuario) se decide en el `api-server`, no en el frontend.

### Packages Compartidos
- Antes de crear una nueva utilidad, componente o hook, **siempre** revisa si algo similar ya existe en el directorio `packages/`.
- **`@altamedica/ui`**: La fuente de verdad para todos los componentes visuales.
- **`@altamedica/types`**: La fuente de verdad para las estructuras de datos. Úsalo para garantizar la consistencia entre el frontend y el backend.

---

## 🛠️ 5. Flujo de Trabajo de Desarrollo

- **Instalación**: `pnpm install` en la raíz del proyecto.
- **Ejecutar todo**: `pnpm dev:all` para iniciar todas las aplicaciones en modo desarrollo.
- **Ejecutar una app específica**: `pnpm --filter <app-name> dev`. (ej. `pnpm --filter patients dev`).
- **Testing**: `pnpm test` para ejecutar tests unitarios. `pnpm test:e2e` para tests end-to-end.
- **Linting**: `pnpm lint` y `pnpm lint:fix`.

### Problemas Conocidos
- **`apps/companies`**: Esta aplicación tiene conflictos con `turbopack`. Debes ejecutarla sin la bandera `--turbopack`. El script `dev` en su `package.json` ya está ajustado para esto.

---

## 📖 6. Estándares de Codificación

- **Commits**: Sigue la especificación de [Conventional Commits](https://www.conventionalcommits.org/).
  - `feat(patients): agregar vista de historial médico`
  - `fix(auth): corregir redirección en login con Google`
  - `docs(readme): actualizar instrucciones de instalación`
- **Nomenclatura**:
  - Componentes: `PascalCase` (`PatientCard.tsx`)
  - Hooks: `useCamelCase` (`usePatientData.ts`)
  - Tipos: `PascalCase` (`MedicalRecord`)
- **Seguridad (HIPAA)**:
  - Nunca expongas datos sensibles en logs o en respuestas de API innecesarias.
  - Todas las operaciones que involucren datos de pacientes (PHI) deben ser validadas y autorizadas en el `api-server`.
  - La encriptación y el audit logging son manejados por los paquetes de seguridad, asegúrate de usarlos.

---

## 🤖 7. Instrucciones Específicas para Ti (IA)

1.  **Prioriza el `api-server`**: Para cualquier nueva funcionalidad o cambio en la lógica de negocio, empieza por el `api-server`. Define los endpoints y la lógica allí, y luego consúmelos desde el frontend.
2.  **Usa los Packages**: No reinventes la rueda. Si necesitas un componente de UI, un tipo de dato, o un hook de autenticación, búscalo en `packages/` primero.
3.  **Sé Consistente**: Observa el código existente y sigue los patrones y estilos establecidos.
4.  **Valida en el Backend**: No confíes en la validación del lado del cliente. Toda la validación de datos debe ocurrir en el `api-server`, preferiblemente usando los esquemas de Zod definidos en `@altamedica/types`.
5.  **Manejo de Errores**: Implementa un manejo de errores robusto tanto en el frontend (mostrando mensajes al usuario) como en el backend (devolviendo códigos de estado HTTP apropiados y logs claros).
6.  **Pregunta si no estás seguro**: Si una solicitud es ambigua, especialmente en lo que respecta a la seguridad o la arquitectura, pide una clarificación antes de proceder.
````
