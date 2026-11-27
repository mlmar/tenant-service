# Frontend architecture

Keep screens, shared state, application contracts, and provider adapters separate.

## Contents

- [Dependency direction](#dependency-direction)
- [Extension points](#extension-points)

## Dependency direction

Views render props and forward events. Feature hooks own coordination and local drafts. Typed Zustand actions own shared resources. API contracts define operations, and HTTP or Clerk adapters handle protocols and SDK details.

## Extension points

- `frontend/App.tsx` composes auth, state, and screen navigation.
- `frontend/src/state/createAppStore.ts` accepts injected APIs for direct tests.
- `frontend/src/api/contracts.ts` defines app operations. `frontend/src/api/application.ts` maps operations to endpoints. `frontend/src/api/client.ts` handles authenticated requests.
- `frontend/src/auth/signInApi.ts` defines sign-in results. The Clerk adapter maps SDK behavior to that interface.
- Keep state subscriptions atomic, drafts local, and provider imports in adapters. Check boundaries with `npm run check:frontend` from the project root.
