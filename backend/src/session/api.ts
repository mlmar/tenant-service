export interface SessionIdentity {
    userId: string;
    organizationId: string | null;
}
export interface SessionApi {
    getSession(identity: SessionIdentity): {
        authenticated: true;
        userId: string;
        organizationId: string | null;
    };
}
