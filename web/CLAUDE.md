# Web Tier (Next.js) Instructions

## ⚠️ Version Warning
This version of Next.js contains breaking changes from standard training data. 
- Refer to `node_modules/next/dist/docs/` for the latest conventions.
- Use the `@tailwindcss/postcss` plugin pattern as configured in `postcss.config.mjs`.

## 🛠 Web Commands
- **Dev**: `next dev`
- **Build**: `next build`
- **E2E Tests**: `npm run test:e2e`
- **E2E UI**: `npm run test:e2e:ui`

## 🎨 UI Standards
- Use **Lucide React** for icons.
- Use **Tailwind 4.0** utility classes.
- Every new component must have a `data-testid` for E2E testing.
