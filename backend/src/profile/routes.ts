import express, { Router, type RequestHandler } from 'express';
import type { ProfileController } from './controller.js';
import { requireAuthentication } from '../http/authentication.js';

export function createProfileRouter(controller: ProfileController, authenticate: RequestHandler = requireAuthentication) {
  const router = Router();
  router.use(authenticate);
  router.get('/', controller.getProfile);
  router.put('/avatar', express.raw({ type: () => true, limit: '5mb' }), controller.updateAvatar);
  router.delete('/avatar', controller.removeAvatar);
  router.use(controller.invalidBody);
  return router;
}
