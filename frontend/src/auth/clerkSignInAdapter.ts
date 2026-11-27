import type { useClerk } from '@clerk/expo';
import type { Credentials, SignInApi, SignInResult } from './signInApi';

type ClerkPort = Pick<ReturnType<typeof useClerk>, 'client' | 'setActive' | 'openSignIn' | 'openSignUp'>;
interface Attempt {
  status: string | null;
  createdSessionId: string | null;
  supportedSecondFactors?: readonly { strategy: string }[] | null;
  prepareSecondFactor(input: { strategy: 'email_code' }): Promise<unknown>;
}
function signInFailure(cause: unknown): Error {
  const failure = cause as { errors?: { longMessage?: string; message?: string }[] } | null;
  return Error(failure?.errors?.[0]?.longMessage ?? failure?.errors?.[0]?.message ?? 'Unable to sign in. Please try again.');
}

/** All Clerk-specific protocol, result mapping and activation stay in this adapter. */
export function createClerkSignInApi(getClerk: () => ClerkPort, origin = () => window.location.origin): SignInApi {
  async function finish(attempt: Attempt): Promise<SignInResult> {
    if (attempt.status === 'complete' && attempt.createdSessionId) {
      await getClerk().setActive({ session: attempt.createdSessionId });
      return 'complete';
    }
    if ((attempt.status === 'needs_second_factor' || attempt.status === 'needs_client_trust') &&
      attempt.supportedSecondFactors?.some(factor => factor.strategy === 'email_code')) {
      await attempt.prepareSecondFactor({ strategy: 'email_code' });
      return 'verification-required';
    }
    return 'recovery-required';
  }
  async function run(attempt: () => Promise<Attempt>) {
    try { return await finish(await attempt()); }
    catch (cause) { throw signInFailure(cause); }
  }
  return {
    isReady: () => Boolean(getClerk().client),
    signIn: ({ email, password }: Credentials) => run(async () => {
      const client = getClerk().client;
      if (!client) throw Error('Clerk unavailable');
      return client.signIn.create({ strategy: 'password', identifier: email.trim(), password });
    }),
    verify: code => run(async () => {
      const client = getClerk().client;
      if (!client) throw Error('Clerk unavailable');
      return client.signIn.attemptSecondFactor({ strategy: 'email_code', code });
    }),
    openRecovery: () => { getClerk().openSignIn({ forceRedirectUrl: origin() }); },
    openRegistration: () => { getClerk().openSignUp({ forceRedirectUrl: origin() }); },
  };
}

