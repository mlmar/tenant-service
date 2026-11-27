import { createApiClient } from './client';
import type { Admin, ApplicationApi, Permissions, Profile } from './contracts';

/** Endpoint paths, HTTP methods and response envelopes belong to this adapter. */
export function createApplicationApi(
  getToken: () => Promise<string | null>,
  request: typeof fetch = fetch,
): ApplicationApi {
  const http = createApiClient(getToken, request);
  return {
    profile: {
      getProfile: signal => http<Profile>('/me/profile', { signal }),
      updateAvatar: (file, signal) => http<Profile>('/me/profile/avatar', { method: 'PUT', file, signal }),
      removeAvatar: signal => http<Profile>('/me/profile/avatar', { method: 'DELETE', signal }),
    },
    admin: {
      getPermissions: signal => http<Permissions>('/me/permissions', { signal }),
      async listAdmins(signal) {
        return (await http<{ admins: Admin[] }>('/admin/platform-admins', { signal })).admins;
      },
    },
  };
}
