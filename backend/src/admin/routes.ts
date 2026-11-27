import { Router, type RequestHandler } from 'express';
import type { AdminController } from './controller.js';
import { requireAuthentication } from '../http/authentication.js';

export function createAdminRouter(controller: AdminController, authenticate: RequestHandler = requireAuthentication) {
  const router = Router();
  router.use(authenticate);
  router.get('/me/permissions', controller.getPermissions);
  router.get('/admin/platform-admins', controller.listAdmins);
  return router;
}
