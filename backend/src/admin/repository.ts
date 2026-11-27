import type { AdminRepository, PlatformAdmin } from './api.js';
import { pool } from '../db/connection.js';
const schema = process.env.DATABASE_SCHEMA;
if (pool && !['tenant_service_dev', 'tenant_service_prod'].includes(schema ?? ''))
    throw new Error('Explicit DATABASE_SCHEMA is required');
export const adminRepository: AdminRepository = { async query(userId: string, list = false) {
        if (!pool)
            throw new Error('Admin database unavailable');
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            await client.query(`SET LOCAL ROLE ${schema}_api`);
            await client.query("SELECT set_config('app.clerk_user_id', $1, true)", [userId]);
            const check = await client.query(`SELECT ${schema}.is_platform_admin($1) AS allowed`, [userId]);
            const allowed = check.rows[0]?.allowed === true;
            const rows = allowed && list ? (await client.query<PlatformAdmin>(`SELECT clerk_user_id, platform_role AS role, granted_at, granted_by, revoked_at FROM ${schema}.users WHERE platform_role='platform_admin' ORDER BY granted_at, clerk_user_id`)).rows : [];
            await client.query('COMMIT');
            return { allowed, rows };
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    } };
