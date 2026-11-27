# Database

Apply and verify the tenant starter's PostgreSQL schema and role boundaries.

## Contents

- [Schema and roles](#schema-and-roles)
- [Migrations](#migrations)
- [Isolated database check](#isolated-database-check)

## Schema and roles

`create_schema.sql` creates `tenant_service_dev` and `tenant_service_prod` and their restricted `_api` roles. Each environment uses a distinct runtime login with `NOINHERIT` and `NOBYPASSRLS`. Grant it only its own environment role. Transactions set that role and `app.clerk_user_id` locally.

`users` stores the app's user and admin authorization records. `avatar_cleanup` keeps paths for retried cleanup. The original bootstrap table remains in migration history and current authorization reads `users`.

## Migrations

Keep each new SQL migration in a rerunnable `DO $migration$` block compatible with the Supabase SQL Editor. Preserve data and permissions and update the canonical schema. Apply fresh installations with `create_schema.sql`. Create runtime logins and seed the initial admin through the [provider guide](../../docs/PROVIDERS.md#supabase).

## Isolated database check

Start a disposable local PostgreSQL instance with an administrative test login. From the root, point both URL variables at that same disposable database.

```sh
export DATABASE_URL='postgresql://TEST_USER:TEST_PASSWORD@127.0.0.1:55439/TEST_DB'
export ADMIN_TEST_DATABASE_URL="$DATABASE_URL"
export DATABASE_SCHEMA=tenant_service_dev
npm run test:admin:db
```

The test applies the canonical schema twice and checks grants, admin revocation, and cross-schema access. Discard the database after the test.
