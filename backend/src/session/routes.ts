import { Router, type RequestHandler } from 'express';
import type { SessionController } from './controller.js';
import { requireAuthentication } from '../http/authentication.js';

export function createSessionRouter(controller: SessionController, authenticate: RequestHandler = requireAuthentication) {
  const router = Router();
  router.get('/session', authenticate, controller.getSession);
  return router;
}
