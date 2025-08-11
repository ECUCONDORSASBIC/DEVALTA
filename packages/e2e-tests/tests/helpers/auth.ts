import { APIRequestContext, Page } from '@playwright/test';

const API_BASE = process.env.API_BASE_URL || 'http://localhost:3001';

export type Credentials = { email: string; password: string };

export async function loginViaApi(
  ctx: APIRequestContext,
  creds: Credentials
): Promise<{ status: number; body: any }> {
  const res = await ctx.post(`${API_BASE}/api/v1/auth/sso`, {
    data: creds,
    headers: { 'Content-Type': 'application/json' },
  });
  let body: any = null;
  try {
    body = await res.json();
  } catch {}
  return { status: res.status(), body };
}

export async function persistAuthToPage(
  ctx: APIRequestContext,
  page: Page,
  storagePath: string
) {
  // Sincroniza cookies del contexto API hacia el browser context
  const state = await ctx.storageState();
  if (state.cookies?.length) {
    await page.context().addCookies(
      state.cookies.map((c) => ({
        name: c.name,
        value: c.value,
        domain: c.domain || 'localhost',
        path: c.path || '/',
        httpOnly: c.httpOnly,
        secure: !!c.secure,
        sameSite: (c.sameSite as any) || 'Lax',
        expires: c.expires,
      }))
    );
  }
  await page.context().storageState({ path: storagePath });
}

export async function loginAndSaveState(
  ctx: APIRequestContext,
  page: Page,
  creds: Credentials,
  storagePath: string
) {
  const { status } = await loginViaApi(ctx, creds);
  if (![200, 201].includes(status)) {
    throw new Error(`Login API failed with status ${status}`);
  }
  await persistAuthToPage(ctx, page, storagePath);
}
