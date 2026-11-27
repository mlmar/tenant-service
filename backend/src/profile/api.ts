export interface ProfileDto {
    clerk_user_id: string;
    name: string;
    email: string;
    platform_role: 'platform_admin' | 'user';
    avatar_url: string | null;
}
export interface AvatarInput {
    bytes: Buffer;
    contentType: string;
}
export interface ProfileApi {
    getProfile(userId: string): Promise<ProfileDto>;
    updateAvatar(userId: string, input: AvatarInput): Promise<ProfileDto>;
    removeAvatar(userId: string): Promise<ProfileDto>;
}
