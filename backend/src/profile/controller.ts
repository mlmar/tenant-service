import type { ErrorRequestHandler, RequestHandler } from 'express';
import type { ProfileApi } from './api.js';
import { action } from '../http/action.js';
import { principal } from '../http/authentication.js';

export interface ProfileController {
  getProfile: RequestHandler;
  updateAvatar: RequestHandler;
  removeAvatar: RequestHandler;
  invalidBody: ErrorRequestHandler;
}

/** HTTP adaptation only. ProfileApi owns the application behavior. */
export function createProfileController(api: ProfileApi): ProfileController {
  return {
    getProfile: action(
      (_request, response) => api.getProfile(principal(response).userId),
      'Profile temporarily unavailable',
    ),
    updateAvatar: action(
      (request, response) => api.updateAvatar(principal(response).userId, {
        bytes: request.body as Buffer,
        contentType: request.get('content-type') ?? '',
      }),
      'Unable to save avatar',
    ),
    removeAvatar: action(
      (_request, response) => api.removeAvatar(principal(response).userId),
      'Unable to remove avatar',
    ),
    invalidBody: (error: { type?: string }, _request, response, _next) => {
      const oversized = error.type === 'entity.too.large';
      response.status(oversized ? 413 : 400).json({
        error: oversized ? 'Image must be 5 MB or smaller' : 'Invalid image request',
      });
    },
  };
}
