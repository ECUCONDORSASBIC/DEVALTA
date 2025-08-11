import { expect, request, test } from '@playwright/test';

// Simple API health smoke

test('api health is healthy (summary)', async ({}) => {
  const api = await request.newContext();
  const res = await api.get('http://localhost:3001/api/v1/health');
  expect(res.ok()).toBeTruthy();
  const json = await res.json();
  expect(json).toMatchObject({ ok: true });
});

test('api health live and ready', async ({}) => {
  const api = await request.newContext();
  const live = await api.get('http://localhost:3001/api/v1/health/live');
  expect(live.ok()).toBeTruthy();
  const ready = await api.get('http://localhost:3001/api/v1/health/ready');
  expect(ready.ok()).toBeTruthy();
});
