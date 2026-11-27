import pg from 'pg';
import { readFileSync } from 'node:fs';
const connection = process.env.DATABASE_URL ? new URL(process.env.DATABASE_URL) : null;
const supabase = connection?.hostname.endsWith('.supabase.com') || connection?.hostname.endsWith('.supabase.co');
if (supabase) { connection?.searchParams.delete('sslmode'); connection?.searchParams.delete('sslrootcert'); }
export const pool = connection ? new pg.Pool({ connectionString: connection.toString(), max: 5, connectionTimeoutMillis: 5000, ...(supabase ? { ssl: { rejectUnauthorized: true, ca: readFileSync(new URL('../../certs/supabase-ca.crt', import.meta.url), 'utf8') } } : {}) }) : null;
