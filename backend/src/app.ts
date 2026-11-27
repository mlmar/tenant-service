import {createProfileController}from'./profile/controller.js';
import {createAdminController}from'./admin/controller.js';
import {createSessionController}from'./session/controller.js';
import express from 'express';
import cors from 'cors';
import { resolve, extname } from 'node:path';
import { existsSync } from 'node:fs';
import { clerkMiddleware } from '@clerk/express';
import { createApplicationApis, type ApplicationApis } from './application.js';
import { createProfileRouter } from './profile/routes.js';
import { createAdminRouter } from './admin/routes.js';
import { createSessionRouter } from './session/routes.js';
export function createHttpApplication(apis?: ApplicationApis) {
    const app = express();
    app.disable('x-powered-by');
    app.use(cors({ origin: (process.env.CORS_ORIGINS ?? 'http://localhost:8081').split(',') }));
    app.use(express.json({ limit: '32kb' }));
    app.get('/api/health', (_request, response) => response.json({ status: 'ok', service: 'tenant-service-api' }));
    if (process.env.CLERK_SECRET_KEY && process.env.CLERK_PUBLISHABLE_KEY) {
        app.use('/api', clerkMiddleware({
            authorizedParties: (process.env.CLERK_AUTHORIZED_PARTIES ?? 'http://localhost:8081').split(',').map(value => value.trim()).filter(Boolean),
        }));
        const api = apis ?? createApplicationApis();
        app.use('/api/me/profile', createProfileRouter(createProfileController(api.profile)));
        app.use('/api', createAdminRouter(createAdminController(api.admin)));
        app.use('/api', createSessionRouter(createSessionController(api.session)));
    }
    else {
        app.get('/api/session', (_request, response) => { response.status(503).json({ error: 'Authentication is not configured' }); });
    }
    app.use('/api', (_request, response) => { response.status(404).json({ error: 'Not found' }); });
    if (process.env.STATIC_DIRECTORY) {
        const directory = resolve(process.env.STATIC_DIRECTORY);
        if (!existsSync(resolve(directory, 'index.html')))
            throw new Error('STATIC_DIRECTORY must contain the built web app');
        app.use(express.static(directory));
        app.get('/{*path}', (request, response, next) => {
            if (extname(request.path) || !request.accepts('html')) {
                next();
                return;
            }
            response.sendFile(resolve(directory, 'index.html'));
        });
    }
    return app;
}
