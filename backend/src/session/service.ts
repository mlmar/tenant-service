import type { SessionApi, SessionIdentity } from './api.js';
export class SessionService implements SessionApi {
    getSession(identity: SessionIdentity) { return { authenticated: true as const, userId: identity.userId, organizationId: identity.organizationId }; }
}
