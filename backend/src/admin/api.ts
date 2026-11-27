export interface PlatformAdmin {
    clerk_user_id: string;
    role: string;
    granted_at: string;
    granted_by: string | null;
    revoked_at: string | null;
}
export interface AdminApi {
    getPermissions(userId: string): Promise<{
        platformAdmin: boolean;
    }>;
    listAdmins(userId: string): Promise<{
        admins: PlatformAdmin[];
    }>;
}
export interface AdminRepository {
    query(userId: string, list?: boolean): Promise<{
        allowed: boolean;
        rows: PlatformAdmin[];
    }>;
}
