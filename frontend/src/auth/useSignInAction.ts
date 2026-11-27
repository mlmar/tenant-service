import { useHostedAuth } from '@clerk/expo/hosted-auth';
export function useSignInAction(): () => Promise<void> {
  const { startHostedAuth } = useHostedAuth();
  return async () => { await startHostedAuth({ mode: 'sign-in' }); };
}
