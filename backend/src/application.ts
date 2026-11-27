import type { ProfileApi } from './profile/api.js';
import type { AdminApi } from './admin/api.js';
import type { SessionApi } from './session/api.js';
import { ProfileService } from './profile/service.js';
import { profileRepository } from './profile/repository.js';
import { identityDirectory } from './profile/identity.js';
import { avatarStorageAdapter } from './profile/storage.js';
import { avatarProcessor } from './profile/images.js';
import { AdminService } from './admin/service.js';
import { adminRepository } from './admin/repository.js';
import { SessionService } from './session/service.js';
export interface ApplicationApis {
    profile: ProfileApi;
    admin: AdminApi;
    session: SessionApi;
}
/** Composition root: concrete adapters are selected here, never inside HTTP routes. */
export function createApplicationApis(): ApplicationApis {
    return {
        profile: new ProfileService(profileRepository, identityDirectory, avatarStorageAdapter, avatarProcessor),
        admin: new AdminService(adminRepository),
        session: new SessionService(),
    };
}
