# AltaMedica – Plan de Desarrollo a Lanzamiento (Detalle Operativo)

Este documento baja el plan ejecutivo a un nivel operativo por carpetas, subcarteras (workstreams) y referencias a código real del monorepo pnpm. Las fechas, responsables y desglose de issues/milestones se generan desde `.github/tracker/roadmap.yaml` con el script `tools/scripts/sync_github_tracker.js`.

## Resumen rápido

- Monorepo: Next.js (App Router) en apps/\* y backend central en apps/api-server.
- Tipado/validación: `@altamedica/types` (TS+Zod) como contrato.
- Datos: TanStack Query + hooks compartidos.
- Seguridad/HIPAA: JWT solo en cookies HttpOnly/Secure desde api-server; sin localStorage.
- Mapa/Leaflet (Companies): SSR-safe con `dynamic(..., { ssr:false })` y evento `map:invalidate-size`.
- Dev, QA, UAT, Piloto, Go-live en 12 semanas (ver milestones en roadmap.yaml).

## Workstreams (subcarteras) y rutas de código

1. API Server (Backend central)

- Carpeta: `apps/api-server/`
- Tareas núcleo:
  - Auth endpoints `/api/v1/auth/*` y seteo de cookies: `apps/api-server/src/routes/auth/*`.
  - Contratos y validaciones Zod: `packages/types/` y uso en controladores.
  - Observabilidad/logs: `apps/api-server/src/observability/*` (si no existe, crear módulo `logging.ts`).
  - Seguridad: CORS estricto, rate limiting, RBAC por rol.

2. Tipos, clientes y UI compartida

- Carpeta: `packages/types/` (Zod + TS), `packages/api-client/`, `packages/ui/`.
- Tareas:
  - Sincronizar Zod schemas con endpoints reales.
  - Hooks TanStack Query generados: `tools/python/frontend_hook_generator.py` y consumo en apps/\*.
  - Componentes accesibles (WCAG) en `packages/ui/`.

3. Patients App

- Carpeta: `apps/patients/`
- Referencias:
  - Layout con QueryProvider/AuthProvider: `apps/patients/src/app/layout.tsx`.
  - Telemedicina: `apps/patients/src/components/telemedicine/patientvideocall.tsx`.
  - Autenticación y redirecciones por rol: middleware y páginas de login.

4. Doctors App

- Carpeta: `apps/doctors/`
- Referencias:
  - Agenda y sala de espera: `apps/doctors/src/*` (crear módulo `appointments/` si falta).
  - Telemedicina base compatible con Patients.

5. Companies App (Marketplace + Mapas)

- Carpeta: `apps/companies/`
- Referencias:
  - Mapa SSR-safe: `apps/companies/src/components/MarketplaceMap.tsx`.
  - Página Marketplace: `apps/companies/src/app/marketplace/page.tsx` con evento `map:invalidate-size`.
  - Handler de recarga de chunks en dev con `?nocache` en `apps/companies/src/app/layout.tsx`.
  - Ejecutar sin Turbopack (ajustado en scripts).

6. Admin App

- Carpeta: `apps/admin/`
- Tareas: gestión de usuarios/roles, catálogos, paneles de soporte.

7. Web App (público)

- Carpeta: `apps/web-app/`
- Tareas: landing, páginas informativas, métricas Web Vitals.

8. QA y E2E

- Carpeta: `packages/e2e-tests/` (si existe) o `apps/*/e2e/`.
- Tareas: smoke de login, consulta, marketplace; accesibilidad con axe; cross-browser básico.

9. DevOps/Observabilidad

- Carpetas: `config/*` (nginx, monitoring, grafana, prometheus, redis), `.github/` (CI/CD), `docs/` (runbooks).
- Tareas: pipelines con gates, dashboards y alertas, sourcemaps, error boundaries.

## Línea de tiempo por milestones (estimado)

- M0 – Kickoff y Setup (Due: 2025-08-15)
- M1 – Fundaciones Técnicas (Due: 2025-08-29)
- M2 – Funcionalidad Núcleo (Due: 2025-09-26)
- M3 – Integraciones, Seguridad y Performance (Due: 2025-10-10)
- M4 – QA Integral (Due: 2025-10-17)
- M5 – UAT (Due: 2025-10-24)
- M6 – Piloto (Due: 2025-10-31)
- M7 – Go-live (Due: 2025-11-07)

## Definición de Hecho (DoD) por feature

- Tipado en `@altamedica/types` + validaciones Zod.
- Hooks TanStack Query tipados y cache invalidation definido.
- Tests unitarios/integración OK; E2E del flujo afectado.
- Lint/Typecheck/Build sin errores.
- Seguridad: cookies HttpOnly/Secure; sin PHI en cliente; CORS/rate limiting.
- Documentación de contrato y notas de migración.

## Riesgos y mitigación

- Autenticación/cookies multi-navegador: pruebas exhaustivas y métricas.
- Performance mapas: `dynamic ssr:false`, `map.invalidateSize()` y carga diferida.
- Cambios de contrato: versionado en `packages/types`, changelog y pruebas contractuales.

## Cómo materializar el plan en el tracker

1. Revisar y completar owners en `.github/tracker/roadmap.yaml` (GitHub handles válidos).
2. Exportar `GITHUB_TOKEN` con permisos de issues.
3. Ejecutar `node tools/scripts/sync_github_tracker.js`.
4. Verificar milestones, labels e issues en el repo.

---

Este documento se mantiene sincronizado con el YAML/JSON de roadmap. Cualquier cambio de alcance/fechas debe actualizarse primero en `.github/tracker/roadmap.yaml` o `.github/tracker/roadmap.json`.
