import type { RequestHandler } from 'express';
import type { AdminApi } from './api.js';
import { action } from '../http/action.js';
import { principal } from '../http/authentication.js';

export interface AdminController {
  getPermissions: RequestHandler;
  listAdmins: RequestHandler;
}
export function createAdminController(api: AdminApi): AdminController {
  return {
    getPermissions: action(
      (_request, response) => api.getPermissions(principal(response).userId),
      'Permissions temporarily unavailable',
    ),
    listAdmins: action(
      (_request, response) => api.listAdmins(principal(response).userId),
      'Administration temporarily unavailable',
    ),
  };
}
