# Logic Tier (Server) Instructions

## 🛠 Backend Commands
- **Dev**: `npm run dev`
- **Build**: `npm run build`
- **Test**: `npm test`
- **Health Check**: `npm run health`

## 🏗 Backend Patterns
- **Module System**: Uses **CommonJS** (`require`). Do not use ESM `import`.
- **Pathing**: Use `@shared/*` for all shared package imports.
- **Repository Pattern**: All Firestore access MUST go through a class extending `BaseRepository`.
- **Validation**: Every POST/PUT/PATCH request must be validated using the corresponding Zod schema from `@shared/validation`.

## 🔐 Security & Observability
- **Auth**: Protect all routes (except `/health`) with `verifyToken` middleware.
- **App Check**: Mandatory verification in `verifyToken` for production.
- **Rate Limit**: 1000 req / 15 min per IP.
- **Logging**: Use `logger.info({ requestId: req.requestId, ... })`.
- **ID Generation**: Use `crypto.randomUUID()` for new entity IDs.
