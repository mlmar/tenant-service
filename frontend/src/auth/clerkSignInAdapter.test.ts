import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createClerkSignInApi } from './clerkSignInAdapter';

test('password sign-in activates the completed session once', async () => {
  const inputs: unknown[] = [];
  const sessions: unknown[] = [];
  const clerk = {
    client: { signIn: { create: async (input: unknown) => { inputs.push(input); return { status: 'complete', createdSessionId: 'session' }; } } },
    setActive: async (input: unknown) => { sessions.push(input); },
  };
  const api = createClerkSignInApi(() => clerk as unknown as ReturnType<Parameters<typeof createClerkSignInApi>[0]>);
  assert.equal(await api.signIn({ email: ' user@example.com ', password: 'fixture-password' }), 'complete');
  assert.deepEqual(inputs, [{ strategy: 'password', identifier: 'user@example.com', password: 'fixture-password' }]);
  assert.deepEqual(sessions, [{ session: 'session' }]);
});

test('trust verification prepares email code instead of requesting password again', async () => {
  const factors: unknown[] = [];
  const clerk = { client: { signIn: { create: async () => ({ status: 'needs_client_trust', createdSessionId: null, supportedSecondFactors: [{ strategy: 'email_code' }], prepareSecondFactor: async (input: unknown) => { factors.push(input); } }) } } };
  const api = createClerkSignInApi(() => clerk as unknown as ReturnType<Parameters<typeof createClerkSignInApi>[0]>);
  assert.equal(await api.signIn({ email: 'user@example.com', password: 'fixture' }), 'verification-required');
  assert.deepEqual(factors, [{ strategy: 'email_code' }]);
});

test('provider errors are mapped to user-facing failures', async () => {
  const clerk = { client: { signIn: { create: async () => { throw { errors: [{ longMessage: 'Incorrect password.' }] }; } } } };
  const api = createClerkSignInApi(() => clerk as unknown as ReturnType<Parameters<typeof createClerkSignInApi>[0]>);
  await assert.rejects(api.signIn({ email: 'user@example.com', password: 'fixture' }), { message: 'Incorrect password.' });
});
