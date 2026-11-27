import type { RequestHandler } from 'express';
import type { SessionApi } from './api.js';
import { action } from '../http/action.js';
import { principal } from '../http/authentication.js';

export interface SessionController { getSession: RequestHandler }
export function createSessionController(api: SessionApi): SessionController {
  return {
    getSession: action(
      (_request, response) => api.getSession(principal(response)),
      'Session temporarily unavailable',
    ),
  };
}
