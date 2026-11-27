import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { adminRepository } from './repository.js';
import { pool } from '../db/connection.js';

const testUrl = process.env.ADMIN_TEST_DATABASE_URL;
if (testUrl) {
  const { hostname } = new URL(testUrl);
  if (process.env.DATABASE_URL !== testUrl || !['127.0.0.1', 'localhost', '[::1]'].includes(hostname)) {
    throw Error('Use matching database URLs for a disposable local PostgreSQL instance');
  }
  if (process.env.DATABASE_SCHEMA !== 'tenant_service_dev') {
    throw Error('Set DATABASE_SCHEMA=tenant_service_dev for the isolated database test');
  }
}

after(async () => { await pool?.end(); });

test('canonical schema reruns and enforces restricted access and admin revocation', { skip: !testUrl }, async () => {
  assert.ok(pool);
  const schema = readFileSync(new URL('../../db/create_schema.sql', import.meta.url), 'utf8');
  await pool.query(schema);
  await pool.query(`
    CREATE SCHEMA app_private;
    CREATE TABLE app_private.platform_admins (LIKE tenant_service_prod.platform_admins INCLUDING ALL);
    INSERT INTO app_private.platform_admins (clerk_user_id, granted_by)
    VALUES ('user_unrelated', 'unrelated-app');
  `);
  await pool.query(schema);

  const imported = await pool.query("SELECT clerk_user_id FROM tenant_service_prod.users WHERE clerk_user_id='user_unrelated'");
  assert.equal(imported.rowCount, 0);

  await pool.query(`
    INSERT INTO tenant_service_dev.users (clerk_user_id, platform_role, granted_by)
    VALUES ('user_testAdmin', 'platform_admin', 'integration-test'), ('user_ordinary', 'user', NULL)
  `);

  try {
    assert.equal((await adminRepository.query('user_testAdmin')).allowed, true);
    assert.equal((await adminRepository.query('user_ordinary')).allowed, false);
    assert.ok((await adminRepository.query('user_testAdmin', true)).rows.length > 0);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('SET LOCAL ROLE tenant_service_dev_api');
      await client.query("SELECT set_config('app.clerk_user_id', 'user_ordinary', true)");

      const visible = await client.query('SELECT clerk_user_id FROM tenant_service_dev.users');
      assert.deepEqual(visible.rows, [{ clerk_user_id: 'user_ordinary' }]);
      await assert.rejects(
        client.query("UPDATE tenant_service_dev.users SET platform_role='platform_admin' WHERE clerk_user_id='user_ordinary'"),
        { code: '42501' },
      );
      await client.query('ROLLBACK');

      await client.query('BEGIN');
      await client.query('SET LOCAL ROLE tenant_service_dev_api');
      await assert.rejects(client.query('SELECT * FROM tenant_service_prod.users'), { code: '42501' });
    } finally {
      await client.query('ROLLBACK');
      client.release();
    }

    await pool.query("UPDATE tenant_service_dev.users SET revoked_at=now() WHERE clerk_user_id='user_testAdmin'");
    assert.equal((await adminRepository.query('user_testAdmin')).allowed, false);
  } finally {
    await pool.query("DELETE FROM tenant_service_dev.users WHERE clerk_user_id IN ('user_testAdmin','user_ordinary')");
    await pool.query('DROP SCHEMA app_private CASCADE');
  }
});
