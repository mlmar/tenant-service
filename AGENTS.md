# Agent instructions

Use this guide to find the owning code, documentation, and checks.

## Contents

- [Find the right guide](#find-the-right-guide)
- [Rules for changes](#rules-for-changes)
- [Before delivery](#before-delivery)

## Find the right guide

- Start the app with the [README](README.md#first-run).
- Change a feature using the [profile walkthrough](docs/CONTRIBUTING.md#worked-example-profile-avatar).
- Find the owning layer in the [frontend](docs/FRONTEND_ARCHITECTURE.md) or [backend](docs/BACKEND_ARCHITECTURE.md) guide.
- Change layout or branding with the [styling](docs/STYLING_ARCHITECTURE.md) or [rebrand](docs/REBRAND.md) guide.
- Change a schema in the [database guide](backend/db/README.md).
- Configure [providers](docs/PROVIDERS.md) or prepare a [release](docs/RELEASE.md).

## Rules for changes

- Follow the dependency direction in each architecture guide. Enforce access on the server.
- Reuse shared UI and theme tokens on web and native. Keep drafts local and clear private shared state on session changes.
- Keep SQL migrations rerunnable and update the canonical schema with each migration.
- Use straightforward control flow, meaningful names, and comments that explain intent. Avoid nested ternaries in new or modified code.
- Keep secrets in backend env files or a secrets manager. Use isolated fixtures and dedicated service resources.
- Follow the [documentation format](docs/CONTRIBUTING.md#documentation-format). This file has an 80-line limit.
- Commit, push, or publish only with explicit authorization.

## Before delivery

Run the checks listed in [validation](docs/CONTRIBUTING.md#validation). Review the final diff for behavior, architecture, readability, and instruction compliance. Report the evidence and any pending checks.
