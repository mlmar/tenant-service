# Backend architecture

Put each request and provider interaction in its owning layer.

## Contents

- [Dependency direction](#dependency-direction)
- [Extension points](#extension-points)

## Dependency direction

Router → HTTP controller → system API interface → service → persistence or provider port. The router maps paths and middleware. The controller extracts input and maps results to HTTP. Services own validation, authorization, and orchestration. Repositories own database access.

## Extension points

- `backend/src/app.ts` builds the HTTP application. `backend/src/application.ts` wires concrete adapters.
- Use the `profile/` module as a reference for the full chain. Its service owns image-processing coordination, retry cleanup, and avatar ownership.
- Define application errors in the domain. Map them at the HTTP boundary. Keep SQL and SDK calls inside adapters.
- Use injected ports for unit and route tests. Check boundaries with `npm run check:backend` from the project root.
