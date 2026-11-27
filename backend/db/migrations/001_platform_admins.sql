DO $migration$
BEGIN
CREATE SCHEMA IF NOT EXISTS tenant_service_private;
REVOKE ALL ON SCHEMA tenant_service_private FROM PUBLIC;
CREATE TABLE IF NOT EXISTS tenant_service_private.platform_admins (
  clerk_user_id text PRIMARY KEY CHECK (clerk_user_id ~ '^user_[A-Za-z0-9]+$'),
  role text NOT NULL DEFAULT 'platform_admin' CHECK (role = 'platform_admin'),
  granted_at timestamptz NOT NULL DEFAULT now(),
  granted_by text NOT NULL,
  revoked_at timestamptz,
  CONSTRAINT revocation_after_grant CHECK (revoked_at IS NULL OR revoked_at >= granted_at)
);
REVOKE ALL ON tenant_service_private.platform_admins FROM PUBLIC;
ALTER TABLE tenant_service_private.platform_admins ENABLE ROW LEVEL SECURITY;
 IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'tenant_service_api') THEN
   CREATE ROLE tenant_service_api NOLOGIN NOSUPERUSER NOBYPASSRLS;
 END IF;
GRANT USAGE ON SCHEMA tenant_service_private TO tenant_service_api;
CREATE OR REPLACE FUNCTION tenant_service_private.is_platform_admin(candidate text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = pg_catalog
AS $$ SELECT EXISTS (SELECT 1 FROM tenant_service_private.platform_admins WHERE clerk_user_id = candidate AND revoked_at IS NULL) $$;
REVOKE ALL ON FUNCTION tenant_service_private.is_platform_admin(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION tenant_service_private.is_platform_admin(text) TO tenant_service_api;
DROP POLICY IF EXISTS platform_admin_read ON tenant_service_private.platform_admins;
CREATE POLICY platform_admin_read ON tenant_service_private.platform_admins FOR SELECT TO tenant_service_api
USING (tenant_service_private.is_platform_admin(current_setting('app.clerk_user_id', true)));
GRANT SELECT ON tenant_service_private.platform_admins TO tenant_service_api;
END $migration$;
