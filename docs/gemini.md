# Auditoría y Plan de Acción Exhaustivo del Repositorio `devaltamedica`

**Fecha de Auditoría:** 4 de agosto de 2025
**Auditor:** Gemini

---

## **1. Resumen Ejecutivo y Visión General**

El repositorio `devaltamedica` es un monorepo `pnpm` que sirve como base para una plataforma de salud digital ambiciosa y de gran escala. La elección de la arquitectura —un monorepo con aplicaciones frontend desacopladas y un servidor de API central— es moderna y correcta. Sin embargo, una fase de crecimiento orgánico y rápido ha resultado en una acumulación significativa de **deuda técnica**.

El problema fundamental no es la base arquitectónica, sino la **erosión de los límites y responsabilidades** entre los distintos módulos del sistema. Lógica que debería estar centralizada se ha duplicado, las responsabilidades de las aplicaciones se han vuelto difusas y el repositorio raíz ha acumulado desorden, dificultando el mantenimiento y la incorporación de nuevos desarrolladores.

Este documento sirve como una hoja de ruta detallada para identificar, entender y saldar esta deuda técnica, transformando el proyecto de uno que "funciona" a uno que es **robusto, seguro, escalable y mantenible a largo plazo.**

---

## **2. Plan de Acción Estratégico (Priorizado)**

A continuación se detallan las acciones estratégicas necesarias para sanear el repositorio. Están ordenadas por criticidad y impacto.

### **2.1. Limpieza General del Repositorio (Prioridad: ALTA)**

**Objetivo:** Reducir drásticamente el "ruido" en el repositorio, eliminar código obsoleto y peligroso, y asegurar que el control de versiones solo rastree el código fuente esencial.

- **Tarea 1: Implementar un `.gitignore` Exhaustivo.**
  - **Problema:** El repositorio carece de un archivo `.gitignore` robusto, lo que arriesga la subida de archivos sensibles (como variables de entorno con secretos), logs con información de usuario, y artefactos de build que inflan el tamaño del repositorio.
  - **Acción:** Crear y configurar el archivo [/.gitignore](./.gitignore) en la raíz para excluir sistemáticamente:
    - Archivos de entorno: `.env`, `.env.local`, `.env.*` (excepto `.env.example`)
    - Logs: `*.log`, `npm-debug.log*`, `yarn-debug.log*`
    - Dependencias: `node_modules/`
    - Artefactos de Build: `.next/`, `dist/`, `build/`, `out/`
    - Reportes y Artefactos de Depuración: `*report*.json`, `*audit*.json`, `*.session`
  - **Ubicación:** [`/.gitignore`](./.gitignore)

- **Tarea 2: Eliminar Código Muerto y Backups.**
  - **Problema:** La existencia de carpetas como `/apps/web-app/src/backup-versions` y archivos con sufijos como `-new`, `-old`, `-backup` es una práctica peligrosa. Git es el único sistema de control de versiones que debe usarse. Estos archivos crean confusión y pueden ser reintroducidos accidentalmente en el código.
  - **Acción:** Realizar una búsqueda global y eliminar todas las carpetas y archivos que sean backups o versiones obsoletas.
  - **Ejemplo Crítico:** Eliminar la carpeta [`/apps/web-app/src/backup-versions`](./apps/web-app/src/backup-versions).
  - **Ejemplo Crítico:** Resolver la duplicidad de [`/apps/web-app/src/app/page.tsx`](./apps/web-app/src/app/page.tsx), `page-new.tsx` y `page-home.tsx`, dejando solo uno como la página principal.

- **Tarea 3: Reubicar Documentación y Reportes.**
  - **Problema:** El código fuente está mezclado con numerosos reportes de auditoría y logs en formato Markdown y JSON. Estos archivos no son parte del software y dificultan la navegación.
  - **Acción:**
    1. Crear una nueva carpeta en la raíz llamada `docs/`.
    2. Mover todos los archivos de auditoría (`AUDITORIA_*.md`), reportes (`audit_report_*.json`) y otros documentos explicativos a esta carpeta.
    3. A largo plazo, considerar migrar esta documentación a un sistema más apropiado como un Wiki de Git, Confluence o Notion.
  - **Ejemplo de Archivo a Mover:** [`/AUDITORIA_SSO_SESION_PERSISTENTE.md`](./AUDITORIA_SSO_SESION_PERSISTENTE.md).
  - **Ejemplo de Archivo a Mover:** [`/audit_report_20250731_070051.json`](./audit_report_20250731_070051.json).

### **2.2. Centralización de Scripts y Automatización (Prioridad: MEDIA)**

**Objetivo:** Crear un punto de entrada único y documentado para todas las tareas de desarrollo, eliminando la confusión del "script sprawl".

