# @altamedica/e2e-tests

E2E smoke tests (Playwright) for API and optional UI.

- API health tests hit http://localhost:3001/api/v1/health.\*
- UI test is optional; set E2E_FRONTEND=1 and ensure the web app runs at BASE_URL (default http://localhost:3000).

## Run

pnpm --filter @altamedica/e2e-tests test

Optionally install browsers first:

pnpm --filter @altamedica/e2e-tests exec playwright install
