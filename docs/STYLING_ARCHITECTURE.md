# Styling architecture

Use shared visual definitions for the web and native views.

## Contents

- [Theme inputs](#theme-inputs)
- [Components](#components)

## Theme inputs

`frontend/src/branding/tokens.json` owns colors, spacing, and typography. Run `npm run theme` from the root to update generated CSS. Use CSS and named classes on web and named StyleSheets on native. Keep presentation shared through tokens and components.

## Components

Use the shared screen, heading, button, card, error, and overlay components. Use `Icon` for UI icons. Keep screen code focused on composition and interaction. Run `npm run check:styles` after changes. See [Rebrand the app](REBRAND.md) for brand artwork and metadata.