- **Problema:** La raíz del proyecto está inundada con más de 30 scripts de diferentes lenguajes (`.bat`, `.ps1`, `.py`, `.js`), haciendo imposible para un desarrollador saber qué ejecutar.
- **Acción:**
  1. Crear una carpeta `/scripts` en la raíz del proyecto.
  2. Mover todos los scripts de utilidad (ej. `fix-sso-dependencies.ps1`, `auto_login_tester.py`) a la nueva carpeta `/scripts`.
  3. Editar el `package.json` raíz y crear un alias en la sección `"scripts"` para cada tarea importante.
     - **Antes:** `PS C:\> .\scripts\fix-sso-dependencies.ps1`
     - **Después:** `pnpm fix:sso` (definido en `package.json` como `"fix:sso": "pwsh ./scripts/fix-sso-dependencies.ps1"`)
- **Ubicación Clave:** [`/package.json`](./package.json)

### **2.3. Unificación del Sistema de Autenticación (Prioridad: CRÍTICA)**

**Objetivo:** Eliminar la vulnerabilidad de seguridad y la pesadilla de mantenimiento que supone tener múltiples sistemas de autenticación coexistiendo.

- **Problema:** Se han identificado al menos 4 implementaciones de `AuthProvider` solo en la app `patients`, además de otros contextos y hooks de autenticación en `web-app`. Esto significa que el estado de la sesión del usuario no tiene una fuente única de verdad, lo que puede llevar a bugs de sincronización, fallos de seguridad y una enorme dificultad para aplicar actualizaciones o parches.
- **Acción (Plan Detallado):**
  1. **Nominar un Ganador:** Elegir una de las implementaciones existentes como la base para el sistema unificado. [`AuthProviderUnified.tsx`](./apps/patients/src/providers/AuthProviderUnified.tsx) parece el intento más reciente y completo.
  2. **Crear un Paquete Compartido:** Crear un nuevo paquete en `packages` llamado `auth` (`@altamedica/auth`).
  3. **Centralizar la Lógica:** Mover la lógica del `AuthProvider` elegido y un `useAuth` hook estandarizado al nuevo paquete `@altamedica/auth`.
  4. **Refactorización Global:** Modificar **todas** las aplicaciones (`patients`, `doctors`, `web-app`, etc.) para que obtengan el contexto y el hook de autenticación desde este paquete compartido.
     - `import { AuthProvider, useAuth } from '@altamedica/auth';`
  5. **Eliminación:** Una vez que todas las aplicaciones hayan sido migradas, eliminar de forma segura todas las implementaciones de autenticación duplicadas.
- **Ubicaciones Críticas a Eliminar/Refactorizar:**
  - [`/apps/patients/src/providers/`](./apps/patients/src/providers/) (Contiene 4 AuthProviders)
  - [`/apps/web-app/src/contexts/AuthContext.tsx`](./apps/web-app/src/contexts/AuthContext.tsx)
  - Múltiples hooks como `useAuthSimple`, `useDevAuth`.

### **2.4. Refactorización de UI Compartida (Prioridad: ALTA)**

