# Contributing

Find the right layer for a change and verify it from the application entry point.

## Contents

- [Worked example: profile avatar](#worked-example-profile-avatar)
- [Other changes](#other-changes)
- [Validation](#validation)
- [Documentation format](#documentation-format)

## Worked example: profile avatar

1. Start at [ProfileScreen](../frontend/src/components/ProfileScreen.tsx) and its [web view](../frontend/src/components/ProfileScreen.web.tsx). The [profile screen hook](../frontend/src/auth/useProfileScreen.ts) reaches [account identity](../frontend/src/auth/useAccountIdentity.ts), the [profile resource hook](../frontend/src/auth/useProfile.ts), and the [Zustand store](../frontend/src/state/createAppStore.ts).
2. Edit photo feedback in the [native](../frontend/src/components/ImageUploadField.tsx) and [web](../frontend/src/components/ImageUploadField.web.tsx) fields. Keep draft, busy state, and editor errors local. The store owns the saved profile used by both the profile view and the signed-in header. See the [image utilities](../frontend/src/lib/IMAGE_PORT.md) for processing.
3. For request changes, follow the [frontend contracts](../frontend/src/api/contracts.ts) and [HTTP mapping](../frontend/src/api/application.ts). Upload and removal use `PUT` and `DELETE /api/me/profile/avatar`.
4. On the backend, follow [routes](../backend/src/profile/routes.ts), [controller](../backend/src/profile/controller.ts), [service](../backend/src/profile/service.ts), and the [storage adapter](../backend/src/profile/storage.ts). The [repository](../backend/src/profile/repository.ts) writes `users.avatar_path` and manages the `avatar_cleanup` queue defined in the [canonical SQL](../backend/db/create_schema.sql).

The [route](../backend/src/profile/routes.test.ts), [image](../backend/src/profile/images.test.ts), [service](../backend/src/profile/service.test.ts), and [store](../frontend/src/state/appStore.test.ts) tests cover request handling, image normalization, persistence failures and cleanup, and session races. These tests run with local fixtures. Use the [provider guide](PROVIDERS.md) for a signed-in UI fixture.

| Manual step | Expected result |
| --- | --- |
| Open the editor, choose a valid photo, then cancel without saving | The draft appears in the editor. The saved profile and header keep the original photo |
| On web, select a corrupt test file named `fixture.png` | The editor shows a preparation error and the saved photo stays visible |
| Choose a valid photo, then intercept `PUT /api/me/profile/avatar` with a `503` in the web fixture | The editor stays open with an error and keeps the draft for retry. The saved profile and header keep the original photo |
| Restore the request and retry | The editor closes after success. The profile and header show the new photo |
| Stage removal and save | The profile and header show the default avatar |
| Sign out | The welcome screen replaces the signed-in views. A subsequent account sees only its own profile |

Run the sequence in the web app after feedback changes. Repeat on a native development build when the native field changes and report any device checks that remain pending.

## Other changes

- Add an API operation through the [backend layer guide](BACKEND_ARCHITECTURE.md). Keep validation and authorization at their owning layers.
- Add a frontend interaction through the [frontend layer guide](FRONTEND_ARCHITECTURE.md) and reuse shared controls.
- Add schema changes through the [database guide](../backend/db/README.md). Update the canonical schema and preserve data.
- Change app identity through the [rebrand guide](REBRAND.md).
- Update runtime configuration and deployment instructions in the [provider](PROVIDERS.md) or [release](RELEASE.md) guide that owns them.

## Validation

From the root, run `make check` and `make build`. These cover types, architecture and style rules, local unit and HTTP tests, and the production build. For schema and RLS changes, use the [disposable database check](../backend/db/README.md#isolated-database-check).

For browser validation, load the `playwright-cli` skill and use Playwright's bundled browser with a separate profile. Use development credentials for authenticated tests. Report source inspection, automated checks, browser checks, and pending provider checks separately.

## Documentation format

1. Use one H1, one sentence of purpose, and `## Contents` with a link to each H2.
2. Use short sentences, descriptive headings, numbered procedures, and fenced commands. State prerequisites, working directory, and expected results where needed.
3. Keep `AGENTS.md` at 80 lines or fewer and every other guide at 120 lines or fewer, including examples. Split longer material into focused guides.
4. Maintain a rule or procedure in one document. Link to its section elsewhere. Check links, commands, and fixture requirements after changes.
