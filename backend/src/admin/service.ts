import { ApplicationError } from '../applicationError.js';
import type { AdminApi, AdminRepository } from './api.js';
export class AdminService implements AdminApi {
    constructor(private readonly repository: AdminRepository) { }
    async getPermissions(userId: string) { return { platformAdmin: (await this.repository.query(userId)).allowed }; }
    async listAdmins(userId: string) {
        const result = await this.repository.query(userId, true);
        if (!result.allowed)
            throw new ApplicationError('forbidden', 'Platform administrator access required');
        return { admins: result.rows };
    }
}
