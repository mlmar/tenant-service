import type { PoolClient } from 'pg';
import { pool } from './connection.js';
const schema=process.env.DATABASE_SCHEMA;
if(schema && !['tenant_service_dev','tenant_service_prod'].includes(schema))throw Error('Invalid schema');
export async function userTransaction<T>(userId:string,work:(client:PoolClient,table:string)=>Promise<T>){
 if(!pool)throw Error('Database unavailable');const client=await pool.connect();
 try{await client.query('BEGIN');await client.query(`SET LOCAL ROLE ${schema}_api`);await client.query("SELECT set_config('app.clerk_user_id',$1,true)",[userId]);await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',[userId]);const result=await work(client,`${schema}.users`);await client.query('COMMIT');return result;}
 catch(error){await client.query('ROLLBACK');throw error;}finally{client.release();}
}
