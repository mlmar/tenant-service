# Configure providers

Connect dedicated service resources after the public starter boots.

## Contents

- [Local configuration](#local-configuration)
- [Clerk](#clerk)
- [Supabase](#supabase)
- [Email](#email)
- [Troubleshooting](#troubleshooting)

## Local configuration

Run `make setup` from the workspace root. It creates missing `frontend/.env.local` and `backend/.env.local` files from their examples and preserves existing files. Keep the frontend file limited to public values. Put server credentials in the backend file or in the deployment's secret store. See [first run](../README.md#first-run) for the local API port. For split Compose development with a custom API URL, set `DEV_API_URL` in the shell before starting Compose.

## Clerk

1. Use separate development and production Clerk instances. Enable email/password sign-in and create development fixtures for an ordinary user and an administrator.
2. Set `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` in the frontend env file. Set `CLERK_PUBLISHABLE_KEY` to that same key and `CLERK_SECRET_KEY` to its matching secret in the backend env file.
3. Set `CLERK_AUTHORIZED_PARTIES` and `CORS_ORIGINS` to the intended web origins. Use `http://localhost:8081` for split development and `http://localhost:8080` for the combined app on the default ports. Use comma-separated origins without spaces when enabling both. Use the actual HTTPS app origin in a deployed environment.
4. For native hosted sign-in, enable the Native API in Clerk and register the iOS bundle identifier and Android package. Both come from `bundleIdentifier` in [brand.json](../brand.json). Rebuild after changing the identifier. [Clerk native hosted authentication](https://clerk.com/docs/expo/guides/account-portal/hosted-auth)
5. After database setup, verify sign-in, profile access, avatar upload and removal, sign-out, and admin denial for the ordinary user.

## Supabase

1. For new setups, use a dedicated Supabase project per environment. Run [create_schema.sql](../backend/db/create_schema.sql) in each project's SQL Editor. The script creates both schemas. Use only the schema assigned to that deployment. Supabase project secrets can access every bucket in their project, so two buckets in one project share a credential boundary.
2. Create a distinct runtime login per environment with `NOINHERIT` and `NOBYPASSRLS`. Grant only the matching role below. Set `DATABASE_URL` to the restricted login's connection string and `DATABASE_SCHEMA` to the matching schema. Keep the URL server-side.
   - Development uses `tenant_service_dev`, role `tenant_service_dev_api`, and the private bucket `tenant-service-dev-avatars`.
   - Production uses `tenant_service_prod`, role `tenant_service_prod_api`, and the private bucket `tenant-service-prod-avatars`.
3. In the matching project, create the private bucket. Set `SUPABASE_URL`, `SUPABASE_STORAGE_SECRET`, and `SUPABASE_AVATAR_BUCKET` in the backend environment. With disposable fixtures, verify upload, signed URL access, and removal in the matching environment and denial across environments.
4. Use an administrative database connection and the approved Clerk user ID from that environment. If the row is absent, insert it into the environment's `users` table. If a profile request has already created it, update that row and preserve its profile fields. For an initial grant, set `platform_role='platform_admin'`, `granted_at=now()`, and `granted_by` to the grantor identifier. If the row is disabled or already revoked, leave that state in place unless reactivation is explicitly authorized.
5. With development fixtures, check that `GET /api/me/permissions` returns `platformAdmin: true` for the active grant and `false` for an ordinary user. Set the fixture admin's `revoked_at` through the administrative connection and confirm its next permissions check returns `false` and `GET /api/admin/platform-admins` returns `403`.

## Email

- **Postmark groups.** Use a dedicated server and verified sender. Set `POSTMARK_SERVER_TOKEN`, `POSTMARK_FROM_EMAIL`, and `POSTMARK_MESSAGE_STREAM` in the backend, then enable `EMAIL_ENABLED`. Use a Postmark Sandbox server for development.
- **Microsoft 365 one-off messages.** Use the OAuth client-credentials flow. For the Exchange Online app-permission setup, grant the Entra application `SMTP.SendAsApp` with admin consent, register its service principal in Exchange, grant access to the intended mailbox, and confirm SMTP AUTH is enabled for that mailbox. If the visible sender differs from the authenticating mailbox, confirm Send As permission. Follow [Microsoft's client-credentials setup](https://learn.microsoft.com/en-us/exchange/client-developer/legacy-protocols/how-to-authenticate-an-imap-pop-smtp-application-by-using-oauth/).
- Set `MICROSOFT_365_TENANT_ID`, `MICROSOFT_365_CLIENT_ID`, `MICROSOFT_365_CLIENT_SECRET`, `SMTP_USER` (the authenticating mailbox), and `SMTP_FROM` (the visible sender) in the backend, then enable `SMTP_ENABLED`.
- Set `EMAIL_REPLY_TO` to the inbox that should receive replies. Use the [development delivery check](../backend/src/email/README.md#development-delivery-check) to verify the selected transport and the expected result.

## Troubleshooting

- Sign-in unavailable. Verify the frontend key and restart the development server.
- Authenticated requests fail. Confirm the frontend and API use the same Clerk instance and the actual web origin is allowed.
- Profile or avatar unavailable. Check the schema, restricted login, private bucket name, and server storage secret.
- Email fails. Confirm the selected transport, sender authorization, and service-specific credentials. Keep provider responses and secrets out of user-facing errors.
