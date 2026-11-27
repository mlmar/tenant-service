# Avatar image utilities

Find the local image utilities used by the profile avatar editor.

## Contents

- [Client-side processing](#client-side-processing)
- [Persistence](#persistence)

## Client-side processing

- The web field uses [prepareAvatar.web.ts](prepareAvatar.web.ts) to decode a selected file and prepare JPEG for upload. If the browser cannot decode HEIC, the helper asks the user to export as JPG.
- The native field uses `prepareNativeAvatar` in [prepareImage.ts](prepareImage.ts) for a selected image URI. Both paths use the resize and compression settings in [imageUploadPreprocessing.ts](imageUploadPreprocessing.ts).
- [imageEditing.web.ts](imageEditing.web.ts) and [imageEditing.native.ts](imageEditing.native.ts) apply crop and text edits. Reuse [imageCropGeometry.ts](imageCropGeometry.ts) for coordinate mapping. The image fields stage edits locally and upload only when the user saves.

## Persistence

The [avatar route](../../../backend/src/profile/routes.ts) takes raw image bytes and enforces a 5 MB request limit. The [server processor](../../../backend/src/profile/images.ts) checks the declared type and decoded format, accepts JPEG, PNG, or WebP, and writes a 512 × 512 WebP. Client preparation helps fit the upload limit. Authorization, final normalization, private storage, and cleanup belong to the profile API.

Use the [profile walkthrough](../../../docs/CONTRIBUTING.md#worked-example-profile-avatar) for the request path, tests, and manual editing checks.
