# Tenant Service

Run and rebrand the Expo, web PWA, and Express application foundation.

## Contents

- [First run](#first-run)
- [Project map](#project-map)
- [Configure and release](#configure-and-release)

## First run

Use Node.js 22.9+ and npm. Install Docker Compose with Watch support for container development. Run these commands from the project root.

```sh
make install
make setup
make dev
```

Open http://localhost:8081. The welcome screen works with empty Clerk credentials. Check the API at http://localhost:3000/api/health. Stop the stack with `make dev-down`. Reuse one Compose Watch session.

Without Docker, run `make dev-api` and `make dev-web` in separate terminals. Set `PORT=3000` in `backend/.env.local` to match the default frontend API URL. After changing a Compose environment file, recreate the stack with `make dev`.

## Project map

- [Agent instructions](AGENTS.md) route common tasks to the owning guide.
- [Contributing](docs/CONTRIBUTING.md) traces a profile change and explains validation.
- [Architecture](docs/ARCHITECTURE.md) explains how the workspace fits together.

## Configure and release

- [Rebrand the app](docs/REBRAND.md) to change identity, color, and artwork.
- [Configure providers](docs/PROVIDERS.md) for Clerk, Supabase, Postmark, and Microsoft 365.
- [Release the app](docs/RELEASE.md) with Cloud Run or Expo EAS.

The starter contains platform sign-in, profile and avatar flows, platform administration, and email adapters. Add domain features in your own project. The process-local event bus has no broker or durable delivery.
