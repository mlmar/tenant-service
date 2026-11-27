import { createStore } from 'zustand/vanilla';
import type {ApplicationApi,ApplicationApiFactory,Profile,Admin,Permissions}from'../api/contracts';

interface Resource<T> {
  data: T;
  status: 'idle' | 'loading' | 'ready' | 'error';
  error: string;
}
export type Screen = 'home' | 'profile' | 'admin';

// State and its actions share one strictly typed public store contract.
export interface AppState {
  scope: string | null;
  screen: Screen;
  profile: Resource<Profile | null>;
  permissions: Resource<Permissions | null>;
  admins: Resource<Admin[]>;
  beginSession: (scope: string, getToken: () => Promise<string | null>) => void;
  resetSession: () => void;
  navigate: (screen: Screen) => void;
  refreshWorkspace: () => Promise<void>;
  loadProfile: () => Promise<void>;
  loadPermissions: () => Promise<void>;
  loadAdmins: () => Promise<void>;
  updateAvatar: (file?: File | string) => Promise<void>;
}
type Resources = Pick<AppState, 'profile' | 'permissions' | 'admins'>;
const idle = <T>(data: T): Resource<T> => ({ data, status: 'idle', error: '' });
const initial = () => ({
  scope: null,
  screen: 'home' as Screen,
  profile: idle<Profile | null>(null),
  permissions: idle<Permissions | null>(null),
  admins: idle<Admin[]>([]),
});

/** In-memory Zustand state. Tokens and private account data are never persisted. */
export function createAppStore(apiFactory: ApplicationApiFactory) {
  let api: ApplicationApi | undefined;
  let generation = 0;
  const requests = new Map<string, { controller: AbortController; promise: Promise<void> }>();
  const abort = (name: string) => {
    requests.get(name)?.controller.abort();
    requests.delete(name);
  };
  const abortAll = () => { for (const name of requests.keys()) abort(name); };

  return createStore<AppState>()((set, get) => {
    async function load<K extends keyof Resources>(key: K, read: (api:ApplicationApi,signal:AbortSignal)=>Promise<Resources[K]['data']>, message: string) {
      if (!api || !get().scope) return;
      const existing = requests.get(key);
      if (existing) return existing.promise;
      const client = api;
      const current = generation;
      const controller = new AbortController();
      set(state => ({ [key]: { ...state[key], status: 'loading', error: '' } }) as Partial<AppState>);
      const promise = (async () => {
        try {
          const data = await Promise.resolve().then(() => read(client,controller.signal));
          if (current === generation && !controller.signal.aborted) {
            set({ [key]: { data, status: 'ready', error: '' } } as Partial<AppState>);
          }
        } catch {
          if (current === generation && !controller.signal.aborted) {
            set(state => ({ [key]: { ...state[key], status: 'error', error: message } }) as Partial<AppState>);
          }
        } finally {
          if (requests.get(key)?.controller === controller) requests.delete(key);
        }
      })();
      requests.set(key, { controller, promise });
      return promise;
    }

    return {
      ...initial(),
      beginSession(scope, getToken) {
        if (get().scope === scope) return;
        generation++;
        abortAll();
        api = apiFactory(getToken);
        set({ ...initial(), scope });
        void get().refreshWorkspace();
      },
      resetSession() {
        generation++;
        abortAll();
        api = undefined;
        set(initial());
      },
      navigate: screen => set({ screen }),
      async refreshWorkspace() {
        await Promise.all([get().loadProfile(), get().loadPermissions()]);
      },
      loadProfile: () => load('profile', (api,signal)=>api.profile.getProfile(signal), 'Unable to load your profile. Please try again.'),
      loadPermissions: () => load('permissions', (api,signal)=>api.admin.getPermissions(signal), 'We couldn’t connect to your workspace. Please try again shortly.'),
      loadAdmins: () => load('admins', (api,signal)=>api.admin.listAdmins(signal), 'Administration is temporarily unavailable.'),
      async updateAvatar(file) {
        if (!api || !get().scope) throw Error('Sign in required');
        if (requests.has('avatar')) throw Error('A photo update is already in progress');
        const client = api;
        const current = generation;
        abort('profile');
        const controller = new AbortController();
        requests.set('avatar', { controller, promise: Promise.resolve() });
        try {
          const profile = file
            ? await client.profile.updateAvatar(file,controller.signal)
            : await client.profile.removeAvatar(controller.signal);
          if (current !== generation || controller.signal.aborted) return;
          // A read started before the write completed cannot overwrite the new photo.
          abort('profile');
          set({ profile: { data: profile, status: 'ready', error: '' } });
        } finally {
          if (requests.get('avatar')?.controller === controller) {
            requests.delete('avatar');
            if (current === generation && get().profile.status === 'loading') {
              set(state => ({ profile: { ...state.profile, status: state.profile.data ? 'ready' : 'idle' } }));
            }
          }
        }
      },
    };
  });
}

