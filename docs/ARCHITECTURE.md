# Architecture

Understand how the frontend, API, and deployment fit together.

## Contents

- [Runtime](#runtime)
- [Boundaries](#boundaries)

## Runtime

The Expo workspace serves iOS, Android, and a web PWA. The Express workspace verifies Clerk sessions and handles profile and platform-admin operations. Supabase provides PostgreSQL and private avatar storage. The combined container serves the web export and API from one origin on Cloud Run.

PostgreSQL owns app authorization. The app uses schema-specific runtime roles, row-level security, and transaction-local identity. Clerk owns identity. Provider setup and secret placement are in [the provider guide](PROVIDERS.md).

## Boundaries

- [Frontend layers](FRONTEND_ARCHITECTURE.md) cover views, state and HTTP adapters.
- [Backend layers](BACKEND_ARCHITECTURE.md) cover controllers, services and persistence.
- [State management](STATE_MANAGEMENT.md) describes session lifetimes.
- [Styling](STYLING_ARCHITECTURE.md) defines the theme and platform adapters.
