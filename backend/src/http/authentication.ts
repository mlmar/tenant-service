import { getAuth } from '@clerk/express';
import type { RequestHandler, Response } from 'express';
export interface Principal {
    userId: string;
    organizationId: string | null;
}
export const requireAuthentication: RequestHandler = (request, response, next) => {
    const auth = getAuth(request);
    if (!auth.isAuthenticated || !auth.userId) {
        response.status(401).json({ error: 'Authentication required' });
        return;
    }
    response.locals.principal = { userId: auth.userId, organizationId: auth.orgId ?? null } satisfies Principal;
    next();
};
export const principal = (response: Response) => response.locals.principal as Principal;
