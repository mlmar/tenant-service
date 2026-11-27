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
