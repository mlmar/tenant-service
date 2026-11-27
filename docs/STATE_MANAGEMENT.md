# State management

Keep shared in-memory application state in typed Zustand actions and protect session boundaries.

## Contents

- [State ownership](#state-ownership)
- [Session changes](#session-changes)

## State ownership

Use `frontend/src/state/createAppStore.ts` for typed shared app resources and actions. Subscribe to individual values and update state immutably. Keep editor drafts and transient interactions inside the owning hook or component.

## Session changes

[AppStateBridge](../frontend/src/state/AppStateBridge.tsx) scopes the store to the Clerk session, user, and active organization. Logout or a scope change clears private resources and resets navigation. In-flight requests are canceled, and generation checks reject late results even if a transport ignores cancellation.

Refresh profile and permissions on session start, browser focus, tab visibility, or network reconnection on web, and on foregrounding on native. These events cover normal resume and reconnect cases without interval polling. [Store actions](../frontend/src/state/createAppStore.ts) reuse an in-flight read of the same resource.

An avatar write rejects overlapping writes and invalidates profile reads that could overwrite the saved result. After success, publish the returned profile so the profile view and header update together. A failed write preserves the last saved profile and leaves retry to the UI. Run `npm run test:state` from the root. See the [store tests](../frontend/src/state/appStore.test.ts) for session changes, failed writes, and stale reads.
