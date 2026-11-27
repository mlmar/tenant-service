import { useEffect } from 'react';
import { useAppStore } from '../state/useAppStore';

export function usePlatformAdmins() {
  const admins = useAppStore(state => state.admins.data);
  const error = useAppStore(state => state.admins.error);
  const status = useAppStore(state => state.admins.status);
  const load = useAppStore(state => state.loadAdmins);
  useEffect(() => { void load(); }, [load]);
  return {
    admins,
    status: error || (status === 'idle' || status === 'loading' ? 'Loading administrators…' : ''),
    retry: () => { void load(); },
  };
}
