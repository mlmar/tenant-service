import { useAppStore } from '../state/useAppStore';

export function useProfile() {
  const profile = useAppStore(state => state.profile.data);
  const error = useAppStore(state => state.profile.error);
  const load = useAppStore(state => state.loadProfile);
  const update = useAppStore(state => state.updateAvatar);
  return {
    profile,
    error,
    upload: (file: File | string) => update(file),
    remove: () => update(),
    retry: () => { void load(); },
  };
}
