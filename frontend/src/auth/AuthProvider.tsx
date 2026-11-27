import { createContext, useCallback, useContext, type ReactNode } from 'react';
import { ClerkProvider, useAuth, useClerk } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import { useSignInAction } from './useSignInAction';
import { theme, tokens } from '../branding/theme';

type AuthState = {
  configured: boolean;
  loaded: boolean;
  signedIn: boolean;
  sessionId: string | null;
  userId: string | null;
  organizationId: string | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  getToken: () => Promise<string | null>;
};
const missing = async () => { throw new Error('Clerk is not configured'); };
const AuthContext = createContext<AuthState>({ configured: false, loaded: true, signedIn: false, sessionId: null, userId: null, organizationId: null, signIn: missing, signOut: missing, getToken: async () => null });
function ConnectedAuth({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn, sessionId, userId, orgId, getToken } = useAuth();
  const getSessionToken=useCallback(()=>getToken(),[getToken]);
  const clerk = useClerk();
  const signIn = useSignInAction();
  return <AuthContext.Provider value={{ configured: true, loaded: isLoaded, signedIn: Boolean(isSignedIn), sessionId:sessionId??null, userId: userId??null, organizationId:orgId??null, signIn, signOut: async () => { await clerk.signOut(); }, getToken:getSessionToken }}>{children}</AuthContext.Provider>;
}
export function AuthProvider({ children }: { children: ReactNode }) {
  const key = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!key) return <>{children}</>;
  return <ClerkProvider publishableKey={key} tokenCache={tokenCache} appearance={{
    variables: {
      fontFamily: tokens.fontFamily,
      fontFamilyButtons: tokens.fontFamily,
      colorPrimary: theme.primaryDark,
      colorBackground: theme.mainWhite,
      colorForeground: theme.primaryDark,
      colorMutedForeground: theme.mutedText,
      colorDanger: theme.error,
      colorInput: theme.mainWhite,
      borderRadius: '10px',
    },
  }}><ConnectedAuth>{children}</ConnectedAuth></ClerkProvider>;
}
export const useAppAuth = () => useContext(AuthContext);
