# Rebrand the app

Change the displayed identity, native identifiers, theme, and generated artwork.

## Contents

- [Inputs](#inputs)
- [Generate and check](#generate-and-check)

## Inputs

1. Set `name`, `slug`, `scheme`, and `bundleIdentifier` in [brand.json](../brand.json). Use a lowercase URL-safe slug and a dedicated reverse-DNS native identifier.
2. Update [theme tokens](../frontend/src/branding/tokens.json) and replace the [transparent SVG mark](../frontend/assets/icons/source/mark.svg). Use a square SVG with defined intrinsic dimensions and an icon that reads against the primary color.
3. Configure environment-specific domains, sender addresses, and provider identifiers in [provider setup](PROVIDERS.md). The brand file is public metadata.

## Generate and check

From the workspace root, run the full build and inspect the Expo public config. The build generates the theme CSS, icon set, web shell, and manifest. For targeted regeneration, use `npm run theme` for CSS and `make icons` for artwork.

```sh
make build
npm exec --workspace frontend -- expo config --type public
```

1. Open the welcome screen and check the displayed name, mark, and palette. Verify the generated HTML title and check that `frontend/dist/manifest.webmanifest` has the brand's `name`, `short_name`, `theme_color`, and `background_color`. Check that its icon paths resolve.
2. In the Expo config, verify `name`, `slug`, `scheme`, `ios.bundleIdentifier`, and `android.package` against [brand.json](../brand.json). Check that the iOS icon and Android adaptive artwork use the new mark and that the adaptive background matches the primary token.
3. Run `npm test` for the email template checks. Render a sample without `logoUrl` or `wordmarkUrl` and verify that the brand name is visible in the HTML and present in the plain text. The current fallback uses white text and needs a sufficiently dark primary color.

When changing the generator or theme mapping, repeat these checks in a temporary copy with a second name and palette.
