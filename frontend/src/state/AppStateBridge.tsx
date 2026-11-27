import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react';
import { AppState, Platform } from 'react-native';
import { useAppAuth } from '../auth/AuthProvider';
import { appStore } from './appStore';

/** Clerk owns identity. This bridge responds to lifecycle events, never polling timers. */
export function AppStateBridge({ children }: { children: ReactNode }) {
  const auth = useAppAuth();
  const token = useRef(auth.getToken);
  token.current = auth.getToken;
  useLayoutEffect(() => {
    if (!auth.loaded) return;
    if (auth.signedIn && auth.userId) {
      appStore.getState().beginSession(
        `${auth.sessionId}:${auth.userId}:${auth.organizationId ?? ''}`,
        () => token.current(),
      );
    } else {
      appStore.getState().resetSession();
    }
    return () => appStore.getState().resetSession();
  }, [auth.loaded, auth.signedIn, auth.sessionId, auth.userId, auth.organizationId]);

  useEffect(() => {
    const refresh = () => { void appStore.getState().refreshWorkspace(); };
    if (Platform.OS === 'web') {
      const visible = () => { if (document.visibilityState === 'visible') refresh(); };
      window.addEventListener('focus', refresh);
      window.addEventListener('online', refresh);
      document.addEventListener('visibilitychange', visible);
      return () => {
        window.removeEventListener('focus', refresh);
        window.removeEventListener('online', refresh);
        document.removeEventListener('visibilitychange', visible);
      };
    }
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') refresh();
    });
    return () => subscription.remove();
  }, []);
  return children;
}
