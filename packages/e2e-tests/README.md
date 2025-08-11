# @altamedica/e2e-tests

E2E smoke tests (Playwright) para API y UI de la plataforma.

- API health pega a http://localhost:3001/api/v1/health.*
- UI smoke opcional para web-app (3000).

## Requisitos

- Servicios locales levantados (mínimo api-server y web-app)
- Playwright instalado: `pnpm --filter @altamedica/e2e-tests exec playwright install`

## Ejecutar

`pnpm --filter @altamedica/e2e-tests test`

Variables opcionales:
- `API_BASE_URL` (default http://localhost:3001)
- `WEB_BASE_URL` (default http://localhost:3000)
