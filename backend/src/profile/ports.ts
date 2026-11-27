import type { AvatarInput } from './api.js';
export interface ProfileRecord {
    clerk_user_id: string;
    name: string;
    email: string;
    platform_role: 'platform_admin' | 'user';
    status: 'active' | 'disabled';
    avatar_path: string | null;
}
export interface UserIdentity {
    name: string;
    email: string;
}
export interface ProfileTransaction {
    findUser(): Promise<ProfileRecord | undefined>;
    insertUser(identity: UserIdentity): Promise<ProfileRecord>;
    setAvatar(path: string | null): Promise<ProfileRecord>;
    queueCleanup(path: string): Promise<void>;
    pendingCleanup(): Promise<string[]>;
    completeCleanup(path: string): Promise<void>;
}
export interface ProfileRepository {
    transaction<T>(userId: string, work: (transaction: ProfileTransaction) => Promise<T>): Promise<T>;
}
export interface IdentityDirectory {
    getUser(userId: string): Promise<UserIdentity>;
}
export interface AvatarStorage {
    upload(path: string, image: Buffer): Promise<void>;
    remove(path: string): Promise<void>;
    signedUrl(path: string): Promise<string>;
}
export interface AvatarProcessor {
    prepare(input: AvatarInput): Promise<Buffer>;
}
