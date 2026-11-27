export interface Profile {
  clerk_user_id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  platform_role: 'platform_admin' | 'user';
}
export interface Admin {
  clerk_user_id: string;
  role: string;
  granted_at: string;
  revoked_at: string | null;
}
export interface Permissions { platformAdmin: boolean }
export interface ProfileApi {
  getProfile(signal?: AbortSignal): Promise<Profile>;
  updateAvatar(file: File | string, signal?: AbortSignal): Promise<Profile>;
  removeAvatar(signal?: AbortSignal): Promise<Profile>;
}
export interface AdminApi {
  getPermissions(signal?: AbortSignal): Promise<Permissions>;
  listAdmins(signal?: AbortSignal): Promise<Admin[]>;
}
export interface ApplicationApi { profile: ProfileApi; admin: AdminApi }
export type ApplicationApiFactory = (getToken: () => Promise<string | null>) => ApplicationApi;
