# Set up a new client project

Create a branded client repo, start development locally, and connect the services needed for launch.

## Contents

- [Collect client inputs](#collect-client-inputs)
- [Create and run the client repo](#create-and-run-the-client-repo)
- [Connect development auth and data](#connect-development-auth-and-data)
- [Set up email](#set-up-email)
- [Deploy and verify production](#deploy-and-verify-production)
- [Handle missing access](#handle-missing-access)

## Collect client inputs

- Confirm the GitHub owner and private repo name. Collect the app name, slug, app scheme, native bundle identifier, palette, and SVG mark.
- Identify the owners of Clerk, Supabase, Postmark, Microsoft 365, Google Cloud billing and IAM, and the authoritative DNS zone. Use dedicated development and production resources as described in [provider setup](PROVIDERS.md).
- Before launch, confirm the production hostname, sender and reply-to addresses, SMTP mailbox, approved test inbox, and first client admin.

## Create and run the client repo

1. Have the starter’s GitHub admin confirm the [Template repository setting](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-template-repository). Use [Use this template](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-repository-from-a-template) to create the private client repo from the default branch, then clone the new repo.
2. Set the client identity in `brand.json`, update the theme tokens, and replace the SVG mark using the [rebrand inputs](REBRAND.md#inputs).
3. From the new repo root, follow [First run](../README.md#first-run) to boot the local stack, verify the welcome screen and API health, and stop the stack once checked.
4. Run `make check` from the repo root, then complete the [branding verification](REBRAND.md#generate-and-check), including `make build` and inspection of the web manifest and Expo config.

**Ready to build.** Start client feature work once the branded app runs locally and the checks pass. The welcome screen and health endpoint work before auth is configured.

## Connect development auth and data

1. Set up the client’s [Clerk development instance](PROVIDERS.md#clerk). Enable email/password sign-in, set matching keys and local origins, and create ordinary-user and admin fixtures.
2. Create a dedicated [Supabase development project](PROVIDERS.md#supabase). Apply the canonical SQL, configure the restricted runtime login and private avatar bucket, and grant the approved development admin fixture its app role.
3. Set the environment values using [local configuration](PROVIDERS.md#local-configuration) and recreate the Compose stack. Sign in as the ordinary user, verify avatar upload, viewing, and removal, and check that admin access is denied. Confirm the admin fixture has the expected permissions.

**Ready for authenticated development.** Sign-in, profile and avatar storage, and the fixture permissions work against the client’s development resources.

## Set up email

1. Follow [email provider setup](PROVIDERS.md#email). Use Postmark Sandbox for development group sends. Set up the dedicated Microsoft 365 OAuth application and mailbox for one-off SMTP sends with the tenant admin.
2. Run the [development delivery checks](../backend/src/email/README.md#development-delivery-check) with an approved fixture recipient. Check Postmark Activity for the Sandbox result and the fixture inbox for the SMTP message.
3. Before launch, have the Postmark owner confirm that the Live server can send to the intended recipients and complete account approval if required. Verify the production sending domain after publishing its DNS records. Confirm the production SMTP app and mailbox permissions with the Microsoft tenant admin.

## Deploy and verify production

1. Configure the dedicated production [Clerk instance](PROVIDERS.md#clerk) and [Supabase project](PROVIDERS.md#supabase). Start [Clerk's production domain setup](https://clerk.com/docs/guides/development/deployment/production#dns-records) and set the app’s intended HTTPS origin.
2. Build and push the image as described in the [Cloud Run release guide](RELEASE.md#cloud-run), using the matching Clerk publishable key. For the first release, [create the Cloud Run service](https://docs.cloud.google.com/run/docs/deploying) with the intended ingress, runtime service account, and environment values. Grant that account access to the required [Secret Manager secrets](https://docs.cloud.google.com/run/docs/configuring/services/secrets) and bind them as environment variables. Use the repository’s candidate rollout procedure for later releases.
3. Configure [HTTPS for the client hostname](https://docs.cloud.google.com/run/docs/mapping-custom-domains). Have the authorized DNS operator publish the app records, Clerk’s domain records, and Postmark’s DKIM and Return-Path records through the existing authoritative provider. Verify DNS, the certificate, and provider domain status.
4. On the final hostname, check health, sign-in, and the profile and avatar flows. Apply the [initial app admin grant](PROVIDERS.md#supabase) to the approved production Clerk user and verify the grant.
5. Use the client app’s authorized production send flow to send one test message through each transport. Confirm both arrive in the approved inbox. If the client app has no production send flow yet, leave live delivery verification pending.

**Ready to launch.** The client hostname serves the intended app over HTTPS, the approved admin has access, and both live mail transports deliver.

## Handle missing access

Use the provider’s supported API, CLI, or dashboard and its documented access request or invitation flow. If required access is unavailable and there is no reliable supported way to request it, hand the step to the user or designated owner. Record the action, owner, and dependent checks as pending. Continue independent work, such as local development while the DNS owner publishes records.
