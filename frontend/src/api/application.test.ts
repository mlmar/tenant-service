import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createApplicationApi } from './application';
import { ApiError } from './client';

test('feature adapter maps operations, authentication, cancellation and admin envelope', async () => {
  const calls: { url: string; init?: RequestInit }[] = [];
  const request: typeof fetch = async (url, init) => {
    calls.push({ url: String(url), init });
    return Response.json(String(url).endsWith('/admin/platform-admins') ? { admins: [{ clerk_user_id: 'admin' }] } : { clerk_user_id: 'user' });
  };
  const api = createApplicationApi(async () => 'token', request);
  const signal = new AbortController().signal;
  await api.profile.getProfile(signal);
  assert.ok(calls[0].url.endsWith('/me/profile'));
  assert.equal(calls[0].init?.signal, signal);
  assert.equal(new Headers(calls[0].init?.headers).get('Authorization'), 'Bearer token');
  const photo = new File(['photo'], 'avatar.png', { type: 'image/png' });
  await api.profile.updateAvatar(photo);
  assert.equal(calls[1].init?.method, 'PUT');
  assert.equal(calls[1].init?.body, photo);
  await api.profile.removeAvatar();
  assert.equal(calls[2].init?.method, 'DELETE');
  assert.deepEqual(await api.admin.listAdmins(), [{ clerk_user_id: 'admin' }]);
});

test('missing credentials and canceled reads never dispatch HTTP', async () => {
  let requests = 0;
  const request: typeof fetch = async () => { requests++; return Response.json({}); };
  await assert.rejects(createApplicationApi(async () => null, request).profile.getProfile(), (error: unknown) => error instanceof ApiError && error.status === 401);
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(createApplicationApi(async () => 'token', request).profile.getProfile(controller.signal), { name: 'AbortError' });
  assert.equal(requests, 0);
});

test('HTTP failures retain their status at the adapter boundary', async () => {
  const request: typeof fetch = async () => new Response(null, { status: 403 });
  await assert.rejects(createApplicationApi(async () => 'token', request).admin.getPermissions(), (error: unknown) => error instanceof ApiError && error.status === 403);
});