**Objetivo:** Implementar el principio DRY (Don't Repeat Yourself) para los componentes de React, garantizando consistencia visual y funcional en toda la plataforma y acelerando el desarrollo.

- **Problema:** Componentes de UI básicos y corporativos (Botones, Tarjetas, Entradas) están definidos localmente dentro de `apps/patients` y `apps/web-app`, llevando a inconsistencias y duplicación de esfuerzos.
- **Acción:**
  1. Mover sistemáticamente todos los componentes de UI reutilizables desde las carpetas locales (`apps/*/components/ui`) al paquete centralizado [`/packages/ui/src`](./packages/ui/src).
  2. Refactorizar las importaciones en las aplicaciones para que consuman los componentes desde el paquete compartido.
     - **Antes:** `import { Button } from '@/components/ui/ButtonCorporate';`
     - **Después:** `import { Button } from '@altamedica/ui';`
  3. **Implementar Storybook:** Instalar y configurar Storybook para el paquete `@altamedica/ui`. Esto permitirá desarrollar, probar y documentar componentes de forma aislada, creando un catálogo de componentes vivo para todo el equipo.
- **Ubicaciones a Refactorizar:**
  - [`/apps/patients/src/components/ui`](./apps/patients/src/components/ui)
  - [`/apps/web-app/src/components/ui`](./apps/web-app/src/components/ui)

---

## **3. Auditorías Detalladas por Módulo**

### **3.1. `api-server`**
**Rol:** El cerebro de la plataforma.
**Diagnóstico:** Arquitectura robusta, pero con fallos críticos de seguridad y mantenimiento.

- **Hallazgo 1: Ausencia de Validación de Entrada (CRÍTICO).**
  - **Riesgo:** Permite que datos malformados o maliciosos lleguen a la base de datos, pudiendo causar corrupción de datos, fallos en el sistema e incluso vulnerabilidades de inyección.
  - **Ejemplo (Problema):**
    ```typescript
    // Archivo: /apps/api-server/src/app/api/v1/auth/register/route.ts
    // El body de la petición se usa directamente sin validación.
    const { email, password, role, name } = await request.json();
    const newUser = await someUserService.create({ email, password, role, name }); // ¡Peligroso!
    ```
  - **Solución Recomendada:** Implementar `zod` para la validación de esquemas en todos los endpoints que reciben datos.
    ```typescript
    // Solución con Zod
    const registerSchema = z.object({
      email: z.string().email(),
      password: z.string().min(8),
      role: z.enum(['patient', 'doctor']),
      name: z.string().min(2),
    });

    try {
      const safeData = registerSchema.parse(await request.json());
      // Usar 'safeData' a partir de aquí
      const newUser = await someUserService.create(safeData);
    } catch (error) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    ```

- **Hallazgo 2: Lógica de Servicios Duplicada.**
  - **Riesgo:** Dos archivos que hacen lo mismo. Un desarrollador puede arreglar un bug en uno sin saber que el otro existe, reintroduciendo el bug más tarde.
  - **Archivos en Conflicto:** [`/apps/api-server/src/services/user.service.ts`](./apps/api-server/src/services/user.service.ts) vs. [`/apps/api-server/src/services/UserService.ts`](./apps/api-server/src/services/UserService.ts).
  - **Acción:** Unificar en un solo archivo y eliminar el otro.

### **3.2. `patients`**
**Rol:** La aplicación principal para pacientes.
**Diagnóstico:** La más grande y con mayor deuda técnica.

- **Hallazgo 1: "God Component" en el Dashboard.**
  - **Riesgo:** El archivo [`/apps/patients/src/app/page.tsx`](./apps/patients/src/app/page.tsx) (casi 40KB) es extremadamente grande, lento de cargar, difícil de depurar y propenso a errores.
  - **Acción:** Descomponer este componente monolítico en componentes más pequeños y especializados, usando la estructura ya existente en `/apps/patients/src/components/dashboard`. La página principal debe ser un "layout" que ensambla estos componentes hijos.

- **Hallazgo 2: "Shadow API".**
  - **Riesgo:** La app `patients` tiene su propia API interna en [`/apps/patients/src/app/api/`](./apps/patients/src/app/api/). Esto rompe el patrón de API centralizada, duplica la lógica de negocio y crea una ruta de acceso a los datos que elude la seguridad y la lógica del `api-server`.
  - **Acción:** Refactorizar los componentes que llaman a esta API interna para que llamen a los endpoints correspondientes del `api-server`. Una vez hecho, eliminar la carpeta `/apps/patients/src/app/api/` por completo.

### **3.3. `doctors` y `companies`**
**Rol:** Aplicaciones para doctores y empresas.
**Diagnóstico:** Sufren de un anti-patrón de frontend común.

- **Hallazgo 1: Navegación Basada en Estado.**
  - **Riesgo:** Usar `useState` para gestionar qué vista se muestra (ej. "Pestaña de Pacientes" vs "Pestaña de Agenda") en lugar de rutas URL reales. Esto impide compartir enlaces directos a una vista, rompe el botón de "atrás" del navegador y complica la gestión del estado.
  - **Ejemplo (Problema):**
    ```typescript
    // Archivo: /apps/doctors/src/app/dashboard/page.tsx
    const [activeTab, setActiveTab] = useState('overview');
    return (
      <>
        {activeTab === 'overview' && <Overview />}
        {activeTab === 'patients' && <PatientList />}
      </>
    )
    ```
  - **Acción:** Migrar a una arquitectura basada en rutas. Crear carpetas para cada vista (ej. `/dashboard/overview/page.tsx`, `/dashboard/patients/page.tsx`) y usar el componente `<Link>` de Next.js para la navegación.

### **3.4. `web-app`**
**Rol:** El portal público y de marketing.
**Diagnóstico:** Crisis de identidad y responsabilidades difusas.

- **Hallazgo 1: Mezcla de Contenido Público y Privado.**
  - **Riesgo:** La aplicación contiene rutas como [`/profile`](./apps/web-app/src/app/profile/) y componentes de `dashboard`, que pertenecen a un usuario autenticado. Esto hincha la aplicación pública y duplica lógica que debería estar en `patients` o `doctors`.
  - **Acción:** Mover toda la funcionalidad de usuario autenticado a las aplicaciones correspondientes y eliminarla de `web-app`. La `web-app` solo debe gestionar contenido público y los flujos de registro/login.

### **3.5. `packages`**
**Rol:** La base de código compartido.
**Diagnóstico:** Buena base, pero necesita ser formalizada.

- **Hallazgo 1: Paquetes sin Punto de Entrada.**
  - **Riesgo:** Sin un `index.ts` que exporte explícitamente la API pública de un paquete, los desarrolladores pueden importar archivos internos, creando acoplamiento frágil.
  - **Acción:** Añadir un archivo `index.ts` a la raíz de cada paquete en [`/packages/`](./packages/) (ej. `shared`, `medical`) que exporte todo lo que se supone que debe ser consumido por las aplicaciones.
