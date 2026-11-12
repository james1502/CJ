# App icon source

`Rakazo.icon` is the shared editable source for macOS and iOS. The foreground is a
generic unbranded pixel mark (orange block with two ink eyes) produced by
`scripts/generate-pixel-placeholder.ts`, then refreshed into platform exports.

macOS packaging compiles the source into a Tahoe asset catalog and generates the
legacy ICNS fallback. Expo copies the same source into the iOS project.

The platform exports are:

- `apps/desktop/assets/icon-macos.png`: development Dock-margin export.
- `apps/mobile/assets/icon.png`: opaque 1024-pixel square for the generic/legacy icon.
- `apps/mobile/assets/adaptive-icon.png`: transparent Android foreground.
- `apps/mobile/assets/icon-background.png`: opaque Android background (void black).
- `apps/mobile/assets/monochrome-icon.png`: white alpha silhouette with transparent eyes.

Refresh placeholders with:

```bash
pnpm exec tsx packages/ui-tokens/scripts/generate-pixel-placeholder.ts
pnpm --filter @rakazo/ui-tokens export:brand
```

`export:brand` refreshes web/marketing favicons, the marketing mark, Windows/Linux
icons, mobile splash, and the mobile web favicon.

After exporting, run `pnpm exec tsx apps/www/scripts/render-og.mjs` to refresh the
marketing page social cards when Chrome is available.

## Animated vector avatars

The animated avatar uses a simple pixel-block SVG in `logo-avatar-art.ts`. The
canonical raster icon and its platform exports remain the shared source of truth
for installers and favicons.
