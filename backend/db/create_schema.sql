-- Canonical rerunnable Supabase SQL Editor schema.

DO $migration$
DECLARE target text; runtime_role text;
BEGIN
 FOREACH target IN ARRAY ARRAY['tenant_service_dev','tenant_service_prod'] LOOP
  runtime_role := target || '_api';
  EXECUTE format('CREATE SCHEMA IF NOT EXISTS %I', target);
  EXECUTE format('REVOKE ALL ON SCHEMA %I FROM PUBLIC',target);
  IF NOT EXISTS(SELECT 1 FROM pg_roles WHERE rolname=runtime_role) THEN
   EXECUTE format('CREATE ROLE %I NOLOGIN NOSUPERUSER NOBYPASSRLS',runtime_role);
  END IF;
  EXECUTE format('CREATE TABLE IF NOT EXISTS %I.platform_admins (
   clerk_user_id text PRIMARY KEY CHECK(clerk_user_id ~ ''^user_[A-Za-z0-9]+$''),
   role text NOT NULL DEFAULT ''platform_admin'' CHECK(role=''platform_admin''),
   granted_at timestamptz NOT NULL DEFAULT now(), granted_by text NOT NULL,
   revoked_at timestamptz CHECK(revoked_at IS NULL OR revoked_at >= granted_at))',target);
  EXECUTE format('REVOKE ALL ON %I.platform_admins FROM PUBLIC',target);
  EXECUTE format('ALTER TABLE %I.platform_admins ENABLE ROW LEVEL SECURITY',target);
  EXECUTE format('GRANT USAGE ON SCHEMA %I TO %I',target,runtime_role);
  EXECUTE format('CREATE OR REPLACE FUNCTION %I.is_platform_admin(candidate text) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=pg_catalog AS %L',target,format('SELECT EXISTS(SELECT 1 FROM %I.platform_admins WHERE clerk_user_id=candidate AND revoked_at IS NULL)',target));
  EXECUTE format('REVOKE ALL ON FUNCTION %I.is_platform_admin(text) FROM PUBLIC',target);
  EXECUTE format('GRANT EXECUTE ON FUNCTION %I.is_platform_admin(text) TO %I',target,runtime_role);
  EXECUTE format('DROP POLICY IF EXISTS platform_admin_read ON %I.platform_admins',target);
  EXECUTE format('CREATE POLICY platform_admin_read ON %I.platform_admins FOR SELECT TO %I USING (%I.is_platform_admin(current_setting(''app.clerk_user_id'',true)))',target,runtime_role,target);
  EXECUTE format('GRANT SELECT ON %I.platform_admins TO %I',target,runtime_role);
 END LOOP;
 -- Preserve the initial bootstrap table; new runtime roles cannot access it.
 IF to_regclass('tenant_service_private.platform_admins') IS NOT NULL THEN
  INSERT INTO tenant_service_prod.platform_admins SELECT * FROM tenant_service_private.platform_admins ON CONFLICT(clerk_user_id) DO NOTHING;
 END IF;
END $migration$;

