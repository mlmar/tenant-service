import { userTransaction } from '../db/userTransaction.js';
import type { ProfileRecord, ProfileRepository } from './ports.js';
/** SQL, RLS context, row/advisory locks and queue persistence stay in the database adapter. */
export const profileRepository: ProfileRepository = {
    transaction: (userId, work) => userTransaction(userId, async (client, table) => {
        const queue = table.replace(/users$/, 'avatar_cleanup');
        return work({
            async findUser() { return (await client.query<ProfileRecord>(`SELECT * FROM ${table} WHERE clerk_user_id=$1 FOR UPDATE`, [userId])).rows[0]; },
            async insertUser(identity) { return (await client.query<ProfileRecord>(`INSERT INTO ${table}(clerk_user_id,name,email) VALUES($1,$2,$3) RETURNING *`, [userId, identity.name, identity.email])).rows[0]; },
            async setAvatar(path) { return (await client.query<ProfileRecord>(`UPDATE ${table} SET avatar_path=$2,updated_at=now() WHERE clerk_user_id=$1 RETURNING *`, [userId, path])).rows[0]; },
            async queueCleanup(path) { await client.query(`INSERT INTO ${queue}(object_path,clerk_user_id) VALUES($1,$2) ON CONFLICT DO NOTHING`, [path, userId]); },
            async pendingCleanup() { return (await client.query<{
                object_path: string;
            }>(`SELECT object_path FROM ${queue} WHERE clerk_user_id=$1`, [userId])).rows.map(row => row.object_path); },
            async completeCleanup(path) { await client.query(`DELETE FROM ${queue} WHERE object_path=$1 AND clerk_user_id=$2`, [path, userId]); },
        });
    }),
};
