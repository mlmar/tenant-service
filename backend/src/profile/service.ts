import { randomUUID } from 'node:crypto';
import { ApplicationError } from '../applicationError.js';
import type { AvatarInput, ProfileApi, ProfileDto } from './api.js';
import type { AvatarProcessor, AvatarStorage, IdentityDirectory, ProfileRecord, ProfileRepository, ProfileTransaction } from './ports.js';
export class ProfileService implements ProfileApi {
    constructor(private readonly repository: ProfileRepository, private readonly identities: IdentityDirectory, private readonly storage: AvatarStorage, private readonly images: AvatarProcessor, private readonly newId: () => string = randomUUID, private readonly cleanupDeferred: () => void = () => console.error('Avatar cleanup deferred')) { }
    private active(row: ProfileRecord | undefined): asserts row is ProfileRecord {
        if (!row || row.status !== 'active')
            throw new ApplicationError('account_disabled', 'Account disabled');
    }
    private async ensureUser(userId: string) {
        return this.repository.transaction(userId, async (transaction) => {
            const existing = await transaction.findUser();
            return existing ?? transaction.insertUser(await this.identities.getUser(userId));
        });
    }
    private async response(row: ProfileRecord): Promise<ProfileDto> {
        return { clerk_user_id: row.clerk_user_id, name: row.name, email: row.email, platform_role: row.platform_role, avatar_url: row.avatar_path ? await this.storage.signedUrl(row.avatar_path) : null };
    }
    private async queuePrevious(transaction: ProfileTransaction, row: ProfileRecord) {
        if (row.avatar_path)
            await transaction.queueCleanup(row.avatar_path);
    }
    private async cleanup(userId: string) {
        try {
            await this.repository.transaction(userId, async (transaction) => {
                for (const path of await transaction.pendingCleanup()) {
                    try {
                        await this.storage.remove(path);
                        await transaction.completeCleanup(path);
                    }
                    catch {
                        this.cleanupDeferred();
                    }
                }
            });
        }
        catch {
            this.cleanupDeferred();
        }
    }
    async getProfile(userId: string) {
        const row = await this.ensureUser(userId);
        this.active(row);
        await this.cleanup(userId);
        return this.response(row);
    }
    async updateAvatar(userId: string, input: AvatarInput) {
        const image = await this.images.prepare(input);
        const row = await this.ensureUser(userId);
        this.active(row);
        const path = `${userId}/${this.newId()}.webp`;
        let uploaded = false, committed = false;
        try {
            const result = await this.repository.transaction(userId, async (transaction) => {
                const current = await transaction.findUser();
                this.active(current);
                await this.storage.upload(path, image);
                uploaded = true;
                const updated = await transaction.setAvatar(path);
                await this.queuePrevious(transaction, current);
                return this.response(updated);
            });
            committed = true;
            await this.cleanup(userId);
            return result;
        }
        catch (error) {
            if (uploaded && !committed)
                await this.storage.remove(path).catch(this.cleanupDeferred);
            throw error;
        }
    }
    async removeAvatar(userId: string) {
        const row = await this.ensureUser(userId);
        this.active(row);
        const result = await this.repository.transaction(userId, async (transaction) => {
            const current = await transaction.findUser();
            this.active(current);
            const updated = await transaction.setAvatar(null);
            await this.queuePrevious(transaction, current);
            return this.response(updated);
        });
        await this.cleanup(userId);
        return result;
    }
}
