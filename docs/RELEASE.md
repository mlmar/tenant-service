# Release the app

Build and release a dedicated environment on Cloud Run or Expo EAS.

## Contents

- [Cloud Run](#cloud-run)
- [EAS](#eas)
- [Local production-style check](#local-production-style-check)

## Cloud Run

Use an authenticated gcloud CLI, Docker, and a dedicated Artifact Registry repository and Cloud Run service. The service needs its runtime service account, env values, and Secret Manager bindings. See [provider setup](PROVIDERS.md). Confirm the target project, region, service, and current revision before changing traffic.

From the workspace root, set `PROJECT`, `REGION`, `SERVICE`, and `REGISTRY_HOST` for the target environment. Set `IMAGE` to the full versioned image path in that registry, and `CLERK_PUBLIC_KEY` to the matching Clerk publishable key. The caller needs Cloud Run deployment permission, permission to act as the runtime service account, Artifact Registry write permission, and [Docker authentication](https://docs.cloud.google.com/artifact-registry/docs/docker/authentication) for that hostname.

```sh
gcloud auth configure-docker "$REGISTRY_HOST"
docker build --platform linux/amd64 --target runtime \
  --build-arg EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY="$CLERK_PUBLIC_KEY" -t "$IMAGE" .
docker push "$IMAGE"
gcloud run deploy "$SERVICE" --image "$IMAGE" --no-traffic --tag candidate \
  --project "$PROJECT" --region "$REGION"
```

1. Use `gcloud run services describe "$SERVICE" --project "$PROJECT" --region "$REGION"` to find the `candidate` entry under `status.traffic` and record its URL and revision. Confirm the URL is reachable under the service’s ingress and IAM settings.
2. Confirm that the origin used for browser sign-in is authorized for the candidate's Clerk instance and API. Use the [Clerk setup](PROVIDERS.md#clerk) to match origins and keys. Test on an authorized development service with an ordinary-user fixture.
3. Open the web shell on the candidate URL and expect `GET /api/health` to return `200` with `status: "ok"`. With the ordinary user's Clerk session bearer token, expect `GET /api/me/profile` to return `200` for that user and `GET /api/admin/platform-admins` to return `403` with `{"error":"Platform administrator access required"}` from the app.
4. Set `REVISION` to the verified candidate and promote it. For rollback, set `REVISION` to the recorded previous revision and use the same command.

```sh
gcloud run services update-traffic "$SERVICE" --to-revisions="$REVISION=100" \
  --project "$PROJECT" --region "$REGION"
```

## EAS

1. Use EAS CLI 21.0.1 or newer. Set a dedicated native bundle identifier in [brand.json](../brand.json), sign in with `make eas-login` from the workspace root, and use a dedicated EAS project and app credentials.
2. Use `frontend/.env.local` for development and simulator, `frontend/.env.preview` for preview, and `frontend/.env.prod` for production. Set these public values in the selected file and use the same settings in the corresponding EAS environment. Replace every placeholder before building.

```dotenv
EXPO_PUBLIC_EAS_PROJECT_ID=<dedicated-project-uuid>
EXPO_OWNER=<project-owner>
EXPO_PUBLIC_API_URL=https://preview.example.invalid/api
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=<matching-clerk-publishable-key>
```

3. From the workspace root of an unversioned copy, set the [EAS archive root](https://docs.expo.dev/build-reference/project-upload/) so the archive includes workspace files above `frontend/`.

```sh
export EAS_NO_VCS=1
export EAS_PROJECT_ROOT="$PWD"
make eas-check PROFILE=preview
```

4. The local check requires a UUID-shaped project ID, rejects the starter’s placeholder bundle identifier, and checks the preview API URL for an HTTPS prefix and common loopback values. Manually verify the `/api` suffix, Clerk key, and matching EAS environment. Before uploading, export the preview file’s public values and inspect the archive from the workspace root.

```sh
archive_dir="$(mktemp -d)"
(cd frontend && eas build:inspect --platform android --profile preview --stage archive --output "$archive_dir/archive")
```

5. Confirm the archive includes root `brand.json` and `package-lock.json` and excludes backend env files. Recheck those exclusions whenever you add or change an `.easignore` file.
6. From the workspace root, run `make eas-build PROFILE=preview PLATFORM=all` when authorized. Verify the installed preview reaches its intended API and signs in with the matching development Clerk instance. See `make help` for platform-specific builds, submission, and OTA targets.

## Local production-style check

From the workspace root, run `make setup` and `make dev-app`. Expect the web shell at http://localhost:8080 and a `200` from http://localhost:8080/api/health. Stop with `make dev-app-down`.

For a signed-in check, configure the backend env file using [local provider setup](PROVIDERS.md#local-configuration) and export its matching public `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` in the shell before `make dev-app`. Include the combined app origin using the [Clerk setup](PROVIDERS.md#clerk).
