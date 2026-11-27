import type { Request, RequestHandler, Response } from 'express';
import { ApplicationError, type ApplicationErrorCode } from '../applicationError.js';
const status: Record<ApplicationErrorCode, number> = { account_disabled: 403, forbidden: 403, unsupported_image: 415, invalid_image: 400 };
/** One transport adapter for consistent, non-sensitive application error responses. */
export function action(handle: (request: Request, response: Response) => Promise<unknown> | unknown, unavailable: string): RequestHandler {
    return async (request, response) => {
        try {
            response.json(await handle(request, response));
        }
        catch (error) {
            response.status(error instanceof ApplicationError ? status[error.code] : 503).json({ error: error instanceof ApplicationError ? error.message : unavailable });
        }
    };
}