DO $migration$
DECLARE target text; runtime_role text;
BEGIN
 FOREACH target IN ARRAY ARRAY['tenant_service_dev','tenant_service_prod'] LOOP
 runtime_role:=target||'_api';
 EXECUTE format('CREATE TABLE IF NOT EXISTS %I.users (
 clerk_user_id text PRIMARY KEY CHECK(clerk_user_id ~ ''^user_[A-Za-z0-9]+$''),
 name text NOT NULL DEFAULT '''', email text NOT NULL DEFAULT '''', avatar_path text,
 platform_role text NOT NULL DEFAULT ''user'' CHECK(platform_role IN (''user'',''platform_admin'')),
 status text NOT NULL DEFAULT ''active'' CHECK(status IN (''active'',''disabled'')),
 granted_at timestamptz, granted_by text, revoked_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now())',target);
 EXECUTE format('INSERT INTO %I.users(clerk_user_id,platform_role,granted_at,granted_by,revoked_at) SELECT clerk_user_id,role,granted_at,granted_by,revoked_at FROM %I.platform_admins ON CONFLICT(clerk_user_id) DO NOTHING',target,target);
 EXECUTE format('ALTER TABLE %I.users ENABLE ROW LEVEL SECURITY',target);
 EXECUTE format('REVOKE ALL ON %I.users FROM PUBLIC',target);
 EXECUTE format('CREATE OR REPLACE FUNCTION %I.is_platform_admin(candidate text) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=pg_catalog AS %L',target,format('SELECT EXISTS(SELECT 1 FROM %I.users WHERE clerk_user_id=candidate AND platform_role=''platform_admin'' AND status=''active'' AND revoked_at IS NULL)',target));
 EXECUTE format('DROP POLICY IF EXISTS users_read ON %I.users',target);
 EXECUTE format('CREATE POLICY users_read ON %I.users FOR SELECT TO %I USING (clerk_user_id=current_setting(''app.clerk_user_id'',true) OR %I.is_platform_admin(current_setting(''app.clerk_user_id'',true)))',target,runtime_role,target);
 EXECUTE format('DROP POLICY IF EXISTS users_insert ON %I.users',target);
 EXECUTE format('CREATE POLICY users_insert ON %I.users FOR INSERT TO %I WITH CHECK (clerk_user_id=current_setting(''app.clerk_user_id'',true) AND platform_role=''user'' AND status=''active'' AND granted_at IS NULL AND granted_by IS NULL AND revoked_at IS NULL AND avatar_path IS NULL)',target,runtime_role);
 EXECUTE format('DROP POLICY IF EXISTS users_update ON %I.users',target);
 EXECUTE format('CREATE POLICY users_update ON %I.users FOR UPDATE TO %I USING (clerk_user_id=current_setting(''app.clerk_user_id'',true) AND status=''active'') WITH CHECK (clerk_user_id=current_setting(''app.clerk_user_id'',true))',target,runtime_role);
 EXECUTE format('GRANT SELECT ON %I.users TO %I',target,runtime_role);
 EXECUTE format('GRANT INSERT(clerk_user_id,name,email) ON %I.users TO %I',target,runtime_role);
 EXECUTE format('GRANT UPDATE(avatar_path,updated_at) ON %I.users TO %I',target,runtime_role);
 END LOOP;
END $migration$;

DO $migration$
DECLARE target text; runtime_role text;
BEGIN
 FOREACH target IN ARRAY ARRAY['tenant_service_dev','tenant_service_prod'] LOOP
 runtime_role:=target||'_api';
 EXECUTE format('CREATE TABLE IF NOT EXISTS %I.avatar_cleanup (object_path text PRIMARY KEY,clerk_user_id text NOT NULL REFERENCES %I.users(clerk_user_id) ON DELETE CASCADE,created_at timestamptz NOT NULL DEFAULT now())',target,target);
 EXECUTE format('ALTER TABLE %I.avatar_cleanup ENABLE ROW LEVEL SECURITY',target);
 EXECUTE format('REVOKE ALL ON %I.avatar_cleanup FROM PUBLIC',target);
 EXECUTE format('DROP POLICY IF EXISTS avatar_cleanup_self ON %I.avatar_cleanup',target);
 EXECUTE format('CREATE POLICY avatar_cleanup_self ON %I.avatar_cleanup FOR ALL TO %I USING(clerk_user_id=current_setting(''app.clerk_user_id'',true)) WITH CHECK(clerk_user_id=current_setting(''app.clerk_user_id'',true) AND starts_with(object_path,clerk_user_id||''/''))',target,runtime_role);
 EXECUTE format('GRANT SELECT,INSERT,DELETE ON %I.avatar_cleanup TO %I',target,runtime_role);
 END LOOP;
END $migration$;
