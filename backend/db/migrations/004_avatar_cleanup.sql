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
